# Phoenix Storage Handler for Apache Hive

The Apache Phoenix Storage Handler is a plugin that enables Apache Hive access to Phoenix tables from the Apache Hive command line using HiveQL.

## Prerequisites

* Phoenix 4.8.0+
* Hive 1.2.1+

## Hive Setup

Make phoenix-version-hive.jar available for Hive:

Step 1: Add to hive-env.sh:

```
HIVE_AUX_JARS_PATH=<path to jar>
```

Step 2: Add a property to hive-site.xml so that Hive MapReduce jobs can use the .jar:

```
<property>
  <name>hive.aux.jars.path</name>
  <value>file://<path></value>
</property>
```

## Table Creation and Deletion
The Phoenix Storage Handler supports both INTERNAL and EXTERNAL Hive tables.

### Create INTERNAL Table
For INTERNAL tables, Hive manages the lifecycle of the table and data. When a Hive table is created, a corresponding Phoenix table is also created.
Once the Hive table is dropped, the Phoenix table is also deleted.

```sql
	create table phoenix_table (
	  s1 string,
	  i1 int,
	  f1 float,
	  d1 double
	)
	STORED BY 'org.apache.phoenix.hive.PhoenixStorageHandler'
	TBLPROPERTIES (
	  "phoenix.table.name" = "phoenix_table",
	  "phoenix.zookeeper.quorum" = "localhost",
	  "phoenix.zookeeper.znode.parent" = "/hbase",
	  "phoenix.zookeeper.client.port" = "2181",
	  "phoenix.rowkeys" = "s1, i1",
	  "phoenix.column.mapping" = "s1:s1, i1:i1, f1:f1, d1:d1",
	  "phoenix.table.options" = "SALT_BUCKETS=10, DATA_BLOCK_ENCODING='DIFF'"
	);
```

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
