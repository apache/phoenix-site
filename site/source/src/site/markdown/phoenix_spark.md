# Apache Spark Plugin

The phoenix-spark plugin extends Phoenix's MapReduce support to allow Spark to load Phoenix tables
as RDDs or DataFrames, and enables persisting them back to Phoenix.

#### Prerequisites

* Phoenix 4.4.0+ 
* Spark 1.3.1+ (prebuilt with Hadoop 2.4 recommended)

#### Why not JDBC?

Although Spark supports connecting directly to JDBC databases, it's only able to parallelize
queries by partioning on a numeric column. It also requires a known lower bound, upper bound
and partition count in order to create split queries.

In contrast, the phoenix-spark integration is able to leverage the underlying splits provided by 
Phoenix in order to retrieve and save data across multiple workers. All that's required is a
database URL and a table name. Optional SELECT columns can be given, as well as pushdown predicates
for efficient filtering.

The choice of which method to use to access Phoenix comes down to each specific use case.


#### Spark setup

* To ensure that all requisite Phoenix / HBase platform dependencies are available on the classpath 
for the Spark executors and drivers, set both '_spark.executor.extraClassPath_' and 
'_spark.driver.extraClassPath_' in spark-defaults.conf to include the 'phoenix-_`<version>`_-client.jar'
   
* Note that for Phoenix versions 4.7 and 4.8 you must use the 'phoenix-_`<version>`_-client-spark.jar'. As of Phoenix 4.10, the 'phoenix-_`<version>`_-client.jar' is compiled against Spark 2.x. If compability with Spark 1.x if needed, you must compile Phoenix with the `spark16` maven profile.   
   
* To help your IDE, you can add the following _provided_ dependency to your build:

```
<dependency>
  <groupId>org.apache.phoenix</groupId>
  <artifactId>phoenix-spark</artifactId>
  <version>${phoenix.version}</version>
  <scope>provided</scope>
</dependency>
```

### Reading Phoenix Tables

Given a Phoenix table with the following DDL

```sql
CREATE TABLE TABLE1 (ID BIGINT NOT NULL PRIMARY KEY, COL1 VARCHAR);
UPSERT INTO TABLE1 (ID, COL1) VALUES (1, 'test_row_1');
UPSERT INTO TABLE1 (ID, COL1) VALUES (2, 'test_row_2');
```

#### Load as a DataFrame using the Data Source API
```scala
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext
import org.apache.phoenix.spark._

val sc = new SparkContext("local", "phoenix-test")
val sqlContext = new SQLContext(sc)

val df = sqlContext.load(
  "org.apache.phoenix.spark",
  Map("table" -> "TABLE1", "zkUrl" -> "phoenix-server:2181")
)

df
  .filter(df("COL1") === "test_row_1" && df("ID") === 1L)
  .select(df("ID"))
  .show
```

#### Load as a DataFrame directly using a Configuration object
```scala
import org.apache.hadoop.conf.Configuration
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext
import org.apache.phoenix.spark._

val configuration = new Configuration()
// Can set Phoenix-specific settings, requires 'hbase.zookeeper.quorum'

val sc = new SparkContext("local", "phoenix-test")
val sqlContext = new SQLContext(sc)

// Load the columns 'ID' and 'COL1' from TABLE1 as a DataFrame
val df = sqlContext.phoenixTableAsDataFrame(
  "TABLE1", Array("ID", "COL1"), conf = configuration
)

df.show
```

#### Load as an RDD, using a Zookeeper URL
```scala
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext
import org.apache.phoenix.spark._

val sc = new SparkContext("local", "phoenix-test")

// Load the columns 'ID' and 'COL1' from TABLE1 as an RDD
val rdd: RDD[Map[String, AnyRef]] = sc.phoenixTableAsRDD(
  "TABLE1", Seq("ID", "COL1"), zkUrl = Some("phoenix-server:2181")
)

rdd.count()

val firstId = rdd1.first()("ID").asInstanceOf[Long]
val firstCol = rdd1.first()("COL1").asInstanceOf[String]
```

### Saving Phoenix

Given a Phoenix table with the following DDL

```sql
CREATE TABLE OUTPUT_TEST_TABLE (id BIGINT NOT NULL PRIMARY KEY, col1 VARCHAR, col2 INTEGER);
```

#### Saving RDDs

The `saveToPhoenix` method is an implicit method on RDD[Product], or an RDD of Tuples. The data types must
correspond to one of [the Java types supported by Phoenix](language/datatypes.html).


```scala
import org.apache.spark.SparkContext
import org.apache.phoenix.spark._

val sc = new SparkContext("local", "phoenix-test")
val dataSet = List((1L, "1", 1), (2L, "2", 2), (3L, "3", 3))

sc
  .parallelize(dataSet)
  .saveToPhoenix(
    "OUTPUT_TEST_TABLE",
    Seq("ID","COL1","COL2"),
    zkUrl = Some("phoenix-server:2181")
  )
```

#### Saving DataFrames

The `save` is method on DataFrame allows passing in a data source type. You can use
`org.apache.phoenix.spark`, and must also pass in a `table` and `zkUrl` parameter to
specify which table and server to persist the DataFrame to. The column names are derived from
the DataFrame's schema field names, and must match the Phoenix column names.

The `save` method also takes a `SaveMode` option, for which only `SaveMode.Overwrite` is supported.

Given two Phoenix tables with the following DDL:

```sql
CREATE TABLE INPUT_TABLE (id BIGINT NOT NULL PRIMARY KEY, col1 VARCHAR, col2 INTEGER);
CREATE TABLE OUTPUT_TABLE (id BIGINT NOT NULL PRIMARY KEY, col1 VARCHAR, col2 INTEGER);
```

```scala
import org.apache.spark.SparkContext
import org.apache.spark.sql._
import org.apache.phoenix.spark._

// Load INPUT_TABLE
val sc = new SparkContext("local", "phoenix-test")
val sqlContext = new SQLContext(sc)
val df = sqlContext.load("org.apache.phoenix.spark", Map("table" -> "INPUT_TABLE",
  "zkUrl" -> hbaseConnectionString))

// Save to OUTPUT_TABLE
df.save("org.apache.phoenix.spark", SaveMode.Overwrite, Map("table" -> "OUTPUT_TABLE",
  "zkUrl" -> hbaseConnectionString))
```

### PySpark

With Spark's DataFrame support, you can also use `pyspark` to read and write from Phoenix tables.

#### Load a DataFrame

Given a table _TABLE1_ and a Zookeeper url of `localhost:2181` you can load the table as a
DataFrame using the following Python code in `pyspark`

```python
df = sqlContext.read \
  .format("org.apache.phoenix.spark") \
  .option("table", "TABLE1") \
  .option("zkUrl", "localhost:2181") \
  .load()
```

#### Save a DataFrame

Given the same table and Zookeeper URLs above, you can save a DataFrame to a Phoenix table
using the following code

```python
df.write \
  .format("org.apache.phoenix.spark") \
  .mode("overwrite") \
  .option("table", "TABLE1") \
  .option("zkUrl", "localhost:2181") \
  .save()
```


### Notes

The functions `phoenixTableAsDataFrame`, `phoenixTableAsRDD` and `saveToPhoenix` all support
optionally specifying a `conf` Hadoop configuration parameter with custom Phoenix client settings,
as well as an optional `zkUrl` parameter for the Phoenix connection URL.

If `zkUrl` isn't specified, it's assumed that the "hbase.zookeeper.quorum" property has been set
in the `conf` parameter. Similarly, if no configuration is passed in, `zkUrl` must be specified.

### Limitations

- Basic support for column and predicate pushdown using the Data Source API
- The Data Source API does not support passing custom Phoenix settings in configuration, you must
create the DataFrame or RDD directly if you need fine-grained configuration.
- No support for aggregate or distinct queries as explained in our [Map Reduce Integration](phoenix_mr.html) documentation.

***

### PageRank example

This example makes use of the Enron email data set, provided by the
[Stanford Network Analysis Project](https://snap.stanford.edu/data/email-Enron.html),
and executes the GraphX implementation of PageRank on it to find interesting entities. It then
saves the results back to Phoenix.

1. Download and extract the file [enron.csv.gz](https://github.com/jmahonin/spark-graphx-phoenix/blob/master/enron.csv.gz?raw=true)

2. Create the necessary Phoenix schema

    ```sql
    CREATE TABLE EMAIL_ENRON(MAIL_FROM BIGINT NOT NULL, MAIL_TO BIGINT NOT NULL CONSTRAINT pk PRIMARY KEY(MAIL_FROM, MAIL_TO));
    CREATE TABLE EMAIL_ENRON_PAGERANK(ID BIGINT NOT NULL, RANK DOUBLE CONSTRAINT pk PRIMARY KEY(ID));
    ```

3. Load the email data into Phoenix (assuming localhost for Zookeeper Quroum URL)

    ```
    gunzip /tmp/enron.csv.gz
    cd /path/to/phoenix/bin
    ./psql.py -t EMAIL_ENRON localhost /tmp/enron.csv
    ```

4. In spark-shell, with the phoenix-client in the Spark driver classpath, run the following:

    ```scala
    import org.apache.spark.graphx._
    import org.apache.phoenix.spark._
    val rdd = sc.phoenixTableAsRDD("EMAIL_ENRON", Seq("MAIL_FROM", "MAIL_TO"), zkUrl=Some("localhost"))           // load from phoenix
    val rawEdges = rdd.map{ e => (e("MAIL_FROM").asInstanceOf[VertexId], e("MAIL_TO").asInstanceOf[VertexId]) }   // map to vertexids
    val graph = Graph.fromEdgeTuples(rawEdges, 1.0)                                                               // create a graph
    val pr = graph.pageRank(0.001)                                                                                // run pagerank
    pr.vertices.saveToPhoenix("EMAIL_ENRON_PAGERANK", Seq("ID", "RANK"), zkUrl = Some("localhost"))               // save to phoenix
    ```

5. Query the top ranked entities in SQL

    ```sql
    SELECT * FROM EMAIL_ENRON_PAGERANK ORDER BY RANK DESC LIMIT 5;
    +------------------------------------------+------------------------------------------+
    |                    ID                    |                   RANK                   |
    +------------------------------------------+------------------------------------------+
    | 5038                                     | 497.2989872977676                        |
    | 273                                      | 117.18141799210386                       |
    | 140                                      | 108.63091596789913                       |
    | 458                                      | 107.2728800448782                        |
    | 588                                      | 106.11840798585399                       |
    +------------------------------------------+------------------------------------------+
    ```
