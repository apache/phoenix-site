import{j as e}from"./jsx-runtime-CUISpl0r.js";let c=`## Using the Phoenix JDBC Driver

This page is about using the Phoenix thick client.

The thin client for Phoenix Query Server is described on its own [page](/docs/features/query-server).

## The Phoenix classpath

To use Phoenix, both the JDBC driver JAR and \`hbase-site.xml\` must be added to the application classpath.

### Phoenix driver JAR

The Phoenix JDBC client is built on top of the HBase client, and has an unusually high number of dependencies.
To make this manageable, Phoenix provides a single shaded uberjar that can be added to the classpath.

Phoenix uses some private and semi-public HBase APIs, which may change between HBase versions, and provides separate binary distributions for different HBase versions.

Choose the [binary distribution](/downloads) or Maven artifact corresponding to the HBase version on your cluster.

<Steps>
  <Step>
    Copy the driver JAR from the binary distribution.

    Copy the corresponding \`phoenix-client-embedded-hbase-[hbase.profile]-[phoenix.version].jar\` to the application classpath.
  </Step>

  <Step>
    Add the dependency via Maven.

    \`\`\`xml
    <dependencies>
      <dependency>
        <groupId>org.apache.phoenix</groupId>
        <artifactId>phoenix-client-embedded-hbase-[hbase.profile]</artifactId>
        <version>[phoenix.version]</version>
      </dependency>
    </dependencies>
    \`\`\`
  </Step>

  <Step>
    Add 

    \`hbase-site.xml\`

     from your target cluster to the classpath.
  </Step>

  <Step>
    Verify your config is current after cluster changes.
  </Step>
</Steps>

### HBase / Hadoop configuration files

As Phoenix is built on top of the HBase client, it needs the HBase configuration files for correct operation.
For some configurations, it may also need other Hadoop / HDFS config files like core-site.xml.

Download the correct \`hbase-site.xml\` (the client one, usually in \`/etc/hbase/conf\`) from the cluster, and copy it to a directory on the classpath.
It is important to add the **directory containing \`hbase-site.xml\`**, and not the full file path, to the classpath.

Alternatively, package \`hbase-site.xml\` into the root directory of a JAR file and add that JAR to the classpath.

If \`hbase-site.xml\` changes on the cluster, make sure to copy the updated file to your application classpath.

For some development clusters that use default configuration Phoenix may work without this, but not having the correct \`hbase-site.xml\` on the
classpath is almost guaranteed to cause problems.

## The Phoenix JDBC URL

The Phoenix URL contains two main parts. The first describes the connection to HBase; the second specifies extra Phoenix options.

\`\`\`text
jdbc:<protocol variant>[:<server list>[:<port>[:<zk root node>[:<principal>[:<keytab file>]]]]][;<option>=<value>]*
\`\`\`

* \`protocol variant\`: The HBase connection registry to use (details below).
* \`server list\`: A comma-separated list of hostnames or IPv4 addresses.
  It is also possible to specify per-host ports, as defined in [HBASE-12706](https://issues.apache.org/jira/browse/HBASE-12706). In this case \`:\` characters must be escaped with \`\\\`. You may need to escape again in Java source strings.
* \`port\`: An integer port number. Ports specified in \`server list\` take precedence.
* \`zk root node\`: The root znode for HBase. Must be empty for non-ZK registries.
* \`principal\`: The Kerberos principal used for authentication.\\
  If only \`principal\` is specified, this defines a distinct user identity with its own dedicated HBase connection (\`HConnection\`) and allows multiple differently configured connections in the same JVM.
* \`keytab\`: Kerberos keytab used for authentication. Must be specified together with \`principal\`.
* \`option\`: A connection option.
* \`value\`: A connection option value.

Parameters from end of the connection definition can be omitted.
Use empty strings for missing parameters in the middle of the URL.
For example, the \`jdbc:phoenix::::principal:/home/user/keytab\` URL can be used to specify the kerberos principal and keytab, while using the default connection specified in hbase-site.xml.

### Default connection

The underlying HBase client identifies the cluster based on parameters in \`hbase-site.xml\`.
While Phoenix allows overriding this, it is usually best to use the cluster definition from \`hbase-site.xml\`.
The only time the connection should be directly specified is when switching between otherwise identically configured HBase instances, like a production and a disaster recovery cluster.

To use the defaults from hbase-site.xml, use the \`jdbc:phoenix\` URL or \`jdbc:phoenix;option=value\` if additional options are needed.

See HBase documentation for how each registry is configured in \`hbase-site.xml\`.

### The \`jdbc:phoenix:\` protocol variant

If this protocol variant is specified, Phoenix will select the registry based on the value of \`hbase.client.registry.impl\`.

If \`hbase.client.registry.impl\` is not defined, Phoenix chooses a default based on the HBase client version it includes.

### The \`jdbc:phoenix+zk:\` protocol variant

This uses the original ZooKeeper-based HBase connection registry. The \`server list\` and \`port\` specify the ZK quorum. [HBASE-12706](https://issues.apache.org/jira/browse/HBASE-12706) is supported; \`:\` characters must be escaped with \`\\\`.

Examples:

* \`jdbc:phoenix+zk:localhost:2181:/hbase:principal:keytab\` - fully specified
* \`jdbc:phoenix+zk:host1\\:2181,host1\\:2182,host2\\:2183\` - heterogeneous ports, default ZK root node
* \`jdbc:phoenix+zk\` - use default ZK parameters from \`hbase-site.xml\` (using \`jdbc:phoenix\` is preferred in most cases)

### The \`jdbc:phoenix+master:\` protocol variant

This uses the Master based connection registry added in [HBASE-18095](https://issues.apache.org/jira/browse/HBASE-18095), and is available from HBase 2.3.0.
The **zk root node** parameter **must** never be specified.

Examples:

* \`jdbc:phoenix+master:master1\\:16001,master2\\:16002::principal:/path/to/keytab\` - fully specified
* \`jdbc:phoenix+master:master1,master2\` - use default master port for both hosts

### The \`jdbc:phoenix+rpc:\` protocol variant

This uses the Master based connection registry added in [HBASE-26150](https://issues.apache.org/jira/browse/HBASE-26150), and is available from HBase 2.5.0.
This is very similar to the \`phoenix+master\` variant, but also allows specifying RegionServers in the host list.
There is no built-in default port for this registry, the port must always be specified together with the host list.

Examples:

* \`jdbc:phoenix+rpc:server1\\:16001,server2\\:16002::principal:/path/to/keytab\` - fully specified
* \`jdbc:phoenix+rpc\` - use values from \`hbase-site.xml\`

## Notes

<Callout type="warning">
  Support for \`master\` and \`rpc\` registries is only available in Phoenix 5.1.4+
  and 5.2.0+.
</Callout>

Earlier versions support only the \`jdbc:phoenix:\` protocol variant implementing the original HBase ZooKeeper connection registry.

Support for registry variants is only available for HBase versions that support them.
Phoenix will throw an error if a variant that the HBase client version doesn't support is specified.

Phoenix 5.2 also supports High Availability connections. Documentation for that is only available in the [JIRA ticket](https://issues.apache.org/jira/browse/PHOENIX-6491).
`,d={title:"Client Classpath and JDBC URL",description:"Configure Phoenix thick-client classpath and JDBC URLs."},l=[{href:"/docs/features/query-server"},{href:"/downloads"},{href:"https://issues.apache.org/jira/browse/HBASE-12706"},{href:"https://issues.apache.org/jira/browse/HBASE-12706"},{href:"https://issues.apache.org/jira/browse/HBASE-18095"},{href:"https://issues.apache.org/jira/browse/HBASE-26150"},{href:"https://issues.apache.org/jira/browse/PHOENIX-6491"}],p={contents:[{heading:"using-the-phoenix-jdbc-driver",content:"This page is about using the Phoenix thick client."},{heading:"using-the-phoenix-jdbc-driver",content:"The thin client for Phoenix Query Server is described on its own page."},{heading:"the-phoenix-classpath",content:"To use Phoenix, both the JDBC driver JAR and `hbase-site.xml` must be added to the application classpath."},{heading:"phoenix-driver-jar",content:`The Phoenix JDBC client is built on top of the HBase client, and has an unusually high number of dependencies.
To make this manageable, Phoenix provides a single shaded uberjar that can be added to the classpath.`},{heading:"phoenix-driver-jar",content:"Phoenix uses some private and semi-public HBase APIs, which may change between HBase versions, and provides separate binary distributions for different HBase versions."},{heading:"phoenix-driver-jar",content:"Choose the binary distribution or Maven artifact corresponding to the HBase version on your cluster."},{heading:"phoenix-driver-jar",content:"Copy the driver JAR from the binary distribution."},{heading:"phoenix-driver-jar",content:"Copy the corresponding `phoenix-client-embedded-hbase-[hbase.profile]-[phoenix.version].jar` to the application classpath."},{heading:"phoenix-driver-jar",content:"Add the dependency via Maven."},{heading:"hbase--hadoop-configuration-files",content:`As Phoenix is built on top of the HBase client, it needs the HBase configuration files for correct operation.
For some configurations, it may also need other Hadoop / HDFS config files like core-site.xml.`},{heading:"hbase--hadoop-configuration-files",content:"Download the correct `hbase-site.xml` (the client one, usually in `/etc/hbase/conf`) from the cluster, and copy it to a directory on the classpath.\nIt is important to add the &#x2A;*directory containing `hbase-site.xml`**, and not the full file path, to the classpath."},{heading:"hbase--hadoop-configuration-files",content:"Alternatively, package `hbase-site.xml` into the root directory of a JAR file and add that JAR to the classpath."},{heading:"hbase--hadoop-configuration-files",content:"If `hbase-site.xml` changes on the cluster, make sure to copy the updated file to your application classpath."},{heading:"hbase--hadoop-configuration-files",content:"For some development clusters that use default configuration Phoenix may work without this, but not having the correct `hbase-site.xml` on the\nclasspath is almost guaranteed to cause problems."},{heading:"the-phoenix-jdbc-url",content:"The Phoenix URL contains two main parts. The first describes the connection to HBase; the second specifies extra Phoenix options."},{heading:"the-phoenix-jdbc-url",content:"`protocol variant`: The HBase connection registry to use (details below)."},{heading:"the-phoenix-jdbc-url",content:"`server list`: A comma-separated list of hostnames or IPv4 addresses.\nIt is also possible to specify per-host ports, as defined in HBASE-12706. In this case `:` characters must be escaped with `\\`. You may need to escape again in Java source strings."},{heading:"the-phoenix-jdbc-url",content:"`port`: An integer port number. Ports specified in `server list` take precedence."},{heading:"the-phoenix-jdbc-url",content:"`zk root node`: The root znode for HBase. Must be empty for non-ZK registries."},{heading:"the-phoenix-jdbc-url",content:"`principal`: The Kerberos principal used for authentication.\\\nIf only `principal` is specified, this defines a distinct user identity with its own dedicated HBase connection (`HConnection`) and allows multiple differently configured connections in the same JVM."},{heading:"the-phoenix-jdbc-url",content:"`keytab`: Kerberos keytab used for authentication. Must be specified together with `principal`."},{heading:"the-phoenix-jdbc-url",content:"`option`: A connection option."},{heading:"the-phoenix-jdbc-url",content:"`value`: A connection option value."},{heading:"the-phoenix-jdbc-url",content:"Parameters from end of the connection definition can be omitted.\nUse empty strings for missing parameters in the middle of the URL.\nFor example, the `jdbc:phoenix::::principal:/home/user/keytab` URL can be used to specify the kerberos principal and keytab, while using the default connection specified in hbase-site.xml."},{heading:"default-connection",content:"The underlying HBase client identifies the cluster based on parameters in `hbase-site.xml`.\nWhile Phoenix allows overriding this, it is usually best to use the cluster definition from `hbase-site.xml`.\nThe only time the connection should be directly specified is when switching between otherwise identically configured HBase instances, like a production and a disaster recovery cluster."},{heading:"default-connection",content:"To use the defaults from hbase-site.xml, use the `jdbc:phoenix` URL or `jdbc:phoenix;option=value` if additional options are needed."},{heading:"default-connection",content:"See HBase documentation for how each registry is configured in `hbase-site.xml`."},{heading:"the-jdbcphoenix-protocol-variant",content:"If this protocol variant is specified, Phoenix will select the registry based on the value of `hbase.client.registry.impl`."},{heading:"the-jdbcphoenix-protocol-variant",content:"If `hbase.client.registry.impl` is not defined, Phoenix chooses a default based on the HBase client version it includes."},{heading:"the-jdbcphoenixzk-protocol-variant",content:"This uses the original ZooKeeper-based HBase connection registry. The `server list` and `port` specify the ZK quorum. HBASE-12706 is supported; `:` characters must be escaped with `\\`."},{heading:"the-jdbcphoenixzk-protocol-variant",content:"Examples:"},{heading:"the-jdbcphoenixzk-protocol-variant",content:"`jdbc:phoenix+zk:localhost:2181:/hbase:principal:keytab` - fully specified"},{heading:"the-jdbcphoenixzk-protocol-variant",content:"`jdbc:phoenix+zk:host1\\:2181,host1\\:2182,host2\\:2183` - heterogeneous ports, default ZK root node"},{heading:"the-jdbcphoenixzk-protocol-variant",content:"`jdbc:phoenix+zk` - use default ZK parameters from `hbase-site.xml` (using `jdbc:phoenix` is preferred in most cases)"},{heading:"the-jdbcphoenixmaster-protocol-variant",content:`This uses the Master based connection registry added in HBASE-18095, and is available from HBase 2.3.0.
The **zk root node** parameter **must** never be specified.`},{heading:"the-jdbcphoenixmaster-protocol-variant",content:"Examples:"},{heading:"the-jdbcphoenixmaster-protocol-variant",content:"`jdbc:phoenix+master:master1\\:16001,master2\\:16002::principal:/path/to/keytab` - fully specified"},{heading:"the-jdbcphoenixmaster-protocol-variant",content:"`jdbc:phoenix+master:master1,master2` - use default master port for both hosts"},{heading:"the-jdbcphoenixrpc-protocol-variant",content:"This uses the Master based connection registry added in HBASE-26150, and is available from HBase 2.5.0.\nThis is very similar to the `phoenix+master` variant, but also allows specifying RegionServers in the host list.\nThere is no built-in default port for this registry, the port must always be specified together with the host list."},{heading:"the-jdbcphoenixrpc-protocol-variant",content:"Examples:"},{heading:"the-jdbcphoenixrpc-protocol-variant",content:"`jdbc:phoenix+rpc:server1\\:16001,server2\\:16002::principal:/path/to/keytab` - fully specified"},{heading:"the-jdbcphoenixrpc-protocol-variant",content:"`jdbc:phoenix+rpc` - use values from `hbase-site.xml`"},{heading:"client-classpath-and-jdbc-url-notes",content:"Support for `master` and `rpc` registries is only available in Phoenix 5.1.4+\nand 5.2.0+."},{heading:"client-classpath-and-jdbc-url-notes",content:"Earlier versions support only the `jdbc:phoenix:` protocol variant implementing the original HBase ZooKeeper connection registry."},{heading:"client-classpath-and-jdbc-url-notes",content:`Support for registry variants is only available for HBase versions that support them.
Phoenix will throw an error if a variant that the HBase client version doesn't support is specified.`},{heading:"client-classpath-and-jdbc-url-notes",content:"Phoenix 5.2 also supports High Availability connections. Documentation for that is only available in the JIRA ticket."}],headings:[{id:"using-the-phoenix-jdbc-driver",content:"Using the Phoenix JDBC Driver"},{id:"the-phoenix-classpath",content:"The Phoenix classpath"},{id:"phoenix-driver-jar",content:"Phoenix driver JAR"},{id:"hbase--hadoop-configuration-files",content:"HBase / Hadoop configuration files"},{id:"the-phoenix-jdbc-url",content:"The Phoenix JDBC URL"},{id:"default-connection",content:"Default connection"},{id:"the-jdbcphoenix-protocol-variant",content:"The `jdbc:phoenix:` protocol variant"},{id:"the-jdbcphoenixzk-protocol-variant",content:"The `jdbc:phoenix+zk:` protocol variant"},{id:"the-jdbcphoenixmaster-protocol-variant",content:"The `jdbc:phoenix+master:` protocol variant"},{id:"the-jdbcphoenixrpc-protocol-variant",content:"The `jdbc:phoenix+rpc:` protocol variant"},{id:"client-classpath-and-jdbc-url-notes",content:"Notes"}]},x=[{depth:2,url:"#using-the-phoenix-jdbc-driver",title:e.jsx(e.Fragment,{children:"Using the Phoenix JDBC Driver"})},{depth:2,url:"#the-phoenix-classpath",title:e.jsx(e.Fragment,{children:"The Phoenix classpath"})},{depth:3,url:"#phoenix-driver-jar",title:e.jsx(e.Fragment,{children:"Phoenix driver JAR"})},{depth:3,url:"#hbase--hadoop-configuration-files",title:e.jsx(e.Fragment,{children:"HBase / Hadoop configuration files"})},{depth:2,url:"#the-phoenix-jdbc-url",title:e.jsx(e.Fragment,{children:"The Phoenix JDBC URL"})},{depth:3,url:"#default-connection",title:e.jsx(e.Fragment,{children:"Default connection"})},{depth:3,url:"#the-jdbcphoenix-protocol-variant",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"jdbc:phoenix:"})," protocol variant"]})},{depth:3,url:"#the-jdbcphoenixzk-protocol-variant",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"jdbc:phoenix+zk:"})," protocol variant"]})},{depth:3,url:"#the-jdbcphoenixmaster-protocol-variant",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"jdbc:phoenix+master:"})," protocol variant"]})},{depth:3,url:"#the-jdbcphoenixrpc-protocol-variant",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"jdbc:phoenix+rpc:"})," protocol variant"]})},{depth:2,url:"#client-classpath-and-jdbc-url-notes",title:e.jsx(e.Fragment,{children:"Notes"})}];function a(n){const i={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components},{Callout:o,Step:t,Steps:r}=i;return o||s("Callout"),t||s("Step"),r||s("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"using-the-phoenix-jdbc-driver",children:"Using the Phoenix JDBC Driver"}),`
`,e.jsx(i.p,{children:"This page is about using the Phoenix thick client."}),`
`,e.jsxs(i.p,{children:["The thin client for Phoenix Query Server is described on its own ",e.jsx(i.a,{href:"/docs/features/query-server",children:"page"}),"."]}),`
`,e.jsx(i.h2,{id:"the-phoenix-classpath",children:"The Phoenix classpath"}),`
`,e.jsxs(i.p,{children:["To use Phoenix, both the JDBC driver JAR and ",e.jsx(i.code,{children:"hbase-site.xml"})," must be added to the application classpath."]}),`
`,e.jsx(i.h3,{id:"phoenix-driver-jar",children:"Phoenix driver JAR"}),`
`,e.jsx(i.p,{children:`The Phoenix JDBC client is built on top of the HBase client, and has an unusually high number of dependencies.
To make this manageable, Phoenix provides a single shaded uberjar that can be added to the classpath.`}),`
`,e.jsx(i.p,{children:"Phoenix uses some private and semi-public HBase APIs, which may change between HBase versions, and provides separate binary distributions for different HBase versions."}),`
`,e.jsxs(i.p,{children:["Choose the ",e.jsx(i.a,{href:"/downloads",children:"binary distribution"})," or Maven artifact corresponding to the HBase version on your cluster."]}),`
`,e.jsxs(r,{children:[e.jsxs(t,{children:[e.jsx(i.p,{children:"Copy the driver JAR from the binary distribution."}),e.jsxs(i.p,{children:["Copy the corresponding ",e.jsx(i.code,{children:"phoenix-client-embedded-hbase-[hbase.profile]-[phoenix.version].jar"})," to the application classpath."]})]}),e.jsxs(t,{children:[e.jsx(i.p,{children:"Add the dependency via Maven."}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependencies"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">phoenix-client-embedded-hbase-[hbase.profile]</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">[phoenix.version]</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependencies"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})})]}),e.jsxs(t,{children:["Add ",e.jsx(i.code,{children:"hbase-site.xml"})," from your target cluster to the classpath."]}),e.jsx(t,{children:"Verify your config is current after cluster changes."})]}),`
`,e.jsx(i.h3,{id:"hbase--hadoop-configuration-files",children:"HBase / Hadoop configuration files"}),`
`,e.jsx(i.p,{children:`As Phoenix is built on top of the HBase client, it needs the HBase configuration files for correct operation.
For some configurations, it may also need other Hadoop / HDFS config files like core-site.xml.`}),`
`,e.jsxs(i.p,{children:["Download the correct ",e.jsx(i.code,{children:"hbase-site.xml"})," (the client one, usually in ",e.jsx(i.code,{children:"/etc/hbase/conf"}),`) from the cluster, and copy it to a directory on the classpath.
It is important to add the `,e.jsxs(i.strong,{children:["directory containing ",e.jsx(i.code,{children:"hbase-site.xml"})]}),", and not the full file path, to the classpath."]}),`
`,e.jsxs(i.p,{children:["Alternatively, package ",e.jsx(i.code,{children:"hbase-site.xml"})," into the root directory of a JAR file and add that JAR to the classpath."]}),`
`,e.jsxs(i.p,{children:["If ",e.jsx(i.code,{children:"hbase-site.xml"})," changes on the cluster, make sure to copy the updated file to your application classpath."]}),`
`,e.jsxs(i.p,{children:["For some development clusters that use default configuration Phoenix may work without this, but not having the correct ",e.jsx(i.code,{children:"hbase-site.xml"}),` on the
classpath is almost guaranteed to cause problems.`]}),`
`,e.jsx(i.h2,{id:"the-phoenix-jdbc-url",children:"The Phoenix JDBC URL"}),`
`,e.jsx(i.p,{children:"The Phoenix URL contains two main parts. The first describes the connection to HBase; the second specifies extra Phoenix options."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"jdbc:<protocol variant>[:<server list>[:<port>[:<zk root node>[:<principal>[:<keytab file>]]]]][;<option>=<value>]*"})})})})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"protocol variant"}),": The HBase connection registry to use (details below)."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"server list"}),`: A comma-separated list of hostnames or IPv4 addresses.
It is also possible to specify per-host ports, as defined in `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-12706",children:"HBASE-12706"}),". In this case ",e.jsx(i.code,{children:":"})," characters must be escaped with ",e.jsx(i.code,{children:"\\"}),". You may need to escape again in Java source strings."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"port"}),": An integer port number. Ports specified in ",e.jsx(i.code,{children:"server list"})," take precedence."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"zk root node"}),": The root znode for HBase. Must be empty for non-ZK registries."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"principal"}),": The Kerberos principal used for authentication.",e.jsx(i.br,{}),`
`,"If only ",e.jsx(i.code,{children:"principal"})," is specified, this defines a distinct user identity with its own dedicated HBase connection (",e.jsx(i.code,{children:"HConnection"}),") and allows multiple differently configured connections in the same JVM."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"keytab"}),": Kerberos keytab used for authentication. Must be specified together with ",e.jsx(i.code,{children:"principal"}),"."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"option"}),": A connection option."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"value"}),": A connection option value."]}),`
`]}),`
`,e.jsxs(i.p,{children:[`Parameters from end of the connection definition can be omitted.
Use empty strings for missing parameters in the middle of the URL.
For example, the `,e.jsx(i.code,{children:"jdbc:phoenix::::principal:/home/user/keytab"})," URL can be used to specify the kerberos principal and keytab, while using the default connection specified in hbase-site.xml."]}),`
`,e.jsx(i.h3,{id:"default-connection",children:"Default connection"}),`
`,e.jsxs(i.p,{children:["The underlying HBase client identifies the cluster based on parameters in ",e.jsx(i.code,{children:"hbase-site.xml"}),`.
While Phoenix allows overriding this, it is usually best to use the cluster definition from `,e.jsx(i.code,{children:"hbase-site.xml"}),`.
The only time the connection should be directly specified is when switching between otherwise identically configured HBase instances, like a production and a disaster recovery cluster.`]}),`
`,e.jsxs(i.p,{children:["To use the defaults from hbase-site.xml, use the ",e.jsx(i.code,{children:"jdbc:phoenix"})," URL or ",e.jsx(i.code,{children:"jdbc:phoenix;option=value"})," if additional options are needed."]}),`
`,e.jsxs(i.p,{children:["See HBase documentation for how each registry is configured in ",e.jsx(i.code,{children:"hbase-site.xml"}),"."]}),`
`,e.jsxs(i.h3,{id:"the-jdbcphoenix-protocol-variant",children:["The ",e.jsx(i.code,{children:"jdbc:phoenix:"})," protocol variant"]}),`
`,e.jsxs(i.p,{children:["If this protocol variant is specified, Phoenix will select the registry based on the value of ",e.jsx(i.code,{children:"hbase.client.registry.impl"}),"."]}),`
`,e.jsxs(i.p,{children:["If ",e.jsx(i.code,{children:"hbase.client.registry.impl"})," is not defined, Phoenix chooses a default based on the HBase client version it includes."]}),`
`,e.jsxs(i.h3,{id:"the-jdbcphoenixzk-protocol-variant",children:["The ",e.jsx(i.code,{children:"jdbc:phoenix+zk:"})," protocol variant"]}),`
`,e.jsxs(i.p,{children:["This uses the original ZooKeeper-based HBase connection registry. The ",e.jsx(i.code,{children:"server list"})," and ",e.jsx(i.code,{children:"port"})," specify the ZK quorum. ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-12706",children:"HBASE-12706"})," is supported; ",e.jsx(i.code,{children:":"})," characters must be escaped with ",e.jsx(i.code,{children:"\\"}),"."]}),`
`,e.jsx(i.p,{children:"Examples:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+zk:localhost:2181:/hbase:principal:keytab"})," - fully specified"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+zk:host1\\:2181,host1\\:2182,host2\\:2183"})," - heterogeneous ports, default ZK root node"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+zk"})," - use default ZK parameters from ",e.jsx(i.code,{children:"hbase-site.xml"})," (using ",e.jsx(i.code,{children:"jdbc:phoenix"})," is preferred in most cases)"]}),`
`]}),`
`,e.jsxs(i.h3,{id:"the-jdbcphoenixmaster-protocol-variant",children:["The ",e.jsx(i.code,{children:"jdbc:phoenix+master:"})," protocol variant"]}),`
`,e.jsxs(i.p,{children:["This uses the Master based connection registry added in ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-18095",children:"HBASE-18095"}),`, and is available from HBase 2.3.0.
The `,e.jsx(i.strong,{children:"zk root node"})," parameter ",e.jsx(i.strong,{children:"must"})," never be specified."]}),`
`,e.jsx(i.p,{children:"Examples:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+master:master1\\:16001,master2\\:16002::principal:/path/to/keytab"})," - fully specified"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+master:master1,master2"})," - use default master port for both hosts"]}),`
`]}),`
`,e.jsxs(i.h3,{id:"the-jdbcphoenixrpc-protocol-variant",children:["The ",e.jsx(i.code,{children:"jdbc:phoenix+rpc:"})," protocol variant"]}),`
`,e.jsxs(i.p,{children:["This uses the Master based connection registry added in ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-26150",children:"HBASE-26150"}),`, and is available from HBase 2.5.0.
This is very similar to the `,e.jsx(i.code,{children:"phoenix+master"}),` variant, but also allows specifying RegionServers in the host list.
There is no built-in default port for this registry, the port must always be specified together with the host list.`]}),`
`,e.jsx(i.p,{children:"Examples:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+rpc:server1\\:16001,server2\\:16002::principal:/path/to/keytab"})," - fully specified"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"jdbc:phoenix+rpc"})," - use values from ",e.jsx(i.code,{children:"hbase-site.xml"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"client-classpath-and-jdbc-url-notes",children:"Notes"}),`
`,e.jsx(o,{type:"warning",children:e.jsxs(i.p,{children:["Support for ",e.jsx(i.code,{children:"master"})," and ",e.jsx(i.code,{children:"rpc"}),` registries is only available in Phoenix 5.1.4+
and 5.2.0+.`]})}),`
`,e.jsxs(i.p,{children:["Earlier versions support only the ",e.jsx(i.code,{children:"jdbc:phoenix:"})," protocol variant implementing the original HBase ZooKeeper connection registry."]}),`
`,e.jsx(i.p,{children:`Support for registry variants is only available for HBase versions that support them.
Phoenix will throw an error if a variant that the HBase client version doesn't support is specified.`}),`
`,e.jsxs(i.p,{children:["Phoenix 5.2 also supports High Availability connections. Documentation for that is only available in the ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-6491",children:"JIRA ticket"}),"."]})]})}function u(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(a,{...n})}):a(n)}function s(n,i){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as _markdown,u as default,l as extractedReferences,d as frontmatter,p as structuredData,x as toc};
