# Metrics

Phoenix surfaces various metrics that provide an insight into what is going on within the Phoenix client as it is executing various SQL statements. These metrics are collected within the client JVM in two ways:

- **Request level metrics** - collected at an individual SQL statement level
- **Global metrics** - collected at the client JVM level

Request level metrics are helpful for figuring out at a more granular level about the amount of work done by every SQL statement executed by Phoenix. These metrics can be classified into three categories:

#### Mutation Metrics
- MUTATION_BATCH_SIZE - Batch sizes of mutations
- MUTATION_BYTES - Size of mutations in bytes
- MUTATION_COMMIT_TIME - Time it took to commit mutations


#### Scan Task Metrics
- NUM_PARALLEL_SCANS - Number of scans executed in parallel
- SCAN_BYTES - Number of bytes read by scans
- MEMORY_CHUNK_BYTES - Number of bytes allocated by the memory manager
- MEMORY_WAIT_TIME - Time in milliseconds threads needed to wait for memory to be allocated through memory manager
- SPOOL_FILE_SIZE - Size of spool files created in bytes
- SPOOL_FILE_COUNTER - Number of spool files created
- CACHE_REFRESH_SPLITS_COUNTER - Number of times Phoenix’s metadata cache was refreshed because of splits
- TASK_QUEUE_WAIT_TIME - Time in milliseconds tasks had to wait in the queue of the thread pool executor
- TASK_END_TO_END_TIME - Time in milliseconds spent by tasks from creation to completion
- TASK_EXECUTION_TIME - Time in milliseconds tasks took to execute
- TASK_EXECUTED_COUNTER - Counter for number of tasks submitted to the thread pool executor
- TASK_REJECTED_COUNTER - Counter for number of tasks that were rejected by the thread pool executor


#### Overall Query Metrics
- QUERY_TIMEOUT_COUNTER - Number of times query timed out
- QUERY_FAILED_COUNTER - Number of times query failed
- WALL_CLOCK_TIME_MS - Wall clock time elapsed for the overall query execution
- RESULT_SET_TIME_MS - Wall clock time elapsed for reading all records using resultSet.next()


  

##### Below are a few examples of how SQL statement level metrics could be used:
- Log and report query execution details which could be later used for analysis. 
- Report top SQL queries by duration. Metric to use: WALL_CLOCK_TIME_MS
- Check if the query is failing because it is timing out. Metric to use:  QUERY_TIMEOUT_COUNTER > 0.
- Monitor the amount of bytes being written to or read from HBase for a SQL statement. Metrics to use: MUTATION_BYTES and SCAN_BYTES
- Check if the query is doing too much work or needs to be tuned. Possible metrics to use: TASK_EXECUTED_COUNTER, TASK_QUEUE_WAIT_TIME, WALL_CLOCK_TIME_MS 
- Check if a successful query is facing thread starvation i.e. number of threads in the thread pool possibly needs to be increased. This is symptomized by a relatively large difference between TASK_EXECUTION_TIME and TASK_END_TO_END_TIME.


Request level metrics can be turned on/off for every Phoenix JDBC connection. Below is an example of how you can do that:

        Properties props = new Properties();
        props.setProperty(QueryServices.COLLECT_REQUEST_LEVEL_METRICS, “true”);
        try (Connection conn = DriverManager.getConnection(getUrl(), props)) {
            .....
        }


A typical pattern for how one could get hold of read metrics for queries:

	Map<String, Map<String, Long>> overAllQueryMetrics = null;
        Map<String, Map<String, Long>> requestReadMetrics = null;
        try (ResultSet rs = stmt.executeQuery()) {
              while(rs.next()) {
                  .....
              }
              overAllQueryMetrics = PhoenixRuntime.getOverAllReadRequestMetrics(rs);
              requestReadMetrics = PhoenixRuntime.getRequestReadMetrics(rs);
              // log or report metrics as needed
              PhoenixRuntime.resetMetrics(rs);
        }

One could also get hold of write related metrics (collected per table) for DML statements by doing something like this:

	Map<String, Map<String, Long>> mutationWriteMetrics = null;
        Map<String, Map<String, Long>> mutationReadMetrics = null;
        try (Connection conn = DriverManager.getConnection(url)) {
              conn.createStatement.executeUpdate(dml1);
              ....
              conn.createStatement.executeUpdate(dml2);
              ...
              conn.createStatement.executeUpdate(dml3);
              ...
              conn.commit();
              mutationWriteMetrics = PhoenixRuntime.getWriteMetricsForMutationsSinceLastReset(conn);
              mutationReadMetrics = PhoenixRuntime.getReadMetricsForMutationsSinceLastReset(conn);
              PhoenixRuntime.resetMetrics(rs);
        }



Global metrics on the other hand are collected at the Phoenix client’s JVM level. These metrics could be used for building out a trend and seeing what is going on within Phoenix from client’s perspective over time. Other than the metrics reported above for request level metrics, the global metrics also includes the following counters:

- MUTATION_SQL_COUNTER - Counter for number of mutation sql statements
- SELECT_SQL_COUNTER - Counter for number of sql queries
- OPEN_PHOENIX_CONNECTIONS_COUNTER - Number of open phoenix connections


Global metrics could be helpful in monitoring and tuning various aspects of the execution environment. For example: an increase in the metric TASK_REJECTED_COUNTER is probably a symptom of too much work being submitted or the fact that the phoenix thread pool queue depth or number of threads or both need to be increased. Similarly, a spike in TASK_EXECUTION_TIME for a time frame could be symptomatic of several things including overloaded region servers, a network glitch, client or region servers undergoing garbage collection, etc.

Collection of global client metrics can be turned on/off (on by default) by setting the attribute phoenix.query.global.metrics.enabled to true/false in the client side hbase-site.xml.
Below is a code snippet of how one can log/report global metrics by using a scheduled job that runs periodically:


        ScheduledExecutorService service = Executors.newScheduledThreadPool(1);
        service.submit(new Runnable() {

            @Override
            public void run() {
                Collection<GlobalMetric> metrics = PhoenixRuntime.getGlobalPhoenixClientMetrics();
                for (GlobalMetric m : metrics) {
                    ... // log or report for trending purposes
                }

            }
        });