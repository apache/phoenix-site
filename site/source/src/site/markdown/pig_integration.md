#Apache Pig Integration

Pig integration may be divided into two parts: a **StoreFunc** as a means to generate Phoenix-encoded data through Pig, and a **Loader** which enables Phoenix-encoded data to be read by Pig.

##Pig StoreFunc

The StoreFunc allows users to write data in Phoenix-encoded format to HBase tables using Pig scripts. This is a nice way to bulk upload data from a MapReduce job in parallel to a Phoenix table in HBase. All you need to specify is the endpoint address, HBase table name and a batch size. For example:

    A = load 'testdata' as (a:chararray, b:chararray, c:chararray, d:chararray, e: datetime); 
    STORE A into 'hbase://CORE.ENTITY_HISTORY' using
        org.apache.phoenix.pig.PhoenixHBaseStorage('localhost','-batchSize 5000');

The above reads a file 'testdata' and writes the elements to a table “CORE.ENTITY_HISTORY” in HBase that is running on localhost. First argument to this StoreFunc is the server, the 2nd argument is the batch size for upserts via Phoenix. The batch size is related to how many rows you are able to hold in memory. A good default is 1000 rows, but if your row is wide, you may want to decrease this.

Note that Pig types must be in sync with the target Phoenix data types. This StoreFunc tries best to cast based on input Pig types and target Phoenix data types, but it is recommended to provide an appropriate schema.

###Gotchas
It is advised that the upsert operation be idempotent. That is, trying to re-upsert data should not cause any inconsistencies. This is important in the case when a Pig job fails in process of writing to a Phoenix table. There is no notion of rollback (due to lack of transactions in HBase), and re-trying the upsert with PhoenixHBaseStorage must result in the same data in HBase table.

For example, let’s assume we are writing records n1...n10 to HBase. If the job fails in the middle of this process, we are left in an inconsistent state where n1...n7 made it to the phoenix tables but n8...n10 were missed. If we retry the same operation, n1...n7 would be re-upserted and n8...n10 would be upserted this time.

##Pig Loader
A Pig data loader allows users to read data from Phoenix backed HBase tables within a Pig script. 

The Load func provides two alternative ways to load data.
      
1. Given a table name, the following will load the data for all the columns in the HIRES table:

        A = load 'hbase://table/HIRES' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
    To restrict the list of columns, you may specify the column names as part of LOAD as shown below:

        A = load 'hbase://table/HIRES/ID,NAME' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');

    Here, only data for ID and NAME columns are returned.

2. Given a query, the following loads data for all those rows whose AGE column has a value of greater than 50:

        A = load 'hbase://query/SELECT ID,NAME FROM HIRES WHERE AGE > 50' using org.apache.phoenix.pig.PhoenixHBaseLoader('localhost');
    The LOAD func merely executes the given SQL query and returns the results. Though there is a provision to provide a query as part of LOAD, it is restricted to the following:

    * Only a SELECT query is allowed. No DML statements such as UPSERT or DELETE.
    * The query may not contain any GROUP BY, ORDER BY, LIMIT, or DISTINCT clauses.
    * The query may not contain any AGGREGATE functions.
	
In both the cases, the zookeeper quorum should be passed to the PhoenixHBaseLoader as an argument to the constructor.	
  
The Loadfunc makes best effort to map Phoenix Data Types to Pig datatype. You can have a look at org.apache.phoenix.pig.util.TypeUtil to see how each of Phoenix data type is mapped to Pig data type.
  
###Example
Determine the number of users by a CLIENT ID
  
**Ddl**

    CREATE TABLE HIRES( CLIENTID INTEGER NOT NULL, EMPID INTEGER NOT NULL, NAME VARCHAR CONSTRAINT pk PRIMARY KEY(CLIENTID,EMPID));
  
**Pig Script** 
  
    raw = LOAD 'hbase://table/HIRES USING org.apache.phoenix.pig.PhoenixHBaseLoader('localhost')';
    grpd = GROUP raw BY CLIENTID; 
    cnt = FOREACH grpd GENERATE group AS CLIENT,COUNT(raw);
    DUMP cnt;  

###Future Work
  1. Support for ARRAY data type. 
  2. Usage of expressions within the SELECT clause when providing a full query.
	 
