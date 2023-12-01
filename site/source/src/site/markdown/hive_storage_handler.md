# Phoenix Storage Handler for Apache Hive

The Apache Phoenix Storage Handler is a plugin that enables Apache Hive access to Phoenix tables from the Apache Hive command line using HiveQL.


## Prerequisites

This document describes the plugin available in the phoenix-connectors source repo, as of December 2023.

* Phoenix 5.1.0+
* Hive 3.1.2+
* phoenix-connectors 6.0.0-SNAPSHOT

The Phoenix Storage handler currently only supports Hive 3.1. 
It has only been tested with Hive Hive 3.1.3, and Phoenix 5.1.3.

A variant for Hive 4 is planned to be provided after Hive 4.0.0 has been released


## Building

The Phoenix Storage Handler used to be part of the main Phoenix repo, but it has been refactored into the separate phoenix-connectors repo after the release of Phoenix 5.0.
At the time of writing there is no released version of the connectors project, it must be built from the git source repository HEAD.

Official releases will be available at the [Download](download.html) page.

Check the value of the hbase.version property in the root pom.xml
If it is older than HBase 2.5.0, then you need to rebuild HBase locally as described
in the BUILDING.md file in the main phoenix repository.

Check out the HEAD version of the https://github.com/apache/phoenix-connectors repo.
Build it with the 
```
mvn clean package
```
command.
The binary distribution will be created in phoenix5-connectors-assembly/target direcory.

The driver is built for Hbase 2.4.x  by default.

To build it for other Hbase versions the *hbase.version*, *hbase.compat.version*, *hadoop.version*, *zookeeper.version* and *hbase-thirdparty-version* properties must be to the versions used by HBase. hbase.compat.version is the matching hbase-compat-module in Phoenix, the other versions can be copied from the root pom.xml from the sources of the HBase release.

Fore example, to build with HBase 2.1.10 (re-built with -Dhadoop.profile=3.0), use the following command:

```
mvn clean package -Dhbase.version=2.1.10 -Dhbase.compat.version=2.1.6 -Dhadoop.version=3.0.3 -Dzookeeper.version=3.4.10 -Dhbase-thirdparty-version=2.1.0
```


## Preparing Hive 3

Hive 3.1 ships with Hbase 2.0 beta, which is incompatible with Phoenix.
To use the Phoenix Storage handler HBase and its dependencies have to be removed from Hive.

To remove the shipped HBase 2.0 beta perform the following on each Hive node:

1. Create a backup of the Hive /lib directory

2. Remove the HBase dependencies from the /lib directory:

```
mkdir ../lib-removed
mv hbase-* javax.inject* jcodings-* jersey-* joni-* osgi-resource-locator-* ../lib-removed/
```

Even though Hive ships with HBase jars, it includes a mechanism to load the `hbase mapredcp` jars automatically.

To ensure that Hive finds and uses the correct HBase JARs and hbase-site.xml, set the following
environment variables in hive-env.sh on each node, or make sure that they are set propery in the enviroment:

HBASE_HOME: The root directory of the HBase installation.
HBASE_CONF_DIR: The directory where hbase-site.xml resides. Defaults to /etc/hbase/conf, or if it doesn't exist, to $HBASE_HOME/conf.
HBASE_BIN_DIR: The directory which holds the `hbase` command. Defaults to $HBASE_HOME/bin.

It is assumed that the HADOOP variables are already set correctly, and the HBase libraries and up-date hbase-site.xml are available on each Hive node.


## Hive Setup

It is necessary to make the `phoenix5-hive-shaded-6.0.0-SNAPSHOT-shaded.jar` available for every hive component.
There are many way to achiveve this, one of the simpler ones is to use the `HIVE_AUX_JARS_PATH` environment variable.

If hive-env.sh already sets HIVE_AUX_JARS_PATH, then copy the connector JAR there.
Otherwise, create a world-readble directory on the system, and copy the connector JAR there. then add a

```
HIVE_AUX_JARS_PATH=<PATH TO DIRECTORY>
```
line to hive-env.sh

This must be performed on every Hive node.

## Table Creation and Deletion
The Phoenix Storage Handler supports only EXTERNAL Hive tables.

### Create EXTERNAL Table
For EXTERNAL tables, Hive works with an existing Phoenix table and manages only Hive metadata. Dropping an EXTERNAL table from Hive deletes only Hive metadata but does not delete the Phoenix table.

```sql
create external table ext_table (
  i1 int,
  s1 string,
  f1 float,
  d1 decimal
)
STORED BY 'org.apache.phoenix.hive.PhoenixStorageHandler'
TBLPROPERTIES (
  "phoenix.table.name" = "ext_table",
  "phoenix.zookeeper.quorum" = "localhost",
  "phoenix.zookeeper.znode.parent" = "/hbase",
  "phoenix.zookeeper.client.port" = "2181",
  "phoenix.rowkeys" = "i1",
  "phoenix.column.mapping" = "i1:i1, s1:s1, f1:f1, d1:d1"
);
```

Specifying the 
### Properties

1. phoenix.table.name
    * Specifies the Phoenix table name
    * Default: the same as the Hive table                
2. phoenix.zookeeper.quorum           
    * Specifies the ZooKeeper quorum for HBase
    * Default: localhost
3. phoenix.zookeeper.znode.parent    
    * Specifies the ZooKeeper parent node for HBase
    * Default: /hbase
4. phoenix.zookeeper.client.port
    * Specifies the ZooKeeper port
    * Default: 2181   
5. phoenix.rowkeys                 
    * The list of columns to be the primary key in a Phoenix table
    * Required
6. phoenix.column.mapping         
    * Mappings between column names for Hive and Phoenix. See [Limitations](#Limitations) for details.

The phoenix.zookeper properties are optional, if not specified then the the values from hbase-site.xml will be used.

## Data Ingestion, Deletions, and Updates
Data ingestion can be done by all ways that Hive and Phoenix support:

Hive:

```
	 insert into table T values (....);
	 insert into table T select c1,c2,c3 from source_table;
```

Phoenix:

```
	 upsert into table T values (.....);
         Phoenix CSV BulkLoad tools
```

All delete and update operations should be performed on the Phoenix side. See [Limitations](#Limitations) for more details.

## Additional Configuration Options

Those options can be set in a Hive command-line interface (CLI) environment.

### Performance Tuning

Parameter | Default Value | Description
------------ | ------------- | -------------
phoenix.upsert.batch.size | 1000 | Batch size for upsert.
[phoenix-table-name].disable.wal | false | Temporarily sets the table attribute  `DISABLE_WAL` to `true`. Sometimes used to improve performance
[phoenix-table-name].auto.flush | false | When WAL is disabled and if this value is `true`, then MemStore is flushed to an HFile.

Disabling WAL can lead to data loss.

### Query Data
You can use HiveQL for querying data in a Phoenix table. A Hive query on a single table can be as fast as running the query in the Phoenix CLI with the following property settings: `hive.fetch.task.conversion=more` and `hive.exec.parallel=true`

Parameter | Default Value | Description
------------ | ------------- | -------------
hbase.scan.cache | 100 | Read row size for a unit request
hbase.scan.cacheblock | false | Whether or not cache block
split.by.stats | false | If true, mappers use table statistics. One mapper per guide post.
[hive-table-name].reducer.count | 1 | Number of reducers. In Tez mode, this affects only single-table queries. See [Limitations](#Limitations).
[phoenix-table-name].query.hint | | Hint for Phoenix query (for example, `NO_INDEX`)

## Limitations <a id="Limitations"></a>
* Hive update and delete operations require transaction manager support on both Hive and Phoenix sides. Related Hive and Phoenix JIRAs are listed in the [Resources](#Resources) section.
* Column mapping does not work correctly with mapping row key columns.
* MapReduce and Tez jobs always have a single reducer.  

## Resources <a id="Resources"></a>
* [PHOENIX-2743] (https://issues.apache.org/jira/browse/PHOENIX-2743) : Implementation, accepted by Apache Phoenix community. Original pull request contains modification for Hive classes.
* [PHOENIX-331] (https://issues.apache.org/jira/browse/PHOENIX-331) : An outdated implementation with support of Hive 0.98.

