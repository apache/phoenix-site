# F.A.Q.

* [I want to get started. Is there a Phoenix Hello World?](#I_want_to_get_started_Is_there_a_Phoenix_Hello_World)
* [What is the Phoenix JDBC URL syntax?](#What_is_the_Phoenix_JDBC_URL_syntax)
* [Is there a way to bulk load in Phoenix?](#Is_there_a_way_to_bulk_load_in_Phoenix)
* [How I map Phoenix table to an existing HBase table?](#How_I_map_Phoenix_table_to_an_existing_HBase_table)
* [Are there any tips for optimizing Phoenix?](#Are_there_any_tips_for_optimizing_Phoenix)
* [How do I create Secondary Index on a table?](#How_do_I_create_Secondary_Index_on_a_table)
* [Why isn't my secondary index being used?](#Why_isnt_my_secondary_index_being_used)
* [How fast is Phoenix? Why is it so fast?](#How_fast_is_Phoenix_Why_is_it_so_fast)
* [How do I connect to secure HBase cluster?](#How_do_I_connect_to_secure_HBase_cluster)
* [How do I connect with HBase running on Hadoop-2?](#How_do_I_connect_with_HBase_running_on_Hadoop-2)
* [Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?](#Can_phoenix_work_on_tables_with_arbitrary_timestamp_as_flexible_as_HBase_API)
* [Why isn't my query doing a RANGE SCAN?](#Why_isnt_my_query_doing_a_RANGE_SCAN)
* [Should I pool Phoenix JDBC Connections?](#Should_I_pool_Phoenix_JDBC_Connections)
* [Why does Phoenix add an empty or dummy KeyValue when doing an upsert?](#Why_empty_key_value)

### I want to get started. Is there a Phoenix _Hello World_?

*Pre-requisite:* Download latest Phoenix from [here](download.html)
and copy phoenix-*.jar to HBase lib folder and restart HBase.

**1. Using console**

1. Start Sqlline: `$ sqlline.py [zookeeper]`
2. Execute the following statements when Sqlline connects: 

```
create table test (mykey integer not null primary key, mycolumn varchar);
upsert into test values (1,'Hello');
upsert into test values (2,'World!');
select * from test;
```

3. You should get the following output

``` 
+-------+------------+
| MYKEY |  MYCOLUMN  |
+-------+------------+
| 1     | Hello      |
| 2     | World!     |
+-------+------------+
``` 


**2. Using java**

Create test.java file with the following content:

``` 
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
		
		Connection con = DriverManager.getConnection("jdbc:phoenix:[zookeeper]");
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
``` 
Compile and execute on command line

`$ javac test.java`

`$ java -cp "../phoenix-[version]-client.jar:." test`


You should get the following output

`Hello`
`World!`

### What is the Phoenix JDBC URL syntax?

#### Thick Driver

The Phoenix (Thick) Driver JDBC URL syntax is as follows (where elements in square brackets are optional):

`jdbc:phoenix:[comma-separated ZooKeeper Quorum [:port [:hbase root znode [:kerberos_principal [:path to kerberos keytab] ] ] ]`

The simplest URL is:

`jdbc:phoenix:localhost`

Whereas the most complicated URL is:

`jdbc:phoenix:zookeeper1.domain,zookeeper2.domain,zookeeper3.domain:2181:/hbase-1:phoenix@EXAMPLE.COM:/etc/security/keytabs/phoenix.keytab`

Please note that each optional element in the URL requires all previous optional elements. For example, to specify the
HBase root ZNode, the ZooKeeper port *must* also be specified.

This information is initially covered on the [index page](/#connStr).

#### Thin Driver

The Phoenix Thin Driver (used with the Phoenix Query Server) JDBC URL syntax is as follows:

`jdbc:phoenix:thin:[key=value[;key=value...]]`

There are a number of keys exposed for client-use. The most commonly-used keys are: `url` and `serialization`. The `url`
key is required to interact with the Phoenix Query Server.

The simplest URL is:

`jdbc:phoenix:thin:url=http://localhost:8765`

Where as very complicated URL is:

`jdbc:phoenix:thin:url=http://queryserver.domain:8765;serialization=PROTOBUF;authentication=SPENGO;principal=phoenix@EXAMPLE.COM;keytab=/etc/security/keytabs/phoenix.keytab`

Please refer to the [Apache Avatica documentation](https://calcite.apache.org/avatica/docs/client_reference.html) for a full list of supported options in the Thin client JDBC URL,
or see the [Query Server documentation](server.html)

### Is there a way to bulk load in Phoenix?

**Map Reduce**

See the example [here](bulk_dataload.html)

**CSV**

CSV data can be bulk loaded with built in utility named psql. Typical upsert rates are 20K - 50K rows per second (depends on how wide are the rows).

Usage example:  
Create table using psql
`$ psql.py [zookeeper] ../examples/web_stat.sql`  

Upsert CSV bulk data
`$ psql.py [zookeeper] ../examples/web_stat.csv`



### How I map Phoenix table to an existing HBase table?

You can create both a Phoenix table or view through the CREATE TABLE/CREATE VIEW DDL statement on a pre-existing HBase table. In both cases, we'll leave the HBase metadata as-is. For CREATE TABLE, we'll create any metadata (table, column families) that doesn't already exist. We'll also add an empty key value for each row so that queries behave as expected (without requiring all columns to be projected during scans).

The other caveat is that the way the bytes were serialized must match the way the bytes are serialized by Phoenix. For VARCHAR,CHAR, and UNSIGNED_* types, we use the HBase Bytes methods. The CHAR type expects only single-byte characters and the UNSIGNED types expect values greater than or equal to zero. For signed types(TINYINT, SMALLINT, INTEGER and BIGINT), Phoenix will flip the first bit so that negative values will sort before positive values. Because HBase sorts row keys in lexicographical order and negative value's first bit is 1 while positive 0 so that negative value is 'greater than' positive value if we don't flip the first bit. So if you stored integers by HBase native API and want to access them by Phoenix, make sure that all your data types are UNSIGNED types.

Our composite row keys are formed by simply concatenating the values together, with a zero byte character used as a separator after a variable length type.

If you create an HBase table like this:

`create 't1', {NAME => 'f1', VERSIONS => 5}`

then you have an HBase table with a name of 't1' and a column family with a name of 'f1'. Remember, in HBase, you don't model the possible KeyValues or the structure of the row key. This is the information you specify in Phoenix above and beyond the table and column family.

So in Phoenix, you'd create a view like this:

`CREATE VIEW "t1" ( pk VARCHAR PRIMARY KEY, "f1".val VARCHAR )`

The "pk" column declares that your row key is a VARCHAR (i.e. a string) while the "f1".val column declares that your HBase table will contain KeyValues with a column family and column qualifier of "f1":VAL and that their value will be a VARCHAR.

Note that you don't need the double quotes if you create your HBase table with all caps names (since this is how Phoenix normalizes strings, by upper casing them). For example, with:

`create 'T1', {NAME => 'F1', VERSIONS => 5}`

you could create this Phoenix view:

`CREATE VIEW t1 ( pk VARCHAR PRIMARY KEY, f1.val VARCHAR )`

Or if you're creating new HBase tables, just let Phoenix do everything for you like this (No need to use the HBase shell at all.):

`CREATE TABLE t1 ( pk VARCHAR PRIMARY KEY, val VARCHAR )`



### Are there any tips for optimizing Phoenix?

* Use **Salting** to increase read/write performance
Salting can significantly increase read/write performance by pre-splitting the data into multiple regions. Although Salting will yield better performance in most scenarios. 

Example:

` CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) SALT_BUCKETS=16`

Note: Ideally for a 16 region server cluster with quad-core CPUs, choose salt buckets between 32-64 for optimal performance.

* **Per-split** table
Salting does automatic table splitting but in case you want to exactly control where table split occurs with out adding extra byte or change row key order then you can pre-split a table. 

Example: 

` CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) SPLIT ON ('CS','EU','NA')`

* Use **multiple column families**

Column family contains related data in separate files. If you query use selected columns then it make sense to group those columns together in a column family to improve read performance.

Example:

Following create table DDL will create two column faimiles A and B.

` CREATE TABLE TEST (MYKEY VARCHAR NOT NULL PRIMARY KEY, A.COL1 VARCHAR, A.COL2 VARCHAR, B.COL3 VARCHAR)`

* Use **compression**
On disk compression improves performance on large tables

Example: 

` CREATE TABLE TEST (HOST VARCHAR NOT NULL PRIMARY KEY, DESCRIPTION VARCHAR) COMPRESSION='GZ'`

* Create **indexes**
See [faq.html#/How_do_I_create_Secondary_Index_on_a_table](faq.html#/How_do_I_create_Secondary_Index_on_a_table)

* **Optimize cluster** parameters
See http://hbase.apache.org/book/performance.html

* **Optimize Phoenix** parameters
See [tuning.html](tuning.html)



### How do I create Secondary Index on a table?

Starting with Phoenix version 2.1, Phoenix supports index over mutable and immutable data. Note that Phoenix 2.0.x only supports Index over immutable data. Index write performance index with immutable table is slightly faster than mutable table however data in immutable table cannot be updated.

Example

* Create table

Immutable table: `create table test (mykey varchar primary key, col1 varchar, col2 varchar) IMMUTABLE_ROWS=true;`

Mutable table: `create table test (mykey varchar primary key, col1 varchar, col2 varchar);`

* Creating index on col2

`create index idx on test (col2)`

* Creating index on col1 and a covered index on col2

`create index idx on test (col1) include (col2)`

Upsert rows in this test table and Phoenix query optimizer will choose correct index to use. You can see in [explain plan](language/index.html#explain) if Phoenix is using the index table. You can also give a [hint](language/index.html#hint) in Phoenix query to use a specific index.



### Why isn't my secondary index being used?

The secondary index won't be used unless all columns used in the query are in it ( as indexed or covered columns). All columns making up the primary key of the data table will automatically be included in the index.

Example: DDL `create table usertable (id varchar primary key, firstname varchar, lastname varchar); create index idx_name on usertable (firstname);`

Query: DDL `select id, firstname, lastname from usertable where firstname = 'foo';`

Index would not be used in this case as lastname is not part of indexed or covered column. This can be verified by looking at the explain plan. To fix this create index that has either lastname part of index or covered column. Example: `create idx_name on usertable (firstname) include (lastname);`


### How fast is Phoenix? Why is it so fast?

Phoenix is fast. Full table scan of 100M rows usually completes in 20 seconds (narrow table on a medium sized cluster). This time come down to few milliseconds if query contains filter on key columns. For filters on non-key columns or non-leading key columns, you can add index on these columns which leads to performance equivalent to filtering on key column by making copy of table with indexed column(s) part of key.

Why is Phoenix fast even when doing full scan:

1. Phoenix chunks up your query using the region boundaries and runs them in parallel on the client using a configurable number of threads 
2. The aggregation will be done in a coprocessor on the server-side, collapsing the amount of data that gets returned back to the client rather than returning it all. 



### How do I connect to secure HBase cluster?
Check out excellent post by Anil Gupta 
http://bigdatanoob.blogspot.com/2013/09/connect-phoenix-to-secure-hbase-cluster.html



### How do I connect with HBase running on Hadoop-2?
Hadoop-2 profile exists in Phoenix pom.xml. 


### Can phoenix work on tables with arbitrary timestamp as flexible as HBase API?
By default, Phoenix let's HBase manage the timestamps and just shows you the latest values for everything. However, Phoenix also allows arbitrary timestamps to be supplied by the user. To do that you'd specify a "CurrentSCN" at connection time, like this:

    Properties props = new Properties();
    props.setProperty("CurrentSCN", Long.toString(ts));
    Connection conn = DriverManager.connect(myUrl, props);

    conn.createStatement().execute("UPSERT INTO myTable VALUES ('a')");
    conn.commit();
The above is equivalent to doing this with the HBase API:

    myTable.put(Bytes.toBytes('a'),ts);
By specifying a CurrentSCN, you're telling Phoenix that you want everything for that connection to be done at that timestamp. Note that this applies to queries done on the connection as well - for example, a query over myTable above would not see the data it just upserted, since it only sees data that was created before its CurrentSCN property. This provides a way of doing snapshot, flashback, or point-in-time queries.

Keep in mind that creating a new connection is *not* an expensive operation. The same underlying HConnection is used for all connections to the same cluster, so it's more or less like instantiating a few objects.


### Why isn't my query doing a RANGE SCAN?

`DDL: CREATE TABLE TEST (pk1 char(1) not null, pk2 char(1) not null, pk3 char(1) not null, non-pk varchar CONSTRAINT PK PRIMARY KEY(pk1, pk2, pk3));`

RANGE SCAN means that only a subset of the rows in your table will be scanned over. This occurs if you use one or more leading columns from your primary key constraint. Query that is not filtering on leading PK columns ex. `select * from test where pk2='x' and pk3='y';` will result in full scan whereas the following query will result in range scan `select * from test where pk1='x' and pk2='y';`. Note that you can add a secondary index on your "pk2" and "pk3" columns and that would cause a range scan to be done for the first query (over the index table).

DEGENERATE SCAN means that a query can't possibly return any rows. If we can determine that at compile time, then we don't bother to even run the scan.

FULL SCAN means that all rows of the table will be scanned over (potentially with a filter applied if you have a WHERE clause)

SKIP SCAN means that either a subset or all rows in your table will be scanned over, however it will skip large groups of rows depending on the conditions in your filter. See [this](http://phoenix-hbase.blogspot.com/2013/05/demystifying-skip-scan-in-phoenix.html) blog for more detail. We don't do a SKIP SCAN if you have no filter on the leading primary key columns, but you can force a SKIP SCAN by using the /*+ SKIP_SCAN */ hint. Under some conditions, namely when the cardinality of your leading primary key columns is low, it will be more efficient than a FULL SCAN.


### Should I pool Phoenix JDBC Connections?

No, it is not necessary to pool Phoenix JDBC Connections.

Phoenix's Connection objects are different from most other JDBC Connections due to the underlying HBase connection. The Phoenix Connection object is designed to be a thin object that is inexpensive to create. If Phoenix Connections are reused, it is possible that the underlying HBase connection is not always left in a healthy state by the previous user. It is better to create new Phoenix Connections to ensure that you avoid any potential issues.

Implementing pooling for Phoenix could be done simply by creating a delegate Connection that instantiates a new Phoenix connection when retrieved from the pool and then closes the connection when returning it to the pool (see [PHOENIX-2388](https://issues.apache.org/jira/browse/PHOENIX-2388)).


### <a id="Why_empty_key_value"/>Why does Phoenix add an empty/dummy KeyValue when doing an upsert?
The empty or dummy KeyValue (with a column qualifier of _0) is needed to ensure that a given column is available
for all rows.

As you may know, data is stored in HBase as KeyValues, meaning that
the full row key is stored for each column value. This also implies
that the row key is not stored at all unless there is at least one
column stored.

Now consider JDBC row which has an integer primary key, and several
columns which are all null. In order to be able to store the primary
key, a KeyValue needs to be stored to show that the row is present at
all. This column is represented by the empty column that you've
noticed. This allows doing a "SELECT * FROM TABLE" and receiving
records for all rows, even those whose non-pk columns are null.

The same issue comes up even if only one column is null for some (or
all) records. A scan over Phoenix will include the empty column to
ensure that rows that only consist of the primary key (and have null
for all non-key columns) will be included in a scan result.
