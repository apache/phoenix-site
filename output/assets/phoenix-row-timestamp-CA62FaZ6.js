import{j as e}from"./jsx-runtime-CUISpl0r.js";let a=`\`PHOENIX_ROW_TIMESTAMP()\` is a built-in SQL function that returns the **timestamp
of the row's empty column**, which Phoenix updates automatically on every write.
It's effectively the row's **last-modified time**, available on any Phoenix table
without you having to declare or manage a timestamp column yourself. The return
type is \`DATE\`.

It can be used in three places, and the third one is what makes it especially
powerful:

1. As a projection in \`SELECT\`.
2. As a predicate in \`WHERE\` (and \`JOIN\`) clauses.
3. As the indexed expression in a [functional index](/docs/features/secondary-indexes#functional-indexes), which makes time-bounded reads fast even when the table isn't ordered by time.

## Reading the row timestamp

Project it like any other column:

\`\`\`sql
-- Last-modified time of every row.
SELECT PHOENIX_ROW_TIMESTAMP(), id, payload FROM events;

-- Combine with regular row data.
SELECT id,
       PHOENIX_ROW_TIMESTAMP() AS modified_at,
       payload
FROM events
WHERE region = 'us-west-2';
\`\`\`

The function takes no arguments and is evaluated server-side from the empty cell
that Phoenix already maintains for every row.

## In WHERE predicates

Use it to bound queries by mutation time, including incremental "what changed
since" patterns:

\`\`\`sql
-- Rows modified in the last hour.
SELECT * FROM events
WHERE PHOENIX_ROW_TIMESTAMP() > CURRENT_DATE() - 1.0 / 24;

-- Pull a window for an incremental consumer.
SELECT id, payload
FROM events
WHERE PHOENIX_ROW_TIMESTAMP() >= ?
  AND PHOENIX_ROW_TIMESTAMP() <  ?
ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
\`\`\`

Without an index, these predicates require a full scan of the table. The next
section fixes that.

## Indexing on PHOENIX\\_ROW\\_TIMESTAMP()

Create a [functional index](/docs/features/secondary-indexes#functional-indexes)
on the function to make time-bounded reads fast. Phoenix can then seek directly
on the indexed timestamp instead of scanning the data table:

\`\`\`sql
CREATE INDEX events_by_modified
    ON events (PHOENIX_ROW_TIMESTAMP())
    INCLUDE (payload);

-- Phoenix uses the index for this query.
SELECT id, payload
FROM events
WHERE PHOENIX_ROW_TIMESTAMP() >= ?
  AND PHOENIX_ROW_TIMESTAMP() <  ?
ORDER BY PHOENIX_ROW_TIMESTAMP() ASC;
\`\`\`

This is the typical recipe for "scan rows changed in the last N minutes" type
queries on a table whose primary key isn't time-ordered. Pair with
[uncovered indexes](/docs/features/secondary-indexes#uncovered-indexes) when you
don't want to duplicate payload columns into the index.

If your downstream needs a **continuous, ordered stream** of changes rather than
periodic time-bounded scans — including the actual mutation deltas — reach for
[Change Data Capture](/docs/features/change-data-capture) instead. The functional
index pattern here is best suited to ad-hoc time-window reads from the same
client that issues regular SQL queries.

## Relationship to ROW\\_TIMESTAMP column

Two related concepts share the word "timestamp" — they are not the same:

| Feature                                                       | Direction | What it does                                                                                     |
| ------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| [\`ROW_TIMESTAMP\` column](/docs/features/row-timestamp-column) | Write     | Designate a primary-key column whose value is *written into* the underlying HBase row timestamp. |
| \`PHOENIX_ROW_TIMESTAMP()\` function                            | Read      | Return the underlying HBase row timestamp Phoenix already maintains on every row's empty cell.   |

\`PHOENIX_ROW_TIMESTAMP()\` works on **any** Phoenix table, regardless of whether
you've declared a \`ROW_TIMESTAMP\` column. If you have declared one, both
mechanisms read/write the same underlying timestamp, so \`PHOENIX_ROW_TIMESTAMP()\`
returns the value of the \`ROW_TIMESTAMP\` column for that row.
`,h={title:"PHOENIX_ROW_TIMESTAMP()",description:"Read the per-row last-modified timestamp Phoenix maintains automatically — usable in projections, predicates, and indexes for fast time-bounded reads."},r=[{href:"/docs/features/secondary-indexes#functional-indexes"},{href:"/docs/features/secondary-indexes#functional-indexes"},{href:"/docs/features/secondary-indexes#uncovered-indexes"},{href:"/docs/features/change-data-capture"},{href:"/docs/features/row-timestamp-column"}],d={contents:[{heading:void 0,content:"`PHOENIX_ROW_TIMESTAMP()` is a built-in SQL function that returns the **timestamp\nof the row's empty column**, which Phoenix updates automatically on every write.\nIt's effectively the row's **last-modified time**, available on any Phoenix table\nwithout you having to declare or manage a timestamp column yourself. The return\ntype is `DATE`."},{heading:void 0,content:`It can be used in three places, and the third one is what makes it especially
powerful:`},{heading:void 0,content:"As a projection in `SELECT`."},{heading:void 0,content:"As a predicate in `WHERE` (and `JOIN`) clauses."},{heading:void 0,content:"As the indexed expression in a functional index, which makes time-bounded reads fast even when the table isn't ordered by time."},{heading:"phoenix-row-timestamp-read",content:"Project it like any other column:"},{heading:"phoenix-row-timestamp-read",content:`The function takes no arguments and is evaluated server-side from the empty cell
that Phoenix already maintains for every row.`},{heading:"phoenix-row-timestamp-where",content:`Use it to bound queries by mutation time, including incremental "what changed
since" patterns:`},{heading:"phoenix-row-timestamp-where",content:`Without an index, these predicates require a full scan of the table. The next
section fixes that.`},{heading:"phoenix-row-timestamp-index",content:`Create a functional index
on the function to make time-bounded reads fast. Phoenix can then seek directly
on the indexed timestamp instead of scanning the data table:`},{heading:"phoenix-row-timestamp-index",content:`This is the typical recipe for "scan rows changed in the last N minutes" type
queries on a table whose primary key isn't time-ordered. Pair with
uncovered indexes when you
don't want to duplicate payload columns into the index.`},{heading:"phoenix-row-timestamp-index",content:`If your downstream needs a **continuous, ordered stream** of changes rather than
periodic time-bounded scans — including the actual mutation deltas — reach for
Change Data Capture instead. The functional
index pattern here is best suited to ad-hoc time-window reads from the same
client that issues regular SQL queries.`},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:'Two related concepts share the word "timestamp" — they are not the same:'},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Feature"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Direction"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"What it does"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"`ROW_TIMESTAMP` column"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Write"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Designate a primary-key column whose value is *written into* the underlying HBase row timestamp."},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"`PHOENIX_ROW_TIMESTAMP()` function"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Read"},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"Return the underlying HBase row timestamp Phoenix already maintains on every row's empty cell."},{heading:"phoenix-row-timestamp-vs-row-timestamp",content:"`PHOENIX_ROW_TIMESTAMP()` works on **any** Phoenix table, regardless of whether\nyou've declared a `ROW_TIMESTAMP` column. If you have declared one, both\nmechanisms read/write the same underlying timestamp, so `PHOENIX_ROW_TIMESTAMP()`\nreturns the value of the `ROW_TIMESTAMP` column for that row."}],headings:[{id:"phoenix-row-timestamp-read",content:"Reading the row timestamp"},{id:"phoenix-row-timestamp-where",content:"In WHERE predicates"},{id:"phoenix-row-timestamp-index",content:"Indexing on PHOENIX_ROW_TIMESTAMP()"},{id:"phoenix-row-timestamp-vs-row-timestamp",content:"Relationship to ROW_TIMESTAMP column"}]},l=[{depth:2,url:"#phoenix-row-timestamp-read",title:e.jsx(e.Fragment,{children:"Reading the row timestamp"})},{depth:2,url:"#phoenix-row-timestamp-where",title:e.jsx(e.Fragment,{children:"In WHERE predicates"})},{depth:2,url:"#phoenix-row-timestamp-index",title:e.jsx(e.Fragment,{children:"Indexing on PHOENIX_ROW_TIMESTAMP()"})},{depth:2,url:"#phoenix-row-timestamp-vs-row-timestamp",title:e.jsx(e.Fragment,{children:"Relationship to ROW_TIMESTAMP column"})}];function s(n){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:[e.jsx(i.code,{children:"PHOENIX_ROW_TIMESTAMP()"})," is a built-in SQL function that returns the ",e.jsx(i.strong,{children:`timestamp
of the row's empty column`}),`, which Phoenix updates automatically on every write.
It's effectively the row's `,e.jsx(i.strong,{children:"last-modified time"}),`, available on any Phoenix table
without you having to declare or manage a timestamp column yourself. The return
type is `,e.jsx(i.code,{children:"DATE"}),"."]}),`
`,e.jsx(i.p,{children:`It can be used in three places, and the third one is what makes it especially
powerful:`}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["As a projection in ",e.jsx(i.code,{children:"SELECT"}),"."]}),`
`,e.jsxs(i.li,{children:["As a predicate in ",e.jsx(i.code,{children:"WHERE"})," (and ",e.jsx(i.code,{children:"JOIN"}),") clauses."]}),`
`,e.jsxs(i.li,{children:["As the indexed expression in a ",e.jsx(i.a,{href:"/docs/features/secondary-indexes#functional-indexes",children:"functional index"}),", which makes time-bounded reads fast even when the table isn't ordered by time."]}),`
`]}),`
`,e.jsx(i.h2,{id:"phoenix-row-timestamp-read",children:"Reading the row timestamp"}),`
`,e.jsx(i.p,{children:"Project it like any other column:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Last-modified time of every row."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP(), id, payload "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events;"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Combine with regular row data."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" modified_at,"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       payload"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" region "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'us-west-2'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:`The function takes no arguments and is evaluated server-side from the empty cell
that Phoenix already maintains for every row.`}),`
`,e.jsx(i.h2,{id:"phoenix-row-timestamp-where",children:"In WHERE predicates"}),`
`,e.jsx(i.p,{children:`Use it to bound queries by mutation time, including incremental "what changed
since" patterns:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Rows modified in the last hour."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" *"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" CURRENT_DATE() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" /"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 24"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Pull a window for an incremental consumer."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id, payload"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:`Without an index, these predicates require a full scan of the table. The next
section fixes that.`}),`
`,e.jsx(i.h2,{id:"phoenix-row-timestamp-index",children:"Indexing on PHOENIX_ROW_TIMESTAMP()"}),`
`,e.jsxs(i.p,{children:["Create a ",e.jsx(i.a,{href:"/docs/features/secondary-indexes#functional-indexes",children:"functional index"}),`
on the function to make time-bounded reads fast. Phoenix can then seek directly
on the indexed timestamp instead of scanning the data table:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" events_by_modified"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events (PHOENIX_ROW_TIMESTAMP())"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    INCLUDE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (payload);"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Phoenix uses the index for this query."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id, payload"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PHOENIX_ROW_TIMESTAMP() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ASC"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:[`This is the typical recipe for "scan rows changed in the last N minutes" type
queries on a table whose primary key isn't time-ordered. Pair with
`,e.jsx(i.a,{href:"/docs/features/secondary-indexes#uncovered-indexes",children:"uncovered indexes"}),` when you
don't want to duplicate payload columns into the index.`]}),`
`,e.jsxs(i.p,{children:["If your downstream needs a ",e.jsx(i.strong,{children:"continuous, ordered stream"}),` of changes rather than
periodic time-bounded scans — including the actual mutation deltas — reach for
`,e.jsx(i.a,{href:"/docs/features/change-data-capture",children:"Change Data Capture"}),` instead. The functional
index pattern here is best suited to ad-hoc time-window reads from the same
client that issues regular SQL queries.`]}),`
`,e.jsx(i.h2,{id:"phoenix-row-timestamp-vs-row-timestamp",children:"Relationship to ROW_TIMESTAMP column"}),`
`,e.jsx(i.p,{children:'Two related concepts share the word "timestamp" — they are not the same:'}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Feature"}),e.jsx(i.th,{children:"Direction"}),e.jsx(i.th,{children:"What it does"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsxs(i.a,{href:"/docs/features/row-timestamp-column",children:[e.jsx(i.code,{children:"ROW_TIMESTAMP"})," column"]})}),e.jsx(i.td,{children:"Write"}),e.jsxs(i.td,{children:["Designate a primary-key column whose value is ",e.jsx(i.em,{children:"written into"})," the underlying HBase row timestamp."]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"PHOENIX_ROW_TIMESTAMP()"})," function"]}),e.jsx(i.td,{children:"Read"}),e.jsx(i.td,{children:"Return the underlying HBase row timestamp Phoenix already maintains on every row's empty cell."})]})]})]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"PHOENIX_ROW_TIMESTAMP()"})," works on ",e.jsx(i.strong,{children:"any"}),` Phoenix table, regardless of whether
you've declared a `,e.jsx(i.code,{children:"ROW_TIMESTAMP"}),` column. If you have declared one, both
mechanisms read/write the same underlying timestamp, so `,e.jsx(i.code,{children:"PHOENIX_ROW_TIMESTAMP()"}),`
returns the value of the `,e.jsx(i.code,{children:"ROW_TIMESTAMP"})," column for that row."]})]})}function o(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,o as default,r as extractedReferences,h as frontmatter,d as structuredData,l as toc};
