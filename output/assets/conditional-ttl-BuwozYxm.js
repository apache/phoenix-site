import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`Conditional TTL lets you express row expiration as a **SQL boolean expression
evaluated against the row's own column values**, instead of a fixed time-since-write
number. A row is considered expired the moment the expression evaluates to \`TRUE\` for
that row. Available in Phoenix 5.3.0
([PHOENIX-7170](https://issues.apache.org/jira/browse/PHOENIX-7170)).

## When to use it

Conditional TTL fits whenever "expired" is an **application concept**, not just an
age. Some typical cases:

* *"Delete this row 30 days after \`STATUS\` becomes \`'CLOSED'\`."*
* *"Expire when \`RETAIN_UNTIL\` has passed."*
* *"Keep failed records for a week, successful ones for an hour."*
* *"Expire soft-deleted rows (\`is_deleted = TRUE\`) after a grace period."*

If retention is a flat duration that applies uniformly to all rows, use the regular
time-based \`TTL\` property. If different views over the same shared table need
different retention rules, look at [View TTL](/docs/features/view-ttl) — it composes
with conditional TTL.

## Defining a conditional TTL

Pass a SQL boolean expression as the \`TTL\` table property at \`CREATE TABLE\` (or
\`CREATE VIEW\`) time. The expression may reference any column of the table:

\`\`\`sql
CREATE TABLE orders (
    order_id     BIGINT NOT NULL PRIMARY KEY,
    status       VARCHAR,
    closed_at    DATE,
    retain_until DATE,
    payload      VARCHAR
)
TTL = 'status = ''CLOSED'' AND closed_at < CURRENT_DATE() - 30';
\`\`\`

Update or remove the expression later with \`ALTER TABLE\`:

\`\`\`sql
ALTER TABLE orders SET TTL = 'retain_until < CURRENT_DATE()';
ALTER TABLE orders SET TTL = NONE;
\`\`\`

What "expired" means in practice:

1. **Read-time:** any query touching the row evaluates the TTL expression server-side
   and skips the row if it returns \`TRUE\`. Rows become invisible the moment they
   match the predicate, regardless of physical state.
2. **Phoenix compaction:** expired rows are physically removed by Phoenix's
   compaction during HBase region compactions. There is no separate cleanup job —
   physical removal happens whenever the underlying regions compact.

## Strict vs Relaxed TTL

Conditional TTL has two **enforcement modes**, controlled by the \`IS_STRICT_TTL\`
table property. The default is \`true\` (strict).

### What each mode does

| Path                       | Strict (default)                                                                                                                                                                                                                            | Relaxed (\`IS_STRICT_TTL = false\`)                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Reads (region scanner)** | Server-side **masking** is enabled — rows for which the TTL expression is \`TRUE\` are filtered out of every result set, on every read path.                                                                                                  | Read-time masking is disabled. Expired rows can still surface through scans until compaction reclaims them. |
| **Atomic UPSERT / DELETE** | The row is **locked** and the TTL expression is **pre-evaluated** against the current row state. If the row is already expired, the mutation behaves as if the row does not exist (e.g. \`ON DUPLICATE KEY UPDATE\` falls through to insert). | The extra row lock and pre-check are skipped — atomic mutations run without consulting the TTL expression.  |

### Choosing a mode

Start with **strict** (the default). Switch to **relaxed** when relaxed mode's
cheaper write-path is the right trade-off: no extra lock or pre-check on atomic
operations makes it a reasonable choice for high-throughput workloads where eventual
visibility of expired rows is acceptable.

### Setting the mode

\`\`\`sql
-- Strict (default).
CREATE TABLE strict_orders (...)
TTL = 'status = ''CLOSED''',
IS_STRICT_TTL = true;

-- Relaxed: cheaper write path, eventual visibility of expired rows.
CREATE TABLE relaxed_orders (...)
TTL = 'status = ''CLOSED''',
IS_STRICT_TTL = false;
\`\`\`

Switch a table between modes later:

\`\`\`sql
ALTER TABLE orders SET IS_STRICT_TTL = false;
\`\`\`

## Limitations

* Conditional TTL requires the table to have a **single column family**.
* The TTL expression must be a valid Phoenix SQL boolean expression and may only
  reference columns of the same table — no joins, no subqueries.
* The classic time-based \`TTL = N\` (seconds) and conditional \`TTL = '<expr>'\` use the
  same property; what you pass in determines which mode you get. You can't have both
  at once.
`,r={title:"Conditional TTL",description:"Express row expiration as a SQL boolean expression evaluated against the row itself, with strict and relaxed enforcement modes."},h=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7170"},{href:"/docs/features/view-ttl"}],l={contents:[{heading:void 0,content:`Conditional TTL lets you express row expiration as a SQL boolean expression
evaluated against the row's own column values, instead of a fixed time-since-write
number. A row is considered expired the moment the expression evaluates to TRUE for
that row. Available in Phoenix 5.3.0
(PHOENIX-7170).`},{heading:"conditional-ttl-when",content:`Conditional TTL fits whenever "expired" is an application concept, not just an
age. Some typical cases:`},{heading:"conditional-ttl-when",content:`"Delete this row 30 days after STATUS becomes 'CLOSED'."`},{heading:"conditional-ttl-when",content:'"Expire when RETAIN_UNTIL has passed."'},{heading:"conditional-ttl-when",content:'"Keep failed records for a week, successful ones for an hour."'},{heading:"conditional-ttl-when",content:'"Expire soft-deleted rows (is_deleted = TRUE) after a grace period."'},{heading:"conditional-ttl-when",content:`If retention is a flat duration that applies uniformly to all rows, use the regular
time-based TTL property. If different views over the same shared table need
different retention rules, look at View TTL — it composes
with conditional TTL.`},{heading:"conditional-ttl-define",content:`Pass a SQL boolean expression as the TTL table property at CREATE TABLE (or
CREATE VIEW) time. The expression may reference any column of the table:`},{heading:"conditional-ttl-define",content:"Update or remove the expression later with ALTER TABLE:"},{heading:"conditional-ttl-define",content:'What "expired" means in practice:'},{heading:"conditional-ttl-define",content:`Read-time: any query touching the row evaluates the TTL expression server-side
and skips the row if it returns TRUE. Rows become invisible the moment they
match the predicate, regardless of physical state.`},{heading:"conditional-ttl-define",content:`Phoenix compaction: expired rows are physically removed by Phoenix's
compaction during HBase region compactions. There is no separate cleanup job —
physical removal happens whenever the underlying regions compact.`},{heading:"strict-vs-relaxed-ttl",content:`Conditional TTL has two enforcement modes, controlled by the IS_STRICT_TTL
table property. The default is true (strict).`},{heading:"what-each-mode-does",content:"Path"},{heading:"what-each-mode-does",content:"Strict (default)"},{heading:"what-each-mode-does",content:"Relaxed (IS_STRICT_TTL = false)"},{heading:"what-each-mode-does",content:"Reads (region scanner)"},{heading:"what-each-mode-does",content:"Server-side masking is enabled — rows for which the TTL expression is TRUE are filtered out of every result set, on every read path."},{heading:"what-each-mode-does",content:"Read-time masking is disabled. Expired rows can still surface through scans until compaction reclaims them."},{heading:"what-each-mode-does",content:"Atomic UPSERT / DELETE"},{heading:"what-each-mode-does",content:"The row is locked and the TTL expression is pre-evaluated against the current row state. If the row is already expired, the mutation behaves as if the row does not exist (e.g. ON DUPLICATE KEY UPDATE falls through to insert)."},{heading:"what-each-mode-does",content:"The extra row lock and pre-check are skipped — atomic mutations run without consulting the TTL expression."},{heading:"choosing-a-mode",content:`Start with strict (the default). Switch to relaxed when relaxed mode's
cheaper write-path is the right trade-off: no extra lock or pre-check on atomic
operations makes it a reasonable choice for high-throughput workloads where eventual
visibility of expired rows is acceptable.`},{heading:"setting-the-mode",content:"Switch a table between modes later:"},{heading:"conditional-ttl-limitations",content:"Conditional TTL requires the table to have a single column family."},{heading:"conditional-ttl-limitations",content:`The TTL expression must be a valid Phoenix SQL boolean expression and may only
reference columns of the same table — no joins, no subqueries.`},{heading:"conditional-ttl-limitations",content:`The classic time-based TTL = N (seconds) and conditional TTL = '<expr>' use the
same property; what you pass in determines which mode you get. You can't have both
at once.`}],headings:[{id:"conditional-ttl-when",content:"When to use it"},{id:"conditional-ttl-define",content:"Defining a conditional TTL"},{id:"strict-vs-relaxed-ttl",content:"Strict vs Relaxed TTL"},{id:"what-each-mode-does",content:"What each mode does"},{id:"choosing-a-mode",content:"Choosing a mode"},{id:"setting-the-mode",content:"Setting the mode"},{id:"conditional-ttl-limitations",content:"Limitations"}]};const o=[{depth:2,url:"#conditional-ttl-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#conditional-ttl-define",title:e.jsx(e.Fragment,{children:"Defining a conditional TTL"})},{depth:2,url:"#strict-vs-relaxed-ttl",title:e.jsx(e.Fragment,{children:"Strict vs Relaxed TTL"})},{depth:3,url:"#what-each-mode-does",title:e.jsx(e.Fragment,{children:"What each mode does"})},{depth:3,url:"#choosing-a-mode",title:e.jsx(e.Fragment,{children:"Choosing a mode"})},{depth:3,url:"#setting-the-mode",title:e.jsx(e.Fragment,{children:"Setting the mode"})},{depth:2,url:"#conditional-ttl-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function n(s){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Conditional TTL lets you express row expiration as a ",e.jsx(i.strong,{children:`SQL boolean expression
evaluated against the row's own column values`}),`, instead of a fixed time-since-write
number. A row is considered expired the moment the expression evaluates to `,e.jsx(i.code,{children:"TRUE"}),` for
that row. Available in Phoenix 5.3.0
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7170",children:"PHOENIX-7170"}),")."]}),`
`,e.jsx(i.h2,{id:"conditional-ttl-when",children:"When to use it"}),`
`,e.jsxs(i.p,{children:['Conditional TTL fits whenever "expired" is an ',e.jsx(i.strong,{children:"application concept"}),`, not just an
age. Some typical cases:`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsxs(i.em,{children:['"Delete this row 30 days after ',e.jsx(i.code,{children:"STATUS"})," becomes ",e.jsx(i.code,{children:"'CLOSED'"}),'."']})}),`
`,e.jsx(i.li,{children:e.jsxs(i.em,{children:['"Expire when ',e.jsx(i.code,{children:"RETAIN_UNTIL"}),' has passed."']})}),`
`,e.jsx(i.li,{children:e.jsx(i.em,{children:'"Keep failed records for a week, successful ones for an hour."'})}),`
`,e.jsx(i.li,{children:e.jsxs(i.em,{children:['"Expire soft-deleted rows (',e.jsx(i.code,{children:"is_deleted = TRUE"}),') after a grace period."']})}),`
`]}),`
`,e.jsxs(i.p,{children:[`If retention is a flat duration that applies uniformly to all rows, use the regular
time-based `,e.jsx(i.code,{children:"TTL"}),` property. If different views over the same shared table need
different retention rules, look at `,e.jsx(i.a,{href:"/docs/features/view-ttl",children:"View TTL"}),` — it composes
with conditional TTL.`]}),`
`,e.jsx(i.h2,{id:"conditional-ttl-define",children:"Defining a conditional TTL"}),`
`,e.jsxs(i.p,{children:["Pass a SQL boolean expression as the ",e.jsx(i.code,{children:"TTL"})," table property at ",e.jsx(i.code,{children:"CREATE TABLE"}),` (or
`,e.jsx(i.code,{children:"CREATE VIEW"}),") time. The expression may reference any column of the table:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" orders"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    order_id     "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    status"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"       VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    closed_at    "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DATE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    retain_until "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DATE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    payload      "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'status = ''CLOSED'' AND closed_at < CURRENT_DATE() - 30'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:["Update or remove the expression later with ",e.jsx(i.code,{children:"ALTER TABLE"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'retain_until < CURRENT_DATE()'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NONE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:'What "expired" means in practice:'}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Read-time:"}),` any query touching the row evaluates the TTL expression server-side
and skips the row if it returns `,e.jsx(i.code,{children:"TRUE"}),`. Rows become invisible the moment they
match the predicate, regardless of physical state.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Phoenix compaction:"}),` expired rows are physically removed by Phoenix's
compaction during HBase region compactions. There is no separate cleanup job —
physical removal happens whenever the underlying regions compact.`]}),`
`]}),`
`,e.jsx(i.h2,{id:"strict-vs-relaxed-ttl",children:"Strict vs Relaxed TTL"}),`
`,e.jsxs(i.p,{children:["Conditional TTL has two ",e.jsx(i.strong,{children:"enforcement modes"}),", controlled by the ",e.jsx(i.code,{children:"IS_STRICT_TTL"}),`
table property. The default is `,e.jsx(i.code,{children:"true"})," (strict)."]}),`
`,e.jsx(i.h3,{id:"what-each-mode-does",children:"What each mode does"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Path"}),e.jsx(i.th,{children:"Strict (default)"}),e.jsxs(i.th,{children:["Relaxed (",e.jsx(i.code,{children:"IS_STRICT_TTL = false"}),")"]})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Reads (region scanner)"})}),e.jsxs(i.td,{children:["Server-side ",e.jsx(i.strong,{children:"masking"})," is enabled — rows for which the TTL expression is ",e.jsx(i.code,{children:"TRUE"})," are filtered out of every result set, on every read path."]}),e.jsx(i.td,{children:"Read-time masking is disabled. Expired rows can still surface through scans until compaction reclaims them."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Atomic UPSERT / DELETE"})}),e.jsxs(i.td,{children:["The row is ",e.jsx(i.strong,{children:"locked"})," and the TTL expression is ",e.jsx(i.strong,{children:"pre-evaluated"})," against the current row state. If the row is already expired, the mutation behaves as if the row does not exist (e.g. ",e.jsx(i.code,{children:"ON DUPLICATE KEY UPDATE"})," falls through to insert)."]}),e.jsx(i.td,{children:"The extra row lock and pre-check are skipped — atomic mutations run without consulting the TTL expression."})]})]})]}),`
`,e.jsx(i.h3,{id:"choosing-a-mode",children:"Choosing a mode"}),`
`,e.jsxs(i.p,{children:["Start with ",e.jsx(i.strong,{children:"strict"})," (the default). Switch to ",e.jsx(i.strong,{children:"relaxed"}),` when relaxed mode's
cheaper write-path is the right trade-off: no extra lock or pre-check on atomic
operations makes it a reasonable choice for high-throughput workloads where eventual
visibility of expired rows is acceptable.`]}),`
`,e.jsx(i.h3,{id:"setting-the-mode",children:"Setting the mode"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Strict (default)."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" strict_orders"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (...)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'status = ''CLOSED'''"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"IS_STRICT_TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" true;"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Relaxed: cheaper write path, eventual visibility of expired rows."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" relaxed_orders"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (...)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'status = ''CLOSED'''"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"IS_STRICT_TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" false;"})]})]})})}),`
`,e.jsx(i.p,{children:"Switch a table between modes later:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IS_STRICT_TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" false;"})]})})})}),`
`,e.jsx(i.h2,{id:"conditional-ttl-limitations",children:"Limitations"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Conditional TTL requires the table to have a ",e.jsx(i.strong,{children:"single column family"}),"."]}),`
`,e.jsx(i.li,{children:`The TTL expression must be a valid Phoenix SQL boolean expression and may only
reference columns of the same table — no joins, no subqueries.`}),`
`,e.jsxs(i.li,{children:["The classic time-based ",e.jsx(i.code,{children:"TTL = N"})," (seconds) and conditional ",e.jsx(i.code,{children:"TTL = '<expr>'"}),` use the
same property; what you pass in determines which mode you get. You can't have both
at once.`]}),`
`]})]})}function d(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{a as _markdown,d as default,h as extractedReferences,r as frontmatter,l as structuredData,o as toc};
