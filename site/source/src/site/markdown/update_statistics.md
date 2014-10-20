# Statistics Collection

The UPDATE STATISTICS command updates the statistics collected on a table, to improve query performance.
This command collects a set of keys per region per column family that are equal byte distanced from each other.
These collected keys are called *guideposts* and they act as *hints/guides* to improve the parallelization of queries on a given target 
region.

The statistics are also collected during major compaction and when ever a region split happens so manually running the command
may not be necessary.

## Examples

For a given table <code>my_table</code>:

   UPDATE STATISTICS <code>my_table</code>

The above syntax would collect the statistics for the table my_table and all the index tables, views and view index tables associated
with the table my_table.

The equivalent of the above syntax is

   UPDATE STATISTICS <code>my_table</code> ALL

To collect the statistics on the index table alone

   UPDATE STATISTICS <code>my_table</code> INDEX

To collect the statistics on the table alone

   UPDATE STATISTICS <code>my_table</code> COLUMNS

## Configurations

Some of the configurations associated with the UPDATE STATISTICS command are

1.  <code>phoenix.stats.guidepost.width</code>

    * A server-side configuration that specifies the absolute byte value that determines the number of bytes between the collected
      guideposts.

2.  <code>phoenix.stats.guidepost.per.region</code>

   * Determines the number of guideposts per region.  If the configuration 'phoenix.stats.guidepost.width' is not set then the
     MAX_FILE_SIZE associated with the table (for which statistics collection is needed) divided by the values set for this 
     configuration will be used for 'phoenix.stats.guidepost.width'.
   * The default value is 20

3.  <code>phoenix.stats.minUpdateFrequency</code>

   * Minimum time in milliseconds that must be passed before another UPDATE STATISTICS call be issued once again to collect the
     statistics again.

4.  <code>phoenix.stats.updateFrequency</code>

   * Minimum frequency in milliseconds that new statistics will be checked for when pulling over new metadata from the client to the
     server.
