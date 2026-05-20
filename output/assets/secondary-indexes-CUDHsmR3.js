import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`Secondary indexes are an orthogonal way to access data from its primary access path. In HBase, you have a single
index that is lexicographically sorted on the primary row key. Access to records in any way other than through
the primary row requires scanning over potentially all the rows in the table to test them against your filter.
With secondary indexing, the columns or expressions you index form an alternate row key to allow point lookups
and range scans along this new axis.

## Covered Indexes

Phoenix is particularly powerful in that we provide *covered* indexes -
we do not need to go back to the primary table once we have found the index entry. Instead, we bundle the data
we care about right in the index rows, saving read-time overhead.

For example, the following would create an index on the \`v1\` and \`v2\` columns and
include the \`v3\` column in the index as well to prevent having to get it from the data table:

\`\`\`sql
CREATE INDEX my_index ON my_table (v1,v2) INCLUDE (v3)
\`\`\`

## Functional Indexes

Functional indexes (available in 4.3 and above) allow you to create
an index not just on columns, but on an arbitrary expressions. Then when a query uses that expression, the index
may be used to retrieve the results instead of the data table. For example, you could create an index on \`UPPER(FIRST_NAME||' '||LAST_NAME)\`
to allow you to do case insensitive searches on the combined first name and last name of a person.

For example, the following would create this functional index:

\`\`\`sql
CREATE INDEX UPPER_NAME_IDX ON EMP (UPPER(FIRST_NAME||' '||LAST_NAME))
\`\`\`

With this index in place, when the following query is issued, the index would be used instead of the data table to retrieve the results:

\`\`\`sql
SELECT EMP_ID FROM EMP WHERE UPPER(FIRST_NAME||' '||LAST_NAME)='JOHN DOE'
\`\`\`

Phoenix supports two types of indexing techniques: global and local indexing.
Each are useful in different scenarios and have their own failure profiles and performance characteristics.

## Global Indexes

Global indexing targets *read heavy* uses cases. With global indexes, all the performance penalties for indexes occur at write time. We intercept the data table updates on write ([DELETE](/docs/grammar#delete), [UPSERT VALUES](/docs/grammar#upsert-values) and [UPSERT SELECT](/docs/grammar#upsert-select)), build the index update and then sent any necessary updates to all interested index tables. At read time, Phoenix will select the index table to use that will produce the fastest query time and directly scan it just like any other HBase table. An index will not be used for a query that references a column that isn't part of the index.

For write-heavy workloads where synchronous index maintenance is the bottleneck and a bounded staleness window on the index is acceptable, a global index can be created with \`CONSISTENCY=EVENTUAL\` to move its maintenance off the data-table write path. See [Eventually Consistent Global Indexes](/docs/features/eventually-consistent-indexes).

## Local Indexes

Local indexing targets *write heavy*, *space constrained* use cases. Just like with global indexes, Phoenix will automatically select whether or not to use a local index at query-time. With local indexes, index data and table data co-reside on same server preventing any network overhead during writes. Local indexes can be used even when the query isn't fully covered (i.e. Phoenix automatically retrieve the columns not in the index through point gets against the data table). Unlike global indexes, all local indexes of a table are stored in a single, separate shared table prior to 4.8.0 version. From 4.8.0 onwards we are storing all local index data in the separate shadow column families in the same data table. At read time when the local index is used, every region must be examined for the data as the exact region location of index data cannot be predetermined. Thus some overhead occurs at read-time.

## Uncovered Indexes

A global index is "covered" for a query when every column the query references is in
the index — either in the index key or in \`INCLUDE\`. Historically a global index that
wasn't covered for a query simply wasn't used: Phoenix would fall back to a full
data-table scan. **Uncovered indexes** lift that restriction — Phoenix can use a
global index even when the query needs columns that aren't in it, by joining back
to the data table on the server side to fetch the missing columns
([PHOENIX-6458](https://issues.apache.org/jira/browse/PHOENIX-6458)).

Local indexes already worked this way (see [Local Indexes](#local-indexes) above);
the new capability is for **global** indexes.

### When to choose an uncovered index

Both an \`INCLUDE\` covered index and an uncovered index let the same query use the
index. They trade off different costs:

| Approach                       | Index size                 | Read path                                 | Best when                                                               |
| ------------------------------ | -------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| \`CREATE INDEX ... INCLUDE (c)\` | Larger — \`c\` is duplicated | Index-only scan                           | Column \`c\` is small, frequently read with the index, and updated rarely |
| \`CREATE UNCOVERED INDEX\`       | Smaller — only the key     | Index seek + server-side join to data row | Column is large, rarely read with this access path, or updated often    |

A common pattern is to **leave wide payload columns out of the index** entirely and
let Phoenix fetch them via the join-back when needed. This keeps the index compact
and write-cheap, at the cost of a per-matching-row data-table read on the rare query
that wants the payload.

### Creating and using an uncovered index

Declare an uncovered global index with the \`UNCOVERED\` keyword in the DDL.
\`UNCOVERED\` is global-only (cannot be combined with \`LOCAL\`) and cannot be combined
with \`INCLUDE\` — the whole point is to skip duplicating columns:

\`\`\`sql
CREATE UNCOVERED INDEX idx_user_email ON users(email);

-- 'name' and 'created_at' are NOT in the index, but Phoenix can still use it
-- by seeking on email and joining back to the data table for the other columns.
SELECT name, email, created_at
FROM users
WHERE email = 'jane@example.com';
\`\`\`

The planner picks an uncovered index automatically when it's the best plan; no
hint is required. If you want to force it (e.g. to compare plans), use the
standard index hint:

\`\`\`sql
SELECT /*+ INDEX(users idx_user_email) */ name, email, created_at
FROM users
WHERE email = 'jane@example.com';
\`\`\`

## Partial Indexes

A **partial index** indexes only the rows of the data table that satisfy a SQL
boolean predicate, supplied at \`CREATE INDEX\` time via a \`WHERE\` clause. The
index is smaller, writes that don't affect the predicate are cheaper, and the
planner only uses it for queries whose own predicate implies the index's. Added
in [PHOENIX-7032](https://issues.apache.org/jira/browse/PHOENIX-7032).

### When to choose a partial index

Reach for a partial index when the workload reads a small, well-defined slice of
a much larger table — and that slice is identifiable by a SQL predicate. Common
shapes:

* *Open / active records*: \`WHERE status IN ('OPEN', 'PENDING')\` on a table that
  also stores closed records.
* *Recent rows*: \`WHERE created_at > DATE '2024-01-01'\`.
* *Hot tier*: \`WHERE priority >= 5\` for paging / alerting workloads.
* *Failure investigation*: \`WHERE result = 'FAIL'\` on a successful-most-of-the-time
  table.

### Creating a partial index

The DDL is a regular \`CREATE INDEX\` with a trailing \`WHERE\` clause. Both
**covered** and **uncovered** global indexes can be partial:

\`\`\`sql
CREATE INDEX idx_open_orders
    ON orders (customer_id, created_at)
    INCLUDE (total_amount)
    WHERE status IN ('OPEN', 'PENDING');

CREATE UNCOVERED INDEX idx_failed_jobs
    ON jobs (created_at)
    WHERE result = 'FAIL';
\`\`\`

The planner uses the index for any query whose \`WHERE\` clause implies the
index's predicate:

\`\`\`sql
-- Uses idx_open_orders (status IN ('OPEN','PENDING') is implied).
SELECT customer_id, total_amount
FROM orders
WHERE status = 'OPEN' AND created_at >= ?;
\`\`\`

### Mutations that cross the predicate

Partial indexes correctly maintain themselves when a mutation moves a row into
or out of the predicate, including under \`ON DUPLICATE KEY UPDATE\`:

* A row that **starts** satisfying the predicate after an update has its index
  row created.
* A row that **stops** satisfying the predicate after an update has its index
  row removed.

This means a partial index stays consistent for a workload like *"close an
order"* even though that operation flips the row out of the index's covered
slice.

### Limitations

* **Local partial indexes are not supported** — only global (covered or
  uncovered) partial indexes work today.
* The \`WHERE\` predicate is fixed at \`CREATE INDEX\` time. To change it, drop and
  recreate the index.

## Index Population

By default, when an index is created, it is populated synchronously during the CREATE INDEX call. This may not be feasible depending on the current size of the data table. As of 4.5, initially population of an index may be done asynchronously by including the \`ASYNC\` keyword in the index creation DDL statement:

\`\`\`sql
CREATE INDEX async_index ON my_schema.my_table (v) ASYNC
\`\`\`

The map reduce job that populates the index table must be kicked off separately through the HBase command line like this:

\`\`\`bash
\${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.IndexTool
  --schema MY_SCHEMA --data-table MY_TABLE --index-table ASYNC_IDX
  --output-path ASYNC_IDX_HFILES
\`\`\`

Only when the map reduce job is complete will the index be activated and start to be used in queries. The job is resilient to the client being exited. The output-path option is used to specify a HDFS directory that is used for writing HFiles to.

You can also start index population for all indexes in \`BUILDING\` ("b") state with the following HBase command line:

\`\`\`bash
\${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.automation.PhoenixMRJobSubmitter
\`\`\`

#### ASYNC Index threshold

As of 4.16 (and 5.1), setting the \`phoenix.index.async.threshold\` property to a positive number will disallow synchronous index creation if the estimated indexed data size exceeds \`phoenix.index.async.threshold\` (in bytes).

## Index Usage

Indexes are automatically used by Phoenix to service a query when it's determined more efficient to do so. However, a global index will not be used unless all of the columns referenced in the query are contained in the index. For example, the following query would not use the index, because \`v2\` is referenced in the query but not included in the index:

\`\`\`sql
SELECT v2 FROM my_table WHERE v1 = 'foo'
\`\`\`

There are two means of getting an index to be used in this case:

1. Create a *covered* index by including \`v2\` in the index:

   \`\`\`sql
   CREATE INDEX my_index ON my_table (v1) INCLUDE (v2)
   \`\`\`

   This will cause the v2 column value to be copied into the index and kept in synch as it changes. This will obviously increase the size of the index.

2. Create a *local* index:

   \`\`\`sql
   CREATE LOCAL INDEX my_index ON my_table (v1)
   \`\`\`

   Unlike global indexes, local indexes *will* use an index even when all columns referenced in the query are not contained in the index. This is done by default for local indexes because we know that the table and index data coreside on the same region server thus ensuring the lookup is local.

## Index Removal

To drop an index, you'd issue the following statement:

\`\`\`sql
DROP INDEX my_index ON my_table
\`\`\`

If an indexed column is dropped in the data table, the index will automatically be dropped. In addition, if a covered column is dropped in the data table, it will be automatically dropped from the index as well.

## Index Properties

Just like with the \`CREATE TABLE\` statement, the \`CREATE INDEX\` statement may pass through properties to apply to the underlying HBase table, including the ability to salt it:

\`\`\`sql
CREATE INDEX my_index ON my_table (v2 DESC, v1) INCLUDE (v3)
SALT_BUCKETS=10, DATA_BLOCK_ENCODING='NONE'
\`\`\`

Note that if the primary table is salted, then the index is automatically salted in the same way for global indexes. In addition, the MAX\\_FILESIZE for the index is adjusted down, relative to the size of the primary versus index table. For more on salting see [here](/docs/features/salted-tables). With local indexes, on the other hand, specifying \`SALT_BUCKETS\` is not allowed.

## Consistency Guarantees

On successful return to the client after a commit, all data is guaranteed to be written to all interested indexes and the
primary table. In other words, index updates are synchronous with the same strong consistency guarantees provided by HBase.

However, since indexes are stored in separate tables than the data table, depending on the properties of the table and the
type of index, the consistency between your table and index varies in the event that a commit fails due to a server-side
crash. This is an important design consideration driven by your requirements and use case.

Outlined below are the different options with various levels of consistency guarantees.

### Local Indexes

Since Phoenix 4.8 local indexes are always guaranteed to be consistent.

### Global Indexes on Transactional Tables

By declaring your table as [transactional](/docs/features/transactions), you achieve the highest level of consistency guarantee
between your table and index. In this case, your commit of your table mutations and related index updates are atomic
with strong [ACID](https://en.wikipedia.org/wiki/ACID) guarantees. If the commit fails, then none of your data (table
or index) is updated, thus ensuring that your table and index are always in sync.

Why not just always declare your tables as transactional? This may be fine, especially if your
table is declared as immutable, since the transactional overhead is very small in this case. However, if your data
is mutable, make sure that the overhead associated with the conflict detection that occurs with transactional tables
and the operational overhead of running the transaction manager is acceptable. Additionally, transactional tables
with secondary indexes potentially lowers your availability of being able to write to your data table, as both the
data table and its secondary index tables must be availalbe as otherwise the write will fail.

### Global Indexes on Immutable Tables

For a table in which the data is only written once and never updated in-place, certain optimizations may be made to reduce the write-time overhead for incremental maintenance.
This is common with time-series data such as log or event data, where once a row is written, it will never be updated.
To take advantage of these optimizations, declare your table as immutable by adding the \`IMMUTABLE_ROWS=true\` property to your DDL statement:

\`\`\`sql
CREATE TABLE my_table (k VARCHAR PRIMARY KEY, v VARCHAR) IMMUTABLE_ROWS=true
\`\`\`

All indexes on a table declared with \`IMMUTABLE_ROWS=true\` are considered immutable (note that by default, tables are considered mutable).
For global immutable indexes, the index is maintained entirely on the client-side with the index table being generated as changes to the data table occur.
Local immutable indexes, on the other hand, are maintained on the server-side.
Note that no safeguards are in-place to enforce that a table declared as immutable doesn't actually mutate data (as that would negate the performance gain achieved).
If that was to occur, the index would no longer be in sync with the table.

If you have an existing table that you'd like to switch from immutable indexing to mutable indexing, use the \`ALTER TABLE\` command as show below:

\`\`\`sql
ALTER TABLE my_table SET IMMUTABLE_ROWS=false
\`\`\`

Global Indexing for Immutable tables has been completely rewritten for version 4.15 (and 5.1)

#### Immutable table indexes for 4.15 (and 5.1) and newer versions

Immutable index updates go through the same three phase writes as mutable index updates do except that deleting or un-verifying existing index rows is not applicable to immutable indexes.
This guarantees that the index tables are always in sync with the data tables.

#### Immutable table indexes for 4.14 (and 5.0) and older versions

Indexes on non transactional, immutable tables have no mechanism in place to automatically deal with a commit failure. Maintaining
consistency between the table and index is left to the client to handle. Because the updates are idempotent, the simplest
solution is for the client to continue retrying the batch of mutations until they succeed.

### Global Indexes on Mutable Tables

Global Indexing for Mutable tables has been completely rewritten for version 4.15 (and 5.1)

#### Mutable table indexes for 4.15 (and 5.1) and newer versions

The new Strongly Consistent Global Indexing feature uses a three-phase indexing algorithm to guarantee that the index tables are always in sync with the data tables.

The implementation uses a shadow column to track the status of index rows:

* **Write:**
  1. Set the status of existing index rows to unverified and write the new index rows with the unverified status
  2. Write the data table rows
  3. Delete the existing index rows and set the status of new rows to verified

* **Read:**
  1. Read the index rows and check their status
  2. The unverified rows are repaired from the data table

* **Delete:**
  1. Set the index table rows with the unverified status
  2. Delete the data table rows
  3. Delete index table rows

See [resources](/docs/features/secondary-indexes#secondary-indexes-resources) for more in-depth information.

All newly created tables use the new indexing algorithm.

Indexes created with older Phoenix versions will continue to use the old implementation, until upgraded with [IndexUpgradeTool](/docs/features/secondary-indexes#index-upgrade-tool)

#### Mutable table indexes for 4.14 (and 5.0) and older versions

For non transactional mutable tables, we maintain index update durability by adding the index updates to the Write-Ahead-Log (WAL) entry of the primary table row.
Only after the WAL entry is successfully synced to disk do we attempt to make the index/primary table updates. We write the
index updates in parallel by default, leading to very high throughput. If the server crashes while we are writing the index
updates, we replay the all the index updates to the index tables in the WAL recovery process and rely on the idempotence of
the updates to ensure correctness. Therefore, indexes on non transactional mutable tables are only ever a single batch of
edits behind the primary table.

It's important to note several points:

* For non transactional tables, you could see the index table out of sync with the primary table.
* As noted above, this is ok as we are only a very small bit behind and out of sync for very short periods
* Each data row and its index row(s) are guaranteed to to be written or lost - we never see partial updates as this is part of the atomicity guarantees of HBase.
* Data is first written to the table followed by the index tables (the reverse is true if the WAL is disabled).

**Singular Write Path**

There is a single write path that guarantees the failure properties. All writes to the HRegion get intercepted by our
coprocessor. We then build the index updates based on the pending update (or updates, in the case of the batch).
These update are then appended to the WAL entry for the original update.

If we get any failure up to this point, we return the failure to the client and no data is persisted or made visible
to the client.

Once the WAL is written, we ensure that the index and primary table data will become visible, even in the case of a failure.

* If the server *does* crash, we then replay the index updates with the usual WAL replay mechanism
* If the server does *not* crash, we just insert the index updates to their respective tables.
  * If the index updates fail, the various means of maintaining consistency are outlined below.
  * If the Phoenix system catalog table cannot be reached when a failure occurs, we force the server to be immediately aborted and failing this, call \`System.exit\` on the JVM, forcing the server to die. By killing the server, we ensure that the WAL will be replayed on recovery, replaying the index updates to their appropriate tables. This ensures that a secondary index is not continued to be used when it's in a know, invalid state.

**Disallow table writes until mutable index is consistent**

The highest level of maintaining consistency between your non transactional table and index is to declare that writes to the
data table should be temporarily disallowed in the event of a failure to update the index. In this consistency
mode, the table and index will be held at the timestamp before the failure occurred, with writes to the data
table being disallowed until the index is back online and in-sync with the data table. The index will
remain active and continue to be used by queries as usual.

The following server-side configurations control this behavior:

* \`phoenix.index.failure.block.write\` must be true to enable a writes to the data table to fail
  in the event of a commit failure until the index can be caught up with the data table.
* \`phoenix.index.failure.handling.rebuild\` must be true (the default) to enable a mutable index to
  be rebuilt in the background in the event of a commit failure.

**Disable mutable indexes on write failure until consistency restored**

The default behavior with mutable indexes is to mark the index as disabled if a write to them fails at commit time,
partially rebuild them in the background, and then mark them as active again once consistency is restored. In this
consistency mode, writes to the data table will not be blocked while the secondary index is being rebuilt. However,
the secondary index will not be used by queries while the rebuild is happening.

The following server-side configurations control this behavior:

* \`phoenix.index.failure.handling.rebuild\` must be true (the default) to enable a mutable index to
  be rebuilt in the background in the event of a commit failure.
* \`phoenix.index.failure.handling.rebuild.interval\` controls the millisecond frequency at which the server
  checks whether or not a mutable index needs to be partially rebuilt to catch up with updates to the data
  table. The default is 10000 or 10 seconds.
* \`phoenix.index.failure.handling.rebuild.overlap.time\` controls how many milliseconds to go back from the timestamp
  at which the failure occurred to go back when a partial rebuild is performed. The default is 1.

**Disable mutable index on write failure with manual rebuild required**

This is the lowest level of consistency for mutable secondary indexes. In this case, when a write to a secondary
index fails, the index will be marked as disabled with a manual
[rebuild of the index](/docs/grammar#alter-index) required to enable it to be used
once again by queries.

The following server-side configurations control this behavior:

* \`phoenix.index.failure.handling.rebuild\` must be set to false to disable a mutable index from being
  rebuilt in the background in the event of a commit failure.

#### BulkLoad Tool Limitation

The \`BulkLoadTools\` (e.g. \`CSVBulkLoadTool\` and \`JSONBulkLoadTool\`) cannot presently generate correct updates to mutable
secondary indexes when pre-existing records are being updated. In the normal mutable secondary index write path, we can
safely calculate a Delete (for the old record) and a Put (for the new record) for each secondary index while holding a
row-lock to prevent concurrent updates. In the context of a MapReduce job, we cannot effectively execute this same logic
because we are specifically doing this "out of band" from the HBase RegionServers. As such, while these Tools generate
HFiles for the index tables with the proper updates for the data being loaded, any previous index records corresponding
to the same record in the table are not deleted. This net-effect of this limitation is: if you use these Tools to re-ingest
the same records to an index table, that index table will have duplicate records in it which will result in incorrect
query results from that index table.

To perform incremental loads of data using the \`BulkLoadTools\` which may update existing records, you must
drop and re-create all index tables after the data table is loaded. Re-creating the index with the \`ASYNC\` option and
using \`IndexTool\` to populate and enable that index is likely a must for tables of non-trivial size.

To perform incremental loading of CSV datasets that do not require any manual index intervention, the \`psql\` tool can
be used in place of the BulkLoadTools. Additionally, a MapReduce job could be written to parse CSV/JSON data and write
it directly to Phoenix; although, such a tool is not currently provided by Phoenix for users.

## Setup

Non transactional, mutable indexing requires special configuration options on the region server and master to run - Phoenix ensures that they are setup correctly when you enable mutable indexing on the table; if the correct properties are not set, you will not be able to use secondary indexing. After adding these settings to your hbase-site.xml, you'll need to do a rolling restart of your cluster.

As Phoenix matures, it needs less and less manual configuration. For older Phoenix versions you'll need to add the properties listed for that version, *as well as the properties listed for the later versions*.

#### For Phoenix 4.12 and later

You will need to add the following parameters to \`hbase-site.xml\` on each region server:

\`\`\`xml
<property>
  <name>hbase.regionserver.wal.codec</name>
  <value>org.apache.hadoop.hbase.regionserver.wal.IndexedWALEditCodec</value>
</property>
\`\`\`

The above property enables custom WAL edits to be written, ensuring proper writing/replay of the index updates. This codec supports the usual host of WALEdit options, most notably WALEdit compression.

#### For Phoenix 4.8 - 4.11

The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:

\`\`\`xml
<property>
  <name>hbase.region.server.rpc.scheduler.factory.class</name>
  <value>org.apache.hadoop.hbase.ipc.PhoenixRpcSchedulerFactory</value>
  <description>Factory to create the Phoenix RPC Scheduler that uses separate queues for index and metadata updates</description>
</property>
<property>
  <name>hbase.rpc.controllerfactory.class</name>
  <value>org.apache.hadoop.hbase.ipc.controller.ServerRpcControllerFactory</value>
  <description>Factory to create the Phoenix RPC Scheduler that uses separate queues for index and metadata updates</description>
</property>
\`\`\`

The above properties prevent deadlocks from occurring during index maintenance for global indexes (HBase 0.98.4+ and Phoenix 4.3.1+) by ensuring index updates are processed with a higher priority than data updates. It also prevents deadlocks by ensuring metadata rpc calls are processed with a higher priority than data rpc calls.

#### For Phoenix versions 4.7 and below

The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:

\`\`\`xml
<property>
  <name>hbase.master.loadbalancer.class</name>
  <value>org.apache.phoenix.hbase.index.balancer.IndexLoadBalancer</value>
</property>
<property>
  <name>hbase.coprocessor.master.classes</name>
  <value>org.apache.phoenix.hbase.index.master.IndexMasterObserver</value>
</property>
<property>
  <name>hbase.coprocessor.regionserver.classes</name>
  <value>org.apache.hadoop.hbase.regionserver.LocalIndexMerger</value>
</property>
\`\`\`

The above properties are required to use local indexing.

### Upgrading Local Indexes created before 4.8.0

While upgrading the Phoenix to 4.8.0+ version at server remove above three local indexing related configurations from \`hbase-site.xml\` if present. From client we are supporting both online(while initializing the connection from phoenix client of 4.8.0+ versions) and offline(using \`psql\` tool) upgrade of local indexes created before 4.8.0. As part of upgrade we recreate the local indexes in ASYNC mode. After upgrade user need to build the indexes using [IndexTool](/docs/features/secondary-indexes#index-population)

Following client side configuration used in the upgrade.

* \`phoenix.client.localIndexUpgrade\`\\
  The value of it is true means online upgrade and false means offline upgrade.\\
  **Default: true**

Command to run offline upgrade using \`psql\`:

\`\`\`shell
psql [zookeeper] -l
\`\`\`

## Tuning

Out the box, indexing is pretty fast. However, to optimize for your particular environment and workload, there are several properties you can tune.

All the following parameters must be set in \`hbase-site.xml\` - they are true for the entire cluster and all index tables, as well as across all regions on the same server (so, for instance, a single server would not write to too many different index tables at once).

1. \`index.builder.threads.max\`
   * Number of threads to used to build the index update from the primary table update
   * Increasing this value overcomes the bottleneck of reading the current row state from the underlying HRegion. Tuning this value too high will just bottleneck at the HRegion as it will not be able to handle too many concurrent scan requests as well as general thread-swapping concerns.
   * **Default: 10**
2. \`index.builder.threads.keepalivetime\`
   * Amount of time in seconds after we expire threads in the builder thread pool.
   * Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load.
   * **Default: 60**
3. \`index.writer.threads.max\`
   * Number of threads to use when writing to the target index tables.
   * The first level of parallelization, on a per-table basis - it should roughly correspond to the number of index tables
   * **Default: 10**
4. \`index.writer.threads.keepalivetime\`
   * Amount of time in seconds after we expire threads in the writer thread pool.
   * Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load.
   * **Default: 60**
5. \`hbase.htable.threads.max\`
   * Number of threads each index \`HTable\` can use for writes.
   * Increasing this allows more concurrent index updates (for instance across batches), leading to high overall throughput.
   * **Default: 2,147,483,647**
6. \`hbase.htable.threads.keepalivetime\`
   * Amount of time in seconds after we expire threads in the \`HTable\`'s thread pool.
   * Using the "direct handoff" approach, new threads will only be created if it is necessary and will grow unbounded. This could be bad but \`HTable\`s only create as many \`Runnable\`s as there are region servers; therefore, it also scales when new region servers are added.
   * **Default: 60**
7. \`index.tablefactory.cache.size\`
   * Number of index \`HTable\`s we should keep in cache.
   * Increasing this number ensures that we do not need to recreate an \`HTable\` for each attempt to write to an index table. Conversely, you could see memory pressure if this value is set too high.
   * **Default: 10**
8. \`org.apache.phoenix.regionserver.index.priority.min\`
   * Value to specify to bottom (inclusive) of the range in which index priority may lie.
   * **Default: 1000**
9. \`org.apache.phoenix.regionserver.index.priority.max\`
   * Value to specify to top (exclusive) of the range in which index priority may lie.
   * Higher priorites within the index min/max range do not means updates are processed sooner.
   * **Default: 1050**
10. \`org.apache.phoenix.regionserver.index.handler.count\`
    * Number of threads to use when serving index write requests for global index maintenance.
    * Though the actual number of threads is dictated by the Max(number of call queues, handler count), where the number of call queues is determined by standard HBase configuration. To further tune the queues, you can adjust the standard rpc queue length parameters (currently, there are no special knobs for the index queues), specifically \`ipc.server.max.callqueue.length\` and \`ipc.server.callqueue.handler.factor\`. See the [HBase Reference Guide](https://hbase.apache.org/docs) for more details.
    * **Default: 30**

## Performance

We track secondary index performance via our [performance framework](http://phoenix-bin.github.io/client/performance/latest.htm). This is a generic test of performance based on defaults - your results will vary based on hardware specs as well as you individual configuration.

That said, we have seen secondary indexing (both immutable and mutable) go as quickly as \\< 2x the regular write path on a small, (3 node) desktop-based cluster. This is actually pretty reasonable as we have to write to multiple tables as well as build the index update.

## Index Scrutiny Tool

With Phoenix 4.12, there is now a tool to run a MapReduce job to verify that an index table is valid against its data table. The only way to find orphaned rows in either table is to scan over all rows in the table and do a lookup in the other table for the corresponding row. For that reason, the tool can run with either the data or index table as the "source" table, and the other as the "target" table. The tool writes all invalid rows it finds either to file or to an output table \`PHOENIX_INDEX_SCRUTINY\`. An invalid row is a source row that either has no corresponding row in the target table, or has an incorrect value in the target table (i.e. covered column value).

The tool has job counters that track its status. \`VALID_ROW_COUNT\`, \`INVALID_ROW_COUNT\`, \`BAD_COVERED_COL_VAL_COUNT\`. Note that invalid rows - bad col val rows = number of orphaned rows. These counters are written to the table \`PHOENIX_INDEX_SCRUTINY_METADATA\`, along with other job metadata.

The Index Scrutiny Tool can be launched via the \`hbase\` command (in \`hbase/bin\`) as follows:

\`\`\`shell
hbase org.apache.phoenix.mapreduce.index.IndexScrutinyTool -dt my_table -it my_index -o
\`\`\`

It can also be run from Hadoop using either the phoenix-core or phoenix-server jar as follows:

\`\`\`bash
HADOOP_CLASSPATH=$(hbase mapredcp) hadoop jar phoenix-<version>-server.jar org.apache.phoenix.mapreduce.index.IndexScrutinyTool -dt my_table -it my_index -o
\`\`\`

By default two mapreduce jobs are launched, one with the data table as the source table and one with the index table as the source table.

The following parameters can be used with the Index Scrutiny Tool:

| *Parameter*         | *Description*                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -dt,--data-table    | Data table name (mandatory)                                                                                                                                         |
| -it,--index-table   | Index table name (mandatory)                                                                                                                                        |
| -s,--schema         | Phoenix schema name (optional)                                                                                                                                      |
| -src,--source       | DATA\\_TABLE\\_SOURCE, INDEX\\_TABLE\\_SOURCE, or BOTH. Defaults to BOTH                                                                                                |
| -o,--output         | Whether to output invalid rows. Off by default                                                                                                                      |
| -of,--output-format | TABLE or FILE output format. Defaults to TABLE                                                                                                                      |
| -om,--output-max    | Maximum number of invalid rows to output per mapper. Defaults to 1M                                                                                                 |
| -op,--output-path   | For FILE output format, the HDFS directory where files are written                                                                                                  |
| -t,--time           | Timestamp in millis at which to run the scrutiny. This is important so that incoming writes don't throw off the scrutiny. Defaults to current time minus 60 seconds |
| -b,--batch-size     | Number of rows to compare at a time                                                                                                                                 |

### Limitations

* If rows are actively being updated or deleted while the scrutiny is running, the tool may give you false positives for inconsistencies ([PHOENIX-4277](https://issues.apache.org/jira/browse/PHOENIX-4277)).
* Snapshot reads are not supported by the scrutiny tool ([PHOENIX-4270](https://issues.apache.org/jira/browse/PHOENIX-4270)).

## Index Upgrade Tool

\`IndexUpgradeTool\` updates global indexes created by Phoenix 4.14 and earlier (or 5.0) to use the new Strongly Consistent Global Indexes implementation.

It accepts following parameters:

| *Parameter*              | *Description*                                                                  | *only in version* |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------- |
| -o,--operation           | *upgrade* or *rollback* (mandatory)                                            |                   |
| -tb,--tables             | *\\[table1,table2,table3]* (-tb or -f mandatory)                                |                   |
| -f,--file                | Csv file with above format (-tb or -f mandatory)                               |                   |
| -d,--dry-run             | If passed this will just output steps that will be executed; like a dry run    |                   |
| -h,--help                | Help on how to use the tool                                                    |                   |
| -lf,--logfile            | File location to dump the logs                                                 |                   |
| -sr,--index-sync-rebuild | whether or not synchronously rebuild the indexes; default rebuild asynchronous | 4.15              |
| -rb,--index-rebuild      | Rebuild the indexes. Set -tool to pass options to IndexTool                    | 4.16+, 5.1+       |
| -tool,--index-tool       | Options to pass to indexTool when rebuilding indexes                           | 4.16+, 5.1+       |

\`\`\`shell
\${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.IndexUpgradeTool -o [upgrade/rollback] -tb [table_name] -lf [/tmp/index-upgrade-tool.log]
\`\`\`

For 4.16+/5.1+ either specifying the -rb option, or manually rebuilding the indexes with IndexTool after the upgrade is recommended, otherwise the first access of every index row will trigger an index row repair.

Depending on whether index is mutable, it will remove *Indexer* coprocessor from a data table and load new coprocessor *IndexRegionObserver*. For both immutable and mutable, it will load *GlobalIndexChecker* coprocessor on Index table. During this process, data table and index table are *disabled-loaded/unloaded with coproc-enabled* within short time span. At the end, it does an asynchronous index rebuilds. Index reads are not blocked while index-rebuild is still ongoing, however, they may be a bit slower for rows written prior to upgrade.

\`IndexUpgradeTool\` doesn't make any distinction between view-index and table-index. When a table is passed, it will perform the upgrade-operation on all the 'children' indexes of the given table.

## Resources

There have been several presentations given on how secondary indexing works in Phoenix that have a more in-depth look at how indexing works (with pretty pictures!):

* [Slides for Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit](https://www.slideshare.net/YugabyteDB/strongly-consistent-global-indexes-for-apache-phoenix-176863877)
* [Recording of Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit](https://vimeo.com/362358494)
* [Slides for Local Secondary Indexes in Apache Phoenix, 2017 PhoenixCon](https://www.slideshare.net/rajeshbabuchintaguntla/local-secondary-indexes-in-apache-phoenix)

These older resources refer to obsolete implementations in some cases

* [Los Anglees HBase Meetup](http://www.slideshare.net/jesse_yates/phoenix-secondary-indexing-la-hug-sept-9th-2013) - Sept, 4th, 2013
* [Local Indexes](https://github.com/Huawei-Hadoop/hindex/blob/master/README.md#how-it-works) by Huawei
* [PHOENIX-938](https://issues.apache.org/jira/browse/PHOENIX-938) and [HBASE-11513](https://issues.apache.org/jira/browse/HBASE-11513) for deadlock prevention during global index maintenance.
* [PHOENIX-1112: Atomically rebuild index partially when index update fails](https://issues.apache.org/jira/browse/PHOENIX-1112)
`,r={title:"Secondary Indexes",description:"Concepts, setup, consistency guarantees, and tooling for Phoenix secondary indexes."},o=[{href:"/docs/grammar#delete"},{href:"/docs/grammar#upsert-values"},{href:"/docs/grammar#upsert-select"},{href:"/docs/features/eventually-consistent-indexes"},{href:"https://issues.apache.org/jira/browse/PHOENIX-6458"},{href:"#local-indexes"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7032"},{href:"/docs/features/salted-tables"},{href:"/docs/features/transactions"},{href:"https://en.wikipedia.org/wiki/ACID"},{href:"/docs/features/secondary-indexes#secondary-indexes-resources"},{href:"/docs/features/secondary-indexes#index-upgrade-tool"},{href:"/docs/grammar#alter-index"},{href:"/docs/features/secondary-indexes#index-population"},{href:"https://hbase.apache.org/docs"},{href:"http://phoenix-bin.github.io/client/performance/latest.htm"},{href:"https://issues.apache.org/jira/browse/PHOENIX-4277"},{href:"https://issues.apache.org/jira/browse/PHOENIX-4270"},{href:"https://www.slideshare.net/YugabyteDB/strongly-consistent-global-indexes-for-apache-phoenix-176863877"},{href:"https://vimeo.com/362358494"},{href:"https://www.slideshare.net/rajeshbabuchintaguntla/local-secondary-indexes-in-apache-phoenix"},{href:"http://www.slideshare.net/jesse_yates/phoenix-secondary-indexing-la-hug-sept-9th-2013"},{href:"https://github.com/Huawei-Hadoop/hindex/blob/master/README.md#how-it-works"},{href:"https://issues.apache.org/jira/browse/PHOENIX-938"},{href:"https://issues.apache.org/jira/browse/HBASE-11513"},{href:"https://issues.apache.org/jira/browse/PHOENIX-1112"}],l={contents:[{heading:void 0,content:`Secondary indexes are an orthogonal way to access data from its primary access path. In HBase, you have a single
index that is lexicographically sorted on the primary row key. Access to records in any way other than through
the primary row requires scanning over potentially all the rows in the table to test them against your filter.
With secondary indexing, the columns or expressions you index form an alternate row key to allow point lookups
and range scans along this new axis.`},{heading:"covered-indexes",content:`Phoenix is particularly powerful in that we provide covered indexes -
we do not need to go back to the primary table once we have found the index entry. Instead, we bundle the data
we care about right in the index rows, saving read-time overhead.`},{heading:"covered-indexes",content:`For example, the following would create an index on the v1 and v2 columns and
include the v3 column in the index as well to prevent having to get it from the data table:`},{heading:"functional-indexes",content:`Functional indexes (available in 4.3 and above) allow you to create
an index not just on columns, but on an arbitrary expressions. Then when a query uses that expression, the index
may be used to retrieve the results instead of the data table. For example, you could create an index on UPPER(FIRST_NAME||' '||LAST_NAME)
to allow you to do case insensitive searches on the combined first name and last name of a person.`},{heading:"functional-indexes",content:"For example, the following would create this functional index:"},{heading:"functional-indexes",content:"With this index in place, when the following query is issued, the index would be used instead of the data table to retrieve the results:"},{heading:"functional-indexes",content:`Phoenix supports two types of indexing techniques: global and local indexing.
Each are useful in different scenarios and have their own failure profiles and performance characteristics.`},{heading:"global-indexes",content:"Global indexing targets read heavy uses cases. With global indexes, all the performance penalties for indexes occur at write time. We intercept the data table updates on write (DELETE, UPSERT VALUES and UPSERT SELECT), build the index update and then sent any necessary updates to all interested index tables. At read time, Phoenix will select the index table to use that will produce the fastest query time and directly scan it just like any other HBase table. An index will not be used for a query that references a column that isn't part of the index."},{heading:"global-indexes",content:"For write-heavy workloads where synchronous index maintenance is the bottleneck and a bounded staleness window on the index is acceptable, a global index can be created with CONSISTENCY=EVENTUAL to move its maintenance off the data-table write path. See Eventually Consistent Global Indexes."},{heading:"local-indexes",content:"Local indexing targets write heavy, space constrained use cases. Just like with global indexes, Phoenix will automatically select whether or not to use a local index at query-time. With local indexes, index data and table data co-reside on same server preventing any network overhead during writes. Local indexes can be used even when the query isn't fully covered (i.e. Phoenix automatically retrieve the columns not in the index through point gets against the data table). Unlike global indexes, all local indexes of a table are stored in a single, separate shared table prior to 4.8.0 version. From 4.8.0 onwards we are storing all local index data in the separate shadow column families in the same data table. At read time when the local index is used, every region must be examined for the data as the exact region location of index data cannot be predetermined. Thus some overhead occurs at read-time."},{heading:"uncovered-indexes",content:`A global index is "covered" for a query when every column the query references is in
the index — either in the index key or in INCLUDE. Historically a global index that
wasn't covered for a query simply wasn't used: Phoenix would fall back to a full
data-table scan. Uncovered indexes lift that restriction — Phoenix can use a
global index even when the query needs columns that aren't in it, by joining back
to the data table on the server side to fetch the missing columns
(PHOENIX-6458).`},{heading:"uncovered-indexes",content:`Local indexes already worked this way (see Local Indexes above);
the new capability is for global indexes.`},{heading:"uncovered-indexes-when",content:`Both an INCLUDE covered index and an uncovered index let the same query use the
index. They trade off different costs:`},{heading:"uncovered-indexes-when",content:"Approach"},{heading:"uncovered-indexes-when",content:"Index size"},{heading:"uncovered-indexes-when",content:"Read path"},{heading:"uncovered-indexes-when",content:"Best when"},{heading:"uncovered-indexes-when",content:"CREATE INDEX ... INCLUDE (c)"},{heading:"uncovered-indexes-when",content:"Larger — c is duplicated"},{heading:"uncovered-indexes-when",content:"Index-only scan"},{heading:"uncovered-indexes-when",content:"Column c is small, frequently read with the index, and updated rarely"},{heading:"uncovered-indexes-when",content:"CREATE UNCOVERED INDEX"},{heading:"uncovered-indexes-when",content:"Smaller — only the key"},{heading:"uncovered-indexes-when",content:"Index seek + server-side join to data row"},{heading:"uncovered-indexes-when",content:"Column is large, rarely read with this access path, or updated often"},{heading:"uncovered-indexes-when",content:`A common pattern is to leave wide payload columns out of the index entirely and
let Phoenix fetch them via the join-back when needed. This keeps the index compact
and write-cheap, at the cost of a per-matching-row data-table read on the rare query
that wants the payload.`},{heading:"uncovered-indexes-usage",content:`Declare an uncovered global index with the UNCOVERED keyword in the DDL.
UNCOVERED is global-only (cannot be combined with LOCAL) and cannot be combined
with INCLUDE — the whole point is to skip duplicating columns:`},{heading:"uncovered-indexes-usage",content:`The planner picks an uncovered index automatically when it's the best plan; no
hint is required. If you want to force it (e.g. to compare plans), use the
standard index hint:`},{heading:"partial-indexes",content:`A partial index indexes only the rows of the data table that satisfy a SQL
boolean predicate, supplied at CREATE INDEX time via a WHERE clause. The
index is smaller, writes that don't affect the predicate are cheaper, and the
planner only uses it for queries whose own predicate implies the index's. Added
in PHOENIX-7032.`},{heading:"partial-indexes-when",content:`Reach for a partial index when the workload reads a small, well-defined slice of
a much larger table — and that slice is identifiable by a SQL predicate. Common
shapes:`},{heading:"partial-indexes-when",content:`Open / active records: WHERE status IN ('OPEN', 'PENDING') on a table that
also stores closed records.`},{heading:"partial-indexes-when",content:"Recent rows: WHERE created_at > DATE '2024-01-01'."},{heading:"partial-indexes-when",content:"Hot tier: WHERE priority >= 5 for paging / alerting workloads."},{heading:"partial-indexes-when",content:`Failure investigation: WHERE result = 'FAIL' on a successful-most-of-the-time
table.`},{heading:"partial-indexes-usage",content:`The DDL is a regular CREATE INDEX with a trailing WHERE clause. Both
covered and uncovered global indexes can be partial:`},{heading:"partial-indexes-usage",content:`The planner uses the index for any query whose WHERE clause implies the
index's predicate:`},{heading:"partial-indexes-mutations",content:`Partial indexes correctly maintain themselves when a mutation moves a row into
or out of the predicate, including under ON DUPLICATE KEY UPDATE:`},{heading:"partial-indexes-mutations",content:`A row that starts satisfying the predicate after an update has its index
row created.`},{heading:"partial-indexes-mutations",content:`A row that stops satisfying the predicate after an update has its index
row removed.`},{heading:"partial-indexes-mutations",content:`This means a partial index stays consistent for a workload like "close an
order" even though that operation flips the row out of the index's covered
slice.`},{heading:"partial-indexes-limitations",content:`Local partial indexes are not supported — only global (covered or
uncovered) partial indexes work today.`},{heading:"partial-indexes-limitations",content:`The WHERE predicate is fixed at CREATE INDEX time. To change it, drop and
recreate the index.`},{heading:"index-population",content:"By default, when an index is created, it is populated synchronously during the CREATE INDEX call. This may not be feasible depending on the current size of the data table. As of 4.5, initially population of an index may be done asynchronously by including the ASYNC keyword in the index creation DDL statement:"},{heading:"index-population",content:"The map reduce job that populates the index table must be kicked off separately through the HBase command line like this:"},{heading:"index-population",content:"Only when the map reduce job is complete will the index be activated and start to be used in queries. The job is resilient to the client being exited. The output-path option is used to specify a HDFS directory that is used for writing HFiles to."},{heading:"index-population",content:'You can also start index population for all indexes in BUILDING ("b") state with the following HBase command line:'},{heading:"async-index-threshold",content:"As of 4.16 (and 5.1), setting the phoenix.index.async.threshold property to a positive number will disallow synchronous index creation if the estimated indexed data size exceeds phoenix.index.async.threshold (in bytes)."},{heading:"index-usage",content:"Indexes are automatically used by Phoenix to service a query when it's determined more efficient to do so. However, a global index will not be used unless all of the columns referenced in the query are contained in the index. For example, the following query would not use the index, because v2 is referenced in the query but not included in the index:"},{heading:"index-usage",content:"There are two means of getting an index to be used in this case:"},{heading:"index-usage",content:"Create a covered index by including v2 in the index:"},{heading:"index-usage",content:"This will cause the v2 column value to be copied into the index and kept in synch as it changes. This will obviously increase the size of the index."},{heading:"index-usage",content:"Create a local index:"},{heading:"index-usage",content:"Unlike global indexes, local indexes will use an index even when all columns referenced in the query are not contained in the index. This is done by default for local indexes because we know that the table and index data coreside on the same region server thus ensuring the lookup is local."},{heading:"index-removal",content:"To drop an index, you'd issue the following statement:"},{heading:"index-removal",content:"If an indexed column is dropped in the data table, the index will automatically be dropped. In addition, if a covered column is dropped in the data table, it will be automatically dropped from the index as well."},{heading:"index-properties",content:"Just like with the CREATE TABLE statement, the CREATE INDEX statement may pass through properties to apply to the underlying HBase table, including the ability to salt it:"},{heading:"index-properties",content:"Note that if the primary table is salted, then the index is automatically salted in the same way for global indexes. In addition, the MAX_FILESIZE for the index is adjusted down, relative to the size of the primary versus index table. For more on salting see here. With local indexes, on the other hand, specifying SALT_BUCKETS is not allowed."},{heading:"consistency-guarantees",content:`On successful return to the client after a commit, all data is guaranteed to be written to all interested indexes and the
primary table. In other words, index updates are synchronous with the same strong consistency guarantees provided by HBase.`},{heading:"consistency-guarantees",content:`However, since indexes are stored in separate tables than the data table, depending on the properties of the table and the
type of index, the consistency between your table and index varies in the event that a commit fails due to a server-side
crash. This is an important design consideration driven by your requirements and use case.`},{heading:"consistency-guarantees",content:"Outlined below are the different options with various levels of consistency guarantees."},{heading:"local-indexes-1",content:"Since Phoenix 4.8 local indexes are always guaranteed to be consistent."},{heading:"global-indexes-on-transactional-tables",content:`By declaring your table as transactional, you achieve the highest level of consistency guarantee
between your table and index. In this case, your commit of your table mutations and related index updates are atomic
with strong ACID guarantees. If the commit fails, then none of your data (table
or index) is updated, thus ensuring that your table and index are always in sync.`},{heading:"global-indexes-on-transactional-tables",content:`Why not just always declare your tables as transactional? This may be fine, especially if your
table is declared as immutable, since the transactional overhead is very small in this case. However, if your data
is mutable, make sure that the overhead associated with the conflict detection that occurs with transactional tables
and the operational overhead of running the transaction manager is acceptable. Additionally, transactional tables
with secondary indexes potentially lowers your availability of being able to write to your data table, as both the
data table and its secondary index tables must be availalbe as otherwise the write will fail.`},{heading:"global-indexes-on-immutable-tables",content:`For a table in which the data is only written once and never updated in-place, certain optimizations may be made to reduce the write-time overhead for incremental maintenance.
This is common with time-series data such as log or event data, where once a row is written, it will never be updated.
To take advantage of these optimizations, declare your table as immutable by adding the IMMUTABLE_ROWS=true property to your DDL statement:`},{heading:"global-indexes-on-immutable-tables",content:`All indexes on a table declared with IMMUTABLE_ROWS=true are considered immutable (note that by default, tables are considered mutable).
For global immutable indexes, the index is maintained entirely on the client-side with the index table being generated as changes to the data table occur.
Local immutable indexes, on the other hand, are maintained on the server-side.
Note that no safeguards are in-place to enforce that a table declared as immutable doesn't actually mutate data (as that would negate the performance gain achieved).
If that was to occur, the index would no longer be in sync with the table.`},{heading:"global-indexes-on-immutable-tables",content:"If you have an existing table that you'd like to switch from immutable indexing to mutable indexing, use the ALTER TABLE command as show below:"},{heading:"global-indexes-on-immutable-tables",content:"Global Indexing for Immutable tables has been completely rewritten for version 4.15 (and 5.1)"},{heading:"immutable-table-indexes-for-415-and-51-and-newer-versions",content:`Immutable index updates go through the same three phase writes as mutable index updates do except that deleting or un-verifying existing index rows is not applicable to immutable indexes.
This guarantees that the index tables are always in sync with the data tables.`},{heading:"immutable-table-indexes-for-414-and-50-and-older-versions",content:`Indexes on non transactional, immutable tables have no mechanism in place to automatically deal with a commit failure. Maintaining
consistency between the table and index is left to the client to handle. Because the updates are idempotent, the simplest
solution is for the client to continue retrying the batch of mutations until they succeed.`},{heading:"global-indexes-on-mutable-tables",content:"Global Indexing for Mutable tables has been completely rewritten for version 4.15 (and 5.1)"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"The new Strongly Consistent Global Indexing feature uses a three-phase indexing algorithm to guarantee that the index tables are always in sync with the data tables."},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"The implementation uses a shadow column to track the status of index rows:"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Write:"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Set the status of existing index rows to unverified and write the new index rows with the unverified status"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Write the data table rows"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Delete the existing index rows and set the status of new rows to verified"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Read:"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Read the index rows and check their status"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"The unverified rows are repaired from the data table"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Delete:"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Set the index table rows with the unverified status"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Delete the data table rows"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Delete index table rows"},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"See resources for more in-depth information."},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"All newly created tables use the new indexing algorithm."},{heading:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Indexes created with older Phoenix versions will continue to use the old implementation, until upgraded with IndexUpgradeTool"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`For non transactional mutable tables, we maintain index update durability by adding the index updates to the Write-Ahead-Log (WAL) entry of the primary table row.
Only after the WAL entry is successfully synced to disk do we attempt to make the index/primary table updates. We write the
index updates in parallel by default, leading to very high throughput. If the server crashes while we are writing the index
updates, we replay the all the index updates to the index tables in the WAL recovery process and rely on the idempotence of
the updates to ensure correctness. Therefore, indexes on non transactional mutable tables are only ever a single batch of
edits behind the primary table.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"It's important to note several points:"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"For non transactional tables, you could see the index table out of sync with the primary table."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"As noted above, this is ok as we are only a very small bit behind and out of sync for very short periods"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Each data row and its index row(s) are guaranteed to to be written or lost - we never see partial updates as this is part of the atomicity guarantees of HBase."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Data is first written to the table followed by the index tables (the reverse is true if the WAL is disabled)."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Singular Write Path"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`There is a single write path that guarantees the failure properties. All writes to the HRegion get intercepted by our
coprocessor. We then build the index updates based on the pending update (or updates, in the case of the batch).
These update are then appended to the WAL entry for the original update.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`If we get any failure up to this point, we return the failure to the client and no data is persisted or made visible
to the client.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Once the WAL is written, we ensure that the index and primary table data will become visible, even in the case of a failure."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"If the server does crash, we then replay the index updates with the usual WAL replay mechanism"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"If the server does not crash, we just insert the index updates to their respective tables."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"If the index updates fail, the various means of maintaining consistency are outlined below."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"If the Phoenix system catalog table cannot be reached when a failure occurs, we force the server to be immediately aborted and failing this, call System.exit on the JVM, forcing the server to die. By killing the server, we ensure that the WAL will be replayed on recovery, replaying the index updates to their appropriate tables. This ensures that a secondary index is not continued to be used when it's in a know, invalid state."},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Disallow table writes until mutable index is consistent"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`The highest level of maintaining consistency between your non transactional table and index is to declare that writes to the
data table should be temporarily disallowed in the event of a failure to update the index. In this consistency
mode, the table and index will be held at the timestamp before the failure occurred, with writes to the data
table being disallowed until the index is back online and in-sync with the data table. The index will
remain active and continue to be used by queries as usual.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"The following server-side configurations control this behavior:"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.block.write must be true to enable a writes to the data table to fail
in the event of a commit failure until the index can be caught up with the data table.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.handling.rebuild must be true (the default) to enable a mutable index to
be rebuilt in the background in the event of a commit failure.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Disable mutable indexes on write failure until consistency restored"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`The default behavior with mutable indexes is to mark the index as disabled if a write to them fails at commit time,
partially rebuild them in the background, and then mark them as active again once consistency is restored. In this
consistency mode, writes to the data table will not be blocked while the secondary index is being rebuilt. However,
the secondary index will not be used by queries while the rebuild is happening.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"The following server-side configurations control this behavior:"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.handling.rebuild must be true (the default) to enable a mutable index to
be rebuilt in the background in the event of a commit failure.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.handling.rebuild.interval controls the millisecond frequency at which the server
checks whether or not a mutable index needs to be partially rebuilt to catch up with updates to the data
table. The default is 10000 or 10 seconds.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.handling.rebuild.overlap.time controls how many milliseconds to go back from the timestamp
at which the failure occurred to go back when a partial rebuild is performed. The default is 1.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Disable mutable index on write failure with manual rebuild required"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`This is the lowest level of consistency for mutable secondary indexes. In this case, when a write to a secondary
index fails, the index will be marked as disabled with a manual
rebuild of the index required to enable it to be used
once again by queries.`},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"The following server-side configurations control this behavior:"},{heading:"mutable-table-indexes-for-414-and-50-and-older-versions",content:`phoenix.index.failure.handling.rebuild must be set to false to disable a mutable index from being
rebuilt in the background in the event of a commit failure.`},{heading:"bulkload-tool-limitation",content:`The BulkLoadTools (e.g. CSVBulkLoadTool and JSONBulkLoadTool) cannot presently generate correct updates to mutable
secondary indexes when pre-existing records are being updated. In the normal mutable secondary index write path, we can
safely calculate a Delete (for the old record) and a Put (for the new record) for each secondary index while holding a
row-lock to prevent concurrent updates. In the context of a MapReduce job, we cannot effectively execute this same logic
because we are specifically doing this "out of band" from the HBase RegionServers. As such, while these Tools generate
HFiles for the index tables with the proper updates for the data being loaded, any previous index records corresponding
to the same record in the table are not deleted. This net-effect of this limitation is: if you use these Tools to re-ingest
the same records to an index table, that index table will have duplicate records in it which will result in incorrect
query results from that index table.`},{heading:"bulkload-tool-limitation",content:`To perform incremental loads of data using the BulkLoadTools which may update existing records, you must
drop and re-create all index tables after the data table is loaded. Re-creating the index with the ASYNC option and
using IndexTool to populate and enable that index is likely a must for tables of non-trivial size.`},{heading:"bulkload-tool-limitation",content:`To perform incremental loading of CSV datasets that do not require any manual index intervention, the psql tool can
be used in place of the BulkLoadTools. Additionally, a MapReduce job could be written to parse CSV/JSON data and write
it directly to Phoenix; although, such a tool is not currently provided by Phoenix for users.`},{heading:"setup",content:"Non transactional, mutable indexing requires special configuration options on the region server and master to run - Phoenix ensures that they are setup correctly when you enable mutable indexing on the table; if the correct properties are not set, you will not be able to use secondary indexing. After adding these settings to your hbase-site.xml, you'll need to do a rolling restart of your cluster."},{heading:"setup",content:"As Phoenix matures, it needs less and less manual configuration. For older Phoenix versions you'll need to add the properties listed for that version, as well as the properties listed for the later versions."},{heading:"for-phoenix-412-and-later",content:"You will need to add the following parameters to hbase-site.xml on each region server:"},{heading:"for-phoenix-412-and-later",content:"The above property enables custom WAL edits to be written, ensuring proper writing/replay of the index updates. This codec supports the usual host of WALEdit options, most notably WALEdit compression."},{heading:"for-phoenix-48---411",content:"The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:"},{heading:"for-phoenix-48---411",content:"The above properties prevent deadlocks from occurring during index maintenance for global indexes (HBase 0.98.4+ and Phoenix 4.3.1+) by ensuring index updates are processed with a higher priority than data updates. It also prevents deadlocks by ensuring metadata rpc calls are processed with a higher priority than data rpc calls."},{heading:"for-phoenix-versions-47-and-below",content:"The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:"},{heading:"for-phoenix-versions-47-and-below",content:"The above properties are required to use local indexing."},{heading:"upgrading-local-indexes-created-before-480",content:"While upgrading the Phoenix to 4.8.0+ version at server remove above three local indexing related configurations from hbase-site.xml if present. From client we are supporting both online(while initializing the connection from phoenix client of 4.8.0+ versions) and offline(using psql tool) upgrade of local indexes created before 4.8.0. As part of upgrade we recreate the local indexes in ASYNC mode. After upgrade user need to build the indexes using IndexTool"},{heading:"upgrading-local-indexes-created-before-480",content:"Following client side configuration used in the upgrade."},{heading:"upgrading-local-indexes-created-before-480",content:"phoenix.client.localIndexUpgradeThe value of it is true means online upgrade and false means offline upgrade.Default: true"},{heading:"upgrading-local-indexes-created-before-480",content:"Command to run offline upgrade using psql:"},{heading:"secondary-indexes-tuning",content:"Out the box, indexing is pretty fast. However, to optimize for your particular environment and workload, there are several properties you can tune."},{heading:"secondary-indexes-tuning",content:"All the following parameters must be set in hbase-site.xml - they are true for the entire cluster and all index tables, as well as across all regions on the same server (so, for instance, a single server would not write to too many different index tables at once)."},{heading:"secondary-indexes-tuning",content:"index.builder.threads.max"},{heading:"secondary-indexes-tuning",content:"Number of threads to used to build the index update from the primary table update"},{heading:"secondary-indexes-tuning",content:"Increasing this value overcomes the bottleneck of reading the current row state from the underlying HRegion. Tuning this value too high will just bottleneck at the HRegion as it will not be able to handle too many concurrent scan requests as well as general thread-swapping concerns."},{heading:"secondary-indexes-tuning",content:"Default: 10"},{heading:"secondary-indexes-tuning",content:"index.builder.threads.keepalivetime"},{heading:"secondary-indexes-tuning",content:"Amount of time in seconds after we expire threads in the builder thread pool."},{heading:"secondary-indexes-tuning",content:"Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load."},{heading:"secondary-indexes-tuning",content:"Default: 60"},{heading:"secondary-indexes-tuning",content:"index.writer.threads.max"},{heading:"secondary-indexes-tuning",content:"Number of threads to use when writing to the target index tables."},{heading:"secondary-indexes-tuning",content:"The first level of parallelization, on a per-table basis - it should roughly correspond to the number of index tables"},{heading:"secondary-indexes-tuning",content:"Default: 10"},{heading:"secondary-indexes-tuning",content:"index.writer.threads.keepalivetime"},{heading:"secondary-indexes-tuning",content:"Amount of time in seconds after we expire threads in the writer thread pool."},{heading:"secondary-indexes-tuning",content:"Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load."},{heading:"secondary-indexes-tuning",content:"Default: 60"},{heading:"secondary-indexes-tuning",content:"hbase.htable.threads.max"},{heading:"secondary-indexes-tuning",content:"Number of threads each index HTable can use for writes."},{heading:"secondary-indexes-tuning",content:"Increasing this allows more concurrent index updates (for instance across batches), leading to high overall throughput."},{heading:"secondary-indexes-tuning",content:"Default: 2,147,483,647"},{heading:"secondary-indexes-tuning",content:"hbase.htable.threads.keepalivetime"},{heading:"secondary-indexes-tuning",content:"Amount of time in seconds after we expire threads in the HTable's thread pool."},{heading:"secondary-indexes-tuning",content:'Using the "direct handoff" approach, new threads will only be created if it is necessary and will grow unbounded. This could be bad but HTables only create as many Runnables as there are region servers; therefore, it also scales when new region servers are added.'},{heading:"secondary-indexes-tuning",content:"Default: 60"},{heading:"secondary-indexes-tuning",content:"index.tablefactory.cache.size"},{heading:"secondary-indexes-tuning",content:"Number of index HTables we should keep in cache."},{heading:"secondary-indexes-tuning",content:"Increasing this number ensures that we do not need to recreate an HTable for each attempt to write to an index table. Conversely, you could see memory pressure if this value is set too high."},{heading:"secondary-indexes-tuning",content:"Default: 10"},{heading:"secondary-indexes-tuning",content:"org.apache.phoenix.regionserver.index.priority.min"},{heading:"secondary-indexes-tuning",content:"Value to specify to bottom (inclusive) of the range in which index priority may lie."},{heading:"secondary-indexes-tuning",content:"Default: 1000"},{heading:"secondary-indexes-tuning",content:"org.apache.phoenix.regionserver.index.priority.max"},{heading:"secondary-indexes-tuning",content:"Value to specify to top (exclusive) of the range in which index priority may lie."},{heading:"secondary-indexes-tuning",content:"Higher priorites within the index min/max range do not means updates are processed sooner."},{heading:"secondary-indexes-tuning",content:"Default: 1050"},{heading:"secondary-indexes-tuning",content:"org.apache.phoenix.regionserver.index.handler.count"},{heading:"secondary-indexes-tuning",content:"Number of threads to use when serving index write requests for global index maintenance."},{heading:"secondary-indexes-tuning",content:"Though the actual number of threads is dictated by the Max(number of call queues, handler count), where the number of call queues is determined by standard HBase configuration. To further tune the queues, you can adjust the standard rpc queue length parameters (currently, there are no special knobs for the index queues), specifically ipc.server.max.callqueue.length and ipc.server.callqueue.handler.factor. See the HBase Reference Guide for more details."},{heading:"secondary-indexes-tuning",content:"Default: 30"},{heading:"secondary-indexes-performance",content:"We track secondary index performance via our performance framework. This is a generic test of performance based on defaults - your results will vary based on hardware specs as well as you individual configuration."},{heading:"secondary-indexes-performance",content:"That said, we have seen secondary indexing (both immutable and mutable) go as quickly as < 2x the regular write path on a small, (3 node) desktop-based cluster. This is actually pretty reasonable as we have to write to multiple tables as well as build the index update."},{heading:"index-scrutiny-tool",content:'With Phoenix 4.12, there is now a tool to run a MapReduce job to verify that an index table is valid against its data table. The only way to find orphaned rows in either table is to scan over all rows in the table and do a lookup in the other table for the corresponding row. For that reason, the tool can run with either the data or index table as the "source" table, and the other as the "target" table. The tool writes all invalid rows it finds either to file or to an output table PHOENIX_INDEX_SCRUTINY. An invalid row is a source row that either has no corresponding row in the target table, or has an incorrect value in the target table (i.e. covered column value).'},{heading:"index-scrutiny-tool",content:"The tool has job counters that track its status. VALID_ROW_COUNT, INVALID_ROW_COUNT, BAD_COVERED_COL_VAL_COUNT. Note that invalid rows - bad col val rows = number of orphaned rows. These counters are written to the table PHOENIX_INDEX_SCRUTINY_METADATA, along with other job metadata."},{heading:"index-scrutiny-tool",content:"The Index Scrutiny Tool can be launched via the hbase command (in hbase/bin) as follows:"},{heading:"index-scrutiny-tool",content:"It can also be run from Hadoop using either the phoenix-core or phoenix-server jar as follows:"},{heading:"index-scrutiny-tool",content:"By default two mapreduce jobs are launched, one with the data table as the source table and one with the index table as the source table."},{heading:"index-scrutiny-tool",content:"The following parameters can be used with the Index Scrutiny Tool:"},{heading:"index-scrutiny-tool",content:"Parameter"},{heading:"index-scrutiny-tool",content:"Description"},{heading:"index-scrutiny-tool",content:"-dt,--data-table"},{heading:"index-scrutiny-tool",content:"Data table name (mandatory)"},{heading:"index-scrutiny-tool",content:"-it,--index-table"},{heading:"index-scrutiny-tool",content:"Index table name (mandatory)"},{heading:"index-scrutiny-tool",content:"-s,--schema"},{heading:"index-scrutiny-tool",content:"Phoenix schema name (optional)"},{heading:"index-scrutiny-tool",content:"-src,--source"},{heading:"index-scrutiny-tool",content:"DATA_TABLE_SOURCE, INDEX_TABLE_SOURCE, or BOTH. Defaults to BOTH"},{heading:"index-scrutiny-tool",content:"-o,--output"},{heading:"index-scrutiny-tool",content:"Whether to output invalid rows. Off by default"},{heading:"index-scrutiny-tool",content:"-of,--output-format"},{heading:"index-scrutiny-tool",content:"TABLE or FILE output format. Defaults to TABLE"},{heading:"index-scrutiny-tool",content:"-om,--output-max"},{heading:"index-scrutiny-tool",content:"Maximum number of invalid rows to output per mapper. Defaults to 1M"},{heading:"index-scrutiny-tool",content:"-op,--output-path"},{heading:"index-scrutiny-tool",content:"For FILE output format, the HDFS directory where files are written"},{heading:"index-scrutiny-tool",content:"-t,--time"},{heading:"index-scrutiny-tool",content:"Timestamp in millis at which to run the scrutiny. This is important so that incoming writes don't throw off the scrutiny. Defaults to current time minus 60 seconds"},{heading:"index-scrutiny-tool",content:"-b,--batch-size"},{heading:"index-scrutiny-tool",content:"Number of rows to compare at a time"},{heading:"secondary-indexes-limitations",content:"If rows are actively being updated or deleted while the scrutiny is running, the tool may give you false positives for inconsistencies (PHOENIX-4277)."},{heading:"secondary-indexes-limitations",content:"Snapshot reads are not supported by the scrutiny tool (PHOENIX-4270)."},{heading:"index-upgrade-tool",content:"IndexUpgradeTool updates global indexes created by Phoenix 4.14 and earlier (or 5.0) to use the new Strongly Consistent Global Indexes implementation."},{heading:"index-upgrade-tool",content:"It accepts following parameters:"},{heading:"index-upgrade-tool",content:"Parameter"},{heading:"index-upgrade-tool",content:"Description"},{heading:"index-upgrade-tool",content:"only in version"},{heading:"index-upgrade-tool",content:"-o,--operation"},{heading:"index-upgrade-tool",content:"upgrade or rollback (mandatory)"},{heading:"index-upgrade-tool",content:"-tb,--tables"},{heading:"index-upgrade-tool",content:"[table1,table2,table3] (-tb or -f mandatory)"},{heading:"index-upgrade-tool",content:"-f,--file"},{heading:"index-upgrade-tool",content:"Csv file with above format (-tb or -f mandatory)"},{heading:"index-upgrade-tool",content:"-d,--dry-run"},{heading:"index-upgrade-tool",content:"If passed this will just output steps that will be executed; like a dry run"},{heading:"index-upgrade-tool",content:"-h,--help"},{heading:"index-upgrade-tool",content:"Help on how to use the tool"},{heading:"index-upgrade-tool",content:"-lf,--logfile"},{heading:"index-upgrade-tool",content:"File location to dump the logs"},{heading:"index-upgrade-tool",content:"-sr,--index-sync-rebuild"},{heading:"index-upgrade-tool",content:"whether or not synchronously rebuild the indexes; default rebuild asynchronous"},{heading:"index-upgrade-tool",content:"4.15"},{heading:"index-upgrade-tool",content:"-rb,--index-rebuild"},{heading:"index-upgrade-tool",content:"Rebuild the indexes. Set -tool to pass options to IndexTool"},{heading:"index-upgrade-tool",content:"4.16+, 5.1+"},{heading:"index-upgrade-tool",content:"-tool,--index-tool"},{heading:"index-upgrade-tool",content:"Options to pass to indexTool when rebuilding indexes"},{heading:"index-upgrade-tool",content:"4.16+, 5.1+"},{heading:"index-upgrade-tool",content:"For 4.16+/5.1+ either specifying the -rb option, or manually rebuilding the indexes with IndexTool after the upgrade is recommended, otherwise the first access of every index row will trigger an index row repair."},{heading:"index-upgrade-tool",content:"Depending on whether index is mutable, it will remove Indexer coprocessor from a data table and load new coprocessor IndexRegionObserver. For both immutable and mutable, it will load GlobalIndexChecker coprocessor on Index table. During this process, data table and index table are disabled-loaded/unloaded with coproc-enabled within short time span. At the end, it does an asynchronous index rebuilds. Index reads are not blocked while index-rebuild is still ongoing, however, they may be a bit slower for rows written prior to upgrade."},{heading:"index-upgrade-tool",content:"IndexUpgradeTool doesn't make any distinction between view-index and table-index. When a table is passed, it will perform the upgrade-operation on all the 'children' indexes of the given table."},{heading:"secondary-indexes-resources",content:"There have been several presentations given on how secondary indexing works in Phoenix that have a more in-depth look at how indexing works (with pretty pictures!):"},{heading:"secondary-indexes-resources",content:"Slides for Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit"},{heading:"secondary-indexes-resources",content:"Recording of Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit"},{heading:"secondary-indexes-resources",content:"Slides for Local Secondary Indexes in Apache Phoenix, 2017 PhoenixCon"},{heading:"secondary-indexes-resources",content:"These older resources refer to obsolete implementations in some cases"},{heading:"secondary-indexes-resources",content:"Los Anglees HBase Meetup - Sept, 4th, 2013"},{heading:"secondary-indexes-resources",content:"Local Indexes by Huawei"},{heading:"secondary-indexes-resources",content:"PHOENIX-938 and HBASE-11513 for deadlock prevention during global index maintenance."},{heading:"secondary-indexes-resources",content:"PHOENIX-1112: Atomically rebuild index partially when index update fails"}],headings:[{id:"covered-indexes",content:"Covered Indexes"},{id:"functional-indexes",content:"Functional Indexes"},{id:"global-indexes",content:"Global Indexes"},{id:"local-indexes",content:"Local Indexes"},{id:"uncovered-indexes",content:"Uncovered Indexes"},{id:"uncovered-indexes-when",content:"When to choose an uncovered index"},{id:"uncovered-indexes-usage",content:"Creating and using an uncovered index"},{id:"partial-indexes",content:"Partial Indexes"},{id:"partial-indexes-when",content:"When to choose a partial index"},{id:"partial-indexes-usage",content:"Creating a partial index"},{id:"partial-indexes-mutations",content:"Mutations that cross the predicate"},{id:"partial-indexes-limitations",content:"Limitations"},{id:"index-population",content:"Index Population"},{id:"async-index-threshold",content:"ASYNC Index threshold"},{id:"index-usage",content:"Index Usage"},{id:"index-removal",content:"Index Removal"},{id:"index-properties",content:"Index Properties"},{id:"consistency-guarantees",content:"Consistency Guarantees"},{id:"local-indexes-1",content:"Local Indexes"},{id:"global-indexes-on-transactional-tables",content:"Global Indexes on Transactional Tables"},{id:"global-indexes-on-immutable-tables",content:"Global Indexes on Immutable Tables"},{id:"immutable-table-indexes-for-415-and-51-and-newer-versions",content:"Immutable table indexes for 4.15 (and 5.1) and newer versions"},{id:"immutable-table-indexes-for-414-and-50-and-older-versions",content:"Immutable table indexes for 4.14 (and 5.0) and older versions"},{id:"global-indexes-on-mutable-tables",content:"Global Indexes on Mutable Tables"},{id:"mutable-table-indexes-for-415-and-51-and-newer-versions",content:"Mutable table indexes for 4.15 (and 5.1) and newer versions"},{id:"mutable-table-indexes-for-414-and-50-and-older-versions",content:"Mutable table indexes for 4.14 (and 5.0) and older versions"},{id:"bulkload-tool-limitation",content:"BulkLoad Tool Limitation"},{id:"setup",content:"Setup"},{id:"for-phoenix-412-and-later",content:"For Phoenix 4.12 and later"},{id:"for-phoenix-48---411",content:"For Phoenix 4.8 - 4.11"},{id:"for-phoenix-versions-47-and-below",content:"For Phoenix versions 4.7 and below"},{id:"upgrading-local-indexes-created-before-480",content:"Upgrading Local Indexes created before 4.8.0"},{id:"secondary-indexes-tuning",content:"Tuning"},{id:"secondary-indexes-performance",content:"Performance"},{id:"index-scrutiny-tool",content:"Index Scrutiny Tool"},{id:"secondary-indexes-limitations",content:"Limitations"},{id:"index-upgrade-tool",content:"Index Upgrade Tool"},{id:"secondary-indexes-resources",content:"Resources"}]};const d=[{depth:2,url:"#covered-indexes",title:e.jsx(e.Fragment,{children:"Covered Indexes"})},{depth:2,url:"#functional-indexes",title:e.jsx(e.Fragment,{children:"Functional Indexes"})},{depth:2,url:"#global-indexes",title:e.jsx(e.Fragment,{children:"Global Indexes"})},{depth:2,url:"#local-indexes",title:e.jsx(e.Fragment,{children:"Local Indexes"})},{depth:2,url:"#uncovered-indexes",title:e.jsx(e.Fragment,{children:"Uncovered Indexes"})},{depth:3,url:"#uncovered-indexes-when",title:e.jsx(e.Fragment,{children:"When to choose an uncovered index"})},{depth:3,url:"#uncovered-indexes-usage",title:e.jsx(e.Fragment,{children:"Creating and using an uncovered index"})},{depth:2,url:"#partial-indexes",title:e.jsx(e.Fragment,{children:"Partial Indexes"})},{depth:3,url:"#partial-indexes-when",title:e.jsx(e.Fragment,{children:"When to choose a partial index"})},{depth:3,url:"#partial-indexes-usage",title:e.jsx(e.Fragment,{children:"Creating a partial index"})},{depth:3,url:"#partial-indexes-mutations",title:e.jsx(e.Fragment,{children:"Mutations that cross the predicate"})},{depth:3,url:"#partial-indexes-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#index-population",title:e.jsx(e.Fragment,{children:"Index Population"})},{depth:4,url:"#async-index-threshold",title:e.jsx(e.Fragment,{children:"ASYNC Index threshold"})},{depth:2,url:"#index-usage",title:e.jsx(e.Fragment,{children:"Index Usage"})},{depth:2,url:"#index-removal",title:e.jsx(e.Fragment,{children:"Index Removal"})},{depth:2,url:"#index-properties",title:e.jsx(e.Fragment,{children:"Index Properties"})},{depth:2,url:"#consistency-guarantees",title:e.jsx(e.Fragment,{children:"Consistency Guarantees"})},{depth:3,url:"#local-indexes-1",title:e.jsx(e.Fragment,{children:"Local Indexes"})},{depth:3,url:"#global-indexes-on-transactional-tables",title:e.jsx(e.Fragment,{children:"Global Indexes on Transactional Tables"})},{depth:3,url:"#global-indexes-on-immutable-tables",title:e.jsx(e.Fragment,{children:"Global Indexes on Immutable Tables"})},{depth:4,url:"#immutable-table-indexes-for-415-and-51-and-newer-versions",title:e.jsx(e.Fragment,{children:"Immutable table indexes for 4.15 (and 5.1) and newer versions"})},{depth:4,url:"#immutable-table-indexes-for-414-and-50-and-older-versions",title:e.jsx(e.Fragment,{children:"Immutable table indexes for 4.14 (and 5.0) and older versions"})},{depth:3,url:"#global-indexes-on-mutable-tables",title:e.jsx(e.Fragment,{children:"Global Indexes on Mutable Tables"})},{depth:4,url:"#mutable-table-indexes-for-415-and-51-and-newer-versions",title:e.jsx(e.Fragment,{children:"Mutable table indexes for 4.15 (and 5.1) and newer versions"})},{depth:4,url:"#mutable-table-indexes-for-414-and-50-and-older-versions",title:e.jsx(e.Fragment,{children:"Mutable table indexes for 4.14 (and 5.0) and older versions"})},{depth:4,url:"#bulkload-tool-limitation",title:e.jsx(e.Fragment,{children:"BulkLoad Tool Limitation"})},{depth:2,url:"#setup",title:e.jsx(e.Fragment,{children:"Setup"})},{depth:4,url:"#for-phoenix-412-and-later",title:e.jsx(e.Fragment,{children:"For Phoenix 4.12 and later"})},{depth:4,url:"#for-phoenix-48---411",title:e.jsx(e.Fragment,{children:"For Phoenix 4.8 - 4.11"})},{depth:4,url:"#for-phoenix-versions-47-and-below",title:e.jsx(e.Fragment,{children:"For Phoenix versions 4.7 and below"})},{depth:3,url:"#upgrading-local-indexes-created-before-480",title:e.jsx(e.Fragment,{children:"Upgrading Local Indexes created before 4.8.0"})},{depth:2,url:"#secondary-indexes-tuning",title:e.jsx(e.Fragment,{children:"Tuning"})},{depth:2,url:"#secondary-indexes-performance",title:e.jsx(e.Fragment,{children:"Performance"})},{depth:2,url:"#index-scrutiny-tool",title:e.jsx(e.Fragment,{children:"Index Scrutiny Tool"})},{depth:3,url:"#secondary-indexes-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#index-upgrade-tool",title:e.jsx(e.Fragment,{children:"Index Upgrade Tool"})},{depth:2,url:"#secondary-indexes-resources",title:e.jsx(e.Fragment,{children:"Resources"})}];function t(i){const n={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:`Secondary indexes are an orthogonal way to access data from its primary access path. In HBase, you have a single
index that is lexicographically sorted on the primary row key. Access to records in any way other than through
the primary row requires scanning over potentially all the rows in the table to test them against your filter.
With secondary indexing, the columns or expressions you index form an alternate row key to allow point lookups
and range scans along this new axis.`}),`
`,e.jsx(n.h2,{id:"covered-indexes",children:"Covered Indexes"}),`
`,e.jsxs(n.p,{children:["Phoenix is particularly powerful in that we provide ",e.jsx(n.em,{children:"covered"}),` indexes -
we do not need to go back to the primary table once we have found the index entry. Instead, we bundle the data
we care about right in the index rows, saving read-time overhead.`]}),`
`,e.jsxs(n.p,{children:["For example, the following would create an index on the ",e.jsx(n.code,{children:"v1"})," and ",e.jsx(n.code,{children:"v2"}),` columns and
include the `,e.jsx(n.code,{children:"v3"})," column in the index as well to prevent having to get it from the data table:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_index"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v1,v2) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v3)"})]})})})}),`
`,e.jsx(n.h2,{id:"functional-indexes",children:"Functional Indexes"}),`
`,e.jsxs(n.p,{children:[`Functional indexes (available in 4.3 and above) allow you to create
an index not just on columns, but on an arbitrary expressions. Then when a query uses that expression, the index
may be used to retrieve the results instead of the data table. For example, you could create an index on `,e.jsx(n.code,{children:"UPPER(FIRST_NAME||' '||LAST_NAME)"}),`
to allow you to do case insensitive searches on the combined first name and last name of a person.`]}),`
`,e.jsx(n.p,{children:"For example, the following would create this functional index:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" UPPER_NAME_IDX"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" EMP ("}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UPPER"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(FIRST_NAME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"||"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"' '"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"||"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"LAST_NAME))"})]})})})}),`
`,e.jsx(n.p,{children:"With this index in place, when the following query is issued, the index would be used instead of the data table to retrieve the results:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" EMP_ID "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" EMP "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" UPPER"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(FIRST_NAME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"||"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"' '"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"||"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"LAST_NAME)"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'JOHN DOE'"})]})})})}),`
`,e.jsx(n.p,{children:`Phoenix supports two types of indexing techniques: global and local indexing.
Each are useful in different scenarios and have their own failure profiles and performance characteristics.`}),`
`,e.jsx(n.h2,{id:"global-indexes",children:"Global Indexes"}),`
`,e.jsxs(n.p,{children:["Global indexing targets ",e.jsx(n.em,{children:"read heavy"})," uses cases. With global indexes, all the performance penalties for indexes occur at write time. We intercept the data table updates on write (",e.jsx(n.a,{href:"/docs/grammar#delete",children:"DELETE"}),", ",e.jsx(n.a,{href:"/docs/grammar#upsert-values",children:"UPSERT VALUES"})," and ",e.jsx(n.a,{href:"/docs/grammar#upsert-select",children:"UPSERT SELECT"}),"), build the index update and then sent any necessary updates to all interested index tables. At read time, Phoenix will select the index table to use that will produce the fastest query time and directly scan it just like any other HBase table. An index will not be used for a query that references a column that isn't part of the index."]}),`
`,e.jsxs(n.p,{children:["For write-heavy workloads where synchronous index maintenance is the bottleneck and a bounded staleness window on the index is acceptable, a global index can be created with ",e.jsx(n.code,{children:"CONSISTENCY=EVENTUAL"})," to move its maintenance off the data-table write path. See ",e.jsx(n.a,{href:"/docs/features/eventually-consistent-indexes",children:"Eventually Consistent Global Indexes"}),"."]}),`
`,e.jsx(n.h2,{id:"local-indexes",children:"Local Indexes"}),`
`,e.jsxs(n.p,{children:["Local indexing targets ",e.jsx(n.em,{children:"write heavy"}),", ",e.jsx(n.em,{children:"space constrained"})," use cases. Just like with global indexes, Phoenix will automatically select whether or not to use a local index at query-time. With local indexes, index data and table data co-reside on same server preventing any network overhead during writes. Local indexes can be used even when the query isn't fully covered (i.e. Phoenix automatically retrieve the columns not in the index through point gets against the data table). Unlike global indexes, all local indexes of a table are stored in a single, separate shared table prior to 4.8.0 version. From 4.8.0 onwards we are storing all local index data in the separate shadow column families in the same data table. At read time when the local index is used, every region must be examined for the data as the exact region location of index data cannot be predetermined. Thus some overhead occurs at read-time."]}),`
`,e.jsx(n.h2,{id:"uncovered-indexes",children:"Uncovered Indexes"}),`
`,e.jsxs(n.p,{children:[`A global index is "covered" for a query when every column the query references is in
the index — either in the index key or in `,e.jsx(n.code,{children:"INCLUDE"}),`. Historically a global index that
wasn't covered for a query simply wasn't used: Phoenix would fall back to a full
data-table scan. `,e.jsx(n.strong,{children:"Uncovered indexes"}),` lift that restriction — Phoenix can use a
global index even when the query needs columns that aren't in it, by joining back
to the data table on the server side to fetch the missing columns
(`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-6458",children:"PHOENIX-6458"}),")."]}),`
`,e.jsxs(n.p,{children:["Local indexes already worked this way (see ",e.jsx(n.a,{href:"#local-indexes",children:"Local Indexes"}),` above);
the new capability is for `,e.jsx(n.strong,{children:"global"})," indexes."]}),`
`,e.jsx(n.h3,{id:"uncovered-indexes-when",children:"When to choose an uncovered index"}),`
`,e.jsxs(n.p,{children:["Both an ",e.jsx(n.code,{children:"INCLUDE"}),` covered index and an uncovered index let the same query use the
index. They trade off different costs:`]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Approach"}),e.jsx(n.th,{children:"Index size"}),e.jsx(n.th,{children:"Read path"}),e.jsx(n.th,{children:"Best when"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"CREATE INDEX ... INCLUDE (c)"})}),e.jsxs(n.td,{children:["Larger — ",e.jsx(n.code,{children:"c"})," is duplicated"]}),e.jsx(n.td,{children:"Index-only scan"}),e.jsxs(n.td,{children:["Column ",e.jsx(n.code,{children:"c"})," is small, frequently read with the index, and updated rarely"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"CREATE UNCOVERED INDEX"})}),e.jsx(n.td,{children:"Smaller — only the key"}),e.jsx(n.td,{children:"Index seek + server-side join to data row"}),e.jsx(n.td,{children:"Column is large, rarely read with this access path, or updated often"})]})]})]}),`
`,e.jsxs(n.p,{children:["A common pattern is to ",e.jsx(n.strong,{children:"leave wide payload columns out of the index"}),` entirely and
let Phoenix fetch them via the join-back when needed. This keeps the index compact
and write-cheap, at the cost of a per-matching-row data-table read on the rare query
that wants the payload.`]}),`
`,e.jsx(n.h3,{id:"uncovered-indexes-usage",children:"Creating and using an uncovered index"}),`
`,e.jsxs(n.p,{children:["Declare an uncovered global index with the ",e.jsx(n.code,{children:"UNCOVERED"}),` keyword in the DDL.
`,e.jsx(n.code,{children:"UNCOVERED"})," is global-only (cannot be combined with ",e.jsx(n.code,{children:"LOCAL"}),`) and cannot be combined
with `,e.jsx(n.code,{children:"INCLUDE"})," — the whole point is to skip duplicating columns:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UNCOVERED "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" idx_user_email "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" users(email);"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 'name' and 'created_at' are NOT in the index, but Phoenix can still use it"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- by seeking on email and joining back to the data table for the other columns."})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", email, created_at"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" users"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" email "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'jane@example.com'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(n.p,{children:`The planner picks an uncovered index automatically when it's the best plan; no
hint is required. If you want to force it (e.g. to compare plans), use the
standard index hint:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" /*+ INDEX(users idx_user_email) */"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", email, created_at"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" users"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" email "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'jane@example.com'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(n.h2,{id:"partial-indexes",children:"Partial Indexes"}),`
`,e.jsxs(n.p,{children:["A ",e.jsx(n.strong,{children:"partial index"}),` indexes only the rows of the data table that satisfy a SQL
boolean predicate, supplied at `,e.jsx(n.code,{children:"CREATE INDEX"})," time via a ",e.jsx(n.code,{children:"WHERE"}),` clause. The
index is smaller, writes that don't affect the predicate are cheaper, and the
planner only uses it for queries whose own predicate implies the index's. Added
in `,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7032",children:"PHOENIX-7032"}),"."]}),`
`,e.jsx(n.h3,{id:"partial-indexes-when",children:"When to choose a partial index"}),`
`,e.jsx(n.p,{children:`Reach for a partial index when the workload reads a small, well-defined slice of
a much larger table — and that slice is identifiable by a SQL predicate. Common
shapes:`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Open / active records"}),": ",e.jsx(n.code,{children:"WHERE status IN ('OPEN', 'PENDING')"}),` on a table that
also stores closed records.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Recent rows"}),": ",e.jsx(n.code,{children:"WHERE created_at > DATE '2024-01-01'"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Hot tier"}),": ",e.jsx(n.code,{children:"WHERE priority >= 5"})," for paging / alerting workloads."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.em,{children:"Failure investigation"}),": ",e.jsx(n.code,{children:"WHERE result = 'FAIL'"}),` on a successful-most-of-the-time
table.`]}),`
`]}),`
`,e.jsx(n.h3,{id:"partial-indexes-usage",children:"Creating a partial index"}),`
`,e.jsxs(n.p,{children:["The DDL is a regular ",e.jsx(n.code,{children:"CREATE INDEX"})," with a trailing ",e.jsx(n.code,{children:"WHERE"}),` clause. Both
`,e.jsx(n.strong,{children:"covered"})," and ",e.jsx(n.strong,{children:"uncovered"})," global indexes can be partial:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idx_open_orders"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders (customer_id, created_at)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (total_amount)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" status"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" IN"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'OPEN'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'PENDING'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UNCOVERED "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" idx_failed_jobs"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" jobs (created_at)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" result "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'FAIL'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(n.p,{children:["The planner uses the index for any query whose ",e.jsx(n.code,{children:"WHERE"}),` clause implies the
index's predicate:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Uses idx_open_orders (status IN ('OPEN','PENDING') is implied)."})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id, total_amount"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" orders"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" status"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'OPEN'"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" created_at "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?;"})]})]})})}),`
`,e.jsx(n.h3,{id:"partial-indexes-mutations",children:"Mutations that cross the predicate"}),`
`,e.jsxs(n.p,{children:[`Partial indexes correctly maintain themselves when a mutation moves a row into
or out of the predicate, including under `,e.jsx(n.code,{children:"ON DUPLICATE KEY UPDATE"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["A row that ",e.jsx(n.strong,{children:"starts"}),` satisfying the predicate after an update has its index
row created.`]}),`
`,e.jsxs(n.li,{children:["A row that ",e.jsx(n.strong,{children:"stops"}),` satisfying the predicate after an update has its index
row removed.`]}),`
`]}),`
`,e.jsxs(n.p,{children:["This means a partial index stays consistent for a workload like ",e.jsx(n.em,{children:`"close an
order"`}),` even though that operation flips the row out of the index's covered
slice.`]}),`
`,e.jsx(n.h3,{id:"partial-indexes-limitations",children:"Limitations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Local partial indexes are not supported"}),` — only global (covered or
uncovered) partial indexes work today.`]}),`
`,e.jsxs(n.li,{children:["The ",e.jsx(n.code,{children:"WHERE"})," predicate is fixed at ",e.jsx(n.code,{children:"CREATE INDEX"}),` time. To change it, drop and
recreate the index.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"index-population",children:"Index Population"}),`
`,e.jsxs(n.p,{children:["By default, when an index is created, it is populated synchronously during the CREATE INDEX call. This may not be feasible depending on the current size of the data table. As of 4.5, initially population of an index may be done asynchronously by including the ",e.jsx(n.code,{children:"ASYNC"})," keyword in the index creation DDL statement:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" async_index"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" my_schema"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"my_table"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v) ASYNC"})]})})})}),`
`,e.jsx(n.p,{children:"The map reduce job that populates the index table must be kicked off separately through the HBase command line like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.IndexTool"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  --schema"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MY_SCHEMA"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --data-table"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" MY_TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --index-table"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ASYNC_IDX"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  --output-path"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ASYNC_IDX_HFILES"})]})]})})}),`
`,e.jsx(n.p,{children:"Only when the map reduce job is complete will the index be activated and start to be used in queries. The job is resilient to the client being exited. The output-path option is used to specify a HDFS directory that is used for writing HFiles to."}),`
`,e.jsxs(n.p,{children:["You can also start index population for all indexes in ",e.jsx(n.code,{children:"BUILDING"}),' ("b") state with the following HBase command line:']}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.automation.PhoenixMRJobSubmitter"})})})})}),`
`,e.jsx(n.h4,{id:"async-index-threshold",children:"ASYNC Index threshold"}),`
`,e.jsxs(n.p,{children:["As of 4.16 (and 5.1), setting the ",e.jsx(n.code,{children:"phoenix.index.async.threshold"})," property to a positive number will disallow synchronous index creation if the estimated indexed data size exceeds ",e.jsx(n.code,{children:"phoenix.index.async.threshold"})," (in bytes)."]}),`
`,e.jsx(n.h2,{id:"index-usage",children:"Index Usage"}),`
`,e.jsxs(n.p,{children:["Indexes are automatically used by Phoenix to service a query when it's determined more efficient to do so. However, a global index will not be used unless all of the columns referenced in the query are contained in the index. For example, the following query would not use the index, because ",e.jsx(n.code,{children:"v2"})," is referenced in the query but not included in the index:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" v2 "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" v1 "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'foo'"})]})})})}),`
`,e.jsx(n.p,{children:"There are two means of getting an index to be used in this case:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Create a ",e.jsx(n.em,{children:"covered"})," index by including ",e.jsx(n.code,{children:"v2"})," in the index:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_index"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v1) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v2)"})]})})})}),`
`,e.jsx(n.p,{children:"This will cause the v2 column value to be copied into the index and kept in synch as it changes. This will obviously increase the size of the index."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Create a ",e.jsx(n.em,{children:"local"})," index:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" LOCAL"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_index "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v1)"})]})})})}),`
`,e.jsxs(n.p,{children:["Unlike global indexes, local indexes ",e.jsx(n.em,{children:"will"})," use an index even when all columns referenced in the query are not contained in the index. This is done by default for local indexes because we know that the table and index data coreside on the same region server thus ensuring the lookup is local."]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"index-removal",children:"Index Removal"}),`
`,e.jsx(n.p,{children:"To drop an index, you'd issue the following statement:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DROP"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_index "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]})})})}),`
`,e.jsx(n.p,{children:"If an indexed column is dropped in the data table, the index will automatically be dropped. In addition, if a covered column is dropped in the data table, it will be automatically dropped from the index as well."}),`
`,e.jsx(n.h2,{id:"index-properties",children:"Index Properties"}),`
`,e.jsxs(n.p,{children:["Just like with the ",e.jsx(n.code,{children:"CREATE TABLE"})," statement, the ",e.jsx(n.code,{children:"CREATE INDEX"})," statement may pass through properties to apply to the underlying HBase table, including the ability to salt it:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_index"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ON"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table (v2 "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DESC"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", v1) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INCLUDE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (v3)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"SALT_BUCKETS"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", DATA_BLOCK_ENCODING"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'NONE'"})]})]})})}),`
`,e.jsxs(n.p,{children:["Note that if the primary table is salted, then the index is automatically salted in the same way for global indexes. In addition, the MAX_FILESIZE for the index is adjusted down, relative to the size of the primary versus index table. For more on salting see ",e.jsx(n.a,{href:"/docs/features/salted-tables",children:"here"}),". With local indexes, on the other hand, specifying ",e.jsx(n.code,{children:"SALT_BUCKETS"})," is not allowed."]}),`
`,e.jsx(n.h2,{id:"consistency-guarantees",children:"Consistency Guarantees"}),`
`,e.jsx(n.p,{children:`On successful return to the client after a commit, all data is guaranteed to be written to all interested indexes and the
primary table. In other words, index updates are synchronous with the same strong consistency guarantees provided by HBase.`}),`
`,e.jsx(n.p,{children:`However, since indexes are stored in separate tables than the data table, depending on the properties of the table and the
type of index, the consistency between your table and index varies in the event that a commit fails due to a server-side
crash. This is an important design consideration driven by your requirements and use case.`}),`
`,e.jsx(n.p,{children:"Outlined below are the different options with various levels of consistency guarantees."}),`
`,e.jsx(n.h3,{id:"local-indexes-1",children:"Local Indexes"}),`
`,e.jsx(n.p,{children:"Since Phoenix 4.8 local indexes are always guaranteed to be consistent."}),`
`,e.jsx(n.h3,{id:"global-indexes-on-transactional-tables",children:"Global Indexes on Transactional Tables"}),`
`,e.jsxs(n.p,{children:["By declaring your table as ",e.jsx(n.a,{href:"/docs/features/transactions",children:"transactional"}),`, you achieve the highest level of consistency guarantee
between your table and index. In this case, your commit of your table mutations and related index updates are atomic
with strong `,e.jsx(n.a,{href:"https://en.wikipedia.org/wiki/ACID",children:"ACID"}),` guarantees. If the commit fails, then none of your data (table
or index) is updated, thus ensuring that your table and index are always in sync.`]}),`
`,e.jsx(n.p,{children:`Why not just always declare your tables as transactional? This may be fine, especially if your
table is declared as immutable, since the transactional overhead is very small in this case. However, if your data
is mutable, make sure that the overhead associated with the conflict detection that occurs with transactional tables
and the operational overhead of running the transaction manager is acceptable. Additionally, transactional tables
with secondary indexes potentially lowers your availability of being able to write to your data table, as both the
data table and its secondary index tables must be availalbe as otherwise the write will fail.`}),`
`,e.jsx(n.h3,{id:"global-indexes-on-immutable-tables",children:"Global Indexes on Immutable Tables"}),`
`,e.jsxs(n.p,{children:[`For a table in which the data is only written once and never updated in-place, certain optimizations may be made to reduce the write-time overhead for incremental maintenance.
This is common with time-series data such as log or event data, where once a row is written, it will never be updated.
To take advantage of these optimizations, declare your table as immutable by adding the `,e.jsx(n.code,{children:"IMMUTABLE_ROWS=true"})," property to your DDL statement:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" my_table"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (k "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", v "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") IMMUTABLE_ROWS"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"true"})]})})})}),`
`,e.jsxs(n.p,{children:["All indexes on a table declared with ",e.jsx(n.code,{children:"IMMUTABLE_ROWS=true"}),` are considered immutable (note that by default, tables are considered mutable).
For global immutable indexes, the index is maintained entirely on the client-side with the index table being generated as changes to the data table occur.
Local immutable indexes, on the other hand, are maintained on the server-side.
Note that no safeguards are in-place to enforce that a table declared as immutable doesn't actually mutate data (as that would negate the performance gain achieved).
If that was to occur, the index would no longer be in sync with the table.`]}),`
`,e.jsxs(n.p,{children:["If you have an existing table that you'd like to switch from immutable indexing to mutable indexing, use the ",e.jsx(n.code,{children:"ALTER TABLE"})," command as show below:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IMMUTABLE_ROWS"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"false"})]})})})}),`
`,e.jsx(n.p,{children:"Global Indexing for Immutable tables has been completely rewritten for version 4.15 (and 5.1)"}),`
`,e.jsx(n.h4,{id:"immutable-table-indexes-for-415-and-51-and-newer-versions",children:"Immutable table indexes for 4.15 (and 5.1) and newer versions"}),`
`,e.jsx(n.p,{children:`Immutable index updates go through the same three phase writes as mutable index updates do except that deleting or un-verifying existing index rows is not applicable to immutable indexes.
This guarantees that the index tables are always in sync with the data tables.`}),`
`,e.jsx(n.h4,{id:"immutable-table-indexes-for-414-and-50-and-older-versions",children:"Immutable table indexes for 4.14 (and 5.0) and older versions"}),`
`,e.jsx(n.p,{children:`Indexes on non transactional, immutable tables have no mechanism in place to automatically deal with a commit failure. Maintaining
consistency between the table and index is left to the client to handle. Because the updates are idempotent, the simplest
solution is for the client to continue retrying the batch of mutations until they succeed.`}),`
`,e.jsx(n.h3,{id:"global-indexes-on-mutable-tables",children:"Global Indexes on Mutable Tables"}),`
`,e.jsx(n.p,{children:"Global Indexing for Mutable tables has been completely rewritten for version 4.15 (and 5.1)"}),`
`,e.jsx(n.h4,{id:"mutable-table-indexes-for-415-and-51-and-newer-versions",children:"Mutable table indexes for 4.15 (and 5.1) and newer versions"}),`
`,e.jsx(n.p,{children:"The new Strongly Consistent Global Indexing feature uses a three-phase indexing algorithm to guarantee that the index tables are always in sync with the data tables."}),`
`,e.jsx(n.p,{children:"The implementation uses a shadow column to track the status of index rows:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Write:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Set the status of existing index rows to unverified and write the new index rows with the unverified status"}),`
`,e.jsx(n.li,{children:"Write the data table rows"}),`
`,e.jsx(n.li,{children:"Delete the existing index rows and set the status of new rows to verified"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Read:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Read the index rows and check their status"}),`
`,e.jsx(n.li,{children:"The unverified rows are repaired from the data table"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Delete:"})}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Set the index table rows with the unverified status"}),`
`,e.jsx(n.li,{children:"Delete the data table rows"}),`
`,e.jsx(n.li,{children:"Delete index table rows"}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#secondary-indexes-resources",children:"resources"})," for more in-depth information."]}),`
`,e.jsx(n.p,{children:"All newly created tables use the new indexing algorithm."}),`
`,e.jsxs(n.p,{children:["Indexes created with older Phoenix versions will continue to use the old implementation, until upgraded with ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#index-upgrade-tool",children:"IndexUpgradeTool"})]}),`
`,e.jsx(n.h4,{id:"mutable-table-indexes-for-414-and-50-and-older-versions",children:"Mutable table indexes for 4.14 (and 5.0) and older versions"}),`
`,e.jsx(n.p,{children:`For non transactional mutable tables, we maintain index update durability by adding the index updates to the Write-Ahead-Log (WAL) entry of the primary table row.
Only after the WAL entry is successfully synced to disk do we attempt to make the index/primary table updates. We write the
index updates in parallel by default, leading to very high throughput. If the server crashes while we are writing the index
updates, we replay the all the index updates to the index tables in the WAL recovery process and rely on the idempotence of
the updates to ensure correctness. Therefore, indexes on non transactional mutable tables are only ever a single batch of
edits behind the primary table.`}),`
`,e.jsx(n.p,{children:"It's important to note several points:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"For non transactional tables, you could see the index table out of sync with the primary table."}),`
`,e.jsx(n.li,{children:"As noted above, this is ok as we are only a very small bit behind and out of sync for very short periods"}),`
`,e.jsx(n.li,{children:"Each data row and its index row(s) are guaranteed to to be written or lost - we never see partial updates as this is part of the atomicity guarantees of HBase."}),`
`,e.jsx(n.li,{children:"Data is first written to the table followed by the index tables (the reverse is true if the WAL is disabled)."}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Singular Write Path"})}),`
`,e.jsx(n.p,{children:`There is a single write path that guarantees the failure properties. All writes to the HRegion get intercepted by our
coprocessor. We then build the index updates based on the pending update (or updates, in the case of the batch).
These update are then appended to the WAL entry for the original update.`}),`
`,e.jsx(n.p,{children:`If we get any failure up to this point, we return the failure to the client and no data is persisted or made visible
to the client.`}),`
`,e.jsx(n.p,{children:"Once the WAL is written, we ensure that the index and primary table data will become visible, even in the case of a failure."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If the server ",e.jsx(n.em,{children:"does"})," crash, we then replay the index updates with the usual WAL replay mechanism"]}),`
`,e.jsxs(n.li,{children:["If the server does ",e.jsx(n.em,{children:"not"})," crash, we just insert the index updates to their respective tables.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"If the index updates fail, the various means of maintaining consistency are outlined below."}),`
`,e.jsxs(n.li,{children:["If the Phoenix system catalog table cannot be reached when a failure occurs, we force the server to be immediately aborted and failing this, call ",e.jsx(n.code,{children:"System.exit"})," on the JVM, forcing the server to die. By killing the server, we ensure that the WAL will be replayed on recovery, replaying the index updates to their appropriate tables. This ensures that a secondary index is not continued to be used when it's in a know, invalid state."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Disallow table writes until mutable index is consistent"})}),`
`,e.jsx(n.p,{children:`The highest level of maintaining consistency between your non transactional table and index is to declare that writes to the
data table should be temporarily disallowed in the event of a failure to update the index. In this consistency
mode, the table and index will be held at the timestamp before the failure occurred, with writes to the data
table being disallowed until the index is back online and in-sync with the data table. The index will
remain active and continue to be used by queries as usual.`}),`
`,e.jsx(n.p,{children:"The following server-side configurations control this behavior:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.block.write"}),` must be true to enable a writes to the data table to fail
in the event of a commit failure until the index can be caught up with the data table.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.handling.rebuild"}),` must be true (the default) to enable a mutable index to
be rebuilt in the background in the event of a commit failure.`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Disable mutable indexes on write failure until consistency restored"})}),`
`,e.jsx(n.p,{children:`The default behavior with mutable indexes is to mark the index as disabled if a write to them fails at commit time,
partially rebuild them in the background, and then mark them as active again once consistency is restored. In this
consistency mode, writes to the data table will not be blocked while the secondary index is being rebuilt. However,
the secondary index will not be used by queries while the rebuild is happening.`}),`
`,e.jsx(n.p,{children:"The following server-side configurations control this behavior:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.handling.rebuild"}),` must be true (the default) to enable a mutable index to
be rebuilt in the background in the event of a commit failure.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.handling.rebuild.interval"}),` controls the millisecond frequency at which the server
checks whether or not a mutable index needs to be partially rebuilt to catch up with updates to the data
table. The default is 10000 or 10 seconds.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.handling.rebuild.overlap.time"}),` controls how many milliseconds to go back from the timestamp
at which the failure occurred to go back when a partial rebuild is performed. The default is 1.`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Disable mutable index on write failure with manual rebuild required"})}),`
`,e.jsxs(n.p,{children:[`This is the lowest level of consistency for mutable secondary indexes. In this case, when a write to a secondary
index fails, the index will be marked as disabled with a manual
`,e.jsx(n.a,{href:"/docs/grammar#alter-index",children:"rebuild of the index"}),` required to enable it to be used
once again by queries.`]}),`
`,e.jsx(n.p,{children:"The following server-side configurations control this behavior:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.index.failure.handling.rebuild"}),` must be set to false to disable a mutable index from being
rebuilt in the background in the event of a commit failure.`]}),`
`]}),`
`,e.jsx(n.h4,{id:"bulkload-tool-limitation",children:"BulkLoad Tool Limitation"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"BulkLoadTools"})," (e.g. ",e.jsx(n.code,{children:"CSVBulkLoadTool"})," and ",e.jsx(n.code,{children:"JSONBulkLoadTool"}),`) cannot presently generate correct updates to mutable
secondary indexes when pre-existing records are being updated. In the normal mutable secondary index write path, we can
safely calculate a Delete (for the old record) and a Put (for the new record) for each secondary index while holding a
row-lock to prevent concurrent updates. In the context of a MapReduce job, we cannot effectively execute this same logic
because we are specifically doing this "out of band" from the HBase RegionServers. As such, while these Tools generate
HFiles for the index tables with the proper updates for the data being loaded, any previous index records corresponding
to the same record in the table are not deleted. This net-effect of this limitation is: if you use these Tools to re-ingest
the same records to an index table, that index table will have duplicate records in it which will result in incorrect
query results from that index table.`]}),`
`,e.jsxs(n.p,{children:["To perform incremental loads of data using the ",e.jsx(n.code,{children:"BulkLoadTools"}),` which may update existing records, you must
drop and re-create all index tables after the data table is loaded. Re-creating the index with the `,e.jsx(n.code,{children:"ASYNC"}),` option and
using `,e.jsx(n.code,{children:"IndexTool"})," to populate and enable that index is likely a must for tables of non-trivial size."]}),`
`,e.jsxs(n.p,{children:["To perform incremental loading of CSV datasets that do not require any manual index intervention, the ",e.jsx(n.code,{children:"psql"}),` tool can
be used in place of the BulkLoadTools. Additionally, a MapReduce job could be written to parse CSV/JSON data and write
it directly to Phoenix; although, such a tool is not currently provided by Phoenix for users.`]}),`
`,e.jsx(n.h2,{id:"setup",children:"Setup"}),`
`,e.jsx(n.p,{children:"Non transactional, mutable indexing requires special configuration options on the region server and master to run - Phoenix ensures that they are setup correctly when you enable mutable indexing on the table; if the correct properties are not set, you will not be able to use secondary indexing. After adding these settings to your hbase-site.xml, you'll need to do a rolling restart of your cluster."}),`
`,e.jsxs(n.p,{children:["As Phoenix matures, it needs less and less manual configuration. For older Phoenix versions you'll need to add the properties listed for that version, ",e.jsx(n.em,{children:"as well as the properties listed for the later versions"}),"."]}),`
`,e.jsx(n.h4,{id:"for-phoenix-412-and-later",children:"For Phoenix 4.12 and later"}),`
`,e.jsxs(n.p,{children:["You will need to add the following parameters to ",e.jsx(n.code,{children:"hbase-site.xml"})," on each region server:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.regionserver.wal.codec</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.regionserver.wal.IndexedWALEditCodec</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"The above property enables custom WAL edits to be written, ensuring proper writing/replay of the index updates. This codec supports the usual host of WALEdit options, most notably WALEdit compression."}),`
`,e.jsx(n.h4,{id:"for-phoenix-48---411",children:"For Phoenix 4.8 - 4.11"}),`
`,e.jsx(n.p,{children:"The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.region.server.rpc.scheduler.factory.class</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.ipc.PhoenixRpcSchedulerFactory</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Factory to create the Phoenix RPC Scheduler that uses separate queues for index and metadata updates</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.rpc.controllerfactory.class</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.ipc.controller.ServerRpcControllerFactory</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Factory to create the Phoenix RPC Scheduler that uses separate queues for index and metadata updates</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"The above properties prevent deadlocks from occurring during index maintenance for global indexes (HBase 0.98.4+ and Phoenix 4.3.1+) by ensuring index updates are processed with a higher priority than data updates. It also prevents deadlocks by ensuring metadata rpc calls are processed with a higher priority than data rpc calls."}),`
`,e.jsx(n.h4,{id:"for-phoenix-versions-47-and-below",children:"For Phoenix versions 4.7 and below"}),`
`,e.jsx(n.p,{children:"The following configuration changes are also required to the server-side hbase-site.xml on the master and regions server nodes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.master.loadbalancer.class</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix.hbase.index.balancer.IndexLoadBalancer</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.master.classes</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix.hbase.index.master.IndexMasterObserver</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.regionserver.classes</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.regionserver.LocalIndexMerger</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"The above properties are required to use local indexing."}),`
`,e.jsx(n.h3,{id:"upgrading-local-indexes-created-before-480",children:"Upgrading Local Indexes created before 4.8.0"}),`
`,e.jsxs(n.p,{children:["While upgrading the Phoenix to 4.8.0+ version at server remove above three local indexing related configurations from ",e.jsx(n.code,{children:"hbase-site.xml"})," if present. From client we are supporting both online(while initializing the connection from phoenix client of 4.8.0+ versions) and offline(using ",e.jsx(n.code,{children:"psql"})," tool) upgrade of local indexes created before 4.8.0. As part of upgrade we recreate the local indexes in ASYNC mode. After upgrade user need to build the indexes using ",e.jsx(n.a,{href:"/docs/features/secondary-indexes#index-population",children:"IndexTool"})]}),`
`,e.jsx(n.p,{children:"Following client side configuration used in the upgrade."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"phoenix.client.localIndexUpgrade"}),e.jsx(n.br,{}),`
`,"The value of it is true means online upgrade and false means offline upgrade.",e.jsx(n.br,{}),`
`,e.jsx(n.strong,{children:"Default: true"})]}),`
`]}),`
`,e.jsxs(n.p,{children:["Command to run offline upgrade using ",e.jsx(n.code,{children:"psql"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"psql"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zookeeper] -l"})]})})})}),`
`,e.jsx(n.h2,{id:"secondary-indexes-tuning",children:"Tuning"}),`
`,e.jsx(n.p,{children:"Out the box, indexing is pretty fast. However, to optimize for your particular environment and workload, there are several properties you can tune."}),`
`,e.jsxs(n.p,{children:["All the following parameters must be set in ",e.jsx(n.code,{children:"hbase-site.xml"})," - they are true for the entire cluster and all index tables, as well as across all regions on the same server (so, for instance, a single server would not write to too many different index tables at once)."]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"index.builder.threads.max"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Number of threads to used to build the index update from the primary table update"}),`
`,e.jsx(n.li,{children:"Increasing this value overcomes the bottleneck of reading the current row state from the underlying HRegion. Tuning this value too high will just bottleneck at the HRegion as it will not be able to handle too many concurrent scan requests as well as general thread-swapping concerns."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 10"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"index.builder.threads.keepalivetime"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Amount of time in seconds after we expire threads in the builder thread pool."}),`
`,e.jsx(n.li,{children:"Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 60"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"index.writer.threads.max"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Number of threads to use when writing to the target index tables."}),`
`,e.jsx(n.li,{children:"The first level of parallelization, on a per-table basis - it should roughly correspond to the number of index tables"}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 10"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"index.writer.threads.keepalivetime"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Amount of time in seconds after we expire threads in the writer thread pool."}),`
`,e.jsx(n.li,{children:"Unused threads are immediately released after this amount of time and not core threads are retained (though this last is a small concern as tables are expected to sustain a fairly constant write load), but simultaneously allows us to drop threads if we are not seeing the expected load."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 60"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"hbase.htable.threads.max"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Number of threads each index ",e.jsx(n.code,{children:"HTable"})," can use for writes."]}),`
`,e.jsx(n.li,{children:"Increasing this allows more concurrent index updates (for instance across batches), leading to high overall throughput."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 2,147,483,647"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"hbase.htable.threads.keepalivetime"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Amount of time in seconds after we expire threads in the ",e.jsx(n.code,{children:"HTable"}),"'s thread pool."]}),`
`,e.jsxs(n.li,{children:['Using the "direct handoff" approach, new threads will only be created if it is necessary and will grow unbounded. This could be bad but ',e.jsx(n.code,{children:"HTable"}),"s only create as many ",e.jsx(n.code,{children:"Runnable"}),"s as there are region servers; therefore, it also scales when new region servers are added."]}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 60"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"index.tablefactory.cache.size"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Number of index ",e.jsx(n.code,{children:"HTable"}),"s we should keep in cache."]}),`
`,e.jsxs(n.li,{children:["Increasing this number ensures that we do not need to recreate an ",e.jsx(n.code,{children:"HTable"})," for each attempt to write to an index table. Conversely, you could see memory pressure if this value is set too high."]}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 10"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"org.apache.phoenix.regionserver.index.priority.min"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Value to specify to bottom (inclusive) of the range in which index priority may lie."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 1000"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"org.apache.phoenix.regionserver.index.priority.max"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Value to specify to top (exclusive) of the range in which index priority may lie."}),`
`,e.jsx(n.li,{children:"Higher priorites within the index min/max range do not means updates are processed sooner."}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 1050"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"org.apache.phoenix.regionserver.index.handler.count"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Number of threads to use when serving index write requests for global index maintenance."}),`
`,e.jsxs(n.li,{children:["Though the actual number of threads is dictated by the Max(number of call queues, handler count), where the number of call queues is determined by standard HBase configuration. To further tune the queues, you can adjust the standard rpc queue length parameters (currently, there are no special knobs for the index queues), specifically ",e.jsx(n.code,{children:"ipc.server.max.callqueue.length"})," and ",e.jsx(n.code,{children:"ipc.server.callqueue.handler.factor"}),". See the ",e.jsx(n.a,{href:"https://hbase.apache.org/docs",children:"HBase Reference Guide"})," for more details."]}),`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"Default: 30"})}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"secondary-indexes-performance",children:"Performance"}),`
`,e.jsxs(n.p,{children:["We track secondary index performance via our ",e.jsx(n.a,{href:"http://phoenix-bin.github.io/client/performance/latest.htm",children:"performance framework"}),". This is a generic test of performance based on defaults - your results will vary based on hardware specs as well as you individual configuration."]}),`
`,e.jsx(n.p,{children:"That said, we have seen secondary indexing (both immutable and mutable) go as quickly as < 2x the regular write path on a small, (3 node) desktop-based cluster. This is actually pretty reasonable as we have to write to multiple tables as well as build the index update."}),`
`,e.jsx(n.h2,{id:"index-scrutiny-tool",children:"Index Scrutiny Tool"}),`
`,e.jsxs(n.p,{children:['With Phoenix 4.12, there is now a tool to run a MapReduce job to verify that an index table is valid against its data table. The only way to find orphaned rows in either table is to scan over all rows in the table and do a lookup in the other table for the corresponding row. For that reason, the tool can run with either the data or index table as the "source" table, and the other as the "target" table. The tool writes all invalid rows it finds either to file or to an output table ',e.jsx(n.code,{children:"PHOENIX_INDEX_SCRUTINY"}),". An invalid row is a source row that either has no corresponding row in the target table, or has an incorrect value in the target table (i.e. covered column value)."]}),`
`,e.jsxs(n.p,{children:["The tool has job counters that track its status. ",e.jsx(n.code,{children:"VALID_ROW_COUNT"}),", ",e.jsx(n.code,{children:"INVALID_ROW_COUNT"}),", ",e.jsx(n.code,{children:"BAD_COVERED_COL_VAL_COUNT"}),". Note that invalid rows - bad col val rows = number of orphaned rows. These counters are written to the table ",e.jsx(n.code,{children:"PHOENIX_INDEX_SCRUTINY_METADATA"}),", along with other job metadata."]}),`
`,e.jsxs(n.p,{children:["The Index Scrutiny Tool can be launched via the ",e.jsx(n.code,{children:"hbase"})," command (in ",e.jsx(n.code,{children:"hbase/bin"}),") as follows:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.phoenix.mapreduce.index.IndexScrutinyTool"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -dt"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_table"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -it"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_index"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -o"})]})})})}),`
`,e.jsx(n.p,{children:"It can also be run from Hadoop using either the phoenix-core or phoenix-server jar as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HADOOP_CLASSPATH"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mapredcp"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" phoenix-"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"versio"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"n"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"-server.jar"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.phoenix.mapreduce.index.IndexScrutinyTool"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -dt"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_table"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -it"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_index"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -o"})]})})})}),`
`,e.jsx(n.p,{children:"By default two mapreduce jobs are launched, one with the data table as the source table and one with the index table as the source table."}),`
`,e.jsx(n.p,{children:"The following parameters can be used with the Index Scrutiny Tool:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:e.jsx(n.em,{children:"Parameter"})}),e.jsx(n.th,{children:e.jsx(n.em,{children:"Description"})})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-dt,--data-table"}),e.jsx(n.td,{children:"Data table name (mandatory)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-it,--index-table"}),e.jsx(n.td,{children:"Index table name (mandatory)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-s,--schema"}),e.jsx(n.td,{children:"Phoenix schema name (optional)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-src,--source"}),e.jsx(n.td,{children:"DATA_TABLE_SOURCE, INDEX_TABLE_SOURCE, or BOTH. Defaults to BOTH"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-o,--output"}),e.jsx(n.td,{children:"Whether to output invalid rows. Off by default"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-of,--output-format"}),e.jsx(n.td,{children:"TABLE or FILE output format. Defaults to TABLE"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-om,--output-max"}),e.jsx(n.td,{children:"Maximum number of invalid rows to output per mapper. Defaults to 1M"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-op,--output-path"}),e.jsx(n.td,{children:"For FILE output format, the HDFS directory where files are written"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-t,--time"}),e.jsx(n.td,{children:"Timestamp in millis at which to run the scrutiny. This is important so that incoming writes don't throw off the scrutiny. Defaults to current time minus 60 seconds"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-b,--batch-size"}),e.jsx(n.td,{children:"Number of rows to compare at a time"})]})]})]}),`
`,e.jsx(n.h3,{id:"secondary-indexes-limitations",children:"Limitations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If rows are actively being updated or deleted while the scrutiny is running, the tool may give you false positives for inconsistencies (",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4277",children:"PHOENIX-4277"}),")."]}),`
`,e.jsxs(n.li,{children:["Snapshot reads are not supported by the scrutiny tool (",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4270",children:"PHOENIX-4270"}),")."]}),`
`]}),`
`,e.jsx(n.h2,{id:"index-upgrade-tool",children:"Index Upgrade Tool"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"IndexUpgradeTool"})," updates global indexes created by Phoenix 4.14 and earlier (or 5.0) to use the new Strongly Consistent Global Indexes implementation."]}),`
`,e.jsx(n.p,{children:"It accepts following parameters:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:e.jsx(n.em,{children:"Parameter"})}),e.jsx(n.th,{children:e.jsx(n.em,{children:"Description"})}),e.jsx(n.th,{children:e.jsx(n.em,{children:"only in version"})})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-o,--operation"}),e.jsxs(n.td,{children:[e.jsx(n.em,{children:"upgrade"})," or ",e.jsx(n.em,{children:"rollback"})," (mandatory)"]}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-tb,--tables"}),e.jsxs(n.td,{children:[e.jsx(n.em,{children:"[table1,table2,table3]"})," (-tb or -f mandatory)"]}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-f,--file"}),e.jsx(n.td,{children:"Csv file with above format (-tb or -f mandatory)"}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-d,--dry-run"}),e.jsx(n.td,{children:"If passed this will just output steps that will be executed; like a dry run"}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-h,--help"}),e.jsx(n.td,{children:"Help on how to use the tool"}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-lf,--logfile"}),e.jsx(n.td,{children:"File location to dump the logs"}),e.jsx(n.td,{})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-sr,--index-sync-rebuild"}),e.jsx(n.td,{children:"whether or not synchronously rebuild the indexes; default rebuild asynchronous"}),e.jsx(n.td,{children:"4.15"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-rb,--index-rebuild"}),e.jsx(n.td,{children:"Rebuild the indexes. Set -tool to pass options to IndexTool"}),e.jsx(n.td,{children:"4.16+, 5.1+"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-tool,--index-tool"}),e.jsx(n.td,{children:"Options to pass to indexTool when rebuilding indexes"}),e.jsx(n.td,{children:"4.16+, 5.1+"})]})]})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"${HBASE_HOME}/bin/hbase org.apache.phoenix.mapreduce.index.IndexUpgradeTool -o [upgrade/rollback] -tb [table_name] -lf [/tmp/index-upgrade-tool.log]"})})})})}),`
`,e.jsx(n.p,{children:"For 4.16+/5.1+ either specifying the -rb option, or manually rebuilding the indexes with IndexTool after the upgrade is recommended, otherwise the first access of every index row will trigger an index row repair."}),`
`,e.jsxs(n.p,{children:["Depending on whether index is mutable, it will remove ",e.jsx(n.em,{children:"Indexer"})," coprocessor from a data table and load new coprocessor ",e.jsx(n.em,{children:"IndexRegionObserver"}),". For both immutable and mutable, it will load ",e.jsx(n.em,{children:"GlobalIndexChecker"})," coprocessor on Index table. During this process, data table and index table are ",e.jsx(n.em,{children:"disabled-loaded/unloaded with coproc-enabled"})," within short time span. At the end, it does an asynchronous index rebuilds. Index reads are not blocked while index-rebuild is still ongoing, however, they may be a bit slower for rows written prior to upgrade."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"IndexUpgradeTool"})," doesn't make any distinction between view-index and table-index. When a table is passed, it will perform the upgrade-operation on all the 'children' indexes of the given table."]}),`
`,e.jsx(n.h2,{id:"secondary-indexes-resources",children:"Resources"}),`
`,e.jsx(n.p,{children:"There have been several presentations given on how secondary indexing works in Phoenix that have a more in-depth look at how indexing works (with pretty pictures!):"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://www.slideshare.net/YugabyteDB/strongly-consistent-global-indexes-for-apache-phoenix-176863877",children:"Slides for Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://vimeo.com/362358494",children:"Recording of Strongly Consistent Global Indexes for Apache Phoenix, 2019 Distributed SQL Summit"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://www.slideshare.net/rajeshbabuchintaguntla/local-secondary-indexes-in-apache-phoenix",children:"Slides for Local Secondary Indexes in Apache Phoenix, 2017 PhoenixCon"})}),`
`]}),`
`,e.jsx(n.p,{children:"These older resources refer to obsolete implementations in some cases"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"http://www.slideshare.net/jesse_yates/phoenix-secondary-indexing-la-hug-sept-9th-2013",children:"Los Anglees HBase Meetup"})," - Sept, 4th, 2013"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://github.com/Huawei-Hadoop/hindex/blob/master/README.md#how-it-works",children:"Local Indexes"})," by Huawei"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-938",children:"PHOENIX-938"})," and ",e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-11513",children:"HBASE-11513"})," for deadlock prevention during global index maintenance."]}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1112",children:"PHOENIX-1112: Atomically rebuild index partially when index update fails"})}),`
`]})]})}function h(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{s as _markdown,h as default,o as extractedReferences,r as frontmatter,l as structuredData,d as toc};
