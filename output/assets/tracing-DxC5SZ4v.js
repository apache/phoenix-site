import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as t,a,b as r,c as h,d as l}from"./trace-time-line-71kJ9bDU.js";let d=`









As of Phoenix 4.1.0, Phoenix supports collecting per-request traces. This allows you to see each important step in a query or insertion, all the way from the client through HBase and back again.

Phoenix leverages Cloudera's [HTrace](https://github.com/cloudera/htrace) library to integrate with HBase tracing utilities. Trace metrics are then deposited into a Hadoop Metrics2 sink that writes them into a Phoenix table.

Writing traces to a Phoenix table is not supported on Hadoop 1.

## Configuration

There are two key configuration files that you will need to update.

* \`hadoop-metrics2-phoenix.properties\`
* \`hadoop-metrics2-hbase.properties\`

They contain the properties you need to set on the client and server, respectively, as well as information on how the Metrics2 system uses the configuration files.

Put these files on their respective classpaths and restart the process to pick up the new configurations.

### hadoop-metrics2-phoenix.properties

This file will configure the [Hadoop Metrics2](http://hadoop.apache.org/docs/current/api/index.html?org/apache/hadoop/metrics2/package-summary.html) system for *Phoenix clients*.

The default properties you should set are:

\`\`\`properties
# Sample from all the sources every 10 seconds
*.period=10

# Write Traces to Phoenix
##########################
# ensure that we receive traces on the server
phoenix.sink.tracing.class=org.apache.phoenix.trace.PhoenixMetricsSink
# Tell the sink where to write the metrics
phoenix.sink.tracing.writer-class=org.apache.phoenix.trace.PhoenixTableMetricsWriter
# Only handle traces with a context of "tracing"
phoenix.sink.tracing.context=tracing
\`\`\`

This enables standard Phoenix metrics sink (which collects the trace information) and writer (writes the traces to the Phoenix SYSTEM.TRACING\\_STATS table). You can modify this to set your own custom classes as well, if you have them.

See the properties file in the source (\`phoenix-hadoop2-compat/bin\`) for more information on setting custom sinks and writers.

### hadoop-metrics2-hbase.properties

A default HBase deployment already includes a Metrics2 configuration, so Phoenix Metrics2 config can either replace the existing file (if you do not have custom settings) or be merged into your existing Metrics2 configuration file.

\`\`\`properties
# ensure that we receive traces on the server
hbase.sink.tracing.class=org.apache.phoenix.trace.PhoenixMetricsSink
# Tell the sink where to write the metrics
hbase.sink.tracing.writer-class=org.apache.phoenix.trace.PhoenixTableMetricsWriter
# Only handle traces with a context of "tracing"
hbase.sink.tracing.context=tracing
\`\`\`

These are essentially the same properties as in \`hadoop-metrics2-phoenix.properties\`, but prefixed with \`hbase\` instead of \`phoenix\` so they are loaded with the rest of HBase metrics.

### Disabling tracing

You can disable tracing for client requests by creating a new connection without the tracing property enabled (see below).

However, on the server side, once the metrics sink is enabled you cannot turn off trace collection and writing unless you **remove the Phoenix Metrics2 configuration and restart the region server**. This is enforced by the Metrics2 framework, which assumes server metrics should always be collected.

## Usage

There are only a couple small things you need to do to enable tracing a given request with Phoenix.

### Client Property

The frequency of tracing is determined by the following client-side Phoenix property:

\`\`\`text
phoenix.trace.frequency
\`\`\`

There are three possible tracing frequencies you can use:

1. \`never\`
   * This is the default
2. \`always\`
   * Every request will be traced
3. \`probability\`
   * Take traces with a probabilistic frequency
   * probability threshold is set by \`phoenix.trace.probability.threshold\` with a default of 0.05 (5%).

As with other configuration properties, this property may be specified at JDBC connection time as a connection property.
Enabling one of these properties only turns on trace collection. Trace data still needs to be deposited somewhere.

Example:

\`\`\`java
# Enable tracing on every request
Properties props = new Properties();
props.setProperty("phoenix.trace.frequency", "always");
Connection conn = DriverManager.getConnection("jdbc:phoenix:localhost", props);

# Enable tracing on 50% of requests
props.setProperty("phoenix.trace.frequency", "probability");
props.setProperty("phoenix.trace.probability.threshold", "0.5");
Connection conn = DriverManager.getConnection("jdbc:phoenix:localhost", props);
\`\`\`

#### hbase-site.xml

You can also enable tracing via \`hbase-site.xml\`. However, only \`always\` and \`never\` are currently supported.

\`\`\`xml
<configuration>
  <property>
    <name>phoenix.trace.frequency</name>
    <value>always</value>
  </property>
</configuration>
\`\`\`

## Reading Traces

Once the traces are deposited into the tracing table, by default \`SYSTEM.TRACING_STATS\`, but it is configurable in the HBase configuration via:

\`\`\`xml
<property>
  <name>phoenix.trace.statsTableName</name>
  <value>YOUR_CUSTOM_TRACING_TABLE</value>
</property>
\`\`\`

The tracing table is initialized via the DDL:

\`\`\`sql
CREATE TABLE SYSTEM.TRACING_STATS (
  trace_id BIGINT NOT NULL,
  parent_id BIGINT NOT NULL,
  span_id BIGINT NOT NULL,
  description VARCHAR,
  start_time BIGINT,
  end_time BIGINT,
  hostname VARCHAR,
  tags.count SMALLINT,
  annotations.count SMALLINT,
  CONSTRAINT pk PRIMARY KEY (trace_id, parent_id, span_id)
)
\`\`\`

The tracing table also contains a number of dynamic columns for each trace. A trace is identified by trace ID (request ID), parent ID (parent span ID), and span ID (individual segment ID), and may have multiple tags and annotations. Once you know the number of tags and annotations, you can retrieve them from the table with a query like:

\`\`\`sql
SELECT <columns>
  FROM SYSTEM.TRACING_STATS
  WHERE trace_id = ?
  AND parent_id = ?
  AND span_id = ?
\`\`\`

Where \`columns\` is either \`annotations.aX\` or \`tags.tX\`, where \`X\` is the index of the dynamic column to look up.

For more usage examples, see [TraceReader](https://github.com/apache/phoenix/blob/master/phoenix-core/src/main/java/org/apache/phoenix/trace/TraceReader.java), which can programmatically read traces from the tracing results table.

Custom annotations can also be passed into Phoenix to be added to traces. Phoenix looks for connection properties whose names start with \`phoenix.annotation.\` and adds them as annotations to client-side traces. For example, a connection property \`phoenix.annotation.myannotation=abc\` results in an annotation with key \`myannotation\` and value \`abc\`. Use this to link traces to other request identifiers in your system, such as user or session IDs.

## Phoenix Tracing Web Application

### How to start the tracing web application

1. Enable tracing for Apache Phoenix as above

2. Start the web app:

   \`\`\`shell
   ./bin/traceserver.py start
   \`\`\`

3. Open this URL in your browser: [http://localhost:8864/webapp/](http://localhost:8864/webapp/)

4. Stop the tracing web app:
   \`\`\`shell
   ./bin/traceserver.py stop
   \`\`\`

### Changing the web app port number

Execute the command below:

\`\`\`shell
 -Dphoenix.traceserver.http.port=8887
\`\`\`

## Feature list

The tracing web app for Apache Phoenix includes: feature list, dependency tree, trace count, trace distribution, and timeline.

<img alt="trace-web-app-dashboard" src={__img0} placeholder="blur" />

### List

The most recent traces are listed down. The limiting value entered on the textbox is used to determine the trace count displayed. With each trace, there is a link to view either the dependency tree or the timeline.

<img alt="trace-list" src={__img1} placeholder="blur" />

### Dependency tree

The dependency tree shows traces for a given trace ID in a tree view. Parent-child relationships are displayed clearly. Tooltip data includes host name, parent ID, span ID, start time, end time, description, and duration. Each node is collapsible and expandable. The SQL query is shown for each tree rendering. Clear is used to remove the tree from view.

<img alt="trace-dependency-tree" src={__img2} placeholder="blur" />

### Trace count

The trace list is categorized by description. The trace count chart can be viewed as pie, line, bar, or area chart. The chart selector is collapsible and can be hidden.

<img alt="trace-count-chart" src={__img3} placeholder="blur" />

### Trace distribution

The trace distribution chart shows traces across Phoenix hosts on which they are running. Chart types include pie, line, bar, and area. The chart selector is collapsible and can be hidden.

### Timeline

The traces can be viewed along the time axis for a given trace id. Traces can be added or cleared from the timeline. There should be a minimum of two traces starting at two different times for the system to draw its timeline. This feature helps the user to easily compare execution times between traces and within the same trace.

<img alt="trace-time-line" src={__img4} placeholder="blur" />
`,p={title:"Tracing",description:"Configure, enable, collect, and inspect Phoenix tracing data, including metrics sinks and tracing web app usage."},g=[{href:"https://github.com/cloudera/htrace"},{href:"http://hadoop.apache.org/docs/current/api/index.html?org/apache/hadoop/metrics2/package-summary.html"},{href:"https://github.com/apache/phoenix/blob/master/phoenix-core/src/main/java/org/apache/phoenix/trace/TraceReader.java"},{href:"http://localhost:8864/webapp/"}],k={contents:[{heading:void 0,content:"As of Phoenix 4.1.0, Phoenix supports collecting per-request traces. This allows you to see each important step in a query or insertion, all the way from the client through HBase and back again."},{heading:void 0,content:"Phoenix leverages Cloudera's HTrace library to integrate with HBase tracing utilities. Trace metrics are then deposited into a Hadoop Metrics2 sink that writes them into a Phoenix table."},{heading:void 0,content:"Writing traces to a Phoenix table is not supported on Hadoop 1."},{heading:"tracing-configuration",content:"There are two key configuration files that you will need to update."},{heading:"tracing-configuration",content:"hadoop-metrics2-phoenix.properties"},{heading:"tracing-configuration",content:"hadoop-metrics2-hbase.properties"},{heading:"tracing-configuration",content:"They contain the properties you need to set on the client and server, respectively, as well as information on how the Metrics2 system uses the configuration files."},{heading:"tracing-configuration",content:"Put these files on their respective classpaths and restart the process to pick up the new configurations."},{heading:"hadoop-metrics2-phoenixproperties",content:"This file will configure the Hadoop Metrics2 system for Phoenix clients."},{heading:"hadoop-metrics2-phoenixproperties",content:"The default properties you should set are:"},{heading:"hadoop-metrics2-phoenixproperties",content:"This enables standard Phoenix metrics sink (which collects the trace information) and writer (writes the traces to the Phoenix SYSTEM.TRACING_STATS table). You can modify this to set your own custom classes as well, if you have them."},{heading:"hadoop-metrics2-phoenixproperties",content:"See the properties file in the source (phoenix-hadoop2-compat/bin) for more information on setting custom sinks and writers."},{heading:"hadoop-metrics2-hbaseproperties",content:"A default HBase deployment already includes a Metrics2 configuration, so Phoenix Metrics2 config can either replace the existing file (if you do not have custom settings) or be merged into your existing Metrics2 configuration file."},{heading:"hadoop-metrics2-hbaseproperties",content:"These are essentially the same properties as in hadoop-metrics2-phoenix.properties, but prefixed with hbase instead of phoenix so they are loaded with the rest of HBase metrics."},{heading:"disabling-tracing",content:"You can disable tracing for client requests by creating a new connection without the tracing property enabled (see below)."},{heading:"disabling-tracing",content:"However, on the server side, once the metrics sink is enabled you cannot turn off trace collection and writing unless you remove the Phoenix Metrics2 configuration and restart the region server. This is enforced by the Metrics2 framework, which assumes server metrics should always be collected."},{heading:"tracing-usage",content:"There are only a couple small things you need to do to enable tracing a given request with Phoenix."},{heading:"client-property",content:"The frequency of tracing is determined by the following client-side Phoenix property:"},{heading:"client-property",content:"There are three possible tracing frequencies you can use:"},{heading:"client-property",content:"never"},{heading:"client-property",content:"This is the default"},{heading:"client-property",content:"always"},{heading:"client-property",content:"Every request will be traced"},{heading:"client-property",content:"probability"},{heading:"client-property",content:"Take traces with a probabilistic frequency"},{heading:"client-property",content:"probability threshold is set by phoenix.trace.probability.threshold with a default of 0.05 (5%)."},{heading:"client-property",content:`As with other configuration properties, this property may be specified at JDBC connection time as a connection property.
Enabling one of these properties only turns on trace collection. Trace data still needs to be deposited somewhere.`},{heading:"client-property",content:"Example:"},{heading:"hbase-sitexml",content:"You can also enable tracing via hbase-site.xml. However, only always and never are currently supported."},{heading:"reading-traces",content:"Once the traces are deposited into the tracing table, by default SYSTEM.TRACING_STATS, but it is configurable in the HBase configuration via:"},{heading:"reading-traces",content:"The tracing table is initialized via the DDL:"},{heading:"reading-traces",content:"The tracing table also contains a number of dynamic columns for each trace. A trace is identified by trace ID (request ID), parent ID (parent span ID), and span ID (individual segment ID), and may have multiple tags and annotations. Once you know the number of tags and annotations, you can retrieve them from the table with a query like:"},{heading:"reading-traces",content:"Where columns is either annotations.aX or tags.tX, where X is the index of the dynamic column to look up."},{heading:"reading-traces",content:"For more usage examples, see TraceReader, which can programmatically read traces from the tracing results table."},{heading:"reading-traces",content:"Custom annotations can also be passed into Phoenix to be added to traces. Phoenix looks for connection properties whose names start with phoenix.annotation. and adds them as annotations to client-side traces. For example, a connection property phoenix.annotation.myannotation=abc results in an annotation with key myannotation and value abc. Use this to link traces to other request identifiers in your system, such as user or session IDs."},{heading:"how-to-start-the-tracing-web-application",content:"Enable tracing for Apache Phoenix as above"},{heading:"how-to-start-the-tracing-web-application",content:"Start the web app:"},{heading:"how-to-start-the-tracing-web-application",content:"Open this URL in your browser: http://localhost:8864/webapp/"},{heading:"how-to-start-the-tracing-web-application",content:"Stop the tracing web app:"},{heading:"changing-the-web-app-port-number",content:"Execute the command below:"},{heading:"feature-list",content:"The tracing web app for Apache Phoenix includes: feature list, dependency tree, trace count, trace distribution, and timeline."},{heading:"list",content:"The most recent traces are listed down. The limiting value entered on the textbox is used to determine the trace count displayed. With each trace, there is a link to view either the dependency tree or the timeline."},{heading:"dependency-tree",content:"The dependency tree shows traces for a given trace ID in a tree view. Parent-child relationships are displayed clearly. Tooltip data includes host name, parent ID, span ID, start time, end time, description, and duration. Each node is collapsible and expandable. The SQL query is shown for each tree rendering. Clear is used to remove the tree from view."},{heading:"trace-count",content:"The trace list is categorized by description. The trace count chart can be viewed as pie, line, bar, or area chart. The chart selector is collapsible and can be hidden."},{heading:"trace-distribution",content:"The trace distribution chart shows traces across Phoenix hosts on which they are running. Chart types include pie, line, bar, and area. The chart selector is collapsible and can be hidden."},{heading:"timeline",content:"The traces can be viewed along the time axis for a given trace id. Traces can be added or cleared from the timeline. There should be a minimum of two traces starting at two different times for the system to draw its timeline. This feature helps the user to easily compare execution times between traces and within the same trace."}],headings:[{id:"tracing-configuration",content:"Configuration"},{id:"hadoop-metrics2-phoenixproperties",content:"hadoop-metrics2-phoenix.properties"},{id:"hadoop-metrics2-hbaseproperties",content:"hadoop-metrics2-hbase.properties"},{id:"disabling-tracing",content:"Disabling tracing"},{id:"tracing-usage",content:"Usage"},{id:"client-property",content:"Client Property"},{id:"hbase-sitexml",content:"hbase-site.xml"},{id:"reading-traces",content:"Reading Traces"},{id:"phoenix-tracing-web-application",content:"Phoenix Tracing Web Application"},{id:"how-to-start-the-tracing-web-application",content:"How to start the tracing web application"},{id:"changing-the-web-app-port-number",content:"Changing the web app port number"},{id:"feature-list",content:"Feature list"},{id:"list",content:"List"},{id:"dependency-tree",content:"Dependency tree"},{id:"trace-count",content:"Trace count"},{id:"trace-distribution",content:"Trace distribution"},{id:"timeline",content:"Timeline"}]};const x=[{depth:2,url:"#tracing-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:3,url:"#hadoop-metrics2-phoenixproperties",title:e.jsx(e.Fragment,{children:"hadoop-metrics2-phoenix.properties"})},{depth:3,url:"#hadoop-metrics2-hbaseproperties",title:e.jsx(e.Fragment,{children:"hadoop-metrics2-hbase.properties"})},{depth:3,url:"#disabling-tracing",title:e.jsx(e.Fragment,{children:"Disabling tracing"})},{depth:2,url:"#tracing-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#client-property",title:e.jsx(e.Fragment,{children:"Client Property"})},{depth:4,url:"#hbase-sitexml",title:e.jsx(e.Fragment,{children:"hbase-site.xml"})},{depth:2,url:"#reading-traces",title:e.jsx(e.Fragment,{children:"Reading Traces"})},{depth:2,url:"#phoenix-tracing-web-application",title:e.jsx(e.Fragment,{children:"Phoenix Tracing Web Application"})},{depth:3,url:"#how-to-start-the-tracing-web-application",title:e.jsx(e.Fragment,{children:"How to start the tracing web application"})},{depth:3,url:"#changing-the-web-app-port-number",title:e.jsx(e.Fragment,{children:"Changing the web app port number"})},{depth:2,url:"#feature-list",title:e.jsx(e.Fragment,{children:"Feature list"})},{depth:3,url:"#list",title:e.jsx(e.Fragment,{children:"List"})},{depth:3,url:"#dependency-tree",title:e.jsx(e.Fragment,{children:"Dependency tree"})},{depth:3,url:"#trace-count",title:e.jsx(e.Fragment,{children:"Trace count"})},{depth:3,url:"#trace-distribution",title:e.jsx(e.Fragment,{children:"Trace distribution"})},{depth:3,url:"#timeline",title:e.jsx(e.Fragment,{children:"Timeline"})}];function s(n){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"As of Phoenix 4.1.0, Phoenix supports collecting per-request traces. This allows you to see each important step in a query or insertion, all the way from the client through HBase and back again."}),`
`,e.jsxs(i.p,{children:["Phoenix leverages Cloudera's ",e.jsx(i.a,{href:"https://github.com/cloudera/htrace",children:"HTrace"})," library to integrate with HBase tracing utilities. Trace metrics are then deposited into a Hadoop Metrics2 sink that writes them into a Phoenix table."]}),`
`,e.jsx(i.p,{children:"Writing traces to a Phoenix table is not supported on Hadoop 1."}),`
`,e.jsx(i.h2,{id:"tracing-configuration",children:"Configuration"}),`
`,e.jsx(i.p,{children:"There are two key configuration files that you will need to update."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hadoop-metrics2-phoenix.properties"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"hadoop-metrics2-hbase.properties"})}),`
`]}),`
`,e.jsx(i.p,{children:"They contain the properties you need to set on the client and server, respectively, as well as information on how the Metrics2 system uses the configuration files."}),`
`,e.jsx(i.p,{children:"Put these files on their respective classpaths and restart the process to pick up the new configurations."}),`
`,e.jsx(i.h3,{id:"hadoop-metrics2-phoenixproperties",children:"hadoop-metrics2-phoenix.properties"}),`
`,e.jsxs(i.p,{children:["This file will configure the ",e.jsx(i.a,{href:"http://hadoop.apache.org/docs/current/api/index.html?org/apache/hadoop/metrics2/package-summary.html",children:"Hadoop Metrics2"})," system for ",e.jsx(i.em,{children:"Phoenix clients"}),"."]}),`
`,e.jsx(i.p,{children:"The default properties you should set are:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Sample from all the sources every 10 seconds"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"*."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"period"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=10"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Write Traces to Phoenix"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"##########################"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# ensure that we receive traces on the server"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"phoenix.sink.tracing.class"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=org.apache.phoenix.trace.PhoenixMetricsSink"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Tell the sink where to write the metrics"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"phoenix.sink.tracing.writer-class"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=org.apache.phoenix.trace.PhoenixTableMetricsWriter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# Only handle traces with a context of "tracing"'})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"phoenix.sink.tracing.context"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=tracing"})]})]})})}),`
`,e.jsx(i.p,{children:"This enables standard Phoenix metrics sink (which collects the trace information) and writer (writes the traces to the Phoenix SYSTEM.TRACING_STATS table). You can modify this to set your own custom classes as well, if you have them."}),`
`,e.jsxs(i.p,{children:["See the properties file in the source (",e.jsx(i.code,{children:"phoenix-hadoop2-compat/bin"}),") for more information on setting custom sinks and writers."]}),`
`,e.jsx(i.h3,{id:"hadoop-metrics2-hbaseproperties",children:"hadoop-metrics2-hbase.properties"}),`
`,e.jsx(i.p,{children:"A default HBase deployment already includes a Metrics2 configuration, so Phoenix Metrics2 config can either replace the existing file (if you do not have custom settings) or be merged into your existing Metrics2 configuration file."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# ensure that we receive traces on the server"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"hbase.sink.tracing.class"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=org.apache.phoenix.trace.PhoenixMetricsSink"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Tell the sink where to write the metrics"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"hbase.sink.tracing.writer-class"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=org.apache.phoenix.trace.PhoenixTableMetricsWriter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# Only handle traces with a context of "tracing"'})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"hbase.sink.tracing.context"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=tracing"})]})]})})}),`
`,e.jsxs(i.p,{children:["These are essentially the same properties as in ",e.jsx(i.code,{children:"hadoop-metrics2-phoenix.properties"}),", but prefixed with ",e.jsx(i.code,{children:"hbase"})," instead of ",e.jsx(i.code,{children:"phoenix"})," so they are loaded with the rest of HBase metrics."]}),`
`,e.jsx(i.h3,{id:"disabling-tracing",children:"Disabling tracing"}),`
`,e.jsx(i.p,{children:"You can disable tracing for client requests by creating a new connection without the tracing property enabled (see below)."}),`
`,e.jsxs(i.p,{children:["However, on the server side, once the metrics sink is enabled you cannot turn off trace collection and writing unless you ",e.jsx(i.strong,{children:"remove the Phoenix Metrics2 configuration and restart the region server"}),". This is enforced by the Metrics2 framework, which assumes server metrics should always be collected."]}),`
`,e.jsx(i.h2,{id:"tracing-usage",children:"Usage"}),`
`,e.jsx(i.p,{children:"There are only a couple small things you need to do to enable tracing a given request with Phoenix."}),`
`,e.jsx(i.h3,{id:"client-property",children:"Client Property"}),`
`,e.jsx(i.p,{children:"The frequency of tracing is determined by the following client-side Phoenix property:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"phoenix.trace.frequency"})})})})}),`
`,e.jsx(i.p,{children:"There are three possible tracing frequencies you can use:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"never"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"This is the default"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"always"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Every request will be traced"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"probability"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Take traces with a probabilistic frequency"}),`
`,e.jsxs(i.li,{children:["probability threshold is set by ",e.jsx(i.code,{children:"phoenix.trace.probability.threshold"})," with a default of 0.05 (5%)."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:`As with other configuration properties, this property may be specified at JDBC connection time as a connection property.
Enabling one of these properties only turns on trace collection. Trace data still needs to be deposited somewhere.`}),`
`,e.jsx(i.p,{children:"Example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"# Enable tracing on every request"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Properties props "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Properties"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenix.trace.frequency"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"always"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:localhost"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", props);"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"# Enable tracing on "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"50"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"%"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" of requests"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenix.trace.frequency"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"probability"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"props."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setProperty"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenix.trace.probability.threshold"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"0.5"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Connection conn "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DriverManager."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getConnection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"jdbc:phoenix:localhost"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", props);"})]})]})})}),`
`,e.jsx(i.h4,{id:"hbase-sitexml",children:"hbase-site.xml"}),`
`,e.jsxs(i.p,{children:["You can also enable tracing via ",e.jsx(i.code,{children:"hbase-site.xml"}),". However, only ",e.jsx(i.code,{children:"always"})," and ",e.jsx(i.code,{children:"never"})," are currently supported."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">phoenix.trace.frequency</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">always</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"configuration"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h2,{id:"reading-traces",children:"Reading Traces"}),`
`,e.jsxs(i.p,{children:["Once the traces are deposited into the tracing table, by default ",e.jsx(i.code,{children:"SYSTEM.TRACING_STATS"}),", but it is configurable in the HBase configuration via:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">phoenix.trace.statsTableName</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">YOUR_CUSTOM_TRACING_TABLE</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.p,{children:"The tracing table is initialized via the DDL:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SYSTEM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".TRACING_STATS ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  trace_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  parent_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  span_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  description"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  start_time "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  end_time "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  hostname "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  tags"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"count"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" SMALLINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  annotations"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"count"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" SMALLINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  CONSTRAINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (trace_id, parent_id, span_id)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsx(i.p,{children:"The tracing table also contains a number of dynamic columns for each trace. A trace is identified by trace ID (request ID), parent ID (parent span ID), and span ID (individual segment ID), and may have multiple tags and annotations. Once you know the number of tags and annotations, you can retrieve them from the table with a query like:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"columns"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" SYSTEM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"TRACING_STATS"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" trace_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" parent_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  AND"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" span_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?"})]})]})})}),`
`,e.jsxs(i.p,{children:["Where ",e.jsx(i.code,{children:"columns"})," is either ",e.jsx(i.code,{children:"annotations.aX"})," or ",e.jsx(i.code,{children:"tags.tX"}),", where ",e.jsx(i.code,{children:"X"})," is the index of the dynamic column to look up."]}),`
`,e.jsxs(i.p,{children:["For more usage examples, see ",e.jsx(i.a,{href:"https://github.com/apache/phoenix/blob/master/phoenix-core/src/main/java/org/apache/phoenix/trace/TraceReader.java",children:"TraceReader"}),", which can programmatically read traces from the tracing results table."]}),`
`,e.jsxs(i.p,{children:["Custom annotations can also be passed into Phoenix to be added to traces. Phoenix looks for connection properties whose names start with ",e.jsx(i.code,{children:"phoenix.annotation."})," and adds them as annotations to client-side traces. For example, a connection property ",e.jsx(i.code,{children:"phoenix.annotation.myannotation=abc"})," results in an annotation with key ",e.jsx(i.code,{children:"myannotation"})," and value ",e.jsx(i.code,{children:"abc"}),". Use this to link traces to other request identifiers in your system, such as user or session IDs."]}),`
`,e.jsx(i.h2,{id:"phoenix-tracing-web-application",children:"Phoenix Tracing Web Application"}),`
`,e.jsx(i.h3,{id:"how-to-start-the-tracing-web-application",children:"How to start the tracing web application"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Enable tracing for Apache Phoenix as above"}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Start the web app:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./bin/traceserver.py"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"})]})})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Open this URL in your browser: ",e.jsx(i.a,{href:"http://localhost:8864/webapp/",children:"http://localhost:8864/webapp/"})]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:"Stop the tracing web app:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./bin/traceserver.py"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" stop"})]})})})}),`
`]}),`
`]}),`
`,e.jsx(i.h3,{id:"changing-the-web-app-port-number",children:"Changing the web app port number"}),`
`,e.jsx(i.p,{children:"Execute the command below:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -Dphoenix.traceserver.http.port"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"=8887"})]})})})}),`
`,e.jsx(i.h2,{id:"feature-list",children:"Feature list"}),`
`,e.jsx(i.p,{children:"The tracing web app for Apache Phoenix includes: feature list, dependency tree, trace count, trace distribution, and timeline."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"trace-web-app-dashboard",src:t,placeholder:"blur"})}),`
`,e.jsx(i.h3,{id:"list",children:"List"}),`
`,e.jsx(i.p,{children:"The most recent traces are listed down. The limiting value entered on the textbox is used to determine the trace count displayed. With each trace, there is a link to view either the dependency tree or the timeline."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"trace-list",src:a,placeholder:"blur"})}),`
`,e.jsx(i.h3,{id:"dependency-tree",children:"Dependency tree"}),`
`,e.jsx(i.p,{children:"The dependency tree shows traces for a given trace ID in a tree view. Parent-child relationships are displayed clearly. Tooltip data includes host name, parent ID, span ID, start time, end time, description, and duration. Each node is collapsible and expandable. The SQL query is shown for each tree rendering. Clear is used to remove the tree from view."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"trace-dependency-tree",src:r,placeholder:"blur"})}),`
`,e.jsx(i.h3,{id:"trace-count",children:"Trace count"}),`
`,e.jsx(i.p,{children:"The trace list is categorized by description. The trace count chart can be viewed as pie, line, bar, or area chart. The chart selector is collapsible and can be hidden."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"trace-count-chart",src:h,placeholder:"blur"})}),`
`,e.jsx(i.h3,{id:"trace-distribution",children:"Trace distribution"}),`
`,e.jsx(i.p,{children:"The trace distribution chart shows traces across Phoenix hosts on which they are running. Chart types include pie, line, bar, and area. The chart selector is collapsible and can be hidden."}),`
`,e.jsx(i.h3,{id:"timeline",children:"Timeline"}),`
`,e.jsx(i.p,{children:"The traces can be viewed along the time axis for a given trace id. Traces can be added or cleared from the timeline. There should be a minimum of two traces starting at two different times for the system to draw its timeline. This feature helps the user to easily compare execution times between traces and within the same trace."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"trace-time-line",src:l,placeholder:"blur"})})]})}function m(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{d as _markdown,m as default,g as extractedReferences,p as frontmatter,k as structuredData,x as toc};
