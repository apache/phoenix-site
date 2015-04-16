# Phoenix Query Server

The Phoenix Query Server provides an alternative means for interaction with
Phoenix and HBase. Soon this will enable access from environments other than
the JVM.

## Overview

Phoenix 4.4 introduces a stand-alone server that exposes Phoenix to "thin"
clients. It is based on the [Avatica][avatica] component of
[Apache Calcite][calcite]. The query server is comprised of a Java server that
manages Phoenix Connections on the clients' behalf. The client implementation
is currently a JDBC driver with minimal dependencies. The transport mechanism
is currently JSON encoded requests over HTTP transport. There's also a sqlline
script that uses the thin client.

Avatica is relatively early in its life-cycle. The RPC API has not yet
solidified, so <b><em>there is no promise of backward compatibility at this
time</em></b>. Future versions of Avatica should include additional encoding
and transport mechanisms. Client implementations for non-Java languages are
anticipated as well.

To repeat, <big><b><em>there is no promise of backward compatibility at this
time</em></b></big>.

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
`phoenix-<version>-query-server-thin-client.jar`. Its connection The script
`bin/sqlline-thin.py` is available for the command line.

The JDBC connection string is composed as follows:

    jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>

`<scheme>` specifies the transport protocol used when communicating with the
server. The only supported transport at this time is `http`.

`<server-hostname>` is the name of the host offering the service.

`<port>` is the port number on which the host is listening. Default is `8765`,
though this is configurable (see below).

The script `bin/sqlline-thin.py` is intended to behave identically to its
sibling script `bin/sqlline.py`. It supports the following usage options.

    bin/sqlline-thin.py [[scheme://]host[:port]] [sql_file]

The first optional argument is a connection URL, as described previously. When
not provided, `scheme` defaults to `http`, `host` to `localhost`, and `port` to
`8765`.

The second optional parameter is a sql file from which to read commands.

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
      <td style="text-align: left;">The kerberos principal to use when authenticating.</td>
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
  </tbody>
</table>

[avatica]: https://github.com/apache/incubator-calcite/blob/master/doc/avatica.md
[calcite]: http://calcite.incubator.apache.org/

