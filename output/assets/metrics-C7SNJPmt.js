import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`Phoenix surfaces various metrics that provide an insight into what is going on within the Phoenix client as it is executing various SQL statements. These metrics are collected within the client JVM in two ways:

* **Request level metrics** - collected at an individual SQL statement level
* **Global metrics** - collected at the client JVM level

Request level metrics are helpful for figuring out at a more granular level about the amount of work done by every SQL statement executed by Phoenix. These metrics can be classified into three categories:

## Request-level metrics

### Mutation metrics

* \`MUTATION_BATCH_SIZE\` - Batch sizes of mutations
* \`MUTATION_BYTES\` - Size of mutations in bytes
* \`MUTATION_COMMIT_TIME\` - Time it took to commit mutations

### Scan task metrics

* \`NUM_PARALLEL_SCANS\` - Number of scans executed in parallel
* \`SCAN_BYTES\` - Number of bytes read by scans
* \`MEMORY_CHUNK_BYTES\` - Number of bytes allocated by the memory manager
* \`MEMORY_WAIT_TIME\` - Time in milliseconds threads needed to wait for memory to be allocated through memory manager
* \`SPOOL_FILE_SIZE\` - Size of spool files created in bytes
* \`SPOOL_FILE_COUNTER\` - Number of spool files created
* \`CACHE_REFRESH_SPLITS_COUNTER\` - Number of times Phoenix's metadata cache was refreshed because of splits
* \`TASK_QUEUE_WAIT_TIME\` - Time in milliseconds tasks had to wait in the queue of the thread pool executor
* \`TASK_END_TO_END_TIME\` - Time in milliseconds spent by tasks from creation to completion
* \`TASK_EXECUTION_TIME\` - Time in milliseconds tasks took to execute
* \`TASK_EXECUTED_COUNTER\` - Counter for number of tasks submitted to the thread pool executor
* \`TASK_REJECTED_COUNTER\` - Counter for number of tasks that were rejected by the thread pool executor

### Overall query metrics

* \`QUERY_TIMEOUT_COUNTER\` - Number of times query timed out
* \`QUERY_FAILED_COUNTER\` - Number of times query failed
* \`WALL_CLOCK_TIME_MS\` - Wall clock time elapsed for the overall query execution
* \`RESULT_SET_TIME_MS\` - Wall clock time elapsed for reading all records using \`resultSet.next()\`

## How to use SQL statement-level metrics

* Log and report query execution details which could be later used for analysis.
* Report top SQL queries by duration. Metric to use: \`WALL_CLOCK_TIME_MS\`.
* Check if the query is failing because it is timing out. Metric to use: \`QUERY_TIMEOUT_COUNTER > 0\`.
* Monitor the amount of bytes being written to or read from HBase for a SQL statement. Metrics to use: \`MUTATION_BYTES\` and \`SCAN_BYTES\`.
* Check if the query is doing too much work or needs tuning. Possible metrics to use: \`TASK_EXECUTED_COUNTER\`, \`TASK_QUEUE_WAIT_TIME\`, \`WALL_CLOCK_TIME_MS\`.
* Check if a successful query is facing thread starvation, i.e., number of threads in the thread pool likely needs to be increased. This is characterized by a relatively large difference between \`TASK_EXECUTION_TIME\` and \`TASK_END_TO_END_TIME\`.

Request level metrics can be turned on/off for every Phoenix JDBC connection. Below is an example of how you can do that:

\`\`\`java
Properties props = new Properties();
props.setProperty(QueryServices.COLLECT_REQUEST_LEVEL_METRICS, "true");
try (Connection conn = DriverManager.getConnection(getUrl(), props)) {
    // ...
}
\`\`\`

A typical pattern for how one could get hold of read metrics for queries:

\`\`\`java
Map<String, Map<String, Long>> overAllQueryMetrics = null;
Map<String, Map<String, Long>> requestReadMetrics = null;
try (ResultSet rs = stmt.executeQuery()) {
    while (rs.next()) {
        // ...
    }
    overAllQueryMetrics = PhoenixRuntime.getOverAllReadRequestMetrics(rs);
    requestReadMetrics = PhoenixRuntime.getRequestReadMetrics(rs);
    // log or report metrics as needed
    PhoenixRuntime.resetMetrics(rs);
}
\`\`\`

One could also get hold of write related metrics (collected per table) for DML statements by doing something like this:

\`\`\`java
Map<String, Map<String, Long>> mutationWriteMetrics = null;
Map<String, Map<String, Long>> mutationReadMetrics = null;
try (Connection conn = DriverManager.getConnection(url)) {
    conn.createStatement().executeUpdate(dml1);
    // ...
    conn.createStatement().executeUpdate(dml2);
    // ...
    conn.createStatement().executeUpdate(dml3);
    // ...
    conn.commit();
    mutationWriteMetrics = PhoenixRuntime.getWriteMetricsForMutationsSinceLastReset(conn);
    mutationReadMetrics = PhoenixRuntime.getReadMetricsForMutationsSinceLastReset(conn);
    PhoenixRuntime.resetMetrics(conn);
}
\`\`\`

Global metrics on the other hand are collected at the Phoenix client’s JVM level. These metrics could be used for building out a trend and seeing what is going on within Phoenix from client’s perspective over time. Other than the metrics reported above for request level metrics, the global metrics also includes the following counters:

* \`MUTATION_SQL_COUNTER\` - Counter for number of mutation SQL statements
* \`SELECT_SQL_COUNTER\` - Counter for number of SQL queries
* \`OPEN_PHOENIX_CONNECTIONS_COUNTER\` - Number of open Phoenix connections

Global metrics could be helpful in monitoring and tuning various aspects of the execution environment. For example: an increase in \`TASK_REJECTED_COUNTER\` is probably a symptom of too much work being submitted, or that the Phoenix thread pool queue depth or number of threads (or both) needs to be increased. Similarly, a spike in \`TASK_EXECUTION_TIME\` for a time frame could be symptomatic of several things including overloaded region servers, a network glitch, or client/region servers undergoing garbage collection.

Collection of global client metrics can be turned on/off (on by default) by setting the attribute phoenix.query.global.metrics.enabled to true/false in the client side hbase-site.xml.
Below is a code snippet showing how to log/report global metrics by using a scheduled job that runs periodically:

\`\`\`java
ScheduledExecutorService service = Executors.newScheduledThreadPool(1);
service.submit(new Runnable() {
    @Override
    public void run() {
        Collection<GlobalMetric> metrics = PhoenixRuntime.getGlobalPhoenixClientMetrics();
        for (GlobalMetric m : metrics) {
            // log or report for trending purposes
        }
    }
});
\`\`\`

## Scan latency metrics

Phoenix 5.3.1 surfaces HBase's per-scan latency and IO metrics through the
request-level metrics API, giving per-query visibility into where a scan
actually spent its time
([PHOENIX-7704](https://issues.apache.org/jira/browse/PHOENIX-7704)).

| Metric                       | Description                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| \`FS_READ_TIME\`               | Time (ms) spent in the underlying filesystem (HDFS/S3) for HFile reads.     |
| \`BYTES_READ_FROM_FS\`         | Bytes read from the filesystem — cold reads that missed HBase block cache.  |
| \`BYTES_READ_FROM_MEMSTORE\`   | Bytes read from memstore — un-flushed cells.                                |
| \`BYTES_READ_FROM_BLOCKCACHE\` | Bytes served from the HBase block cache — warm reads.                       |
| \`BLOCK_READ_OPS_COUNT\`       | Number of HFile blocks read from filesystem (HDFS/S3).                      |
| \`RPC_SCAN_PROCESSING_TIME\`   | Time (ms) the RegionServer spent processing the scan RPC in handler thread. |
| \`RPC_SCAN_QUEUE_WAIT_TIME\`   | Time (ms) the scan RPC spent in the RegionServer's call queue.              |

These are request-level metrics — they appear in the per-table map returned by
\`PhoenixRuntime.getRequestReadMetricInfo(rs)\` alongside the existing entries:

\`\`\`java
try (ResultSet rs = stmt.executeQuery(sql)) {
    while (rs.next()) {
        // ...
    }
    Map<String, Map<MetricType, Long>> readMetrics =
            PhoenixRuntime.getRequestReadMetricInfo(rs);
    long fsReadMs = readMetrics.get(tableName).get(MetricType.FS_READ_TIME);
    long blocksRead = readMetrics.get(tableName).get(MetricType.BLOCK_READ_OPS_COUNT);
    // ...
}
\`\`\`

They piggyback on \`phoenix.trace.read.metrics.enabled\` (the existing
request-level metrics switch, on by default) and require no additional
configuration. Values originate from HBase 2.6.4+; on older HBase versions
they are silently zero.

## Top-N slowest parallel scans

For diagnosing tail-latency on a single statement issuing multiple HBase scans, Phoenix can retain the
top-N slowest scan paths it issued while executing a query — useful when a
query fans out across many regions and you want to find the worst few
([PHOENIX-7729](https://issues.apache.org/jira/browse/PHOENIX-7729)).

### Enabling

Off by default. Set the count to a positive number on the connection
(\`Properties\`) or globally in \`hbase-site.xml\`:

| Property                                 | Default | Description                                                                                                                      |
| ---------------------------------------- | ------: | -------------------------------------------------------------------------------------------------------------------------------- |
| \`phoenix.slowest.scan.metrics.count\`     |     \`0\` | N — number of slowest scans to retain. \`0\` disables the feature.                                                                 |
| \`phoenix.scan.metrics.by.region.enabled\` | \`false\` | When \`true\` (and \`count > 0\`), the per-scan record also carries the region name and serving RegionServer. Requires HBase 2.6.3+. |

Request-level metrics (\`phoenix.trace.read.metrics.enabled\`) must also be on,
which is the default.

### Retrieving the result

\`PhoenixRuntime.getTopNSlowestScanMetrics(rs)\` returns the slowest scan paths
seen while executing the query, as a list of JSON-object lists — one outer
entry per slow scan path, one inner entry per HBase table touched on that
path. Forward to your telemetry sink as needed.

\`\`\`java
try (ResultSet rs = stmt.executeQuery(sql)) {
    while (rs.next()) {
        // ...
    }
    List<List<JsonObject>> slowest = PhoenixRuntime.getTopNSlowestScanMetrics(rs);
    for (List<JsonObject> path : slowest) {
        for (JsonObject scan : path) {
            log.info("slow scan on {}: {}", scan.get("table"), scan);
        }
    }
}
\`\`\`
`,r={title:"Metrics",description:"Request-level and global Phoenix client metrics, with practical usage patterns and Java examples."},h=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7704"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7729"}],a={contents:[{heading:void 0,content:"Phoenix surfaces various metrics that provide an insight into what is going on within the Phoenix client as it is executing various SQL statements. These metrics are collected within the client JVM in two ways:"},{heading:void 0,content:"Request level metrics - collected at an individual SQL statement level"},{heading:void 0,content:"Global metrics - collected at the client JVM level"},{heading:void 0,content:"Request level metrics are helpful for figuring out at a more granular level about the amount of work done by every SQL statement executed by Phoenix. These metrics can be classified into three categories:"},{heading:"mutation-metrics",content:"MUTATION_BATCH_SIZE - Batch sizes of mutations"},{heading:"mutation-metrics",content:"MUTATION_BYTES - Size of mutations in bytes"},{heading:"mutation-metrics",content:"MUTATION_COMMIT_TIME - Time it took to commit mutations"},{heading:"scan-task-metrics",content:"NUM_PARALLEL_SCANS - Number of scans executed in parallel"},{heading:"scan-task-metrics",content:"SCAN_BYTES - Number of bytes read by scans"},{heading:"scan-task-metrics",content:"MEMORY_CHUNK_BYTES - Number of bytes allocated by the memory manager"},{heading:"scan-task-metrics",content:"MEMORY_WAIT_TIME - Time in milliseconds threads needed to wait for memory to be allocated through memory manager"},{heading:"scan-task-metrics",content:"SPOOL_FILE_SIZE - Size of spool files created in bytes"},{heading:"scan-task-metrics",content:"SPOOL_FILE_COUNTER - Number of spool files created"},{heading:"scan-task-metrics",content:"CACHE_REFRESH_SPLITS_COUNTER - Number of times Phoenix's metadata cache was refreshed because of splits"},{heading:"scan-task-metrics",content:"TASK_QUEUE_WAIT_TIME - Time in milliseconds tasks had to wait in the queue of the thread pool executor"},{heading:"scan-task-metrics",content:"TASK_END_TO_END_TIME - Time in milliseconds spent by tasks from creation to completion"},{heading:"scan-task-metrics",content:"TASK_EXECUTION_TIME - Time in milliseconds tasks took to execute"},{heading:"scan-task-metrics",content:"TASK_EXECUTED_COUNTER - Counter for number of tasks submitted to the thread pool executor"},{heading:"scan-task-metrics",content:"TASK_REJECTED_COUNTER - Counter for number of tasks that were rejected by the thread pool executor"},{heading:"overall-query-metrics",content:"QUERY_TIMEOUT_COUNTER - Number of times query timed out"},{heading:"overall-query-metrics",content:"QUERY_FAILED_COUNTER - Number of times query failed"},{heading:"overall-query-metrics",content:"WALL_CLOCK_TIME_MS - Wall clock time elapsed for the overall query execution"},{heading:"overall-query-metrics",content:"RESULT_SET_TIME_MS - Wall clock time elapsed for reading all records using resultSet.next()"},{heading:"how-to-use-sql-statement-level-metrics",content:"Log and report query execution details which could be later used for analysis."},{heading:"how-to-use-sql-statement-level-metrics",content:"Report top SQL queries by duration. Metric to use: WALL_CLOCK_TIME_MS."},{heading:"how-to-use-sql-statement-level-metrics",content:"Check if the query is failing because it is timing out. Metric to use: QUERY_TIMEOUT_COUNTER > 0."},{heading:"how-to-use-sql-statement-level-metrics",content:"Monitor the amount of bytes being written to or read from HBase for a SQL statement. Metrics to use: MUTATION_BYTES and SCAN_BYTES."},{heading:"how-to-use-sql-statement-level-metrics",content:"Check if the query is doing too much work or needs tuning. Possible metrics to use: TASK_EXECUTED_COUNTER, TASK_QUEUE_WAIT_TIME, WALL_CLOCK_TIME_MS."},{heading:"how-to-use-sql-statement-level-metrics",content:"Check if a successful query is facing thread starvation, i.e., number of threads in the thread pool likely needs to be increased. This is characterized by a relatively large difference between TASK_EXECUTION_TIME and TASK_END_TO_END_TIME."},{heading:"how-to-use-sql-statement-level-metrics",content:"Request level metrics can be turned on/off for every Phoenix JDBC connection. Below is an example of how you can do that:"},{heading:"how-to-use-sql-statement-level-metrics",content:"A typical pattern for how one could get hold of read metrics for queries:"},{heading:"how-to-use-sql-statement-level-metrics",content:"One could also get hold of write related metrics (collected per table) for DML statements by doing something like this:"},{heading:"how-to-use-sql-statement-level-metrics",content:"Global metrics on the other hand are collected at the Phoenix client’s JVM level. These metrics could be used for building out a trend and seeing what is going on within Phoenix from client’s perspective over time. Other than the metrics reported above for request level metrics, the global metrics also includes the following counters:"},{heading:"how-to-use-sql-statement-level-metrics",content:"MUTATION_SQL_COUNTER - Counter for number of mutation SQL statements"},{heading:"how-to-use-sql-statement-level-metrics",content:"SELECT_SQL_COUNTER - Counter for number of SQL queries"},{heading:"how-to-use-sql-statement-level-metrics",content:"OPEN_PHOENIX_CONNECTIONS_COUNTER - Number of open Phoenix connections"},{heading:"how-to-use-sql-statement-level-metrics",content:"Global metrics could be helpful in monitoring and tuning various aspects of the execution environment. For example: an increase in TASK_REJECTED_COUNTER is probably a symptom of too much work being submitted, or that the Phoenix thread pool queue depth or number of threads (or both) needs to be increased. Similarly, a spike in TASK_EXECUTION_TIME for a time frame could be symptomatic of several things including overloaded region servers, a network glitch, or client/region servers undergoing garbage collection."},{heading:"how-to-use-sql-statement-level-metrics",content:`Collection of global client metrics can be turned on/off (on by default) by setting the attribute phoenix.query.global.metrics.enabled to true/false in the client side hbase-site.xml.
Below is a code snippet showing how to log/report global metrics by using a scheduled job that runs periodically:`},{heading:"scan-latency-metrics",content:`Phoenix 5.3.1 surfaces HBase's per-scan latency and IO metrics through the
request-level metrics API, giving per-query visibility into where a scan
actually spent its time
(PHOENIX-7704).`},{heading:"scan-latency-metrics",content:"Metric"},{heading:"scan-latency-metrics",content:"Description"},{heading:"scan-latency-metrics",content:"FS_READ_TIME"},{heading:"scan-latency-metrics",content:"Time (ms) spent in the underlying filesystem (HDFS/S3) for HFile reads."},{heading:"scan-latency-metrics",content:"BYTES_READ_FROM_FS"},{heading:"scan-latency-metrics",content:"Bytes read from the filesystem — cold reads that missed HBase block cache."},{heading:"scan-latency-metrics",content:"BYTES_READ_FROM_MEMSTORE"},{heading:"scan-latency-metrics",content:"Bytes read from memstore — un-flushed cells."},{heading:"scan-latency-metrics",content:"BYTES_READ_FROM_BLOCKCACHE"},{heading:"scan-latency-metrics",content:"Bytes served from the HBase block cache — warm reads."},{heading:"scan-latency-metrics",content:"BLOCK_READ_OPS_COUNT"},{heading:"scan-latency-metrics",content:"Number of HFile blocks read from filesystem (HDFS/S3)."},{heading:"scan-latency-metrics",content:"RPC_SCAN_PROCESSING_TIME"},{heading:"scan-latency-metrics",content:"Time (ms) the RegionServer spent processing the scan RPC in handler thread."},{heading:"scan-latency-metrics",content:"RPC_SCAN_QUEUE_WAIT_TIME"},{heading:"scan-latency-metrics",content:"Time (ms) the scan RPC spent in the RegionServer's call queue."},{heading:"scan-latency-metrics",content:`These are request-level metrics — they appear in the per-table map returned by
PhoenixRuntime.getRequestReadMetricInfo(rs) alongside the existing entries:`},{heading:"scan-latency-metrics",content:`They piggyback on phoenix.trace.read.metrics.enabled (the existing
request-level metrics switch, on by default) and require no additional
configuration. Values originate from HBase 2.6.4+; on older HBase versions
they are silently zero.`},{heading:"top-n-slowest-scans",content:`For diagnosing tail-latency on a single statement issuing multiple HBase scans, Phoenix can retain the
top-N slowest scan paths it issued while executing a query — useful when a
query fans out across many regions and you want to find the worst few
(PHOENIX-7729).`},{heading:"enabling",content:`Off by default. Set the count to a positive number on the connection
(Properties) or globally in hbase-site.xml:`},{heading:"enabling",content:"Property"},{heading:"enabling",content:"Default"},{heading:"enabling",content:"Description"},{heading:"enabling",content:"phoenix.slowest.scan.metrics.count"},{heading:"enabling",content:"0"},{heading:"enabling",content:"N — number of slowest scans to retain. 0 disables the feature."},{heading:"enabling",content:"phoenix.scan.metrics.by.region.enabled"},{heading:"enabling",content:"false"},{heading:"enabling",content:"When true (and count > 0), the per-scan record also carries the region name and serving RegionServer. Requires HBase 2.6.3+."},{heading:"enabling",content:`Request-level metrics (phoenix.trace.read.metrics.enabled) must also be on,
which is the default.`},{heading:"retrieving-the-result",content:`PhoenixRuntime.getTopNSlowestScanMetrics(rs) returns the slowest scan paths
seen while executing the query, as a list of JSON-object lists — one outer
entry per slow scan path, one inner entry per HBase table touched on that
path. Forward to your telemetry sink as needed.`}],headings:[{id:"request-level-metrics",content:"Request-level metrics"},{id:"mutation-metrics",content:"Mutation metrics"},{id:"scan-task-metrics",content:"Scan task metrics"},{id:"overall-query-metrics",content:"Overall query metrics"},{id:"how-to-use-sql-statement-level-metrics",content:"How to use SQL statement-level metrics"},{id:"scan-latency-metrics",content:"Scan latency metrics"},{id:"top-n-slowest-scans",content:"Top-N slowest parallel scans"},{id:"enabling",content:"Enabling"},{id:"retrieving-the-result",content:"Retrieving the result"}]};const c=[{depth:2,url:"#request-level-metrics",title:e.jsx(e.Fragment,{children:"Request-level metrics"})},{depth:3,url:"#mutation-metrics",title:e.jsx(e.Fragment,{children:"Mutation metrics"})},{depth:3,url:"#scan-task-metrics",title:e.jsx(e.Fragment,{children:"Scan task metrics"})},{depth:3,url:"#overall-query-metrics",title:e.jsx(e.Fragment,{children:"Overall query metrics"})},{depth:2,url:"#how-to-use-sql-statement-level-metrics",title:e.jsx(e.Fragment,{children:"How to use SQL statement-level metrics"})},{depth:2,url:"#scan-latency-metrics",title:e.jsx(e.Fragment,{children:"Scan latency metrics"})},{depth:2,url:"#top-n-slowest-scans",title:e.jsx(e.Fragment,{children:"Top-N slowest parallel scans"})},{depth:3,url:"#enabling",title:e.jsx(e.Fragment,{children:"Enabling"})},{depth:3,url:"#retrieving-the-result",title:e.jsx(e.Fragment,{children:"Retrieving the result"})}];function n(s){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Phoenix surfaces various metrics that provide an insight into what is going on within the Phoenix client as it is executing various SQL statements. These metrics are collected within the client JVM in two ways:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Request level metrics"})," - collected at an individual SQL statement level"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Global metrics"})," - collected at the client JVM level"]}),`
`]}),`
`,e.jsx(i.p,{children:"Request level metrics are helpful for figuring out at a more granular level about the amount of work done by every SQL statement executed by Phoenix. These metrics can be classified into three categories:"}),`
`,e.jsx(i.h2,{id:"request-level-metrics",children:"Request-level metrics"}),`
`,e.jsx(i.h3,{id:"mutation-metrics",children:"Mutation metrics"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MUTATION_BATCH_SIZE"})," - Batch sizes of mutations"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MUTATION_BYTES"})," - Size of mutations in bytes"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MUTATION_COMMIT_TIME"})," - Time it took to commit mutations"]}),`
`]}),`
`,e.jsx(i.h3,{id:"scan-task-metrics",children:"Scan task metrics"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"NUM_PARALLEL_SCANS"})," - Number of scans executed in parallel"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SCAN_BYTES"})," - Number of bytes read by scans"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MEMORY_CHUNK_BYTES"})," - Number of bytes allocated by the memory manager"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MEMORY_WAIT_TIME"})," - Time in milliseconds threads needed to wait for memory to be allocated through memory manager"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SPOOL_FILE_SIZE"})," - Size of spool files created in bytes"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SPOOL_FILE_COUNTER"})," - Number of spool files created"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"CACHE_REFRESH_SPLITS_COUNTER"})," - Number of times Phoenix's metadata cache was refreshed because of splits"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"TASK_QUEUE_WAIT_TIME"})," - Time in milliseconds tasks had to wait in the queue of the thread pool executor"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"TASK_END_TO_END_TIME"})," - Time in milliseconds spent by tasks from creation to completion"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"TASK_EXECUTION_TIME"})," - Time in milliseconds tasks took to execute"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"TASK_EXECUTED_COUNTER"})," - Counter for number of tasks submitted to the thread pool executor"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"TASK_REJECTED_COUNTER"})," - Counter for number of tasks that were rejected by the thread pool executor"]}),`
`]}),`
`,e.jsx(i.h3,{id:"overall-query-metrics",children:"Overall query metrics"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"QUERY_TIMEOUT_COUNTER"})," - Number of times query timed out"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"QUERY_FAILED_COUNTER"})," - Number of times query failed"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"WALL_CLOCK_TIME_MS"})," - Wall clock time elapsed for the overall query execution"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"RESULT_SET_TIME_MS"})," - Wall clock time elapsed for reading all records using ",e.jsx(i.code,{children:"resultSet.next()"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"how-to-use-sql-statement-level-metrics",children:"How to use SQL statement-level metrics"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Log and report query execution details which could be later used for analysis."}),`
`,e.jsxs(i.li,{children:["Report top SQL queries by duration. Metric to use: ",e.jsx(i.code,{children:"WALL_CLOCK_TIME_MS"}),"."]}),`
`,e.jsxs(i.li,{children:["Check if the query is failing because it is timing out. Metric to use: ",e.jsx(i.code,{children:"QUERY_TIMEOUT_COUNTER > 0"}),"."]}),`
`,e.jsxs(i.li,{children:["Monitor the amount of bytes being written to or read from HBase for a SQL statement. Metrics to use: ",e.jsx(i.code,{children:"MUTATION_BYTES"})," and ",e.jsx(i.code,{children:"SCAN_BYTES"}),"."]}),`
`,e.jsxs(i.li,{children:["Check if the query is doing too much work or needs tuning. Possible metrics to use: ",e.jsx(i.code,{children:"TASK_EXECUTED_COUNTER"}),", ",e.jsx(i.code,{children:"TASK_QUEUE_WAIT_TIME"}),", ",e.jsx(i.code,{children:"WALL_CLOCK_TIME_MS"}),"."]}),`
`,e.jsxs(i.li,{children:["Check if a successful query is facing thread starvation, i.e., number of threads in the thread pool likely needs to be increased. This is characterized by a relatively large difference between ",e.jsx(i.code,{children:"TASK_EXECUTION_TIME"})," and ",e.jsx(i.code,{children:"TASK_END_TO_END_TIME"}),"."]}),`
`]}),`
`,e.jsx(i.p,{children:"Request level metrics can be turned on/off for every Phoenix JDBC connection. Below is an example of how you can do that:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Properties props "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Properties"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(QueryServices.COLLECT_REQUEST_LEVEL_METRICS, "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), props)) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.p,{children:"A typical pattern for how one could get hold of read metrics for queries:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> overAllQueryMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> requestReadMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (ResultSet rs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    overAllQueryMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getOverAllReadRequestMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rs);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    requestReadMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRequestReadMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rs);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // log or report metrics as needed"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"resetMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rs);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.p,{children:"One could also get hold of write related metrics (collected per table) for DML statements by doing something like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> mutationWriteMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> mutationReadMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(url)) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(dml1);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(dml2);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createStatement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeUpdate"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(dml3);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    conn."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"commit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mutationWriteMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getWriteMetricsForMutationsSinceLastReset"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conn);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mutationReadMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getReadMetricsForMutationsSinceLastReset"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conn);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"resetMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(conn);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.p,{children:"Global metrics on the other hand are collected at the Phoenix client’s JVM level. These metrics could be used for building out a trend and seeing what is going on within Phoenix from client’s perspective over time. Other than the metrics reported above for request level metrics, the global metrics also includes the following counters:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"MUTATION_SQL_COUNTER"})," - Counter for number of mutation SQL statements"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SELECT_SQL_COUNTER"})," - Counter for number of SQL queries"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"OPEN_PHOENIX_CONNECTIONS_COUNTER"})," - Number of open Phoenix connections"]}),`
`]}),`
`,e.jsxs(i.p,{children:["Global metrics could be helpful in monitoring and tuning various aspects of the execution environment. For example: an increase in ",e.jsx(i.code,{children:"TASK_REJECTED_COUNTER"})," is probably a symptom of too much work being submitted, or that the Phoenix thread pool queue depth or number of threads (or both) needs to be increased. Similarly, a spike in ",e.jsx(i.code,{children:"TASK_EXECUTION_TIME"})," for a time frame could be symptomatic of several things including overloaded region servers, a network glitch, or client/region servers undergoing garbage collection."]}),`
`,e.jsx(i.p,{children:`Collection of global client metrics can be turned on/off (on by default) by setting the attribute phoenix.query.global.metrics.enabled to true/false in the client side hbase-site.xml.
Below is a code snippet showing how to log/report global metrics by using a scheduled job that runs periodically:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ScheduledExecutorService service "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Executors."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"newScheduledThreadPool"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"service."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"submit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Runnable"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Override"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        Collection<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"GlobalMetric"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> metrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getGlobalPhoenixClientMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (GlobalMetric m "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" metrics) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // log or report for trending purposes"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"scan-latency-metrics",children:"Scan latency metrics"}),`
`,e.jsxs(i.p,{children:[`Phoenix 5.3.1 surfaces HBase's per-scan latency and IO metrics through the
request-level metrics API, giving per-query visibility into where a scan
actually spent its time
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7704",children:"PHOENIX-7704"}),")."]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Metric"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"FS_READ_TIME"})}),e.jsx(i.td,{children:"Time (ms) spent in the underlying filesystem (HDFS/S3) for HFile reads."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"BYTES_READ_FROM_FS"})}),e.jsx(i.td,{children:"Bytes read from the filesystem — cold reads that missed HBase block cache."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"BYTES_READ_FROM_MEMSTORE"})}),e.jsx(i.td,{children:"Bytes read from memstore — un-flushed cells."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"BYTES_READ_FROM_BLOCKCACHE"})}),e.jsx(i.td,{children:"Bytes served from the HBase block cache — warm reads."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"BLOCK_READ_OPS_COUNT"})}),e.jsx(i.td,{children:"Number of HFile blocks read from filesystem (HDFS/S3)."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"RPC_SCAN_PROCESSING_TIME"})}),e.jsx(i.td,{children:"Time (ms) the RegionServer spent processing the scan RPC in handler thread."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"RPC_SCAN_QUEUE_WAIT_TIME"})}),e.jsx(i.td,{children:"Time (ms) the scan RPC spent in the RegionServer's call queue."})]})]})]}),`
`,e.jsxs(i.p,{children:[`These are request-level metrics — they appear in the per-table map returned by
`,e.jsx(i.code,{children:"PhoenixRuntime.getRequestReadMetricInfo(rs)"})," alongside the existing entries:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (ResultSet rs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sql)) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", Map<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MetricType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> readMetrics "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getRequestReadMetricInfo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rs);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fsReadMs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" readMetrics."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MetricType.FS_READ_TIME);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    long"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" blocksRead "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" readMetrics."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MetricType.BLOCK_READ_OPS_COUNT);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["They piggyback on ",e.jsx(i.code,{children:"phoenix.trace.read.metrics.enabled"}),` (the existing
request-level metrics switch, on by default) and require no additional
configuration. Values originate from HBase 2.6.4+; on older HBase versions
they are silently zero.`]}),`
`,e.jsx(i.h2,{id:"top-n-slowest-scans",children:"Top-N slowest parallel scans"}),`
`,e.jsxs(i.p,{children:[`For diagnosing tail-latency on a single statement issuing multiple HBase scans, Phoenix can retain the
top-N slowest scan paths it issued while executing a query — useful when a
query fans out across many regions and you want to find the worst few
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7729",children:"PHOENIX-7729"}),")."]}),`
`,e.jsx(i.h3,{id:"enabling",children:"Enabling"}),`
`,e.jsxs(i.p,{children:[`Off by default. Set the count to a positive number on the connection
(`,e.jsx(i.code,{children:"Properties"}),") or globally in ",e.jsx(i.code,{children:"hbase-site.xml"}),":"]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property"}),e.jsx(i.th,{style:{textAlign:"right"},children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"phoenix.slowest.scan.metrics.count"})}),e.jsx(i.td,{style:{textAlign:"right"},children:e.jsx(i.code,{children:"0"})}),e.jsxs(i.td,{children:["N — number of slowest scans to retain. ",e.jsx(i.code,{children:"0"})," disables the feature."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"phoenix.scan.metrics.by.region.enabled"})}),e.jsx(i.td,{style:{textAlign:"right"},children:e.jsx(i.code,{children:"false"})}),e.jsxs(i.td,{children:["When ",e.jsx(i.code,{children:"true"})," (and ",e.jsx(i.code,{children:"count > 0"}),"), the per-scan record also carries the region name and serving RegionServer. Requires HBase 2.6.3+."]})]})]})]}),`
`,e.jsxs(i.p,{children:["Request-level metrics (",e.jsx(i.code,{children:"phoenix.trace.read.metrics.enabled"}),`) must also be on,
which is the default.`]}),`
`,e.jsx(i.h3,{id:"retrieving-the-result",children:"Retrieving the result"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"PhoenixRuntime.getTopNSlowestScanMetrics(rs)"}),` returns the slowest scan paths
seen while executing the query, as a list of JSON-object lists — one outer
entry per slow scan path, one inner entry per HBase table touched on that
path. Forward to your telemetry sink as needed.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"try"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (ResultSet rs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" stmt."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sql)) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    while"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (rs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    List<List<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"JsonObject"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">> slowest "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PhoenixRuntime."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTopNSlowestScanMetrics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(rs);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (List<"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"JsonObject"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> path "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" slowest) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (JsonObject scan "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" path) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            log."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"info"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"slow scan on {}: {}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", scan."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"get"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"table"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), scan);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{l as _markdown,o as default,h as extractedReferences,r as frontmatter,a as structuredData,c as toc};
