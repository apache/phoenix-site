# User-defined functions(UDFs)

As of Phoenix 4.4.0 we have added the ability to allow users to create and deploy
their own custom or domain-specific UDFs to the cluster.

## Overview

User can create temporary/permanent user-defined or domain-specific scalar functions.
The UDFs can be used same as built-in functions in the queries like select, upsert, 
delete, create functional indexes. Temporary functions are specific to a session/connection
and cannot be accessible in other sessions/connections. Permanent functions meta information
will be stored in system table called SYSTEM.FUNCTION. We are supporting tenant specific
functions. Functions created in a tenant specific connection are not visible to other 
tenant specific connections. Only global tenant(no tenant) specific functions are visible 
to all the connections.

We are leveraging HBase dynamic class loader to dynamically load the udf jars from HDFS 
at phoenix client and region server without restarting the services.

## Configuration

You will need to add the following parameters to `hbase-site.xml` at phoenix client.

```
<property>
  <name>phoenix.functions.allowUserDefinedFunctions</name>
  <value>true</value>
</property>
<property>
  <name>fs.hdfs.impl</name>
  <value>org.apache.hadoop.hdfs.DistributedFileSystem</value>
</property>
<property>
  <name>hbase.rootdir</name>
  <value>${hbase.tmp.dir}/hbase</value>
  <description>The directory shared by region servers and into
    which HBase persists.  The URL should be 'fully-qualified'
    to include the filesystem scheme.  For example, to specify the
    HDFS directory '/hbase' where the HDFS instance's namenode is
    running at namenode.example.org on port 9000, set this value to:
    hdfs://namenode.example.org:9000/hbase.  By default, we write
    to whatever ${hbase.tmp.dir} is set too -- usually /tmp --
    so change this configuration or else all data will be lost on
    machine restart.</description>
</property>
<property>
  <name>hbase.dynamic.jars.dir</name>
  <value>${hbase.rootdir}/lib</value>
  <description>
    The directory from which the custom udf jars can be loaded
    dynamically by the phoenix client/region server without the need to restart. However,
    an already loaded udf class would not be un-loaded. See
    HBASE-1936 for more details.
  </description>
</property>
```
<b><em>The last two configuration values should match with hbase server side configurations.</em></b>

As with other configuration properties, The property <code>phoenix.functions.allowUserDefinedFunctions</code>
may be specified at JDBC connection time as a connection property.

Example:

```
Properties props = new Properties();
props.setProperty("phoenix.functions.allowUserDefinedFunctions", "true");
Connection conn = DriverManager.getConnection("jdbc:phoenix:localhost", props);
```

Following is optional parameter which will be used by dynamic class loader 
to copy the jars from hdfs into local file system.

```
<property>
  <name>hbase.local.dir</name>
  <value>${hbase.tmp.dir}/local/</value>
  <description>Directory on the local filesystem to be used
    as a local storage.</description>
</property>
```


## Creating Custom UDFs

* To implement custom UDF you can follow the [steps](#How_to_write_custom_UDF) 
* After compiling your code to a jar, you need to deploy the jar into the HDFS. 
It would be better to add the jar to HDFS folder configured for hbase.dynamic.jars.dir.
* The final step is to run [CREATE FUNCTION](language/index.html#create_function) query.

## Dropping the UDFs

You can drop functions using the [DROP FUNCTION](language/index.html#drop_function) query. 
Drop function delete meta data of the function from phoenix.

### How to write custom UDF

You can follow these simple steps to write your UDF (for more detail, see 
[this](http://phoenix-hbase.blogspot.in/2013/04/how-to-add-your-own-built-in-function.html) blog post):

* create a new class derived from <code>org.apache.phoenix.expression.function.ScalarFunction</code>
* implement the <code>getDataType</code> method which determines the return type of the function
* implement the <code>evaluate</code> method which gets called to calculate the result for each row. 
The method is passed a <code>org.apache.phoenix.schema.tuple.Tuple</code> that has the current state 
of the row and an <code>org.apache.hadoop.hbase.io.ImmutableBytesWritable</code> that needs to be 
filled in to point to the result of the function execution. The method returns false if not enough 
information was available to calculate the result (usually because one of its arguments is unknown) 
and true otherwise.

Below are additional steps for optimizations 

* in order to have the possibility of contributing to the start/stop key of a scan, 
custom functions need to override the following two methods from ScalarFunction:

```
    /**
     * Determines whether or not a function may be used to form
     * the start/stop key of a scan
     * @return the zero-based position of the argument to traverse
     *  into to look for a primary key column reference, or
     *  {@value #NO_TRAVERSAL} if the function cannot be used to
     *  form the scan key.
     */
    public int getKeyFormationTraversalIndex() {
        return NO_TRAVERSAL;
    }

    /**
     * Manufactures a KeyPart used to construct the KeyRange given
     * a constant and a comparison operator.
     * @param childPart the KeyPart formulated for the child expression
     *  at the {@link #getKeyFormationTraversalIndex()} position.
     * @return the KeyPart for constructing the KeyRange for this
     *  function.
     */
    public KeyPart newKeyPart(KeyPart childPart) {
        return null;
    }
```
* Additionally, to enable an ORDER BY to be optimized out or a GROUP BY to be done in-place,:

```
    /**
     * Determines whether or not the result of the function invocation
     * will be ordered in the same way as the input to the function.
     * Returning YES enables an optimization to occur when a
     * GROUP BY contains function invocations using the leading PK
     * column(s).
     * @return YES if the function invocation will always preserve order for
     * the inputs versus the outputs and false otherwise, YES_IF_LAST if the
     * function preserves order, but any further column reference would not
     * continue to preserve order, and NO if the function does not preserve
     * order.
     */
    public OrderPreserving preservesOrder() {
        return OrderPreserving.NO;
    }
```

### Limitations
* The jar containing the UDFs must be manually added/deleted to/from HDFS. Adding new SQL statements for add/remove jars([PHOENIX-1890](https://issues.apache.org/jira/browse/PHOENIX-1890))
* Dynamic class loader copy the udf jars to <code>{hbase.local.dir}/jars</code> at the phoenix client/region server when the udf used in queries. The jars must be deleted manually once a function deleted.
* functional indexes need to manually be rebuilt if the function implementation changes([PHOENIX-1907](https://issues.apache.org/jira/browse/PHOENIX-1907))
* once loaded, a jar will not be unloaded, so you'll need to put modified implementations into a different jar to prevent having to bounce your cluster([PHOENIX-1907](https://issues.apache.org/jira/browse/PHOENIX-1907))
* to list the functions you need to query SYSTEM."FUNCTION" table([PHOENIX-1921](https://issues.apache.org/jira/browse/PHOENIX-1921)))
