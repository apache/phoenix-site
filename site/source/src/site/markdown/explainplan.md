# Explain Plan

An `EXPLAIN` plan tells you a lot about how a query will be run:

* All the HBase range queries that will be executed
* An estimate of the number of bytes that will be scanned
* An estimate of the number of rows that will be traversed
* Time at which the above estimate information was collected
* Which HBase table will be used for each scan
* Which operations (sort, merge, scan, limit) are executed on the client versus the server

Use an `EXPLAIN` plan to check how a query will run, and consider rewriting queries to meet the following goals:

* Emphasize operations on the server rather than the client. Server operations are distributed across the cluster and operate in parallel, while client operations execute within the single client JDBC driver.
* Use `RANGE SCAN` or `SKIP SCAN` whenever possible rather than `TABLE SCAN`.
* Filter against leading columns in the primary key constraint.  This assumes you have designed the primary key to lead with frequently-accessed or frequently-filtered columns as described in “Primary Keys,” above.
* If necessary, introduce a local index or a global index that covers your query.
* If you have an index that covers your query but the optimizer is not detecting it, try hinting the query:
    `SELECT /*+ INDEX() */ …`

See also:
http://phoenix.apache.org/language/index.html#explain

### Anatomy of an Explain Plan

An explain plan consists of lines of text that describe operations that Phoenix will perform during a query, using the following terms:

* `AGGREGATE INTO ORDERED DISTINCT ROWS`—aggregates the returned rows using an operation such as addition. When `ORDERED` is used, the `GROUP BY` operation is applied to the leading part of the primary key constraint, which allows the aggregation to be done in place rather than keeping all distinct groups in memory on the server side.
* `AGGREGATE INTO SINGLE ROW`—aggregates the results into a single row using an aggregate function with no `GROUP BY` clause. For example, the `count()` statement returns one row with the total number of rows that match the query.
* `CLIENT`—the operation will be performed on the client side. It's faster to perform most operations on the server side, so you should consider whether there's a way to rewrite the query to give the server more of the work to do.
* `FILTER BY` expression—returns only results that match the expression.
* `FULL SCAN OVER` tableName—the operation will scan every row in the specified table.
* `INNER-JOIN`—the operation will join multiple tables on rows where the join condition is met.
* `MERGE SORT`—performs a merge sort on the results.
* `RANGE SCAN OVER` tableName `[` ... `]`—The information in the square brackets indicates the start and stop for each primary key that's used in the query.
* `ROUND ROBIN`—when the query doesn't contain `ORDER BY` and therefore the rows can be returned in any order, `ROUND ROBIN` order maximizes parallelization on the client side.
* x`-CHUNK`—describes how many threads will be used for the operation. The maximum parallelism is limited to the number of threads in thread pool. The minimum parallelization corresponds to the number of regions the table has between the start and stop rows of the scan. The number of chunks will increase with a lower guidepost width, as there is more than one chunk per region.
* `PARALLEL `x-`WAY`—describes how many parallel scans will be merge sorted during the operation.
* `SERIAL`—some queries run serially. For example, a single row lookup or a query that filters on the leading part of the primary key and limits the results below a configurable threshold.
* `EST_BYTES_READ` - provides an estimate of the total number of bytes that will be scanned as part of executing the query
* `EST_ROWS_READ` - provides an estimate of the total number of rows that will be scanned as part of executing the query
* `EST_INFO_TS` - epoch time in milliseconds at which the estimate information was collected
 
### Example

```

+-----------------------------------------------------------------------------------------------------------------------------------
|                                            PLAN                                 | EST_BYTES_READ  | EST_ROWS_READ  | EST_INFO_TS  |
+-----------------------------------------------------------------------------------------------------------------------------------
| CLIENT 36-CHUNK 237878 ROWS 6787437019 BYTES PARALLEL 36-WAY FULL SCAN
| OVER exDocStoreb                                                                |     237878      |   6787437019   | 1510353318102|
|   PARALLEL INNER-JOIN TABLE 0 (SKIP MERGE)                                      |     237878      |   6787437019   | 1510353318102|
|     CLIENT 36-CHUNK PARALLEL 36-WAY RANGE SCAN OVER indx_exdocb 
|      [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bf'] 
|      - [0,' 42ecf4abd4bd7e7606025dc8eee3de 6a3cc04418cbc2619ddc01f54d88d7 c3bg' |     237878      |   6787437019   | 1510353318102|
|       SERVER FILTER BY FIRST KEY ONLY                                           |     237878      |   6787437019   | 1510353318102|
|       SERVER AGGREGATE INTO ORDERED DISTINCT ROWS BY ["ID"]                     |     237878      |   6787437019   | 1510353318102|
|     CLIENT MERGE SORT                                                           |     237878      |   6787437019   | 1510353318102|
|   DYNAMIC SERVER FILTER BY (A.CURRENT_TIMESTAMP, [A.ID](http://a.id/)) 
    IN ((TMP.MCT, TMP.TID))                                                       |     237878      |   6787437019   | 1510353318102|
+-----------------------------------------------------------------------------------------------------------------------------------
```

### JDBC Explain Plan API and the estimates information

The information displayed in the explain plan API can also be accessed programmatically through the standard JDBC interfaces. When statistics collection
is enabled for a table, the explain plan also gives an estimate of number of rows and bytes a query is going to scan. To get hold of the info, you can
use corresponding columns in the result set returned by the explain plan statement. When stats collection is not enabled or if for some reason
Phoenix cannot provide the estimate information, the columns return null. Below is an example:

```
String explainSql = "EXPLAIN SELECT * FROM T";
Long estimatedBytes = null;
Long estimatedRows = null;
Long estimateInfoTs = null;
try (Statement statement = conn.createStatement(explainSql)) {
        int paramIdx = 1;
        ResultSet rs = statement.executeQuery(explainSql);
        rs.next();
        estimatedBytes =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_BYTES_READ_COLUMN);
        estimatedRows =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATED_ROWS_READ_COLUMN);
        estimateInfoTs =
                (Long) rs.getObject(PhoenixRuntime.EXPLAIN_PLAN_ESTIMATE_INFO_TS_COLUMN);
}
```

