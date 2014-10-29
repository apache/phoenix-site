# Statistics Collection

The UPDATE STATISTICS command updates the statistics collected on a table, to improve query performance.
This command collects a set of keys per region per column family that are equal byte distanced from each other.
These collected keys are called *guideposts* and they act as *hints/guides* to improve the parallelization of
queries on a given target region.

Statistics are also automatically collected during major compactions and region splits so manually running this
command may not be necessary.

## Examples

For a given table <code>my_table</code>:

    UPDATE STATISTICS <code>my_table</code>

The above syntax would collect the statistics for the table my_table and all the index tables, views and
view index tables associated with the table my_table.

The equivalent of the above syntax is

    UPDATE STATISTICS <code>my_table</code> ALL

To collect the statistics on the index table alone

    UPDATE STATISTICS <code>my_table</code> INDEX

To collect the statistics on the table alone

    UPDATE STATISTICS <code>my_table</code> COLUMNS

## Configurations

The configuration parameters controlling statistics collection include:

1.  <code>phoenix.stats.guidepost.width</code>
    * A server-side parameter that specifies the number of bytes between guideposts.
      A smaller amount increases parallelization, but also increases the number of
      chunks which must be merged on the client side.
    * The default value is 104857600 (100 MB).
2.  <code>phoenix.stats.guidepost.per.region</code>
    * A server-side parameter that specifies the number of guideposts per region.
      If set to a value greater than zero, then the guidepost width is determiend by
      the MAX_FILE_SIZE of the table divided by this value. Otherwise, if not set
      then the <code>phoenix.stats.guidepost.width</code> parameter is used.
    * No default value.
3.  <code>phoenix.stats.updateFrequency</code>
    * A server-side paramater that determines the frequency in milliseconds for which statistics
      will be refreshed from the statistics table and subsequently used by the client.
    * The default value is 900000 (15 mins)
4.  <code>phoenix.stats.minUpdateFrequency</code>
    * A client-side parameter that determines the minimum amount of time in milliseconds that
      must pass before statistics may again be manually collected through another <code>UPDATE
      STATISTICS</code> call.
    * The default value is <code>phoenix.stats.updateFrequency</code> divided by two (7.5 mins)
5. <code>phoenix.stats.useCurrentTime</code>
    * An advanced server-side parameter that if true causes the current time on the server-side
      to be used as the timestamp of rows in the statistics table when background tasks such as
      compactions or splits occur. If false, then the max timestamp found while traversing the
      table over which statistics are being collected is used as the timestamp. Unless your
      client is controlling the timestamps while reading and writing data, this parameter
      should be left alone.
    * The default value is true.
