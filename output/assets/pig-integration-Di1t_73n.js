import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`Pig integration may be divided into two parts: a **StoreFunc** as a means to generate Phoenix-encoded data through Pig, and a **Loader** which enables Phoenix-encoded data to be read by Pig.

## Pig StoreFunc

The \`StoreFunc\` allows users to write data in Phoenix-encoded format to HBase tables using Pig scripts. This is a nice way to bulk upload data from a MapReduce job in parallel to a Phoenix table in HBase. All you need to specify is the endpoint address, HBase table name and a batch size. For example:

\`\`\`
A = load 'testdata' as (a:chararray, b:chararray, c:chararray, d:chararray, e:datetime);
STORE A into 'hbase://CORE.ENTITY_HISTORY' using
    org.apache.phoenix.pig.PhoenixHBaseStorage('localhost', '-batchSize 5000');
\`\`\`

The above reads a file \`testdata\` and writes the elements to table \`CORE.ENTITY_HISTORY\` in HBase running on localhost. The first StoreFunc argument is the server, and the second is the batch size for Phoenix upserts. The batch size is related to how many rows you can hold in memory. A good default is 1000 rows, but if your rows are wide, you may want to decrease this.

Note that Pig types must be in sync with the target Phoenix data types. This StoreFunc tries best to cast based on input Pig types and target Phoenix data types, but it is recommended to provide an appropriate schema.

### Gotchas

It is advised that the upsert operation be idempotent. That is, trying to re-upsert data should not cause any inconsistencies. This is important in the case when a Pig job fails in process of writing to a Phoenix table. There is no notion of rollback (due to lack of transactions in HBase), and re-trying the upsert with \`PhoenixHBaseStorage\` must result in the same data in HBase table.

For example, let’s assume we are writing records n1...n10 to HBase. If the job fails in the middle of this process, we are left in an inconsistent state where n1...n7 made it to the phoenix tables but n8...n10 were missed. If we retry the same operation, n1...n7 would be re-upserted and n8...n10 would be upserted this time.

## Pig Loader

A Pig data loader allows users to read data from Phoenix-backed HBase tables within a Pig script.

The \`LoadFunc\` provides two alternative ways to load data.

1. Given a table name, the following will load the data for all the columns in the HIRES table:

   \`\`\`
   A = load 'hbase://table/HIRES' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
   \`\`\`

   To restrict the list of columns, you may specify the column names as part of LOAD as shown below:

   \`\`\`
   A = load 'hbase://table/HIRES/ID,NAME' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
   \`\`\`

   Here, only data for ID and NAME columns are returned.

2. Given a query, the following loads data for all those rows whose AGE column has a value of greater than 50:

   \`\`\`
   A = load 'hbase://query/SELECT ID,NAME FROM HIRES WHERE AGE > 50' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
   \`\`\`

   The LOAD func merely executes the given SQL query and returns the results. Though there is a provision to provide a query as part of LOAD, it is restricted to the following:

   * Only a \`SELECT\` query is allowed. No DML statements such as \`UPSERT\` or \`DELETE\`.
   * The query may not contain any \`GROUP BY\`, \`ORDER BY\`, \`LIMIT\`, or \`DISTINCT\` clauses.
   * The query may not contain any \`AGGREGATE\` functions.

In both cases, the ZooKeeper quorum should be passed to \`PhoenixHBaseLoader\` as a constructor argument.

The \`LoadFunc\` makes a best effort to map Phoenix data types to Pig datatypes. You can check \`org.apache.phoenix.pig.util.TypeUtil\` to see how each Phoenix data type maps to Pig.

### Example

Determine the number of users by a CLIENT ID.

**DDL**

\`\`\`sql
CREATE TABLE HIRES (
  CLIENTID INTEGER NOT NULL,
  EMPID INTEGER NOT NULL,
  NAME VARCHAR
  CONSTRAINT pk PRIMARY KEY(CLIENTID, EMPID)
);
\`\`\`

**Pig Script**

\`\`\`
raw = LOAD 'hbase://table/HIRES' USING org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
grpd = GROUP raw BY CLIENTID;
cnt = FOREACH grpd GENERATE group AS CLIENT, COUNT(raw);
DUMP cnt;
\`\`\`

### Future Work

* Support for \`ARRAY\` data type.
* Usage of expressions within the SELECT clause when providing a full query.
`,o={title:"Pig Integration",description:"Use Apache Pig StoreFunc and Loader with Phoenix-backed tables."},r=[],h={contents:[{heading:void 0,content:"Pig integration may be divided into two parts: a StoreFunc as a means to generate Phoenix-encoded data through Pig, and a Loader which enables Phoenix-encoded data to be read by Pig."},{heading:"pig-storefunc",content:"The StoreFunc allows users to write data in Phoenix-encoded format to HBase tables using Pig scripts. This is a nice way to bulk upload data from a MapReduce job in parallel to a Phoenix table in HBase. All you need to specify is the endpoint address, HBase table name and a batch size. For example:"},{heading:"pig-storefunc",content:"The above reads a file testdata and writes the elements to table CORE.ENTITY_HISTORY in HBase running on localhost. The first StoreFunc argument is the server, and the second is the batch size for Phoenix upserts. The batch size is related to how many rows you can hold in memory. A good default is 1000 rows, but if your rows are wide, you may want to decrease this."},{heading:"pig-storefunc",content:"Note that Pig types must be in sync with the target Phoenix data types. This StoreFunc tries best to cast based on input Pig types and target Phoenix data types, but it is recommended to provide an appropriate schema."},{heading:"gotchas",content:"It is advised that the upsert operation be idempotent. That is, trying to re-upsert data should not cause any inconsistencies. This is important in the case when a Pig job fails in process of writing to a Phoenix table. There is no notion of rollback (due to lack of transactions in HBase), and re-trying the upsert with PhoenixHBaseStorage must result in the same data in HBase table."},{heading:"gotchas",content:"For example, let’s assume we are writing records n1...n10 to HBase. If the job fails in the middle of this process, we are left in an inconsistent state where n1...n7 made it to the phoenix tables but n8...n10 were missed. If we retry the same operation, n1...n7 would be re-upserted and n8...n10 would be upserted this time."},{heading:"pig-loader",content:"A Pig data loader allows users to read data from Phoenix-backed HBase tables within a Pig script."},{heading:"pig-loader",content:"The LoadFunc provides two alternative ways to load data."},{heading:"pig-loader",content:"Given a table name, the following will load the data for all the columns in the HIRES table:"},{heading:"pig-loader",content:"To restrict the list of columns, you may specify the column names as part of LOAD as shown below:"},{heading:"pig-loader",content:"Here, only data for ID and NAME columns are returned."},{heading:"pig-loader",content:"Given a query, the following loads data for all those rows whose AGE column has a value of greater than 50:"},{heading:"pig-loader",content:"The LOAD func merely executes the given SQL query and returns the results. Though there is a provision to provide a query as part of LOAD, it is restricted to the following:"},{heading:"pig-loader",content:"Only a SELECT query is allowed. No DML statements such as UPSERT or DELETE."},{heading:"pig-loader",content:"The query may not contain any GROUP BY, ORDER BY, LIMIT, or DISTINCT clauses."},{heading:"pig-loader",content:"The query may not contain any AGGREGATE functions."},{heading:"pig-loader",content:"In both cases, the ZooKeeper quorum should be passed to PhoenixHBaseLoader as a constructor argument."},{heading:"pig-loader",content:"The LoadFunc makes a best effort to map Phoenix data types to Pig datatypes. You can check org.apache.phoenix.pig.util.TypeUtil to see how each Phoenix data type maps to Pig."},{heading:"pig-integration-example",content:"Determine the number of users by a CLIENT ID."},{heading:"pig-integration-example",content:"DDL"},{heading:"pig-integration-example",content:"Pig Script"},{heading:"future-work",content:"Support for ARRAY data type."},{heading:"future-work",content:"Usage of expressions within the SELECT clause when providing a full query."}],headings:[{id:"pig-storefunc",content:"Pig StoreFunc"},{id:"gotchas",content:"Gotchas"},{id:"pig-loader",content:"Pig Loader"},{id:"pig-integration-example",content:"Example"},{id:"future-work",content:"Future Work"}]};const l=[{depth:2,url:"#pig-storefunc",title:e.jsx(e.Fragment,{children:"Pig StoreFunc"})},{depth:3,url:"#gotchas",title:e.jsx(e.Fragment,{children:"Gotchas"})},{depth:2,url:"#pig-loader",title:e.jsx(e.Fragment,{children:"Pig Loader"})},{depth:3,url:"#pig-integration-example",title:e.jsx(e.Fragment,{children:"Example"})},{depth:3,url:"#future-work",title:e.jsx(e.Fragment,{children:"Future Work"})}];function t(a){const n={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Pig integration may be divided into two parts: a ",e.jsx(n.strong,{children:"StoreFunc"})," as a means to generate Phoenix-encoded data through Pig, and a ",e.jsx(n.strong,{children:"Loader"})," which enables Phoenix-encoded data to be read by Pig."]}),`
`,e.jsx(n.h2,{id:"pig-storefunc",children:"Pig StoreFunc"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"StoreFunc"})," allows users to write data in Phoenix-encoded format to HBase tables using Pig scripts. This is a nice way to bulk upload data from a MapReduce job in parallel to a Phoenix table in HBase. All you need to specify is the endpoint address, HBase table name and a batch size. For example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"A = load 'testdata' as (a:chararray, b:chararray, c:chararray, d:chararray, e:datetime);"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"STORE A into 'hbase://CORE.ENTITY_HISTORY' using"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"    org.apache.phoenix.pig.PhoenixHBaseStorage('localhost', '-batchSize 5000');"})})]})})}),`
`,e.jsxs(n.p,{children:["The above reads a file ",e.jsx(n.code,{children:"testdata"})," and writes the elements to table ",e.jsx(n.code,{children:"CORE.ENTITY_HISTORY"})," in HBase running on localhost. The first StoreFunc argument is the server, and the second is the batch size for Phoenix upserts. The batch size is related to how many rows you can hold in memory. A good default is 1000 rows, but if your rows are wide, you may want to decrease this."]}),`
`,e.jsx(n.p,{children:"Note that Pig types must be in sync with the target Phoenix data types. This StoreFunc tries best to cast based on input Pig types and target Phoenix data types, but it is recommended to provide an appropriate schema."}),`
`,e.jsx(n.h3,{id:"gotchas",children:"Gotchas"}),`
`,e.jsxs(n.p,{children:["It is advised that the upsert operation be idempotent. That is, trying to re-upsert data should not cause any inconsistencies. This is important in the case when a Pig job fails in process of writing to a Phoenix table. There is no notion of rollback (due to lack of transactions in HBase), and re-trying the upsert with ",e.jsx(n.code,{children:"PhoenixHBaseStorage"})," must result in the same data in HBase table."]}),`
`,e.jsx(n.p,{children:"For example, let’s assume we are writing records n1...n10 to HBase. If the job fails in the middle of this process, we are left in an inconsistent state where n1...n7 made it to the phoenix tables but n8...n10 were missed. If we retry the same operation, n1...n7 would be re-upserted and n8...n10 would be upserted this time."}),`
`,e.jsx(n.h2,{id:"pig-loader",children:"Pig Loader"}),`
`,e.jsx(n.p,{children:"A Pig data loader allows users to read data from Phoenix-backed HBase tables within a Pig script."}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"LoadFunc"})," provides two alternative ways to load data."]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Given a table name, the following will load the data for all the columns in the HIRES table:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"A = load 'hbase://table/HIRES' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');"})})})})}),`
`,e.jsx(n.p,{children:"To restrict the list of columns, you may specify the column names as part of LOAD as shown below:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"A = load 'hbase://table/HIRES/ID,NAME' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');"})})})})}),`
`,e.jsx(n.p,{children:"Here, only data for ID and NAME columns are returned."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Given a query, the following loads data for all those rows whose AGE column has a value of greater than 50:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"A = load 'hbase://query/SELECT ID,NAME FROM HIRES WHERE AGE > 50' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');"})})})})}),`
`,e.jsx(n.p,{children:"The LOAD func merely executes the given SQL query and returns the results. Though there is a provision to provide a query as part of LOAD, it is restricted to the following:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Only a ",e.jsx(n.code,{children:"SELECT"})," query is allowed. No DML statements such as ",e.jsx(n.code,{children:"UPSERT"})," or ",e.jsx(n.code,{children:"DELETE"}),"."]}),`
`,e.jsxs(n.li,{children:["The query may not contain any ",e.jsx(n.code,{children:"GROUP BY"}),", ",e.jsx(n.code,{children:"ORDER BY"}),", ",e.jsx(n.code,{children:"LIMIT"}),", or ",e.jsx(n.code,{children:"DISTINCT"})," clauses."]}),`
`,e.jsxs(n.li,{children:["The query may not contain any ",e.jsx(n.code,{children:"AGGREGATE"})," functions."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.p,{children:["In both cases, the ZooKeeper quorum should be passed to ",e.jsx(n.code,{children:"PhoenixHBaseLoader"})," as a constructor argument."]}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"LoadFunc"})," makes a best effort to map Phoenix data types to Pig datatypes. You can check ",e.jsx(n.code,{children:"org.apache.phoenix.pig.util.TypeUtil"})," to see how each Phoenix data type maps to Pig."]}),`
`,e.jsx(n.h3,{id:"pig-integration-example",children:"Example"}),`
`,e.jsx(n.p,{children:"Determine the number of users by a CLIENT ID."}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"DDL"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HIRES"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  CLIENTID "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTEGER"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  EMPID "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTEGER"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  NAME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  CONSTRAINT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CLIENTID, EMPID)"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Pig Script"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"raw = LOAD 'hbase://table/HIRES' USING org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"grpd = GROUP raw BY CLIENTID;"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"cnt = FOREACH grpd GENERATE group AS CLIENT, COUNT(raw);"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"DUMP cnt;"})})]})})}),`
`,e.jsx(n.h3,{id:"future-work",children:"Future Work"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Support for ",e.jsx(n.code,{children:"ARRAY"})," data type."]}),`
`,e.jsx(n.li,{children:"Usage of expressions within the SELECT clause when providing a full query."}),`
`]})]})}function d(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(t,{...a})}):t(a)}export{s as _markdown,d as default,r as extractedReferences,o as frontmatter,h as structuredData,l as toc};
