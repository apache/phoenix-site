# New Features

As items are implemented from our road map, they are moved here to track the progress we've made:

1. **[Table Sampling](tablesample.html)**. Support the <code>TABLESAMPLE</code> clause by implementing a filter that uses the guideposts established by stats gathering to only return a percentage of the rows. **Available in our 4.12 release**
1. **[Reduce on disk storage](https://phoenix.apache.org/columnencoding.html)**. Reduce on disk storage to improve performance by a) packing all values into a single cell per column family and b) provide an indirection between the column name and the column qualifier. **Available in our 4.10 release**
1. **[Atomic update](https://phoenix.apache.org/atomic_upsert.html)**. Atomic update is now possible in the UPSERT VALUES statement in support of counters and other use cases. **Available in our 4.9 release**
6. **[DEFAULT declaration](https://phoenix.apache.org/language/index.html#column_def)**. When defining a column it is now possible to provide a DEFAULT declaration for the initial value. **Available in our 4.9 release**
1. **[Namespace Mapping](https://issues.apache.org/jira/browse/PHOENIX-1311)**. Maps Phoenix schema to HBase namespace to improve isolation between different schemas. **Available in our 4.8  release**
1. **[Hive Integration](https://issues.apache.org/jira/browse/PHOENIX-2743)**. Enables Hive to be used with Phoenix in support of joining huge tables to other huge tables. **Available in our 4.8  release**
1. **[Local Index Improvements](https://issues.apache.org/jira/browse/PHOENIX-1734)**. Reworked local index implementation to guarantee colocation of table and index data and use supported HBase APIs for better maintainability. **Available in our 4.8  release**
1. **[DISTINCT Query Optimization](https://issues.apache.org/jira/browse/PHOENIX-258)**. Push seek logic to server for SELECT DISTINCT and COUNT DISTINCT queries over the leading parts of the primary key leading to dramically better performance. **Available in our 4.8  release**
1. **[Transaction Support](transactions.html)**. Supports transactions by integrating with [Tephra](https://github.com/continuuity/tephra). **Available in our 4.7  release**
1. **[Time series Optimization](rowtimestamp.html)**. Optimizes queries against time series data as explained in more detail [here](https://blogs.apache.org/phoenix/entry/new_optimization_for_time_series). **Available in our 4.6  release**
1. **[Asynchronous Index Population](secondary_indexing.html#Asynchronous_Index_Population)**. Enables an index to be created asynchronously using a map reduce job. **Available in our 4.5 release**
2. **[User Defined Functions](udf.html)**. Allows users to create and deploy their own custom or domain-specific user-defined functions to the cluster. **Available in our 4.4 release**
1. **[Functional Indexes](secondary_indexing.html#Functional_Indexes)**. Enables an index to be defined as expressions as opposed to just column names and have the index be used when a query contains this expression. **Available in our 4.3 release**
2. **[Map-reduce Integration](phoenix_mr.html)**. Support general map-reduce integration to Phoenix by implementing custom input and output formats. **Available in our 3.3/4.3 release**
1. **[Statistics Collection](update_statistics.html)**. Collects the statistics for a table to improve query parallelization. **Available in our 3.2/4.2 release**
2. **[Join Improvements](joins.html)**. Improve existing hash join implementation.
    * **[Many-to-many joins](https://issues.apache.org/jira/browse/PHOENIX-1179)**. Support joins where both sides are too large to fit into memory. **Available in our 3.3/4.3 release**
    * **[Optimize foreign key joins](https://issues.apache.org/jira/browse/PHOENIX-852)**. Optimize foreign key joins by leveraging our skip scan filter. **Available in our 3.2/4.2 release**
    * **[Semi/anti joins](https://issues.apache.org/jira/browse/PHOENIX-167)**. Support semi/anti subqueries through the standard [NOT] IN and [NOT] EXISTS keywords. **Available in our 3.2/4.2 release**
3. **[Subqueries](subqueries.html)** Support independent subqueries and correlated subqueries in the WHERE clause as well as subqueries in the FROM clause. **Available in our 3.2/4.2 release**
1. **[Tracing](tracing.html)**. Allows visibility into the various steps of an <code>UPSERT</code> or <code>SELECT</code> statement along with how long each step took across all the machines in your cluster. **Available in our 4.1 release**
2. **[Local Indexing](secondary_indexing.html#Local_Indexing)**. A new, complementary indexing stragegry for _write heavy_, _space constrained_ use cases. With local indexes, index and table data co-reside on same server so no network overhead occurs during writes. Local indexes can be used even when the query isn’t fully covered (i.e. Phoenix automatically retrieve the columns not in the index through point gets against the data table). **Available in our 4.1 release**
8. **[Derived Tables](https://issues.apache.org/jira/browse/PHOENIX-136)**. Allows a <code>SELECT</code> clause to be used in the FROM clause to define a _derived_ table (including join queries). **Available in our 3.1/4.1 release**
9. **[Apache Pig Loader](pig_integration.html#Pig_Loader)** . Support for a Pig loader to leverage the performance of Phoenix when processing data through Pig. **Available in our 3.1/4.1 release**
2. **[Views](views.html)**. Allows the creation of multiple tables using the same physical HBase table. **Available in our 3.0/4.0 release**
3. **[Multi-tenancy](multi-tenancy.html)**. Allows independent views to be created by different tenants on a per-connection basis that all share the same physical HBase table. **Available in our 3.0/4.0 release**
2. **[Sequences](sequences.html)**. Support for CREATE/DROP SEQUENCE, NEXT VALUE FOR, and CURRENT VALUE FOR has been implemented. **Available in our 3.0/4.0 release**
4. **[ARRAY Type](array_type.html)**. Support for the standard JDBC ARRAY type. **Available in our 3.0/4.0 release**
1. **[Secondary Indexes](secondary_indexing.html)**. Allows users to create indexes over mutable or immutable data.
2. **[Paged Queries](paged.html)**. Paged queries through row value constructors, a standard SQL construct to efficiently locate the row at or after a composite key value. Enables a query-more capability to efficiently step through your data and optimizes IN list of composite key values to be point gets.
3. **[CSV Bulk Loader](bulk_dataload.html)**. Bulk load CSV files into HBase either through map-reduce or a client-side script.
2. **Aggregation Enhancements**. <code>COUNT DISTINCT</code>, <code>PERCENTILE</code>, and <code>STDDEV</code> are now supported.
4. **Type Additions**. The <code>FLOAT</code>, <code>DOUBLE</code>, <code>TINYINT</code>, and <code>SMALLINT</code> are now supported.
2. **IN/OR/LIKE Optimizations**. When an IN (or the equivalent OR) and a LIKE appears in a query using the leading row key columns, compile it into a skip scanning filter to more efficiently retrieve the query results.
3. **Support ASC/DESC declaration of primary key columns**. Allow a primary key column to be declared as ascending (the default) or descending such that the row key order can match the desired sort order (thus preventing an extra sort).
3. **Salting Row Key**. To prevent hot spotting on writes, the row key may be *"salted"* by inserting a leading byte into the row key which is a mod over N buckets of the hash of the entire row key. This ensures even distribution of writes when the row key is a monotonically increasing value (often a timestamp representing the current time).
4. **TopN Queries**. Support a query that returns the top N rows, through support for ORDER BY when used in conjunction with TopN.
6. **Dynamic Columns**. For some use cases, it's difficult to model a schema up front. You may have columns that you'd like to specify only at query time. This is possible in HBase, in that every row (and column family) contains a map of values with keys that can be specified at run time. So, we'd like to support that.
7. **Apache Bigtop Inclusion**. See [BIGTOP-993](http://issues.apache.org/jira/browse/BIGTOP-993) for more information.

