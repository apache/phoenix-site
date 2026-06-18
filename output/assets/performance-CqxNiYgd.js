import{j as e}from"./jsx-runtime-fm7E3NsZ.js";import{_ as s,a as i,b as a,c as h,d as l,e as c,f as d}from"./perf-topn-C8Xi2q9P.js";let f=`













<Callout type="warning">
  This page has not been updated recently and may not reflect the current state
  of the project.
</Callout>

Phoenix follows the philosophy of **bringing the computation to the data** by using:

* **coprocessors** to perform operations on the server-side thus minimizing client/server data transfer
* **custom filters** to prune data as close to the source as possible.

In addition, to minimize startup costs, Phoenix uses native HBase APIs rather than going through the MapReduce framework.

## Phoenix vs related products

Below are charts showing relative performance between Phoenix and some other related products.

### Phoenix vs Hive (running over HDFS and HBase)

<img alt="Phoenix vs Hive" src={__img0} placeholder="blur" />

Query: \`SELECT COUNT(1)\` from a table over 10M and 100M rows. Data has 5 narrow columns. Number of region
servers: 4 (HBase heap: 10GB, processor: 6 cores @ 3.3GHz Xeon).

### Phoenix vs Impala (running over HBase)

<img alt="Phoenix vs Impala" src={__img1} placeholder="blur" />

Query: \`SELECT COUNT(1)\` from a table over 1M and 5M rows. Data has 3 narrow columns. Number of region servers: 1 (virtual machine, HBase heap: 2GB, processor: 2 cores @ 3.3GHz Xeon).

***

## Latest Automated Performance Run

[Latest Automated Performance Run](http://phoenix-bin.github.io/client/performance/latest.htm) |
[Automated Performance Runs History](http://phoenix-bin.github.io/client/performance/)

***

## Performance improvements in Phoenix 1.2

### Essential Column Family

The Phoenix 1.2 query filter leverages the [HBase Filter Essential Column Family feature](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/SingleColumnValueFilter.html#isFamilyEssential\\(byte\\[]\\)). This improves performance when Phoenix filters data split across multiple column families (CFs) by loading only essential CFs first. In a second pass, all CFs are loaded as needed.

Consider the following schema in which data is split into two CFs:
\`CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR, b.c4 VARCHAR)\`.

Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
\`SELECT COUNT(c2) FROM t WHERE c1 = ?\`

The following chart shows in-memory query performance for the query above with 10M rows on 4 region servers, when 10% of rows match the filter. Note: \`cf-a\` is approximately 8 bytes and \`cf-b\` is approximately 400 bytes wide.

<img alt="Ess. CF" src={__img2} placeholder="blur" />

### Skip Scan

Skip Scan Filter leverages HBase filter \`SEEK_NEXT_USING_HINT\` ([docs](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/Filter.ReturnCode.html#SEEK_NEXT_USING_HINT)). It significantly improves point queries over key columns.

Consider the following schema in which data is split into two CFs:
\`CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR)\`.

Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
\`SELECT COUNT(c1) FROM t WHERE k IN (1% random k's)\`

The following chart shows in-memory query performance of the query above with 10M rows on 4 region servers when 1% random keys over the full key range are passed in the \`IN\` clause. Note: all \`VARCHAR\` columns are approximately 15 bytes.

<img alt="SkipScan" src={__img3} placeholder="blur" />

### Salting

Salting in Phoenix 1.2 improves both read and write performance by adding an extra hash byte at the start of the key and pre-splitting data into regions. This reduces hotspotting on one or a few region servers. Read more about this feature [here](/docs/features/salted-tables).

Consider the following schema:

\`CREATE TABLE T (HOST CHAR(2) NOT NULL,DOMAIN VARCHAR NOT NULL,\`
\`FEATURE VARCHAR NOT NULL,DATE DATE NOT NULL,USAGE.CORE BIGINT,USAGE.DB BIGINT,STATS.ACTIVE_VISITOR\`
\`INTEGER CONSTRAINT PK PRIMARY KEY (HOST, DOMAIN, FEATURE, DATE)) SALT_BUCKETS = 4\`.

The following chart shows write performance with and without salting, where the table is split into 4 regions on a 4-region-server cluster (note: for optimal performance, salt bucket count should match region server count).

<img alt="Salted-Write" src={__img4} placeholder="blur" />

The following chart shows in-memory query performance for a 10M-row table where \`host='NA'\` matches 3.3M rows.

\`select count(1) from t where host='NA'\`

<img alt="Salted-Read" src={__img5} placeholder="blur" />

### Top-N

The following chart shows in-memory query time for a Top-N query over 10M rows using Phoenix 1.2 and Hive over HBase.

\`select core from t order by core desc limit 10\`

<img alt="Phoenix vs Hive" src={__img6} placeholder="blur" />
`,g={title:"Performance",description:"Historical Phoenix performance comparisons and feature-level improvements for scans, salting, and query execution."},x=[{href:"http://phoenix-bin.github.io/client/performance/latest.htm"},{href:"http://phoenix-bin.github.io/client/performance/"},{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/SingleColumnValueFilter.html#isFamilyEssential(byte[])"},{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/Filter.ReturnCode.html#SEEK_NEXT_USING_HINT"},{href:"/docs/features/salted-tables"}],w={contents:[{heading:void 0,content:"type: warning"},{heading:void 0,content:`This page has not been updated recently and may not reflect the current state
of the project.`},{heading:void 0,content:"Phoenix follows the philosophy of bringing the computation to the data by using:"},{heading:void 0,content:"coprocessors to perform operations on the server-side thus minimizing client/server data transfer"},{heading:void 0,content:"custom filters to prune data as close to the source as possible."},{heading:void 0,content:"In addition, to minimize startup costs, Phoenix uses native HBase APIs rather than going through the MapReduce framework."},{heading:"phoenix-vs-related-products",content:"Below are charts showing relative performance between Phoenix and some other related products."},{heading:"phoenix-vs-hive-running-over-hdfs-and-hbase",content:`Query: SELECT COUNT(1) from a table over 10M and 100M rows. Data has 5 narrow columns. Number of region
servers: 4 (HBase heap: 10GB, processor: 6 cores @ 3.3GHz Xeon).`},{heading:"phoenix-vs-impala-running-over-hbase",content:"Query: SELECT COUNT(1) from a table over 1M and 5M rows. Data has 3 narrow columns. Number of region servers: 1 (virtual machine, HBase heap: 2GB, processor: 2 cores @ 3.3GHz Xeon)."},{heading:"latest-automated-performance-run",content:`Latest Automated Performance Run |
Automated Performance Runs History`},{heading:"essential-column-family",content:"The Phoenix 1.2 query filter leverages the HBase Filter Essential Column Family feature. This improves performance when Phoenix filters data split across multiple column families (CFs) by loading only essential CFs first. In a second pass, all CFs are loaded as needed."},{heading:"essential-column-family",content:`Consider the following schema in which data is split into two CFs:
CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR, b.c4 VARCHAR).`},{heading:"essential-column-family",content:`Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
SELECT COUNT(c2) FROM t WHERE c1 = ?`},{heading:"essential-column-family",content:"The following chart shows in-memory query performance for the query above with 10M rows on 4 region servers, when 10% of rows match the filter. Note: cf-a is approximately 8 bytes and cf-b is approximately 400 bytes wide."},{heading:"performance-skip-scan",content:"Skip Scan Filter leverages HBase filter SEEK_NEXT_USING_HINT (docs). It significantly improves point queries over key columns."},{heading:"performance-skip-scan",content:`Consider the following schema in which data is split into two CFs:
CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR).`},{heading:"performance-skip-scan",content:`Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
SELECT COUNT(c1) FROM t WHERE k IN (1% random k's)`},{heading:"performance-skip-scan",content:"The following chart shows in-memory query performance of the query above with 10M rows on 4 region servers when 1% random keys over the full key range are passed in the IN clause. Note: all VARCHAR columns are approximately 15 bytes."},{heading:"performance-salting",content:"Salting in Phoenix 1.2 improves both read and write performance by adding an extra hash byte at the start of the key and pre-splitting data into regions. This reduces hotspotting on one or a few region servers. Read more about this feature here."},{heading:"performance-salting",content:"Consider the following schema:"},{heading:"performance-salting",content:`CREATE TABLE T (HOST CHAR(2) NOT NULL,DOMAIN VARCHAR NOT NULL,
FEATURE VARCHAR NOT NULL,DATE DATE NOT NULL,USAGE.CORE BIGINT,USAGE.DB BIGINT,STATS.ACTIVE_VISITOR
INTEGER CONSTRAINT PK PRIMARY KEY (HOST, DOMAIN, FEATURE, DATE)) SALT_BUCKETS = 4.`},{heading:"performance-salting",content:"The following chart shows write performance with and without salting, where the table is split into 4 regions on a 4-region-server cluster (note: for optimal performance, salt bucket count should match region server count)."},{heading:"performance-salting",content:"The following chart shows in-memory query performance for a 10M-row table where host='NA' matches 3.3M rows."},{heading:"performance-salting",content:"select count(1) from t where host='NA'"},{heading:"top-n",content:"The following chart shows in-memory query time for a Top-N query over 10M rows using Phoenix 1.2 and Hive over HBase."},{heading:"top-n",content:"select core from t order by core desc limit 10"}],headings:[{id:"phoenix-vs-related-products",content:"Phoenix vs related products"},{id:"phoenix-vs-hive-running-over-hdfs-and-hbase",content:"Phoenix vs Hive (running over HDFS and HBase)"},{id:"phoenix-vs-impala-running-over-hbase",content:"Phoenix vs Impala (running over HBase)"},{id:"latest-automated-performance-run",content:"Latest Automated Performance Run"},{id:"performance-improvements-in-phoenix-12",content:"Performance improvements in Phoenix 1.2"},{id:"essential-column-family",content:"Essential Column Family"},{id:"performance-skip-scan",content:"Skip Scan"},{id:"performance-salting",content:"Salting"},{id:"top-n",content:"Top-N"}]};const T=[{depth:2,url:"#phoenix-vs-related-products",title:e.jsx(e.Fragment,{children:"Phoenix vs related products"})},{depth:3,url:"#phoenix-vs-hive-running-over-hdfs-and-hbase",title:e.jsx(e.Fragment,{children:"Phoenix vs Hive (running over HDFS and HBase)"})},{depth:3,url:"#phoenix-vs-impala-running-over-hbase",title:e.jsx(e.Fragment,{children:"Phoenix vs Impala (running over HBase)"})},{depth:2,url:"#latest-automated-performance-run",title:e.jsx(e.Fragment,{children:"Latest Automated Performance Run"})},{depth:2,url:"#performance-improvements-in-phoenix-12",title:e.jsx(e.Fragment,{children:"Performance improvements in Phoenix 1.2"})},{depth:3,url:"#essential-column-family",title:e.jsx(e.Fragment,{children:"Essential Column Family"})},{depth:3,url:"#performance-skip-scan",title:e.jsx(e.Fragment,{children:"Skip Scan"})},{depth:3,url:"#performance-salting",title:e.jsx(e.Fragment,{children:"Salting"})},{depth:3,url:"#top-n",title:e.jsx(e.Fragment,{children:"Top-N"})}];function t(r){const n={a:"a",code:"code",h2:"h2",h3:"h3",hr:"hr",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...r.components},{Callout:o}=n;return o||m("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(o,{type:"warning",children:e.jsx(n.p,{children:`This page has not been updated recently and may not reflect the current state
of the project.`})}),`
`,e.jsxs(n.p,{children:["Phoenix follows the philosophy of ",e.jsx(n.strong,{children:"bringing the computation to the data"})," by using:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"coprocessors"})," to perform operations on the server-side thus minimizing client/server data transfer"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"custom filters"})," to prune data as close to the source as possible."]}),`
`]}),`
`,e.jsx(n.p,{children:"In addition, to minimize startup costs, Phoenix uses native HBase APIs rather than going through the MapReduce framework."}),`
`,e.jsx(n.h2,{id:"phoenix-vs-related-products",children:"Phoenix vs related products"}),`
`,e.jsx(n.p,{children:"Below are charts showing relative performance between Phoenix and some other related products."}),`
`,e.jsx(n.h3,{id:"phoenix-vs-hive-running-over-hdfs-and-hbase",children:"Phoenix vs Hive (running over HDFS and HBase)"}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Phoenix vs Hive",src:s,placeholder:"blur"})}),`
`,e.jsxs(n.p,{children:["Query: ",e.jsx(n.code,{children:"SELECT COUNT(1)"}),` from a table over 10M and 100M rows. Data has 5 narrow columns. Number of region
servers: 4 (HBase heap: 10GB, processor: 6 cores @ 3.3GHz Xeon).`]}),`
`,e.jsx(n.h3,{id:"phoenix-vs-impala-running-over-hbase",children:"Phoenix vs Impala (running over HBase)"}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Phoenix vs Impala",src:i,placeholder:"blur"})}),`
`,e.jsxs(n.p,{children:["Query: ",e.jsx(n.code,{children:"SELECT COUNT(1)"})," from a table over 1M and 5M rows. Data has 3 narrow columns. Number of region servers: 1 (virtual machine, HBase heap: 2GB, processor: 2 cores @ 3.3GHz Xeon)."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"latest-automated-performance-run",children:"Latest Automated Performance Run"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"http://phoenix-bin.github.io/client/performance/latest.htm",children:"Latest Automated Performance Run"}),` |
`,e.jsx(n.a,{href:"http://phoenix-bin.github.io/client/performance/",children:"Automated Performance Runs History"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"performance-improvements-in-phoenix-12",children:"Performance improvements in Phoenix 1.2"}),`
`,e.jsx(n.h3,{id:"essential-column-family",children:"Essential Column Family"}),`
`,e.jsxs(n.p,{children:["The Phoenix 1.2 query filter leverages the ",e.jsx(n.a,{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/SingleColumnValueFilter.html#isFamilyEssential(byte%5B%5D)",children:"HBase Filter Essential Column Family feature"}),". This improves performance when Phoenix filters data split across multiple column families (CFs) by loading only essential CFs first. In a second pass, all CFs are loaded as needed."]}),`
`,e.jsxs(n.p,{children:[`Consider the following schema in which data is split into two CFs:
`,e.jsx(n.code,{children:"CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR, b.c4 VARCHAR)"}),"."]}),`
`,e.jsxs(n.p,{children:[`Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
`,e.jsx(n.code,{children:"SELECT COUNT(c2) FROM t WHERE c1 = ?"})]}),`
`,e.jsxs(n.p,{children:["The following chart shows in-memory query performance for the query above with 10M rows on 4 region servers, when 10% of rows match the filter. Note: ",e.jsx(n.code,{children:"cf-a"})," is approximately 8 bytes and ",e.jsx(n.code,{children:"cf-b"})," is approximately 400 bytes wide."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Ess. CF",src:a,placeholder:"blur"})}),`
`,e.jsx(n.h3,{id:"performance-skip-scan",children:"Skip Scan"}),`
`,e.jsxs(n.p,{children:["Skip Scan Filter leverages HBase filter ",e.jsx(n.code,{children:"SEEK_NEXT_USING_HINT"})," (",e.jsx(n.a,{href:"https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/filter/Filter.ReturnCode.html#SEEK_NEXT_USING_HINT",children:"docs"}),"). It significantly improves point queries over key columns."]}),`
`,e.jsxs(n.p,{children:[`Consider the following schema in which data is split into two CFs:
`,e.jsx(n.code,{children:"CREATE TABLE t (k VARCHAR NOT NULL PRIMARY KEY, a.c1 INTEGER, b.c2 VARCHAR, b.c3 VARCHAR)"}),"."]}),`
`,e.jsxs(n.p,{children:[`Running a query similar to the following shows significant performance gains when a subset of rows matches the filter:
`,e.jsx(n.code,{children:"SELECT COUNT(c1) FROM t WHERE k IN (1% random k's)"})]}),`
`,e.jsxs(n.p,{children:["The following chart shows in-memory query performance of the query above with 10M rows on 4 region servers when 1% random keys over the full key range are passed in the ",e.jsx(n.code,{children:"IN"})," clause. Note: all ",e.jsx(n.code,{children:"VARCHAR"})," columns are approximately 15 bytes."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"SkipScan",src:h,placeholder:"blur"})}),`
`,e.jsx(n.h3,{id:"performance-salting",children:"Salting"}),`
`,e.jsxs(n.p,{children:["Salting in Phoenix 1.2 improves both read and write performance by adding an extra hash byte at the start of the key and pre-splitting data into regions. This reduces hotspotting on one or a few region servers. Read more about this feature ",e.jsx(n.a,{href:"/docs/features/salted-tables",children:"here"}),"."]}),`
`,e.jsx(n.p,{children:"Consider the following schema:"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"CREATE TABLE T (HOST CHAR(2) NOT NULL,DOMAIN VARCHAR NOT NULL,"}),`
`,e.jsx(n.code,{children:"FEATURE VARCHAR NOT NULL,DATE DATE NOT NULL,USAGE.CORE BIGINT,USAGE.DB BIGINT,STATS.ACTIVE_VISITOR"}),`
`,e.jsx(n.code,{children:"INTEGER CONSTRAINT PK PRIMARY KEY (HOST, DOMAIN, FEATURE, DATE)) SALT_BUCKETS = 4"}),"."]}),`
`,e.jsx(n.p,{children:"The following chart shows write performance with and without salting, where the table is split into 4 regions on a 4-region-server cluster (note: for optimal performance, salt bucket count should match region server count)."}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Salted-Write",src:l,placeholder:"blur"})}),`
`,e.jsxs(n.p,{children:["The following chart shows in-memory query performance for a 10M-row table where ",e.jsx(n.code,{children:"host='NA'"})," matches 3.3M rows."]}),`
`,e.jsx(n.p,{children:e.jsx(n.code,{children:"select count(1) from t where host='NA'"})}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Salted-Read",src:c,placeholder:"blur"})}),`
`,e.jsx(n.h3,{id:"top-n",children:"Top-N"}),`
`,e.jsx(n.p,{children:"The following chart shows in-memory query time for a Top-N query over 10M rows using Phoenix 1.2 and Hive over HBase."}),`
`,e.jsx(n.p,{children:e.jsx(n.code,{children:"select core from t order by core desc limit 10"})}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Phoenix vs Hive",src:d,placeholder:"blur"})})]})}function E(r={}){const{wrapper:n}=r.components||{};return n?e.jsx(n,{...r,children:e.jsx(t,{...r})}):t(r)}function m(r,n){throw new Error("Expected component `"+r+"` to be defined: you likely forgot to import, pass, or provide it.")}export{f as _markdown,E as default,x as extractedReferences,g as frontmatter,w as structuredData,T as toc};
