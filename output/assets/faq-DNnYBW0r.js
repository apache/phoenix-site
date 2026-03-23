import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`## Questions answered in this page:

* [I want to get started. Is there a Phoenix Hello World?](#i-want-to-get-started-is-there-a-phoenix-hello-world)
* [What is the Phoenix JDBC URL syntax?](#what-is-the-phoenix-jdbc-url-syntax)
* [Is there a way to bulk load in Phoenix?](#is-there-a-way-to-bulk-load-in-phoenix)
* [How I map Phoenix table to an existing HBase table?](#how-i-map-phoenix-table-to-an-existing-hbase-table)
* [Are there any tips for optimizing Phoenix?](#are-there-any-tips-for-optimizing-phoenix)
* [How do I create Secondary Index on a table?](#how-do-i-create-secondary-index-on-a-table)
* [Why isn't my secondary index being used?](#why-isnt-my-secondary-index-being-used)
* [How fast is Phoenix? Why is it so fast?](#how-fast-is-phoenix-why-is-it-so-fast)
* [How do I connect to secure HBase cluster?](#how-do-i-connect-to-secure-hbase-cluster)
* [What HBase and Hadoop versions are supported?](#what-hbase-and-hadoop-versions-are-supported)
* [Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?](#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api)
* [Why isn't my query doing a RANGE SCAN?](#why-isnt-my-query-doing-a-range-scan)
* [Should I pool Phoenix JDBC Connections?](#should-i-pool-phoenix-jdbc-connections)
* [Why does Phoenix add an empty or dummy KeyValue when doing an upsert?](#why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert)

### I want to get started. Is there a Phoenix *Hello World*?

*Pre-requisite:* [Download](/downloads) and [install](/docs/installation) the latest Phoenix.

#### Using console

<Steps>
  <Step>
    Start Sqlline:

    \`\`\`shell
    $ sqlline.py [zookeeper quorum hosts]
    \`\`\`
  </Step>

  <Step>
    Execute the following statements when Sqlline connects:

    \`\`\`sql
    create table test (mykey integer not null primary key, mycolumn varchar);
    upsert into test values (1,'Hello');
    upsert into test values (2,'World!');
    select * from test;
    \`\`\`
  </Step>

  <Step>
    You should get the following output:

    \`\`\`text
    +-------+------------+
    | MYKEY |  MYCOLUMN  |
    +-------+------------+
    | 1     | Hello      |
    | 2     | World!     |
    +-------+------------+
    \`\`\`
  </Step>
</Steps>

#### Using Java

Create test.java file with the following content:

\`\`\`java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.Statement;

public class test {

	public static void main(String[] args) throws SQLException {
		Statement stmt = null;
		ResultSet rset = null;

		Connection con = DriverManager.getConnection("jdbc:phoenix:[zookeeper quorum hosts]");
		stmt = con.createStatement();

		stmt.executeUpdate("create table test (mykey integer not null primary key, mycolumn varchar)");
		stmt.executeUpdate("upsert into test values (1,'Hello')");
		stmt.executeUpdate("upsert into test values (2,'World!')");
		con.commit();

		PreparedStatement statement = con.prepareStatement("select * from test");
		rset = statement.executeQuery();
		while (rset.next()) {
			System.out.println(rset.getString("mycolumn"));
		}
		statement.close();
		con.close();
	}
}
\`\`\`

Compile and execute on command line

\`\`\`shell
$ javac test.java
$ java -cp "../phoenix-[version]-client.jar:." test
\`\`\`

You should get the following output

\`\`\`text
Hello
World!
\`\`\`

### What is the Phoenix JDBC URL syntax?

#### Thick Driver

**See [Using the Phoenix JDBC Driver](/docs/fundamentals/client-classpath-and-jdbc-url#using-the-phoenix-jdbc-driver) for a more up-to-date description**

The Phoenix (Thick) Driver JDBC URL syntax is as follows (where elements in square brackets are optional):

\`\`\`text
jdbc:phoenix:[comma-separated ZooKeeper Quorum Hosts [: ZK port [:hbase root znode [:kerberos_principal [:path to kerberos keytab] ] ] ]
\`\`\`

The simplest URL is:

\`\`\`text
jdbc:phoenix
\`\`\`

Whereas the most complicated URL is:

\`\`\`text
jdbc:phoenix:zookeeper1.domain,zookeeper2.domain,zookeeper3.domain:2181:/hbase-1:phoenix@EXAMPLE.COM:/etc/security/keytabs/phoenix.keytab
\`\`\`

Please note that each optional element in the URL requires all previous optional elements. For example, to specify the
HBase root ZNode, the ZooKeeper port *must* also be specified.

See also [Connection String](/docs#connection).

#### Thin Driver

The Phoenix Thin Driver (used with the Phoenix Query Server) JDBC URL syntax is as follows:

\`\`\`text
jdbc:phoenix:thin:[key=value[;key=value...]]
\`\`\`

There are a number of keys exposed for client-use. The most commonly-used keys are: \`url\` and \`serialization\`. The \`url\`
key is required to interact with the Phoenix Query Server.

The simplest URL is:

\`\`\`text
jdbc:phoenix:thin:url=http://localhost:8765
\`\`\`

Where as very complicated URL is:

\`\`\`text
jdbc:phoenix:thin:url=http://queryserver.domain:8765;serialization=PROTOBUF;authentication=SPENGO;principal=phoenix@EXAMPLE.COM;keytab=/etc/security/keytabs/phoenix.keytab
\`\`\`

Please refer to the [Apache Avatica documentation](https://calcite.apache.org/avatica/docs/client_reference.html) for a full list of supported options in the Thin client JDBC URL,
or see the [Query Server documentation](/docs/features/query-server)

### Is there a way to bulk load in Phoenix?

#### Map Reduce

See the example [here](/docs/features/bulk-loading)

#### CSV

CSV data can be bulk loaded with built in utility named \`psql\`. Typical upsert rates are 20K - 50K rows per second (depends on how wide are the rows).

Usage example:

* Create table using psql:

  \`\`\`shell
  $ psql.py [zookeeper] ../examples/web_stat.sql
  \`\`\`

* Upsert CSV bulk data:

  \`\`\`shell
  $ psql.py [zookeeper] ../examples/web_stat.csv
  \`\`\`

### How I map Phoenix table to an existing HBase table?

You can create both a Phoenix table or view through the \`CREATE TABLE\`/\`CREATE VIEW\` DDL statement on a pre-existing HBase table. In both cases, we'll leave the HBase metadata as-is. For \`CREATE TABLE\`, we'll create any metadata (table, column families) that doesn't already exist. We'll also add an empty key value for each row so that queries behave as expected (without requiring all columns to be projected during scans).

The other caveat is that the way the bytes were serialized must match the way the bytes are serialized by Phoenix. For \`VARCHAR\`, \`CHAR\`, and \`UNSIGNED_*\` types, we use the HBase \`Bytes\` methods. The \`CHAR\` type expects only single-byte characters and the \`UNSIGNED\` types expect values greater than or equal to zero. For signed types (\`TINYINT\`, \`SMALLINT\`, \`INTEGER\` and \`BIGINT\`), Phoenix will flip the first bit so that negative values will sort before positive values. Because HBase sorts row keys in lexicographical order and negative value's first bit is 1 while positive 0 so that negative value is 'greater than' positive value if we don't flip the first bit. So if you stored integers by HBase native API and want to access them by Phoenix, make sure that all your data types are \`UNSIGNED\` types.

Our composite row keys are formed by simply concatenating the values together, with a zero byte character used as a separator after a variable length type.

If you create an HBase table like this:

\`\`\`shell
create 't1', {NAME => 'f1', VERSIONS => 5}
\`\`\`

then you have an HBase table with a name of \`t1\` and a column family with a name of \`f1\`. Remember, in HBase, you don't model the possible \`KeyValue\`s or the structure of the row key. This is the information you specify in Phoenix above and beyond the table and column family.

So in Phoenix, you'd create a view like this:

\`\`\`sql
CREATE VIEW "t1" ( pk VARCHAR PRIMARY KEY, "f1".val VARCHAR )
\`\`\`

The \`pk\` column declares that your row key is a \`VARCHAR\` (i.e. a string) while the \`"f1".val\` column declares that your HBase table will contain \`KeyValue\`s with a column family and column qualifier of \`"f1":VAL\` and that their value will be a \`VARCHAR\`.

Note that you don't need the double quotes if you create your HBase table with all caps names (since this is how Phoenix normalizes strings, by upper casing them). For example, with:

\`\`\`shell
create 'T1', {NAME => 'F1', VERSIONS => 5}
\`\`\`

you could create this Phoenix view:

\`\`\`sql
CREATE VIEW t1 ( pk VARCHAR PRIMARY KEY, f1.val VARCHAR )
\`\`\`

Or if you're creating new HBase tables, just let Phoenix do everything for you like this (No need to use the HBase shell at all.):

\`\`\`sql
CREATE TABLE t1 ( pk VARCHAR PRIMARY KEY, val VARCHAR )
\`\`\`

### Are there any tips for optimizing Phoenix?

* Use **Salting** to increase read/write performance\\
  Salting can significantly increase read/write performance by pre-splitting the data into multiple regions. Although Salting will yield better performance in most scenarios.\\
  Example:

  \`\`\`sql
  CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) SALT_BUCKETS=16
  \`\`\`

  *Note: Ideally for a 16 region server cluster with quad-core CPUs, choose salt buckets between 32-64 for optimal performance.*

* **Pre-split** table\\
  Salting does automatic table splitting but in case you want to exactly control where table split occurs with out adding extra byte or change row key order then you can pre-split a table.\\
  Example:

  \`\`\`sql
  CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) SPLIT ON ('CS','EU','NA')
  \`\`\`

* Use **multiple column families**\\
  Column family contains related data in separate files. If you query use selected columns then it make sense to group those columns together in a column family to improve read performance.\\
  Example:\\
  Following create table DDL will create two column faimiles A and B.

  \`\`\`sql
  CREATE TABLE TEST (MYKEY VARCHAR NOT NULL PRIMARY KEY, A.COL1 VARCHAR, A.COL2 VARCHAR, B.COL3 VARCHAR)
  \`\`\`

* Use **compression**\\
  On disk compression improves performance on large tables\\
  Example:

  \`\`\`sql
  CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) COMPRESSION='GZ'
  \`\`\`

* Create **indexes**
  See [How do I connect to secure HBase cluster?](#how-do-i-connect-to-secure-hbase-cluster)

* **Optimize cluster** parameters
  See [https://hbase.apache.org/docs/performance](https://hbase.apache.org/docs/performance)

* **Optimize Phoenix** parameters
  See [Configuration](/docs/fundamentals/configuration)

### How do I create Secondary Index on a table?

Starting with Phoenix version 2.1, Phoenix supports index over mutable and immutable data. Note that Phoenix 2.0.x only supports Index over immutable data. Index write performance index with immutable table is slightly faster than mutable table however data in immutable table cannot be updated.

Example:

* **Create table**\\
  Immutable table: \`create table test (mykey varchar primary key, col1 varchar, col2 varchar) IMMUTABLE_ROWS=true;\`\\
  Mutable table: \`create table test (mykey varchar primary key, col1 varchar, col2 varchar);\`
* **Creating index on col2**\\
  \`create index idx on test (col2)\`
* **Creating index on col1 and a covered index on col2**\\
  \`create index idx on test (col1) include (col2)\`\\
  Upsert rows in this test table and Phoenix query optimizer will choose correct index to use. You can see in [explain plan](/docs/grammar#explain) if Phoenix is using the index table. You can also give a [hint](/docs/grammar#hint) in Phoenix query to use a specific index.

See [Secondary Indexing](/docs/features/secondary-indexes) for further information

### Why isn't my secondary index being used?

The secondary index won't be used unless all columns used in the query are in it ( as indexed or covered columns). All columns making up the primary key of the data table will automatically be included in the index.

Example: DDL \`create table usertable (id varchar primary key, firstname varchar, lastname varchar); create index idx_name on usertable (firstname);\`

Query: DDL \`select id, firstname, lastname from usertable where firstname = 'foo';\`

Index would not be used in this case as \`lastname\` is not part of indexed or covered column. This can be verified by looking at the explain plan. To fix this create index that has either \`lastname\` part of index or covered column. Example: \`create idx_name on usertable (firstname) include (lastname);\`

You can force Phoenix to use secondary for uncovered columns by specifying an [index hint](/docs/features/secondary-indexes)

### How fast is Phoenix? Why is it so fast?

Phoenix is fast. Full table scan of 100M rows usually completes in 20 seconds (narrow table on a medium sized cluster). This time come down to few milliseconds if query contains filter on key columns. For filters on non-key columns or non-leading key columns, you can add index on these columns which leads to performance equivalent to filtering on key column by making copy of table with indexed column(s) part of key.

Why is Phoenix fast even when doing full scan:

1. Phoenix chunks up your query using the region boundaries and runs them in parallel on the client using a configurable number of threads.
2. The aggregation will be done in a coprocessor on the server-side, collapsing the amount of data that gets returned back to the client rather than returning it all.

### How do I connect to secure HBase cluster?

Specify the principal and corresponding keytab in the JDBC URL as show above.
For ancient Phoenix versions heck out the excellent [post](http://bigdatanoob.blogspot.com/2013/09/connect-phoenix-to-secure-hbase-cluster.html) by Anil Gupta

### What HBase and Hadoop versions are supported?

Phoenix 4.x supports HBase 1.x running on Hadoop 2

Phoenix 5.x supports HBase 2.x running on Hadoop 3

See the release notes and [BUILDING](/docs/fundamentals/building) in recent releases for the exact versions supported,
and on how to build Phoenix for specific HBase and Hadoop versions

### Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?

By default, Phoenix lets HBase manage the timestamps and just shows you the latest values for everything. However, Phoenix also allows arbitrary timestamps to be supplied by the user. To do that you'd specify a \`CurrentSCN\` at connection time, like this:

\`\`\`java
Properties props = new Properties();
props.setProperty("CurrentSCN", Long.toString(ts));
Connection conn = DriverManager.connect(myUrl, props);

conn.createStatement().execute("UPSERT INTO myTable VALUES ('a')");
conn.commit();
\`\`\`

The above is equivalent to doing this with the HBase API:

\`\`\`java
myTable.put(Bytes.toBytes('a'), ts);
\`\`\`

By specifying a \`CurrentSCN\`, you're telling Phoenix that you want everything for that connection to be done at that timestamp. Note that this applies to queries done on the connection as well - for example, a query over \`myTable\` above would not see the data it just upserted, since it only sees data that was created before its \`CurrentSCN\` property. This provides a way of doing snapshot, flashback, or point-in-time queries.

Keep in mind that creating a new connection is *not* an expensive operation. The same underlying \`HConnection\` is used for all connections to the same cluster, so it's more or less like instantiating a few objects.

### Why isn't my query doing a RANGE SCAN?

\`\`\`sql
CREATE TABLE TEST (
  pk1 char(1) not null,
  pk2 char(1) not null,
  pk3 char(1) not null,
  non-pk varchar,
  CONSTRAINT PK PRIMARY KEY(pk1, pk2, pk3)
);
\`\`\`

RANGE SCAN means that only a subset of the rows in your table will be scanned over. This occurs if you use one or more leading columns from your primary key constraint. Query that is not filtering on leading PK columns ex. \`select * from test where pk2='x' and pk3='y';\` will result in full scan whereas the following query will result in range scan \`select * from test where pk1='x' and pk2='y';\`. Note that you can add a secondary index on your \`pk2\` and \`pk3\` columns and that would cause a range scan to be done for the first query (over the index table).

DEGENERATE SCAN means that a query can't possibly return any rows. If we can determine that at compile time, then we don't bother to even run the scan.

FULL SCAN means that all rows of the table will be scanned over (potentially with a filter applied if you have a WHERE clause)

SKIP SCAN means that either a subset or all rows in your table will be scanned over, however it will skip large groups of rows depending on the conditions in your filter. See [this](http://phoenix-hbase.blogspot.com/2013/05/demystifying-skip-scan-in-phoenix.html) blog for more detail. We don't do a SKIP SCAN if you have no filter on the leading primary key columns, but you can force a SKIP SCAN by using the \`/*+ SKIP_SCAN */\` hint. Under some conditions, namely when the cardinality of your leading primary key columns is low, it will be more efficient than a FULL SCAN.

### Should I pool Phoenix JDBC Connections?

No, it is not necessary to pool Phoenix JDBC Connections.

Phoenix's Connection objects are different from most other JDBC Connections due to the underlying HBase connection. The Phoenix Connection object is designed to be a thin object that is inexpensive to create. If Phoenix Connections are reused, it is possible that the underlying HBase connection is not always left in a healthy state by the previous user. It is better to create new Phoenix Connections to ensure that you avoid any potential issues.

Implementing pooling for Phoenix could be done simply by creating a delegate Connection that instantiates a new Phoenix connection when retrieved from the pool and then closes the connection when returning it to the pool (see [PHOENIX-2388](https://issues.apache.org/jira/browse/PHOENIX-2388)).

### Why does Phoenix add an empty/dummy KeyValue when doing an upsert?

The empty or dummy \`KeyValue\` (with a column qualifier of \`_0\`) is needed to ensure that a given column is available
for all rows.

As you may know, data is stored in HBase as \`KeyValue\`s, meaning that
the full row key is stored for each column value. This also implies
that the row key is not stored at all unless there is at least one
column stored.

Now consider JDBC row which has an integer primary key, and several
columns which are all null. In order to be able to store the primary
key, a KeyValue needs to be stored to show that the row is present at
all. This column is represented by the empty column that you've
noticed. This allows doing a \`SELECT * FROM TABLE\` and receiving
records for all rows, even those whose non-pk columns are null.

The same issue comes up even if only one column is null for some (or
all) records. A scan over Phoenix will include the empty column to
ensure that rows that only consist of the primary key (and have null
for all non-key columns) will be included in a scan result.
`,o={title:"FAQ",description:"Frequently asked question about Phoenix",icon:"CircleQuestionMark"},d=[{href:"#i-want-to-get-started-is-there-a-phoenix-hello-world"},{href:"#what-is-the-phoenix-jdbc-url-syntax"},{href:"#is-there-a-way-to-bulk-load-in-phoenix"},{href:"#how-i-map-phoenix-table-to-an-existing-hbase-table"},{href:"#are-there-any-tips-for-optimizing-phoenix"},{href:"#how-do-i-create-secondary-index-on-a-table"},{href:"#why-isnt-my-secondary-index-being-used"},{href:"#how-fast-is-phoenix-why-is-it-so-fast"},{href:"#how-do-i-connect-to-secure-hbase-cluster"},{href:"#what-hbase-and-hadoop-versions-are-supported"},{href:"#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api"},{href:"#why-isnt-my-query-doing-a-range-scan"},{href:"#should-i-pool-phoenix-jdbc-connections"},{href:"#why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert"},{href:"/downloads"},{href:"/docs/installation"},{href:"/docs/fundamentals/client-classpath-and-jdbc-url#using-the-phoenix-jdbc-driver"},{href:"/docs#connection"},{href:"https://calcite.apache.org/avatica/docs/client_reference.html"},{href:"/docs/features/query-server"},{href:"/docs/features/bulk-loading"},{href:"#how-do-i-connect-to-secure-hbase-cluster"},{href:"https://hbase.apache.org/docs/performance"},{href:"/docs/fundamentals/configuration"},{href:"/docs/grammar#explain"},{href:"/docs/grammar#hint"},{href:"/docs/features/secondary-indexes"},{href:"/docs/features/secondary-indexes"},{href:"http://bigdatanoob.blogspot.com/2013/09/connect-phoenix-to-secure-hbase-cluster.html"},{href:"/docs/fundamentals/building"},{href:"http://phoenix-hbase.blogspot.com/2013/05/demystifying-skip-scan-in-phoenix.html"},{href:"https://issues.apache.org/jira/browse/PHOENIX-2388"}],c={contents:[{heading:"questions-answered-in-this-page",content:"I want to get started. Is there a Phoenix Hello World?"},{heading:"questions-answered-in-this-page",content:"What is the Phoenix JDBC URL syntax?"},{heading:"questions-answered-in-this-page",content:"Is there a way to bulk load in Phoenix?"},{heading:"questions-answered-in-this-page",content:"How I map Phoenix table to an existing HBase table?"},{heading:"questions-answered-in-this-page",content:"Are there any tips for optimizing Phoenix?"},{heading:"questions-answered-in-this-page",content:"How do I create Secondary Index on a table?"},{heading:"questions-answered-in-this-page",content:"Why isn't my secondary index being used?"},{heading:"questions-answered-in-this-page",content:"How fast is Phoenix? Why is it so fast?"},{heading:"questions-answered-in-this-page",content:"How do I connect to secure HBase cluster?"},{heading:"questions-answered-in-this-page",content:"What HBase and Hadoop versions are supported?"},{heading:"questions-answered-in-this-page",content:"Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?"},{heading:"questions-answered-in-this-page",content:"Why isn't my query doing a RANGE SCAN?"},{heading:"questions-answered-in-this-page",content:"Should I pool Phoenix JDBC Connections?"},{heading:"questions-answered-in-this-page",content:"Why does Phoenix add an empty or dummy KeyValue when doing an upsert?"},{heading:"i-want-to-get-started-is-there-a-phoenix-hello-world",content:"Pre-requisite: Download and install the latest Phoenix."},{heading:"using-console",content:"Start Sqlline:"},{heading:"using-console",content:"Execute the following statements when Sqlline connects:"},{heading:"using-console",content:"You should get the following output:"},{heading:"using-java",content:"Create test.java file with the following content:"},{heading:"using-java",content:"Compile and execute on command line"},{heading:"using-java",content:"You should get the following output"},{heading:"thick-driver",content:"See Using the Phoenix JDBC Driver for a more up-to-date description"},{heading:"thick-driver",content:"The Phoenix (Thick) Driver JDBC URL syntax is as follows (where elements in square brackets are optional):"},{heading:"thick-driver",content:"The simplest URL is:"},{heading:"thick-driver",content:"Whereas the most complicated URL is:"},{heading:"thick-driver",content:`Please note that each optional element in the URL requires all previous optional elements. For example, to specify the
HBase root ZNode, the ZooKeeper port must also be specified.`},{heading:"thick-driver",content:"See also Connection String."},{heading:"thin-driver",content:"The Phoenix Thin Driver (used with the Phoenix Query Server) JDBC URL syntax is as follows:"},{heading:"thin-driver",content:`There are a number of keys exposed for client-use. The most commonly-used keys are: url and serialization. The url
key is required to interact with the Phoenix Query Server.`},{heading:"thin-driver",content:"The simplest URL is:"},{heading:"thin-driver",content:"Where as very complicated URL is:"},{heading:"thin-driver",content:`Please refer to the Apache Avatica documentation for a full list of supported options in the Thin client JDBC URL,
or see the Query Server documentation`},{heading:"map-reduce",content:"See the example here"},{heading:"csv",content:"CSV data can be bulk loaded with built in utility named psql. Typical upsert rates are 20K - 50K rows per second (depends on how wide are the rows)."},{heading:"csv",content:"Usage example:"},{heading:"csv",content:"Create table using psql:"},{heading:"csv",content:"Upsert CSV bulk data:"},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"You can create both a Phoenix table or view through the CREATE TABLE/CREATE VIEW DDL statement on a pre-existing HBase table. In both cases, we'll leave the HBase metadata as-is. For CREATE TABLE, we'll create any metadata (table, column families) that doesn't already exist. We'll also add an empty key value for each row so that queries behave as expected (without requiring all columns to be projected during scans)."},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"The other caveat is that the way the bytes were serialized must match the way the bytes are serialized by Phoenix. For VARCHAR, CHAR, and UNSIGNED_* types, we use the HBase Bytes methods. The CHAR type expects only single-byte characters and the UNSIGNED types expect values greater than or equal to zero. For signed types (TINYINT, SMALLINT, INTEGER and BIGINT), Phoenix will flip the first bit so that negative values will sort before positive values. Because HBase sorts row keys in lexicographical order and negative value's first bit is 1 while positive 0 so that negative value is 'greater than' positive value if we don't flip the first bit. So if you stored integers by HBase native API and want to access them by Phoenix, make sure that all your data types are UNSIGNED types."},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"Our composite row keys are formed by simply concatenating the values together, with a zero byte character used as a separator after a variable length type."},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"If you create an HBase table like this:"},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"then you have an HBase table with a name of t1 and a column family with a name of f1. Remember, in HBase, you don't model the possible KeyValues or the structure of the row key. This is the information you specify in Phoenix above and beyond the table and column family."},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"So in Phoenix, you'd create a view like this:"},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:'The pk column declares that your row key is a VARCHAR (i.e. a string) while the "f1".val column declares that your HBase table will contain KeyValues with a column family and column qualifier of "f1":VAL and that their value will be a VARCHAR.'},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"Note that you don't need the double quotes if you create your HBase table with all caps names (since this is how Phoenix normalizes strings, by upper casing them). For example, with:"},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"you could create this Phoenix view:"},{heading:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"Or if you're creating new HBase tables, just let Phoenix do everything for you like this (No need to use the HBase shell at all.):"},{heading:"are-there-any-tips-for-optimizing-phoenix",content:"Use Salting to increase read/write performanceSalting can significantly increase read/write performance by pre-splitting the data into multiple regions. Although Salting will yield better performance in most scenarios.Example:"},{heading:"are-there-any-tips-for-optimizing-phoenix",content:"Note: Ideally for a 16 region server cluster with quad-core CPUs, choose salt buckets between 32-64 for optimal performance."},{heading:"are-there-any-tips-for-optimizing-phoenix",content:"Pre-split tableSalting does automatic table splitting but in case you want to exactly control where table split occurs with out adding extra byte or change row key order then you can pre-split a table.Example:"},{heading:"are-there-any-tips-for-optimizing-phoenix",content:"Use multiple column familiesColumn family contains related data in separate files. If you query use selected columns then it make sense to group those columns together in a column family to improve read performance.Example:Following create table DDL will create two column faimiles A and B."},{heading:"are-there-any-tips-for-optimizing-phoenix",content:"Use compressionOn disk compression improves performance on large tablesExample:"},{heading:"are-there-any-tips-for-optimizing-phoenix",content:`Create indexes
See How do I connect to secure HBase cluster?`},{heading:"are-there-any-tips-for-optimizing-phoenix",content:`Optimize cluster parameters
See https://hbase.apache.org/docs/performance`},{heading:"are-there-any-tips-for-optimizing-phoenix",content:`Optimize Phoenix parameters
See Configuration`},{heading:"how-do-i-create-secondary-index-on-a-table",content:"Starting with Phoenix version 2.1, Phoenix supports index over mutable and immutable data. Note that Phoenix 2.0.x only supports Index over immutable data. Index write performance index with immutable table is slightly faster than mutable table however data in immutable table cannot be updated."},{heading:"how-do-i-create-secondary-index-on-a-table",content:"Example:"},{heading:"how-do-i-create-secondary-index-on-a-table",content:"Create tableImmutable table: create table test (mykey varchar primary key, col1 varchar, col2 varchar) IMMUTABLE_ROWS=true;Mutable table: create table test (mykey varchar primary key, col1 varchar, col2 varchar);"},{heading:"how-do-i-create-secondary-index-on-a-table",content:"Creating index on col2create index idx on test (col2)"},{heading:"how-do-i-create-secondary-index-on-a-table",content:"Creating index on col1 and a covered index on col2create index idx on test (col1) include (col2)Upsert rows in this test table and Phoenix query optimizer will choose correct index to use. You can see in explain plan if Phoenix is using the index table. You can also give a hint in Phoenix query to use a specific index."},{heading:"how-do-i-create-secondary-index-on-a-table",content:"See Secondary Indexing for further information"},{heading:"why-isnt-my-secondary-index-being-used",content:"The secondary index won't be used unless all columns used in the query are in it ( as indexed or covered columns). All columns making up the primary key of the data table will automatically be included in the index."},{heading:"why-isnt-my-secondary-index-being-used",content:"Example: DDL create table usertable (id varchar primary key, firstname varchar, lastname varchar); create index idx_name on usertable (firstname);"},{heading:"why-isnt-my-secondary-index-being-used",content:"Query: DDL select id, firstname, lastname from usertable where firstname = 'foo';"},{heading:"why-isnt-my-secondary-index-being-used",content:"Index would not be used in this case as lastname is not part of indexed or covered column. This can be verified by looking at the explain plan. To fix this create index that has either lastname part of index or covered column. Example: create idx_name on usertable (firstname) include (lastname);"},{heading:"why-isnt-my-secondary-index-being-used",content:"You can force Phoenix to use secondary for uncovered columns by specifying an index hint"},{heading:"how-fast-is-phoenix-why-is-it-so-fast",content:"Phoenix is fast. Full table scan of 100M rows usually completes in 20 seconds (narrow table on a medium sized cluster). This time come down to few milliseconds if query contains filter on key columns. For filters on non-key columns or non-leading key columns, you can add index on these columns which leads to performance equivalent to filtering on key column by making copy of table with indexed column(s) part of key."},{heading:"how-fast-is-phoenix-why-is-it-so-fast",content:"Why is Phoenix fast even when doing full scan:"},{heading:"how-fast-is-phoenix-why-is-it-so-fast",content:"Phoenix chunks up your query using the region boundaries and runs them in parallel on the client using a configurable number of threads."},{heading:"how-fast-is-phoenix-why-is-it-so-fast",content:"The aggregation will be done in a coprocessor on the server-side, collapsing the amount of data that gets returned back to the client rather than returning it all."},{heading:"how-do-i-connect-to-secure-hbase-cluster",content:`Specify the principal and corresponding keytab in the JDBC URL as show above.
For ancient Phoenix versions heck out the excellent post by Anil Gupta`},{heading:"what-hbase-and-hadoop-versions-are-supported",content:"Phoenix 4.x supports HBase 1.x running on Hadoop 2"},{heading:"what-hbase-and-hadoop-versions-are-supported",content:"Phoenix 5.x supports HBase 2.x running on Hadoop 3"},{heading:"what-hbase-and-hadoop-versions-are-supported",content:`See the release notes and BUILDING in recent releases for the exact versions supported,
and on how to build Phoenix for specific HBase and Hadoop versions`},{heading:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",content:"By default, Phoenix lets HBase manage the timestamps and just shows you the latest values for everything. However, Phoenix also allows arbitrary timestamps to be supplied by the user. To do that you'd specify a CurrentSCN at connection time, like this:"},{heading:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",content:"The above is equivalent to doing this with the HBase API:"},{heading:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",content:"By specifying a CurrentSCN, you're telling Phoenix that you want everything for that connection to be done at that timestamp. Note that this applies to queries done on the connection as well - for example, a query over myTable above would not see the data it just upserted, since it only sees data that was created before its CurrentSCN property. This provides a way of doing snapshot, flashback, or point-in-time queries."},{heading:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",content:"Keep in mind that creating a new connection is not an expensive operation. The same underlying HConnection is used for all connections to the same cluster, so it's more or less like instantiating a few objects."},{heading:"why-isnt-my-query-doing-a-range-scan",content:"RANGE SCAN means that only a subset of the rows in your table will be scanned over. This occurs if you use one or more leading columns from your primary key constraint. Query that is not filtering on leading PK columns ex. select * from test where pk2='x' and pk3='y'; will result in full scan whereas the following query will result in range scan select * from test where pk1='x' and pk2='y';. Note that you can add a secondary index on your pk2 and pk3 columns and that would cause a range scan to be done for the first query (over the index table)."},{heading:"why-isnt-my-query-doing-a-range-scan",content:"DEGENERATE SCAN means that a query can't possibly return any rows. If we can determine that at compile time, then we don't bother to even run the scan."},{heading:"why-isnt-my-query-doing-a-range-scan",content:"FULL SCAN means that all rows of the table will be scanned over (potentially with a filter applied if you have a WHERE clause)"},{heading:"why-isnt-my-query-doing-a-range-scan",content:"SKIP SCAN means that either a subset or all rows in your table will be scanned over, however it will skip large groups of rows depending on the conditions in your filter. See this blog for more detail. We don't do a SKIP SCAN if you have no filter on the leading primary key columns, but you can force a SKIP SCAN by using the /*+ SKIP_SCAN */ hint. Under some conditions, namely when the cardinality of your leading primary key columns is low, it will be more efficient than a FULL SCAN."},{heading:"should-i-pool-phoenix-jdbc-connections",content:"No, it is not necessary to pool Phoenix JDBC Connections."},{heading:"should-i-pool-phoenix-jdbc-connections",content:"Phoenix's Connection objects are different from most other JDBC Connections due to the underlying HBase connection. The Phoenix Connection object is designed to be a thin object that is inexpensive to create. If Phoenix Connections are reused, it is possible that the underlying HBase connection is not always left in a healthy state by the previous user. It is better to create new Phoenix Connections to ensure that you avoid any potential issues."},{heading:"should-i-pool-phoenix-jdbc-connections",content:"Implementing pooling for Phoenix could be done simply by creating a delegate Connection that instantiates a new Phoenix connection when retrieved from the pool and then closes the connection when returning it to the pool (see PHOENIX-2388)."},{heading:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",content:`The empty or dummy KeyValue (with a column qualifier of _0) is needed to ensure that a given column is available
for all rows.`},{heading:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",content:`As you may know, data is stored in HBase as KeyValues, meaning that
the full row key is stored for each column value. This also implies
that the row key is not stored at all unless there is at least one
column stored.`},{heading:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",content:`Now consider JDBC row which has an integer primary key, and several
columns which are all null. In order to be able to store the primary
key, a KeyValue needs to be stored to show that the row is present at
all. This column is represented by the empty column that you've
noticed. This allows doing a SELECT * FROM TABLE and receiving
records for all rows, even those whose non-pk columns are null.`},{heading:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",content:`The same issue comes up even if only one column is null for some (or
all) records. A scan over Phoenix will include the empty column to
ensure that rows that only consist of the primary key (and have null
for all non-key columns) will be included in a scan result.`}],headings:[{id:"questions-answered-in-this-page",content:"Questions answered in this page:"},{id:"i-want-to-get-started-is-there-a-phoenix-hello-world",content:"I want to get started. Is there a Phoenix Hello World?"},{id:"using-console",content:"Using console"},{id:"using-java",content:"Using Java"},{id:"what-is-the-phoenix-jdbc-url-syntax",content:"What is the Phoenix JDBC URL syntax?"},{id:"thick-driver",content:"Thick Driver"},{id:"thin-driver",content:"Thin Driver"},{id:"is-there-a-way-to-bulk-load-in-phoenix",content:"Is there a way to bulk load in Phoenix?"},{id:"map-reduce",content:"Map Reduce"},{id:"csv",content:"CSV"},{id:"how-i-map-phoenix-table-to-an-existing-hbase-table",content:"How I map Phoenix table to an existing HBase table?"},{id:"are-there-any-tips-for-optimizing-phoenix",content:"Are there any tips for optimizing Phoenix?"},{id:"how-do-i-create-secondary-index-on-a-table",content:"How do I create Secondary Index on a table?"},{id:"why-isnt-my-secondary-index-being-used",content:"Why isn't my secondary index being used?"},{id:"how-fast-is-phoenix-why-is-it-so-fast",content:"How fast is Phoenix? Why is it so fast?"},{id:"how-do-i-connect-to-secure-hbase-cluster",content:"How do I connect to secure HBase cluster?"},{id:"what-hbase-and-hadoop-versions-are-supported",content:"What HBase and Hadoop versions are supported?"},{id:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",content:"Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?"},{id:"why-isnt-my-query-doing-a-range-scan",content:"Why isn't my query doing a RANGE SCAN?"},{id:"should-i-pool-phoenix-jdbc-connections",content:"Should I pool Phoenix JDBC Connections?"},{id:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",content:"Why does Phoenix add an empty/dummy KeyValue when doing an upsert?"}]};const p=[{depth:2,url:"#questions-answered-in-this-page",title:e.jsx(e.Fragment,{children:"Questions answered in this page:"})},{depth:3,url:"#i-want-to-get-started-is-there-a-phoenix-hello-world",title:e.jsxs(e.Fragment,{children:["I want to get started. Is there a Phoenix ",e.jsx("em",{children:"Hello World"}),"?"]})},{depth:4,url:"#using-console",title:e.jsx(e.Fragment,{children:"Using console"})},{depth:4,url:"#using-java",title:e.jsx(e.Fragment,{children:"Using Java"})},{depth:3,url:"#what-is-the-phoenix-jdbc-url-syntax",title:e.jsx(e.Fragment,{children:"What is the Phoenix JDBC URL syntax?"})},{depth:4,url:"#thick-driver",title:e.jsx(e.Fragment,{children:"Thick Driver"})},{depth:4,url:"#thin-driver",title:e.jsx(e.Fragment,{children:"Thin Driver"})},{depth:3,url:"#is-there-a-way-to-bulk-load-in-phoenix",title:e.jsx(e.Fragment,{children:"Is there a way to bulk load in Phoenix?"})},{depth:4,url:"#map-reduce",title:e.jsx(e.Fragment,{children:"Map Reduce"})},{depth:4,url:"#csv",title:e.jsx(e.Fragment,{children:"CSV"})},{depth:3,url:"#how-i-map-phoenix-table-to-an-existing-hbase-table",title:e.jsx(e.Fragment,{children:"How I map Phoenix table to an existing HBase table?"})},{depth:3,url:"#are-there-any-tips-for-optimizing-phoenix",title:e.jsx(e.Fragment,{children:"Are there any tips for optimizing Phoenix?"})},{depth:3,url:"#how-do-i-create-secondary-index-on-a-table",title:e.jsx(e.Fragment,{children:"How do I create Secondary Index on a table?"})},{depth:3,url:"#why-isnt-my-secondary-index-being-used",title:e.jsx(e.Fragment,{children:"Why isn't my secondary index being used?"})},{depth:3,url:"#how-fast-is-phoenix-why-is-it-so-fast",title:e.jsx(e.Fragment,{children:"How fast is Phoenix? Why is it so fast?"})},{depth:3,url:"#how-do-i-connect-to-secure-hbase-cluster",title:e.jsx(e.Fragment,{children:"How do I connect to secure HBase cluster?"})},{depth:3,url:"#what-hbase-and-hadoop-versions-are-supported",title:e.jsx(e.Fragment,{children:"What HBase and Hadoop versions are supported?"})},{depth:3,url:"#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",title:e.jsx(e.Fragment,{children:"Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?"})},{depth:3,url:"#why-isnt-my-query-doing-a-range-scan",title:e.jsx(e.Fragment,{children:"Why isn't my query doing a RANGE SCAN?"})},{depth:3,url:"#should-i-pool-phoenix-jdbc-connections",title:e.jsx(e.Fragment,{children:"Should I pool Phoenix JDBC Connections?"})},{depth:3,url:"#why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",title:e.jsx(e.Fragment,{children:"Why does Phoenix add an empty/dummy KeyValue when doing an upsert?"})}];function a(s){const i={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components},{Step:n,Steps:t}=i;return n||h("Step"),t||h("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"questions-answered-in-this-page",children:"Questions answered in this page:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#i-want-to-get-started-is-there-a-phoenix-hello-world",children:"I want to get started. Is there a Phoenix Hello World?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#what-is-the-phoenix-jdbc-url-syntax",children:"What is the Phoenix JDBC URL syntax?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#is-there-a-way-to-bulk-load-in-phoenix",children:"Is there a way to bulk load in Phoenix?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#how-i-map-phoenix-table-to-an-existing-hbase-table",children:"How I map Phoenix table to an existing HBase table?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#are-there-any-tips-for-optimizing-phoenix",children:"Are there any tips for optimizing Phoenix?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#how-do-i-create-secondary-index-on-a-table",children:"How do I create Secondary Index on a table?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#why-isnt-my-secondary-index-being-used",children:"Why isn't my secondary index being used?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#how-fast-is-phoenix-why-is-it-so-fast",children:"How fast is Phoenix? Why is it so fast?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#how-do-i-connect-to-secure-hbase-cluster",children:"How do I connect to secure HBase cluster?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#what-hbase-and-hadoop-versions-are-supported",children:"What HBase and Hadoop versions are supported?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",children:"Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#why-isnt-my-query-doing-a-range-scan",children:"Why isn't my query doing a RANGE SCAN?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#should-i-pool-phoenix-jdbc-connections",children:"Should I pool Phoenix JDBC Connections?"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"#why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",children:"Why does Phoenix add an empty or dummy KeyValue when doing an upsert?"})}),`
`]}),`
`,e.jsxs(i.h3,{id:"i-want-to-get-started-is-there-a-phoenix-hello-world",children:["I want to get started. Is there a Phoenix ",e.jsx(i.em,{children:"Hello World"}),"?"]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.em,{children:"Pre-requisite:"})," ",e.jsx(i.a,{href:"/downloads",children:"Download"})," and ",e.jsx(i.a,{href:"/docs/installation",children:"install"})," the latest Phoenix."]}),`
`,e.jsx(i.h4,{id:"using-console",children:"Using console"}),`
`,e.jsxs(t,{children:[e.jsxs(n,{children:[e.jsx(i.p,{children:"Start Sqlline:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sqlline.py"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zookeeper "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"quorum"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hosts]"})]})})})})]}),e.jsxs(n,{children:[e.jsx(i.p,{children:"Execute the following statements when Sqlline connects:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (mykey "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"integer"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" not null"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" primary key"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", mycolumn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"varchar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"upsert "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"into"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" test "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"values"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'Hello'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"upsert "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"into"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" test "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"values"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'World!'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"select"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" *"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" test;"})]})]})})})]}),e.jsxs(n,{children:[e.jsx(i.p,{children:"You should get the following output:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"+-------+------------+"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"| MYKEY |  MYCOLUMN  |"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"+-------+------------+"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"| 1     | Hello      |"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"| 2     | World!     |"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"+-------+------------+"})})]})})})]})]}),`
`,e.jsx(i.h4,{id:"using-java",children:"Using Java"}),`
`,e.jsx(i.p,{children:"Create test.java file with the following content:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.Connection;"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.DriverManager;"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.ResultSet;"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.SQLException;"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.PreparedStatement;"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.sql.Statement;"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"	public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"args"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" SQLException {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		Statement stmt "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		ResultSet rset "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		Connection con "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:[zookeeper quorum hosts]"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		stmt "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" con."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"create table test (mykey integer not null primary key, mycolumn varchar)"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"upsert into test values (1,'Hello')"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"upsert into test values (2,'World!')"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		con."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"commit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		PreparedStatement statement "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" con."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"select * from test"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		rset "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" statement."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"		while"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (rset."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"			System.out."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rset."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"mycolumn"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		}"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		statement."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"close"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"		con."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"close"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"	}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.p,{children:"Compile and execute on command line"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" javac"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test.java"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" java"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -cp"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "../phoenix-[version]-client.jar:."'}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"})]})]})})}),`
`,e.jsx(i.p,{children:"You should get the following output"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Hello"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"World!"})})]})})}),`
`,e.jsx(i.h3,{id:"what-is-the-phoenix-jdbc-url-syntax",children:"What is the Phoenix JDBC URL syntax?"}),`
`,e.jsx(i.h4,{id:"thick-driver",children:"Thick Driver"}),`
`,e.jsx(i.p,{children:e.jsxs(i.strong,{children:["See ",e.jsx(i.a,{href:"/docs/fundamentals/client-classpath-and-jdbc-url#using-the-phoenix-jdbc-driver",children:"Using the Phoenix JDBC Driver"})," for a more up-to-date description"]})}),`
`,e.jsx(i.p,{children:"The Phoenix (Thick) Driver JDBC URL syntax is as follows (where elements in square brackets are optional):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix:[comma-separated ZooKeeper Quorum Hosts [: ZK port [:hbase root znode [:kerberos_principal [:path to kerberos keytab] ] ] ]"})})})})}),`
`,e.jsx(i.p,{children:"The simplest URL is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix"})})})})}),`
`,e.jsx(i.p,{children:"Whereas the most complicated URL is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix:zookeeper1.domain,zookeeper2.domain,zookeeper3.domain:2181:/hbase-1:phoenix@EXAMPLE.COM:/etc/security/keytabs/phoenix.keytab"})})})})}),`
`,e.jsxs(i.p,{children:[`Please note that each optional element in the URL requires all previous optional elements. For example, to specify the
HBase root ZNode, the ZooKeeper port `,e.jsx(i.em,{children:"must"})," also be specified."]}),`
`,e.jsxs(i.p,{children:["See also ",e.jsx(i.a,{href:"/docs#connection",children:"Connection String"}),"."]}),`
`,e.jsx(i.h4,{id:"thin-driver",children:"Thin Driver"}),`
`,e.jsx(i.p,{children:"The Phoenix Thin Driver (used with the Phoenix Query Server) JDBC URL syntax is as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix:thin:[key=value[;key=value...]]"})})})})}),`
`,e.jsxs(i.p,{children:["There are a number of keys exposed for client-use. The most commonly-used keys are: ",e.jsx(i.code,{children:"url"})," and ",e.jsx(i.code,{children:"serialization"}),". The ",e.jsx(i.code,{children:"url"}),`
key is required to interact with the Phoenix Query Server.`]}),`
`,e.jsx(i.p,{children:"The simplest URL is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix:thin:url=http://localhost:8765"})})})})}),`
`,e.jsx(i.p,{children:"Where as very complicated URL is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:phoenix:thin:url=http://queryserver.domain:8765;serialization=PROTOBUF;authentication=SPENGO;principal=phoenix@EXAMPLE.COM;keytab=/etc/security/keytabs/phoenix.keytab"})})})})}),`
`,e.jsxs(i.p,{children:["Please refer to the ",e.jsx(i.a,{href:"https://calcite.apache.org/avatica/docs/client_reference.html",children:"Apache Avatica documentation"}),` for a full list of supported options in the Thin client JDBC URL,
or see the `,e.jsx(i.a,{href:"/docs/features/query-server",children:"Query Server documentation"})]}),`
`,e.jsx(i.h3,{id:"is-there-a-way-to-bulk-load-in-phoenix",children:"Is there a way to bulk load in Phoenix?"}),`
`,e.jsx(i.h4,{id:"map-reduce",children:"Map Reduce"}),`
`,e.jsxs(i.p,{children:["See the example ",e.jsx(i.a,{href:"/docs/features/bulk-loading",children:"here"})]}),`
`,e.jsx(i.h4,{id:"csv",children:"CSV"}),`
`,e.jsxs(i.p,{children:["CSV data can be bulk loaded with built in utility named ",e.jsx(i.code,{children:"psql"}),". Typical upsert rates are 20K - 50K rows per second (depends on how wide are the rows)."]}),`
`,e.jsx(i.p,{children:"Usage example:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Create table using psql:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zookeeper] ../examples/web_stat.sql"})]})})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Upsert CSV bulk data:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zookeeper] ../examples/web_stat.csv"})]})})})}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"how-i-map-phoenix-table-to-an-existing-hbase-table",children:"How I map Phoenix table to an existing HBase table?"}),`
`,e.jsxs(i.p,{children:["You can create both a Phoenix table or view through the ",e.jsx(i.code,{children:"CREATE TABLE"}),"/",e.jsx(i.code,{children:"CREATE VIEW"})," DDL statement on a pre-existing HBase table. In both cases, we'll leave the HBase metadata as-is. For ",e.jsx(i.code,{children:"CREATE TABLE"}),", we'll create any metadata (table, column families) that doesn't already exist. We'll also add an empty key value for each row so that queries behave as expected (without requiring all columns to be projected during scans)."]}),`
`,e.jsxs(i.p,{children:["The other caveat is that the way the bytes were serialized must match the way the bytes are serialized by Phoenix. For ",e.jsx(i.code,{children:"VARCHAR"}),", ",e.jsx(i.code,{children:"CHAR"}),", and ",e.jsx(i.code,{children:"UNSIGNED_*"})," types, we use the HBase ",e.jsx(i.code,{children:"Bytes"})," methods. The ",e.jsx(i.code,{children:"CHAR"})," type expects only single-byte characters and the ",e.jsx(i.code,{children:"UNSIGNED"})," types expect values greater than or equal to zero. For signed types (",e.jsx(i.code,{children:"TINYINT"}),", ",e.jsx(i.code,{children:"SMALLINT"}),", ",e.jsx(i.code,{children:"INTEGER"})," and ",e.jsx(i.code,{children:"BIGINT"}),"), Phoenix will flip the first bit so that negative values will sort before positive values. Because HBase sorts row keys in lexicographical order and negative value's first bit is 1 while positive 0 so that negative value is 'greater than' positive value if we don't flip the first bit. So if you stored integers by HBase native API and want to access them by Phoenix, make sure that all your data types are ",e.jsx(i.code,{children:"UNSIGNED"})," types."]}),`
`,e.jsx(i.p,{children:"Our composite row keys are formed by simply concatenating the values together, with a zero byte character used as a separator after a variable length type."}),`
`,e.jsx(i.p,{children:"If you create an HBase table like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 't1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'f1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]})})})}),`
`,e.jsxs(i.p,{children:["then you have an HBase table with a name of ",e.jsx(i.code,{children:"t1"})," and a column family with a name of ",e.jsx(i.code,{children:"f1"}),". Remember, in HBase, you don't model the possible ",e.jsx(i.code,{children:"KeyValue"}),"s or the structure of the row key. This is the information you specify in Phoenix above and beyond the table and column family."]}),`
`,e.jsx(i.p,{children:"So in Phoenix, you'd create a view like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:' "'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"t1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'" ( pk '}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"f1"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".val "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" )"})]})})})}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"pk"})," column declares that your row key is a ",e.jsx(i.code,{children:"VARCHAR"})," (i.e. a string) while the ",e.jsx(i.code,{children:'"f1".val'})," column declares that your HBase table will contain ",e.jsx(i.code,{children:"KeyValue"}),"s with a column family and column qualifier of ",e.jsx(i.code,{children:'"f1":VAL'})," and that their value will be a ",e.jsx(i.code,{children:"VARCHAR"}),"."]}),`
`,e.jsx(i.p,{children:"Note that you don't need the double quotes if you create your HBase table with all caps names (since this is how Phoenix normalizes strings, by upper casing them). For example, with:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'T1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'F1',"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 5"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"})]})})})}),`
`,e.jsx(i.p,{children:"you could create this Phoenix view:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" t1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ( pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"f1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"val"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" )"})]})})})}),`
`,e.jsx(i.p,{children:"Or if you're creating new HBase tables, just let Phoenix do everything for you like this (No need to use the HBase shell at all.):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" t1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ( pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", val "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" )"})]})})})}),`
`,e.jsx(i.h3,{id:"are-there-any-tips-for-optimizing-phoenix",children:"Are there any tips for optimizing Phoenix?"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.strong,{children:"Salting"})," to increase read/write performance",e.jsx(i.br,{}),`
`,"Salting can significantly increase read/write performance by pre-splitting the data into multiple regions. Although Salting will yield better performance in most scenarios.",e.jsx(i.br,{}),`
`,"Example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TEST"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (HOST "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DESCRIPTION"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") SALT_BUCKETS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"16"})]})})})}),`
`,e.jsx(i.p,{children:e.jsx(i.em,{children:"Note: Ideally for a 16 region server cluster with quad-core CPUs, choose salt buckets between 32-64 for optimal performance."})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Pre-split"})," table",e.jsx(i.br,{}),`
`,"Salting does automatic table splitting but in case you want to exactly control where table split occurs with out adding extra byte or change row key order then you can pre-split a table.",e.jsx(i.br,{}),`
`,"Example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TEST"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (HOST "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DESCRIPTION"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") SPLIT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'CS'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'EU'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'NA'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.strong,{children:"multiple column families"}),e.jsx(i.br,{}),`
`,"Column family contains related data in separate files. If you query use selected columns then it make sense to group those columns together in a column family to improve read performance.",e.jsx(i.br,{}),`
`,"Example:",e.jsx(i.br,{}),`
`,"Following create table DDL will create two column faimiles A and B."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TEST"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (MYKEY "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"A"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COL1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"A"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COL2"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"B"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COL3"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.strong,{children:"compression"}),e.jsx(i.br,{}),`
`,"On disk compression improves performance on large tables",e.jsx(i.br,{}),`
`,"Example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TEST"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (HOST "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DESCRIPTION"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"COMPRESSION="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'GZ'"})]})})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Create ",e.jsx(i.strong,{children:"indexes"}),`
See `,e.jsx(i.a,{href:"#how-do-i-connect-to-secure-hbase-cluster",children:"How do I connect to secure HBase cluster?"})]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Optimize cluster"}),` parameters
See `,e.jsx(i.a,{href:"https://hbase.apache.org/docs/performance",children:"https://hbase.apache.org/docs/performance"})]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Optimize Phoenix"}),` parameters
See `,e.jsx(i.a,{href:"/docs/fundamentals/configuration",children:"Configuration"})]}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"how-do-i-create-secondary-index-on-a-table",children:"How do I create Secondary Index on a table?"}),`
`,e.jsx(i.p,{children:"Starting with Phoenix version 2.1, Phoenix supports index over mutable and immutable data. Note that Phoenix 2.0.x only supports Index over immutable data. Index write performance index with immutable table is slightly faster than mutable table however data in immutable table cannot be updated."}),`
`,e.jsx(i.p,{children:"Example:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Create table"}),e.jsx(i.br,{}),`
`,"Immutable table: ",e.jsx(i.code,{children:"create table test (mykey varchar primary key, col1 varchar, col2 varchar) IMMUTABLE_ROWS=true;"}),e.jsx(i.br,{}),`
`,"Mutable table: ",e.jsx(i.code,{children:"create table test (mykey varchar primary key, col1 varchar, col2 varchar);"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Creating index on col2"}),e.jsx(i.br,{}),`
`,e.jsx(i.code,{children:"create index idx on test (col2)"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Creating index on col1 and a covered index on col2"}),e.jsx(i.br,{}),`
`,e.jsx(i.code,{children:"create index idx on test (col1) include (col2)"}),e.jsx(i.br,{}),`
`,"Upsert rows in this test table and Phoenix query optimizer will choose correct index to use. You can see in ",e.jsx(i.a,{href:"/docs/grammar#explain",children:"explain plan"})," if Phoenix is using the index table. You can also give a ",e.jsx(i.a,{href:"/docs/grammar#hint",children:"hint"})," in Phoenix query to use a specific index."]}),`
`]}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/features/secondary-indexes",children:"Secondary Indexing"})," for further information"]}),`
`,e.jsx(i.h3,{id:"why-isnt-my-secondary-index-being-used",children:"Why isn't my secondary index being used?"}),`
`,e.jsx(i.p,{children:"The secondary index won't be used unless all columns used in the query are in it ( as indexed or covered columns). All columns making up the primary key of the data table will automatically be included in the index."}),`
`,e.jsxs(i.p,{children:["Example: DDL ",e.jsx(i.code,{children:"create table usertable (id varchar primary key, firstname varchar, lastname varchar); create index idx_name on usertable (firstname);"})]}),`
`,e.jsxs(i.p,{children:["Query: DDL ",e.jsx(i.code,{children:"select id, firstname, lastname from usertable where firstname = 'foo';"})]}),`
`,e.jsxs(i.p,{children:["Index would not be used in this case as ",e.jsx(i.code,{children:"lastname"})," is not part of indexed or covered column. This can be verified by looking at the explain plan. To fix this create index that has either ",e.jsx(i.code,{children:"lastname"})," part of index or covered column. Example: ",e.jsx(i.code,{children:"create idx_name on usertable (firstname) include (lastname);"})]}),`
`,e.jsxs(i.p,{children:["You can force Phoenix to use secondary for uncovered columns by specifying an ",e.jsx(i.a,{href:"/docs/features/secondary-indexes",children:"index hint"})]}),`
`,e.jsx(i.h3,{id:"how-fast-is-phoenix-why-is-it-so-fast",children:"How fast is Phoenix? Why is it so fast?"}),`
`,e.jsx(i.p,{children:"Phoenix is fast. Full table scan of 100M rows usually completes in 20 seconds (narrow table on a medium sized cluster). This time come down to few milliseconds if query contains filter on key columns. For filters on non-key columns or non-leading key columns, you can add index on these columns which leads to performance equivalent to filtering on key column by making copy of table with indexed column(s) part of key."}),`
`,e.jsx(i.p,{children:"Why is Phoenix fast even when doing full scan:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Phoenix chunks up your query using the region boundaries and runs them in parallel on the client using a configurable number of threads."}),`
`,e.jsx(i.li,{children:"The aggregation will be done in a coprocessor on the server-side, collapsing the amount of data that gets returned back to the client rather than returning it all."}),`
`]}),`
`,e.jsx(i.h3,{id:"how-do-i-connect-to-secure-hbase-cluster",children:"How do I connect to secure HBase cluster?"}),`
`,e.jsxs(i.p,{children:[`Specify the principal and corresponding keytab in the JDBC URL as show above.
For ancient Phoenix versions heck out the excellent `,e.jsx(i.a,{href:"http://bigdatanoob.blogspot.com/2013/09/connect-phoenix-to-secure-hbase-cluster.html",children:"post"})," by Anil Gupta"]}),`
`,e.jsx(i.h3,{id:"what-hbase-and-hadoop-versions-are-supported",children:"What HBase and Hadoop versions are supported?"}),`
`,e.jsx(i.p,{children:"Phoenix 4.x supports HBase 1.x running on Hadoop 2"}),`
`,e.jsx(i.p,{children:"Phoenix 5.x supports HBase 2.x running on Hadoop 3"}),`
`,e.jsxs(i.p,{children:["See the release notes and ",e.jsx(i.a,{href:"/docs/fundamentals/building",children:"BUILDING"}),` in recent releases for the exact versions supported,
and on how to build Phoenix for specific HBase and Hadoop versions`]}),`
`,e.jsx(i.h3,{id:"can-phoenix-work-on-tables-with-arbitrary-timestamp-as-flexible-as-hbase-api",children:"Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?"}),`
`,e.jsxs(i.p,{children:["By default, Phoenix lets HBase manage the timestamps and just shows you the latest values for everything. However, Phoenix also allows arbitrary timestamps to be supplied by the user. To do that you'd specify a ",e.jsx(i.code,{children:"CurrentSCN"})," at connection time, like this:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Properties props "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Properties"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"CurrentSCN"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Long."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ts));"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"connect"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(myUrl, props);"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"execute"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"UPSERT INTO myTable VALUES ('a')"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"commit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`,e.jsx(i.p,{children:"The above is equivalent to doing this with the HBase API:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"myTable."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"put"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Bytes."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'a'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), ts);"})]})})})}),`
`,e.jsxs(i.p,{children:["By specifying a ",e.jsx(i.code,{children:"CurrentSCN"}),", you're telling Phoenix that you want everything for that connection to be done at that timestamp. Note that this applies to queries done on the connection as well - for example, a query over ",e.jsx(i.code,{children:"myTable"})," above would not see the data it just upserted, since it only sees data that was created before its ",e.jsx(i.code,{children:"CurrentSCN"})," property. This provides a way of doing snapshot, flashback, or point-in-time queries."]}),`
`,e.jsxs(i.p,{children:["Keep in mind that creating a new connection is ",e.jsx(i.em,{children:"not"})," an expensive operation. The same underlying ",e.jsx(i.code,{children:"HConnection"})," is used for all connections to the same cluster, so it's more or less like instantiating a few objects."]}),`
`,e.jsx(i.h3,{id:"why-isnt-my-query-doing-a-range-scan",children:"Why isn't my query doing a RANGE SCAN?"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TEST"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  pk1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"char"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"not null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  pk2 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"char"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"not null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  pk3 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"char"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"not null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  non"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"varchar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  CONSTRAINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PK "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(pk1, pk2, pk3)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsxs(i.p,{children:["RANGE SCAN means that only a subset of the rows in your table will be scanned over. This occurs if you use one or more leading columns from your primary key constraint. Query that is not filtering on leading PK columns ex. ",e.jsx(i.code,{children:"select * from test where pk2='x' and pk3='y';"})," will result in full scan whereas the following query will result in range scan ",e.jsx(i.code,{children:"select * from test where pk1='x' and pk2='y';"}),". Note that you can add a secondary index on your ",e.jsx(i.code,{children:"pk2"})," and ",e.jsx(i.code,{children:"pk3"})," columns and that would cause a range scan to be done for the first query (over the index table)."]}),`
`,e.jsx(i.p,{children:"DEGENERATE SCAN means that a query can't possibly return any rows. If we can determine that at compile time, then we don't bother to even run the scan."}),`
`,e.jsx(i.p,{children:"FULL SCAN means that all rows of the table will be scanned over (potentially with a filter applied if you have a WHERE clause)"}),`
`,e.jsxs(i.p,{children:["SKIP SCAN means that either a subset or all rows in your table will be scanned over, however it will skip large groups of rows depending on the conditions in your filter. See ",e.jsx(i.a,{href:"http://phoenix-hbase.blogspot.com/2013/05/demystifying-skip-scan-in-phoenix.html",children:"this"})," blog for more detail. We don't do a SKIP SCAN if you have no filter on the leading primary key columns, but you can force a SKIP SCAN by using the ",e.jsx(i.code,{children:"/*+ SKIP_SCAN */"})," hint. Under some conditions, namely when the cardinality of your leading primary key columns is low, it will be more efficient than a FULL SCAN."]}),`
`,e.jsx(i.h3,{id:"should-i-pool-phoenix-jdbc-connections",children:"Should I pool Phoenix JDBC Connections?"}),`
`,e.jsx(i.p,{children:"No, it is not necessary to pool Phoenix JDBC Connections."}),`
`,e.jsx(i.p,{children:"Phoenix's Connection objects are different from most other JDBC Connections due to the underlying HBase connection. The Phoenix Connection object is designed to be a thin object that is inexpensive to create. If Phoenix Connections are reused, it is possible that the underlying HBase connection is not always left in a healthy state by the previous user. It is better to create new Phoenix Connections to ensure that you avoid any potential issues."}),`
`,e.jsxs(i.p,{children:["Implementing pooling for Phoenix could be done simply by creating a delegate Connection that instantiates a new Phoenix connection when retrieved from the pool and then closes the connection when returning it to the pool (see ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-2388",children:"PHOENIX-2388"}),")."]}),`
`,e.jsx(i.h3,{id:"why-does-phoenix-add-an-emptydummy-keyvalue-when-doing-an-upsert",children:"Why does Phoenix add an empty/dummy KeyValue when doing an upsert?"}),`
`,e.jsxs(i.p,{children:["The empty or dummy ",e.jsx(i.code,{children:"KeyValue"})," (with a column qualifier of ",e.jsx(i.code,{children:"_0"}),`) is needed to ensure that a given column is available
for all rows.`]}),`
`,e.jsxs(i.p,{children:["As you may know, data is stored in HBase as ",e.jsx(i.code,{children:"KeyValue"}),`s, meaning that
the full row key is stored for each column value. This also implies
that the row key is not stored at all unless there is at least one
column stored.`]}),`
`,e.jsxs(i.p,{children:[`Now consider JDBC row which has an integer primary key, and several
columns which are all null. In order to be able to store the primary
key, a KeyValue needs to be stored to show that the row is present at
all. This column is represented by the empty column that you've
noticed. This allows doing a `,e.jsx(i.code,{children:"SELECT * FROM TABLE"}),` and receiving
records for all rows, even those whose non-pk columns are null.`]}),`
`,e.jsx(i.p,{children:`The same issue comes up even if only one column is null for some (or
all) records. A scan over Phoenix will include the empty column to
ensure that rows that only consist of the primary key (and have null
for all non-key columns) will be included in a scan result.`})]})}function k(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(a,{...s})}):a(s)}function h(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,k as default,d as extractedReferences,o as frontmatter,c as structuredData,p as toc};
