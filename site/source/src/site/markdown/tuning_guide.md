# Tuning Guide

Tuning Phoenix can be complex, but with a little knowledge of how it works you can make significant changes to the performance of your reads and writes. The most important factor in performance is the design of your schema, especially as it affects the underlying HBase row keys. Look in “General Tips” below to find design advice for different anticipated data access patterns. Subsequent sections describe how to use secondary indexes, hints, and explain plans.

**Note:** Phoenix and HBase work well when your application does point lookups and small range scans. This can be achieved by good primary key design (see below). If you find that your application requires many full table scans, then Phoenix and HBase are likely not the best tool for the job. Instead, look at using other tools that write to HDFS directly using columnar representations such as Parquet.

# Primary Keys

The underlying row key design is the single most important factor in Phoenix performance, and it's important to get it right at design time because you cannot change it later without re-writing the data and index tables.

 The Phoenix primary keys are concatenated to create the underlying row key in Apache HBase. The columns for the primary key constraint should be chosen and ordered in a way that aligns with the common query patterns—choose the most frequently queried columns as primary keys. The key that you place in the leading position is the most performant one. For example, if you lead off with a column containing org ID values, it is easy to select all rows pertaining to a specific org. You can add the HBase row timestamp to the primary key to improve scan efficiency by skipping rows outside the queried time range. 

Every primary key imposes a cost because the entire row key is appended to every piece of data in memory and on disk. The larger the row key, the greater the storage overhead. Find ways to store information compactly in columns you plan to use for primary keys—store deltas instead of complete time stamps, for example.

To sum up, the best practice is to design primary keys to add up to a row key that lets you scan the smallest amount of data.

**Tip: **When choosing primary keys, lead with the column you filter most frequently across the queries that are most important to optimize. If you will use `ORDER BY` in your query, make sure your PK columns match the expressions in your `ORDER BY` clause. 

### Monotonically increasing Primary keys

If your primary keys are monotonically increasing, use salting to help distribute writes across the cluster and improve parallelization. Example:

`CREATE TABLE … ( … ) SALT_BUCKETS = N`

For optimal performance the number of salt buckets should approximately equal the number of region servers. Do not salt automatically. Use salting only when experiencing hotspotting. The downside of salting is that it imposes a cost on read because when you want to query the data you have to run multiple queries to do a range scan.


# General Tips

The following sections provide a few general tips for different access scenarios.

### Is the Data Random-Access?

* As with any random read workloads, SSDs can improve performance because of their faster random seek time.

### Is the data read-heavy or write-heavy?

* For read-heavy data:
    * Create global indexes. This will affect write speed depending on the number of columns included in an index because each index writes to its own separate table.
    * Use multiple indexes to provide fast access to common queries. 
    * When specifying machines for HBase, do not skimp on cores; HBase needs them.
* For write-heavy data:
    * Pre-split the table. It can be helpful to split the table into pre-defined regions, or if the keys are monotonically increasing use salting to to avoid creating write hotspots on a small number of nodes. Use real data types rather than raw byte data.
    * Create local indexes. Reads from local indexes have a performance penalty, so it's important to do performance testing. See the [Pherf](https://phoenix.apache.org/pherf.html) tool.





### Which columns will be accessed often?

* Choose commonly-queried columns as primary keys. For more information, see “Primary Keys” below.
    * Create additional indexes to support common query patterns, including heavily accessed fields that are not in the primary key. 

### Can the data be append-only (immutable)?

* If the data is immutable or append-only, declare the table and its indexes as immutable using the `IMMUTABLE_ROWS` [option](http://phoenix.apache.org/language/index.html#options) at creation time to reduce the write-time cost. If you need to make an existing table immutable, you can do so with `ALTER TABLE trans.event SET IMMUTABLE_ROWS=true` after creation time.
    * If speed is more important than data integrity, you can use the `DISABLE_WAL` [option](http://phoenix.apache.org/language/index.html#options). Note: it is possible to lose data with `DISABLE_WAL` if a region server fails. 
* Set the `UPDATE_CACHE_FREQUENCY` [option](http://phoenix.apache.org/language/index.html#options) to 15 minutes or so if your metadata doesn't change very often. This property determines how often an RPC is done to ensure you're seeing the latest schema.
* If the data is not sparse (over 50% of the cells have values), use the SINGLE_CELL_ARRAY_WITH_OFFSETS data encoding scheme introduced in Phoenix 4.10, which obtains faster performance by reducing the size of the data. For more information, see “[Column Mapping and Immutable Data Encoding](https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data)” on the Apache Phoenix blog.

### Is the table very large?

* Use the `ASYNC` keyword with your `CREATE INDEX` call to create the index asynchronously via MapReduce job.  You'll need to manually start the job; see https://phoenix.apache.org/secondary_indexing.html#Index_Population for details. 
* If the data is too large to scan the table completely, use primary keys to create an underlying composite row key that makes it easy to return a subset of the data or facilitates [skip-scanning](https://phoenix.apache.org/skip_scan.html)—Phoenix can jump directly to matching keys when the query includes key sets in the predicate.

### Is transactionality required?

A transaction is a data operation that is atomic—that is, guaranteed to succeed completely or not at all. For example, if you need to make cross-row updates to a data table, then you should consider your data transactional.

* If you need transactionality, use the `TRANSACTIONAL` [option](http://phoenix.apache.org/language/index.html#options). (See also http://phoenix.apache.org/transactions.html.)

### Block Encoding

Using compression or encoding is a must. Both SNAPPY and FAST_DIFF are good all around options.

`FAST_DIFF` encoding is automatically enabled on all Phoenix tables by default, and almost always improves overall read latencies and throughput by allowing more data to fit into blockcache. Note: `FAST_DIFF` encoding can increase garbage produced during request processing.

Set encoding at table creation time. Example:
` CREATE TABLE … ( … ) DATA_BLOCK_ENCODING=‘FAST_DIFF’`


# Schema Design

Because the schema affects the way the data is written to the underlying HBase layer, Phoenix performance relies on the design of your tables, indexes, and primary keys. 

## Phoenix and the HBase data model

HBase stores data in tables, which in turn contain columns grouped in column families. A row in an HBase table consists of versioned cells associated with one or more columns. An HBase row is a collection of many key-value pairs in which the rowkey attribute of the keys are equal. Data in an HBase table is sorted by the rowkey, and all access is via the rowkey.
Phoenix creates a relational data model on top of HBase, enforcing a PRIMARY KEY constraint whose columns are concatenated to form the row key for the underlying HBase table. For this reason, it's important to be cognizant of the size and number of the columns you include in the PK constraint, because a copy of the row key is included with every cell in the underlying HBase table.



## Column Families

If some columns are accessed more frequently than others, [create multiple column families](https://phoenix.apache.org/faq.html#Are_there_any_tips_for_optimizing_Phoenix) to separate the frequently-accessed columns from rarely-accessed columns. This improves performance because HBase reads only the column families specified in the query.



## Columns

Here are a few tips that apply to columns in general, whether they are indexed or not:

*  Keep `VARCHAR` columns under 1MB or so due to I/O costs. When processing queries, HBase materializes cells in full before sending them over to the client, and the client receives them in full before handing them off to the application code.
* For structured objects, don't use JSON, which is not very compact. Use a format such as protobuf, Avro, msgpack, or BSON.
* Consider compressing data before storage using a fast LZ variant to cut latency and I/O costs.
* Use the column mapping feature (added in Phoenix 4.10), which uses numerical HBase column qualifiers for non-PK columns instead of directly using column names. This improves performance when looking for a cell in the sorted list of cells returned by HBase, adds further across-the-board performance by reducing the disk size used by tables, and speeds up DDL operations like column rename and metadata-level column drops. For more information, see “[Column Mapping and Immutable Data Encoding](https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data)” on the Apache Phoenix blog.

# Indexes

A Phoenix index  is a physical table that stores a pivoted copy of some or all of the data in the main table, to serve specific kinds of queries. When you issue a query, Phoenix selects the best index for the query automatically. The primary index is created automatically based on the primary keys you select. You can create secondary indexes, specifying which columns are included based on the anticipated queries the index will support.

See also: 
[Secondary Indexing](https://phoenix.apache.org/secondary_indexing.html)

## Secondary indexes

Secondary indexes can improve read performance by turning what would normally be a full table scan into a point lookup (at the cost of storage space and write speed). Secondary indexes can be added or removed after table creation and don't require changes to existing queries – queries simply run faster. A small number of secondary indexes is often sufficient. Depending on your needs, consider creating *[covered](http://phoenix.apache.org/secondary_indexing.html#Covered_Indexes)* indexes or *[functional](http://phoenix.apache.org/secondary_indexing.html#Functional_Indexes)* indexes, or both.

If your table is large, use the `ASYNC` keyword with `CREATE INDEX` to create the index asynchronously. In this case, the index will be built through MapReduce, which means that the client going up or down won't impact index creation and the job is retried automatically if necessary. You'll need to manually start the job, which you can then monitor just as you would any other MapReduce job.

Example:
`create index if not exists event_object_id_idx_b on trans.event (object_id) ASYNC UPDATE_CACHE_FREQUENCY=60000;`

See [Index Population](https://phoenix.apache.org/secondary_indexing.html#Index_Population) for details.

If you can't create the index asynchronously for some reason, then  increase the query timeout (`phoenix.query.timeoutMs`) to be larger than the time it'll take to build the index. If the `CREATE INDEX` call times out or the client goes down before it's finished, then the index build will stop  and must be run again. You can monitor the index table as it is created—you'll see new regions created as splits occur. You can query the `SYSTEM.STATS` table, which gets populated as splits and compactions happen. You can also run a `count(*)` query directly against the index table, though that puts more load on your system because requires a full table scan.

Tips:

* Create [local](https://phoenix.apache.org/secondary_indexing.html#Local_Indexes) indexes for write-heavy use cases.
* Create global indexes for read-heavy use cases. To save read-time overhead, consider creating [covered](https://phoenix.apache.org/secondary_indexing.html#Covered_Indexes) indexes.
* If the primary key is monotonically increasing, create salt buckets. The salt buckets can't be changed later, so design them to handle future growth. Salt buckets help avoid write hotspots, but can decrease overall throughput due to the additional scans needed on read.
* Set up a cron job to build indexes. Use `ASYNC` with `CREATE INDEX` to avoid blocking.
* Only create the indexes you need.
* Limit the number of indexes on frequently updated tables.
* Use covered indexes to convert table scans into efficient point lookups or range queries over the index table instead of the primary table:
    ` CREATE INDEX index ON table `( … )` INCLUDE `( … ) 

# Queries

It's important to know which queries are executed on the server side versus the client side, because this can impact performace due to network I/O and other bottlenecks. If you're querying a billion-row table, you want to do as much computation as possible on the server side rather than transmitting a billion rows to the client for processing. Some queries, on the other hand, must be executed on the client. Sorting data that lives on multiple region servers, for example, requires that you aggregate and re-sort on the client. 

## Reading

* Avoid joins unless one side is small, especially on frequent queries. For larger joins, see “Hints,” below.
* In the `WHERE` clause, filter leading columns in the primary key constraint.
*  Filtering the first leading column with `IN` or `OR` in the `WHERE` clause enables skip scan optimizations.
*  Equality or comparisions (`<` or `>`) in the `WHERE` clause enables range scan optimizations.
*  Let Phoenix optimize query parallelism using statistics. This provides an automatic benefit if using Phoenix 4.2 or greater in production.

See also: https://phoenix.apache.org/joins.html

### Range Queries

If you regularly scan large data sets from spinning disk, you're best off with GZIP (but watch write speed). Use a lot of cores for a scan to utilize the available memory bandwidth.  Apache Phoenix makes it easy to utilize many cores to increase scan performance.

For range queries, the HBase block cache does not provide much advantage.

### Large Range Queries

For large range queries, consider  setting `Scan.setCacheBlocks(false)` even if the whole scan could fit into the block cache.

If you mostly perform large range queries you might even want to consider running HBase with a much smaller heap and size the block cache down, to only rely on the OS Cache. This will alleviate some garbage collection related issues.

### Point Lookups

For point lookups it is quite important to have your data set cached, and you should use the HBase block cache. 

###  Hints

Hints let you override default query processing behavior and specify such factors as which index to use, what type of scan to perform, and what type of join to use. 

* During the query, Hint global index if you want to force it when query includes a column not in the index.
* If necessary, you can do bigger joins with the `/*+ USE_SORT_MERGE_JOIN */` hint, but a big join will be an expensive operation over huge numbers of rows.
* If the overall size of all right-hand-side tables would exceed the memory size limit, use the `/*+ NO_STAR_JOIN */ `hint.

See also: [Hint](https://phoenix.apache.org/language/#hint).

### Explain Plans

An `EXPLAIN` plan tells you a lot about how a query will be run. To generate an explain plan run [this](language/index.html#explain) query and to interpret the plan, see [this](explainplan.html) reference.

### Parallelization

You can improve parallelization with the [UPDATE STATISTICS](https://phoenix.apache.org/update_statistics.html) command. This command subdivides each region by determining keys called *guideposts* that are equidistant from each other, then uses these guideposts to break up queries into multiple parallel scans.
Statistics are turned on by default. With Phoenix 4.9, the user can set guidepost width for each table. Optimal guidepost width depends on a number of factors such as cluster size, cluster usage, number of cores per node, table size, and disk I/O.

In Phoenix 4.12, we have added a new configuration <code>phoenix.use.stats.parallelization</code> that controls whether statistics should be used for driving parallelization. Note that one can still run stats collection. The information collected is used to surface estimates on number of bytes and rows a query will scan when an EXPLAIN is generated for it. 

## Writing

### Updating data with UPSERT VALUES

When using `UPSERT VALUES` to write a large number of records, turn off autocommit and batch records in reasonably small batches (try 100 rows and adjust from there to fine-tune performance).

**Note:** With the default fat driver, `executeBatch()` will not provide any benefit.  Instead update mutliple rows by executing `UPSERT VALUES` mutliple times and then use `commit()` to submit the batch to the cluster. With the thin driver, however, it's important to use `executeBatch()` as this will minimize the number of RPCs between the client and query server.


```
try (Connection conn = DriverManager.getConnection(url)) {
  conn.setAutoCommit(false);
  int batchSize = 0;
  int commitSize = 1000; // number of rows you want to commit per batch.  
  try (Statement stmt = conn.prepareStatement(upsert)) {
    stmt.set ... while (there are records to upsert) {
      stmt.executeUpdate(); 
      batchSize++; 
      if (batchSize % commitSize == 0) { 
        conn.commit(); 
      } 
   } 
 conn.commit(); // commit the last batch of records 
 }
```

**Note:** Because the Phoenix client keeps uncommitted rows in memory, be careful not to set `commitSize` too high.

### Updating data with UPSERT SELECT
When using `UPSERT SELECT` to write many rows in a single statement, turn on autocommit and the rows will be automatically batched according to the `phoenix.mutate.batchSize`. This will minimize the amount of data returned back to the client and is the most efficient means of updating many rows.

### Deleting data

When deleting a large data set, turn on autoCommit before issuing the `DELETE` query so that the client does not need to remember the row keys of all the keys as they are deleted. This prevents the client from buffering the rows affected by the `DELETE` so that Phoenix can delete them directly on the region servers without the expense of returning them to the client.

### Reducing RPC traffic

To reduce RPC traffic, set the `UPDATE_CACHE_FREQUENCY` (4.7 or above) on your table and indexes when you create them (or issue an `ALTER TABLE`/`INDEX` call. See https://phoenix.apache.org/#Altering.

### Using local indexes

If using 4.8, consider using local indexes to minimize the write time. In this case, the writes for the secondary index will be to the same region server as your base table. This approach does involve a performance hit on the read side, though, so make sure to quantify both write speed improvement and read speed reduction.

# Further Tuning

For advice about tuning the underlying HBase and JVM layers, see [Operational and Performance Configuration Options](https://hbase.apache.org/book.html#schema.ops) in the Apache HBase™ Reference Guide.

## Special Cases

The following sections provide Phoenix-specific additions to the tuning recommendations in the Apache HBase™ Reference Guide section referenced above. 

### For applications where failing quickly is better than waiting

In addition to the HBase tuning referenced above, set `phoenix.query.timeoutMs` in `hbase-site.xml` on the client side to the maximum tolerable wait time in milliseconds.

### For applications that can tolerate slightly out of date information

In addition to the HBase tuning referenced above, set `phoenix.connection.consistency = timeline` in `hbase-site.xml` on the client side for all connections.
