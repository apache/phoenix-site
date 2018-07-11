# Statistics Collection

The UPDATE STATISTICS command updates the statistics collected on a table. 
This command collects a set of keys per region per column family that
are equal byte distanced from each other. These collected keys are called *guideposts*
and they act as *hints/guides* to improve the parallelization of queries on a given
target region.

Statistics are also automatically collected during major compactions and region splits so
manually running this command may not be necessary.


##Parallelization
Phoenix breaks up queries into multiple scans and runs them in parallel to reduce latency.
Parallelization in Phoenix is driven by the statistics related configuration parameters. 
Each chunk of data between guideposts will be run in parallel in a separate scan to improve
query performance. The chunk size is determined by the GUIDE_POSTS_WIDTH table property (Phoenix 4.9 or above)
or the global server-side <code>phoenix.stats.guidepost.width</code> parameter if the table property is
not set. As the size of the chunks decrease,
you'll want to increase <code>phoenix.query.queueSize</code> as more work will be queued in that
case. Note that at a minimum, separate scans will be run for each table region. Statistics in Phoenix
provides a means of gaining intraregion parallelization. In addition to the guidepost width specification,
the client-side <code>phoenix.query.threadPoolSize</code> and <code>phoenix.query.queueSize</code> parameters
and the server-side <code>hbase.regionserver.handler.count</code> parameter have an impact on the amount
of parallelization.

## Examples

To update the statistics for a given table <code>my_table</code>, execute the following command:

    UPDATE STATISTICS my_table

The above syntax would collect the statistics for the table my_table and all the index tables,
views and view index tables associated with the table my_table.

The equivalent of the above syntax is

    UPDATE STATISTICS my_table ALL

To collect the statistics on the index table alone

    UPDATE STATISTICS my_table INDEX

To collect the statistics on the table alone

    UPDATE STATISTICS my_table COLUMNS

To modify the guidepost width to 10MB for a table, execute the following command:

    ALTER TABLE my_table SET GUIDE_POSTS_WIDTH = 10000000

To remove the guidepost width, set the property to null:

    ALTER TABLE my_table SET GUIDE_POSTS_WIDTH = null

##Known issues

* <code>**Duplicated records** (SQL count shows more rows than HBase row_count) for Phoenix versions earlier than **4.12** </code>

May happen for tables with several regions where guide posts were not generated for last region(s) because the region size is smaller than the guide post width.
In that case, the parallel scans for those regions would start with the latest guide post instead of startkey of this region.
**Fixed in 4.12** as part of [PHOENIX-4007](https://issues.apache.org/jira/browse/PHOENIX-4007) 

## Configuration

The configuration parameters controlling statistics collection include:

1.  <code>phoenix.stats.guidepost.width</code>
    * A server-side parameter that specifies the number of bytes between guideposts.
      A smaller amount increases parallelization, but also increases the number of
      chunks which must be merged on the client side.
    * The default value is 104857600 (100 MB).
2.  <code>phoenix.stats.updateFrequency</code>
    * A server-side paramater that determines the frequency in milliseconds for which statistics
      will be refreshed from the statistics table and subsequently used by the client.
    * The default value is 900000 (15 mins)
3.  <code>phoenix.stats.minUpdateFrequency</code>
    * A client-side parameter that determines the minimum amount of time in milliseconds that
      must pass before statistics may again be manually collected through another <code>UPDATE
      STATISTICS</code> call.
    * The default value is <code>phoenix.stats.updateFrequency</code> divided by two (7.5 mins)
4. <code>phoenix.stats.useCurrentTime</code>
    * An advanced server-side parameter that if true causes the current time on the server-side
      to be used as the timestamp of rows in the statistics table when background tasks such as
      compactions or splits occur. If false, then the max timestamp found while traversing the
      table over which statistics are being collected is used as the timestamp. Unless your
      client is controlling the timestamps while reading and writing data, this parameter
      should be left alone.
    * The default value is true.
5. <code>phoenix.use.stats.parallelization</code>
    * This configuration is available starting Phoenix 4.12. It controls whether statistical information 
      on the data should be used to drive query parallelization.
    * The default value is true.
