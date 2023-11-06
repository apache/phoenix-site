# Using the Phoenix JDBC Driver #

This page is about using the Phoenix thick client.

The thin client for Phoenix Query Server is described on its own [page](server.html)

## The Phoenix classpath ##

To use phoenix, both the JDBC driver jar, and hbase-site.xml must be added to the application classpath

### Phoenix driver jar ###

The Phoenix JDBC client is built on top the HBase client, and has an unusally high number of dependencies.
To make this manageable, Phoenix provides a single shaded uberjar that can be added to the classpath.

Phoenix uses some private and semi-public HBase APIs, which may change between HBase versions, and provides separate binary distributions for using with different HBase version.

Choose the [binary distribution](download.html) or maven artifact corresponding to HBase version on the cluster.

**Copy the driver JAR from the binary distribution**

Copy the corresponding `phoenix-client-embedded-hbase-[hbase.profile]-[phoenix.version].jar` to the application classpath

**Add the dependency via maven**

```
  <dependencies>
    ...
    <dependency>
        <groupId>org.apache.phoenix</groupId>
        <artifactId>phoenix-client-embedded-hbase-[hbase.profile]</artifactId>
        <version>[phoenix.version]</version>
    </dependency>
    ...
  </dependencies>
```

### HBase / Hadoop configuration files ###

As Phoenix is built on top the HBase client, it needs the HBase configuration files for correct operation.
For some configurations, it may also need other Hadoop / HDFS config files like core-site.xml.

Download the corrext *hbase-site.xml* (the client one, usually in */etc/hbase/conf*) from the cluster, and copy it to a directory on the classpath.
It is important to add the **directory containing hbase-site.xml**, and not the full path of *hbase-site.xml* to the classpath.

Alternatively, pack *hbase-site.xml* into the root directory of a JAR file, and add that to the classpath.

If *hbase-site.xml* changes on the cluster, make sure to copy the fresh one to the application classpth.

For some development clusters that use the default configuration Phoenix MAY work without this, but not having the correct *hbase-site.xml* on the
classpath is almost guaranteed to cause problems.


## The Phoenix JDBC URL ##

The phoenix URL contains two main parts. The first one describes the connection to the HBase cluster, while the second part can specify extra options to Phoenix.

`jdbc:<protocol variant>[:<server list>[:<port>[:<zk root node>[:<principal>[:<keytab file>]]]]][;<option>=<value>]*`

 - `Protocol variant`: The HBase connection registry to use, see below for details
 - `server list`: A comma separated list of hostnames or IPv4 addresses. 
     
     It is also possible to use specify the port for each host, as defined in [HBASE-12706 Support multiple port numbers in ZK quorum string](https://issues.apache.org/jira/browse/HBASE-12706). In this case the colon ':' characters must be escaped with a backslash '\\'.
     It may be necessary to repeat the escape character, for example in Java source code.

 - `port`: An integer number specifying a port. Ports specified in the server list take precedence.
 - `zk root node`: The root ZNode for the HBase instance. Must be empty for non ZK registries.
 - `principal`: The kerberos principal to use for authentication.
 
     If only `principal` is specified, then this defines the user name with each distinct user having their own dedicated HBase connection (HConnection).
     This provides a means of having multiple, different connections each with different configuration properties on the same JVM.
 
 - `keytab`: The kerberos keytab to be used for authentication. Must be specified together with the principal.
 - `option`: A connection option
 - `value`: Value for the connection option

Parameters from end of the connection definition can be omitted.
Use empty strings for missing parameters in the middle of the URL.
For example, the `jdbc:phoenix::::principal:/home/user/keytab` URL can be used to specify the kerberos principal and keytab, while using the default connection specified in hbase-site.xml.

### Default connection ###

The underlaying HBase client identifies the HBase cluster based on parameters specified in hbase-site.xml. 
While Phoenix makes it possible override this, in the majority of cases it is advisable not to do that, and use the cluster connection definition from hbase-site.xml.
The only time the connection should be directly specified is when switching between otherwise identically configured HBase instances, like a production and a disaster recovery cluster.

To use the defaults from hbase-site.xml, use the `jdbc:phoenix` URL or `jdbc:phoenix;option=value` if additional options are needed.

See the HBase documentation on how the connection is specified in *hbase-site.xml* for each registry.

### The `jdbc:phoenix:` protocol variant ###

If the default protocol variant is specified, then Phoenix will select the variant based on the value of the *hbase.client.registry.impl* property.

If the *hbase.client.registry.impl* property is not defined, then it will choose a default based on the version of the HBase client it includes.

### The `jdbc:phoenix+zk:` protocol variant ###

This uses the original Zookeeper based HBase connection registry, which has always been available in HBase. The server list and port specify the ZK quorum. [HBASE-12706](https://issues.apache.org/jira/browse/HBASE-12706) is supported . In this case the colon ':' characters must be escaped with a backslash '\'.

examples:

 - `jdbc:phoenix+zk:localhost:2181:/hbase:principal:keytab` : fully specified
 - `jdbc:phoenix+zk:host1\:2181,host1\:2182,host2\:2183` : heterogenous ports, default zk node 
 - `jdbc:phoenix+zk` : use the default ZK parameters from hbase-site.xml or the HBase defaults. (using jdbc:phoenix is preferred in most cases)

### The `jdbc:phoenix+master:` protocol variant ###

This uses the Master based connection registry added in [HBASE-18095](https://issues.apache.org/jira/browse/HBASE-18095), and is available from HBase 2.3.0.
The **zk root node** parameter **must** never be specified.

examples:

 - `jbdc:phoenix+master:master1\:16001,master2\:16002::principal:/path/to/keytab` : Fully specified
 - `jbdc:phoenix+master:master1,master2` : uses master1 and master2 with the default port

### The `jdbc:phoenix+rpc:` protocol variant ###

This uses the Master based connection registry added in [HBASE-26150](https://issues.apache.org/jira/browse/HBASE-26150), and is available from HBase 2.5.0.
This is very similar to the **phoenix+master** variant, but also allows specifying the Region Servers in the host list.
There is no built-in default port for this registry, the port must always be specified together with the host list.

examples:

 - `jbdc:phoenix+rpc:server1\:16001,server2\:16002::principal:/path/to/keytab` : Fully specified
 - `jbdc:phoenix+rpc` : uses values from hbase-site.xml

## Notes ##

Support for *master* and *RPC* registries is only available in Phoenix 5.1.4 and later and 5.2.0 and later.
Earlier version only support the jdbc:phoenix: protocol variant implementing the the original HBase Zookeeper Connection Registry.

Support for the registry variants is only available for the HBase versions that support them.
Phoenix will throw an error if a variant that the HBase client version doesn't support is specified.

Phoenix 5.2 also supports Hight Availability connections. Documentation for that is only available in the [JIRA ticket](https://issues.apache.org/jira/browse/PHOENIX-6491)

