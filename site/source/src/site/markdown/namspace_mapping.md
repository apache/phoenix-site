# Namespace Mapping

From v4.8.0 onwards, user can enable to map it's schema to the namespace so that any table created with schema will be created in the corresponding namespace of HBase.

Earlier, every table (with schema or without schema) was created in default namespace.

## Configuration
Parameters to enable namespace mapping:-

<table border="1">
    <tbody>
<tr><td><b>Property</b></td><td><b>Description</b></td><td><b>Default
</b></td></tr>
<tr><td><small>phoenix.schema.isNamespaceMappingEnabled</small></td><td style="text-align: left;">If it is enabled, then the tables created with schema will be mapped to namespace.This needs to be set at client and server both. if set once, should not be rollback. Old client will not work after this property is enabled.</td><td>false</td></tr>
<tr><td><small>phoenix.schema.mapSystemTablesToNamespace</small></td><td style="text-align: left;">Enabling this property will take affect when phoenix.connection.isNamespaceMappingEnabled is also set to true. If it is enabled, SYSTEM tables if present will automatically migrated to SYSTEM namespace. And If set to false , then system tables will be created in default namespace only. This needs to be set at client and server both.</td><td>true</td></tr>
</tbody></table>

## Grammer Available
Following DDL statements can be used to interact with schema.

* [CREATE SCHEMA](https://phoenix.apache.org/language/index.html#create_schema)

* [USE SCHEMA](https://phoenix.apache.org/language/index.html#use)

* [DROP SCHEMA](https://phoenix.apache.org/language/index.html#drop_schema) 


##F.A.Q
* [How to migrate existing tables with schema to namespace?](#how_to_migrate_existing_tables_with_schema_to_namespace)
* [How system tables will be migrated?](#how_system_tables_will_be_migrated)
* [What permissions are required to CREATE and DROP SCHEMA?](#What_permissions_are_required_to_CREATE_and_DROP_SCHEMA)
* [How schemas are mapped for different table types?](#how_schemas_are_mapped_for_different_table_type)
* [What is namespace and benefits of mapping table to namespace?](#What_is_namespace_and_benefits_of_mapping_table_to_namespace)

###<a id="how_to_migrate_existing_tables_with_schema_to_namespace"/> How to migrate existing tables with schema to namespace
For kerberized environment, run with the user who have sufficient permissiont("admin") to create a namespace.

Table will be mapped to namespace of name "schema_name" only , Currently there is no support migrating existing table to different schema or namespace.

Usage example:

Move table('table_name') to namespace of name 'schema_name'

    $  bin/psql.py <zookeeper> -m <schema_name>.<table_name>

###<a id="how_system_tables_will_be_migrated"/> How system tables will be migrated?
SYSTEM tables will be migrated automatically during first connection made after enabling phoenix.schema.mapSystemTablesToNamespace along with phoenix.schema.isNamespaceMappingEnabled.

###<a id="What_permissions_are_required_to_CREATE_and_DROP_SCHEMA"/> What permissions are required to CREATE and DROP SCHEMA?
User must have "admin" permission in HBase to execute CREATE and DROP SCHEMA successfully as these commands will internally create or delete the namespace.

Details for ACL management in HBase can be found [here](http://hbase.apache.org/book.html#hbase.accesscontrol.configuration)

###<a id="how_schemas_are_mapped_for_different_table_type"/> How schemas are mapped for different table types?
Schema support in Phoenix is similar to the other databases. 

Below table can help you in mapping of physical table to Phoenix table:-

DDL | Table Type | Physical Table | Description
------------ |------------ | ------------- | -------------
CREATE TABLE S.T (ID INTEGER PRIMARY KEY) | TABLE | S:T | Table T will be created in S namespace
CREATE INDEX IDX ON S.T(ID) (ID INTEGER PRIMARY KEY) | INDEX| S:IDX| Indexes will inherit the schema and namespace from table
CREATE VIEW V SELECT * FROM S.T| VIEW with default schema| S:T| View will not inherit the schema from parent table and can have default schema as well 
CREATE VIEW X.V SELECT * FROM S.T| VIEW with different schema than physical table| S:T| View will use the parent physical table only and can have different(or same) schema as well
CREATE VIEW S.V SELECT * FROM S.T| VIEW with same schema as of physical table| S:T| View will use the parent physical table only and can have different(or same) schema as well
CREATE VIEW idx on S.V| VIEW INDEX| S:_IDX_T| View indexes will also inherit the schema and map to corresponding namespace


###<a id="What_is_namespace_and_benefits_of_mapping_table_to_namespace"/> What is namespace and benefits of mapping table to namespace?
A namespace is a logical grouping of tables analogous to a database in relation database systems. This abstraction lays the groundwork for upcoming multi-tenancy related features:

* Quota Management - Restrict the amount of resources (i.e. regions, tables) a namespace can consume.
* Namespace Security Administration - Provide another level of security administration for tenants.
* Region server groups - A namespace/table can be pinned onto a subset of RegionServers thus guaranteeing a course level of isolation.

Details about Namespace Managment can be read from [here](http://hbase.apache.org/book.html#_namespace)
 
## Resources
* [PHOENIX-1311] (https://issues.apache.org/jira/browse/PHOENIX-1311) : For implementation details and discussion over the namespace mapping feature.
