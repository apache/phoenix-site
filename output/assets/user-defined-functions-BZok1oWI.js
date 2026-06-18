import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let l=`As of Phoenix 4.4.0 we have added the ability to allow users to create and deploy
their own custom or domain-specific UDFs to the cluster.

## Overview

Users can create temporary or permanent user-defined (domain-specific) scalar functions.
UDFs can be used like built-in functions in queries such as \`SELECT\`, \`UPSERT\`, \`DELETE\`, and when creating functional indexes.
Temporary functions are session-scoped and are not accessible from other sessions.
Permanent function metadata is stored in the \`SYSTEM.FUNCTION\` table.
Phoenix also supports tenant-specific functions. Functions created in one tenant-specific connection are not visible to other tenant-specific connections.
Only global tenant (no-tenant) functions are visible to all connections.

Phoenix leverages the HBase dynamic class loader to load UDF JARs from HDFS at the Phoenix client and region server without restarting services.

## Configuration

Add the following parameters to \`hbase-site.xml\` on the Phoenix client:

\`\`\`xml
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
  <value>\${hbase.tmp.dir}/hbase</value>
  <description>The directory shared by region servers and into
    which HBase persists.  The URL should be 'fully-qualified'
    to include the filesystem scheme.  For example, to specify the
    HDFS directory '/hbase' where the HDFS instance's namenode is
    running at namenode.example.org on port 9000, set this value to:
    hdfs://namenode.example.org:9000/hbase.  By default, we write
    to whatever \${hbase.tmp.dir} is set too -- usually /tmp --
    so change this configuration or else all data will be lost on
    machine restart.</description>
</property>
<property>
  <name>hbase.dynamic.jars.dir</name>
  <value>\${hbase.rootdir}/lib</value>
  <description>
    The directory from which the custom udf jars can be loaded
    dynamically by the phoenix client/region server without the need to restart. However,
    an already loaded udf class would not be un-loaded. See
    HBASE-1936 for more details.
  </description>
</property>
\`\`\`

**The last two configuration values should match the HBase server-side configuration.**

As with other configuration properties, \`phoenix.functions.allowUserDefinedFunctions\`
may be specified at JDBC connection time as a connection property.

Example:

\`\`\`java
Properties props = new Properties();
props.setProperty("phoenix.functions.allowUserDefinedFunctions", "true");
Connection conn = DriverManager.getConnection("jdbc:phoenix:localhost", props);
\`\`\`

The following optional parameter is used by the dynamic class loader to copy JARs from HDFS into the local filesystem:

\`\`\`xml
<property>
  <name>hbase.local.dir</name>
  <value>\${hbase.tmp.dir}/local/</value>
  <description>Directory on the local filesystem to be used
    as a local storage.</description>
</property>
\`\`\`

## Creating Custom UDFs

<Steps>
  <Step>
    Implement your custom UDF by following [How to write custom
    UDF](#how-to-write-custom-udf).
  </Step>

  <Step>
    Compile your code into a JAR, then deploy the JAR to HDFS. It is recommended
    to add the JAR to the HDFS directory configured by \`hbase.dynamic.jars.dir\`.
  </Step>

  <Step>
    Run the 

    [\`CREATE FUNCTION\`](/docs/grammar#create-function)

     query.
  </Step>
</Steps>

## Dropping the UDFs

You can drop functions using the [\`DROP FUNCTION\`](/docs/grammar#drop-function) query.
Dropping a function deletes the metadata for that function from Phoenix.

## How to write custom UDF

You can follow these steps to write your UDF (for more detail, see [this blog post](http://phoenix-hbase.blogspot.in/2013/04/how-to-add-your-own-built-in-function.html)):

* Create a new class derived from \`org.apache.phoenix.expression.function.ScalarFunction\`.
* Implement \`getDataType()\` to determine the function return type.
* Implement \`evaluate()\` to calculate the result for each row.
  The method receives \`org.apache.phoenix.schema.tuple.Tuple\` with the current row state and an \`org.apache.hadoop.hbase.io.ImmutableBytesWritable\` to populate with the function result.
  The method returns \`false\` if there is not enough information to calculate the result (usually because one argument is unknown), and \`true\` otherwise.

Below are additional optimization-related steps.

* To contribute to scan start/stop key formation, custom functions need to override the following two methods from \`ScalarFunction\`:

  \`\`\`java
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
  \`\`\`

* Additionally, to enable \`ORDER BY\` optimization or in-place \`GROUP BY\`, override:

  \`\`\`java
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
  \`\`\`

## Limitations

* The JAR containing UDFs must be manually added to and deleted from HDFS. There is ongoing work to add SQL statements for JAR add/remove ([PHOENIX-1890](https://issues.apache.org/jira/browse/PHOENIX-1890)).
* The dynamic class loader copies UDF JARs to \`{hbase.local.dir}/jars\` at the Phoenix client and region server when a UDF is used in queries. These JARs must be deleted manually when a function is deleted.
* Functional indexes must be rebuilt manually if the function implementation changes ([PHOENIX-1907](https://issues.apache.org/jira/browse/PHOENIX-1907)).
* Once loaded, a JAR is not unloaded. Use a different JAR for modified implementations to avoid restarting the cluster ([PHOENIX-1907](https://issues.apache.org/jira/browse/PHOENIX-1907)).
* To list functions, query the \`SYSTEM."FUNCTION"\` table ([PHOENIX-1921](https://issues.apache.org/jira/browse/PHOENIX-1921)).
`,o={title:"User-defined Functions",description:"Create, deploy, and manage custom Phoenix UDFs with configuration, implementation steps, and known limitations."},d=[{href:"#how-to-write-custom-udf"},{href:"/docs/grammar#create-function"},{href:"/docs/grammar#drop-function"},{href:"http://phoenix-hbase.blogspot.in/2013/04/how-to-add-your-own-built-in-function.html"},{href:"https://issues.apache.org/jira/browse/PHOENIX-1890"},{href:"https://issues.apache.org/jira/browse/PHOENIX-1907"},{href:"https://issues.apache.org/jira/browse/PHOENIX-1907"},{href:"https://issues.apache.org/jira/browse/PHOENIX-1921"}],c={contents:[{heading:void 0,content:`As of Phoenix 4.4.0 we have added the ability to allow users to create and deploy
their own custom or domain-specific UDFs to the cluster.`},{heading:"user-defined-functions-overview",content:`Users can create temporary or permanent user-defined (domain-specific) scalar functions.
UDFs can be used like built-in functions in queries such as SELECT, UPSERT, DELETE, and when creating functional indexes.
Temporary functions are session-scoped and are not accessible from other sessions.
Permanent function metadata is stored in the SYSTEM.FUNCTION table.
Phoenix also supports tenant-specific functions. Functions created in one tenant-specific connection are not visible to other tenant-specific connections.
Only global tenant (no-tenant) functions are visible to all connections.`},{heading:"user-defined-functions-overview",content:"Phoenix leverages the HBase dynamic class loader to load UDF JARs from HDFS at the Phoenix client and region server without restarting services."},{heading:"user-defined-functions-configuration",content:"Add the following parameters to hbase-site.xml on the Phoenix client:"},{heading:"user-defined-functions-configuration",content:"The last two configuration values should match the HBase server-side configuration."},{heading:"user-defined-functions-configuration",content:`As with other configuration properties, phoenix.functions.allowUserDefinedFunctions
may be specified at JDBC connection time as a connection property.`},{heading:"user-defined-functions-configuration",content:"Example:"},{heading:"user-defined-functions-configuration",content:"The following optional parameter is used by the dynamic class loader to copy JARs from HDFS into the local filesystem:"},{heading:"creating-custom-udfs",content:`Implement your custom UDF by following How to write custom
UDF.`},{heading:"creating-custom-udfs",content:`Compile your code into a JAR, then deploy the JAR to HDFS. It is recommended
to add the JAR to the HDFS directory configured by hbase.dynamic.jars.dir.`},{heading:"dropping-the-udfs",content:`You can drop functions using the DROP FUNCTION query.
Dropping a function deletes the metadata for that function from Phoenix.`},{heading:"how-to-write-custom-udf",content:"You can follow these steps to write your UDF (for more detail, see this blog post):"},{heading:"how-to-write-custom-udf",content:"Create a new class derived from org.apache.phoenix.expression.function.ScalarFunction."},{heading:"how-to-write-custom-udf",content:"Implement getDataType() to determine the function return type."},{heading:"how-to-write-custom-udf",content:`Implement evaluate() to calculate the result for each row.
The method receives org.apache.phoenix.schema.tuple.Tuple with the current row state and an org.apache.hadoop.hbase.io.ImmutableBytesWritable to populate with the function result.
The method returns false if there is not enough information to calculate the result (usually because one argument is unknown), and true otherwise.`},{heading:"how-to-write-custom-udf",content:"Below are additional optimization-related steps."},{heading:"how-to-write-custom-udf",content:"To contribute to scan start/stop key formation, custom functions need to override the following two methods from ScalarFunction:"},{heading:"how-to-write-custom-udf",content:"Additionally, to enable ORDER BY optimization or in-place GROUP BY, override:"},{heading:"user-defined-functions-limitations",content:"The JAR containing UDFs must be manually added to and deleted from HDFS. There is ongoing work to add SQL statements for JAR add/remove (PHOENIX-1890)."},{heading:"user-defined-functions-limitations",content:"The dynamic class loader copies UDF JARs to {hbase.local.dir}/jars at the Phoenix client and region server when a UDF is used in queries. These JARs must be deleted manually when a function is deleted."},{heading:"user-defined-functions-limitations",content:"Functional indexes must be rebuilt manually if the function implementation changes (PHOENIX-1907)."},{heading:"user-defined-functions-limitations",content:"Once loaded, a JAR is not unloaded. Use a different JAR for modified implementations to avoid restarting the cluster (PHOENIX-1907)."},{heading:"user-defined-functions-limitations",content:'To list functions, query the SYSTEM."FUNCTION" table (PHOENIX-1921).'}],headings:[{id:"user-defined-functions-overview",content:"Overview"},{id:"user-defined-functions-configuration",content:"Configuration"},{id:"creating-custom-udfs",content:"Creating Custom UDFs"},{id:"dropping-the-udfs",content:"Dropping the UDFs"},{id:"how-to-write-custom-udf",content:"How to write custom UDF"},{id:"user-defined-functions-limitations",content:"Limitations"}]};const p=[{depth:2,url:"#user-defined-functions-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:2,url:"#user-defined-functions-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#creating-custom-udfs",title:e.jsx(e.Fragment,{children:"Creating Custom UDFs"})},{depth:2,url:"#dropping-the-udfs",title:e.jsx(e.Fragment,{children:"Dropping the UDFs"})},{depth:2,url:"#how-to-write-custom-udf",title:e.jsx(e.Fragment,{children:"How to write custom UDF"})},{depth:2,url:"#user-defined-functions-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function a(s){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components},{Step:n,Steps:t}=i;return n||r("Step"),t||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:`As of Phoenix 4.4.0 we have added the ability to allow users to create and deploy
their own custom or domain-specific UDFs to the cluster.`}),`
`,e.jsx(i.h2,{id:"user-defined-functions-overview",children:"Overview"}),`
`,e.jsxs(i.p,{children:[`Users can create temporary or permanent user-defined (domain-specific) scalar functions.
UDFs can be used like built-in functions in queries such as `,e.jsx(i.code,{children:"SELECT"}),", ",e.jsx(i.code,{children:"UPSERT"}),", ",e.jsx(i.code,{children:"DELETE"}),`, and when creating functional indexes.
Temporary functions are session-scoped and are not accessible from other sessions.
Permanent function metadata is stored in the `,e.jsx(i.code,{children:"SYSTEM.FUNCTION"}),` table.
Phoenix also supports tenant-specific functions. Functions created in one tenant-specific connection are not visible to other tenant-specific connections.
Only global tenant (no-tenant) functions are visible to all connections.`]}),`
`,e.jsx(i.p,{children:"Phoenix leverages the HBase dynamic class loader to load UDF JARs from HDFS at the Phoenix client and region server without restarting services."}),`
`,e.jsx(i.h2,{id:"user-defined-functions-configuration",children:"Configuration"}),`
`,e.jsxs(i.p,{children:["Add the following parameters to ",e.jsx(i.code,{children:"hbase-site.xml"})," on the Phoenix client:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">phoenix.functions.allowUserDefinedFunctions</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">true</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">fs.hdfs.impl</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hdfs.DistributedFileSystem</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.rootdir</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">${hbase.tmp.dir}/hbase</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">The directory shared by region servers and into"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    which HBase persists.  The URL should be 'fully-qualified'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    to include the filesystem scheme.  For example, to specify the"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    HDFS directory '/hbase' where the HDFS instance's namenode is"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    running at namenode.example.org on port 9000, set this value to:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    hdfs://namenode.example.org:9000/hbase.  By default, we write"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    to whatever ${hbase.tmp.dir} is set too -- usually /tmp --"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    so change this configuration or else all data will be lost on"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    machine restart.</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.dynamic.jars.dir</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">${hbase.rootdir}/lib</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    The directory from which the custom udf jars can be loaded"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    dynamically by the phoenix client/region server without the need to restart. However,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    an already loaded udf class would not be un-loaded. See"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    HBASE-1936 for more details."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"The last two configuration values should match the HBase server-side configuration."})}),`
`,e.jsxs(i.p,{children:["As with other configuration properties, ",e.jsx(i.code,{children:"phoenix.functions.allowUserDefinedFunctions"}),`
may be specified at JDBC connection time as a connection property.`]}),`
`,e.jsx(i.p,{children:"Example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Properties props "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Properties"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenix.functions.allowUserDefinedFunctions"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:localhost"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", props);"})]})]})})}),`
`,e.jsx(i.p,{children:"The following optional parameter is used by the dynamic class loader to copy JARs from HDFS into the local filesystem:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.local.dir</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">${hbase.tmp.dir}/local/</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Directory on the local filesystem to be used"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    as a local storage.</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h2,{id:"creating-custom-udfs",children:"Creating Custom UDFs"}),`
`,e.jsxs(t,{children:[e.jsx(n,{children:e.jsxs(i.p,{children:["Implement your custom UDF by following ",e.jsx(i.a,{href:"#how-to-write-custom-udf",children:`How to write custom
UDF`}),"."]})}),e.jsx(n,{children:e.jsxs(i.p,{children:[`Compile your code into a JAR, then deploy the JAR to HDFS. It is recommended
to add the JAR to the HDFS directory configured by `,e.jsx(i.code,{children:"hbase.dynamic.jars.dir"}),"."]})}),e.jsxs(n,{children:["Run the ",e.jsx(i.a,{href:"/docs/grammar#create-function",children:e.jsx(i.code,{children:"CREATE FUNCTION"})})," query."]})]}),`
`,e.jsx(i.h2,{id:"dropping-the-udfs",children:"Dropping the UDFs"}),`
`,e.jsxs(i.p,{children:["You can drop functions using the ",e.jsx(i.a,{href:"/docs/grammar#drop-function",children:e.jsx(i.code,{children:"DROP FUNCTION"})}),` query.
Dropping a function deletes the metadata for that function from Phoenix.`]}),`
`,e.jsx(i.h2,{id:"how-to-write-custom-udf",children:"How to write custom UDF"}),`
`,e.jsxs(i.p,{children:["You can follow these steps to write your UDF (for more detail, see ",e.jsx(i.a,{href:"http://phoenix-hbase.blogspot.in/2013/04/how-to-add-your-own-built-in-function.html",children:"this blog post"}),"):"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Create a new class derived from ",e.jsx(i.code,{children:"org.apache.phoenix.expression.function.ScalarFunction"}),"."]}),`
`,e.jsxs(i.li,{children:["Implement ",e.jsx(i.code,{children:"getDataType()"})," to determine the function return type."]}),`
`,e.jsxs(i.li,{children:["Implement ",e.jsx(i.code,{children:"evaluate()"}),` to calculate the result for each row.
The method receives `,e.jsx(i.code,{children:"org.apache.phoenix.schema.tuple.Tuple"})," with the current row state and an ",e.jsx(i.code,{children:"org.apache.hadoop.hbase.io.ImmutableBytesWritable"}),` to populate with the function result.
The method returns `,e.jsx(i.code,{children:"false"})," if there is not enough information to calculate the result (usually because one argument is unknown), and ",e.jsx(i.code,{children:"true"})," otherwise."]}),`
`]}),`
`,e.jsx(i.p,{children:"Below are additional optimization-related steps."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["To contribute to scan start/stop key formation, custom functions need to override the following two methods from ",e.jsx(i.code,{children:"ScalarFunction"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/**"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" * Determines whether or not a function may be used to form"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* the start/stop key of a scan"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@return"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" the zero-based position of the argument to traverse"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*  into to look for a primary key column reference, or"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*  {@value #NO_TRAVERSAL} if the function cannot be used to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*  form the scan key."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*/"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getKeyFormationTraversalIndex"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" NO_TRAVERSAL;"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/**"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" * Manufactures a KeyPart used to construct the KeyRange given"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* a constant and a comparison operator."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@param"}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:" childPart"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" the KeyPart formulated for the child expression"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*  at the {"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@link"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" #"}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"getKeyFormationTraversalIndex()"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"} position."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@return"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" the KeyPart for constructing the KeyRange for this"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*  function."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*/"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" KeyPart "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"newKeyPart"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(KeyPart childPart) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Additionally, to enable ",e.jsx(i.code,{children:"ORDER BY"})," optimization or in-place ",e.jsx(i.code,{children:"GROUP BY"}),", override:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/**"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" * Determines whether or not the result of the function invocation"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* will be ordered in the same way as the input to the function."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* Returning YES enables an optimization to occur when a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* GROUP BY contains function invocations using the leading PK"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* column(s)."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@return"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" YES if the function invocation will always preserve order for"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* the inputs versus the outputs and false otherwise, YES_IF_LAST if the"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* function preserves order, but any further column reference would not"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* continue to preserve order, and NO if the function does not preserve"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"* order."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"*/"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OrderPreserving "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"preservesOrder"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OrderPreserving.NO;"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"user-defined-functions-limitations",children:"Limitations"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["The JAR containing UDFs must be manually added to and deleted from HDFS. There is ongoing work to add SQL statements for JAR add/remove (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1890",children:"PHOENIX-1890"}),")."]}),`
`,e.jsxs(i.li,{children:["The dynamic class loader copies UDF JARs to ",e.jsx(i.code,{children:"{hbase.local.dir}/jars"})," at the Phoenix client and region server when a UDF is used in queries. These JARs must be deleted manually when a function is deleted."]}),`
`,e.jsxs(i.li,{children:["Functional indexes must be rebuilt manually if the function implementation changes (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1907",children:"PHOENIX-1907"}),")."]}),`
`,e.jsxs(i.li,{children:["Once loaded, a JAR is not unloaded. Use a different JAR for modified implementations to avoid restarting the cluster (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1907",children:"PHOENIX-1907"}),")."]}),`
`,e.jsxs(i.li,{children:["To list functions, query the ",e.jsx(i.code,{children:'SYSTEM."FUNCTION"'})," table (",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1921",children:"PHOENIX-1921"}),")."]}),`
`]})]})}function k(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(a,{...s})}):a(s)}function r(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,k as default,d as extractedReferences,o as frontmatter,c as structuredData,p as toc};
