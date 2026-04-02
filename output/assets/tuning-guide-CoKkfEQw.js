import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`Tuning Phoenix can be complex, but with a little knowledge of how it works you can make significant improvements to read and write performance. The most important factor is schema design, especially how it affects underlying HBase row keys. See "General Tips" below for design guidance based on anticipated data access patterns. Subsequent sections describe how to use secondary indexes, hints, and explain plans.

**Note:** Phoenix and HBase work well when your application does point lookups and small range scans. This can be achieved by good primary key design (see below). If you find that your application requires many full table scans, then Phoenix and HBase are likely not the best tool for the job. Instead, look at using other tools that write to HDFS directly using columnar representations such as Parquet.

## Primary Keys

The underlying row key design is the single most important factor in Phoenix performance, and it's important to get it right at design time because you cannot change it later without re-writing the data and index tables.

The Phoenix primary keys are concatenated to create the underlying row key in Apache HBase. Choose and order primary key columns to align with common query patterns. The leading key column has the greatest performance impact. For example, if you lead with a column containing org IDs, it is easy to select all rows for a specific org. You can also add the HBase row timestamp to the primary key to improve scan efficiency by skipping rows outside the queried time range.

Every primary key imposes a cost because the entire row key is appended to every piece of data in memory and on disk. The larger the row key, the greater the storage overhead. Find ways to store information compactly in columns you plan to use for primary keys — store deltas instead of complete time stamps, for example.

To sum up, the best practice is to design primary keys to add up to a row key that lets you scan the smallest amount of data.

**Tip:** When choosing primary keys, lead with the column you filter most frequently across the queries that are most important to optimize. If you use \`ORDER BY\`, make sure your PK columns match expressions in the \`ORDER BY\` clause.

### Monotonically increasing Primary keys

If your primary keys are monotonically increasing, use salting to help distribute writes across the cluster and improve parallelization. Example:

\`CREATE TABLE … ( … ) SALT_BUCKETS = N\`

For optimal performance the number of salt buckets should approximately equal the number of region servers. Do not salt automatically. Use salting only when experiencing hotspotting. The downside of salting is that it imposes a cost on read because when you want to query the data you have to run multiple queries to do a range scan.

## General Tips

The following sections provide a few general tips for different access scenarios.

### Is the Data Random-Access?

* As with any random read workloads, SSDs can improve performance because of their faster random seek time.

### Is the data read-heavy or write-heavy?

* For read-heavy data:
  * Create global indexes. This will affect write speed depending on the number of columns included in an index because each index writes to its own separate table.
  * Use multiple indexes to provide fast access to common queries.
  * When specifying machines for HBase, do not skimp on cores; HBase needs them.
* For write-heavy data:
  * Pre-split the table. It can be helpful to split the table into predefined regions, or if keys are monotonically increasing, use salting to avoid creating write hotspots on a small number of nodes. Use real data types rather than raw byte data.
  * Create local indexes. Reads from local indexes have a performance penalty, so it's important to do performance testing. See the [Pherf](/docs/fundamentals/performance-testing) tool.

### Which columns will be accessed often?

* Choose commonly-queried columns as primary keys. For more information, see “Primary Keys” below.
  * Create additional indexes to support common query patterns, including heavily accessed fields that are not in the primary key.

### Can the data be append-only (immutable)?

* If the data is immutable or append-only, declare the table and its indexes as immutable using the \`IMMUTABLE_ROWS\` [option](/docs/grammar#options) at creation time to reduce the write-time cost. If you need to make an existing table immutable, you can do so with \`ALTER TABLE trans.event SET IMMUTABLE_ROWS=true\` after creation time.
  * If speed is more important than data integrity, you can use the \`DISABLE_WAL\` [option](/docs/grammar#options). Note: it is possible to lose data with \`DISABLE_WAL\` if a region server fails.
* Set the \`UPDATE_CACHE_FREQUENCY\` [option](/docs/grammar#options) to 15 minutes or so if your metadata doesn't change very often. This property determines how often an RPC is done to ensure you're seeing the latest schema.
* If the data is not sparse (over 50% of the cells have values), use the SINGLE\\_CELL\\_ARRAY\\_WITH\\_OFFSETS data encoding scheme introduced in Phoenix 4.10, which obtains faster performance by reducing the size of the data. For more information, see “[Column Mapping and Immutable Data Encoding](https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data)” on the Apache Phoenix blog.

### Is the table very large?

* Use the \`ASYNC\` keyword with your \`CREATE INDEX\` call to create the index asynchronously via MapReduce job. You'll need to manually start the job; see [Index Population](/docs/features/secondary-indexes#index-population) for details.
* If the data is too large to scan the table completely, use primary keys to create an underlying composite row key that makes it easy to return a subset of the data or facilitates [skip-scanning](/docs/features/skip-scan) — Phoenix can jump directly to matching keys when the query includes key sets in the predicate.

### Is transactionality required?

A transaction is a data operation that is atomic — that is, guaranteed to succeed completely or not at all. For example, if you need to make cross-row updates to a data table, then you should consider your data transactional.

* If you need transactionality, use the \`TRANSACTIONAL\` [option](/docs/grammar#options). (See also [Transactions](/docs/features/transactions))

### Block Encoding

Using compression or encoding is a must. Both SNAPPY and FAST\\_DIFF are good all around options.

\`FAST_DIFF\` encoding is automatically enabled on all Phoenix tables by default, and almost always improves overall read latencies and throughput by allowing more data to fit into blockcache. Note: \`FAST_DIFF\` encoding can increase garbage produced during request processing.

Set encoding at table creation time. Example:
\` CREATE TABLE … ( … ) DATA_BLOCK_ENCODING=‘FAST_DIFF’\`

## Schema Design

Because the schema affects the way the data is written to the underlying HBase layer, Phoenix performance relies on the design of your tables, indexes, and primary keys.

## Phoenix and the HBase data model

HBase stores data in tables, which in turn contain columns grouped in column families. A row in an HBase table consists of versioned cells associated with one or more columns. An HBase row is a collection of many key-value pairs in which the rowkey attribute of the keys are equal. Data in an HBase table is sorted by the rowkey, and all access is via the rowkey.
Phoenix creates a relational data model on top of HBase, enforcing a PRIMARY KEY constraint whose columns are concatenated to form the row key for the underlying HBase table. For this reason, it's important to be cognizant of the size and number of the columns you include in the PK constraint, because a copy of the row key is included with every cell in the underlying HBase table.

## Column Families

If some columns are accessed more frequently than others, [create multiple column families](/docs/faq#are-there-any-tips-for-optimizing-phoenix) to separate the frequently-accessed columns from rarely-accessed columns. This improves performance because HBase reads only the column families specified in the query.

## Columns

Here are a few tips that apply to columns in general, whether they are indexed or not:

* Keep \`VARCHAR\` columns under 1MB or so due to I/O costs. When processing queries, HBase materializes cells in full before sending them over to the client, and the client receives them in full before handing them off to the application code.
* For structured objects, don't use JSON, which is not very compact. Use a format such as protobuf, Avro, msgpack, or BSON.
* Consider compressing data before storage using a fast LZ variant to cut latency and I/O costs.
* Use the column mapping feature (added in Phoenix 4.10), which uses numerical HBase column qualifiers for non-PK columns instead of directly using column names. This improves performance when looking for a cell in the sorted list of cells returned by HBase, adds further across-the-board performance by reducing the disk size used by tables, and speeds up DDL operations like column rename and metadata-level column drops. For more information, see “[Column Mapping and Immutable Data Encoding](https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data)” on the Apache Phoenix blog.

## Indexes

A Phoenix index is a physical table that stores a pivoted copy of some or all of the data in the main table to serve specific query patterns. When you issue a query, Phoenix automatically selects the best index. The primary index is created automatically based on selected primary keys. You can create secondary indexes by specifying included columns based on expected query patterns.

See also:
[Secondary Indexing](/docs/features/secondary-indexes)

## Secondary indexes

Secondary indexes can improve read performance by turning what would normally be a full table scan into a point lookup (at the cost of storage space and write speed). Secondary indexes can be added or removed after table creation and don't require changes to existing queries – queries simply run faster. A small number of secondary indexes is often sufficient. Depending on your needs, consider creating *[covered](/docs/features/secondary-indexes#covered-indexes)* indexes or *[functional](/docs/features/secondary-indexes#functional-indexes)* indexes, or both.

If your table is large, use \`ASYNC\` with \`CREATE INDEX\` to create indexes asynchronously. In this case, index build runs through MapReduce, so client restarts will not impact index creation and jobs can be retried automatically if needed. You still need to start the job manually, and then monitor it like any other MapReduce job.

Example:

\`\`\`sql
CREATE INDEX IF NOT EXISTS event_object_id_idx_b
ON trans.event (object_id)
ASYNC UPDATE_CACHE_FREQUENCY = 60000;
\`\`\`

See [Index Population](/docs/features/secondary-indexes#index-population) for details.

If you cannot create the index asynchronously, increase query timeout (\`phoenix.query.timeoutMs\`) to exceed expected index build time. If \`CREATE INDEX\` times out or the client goes down before completion, the build stops and must be run again. You can monitor the index table during creation: new regions appear as splits occur. You can query \`SYSTEM.STATS\` (populated by splits/compactions), or run \`COUNT(*)\` against the index table (higher load because it requires a full scan).

Tips:

* Create [local](/docs/features/secondary-indexes#local-indexes) indexes for write-heavy use cases.
* Create global indexes for read-heavy use cases. To save read-time overhead, consider creating [covered](/docs/features/secondary-indexes#covered-indexes) indexes.
* If the primary key is monotonically increasing, create salt buckets. The salt buckets can't be changed later, so design them to handle future growth. Salt buckets help avoid write hotspots, but can decrease overall throughput due to the additional scans needed on read.
* Set up a cron job to build indexes. Use \`ASYNC\` with \`CREATE INDEX\` to avoid blocking.
* Only create the indexes you need.
* Limit the number of indexes on frequently updated tables.
* Use covered indexes to convert table scans into efficient point lookups or range queries over the index table instead of the primary table:

  \`\`\`sql
  CREATE INDEX idx ON table_name ( ... ) INCLUDE ( ... );
  \`\`\`

## Queries

It's important to know which queries execute on the server side versus client side, because this affects performance due to network I/O and other bottlenecks. If you're querying a billion-row table, you want as much computation as possible on the server side instead of transmitting rows to the client. Some queries must still execute on the client. Sorting data that resides on multiple region servers, for example, requires aggregation and re-sort on the client.

## Reading

* Avoid joins unless one side is small, especially on frequent queries. For larger joins, see “Hints,” below.
* In the \`WHERE\` clause, filter leading columns in the primary key constraint.
* Filtering the first leading column with \`IN\` or \`OR\` in the \`WHERE\` clause enables skip scan optimizations.
* Equality or comparisons (\`<\` or \`>\`) in the \`WHERE\` clause enable range-scan optimizations.
* Let Phoenix optimize query parallelism using statistics. This provides an automatic benefit if using Phoenix 4.2 or greater in production.

See also: [Joins](/docs/joins)

### Range Queries

If you regularly scan large data sets from spinning disk, you're best off with GZIP (but watch write speed). Use a lot of cores for a scan to utilize the available memory bandwidth. Apache Phoenix makes it easy to utilize many cores to increase scan performance.

For range queries, the HBase block cache does not provide much advantage.

### Large Range Queries

For large range queries, consider setting \`Scan.setCacheBlocks(false)\` even if the whole scan could fit into the block cache.

If you mostly perform large range queries you might even want to consider running HBase with a much smaller heap and size the block cache down, to only rely on the OS Cache. This will alleviate some garbage collection related issues.

### Point Lookups

For point lookups it is quite important to have your data set cached, and you should use the HBase block cache.

### Hints

Hints let you override default query processing behavior and specify such factors as which index to use, what type of scan to perform, and what type of join to use.

* During the query, Hint global index if you want to force it when query includes a column not in the index.
* If necessary, you can do bigger joins with the \`/*+ USE_SORT_MERGE_JOIN */\` hint, but a big join will be an expensive operation over huge numbers of rows.
* If the overall size of all right-hand-side tables would exceed the memory size limit, use the \`/*+ NO_STAR_JOIN */ \`hint.

See also: [Hint](/docs/grammar#hint).

### Explain plans

An \`EXPLAIN\` plan tells you a lot about how a query will be run. To generate an explain plan run [this](/docs/grammar#explain) query and to interpret the plan, see [this](/docs/explain-plan) reference.

### Parallelization

You can improve parallelization with the [UPDATE STATISTICS](/docs/features/statistics-collection) command. This command subdivides each region by determining keys called *guideposts* that are equidistant from each other, then uses these guideposts to break up queries into multiple parallel scans.
Statistics are turned on by default. With Phoenix 4.9, the user can set guidepost width for each table. Optimal guidepost width depends on a number of factors such as cluster size, cluster usage, number of cores per node, table size, and disk I/O.

In Phoenix 4.12, configuration \`phoenix.use.stats.parallelization\` was added to control whether statistics are used to drive parallelization. Stats collection can still run regardless. Collected information is also used to estimate bytes and rows scanned when generating \`EXPLAIN\`.

## Writing

### Updating data with UPSERT VALUES

When using \`UPSERT VALUES\` to write a large number of records, turn off autocommit and batch records in reasonably small batches (try 100 rows and adjust from there to fine-tune performance).

**Note:** With the default fat driver, \`executeBatch()\` does not provide benefit. Instead, update multiple rows by executing \`UPSERT VALUES\` multiple times and then use \`commit()\` to submit the batch. With the thin driver, however, use \`executeBatch()\` to minimize RPCs between the client and query server.

\`\`\`java
try (Connection conn = DriverManager.getConnection(url)) {
  conn.setAutoCommit(false);
  int batchSize = 0;
  int commitSize = 1000; // number of rows you want to commit per batch.
  try (PreparedStatement stmt = conn.prepareStatement(upsert)) {
    // set params...
    while (/* there are records to upsert */) {
      stmt.executeUpdate();
      batchSize++;
      if (batchSize % commitSize == 0) {
        conn.commit();
      }
   }
 conn.commit(); // commit the last batch of records
 }
\`\`\`

**Note:** Because the Phoenix client keeps uncommitted rows in memory, be careful not to set \`commitSize\` too high.

### Updating data with UPSERT SELECT

When using \`UPSERT SELECT\` to write many rows in a single statement, turn on autocommit and the rows will be automatically batched according to the \`phoenix.mutate.batchSize\`. This will minimize the amount of data returned back to the client and is the most efficient means of updating many rows.

### Deleting data

When deleting a large data set, turn on autoCommit before issuing the \`DELETE\` query so that the client does not need to remember the row keys of all the keys as they are deleted. This prevents the client from buffering the rows affected by the \`DELETE\` so that Phoenix can delete them directly on the region servers without the expense of returning them to the client.

### Reducing RPC traffic

To reduce RPC traffic, set \`UPDATE_CACHE_FREQUENCY\` (4.7 or above) on your tables and indexes when creating them (or via \`ALTER TABLE\`/\`ALTER INDEX\`). See [Altering](/docs#altering).

### Using local indexes

If using 4.8, consider using local indexes to minimize the write time. In this case, the writes for the secondary index will be to the same region server as your base table. This approach does involve a performance hit on the read side, though, so make sure to quantify both write speed improvement and read speed reduction.

## Further tuning

For advice about tuning the underlying HBase and JVM layers, see [Operational and Performance Configuration Options](https://hbase.apache.org/docs/regionserver-sizing#operational-and-performance-configuration-options) in the Apache HBase™ Reference Guide.

## Special Cases

The following sections provide Phoenix-specific additions to the tuning recommendations in the Apache HBase™ Reference Guide section referenced above.

### For applications where failing quickly is better than waiting

In addition to the HBase tuning referenced above, set \`phoenix.query.timeoutMs\` in \`hbase-site.xml\` on the client side to the maximum tolerable wait time in milliseconds.

### For applications that can tolerate slightly out of date information

In addition to the HBase tuning referenced above, set \`phoenix.connection.consistency = timeline\` in \`hbase-site.xml\` on the client side for all connections.
`,o={title:"Tuning Guide",description:"Best practices for tuning Phoenix schema, indexes, queries, and write paths for read/write performance."},r=[{href:"/docs/fundamentals/performance-testing"},{href:"/docs/grammar#options"},{href:"/docs/grammar#options"},{href:"/docs/grammar#options"},{href:"https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data"},{href:"/docs/features/secondary-indexes#index-population"},{href:"/docs/features/skip-scan"},{href:"/docs/grammar#options"},{href:"/docs/features/transactions"},{href:"/docs/faq#are-there-any-tips-for-optimizing-phoenix"},{href:"https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data"},{href:"/docs/features/secondary-indexes"},{href:"/docs/features/secondary-indexes#covered-indexes"},{href:"/docs/features/secondary-indexes#functional-indexes"},{href:"/docs/features/secondary-indexes#index-population"},{href:"/docs/features/secondary-indexes#local-indexes"},{href:"/docs/features/secondary-indexes#covered-indexes"},{href:"/docs/joins"},{href:"/docs/grammar#hint"},{href:"/docs/grammar#explain"},{href:"/docs/explain-plan"},{href:"/docs/features/statistics-collection"},{href:"/docs#altering"},{href:"https://hbase.apache.org/docs/regionserver-sizing#operational-and-performance-configuration-options"}],l={contents:[{heading:void 0,content:'Tuning Phoenix can be complex, but with a little knowledge of how it works you can make significant improvements to read and write performance. The most important factor is schema design, especially how it affects underlying HBase row keys. See "General Tips" below for design guidance based on anticipated data access patterns. Subsequent sections describe how to use secondary indexes, hints, and explain plans.'},{heading:void 0,content:"Note: Phoenix and HBase work well when your application does point lookups and small range scans. This can be achieved by good primary key design (see below). If you find that your application requires many full table scans, then Phoenix and HBase are likely not the best tool for the job. Instead, look at using other tools that write to HDFS directly using columnar representations such as Parquet."},{heading:"primary-keys",content:"The underlying row key design is the single most important factor in Phoenix performance, and it's important to get it right at design time because you cannot change it later without re-writing the data and index tables."},{heading:"primary-keys",content:"The Phoenix primary keys are concatenated to create the underlying row key in Apache HBase. Choose and order primary key columns to align with common query patterns. The leading key column has the greatest performance impact. For example, if you lead with a column containing org IDs, it is easy to select all rows for a specific org. You can also add the HBase row timestamp to the primary key to improve scan efficiency by skipping rows outside the queried time range."},{heading:"primary-keys",content:"Every primary key imposes a cost because the entire row key is appended to every piece of data in memory and on disk. The larger the row key, the greater the storage overhead. Find ways to store information compactly in columns you plan to use for primary keys — store deltas instead of complete time stamps, for example."},{heading:"primary-keys",content:"To sum up, the best practice is to design primary keys to add up to a row key that lets you scan the smallest amount of data."},{heading:"primary-keys",content:"Tip: When choosing primary keys, lead with the column you filter most frequently across the queries that are most important to optimize. If you use ORDER BY, make sure your PK columns match expressions in the ORDER BY clause."},{heading:"monotonically-increasing-primary-keys",content:"If your primary keys are monotonically increasing, use salting to help distribute writes across the cluster and improve parallelization. Example:"},{heading:"monotonically-increasing-primary-keys",content:"CREATE TABLE … ( … ) SALT_BUCKETS = N"},{heading:"monotonically-increasing-primary-keys",content:"For optimal performance the number of salt buckets should approximately equal the number of region servers. Do not salt automatically. Use salting only when experiencing hotspotting. The downside of salting is that it imposes a cost on read because when you want to query the data you have to run multiple queries to do a range scan."},{heading:"general-tips",content:"The following sections provide a few general tips for different access scenarios."},{heading:"is-the-data-random-access",content:"As with any random read workloads, SSDs can improve performance because of their faster random seek time."},{heading:"is-the-data-read-heavy-or-write-heavy",content:"For read-heavy data:"},{heading:"is-the-data-read-heavy-or-write-heavy",content:"Create global indexes. This will affect write speed depending on the number of columns included in an index because each index writes to its own separate table."},{heading:"is-the-data-read-heavy-or-write-heavy",content:"Use multiple indexes to provide fast access to common queries."},{heading:"is-the-data-read-heavy-or-write-heavy",content:"When specifying machines for HBase, do not skimp on cores; HBase needs them."},{heading:"is-the-data-read-heavy-or-write-heavy",content:"For write-heavy data:"},{heading:"is-the-data-read-heavy-or-write-heavy",content:"Pre-split the table. It can be helpful to split the table into predefined regions, or if keys are monotonically increasing, use salting to avoid creating write hotspots on a small number of nodes. Use real data types rather than raw byte data."},{heading:"is-the-data-read-heavy-or-write-heavy",content:"Create local indexes. Reads from local indexes have a performance penalty, so it's important to do performance testing. See the Pherf tool."},{heading:"which-columns-will-be-accessed-often",content:"Choose commonly-queried columns as primary keys. For more information, see “Primary Keys” below."},{heading:"which-columns-will-be-accessed-often",content:"Create additional indexes to support common query patterns, including heavily accessed fields that are not in the primary key."},{heading:"can-the-data-be-append-only-immutable",content:"If the data is immutable or append-only, declare the table and its indexes as immutable using the IMMUTABLE_ROWS option at creation time to reduce the write-time cost. If you need to make an existing table immutable, you can do so with ALTER TABLE trans.event SET IMMUTABLE_ROWS=true after creation time."},{heading:"can-the-data-be-append-only-immutable",content:"If speed is more important than data integrity, you can use the DISABLE_WAL option. Note: it is possible to lose data with DISABLE_WAL if a region server fails."},{heading:"can-the-data-be-append-only-immutable",content:"Set the UPDATE_CACHE_FREQUENCY option to 15 minutes or so if your metadata doesn't change very often. This property determines how often an RPC is done to ensure you're seeing the latest schema."},{heading:"can-the-data-be-append-only-immutable",content:"If the data is not sparse (over 50% of the cells have values), use the SINGLE_CELL_ARRAY_WITH_OFFSETS data encoding scheme introduced in Phoenix 4.10, which obtains faster performance by reducing the size of the data. For more information, see “Column Mapping and Immutable Data Encoding” on the Apache Phoenix blog."},{heading:"is-the-table-very-large",content:"Use the ASYNC keyword with your CREATE INDEX call to create the index asynchronously via MapReduce job. You'll need to manually start the job; see Index Population for details."},{heading:"is-the-table-very-large",content:"If the data is too large to scan the table completely, use primary keys to create an underlying composite row key that makes it easy to return a subset of the data or facilitates skip-scanning — Phoenix can jump directly to matching keys when the query includes key sets in the predicate."},{heading:"is-transactionality-required",content:"A transaction is a data operation that is atomic — that is, guaranteed to succeed completely or not at all. For example, if you need to make cross-row updates to a data table, then you should consider your data transactional."},{heading:"is-transactionality-required",content:"If you need transactionality, use the TRANSACTIONAL option. (See also Transactions)"},{heading:"block-encoding",content:"Using compression or encoding is a must. Both SNAPPY and FAST_DIFF are good all around options."},{heading:"block-encoding",content:"FAST_DIFF encoding is automatically enabled on all Phoenix tables by default, and almost always improves overall read latencies and throughput by allowing more data to fit into blockcache. Note: FAST_DIFF encoding can increase garbage produced during request processing."},{heading:"block-encoding",content:`Set encoding at table creation time. Example:
 CREATE TABLE … ( … ) DATA_BLOCK_ENCODING=‘FAST_DIFF’`},{heading:"schema-design",content:"Because the schema affects the way the data is written to the underlying HBase layer, Phoenix performance relies on the design of your tables, indexes, and primary keys."},{heading:"phoenix-and-the-hbase-data-model",content:`HBase stores data in tables, which in turn contain columns grouped in column families. A row in an HBase table consists of versioned cells associated with one or more columns. An HBase row is a collection of many key-value pairs in which the rowkey attribute of the keys are equal. Data in an HBase table is sorted by the rowkey, and all access is via the rowkey.
Phoenix creates a relational data model on top of HBase, enforcing a PRIMARY KEY constraint whose columns are concatenated to form the row key for the underlying HBase table. For this reason, it's important to be cognizant of the size and number of the columns you include in the PK constraint, because a copy of the row key is included with every cell in the underlying HBase table.`},{heading:"column-families",content:"If some columns are accessed more frequently than others, create multiple column families to separate the frequently-accessed columns from rarely-accessed columns. This improves performance because HBase reads only the column families specified in the query."},{heading:"columns",content:"Here are a few tips that apply to columns in general, whether they are indexed or not:"},{heading:"columns",content:"Keep VARCHAR columns under 1MB or so due to I/O costs. When processing queries, HBase materializes cells in full before sending them over to the client, and the client receives them in full before handing them off to the application code."},{heading:"columns",content:"For structured objects, don't use JSON, which is not very compact. Use a format such as protobuf, Avro, msgpack, or BSON."},{heading:"columns",content:"Consider compressing data before storage using a fast LZ variant to cut latency and I/O costs."},{heading:"columns",content:"Use the column mapping feature (added in Phoenix 4.10), which uses numerical HBase column qualifiers for non-PK columns instead of directly using column names. This improves performance when looking for a cell in the sorted list of cells returned by HBase, adds further across-the-board performance by reducing the disk size used by tables, and speeds up DDL operations like column rename and metadata-level column drops. For more information, see “Column Mapping and Immutable Data Encoding” on the Apache Phoenix blog."},{heading:"indexes",content:"A Phoenix index is a physical table that stores a pivoted copy of some or all of the data in the main table to serve specific query patterns. When you issue a query, Phoenix automatically selects the best index. The primary index is created automatically based on selected primary keys. You can create secondary indexes by specifying included columns based on expected query patterns."},{heading:"indexes",content:`See also:
Secondary Indexing`},{heading:"tuning-guide-secondary-indexes",content:"Secondary indexes can improve read performance by turning what would normally be a full table scan into a point lookup (at the cost of storage space and write speed). Secondary indexes can be added or removed after table creation and don't require changes to existing queries – queries simply run faster. A small number of secondary indexes is often sufficient. Depending on your needs, consider creating covered indexes or functional indexes, or both."},{heading:"tuning-guide-secondary-indexes",content:"If your table is large, use ASYNC with CREATE INDEX to create indexes asynchronously. In this case, index build runs through MapReduce, so client restarts will not impact index creation and jobs can be retried automatically if needed. You still need to start the job manually, and then monitor it like any other MapReduce job."},{heading:"tuning-guide-secondary-indexes",content:"Example:"},{heading:"tuning-guide-secondary-indexes",content:"See Index Population for details."},{heading:"tuning-guide-secondary-indexes",content:"If you cannot create the index asynchronously, increase query timeout (phoenix.query.timeoutMs) to exceed expected index build time. If CREATE INDEX times out or the client goes down before completion, the build stops and must be run again. You can monitor the index table during creation: new regions appear as splits occur. You can query SYSTEM.STATS (populated by splits/compactions), or run COUNT(*) against the index table (higher load because it requires a full scan)."},{heading:"tuning-guide-secondary-indexes",content:"Tips:"},{heading:"tuning-guide-secondary-indexes",content:"Create local indexes for write-heavy use cases."},{heading:"tuning-guide-secondary-indexes",content:"Create global indexes for read-heavy use cases. To save read-time overhead, consider creating covered indexes."},{heading:"tuning-guide-secondary-indexes",content:"If the primary key is monotonically increasing, create salt buckets. The salt buckets can't be changed later, so design them to handle future growth. Salt buckets help avoid write hotspots, but can decrease overall throughput due to the additional scans needed on read."},{heading:"tuning-guide-secondary-indexes",content:"Set up a cron job to build indexes. Use ASYNC with CREATE INDEX to avoid blocking."},{heading:"tuning-guide-secondary-indexes",content:"Only create the indexes you need."},{heading:"tuning-guide-secondary-indexes",content:"Limit the number of indexes on frequently updated tables."},{heading:"tuning-guide-secondary-indexes",content:"Use covered indexes to convert table scans into efficient point lookups or range queries over the index table instead of the primary table:"},{heading:"queries",content:"It's important to know which queries execute on the server side versus client side, because this affects performance due to network I/O and other bottlenecks. If you're querying a billion-row table, you want as much computation as possible on the server side instead of transmitting rows to the client. Some queries must still execute on the client. Sorting data that resides on multiple region servers, for example, requires aggregation and re-sort on the client."},{heading:"reading",content:"Avoid joins unless one side is small, especially on frequent queries. For larger joins, see “Hints,” below."},{heading:"reading",content:"In the WHERE clause, filter leading columns in the primary key constraint."},{heading:"reading",content:"Filtering the first leading column with IN or OR in the WHERE clause enables skip scan optimizations."},{heading:"reading",content:"Equality or comparisons (< or >) in the WHERE clause enable range-scan optimizations."},{heading:"reading",content:"Let Phoenix optimize query parallelism using statistics. This provides an automatic benefit if using Phoenix 4.2 or greater in production."},{heading:"reading",content:"See also: Joins"},{heading:"range-queries",content:"If you regularly scan large data sets from spinning disk, you're best off with GZIP (but watch write speed). Use a lot of cores for a scan to utilize the available memory bandwidth. Apache Phoenix makes it easy to utilize many cores to increase scan performance."},{heading:"range-queries",content:"For range queries, the HBase block cache does not provide much advantage."},{heading:"large-range-queries",content:"For large range queries, consider setting Scan.setCacheBlocks(false) even if the whole scan could fit into the block cache."},{heading:"large-range-queries",content:"If you mostly perform large range queries you might even want to consider running HBase with a much smaller heap and size the block cache down, to only rely on the OS Cache. This will alleviate some garbage collection related issues."},{heading:"point-lookups",content:"For point lookups it is quite important to have your data set cached, and you should use the HBase block cache."},{heading:"hints",content:"Hints let you override default query processing behavior and specify such factors as which index to use, what type of scan to perform, and what type of join to use."},{heading:"hints",content:"During the query, Hint global index if you want to force it when query includes a column not in the index."},{heading:"hints",content:"If necessary, you can do bigger joins with the /*+ USE_SORT_MERGE_JOIN */ hint, but a big join will be an expensive operation over huge numbers of rows."},{heading:"hints",content:"If the overall size of all right-hand-side tables would exceed the memory size limit, use the /*+ NO_STAR_JOIN */ hint."},{heading:"hints",content:"See also: Hint."},{heading:"explain-plans",content:"An EXPLAIN plan tells you a lot about how a query will be run. To generate an explain plan run this query and to interpret the plan, see this reference."},{heading:"tuning-guide-parallelization",content:`You can improve parallelization with the UPDATE STATISTICS command. This command subdivides each region by determining keys called guideposts that are equidistant from each other, then uses these guideposts to break up queries into multiple parallel scans.
Statistics are turned on by default. With Phoenix 4.9, the user can set guidepost width for each table. Optimal guidepost width depends on a number of factors such as cluster size, cluster usage, number of cores per node, table size, and disk I/O.`},{heading:"tuning-guide-parallelization",content:"In Phoenix 4.12, configuration phoenix.use.stats.parallelization was added to control whether statistics are used to drive parallelization. Stats collection can still run regardless. Collected information is also used to estimate bytes and rows scanned when generating EXPLAIN."},{heading:"updating-data-with-upsert-values",content:"When using UPSERT VALUES to write a large number of records, turn off autocommit and batch records in reasonably small batches (try 100 rows and adjust from there to fine-tune performance)."},{heading:"updating-data-with-upsert-values",content:"Note: With the default fat driver, executeBatch() does not provide benefit. Instead, update multiple rows by executing UPSERT VALUES multiple times and then use commit() to submit the batch. With the thin driver, however, use executeBatch() to minimize RPCs between the client and query server."},{heading:"updating-data-with-upsert-values",content:"Note: Because the Phoenix client keeps uncommitted rows in memory, be careful not to set commitSize too high."},{heading:"updating-data-with-upsert-select",content:"When using UPSERT SELECT to write many rows in a single statement, turn on autocommit and the rows will be automatically batched according to the phoenix.mutate.batchSize. This will minimize the amount of data returned back to the client and is the most efficient means of updating many rows."},{heading:"deleting-data",content:"When deleting a large data set, turn on autoCommit before issuing the DELETE query so that the client does not need to remember the row keys of all the keys as they are deleted. This prevents the client from buffering the rows affected by the DELETE so that Phoenix can delete them directly on the region servers without the expense of returning them to the client."},{heading:"reducing-rpc-traffic",content:"To reduce RPC traffic, set UPDATE_CACHE_FREQUENCY (4.7 or above) on your tables and indexes when creating them (or via ALTER TABLE/ALTER INDEX). See Altering."},{heading:"using-local-indexes",content:"If using 4.8, consider using local indexes to minimize the write time. In this case, the writes for the secondary index will be to the same region server as your base table. This approach does involve a performance hit on the read side, though, so make sure to quantify both write speed improvement and read speed reduction."},{heading:"further-tuning",content:"For advice about tuning the underlying HBase and JVM layers, see Operational and Performance Configuration Options in the Apache HBase™ Reference Guide."},{heading:"special-cases",content:"The following sections provide Phoenix-specific additions to the tuning recommendations in the Apache HBase™ Reference Guide section referenced above."},{heading:"for-applications-where-failing-quickly-is-better-than-waiting",content:"In addition to the HBase tuning referenced above, set phoenix.query.timeoutMs in hbase-site.xml on the client side to the maximum tolerable wait time in milliseconds."},{heading:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"In addition to the HBase tuning referenced above, set phoenix.connection.consistency = timeline in hbase-site.xml on the client side for all connections."}],headings:[{id:"primary-keys",content:"Primary Keys"},{id:"monotonically-increasing-primary-keys",content:"Monotonically increasing Primary keys"},{id:"general-tips",content:"General Tips"},{id:"is-the-data-random-access",content:"Is the Data Random-Access?"},{id:"is-the-data-read-heavy-or-write-heavy",content:"Is the data read-heavy or write-heavy?"},{id:"which-columns-will-be-accessed-often",content:"Which columns will be accessed often?"},{id:"can-the-data-be-append-only-immutable",content:"Can the data be append-only (immutable)?"},{id:"is-the-table-very-large",content:"Is the table very large?"},{id:"is-transactionality-required",content:"Is transactionality required?"},{id:"block-encoding",content:"Block Encoding"},{id:"schema-design",content:"Schema Design"},{id:"phoenix-and-the-hbase-data-model",content:"Phoenix and the HBase data model"},{id:"column-families",content:"Column Families"},{id:"columns",content:"Columns"},{id:"indexes",content:"Indexes"},{id:"tuning-guide-secondary-indexes",content:"Secondary indexes"},{id:"queries",content:"Queries"},{id:"reading",content:"Reading"},{id:"range-queries",content:"Range Queries"},{id:"large-range-queries",content:"Large Range Queries"},{id:"point-lookups",content:"Point Lookups"},{id:"hints",content:"Hints"},{id:"explain-plans",content:"Explain plans"},{id:"tuning-guide-parallelization",content:"Parallelization"},{id:"writing",content:"Writing"},{id:"updating-data-with-upsert-values",content:"Updating data with UPSERT VALUES"},{id:"updating-data-with-upsert-select",content:"Updating data with UPSERT SELECT"},{id:"deleting-data",content:"Deleting data"},{id:"reducing-rpc-traffic",content:"Reducing RPC traffic"},{id:"using-local-indexes",content:"Using local indexes"},{id:"further-tuning",content:"Further tuning"},{id:"special-cases",content:"Special Cases"},{id:"for-applications-where-failing-quickly-is-better-than-waiting",content:"For applications where failing quickly is better than waiting"},{id:"for-applications-that-can-tolerate-slightly-out-of-date-information",content:"For applications that can tolerate slightly out of date information"}]};const d=[{depth:2,url:"#primary-keys",title:e.jsx(e.Fragment,{children:"Primary Keys"})},{depth:3,url:"#monotonically-increasing-primary-keys",title:e.jsx(e.Fragment,{children:"Monotonically increasing Primary keys"})},{depth:2,url:"#general-tips",title:e.jsx(e.Fragment,{children:"General Tips"})},{depth:3,url:"#is-the-data-random-access",title:e.jsx(e.Fragment,{children:"Is the Data Random-Access?"})},{depth:3,url:"#is-the-data-read-heavy-or-write-heavy",title:e.jsx(e.Fragment,{children:"Is the data read-heavy or write-heavy?"})},{depth:3,url:"#which-columns-will-be-accessed-often",title:e.jsx(e.Fragment,{children:"Which columns will be accessed often?"})},{depth:3,url:"#can-the-data-be-append-only-immutable",title:e.jsx(e.Fragment,{children:"Can the data be append-only (immutable)?"})},{depth:3,url:"#is-the-table-very-large",title:e.jsx(e.Fragment,{children:"Is the table very large?"})},{depth:3,url:"#is-transactionality-required",title:e.jsx(e.Fragment,{children:"Is transactionality required?"})},{depth:3,url:"#block-encoding",title:e.jsx(e.Fragment,{children:"Block Encoding"})},{depth:2,url:"#schema-design",title:e.jsx(e.Fragment,{children:"Schema Design"})},{depth:2,url:"#phoenix-and-the-hbase-data-model",title:e.jsx(e.Fragment,{children:"Phoenix and the HBase data model"})},{depth:2,url:"#column-families",title:e.jsx(e.Fragment,{children:"Column Families"})},{depth:2,url:"#columns",title:e.jsx(e.Fragment,{children:"Columns"})},{depth:2,url:"#indexes",title:e.jsx(e.Fragment,{children:"Indexes"})},{depth:2,url:"#tuning-guide-secondary-indexes",title:e.jsx(e.Fragment,{children:"Secondary indexes"})},{depth:2,url:"#queries",title:e.jsx(e.Fragment,{children:"Queries"})},{depth:2,url:"#reading",title:e.jsx(e.Fragment,{children:"Reading"})},{depth:3,url:"#range-queries",title:e.jsx(e.Fragment,{children:"Range Queries"})},{depth:3,url:"#large-range-queries",title:e.jsx(e.Fragment,{children:"Large Range Queries"})},{depth:3,url:"#point-lookups",title:e.jsx(e.Fragment,{children:"Point Lookups"})},{depth:3,url:"#hints",title:e.jsx(e.Fragment,{children:"Hints"})},{depth:3,url:"#explain-plans",title:e.jsx(e.Fragment,{children:"Explain plans"})},{depth:3,url:"#tuning-guide-parallelization",title:e.jsx(e.Fragment,{children:"Parallelization"})},{depth:2,url:"#writing",title:e.jsx(e.Fragment,{children:"Writing"})},{depth:3,url:"#updating-data-with-upsert-values",title:e.jsx(e.Fragment,{children:"Updating data with UPSERT VALUES"})},{depth:3,url:"#updating-data-with-upsert-select",title:e.jsx(e.Fragment,{children:"Updating data with UPSERT SELECT"})},{depth:3,url:"#deleting-data",title:e.jsx(e.Fragment,{children:"Deleting data"})},{depth:3,url:"#reducing-rpc-traffic",title:e.jsx(e.Fragment,{children:"Reducing RPC traffic"})},{depth:3,url:"#using-local-indexes",title:e.jsx(e.Fragment,{children:"Using local indexes"})},{depth:2,url:"#further-tuning",title:e.jsx(e.Fragment,{children:"Further tuning"})},{depth:2,url:"#special-cases",title:e.jsx(e.Fragment,{children:"Special Cases"})},{depth:3,url:"#for-applications-where-failing-quickly-is-better-than-waiting",title:e.jsx(e.Fragment,{children:"For applications where failing quickly is better than waiting"})},{depth:3,url:"#for-applications-that-can-tolerate-slightly-out-of-date-information",title:e.jsx(e.Fragment,{children:"For applications that can tolerate slightly out of date information"})}];function i(t){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:'Tuning Phoenix can be complex, but with a little knowledge of how it works you can make significant improvements to read and write performance. The most important factor is schema design, especially how it affects underlying HBase row keys. See "General Tips" below for design guidance based on anticipated data access patterns. Subsequent sections describe how to use secondary indexes, hints, and explain plans.'}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Note:"})," Phoenix and HBase work well when your application does point lookups and small range scans. This can be achieved by good primary key design (see below). If you find that your application requires many full table scans, then Phoenix and HBase are likely not the best tool for the job. Instead, look at using other tools that write to HDFS directly using columnar representations such as Parquet."]}),`
`,e.jsx(n.h2,{id:"primary-keys",children:"Primary Keys"}),`
`,e.jsx(n.p,{children:"The underlying row key design is the single most important factor in Phoenix performance, and it's important to get it right at design time because you cannot change it later without re-writing the data and index tables."}),`
`,e.jsx(n.p,{children:"The Phoenix primary keys are concatenated to create the underlying row key in Apache HBase. Choose and order primary key columns to align with common query patterns. The leading key column has the greatest performance impact. For example, if you lead with a column containing org IDs, it is easy to select all rows for a specific org. You can also add the HBase row timestamp to the primary key to improve scan efficiency by skipping rows outside the queried time range."}),`
`,e.jsx(n.p,{children:"Every primary key imposes a cost because the entire row key is appended to every piece of data in memory and on disk. The larger the row key, the greater the storage overhead. Find ways to store information compactly in columns you plan to use for primary keys — store deltas instead of complete time stamps, for example."}),`
`,e.jsx(n.p,{children:"To sum up, the best practice is to design primary keys to add up to a row key that lets you scan the smallest amount of data."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Tip:"})," When choosing primary keys, lead with the column you filter most frequently across the queries that are most important to optimize. If you use ",e.jsx(n.code,{children:"ORDER BY"}),", make sure your PK columns match expressions in the ",e.jsx(n.code,{children:"ORDER BY"})," clause."]}),`
`,e.jsx(n.h3,{id:"monotonically-increasing-primary-keys",children:"Monotonically increasing Primary keys"}),`
`,e.jsx(n.p,{children:"If your primary keys are monotonically increasing, use salting to help distribute writes across the cluster and improve parallelization. Example:"}),`
`,e.jsx(n.p,{children:e.jsx(n.code,{children:"CREATE TABLE … ( … ) SALT_BUCKETS = N"})}),`
`,e.jsx(n.p,{children:"For optimal performance the number of salt buckets should approximately equal the number of region servers. Do not salt automatically. Use salting only when experiencing hotspotting. The downside of salting is that it imposes a cost on read because when you want to query the data you have to run multiple queries to do a range scan."}),`
`,e.jsx(n.h2,{id:"general-tips",children:"General Tips"}),`
`,e.jsx(n.p,{children:"The following sections provide a few general tips for different access scenarios."}),`
`,e.jsx(n.h3,{id:"is-the-data-random-access",children:"Is the Data Random-Access?"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"As with any random read workloads, SSDs can improve performance because of their faster random seek time."}),`
`]}),`
`,e.jsx(n.h3,{id:"is-the-data-read-heavy-or-write-heavy",children:"Is the data read-heavy or write-heavy?"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["For read-heavy data:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Create global indexes. This will affect write speed depending on the number of columns included in an index because each index writes to its own separate table."}),`
`,e.jsx(n.li,{children:"Use multiple indexes to provide fast access to common queries."}),`
`,e.jsx(n.li,{children:"When specifying machines for HBase, do not skimp on cores; HBase needs them."}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["For write-heavy data:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Pre-split the table. It can be helpful to split the table into predefined regions, or if keys are monotonically increasing, use salting to avoid creating write hotspots on a small number of nodes. Use real data types rather than raw byte data."}),`
`,e.jsxs(n.li,{children:["Create local indexes. Reads from local indexes have a performance penalty, so it's important to do performance testing. See the ",e.jsx(n.a,{href:"/docs/fundamentals/performance-testing",children:"Pherf"})," tool."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"which-columns-will-be-accessed-often",children:"Which columns will be accessed often?"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Choose commonly-queried columns as primary keys. For more information, see “Primary Keys” below.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Create additional indexes to support common query patterns, including heavily accessed fields that are not in the primary key."}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"can-the-data-be-append-only-immutable",children:"Can the data be append-only (immutable)?"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If the data is immutable or append-only, declare the table and its indexes as immutable using the ",e.jsx(n.code,{children:"IMMUTABLE_ROWS"})," ",e.jsx(n.a,{href:"/docs/grammar#options",children:"option"})," at creation time to reduce the write-time cost. If you need to make an existing table immutable, you can do so with ",e.jsx(n.code,{children:"ALTER TABLE trans.event SET IMMUTABLE_ROWS=true"})," after creation time.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If speed is more important than data integrity, you can use the ",e.jsx(n.code,{children:"DISABLE_WAL"})," ",e.jsx(n.a,{href:"/docs/grammar#options",children:"option"}),". Note: it is possible to lose data with ",e.jsx(n.code,{children:"DISABLE_WAL"})," if a region server fails."]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Set the ",e.jsx(n.code,{children:"UPDATE_CACHE_FREQUENCY"})," ",e.jsx(n.a,{href:"/docs/grammar#options",children:"option"})," to 15 minutes or so if your metadata doesn't change very often. This property determines how often an RPC is done to ensure you're seeing the latest schema."]}),`
`,e.jsxs(n.li,{children:["If the data is not sparse (over 50% of the cells have values), use the SINGLE_CELL_ARRAY_WITH_OFFSETS data encoding scheme introduced in Phoenix 4.10, which obtains faster performance by reducing the size of the data. For more information, see “",e.jsx(n.a,{href:"https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data",children:"Column Mapping and Immutable Data Encoding"}),"” on the Apache Phoenix blog."]}),`
`]}),`
`,e.jsx(n.h3,{id:"is-the-table-very-large",children:"Is the table very large?"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Use the ",e.jsx(n.code,{children:"ASYNC"})," keyword with your ",e.jsx(n.code,{children:"CREATE INDEX"})," call to create the index asynchronously via MapReduce job. You'll need to manually start the job; see ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#index-population",children:"Index Population"})," for details."]}),`
`,e.jsxs(n.li,{children:["If the data is too large to scan the table completely, use primary keys to create an underlying composite row key that makes it easy to return a subset of the data or facilitates ",e.jsx(n.a,{href:"/docs/features/skip-scan",children:"skip-scanning"})," — Phoenix can jump directly to matching keys when the query includes key sets in the predicate."]}),`
`]}),`
`,e.jsx(n.h3,{id:"is-transactionality-required",children:"Is transactionality required?"}),`
`,e.jsx(n.p,{children:"A transaction is a data operation that is atomic — that is, guaranteed to succeed completely or not at all. For example, if you need to make cross-row updates to a data table, then you should consider your data transactional."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If you need transactionality, use the ",e.jsx(n.code,{children:"TRANSACTIONAL"})," ",e.jsx(n.a,{href:"/docs/grammar#options",children:"option"}),". (See also ",e.jsx(n.a,{href:"/docs/features/transactions",children:"Transactions"}),")"]}),`
`]}),`
`,e.jsx(n.h3,{id:"block-encoding",children:"Block Encoding"}),`
`,e.jsx(n.p,{children:"Using compression or encoding is a must. Both SNAPPY and FAST_DIFF are good all around options."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"FAST_DIFF"})," encoding is automatically enabled on all Phoenix tables by default, and almost always improves overall read latencies and throughput by allowing more data to fit into blockcache. Note: ",e.jsx(n.code,{children:"FAST_DIFF"})," encoding can increase garbage produced during request processing."]}),`
`,e.jsxs(n.p,{children:[`Set encoding at table creation time. Example:
`,e.jsx(n.code,{children:" CREATE TABLE … ( … ) DATA_BLOCK_ENCODING=‘FAST_DIFF’"})]}),`
`,e.jsx(n.h2,{id:"schema-design",children:"Schema Design"}),`
`,e.jsx(n.p,{children:"Because the schema affects the way the data is written to the underlying HBase layer, Phoenix performance relies on the design of your tables, indexes, and primary keys."}),`
`,e.jsx(n.h2,{id:"phoenix-and-the-hbase-data-model",children:"Phoenix and the HBase data model"}),`
`,e.jsx(n.p,{children:`HBase stores data in tables, which in turn contain columns grouped in column families. A row in an HBase table consists of versioned cells associated with one or more columns. An HBase row is a collection of many key-value pairs in which the rowkey attribute of the keys are equal. Data in an HBase table is sorted by the rowkey, and all access is via the rowkey.
Phoenix creates a relational data model on top of HBase, enforcing a PRIMARY KEY constraint whose columns are concatenated to form the row key for the underlying HBase table. For this reason, it's important to be cognizant of the size and number of the columns you include in the PK constraint, because a copy of the row key is included with every cell in the underlying HBase table.`}),`
`,e.jsx(n.h2,{id:"column-families",children:"Column Families"}),`
`,e.jsxs(n.p,{children:["If some columns are accessed more frequently than others, ",e.jsx(n.a,{href:"/docs/faq#are-there-any-tips-for-optimizing-phoenix",children:"create multiple column families"})," to separate the frequently-accessed columns from rarely-accessed columns. This improves performance because HBase reads only the column families specified in the query."]}),`
`,e.jsx(n.h2,{id:"columns",children:"Columns"}),`
`,e.jsx(n.p,{children:"Here are a few tips that apply to columns in general, whether they are indexed or not:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Keep ",e.jsx(n.code,{children:"VARCHAR"})," columns under 1MB or so due to I/O costs. When processing queries, HBase materializes cells in full before sending them over to the client, and the client receives them in full before handing them off to the application code."]}),`
`,e.jsx(n.li,{children:"For structured objects, don't use JSON, which is not very compact. Use a format such as protobuf, Avro, msgpack, or BSON."}),`
`,e.jsx(n.li,{children:"Consider compressing data before storage using a fast LZ variant to cut latency and I/O costs."}),`
`,e.jsxs(n.li,{children:["Use the column mapping feature (added in Phoenix 4.10), which uses numerical HBase column qualifiers for non-PK columns instead of directly using column names. This improves performance when looking for a cell in the sorted list of cells returned by HBase, adds further across-the-board performance by reducing the disk size used by tables, and speeds up DDL operations like column rename and metadata-level column drops. For more information, see “",e.jsx(n.a,{href:"https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data",children:"Column Mapping and Immutable Data Encoding"}),"” on the Apache Phoenix blog."]}),`
`]}),`
`,e.jsx(n.h2,{id:"indexes",children:"Indexes"}),`
`,e.jsx(n.p,{children:"A Phoenix index is a physical table that stores a pivoted copy of some or all of the data in the main table to serve specific query patterns. When you issue a query, Phoenix automatically selects the best index. The primary index is created automatically based on selected primary keys. You can create secondary indexes by specifying included columns based on expected query patterns."}),`
`,e.jsxs(n.p,{children:[`See also:
`,e.jsx(n.a,{href:"/docs/features/secondary-indexes",children:"Secondary Indexing"})]}),`
`,e.jsx(n.h2,{id:"tuning-guide-secondary-indexes",children:"Secondary indexes"}),`
`,e.jsxs(n.p,{children:["Secondary indexes can improve read performance by turning what would normally be a full table scan into a point lookup (at the cost of storage space and write speed). Secondary indexes can be added or removed after table creation and don't require changes to existing queries – queries simply run faster. A small number of secondary indexes is often sufficient. Depending on your needs, consider creating ",e.jsx(n.em,{children:e.jsx(n.a,{href:"/docs/features/secondary-indexes#covered-indexes",children:"covered"})})," indexes or ",e.jsx(n.em,{children:e.jsx(n.a,{href:"/docs/features/secondary-indexes#functional-indexes",children:"functional"})})," indexes, or both."]}),`
`,e.jsxs(n.p,{children:["If your table is large, use ",e.jsx(n.code,{children:"ASYNC"})," with ",e.jsx(n.code,{children:"CREATE INDEX"})," to create indexes asynchronously. In this case, index build runs through MapReduce, so client restarts will not impact index creation and jobs can be retried automatically if needed. You still need to start the job manually, and then monitor it like any other MapReduce job."]}),`
`,e.jsx(n.p,{children:"Example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IF"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" EXISTS"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" event_object_id_idx_b"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" trans"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"event"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (object_id)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ASYNC UPDATE_CACHE_FREQUENCY "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 60000"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#index-population",children:"Index Population"})," for details."]}),`
`,e.jsxs(n.p,{children:["If you cannot create the index asynchronously, increase query timeout (",e.jsx(n.code,{children:"phoenix.query.timeoutMs"}),") to exceed expected index build time. If ",e.jsx(n.code,{children:"CREATE INDEX"})," times out or the client goes down before completion, the build stops and must be run again. You can monitor the index table during creation: new regions appear as splits occur. You can query ",e.jsx(n.code,{children:"SYSTEM.STATS"})," (populated by splits/compactions), or run ",e.jsx(n.code,{children:"COUNT(*)"})," against the index table (higher load because it requires a full scan)."]}),`
`,e.jsx(n.p,{children:"Tips:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Create ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#local-indexes",children:"local"})," indexes for write-heavy use cases."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Create global indexes for read-heavy use cases. To save read-time overhead, consider creating ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#covered-indexes",children:"covered"})," indexes."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"If the primary key is monotonically increasing, create salt buckets. The salt buckets can't be changed later, so design them to handle future growth. Salt buckets help avoid write hotspots, but can decrease overall throughput due to the additional scans needed on read."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Set up a cron job to build indexes. Use ",e.jsx(n.code,{children:"ASYNC"})," with ",e.jsx(n.code,{children:"CREATE INDEX"})," to avoid blocking."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Only create the indexes you need."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Limit the number of indexes on frequently updated tables."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Use covered indexes to convert table scans into efficient point lookups or range queries over the index table instead of the primary table:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idx"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" table_name ( ... ) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ( ... );"})]})})})}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"queries",children:"Queries"}),`
`,e.jsx(n.p,{children:"It's important to know which queries execute on the server side versus client side, because this affects performance due to network I/O and other bottlenecks. If you're querying a billion-row table, you want as much computation as possible on the server side instead of transmitting rows to the client. Some queries must still execute on the client. Sorting data that resides on multiple region servers, for example, requires aggregation and re-sort on the client."}),`
`,e.jsx(n.h2,{id:"reading",children:"Reading"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Avoid joins unless one side is small, especially on frequent queries. For larger joins, see “Hints,” below."}),`
`,e.jsxs(n.li,{children:["In the ",e.jsx(n.code,{children:"WHERE"})," clause, filter leading columns in the primary key constraint."]}),`
`,e.jsxs(n.li,{children:["Filtering the first leading column with ",e.jsx(n.code,{children:"IN"})," or ",e.jsx(n.code,{children:"OR"})," in the ",e.jsx(n.code,{children:"WHERE"})," clause enables skip scan optimizations."]}),`
`,e.jsxs(n.li,{children:["Equality or comparisons (",e.jsx(n.code,{children:"<"})," or ",e.jsx(n.code,{children:">"}),") in the ",e.jsx(n.code,{children:"WHERE"})," clause enable range-scan optimizations."]}),`
`,e.jsx(n.li,{children:"Let Phoenix optimize query parallelism using statistics. This provides an automatic benefit if using Phoenix 4.2 or greater in production."}),`
`]}),`
`,e.jsxs(n.p,{children:["See also: ",e.jsx(n.a,{href:"/docs/joins",children:"Joins"})]}),`
`,e.jsx(n.h3,{id:"range-queries",children:"Range Queries"}),`
`,e.jsx(n.p,{children:"If you regularly scan large data sets from spinning disk, you're best off with GZIP (but watch write speed). Use a lot of cores for a scan to utilize the available memory bandwidth. Apache Phoenix makes it easy to utilize many cores to increase scan performance."}),`
`,e.jsx(n.p,{children:"For range queries, the HBase block cache does not provide much advantage."}),`
`,e.jsx(n.h3,{id:"large-range-queries",children:"Large Range Queries"}),`
`,e.jsxs(n.p,{children:["For large range queries, consider setting ",e.jsx(n.code,{children:"Scan.setCacheBlocks(false)"})," even if the whole scan could fit into the block cache."]}),`
`,e.jsx(n.p,{children:"If you mostly perform large range queries you might even want to consider running HBase with a much smaller heap and size the block cache down, to only rely on the OS Cache. This will alleviate some garbage collection related issues."}),`
`,e.jsx(n.h3,{id:"point-lookups",children:"Point Lookups"}),`
`,e.jsx(n.p,{children:"For point lookups it is quite important to have your data set cached, and you should use the HBase block cache."}),`
`,e.jsx(n.h3,{id:"hints",children:"Hints"}),`
`,e.jsx(n.p,{children:"Hints let you override default query processing behavior and specify such factors as which index to use, what type of scan to perform, and what type of join to use."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"During the query, Hint global index if you want to force it when query includes a column not in the index."}),`
`,e.jsxs(n.li,{children:["If necessary, you can do bigger joins with the ",e.jsx(n.code,{children:"/*+ USE_SORT_MERGE_JOIN */"})," hint, but a big join will be an expensive operation over huge numbers of rows."]}),`
`,e.jsxs(n.li,{children:["If the overall size of all right-hand-side tables would exceed the memory size limit, use the ",e.jsx(n.code,{children:"/*+ NO_STAR_JOIN */ "}),"hint."]}),`
`]}),`
`,e.jsxs(n.p,{children:["See also: ",e.jsx(n.a,{href:"/docs/grammar#hint",children:"Hint"}),"."]}),`
`,e.jsx(n.h3,{id:"explain-plans",children:"Explain plans"}),`
`,e.jsxs(n.p,{children:["An ",e.jsx(n.code,{children:"EXPLAIN"})," plan tells you a lot about how a query will be run. To generate an explain plan run ",e.jsx(n.a,{href:"/docs/grammar#explain",children:"this"})," query and to interpret the plan, see ",e.jsx(n.a,{href:"/docs/explain-plan",children:"this"})," reference."]}),`
`,e.jsx(n.h3,{id:"tuning-guide-parallelization",children:"Parallelization"}),`
`,e.jsxs(n.p,{children:["You can improve parallelization with the ",e.jsx(n.a,{href:"/docs/features/statistics-collection",children:"UPDATE STATISTICS"})," command. This command subdivides each region by determining keys called ",e.jsx(n.em,{children:"guideposts"}),` that are equidistant from each other, then uses these guideposts to break up queries into multiple parallel scans.
Statistics are turned on by default. With Phoenix 4.9, the user can set guidepost width for each table. Optimal guidepost width depends on a number of factors such as cluster size, cluster usage, number of cores per node, table size, and disk I/O.`]}),`
`,e.jsxs(n.p,{children:["In Phoenix 4.12, configuration ",e.jsx(n.code,{children:"phoenix.use.stats.parallelization"})," was added to control whether statistics are used to drive parallelization. Stats collection can still run regardless. Collected information is also used to estimate bytes and rows scanned when generating ",e.jsx(n.code,{children:"EXPLAIN"}),"."]}),`
`,e.jsx(n.h2,{id:"writing",children:"Writing"}),`
`,e.jsx(n.h3,{id:"updating-data-with-upsert-values",children:"Updating data with UPSERT VALUES"}),`
`,e.jsxs(n.p,{children:["When using ",e.jsx(n.code,{children:"UPSERT VALUES"})," to write a large number of records, turn off autocommit and batch records in reasonably small batches (try 100 rows and adjust from there to fine-tune performance)."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Note:"})," With the default fat driver, ",e.jsx(n.code,{children:"executeBatch()"})," does not provide benefit. Instead, update multiple rows by executing ",e.jsx(n.code,{children:"UPSERT VALUES"})," multiple times and then use ",e.jsx(n.code,{children:"commit()"})," to submit the batch. With the thin driver, however, use ",e.jsx(n.code,{children:"executeBatch()"})," to minimize RPCs between the client and query server."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Connection conn "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(url)) {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  conn."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setAutoCommit"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  int"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" batchSize "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  int"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" commitSize "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1000"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// number of rows you want to commit per batch."})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  try"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (PreparedStatement stmt "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(upsert)) {"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // set params..."})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* there are records to upsert */"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      stmt."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      batchSize"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"++"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (batchSize "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"%"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" commitSize "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        conn."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"commit"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      }"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"commit"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(); "}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// commit the last batch of records"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})})]})})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Note:"})," Because the Phoenix client keeps uncommitted rows in memory, be careful not to set ",e.jsx(n.code,{children:"commitSize"})," too high."]}),`
`,e.jsx(n.h3,{id:"updating-data-with-upsert-select",children:"Updating data with UPSERT SELECT"}),`
`,e.jsxs(n.p,{children:["When using ",e.jsx(n.code,{children:"UPSERT SELECT"})," to write many rows in a single statement, turn on autocommit and the rows will be automatically batched according to the ",e.jsx(n.code,{children:"phoenix.mutate.batchSize"}),". This will minimize the amount of data returned back to the client and is the most efficient means of updating many rows."]}),`
`,e.jsx(n.h3,{id:"deleting-data",children:"Deleting data"}),`
`,e.jsxs(n.p,{children:["When deleting a large data set, turn on autoCommit before issuing the ",e.jsx(n.code,{children:"DELETE"})," query so that the client does not need to remember the row keys of all the keys as they are deleted. This prevents the client from buffering the rows affected by the ",e.jsx(n.code,{children:"DELETE"})," so that Phoenix can delete them directly on the region servers without the expense of returning them to the client."]}),`
`,e.jsx(n.h3,{id:"reducing-rpc-traffic",children:"Reducing RPC traffic"}),`
`,e.jsxs(n.p,{children:["To reduce RPC traffic, set ",e.jsx(n.code,{children:"UPDATE_CACHE_FREQUENCY"})," (4.7 or above) on your tables and indexes when creating them (or via ",e.jsx(n.code,{children:"ALTER TABLE"}),"/",e.jsx(n.code,{children:"ALTER INDEX"}),"). See ",e.jsx(n.a,{href:"/docs#altering",children:"Altering"}),"."]}),`
`,e.jsx(n.h3,{id:"using-local-indexes",children:"Using local indexes"}),`
`,e.jsx(n.p,{children:"If using 4.8, consider using local indexes to minimize the write time. In this case, the writes for the secondary index will be to the same region server as your base table. This approach does involve a performance hit on the read side, though, so make sure to quantify both write speed improvement and read speed reduction."}),`
`,e.jsx(n.h2,{id:"further-tuning",children:"Further tuning"}),`
`,e.jsxs(n.p,{children:["For advice about tuning the underlying HBase and JVM layers, see ",e.jsx(n.a,{href:"https://hbase.apache.org/docs/regionserver-sizing#operational-and-performance-configuration-options",children:"Operational and Performance Configuration Options"})," in the Apache HBase™ Reference Guide."]}),`
`,e.jsx(n.h2,{id:"special-cases",children:"Special Cases"}),`
`,e.jsx(n.p,{children:"The following sections provide Phoenix-specific additions to the tuning recommendations in the Apache HBase™ Reference Guide section referenced above."}),`
`,e.jsx(n.h3,{id:"for-applications-where-failing-quickly-is-better-than-waiting",children:"For applications where failing quickly is better than waiting"}),`
`,e.jsxs(n.p,{children:["In addition to the HBase tuning referenced above, set ",e.jsx(n.code,{children:"phoenix.query.timeoutMs"})," in ",e.jsx(n.code,{children:"hbase-site.xml"})," on the client side to the maximum tolerable wait time in milliseconds."]}),`
`,e.jsx(n.h3,{id:"for-applications-that-can-tolerate-slightly-out-of-date-information",children:"For applications that can tolerate slightly out of date information"}),`
`,e.jsxs(n.p,{children:["In addition to the HBase tuning referenced above, set ",e.jsx(n.code,{children:"phoenix.connection.consistency = timeline"})," in ",e.jsx(n.code,{children:"hbase-site.xml"})," on the client side for all connections."]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{s as _markdown,c as default,r as extractedReferences,o as frontmatter,l as structuredData,d as toc};
