import{j as e}from"./jsx-runtime-fm7E3NsZ.js";import{_ as t}from"./producer_consumer-C3WRDQ2y.js";let o=`

The plugin enables reliable and efficient streaming of large amounts of data/logs into HBase using the Phoenix API.

Apache Kafka™ is a distributed, partitioned, replicated commit log service. It provides the functionality of a messaging system, but with a unique design.

At a high level, producers send messages over the network to the Kafka cluster, which then serves them to consumers:

<img alt="Kafka Producer and Consumer" src={__img0} placeholder="blur" />

Phoenix provides **PhoenixConsumer** to receive messages from Kafka producers.

## Prerequisites

* Phoenix 4.10.0+
* Kafka 0.9.0.0+

## Installation and Setup

Use our binary artifacts for Phoenix 4.10.0+ directly or download and build Phoenix yourself (see
instructions [here](/docs/fundamentals/building)).

## PhoenixConsumer with RegexEventSerializer

Create a \`kafka-consumer-regex.properties\` file with the following properties:

\`\`\`properties
serializer=regex
serializer.rowkeyType=uuid
serializer.regex=([^\\,]*),([^\\,]*),([^\\,]*)
serializer.columns=c1,c2,c3

jdbcUrl=jdbc:phoenix:localhost
table=SAMPLE1
ddl=CREATE TABLE IF NOT EXISTS SAMPLE1(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))

bootstrap.servers=localhost:9092
topics=topic1,topic2
poll.timeout.ms=100
\`\`\`

## PhoenixConsumer with JsonEventSerializer

Create a \`kafka-consumer-json.properties\` file with the following properties:

\`\`\`properties
serializer=json
serializer.rowkeyType=uuid
serializer.columns=c1,c2,c3

jdbcUrl=jdbc:phoenix:localhost
table=SAMPLE2
ddl=CREATE TABLE IF NOT EXISTS SAMPLE2(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))

bootstrap.servers=localhost:9092
topics=topic1,topic2
poll.timeout.ms=100
\`\`\`

## PhoenixConsumer Execution Procedure

Start the Kafka producer, then send some messages:

\`\`\`shell
> bin/kafka-console-producer.sh --broker-list localhost:9092 --topic topic1
\`\`\`

Learn more about Apache Kafka [here](https://kafka.apache.org/documentation.html).

Start **PhoenixConsumer** using the command below:

\`\`\`shell
HADOOP_CLASSPATH=$(hbase classpath):/path/to/hbase/conf hadoop jar phoenix-kafka-<version>-minimal.jar org.apache.phoenix.kafka.consumer.PhoenixConsumerTool --file /data/kafka-consumer.properties
\`\`\`

The input file must be present on HDFS (not the local filesystem where the command is being run).

## Configuration

| Property Name           | Default | Description                                                                                                                                                                                  |
| ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`bootstrap.servers\`     |         | List of Kafka servers used to bootstrap connections to Kafka. Format: \`host1:port1,host2:port2,...\`                                                                                          |
| \`topics\`                |         | List of topics to use as input for this connector. Format: \`topic1,topic2,...\`                                                                                                               |
| \`poll.timeout.ms\`       | \`100\`   | Default poll timeout in milliseconds.                                                                                                                                                        |
| \`batchSize\`             | \`100\`   | Default number of events per transaction.                                                                                                                                                    |
| \`zookeeperQuorum\`       |         | ZooKeeper quorum of the HBase cluster.                                                                                                                                                       |
| \`table\`                 |         | Name of the table in HBase to write to.                                                                                                                                                      |
| \`ddl\`                   |         | The \`CREATE TABLE\` query for the HBase table where events will be upserted. If specified, this query is executed. It is recommended to include \`IF NOT EXISTS\` in the DDL.                   |
| \`serializer\`            |         | Event serializer for processing Kafka messages. This plugin supports Phoenix Flume event serializers (for example, \`regex\`, \`json\`).                                                         |
| \`serializer.regex\`      | \`(.*)\`  | Regular expression for parsing the message.                                                                                                                                                  |
| \`serializer.columns\`    |         | Columns that will be extracted from the message for inserting into HBase.                                                                                                                    |
| \`serializer.headers\`    |         | Headers that go as part of the \`UPSERT\` query. Data type for these columns is \`VARCHAR\` by default.                                                                                          |
| \`serializer.rowkeyType\` |         | Custom row key generator. Can be one of \`timestamp\`, \`date\`, \`uuid\`, \`random\`, or \`nanotimestamp\`. Configure this when a custom row key should be auto-generated for the primary key column. |

> **Note:** This plugin supports Phoenix Flume event serializers.

* **RegexEventSerializer** parses Kafka messages based on the regex specified in the configuration file.
* **JsonEventSerializer** parses Kafka messages based on the schema specified in the configuration file.
`,l={title:"Kafka Plugin",description:"Ingest Kafka messages into Phoenix using PhoenixConsumer."},h=[{href:"/docs/fundamentals/building"},{href:"https://kafka.apache.org/documentation.html"}],c={contents:[{heading:void 0,content:"The plugin enables reliable and efficient streaming of large amounts of data/logs into HBase using the Phoenix API."},{heading:void 0,content:"Apache Kafka™ is a distributed, partitioned, replicated commit log service. It provides the functionality of a messaging system, but with a unique design."},{heading:void 0,content:"At a high level, producers send messages over the network to the Kafka cluster, which then serves them to consumers:"},{heading:void 0,content:"Phoenix provides PhoenixConsumer to receive messages from Kafka producers."},{heading:"kafka-plugin-prerequisites",content:"Phoenix 4.10.0+"},{heading:"kafka-plugin-prerequisites",content:"Kafka 0.9.0.0+"},{heading:"kafka-plugin-installation-and-setup",content:`Use our binary artifacts for Phoenix 4.10.0+ directly or download and build Phoenix yourself (see
instructions here).`},{heading:"phoenixconsumer-with-regexeventserializer",content:"Create a kafka-consumer-regex.properties file with the following properties:"},{heading:"phoenixconsumer-with-jsoneventserializer",content:"Create a kafka-consumer-json.properties file with the following properties:"},{heading:"phoenixconsumer-execution-procedure",content:"Start the Kafka producer, then send some messages:"},{heading:"phoenixconsumer-execution-procedure",content:"Learn more about Apache Kafka here."},{heading:"phoenixconsumer-execution-procedure",content:"Start PhoenixConsumer using the command below:"},{heading:"phoenixconsumer-execution-procedure",content:"The input file must be present on HDFS (not the local filesystem where the command is being run)."},{heading:"kafka-plugin-configuration",content:"Property Name"},{heading:"kafka-plugin-configuration",content:"Default"},{heading:"kafka-plugin-configuration",content:"Description"},{heading:"kafka-plugin-configuration",content:"bootstrap.servers"},{heading:"kafka-plugin-configuration",content:"List of Kafka servers used to bootstrap connections to Kafka. Format: host1:port1,host2:port2,..."},{heading:"kafka-plugin-configuration",content:"topics"},{heading:"kafka-plugin-configuration",content:"List of topics to use as input for this connector. Format: topic1,topic2,..."},{heading:"kafka-plugin-configuration",content:"poll.timeout.ms"},{heading:"kafka-plugin-configuration",content:"100"},{heading:"kafka-plugin-configuration",content:"Default poll timeout in milliseconds."},{heading:"kafka-plugin-configuration",content:"batchSize"},{heading:"kafka-plugin-configuration",content:"100"},{heading:"kafka-plugin-configuration",content:"Default number of events per transaction."},{heading:"kafka-plugin-configuration",content:"zookeeperQuorum"},{heading:"kafka-plugin-configuration",content:"ZooKeeper quorum of the HBase cluster."},{heading:"kafka-plugin-configuration",content:"table"},{heading:"kafka-plugin-configuration",content:"Name of the table in HBase to write to."},{heading:"kafka-plugin-configuration",content:"ddl"},{heading:"kafka-plugin-configuration",content:"The CREATE TABLE query for the HBase table where events will be upserted. If specified, this query is executed. It is recommended to include IF NOT EXISTS in the DDL."},{heading:"kafka-plugin-configuration",content:"serializer"},{heading:"kafka-plugin-configuration",content:"Event serializer for processing Kafka messages. This plugin supports Phoenix Flume event serializers (for example, regex, json)."},{heading:"kafka-plugin-configuration",content:"serializer.regex"},{heading:"kafka-plugin-configuration",content:"(.*)"},{heading:"kafka-plugin-configuration",content:"Regular expression for parsing the message."},{heading:"kafka-plugin-configuration",content:"serializer.columns"},{heading:"kafka-plugin-configuration",content:"Columns that will be extracted from the message for inserting into HBase."},{heading:"kafka-plugin-configuration",content:"serializer.headers"},{heading:"kafka-plugin-configuration",content:"Headers that go as part of the UPSERT query. Data type for these columns is VARCHAR by default."},{heading:"kafka-plugin-configuration",content:"serializer.rowkeyType"},{heading:"kafka-plugin-configuration",content:"Custom row key generator. Can be one of timestamp, date, uuid, random, or nanotimestamp. Configure this when a custom row key should be auto-generated for the primary key column."},{heading:"kafka-plugin-configuration",content:"Note: This plugin supports Phoenix Flume event serializers."},{heading:"kafka-plugin-configuration",content:"RegexEventSerializer parses Kafka messages based on the regex specified in the configuration file."},{heading:"kafka-plugin-configuration",content:"JsonEventSerializer parses Kafka messages based on the schema specified in the configuration file."}],headings:[{id:"kafka-plugin-prerequisites",content:"Prerequisites"},{id:"kafka-plugin-installation-and-setup",content:"Installation and Setup"},{id:"phoenixconsumer-with-regexeventserializer",content:"PhoenixConsumer with RegexEventSerializer"},{id:"phoenixconsumer-with-jsoneventserializer",content:"PhoenixConsumer with JsonEventSerializer"},{id:"phoenixconsumer-execution-procedure",content:"PhoenixConsumer Execution Procedure"},{id:"kafka-plugin-configuration",content:"Configuration"}]};const d=[{depth:2,url:"#kafka-plugin-prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#kafka-plugin-installation-and-setup",title:e.jsx(e.Fragment,{children:"Installation and Setup"})},{depth:2,url:"#phoenixconsumer-with-regexeventserializer",title:e.jsx(e.Fragment,{children:"PhoenixConsumer with RegexEventSerializer"})},{depth:2,url:"#phoenixconsumer-with-jsoneventserializer",title:e.jsx(e.Fragment,{children:"PhoenixConsumer with JsonEventSerializer"})},{depth:2,url:"#phoenixconsumer-execution-procedure",title:e.jsx(e.Fragment,{children:"PhoenixConsumer Execution Procedure"})},{depth:2,url:"#kafka-plugin-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})}];function s(n){const i={a:"a",blockquote:"blockquote",code:"code",h2:"h2",img:"img",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"The plugin enables reliable and efficient streaming of large amounts of data/logs into HBase using the Phoenix API."}),`
`,e.jsx(i.p,{children:"Apache Kafka™ is a distributed, partitioned, replicated commit log service. It provides the functionality of a messaging system, but with a unique design."}),`
`,e.jsx(i.p,{children:"At a high level, producers send messages over the network to the Kafka cluster, which then serves them to consumers:"}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"Kafka Producer and Consumer",src:t,placeholder:"blur"})}),`
`,e.jsxs(i.p,{children:["Phoenix provides ",e.jsx(i.strong,{children:"PhoenixConsumer"})," to receive messages from Kafka producers."]}),`
`,e.jsx(i.h2,{id:"kafka-plugin-prerequisites",children:"Prerequisites"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Phoenix 4.10.0+"}),`
`,e.jsx(i.li,{children:"Kafka 0.9.0.0+"}),`
`]}),`
`,e.jsx(i.h2,{id:"kafka-plugin-installation-and-setup",children:"Installation and Setup"}),`
`,e.jsxs(i.p,{children:[`Use our binary artifacts for Phoenix 4.10.0+ directly or download and build Phoenix yourself (see
instructions `,e.jsx(i.a,{href:"/docs/fundamentals/building",children:"here"}),")."]}),`
`,e.jsx(i.h2,{id:"phoenixconsumer-with-regexeventserializer",children:"PhoenixConsumer with RegexEventSerializer"}),`
`,e.jsxs(i.p,{children:["Create a ",e.jsx(i.code,{children:"kafka-consumer-regex.properties"})," file with the following properties:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=regex"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer.rowkeyType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=uuid"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer.regex"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=([^\\,]*),([^\\,]*),([^\\,]*)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer.columns"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=c1,c2,c3"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"jdbcUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=jdbc:phoenix:localhost"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=SAMPLE1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ddl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=CREATE TABLE IF NOT EXISTS SAMPLE1(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"bootstrap.servers"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=localhost:9092"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"topics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=topic1,topic2"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"poll.timeout.ms"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=100"})]})]})})}),`
`,e.jsx(i.h2,{id:"phoenixconsumer-with-jsoneventserializer",children:"PhoenixConsumer with JsonEventSerializer"}),`
`,e.jsxs(i.p,{children:["Create a ",e.jsx(i.code,{children:"kafka-consumer-json.properties"})," file with the following properties:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=json"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer.rowkeyType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=uuid"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"serializer.columns"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=c1,c2,c3"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"jdbcUrl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=jdbc:phoenix:localhost"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"table"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=SAMPLE2"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ddl"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=CREATE TABLE IF NOT EXISTS SAMPLE2(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"bootstrap.servers"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=localhost:9092"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"topics"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=topic1,topic2"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"poll.timeout.ms"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=100"})]})]})})}),`
`,e.jsx(i.h2,{id:"phoenixconsumer-execution-procedure",children:"PhoenixConsumer Execution Procedure"}),`
`,e.jsx(i.p,{children:"Start the Kafka producer, then send some messages:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" bin/kafka-console-producer.sh --broker-list localhost:9092 --topic topic1"})]})})})}),`
`,e.jsxs(i.p,{children:["Learn more about Apache Kafka ",e.jsx(i.a,{href:"https://kafka.apache.org/documentation.html",children:"here"}),"."]}),`
`,e.jsxs(i.p,{children:["Start ",e.jsx(i.strong,{children:"PhoenixConsumer"})," using the command below:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"HADOOP_CLASSPATH"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" classpath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:":/path/to/hbase/conf"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hadoop"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" phoenix-kafka-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"versio"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"n"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"-minimal.jar"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.phoenix.kafka.consumer.PhoenixConsumerTool"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --file"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /data/kafka-consumer.properties"})]})})})}),`
`,e.jsx(i.p,{children:"The input file must be present on HDFS (not the local filesystem where the command is being run)."}),`
`,e.jsx(i.h2,{id:"kafka-plugin-configuration",children:"Configuration"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Property Name"}),e.jsx(i.th,{children:"Default"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"bootstrap.servers"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["List of Kafka servers used to bootstrap connections to Kafka. Format: ",e.jsx(i.code,{children:"host1:port1,host2:port2,..."})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"topics"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["List of topics to use as input for this connector. Format: ",e.jsx(i.code,{children:"topic1,topic2,..."})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"poll.timeout.ms"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"100"})}),e.jsx(i.td,{children:"Default poll timeout in milliseconds."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"batchSize"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"100"})}),e.jsx(i.td,{children:"Default number of events per transaction."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"zookeeperQuorum"})}),e.jsx(i.td,{}),e.jsx(i.td,{children:"ZooKeeper quorum of the HBase cluster."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"table"})}),e.jsx(i.td,{}),e.jsx(i.td,{children:"Name of the table in HBase to write to."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ddl"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["The ",e.jsx(i.code,{children:"CREATE TABLE"})," query for the HBase table where events will be upserted. If specified, this query is executed. It is recommended to include ",e.jsx(i.code,{children:"IF NOT EXISTS"})," in the DDL."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializer"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["Event serializer for processing Kafka messages. This plugin supports Phoenix Flume event serializers (for example, ",e.jsx(i.code,{children:"regex"}),", ",e.jsx(i.code,{children:"json"}),")."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializer.regex"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"(.*)"})}),e.jsx(i.td,{children:"Regular expression for parsing the message."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializer.columns"})}),e.jsx(i.td,{}),e.jsx(i.td,{children:"Columns that will be extracted from the message for inserting into HBase."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializer.headers"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["Headers that go as part of the ",e.jsx(i.code,{children:"UPSERT"})," query. Data type for these columns is ",e.jsx(i.code,{children:"VARCHAR"})," by default."]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"serializer.rowkeyType"})}),e.jsx(i.td,{}),e.jsxs(i.td,{children:["Custom row key generator. Can be one of ",e.jsx(i.code,{children:"timestamp"}),", ",e.jsx(i.code,{children:"date"}),", ",e.jsx(i.code,{children:"uuid"}),", ",e.jsx(i.code,{children:"random"}),", or ",e.jsx(i.code,{children:"nanotimestamp"}),". Configure this when a custom row key should be auto-generated for the primary key column."]})]})]})]}),`
`,e.jsxs(i.blockquote,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Note:"})," This plugin supports Phoenix Flume event serializers."]}),`
`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"RegexEventSerializer"})," parses Kafka messages based on the regex specified in the configuration file."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"JsonEventSerializer"})," parses Kafka messages based on the schema specified in the configuration file."]}),`
`]})]})}function p(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{o as _markdown,p as default,h as extractedReferences,l as frontmatter,c as structuredData,d as toc};
