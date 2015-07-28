#Release Notes

Release notes provide details on issues and their fixes which may have an impact on prior
Phoenix behavior. For some issues an upgrade may be required to be performed for a fix to
take affect. See below for directions specific to a particular release.


###<u>Phoenix-4.5.0 Release Notes</u>
Both [PHOENIX-2067](https://issues.apache.org/jira/browse/PHOENIX-2067) and
[PHOENIX-2120](https://issues.apache.org/jira/browse/PHOENIX-2120) cause rows to not be ordered
correctly for the following types of columns:

* VARCHAR DESC columns
* DECIMAL DESC columns
* ARRAY DESC columns
* Nullable DESC columns which are indexed (impacts the index, but not the data table)
* BINARY columns included in the primary key constraint

To get an idea if any of your tables are impacted, you may run the following command:

    ./psql.py -u my_host_name

This will look through all tables you've defined and indicate if any upgrades are necessary.

To upgrade the tables, run the same command, but list the tables you'd like upgraded like this:

    ./psql.py -u my_host_name table1 table2 table3

This will first make a snapshot of your table and then upgrade it. If any problems occur
during the upgrade process, the snapshot of your original table will be restored.

For the case of BINARY columns, no update is required if you've always provided all of
the bytes making up that column value (i.e. you have not relied on Phoenix to auto-pad the
column up to the fixed length). In this case, you should bypass the upgrade by running the 
following command:

    ./psql.py -u -b my_host_name table1

This is important, because the PHOENIX-2120 was caused by BINARY columns being incorrectly
padded with a space characters instead of a zero byte characters. The upgrade will replace
trailing space characters with zero byte characters which may be invalid if the space
characters are legitimate/intentional characters. Unfortunately, Phoenix has no way to know
if this is the case.

Upgrading your tables is important, as without this, Phoenix will need to reorder rows it
retrieves back from the server when otherwise not necessary. This will have a large negative
impact on performance until the upgrade is performed.

__Future releases of Phoenix may require that affected tables be upgraded prior to moving to the new release.__
