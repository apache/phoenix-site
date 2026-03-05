import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`The Apache Phoenix Storage Handler is a plugin that enables Apache Hive access to Phoenix tables from the Apache Hive command line using HiveQL.

## Prerequisites

This document describes the plugin available in the \`phoenix-connectors\` source repo, as of December 2023.

* Phoenix 5.1.0+
* Hive 3.1.2+
* phoenix-connectors \`6.0.0-SNAPSHOT\`

The Phoenix Storage handler currently only supports Hive 3.1.
It has only been tested with Hive Hive 3.1.3, and Phoenix 5.1.3.

A variant for Hive 4 is planned after Hive 4.0.0 is released.

## Building

The Phoenix Storage Handler used to be part of the main Phoenix repo, but it has been refactored into the separate \`phoenix-connectors\` repo after the release of Phoenix 5.0.
At the time of writing there is no released version of the connectors project, so it must be built from the Git source repository HEAD.

Official releases will be available on the [Downloads](/downloads) page.

Check the value of the \`hbase.version\` property in the root \`pom.xml\`.
If it is older than HBase 2.5.0, then you need to rebuild HBase locally as described
in \`BUILDING.md\` in the main Phoenix repository.

Check out the HEAD version of [https://github.com/apache/phoenix-connectors](https://github.com/apache/phoenix-connectors).
Build it with:

\`\`\`shell
mvn clean package
\`\`\`

The binary distribution will be created in \`phoenix5-connectors-assembly/target\`.

The driver is built for HBase 2.4.x by default.

To build it for other HBase versions, set \`hbase.version\`, \`hbase.compat.version\`, \`hadoop.version\`, \`zookeeper.version\`, and \`hbase-thirdparty-version\` to the versions used by HBase. \`hbase.compat.version\` is the matching \`hbase-compat\` module in Phoenix; other versions can be copied from the root \`pom.xml\` in the HBase source.

For example, to build with HBase 2.1.10 (rebuilt with \`-Dhadoop.profile=3.0\`), use:

\`\`\`shell
mvn clean package -Dhbase.version=2.1.10 -Dhbase.compat.version=2.1.6 -Dhadoop.version=3.0.3 -Dzookeeper.version=3.4.10 -Dhbase-thirdparty-version=2.1.0
\`\`\`

## Preparing Hive 3

Hive 3.1 ships with HBase 2.0 beta, which is incompatible with Phoenix.
To use the Phoenix Storage handler, HBase and its dependencies have to be removed from Hive.

To remove the shipped HBase 2.0 beta perform the following on each Hive node:

1. Create a backup of the Hive /lib directory

2. Remove the HBase dependencies from the /lib directory:
   \`\`\`shell
   mkdir ../lib-removed
   mv hbase-* javax.inject* jcodings-* jersey-* joni-* osgi-resource-locator-* ../lib-removed/
   \`\`\`

Even though Hive ships with HBase jars, it includes a mechanism to load the \`hbase mapredcp\` jars automatically.

To ensure that Hive finds and uses the correct HBase JARs and hbase-site.xml, set the following
environment variables in \`hive-env.sh\` on each node, or make sure they are set properly in the environment:

* \`HBASE_HOME\`: The root directory of the HBase installation.
* \`HBASE_CONF_DIR\`: The directory where \`hbase-site.xml\` resides. Defaults to \`/etc/hbase/conf\`, or if it does not exist, to \`$HBASE_HOME/conf\`.
* \`HBASE_BIN_DIR\`: The directory that holds the \`hbase\` command. Defaults to \`$HBASE_HOME/bin\`.

It is assumed that the Hadoop variables are already set correctly, and the HBase libraries and up-to-date \`hbase-site.xml\` are available on each Hive node.

## Hive Setup

It is necessary to make the \`phoenix5-hive-shaded-6.0.0-SNAPSHOT-shaded.jar\` available for every hive component.
There are many ways to achieve this; one of the simpler options is to use the \`HIVE_AUX_JARS_PATH\` environment variable.

If \`hive-env.sh\` already sets \`HIVE_AUX_JARS_PATH\`, then copy the connector JAR there.
Otherwise, create a world-readable directory on the system and copy the connector JAR there. Then add:

\`\`\`shell
HIVE_AUX_JARS_PATH=<PATH TO DIRECTORY>
\`\`\`

to \`hive-env.sh\`.

This must be performed on every Hive node.

## Table Creation and Deletion

The Phoenix Storage Handler supports only EXTERNAL Hive tables.

## Create EXTERNAL Table

For EXTERNAL tables, Hive works with an existing Phoenix table and manages only Hive metadata. Dropping an EXTERNAL table from Hive deletes only Hive metadata but does not delete the Phoenix table.

\`\`\`sql
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
\`\`\`

## Properties

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
   * Mappings between column names for Hive and Phoenix. See [Limitations](#apache-hive-limitations) for details.

The \`phoenix.zookeeper.*\` properties are optional. If they are not specified, values from \`hbase-site.xml\` will be used.

## Data Ingestion, Deletions, and Updates

Data ingestion can be done by all ways that Hive and Phoenix support:

Hive:

\`\`\`sql
insert into table T values (....);
insert into table T select c1,c2,c3 from source_table;
\`\`\`

Phoenix:

\`\`\`sql
upsert into table T values (.....);
\`\`\`

Phoenix CSV BulkLoad tools can also be used.

All delete and update operations should be performed on the Phoenix side. See [Limitations](#apache-hive-limitations) for more details.

## Additional Configuration Options

Those options can be set in a Hive command-line interface (CLI) environment.

### Performance Tuning

| Parameter                         | Default Value | Description                                                                                         |
| --------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| phoenix.upsert.batch.size         | 1000          | Batch size for upsert.                                                                              |
| \\[phoenix-table-name].disable.wal | false         | Temporarily sets the table attribute \`DISABLE_WAL\` to \`true\`. Sometimes used to improve performance |
| \\[phoenix-table-name].auto.flush  | false         | When WAL is disabled and if this value is \`true\`, then MemStore is flushed to an HFile.             |

Disabling WAL can lead to data loss.

### Query Data

You can use HiveQL for querying data in a Phoenix table. A Hive query on a single table can be as fast as running the query in the Phoenix CLI with the following property settings: \`hive.fetch.task.conversion=more\` and \`hive.exec.parallel=true\`

| Parameter                        | Default Value | Description                                                                                                           |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| hbase.scan.cache                 | 100           | Read row size for a unit request                                                                                      |
| hbase.scan.cacheblock            | false         | Whether or not cache block                                                                                            |
| split.by.stats                   | false         | If true, mappers use table statistics. One mapper per guide post.                                                     |
| \\[hive-table-name].reducer.count | 1             | Number of reducers. In Tez mode, this affects only single-table queries. See [Limitations](#apache-hive-limitations). |
| \\[phoenix-table-name].query.hint |               | Hint for Phoenix query (for example, \`NO_INDEX\`)                                                                      |

## Limitations

* Hive update and delete operations require transaction manager support on both Hive and Phoenix sides. Related Hive and Phoenix JIRAs are listed in the [Resources](#apache-hive-resources) section.
* Column mapping does not work correctly with mapping row key columns.
* MapReduce and Tez jobs always have a single reducer.

## Resources

* [PHOENIX-2743](https://issues.apache.org/jira/browse/PHOENIX-2743): Implementation accepted by the Apache Phoenix community. Original pull request contains modifications for Hive classes.
* [PHOENIX-331](https://issues.apache.org/jira/browse/PHOENIX-331): An outdated implementation with support for Hive 0.98.
`,h={title:"Apache Hive",description:"Configure and use the Phoenix Storage Handler with Apache Hive."},r=[{href:"/downloads"},{href:"https://github.com/apache/phoenix-connectors"},{href:"#apache-hive-limitations"},{href:"#apache-hive-limitations"},{href:"#apache-hive-limitations"},{href:"#apache-hive-resources"},{href:"https://issues.apache.org/jira/browse/PHOENIX-2743"},{href:"https://issues.apache.org/jira/browse/PHOENIX-331"}],o={contents:[{heading:void 0,content:"The Apache Phoenix Storage Handler is a plugin that enables Apache Hive access to Phoenix tables from the Apache Hive command line using HiveQL."},{heading:"apache-hive-prerequisites",content:"This document describes the plugin available in the phoenix-connectors source repo, as of December 2023."},{heading:"apache-hive-prerequisites",content:"Phoenix 5.1.0+"},{heading:"apache-hive-prerequisites",content:"Hive 3.1.2+"},{heading:"apache-hive-prerequisites",content:"phoenix-connectors 6.0.0-SNAPSHOT"},{heading:"apache-hive-prerequisites",content:`The Phoenix Storage handler currently only supports Hive 3.1.
It has only been tested with Hive Hive 3.1.3, and Phoenix 5.1.3.`},{heading:"apache-hive-prerequisites",content:"A variant for Hive 4 is planned after Hive 4.0.0 is released."},{heading:"apache-hive-building",content:`The Phoenix Storage Handler used to be part of the main Phoenix repo, but it has been refactored into the separate phoenix-connectors repo after the release of Phoenix 5.0.
At the time of writing there is no released version of the connectors project, so it must be built from the Git source repository HEAD.`},{heading:"apache-hive-building",content:"Official releases will be available on the Downloads page."},{heading:"apache-hive-building",content:`Check the value of the hbase.version property in the root pom.xml.
If it is older than HBase 2.5.0, then you need to rebuild HBase locally as described
in BUILDING.md in the main Phoenix repository.`},{heading:"apache-hive-building",content:`Check out the HEAD version of https://github.com/apache/phoenix-connectors.
Build it with:`},{heading:"apache-hive-building",content:"The binary distribution will be created in phoenix5-connectors-assembly/target."},{heading:"apache-hive-building",content:"The driver is built for HBase 2.4.x by default."},{heading:"apache-hive-building",content:"To build it for other HBase versions, set hbase.version, hbase.compat.version, hadoop.version, zookeeper.version, and hbase-thirdparty-version to the versions used by HBase. hbase.compat.version is the matching hbase-compat module in Phoenix; other versions can be copied from the root pom.xml in the HBase source."},{heading:"apache-hive-building",content:"For example, to build with HBase 2.1.10 (rebuilt with -Dhadoop.profile=3.0), use:"},{heading:"preparing-hive-3",content:`Hive 3.1 ships with HBase 2.0 beta, which is incompatible with Phoenix.
To use the Phoenix Storage handler, HBase and its dependencies have to be removed from Hive.`},{heading:"preparing-hive-3",content:"To remove the shipped HBase 2.0 beta perform the following on each Hive node:"},{heading:"preparing-hive-3",content:"Create a backup of the Hive /lib directory"},{heading:"preparing-hive-3",content:"Remove the HBase dependencies from the /lib directory:"},{heading:"preparing-hive-3",content:"Even though Hive ships with HBase jars, it includes a mechanism to load the hbase mapredcp jars automatically."},{heading:"preparing-hive-3",content:`To ensure that Hive finds and uses the correct HBase JARs and hbase-site.xml, set the following
environment variables in hive-env.sh on each node, or make sure they are set properly in the environment:`},{heading:"preparing-hive-3",content:"HBASE_HOME: The root directory of the HBase installation."},{heading:"preparing-hive-3",content:"HBASE_CONF_DIR: The directory where hbase-site.xml resides. Defaults to /etc/hbase/conf, or if it does not exist, to $HBASE_HOME/conf."},{heading:"preparing-hive-3",content:"HBASE_BIN_DIR: The directory that holds the hbase command. Defaults to $HBASE_HOME/bin."},{heading:"preparing-hive-3",content:"It is assumed that the Hadoop variables are already set correctly, and the HBase libraries and up-to-date hbase-site.xml are available on each Hive node."},{heading:"hive-setup",content:`It is necessary to make the phoenix5-hive-shaded-6.0.0-SNAPSHOT-shaded.jar available for every hive component.
There are many ways to achieve this; one of the simpler options is to use the HIVE_AUX_JARS_PATH environment variable.`},{heading:"hive-setup",content:`If hive-env.sh already sets HIVE_AUX_JARS_PATH, then copy the connector JAR there.
Otherwise, create a world-readable directory on the system and copy the connector JAR there. Then add:`},{heading:"hive-setup",content:"to hive-env.sh."},{heading:"hive-setup",content:"This must be performed on every Hive node."},{heading:"table-creation-and-deletion",content:"The Phoenix Storage Handler supports only EXTERNAL Hive tables."},{heading:"create-external-table",content:"For EXTERNAL tables, Hive works with an existing Phoenix table and manages only Hive metadata. Dropping an EXTERNAL table from Hive deletes only Hive metadata but does not delete the Phoenix table."},{heading:"properties",content:"phoenix.table.name"},{heading:"properties",content:"Specifies the Phoenix table name"},{heading:"properties",content:"Default: the same as the Hive table"},{heading:"properties",content:"phoenix.zookeeper.quorum"},{heading:"properties",content:"Specifies the ZooKeeper quorum for HBase"},{heading:"properties",content:"Default: localhost"},{heading:"properties",content:"phoenix.zookeeper.znode.parent"},{heading:"properties",content:"Specifies the ZooKeeper parent node for HBase"},{heading:"properties",content:"Default: /hbase"},{heading:"properties",content:"phoenix.zookeeper.client.port"},{heading:"properties",content:"Specifies the ZooKeeper port"},{heading:"properties",content:"Default: 2181"},{heading:"properties",content:"phoenix.rowkeys"},{heading:"properties",content:"The list of columns to be the primary key in a Phoenix table"},{heading:"properties",content:"Required"},{heading:"properties",content:"phoenix.column.mapping"},{heading:"properties",content:"Mappings between column names for Hive and Phoenix. See Limitations for details."},{heading:"properties",content:"The phoenix.zookeeper.* properties are optional. If they are not specified, values from hbase-site.xml will be used."},{heading:"data-ingestion-deletions-and-updates",content:"Data ingestion can be done by all ways that Hive and Phoenix support:"},{heading:"data-ingestion-deletions-and-updates",content:"Hive:"},{heading:"data-ingestion-deletions-and-updates",content:"Phoenix:"},{heading:"data-ingestion-deletions-and-updates",content:"Phoenix CSV BulkLoad tools can also be used."},{heading:"data-ingestion-deletions-and-updates",content:"All delete and update operations should be performed on the Phoenix side. See Limitations for more details."},{heading:"additional-configuration-options",content:"Those options can be set in a Hive command-line interface (CLI) environment."},{heading:"performance-tuning",content:"Parameter"},{heading:"performance-tuning",content:"Default Value"},{heading:"performance-tuning",content:"Description"},{heading:"performance-tuning",content:"phoenix.upsert.batch.size"},{heading:"performance-tuning",content:"1000"},{heading:"performance-tuning",content:"Batch size for upsert."},{heading:"performance-tuning",content:"[phoenix-table-name].disable.wal"},{heading:"performance-tuning",content:"false"},{heading:"performance-tuning",content:"Temporarily sets the table attribute DISABLE_WAL to true. Sometimes used to improve performance"},{heading:"performance-tuning",content:"[phoenix-table-name].auto.flush"},{heading:"performance-tuning",content:"false"},{heading:"performance-tuning",content:"When WAL is disabled and if this value is true, then MemStore is flushed to an HFile."},{heading:"performance-tuning",content:"Disabling WAL can lead to data loss."},{heading:"query-data",content:"You can use HiveQL for querying data in a Phoenix table. A Hive query on a single table can be as fast as running the query in the Phoenix CLI with the following property settings: hive.fetch.task.conversion=more and hive.exec.parallel=true"},{heading:"query-data",content:"Parameter"},{heading:"query-data",content:"Default Value"},{heading:"query-data",content:"Description"},{heading:"query-data",content:"hbase.scan.cache"},{heading:"query-data",content:"100"},{heading:"query-data",content:"Read row size for a unit request"},{heading:"query-data",content:"hbase.scan.cacheblock"},{heading:"query-data",content:"false"},{heading:"query-data",content:"Whether or not cache block"},{heading:"query-data",content:"split.by.stats"},{heading:"query-data",content:"false"},{heading:"query-data",content:"If true, mappers use table statistics. One mapper per guide post."},{heading:"query-data",content:"[hive-table-name].reducer.count"},{heading:"query-data",content:"1"},{heading:"query-data",content:"Number of reducers. In Tez mode, this affects only single-table queries. See Limitations."},{heading:"query-data",content:"[phoenix-table-name].query.hint"},{heading:"query-data",content:"Hint for Phoenix query (for example, NO_INDEX)"},{heading:"apache-hive-limitations",content:"Hive update and delete operations require transaction manager support on both Hive and Phoenix sides. Related Hive and Phoenix JIRAs are listed in the Resources section."},{heading:"apache-hive-limitations",content:"Column mapping does not work correctly with mapping row key columns."},{heading:"apache-hive-limitations",content:"MapReduce and Tez jobs always have a single reducer."},{heading:"apache-hive-resources",content:"PHOENIX-2743: Implementation accepted by the Apache Phoenix community. Original pull request contains modifications for Hive classes."},{heading:"apache-hive-resources",content:"PHOENIX-331: An outdated implementation with support for Hive 0.98."}],headings:[{id:"apache-hive-prerequisites",content:"Prerequisites"},{id:"apache-hive-building",content:"Building"},{id:"preparing-hive-3",content:"Preparing Hive 3"},{id:"hive-setup",content:"Hive Setup"},{id:"table-creation-and-deletion",content:"Table Creation and Deletion"},{id:"create-external-table",content:"Create EXTERNAL Table"},{id:"properties",content:"Properties"},{id:"data-ingestion-deletions-and-updates",content:"Data Ingestion, Deletions, and Updates"},{id:"additional-configuration-options",content:"Additional Configuration Options"},{id:"performance-tuning",content:"Performance Tuning"},{id:"query-data",content:"Query Data"},{id:"apache-hive-limitations",content:"Limitations"},{id:"apache-hive-resources",content:"Resources"}]};const l=[{depth:2,url:"#apache-hive-prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#apache-hive-building",title:e.jsx(e.Fragment,{children:"Building"})},{depth:2,url:"#preparing-hive-3",title:e.jsx(e.Fragment,{children:"Preparing Hive 3"})},{depth:2,url:"#hive-setup",title:e.jsx(e.Fragment,{children:"Hive Setup"})},{depth:2,url:"#table-creation-and-deletion",title:e.jsx(e.Fragment,{children:"Table Creation and Deletion"})},{depth:2,url:"#create-external-table",title:e.jsx(e.Fragment,{children:"Create EXTERNAL Table"})},{depth:2,url:"#properties",title:e.jsx(e.Fragment,{children:"Properties"})},{depth:2,url:"#data-ingestion-deletions-and-updates",title:e.jsx(e.Fragment,{children:"Data Ingestion, Deletions, and Updates"})},{depth:2,url:"#additional-configuration-options",title:e.jsx(e.Fragment,{children:"Additional Configuration Options"})},{depth:3,url:"#performance-tuning",title:e.jsx(e.Fragment,{children:"Performance Tuning"})},{depth:3,url:"#query-data",title:e.jsx(e.Fragment,{children:"Query Data"})},{depth:2,url:"#apache-hive-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})},{depth:2,url:"#apache-hive-resources",title:e.jsx(e.Fragment,{children:"Resources"})}];function s(n){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"The Apache Phoenix Storage Handler is a plugin that enables Apache Hive access to Phoenix tables from the Apache Hive command line using HiveQL."}),`
`,e.jsx(i.h2,{id:"apache-hive-prerequisites",children:"Prerequisites"}),`
`,e.jsxs(i.p,{children:["This document describes the plugin available in the ",e.jsx(i.code,{children:"phoenix-connectors"})," source repo, as of December 2023."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Phoenix 5.1.0+"}),`
`,e.jsx(i.li,{children:"Hive 3.1.2+"}),`
`,e.jsxs(i.li,{children:["phoenix-connectors ",e.jsx(i.code,{children:"6.0.0-SNAPSHOT"})]}),`
`]}),`
`,e.jsx(i.p,{children:`The Phoenix Storage handler currently only supports Hive 3.1.
It has only been tested with Hive Hive 3.1.3, and Phoenix 5.1.3.`}),`
`,e.jsx(i.p,{children:"A variant for Hive 4 is planned after Hive 4.0.0 is released."}),`
`,e.jsx(i.h2,{id:"apache-hive-building",children:"Building"}),`
`,e.jsxs(i.p,{children:["The Phoenix Storage Handler used to be part of the main Phoenix repo, but it has been refactored into the separate ",e.jsx(i.code,{children:"phoenix-connectors"}),` repo after the release of Phoenix 5.0.
At the time of writing there is no released version of the connectors project, so it must be built from the Git source repository HEAD.`]}),`
`,e.jsxs(i.p,{children:["Official releases will be available on the ",e.jsx(i.a,{href:"/downloads",children:"Downloads"})," page."]}),`
`,e.jsxs(i.p,{children:["Check the value of the ",e.jsx(i.code,{children:"hbase.version"})," property in the root ",e.jsx(i.code,{children:"pom.xml"}),`.
If it is older than HBase 2.5.0, then you need to rebuild HBase locally as described
in `,e.jsx(i.code,{children:"BUILDING.md"})," in the main Phoenix repository."]}),`
`,e.jsxs(i.p,{children:["Check out the HEAD version of ",e.jsx(i.a,{href:"https://github.com/apache/phoenix-connectors",children:"https://github.com/apache/phoenix-connectors"}),`.
Build it with:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"})]})})})}),`
`,e.jsxs(i.p,{children:["The binary distribution will be created in ",e.jsx(i.code,{children:"phoenix5-connectors-assembly/target"}),"."]}),`
`,e.jsx(i.p,{children:"The driver is built for HBase 2.4.x by default."}),`
`,e.jsxs(i.p,{children:["To build it for other HBase versions, set ",e.jsx(i.code,{children:"hbase.version"}),", ",e.jsx(i.code,{children:"hbase.compat.version"}),", ",e.jsx(i.code,{children:"hadoop.version"}),", ",e.jsx(i.code,{children:"zookeeper.version"}),", and ",e.jsx(i.code,{children:"hbase-thirdparty-version"})," to the versions used by HBase. ",e.jsx(i.code,{children:"hbase.compat.version"})," is the matching ",e.jsx(i.code,{children:"hbase-compat"})," module in Phoenix; other versions can be copied from the root ",e.jsx(i.code,{children:"pom.xml"})," in the HBase source."]}),`
`,e.jsxs(i.p,{children:["For example, to build with HBase 2.1.10 (rebuilt with ",e.jsx(i.code,{children:"-Dhadoop.profile=3.0"}),"), use:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.version=2.1.10"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.compat.version=2.1.6"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhadoop.version=3.0.3"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dzookeeper.version=3.4.10"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase-thirdparty-version=2.1.0"})]})})})}),`
`,e.jsx(i.h2,{id:"preparing-hive-3",children:"Preparing Hive 3"}),`
`,e.jsx(i.p,{children:`Hive 3.1 ships with HBase 2.0 beta, which is incompatible with Phoenix.
To use the Phoenix Storage handler, HBase and its dependencies have to be removed from Hive.`}),`
`,e.jsx(i.p,{children:"To remove the shipped HBase 2.0 beta perform the following on each Hive node:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Create a backup of the Hive /lib directory"}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Remove the HBase dependencies from the /lib directory:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mkdir"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../lib-removed"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mv"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" javax.inject"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jcodings-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jersey-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" joni-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" osgi-resource-locator-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../lib-removed/"})]})]})})}),`
`]}),`
`]}),`
`,e.jsxs(i.p,{children:["Even though Hive ships with HBase jars, it includes a mechanism to load the ",e.jsx(i.code,{children:"hbase mapredcp"})," jars automatically."]}),`
`,e.jsxs(i.p,{children:[`To ensure that Hive finds and uses the correct HBase JARs and hbase-site.xml, set the following
environment variables in `,e.jsx(i.code,{children:"hive-env.sh"})," on each node, or make sure they are set properly in the environment:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"HBASE_HOME"}),": The root directory of the HBase installation."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"HBASE_CONF_DIR"}),": The directory where ",e.jsx(i.code,{children:"hbase-site.xml"})," resides. Defaults to ",e.jsx(i.code,{children:"/etc/hbase/conf"}),", or if it does not exist, to ",e.jsx(i.code,{children:"$HBASE_HOME/conf"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"HBASE_BIN_DIR"}),": The directory that holds the ",e.jsx(i.code,{children:"hbase"})," command. Defaults to ",e.jsx(i.code,{children:"$HBASE_HOME/bin"}),"."]}),`
`]}),`
`,e.jsxs(i.p,{children:["It is assumed that the Hadoop variables are already set correctly, and the HBase libraries and up-to-date ",e.jsx(i.code,{children:"hbase-site.xml"})," are available on each Hive node."]}),`
`,e.jsx(i.h2,{id:"hive-setup",children:"Hive Setup"}),`
`,e.jsxs(i.p,{children:["It is necessary to make the ",e.jsx(i.code,{children:"phoenix5-hive-shaded-6.0.0-SNAPSHOT-shaded.jar"}),` available for every hive component.
There are many ways to achieve this; one of the simpler options is to use the `,e.jsx(i.code,{children:"HIVE_AUX_JARS_PATH"})," environment variable."]}),`
`,e.jsxs(i.p,{children:["If ",e.jsx(i.code,{children:"hive-env.sh"})," already sets ",e.jsx(i.code,{children:"HIVE_AUX_JARS_PATH"}),`, then copy the connector JAR there.
Otherwise, create a world-readable directory on the system and copy the connector JAR there. Then add:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HIVE_AUX_JARS_PATH"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=<"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"PATH"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TO"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" DIRECTOR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Y"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsxs(i.p,{children:["to ",e.jsx(i.code,{children:"hive-env.sh"}),"."]}),`
`,e.jsx(i.p,{children:"This must be performed on every Hive node."}),`
`,e.jsx(i.h2,{id:"table-creation-and-deletion",children:"Table Creation and Deletion"}),`
`,e.jsx(i.p,{children:"The Phoenix Storage Handler supports only EXTERNAL Hive tables."}),`
`,e.jsx(i.h2,{id:"create-external-table",children:"Create EXTERNAL Table"}),`
`,e.jsx(i.p,{children:"For EXTERNAL tables, Hive works with an existing Phoenix table and manages only Hive metadata. Dropping an EXTERNAL table from Hive deletes only Hive metadata but does not delete the Phoenix table."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"create"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" external"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ext_table ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  i1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  s1 string,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  f1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"float"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  d1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"decimal"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"STORED "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BY"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'org.apache.phoenix.hive.PhoenixStorageHandler'"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TBLPROPERTIES ("})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.table.name"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "ext_table"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.zookeeper.quorum"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "localhost"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.zookeeper.znode.parent"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "/hbase"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.zookeeper.client.port"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "2181"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.rowkeys"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "i1"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "phoenix.column.mapping"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "i1:i1, s1:s1, f1:f1, d1:d1"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsx(i.h2,{id:"properties",children:"Properties"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["phoenix.table.name",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Specifies the Phoenix table name"}),`
`,e.jsx(i.li,{children:"Default: the same as the Hive table"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["phoenix.zookeeper.quorum",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Specifies the ZooKeeper quorum for HBase"}),`
`,e.jsx(i.li,{children:"Default: localhost"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["phoenix.zookeeper.znode.parent",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Specifies the ZooKeeper parent node for HBase"}),`
`,e.jsx(i.li,{children:"Default: /hbase"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["phoenix.zookeeper.client.port",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Specifies the ZooKeeper port"}),`
`,e.jsx(i.li,{children:"Default: 2181"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["phoenix.rowkeys",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"The list of columns to be the primary key in a Phoenix table"}),`
`,e.jsx(i.li,{children:"Required"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["phoenix.column.mapping",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Mappings between column names for Hive and Phoenix. See ",e.jsx(i.a,{href:"#apache-hive-limitations",children:"Limitations"})," for details."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"phoenix.zookeeper.*"})," properties are optional. If they are not specified, values from ",e.jsx(i.code,{children:"hbase-site.xml"})," will be used."]}),`
`,e.jsx(i.h2,{id:"data-ingestion-deletions-and-updates",children:"Data Ingestion, Deletions, and Updates"}),`
`,e.jsx(i.p,{children:"Data ingestion can be done by all ways that Hive and Phoenix support:"}),`
`,e.jsx(i.p,{children:"Hive:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"insert into"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" T "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"values"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (....);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"insert into"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" T "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"select"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" c1,c2,c3 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" source_table;"})]})]})})}),`
`,e.jsx(i.p,{children:"Phoenix:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"upsert "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"into"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" T "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"values"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (.....);"})]})})})}),`
`,e.jsx(i.p,{children:"Phoenix CSV BulkLoad tools can also be used."}),`
`,e.jsxs(i.p,{children:["All delete and update operations should be performed on the Phoenix side. See ",e.jsx(i.a,{href:"#apache-hive-limitations",children:"Limitations"})," for more details."]}),`
`,e.jsx(i.h2,{id:"additional-configuration-options",children:"Additional Configuration Options"}),`
`,e.jsx(i.p,{children:"Those options can be set in a Hive command-line interface (CLI) environment."}),`
`,e.jsx(i.h3,{id:"performance-tuning",children:"Performance Tuning"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Parameter"}),e.jsx(i.th,{children:"Default Value"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"phoenix.upsert.batch.size"}),e.jsx(i.td,{children:"1000"}),e.jsx(i.td,{children:"Batch size for upsert."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"[phoenix-table-name].disable.wal"}),e.jsx(i.td,{children:"false"}),e.jsxs(i.td,{children:["Temporarily sets the table attribute ",e.jsx(i.code,{children:"DISABLE_WAL"})," to ",e.jsx(i.code,{children:"true"}),". Sometimes used to improve performance"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"[phoenix-table-name].auto.flush"}),e.jsx(i.td,{children:"false"}),e.jsxs(i.td,{children:["When WAL is disabled and if this value is ",e.jsx(i.code,{children:"true"}),", then MemStore is flushed to an HFile."]})]})]})]}),`
`,e.jsx(i.p,{children:"Disabling WAL can lead to data loss."}),`
`,e.jsx(i.h3,{id:"query-data",children:"Query Data"}),`
`,e.jsxs(i.p,{children:["You can use HiveQL for querying data in a Phoenix table. A Hive query on a single table can be as fast as running the query in the Phoenix CLI with the following property settings: ",e.jsx(i.code,{children:"hive.fetch.task.conversion=more"})," and ",e.jsx(i.code,{children:"hive.exec.parallel=true"})]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Parameter"}),e.jsx(i.th,{children:"Default Value"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"hbase.scan.cache"}),e.jsx(i.td,{children:"100"}),e.jsx(i.td,{children:"Read row size for a unit request"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"hbase.scan.cacheblock"}),e.jsx(i.td,{children:"false"}),e.jsx(i.td,{children:"Whether or not cache block"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"split.by.stats"}),e.jsx(i.td,{children:"false"}),e.jsx(i.td,{children:"If true, mappers use table statistics. One mapper per guide post."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"[hive-table-name].reducer.count"}),e.jsx(i.td,{children:"1"}),e.jsxs(i.td,{children:["Number of reducers. In Tez mode, this affects only single-table queries. See ",e.jsx(i.a,{href:"#apache-hive-limitations",children:"Limitations"}),"."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"[phoenix-table-name].query.hint"}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["Hint for Phoenix query (for example, ",e.jsx(i.code,{children:"NO_INDEX"}),")"]})]})]})]}),`
`,e.jsx(i.h2,{id:"apache-hive-limitations",children:"Limitations"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Hive update and delete operations require transaction manager support on both Hive and Phoenix sides. Related Hive and Phoenix JIRAs are listed in the ",e.jsx(i.a,{href:"#apache-hive-resources",children:"Resources"})," section."]}),`
`,e.jsx(i.li,{children:"Column mapping does not work correctly with mapping row key columns."}),`
`,e.jsx(i.li,{children:"MapReduce and Tez jobs always have a single reducer."}),`
`]}),`
`,e.jsx(i.h2,{id:"apache-hive-resources",children:"Resources"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-2743",children:"PHOENIX-2743"}),": Implementation accepted by the Apache Phoenix community. Original pull request contains modifications for Hive classes."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-331",children:"PHOENIX-331"}),": An outdated implementation with support for Hive 0.98."]}),`
`]})]})}function d(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,d as default,r as extractedReferences,h as frontmatter,o as structuredData,l as toc};
