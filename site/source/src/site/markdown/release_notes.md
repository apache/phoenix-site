#Release Notes

Release notes provide details on issues and their fixes which may have an impact on prior
Phoenix behavior. For some issues an upgrade may be required to be performed for a fix to
take affect. See below for directions specific to a particular release.

###<u>Phoenix 5.0.0-alpha Release Notes</u>

Phoenix 5.0.0-alpha is a "preview" release. This release is the first
version of Phoenix which is compatible with Apache Hadoop 3.0.x and Apache
HBase 2.0.x. This release also is designated an "alpha" release because
there are several known deficiencies which impact the production readiness.
This release should be used carefully by users who have taken the time
to understand what is known to be working and what is not.

Known issues:

* The Apache Hive integration is known to be non-functional (PHOENIX-4423)
* Split/Merge logic with Phoenix local indexes are broken (PHOENIX-4440)
* Apache Tepha integration/transactional tables are non-functional (PHOENIX-4580)
* Point-in-time queries and tools that look at "old" cells are broken, e.g. IndexScrutiny (PHOENIX-4378)

The developers would like to encourage users to test this release out and
report any observed issues so that the official 5.0.0 release quality may
be significantly improved.

###<u>Phoenix-4.8.0 Release Notes</u>

[PHOENIX-3164](https://issues.apache.org/jira/browse/PHOENIX-3164) is a relatively serious
bug that affects the [Phoenix Query Server](http://phoenix.apache.org/server.html)
deployed with "security enabled" (Kerberos or Active Directory). Due to another late-game
change in the 4.8.0 release as well as an issue with the use of Hadoop's UserGroupInformation
class, every "client session" to the Phoenix Query Server with security enabled will
result in a new instance of the Phoenix JDBC driver `PhoenixConnection` (and other related
classes). This ultimately results in a new connection to ZooKeeper for each "client session".

Within a short amount of time of active use with the Phoenix Query Server creating a new ZooKeeper
connection for each "client session", the number of ZooKeeper connections will have grown rapidly
likely triggering ZooKeeper's built-in denial of service protection
([maxClientCnxns](https://zookeeper.apache.org/doc/r3.4.8/zookeeperAdmin.html)). This
will cause all future connections to ZooKeeper by the host running the Phoenix Query Server to
be dropped. This would prevent all HBase client API calls which need to access ZooKeeper
from completing.

As part of [PHOENIX-1734](https://issues.apache.org/jira/browse/PHOENIX-1734) we have changed
the local index implementation to store index data in the separate column families in the same
 data table. So while upgrading the phoenix at server we need to remove below local index 
related configurations from `hbase-site.xml` and run upgrade steps mentioned 
[here](secondary_indexing.html#Upgrading_Local_Indexes_created_before_4.8.0)

```
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
```
 
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
Ensure your client-side <code>phoenix.query.timeoutMs</code> property and server-side
<code>hbase.regionserver.lease.period</code> are set high enough for the command to complete.


To upgrade the tables, run the same command, but list the tables you'd like upgraded like this:

    ./psql.py -u my_host_name table1 table2 table3

This will first make a snapshot of your table and then upgrade it. If any problems occur
during the upgrade process, the snapshot of your original table will be restored. Again, make
sure your timeouts are set high enough, as the tables being upgraded need to be rewritten
in order to fix them.

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
