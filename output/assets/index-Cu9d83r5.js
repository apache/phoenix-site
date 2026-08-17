import{j as e}from"./jsx-runtime-CUISpl0r.js";import{D as l,B as c}from"./download-Y6y70kcQ.js";import{C as d}from"./code-xml-CLkKI8uz.js";import"./createLucideIcon-CU6CiQ3u.js";let g=`import { Bug, Code2, Download } from "lucide-react";

<img src="/images/logo.svg" alt="Apache Phoenix logo" className="w-1/2 dark:hidden" />

<img src="/images/dark-theme-logo.svg" alt="Apache Phoenix logo" className="hidden w-1/2 dark:block" />

**OLTP and operational analytics for Apache Hadoop**

<Cards className="no-print mt-4 grid-cols-1 md:grid-cols-3">
  <Card
    title={
    <span className="inline-flex items-center gap-2">
      <Download className="text-primary h-5 w-5 shrink-0" />
      Download
    </span>
  }
    href="/downloads"
  >
    Download latest Apache Phoenix binary and source release artifacts
  </Card>

  <Card
    title={
    <span className="inline-flex items-center gap-2">
      <Bug className="text-primary h-5 w-5 shrink-0" />
      Issues
    </span>
  }
    href="/issues-tracking"
  >
    Browse Apache Phoenix JIRAs
  </Card>

  <Card
    title={
    <span className="inline-flex items-center gap-2">
      <Code2 className="text-primary h-5 w-5 shrink-0" />
      Source
    </span>
  }
    href="/source-repository"
  >
    Sync and build Apache Phoenix from source code
  </Card>
</Cards>

<Callout type="info">
  **[News](/news):** **Phoenix 5.3.0** has been released and is available for
  download [here](/downloads). Follow Apache Phoenix on
  [X/Twitter](https://twitter.com/ApachePhoenix).
</Callout>

Apache Phoenix enables OLTP and operational analytics in Hadoop for low-latency applications by combining:

* the power of standard SQL and JDBC APIs, with full ACID transaction capabilities
* the flexibility of late-bound, schema-on-read capabilities from the NoSQL world by leveraging HBase as its backing store

Apache Phoenix is fully integrated with other Hadoop products such as Spark, Hive, Pig, Flume, and MapReduce.

Who is using Apache Phoenix? Read more [here](/who-is-using).

## Mission

Become the trusted data platform for OLTP and operational analytics for Hadoop through well-defined, industry-standard APIs.

## Quick Start

Tired of reading and just want to get started? Take a look at our [FAQs](/docs/faq), listen to the Apache Phoenix talk from [Hadoop Summit 2015](https://www.youtube.com/watch?v=XGa0SyJMH94), review the [overview presentation](/presentations/OC-HUG-2014-10-4x3.pdf), and jump to our quick start guide [here](/docs/quick-start).

## SQL Support

Apache Phoenix takes your SQL query, compiles it into a series of HBase scans, and orchestrates those scans to produce regular JDBC result sets. Direct use of the HBase API, along with coprocessors and custom filters, results in [performance](/docs/fundamentals/performance) on the order of milliseconds for small queries, or seconds for tens of millions of rows.

To see a complete list of what is supported, go to our [language reference](/docs/grammar). All standard SQL query constructs are supported, including \`SELECT\`, \`FROM\`, \`WHERE\`, \`GROUP BY\`, \`HAVING\`, \`ORDER BY\`, etc. It also supports a full set of DML commands, as well as table creation and versioned incremental alterations through DDL commands.

Here is a list of what is currently **not** supported:

* **Relational operators**: \`INTERSECT\`, \`MINUS\`
* **Miscellaneous built-in functions**: these are easy to add — read this [blog](http://phoenix-hbase.blogspot.com/2013/04/how-to-add-your-own-built-in-function.html) for step-by-step instructions.

### Connection

Use JDBC to get a connection to an HBase cluster:

\`\`\`java
Connection conn = DriverManager.getConnection("jdbc:phoenix:server1,server2:3333", props);
\`\`\`

Where \`props\` are optional properties that may include Phoenix and HBase configuration values.

The JDBC connection string is composed as:

\`\`\`text
jdbc:phoenix[:<zookeeper quorum>[:<port number>[:<root node>[:<principal>[:<keytab file>]]]]]
\`\`\`

For omitted parts, values are taken from \`hbase-site.xml\` (\`hbase.zookeeper.quorum\`, \`hbase.zookeeper.property.clientPort\`, and \`zookeeper.znode.parent\`).

The optional \`principal\` and \`keytab file\` may be used to connect to a Kerberos-secured cluster. If only \`principal\` is specified, each distinct user gets a dedicated HBase connection (\`HConnection\`), allowing multiple different connections with different configuration properties on the same JVM.

For example, for longer-running queries:

\`\`\`java
Connection conn = DriverManager.getConnection("jdbc:phoenix:my_server:longRunning", longRunningProps);
\`\`\`

And for shorter-running queries:

\`\`\`java
Connection conn = DriverManager.getConnection("jdbc:phoenix:my_server:shortRunning", shortRunningProps);
\`\`\`

See the relevant [FAQ entry](/docs/faq#what-is-the-phoenix-jdbc-url-syntax) for example URLs.

Phoenix also supports [connecting to HBase without ZooKeeper](/docs/fundamentals/client-classpath-and-jdbc-url#the-phoenix-jdbc-url).

## Transactions

To enable full ACID transactions (beta in 4.7.0), set \`phoenix.transactions.enabled=true\`. In this case, you also need to run the transaction manager included in the distribution. Once enabled, a table may optionally be declared as transactional (see [transactions](/docs/features/transactions)).

Commits over transactional tables are all-or-none: either all data is committed (including secondary index updates) or none is committed (and an exception is thrown). Both cross-table and cross-row transactions are supported. Transactional tables also see their own uncommitted data when querying. An optimistic concurrency model is used to detect row-level conflicts with first-commit-wins semantics.

Non-transactional tables have no guarantees beyond HBase row-level atomicity (see [HBase ACID semantics](https://hbase.apache.org/acid-semantics)). Also, non-transactional tables do not see updates until commit occurs.

Phoenix DML commands (\`UPSERT VALUES\`, \`UPSERT SELECT\`, \`DELETE\`) batch pending changes on the client side. Changes are sent to server on commit and discarded on rollback. If auto-commit is enabled, Phoenix will execute the entire DML command server-side via coprocessors whenever possible for better performance.

#### Timestamps

Most applications let HBase manage timestamps. In cases where timestamps must be controlled, the [CurrentSCN](/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api) property can be set at connection time to control timestamps for DDL, DML, and queries. This also enables snapshot queries against prior row values because Phoenix uses this property as scan max timestamp.

Timestamps cannot be controlled for transactional tables. Instead, the transaction manager assigns timestamps that become HBase cell timestamps on commit. They still correspond to wall-clock time, but are multiplied by 1,000,000 to ensure enough granularity for uniqueness across the cluster.

## Schema

Apache Phoenix supports table creation and versioned incremental alterations through DDL commands. Table metadata is stored in an HBase table and versioned, so snapshot queries over prior versions automatically use the correct schema.

A Phoenix table can be created through [\`CREATE TABLE\`](/docs/grammar#create-table) and can either be:

1. **Built from scratch**: HBase table and column families are created automatically.
2. **Mapped to an existing HBase table**: either as a read-write TABLE or a read-only VIEW, with the caveat that row key/key-value binary representation must match Phoenix data types (see [Data Types](/docs/datatypes)).
   * For a read-write TABLE, column families are created automatically if absent. An empty key value is added to the first column family of each existing row to minimize projection size for queries.
   * For a read-only VIEW, all column families must already exist. The only change is adding Phoenix coprocessors for query processing. The primary use case is transferring existing data into Phoenix; DML is not allowed on a VIEW, and query performance may be lower than with a TABLE.

All schema is versioned (up to 1000 versions kept). Snapshot queries over older data pick up the correct schema based on connection time via [CurrentSCN](/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api).

#### Altering

A Phoenix table may be altered via [\`ALTER TABLE\`](/docs/grammar#alter). When a SQL statement references a table, Phoenix checks with the server by default to ensure metadata and statistics are up to date.

If table structure is known to be stable, this RPC may be unnecessary. \`UPDATE_CACHE_FREQUENCY\` (added in 4.7) lets users define how often the server is checked for metadata/statistics updates. Possible values: \`ALWAYS\` (default), \`NEVER\`, or a millisecond value.

For example, this DDL creates table \`FOO\` and tells clients to check for updates every 15 minutes:

\`\`\`sql
CREATE TABLE FOO (k BIGINT PRIMARY KEY, v VARCHAR) UPDATE_CACHE_FREQUENCY=900000;
\`\`\`

#### Views

Phoenix supports updatable views on top of tables, with the unique capability of adding columns by leveraging HBase schemaless behavior. All views share the same underlying HBase table and may be indexed independently. Read more [here](/docs/features/views).

#### Multi-tenancy

Built on top of view support, Phoenix also supports [multi-tenancy](/docs/features/multi-tenancy). As with views, a multi-tenant view can add columns defined solely for that user.

#### Schema at read time

Another schema-related feature allows columns to be defined dynamically at query time. This is useful when not all columns are known at create time. More details [here](/docs/features/dynamic-columns).

#### Mapping to an Existing HBase Table

Phoenix supports mapping to an existing HBase table through [\`CREATE TABLE\`](/docs/grammar#create-table) and [\`CREATE VIEW\`](/docs/grammar#create-view). In both cases, HBase metadata remains as-is, except that with \`CREATE TABLE\`, [KEEP\\_DELETED\\_CELLS](https://hbase.apache.org/docs/regionserver-sizing#keeping-deleted-cells) is enabled so flashback queries work correctly.

For \`CREATE TABLE\`, missing HBase metadata (table/column families) is created if needed. Table and column family names are case-sensitive at HBase level; Phoenix uppercases names by default. To preserve case sensitivity, wrap names in double quotes:

\`\`\`sql
CREATE VIEW "MyTable" ("a".ID VARCHAR PRIMARY KEY);
\`\`\`

For \`CREATE TABLE\`, an empty key value is added per row so queries behave as expected without projecting all columns during scans. For \`CREATE VIEW\`, this is not done and no HBase metadata is created. Existing HBase metadata must match DDL metadata, or \`ERROR 505 (42000): Table is read only\` is thrown.

Another caveat: bytes serialized in HBase must match Phoenix serialization expectations.

* For \`VARCHAR\`, \`CHAR\`, and \`UNSIGNED_*\` types, Phoenix uses HBase \`Bytes\` utility methods.
* \`CHAR\` expects only single-byte characters.
* \`UNSIGNED_*\` expects non-negative values.

Composite row keys are formed by concatenating values, with a zero byte separator after variable-length types. For more on type system details, see [Data Types](/docs/datatypes).

#### Salting

Tables can be declared salted to avoid HBase region hotspotting. Declare a salt bucket count and Phoenix manages salting transparently. See details [here](/docs/features/salted-tables), and write-throughput comparison [here](/docs/fundamentals/performance#performance-salting).

#### APIs

Catalog metadata (tables, columns, primary keys, and types) can be retrieved through Java SQL metadata interfaces: \`DatabaseMetaData\`, \`ParameterMetaData\`, and \`ResultSetMetaData\`.

For schema/table/column retrieval via \`DatabaseMetaData\`, schema pattern, table pattern, and column pattern are LIKE-style expressions (\`%\` and \`_\`, escaped by \`\\\`).

In metadata APIs, table catalog argument is used to filter by tenant ID for multi-tenant tables.
`,x={title:"Overview",description:"OLTP and operational analytics for Apache Hadoop.",icon:"BookOpen"},f=[{href:"/news"},{href:"/downloads"},{href:"https://twitter.com/ApachePhoenix"},{href:"/who-is-using"},{href:"/docs/faq"},{href:"https://www.youtube.com/watch?v=XGa0SyJMH94"},{href:"/presentations/OC-HUG-2014-10-4x3.pdf"},{href:"/docs/quick-start"},{href:"/docs/fundamentals/performance"},{href:"/docs/grammar"},{href:"http://phoenix-hbase.blogspot.com/2013/04/how-to-add-your-own-built-in-function.html"},{href:"/docs/faq#what-is-the-phoenix-jdbc-url-syntax"},{href:"/docs/fundamentals/client-classpath-and-jdbc-url#the-phoenix-jdbc-url"},{href:"/docs/features/transactions"},{href:"https://hbase.apache.org/acid-semantics"},{href:"/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api"},{href:"/docs/grammar#create-table"},{href:"/docs/datatypes"},{href:"/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api"},{href:"/docs/grammar#alter"},{href:"/docs/features/views"},{href:"/docs/features/multi-tenancy"},{href:"/docs/features/dynamic-columns"},{href:"/docs/grammar#create-table"},{href:"/docs/grammar#create-view"},{href:"https://hbase.apache.org/docs/regionserver-sizing#keeping-deleted-cells"},{href:"/docs/datatypes"},{href:"/docs/features/salted-tables"},{href:"/docs/fundamentals/performance#performance-salting"}],b={contents:[{heading:void 0,content:"**OLTP and operational analytics for Apache Hadoop**"},{heading:void 0,content:"Download latest Apache Phoenix binary and source release artifacts"},{heading:void 0,content:"Browse Apache Phoenix JIRAs"},{heading:void 0,content:"Sync and build Apache Phoenix from source code"},{heading:void 0,content:`**News:** **Phoenix 5.3.0** has been released and is available for
download here. Follow Apache Phoenix on
X/Twitter.`},{heading:void 0,content:"Apache Phoenix enables OLTP and operational analytics in Hadoop for low-latency applications by combining:"},{heading:void 0,content:"the power of standard SQL and JDBC APIs, with full ACID transaction capabilities"},{heading:void 0,content:"the flexibility of late-bound, schema-on-read capabilities from the NoSQL world by leveraging HBase as its backing store"},{heading:void 0,content:"Apache Phoenix is fully integrated with other Hadoop products such as Spark, Hive, Pig, Flume, and MapReduce."},{heading:void 0,content:"Who is using Apache Phoenix? Read more here."},{heading:"mission",content:"Become the trusted data platform for OLTP and operational analytics for Hadoop through well-defined, industry-standard APIs."},{heading:"index-quick-start",content:"Tired of reading and just want to get started? Take a look at our FAQs, listen to the Apache Phoenix talk from Hadoop Summit 2015, review the overview presentation, and jump to our quick start guide here."},{heading:"sql-support",content:"Apache Phoenix takes your SQL query, compiles it into a series of HBase scans, and orchestrates those scans to produce regular JDBC result sets. Direct use of the HBase API, along with coprocessors and custom filters, results in performance on the order of milliseconds for small queries, or seconds for tens of millions of rows."},{heading:"sql-support",content:"To see a complete list of what is supported, go to our language reference. All standard SQL query constructs are supported, including `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, etc. It also supports a full set of DML commands, as well as table creation and versioned incremental alterations through DDL commands."},{heading:"sql-support",content:"Here is a list of what is currently **not** supported:"},{heading:"sql-support",content:"**Relational operators**: `INTERSECT`, `MINUS`"},{heading:"sql-support",content:"**Miscellaneous built-in functions**: these are easy to add — read this blog for step-by-step instructions."},{heading:"connection",content:"Use JDBC to get a connection to an HBase cluster:"},{heading:"connection",content:"Where `props` are optional properties that may include Phoenix and HBase configuration values."},{heading:"connection",content:"The JDBC connection string is composed as:"},{heading:"connection",content:"For omitted parts, values are taken from `hbase-site.xml` (`hbase.zookeeper.quorum`, `hbase.zookeeper.property.clientPort`, and `zookeeper.znode.parent`)."},{heading:"connection",content:"The optional `principal` and `keytab file` may be used to connect to a Kerberos-secured cluster. If only `principal` is specified, each distinct user gets a dedicated HBase connection (`HConnection`), allowing multiple different connections with different configuration properties on the same JVM."},{heading:"connection",content:"For example, for longer-running queries:"},{heading:"connection",content:"And for shorter-running queries:"},{heading:"connection",content:"See the relevant FAQ entry for example URLs."},{heading:"connection",content:"Phoenix also supports connecting to HBase without ZooKeeper."},{heading:"index-transactions",content:"To enable full ACID transactions (beta in 4.7.0), set `phoenix.transactions.enabled=true`. In this case, you also need to run the transaction manager included in the distribution. Once enabled, a table may optionally be declared as transactional (see transactions)."},{heading:"index-transactions",content:"Commits over transactional tables are all-or-none: either all data is committed (including secondary index updates) or none is committed (and an exception is thrown). Both cross-table and cross-row transactions are supported. Transactional tables also see their own uncommitted data when querying. An optimistic concurrency model is used to detect row-level conflicts with first-commit-wins semantics."},{heading:"index-transactions",content:"Non-transactional tables have no guarantees beyond HBase row-level atomicity (see HBase ACID semantics). Also, non-transactional tables do not see updates until commit occurs."},{heading:"index-transactions",content:"Phoenix DML commands (`UPSERT VALUES`, `UPSERT SELECT`, `DELETE`) batch pending changes on the client side. Changes are sent to server on commit and discarded on rollback. If auto-commit is enabled, Phoenix will execute the entire DML command server-side via coprocessors whenever possible for better performance."},{heading:"timestamps",content:"Most applications let HBase manage timestamps. In cases where timestamps must be controlled, the CurrentSCN property can be set at connection time to control timestamps for DDL, DML, and queries. This also enables snapshot queries against prior row values because Phoenix uses this property as scan max timestamp."},{heading:"timestamps",content:"Timestamps cannot be controlled for transactional tables. Instead, the transaction manager assigns timestamps that become HBase cell timestamps on commit. They still correspond to wall-clock time, but are multiplied by 1,000,000 to ensure enough granularity for uniqueness across the cluster."},{heading:"schema",content:"Apache Phoenix supports table creation and versioned incremental alterations through DDL commands. Table metadata is stored in an HBase table and versioned, so snapshot queries over prior versions automatically use the correct schema."},{heading:"schema",content:"A Phoenix table can be created through `CREATE TABLE` and can either be:"},{heading:"schema",content:"**Built from scratch**: HBase table and column families are created automatically."},{heading:"schema",content:"**Mapped to an existing HBase table**: either as a read-write TABLE or a read-only VIEW, with the caveat that row key/key-value binary representation must match Phoenix data types (see Data Types)."},{heading:"schema",content:"For a read-write TABLE, column families are created automatically if absent. An empty key value is added to the first column family of each existing row to minimize projection size for queries."},{heading:"schema",content:"For a read-only VIEW, all column families must already exist. The only change is adding Phoenix coprocessors for query processing. The primary use case is transferring existing data into Phoenix; DML is not allowed on a VIEW, and query performance may be lower than with a TABLE."},{heading:"schema",content:"All schema is versioned (up to 1000 versions kept). Snapshot queries over older data pick up the correct schema based on connection time via CurrentSCN."},{heading:"altering",content:"A Phoenix table may be altered via `ALTER TABLE`. When a SQL statement references a table, Phoenix checks with the server by default to ensure metadata and statistics are up to date."},{heading:"altering",content:"If table structure is known to be stable, this RPC may be unnecessary. `UPDATE_CACHE_FREQUENCY` (added in 4.7) lets users define how often the server is checked for metadata/statistics updates. Possible values: `ALWAYS` (default), `NEVER`, or a millisecond value."},{heading:"altering",content:"For example, this DDL creates table `FOO` and tells clients to check for updates every 15 minutes:"},{heading:"index-views",content:"Phoenix supports updatable views on top of tables, with the unique capability of adding columns by leveraging HBase schemaless behavior. All views share the same underlying HBase table and may be indexed independently. Read more here."},{heading:"index-multi-tenancy",content:"Built on top of view support, Phoenix also supports multi-tenancy. As with views, a multi-tenant view can add columns defined solely for that user."},{heading:"schema-at-read-time",content:"Another schema-related feature allows columns to be defined dynamically at query time. This is useful when not all columns are known at create time. More details here."},{heading:"mapping-to-an-existing-hbase-table",content:"Phoenix supports mapping to an existing HBase table through `CREATE TABLE` and `CREATE VIEW`. In both cases, HBase metadata remains as-is, except that with `CREATE TABLE`, KEEP\\_DELETED\\_CELLS is enabled so flashback queries work correctly."},{heading:"mapping-to-an-existing-hbase-table",content:"For `CREATE TABLE`, missing HBase metadata (table/column families) is created if needed. Table and column family names are case-sensitive at HBase level; Phoenix uppercases names by default. To preserve case sensitivity, wrap names in double quotes:"},{heading:"mapping-to-an-existing-hbase-table",content:"For `CREATE TABLE`, an empty key value is added per row so queries behave as expected without projecting all columns during scans. For `CREATE VIEW`, this is not done and no HBase metadata is created. Existing HBase metadata must match DDL metadata, or `ERROR 505 (42000): Table is read only` is thrown."},{heading:"mapping-to-an-existing-hbase-table",content:"Another caveat: bytes serialized in HBase must match Phoenix serialization expectations."},{heading:"mapping-to-an-existing-hbase-table",content:"For `VARCHAR`, `CHAR`, and `UNSIGNED_*` types, Phoenix uses HBase `Bytes` utility methods."},{heading:"mapping-to-an-existing-hbase-table",content:"`CHAR` expects only single-byte characters."},{heading:"mapping-to-an-existing-hbase-table",content:"`UNSIGNED_*` expects non-negative values."},{heading:"mapping-to-an-existing-hbase-table",content:"Composite row keys are formed by concatenating values, with a zero byte separator after variable-length types. For more on type system details, see Data Types."},{heading:"index-salting",content:"Tables can be declared salted to avoid HBase region hotspotting. Declare a salt bucket count and Phoenix manages salting transparently. See details here, and write-throughput comparison here."},{heading:"apis",content:"Catalog metadata (tables, columns, primary keys, and types) can be retrieved through Java SQL metadata interfaces: `DatabaseMetaData`, `ParameterMetaData`, and `ResultSetMetaData`."},{heading:"apis",content:"For schema/table/column retrieval via `DatabaseMetaData`, schema pattern, table pattern, and column pattern are LIKE-style expressions (`%` and `_`, escaped by `\\`)."},{heading:"apis",content:"In metadata APIs, table catalog argument is used to filter by tenant ID for multi-tenant tables."}],headings:[{id:"mission",content:"Mission"},{id:"index-quick-start",content:"Quick Start"},{id:"sql-support",content:"SQL Support"},{id:"connection",content:"Connection"},{id:"index-transactions",content:"Transactions"},{id:"timestamps",content:"Timestamps"},{id:"schema",content:"Schema"},{id:"altering",content:"Altering"},{id:"index-views",content:"Views"},{id:"index-multi-tenancy",content:"Multi-tenancy"},{id:"schema-at-read-time",content:"Schema at read time"},{id:"mapping-to-an-existing-hbase-table",content:"Mapping to an Existing HBase Table"},{id:"index-salting",content:"Salting"},{id:"apis",content:"APIs"}]},y=[{depth:2,url:"#mission",title:e.jsx(e.Fragment,{children:"Mission"})},{depth:2,url:"#index-quick-start",title:e.jsx(e.Fragment,{children:"Quick Start"})},{depth:2,url:"#sql-support",title:e.jsx(e.Fragment,{children:"SQL Support"})},{depth:3,url:"#connection",title:e.jsx(e.Fragment,{children:"Connection"})},{depth:2,url:"#index-transactions",title:e.jsx(e.Fragment,{children:"Transactions"})},{depth:4,url:"#timestamps",title:e.jsx(e.Fragment,{children:"Timestamps"})},{depth:2,url:"#schema",title:e.jsx(e.Fragment,{children:"Schema"})},{depth:4,url:"#altering",title:e.jsx(e.Fragment,{children:"Altering"})},{depth:4,url:"#index-views",title:e.jsx(e.Fragment,{children:"Views"})},{depth:4,url:"#index-multi-tenancy",title:e.jsx(e.Fragment,{children:"Multi-tenancy"})},{depth:4,url:"#schema-at-read-time",title:e.jsx(e.Fragment,{children:"Schema at read time"})},{depth:4,url:"#mapping-to-an-existing-hbase-table",title:e.jsx(e.Fragment,{children:"Mapping to an Existing HBase Table"})},{depth:4,url:"#index-salting",title:e.jsx(e.Fragment,{children:"Salting"})},{depth:4,url:"#apis",title:e.jsx(e.Fragment,{children:"APIs"})}];function r(a){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:i,Card:t,Cards:o}=n;return i||s("Callout"),t||s("Card"),o||s("Cards"),e.jsxs(e.Fragment,{children:[e.jsx("img",{src:"/images/logo.svg",alt:"Apache Phoenix logo",className:"w-1/2 dark:hidden"}),`
`,e.jsx("img",{src:"/images/dark-theme-logo.svg",alt:"Apache Phoenix logo",className:"hidden w-1/2 dark:block"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"OLTP and operational analytics for Apache Hadoop"})}),`
`,e.jsxs(o,{className:"no-print mt-4 grid-cols-1 md:grid-cols-3",children:[e.jsx(t,{title:e.jsxs(n.span,{className:"inline-flex items-center gap-2",children:[e.jsx(l,{className:"text-primary h-5 w-5 shrink-0"}),"Download"]}),href:"/downloads",children:e.jsx(n.p,{children:"Download latest Apache Phoenix binary and source release artifacts"})}),e.jsx(t,{title:e.jsxs(n.span,{className:"inline-flex items-center gap-2",children:[e.jsx(c,{className:"text-primary h-5 w-5 shrink-0"}),"Issues"]}),href:"/issues-tracking",children:e.jsx(n.p,{children:"Browse Apache Phoenix JIRAs"})}),e.jsx(t,{title:e.jsxs(n.span,{className:"inline-flex items-center gap-2",children:[e.jsx(d,{className:"text-primary h-5 w-5 shrink-0"}),"Source"]}),href:"/source-repository",children:e.jsx(n.p,{children:"Sync and build Apache Phoenix from source code"})})]}),`
`,e.jsx(i,{type:"info",children:e.jsxs(n.p,{children:[e.jsxs(n.strong,{children:[e.jsx(n.a,{href:"/news",children:"News"}),":"]})," ",e.jsx(n.strong,{children:"Phoenix 5.3.0"}),` has been released and is available for
download `,e.jsx(n.a,{href:"/downloads",children:"here"}),`. Follow Apache Phoenix on
`,e.jsx(n.a,{href:"https://twitter.com/ApachePhoenix",children:"X/Twitter"}),"."]})}),`
`,e.jsx(n.p,{children:"Apache Phoenix enables OLTP and operational analytics in Hadoop for low-latency applications by combining:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"the power of standard SQL and JDBC APIs, with full ACID transaction capabilities"}),`
`,e.jsx(n.li,{children:"the flexibility of late-bound, schema-on-read capabilities from the NoSQL world by leveraging HBase as its backing store"}),`
`]}),`
`,e.jsx(n.p,{children:"Apache Phoenix is fully integrated with other Hadoop products such as Spark, Hive, Pig, Flume, and MapReduce."}),`
`,e.jsxs(n.p,{children:["Who is using Apache Phoenix? Read more ",e.jsx(n.a,{href:"/who-is-using",children:"here"}),"."]}),`
`,e.jsx(n.h2,{id:"mission",children:"Mission"}),`
`,e.jsx(n.p,{children:"Become the trusted data platform for OLTP and operational analytics for Hadoop through well-defined, industry-standard APIs."}),`
`,e.jsx(n.h2,{id:"index-quick-start",children:"Quick Start"}),`
`,e.jsxs(n.p,{children:["Tired of reading and just want to get started? Take a look at our ",e.jsx(n.a,{href:"/docs/faq",children:"FAQs"}),", listen to the Apache Phoenix talk from ",e.jsx(n.a,{href:"https://www.youtube.com/watch?v=XGa0SyJMH94",children:"Hadoop Summit 2015"}),", review the ",e.jsx(n.a,{href:"/presentations/OC-HUG-2014-10-4x3.pdf",children:"overview presentation"}),", and jump to our quick start guide ",e.jsx(n.a,{href:"/docs/quick-start",children:"here"}),"."]}),`
`,e.jsx(n.h2,{id:"sql-support",children:"SQL Support"}),`
`,e.jsxs(n.p,{children:["Apache Phoenix takes your SQL query, compiles it into a series of HBase scans, and orchestrates those scans to produce regular JDBC result sets. Direct use of the HBase API, along with coprocessors and custom filters, results in ",e.jsx(n.a,{href:"/docs/fundamentals/performance",children:"performance"})," on the order of milliseconds for small queries, or seconds for tens of millions of rows."]}),`
`,e.jsxs(n.p,{children:["To see a complete list of what is supported, go to our ",e.jsx(n.a,{href:"/docs/grammar",children:"language reference"}),". All standard SQL query constructs are supported, including ",e.jsx(n.code,{children:"SELECT"}),", ",e.jsx(n.code,{children:"FROM"}),", ",e.jsx(n.code,{children:"WHERE"}),", ",e.jsx(n.code,{children:"GROUP BY"}),", ",e.jsx(n.code,{children:"HAVING"}),", ",e.jsx(n.code,{children:"ORDER BY"}),", etc. It also supports a full set of DML commands, as well as table creation and versioned incremental alterations through DDL commands."]}),`
`,e.jsxs(n.p,{children:["Here is a list of what is currently ",e.jsx(n.strong,{children:"not"})," supported:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Relational operators"}),": ",e.jsx(n.code,{children:"INTERSECT"}),", ",e.jsx(n.code,{children:"MINUS"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Miscellaneous built-in functions"}),": these are easy to add — read this ",e.jsx(n.a,{href:"http://phoenix-hbase.blogspot.com/2013/04/how-to-add-your-own-built-in-function.html",children:"blog"})," for step-by-step instructions."]}),`
`]}),`
`,e.jsx(n.h3,{id:"connection",children:"Connection"}),`
`,e.jsx(n.p,{children:"Use JDBC to get a connection to an HBase cluster:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:server1,server2:3333"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", props);"})]})})})}),`
`,e.jsxs(n.p,{children:["Where ",e.jsx(n.code,{children:"props"})," are optional properties that may include Phoenix and HBase configuration values."]}),`
`,e.jsx(n.p,{children:"The JDBC connection string is composed as:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"jdbc:phoenix[:<zookeeper quorum>[:<port number>[:<root node>[:<principal>[:<keytab file>]]]]]"})})})})}),`
`,e.jsxs(n.p,{children:["For omitted parts, values are taken from ",e.jsx(n.code,{children:"hbase-site.xml"})," (",e.jsx(n.code,{children:"hbase.zookeeper.quorum"}),", ",e.jsx(n.code,{children:"hbase.zookeeper.property.clientPort"}),", and ",e.jsx(n.code,{children:"zookeeper.znode.parent"}),")."]}),`
`,e.jsxs(n.p,{children:["The optional ",e.jsx(n.code,{children:"principal"})," and ",e.jsx(n.code,{children:"keytab file"})," may be used to connect to a Kerberos-secured cluster. If only ",e.jsx(n.code,{children:"principal"})," is specified, each distinct user gets a dedicated HBase connection (",e.jsx(n.code,{children:"HConnection"}),"), allowing multiple different connections with different configuration properties on the same JVM."]}),`
`,e.jsx(n.p,{children:"For example, for longer-running queries:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:my_server:longRunning"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", longRunningProps);"})]})})})}),`
`,e.jsx(n.p,{children:"And for shorter-running queries:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:my_server:shortRunning"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", shortRunningProps);"})]})})})}),`
`,e.jsxs(n.p,{children:["See the relevant ",e.jsx(n.a,{href:"/docs/faq#what-is-the-phoenix-jdbc-url-syntax",children:"FAQ entry"})," for example URLs."]}),`
`,e.jsxs(n.p,{children:["Phoenix also supports ",e.jsx(n.a,{href:"/docs/fundamentals/client-classpath-and-jdbc-url#the-phoenix-jdbc-url",children:"connecting to HBase without ZooKeeper"}),"."]}),`
`,e.jsx(n.h2,{id:"index-transactions",children:"Transactions"}),`
`,e.jsxs(n.p,{children:["To enable full ACID transactions (beta in 4.7.0), set ",e.jsx(n.code,{children:"phoenix.transactions.enabled=true"}),". In this case, you also need to run the transaction manager included in the distribution. Once enabled, a table may optionally be declared as transactional (see ",e.jsx(n.a,{href:"/docs/features/transactions",children:"transactions"}),")."]}),`
`,e.jsx(n.p,{children:"Commits over transactional tables are all-or-none: either all data is committed (including secondary index updates) or none is committed (and an exception is thrown). Both cross-table and cross-row transactions are supported. Transactional tables also see their own uncommitted data when querying. An optimistic concurrency model is used to detect row-level conflicts with first-commit-wins semantics."}),`
`,e.jsxs(n.p,{children:["Non-transactional tables have no guarantees beyond HBase row-level atomicity (see ",e.jsx(n.a,{href:"https://hbase.apache.org/acid-semantics",children:"HBase ACID semantics"}),"). Also, non-transactional tables do not see updates until commit occurs."]}),`
`,e.jsxs(n.p,{children:["Phoenix DML commands (",e.jsx(n.code,{children:"UPSERT VALUES"}),", ",e.jsx(n.code,{children:"UPSERT SELECT"}),", ",e.jsx(n.code,{children:"DELETE"}),") batch pending changes on the client side. Changes are sent to server on commit and discarded on rollback. If auto-commit is enabled, Phoenix will execute the entire DML command server-side via coprocessors whenever possible for better performance."]}),`
`,e.jsx(n.h4,{id:"timestamps",children:"Timestamps"}),`
`,e.jsxs(n.p,{children:["Most applications let HBase manage timestamps. In cases where timestamps must be controlled, the ",e.jsx(n.a,{href:"/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",children:"CurrentSCN"})," property can be set at connection time to control timestamps for DDL, DML, and queries. This also enables snapshot queries against prior row values because Phoenix uses this property as scan max timestamp."]}),`
`,e.jsx(n.p,{children:"Timestamps cannot be controlled for transactional tables. Instead, the transaction manager assigns timestamps that become HBase cell timestamps on commit. They still correspond to wall-clock time, but are multiplied by 1,000,000 to ensure enough granularity for uniqueness across the cluster."}),`
`,e.jsx(n.h2,{id:"schema",children:"Schema"}),`
`,e.jsx(n.p,{children:"Apache Phoenix supports table creation and versioned incremental alterations through DDL commands. Table metadata is stored in an HBase table and versioned, so snapshot queries over prior versions automatically use the correct schema."}),`
`,e.jsxs(n.p,{children:["A Phoenix table can be created through ",e.jsx(n.a,{href:"/docs/grammar#create-table",children:e.jsx(n.code,{children:"CREATE TABLE"})})," and can either be:"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Built from scratch"}),": HBase table and column families are created automatically."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Mapped to an existing HBase table"}),": either as a read-write TABLE or a read-only VIEW, with the caveat that row key/key-value binary representation must match Phoenix data types (see ",e.jsx(n.a,{href:"/docs/datatypes",children:"Data Types"}),").",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"For a read-write TABLE, column families are created automatically if absent. An empty key value is added to the first column family of each existing row to minimize projection size for queries."}),`
`,e.jsx(n.li,{children:"For a read-only VIEW, all column families must already exist. The only change is adding Phoenix coprocessors for query processing. The primary use case is transferring existing data into Phoenix; DML is not allowed on a VIEW, and query performance may be lower than with a TABLE."}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.p,{children:["All schema is versioned (up to 1000 versions kept). Snapshot queries over older data pick up the correct schema based on connection time via ",e.jsx(n.a,{href:"/docs/faq#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",children:"CurrentSCN"}),"."]}),`
`,e.jsx(n.h4,{id:"altering",children:"Altering"}),`
`,e.jsxs(n.p,{children:["A Phoenix table may be altered via ",e.jsx(n.a,{href:"/docs/grammar#alter",children:e.jsx(n.code,{children:"ALTER TABLE"})}),". When a SQL statement references a table, Phoenix checks with the server by default to ensure metadata and statistics are up to date."]}),`
`,e.jsxs(n.p,{children:["If table structure is known to be stable, this RPC may be unnecessary. ",e.jsx(n.code,{children:"UPDATE_CACHE_FREQUENCY"})," (added in 4.7) lets users define how often the server is checked for metadata/statistics updates. Possible values: ",e.jsx(n.code,{children:"ALWAYS"})," (default), ",e.jsx(n.code,{children:"NEVER"}),", or a millisecond value."]}),`
`,e.jsxs(n.p,{children:["For example, this DDL creates table ",e.jsx(n.code,{children:"FOO"})," and tells clients to check for updates every 15 minutes:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" FOO"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (k "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", v "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") UPDATE_CACHE_FREQUENCY"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"900000"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})})})}),`
`,e.jsx(n.h4,{id:"index-views",children:"Views"}),`
`,e.jsxs(n.p,{children:["Phoenix supports updatable views on top of tables, with the unique capability of adding columns by leveraging HBase schemaless behavior. All views share the same underlying HBase table and may be indexed independently. Read more ",e.jsx(n.a,{href:"/docs/features/views",children:"here"}),"."]}),`
`,e.jsx(n.h4,{id:"index-multi-tenancy",children:"Multi-tenancy"}),`
`,e.jsxs(n.p,{children:["Built on top of view support, Phoenix also supports ",e.jsx(n.a,{href:"/docs/features/multi-tenancy",children:"multi-tenancy"}),". As with views, a multi-tenant view can add columns defined solely for that user."]}),`
`,e.jsx(n.h4,{id:"schema-at-read-time",children:"Schema at read time"}),`
`,e.jsxs(n.p,{children:["Another schema-related feature allows columns to be defined dynamically at query time. This is useful when not all columns are known at create time. More details ",e.jsx(n.a,{href:"/docs/features/dynamic-columns",children:"here"}),"."]}),`
`,e.jsx(n.h4,{id:"mapping-to-an-existing-hbase-table",children:"Mapping to an Existing HBase Table"}),`
`,e.jsxs(n.p,{children:["Phoenix supports mapping to an existing HBase table through ",e.jsx(n.a,{href:"/docs/grammar#create-table",children:e.jsx(n.code,{children:"CREATE TABLE"})})," and ",e.jsx(n.a,{href:"/docs/grammar#create-view",children:e.jsx(n.code,{children:"CREATE VIEW"})}),". In both cases, HBase metadata remains as-is, except that with ",e.jsx(n.code,{children:"CREATE TABLE"}),", ",e.jsx(n.a,{href:"https://hbase.apache.org/docs/regionserver-sizing#keeping-deleted-cells",children:"KEEP_DELETED_CELLS"})," is enabled so flashback queries work correctly."]}),`
`,e.jsxs(n.p,{children:["For ",e.jsx(n.code,{children:"CREATE TABLE"}),", missing HBase metadata (table/column families) is created if needed. Table and column family names are case-sensitive at HBase level; Phoenix uppercases names by default. To preserve case sensitivity, wrap names in double quotes:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:' "'}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyTable"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'" ('}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"a"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ID "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})})})}),`
`,e.jsxs(n.p,{children:["For ",e.jsx(n.code,{children:"CREATE TABLE"}),", an empty key value is added per row so queries behave as expected without projecting all columns during scans. For ",e.jsx(n.code,{children:"CREATE VIEW"}),", this is not done and no HBase metadata is created. Existing HBase metadata must match DDL metadata, or ",e.jsx(n.code,{children:"ERROR 505 (42000): Table is read only"})," is thrown."]}),`
`,e.jsx(n.p,{children:"Another caveat: bytes serialized in HBase must match Phoenix serialization expectations."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["For ",e.jsx(n.code,{children:"VARCHAR"}),", ",e.jsx(n.code,{children:"CHAR"}),", and ",e.jsx(n.code,{children:"UNSIGNED_*"})," types, Phoenix uses HBase ",e.jsx(n.code,{children:"Bytes"})," utility methods."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"CHAR"})," expects only single-byte characters."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"UNSIGNED_*"})," expects non-negative values."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Composite row keys are formed by concatenating values, with a zero byte separator after variable-length types. For more on type system details, see ",e.jsx(n.a,{href:"/docs/datatypes",children:"Data Types"}),"."]}),`
`,e.jsx(n.h4,{id:"index-salting",children:"Salting"}),`
`,e.jsxs(n.p,{children:["Tables can be declared salted to avoid HBase region hotspotting. Declare a salt bucket count and Phoenix manages salting transparently. See details ",e.jsx(n.a,{href:"/docs/features/salted-tables",children:"here"}),", and write-throughput comparison ",e.jsx(n.a,{href:"/docs/fundamentals/performance#performance-salting",children:"here"}),"."]}),`
`,e.jsx(n.h4,{id:"apis",children:"APIs"}),`
`,e.jsxs(n.p,{children:["Catalog metadata (tables, columns, primary keys, and types) can be retrieved through Java SQL metadata interfaces: ",e.jsx(n.code,{children:"DatabaseMetaData"}),", ",e.jsx(n.code,{children:"ParameterMetaData"}),", and ",e.jsx(n.code,{children:"ResultSetMetaData"}),"."]}),`
`,e.jsxs(n.p,{children:["For schema/table/column retrieval via ",e.jsx(n.code,{children:"DatabaseMetaData"}),", schema pattern, table pattern, and column pattern are LIKE-style expressions (",e.jsx(n.code,{children:"%"})," and ",e.jsx(n.code,{children:"_"}),", escaped by ",e.jsx(n.code,{children:"\\"}),")."]}),`
`,e.jsx(n.p,{children:"In metadata APIs, table catalog argument is used to filter by tenant ID for multi-tenant tables."})]})}function k(a={}){const{wrapper:n}=a.components||{};return n?e.jsx(n,{...a,children:e.jsx(r,{...a})}):r(a)}function s(a,n){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{g as _markdown,k as default,f as extractedReferences,x as frontmatter,b as structuredData,y as toc};
