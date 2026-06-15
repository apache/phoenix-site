import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let a=`Change Data Capture turns a Phoenix table into a **stream of change events** that
downstream consumers can read using regular SQL. Once enabled, a CDC object behaves
like a queryable Phoenix table: every insert, update, and delete on the underlying
data table produces a row containing the affected primary key, an event timestamp,
and a JSON payload describing what changed. Available in Phoenix 5.3.0
([PHOENIX-7001](https://issues.apache.org/jira/browse/PHOENIX-7001)).

## When to use it

Reach for CDC when something downstream needs to react to row-level changes:

* Replication or mirroring to another store (Kafka, search index, data warehouse).
* Audit logs and change history.
* Cache invalidation and event-driven workflows.
* Materialized projections / fan-out tables maintained by an external process.

CDC captures the actual mutations as they happen — **including TTL-driven row
deletes** — so consumers don't need to poll the data table or compute diffs.

## Enabling CDC on a table

Use \`CREATE CDC\` to enable change capture on an existing table:

\`\`\`sql
-- Capture every change scope (default).
CREATE CDC orders_cdc ON orders;

-- Or restrict the default scopes recorded per event.
CREATE CDC orders_cdc ON orders INCLUDE (PRE, POST, CHANGE);
\`\`\`

The \`INCLUDE\` clause sets the **default** scopes that appear in the JSON payload.
Available scopes:

| Scope    | Meaning                          |
| -------- | -------------------------------- |
| \`PRE\`    | Row image before the mutation.   |
| \`POST\`   | Row image after the mutation.    |
| \`CHANGE\` | Just the changed columns (diff). |

Standard \`CREATE INDEX\`–style table properties on \`CREATE CDC\` (\`SALT_BUCKETS\`,
\`UPDATE_CACHE_FREQUENCY\`, \`COLUMN_ENCODED_BYTES\`, etc.) are forwarded to the
underlying CDC index.

To remove CDC from a table:

\`\`\`sql
DROP CDC orders_cdc ON orders;
DROP CDC IF EXISTS orders_cdc ON orders;
\`\`\`

## Reading change events

Each CDC object behaves like a Phoenix table whose columns are:

* The data table's primary-key columns (so you know which row changed).
* A payload column literally named \`"CDC JSON"\` (case-sensitive, must be quoted).
  Project it whenever you need the change payload; omit it for lightweight queries
  that only care about which rows changed or for topology lookups. \`SELECT *\`
  includes it automatically.

Two helpers come along for the ride:

* \`PHOENIX_ROW_TIMESTAMP()\` — the event's timestamp; use it for ordering and time-
  bounded reads.
* \`PARTITION_ID()\` — the partition the event came from; useful for sharding consumer
  workers.

A typical read query that wants the full payload looks like this:

\`\`\`sql
SELECT /*+ CDC_INCLUDE(POST, CHANGE) */
       PARTITION_ID(),
       PHOENIX_ROW_TIMESTAMP() AS event_time,
       order_id,
       "CDC JSON"
FROM orders_cdc
ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
\`\`\`

The \`CDC_INCLUDE(...)\` query hint **overrides** the default scopes set at \`CREATE
CDC\` time — so the same CDC object can serve different downstream consumers, each
asking for only the scope they need. Without the hint, the payload uses the
\`INCLUDE\` scopes from the \`CREATE CDC\` statement.

### Time-bounded / incremental reads

Use \`PHOENIX_ROW_TIMESTAMP()\` predicates to pull only events within a window —
consumers typically remember the last timestamp they processed and bind it as the
lower bound on the next call:

\`\`\`sql
SELECT /*+ CDC_INCLUDE(POST) */
       PHOENIX_ROW_TIMESTAMP(), order_id, "CDC JSON"
FROM orders_cdc
WHERE PHOENIX_ROW_TIMESTAMP() >= ?
  AND PHOENIX_ROW_TIMESTAMP() <  ?
ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
\`\`\`

### Per-partition reads

Partitions track HBase regions of the data table, so you can shard a consumer pool
across them. Discover partitions with:

\`\`\`sql
SELECT DISTINCT PARTITION_ID() FROM orders_cdc;
\`\`\`

Then issue per-partition reads:

\`\`\`sql
SELECT /*+ CDC_INCLUDE(POST) */ ...
FROM orders_cdc
WHERE PARTITION_ID() = ?
  AND PHOENIX_ROW_TIMESTAMP() >= ?
  AND PHOENIX_ROW_TIMESTAMP() <  ?
ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
\`\`\`

## Stream lineage: partitions, splits, and merges

A CDC stream is logically a **set of partitions**, each carrying a totally-ordered
sequence of change events. A partition isn't an abstract shard — it corresponds to a
specific **HBase region of the data table at a point in time**, and it has a finite
lifetime: it's born when the region is created (or as the result of a split/merge)
and it's closed when that region itself splits or merges into something new. New
child partitions take over from there.

Phoenix tracks this topology in \`SYSTEM.CDC_STREAM\`. The schema makes the lineage
explicit — every partition row points at its parent partition(s):

| Column                             | Notes                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| \`TABLE_NAME\`                       | The data table whose changes are streamed.                                                                          |
| \`STREAM_NAME\`                      | The CDC stream (each \`CREATE CDC\` produces a uniquely-named stream).                                                |
| \`PARTITION_ID\`                     | This partition's id — same value \`PARTITION_ID()\` returns on a CDC row.                                             |
| \`PARENT_PARTITION_ID\`              | The parent partition's id (empty/null for the initial partitions present when CDC was first enabled).               |
| \`PARTITION_START_TIME\`             | When this partition began.                                                                                          |
| \`PARTITION_END_TIME\`               | When it was closed (a split or merge ended it). \`NULL\` while still active.                                          |
| \`PARTITION_START_KEY\` / \`_END_KEY\` | The HBase region's row-key bounds at the time, stored as \`VARBINARY_ENCODED\`.                                       |
| \`PARENT_PARTITION_START_TIME\`      | The parent partition's \`PARTITION_START_TIME\`, embedded so consumers can walk parent → child without an extra join. |

Two important shapes fall out of this model:

* **A split produces two child rows that share the same \`PARENT_PARTITION_ID\`** (the
  region that just split). Their key ranges together cover the parent's range.
* **A merge produces one child partition with multiple rows in \`SYSTEM.CDC_STREAM\`** —
  one row per parent — sharing the same \`PARTITION_ID\` and differing only in
  \`PARENT_PARTITION_ID\`. Together those rows record every parent that fed the merge.

### Consuming events in parent → child order

Because events from a parent partition causally precede events from any of its
children, a correct consumer must drain the parent before reading children that
descend from it. The pattern is:

1. **Discover the topology** by reading \`SYSTEM.CDC_STREAM\` for your table and
   stream. Build a DAG keyed by \`PARTITION_ID\`, with edges drawn from
   \`PARENT_PARTITION_ID\` → child \`PARTITION_ID\`. Roots are partitions with no
   parent (the regions present when CDC was first enabled).

2. **Process roots first**, then walk forward through the DAG. A child partition is
   ready to be consumed once **all** of its parents have been fully drained — for
   merges, that means all rows in \`SYSTEM.CDC_STREAM\` with the same child
   \`PARTITION_ID\` have had their parent partitions processed.

3. **For each partition**, query the CDC object scoped to that partition and the
   time window the partition was live:

   \`\`\`sql
   SELECT /*+ CDC_INCLUDE(POST, CHANGE) */
          PHOENIX_ROW_TIMESTAMP(), <pk_cols>, "CDC JSON"
   FROM orders_cdc
   WHERE PARTITION_ID() = ?
     AND PHOENIX_ROW_TIMESTAMP() >= ?   -- e.g. PARTITION_START_TIME
     AND PHOENIX_ROW_TIMESTAMP() <  ?   -- e.g. PARTITION_END_TIME (or now() while live)
   ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
   \`\`\`

4. **Re-poll the topology periodically.** New rows appear in \`SYSTEM.CDC_STREAM\`
   when regions split or merge; consumers refresh their DAG to pick up the new
   children before existing partitions close.

This is the same shard-lineage model used by DynamoDB Streams — if you're porting a
DynamoDB Streams consumer, the bookkeeping translates almost directly.

## Special event types

* **TTL-driven deletes** (rows aged out by [time-based](/docs/features/views) or
  [conditional](/docs/features/conditional-ttl) TTL) produce CDC events alongside
  application-issued mutations, so consumers don't have to reconcile retention-driven
  removals separately.
* **\`ARRAY\` and \`JSON\` columns** in the data table are serialized as simple values
  inside the \`"CDC JSON"\` payload.
* **Case-sensitive identifiers** on the data table and its primary-key columns are
  preserved end to end in events.

## Operational notes

* When the underlying data table is dropped, its CDC stream metadata in
  \`SYSTEM.CDC_STREAM\` is cleaned up automatically — you don't have to drop the CDC
  object first.
* The CDC object is internally backed by a partitioned secondary index on the data
  table, but it's not used to satisfy regular queries against the data table —
  there's no read penalty on the data table from enabling CDC.
* Re-creating CDC after a drop produces a distinct stream (the stream name is
  augmented with creation time), so consumers can detect the boundary and reset
  their offsets cleanly.
`,r={title:"Change Data Capture (CDC)",description:"Query row-level change events on a Phoenix table using standard SQL — pull pre/post images and change deltas with bounded, resumable reads."},h=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7001"},{href:"/docs/features/views"},{href:"/docs/features/conditional-ttl"}],d={contents:[{heading:void 0,content:`Change Data Capture turns a Phoenix table into a stream of change events that
downstream consumers can read using regular SQL. Once enabled, a CDC object behaves
like a queryable Phoenix table: every insert, update, and delete on the underlying
data table produces a row containing the affected primary key, an event timestamp,
and a JSON payload describing what changed. Available in Phoenix 5.3.0
(PHOENIX-7001).`},{heading:"cdc-when",content:"Reach for CDC when something downstream needs to react to row-level changes:"},{heading:"cdc-when",content:"Replication or mirroring to another store (Kafka, search index, data warehouse)."},{heading:"cdc-when",content:"Audit logs and change history."},{heading:"cdc-when",content:"Cache invalidation and event-driven workflows."},{heading:"cdc-when",content:"Materialized projections / fan-out tables maintained by an external process."},{heading:"cdc-when",content:`CDC captures the actual mutations as they happen — including TTL-driven row
deletes — so consumers don't need to poll the data table or compute diffs.`},{heading:"cdc-enable",content:"Use CREATE CDC to enable change capture on an existing table:"},{heading:"cdc-enable",content:`The INCLUDE clause sets the default scopes that appear in the JSON payload.
Available scopes:`},{heading:"cdc-enable",content:"Scope"},{heading:"cdc-enable",content:"Meaning"},{heading:"cdc-enable",content:"PRE"},{heading:"cdc-enable",content:"Row image before the mutation."},{heading:"cdc-enable",content:"POST"},{heading:"cdc-enable",content:"Row image after the mutation."},{heading:"cdc-enable",content:"CHANGE"},{heading:"cdc-enable",content:"Just the changed columns (diff)."},{heading:"cdc-enable",content:`Standard CREATE INDEX–style table properties on CREATE CDC (SALT_BUCKETS,
UPDATE_CACHE_FREQUENCY, COLUMN_ENCODED_BYTES, etc.) are forwarded to the
underlying CDC index.`},{heading:"cdc-enable",content:"To remove CDC from a table:"},{heading:"cdc-read",content:"Each CDC object behaves like a Phoenix table whose columns are:"},{heading:"cdc-read",content:"The data table's primary-key columns (so you know which row changed)."},{heading:"cdc-read",content:`A payload column literally named "CDC JSON" (case-sensitive, must be quoted).
Project it whenever you need the change payload; omit it for lightweight queries
that only care about which rows changed or for topology lookups. SELECT *
includes it automatically.`},{heading:"cdc-read",content:"Two helpers come along for the ride:"},{heading:"cdc-read",content:`PHOENIX_ROW_TIMESTAMP() — the event's timestamp; use it for ordering and time-
bounded reads.`},{heading:"cdc-read",content:`PARTITION_ID() — the partition the event came from; useful for sharding consumer
workers.`},{heading:"cdc-read",content:"A typical read query that wants the full payload looks like this:"},{heading:"cdc-read",content:`The CDC_INCLUDE(...) query hint overrides the default scopes set at CREATE
CDC time — so the same CDC object can serve different downstream consumers, each
asking for only the scope they need. Without the hint, the payload uses the
INCLUDE scopes from the CREATE CDC statement.`},{heading:"time-bounded--incremental-reads",content:`Use PHOENIX_ROW_TIMESTAMP() predicates to pull only events within a window —
consumers typically remember the last timestamp they processed and bind it as the
lower bound on the next call:`},{heading:"per-partition-reads",content:`Partitions track HBase regions of the data table, so you can shard a consumer pool
across them. Discover partitions with:`},{heading:"per-partition-reads",content:"Then issue per-partition reads:"},{heading:"cdc-lineage",content:`A CDC stream is logically a set of partitions, each carrying a totally-ordered
sequence of change events. A partition isn't an abstract shard — it corresponds to a
specific HBase region of the data table at a point in time, and it has a finite
lifetime: it's born when the region is created (or as the result of a split/merge)
and it's closed when that region itself splits or merges into something new. New
child partitions take over from there.`},{heading:"cdc-lineage",content:`Phoenix tracks this topology in SYSTEM.CDC_STREAM. The schema makes the lineage
explicit — every partition row points at its parent partition(s):`},{heading:"cdc-lineage",content:"Column"},{heading:"cdc-lineage",content:"Notes"},{heading:"cdc-lineage",content:"TABLE_NAME"},{heading:"cdc-lineage",content:"The data table whose changes are streamed."},{heading:"cdc-lineage",content:"STREAM_NAME"},{heading:"cdc-lineage",content:"The CDC stream (each CREATE CDC produces a uniquely-named stream)."},{heading:"cdc-lineage",content:"PARTITION_ID"},{heading:"cdc-lineage",content:"This partition's id — same value PARTITION_ID() returns on a CDC row."},{heading:"cdc-lineage",content:"PARENT_PARTITION_ID"},{heading:"cdc-lineage",content:"The parent partition's id (empty/null for the initial partitions present when CDC was first enabled)."},{heading:"cdc-lineage",content:"PARTITION_START_TIME"},{heading:"cdc-lineage",content:"When this partition began."},{heading:"cdc-lineage",content:"PARTITION_END_TIME"},{heading:"cdc-lineage",content:"When it was closed (a split or merge ended it). NULL while still active."},{heading:"cdc-lineage",content:"PARTITION_START_KEY / _END_KEY"},{heading:"cdc-lineage",content:"The HBase region's row-key bounds at the time, stored as VARBINARY_ENCODED."},{heading:"cdc-lineage",content:"PARENT_PARTITION_START_TIME"},{heading:"cdc-lineage",content:"The parent partition's PARTITION_START_TIME, embedded so consumers can walk parent → child without an extra join."},{heading:"cdc-lineage",content:"Two important shapes fall out of this model:"},{heading:"cdc-lineage",content:`A split produces two child rows that share the same PARENT_PARTITION_ID (the
region that just split). Their key ranges together cover the parent's range.`},{heading:"cdc-lineage",content:`A merge produces one child partition with multiple rows in SYSTEM.CDC_STREAM —
one row per parent — sharing the same PARTITION_ID and differing only in
PARENT_PARTITION_ID. Together those rows record every parent that fed the merge.`},{heading:"consuming-events-in-parent--child-order",content:`Because events from a parent partition causally precede events from any of its
children, a correct consumer must drain the parent before reading children that
descend from it. The pattern is:`},{heading:"consuming-events-in-parent--child-order",content:`Discover the topology by reading SYSTEM.CDC_STREAM for your table and
stream. Build a DAG keyed by PARTITION_ID, with edges drawn from
PARENT_PARTITION_ID → child PARTITION_ID. Roots are partitions with no
parent (the regions present when CDC was first enabled).`},{heading:"consuming-events-in-parent--child-order",content:`Process roots first, then walk forward through the DAG. A child partition is
ready to be consumed once all of its parents have been fully drained — for
merges, that means all rows in SYSTEM.CDC_STREAM with the same child
PARTITION_ID have had their parent partitions processed.`},{heading:"consuming-events-in-parent--child-order",content:`For each partition, query the CDC object scoped to that partition and the
time window the partition was live:`},{heading:"consuming-events-in-parent--child-order",content:`Re-poll the topology periodically. New rows appear in SYSTEM.CDC_STREAM
when regions split or merge; consumers refresh their DAG to pick up the new
children before existing partitions close.`},{heading:"consuming-events-in-parent--child-order",content:`This is the same shard-lineage model used by DynamoDB Streams — if you're porting a
DynamoDB Streams consumer, the bookkeeping translates almost directly.`},{heading:"cdc-special-events",content:`TTL-driven deletes (rows aged out by time-based or
conditional TTL) produce CDC events alongside
application-issued mutations, so consumers don't have to reconcile retention-driven
removals separately.`},{heading:"cdc-special-events",content:`ARRAY and JSON columns in the data table are serialized as simple values
inside the "CDC JSON" payload.`},{heading:"cdc-special-events",content:`Case-sensitive identifiers on the data table and its primary-key columns are
preserved end to end in events.`},{heading:"cdc-ops",content:`When the underlying data table is dropped, its CDC stream metadata in
SYSTEM.CDC_STREAM is cleaned up automatically — you don't have to drop the CDC
object first.`},{heading:"cdc-ops",content:`The CDC object is internally backed by a partitioned secondary index on the data
table, but it's not used to satisfy regular queries against the data table —
there's no read penalty on the data table from enabling CDC.`},{heading:"cdc-ops",content:`Re-creating CDC after a drop produces a distinct stream (the stream name is
augmented with creation time), so consumers can detect the boundary and reset
their offsets cleanly.`}],headings:[{id:"cdc-when",content:"When to use it"},{id:"cdc-enable",content:"Enabling CDC on a table"},{id:"cdc-read",content:"Reading change events"},{id:"time-bounded--incremental-reads",content:"Time-bounded / incremental reads"},{id:"per-partition-reads",content:"Per-partition reads"},{id:"cdc-lineage",content:"Stream lineage: partitions, splits, and merges"},{id:"consuming-events-in-parent--child-order",content:"Consuming events in parent → child order"},{id:"cdc-special-events",content:"Special event types"},{id:"cdc-ops",content:"Operational notes"}]};const l=[{depth:2,url:"#cdc-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#cdc-enable",title:e.jsx(e.Fragment,{children:"Enabling CDC on a table"})},{depth:2,url:"#cdc-read",title:e.jsx(e.Fragment,{children:"Reading change events"})},{depth:3,url:"#time-bounded--incremental-reads",title:e.jsx(e.Fragment,{children:"Time-bounded / incremental reads"})},{depth:3,url:"#per-partition-reads",title:e.jsx(e.Fragment,{children:"Per-partition reads"})},{depth:2,url:"#cdc-lineage",title:e.jsx(e.Fragment,{children:"Stream lineage: partitions, splits, and merges"})},{depth:3,url:"#consuming-events-in-parent--child-order",title:e.jsx(e.Fragment,{children:"Consuming events in parent → child order"})},{depth:2,url:"#cdc-special-events",title:e.jsx(e.Fragment,{children:"Special event types"})},{depth:2,url:"#cdc-ops",title:e.jsx(e.Fragment,{children:"Operational notes"})}];function s(i){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Change Data Capture turns a Phoenix table into a ",e.jsx(n.strong,{children:"stream of change events"}),` that
downstream consumers can read using regular SQL. Once enabled, a CDC object behaves
like a queryable Phoenix table: every insert, update, and delete on the underlying
data table produces a row containing the affected primary key, an event timestamp,
and a JSON payload describing what changed. Available in Phoenix 5.3.0
(`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7001",children:"PHOENIX-7001"}),")."]}),`
`,e.jsx(n.h2,{id:"cdc-when",children:"When to use it"}),`
`,e.jsx(n.p,{children:"Reach for CDC when something downstream needs to react to row-level changes:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Replication or mirroring to another store (Kafka, search index, data warehouse)."}),`
`,e.jsx(n.li,{children:"Audit logs and change history."}),`
`,e.jsx(n.li,{children:"Cache invalidation and event-driven workflows."}),`
`,e.jsx(n.li,{children:"Materialized projections / fan-out tables maintained by an external process."}),`
`]}),`
`,e.jsxs(n.p,{children:["CDC captures the actual mutations as they happen — ",e.jsx(n.strong,{children:`including TTL-driven row
deletes`})," — so consumers don't need to poll the data table or compute diffs."]}),`
`,e.jsx(n.h2,{id:"cdc-enable",children:"Enabling CDC on a table"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"CREATE CDC"})," to enable change capture on an existing table:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Capture every change scope (default)."})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CDC orders_cdc "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders;"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Or restrict the default scopes recorded per event."})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CDC orders_cdc "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (PRE, POST, CHANGE);"})]})]})})}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"INCLUDE"})," clause sets the ",e.jsx(n.strong,{children:"default"}),` scopes that appear in the JSON payload.
Available scopes:`]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Scope"}),e.jsx(n.th,{children:"Meaning"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PRE"})}),e.jsx(n.td,{children:"Row image before the mutation."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"POST"})}),e.jsx(n.td,{children:"Row image after the mutation."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"CHANGE"})}),e.jsx(n.td,{children:"Just the changed columns (diff)."})]})]})]}),`
`,e.jsxs(n.p,{children:["Standard ",e.jsx(n.code,{children:"CREATE INDEX"}),"–style table properties on ",e.jsx(n.code,{children:"CREATE CDC"})," (",e.jsx(n.code,{children:"SALT_BUCKETS"}),`,
`,e.jsx(n.code,{children:"UPDATE_CACHE_FREQUENCY"}),", ",e.jsx(n.code,{children:"COLUMN_ENCODED_BYTES"}),`, etc.) are forwarded to the
underlying CDC index.`]}),`
`,e.jsx(n.p,{children:"To remove CDC from a table:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DROP"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CDC orders_cdc "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders;"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DROP"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CDC "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"IF"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" EXISTS"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders;"})]})]})})}),`
`,e.jsx(n.h2,{id:"cdc-read",children:"Reading change events"}),`
`,e.jsx(n.p,{children:"Each CDC object behaves like a Phoenix table whose columns are:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"The data table's primary-key columns (so you know which row changed)."}),`
`,e.jsxs(n.li,{children:["A payload column literally named ",e.jsx(n.code,{children:'"CDC JSON"'}),` (case-sensitive, must be quoted).
Project it whenever you need the change payload; omit it for lightweight queries
that only care about which rows changed or for topology lookups. `,e.jsx(n.code,{children:"SELECT *"}),`
includes it automatically.`]}),`
`]}),`
`,e.jsx(n.p,{children:"Two helpers come along for the ride:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"PHOENIX_ROW_TIMESTAMP()"}),` — the event's timestamp; use it for ordering and time-
bounded reads.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"PARTITION_ID()"}),` — the partition the event came from; useful for sharding consumer
workers.`]}),`
`]}),`
`,e.jsx(n.p,{children:"A typical read query that wants the full payload looks like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" /*+ CDC_INCLUDE(POST, CHANGE) */"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       PARTITION_ID(),"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" event_time,"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       order_id,"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'       "CDC JSON"'})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"CDC_INCLUDE(...)"})," query hint ",e.jsx(n.strong,{children:"overrides"})," the default scopes set at ",e.jsx(n.code,{children:"CREATE CDC"}),` time — so the same CDC object can serve different downstream consumers, each
asking for only the scope they need. Without the hint, the payload uses the
`,e.jsx(n.code,{children:"INCLUDE"})," scopes from the ",e.jsx(n.code,{children:"CREATE CDC"})," statement."]}),`
`,e.jsx(n.h3,{id:"time-bounded--incremental-reads",children:"Time-bounded / incremental reads"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"PHOENIX_ROW_TIMESTAMP()"}),` predicates to pull only events within a window —
consumers typically remember the last timestamp they processed and bind it as the
lower bound on the next call:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" /*+ CDC_INCLUDE(POST) */"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       PHOENIX_ROW_TIMESTAMP(), order_id, "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"CDC JSON"'})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(n.h3,{id:"per-partition-reads",children:"Per-partition reads"}),`
`,e.jsx(n.p,{children:`Partitions track HBase regions of the data table, so you can shard a consumer pool
across them. Discover partitions with:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT DISTINCT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PARTITION_ID() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc;"})]})})})}),`
`,e.jsx(n.p,{children:"Then issue per-partition reads:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" /*+ CDC_INCLUDE(POST) */"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ..."})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PARTITION_ID() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(n.h2,{id:"cdc-lineage",children:"Stream lineage: partitions, splits, and merges"}),`
`,e.jsxs(n.p,{children:["A CDC stream is logically a ",e.jsx(n.strong,{children:"set of partitions"}),`, each carrying a totally-ordered
sequence of change events. A partition isn't an abstract shard — it corresponds to a
specific `,e.jsx(n.strong,{children:"HBase region of the data table at a point in time"}),`, and it has a finite
lifetime: it's born when the region is created (or as the result of a split/merge)
and it's closed when that region itself splits or merges into something new. New
child partitions take over from there.`]}),`
`,e.jsxs(n.p,{children:["Phoenix tracks this topology in ",e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"}),`. The schema makes the lineage
explicit — every partition row points at its parent partition(s):`]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Column"}),e.jsx(n.th,{children:"Notes"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"TABLE_NAME"})}),e.jsx(n.td,{children:"The data table whose changes are streamed."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"STREAM_NAME"})}),e.jsxs(n.td,{children:["The CDC stream (each ",e.jsx(n.code,{children:"CREATE CDC"})," produces a uniquely-named stream)."]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PARTITION_ID"})}),e.jsxs(n.td,{children:["This partition's id — same value ",e.jsx(n.code,{children:"PARTITION_ID()"})," returns on a CDC row."]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PARENT_PARTITION_ID"})}),e.jsx(n.td,{children:"The parent partition's id (empty/null for the initial partitions present when CDC was first enabled)."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PARTITION_START_TIME"})}),e.jsx(n.td,{children:"When this partition began."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PARTITION_END_TIME"})}),e.jsxs(n.td,{children:["When it was closed (a split or merge ended it). ",e.jsx(n.code,{children:"NULL"})," while still active."]})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:[e.jsx(n.code,{children:"PARTITION_START_KEY"})," / ",e.jsx(n.code,{children:"_END_KEY"})]}),e.jsxs(n.td,{children:["The HBase region's row-key bounds at the time, stored as ",e.jsx(n.code,{children:"VARBINARY_ENCODED"}),"."]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"PARENT_PARTITION_START_TIME"})}),e.jsxs(n.td,{children:["The parent partition's ",e.jsx(n.code,{children:"PARTITION_START_TIME"}),", embedded so consumers can walk parent → child without an extra join."]})]})]})]}),`
`,e.jsx(n.p,{children:"Two important shapes fall out of this model:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["A split produces two child rows that share the same ",e.jsx(n.code,{children:"PARENT_PARTITION_ID"})]}),` (the
region that just split). Their key ranges together cover the parent's range.`]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["A merge produces one child partition with multiple rows in ",e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"})]}),` —
one row per parent — sharing the same `,e.jsx(n.code,{children:"PARTITION_ID"}),` and differing only in
`,e.jsx(n.code,{children:"PARENT_PARTITION_ID"}),". Together those rows record every parent that fed the merge."]}),`
`]}),`
`,e.jsx(n.h3,{id:"consuming-events-in-parent--child-order",children:"Consuming events in parent → child order"}),`
`,e.jsx(n.p,{children:`Because events from a parent partition causally precede events from any of its
children, a correct consumer must drain the parent before reading children that
descend from it. The pattern is:`}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Discover the topology"})," by reading ",e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"}),` for your table and
stream. Build a DAG keyed by `,e.jsx(n.code,{children:"PARTITION_ID"}),`, with edges drawn from
`,e.jsx(n.code,{children:"PARENT_PARTITION_ID"})," → child ",e.jsx(n.code,{children:"PARTITION_ID"}),`. Roots are partitions with no
parent (the regions present when CDC was first enabled).`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Process roots first"}),`, then walk forward through the DAG. A child partition is
ready to be consumed once `,e.jsx(n.strong,{children:"all"}),` of its parents have been fully drained — for
merges, that means all rows in `,e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"}),` with the same child
`,e.jsx(n.code,{children:"PARTITION_ID"})," have had their parent partitions processed."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"For each partition"}),`, query the CDC object scoped to that partition and the
time window the partition was live:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" /*+ CDC_INCLUDE(POST, CHANGE) */"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       PHOENIX_ROW_TIMESTAMP(), "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pk_cols"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"CDC JSON"'})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders_cdc"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PARTITION_ID() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?   "}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- e.g. PARTITION_START_TIME"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ?   "}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- e.g. PARTITION_END_TIME (or now() while live)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Re-poll the topology periodically."})," New rows appear in ",e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"}),`
when regions split or merge; consumers refresh their DAG to pick up the new
children before existing partitions close.`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:`This is the same shard-lineage model used by DynamoDB Streams — if you're porting a
DynamoDB Streams consumer, the bookkeeping translates almost directly.`}),`
`,e.jsx(n.h2,{id:"cdc-special-events",children:"Special event types"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"TTL-driven deletes"})," (rows aged out by ",e.jsx(n.a,{href:"/docs/features/views",children:"time-based"}),` or
`,e.jsx(n.a,{href:"/docs/features/conditional-ttl",children:"conditional"}),` TTL) produce CDC events alongside
application-issued mutations, so consumers don't have to reconcile retention-driven
removals separately.`]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"ARRAY"})," and ",e.jsx(n.code,{children:"JSON"})," columns"]}),` in the data table are serialized as simple values
inside the `,e.jsx(n.code,{children:'"CDC JSON"'})," payload."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Case-sensitive identifiers"}),` on the data table and its primary-key columns are
preserved end to end in events.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"cdc-ops",children:"Operational notes"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`When the underlying data table is dropped, its CDC stream metadata in
`,e.jsx(n.code,{children:"SYSTEM.CDC_STREAM"}),` is cleaned up automatically — you don't have to drop the CDC
object first.`]}),`
`,e.jsx(n.li,{children:`The CDC object is internally backed by a partitioned secondary index on the data
table, but it's not used to satisfy regular queries against the data table —
there's no read penalty on the data table from enabling CDC.`}),`
`,e.jsx(n.li,{children:`Re-creating CDC after a drop produces a distinct stream (the stream name is
augmented with creation time), so consumers can detect the boundary and reset
their offsets cleanly.`}),`
`]})]})}function o(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{a as _markdown,o as default,h as extractedReferences,r as frontmatter,d as structuredData,l as toc};
