# Phoenix Query Server

The Phoenix Query Server provides an alternative means for interaction with
Phoenix and HBase. Soon this will enable access from environments other than
the JVM.

## Overview

Phoenix 4.4 introduces a stand-alone server that exposes Phoenix to "thin"
clients. It is based on the [Avatica](https://calcite.apache.org/avatica) component of
[Apache Calcite](https://calcite.apache.org). The query server is comprised of a Java server that
manages Phoenix Connections on the clients' behalf. The client implementation
is currently a JDBC driver with minimal dependencies. Two transport mechanisms
are current supported: JSON and Protocol Buffers (available as of Phoenix 4.7
as the default). There's also a sqlline script that uses the thin client.

Avatica is still relatively early in its life-cycle. With the introduction of the
Protobuf transport, Avatica is moving towards backwards compatibility with the
provided thin JDBC driver. There are no such backwards compatibility guarantees
for the JSON API.

To repeat, there is no guarantee of backwards compatibility with the JSON transport;
however, compatibility with the Protobuf transport is stabilizing (although, not
tested thoroughly enough to be stated as "guaranteed").

## Installation

The query server and its JDBC client are part of the standard Phoenix
distribution. They require no additional dependencies.

## Usage

### Server

The server component is managed through `bin/queryserver.py`. Its usage is as
follows

    bin/queryserver.py [start|stop]

When invoked with no arguments, the query server is launched in the foreground,
with logging directed to the console.

The first argument is an optional `start` or `stop` command to the daemon. When
either of these are provided, it will take appropriate action on a daemon
process, if it exists.

Any subsequent arguments are passed to the main class for interpretation.

The server is packaged in a standalone jar,
`phoenix-server-<version>-runnable.jar`. This jar and `HBASE_CONF_DIR` on the
classpath are all that is required to launch the server.

### Client

Phoenix provides two mechanisms for interacting with the query server. A JDBC
driver is provided in the standalone
`phoenix-<version>-thin-client.jar`. The script
`bin/sqlline-thin.py` is available for the command line.

The JDBC connection string is composed as follows:

    jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>[;option=value...]

`<scheme>` specifies the transport protocol used when communicating with the
server. The only supported transport at this time is `http`.

`<server-hostname>` is the name of the host offering the service.

`<port>` is the port number on which the host is listening. Default is `8765`,
though this is configurable (see below).

A full list of options that can be provided via the JDBC URL string is [available
in the below table](#jdbc_url_options)

The script `bin/sqlline-thin.py` is intended to behave identically to its
sibling script `bin/sqlline.py`. It supports the following usage options.

    bin/sqlline-thin.py [[scheme://]host[:port]] [sql_file]

The first optional argument is a connection URL, as described previously. When
not provided, `scheme` defaults to `http`, `host` to `localhost`, and `port` to
`8765`.

    bin/sqlline-thin.py http://localhost:8765

The second optional parameter is a sql file from which to read commands.

## Wire API documentation

The API itself is documented in the Apache Calcite project as it is the Avatica
API -- there is no wire API defined in Phoenix itself.

[JSON API](http://calcite.apache.org/avatica/docs/json_reference.html)

[Protocol Buffer API](http://calcite.apache.org/avatica/docs/protobuf_reference.html)

For more information in building clients in other languages that work with
Avatica, please feel free to reach out to the [Apache Calcite dev mailing list](mailto:dev@calcite.apache.org).

## Impersonation

By default, the Phoenix Query Server executes queries on behalf of the end-user. HBase permissions
are enforced given the end-user, not the Phoenix Query Server's identity. In some cases, it may
be desirable to execute the query as some other user -- this is referred to as "impersonation".
This can enable workflows where a trusted user has the privilege to run queries for other users.

This can be enabled by setting the configuration property `phoenix.queryserver.withRemoteUserExtractor`
to `true`. The URL of the Query Server can be modified to include the required request parameter.
For example, to let "bob" to run a query as "alice", the following JDBC URL could be used:

    jdbc:phoenix:thin:url=http://localhost:8765?doAs=alice

The standard Hadoop "proxyuser" configuration keys are checked to validate if the "real" remote user
is allowed to impersonate the "doAs" user. See the [Hadoop documentation](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/Superusers.html)
for more information on how to configure these rules.

As a word of warning: there is no end-to-end test coverage for the HBase 0.98 and 1.1 Phoenix releases
because of missing test-related code in those HBase releases. While we expect no issues on these
Phoenix release lines, we recommend additional testing by the user to verify that there are no issues.

## Configuration

Server components are spread across a number of java packages, so effective
logging configuration requires updating multiple packages. The default server
logging configuration sets the following log levels:

    log4j.logger.org.apache.calcite.avatica=INFO
    log4j.logger.org.apache.phoenix.queryserver.server=INFO
    log4j.logger.org.eclipse.jetty.server=INFO

As of the time of this writing, the underlying Avatica component respects the
following configuration options. They are exposed via `hbase-site.xml`
configuration.

<table border="1">
  <tbody>
    <tr>
      <td colspan="3"><b>Configurations relating to the server instantiation.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>phoenix.queryserver.http.port</small></td>
      <td style="text-align: left;">Specifies a port the server will listen on. Default is 8765.</td>
      <td>8765</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.metafactory.class</small></td>
      <td style="text-align: left;">The Avatica Meta.Factory class to instantiate.</td>
      <td>org.apache.phoenix.queryserver.server.PhoenixMetaFactoryImpl</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.serialization</small></td>
      <td style="text-align: left;">The transport/serialization format, either PROTOBUF or JSON.</td>
      <td>PROTOBUF</td>
    </tr>
    <tr><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td colspan="3"><b>Configurations relating to server connecting to a secure cluster.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>hbase.security.authentication</small></td>
      <td style="text-align: left;">When set to "kerberos", the server will attempt to log in before initiating Phoenix connections.</td>
      <td><em>Specified hbase-default.xml</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.keytab.file</small></td>
      <td style="text-align: left;">The key to look for keytab file.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.kerberos.principal</small></td>
      <td style="text-align: left;">The kerberos principal to use when authenticating. If
      phoenix.queryserver.kerberos.http.principal is not configured, this principal specified will be also used to
      both authenticate SPNEGO connections and to connect to HBase.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.http.keytab.file</small></td>
      <td style="text-align: left;">The keytab file to use for authenticating SPNEGO connections. This configuration MUST be specified if
      phoenix.queryserver.kerberos.http.principal is configured. phoenix.queryserver.keytab.file will be used if this
      property is undefined.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.http.kerberos.principal</small></td>
      <td style="text-align: left;">The kerberos principal to use when authenticating SPNEGO connections.
      phoenix.queryserver.kerberos.principal will be used if this property is undefined.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.kerberos.http.principal</small></td>
      <td style="text-align: left;">Deprecated, use phoenix.queryserver.http.kerberos.principal instead.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.kerberos.allowed.realms</small></td>
      <td style="text-align: left;">A comma-separated list of Kerberos realms, other than that of the PQS's
      HTTP principal's realm, that should be allowed to authenticate with PQS via SPNEGO.</td>
      <td><em>unset</em></td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.dns.nameserver</small></td>
      <td style="text-align: left;">The DNS hostname</td>
      <td>default</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.dns.interface</small></td>
      <td style="text-align: left;">The name of the network interface to query for DNS.</td>
      <td>default</td>
    </tr>
    <tr><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td colspan="3"><b>Configurations relating to the server connection cache.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>avatica.connectioncache.concurrency</small></td>
      <td style="text-align: left;">Connection cache concurrency level. Default is 10.</td>
      <td>10</td>
    </tr>
    <tr>
      <td><small>avatica.connectioncache.initialcapacity</small></td>
      <td style="text-align: left;">Connection cache initial capacity. Default is 100.</td>
      <td>100</td>
    </tr>
    <tr>
      <td><small>avatica.connectioncache.maxcapacity</small></td>
      <td style="text-align: left;">
        Connection cache maximum capacity. Approaching this point, the cache
        will start to evict least recently used connection objects. Default
        is 1000.
      </td>
      <td>1000</td>
    </tr>
    <tr>
      <td><small>avatica.connectioncache.expiryduration</small></td>
      <td style="text-align: left;">
        Connection cache expiration duration. Any connections older than this
        value will be discarded. Default is 10 minutes.
      </td>
      <td>10</td>
    </tr>
    <tr>
      <td><small>avatica.connectioncache.expiryunit</small></td>
      <td style="text-align: left;">
        Connection cache expiration unit. Unit modifier applied to the value
        provided in avatica.connectioncache.expiryunit. Default is minutes.
      </td>
      <td>MINUTES</td>
    </tr>
    <tr><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td colspan="3" id="jdbc_url_options"><b>JDBC URL options.</b></td>
    </tr>
    <tr>
      <td><small>url</small></td>
      <td style="text-align: left;">
        The URL of the QueryServer.
      </td>
      <td>null</td>
    </tr>
    <tr>
      <td><small>serialization</small></td>
      <td style="text-align: left;">
        The client-side analogy to phoenix.queryserver.serialization in the server
        to control how the client should serialize data to send to the QueryServer.
      </td>
      <td>PROTOBUF</td>
    </tr>
    <tr>
      <td><small>timeZone</small></td>
      <td style="text-align: left;">
        The time zone the JDBC connection should use. If not provided, the
        time zone will be specified by JVM. The value of this should be parseable by
        Java's TimeZone class.
      </td>
      <td>null</td>
    </tr>
    <tr><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td colspan="3"><b>Configurations relating to the server statement cache.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>avatica.statementcache.concurrency</small></td>
      <td style="text-align: left;">Statement cache concurrency level. Default is 100.</td>
      <td>100</td>
    </tr>
    <tr>
      <td><small>avatica.statementcache.initialcapacity</small></td>
      <td style="text-align: left;">Statement cache initial capacity. Default is 1000.</td>
      <td>1000</td>
    </tr>
    <tr>
      <td><small>avatica.statementcache.maxcapacity</small></td>
      <td style="text-align: left;">
        Statement cache maximum capacity. Approaching this point, the cache
        will start to evict least recently used statement objects. Default
        is 10000.
      </td>
      <td>10000</td>
    </tr>
    <tr>
      <td><small>avatica.statementcache.expiryduration</small></td>
      <td style="text-align: left;">
        Statement cache expiration duration. Any statements older than this
        value will be discarded. Default is 5 minutes.
      </td>
      <td>5</td>
    </tr>
    <tr>
      <td><small>avatica.statementcache.expiryunit</small></td>
      <td style="text-align: left;">
        Statement cache expiration unit. Unit modifier applied to the value
        provided in avatica.statementcache.expiryunit. Default is minutes.
      </td>
      <td>MINUTES</td>
    </tr>
    <tr><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td colspan="3"><b>Configurations relating to impersonation.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>phoenix.queryserver.withRemoteUserExtractor</small></td>
      <td style="text-align: left;">
        Boolean which controls if a remote user to impersonate should be
        extracted from the HTTP request parameter made by that user instead of the
        HTTP-authenticated user name (which is the default).
      </td>
      <td>false</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.remoteUserExtractor.param</small></td>
      <td style="text-align: left;">
        The name of the HTTP request parameter to use to extract the user name
        to execute the query as.
      </td>
      <td>doAs</td>
    </tr>
  </tbody>
</table>

## Query Server Additions

The Phoenix Query Server is meant to be horizontally scalable which means that it
is a natural fit add-on features like service discovery and load balancing.

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

The following are configuration properties used to configure this load balancer:


<table border="1">
  <tbody>
    <tr>
      <td colspan="3"><b>Configurations relating to the ZooKeeper-based load balancer.</b></td>
    </tr>
    <tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default</b></td></tr>
    <tr>
      <td><small>phoenix.queryserver.loadbalancer.enabled</small></td>
      <td style="text-align: left;">Should PQS register itself in ZooKeeper for the load balancer.</td>
      <td>false</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.base.path</small></td>
      <td style="text-align: left;">Root znode the PQS instance should register itself to.</td>
      <td>/phoenix</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.service.name</small></td>
      <td style="text-align: left;">A unique name to identify this PQS instance from others.</td>
      <td>queryserver</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.zookeeper.acl.username</small></td>
      <td style="text-align: left;">Name to set for a DIGEST ZooKeeper ACL, optional.</td>
      <td>phoenix</td>
    </tr>
    <tr>
      <td><small>phoenix.queryserver.zookeeper.acl.password</small></td>
      <td style="text-align: left;">Password to set for a DIGEST ZooKeeper ACL, optional.</td>
      <td>phoenix</td>
    </tr>
  </tbody>
</table>
