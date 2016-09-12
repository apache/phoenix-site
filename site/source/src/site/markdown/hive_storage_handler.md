# Hive Storage Handler 

Hive Storage Handler is a Apache Phoenix plugin that allows access to Phoenix tables from Apache Hive CLI using HiveQL.

## Prerequisites

* Phoenix 4.8.0+
* Hive 1.2.1+ 

## Hive Setup

Make phoenix-version-hive.jar available for Hive:

1. Add to hive-env.sh:

```
HIVE_AUX_JARS_PATH=<path to jar>
```

2. Add property to hive-site.xml. That will allow Hive Map-Reduce jobs to use this jar:

```
<property> 
  <name>hive.aux.jars.path</name> 
  <value>file://<path></value>
</property>
```

## Table creation and deletion
Phoenix Storage Handler supports both INTERNAL and EXTERNAL Hive tables. 

### Create INTERNAL table. 
For internal tables Hive manages the lifecycle of the table and data. When hive table is created, a corresponding Phoenix table will be created as well. 
Once the hive table is dropped, the Phoenix table will be deleted too. 

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

### Create EXTERNAL table
For external tables Hive works with an existing Phoenix table and manages only Hive metadata. Deleting an external table from Hive only deletes Hive metadata and keeps Phoenix table 

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
    * Specified the Phoenix table name 
    * Default : the same as hive table                
2. phoenix.zookeeper.quorum           
    * Specified the ZK quorum for HBase
    * Default : localhost
3. phoenix.zookeeper.znode.parent    
    * Specified the ZK parent node for HBase
    * Default : /hbase
4. phoenix.zookeeper.client.port 
    * Specified the ZK port
    * Default : 2181   
5. phoenix.rowkeys                 
    * The list of columns that would match the RowKey in Phoenix table
    * Required
6. phoenix.column.mapping         
    * mappings between column names for hive and phoenix. See Limitations for details.
 


## Data ingestion/delete/update 
Data ingestion can be done by all ways that supported by Hive or Phoenix:
Hive: 

```
	 insert into table T values (....);
	 inseet into table T select c1,c2,c3 from source_table;
```

Phoenix: 

```
	 upsert into table T values (.....);
         Phoenix CSV BulkLoad tools
```

All delete/update should be performed on Phoenix side. See *Limitation* for more details

## Additinal configuration options

Those options can be set in Hive CLI 

### Performance tuning

Parameters | Default Value | Description
------------ | ------------- | -------------
phoenix.upsert.batch.size | 1000 | Batch size for upsert.
[phoenix-table-name].disable.wal | false | It temporarily sets table attribute  `DISABLE_WAL = true`. May be used to improve the performance
[phoenix-table-name].auto.flush | false | When WAL is disabled and if this value is true. Then flush memstore to hfile.

### Query Data
You can use HiveQL for querying data on phoenix table. A single table query as fast as Phoenix CLI when `hive.fetch.task.conversion=more` and `hive.exec.parallel=true`.

Parameters | Default Value | Description
------------ | ------------- | -------------
hbase.scan.cache | 100 | Read row size for an unit request.
hbase.scan.cacheblock | false | Whether or not cache block.
split.by.stats | false | If true, mappers will use table statistics. One mapper per guide post.
[hive-table-name].reducer.count | 1 | Number of reducer. In tez mode is affected only single-table query. See Limitations
[phoenix-table-name].query.hint | | Hint for phoenix query (like NO_INDEX)

## Limitations
1. Hive update/delete requires transaction manager support on Hive side as well as using transaction engine on Phoenix side. Futher Hive/Phoenix JIRAs will be listed in *Resource* section.
2. Column mapping doesn't work correctly with mapping row key columns
3. Currently MR and Tez jobs always have a single reducer.  
 
## Resources
* [PHOENIX-2743] (https://issues.apache.org/jira/browse/PHOENIX-2743) : Implementation, accepted by Apache Phoenix community. Original pull request contains modification for Hive classes.
* [PHOENIX-331] (https://issues.apache.org/jira/browse/PHOENIX-331) : Another implementation with support of Hive 0.98. Outdated
