import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`An **eventually consistent global index** behaves like a regular Phoenix
[global index](/docs/features/secondary-indexes#global-indexes) at the SQL
level — same DDL, same \`INCLUDE\`, same query planning — but Phoenix maintains
it asynchronously instead of on the synchronous write path. Writes commit
faster on the data table, the index catches up shortly after, and reads from
the index are read-repaired against the data table so they never return
incorrect data. Introduced in Phoenix 5.3.1
([PHOENIX-7794](https://issues.apache.org/jira/browse/PHOENIX-7794)).

## When to use it

Pick eventually consistent over the default (strong) consistency when **both**
are true:

* Synchronous index maintenance is your write-path bottleneck — typically a
  data table fanning out to several large indexes per mutation.
* A bounded staleness window on the index (seconds) is acceptable for the
  queries that hit it.

Stay with the default \`CONSISTENCY=STRONG\` for indexes that back
read-your-write flows — e.g. "insert a row, then immediately query it via the
new index" inside a single user request.

This is a property of **global** indexes only. \`CONSISTENCY=EVENTUAL\` on a
\`LOCAL\` index parses but has no runtime effect.

## Creating an EC index

\`CONSISTENCY=EVENTUAL\` is set in the trailing properties slot of \`CREATE INDEX\`:

\`\`\`sql
CREATE INDEX my_idx
  ON my_table (v1)
  INCLUDE (v2)
  CONSISTENCY=EVENTUAL;
\`\`\`

\`UNCOVERED\` and \`ASYNC\` compose normally:

\`\`\`sql
CREATE UNCOVERED INDEX my_idx ON my_table (city, name) CONSISTENCY=EVENTUAL;
CREATE INDEX my_idx ON my_table (v1) INCLUDE (v2) ASYNC CONSISTENCY=EVENTUAL;
\`\`\`

The default is \`CONSISTENCY=STRONG\`. Flip an existing index in either direction:

\`\`\`sql
ALTER INDEX my_idx ON my_table CONSISTENCY=EVENTUAL;
ALTER INDEX my_idx ON my_table CONSISTENCY=STRONG;
\`\`\`

The consistency mode is a per-index property — not a connection setting and
not a query hint. Every reader of the index sees the same mode.

## How it works

EC indexes are maintained by a per-region background consumer that reads a
[Change Data Capture](/docs/features/change-data-capture) stream on the data
table and applies the resulting mutations to the index. The first EC index
on a table provisions the stream automatically; subsequent EC indexes on the
same table share it.

The consumer supports two strategies for turning a CDC event into an index
mutation, with opposite write-vs-read IO tradeoffs:

* **Derive on consume (default).** The CDC event carries a lightweight
  data-row-state marker; the consumer re-reads the data row at consume time
  to compute the index mutation. Cheap on the write path, one extra
  data-table read per event on the consume path. Relies on
  \`phoenix.max.lookback.age.seconds\` being long enough for the data table to
  retain the before image of every modified row until the consumer catches up.
* **Serialize on write.** The index mutation is computed at write time and
  serialized into the CDC event itself; the consumer just replays it. More
  write IO (and optionally compressed), no extra read on consume. Useful when
  the consumer's data-table read is the bottleneck or max-lookback is tight.

Toggle with \`phoenix.index.cdc.mutation.serialize\` (see Tuning). For most
workloads the default — derive on consume — is the right choice.

## How reads behave

There is **no query-side change** — no hint, no new syntax. The planner picks
an EC index exactly like a STRONG index. The visibility contract differs in
two ways:

* A row recently inserted on the data table may not yet appear in the index.
* An existing index row's covered column values may be stale until the next
  update is applied.

Phoenix never returns incorrect rows: any index row not yet caught up is
verified against the data table before being returned, exactly like a STRONG
index. The practical visibility window is **a few seconds** on a healthy
cluster, governed by the tunables below.

## Tuning

Set on the RegionServer side in \`hbase-site.xml\`. The defaults are sensible
for most clusters; the two knobs you will typically reach for are batch size
(throughput) and timestamp buffer (visibility delay floor).

| Property                                                 | Default | Description                                                                                                                                                                                         |
| -------------------------------------------------------- | ------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`phoenix.index.cdc.consumer.enabled\`                     |  \`true\` | Master switch for the async index maintenance subsystem. Disable to halt all EC-index maintenance cluster-wide.                                                                                     |
| \`phoenix.index.cdc.consumer.batch.size\`                  |   \`500\` | Events drained per iteration. Larger amortizes overhead; smaller bounds staleness on bursty workloads.                                                                                              |
| \`phoenix.index.cdc.consumer.poll.interval.ms\`            |  \`1000\` | Sleep when there is no work to do. Raise to reduce idle wake-ups.                                                                                                                                   |
| \`phoenix.index.cdc.consumer.timestamp.buffer.ms\`         |  \`5000\` | Safety buffer subtracted from "now" before consuming. Floor for visibility delay.                                                                                                                   |
| \`phoenix.index.cdc.consumer.startup.delay.ms\`            | \`10000\` | Delay before a freshly opened region starts consuming.                                                                                                                                              |
| \`phoenix.index.cdc.consumer.max.data.visibility.retries\` |    \`10\` | Retries when the data row is not yet visible to the consumer.                                                                                                                                       |
| \`phoenix.index.cdc.consumer.retry.pause.ms\`              |  \`2000\` | Sleep between data-visibility retries.                                                                                                                                                              |
| \`phoenix.index.cdc.mutation.serialize\`                   | \`false\` | Selects the consumer strategy (see [How it works](#ec-indexes-how)). \`false\` derives index mutations at consume time (lower write IO); \`true\` serializes them at write time (no consume-side read). |
| \`phoenix.index.cdc.mutations.compress.enabled\`           | \`false\` | Snappy-compress the serialized index mutation. Only relevant when \`phoenix.index.cdc.mutation.serialize=true\`.                                                                                      |

With defaults, expect end-to-end index visibility of **\\~5–10 seconds**.

## Limitations

* **Global indexes only.** \`LOCAL INDEX ... CONSISTENCY=EVENTUAL\` is a no-op.
* **Designed and tested for non-transactional tables.** Combining EC indexes
  with transactional tables is undefined in 5.3.1.
* **Salted data tables are not supported** — the underlying change stream
  Phoenix needs to maintain an EC index is incompatible with salting.
* **Data-table max lookback age must outlive the async lag.** Increase
  \`phoenix.max.lookback.age.seconds\` on the data table if you tune the
  consumer for low throughput or you expect long catch-up periods.

## Operational notes

* The first EC index on a table provisions the underlying change stream
  automatically. Subsequent EC indexes on the same table reuse it.
* Region splits and merges are handled transparently — no operator action is
  required to keep the index up to date through topology changes.
* \`ALTER INDEX ... CONSISTENCY=STRONG\` returns the index to synchronous
  maintenance for **new** writes. Any in-flight async work continues to flow
  through until the queue drains.

## See also

* [Secondary Indexes](/docs/features/secondary-indexes) — global, local,
  covered, uncovered, and functional indexes.
* [Change Data Capture](/docs/features/change-data-capture) — exposed
  Phoenix-level change streams for application use.
`,r={title:"Eventually Consistent Global Indexes",description:"Global secondary indexes maintained asynchronously off the data-table write path — for write-heavy workloads that can tolerate a bounded staleness window on the index in exchange for higher write throughput."},o=[{href:"/docs/features/secondary-indexes#global-indexes"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7794"},{href:"/docs/features/change-data-capture"},{href:"#ec-indexes-how"},{href:"/docs/features/secondary-indexes"},{href:"/docs/features/change-data-capture"}],d={contents:[{heading:void 0,content:`An eventually consistent global index behaves like a regular Phoenix
global index at the SQL
level — same DDL, same INCLUDE, same query planning — but Phoenix maintains
it asynchronously instead of on the synchronous write path. Writes commit
faster on the data table, the index catches up shortly after, and reads from
the index are read-repaired against the data table so they never return
incorrect data. Introduced in Phoenix 5.3.1
(PHOENIX-7794).`},{heading:"ec-indexes-when",content:`Pick eventually consistent over the default (strong) consistency when both
are true:`},{heading:"ec-indexes-when",content:`Synchronous index maintenance is your write-path bottleneck — typically a
data table fanning out to several large indexes per mutation.`},{heading:"ec-indexes-when",content:`A bounded staleness window on the index (seconds) is acceptable for the
queries that hit it.`},{heading:"ec-indexes-when",content:`Stay with the default CONSISTENCY=STRONG for indexes that back
read-your-write flows — e.g. "insert a row, then immediately query it via the
new index" inside a single user request.`},{heading:"ec-indexes-when",content:`This is a property of global indexes only. CONSISTENCY=EVENTUAL on a
LOCAL index parses but has no runtime effect.`},{heading:"ec-indexes-create",content:"CONSISTENCY=EVENTUAL is set in the trailing properties slot of CREATE INDEX:"},{heading:"ec-indexes-create",content:"UNCOVERED and ASYNC compose normally:"},{heading:"ec-indexes-create",content:"The default is CONSISTENCY=STRONG. Flip an existing index in either direction:"},{heading:"ec-indexes-create",content:`The consistency mode is a per-index property — not a connection setting and
not a query hint. Every reader of the index sees the same mode.`},{heading:"ec-indexes-how",content:`EC indexes are maintained by a per-region background consumer that reads a
Change Data Capture stream on the data
table and applies the resulting mutations to the index. The first EC index
on a table provisions the stream automatically; subsequent EC indexes on the
same table share it.`},{heading:"ec-indexes-how",content:`The consumer supports two strategies for turning a CDC event into an index
mutation, with opposite write-vs-read IO tradeoffs:`},{heading:"ec-indexes-how",content:`Derive on consume (default). The CDC event carries a lightweight
data-row-state marker; the consumer re-reads the data row at consume time
to compute the index mutation. Cheap on the write path, one extra
data-table read per event on the consume path. Relies on
phoenix.max.lookback.age.seconds being long enough for the data table to
retain the before image of every modified row until the consumer catches up.`},{heading:"ec-indexes-how",content:`Serialize on write. The index mutation is computed at write time and
serialized into the CDC event itself; the consumer just replays it. More
write IO (and optionally compressed), no extra read on consume. Useful when
the consumer's data-table read is the bottleneck or max-lookback is tight.`},{heading:"ec-indexes-how",content:`Toggle with phoenix.index.cdc.mutation.serialize (see Tuning). For most
workloads the default — derive on consume — is the right choice.`},{heading:"ec-indexes-reads",content:`There is no query-side change — no hint, no new syntax. The planner picks
an EC index exactly like a STRONG index. The visibility contract differs in
two ways:`},{heading:"ec-indexes-reads",content:"A row recently inserted on the data table may not yet appear in the index."},{heading:"ec-indexes-reads",content:`An existing index row's covered column values may be stale until the next
update is applied.`},{heading:"ec-indexes-reads",content:`Phoenix never returns incorrect rows: any index row not yet caught up is
verified against the data table before being returned, exactly like a STRONG
index. The practical visibility window is a few seconds on a healthy
cluster, governed by the tunables below.`},{heading:"ec-indexes-tuning",content:`Set on the RegionServer side in hbase-site.xml. The defaults are sensible
for most clusters; the two knobs you will typically reach for are batch size
(throughput) and timestamp buffer (visibility delay floor).`},{heading:"ec-indexes-tuning",content:"Property"},{heading:"ec-indexes-tuning",content:"Default"},{heading:"ec-indexes-tuning",content:"Description"},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.enabled"},{heading:"ec-indexes-tuning",content:"true"},{heading:"ec-indexes-tuning",content:"Master switch for the async index maintenance subsystem. Disable to halt all EC-index maintenance cluster-wide."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.batch.size"},{heading:"ec-indexes-tuning",content:"500"},{heading:"ec-indexes-tuning",content:"Events drained per iteration. Larger amortizes overhead; smaller bounds staleness on bursty workloads."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.poll.interval.ms"},{heading:"ec-indexes-tuning",content:"1000"},{heading:"ec-indexes-tuning",content:"Sleep when there is no work to do. Raise to reduce idle wake-ups."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.timestamp.buffer.ms"},{heading:"ec-indexes-tuning",content:"5000"},{heading:"ec-indexes-tuning",content:'Safety buffer subtracted from "now" before consuming. Floor for visibility delay.'},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.startup.delay.ms"},{heading:"ec-indexes-tuning",content:"10000"},{heading:"ec-indexes-tuning",content:"Delay before a freshly opened region starts consuming."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.max.data.visibility.retries"},{heading:"ec-indexes-tuning",content:"10"},{heading:"ec-indexes-tuning",content:"Retries when the data row is not yet visible to the consumer."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.consumer.retry.pause.ms"},{heading:"ec-indexes-tuning",content:"2000"},{heading:"ec-indexes-tuning",content:"Sleep between data-visibility retries."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.mutation.serialize"},{heading:"ec-indexes-tuning",content:"false"},{heading:"ec-indexes-tuning",content:"Selects the consumer strategy (see How it works). false derives index mutations at consume time (lower write IO); true serializes them at write time (no consume-side read)."},{heading:"ec-indexes-tuning",content:"phoenix.index.cdc.mutations.compress.enabled"},{heading:"ec-indexes-tuning",content:"false"},{heading:"ec-indexes-tuning",content:"Snappy-compress the serialized index mutation. Only relevant when phoenix.index.cdc.mutation.serialize=true."},{heading:"ec-indexes-tuning",content:"With defaults, expect end-to-end index visibility of ~5–10 seconds."},{heading:"ec-indexes-limitations",content:"Global indexes only. LOCAL INDEX ... CONSISTENCY=EVENTUAL is a no-op."},{heading:"ec-indexes-limitations",content:`Designed and tested for non-transactional tables. Combining EC indexes
with transactional tables is undefined in 5.3.1.`},{heading:"ec-indexes-limitations",content:`Salted data tables are not supported — the underlying change stream
Phoenix needs to maintain an EC index is incompatible with salting.`},{heading:"ec-indexes-limitations",content:`Data-table max lookback age must outlive the async lag. Increase
phoenix.max.lookback.age.seconds on the data table if you tune the
consumer for low throughput or you expect long catch-up periods.`},{heading:"ec-indexes-ops",content:`The first EC index on a table provisions the underlying change stream
automatically. Subsequent EC indexes on the same table reuse it.`},{heading:"ec-indexes-ops",content:`Region splits and merges are handled transparently — no operator action is
required to keep the index up to date through topology changes.`},{heading:"ec-indexes-ops",content:`ALTER INDEX ... CONSISTENCY=STRONG returns the index to synchronous
maintenance for new writes. Any in-flight async work continues to flow
through until the queue drains.`},{heading:"ec-indexes-see-also",content:`Secondary Indexes — global, local,
covered, uncovered, and functional indexes.`},{heading:"ec-indexes-see-also",content:`Change Data Capture — exposed
Phoenix-level change streams for application use.`}],headings:[{id:"ec-indexes-when",content:"When to use it"},{id:"ec-indexes-create",content:"Creating an EC index"},{id:"ec-indexes-how",content:"How it works"},{id:"ec-indexes-reads",content:"How reads behave"},{id:"ec-indexes-tuning",content:"Tuning"},{id:"ec-indexes-limitations",content:"Limitations"},{id:"ec-indexes-ops",content:"Operational notes"},{id:"ec-indexes-see-also",content:"See also"}]};const h=[{depth:2,url:"#ec-indexes-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#ec-indexes-create",title:e.jsx(e.Fragment,{children:"Creating an EC index"})},{depth:2,url:"#ec-indexes-how",title:e.jsx(e.Fragment,{children:"How it works"})},{depth:2,url:"#ec-indexes-reads",title:e.jsx(e.Fragment,{children:"How reads behave"})},{depth:2,url:"#ec-indexes-tuning",title:e.jsx(e.Fragment,{children:"Tuning"})},{depth:2,url:"#ec-indexes-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#ec-indexes-ops",title:e.jsx(e.Fragment,{children:"Operational notes"})},{depth:2,url:"#ec-indexes-see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(i){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["An ",e.jsx(n.strong,{children:"eventually consistent global index"}),` behaves like a regular Phoenix
`,e.jsx(n.a,{href:"/docs/features/secondary-indexes#global-indexes",children:"global index"}),` at the SQL
level — same DDL, same `,e.jsx(n.code,{children:"INCLUDE"}),`, same query planning — but Phoenix maintains
it asynchronously instead of on the synchronous write path. Writes commit
faster on the data table, the index catches up shortly after, and reads from
the index are read-repaired against the data table so they never return
incorrect data. Introduced in Phoenix 5.3.1
(`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7794",children:"PHOENIX-7794"}),")."]}),`
`,e.jsx(n.h2,{id:"ec-indexes-when",children:"When to use it"}),`
`,e.jsxs(n.p,{children:["Pick eventually consistent over the default (strong) consistency when ",e.jsx(n.strong,{children:"both"}),`
are true:`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`Synchronous index maintenance is your write-path bottleneck — typically a
data table fanning out to several large indexes per mutation.`}),`
`,e.jsx(n.li,{children:`A bounded staleness window on the index (seconds) is acceptable for the
queries that hit it.`}),`
`]}),`
`,e.jsxs(n.p,{children:["Stay with the default ",e.jsx(n.code,{children:"CONSISTENCY=STRONG"}),` for indexes that back
read-your-write flows — e.g. "insert a row, then immediately query it via the
new index" inside a single user request.`]}),`
`,e.jsxs(n.p,{children:["This is a property of ",e.jsx(n.strong,{children:"global"})," indexes only. ",e.jsx(n.code,{children:"CONSISTENCY=EVENTUAL"}),` on a
`,e.jsx(n.code,{children:"LOCAL"})," index parses but has no runtime effect."]}),`
`,e.jsx(n.h2,{id:"ec-indexes-create",children:"Creating an EC index"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"CONSISTENCY=EVENTUAL"})," is set in the trailing properties slot of ",e.jsx(n.code,{children:"CREATE INDEX"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_idx"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v1)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v2)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  CONSISTENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EVENTUAL;"})]})]})})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"UNCOVERED"})," and ",e.jsx(n.code,{children:"ASYNC"})," compose normally:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UNCOVERED "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_idx "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (city, "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") CONSISTENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EVENTUAL;"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_idx"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v1) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v2) ASYNC CONSISTENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EVENTUAL;"})]})]})})}),`
`,e.jsxs(n.p,{children:["The default is ",e.jsx(n.code,{children:"CONSISTENCY=STRONG"}),". Flip an existing index in either direction:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_idx "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table CONSISTENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EVENTUAL;"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_idx "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table CONSISTENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"STRONG;"})]})]})})}),`
`,e.jsx(n.p,{children:`The consistency mode is a per-index property — not a connection setting and
not a query hint. Every reader of the index sees the same mode.`}),`
`,e.jsx(n.h2,{id:"ec-indexes-how",children:"How it works"}),`
`,e.jsxs(n.p,{children:[`EC indexes are maintained by a per-region background consumer that reads a
`,e.jsx(n.a,{href:"/docs/features/change-data-capture",children:"Change Data Capture"}),` stream on the data
table and applies the resulting mutations to the index. The first EC index
on a table provisions the stream automatically; subsequent EC indexes on the
same table share it.`]}),`
`,e.jsx(n.p,{children:`The consumer supports two strategies for turning a CDC event into an index
mutation, with opposite write-vs-read IO tradeoffs:`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Derive on consume (default)."}),` The CDC event carries a lightweight
data-row-state marker; the consumer re-reads the data row at consume time
to compute the index mutation. Cheap on the write path, one extra
data-table read per event on the consume path. Relies on
`,e.jsx(n.code,{children:"phoenix.max.lookback.age.seconds"}),` being long enough for the data table to
retain the before image of every modified row until the consumer catches up.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Serialize on write."}),` The index mutation is computed at write time and
serialized into the CDC event itself; the consumer just replays it. More
write IO (and optionally compressed), no extra read on consume. Useful when
the consumer's data-table read is the bottleneck or max-lookback is tight.`]}),`
`]}),`
`,e.jsxs(n.p,{children:["Toggle with ",e.jsx(n.code,{children:"phoenix.index.cdc.mutation.serialize"}),` (see Tuning). For most
workloads the default — derive on consume — is the right choice.`]}),`
`,e.jsx(n.h2,{id:"ec-indexes-reads",children:"How reads behave"}),`
`,e.jsxs(n.p,{children:["There is ",e.jsx(n.strong,{children:"no query-side change"}),` — no hint, no new syntax. The planner picks
an EC index exactly like a STRONG index. The visibility contract differs in
two ways:`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A row recently inserted on the data table may not yet appear in the index."}),`
`,e.jsx(n.li,{children:`An existing index row's covered column values may be stale until the next
update is applied.`}),`
`]}),`
`,e.jsxs(n.p,{children:[`Phoenix never returns incorrect rows: any index row not yet caught up is
verified against the data table before being returned, exactly like a STRONG
index. The practical visibility window is `,e.jsx(n.strong,{children:"a few seconds"}),` on a healthy
cluster, governed by the tunables below.`]}),`
`,e.jsx(n.h2,{id:"ec-indexes-tuning",children:"Tuning"}),`
`,e.jsxs(n.p,{children:["Set on the RegionServer side in ",e.jsx(n.code,{children:"hbase-site.xml"}),`. The defaults are sensible
for most clusters; the two knobs you will typically reach for are batch size
(throughput) and timestamp buffer (visibility delay floor).`]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{style:{textAlign:"right"},children:"Default"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.enabled"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"true"})}),e.jsx(n.td,{children:"Master switch for the async index maintenance subsystem. Disable to halt all EC-index maintenance cluster-wide."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.batch.size"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"500"})}),e.jsx(n.td,{children:"Events drained per iteration. Larger amortizes overhead; smaller bounds staleness on bursty workloads."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.poll.interval.ms"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"1000"})}),e.jsx(n.td,{children:"Sleep when there is no work to do. Raise to reduce idle wake-ups."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.timestamp.buffer.ms"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"5000"})}),e.jsx(n.td,{children:'Safety buffer subtracted from "now" before consuming. Floor for visibility delay.'})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.startup.delay.ms"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"10000"})}),e.jsx(n.td,{children:"Delay before a freshly opened region starts consuming."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.max.data.visibility.retries"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"10"})}),e.jsx(n.td,{children:"Retries when the data row is not yet visible to the consumer."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.consumer.retry.pause.ms"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"2000"})}),e.jsx(n.td,{children:"Sleep between data-visibility retries."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.mutation.serialize"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"false"})}),e.jsxs(n.td,{children:["Selects the consumer strategy (see ",e.jsx(n.a,{href:"#ec-indexes-how",children:"How it works"}),"). ",e.jsx(n.code,{children:"false"})," derives index mutations at consume time (lower write IO); ",e.jsx(n.code,{children:"true"})," serializes them at write time (no consume-side read)."]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.index.cdc.mutations.compress.enabled"})}),e.jsx(n.td,{style:{textAlign:"right"},children:e.jsx(n.code,{children:"false"})}),e.jsxs(n.td,{children:["Snappy-compress the serialized index mutation. Only relevant when ",e.jsx(n.code,{children:"phoenix.index.cdc.mutation.serialize=true"}),"."]})]})]})]}),`
`,e.jsxs(n.p,{children:["With defaults, expect end-to-end index visibility of ",e.jsx(n.strong,{children:"~5–10 seconds"}),"."]}),`
`,e.jsx(n.h2,{id:"ec-indexes-limitations",children:"Limitations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Global indexes only."})," ",e.jsx(n.code,{children:"LOCAL INDEX ... CONSISTENCY=EVENTUAL"})," is a no-op."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Designed and tested for non-transactional tables."}),` Combining EC indexes
with transactional tables is undefined in 5.3.1.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Salted data tables are not supported"}),` — the underlying change stream
Phoenix needs to maintain an EC index is incompatible with salting.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Data-table max lookback age must outlive the async lag."}),` Increase
`,e.jsx(n.code,{children:"phoenix.max.lookback.age.seconds"}),` on the data table if you tune the
consumer for low throughput or you expect long catch-up periods.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"ec-indexes-ops",children:"Operational notes"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`The first EC index on a table provisions the underlying change stream
automatically. Subsequent EC indexes on the same table reuse it.`}),`
`,e.jsx(n.li,{children:`Region splits and merges are handled transparently — no operator action is
required to keep the index up to date through topology changes.`}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ALTER INDEX ... CONSISTENCY=STRONG"}),` returns the index to synchronous
maintenance for `,e.jsx(n.strong,{children:"new"}),` writes. Any in-flight async work continues to flow
through until the queue drains.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"ec-indexes-see-also",children:"See also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/features/secondary-indexes",children:"Secondary Indexes"}),` — global, local,
covered, uncovered, and functional indexes.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/features/change-data-capture",children:"Change Data Capture"}),` — exposed
Phoenix-level change streams for application use.`]}),`
`]})]})}function l(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{a as _markdown,l as default,o as extractedReferences,r as frontmatter,d as structuredData,h as toc};
