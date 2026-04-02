import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as t}from"./pherf-oyANWIFY.js";let r=`

<img alt="pherf" src={__img0} placeholder="blur" />

## Overview

Pherf is a standalone tool for performance and functional testing through Phoenix. Pherf can be used both to generate highly customized datasets and to measure SQL performance against that data.

### Build all of Phoenix (includes Pherf default profile)

\`\`\`shell
mvn clean package -DskipTests
\`\`\`

## Running

* Edit \`config/env.sh\` to include the required property values.
* \`bin/pherf-standalone.py -h\`
* Example: \`bin/pherf-standalone.py -drop all -l -q -z [zookeeper] -schemaFile .*user_defined_schema.sql -scenarioFile .*user_defined_scenario.xml\`

## Example run commands

### List all scenario files available to run.

\`\`\`shell
./pherf-standalone.py -listFiles
\`\`\`

### Drop all existing tables, load and query data specified in all scenario files.

\`\`\`shell
./pherf-standalone.py -drop all -l -q -z localhost
\`\`\`

## Pherf arguments:

* \`-h\` *Help*
* \`-l\` *Apply schema and load data*
* \`-q\` *Executes multi-threaded query sets and writes results*
* \`-z [quorum]\` *ZooKeeper quorum*
* \`-m\` *Enable monitor for statistics*
* \`-monitorFrequency [frequency in ms]\` *Frequency at which the monitor will snapshot stats to log file*
* \`-drop [pattern]\` *Regex drop all tables with schema name as PHERF. Example drop Event tables: \`-drop .*(EVENT).*\`. Drop all: \`-drop .*\` or \`-drop all\`*
* \`-scenarioFile\` *Regex or file name of a specific scenario file to run*
* \`-schemaFile\` *Regex or file name of a specific schema file to run*
* \`-export\` *Exports query results to CSV files in \`CSV_EXPORT\` directory*
* \`-diff\` *Compares results with previously exported results*
* \`-hint\` *Executes all queries with specified hint. Example: \`SMALL\`*
* \`-rowCountOverride\`
* \`-rowCountOverride [number of rows]\` *Specify number of rows to be upserted rather than using row count specified in schema*

## Adding Rules for Data Creation

Review [test\\_scenario.xml](https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=blob;f=phoenix-pherf/src/test/resources/scenario/test_scenario.xml)
for syntax examples.

* Rules are defined as \`<columns />\` and are applied in the order they appear in file.
* Rules of the same type override the values of a prior rule of the same type. If \`<userDefined>true</userDefined>\` is
  set, rule will only
  apply override when type and name match the column name in Phoenix.
* \`<prefix>\` tag is set at the column level. It can be used to define a constant string appended to the beginning of
  \`CHAR\` and \`VARCHAR\` data type values.
* **Required field** Supported Phoenix types: \`VARCHAR\`, \`CHAR\`, \`DATE\`, \`DECIMAL\`, \`INTEGER\`
  * denoted by the \`<type>\` tag
* User defined true changes rule matching to use both name and type fields to determine equivalence.
  * Default is false if not specified and equivalence will be determined by type only. **An important note here is that you can still override rules without the user defined flag, but they will change the rule globally and not just for a specified column.**
* **Required field** Supported Data Sequences
  * \`RANDOM\`: Random value which can be bound by other fields such as length.
  * \`SEQUENTIAL\`: Monotonically increasing long prepended to random strings.
    * Only supported on \`VARCHAR\` and \`CHAR\` types
  * \`LIST\`: Means pick values from predefined list of values
* **Required field** Length defines boundary for random values for \`CHAR\` and \`VARCHAR\` types.
  * denoted by the \`<length>\` tag
* Column level Min/Max value defines boundaries for numerical values. For \`DATE\`s, these values supply a range between
  which values are generated. At the column level the granularity is a year. At a specific data value level, the
  granularity is down to the Ms.
  * denoted by the \`<minValue>\` tag
  * denoted by the \`<maxValue>\` tag
* Null chance denotes the probability of generating a null value. From \\[0-100]. The higher the number, the more likely
  the value will be null. Denoted by \`<nullChance>\`.
* Name can either be any text or the actual column name in the Phoenix table.
  * denoted by the \`<name>\` tag
* Value List is used in conjunction with \`LIST\` data sequences. Each entry is a \`DataValue\` with a specified value to be
  used when generating data.
  * Denoted by the \`<valueList><datavalue><value/></datavalue></valueList>\` tags
  * If the distribution attribute on the datavalue is set, values will be created according to
    that probability.
  * When distribution is used, values must add up to 100%.
  * If distribution is not used, values will be randomly picked from the list with equal distribution.

## Defining Scenario

A scenario can have multiple querySets. Consider the following example: concurrency of 1-4 means that each query will be
executed starting with concurrency level of 1 and reach up to maximum concurrency of 4. Per thread, query would be
executed to a minimum of 10 times or 10 seconds (whichever comes first). QuerySet by default is executed serially but you
can change executionType to PARALLEL so queries are executed concurrently. Each Query may have an optional timeoutDuration
field that defines the amount of time (in milliseconds) before execution for that Query is cancelled. Scenarios are defined
in XML files stored in the resource directory.

\`\`\`xml
<scenarios>
  <querySet concurrency="1-4" executionType="PARALLEL" executionDurationInMs="10000" numberOfExecutions="10">
    <query id="q1" verifyRowCount="false" statement="select count(*) from PHERF.TEST_TABLE"/>
    <query id="q2" tenantId="1234567890" timeoutDuration="10000" ddl="create view if not exists myview(mypk varchar not null primary key, mycol varchar)" statement="upsert select ..."/>
  </querySet>
  <querySet concurrency="3" executionType="SERIAL" executionDurationInMs="20000" numberOfExecutions="100">
    <query id="q3" verifyRowCount="false" statement="select count(*) from PHERF.TEST_TABLE"/>
    <query id="q4" statement="select count(*) from PHERF.TEST_TABLE WHERE TENANT_ID='00D000000000062'"/>
  </querySet>
</scenarios>
\`\`\`

## Results

Results are written real time in *results* directory. Open the result that is saved in .jpg format for real time
visualization. Results are written using DataModelResult objects, which are modified over the course of each Pherf
run.

### XML results

Pherf XML results have a similar format to the corresponding scenario.xml file used for the Pherf run, but also include
additional information, such as the execution time of queries, whether queries timed out, and result row count.

\`\`\`xml
<queryResults expectedAggregateRowCount="100000" id="q1" statement="SELECT COUNT(*) FROM PHERF.USER_DEFINED_TEST" timeoutDuration="0">
  <threadTimes threadName="1,1">
    <runTimesInMs elapsedDurationInMs="1873" resultRowCount="100000" startTime="2020-04-09T11:28:12.623-07:00" timedOut="true"/>
    <runTimesInMs elapsedDurationInMs="1793" resultRowCount="100000" startTime="2020-04-09T11:28:14.511-07:00" timedOut="true"/>
    <runTimesInMs elapsedDurationInMs="1764" resultRowCount="100000" startTime="2020-04-09T11:28:16.319-07:00" timedOut="true"/>
  </threadTimes>
</queryResults>
\`\`\`

### CSV results

Each row in a CSV result file represents a single execution of a query and provides details about a query execution's
runtime, timeout status, result row count, and more. The header file format can be found in \`Header.java\`.

## Testing

Default quorum is localhost. If you want to override set the system variable.

Run unit tests: \`mvn test -DZK_QUORUM=localhost\`\\
Run a specific method: \`mvn -Dtest=ClassName#methodName test\`

More to come...
`,h={title:"Performance Testing",description:"Use Pherf to generate data and run Phoenix performance tests."},d=[{href:"https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=blob;f=phoenix-pherf/src/test/resources/scenario/test_scenario.xml"}],o={contents:[{heading:"performance-testing-overview",content:"Pherf is a standalone tool for performance and functional testing through Phoenix. Pherf can be used both to generate highly customized datasets and to measure SQL performance against that data."},{heading:"running",content:"Edit config/env.sh to include the required property values."},{heading:"running",content:"bin/pherf-standalone.py -h"},{heading:"running",content:"Example: bin/pherf-standalone.py -drop all -l -q -z [zookeeper] -schemaFile .*user_defined_schema.sql -scenarioFile .*user_defined_scenario.xml"},{heading:"pherf-arguments",content:"-h Help"},{heading:"pherf-arguments",content:"-l Apply schema and load data"},{heading:"pherf-arguments",content:"-q Executes multi-threaded query sets and writes results"},{heading:"pherf-arguments",content:"-z [quorum] ZooKeeper quorum"},{heading:"pherf-arguments",content:"-m Enable monitor for statistics"},{heading:"pherf-arguments",content:"-monitorFrequency [frequency in ms] Frequency at which the monitor will snapshot stats to log file"},{heading:"pherf-arguments",content:"-drop [pattern] Regex drop all tables with schema name as PHERF. Example drop Event tables: -drop .*(EVENT).*. Drop all: -drop .* or -drop all"},{heading:"pherf-arguments",content:"-scenarioFile Regex or file name of a specific scenario file to run"},{heading:"pherf-arguments",content:"-schemaFile Regex or file name of a specific schema file to run"},{heading:"pherf-arguments",content:"-export Exports query results to CSV files in CSV_EXPORT directory"},{heading:"pherf-arguments",content:"-diff Compares results with previously exported results"},{heading:"pherf-arguments",content:"-hint Executes all queries with specified hint. Example: SMALL"},{heading:"pherf-arguments",content:"-rowCountOverride"},{heading:"pherf-arguments",content:"-rowCountOverride [number of rows] Specify number of rows to be upserted rather than using row count specified in schema"},{heading:"adding-rules-for-data-creation",content:`Review test_scenario.xml
for syntax examples.`},{heading:"adding-rules-for-data-creation",content:"Rules are defined as <columns /> and are applied in the order they appear in file."},{heading:"adding-rules-for-data-creation",content:`Rules of the same type override the values of a prior rule of the same type. If <userDefined>true</userDefined> is
set, rule will only
apply override when type and name match the column name in Phoenix.`},{heading:"adding-rules-for-data-creation",content:`<prefix> tag is set at the column level. It can be used to define a constant string appended to the beginning of
CHAR and VARCHAR data type values.`},{heading:"adding-rules-for-data-creation",content:"Required field Supported Phoenix types: VARCHAR, CHAR, DATE, DECIMAL, INTEGER"},{heading:"adding-rules-for-data-creation",content:"denoted by the <type> tag"},{heading:"adding-rules-for-data-creation",content:"User defined true changes rule matching to use both name and type fields to determine equivalence."},{heading:"adding-rules-for-data-creation",content:"Default is false if not specified and equivalence will be determined by type only. An important note here is that you can still override rules without the user defined flag, but they will change the rule globally and not just for a specified column."},{heading:"adding-rules-for-data-creation",content:"Required field Supported Data Sequences"},{heading:"adding-rules-for-data-creation",content:"RANDOM: Random value which can be bound by other fields such as length."},{heading:"adding-rules-for-data-creation",content:"SEQUENTIAL: Monotonically increasing long prepended to random strings."},{heading:"adding-rules-for-data-creation",content:"Only supported on VARCHAR and CHAR types"},{heading:"adding-rules-for-data-creation",content:"LIST: Means pick values from predefined list of values"},{heading:"adding-rules-for-data-creation",content:"Required field Length defines boundary for random values for CHAR and VARCHAR types."},{heading:"adding-rules-for-data-creation",content:"denoted by the <length> tag"},{heading:"adding-rules-for-data-creation",content:`Column level Min/Max value defines boundaries for numerical values. For DATEs, these values supply a range between
which values are generated. At the column level the granularity is a year. At a specific data value level, the
granularity is down to the Ms.`},{heading:"adding-rules-for-data-creation",content:"denoted by the <minValue> tag"},{heading:"adding-rules-for-data-creation",content:"denoted by the <maxValue> tag"},{heading:"adding-rules-for-data-creation",content:`Null chance denotes the probability of generating a null value. From [0-100]. The higher the number, the more likely
the value will be null. Denoted by <nullChance>.`},{heading:"adding-rules-for-data-creation",content:"Name can either be any text or the actual column name in the Phoenix table."},{heading:"adding-rules-for-data-creation",content:"denoted by the <name> tag"},{heading:"adding-rules-for-data-creation",content:`Value List is used in conjunction with LIST data sequences. Each entry is a DataValue with a specified value to be
used when generating data.`},{heading:"adding-rules-for-data-creation",content:"Denoted by the <valueList><datavalue><value/></datavalue></valueList> tags"},{heading:"adding-rules-for-data-creation",content:`If the distribution attribute on the datavalue is set, values will be created according to
that probability.`},{heading:"adding-rules-for-data-creation",content:"When distribution is used, values must add up to 100%."},{heading:"adding-rules-for-data-creation",content:"If distribution is not used, values will be randomly picked from the list with equal distribution."},{heading:"defining-scenario",content:`A scenario can have multiple querySets. Consider the following example: concurrency of 1-4 means that each query will be
executed starting with concurrency level of 1 and reach up to maximum concurrency of 4. Per thread, query would be
executed to a minimum of 10 times or 10 seconds (whichever comes first). QuerySet by default is executed serially but you
can change executionType to PARALLEL so queries are executed concurrently. Each Query may have an optional timeoutDuration
field that defines the amount of time (in milliseconds) before execution for that Query is cancelled. Scenarios are defined
in XML files stored in the resource directory.`},{heading:"results",content:`Results are written real time in results directory. Open the result that is saved in .jpg format for real time
visualization. Results are written using DataModelResult objects, which are modified over the course of each Pherf
run.`},{heading:"xml-results",content:`Pherf XML results have a similar format to the corresponding scenario.xml file used for the Pherf run, but also include
additional information, such as the execution time of queries, whether queries timed out, and result row count.`},{heading:"csv-results",content:`Each row in a CSV result file represents a single execution of a query and provides details about a query execution's
runtime, timeout status, result row count, and more. The header file format can be found in Header.java.`},{heading:"testing",content:"Default quorum is localhost. If you want to override set the system variable."},{heading:"testing",content:"Run unit tests: mvn test -DZK_QUORUM=localhostRun a specific method: mvn -Dtest=ClassName#methodName test"},{heading:"testing",content:"More to come..."}],headings:[{id:"performance-testing-overview",content:"Overview"},{id:"build-all-of-phoenix-includes-pherf-default-profile",content:"Build all of Phoenix (includes Pherf default profile)"},{id:"running",content:"Running"},{id:"example-run-commands",content:"Example run commands"},{id:"list-all-scenario-files-available-to-run",content:"List all scenario files available to run."},{id:"drop-all-existing-tables-load-and-query-data-specified-in-all-scenario-files",content:"Drop all existing tables, load and query data specified in all scenario files."},{id:"pherf-arguments",content:"Pherf arguments:"},{id:"adding-rules-for-data-creation",content:"Adding Rules for Data Creation"},{id:"defining-scenario",content:"Defining Scenario"},{id:"results",content:"Results"},{id:"xml-results",content:"XML results"},{id:"csv-results",content:"CSV results"},{id:"testing",content:"Testing"}]};const c=[{depth:2,url:"#performance-testing-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:3,url:"#build-all-of-phoenix-includes-pherf-default-profile",title:e.jsx(e.Fragment,{children:"Build all of Phoenix (includes Pherf default profile)"})},{depth:2,url:"#running",title:e.jsx(e.Fragment,{children:"Running"})},{depth:2,url:"#example-run-commands",title:e.jsx(e.Fragment,{children:"Example run commands"})},{depth:3,url:"#list-all-scenario-files-available-to-run",title:e.jsx(e.Fragment,{children:"List all scenario files available to run."})},{depth:3,url:"#drop-all-existing-tables-load-and-query-data-specified-in-all-scenario-files",title:e.jsx(e.Fragment,{children:"Drop all existing tables, load and query data specified in all scenario files."})},{depth:2,url:"#pherf-arguments",title:e.jsx(e.Fragment,{children:"Pherf arguments:"})},{depth:2,url:"#adding-rules-for-data-creation",title:e.jsx(e.Fragment,{children:"Adding Rules for Data Creation"})},{depth:2,url:"#defining-scenario",title:e.jsx(e.Fragment,{children:"Defining Scenario"})},{depth:2,url:"#results",title:e.jsx(e.Fragment,{children:"Results"})},{depth:3,url:"#xml-results",title:e.jsx(e.Fragment,{children:"XML results"})},{depth:3,url:"#csv-results",title:e.jsx(e.Fragment,{children:"CSV results"})},{depth:2,url:"#testing",title:e.jsx(e.Fragment,{children:"Testing"})}];function n(s){const i={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:e.jsx(i.img,{alt:"pherf",src:t,placeholder:"blur"})}),`
`,e.jsx(i.h2,{id:"performance-testing-overview",children:"Overview"}),`
`,e.jsx(i.p,{children:"Pherf is a standalone tool for performance and functional testing through Phoenix. Pherf can be used both to generate highly customized datasets and to measure SQL performance against that data."}),`
`,e.jsx(i.h3,{id:"build-all-of-phoenix-includes-pherf-default-profile",children:"Build all of Phoenix (includes Pherf default profile)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" package"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`,e.jsx(i.h2,{id:"running",children:"Running"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Edit ",e.jsx(i.code,{children:"config/env.sh"})," to include the required property values."]}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"bin/pherf-standalone.py -h"})}),`
`,e.jsxs(i.li,{children:["Example: ",e.jsx(i.code,{children:"bin/pherf-standalone.py -drop all -l -q -z [zookeeper] -schemaFile .*user_defined_schema.sql -scenarioFile .*user_defined_scenario.xml"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"example-run-commands",children:"Example run commands"}),`
`,e.jsx(i.h3,{id:"list-all-scenario-files-available-to-run",children:"List all scenario files available to run."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./pherf-standalone.py"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -listFiles"})]})})})}),`
`,e.jsx(i.h3,{id:"drop-all-existing-tables-load-and-query-data-specified-in-all-scenario-files",children:"Drop all existing tables, load and query data specified in all scenario files."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./pherf-standalone.py"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -drop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" all"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -l"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -q"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -z"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" localhost"})]})})})}),`
`,e.jsx(i.h2,{id:"pherf-arguments",children:"Pherf arguments:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-h"})," ",e.jsx(i.em,{children:"Help"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-l"})," ",e.jsx(i.em,{children:"Apply schema and load data"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-q"})," ",e.jsx(i.em,{children:"Executes multi-threaded query sets and writes results"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-z [quorum]"})," ",e.jsx(i.em,{children:"ZooKeeper quorum"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-m"})," ",e.jsx(i.em,{children:"Enable monitor for statistics"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-monitorFrequency [frequency in ms]"})," ",e.jsx(i.em,{children:"Frequency at which the monitor will snapshot stats to log file"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-drop [pattern]"})," ",e.jsxs(i.em,{children:["Regex drop all tables with schema name as PHERF. Example drop Event tables: ",e.jsx(i.code,{children:"-drop .*(EVENT).*"}),". Drop all: ",e.jsx(i.code,{children:"-drop .*"})," or ",e.jsx(i.code,{children:"-drop all"})]})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-scenarioFile"})," ",e.jsx(i.em,{children:"Regex or file name of a specific scenario file to run"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-schemaFile"})," ",e.jsx(i.em,{children:"Regex or file name of a specific schema file to run"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-export"})," ",e.jsxs(i.em,{children:["Exports query results to CSV files in ",e.jsx(i.code,{children:"CSV_EXPORT"})," directory"]})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-diff"})," ",e.jsx(i.em,{children:"Compares results with previously exported results"})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-hint"})," ",e.jsxs(i.em,{children:["Executes all queries with specified hint. Example: ",e.jsx(i.code,{children:"SMALL"})]})]}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"-rowCountOverride"})}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"-rowCountOverride [number of rows]"})," ",e.jsx(i.em,{children:"Specify number of rows to be upserted rather than using row count specified in schema"})]}),`
`]}),`
`,e.jsx(i.h2,{id:"adding-rules-for-data-creation",children:"Adding Rules for Data Creation"}),`
`,e.jsxs(i.p,{children:["Review ",e.jsx(i.a,{href:"https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=blob;f=phoenix-pherf/src/test/resources/scenario/test_scenario.xml",children:"test_scenario.xml"}),`
for syntax examples.`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Rules are defined as ",e.jsx(i.code,{children:"<columns />"})," and are applied in the order they appear in file."]}),`
`,e.jsxs(i.li,{children:["Rules of the same type override the values of a prior rule of the same type. If ",e.jsx(i.code,{children:"<userDefined>true</userDefined>"}),` is
set, rule will only
apply override when type and name match the column name in Phoenix.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"<prefix>"}),` tag is set at the column level. It can be used to define a constant string appended to the beginning of
`,e.jsx(i.code,{children:"CHAR"})," and ",e.jsx(i.code,{children:"VARCHAR"})," data type values."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Required field"})," Supported Phoenix types: ",e.jsx(i.code,{children:"VARCHAR"}),", ",e.jsx(i.code,{children:"CHAR"}),", ",e.jsx(i.code,{children:"DATE"}),", ",e.jsx(i.code,{children:"DECIMAL"}),", ",e.jsx(i.code,{children:"INTEGER"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["denoted by the ",e.jsx(i.code,{children:"<type>"})," tag"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["User defined true changes rule matching to use both name and type fields to determine equivalence.",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Default is false if not specified and equivalence will be determined by type only. ",e.jsx(i.strong,{children:"An important note here is that you can still override rules without the user defined flag, but they will change the rule globally and not just for a specified column."})]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Required field"})," Supported Data Sequences",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"RANDOM"}),": Random value which can be bound by other fields such as length."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SEQUENTIAL"}),": Monotonically increasing long prepended to random strings.",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Only supported on ",e.jsx(i.code,{children:"VARCHAR"})," and ",e.jsx(i.code,{children:"CHAR"})," types"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"LIST"}),": Means pick values from predefined list of values"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Required field"})," Length defines boundary for random values for ",e.jsx(i.code,{children:"CHAR"})," and ",e.jsx(i.code,{children:"VARCHAR"})," types.",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["denoted by the ",e.jsx(i.code,{children:"<length>"})," tag"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Column level Min/Max value defines boundaries for numerical values. For ",e.jsx(i.code,{children:"DATE"}),`s, these values supply a range between
which values are generated. At the column level the granularity is a year. At a specific data value level, the
granularity is down to the Ms.`,`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["denoted by the ",e.jsx(i.code,{children:"<minValue>"})," tag"]}),`
`,e.jsxs(i.li,{children:["denoted by the ",e.jsx(i.code,{children:"<maxValue>"})," tag"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[`Null chance denotes the probability of generating a null value. From [0-100]. The higher the number, the more likely
the value will be null. Denoted by `,e.jsx(i.code,{children:"<nullChance>"}),"."]}),`
`,e.jsxs(i.li,{children:["Name can either be any text or the actual column name in the Phoenix table.",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["denoted by the ",e.jsx(i.code,{children:"<name>"})," tag"]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:["Value List is used in conjunction with ",e.jsx(i.code,{children:"LIST"})," data sequences. Each entry is a ",e.jsx(i.code,{children:"DataValue"}),` with a specified value to be
used when generating data.`,`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Denoted by the ",e.jsx(i.code,{children:"<valueList><datavalue><value/></datavalue></valueList>"})," tags"]}),`
`,e.jsx(i.li,{children:`If the distribution attribute on the datavalue is set, values will be created according to
that probability.`}),`
`,e.jsx(i.li,{children:"When distribution is used, values must add up to 100%."}),`
`,e.jsx(i.li,{children:"If distribution is not used, values will be randomly picked from the list with equal distribution."}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"defining-scenario",children:"Defining Scenario"}),`
`,e.jsx(i.p,{children:`A scenario can have multiple querySets. Consider the following example: concurrency of 1-4 means that each query will be
executed starting with concurrency level of 1 and reach up to maximum concurrency of 4. Per thread, query would be
executed to a minimum of 10 times or 10 seconds (whichever comes first). QuerySet by default is executed serially but you
can change executionType to PARALLEL so queries are executed concurrently. Each Query may have an optional timeoutDuration
field that defines the amount of time (in milliseconds) before execution for that Query is cancelled. Scenarios are defined
in XML files stored in the resource directory.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"scenarios"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"querySet"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" concurrency"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1-4"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" executionType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"PARALLEL"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" executionDurationInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"10000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" numberOfExecutions"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"10"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"query"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"q1"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" verifyRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"false"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" statement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"select count(*) from PHERF.TEST_TABLE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"query"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"q2"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" tenantId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1234567890"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" timeoutDuration"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"10000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ddl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"create view if not exists myview(mypk varchar not null primary key, mycol varchar)"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" statement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"upsert select ..."'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"querySet"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"querySet"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" concurrency"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"3"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" executionType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"SERIAL"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" executionDurationInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"20000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" numberOfExecutions"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"100"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"query"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"q3"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" verifyRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"false"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" statement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"select count(*) from PHERF.TEST_TABLE"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"query"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"q4"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" statement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"select count(*) from PHERF.TEST_TABLE WHERE TENANT_ID='00D000000000062'"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"querySet"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"scenarios"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h2,{id:"results",children:"Results"}),`
`,e.jsxs(i.p,{children:["Results are written real time in ",e.jsx(i.em,{children:"results"}),` directory. Open the result that is saved in .jpg format for real time
visualization. Results are written using DataModelResult objects, which are modified over the course of each Pherf
run.`]}),`
`,e.jsx(i.h3,{id:"xml-results",children:"XML results"}),`
`,e.jsx(i.p,{children:`Pherf XML results have a similar format to the corresponding scenario.xml file used for the Pherf run, but also include
additional information, such as the execution time of queries, whether queries timed out, and result row count.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"queryResults"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" expectedAggregateRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"100000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"q1"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" statement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"SELECT COUNT(*) FROM PHERF.USER_DEFINED_TEST"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" timeoutDuration"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"0"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"threadTimes"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" threadName"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1,1"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"runTimesInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" elapsedDurationInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1873"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" resultRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"100000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" startTime"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"2020-04-09T11:28:12.623-07:00"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" timedOut"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"runTimesInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" elapsedDurationInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1793"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" resultRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"100000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" startTime"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"2020-04-09T11:28:14.511-07:00"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" timedOut"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"runTimesInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" elapsedDurationInMs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"1764"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" resultRowCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"100000"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" startTime"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"2020-04-09T11:28:16.319-07:00"'}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" timedOut"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"true"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"threadTimes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"queryResults"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h3,{id:"csv-results",children:"CSV results"}),`
`,e.jsxs(i.p,{children:[`Each row in a CSV result file represents a single execution of a query and provides details about a query execution's
runtime, timeout status, result row count, and more. The header file format can be found in `,e.jsx(i.code,{children:"Header.java"}),"."]}),`
`,e.jsx(i.h2,{id:"testing",children:"Testing"}),`
`,e.jsx(i.p,{children:"Default quorum is localhost. If you want to override set the system variable."}),`
`,e.jsxs(i.p,{children:["Run unit tests: ",e.jsx(i.code,{children:"mvn test -DZK_QUORUM=localhost"}),e.jsx(i.br,{}),`
`,"Run a specific method: ",e.jsx(i.code,{children:"mvn -Dtest=ClassName#methodName test"})]}),`
`,e.jsx(i.p,{children:"More to come..."})]})}function u(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{r as _markdown,u as default,d as extractedReferences,h as frontmatter,o as structuredData,c as toc};
