import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let a=`## Explain Plan

An \`EXPLAIN\` plan tells you a lot about how a query will be run:

* All the HBase range queries that will be executed
* An estimate of the number of bytes that will be scanned
* An estimate of the number of rows that will be traversed
* Time at which the above estimate information was collected
* Which HBase table will be used for each scan
* Which operations (sort, merge, scan, limit) are executed on the client versus the server

Use an \`EXPLAIN\` plan to check how a query will run, and consider rewriting queries to meet the following goals:

* Emphasize operations on the server rather than the client. Server operations are distributed across the cluster and operate in parallel, while client operations execute within the single client JDBC driver.
* Use \`RANGE SCAN\` or \`SKIP SCAN\` whenever possible rather than \`TABLE SCAN\`.
* Filter against leading columns in the primary key constraint. This assumes you have designed the primary key to lead with frequently-accessed or frequently-filtered columns as described in “Primary Keys,” above.
* If necessary, introduce a local index or a global index that covers your query.
* If you have an index that covers your query but the optimizer is not detecting it, try hinting the query:
  \`SELECT /*+ INDEX() */ …\`

See also: [SQL Language Reference - EXPLAIN](/docs/grammar#explain)

## Anatomy of an Explain Plan

An explain plan consists of lines of text that describe operations that Phoenix will perform during a query, using the following terms:

* \`AGGREGATE INTO ORDERED DISTINCT ROWS\` — aggregates the returned rows using an operation such as addition. When \`ORDERED\` is used, the \`GROUP BY\` operation is applied to the leading part of the primary key constraint, which allows the aggregation to be done in place rather than keeping all distinct groups in memory on the server side.
* \`AGGREGATE INTO SINGLE ROW\` — aggregates the results into a single row using an aggregate function with no \`GROUP BY\` clause. For example, the \`count()\` statement returns one row with the total number of rows that match the query.
* \`CLIENT\` — the operation will be performed on the client side. It's faster to perform most operations on the server side, so you should consider whether there's a way to rewrite the query to give the server more of the work to do.
* \`FILTER BY\` expression—returns only results that match the expression.
* \`FULL SCAN OVER\` tableName—the operation will scan every row in the specified table.
* \`INNER-JOIN\` — the operation will join multiple tables on rows where the join condition is met.
* \`MERGE SORT\` — performs a merge sort on the results.
* \`RANGE SCAN OVER\` tableName \`[\` ... \`]\` — The information in the square brackets indicates the start and stop for each primary key that's used in the query.
* \`ROUND ROBIN\` — when the query doesn't contain \`ORDER BY\` and therefore the rows can be returned in any order, \`ROUND ROBIN\` order maximizes parallelization on the client side.
* \`<x>-CHUNK\` — describes how many threads will be used for the operation. The maximum parallelism is limited to the number of threads in the thread pool. The minimum parallelization corresponds to the number of regions the table has between the start and stop rows of the scan. The number of chunks will increase with a lower guidepost width, as there is more than one chunk per region.
* \`PARALLEL <x>-WAY\` — describes how many parallel scans will be merge sorted during the operation.
* \`SERIAL\` — some queries run serially. For example, a single row lookup or a query that filters on the leading part of the primary key and limits the results below a configurable threshold.
* \`EST_BYTES_READ\` - provides an estimate of the total number of bytes that will be scanned as part of executing the query.
* \`EST_ROWS_READ\` - provides an estimate of the total number of rows that will be scanned as part of executing the query.
* \`EST_INFO_TS\` - epoch time in milliseconds at which the estimate information was collected.

## Example

\`\`\`text

+-----------------------------------------------------------------------------------------------------------------------------------
|                                            PLAN                                 | EST_BYTES_READ  | EST_ROWS_READ  | EST_INFO_TS  |
+-----------------------------------------------------------------------------------------------------------------------------------
| CLIENT 36-CHUNK 237878 ROWS 6787437019 BYTES PARALLEL 36-WAY FULL SCAN
| OVER exDocStoreb                                                                |     237878      |   6787437019   | 1510353318102|
|   PARALLEL INNER-JOIN TABLE 0 (SKIP MERGE)                                      |     237878      |   6787437019   | 1510353318102|
|     CLIENT 36-CHUNK PARALLEL 36-WAY RANGE SCAN OVER indx_exdocb
|      [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bf']
|      - [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bg' |     237878      |   6787437019   | 1510353318102|
|       SERVER FILTER BY FIRST KEY ONLY                                           |     237878      |   6787437019   | 1510353318102|
|       SERVER AGGREGATE INTO ORDERED DISTINCT ROWS BY ["ID"]                     |     237878      |   6787437019   | 1510353318102|
|     CLIENT MERGE SORT                                                           |     237878      |   6787437019   | 1510353318102|
|   DYNAMIC SERVER FILTER BY (A.CURRENT_TIMESTAMP, [A.ID](http://a.id/))
    IN ((TMP.MCT, TMP.TID))                                                       |     237878      |   6787437019   | 1510353318102|
+-----------------------------------------------------------------------------------------------------------------------------------
\`\`\`

## JDBC Explain Plan API and Estimates

The information displayed in the explain plan API can also be accessed programmatically through the standard JDBC interfaces. When statistics collection
is enabled for a table, the explain plan also gives an estimate of number of rows and bytes a query is going to scan. To get hold of the info, you can
use corresponding columns in the result set returned by the explain plan statement. When stats collection is not enabled or if for some reason
Phoenix cannot provide the estimate information, the columns return null. Below is an example:

\`\`\`java
String explainSql = "EXPLAIN SELECT * FROM T";
Long estimatedBytes = null;
Long estimatedRows = null;
Long estimateInfoTs = null;
try (Statement statement = conn.createStatement(explainSql)) {
        int paramIdx = 1;
        ResultSet rs = statement.executeQuery(explainSql);
        rs.next();
        estimatedBytes =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_BYTES_READ_COLUMN);
        estimatedRows =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_ROWS_READ_COLUMN);
        estimateInfoTs =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATE_INFO_TS_COLUMN);
}
\`\`\`
`,l={title:"Explain Plan",description:"How to read and use EXPLAIN plans in Apache Phoenix."},r=[{href:"/docs/grammar#explain"}],o={contents:[{heading:"explain-plan-overview",content:"An EXPLAIN plan tells you a lot about how a query will be run:"},{heading:"explain-plan-overview",content:"All the HBase range queries that will be executed"},{heading:"explain-plan-overview",content:"An estimate of the number of bytes that will be scanned"},{heading:"explain-plan-overview",content:"An estimate of the number of rows that will be traversed"},{heading:"explain-plan-overview",content:"Time at which the above estimate information was collected"},{heading:"explain-plan-overview",content:"Which HBase table will be used for each scan"},{heading:"explain-plan-overview",content:"Which operations (sort, merge, scan, limit) are executed on the client versus the server"},{heading:"explain-plan-overview",content:"Use an EXPLAIN plan to check how a query will run, and consider rewriting queries to meet the following goals:"},{heading:"explain-plan-overview",content:"Emphasize operations on the server rather than the client. Server operations are distributed across the cluster and operate in parallel, while client operations execute within the single client JDBC driver."},{heading:"explain-plan-overview",content:"Use RANGE SCAN or SKIP SCAN whenever possible rather than TABLE SCAN."},{heading:"explain-plan-overview",content:"Filter against leading columns in the primary key constraint. This assumes you have designed the primary key to lead with frequently-accessed or frequently-filtered columns as described in “Primary Keys,” above."},{heading:"explain-plan-overview",content:"If necessary, introduce a local index or a global index that covers your query."},{heading:"explain-plan-overview",content:`If you have an index that covers your query but the optimizer is not detecting it, try hinting the query:
SELECT /*+ INDEX() */ …`},{heading:"explain-plan-overview",content:"See also: SQL Language Reference - EXPLAIN"},{heading:"anatomy-of-an-explain-plan",content:"An explain plan consists of lines of text that describe operations that Phoenix will perform during a query, using the following terms:"},{heading:"anatomy-of-an-explain-plan",content:"AGGREGATE INTO ORDERED DISTINCT ROWS — aggregates the returned rows using an operation such as addition. When ORDERED is used, the GROUP BY operation is applied to the leading part of the primary key constraint, which allows the aggregation to be done in place rather than keeping all distinct groups in memory on the server side."},{heading:"anatomy-of-an-explain-plan",content:"AGGREGATE INTO SINGLE ROW — aggregates the results into a single row using an aggregate function with no GROUP BY clause. For example, the count() statement returns one row with the total number of rows that match the query."},{heading:"anatomy-of-an-explain-plan",content:"CLIENT — the operation will be performed on the client side. It's faster to perform most operations on the server side, so you should consider whether there's a way to rewrite the query to give the server more of the work to do."},{heading:"anatomy-of-an-explain-plan",content:"FILTER BY expression—returns only results that match the expression."},{heading:"anatomy-of-an-explain-plan",content:"FULL SCAN OVER tableName—the operation will scan every row in the specified table."},{heading:"anatomy-of-an-explain-plan",content:"INNER-JOIN — the operation will join multiple tables on rows where the join condition is met."},{heading:"anatomy-of-an-explain-plan",content:"MERGE SORT — performs a merge sort on the results."},{heading:"anatomy-of-an-explain-plan",content:"RANGE SCAN OVER tableName [ ... ] — The information in the square brackets indicates the start and stop for each primary key that's used in the query."},{heading:"anatomy-of-an-explain-plan",content:"ROUND ROBIN — when the query doesn't contain ORDER BY and therefore the rows can be returned in any order, ROUND ROBIN order maximizes parallelization on the client side."},{heading:"anatomy-of-an-explain-plan",content:"<x>-CHUNK — describes how many threads will be used for the operation. The maximum parallelism is limited to the number of threads in the thread pool. The minimum parallelization corresponds to the number of regions the table has between the start and stop rows of the scan. The number of chunks will increase with a lower guidepost width, as there is more than one chunk per region."},{heading:"anatomy-of-an-explain-plan",content:"PARALLEL <x>-WAY — describes how many parallel scans will be merge sorted during the operation."},{heading:"anatomy-of-an-explain-plan",content:"SERIAL — some queries run serially. For example, a single row lookup or a query that filters on the leading part of the primary key and limits the results below a configurable threshold."},{heading:"anatomy-of-an-explain-plan",content:"EST_BYTES_READ - provides an estimate of the total number of bytes that will be scanned as part of executing the query."},{heading:"anatomy-of-an-explain-plan",content:"EST_ROWS_READ - provides an estimate of the total number of rows that will be scanned as part of executing the query."},{heading:"anatomy-of-an-explain-plan",content:"EST_INFO_TS - epoch time in milliseconds at which the estimate information was collected."},{heading:"jdbc-explain-plan-api-and-estimates",content:`The information displayed in the explain plan API can also be accessed programmatically through the standard JDBC interfaces. When statistics collection
is enabled for a table, the explain plan also gives an estimate of number of rows and bytes a query is going to scan. To get hold of the info, you can
use corresponding columns in the result set returned by the explain plan statement. When stats collection is not enabled or if for some reason
Phoenix cannot provide the estimate information, the columns return null. Below is an example:`}],headings:[{id:"explain-plan-overview",content:"Explain Plan"},{id:"anatomy-of-an-explain-plan",content:"Anatomy of an Explain Plan"},{id:"explain-plan-example",content:"Example"},{id:"jdbc-explain-plan-api-and-estimates",content:"JDBC Explain Plan API and Estimates"}]};const h=[{depth:2,url:"#explain-plan-overview",title:e.jsx(e.Fragment,{children:"Explain Plan"})},{depth:2,url:"#anatomy-of-an-explain-plan",title:e.jsx(e.Fragment,{children:"Anatomy of an Explain Plan"})},{depth:2,url:"#explain-plan-example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:2,url:"#jdbc-explain-plan-api-and-estimates",title:e.jsx(e.Fragment,{children:"JDBC Explain Plan API and Estimates"})}];function t(i){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"explain-plan-overview",children:"Explain Plan"}),`
`,e.jsxs(n.p,{children:["An ",e.jsx(n.code,{children:"EXPLAIN"})," plan tells you a lot about how a query will be run:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"All the HBase range queries that will be executed"}),`
`,e.jsx(n.li,{children:"An estimate of the number of bytes that will be scanned"}),`
`,e.jsx(n.li,{children:"An estimate of the number of rows that will be traversed"}),`
`,e.jsx(n.li,{children:"Time at which the above estimate information was collected"}),`
`,e.jsx(n.li,{children:"Which HBase table will be used for each scan"}),`
`,e.jsx(n.li,{children:"Which operations (sort, merge, scan, limit) are executed on the client versus the server"}),`
`]}),`
`,e.jsxs(n.p,{children:["Use an ",e.jsx(n.code,{children:"EXPLAIN"})," plan to check how a query will run, and consider rewriting queries to meet the following goals:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Emphasize operations on the server rather than the client. Server operations are distributed across the cluster and operate in parallel, while client operations execute within the single client JDBC driver."}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"RANGE SCAN"})," or ",e.jsx(n.code,{children:"SKIP SCAN"})," whenever possible rather than ",e.jsx(n.code,{children:"TABLE SCAN"}),"."]}),`
`,e.jsx(n.li,{children:"Filter against leading columns in the primary key constraint. This assumes you have designed the primary key to lead with frequently-accessed or frequently-filtered columns as described in “Primary Keys,” above."}),`
`,e.jsx(n.li,{children:"If necessary, introduce a local index or a global index that covers your query."}),`
`,e.jsxs(n.li,{children:[`If you have an index that covers your query but the optimizer is not detecting it, try hinting the query:
`,e.jsx(n.code,{children:"SELECT /*+ INDEX() */ …"})]}),`
`]}),`
`,e.jsxs(n.p,{children:["See also: ",e.jsx(n.a,{href:"/docs/grammar#explain",children:"SQL Language Reference - EXPLAIN"})]}),`
`,e.jsx(n.h2,{id:"anatomy-of-an-explain-plan",children:"Anatomy of an Explain Plan"}),`
`,e.jsx(n.p,{children:"An explain plan consists of lines of text that describe operations that Phoenix will perform during a query, using the following terms:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"AGGREGATE INTO ORDERED DISTINCT ROWS"})," — aggregates the returned rows using an operation such as addition. When ",e.jsx(n.code,{children:"ORDERED"})," is used, the ",e.jsx(n.code,{children:"GROUP BY"})," operation is applied to the leading part of the primary key constraint, which allows the aggregation to be done in place rather than keeping all distinct groups in memory on the server side."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"AGGREGATE INTO SINGLE ROW"})," — aggregates the results into a single row using an aggregate function with no ",e.jsx(n.code,{children:"GROUP BY"})," clause. For example, the ",e.jsx(n.code,{children:"count()"})," statement returns one row with the total number of rows that match the query."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"CLIENT"})," — the operation will be performed on the client side. It's faster to perform most operations on the server side, so you should consider whether there's a way to rewrite the query to give the server more of the work to do."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"FILTER BY"})," expression—returns only results that match the expression."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"FULL SCAN OVER"})," tableName—the operation will scan every row in the specified table."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"INNER-JOIN"})," — the operation will join multiple tables on rows where the join condition is met."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"MERGE SORT"})," — performs a merge sort on the results."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"RANGE SCAN OVER"})," tableName ",e.jsx(n.code,{children:"["})," ... ",e.jsx(n.code,{children:"]"})," — The information in the square brackets indicates the start and stop for each primary key that's used in the query."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ROUND ROBIN"})," — when the query doesn't contain ",e.jsx(n.code,{children:"ORDER BY"})," and therefore the rows can be returned in any order, ",e.jsx(n.code,{children:"ROUND ROBIN"})," order maximizes parallelization on the client side."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"<x>-CHUNK"})," — describes how many threads will be used for the operation. The maximum parallelism is limited to the number of threads in the thread pool. The minimum parallelization corresponds to the number of regions the table has between the start and stop rows of the scan. The number of chunks will increase with a lower guidepost width, as there is more than one chunk per region."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"PARALLEL <x>-WAY"})," — describes how many parallel scans will be merge sorted during the operation."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"SERIAL"})," — some queries run serially. For example, a single row lookup or a query that filters on the leading part of the primary key and limits the results below a configurable threshold."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"EST_BYTES_READ"})," - provides an estimate of the total number of bytes that will be scanned as part of executing the query."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"EST_ROWS_READ"})," - provides an estimate of the total number of rows that will be scanned as part of executing the query."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"EST_INFO_TS"})," - epoch time in milliseconds at which the estimate information was collected."]}),`
`]}),`
`,e.jsx(n.h2,{id:"explain-plan-example",children:"Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"+-----------------------------------------------------------------------------------------------------------------------------------"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|                                            PLAN                                 | EST_BYTES_READ  | EST_ROWS_READ  | EST_INFO_TS  |"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"+-----------------------------------------------------------------------------------------------------------------------------------"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"| CLIENT 36-CHUNK 237878 ROWS 6787437019 BYTES PARALLEL 36-WAY FULL SCAN"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"| OVER exDocStoreb                                                                |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|   PARALLEL INNER-JOIN TABLE 0 (SKIP MERGE)                                      |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|     CLIENT 36-CHUNK PARALLEL 36-WAY RANGE SCAN OVER indx_exdocb"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|      [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bf']"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|      - [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bg' |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|       SERVER FILTER BY FIRST KEY ONLY                                           |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:'|       SERVER AGGREGATE INTO ORDERED DISTINCT ROWS BY ["ID"]                     |     237878      |   6787437019   | 1510353318102|'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|     CLIENT MERGE SORT                                                           |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"|   DYNAMIC SERVER FILTER BY (A.CURRENT_TIMESTAMP, [A.ID](http://a.id/))"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    IN ((TMP.MCT, TMP.TID))                                                       |     237878      |   6787437019   | 1510353318102|"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"+-----------------------------------------------------------------------------------------------------------------------------------"})})]})})}),`
`,e.jsx(n.h2,{id:"jdbc-explain-plan-api-and-estimates",children:"JDBC Explain Plan API and Estimates"}),`
`,e.jsx(n.p,{children:`The information displayed in the explain plan API can also be accessed programmatically through the standard JDBC interfaces. When statistics collection
is enabled for a table, the explain plan also gives an estimate of number of rows and bytes a query is going to scan. To get hold of the info, you can
use corresponding columns in the result set returned by the explain plan statement. When stats collection is not enabled or if for some reason
Phoenix cannot provide the estimate information, the columns return null. Below is an example:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String explainSql "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "EXPLAIN SELECT * FROM T"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Long estimatedBytes "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Long estimatedRows "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Long estimateInfoTs "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Statement statement "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(explainSql)) {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        int"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" paramIdx "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ResultSet rs "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" statement."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(explainSql);"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        rs."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        estimatedBytes "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                (Long) rs."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getObject"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_BYTES_READ_COLUMN);"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        estimatedRows "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                (Long) rs."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getObject"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_ROWS_READ_COLUMN);"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        estimateInfoTs "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                (Long) rs."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getObject"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATE_INFO_TS_COLUMN);"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]})}function d(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{a as _markdown,d as default,r as extractedReferences,l as frontmatter,o as structuredData,h as toc};
