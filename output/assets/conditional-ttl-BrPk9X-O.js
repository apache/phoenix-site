import{j as e}from"./jsx-runtime-CUISpl0r.js";let a=`Conditional TTL lets you express row expiration as a **SQL boolean expression
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

## Effect on the write path

\`IS_STRICT_TTL\` is a table property that applies to any kind of TTL — see
[Strict vs Relaxed TTL](/docs/features/ttl#strict-vs-relaxed-ttl) for the full
description.

The conditional-TTL-specific cost is in the **write path**: with strict (the
default), every mutation reads the current row state on the server to evaluate the
TTL expression, which adds latency. With relaxed (\`IS_STRICT_TTL = false\`), that
extra row read is skipped — at the cost of expired rows remaining visible to
readers until major compaction physically removes them.

## Limitations

* Conditional TTL requires the table to have a **single column family**.
* The TTL expression must be a valid Phoenix SQL boolean expression and may only
  reference columns of the same table — no joins, no subqueries.
* The classic time-based \`TTL = N\` (seconds) and conditional \`TTL = '<expr>'\` use the
  same property; what you pass in determines which mode you get. You can't have both
  at once.
`,r={title:"Conditional TTL",description:"Express row expiration as a SQL boolean expression evaluated against the row itself."},o=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7170"},{href:"/docs/features/view-ttl"},{href:"/docs/features/ttl#strict-vs-relaxed-ttl"}],l={contents:[{heading:void 0,content:`Conditional TTL lets you express row expiration as a **SQL boolean expression
evaluated against the row's own column values**, instead of a fixed time-since-write
number. A row is considered expired the moment the expression evaluates to \`TRUE\` for
that row. Available in Phoenix 5.3.0
(PHOENIX-7170).`},{heading:"conditional-ttl-when",content:`Conditional TTL fits whenever "expired" is an **application concept**, not just an
age. Some typical cases:`},{heading:"conditional-ttl-when",content:"*\"Delete this row 30 days after `STATUS` becomes `'CLOSED'`.\"*"},{heading:"conditional-ttl-when",content:'*"Expire when `RETAIN_UNTIL` has passed."*'},{heading:"conditional-ttl-when",content:'*"Keep failed records for a week, successful ones for an hour."*'},{heading:"conditional-ttl-when",content:'*"Expire soft-deleted rows (`is_deleted = TRUE`) after a grace period."*'},{heading:"conditional-ttl-when",content:`If retention is a flat duration that applies uniformly to all rows, use the regular
time-based \`TTL\` property. If different views over the same shared table need
different retention rules, look at View TTL — it composes
with conditional TTL.`},{heading:"conditional-ttl-define",content:"Pass a SQL boolean expression as the `TTL` table property at `CREATE TABLE` (or\n`CREATE VIEW`) time. The expression may reference any column of the table:"},{heading:"conditional-ttl-define",content:"Update or remove the expression later with `ALTER TABLE`:"},{heading:"conditional-ttl-define",content:'What "expired" means in practice:'},{heading:"conditional-ttl-define",content:"**Read-time:** any query touching the row evaluates the TTL expression server-side\nand skips the row if it returns `TRUE`. Rows become invisible the moment they\nmatch the predicate, regardless of physical state."},{heading:"conditional-ttl-define",content:`**Phoenix compaction:** expired rows are physically removed by Phoenix's
compaction during HBase region compactions. There is no separate cleanup job —
physical removal happens whenever the underlying regions compact.`},{heading:"conditional-ttl-write-path",content:"`IS_STRICT_TTL` is a table property that applies to any kind of TTL — see\nStrict vs Relaxed TTL for the full\ndescription."},{heading:"conditional-ttl-write-path",content:`The conditional-TTL-specific cost is in the **write path**: with strict (the
default), every mutation reads the current row state on the server to evaluate the
TTL expression, which adds latency. With relaxed (\`IS_STRICT_TTL = false\`), that
extra row read is skipped — at the cost of expired rows remaining visible to
readers until major compaction physically removes them.`},{heading:"conditional-ttl-limitations",content:"Conditional TTL requires the table to have a **single column family**."},{heading:"conditional-ttl-limitations",content:`The TTL expression must be a valid Phoenix SQL boolean expression and may only
reference columns of the same table — no joins, no subqueries.`},{heading:"conditional-ttl-limitations",content:"The classic time-based `TTL = N` (seconds) and conditional `TTL = '<expr>'` use the\nsame property; what you pass in determines which mode you get. You can't have both\nat once."}],headings:[{id:"conditional-ttl-when",content:"When to use it"},{id:"conditional-ttl-define",content:"Defining a conditional TTL"},{id:"conditional-ttl-write-path",content:"Effect on the write path"},{id:"conditional-ttl-limitations",content:"Limitations"}]},h=[{depth:2,url:"#conditional-ttl-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#conditional-ttl-define",title:e.jsx(e.Fragment,{children:"Defining a conditional TTL"})},{depth:2,url:"#conditional-ttl-write-path",title:e.jsx(e.Fragment,{children:"Effect on the write path"})},{depth:2,url:"#conditional-ttl-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function t(n){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Conditional TTL lets you express row expiration as a ",e.jsx(i.strong,{children:`SQL boolean expression
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
`,e.jsx(i.h2,{id:"conditional-ttl-write-path",children:"Effect on the write path"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"IS_STRICT_TTL"}),` is a table property that applies to any kind of TTL — see
`,e.jsx(i.a,{href:"/docs/features/ttl#strict-vs-relaxed-ttl",children:"Strict vs Relaxed TTL"}),` for the full
description.`]}),`
`,e.jsxs(i.p,{children:["The conditional-TTL-specific cost is in the ",e.jsx(i.strong,{children:"write path"}),`: with strict (the
default), every mutation reads the current row state on the server to evaluate the
TTL expression, which adds latency. With relaxed (`,e.jsx(i.code,{children:"IS_STRICT_TTL = false"}),`), that
extra row read is skipped — at the cost of expired rows remaining visible to
readers until major compaction physically removes them.`]}),`
`,e.jsx(i.h2,{id:"conditional-ttl-limitations",children:"Limitations"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Conditional TTL requires the table to have a ",e.jsx(i.strong,{children:"single column family"}),"."]}),`
`,e.jsx(i.li,{children:`The TTL expression must be a valid Phoenix SQL boolean expression and may only
reference columns of the same table — no joins, no subqueries.`}),`
`,e.jsxs(i.li,{children:["The classic time-based ",e.jsx(i.code,{children:"TTL = N"})," (seconds) and conditional ",e.jsx(i.code,{children:"TTL = '<expr>'"}),` use the
same property; what you pass in determines which mode you get. You can't have both
at once.`]}),`
`]})]})}function d(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{a as _markdown,d as default,o as extractedReferences,r as frontmatter,l as structuredData,h as toc};
