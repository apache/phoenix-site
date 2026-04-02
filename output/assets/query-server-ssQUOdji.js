import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let s=`The Phoenix Query Server provides an alternative means for interaction with
Phoenix and HBase.

## Overview

Phoenix 4.4 introduces a stand-alone server that exposes Phoenix to "thin"
clients. It is based on the [Avatica](https://calcite.apache.org/avatica) component of
[Apache Calcite](https://calcite.apache.org). The query server is comprised of a Java server that
manages Phoenix Connections on the clients' behalf.

With the introduction of the
Protobuf transport, Avatica is moving towards backwards compatibility with the
provided thin JDBC driver. There are no such backwards compatibility guarantees
for the JSON API.

To repeat, there is no guarantee of backwards compatibility with the JSON transport;
however, compatibility with the Protobuf transport is stabilizing (although, not
tested thoroughly enough to be stated as "guaranteed").

### Clients

The primary client implementation
is currently a JDBC driver with minimal dependencies. The default and
primary transport mechanism since Phoenix 4.7 is Protobuf, the older JSON mechanism can still
be enabled.
The distribution includes the sqlline-thin.py CLI client that uses the JDBC thin client.

The Phoenix project also maintains the Python driver
[phoenixdb](https://phoenix.apache.org/python.html).

The Avatica [Go client](https://calcite.apache.org/avatica/docs/go_client_reference.html)
can also be used.

Proprietary ODBC drivers are also available for Windows and Linux.

## Installation

In the 4.4-4.14 and 5.0 releases the query server and its JDBC client are part of the standard Phoenix
distribution. They require no additional dependencies or installation.

After the 4.15 and 5.1 release, the query server has been unbundled into the phoenix-queryserver
repository, and its version number has been reset to 6.0.

Download the latest source or binary release from the
[Download page](/downloads),
or check out the development version from
[GitHub](https://github.com/apache/phoenix-queryserver).

Either unpack the binary distribution, or build it from source. See BUILDING.md
in the source distribution on how to build.

## Usage

### Server

The standalone Query Server distribution does not contain the necessary
Phoenix (thick) client library by default.

If using the standalone library you will either need to rebuild it from source to include the
client library (See BUILDING.md), or manually copy the phoenix thick client library
into the installation directory.

The server component is managed through \`bin/queryserver.py\`. Its usage is as
follows

\`\`\`shell
bin/queryserver.py [start|stop]
\`\`\`

When invoked with no arguments, the query server is launched in the foreground,
with logging directed to the console.

The first argument is an optional \`start\` or \`stop\` command to the daemon. When
either of these are provided, it will take appropriate action on a daemon
process, if it exists.

Any subsequent arguments are passed to the main class for interpretation.

The server is packaged in a standalone jar,
\`phoenix-queryserver-<version>.jar\`. This jar, the phoenix-client.jar and \`HBASE_CONF_DIR\` on the
classpath are all that is required to launch the server.

### Client

Phoenix provides two mechanisms for interacting with the query server. A JDBC
driver is provided in the standalone
\`phoenix-queryserver-client-<version>.jar\`. The script
\`bin/sqlline-thin.py\` is available for the command line.

The JDBC connection string is composed as follows:

\`\`\`
jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>[;option=value...]
\`\`\`

\`<scheme>\` specifies the transport protocol (http or https) used when communicating with the
server.

\`<server-hostname>\` is the name of the host offering the service.

\`<port>\` is the port number on which the host is listening. Default is \`8765\`,
though this is configurable (see below).

The full list of options that can be provided via the JDBC URL string is [available
in the Avatica documentation](https://calcite.apache.org/avatica/docs/client_reference.html).

The script \`bin/sqlline-thin.py\` is intended to behave identically to its
sibling script \`bin/sqlline.py\`. It supports the following usage options.

\`\`\`shell
bin/sqlline-thin.py [[scheme://]host[:port]] [sql_file]
\`\`\`

The first optional argument is a connection URL, as described previously. When
not provided, \`scheme\` defaults to \`http\`, \`host\` to \`localhost\`, and \`port\` to
\`8765\`.

\`\`\`shell
bin/sqlline-thin.py http://localhost:8765
\`\`\`

The second optional parameter is a sql file from which to read commands.

## Wire API documentation

The API itself is documented in the Apache Calcite project as it is the Avatica
API -- there is no wire API defined in Phoenix itself.

[JSON API](https://calcite.apache.org/avatica/docs/json_reference.html)

[Protocol Buffer API](https://calcite.apache.org/avatica/docs/protobuf_reference.html)

For more information in building clients in other languages that work with
Avatica, please feel free to reach out to the [Apache Calcite dev mailing list](mailto:dev@calcite.apache.org).

## Impersonation

By default, the Phoenix Query Server executes queries on behalf of the end-user. HBase permissions
are enforced given the end-user, not the Phoenix Query Server's identity. In some cases, it may
be desirable to execute the query as some other user -- this is referred to as "impersonation".
This can enable workflows where a trusted user has the privilege to run queries for other users.

This can be enabled by setting the configuration property \`phoenix.queryserver.withRemoteUserExtractor\`
to \`true\`. The URL of the Query Server can be modified to include the required request parameter.
For example, to let "bob" to run a query as "alice", the following JDBC URL could be used:

\`\`\`text
jdbc:phoenix:thin:url=http://localhost:8765?doAs=alice
\`\`\`

The standard Hadoop "proxyuser" configuration keys are checked to validate if the "real" remote user
is allowed to impersonate the "doAs" user. See the [Hadoop documentation](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Superusers.html)
for more information on how to configure these rules.

As a word of warning: there is no end-to-end test coverage for the HBase 0.98 and 1.1 Phoenix releases
because of missing test-related code in those HBase releases. While we expect no issues on these
Phoenix release lines, we recommend additional testing by the user to verify that there are no issues.

## Metrics

By default, the Phoenix Query Server exposes various Phoenix global client metrics via JMX (for HBase versions 1.3 and up).
The list of metrics are available [here](/docs/features/metrics).

PQS Metrics use [Hadoop Metrics 2](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Metrics.html) internally for metrics publishing. Hence it publishes various JVM related metrics. Metrics can be filtered based on certain tags, which can be configured by the property specified in hbase-site.xml on the classpath. Further details are provided in Configuration section.

## Configuration

Server components are spread across a number of java packages, so effective
logging configuration requires updating multiple packages. The default server
logging configuration sets the following log levels:

\`\`\`properties
log4j.logger.org.apache.calcite.avatica=INFO
log4j.logger.org.apache.phoenix.queryserver.server=INFO
log4j.logger.org.eclipse.jetty.server=INFO
\`\`\`

As of the time of writing, the underlying Avatica component respects the
following configuration options exposed via \`hbase-site.xml\`.

### Server Instantiation

| Property                                | Description                                            | Default                                                        |
| --------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| \`phoenix.queryserver.http.port\`         | Port the server listens on.                            | \`8765\`                                                         |
| \`phoenix.queryserver.metafactory.class\` | Avatica \`Meta.Factory\` implementation class.           | \`org.apache.phoenix.queryserver.server.PhoenixMetaFactoryImpl\` |
| \`phoenix.queryserver.serialization\`     | Transport/serialization format (\`PROTOBUF\` or \`JSON\`). | \`PROTOBUF\`                                                     |

### HTTPS

HTTPS support is only available in unbundled \`phoenix-queryserver\` versions.

| Property                                      | Description                                                                                       | Default        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| \`phoenix.queryserver.tls.enabled\`             | Enables HTTPS transport. When enabled, keystore/truststore files and passwords are also required. | \`false\`        |
| \`phoenix.queryserver.tls.keystore\`            | Keystore file containing the HTTPS private key.                                                   | *unset*        |
| \`phoenix.queryserver.tls.keystore.password\`   | Password for HTTPS keystore.                                                                      | *empty string* |
| \`phoenix.queryserver.tls.truststore\`          | Keystore file containing the HTTPS certificate.                                                   | *unset*        |
| \`phoenix.queryserver.tls.truststore.password\` | Password for HTTPS truststore.                                                                    | *empty string* |

### Secure Cluster Connection

| Property                                      | Description                                                                                                                                | Default                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| \`hbase.security.authentication\`               | When set to \`kerberos\`, server logs in before initiating Phoenix connections.                                                              | *specified in \`hbase-default.xml\`* |
| \`phoenix.queryserver.keytab.file\`             | Key for keytab file lookup.                                                                                                                | *unset*                            |
| \`phoenix.queryserver.kerberos.principal\`      | Kerberos principal for authentication; also used for SPNEGO if HTTP principal is not configured.                                           | *unset*                            |
| \`phoenix.queryserver.http.keytab.file\`        | Keytab for SPNEGO auth; required if \`phoenix.queryserver.kerberos.http.principal\` is set; falls back to \`phoenix.queryserver.keytab.file\`. | *unset*                            |
| \`phoenix.queryserver.http.kerberos.principal\` | Kerberos principal for SPNEGO auth; falls back to \`phoenix.queryserver.kerberos.principal\`.                                                | *unset*                            |
| \`phoenix.queryserver.kerberos.http.principal\` | Deprecated; use \`phoenix.queryserver.http.kerberos.principal\`.                                                                             | *unset*                            |
| \`phoenix.queryserver.kerberos.allowed.realms\` | Additional Kerberos realms allowed for SPNEGO auth.                                                                                        | *unset*                            |
| \`phoenix.queryserver.dns.nameserver\`          | DNS hostname.                                                                                                                              | \`default\`                          |
| \`phoenix.queryserver.dns.interface\`           | Network interface name for DNS queries.                                                                                                    | \`default\`                          |

### Server Connection Cache

| Property                                  | Description                                                             | Default   |
| ----------------------------------------- | ----------------------------------------------------------------------- | --------- |
| \`avatica.connectioncache.concurrency\`     | Connection cache concurrency level.                                     | \`10\`      |
| \`avatica.connectioncache.initialcapacity\` | Connection cache initial capacity.                                      | \`100\`     |
| \`avatica.connectioncache.maxcapacity\`     | Connection cache maximum capacity; LRU eviction begins near this point. | \`1000\`    |
| \`avatica.connectioncache.expiryduration\`  | Connection cache expiration duration.                                   | \`10\`      |
| \`avatica.connectioncache.expiryunit\`      | Time unit for \`avatica.connectioncache.expiryduration\`.                 | \`MINUTES\` |

### Server Statement Cache

| Property                                 | Description                                                            | Default   |
| ---------------------------------------- | ---------------------------------------------------------------------- | --------- |
| \`avatica.statementcache.concurrency\`     | Statement cache concurrency level.                                     | \`100\`     |
| \`avatica.statementcache.initialcapacity\` | Statement cache initial capacity.                                      | \`1000\`    |
| \`avatica.statementcache.maxcapacity\`     | Statement cache maximum capacity; LRU eviction begins near this point. | \`10000\`   |
| \`avatica.statementcache.expiryduration\`  | Statement cache expiration duration.                                   | \`5\`       |
| \`avatica.statementcache.expiryunit\`      | Time unit for \`avatica.statementcache.expiryduration\`.                 | \`MINUTES\` |

### Impersonation

| Property                                        | Description                                                                                | Default |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ------- |
| \`phoenix.queryserver.withRemoteUserExtractor\`   | If true, extracts impersonated user from request param instead of authenticated HTTP user. | \`false\` |
| \`phoenix.queryserver.remoteUserExtractor.param\` | HTTP request parameter name for impersonated user.                                         | \`doAs\`  |

### Metrics

| Property                     | Description                                                                                     | Default      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| \`phoenix.client.metrics.tag\` | Tag for filtering Phoenix global client metrics emitted by PQS in \`hadoop-metrics2.properties\`. | \`FAT_CLIENT\` |

## Query Server Additions

The Phoenix Query Server is meant to be horizontally scalable which means that it
is a natural fit for add-on features like service discovery and load balancing.

### Load balancing

The Query Server can use off-the-shelf HTTP load balancers such as the [Apache HTTP Server](https://httpd.apache.org),
[nginx](https://nginx.org), or [HAProxy](https://haproxy.org). The primary requirement of
using these load balancers is that the implementation must implement "sticky session" (when a client
communicates with a backend server, that client continues to talk to that backend server). The Query Server also
provides some bundled functionality for load balancing using ZooKeeper.

The ZooKeeper-based load balancer functions by automatically registering PQS instances in
ZooKeeper and then allows clients to query the list of available servers. This implementation, unlike
the others mentioned above, requires that client use the advertised information to make a routing decision.
In this regard, this ZooKeeper-based approach is more akin to a service-discovery layer than a traditional
load balancer. This load balancer implementation does *not* support SASL-based (Kerberos) ACLs in
ZooKeeper (see [PHOENIX-4085](https://issues.apache.org/jira/browse/PHOENIX-4085)).

The following properties configure this load balancer:

| Property                                     | Description                                                    | Default       |
| -------------------------------------------- | -------------------------------------------------------------- | ------------- |
| \`phoenix.queryserver.loadbalancer.enabled\`   | If true, PQS registers itself in ZooKeeper for load balancing. | \`false\`       |
| \`phoenix.queryserver.base.path\`              | Root znode where PQS instances register themselves.            | \`/phoenix\`    |
| \`phoenix.queryserver.service.name\`           | Unique name to identify this PQS instance.                     | \`queryserver\` |
| \`phoenix.queryserver.zookeeper.acl.username\` | Username for optional DIGEST ZooKeeper ACL.                    | \`phoenix\`     |
| \`phoenix.queryserver.zookeeper.acl.password\` | Password for optional DIGEST ZooKeeper ACL.                    | \`phoenix\`     |
`,o={title:"Query Server",description:"Deploy and use Phoenix Query Server (PQS), including client access, impersonation, metrics, and load-balancing configuration."},a=[{href:"https://calcite.apache.org/avatica"},{href:"https://calcite.apache.org"},{href:"https://phoenix.apache.org/python.html"},{href:"https://calcite.apache.org/avatica/docs/go_client_reference.html"},{href:"/downloads"},{href:"https://github.com/apache/phoenix-queryserver"},{href:"https://calcite.apache.org/avatica/docs/client_reference.html"},{href:"https://calcite.apache.org/avatica/docs/json_reference.html"},{href:"https://calcite.apache.org/avatica/docs/protobuf_reference.html"},{href:"mailto:dev@calcite.apache.org"},{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Superusers.html"},{href:"/docs/features/metrics"},{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Metrics.html"},{href:"https://httpd.apache.org"},{href:"https://nginx.org"},{href:"https://haproxy.org"},{href:"https://issues.apache.org/jira/browse/PHOENIX-4085"}],c={contents:[{heading:void 0,content:`The Phoenix Query Server provides an alternative means for interaction with
Phoenix and HBase.`},{heading:"query-server-overview",content:`Phoenix 4.4 introduces a stand-alone server that exposes Phoenix to "thin"
clients. It is based on the Avatica component of
Apache Calcite. The query server is comprised of a Java server that
manages Phoenix Connections on the clients' behalf.`},{heading:"query-server-overview",content:`With the introduction of the
Protobuf transport, Avatica is moving towards backwards compatibility with the
provided thin JDBC driver. There are no such backwards compatibility guarantees
for the JSON API.`},{heading:"query-server-overview",content:`To repeat, there is no guarantee of backwards compatibility with the JSON transport;
however, compatibility with the Protobuf transport is stabilizing (although, not
tested thoroughly enough to be stated as "guaranteed").`},{heading:"clients",content:`The primary client implementation
is currently a JDBC driver with minimal dependencies. The default and
primary transport mechanism since Phoenix 4.7 is Protobuf, the older JSON mechanism can still
be enabled.
The distribution includes the sqlline-thin.py CLI client that uses the JDBC thin client.`},{heading:"clients",content:`The Phoenix project also maintains the Python driver
phoenixdb.`},{heading:"clients",content:`The Avatica Go client
can also be used.`},{heading:"clients",content:"Proprietary ODBC drivers are also available for Windows and Linux."},{heading:"query-server-installation",content:`In the 4.4-4.14 and 5.0 releases the query server and its JDBC client are part of the standard Phoenix
distribution. They require no additional dependencies or installation.`},{heading:"query-server-installation",content:`After the 4.15 and 5.1 release, the query server has been unbundled into the phoenix-queryserver
repository, and its version number has been reset to 6.0.`},{heading:"query-server-installation",content:`Download the latest source or binary release from the
Download page,
or check out the development version from
GitHub.`},{heading:"query-server-installation",content:`Either unpack the binary distribution, or build it from source. See BUILDING.md
in the source distribution on how to build.`},{heading:"server",content:`The standalone Query Server distribution does not contain the necessary
Phoenix (thick) client library by default.`},{heading:"server",content:`If using the standalone library you will either need to rebuild it from source to include the
client library (See BUILDING.md), or manually copy the phoenix thick client library
into the installation directory.`},{heading:"server",content:`The server component is managed through bin/queryserver.py. Its usage is as
follows`},{heading:"server",content:`When invoked with no arguments, the query server is launched in the foreground,
with logging directed to the console.`},{heading:"server",content:`The first argument is an optional start or stop command to the daemon. When
either of these are provided, it will take appropriate action on a daemon
process, if it exists.`},{heading:"server",content:"Any subsequent arguments are passed to the main class for interpretation."},{heading:"server",content:`The server is packaged in a standalone jar,
phoenix-queryserver-<version>.jar. This jar, the phoenix-client.jar and HBASE_CONF_DIR on the
classpath are all that is required to launch the server.`},{heading:"client",content:`Phoenix provides two mechanisms for interacting with the query server. A JDBC
driver is provided in the standalone
phoenix-queryserver-client-<version>.jar. The script
bin/sqlline-thin.py is available for the command line.`},{heading:"client",content:"The JDBC connection string is composed as follows:"},{heading:"client",content:`<scheme> specifies the transport protocol (http or https) used when communicating with the
server.`},{heading:"client",content:"<server-hostname> is the name of the host offering the service."},{heading:"client",content:`<port> is the port number on which the host is listening. Default is 8765,
though this is configurable (see below).`},{heading:"client",content:`The full list of options that can be provided via the JDBC URL string is available
in the Avatica documentation.`},{heading:"client",content:`The script bin/sqlline-thin.py is intended to behave identically to its
sibling script bin/sqlline.py. It supports the following usage options.`},{heading:"client",content:`The first optional argument is a connection URL, as described previously. When
not provided, scheme defaults to http, host to localhost, and port to
8765.`},{heading:"client",content:"The second optional parameter is a sql file from which to read commands."},{heading:"wire-api-documentation",content:`The API itself is documented in the Apache Calcite project as it is the Avatica
API -- there is no wire API defined in Phoenix itself.`},{heading:"wire-api-documentation",content:"JSON API"},{heading:"wire-api-documentation",content:"Protocol Buffer API"},{heading:"wire-api-documentation",content:`For more information in building clients in other languages that work with
Avatica, please feel free to reach out to the Apache Calcite dev mailing list.`},{heading:"impersonation",content:`By default, the Phoenix Query Server executes queries on behalf of the end-user. HBase permissions
are enforced given the end-user, not the Phoenix Query Server's identity. In some cases, it may
be desirable to execute the query as some other user -- this is referred to as "impersonation".
This can enable workflows where a trusted user has the privilege to run queries for other users.`},{heading:"impersonation",content:`This can be enabled by setting the configuration property phoenix.queryserver.withRemoteUserExtractor
to true. The URL of the Query Server can be modified to include the required request parameter.
For example, to let "bob" to run a query as "alice", the following JDBC URL could be used:`},{heading:"impersonation",content:`The standard Hadoop "proxyuser" configuration keys are checked to validate if the "real" remote user
is allowed to impersonate the "doAs" user. See the Hadoop documentation
for more information on how to configure these rules.`},{heading:"impersonation",content:`As a word of warning: there is no end-to-end test coverage for the HBase 0.98 and 1.1 Phoenix releases
because of missing test-related code in those HBase releases. While we expect no issues on these
Phoenix release lines, we recommend additional testing by the user to verify that there are no issues.`},{heading:"query-server-metrics",content:`By default, the Phoenix Query Server exposes various Phoenix global client metrics via JMX (for HBase versions 1.3 and up).
The list of metrics are available here.`},{heading:"query-server-metrics",content:"PQS Metrics use Hadoop Metrics 2 internally for metrics publishing. Hence it publishes various JVM related metrics. Metrics can be filtered based on certain tags, which can be configured by the property specified in hbase-site.xml on the classpath. Further details are provided in Configuration section."},{heading:"query-server-configuration",content:`Server components are spread across a number of java packages, so effective
logging configuration requires updating multiple packages. The default server
logging configuration sets the following log levels:`},{heading:"query-server-configuration",content:`As of the time of writing, the underlying Avatica component respects the
following configuration options exposed via hbase-site.xml.`},{heading:"server-instantiation",content:"Property"},{heading:"server-instantiation",content:"Description"},{heading:"server-instantiation",content:"Default"},{heading:"server-instantiation",content:"phoenix.queryserver.http.port"},{heading:"server-instantiation",content:"Port the server listens on."},{heading:"server-instantiation",content:"8765"},{heading:"server-instantiation",content:"phoenix.queryserver.metafactory.class"},{heading:"server-instantiation",content:"Avatica Meta.Factory implementation class."},{heading:"server-instantiation",content:"org.apache.phoenix.queryserver.server.PhoenixMetaFactoryImpl"},{heading:"server-instantiation",content:"phoenix.queryserver.serialization"},{heading:"server-instantiation",content:"Transport/serialization format (PROTOBUF or JSON)."},{heading:"server-instantiation",content:"PROTOBUF"},{heading:"https",content:"HTTPS support is only available in unbundled phoenix-queryserver versions."},{heading:"https",content:"Property"},{heading:"https",content:"Description"},{heading:"https",content:"Default"},{heading:"https",content:"phoenix.queryserver.tls.enabled"},{heading:"https",content:"Enables HTTPS transport. When enabled, keystore/truststore files and passwords are also required."},{heading:"https",content:"false"},{heading:"https",content:"phoenix.queryserver.tls.keystore"},{heading:"https",content:"Keystore file containing the HTTPS private key."},{heading:"https",content:"unset"},{heading:"https",content:"phoenix.queryserver.tls.keystore.password"},{heading:"https",content:"Password for HTTPS keystore."},{heading:"https",content:"empty string"},{heading:"https",content:"phoenix.queryserver.tls.truststore"},{heading:"https",content:"Keystore file containing the HTTPS certificate."},{heading:"https",content:"unset"},{heading:"https",content:"phoenix.queryserver.tls.truststore.password"},{heading:"https",content:"Password for HTTPS truststore."},{heading:"https",content:"empty string"},{heading:"secure-cluster-connection",content:"Property"},{heading:"secure-cluster-connection",content:"Description"},{heading:"secure-cluster-connection",content:"Default"},{heading:"secure-cluster-connection",content:"hbase.security.authentication"},{heading:"secure-cluster-connection",content:"When set to kerberos, server logs in before initiating Phoenix connections."},{heading:"secure-cluster-connection",content:"specified in hbase-default.xml"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.keytab.file"},{heading:"secure-cluster-connection",content:"Key for keytab file lookup."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.kerberos.principal"},{heading:"secure-cluster-connection",content:"Kerberos principal for authentication; also used for SPNEGO if HTTP principal is not configured."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.http.keytab.file"},{heading:"secure-cluster-connection",content:"Keytab for SPNEGO auth; required if phoenix.queryserver.kerberos.http.principal is set; falls back to phoenix.queryserver.keytab.file."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.http.kerberos.principal"},{heading:"secure-cluster-connection",content:"Kerberos principal for SPNEGO auth; falls back to phoenix.queryserver.kerberos.principal."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.kerberos.http.principal"},{heading:"secure-cluster-connection",content:"Deprecated; use phoenix.queryserver.http.kerberos.principal."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.kerberos.allowed.realms"},{heading:"secure-cluster-connection",content:"Additional Kerberos realms allowed for SPNEGO auth."},{heading:"secure-cluster-connection",content:"unset"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.dns.nameserver"},{heading:"secure-cluster-connection",content:"DNS hostname."},{heading:"secure-cluster-connection",content:"default"},{heading:"secure-cluster-connection",content:"phoenix.queryserver.dns.interface"},{heading:"secure-cluster-connection",content:"Network interface name for DNS queries."},{heading:"secure-cluster-connection",content:"default"},{heading:"server-connection-cache",content:"Property"},{heading:"server-connection-cache",content:"Description"},{heading:"server-connection-cache",content:"Default"},{heading:"server-connection-cache",content:"avatica.connectioncache.concurrency"},{heading:"server-connection-cache",content:"Connection cache concurrency level."},{heading:"server-connection-cache",content:"10"},{heading:"server-connection-cache",content:"avatica.connectioncache.initialcapacity"},{heading:"server-connection-cache",content:"Connection cache initial capacity."},{heading:"server-connection-cache",content:"100"},{heading:"server-connection-cache",content:"avatica.connectioncache.maxcapacity"},{heading:"server-connection-cache",content:"Connection cache maximum capacity; LRU eviction begins near this point."},{heading:"server-connection-cache",content:"1000"},{heading:"server-connection-cache",content:"avatica.connectioncache.expiryduration"},{heading:"server-connection-cache",content:"Connection cache expiration duration."},{heading:"server-connection-cache",content:"10"},{heading:"server-connection-cache",content:"avatica.connectioncache.expiryunit"},{heading:"server-connection-cache",content:"Time unit for avatica.connectioncache.expiryduration."},{heading:"server-connection-cache",content:"MINUTES"},{heading:"server-statement-cache",content:"Property"},{heading:"server-statement-cache",content:"Description"},{heading:"server-statement-cache",content:"Default"},{heading:"server-statement-cache",content:"avatica.statementcache.concurrency"},{heading:"server-statement-cache",content:"Statement cache concurrency level."},{heading:"server-statement-cache",content:"100"},{heading:"server-statement-cache",content:"avatica.statementcache.initialcapacity"},{heading:"server-statement-cache",content:"Statement cache initial capacity."},{heading:"server-statement-cache",content:"1000"},{heading:"server-statement-cache",content:"avatica.statementcache.maxcapacity"},{heading:"server-statement-cache",content:"Statement cache maximum capacity; LRU eviction begins near this point."},{heading:"server-statement-cache",content:"10000"},{heading:"server-statement-cache",content:"avatica.statementcache.expiryduration"},{heading:"server-statement-cache",content:"Statement cache expiration duration."},{heading:"server-statement-cache",content:"5"},{heading:"server-statement-cache",content:"avatica.statementcache.expiryunit"},{heading:"server-statement-cache",content:"Time unit for avatica.statementcache.expiryduration."},{heading:"server-statement-cache",content:"MINUTES"},{heading:"impersonation-1",content:"Property"},{heading:"impersonation-1",content:"Description"},{heading:"impersonation-1",content:"Default"},{heading:"impersonation-1",content:"phoenix.queryserver.withRemoteUserExtractor"},{heading:"impersonation-1",content:"If true, extracts impersonated user from request param instead of authenticated HTTP user."},{heading:"impersonation-1",content:"false"},{heading:"impersonation-1",content:"phoenix.queryserver.remoteUserExtractor.param"},{heading:"impersonation-1",content:"HTTP request parameter name for impersonated user."},{heading:"impersonation-1",content:"doAs"},{heading:"query-server-metrics-config",content:"Property"},{heading:"query-server-metrics-config",content:"Description"},{heading:"query-server-metrics-config",content:"Default"},{heading:"query-server-metrics-config",content:"phoenix.client.metrics.tag"},{heading:"query-server-metrics-config",content:"Tag for filtering Phoenix global client metrics emitted by PQS in hadoop-metrics2.properties."},{heading:"query-server-metrics-config",content:"FAT_CLIENT"},{heading:"query-server-additions",content:`The Phoenix Query Server is meant to be horizontally scalable which means that it
is a natural fit for add-on features like service discovery and load balancing.`},{heading:"load-balancing",content:`The Query Server can use off-the-shelf HTTP load balancers such as the Apache HTTP Server,
nginx, or HAProxy. The primary requirement of
using these load balancers is that the implementation must implement "sticky session" (when a client
communicates with a backend server, that client continues to talk to that backend server). The Query Server also
provides some bundled functionality for load balancing using ZooKeeper.`},{heading:"load-balancing",content:`The ZooKeeper-based load balancer functions by automatically registering PQS instances in
ZooKeeper and then allows clients to query the list of available servers. This implementation, unlike
the others mentioned above, requires that client use the advertised information to make a routing decision.
In this regard, this ZooKeeper-based approach is more akin to a service-discovery layer than a traditional
load balancer. This load balancer implementation does not support SASL-based (Kerberos) ACLs in
ZooKeeper (see PHOENIX-4085).`},{heading:"load-balancing",content:"The following properties configure this load balancer:"},{heading:"load-balancing",content:"Property"},{heading:"load-balancing",content:"Description"},{heading:"load-balancing",content:"Default"},{heading:"load-balancing",content:"phoenix.queryserver.loadbalancer.enabled"},{heading:"load-balancing",content:"If true, PQS registers itself in ZooKeeper for load balancing."},{heading:"load-balancing",content:"false"},{heading:"load-balancing",content:"phoenix.queryserver.base.path"},{heading:"load-balancing",content:"Root znode where PQS instances register themselves."},{heading:"load-balancing",content:"/phoenix"},{heading:"load-balancing",content:"phoenix.queryserver.service.name"},{heading:"load-balancing",content:"Unique name to identify this PQS instance."},{heading:"load-balancing",content:"queryserver"},{heading:"load-balancing",content:"phoenix.queryserver.zookeeper.acl.username"},{heading:"load-balancing",content:"Username for optional DIGEST ZooKeeper ACL."},{heading:"load-balancing",content:"phoenix"},{heading:"load-balancing",content:"phoenix.queryserver.zookeeper.acl.password"},{heading:"load-balancing",content:"Password for optional DIGEST ZooKeeper ACL."},{heading:"load-balancing",content:"phoenix"}],headings:[{id:"query-server-overview",content:"Overview"},{id:"clients",content:"Clients"},{id:"query-server-installation",content:"Installation"},{id:"query-server-usage",content:"Usage"},{id:"server",content:"Server"},{id:"client",content:"Client"},{id:"wire-api-documentation",content:"Wire API documentation"},{id:"impersonation",content:"Impersonation"},{id:"query-server-metrics",content:"Metrics"},{id:"query-server-configuration",content:"Configuration"},{id:"server-instantiation",content:"Server Instantiation"},{id:"https",content:"HTTPS"},{id:"secure-cluster-connection",content:"Secure Cluster Connection"},{id:"server-connection-cache",content:"Server Connection Cache"},{id:"server-statement-cache",content:"Server Statement Cache"},{id:"impersonation-1",content:"Impersonation"},{id:"query-server-metrics-config",content:"Metrics"},{id:"query-server-additions",content:"Query Server Additions"},{id:"load-balancing",content:"Load balancing"}]};const h=[{depth:2,url:"#query-server-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:3,url:"#clients",title:e.jsx(e.Fragment,{children:"Clients"})},{depth:2,url:"#query-server-installation",title:e.jsx(e.Fragment,{children:"Installation"})},{depth:2,url:"#query-server-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#server",title:e.jsx(e.Fragment,{children:"Server"})},{depth:3,url:"#client",title:e.jsx(e.Fragment,{children:"Client"})},{depth:2,url:"#wire-api-documentation",title:e.jsx(e.Fragment,{children:"Wire API documentation"})},{depth:2,url:"#impersonation",title:e.jsx(e.Fragment,{children:"Impersonation"})},{depth:2,url:"#query-server-metrics",title:e.jsx(e.Fragment,{children:"Metrics"})},{depth:2,url:"#query-server-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#server-instantiation",title:e.jsx(e.Fragment,{children:"Server Instantiation"})},{depth:3,url:"#https",title:e.jsx(e.Fragment,{children:"HTTPS"})},{depth:3,url:"#secure-cluster-connection",title:e.jsx(e.Fragment,{children:"Secure Cluster Connection"})},{depth:3,url:"#server-connection-cache",title:e.jsx(e.Fragment,{children:"Server Connection Cache"})},{depth:3,url:"#server-statement-cache",title:e.jsx(e.Fragment,{children:"Server Statement Cache"})},{depth:3,url:"#impersonation-1",title:e.jsx(e.Fragment,{children:"Impersonation"})},{depth:3,url:"#query-server-metrics-config",title:e.jsx(e.Fragment,{children:"Metrics"})},{depth:2,url:"#query-server-additions",title:e.jsx(e.Fragment,{children:"Query Server Additions"})},{depth:3,url:"#load-balancing",title:e.jsx(e.Fragment,{children:"Load balancing"})}];function i(t){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:`The Phoenix Query Server provides an alternative means for interaction with
Phoenix and HBase.`}),`
`,e.jsx(n.h2,{id:"query-server-overview",children:"Overview"}),`
`,e.jsxs(n.p,{children:[`Phoenix 4.4 introduces a stand-alone server that exposes Phoenix to "thin"
clients. It is based on the `,e.jsx(n.a,{href:"https://calcite.apache.org/avatica",children:"Avatica"}),` component of
`,e.jsx(n.a,{href:"https://calcite.apache.org",children:"Apache Calcite"}),`. The query server is comprised of a Java server that
manages Phoenix Connections on the clients' behalf.`]}),`
`,e.jsx(n.p,{children:`With the introduction of the
Protobuf transport, Avatica is moving towards backwards compatibility with the
provided thin JDBC driver. There are no such backwards compatibility guarantees
for the JSON API.`}),`
`,e.jsx(n.p,{children:`To repeat, there is no guarantee of backwards compatibility with the JSON transport;
however, compatibility with the Protobuf transport is stabilizing (although, not
tested thoroughly enough to be stated as "guaranteed").`}),`
`,e.jsx(n.h3,{id:"clients",children:"Clients"}),`
`,e.jsx(n.p,{children:`The primary client implementation
is currently a JDBC driver with minimal dependencies. The default and
primary transport mechanism since Phoenix 4.7 is Protobuf, the older JSON mechanism can still
be enabled.
The distribution includes the sqlline-thin.py CLI client that uses the JDBC thin client.`}),`
`,e.jsxs(n.p,{children:[`The Phoenix project also maintains the Python driver
`,e.jsx(n.a,{href:"https://phoenix.apache.org/python.html",children:"phoenixdb"}),"."]}),`
`,e.jsxs(n.p,{children:["The Avatica ",e.jsx(n.a,{href:"https://calcite.apache.org/avatica/docs/go_client_reference.html",children:"Go client"}),`
can also be used.`]}),`
`,e.jsx(n.p,{children:"Proprietary ODBC drivers are also available for Windows and Linux."}),`
`,e.jsx(n.h2,{id:"query-server-installation",children:"Installation"}),`
`,e.jsx(n.p,{children:`In the 4.4-4.14 and 5.0 releases the query server and its JDBC client are part of the standard Phoenix
distribution. They require no additional dependencies or installation.`}),`
`,e.jsx(n.p,{children:`After the 4.15 and 5.1 release, the query server has been unbundled into the phoenix-queryserver
repository, and its version number has been reset to 6.0.`}),`
`,e.jsxs(n.p,{children:[`Download the latest source or binary release from the
`,e.jsx(n.a,{href:"/downloads",children:"Download page"}),`,
or check out the development version from
`,e.jsx(n.a,{href:"https://github.com/apache/phoenix-queryserver",children:"GitHub"}),"."]}),`
`,e.jsx(n.p,{children:`Either unpack the binary distribution, or build it from source. See BUILDING.md
in the source distribution on how to build.`}),`
`,e.jsx(n.h2,{id:"query-server-usage",children:"Usage"}),`
`,e.jsx(n.h3,{id:"server",children:"Server"}),`
`,e.jsx(n.p,{children:`The standalone Query Server distribution does not contain the necessary
Phoenix (thick) client library by default.`}),`
`,e.jsx(n.p,{children:`If using the standalone library you will either need to rebuild it from source to include the
client library (See BUILDING.md), or manually copy the phoenix thick client library
into the installation directory.`}),`
`,e.jsxs(n.p,{children:["The server component is managed through ",e.jsx(n.code,{children:"bin/queryserver.py"}),`. Its usage is as
follows`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bin/queryserver.py"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [start"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"|"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"stop]"})]})})})}),`
`,e.jsx(n.p,{children:`When invoked with no arguments, the query server is launched in the foreground,
with logging directed to the console.`}),`
`,e.jsxs(n.p,{children:["The first argument is an optional ",e.jsx(n.code,{children:"start"})," or ",e.jsx(n.code,{children:"stop"}),` command to the daemon. When
either of these are provided, it will take appropriate action on a daemon
process, if it exists.`]}),`
`,e.jsx(n.p,{children:"Any subsequent arguments are passed to the main class for interpretation."}),`
`,e.jsxs(n.p,{children:[`The server is packaged in a standalone jar,
`,e.jsx(n.code,{children:"phoenix-queryserver-<version>.jar"}),". This jar, the phoenix-client.jar and ",e.jsx(n.code,{children:"HBASE_CONF_DIR"}),` on the
classpath are all that is required to launch the server.`]}),`
`,e.jsx(n.h3,{id:"client",children:"Client"}),`
`,e.jsxs(n.p,{children:[`Phoenix provides two mechanisms for interacting with the query server. A JDBC
driver is provided in the standalone
`,e.jsx(n.code,{children:"phoenix-queryserver-client-<version>.jar"}),`. The script
`,e.jsx(n.code,{children:"bin/sqlline-thin.py"})," is available for the command line."]}),`
`,e.jsx(n.p,{children:"The JDBC connection string is composed as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>[;option=value...]"})})})})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<scheme>"}),` specifies the transport protocol (http or https) used when communicating with the
server.`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<server-hostname>"})," is the name of the host offering the service."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"<port>"})," is the port number on which the host is listening. Default is ",e.jsx(n.code,{children:"8765"}),`,
though this is configurable (see below).`]}),`
`,e.jsxs(n.p,{children:["The full list of options that can be provided via the JDBC URL string is ",e.jsx(n.a,{href:"https://calcite.apache.org/avatica/docs/client_reference.html",children:`available
in the Avatica documentation`}),"."]}),`
`,e.jsxs(n.p,{children:["The script ",e.jsx(n.code,{children:"bin/sqlline-thin.py"}),` is intended to behave identically to its
sibling script `,e.jsx(n.code,{children:"bin/sqlline.py"}),". It supports the following usage options."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bin/sqlline-thin.py"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [[scheme://]host[:port]] [sql_file]"})]})})})}),`
`,e.jsxs(n.p,{children:[`The first optional argument is a connection URL, as described previously. When
not provided, `,e.jsx(n.code,{children:"scheme"})," defaults to ",e.jsx(n.code,{children:"http"}),", ",e.jsx(n.code,{children:"host"})," to ",e.jsx(n.code,{children:"localhost"}),", and ",e.jsx(n.code,{children:"port"}),` to
`,e.jsx(n.code,{children:"8765"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bin/sqlline-thin.py"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" http://localhost:8765"})]})})})}),`
`,e.jsx(n.p,{children:"The second optional parameter is a sql file from which to read commands."}),`
`,e.jsx(n.h2,{id:"wire-api-documentation",children:"Wire API documentation"}),`
`,e.jsx(n.p,{children:`The API itself is documented in the Apache Calcite project as it is the Avatica
API -- there is no wire API defined in Phoenix itself.`}),`
`,e.jsx(n.p,{children:e.jsx(n.a,{href:"https://calcite.apache.org/avatica/docs/json_reference.html",children:"JSON API"})}),`
`,e.jsx(n.p,{children:e.jsx(n.a,{href:"https://calcite.apache.org/avatica/docs/protobuf_reference.html",children:"Protocol Buffer API"})}),`
`,e.jsxs(n.p,{children:[`For more information in building clients in other languages that work with
Avatica, please feel free to reach out to the `,e.jsx(n.a,{href:"mailto:dev@calcite.apache.org",children:"Apache Calcite dev mailing list"}),"."]}),`
`,e.jsx(n.h2,{id:"impersonation",children:"Impersonation"}),`
`,e.jsx(n.p,{children:`By default, the Phoenix Query Server executes queries on behalf of the end-user. HBase permissions
are enforced given the end-user, not the Phoenix Query Server's identity. In some cases, it may
be desirable to execute the query as some other user -- this is referred to as "impersonation".
This can enable workflows where a trusted user has the privilege to run queries for other users.`}),`
`,e.jsxs(n.p,{children:["This can be enabled by setting the configuration property ",e.jsx(n.code,{children:"phoenix.queryserver.withRemoteUserExtractor"}),`
to `,e.jsx(n.code,{children:"true"}),`. The URL of the Query Server can be modified to include the required request parameter.
For example, to let "bob" to run a query as "alice", the following JDBC URL could be used:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"jdbc:phoenix:thin:url=http://localhost:8765?doAs=alice"})})})})}),`
`,e.jsxs(n.p,{children:[`The standard Hadoop "proxyuser" configuration keys are checked to validate if the "real" remote user
is allowed to impersonate the "doAs" user. See the `,e.jsx(n.a,{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Superusers.html",children:"Hadoop documentation"}),`
for more information on how to configure these rules.`]}),`
`,e.jsx(n.p,{children:`As a word of warning: there is no end-to-end test coverage for the HBase 0.98 and 1.1 Phoenix releases
because of missing test-related code in those HBase releases. While we expect no issues on these
Phoenix release lines, we recommend additional testing by the user to verify that there are no issues.`}),`
`,e.jsx(n.h2,{id:"query-server-metrics",children:"Metrics"}),`
`,e.jsxs(n.p,{children:[`By default, the Phoenix Query Server exposes various Phoenix global client metrics via JMX (for HBase versions 1.3 and up).
The list of metrics are available `,e.jsx(n.a,{href:"/docs/features/metrics",children:"here"}),"."]}),`
`,e.jsxs(n.p,{children:["PQS Metrics use ",e.jsx(n.a,{href:"https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Metrics.html",children:"Hadoop Metrics 2"})," internally for metrics publishing. Hence it publishes various JVM related metrics. Metrics can be filtered based on certain tags, which can be configured by the property specified in hbase-site.xml on the classpath. Further details are provided in Configuration section."]}),`
`,e.jsx(n.h2,{id:"query-server-configuration",children:"Configuration"}),`
`,e.jsx(n.p,{children:`Server components are spread across a number of java packages, so effective
logging configuration requires updating multiple packages. The default server
logging configuration sets the following log levels:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"log4j.logger.org.apache.calcite.avatica"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=INFO"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"log4j.logger.org.apache.phoenix.queryserver.server"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=INFO"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"log4j.logger.org.eclipse.jetty.server"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=INFO"})]})]})})}),`
`,e.jsxs(n.p,{children:[`As of the time of writing, the underlying Avatica component respects the
following configuration options exposed via `,e.jsx(n.code,{children:"hbase-site.xml"}),"."]}),`
`,e.jsx(n.h3,{id:"server-instantiation",children:"Server Instantiation"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.http.port"})}),e.jsx(n.td,{children:"Port the server listens on."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"8765"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.metafactory.class"})}),e.jsxs(n.td,{children:["Avatica ",e.jsx(n.code,{children:"Meta.Factory"})," implementation class."]}),e.jsx(n.td,{children:e.jsx(n.code,{children:"org.apache.phoenix.queryserver.server.PhoenixMetaFactoryImpl"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.serialization"})}),e.jsxs(n.td,{children:["Transport/serialization format (",e.jsx(n.code,{children:"PROTOBUF"})," or ",e.jsx(n.code,{children:"JSON"}),")."]}),e.jsx(n.td,{children:e.jsx(n.code,{children:"PROTOBUF"})})]})]})]}),`
`,e.jsx(n.h3,{id:"https",children:"HTTPS"}),`
`,e.jsxs(n.p,{children:["HTTPS support is only available in unbundled ",e.jsx(n.code,{children:"phoenix-queryserver"})," versions."]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.tls.enabled"})}),e.jsx(n.td,{children:"Enables HTTPS transport. When enabled, keystore/truststore files and passwords are also required."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"false"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.tls.keystore"})}),e.jsx(n.td,{children:"Keystore file containing the HTTPS private key."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.tls.keystore.password"})}),e.jsx(n.td,{children:"Password for HTTPS keystore."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"empty string"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.tls.truststore"})}),e.jsx(n.td,{children:"Keystore file containing the HTTPS certificate."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.tls.truststore.password"})}),e.jsx(n.td,{children:"Password for HTTPS truststore."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"empty string"})})]})]})]}),`
`,e.jsx(n.h3,{id:"secure-cluster-connection",children:"Secure Cluster Connection"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"hbase.security.authentication"})}),e.jsxs(n.td,{children:["When set to ",e.jsx(n.code,{children:"kerberos"}),", server logs in before initiating Phoenix connections."]}),e.jsx(n.td,{children:e.jsxs(n.em,{children:["specified in ",e.jsx(n.code,{children:"hbase-default.xml"})]})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.keytab.file"})}),e.jsx(n.td,{children:"Key for keytab file lookup."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.kerberos.principal"})}),e.jsx(n.td,{children:"Kerberos principal for authentication; also used for SPNEGO if HTTP principal is not configured."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.http.keytab.file"})}),e.jsxs(n.td,{children:["Keytab for SPNEGO auth; required if ",e.jsx(n.code,{children:"phoenix.queryserver.kerberos.http.principal"})," is set; falls back to ",e.jsx(n.code,{children:"phoenix.queryserver.keytab.file"}),"."]}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.http.kerberos.principal"})}),e.jsxs(n.td,{children:["Kerberos principal for SPNEGO auth; falls back to ",e.jsx(n.code,{children:"phoenix.queryserver.kerberos.principal"}),"."]}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.kerberos.http.principal"})}),e.jsxs(n.td,{children:["Deprecated; use ",e.jsx(n.code,{children:"phoenix.queryserver.http.kerberos.principal"}),"."]}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.kerberos.allowed.realms"})}),e.jsx(n.td,{children:"Additional Kerberos realms allowed for SPNEGO auth."}),e.jsx(n.td,{children:e.jsx(n.em,{children:"unset"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.dns.nameserver"})}),e.jsx(n.td,{children:"DNS hostname."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"default"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.dns.interface"})}),e.jsx(n.td,{children:"Network interface name for DNS queries."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"default"})})]})]})]}),`
`,e.jsx(n.h3,{id:"server-connection-cache",children:"Server Connection Cache"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.connectioncache.concurrency"})}),e.jsx(n.td,{children:"Connection cache concurrency level."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"10"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.connectioncache.initialcapacity"})}),e.jsx(n.td,{children:"Connection cache initial capacity."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"100"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.connectioncache.maxcapacity"})}),e.jsx(n.td,{children:"Connection cache maximum capacity; LRU eviction begins near this point."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"1000"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.connectioncache.expiryduration"})}),e.jsx(n.td,{children:"Connection cache expiration duration."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"10"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.connectioncache.expiryunit"})}),e.jsxs(n.td,{children:["Time unit for ",e.jsx(n.code,{children:"avatica.connectioncache.expiryduration"}),"."]}),e.jsx(n.td,{children:e.jsx(n.code,{children:"MINUTES"})})]})]})]}),`
`,e.jsx(n.h3,{id:"server-statement-cache",children:"Server Statement Cache"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.statementcache.concurrency"})}),e.jsx(n.td,{children:"Statement cache concurrency level."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"100"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.statementcache.initialcapacity"})}),e.jsx(n.td,{children:"Statement cache initial capacity."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"1000"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.statementcache.maxcapacity"})}),e.jsx(n.td,{children:"Statement cache maximum capacity; LRU eviction begins near this point."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"10000"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.statementcache.expiryduration"})}),e.jsx(n.td,{children:"Statement cache expiration duration."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"5"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"avatica.statementcache.expiryunit"})}),e.jsxs(n.td,{children:["Time unit for ",e.jsx(n.code,{children:"avatica.statementcache.expiryduration"}),"."]}),e.jsx(n.td,{children:e.jsx(n.code,{children:"MINUTES"})})]})]})]}),`
`,e.jsx(n.h3,{id:"impersonation-1",children:"Impersonation"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.withRemoteUserExtractor"})}),e.jsx(n.td,{children:"If true, extracts impersonated user from request param instead of authenticated HTTP user."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"false"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.remoteUserExtractor.param"})}),e.jsx(n.td,{children:"HTTP request parameter name for impersonated user."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"doAs"})})]})]})]}),`
`,e.jsx(n.h3,{id:"query-server-metrics-config",children:"Metrics"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsx(n.tbody,{children:e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.client.metrics.tag"})}),e.jsxs(n.td,{children:["Tag for filtering Phoenix global client metrics emitted by PQS in ",e.jsx(n.code,{children:"hadoop-metrics2.properties"}),"."]}),e.jsx(n.td,{children:e.jsx(n.code,{children:"FAT_CLIENT"})})]})})]}),`
`,e.jsx(n.h2,{id:"query-server-additions",children:"Query Server Additions"}),`
`,e.jsx(n.p,{children:`The Phoenix Query Server is meant to be horizontally scalable which means that it
is a natural fit for add-on features like service discovery and load balancing.`}),`
`,e.jsx(n.h3,{id:"load-balancing",children:"Load balancing"}),`
`,e.jsxs(n.p,{children:["The Query Server can use off-the-shelf HTTP load balancers such as the ",e.jsx(n.a,{href:"https://httpd.apache.org",children:"Apache HTTP Server"}),`,
`,e.jsx(n.a,{href:"https://nginx.org",children:"nginx"}),", or ",e.jsx(n.a,{href:"https://haproxy.org",children:"HAProxy"}),`. The primary requirement of
using these load balancers is that the implementation must implement "sticky session" (when a client
communicates with a backend server, that client continues to talk to that backend server). The Query Server also
provides some bundled functionality for load balancing using ZooKeeper.`]}),`
`,e.jsxs(n.p,{children:[`The ZooKeeper-based load balancer functions by automatically registering PQS instances in
ZooKeeper and then allows clients to query the list of available servers. This implementation, unlike
the others mentioned above, requires that client use the advertised information to make a routing decision.
In this regard, this ZooKeeper-based approach is more akin to a service-discovery layer than a traditional
load balancer. This load balancer implementation does `,e.jsx(n.em,{children:"not"}),` support SASL-based (Kerberos) ACLs in
ZooKeeper (see `,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4085",children:"PHOENIX-4085"}),")."]}),`
`,e.jsx(n.p,{children:"The following properties configure this load balancer:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Property"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.loadbalancer.enabled"})}),e.jsx(n.td,{children:"If true, PQS registers itself in ZooKeeper for load balancing."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"false"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.base.path"})}),e.jsx(n.td,{children:"Root znode where PQS instances register themselves."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"/phoenix"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.service.name"})}),e.jsx(n.td,{children:"Unique name to identify this PQS instance."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"queryserver"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.zookeeper.acl.username"})}),e.jsx(n.td,{children:"Username for optional DIGEST ZooKeeper ACL."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix.queryserver.zookeeper.acl.password"})}),e.jsx(n.td,{children:"Password for optional DIGEST ZooKeeper ACL."}),e.jsx(n.td,{children:e.jsx(n.code,{children:"phoenix"})})]})]})]})]})}function l(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{s as _markdown,l as default,a as extractedReferences,o as frontmatter,c as structuredData,h as toc};
