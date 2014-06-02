#Upgrading from Phoenix 2.2.x

By default, Phoenix 2.2.x tables are not automatically upgraded to Apache Phoenix 3.0/4.0 tables. Since pre-Apache 2.2.x code lines have a different package structure (<code>com.salesforce.phoenix</code>) than the 3.0/4.0 code line (<code>org.apache.phoenix</code>), the two installations may actually coexist. An existing Phoenix table may either remain as a 2.2.x table or be upgraded to 3.0/4.0 table, but not both. In addition, a client JVM may either use the 3.0/4.0 driver or the 2.2.x driver, but not both. Upgrade, however, is a one way street: once a table is upgrade to 3.0/4.0, it stays that way.

Note that upgrading a table will not affect its data - only the metadata of the table will change. In order to upgrade tables from 2.2.x to 3.0/4.0, the following must be done **BEFORE** the first connection to a cluster which has 3.0/4.0 installed on it. 

* Add a new <code>phoenix.client.autoUpgradeWhiteList</code> config parameter to your client-side hbase-sites.xml. Make sure the directory containing the hbase-sites.xml is on the classpath of your client so that HBase finds it. The value you use for the parameter depends on which tables you want to upgrade:
    * To upgrade all tables use a value of *. This will cause all Phoenix 2.2.x tables to be automatically converted to the new 3.0.0 structure when the first connection occurs. For example:

          <configuration>
            <property>
              <name>phoenix.client.autoUpgradeWhiteList</name>
              <value>*</value>
            </property>
          </configuration>
    * To upgrade only some tables use a comma separated list of full table names. In that case, only those tables and their secondary indexes will be upgraded on first connection to a cluster. Note that table names are case sensitive. For example, the following would upgrade <code>my_schema.my_table</code> and <code>MY_OTHER_TABLE</code>:

          <configuration>
            <property>
              <name>phoenix.client.autoUpgradeWhiteList</name>
              <value>my_schema.my_table,MY_OTHER_TABLE</value>
            </property>
          </configuration>
* After the first connection has been made to a cluster with Phoenix 3.0/4.0 installed, no further upgrade will take place. However, you may force it to take place again by removing the <code>UpgradeTo30</code> attribute from the <code>SYSTEM.CATALOG</code> HBase table metadata. Then, on the next connection to the cluster, upgrade will again occur as describe above.
* If you've been using a pre-release Phoenix 3.0/4.0 SNAPSHOT jar, your metadata won't be compatible with the released metadata schema. You should disable and drop your SYSTEM.CATALOG and SYSTEM.SEQUENCE tables from an HBase shell and re-run your DDL commands to re-create your Phoenix table. In addition, make sure the SNAPSHOT jar is removed from your HBase lib directory and client directories.
