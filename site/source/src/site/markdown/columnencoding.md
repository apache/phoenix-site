#Storage Formats

As part of Phoenix 4.10, we have reduced the on disk storage size to improve overall performance by implementing the following enhancements:

* Introduce a layer of indirection between Phoenix column names and the corresponding HBase column qualifiers.
* Support a new encoding scheme for immutable tables that packs all values into a single cell per column family

For more details on column mapping and immutable data encoding, see [this blog](https://blogs.apache.org/phoenix/entry/column-mapping-and-immutable-data).


###How to use column mapping?
One can set the column mapping property only at the time of creating the table. Before deciding on using column mapping, you need to think about how many columns you expect in a table and its view hierarchy to have in the lifecycle. For various mapping schemes, below are the limits on number of columns:

Config/Property Value | Max # of columns
------------ | ------------- | -------------
1 | 255
2 | 65535
3 | 16777215
4 | 2147483647
NONE | no limit(theoretically)  

For mutable tables, this limit applies to columns in **all** column families. For immutable tables, the limit applies to **per** column family. By default, any new phoenix tables will be using the column mapping feature. These defaults could be overridden by setting below config to the desired value in hbase-site.xml.

Table type | Default Column mapping | Config
------------ | ------------- | -------------
Mutable/Immutable | 2 byte qualifiers | phoenix.default.column.encoded.bytes.attrib

Keep in mind that this config controls global level defaults that would apply to all tables. If you would like to use a different mapping scheme than this global default, then you can use the COLUMN_ENCODED_BYTES table property.

```	
CREATE TABLE T
(    
a_string varchar not null,  
col1 integer  
CONSTRAINT pk PRIMARY KEY (a_string)  
)  
COLUMN_ENCODED_BYTES = 1;
```

###How to use immutable data encoding?
Like column mapping, one can set the immutable data encoding only at the time of creating the table. Through our performance testing, we have found that using SINGLE_CELL_ARRAY_WITH_OFFSETS generally provides really good performance improvement and space savings. Below are some scenarios in when it would be better to use ONE_CELL_PER_COLUMN encoding instead.
 
- Data is sparse i.e. less than 50% of the columns have values  
- Size of data within a column family gets too big. Our general guidance here is that with default HBase block size of 64K, if data within a column family grows beyond 50K then we shouldn’t be using SINGLE_CELL_ARRAY_WITH_OFFSETS.
- For immutable tables that are going to have views on them

By default, immutable non-multitenant tables are created using the two byte column mapping and the SINGLE_CELL_ARRAY_WITH_OFFSETS data encoding. On the other hand, immutable multi-tenant tables are created with two byte column mapping scheme and ONE_COLUMN_PER_CELL data encoding. This is because we generally expect users to create tenant specific views on the base multi-tenant tables which as mentioned in the criteria above is more suitable for ONE_CELL_PER_COLUMN encoding. Like column mapping, if you would like to change these global defaults, you can do so by setting below configs in the hbase-site.xml.

Immutable Table type | Immutable storage scheme | Config
------------ | ------------- | -------------
Multi-tenant | ONE_CELL_PER_COLUMN | phoenix.default.multitenant.immutable.storage.scheme
Non multi-tenant | SINGLE_CELL_ARRAY_WITH_OFFSETS | phoenix.default.immutable.storage.scheme

One could also provide specific immutable storage scheme and column mapping scheme using the table properties IMMUTABLE_STORAGE_SCHEME and COLUMN_ENCODED_BYTES. For example - 

```
CREATE IMMUTABLE TABLE T   
(  
a_string varchar not null,   
col1 integer  
CONSTRAINT pk PRIMARY KEY (a_string)  
)   
IMMUTABLE_STORAGE_SCHEME = SINGLE_CELL_ARRAY_WITH_OFFSETS,  
COLUMN_ENCODED_BYTES = 1;  
```   

One could chose to not use the SINGLE_CELL_ARRAY_WITH_OFFSETS encoding but still use one of the number based column mapping. Here is an example - 

```
CREATE IMMUTABLE TABLE T   
(  
a_string varchar not null,  
col1 integer  
CONSTRAINT pk PRIMARY KEY (a_string)  
)  
IMMUTABLE_STORAGE_SCHEME = ONE_CELL_PER_COLUMN,   
COLUMN_ENCODED_BYTES = 1;  
```

When using SINGLE_CELL_ARRAY_WITH_OFFSETS encoding, one has to use a number based column mapping scheme. An attempt to use SINGLE_CELL_ARRAY_WITH_OFFSETS with COLUMN_ENCODED_BYTES = NONE will throw an error.

###How to disable column mapping?
To disable column mapping across all new tables, you need to set <code>phoenix.default.column.encoded.bytes.attrib</code> to 0. One can also leave it on globally and have it disabled selectively for a table by setting the COLUMN_ENCODED_BYTES = 0 property in the create table statement. 
