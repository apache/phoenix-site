# Configuration

Phoenix provides many different knobs and dials to configure and tune the system to run more optimally on your cluster. The configuration is done through a series of Phoenix-specific properties specified both on client and server-side <code>hbase-site.xml</code> files. In addition to these properties, there are of course all the <a href="http://hbase.apache.org/book/config.files.html" target="_blank">HBase configuration</a> properties with the most important ones documented <a href="http://hbase.apache.org/book/important_configurations.html" target="_blank">here</a>.<br/>
<br/>
The table below outlines the full set of Phoenix-specific configuration properties and their defaults.<br/>
<br/>
<table border="1">
    <tbody>
<tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default
</b></td></tr>
<tr><td><small>data.tx.snapshot.dir</small></td><td style="text-align: left;">Server-side property specifying the HDFS directory used to store snapshots of the transaction state. No default value.</td><td>None</td></tr>
<tr><td><small>data.tx.timeout</small></td><td style="text-align: left;">Server-side property specifying the timeout in seconds for a transaction to complete. Default is 30 seconds.</td><td>30</td></tr>
<tr><td><small>phoenix.query.timeoutMs</small></td><td style="text-align: left;">Client-side property specifying the number of milliseconds after which a query will timeout on the client. Default is 10 min.</td><td>600000
</td></tr>
<tr><td><small>phoenix.query.keepAliveMs</small></td><td style="text-align: left;"> Maximum time in
milliseconds that excess idle threads will wait for a new tasks before terminating
when the number of threads is greater than the cores in the client side thread pool executor.
Default is 60 sec.</td><td>60000</td></tr>
<tr><td><small>phoenix.query.threadPoolSize</small></td><td style="text-align: left;">Number of threads
      in client side thread pool executor. As the number of machines/cores
      in the cluster grows, this value should be
increased.</td><td>128</td></tr>
<tr><td><small>phoenix.query.queueSize</small></td><td>Max queue depth of the
      bounded round robin backing the client side thread pool executor,
      beyond which an attempt to queue additional work is
      rejected. If zero, a SynchronousQueue is used
      instead of the bounded round robin queue. The default value is 5000.</td><td>5000</td></tr>
<tr><td><small>phoenix.stats.guidepost.width</small></td><td>
Server-side parameter that specifies the number of bytes between guideposts.
      A smaller amount increases parallelization, but also increases the number of
      chunks which must be merged on the client side. The default value is 100 MB.
</td><td>104857600</td></tr>
<tr><td><small>phoenix.stats.guidepost.per.region</small></td><td>
Server-side parameter that specifies the number of guideposts per region.
      If set to a value greater than zero, then the guidepost width is determiend by
      <small><code>MAX_FILE_SIZE&nbsp;of&nbsp;table&nbsp;/&nbsp;phoenix.stats.guidepost.per.region</code></small>.
Otherwise, if not set, then the <small><code>phoenix.stats.guidepost.width</code></small> parameter
is used. No default value.
</td><td>None</td></tr>
<tr><td><small>phoenix.stats.updateFrequency</small></td><td>
Server-side paramater that determines the frequency in milliseconds for which statistics
will be refreshed from the statistics table and subsequently used by the client. The
default value is 15 min.
</td><td>900000</td></tr>
<tr><td><small>phoenix.stats.minUpdateFrequency</small></td><td>
Client-side parameter that determines the minimum amount of time in milliseconds that
      must pass before statistics may again be manually collected through another <code>UPDATE
      STATISTICS</code> call. The default value is <small><code>phoenix.stats.updateFrequency&nbsp;/&nbsp;2</code></small>. 
</td><td>450000</td></tr>
<tr><td><small>phoenix.stats.useCurrentTime</small></td><td>
Server-side parameter that if true causes the current time on the server-side
      to be used as the timestamp of rows in the statistics table when background tasks such as
      compactions or splits occur. If false, then the max timestamp found while traversing the
      table over which statistics are being collected is used as the timestamp. Unless your
      client is controlling the timestamps while reading and writing data, this parameter
      should be left alone. The default value is true.
</td><td>true</td></tr>
<tr><td><small>phoenix.query.spoolThresholdBytes</small></td><td style="text-align: left;">Threshold
      size in bytes after which results from parallelly executed
      query results are spooled to disk. Default is 20 mb.</td><td>20971520</td></tr>
<tr><td><small>phoenix.query.maxSpoolToDiskBytes</small></td><td style="text-align: left;">Threshold
      size in bytes up to which results from parallelly executed
      query results are spooled to disk above which the query will fail. Default is 1 GB.</td><td>1024000000</td></tr>
<tr><td><small>phoenix.query.maxGlobalMemoryPercentage</small></td><td style="text-align: left;">Percentage of total heap memory (i.e. Runtime.getRuntime().maxMemory()) that all threads may use. Only course grain memory usage is tracked, mainly accounting for memory usage in the intermediate map built during group by aggregation.  When this limit is reached the clients block attempting to get more memory, essentially throttling memory usage. Defaults to 15%</td><td>15</td></tr>
<tr><td><small>phoenix.query.maxGlobalMemorySize</small></td><td style="text-align: left;">Max size in bytes of total tracked memory usage. By default not specified, however, if present, the lower of this parameter and the phoenix.query.maxGlobalMemoryPercentage will be used
</td><td>&nbsp;</td></tr>
<tr><td><small>phoenix.query.maxGlobalMemoryWaitMs</small></td><td style="text-align: left;">Maximum
      amount of time that a client will block while waiting for more memory
      to become available.  After this amount of time, an
<code>InsufficientMemoryException</code> is
      thrown. Default is 10 sec.</td><td>10000</td></tr>
<tr><td><small>phoenix.query.maxTenantMemoryPercentage</small></td><td style="text-align: left;">Maximum
      percentage of <code>phoenix.query.maxGlobalMemoryPercentage</code> that
any one tenant is allowed to consume. After this percentage, an
<code>InsufficientMemoryException</code> is
      thrown. Default is 100%</td><td>100</td></tr>
<tr><td><small>phoenix.query.dateFormat</small></td><td style="text-align: left;">Default pattern to use
      for conversion of a date to/from a string, whether through the
      <code>TO_CHAR(&lt;date&gt;)</code> or
<code>TO_DATE(&lt;date-string&gt;)</code> functions, or through
<code>resultSet.getString(&lt;date-column&gt;)</code>. Default is yyyy-MM-dd HH:mm:ss</td><td>yyyy-MM-dd HH:mm:ss</td></tr>
<tr><td><small>phoenix.query.dateFormatTimeZone</small></td><td style="text-align: left;">A timezone id that specifies the default time zone in which date, time, and timestamp literals should be interpreted when interpreting string literals or using the <code>TO_DATE</code> function. A time zone id can be a timezone abbreviation such as "PST", or a full name such as "America/Los_Angeles", or a custom offset such as "GMT-9:00". The time zone id "LOCAL" can also be used to interpret all date, time, and timestamp literals as being in the current timezone of the client.</td><td>GMT</td></tr>
<tr><td><small>phoenix.query.numberFormat</small></td><td style="text-align: left;">Default pattern to use
      for conversion of a decimal number to/from a string, whether through the
      <code>TO_CHAR(&lt;decimal-number&gt;)</code> or
<code>TO_NUMBER(&lt;decimal-string&gt;)</code> functions, or through
<code>resultSet.getString(&lt;decimal-column&gt;)</code>. Default is #,##0.###</td><td>#,##0.###</td></tr>
<tr><td><small>phoenix.mutate.maxSize</small></td><td style="text-align: left;">The maximum number of rows
      that may be batched on the client
      before a commit or rollback must be called.</td><td>500000</td></tr>
<tr><td><small>phoenix.mutate.batchSize</small></td><td style="text-align: left;">The number of rows that are batched together and automatically committed during the execution of an
      <code>UPSERT SELECT</code> or <code>DELETE</code> statement. This property may be
overridden at connection
      time by specifying the <code>UpsertBatchSize</code>
      property value. Note that the connection property value does not affect the batch size used by the coprocessor when these statements are executed completely on the server side.</td><td>1000</td></tr>
<tr><td><small>phoenix.query.maxServerCacheBytes</small></td><td style="text-align: left;">Maximum size (in bytes) of a single sub-query result (usually the filtered result of a table) before compression and conversion to a hash map. Attempting to hash an intermediate sub-query result of a size bigger than this setting will result in a MaxServerCacheSizeExceededException. Default 100MB.</td><td>104857600</td></tr>
<tr><td><small>phoenix.coprocessor.maxServerCacheTimeToLiveMs</small></td><td style="text-align: left;">Maximum living time (in milliseconds) of server caches. A cache entry expires after this amount of time has passed since last access. Consider adjusting this parameter when a server-side IOException("Could not find hash cache for joinId") happens. Getting warnings like "Earlier hash cache(s) might have expired on servers" might also be a sign that this number should be increased.</td><td>30000</td></tr>
<tr><td><small>phoenix.query.useIndexes</small></td><td style="text-align: left;">Client-side property determining whether or not indexes are considered by the optimizer to satisfy a query. Default is true
</td><td>true</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild</small></td><td style="text-align: left;">Server-side property determining whether or not a mutable index is rebuilt in the background in the event of a commit failure. Only applicable for indexes on mutable, non transactional tables. Default is true
</td><td>true</td></tr>
<tr><td><small>phoenix.index.failure.block.write</small></td><td style="text-align: left;">Server-side property determining whether or not a writes to the data table are disallowed in the event of a commit failure until the index can be caught up with the data table. Requires that <small>phoenix.index.failure.handling.rebuild</small> is true as well. Only applicable for indexes on mutable, non transactional tables. Default is false
</td><td>false</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild.interval</small></td><td style="text-align: left;">Server-side property controlling the millisecond frequency at which the server checks whether or not a mutable index needs to be partially rebuilt to catch up with updates to the data table. Only applicable for indexes on mutable, non transactional tables. Default is 10 seconds.
</td><td>10000</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild.overlap.time</small></td><td style="text-align: left;">Server-side property controlling how many milliseconds to go back from the timestamp at which the failure occurred to go back when a partial rebuild is performed. Only applicable for indexes on mutable, non transactional tables. Default is 1 millisecond.
</td><td>1</td></tr>
<tr><td><small>phoenix.index.mutableBatchSizeThreshold</small></td><td style="text-align: left;">Number of mutations in a batch beyond which index metadata will be sent as a separate RPC to each region server as opposed to included inline with each mutation. Defaults to 5.
</td><td>5</td></tr>
<tr><td><small>phoenix.schema.dropMetaData</small></td><td style="text-align: left;">Determines whether or not an HBase table is dropped when the Phoenix table is dropped. Default is true
</td><td>true</td></tr>
<tr><td><small>phoenix.groupby.spillable</small></td><td style="text-align: left;">Determines whether or not a GROUP BY over a large number of distinct values is allowed to spill to disk on the region server. If false, an InsufficientMemoryException will be thrown instead. Default is true
</td><td>true</td></tr>
<tr><td><small>phoenix.groupby.spillFiles</small></td><td style="text-align: left;">Number of memory mapped spill files to be used when spilling GROUP BY distinct values to disk. Default is 2
</td><td>2</td></tr>
<tr><td><small>phoenix.groupby.maxCacheSize</small></td><td style="text-align: left;">Size in bytes of pages cached during GROUP BY spilling. Default is 100Mb
</td><td>102400000</td></tr>
<tr><td><small>phoenix.groupby.estimatedDistinctValues</small></td><td style="text-align: left;">Number of estimated distinct values when a GROUP BY is performed. Used to perform initial sizing with growth of 1.5x each time reallocation is required. Default is 1000
</td><td>1000</td></tr>
<tr><td><small>phoenix.distinct.value.compress.threshold</small></td><td style="text-align: left;">Size in bytes beyond which aggregate operations which require tracking distinct value counts (such as COUNT DISTINCT) will use Snappy compression. Default is 1Mb
</td><td>1024000</td></tr>
<tr><td><small>phoenix.index.maxDataFileSizePerc</small></td><td style="text-align: left;">Percentage used to determine the MAX_FILESIZE for the shared index table for views relative to the data table MAX_FILESIZE. The percentage should be estimated based on the anticipated average size of an view index row versus the data row. Default is 50%.
</td><td>50</td></tr>
<tr><td><small>phoenix.coprocessor.maxMetaDataCacheTimeToLiveMs</small></td><td style="text-align: left;">Time in milliseconds after which the server-side metadata cache for a tenant will expire if not accessed. Default is 30mins
</td><td>180000</td></tr>
<tr><td><small>phoenix.coprocessor.maxMetaDataCacheSize</small></td><td style="text-align: left;">Max size in bytes of total server-side metadata cache after which evictions will begin to occur based on least recent access time. Default is 20Mb
</td><td>20480000</td></tr>
<tr><td><small>phoenix.client.maxMetaDataCacheSize</small></td><td style="text-align: left;">Max size in bytes of total client-side metadata cache after which evictions will begin to occur based on least recent access time. Default is 10Mb
</td><td>10240000</td></tr>
<tr><td><small>phoenix.sequence.cacheSize</small></td><td style="text-align: left;">Number of sequence values to reserve from the server and cache on the client when the next sequence value is allocated. Only used if not defined by the sequence itself. Default is 100
</td><td>100</td></tr>
<tr><td><small>phoenix.clock.skew.interval</small></td><td style="text-align: left;">Delay interval(in milliseconds) when opening SYSTEM.CATALOG to compensate possible time clock skew when SYSTEM.CATALOG moves among region servers. 
</td><td>2000</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild</small></td><td style="text-align: left;">Boolean flag which turns on/off auto-rebuild a failed index from when some updates are failed to be updated into the index.
</td><td>true</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild.interval</small></td><td style="text-align: left;">Time interval(in milliseconds) for index rebuild backend Job to check if there is an index to be rebuilt
</td><td>10000</td></tr>
<tr><td><small>phoenix.index.failure.handling.rebuild.overlap.time</small></td><td style="text-align: left;">Index rebuild job builds an index from when it failed - the time interval(in milliseconds) in order to create a time overlap to prevent missing updates when there exists time clock skew.
</td><td>300000</td></tr>
<tr><td><small>phoenix.query.force.rowkeyorder</small></td><td style="text-align: left;">Whether or not a non aggregate query returns rows in row key order for salted tables. For version prior to 4.4, use phoenix.query.rowKeyOrderSaltedTable instead. Default is true.</td><td>true</td></tr>
<tr><td><small>phoenix.connection.autoCommit</small></td><td style="text-align: left;">Whether or not a new connection has auto-commit enabled when it is created. Default is false.</td><td>false</td></tr>
<tr><td><small>phoenix.table.default.store.nulls</small></td><td style="text-align: left;">The default value of the STORE_NULLS flag used for table creation which determines whether or not null values should be explicitly stored in HBase. Default is false. This is a client side parameter. Available starting from Phoenix 4.3.</td><td>false</td></tr>
<tr><td><small>phoenix.table.istransactional.default</small></td><td style="text-align: left;">The default value of the TRANSACTIONAL flag used for table creation which determines whether or not a table is transactional . Default is false. This is a client side parameter. Available starting from Phoenix 4.7.</td><td>false</td></tr>
<tr><td><small>phoenix.transactions.enabled</small></td><td style="text-align: left;"> Determines whether or not transactions are enabled in Phoenix. A table may not be declared as transactional if transactions are disabled. Default is false. This is a client side parameter. Available starting from Phoenix 4.7.</td><td>false</td></tr>
<tr><td><small>phoenix.mapreduce.split.by.stats</small></td><td style="text-align: left;">Determines whether to use the splits determined by stastics for MapReduce input splits. Default is true. This is a server side parameter. Available starting from Phoenix 4.10. Set to false to enable behavior from previous versions.</td><td>true</td></tr>
</tbody></table>
<br />
