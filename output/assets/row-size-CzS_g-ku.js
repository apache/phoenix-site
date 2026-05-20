import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`\`ROW_SIZE()\` and \`RAW_ROW_SIZE()\` return the HBase byte footprint of the row
currently being scanned. Both are zero-argument scalar functions that return
\`UNSIGNED_LONG\`. Available in Phoenix 5.3.1
([PHOENIX-7705](https://issues.apache.org/jira/browse/PHOENIX-7705)).

|             | \`ROW_SIZE()\`                        | \`RAW_ROW_SIZE()\`                                  |
| ----------- | ----------------------------------- | ------------------------------------------------- |
| Arguments   | none                                | none                                              |
| Return type | \`UNSIGNED_LONG\`                     | \`UNSIGNED_LONG\`                                   |
| Counts      | latest visible version of each cell | all retained cell versions **and** delete markers |

Each cell's contribution is its full HBase footprint — row key, column
family, qualifier, timestamp, type byte, tags, and value — so the result is
**not** equal to the sum of user-visible column value lengths.

## Usage

\`ROW_SIZE()\` is only valid **as an argument to an aggregate** in the \`SELECT\`
list, or inside a \`WHERE\` clause. A bare projection (\`SELECT ROW_SIZE() FROM t\`)
is rejected at compile time.

### Total table footprint

\`\`\`sql
SELECT SUM(ROW_SIZE()) FROM my_table;
\`\`\`

### Per-row size

Group by the primary key so each group is a single row:

\`\`\`sql
SELECT SUM(ROW_SIZE()) FROM my_table GROUP BY id;
\`\`\`

### Distribution

\`\`\`sql
SELECT AVG(ROW_SIZE()), MIN(ROW_SIZE()), MAX(ROW_SIZE()) FROM my_table;
\`\`\`

### Find rows whose footprint exceeds a threshold

\`ROW_SIZE()\` is also valid in \`WHERE\`:

\`\`\`sql
SELECT COUNT(1)
FROM my_table
WHERE ROW_SIZE() > 1024 AND status = 'ACTIVE';
\`\`\`

### Including delete markers and old versions

\`\`\`sql
SELECT organization_id, SUM(RAW_ROW_SIZE())
FROM my_table
GROUP BY organization_id;
\`\`\`

\`RAW_ROW_SIZE()\` counts every retained cell version and the bytes of any
delete-family or delete-column tombstones — useful for measuring the
post-compaction-debt footprint of a row.

## Limitations and caveats

* **Wrap in an aggregate.** \`SELECT ROW_SIZE() FROM t\` is rejected. Use
  \`SUM(ROW_SIZE())\` (with \`GROUP BY <pk>\` for per-row values).
* **Forces a full row read.** A query using either function reads more bytes
  per row than the same query without it, because the scan can no longer
  use empty-column / key-only / encoded-qualifier optimizations. Reach for
  these functions for diagnostics, not hot-path scans.
* **\`RAW_ROW_SIZE()\` reads all versions and tombstones.** Both the byte count
  and the row count it produces will exceed \`ROW_SIZE()\` on the same data.
* **Cell footprint, not user-data size.** Adding a column generally
  increases \`ROW_SIZE()\` by more than that column's value byte length.
* **Measures whatever physical row the planner scans.** If the optimizer
  chooses a secondary index, \`ROW_SIZE()\` will measure the index row, not
  the data row. Pin the plan with a hint (e.g. \`/*+ NO_INDEX */\`) if you
  need a specific physical answer.

## See also

* [Metrics](/docs/features/metrics) — runtime measurements on the client
  side (scan bytes, mutation bytes, scan latency, etc.).
* [Statistics Collection](/docs/features/statistics-collection) — aggregate
  estimates without scanning every row.
`,a={title:"ROW_SIZE() and RAW_ROW_SIZE()",description:"Built-in SQL functions that return the on-the-wire HBase byte footprint of a row — useful for hot-row diagnosis, capacity planning, and finding outliers directly from SQL."},l=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7705"},{href:"/docs/features/metrics"},{href:"/docs/features/statistics-collection"}],h={contents:[{heading:void 0,content:`ROW_SIZE() and RAW_ROW_SIZE() return the HBase byte footprint of the row
currently being scanned. Both are zero-argument scalar functions that return
UNSIGNED_LONG. Available in Phoenix 5.3.1
(PHOENIX-7705).`},{heading:void 0,content:"ROW_SIZE()"},{heading:void 0,content:"RAW_ROW_SIZE()"},{heading:void 0,content:"Arguments"},{heading:void 0,content:"none"},{heading:void 0,content:"none"},{heading:void 0,content:"Return type"},{heading:void 0,content:"UNSIGNED_LONG"},{heading:void 0,content:"UNSIGNED_LONG"},{heading:void 0,content:"Counts"},{heading:void 0,content:"latest visible version of each cell"},{heading:void 0,content:"all retained cell versions and delete markers"},{heading:void 0,content:`Each cell's contribution is its full HBase footprint — row key, column
family, qualifier, timestamp, type byte, tags, and value — so the result is
not equal to the sum of user-visible column value lengths.`},{heading:"row-size-usage",content:`ROW_SIZE() is only valid as an argument to an aggregate in the SELECT
list, or inside a WHERE clause. A bare projection (SELECT ROW_SIZE() FROM t)
is rejected at compile time.`},{heading:"per-row-size",content:"Group by the primary key so each group is a single row:"},{heading:"find-rows-whose-footprint-exceeds-a-threshold",content:"ROW_SIZE() is also valid in WHERE:"},{heading:"including-delete-markers-and-old-versions",content:`RAW_ROW_SIZE() counts every retained cell version and the bytes of any
delete-family or delete-column tombstones — useful for measuring the
post-compaction-debt footprint of a row.`},{heading:"row-size-caveats",content:`Wrap in an aggregate. SELECT ROW_SIZE() FROM t is rejected. Use
SUM(ROW_SIZE()) (with GROUP BY <pk> for per-row values).`},{heading:"row-size-caveats",content:`Forces a full row read. A query using either function reads more bytes
per row than the same query without it, because the scan can no longer
use empty-column / key-only / encoded-qualifier optimizations. Reach for
these functions for diagnostics, not hot-path scans.`},{heading:"row-size-caveats",content:`RAW_ROW_SIZE() reads all versions and tombstones. Both the byte count
and the row count it produces will exceed ROW_SIZE() on the same data.`},{heading:"row-size-caveats",content:`Cell footprint, not user-data size. Adding a column generally
increases ROW_SIZE() by more than that column's value byte length.`},{heading:"row-size-caveats",content:`Measures whatever physical row the planner scans. If the optimizer
chooses a secondary index, ROW_SIZE() will measure the index row, not
the data row. Pin the plan with a hint (e.g. /*+ NO_INDEX */) if you
need a specific physical answer.`},{heading:"row-size-see-also",content:`Metrics — runtime measurements on the client
side (scan bytes, mutation bytes, scan latency, etc.).`},{heading:"row-size-see-also",content:`Statistics Collection — aggregate
estimates without scanning every row.`}],headings:[{id:"row-size-usage",content:"Usage"},{id:"total-table-footprint",content:"Total table footprint"},{id:"per-row-size",content:"Per-row size"},{id:"distribution",content:"Distribution"},{id:"find-rows-whose-footprint-exceeds-a-threshold",content:"Find rows whose footprint exceeds a threshold"},{id:"including-delete-markers-and-old-versions",content:"Including delete markers and old versions"},{id:"row-size-caveats",content:"Limitations and caveats"},{id:"row-size-see-also",content:"See also"}]};const o=[{depth:2,url:"#row-size-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#total-table-footprint",title:e.jsx(e.Fragment,{children:"Total table footprint"})},{depth:3,url:"#per-row-size",title:e.jsx(e.Fragment,{children:"Per-row size"})},{depth:3,url:"#distribution",title:e.jsx(e.Fragment,{children:"Distribution"})},{depth:3,url:"#find-rows-whose-footprint-exceeds-a-threshold",title:e.jsx(e.Fragment,{children:"Find rows whose footprint exceeds a threshold"})},{depth:3,url:"#including-delete-markers-and-old-versions",title:e.jsx(e.Fragment,{children:"Including delete markers and old versions"})},{depth:2,url:"#row-size-caveats",title:e.jsx(e.Fragment,{children:"Limitations and caveats"})},{depth:2,url:"#row-size-see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(n){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:[e.jsx(i.code,{children:"ROW_SIZE()"})," and ",e.jsx(i.code,{children:"RAW_ROW_SIZE()"}),` return the HBase byte footprint of the row
currently being scanned. Both are zero-argument scalar functions that return
`,e.jsx(i.code,{children:"UNSIGNED_LONG"}),`. Available in Phoenix 5.3.1
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7705",children:"PHOENIX-7705"}),")."]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{}),e.jsx(i.th,{children:e.jsx(i.code,{children:"ROW_SIZE()"})}),e.jsx(i.th,{children:e.jsx(i.code,{children:"RAW_ROW_SIZE()"})})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Arguments"}),e.jsx(i.td,{children:"none"}),e.jsx(i.td,{children:"none"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Return type"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UNSIGNED_LONG"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UNSIGNED_LONG"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Counts"}),e.jsx(i.td,{children:"latest visible version of each cell"}),e.jsxs(i.td,{children:["all retained cell versions ",e.jsx(i.strong,{children:"and"})," delete markers"]})]})]})]}),`
`,e.jsxs(i.p,{children:[`Each cell's contribution is its full HBase footprint — row key, column
family, qualifier, timestamp, type byte, tags, and value — so the result is
`,e.jsx(i.strong,{children:"not"})," equal to the sum of user-visible column value lengths."]}),`
`,e.jsx(i.h2,{id:"row-size-usage",children:"Usage"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"ROW_SIZE()"})," is only valid ",e.jsx(i.strong,{children:"as an argument to an aggregate"})," in the ",e.jsx(i.code,{children:"SELECT"}),`
list, or inside a `,e.jsx(i.code,{children:"WHERE"})," clause. A bare projection (",e.jsx(i.code,{children:"SELECT ROW_SIZE() FROM t"}),`)
is rejected at compile time.`]}),`
`,e.jsx(i.h3,{id:"total-table-footprint",children:"Total table footprint"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" SUM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ROW_SIZE()) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table;"})]})})})}),`
`,e.jsx(i.h3,{id:"per-row-size",children:"Per-row size"}),`
`,e.jsx(i.p,{children:"Group by the primary key so each group is a single row:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" SUM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ROW_SIZE()) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"GROUP BY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id;"})]})})})}),`
`,e.jsx(i.h3,{id:"distribution",children:"Distribution"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" AVG"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ROW_SIZE()), "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"MIN"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ROW_SIZE()), "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"MAX"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ROW_SIZE()) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table;"})]})})})}),`
`,e.jsx(i.h3,{id:"find-rows-whose-footprint-exceeds-a-threshold",children:"Find rows whose footprint exceeds a threshold"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"ROW_SIZE()"})," is also valid in ",e.jsx(i.code,{children:"WHERE"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" COUNT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ROW_SIZE() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1024"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" AND"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" status"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'ACTIVE'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.h3,{id:"including-delete-markers-and-old-versions",children:"Including delete markers and old versions"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" organization_id, "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SUM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(RAW_ROW_SIZE())"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"GROUP BY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" organization_id;"})]})]})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"RAW_ROW_SIZE()"}),` counts every retained cell version and the bytes of any
delete-family or delete-column tombstones — useful for measuring the
post-compaction-debt footprint of a row.`]}),`
`,e.jsx(i.h2,{id:"row-size-caveats",children:"Limitations and caveats"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Wrap in an aggregate."})," ",e.jsx(i.code,{children:"SELECT ROW_SIZE() FROM t"}),` is rejected. Use
`,e.jsx(i.code,{children:"SUM(ROW_SIZE())"})," (with ",e.jsx(i.code,{children:"GROUP BY <pk>"})," for per-row values)."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Forces a full row read."}),` A query using either function reads more bytes
per row than the same query without it, because the scan can no longer
use empty-column / key-only / encoded-qualifier optimizations. Reach for
these functions for diagnostics, not hot-path scans.`]}),`
`,e.jsxs(i.li,{children:[e.jsxs(i.strong,{children:[e.jsx(i.code,{children:"RAW_ROW_SIZE()"})," reads all versions and tombstones."]}),` Both the byte count
and the row count it produces will exceed `,e.jsx(i.code,{children:"ROW_SIZE()"})," on the same data."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Cell footprint, not user-data size."}),` Adding a column generally
increases `,e.jsx(i.code,{children:"ROW_SIZE()"})," by more than that column's value byte length."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Measures whatever physical row the planner scans."}),` If the optimizer
chooses a secondary index, `,e.jsx(i.code,{children:"ROW_SIZE()"}),` will measure the index row, not
the data row. Pin the plan with a hint (e.g. `,e.jsx(i.code,{children:"/*+ NO_INDEX */"}),`) if you
need a specific physical answer.`]}),`
`]}),`
`,e.jsx(i.h2,{id:"row-size-see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/features/metrics",children:"Metrics"}),` — runtime measurements on the client
side (scan bytes, mutation bytes, scan latency, etc.).`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/features/statistics-collection",children:"Statistics Collection"}),` — aggregate
estimates without scanning every row.`]}),`
`]})]})}function d(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{r as _markdown,d as default,l as extractedReferences,a as frontmatter,h as structuredData,o as toc};
