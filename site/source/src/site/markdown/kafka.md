# Apache Kafka Plugin

The plugin enables us to reliably and efficiently stream large amounts of data/logs onto HBase using the Phoenix API. 

Apache Kafka™ is a distributed, partitioned, replicated commit log service. It provides the functionality of a messaging system, but with a unique design.

So, at a high level, producers send messages over the network to the Kafka cluster which in turn serves them up to consumers like this:

#![alt text](https://kafka.apache.org/090/images/producer_consumer.png "Kafka Producer and Consumer")

We are providing **PhoenixConsumer** to recieves the messages from **Kafka Producer**.


#### Prerequisites:

* Phoenix 4.10.0+
* Kafka 0.9.0.0+

#### Installation & Setup:

Use our binary artifacts for Phoenix 4.10.0+ directly or download and build Phoenix yourself (see
instructions [here](building.html))

#### Phoenix Consumer for RegexEventSerializer Example:

Create a `kafka-consumer-regex.properties` file with below properties

```
serializer=regex
serializer.rowkeyType=uuid
serializer.regex=([^\,]*),([^\,]*),([^\,]*)
serializer.columns=c1,c2,c3

jdbcUrl=jdbc:phoenix:localhost
table=SAMPLE1
ddl=CREATE TABLE IF NOT EXISTS SAMPLE1(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))

bootstrap.servers=localhost:9092
topics=topic1,topic2
poll.timeout.ms=100
``` 
       
#### Phoenix Consumer for JsonEventSerializer Example:

Create a `kafka-consumer-json.properties` file with below properties

```
serializer=json
serializer.rowkeyType=uuid
serializer.columns=c1,c2,c3

jdbcUrl=jdbc:phoenix:localhost
table=SAMPLE2
ddl=CREATE TABLE IF NOT EXISTS SAMPLE2(uid VARCHAR NOT NULL,c1 VARCHAR,c2 VARCHAR,c3 VARCHAR CONSTRAINT pk PRIMARY KEY(uid))

bootstrap.servers=localhost:9092
topics=topic1,topic2
poll.timeout.ms=100
```

#### Phoenix Consumer Execution Procedure:

Start the Kakfa Producer then send some messages

```
> bin/kafka-console-producer.sh --broker-list localhost:9092 --topic topic1
```

Learn more about Apache Kafka [here](https://kafka.apache.org/documentation.html)


Start the **PhoenixConsumer** using below command

```
HADOOP_CLASSPATH=$(hbase classpath):/path/to/hbase/conf hadoop jar phoenix-kafka-<version>-minimal.jar org.apache.phoenix.kafka.consumer.PhoenixConsumerTool --file /data/kafka-consumer.properties
```

The input file must be present on HDFS (not the local filesystem where the command is being run).


#### Configuration:
  
Property Name             |Default| Description
--------------------------|-------|---
bootstrap.servers                      |       |List of Kafka servers used to bootstrap connections to Kafka. This list should be in the form host1:port1,host2:port2,...
topics                      |       |List of topics to use as input for this connector. This list should be in the form topic1,topic2,...
poll.timeout.ms                      |100       |Default poll timeout in millisec
batchSize                 |100    |Default number of events per transaction 
zookeeperQuorum           |       |Zookeeper quorum of the HBase cluster
table                     |       |The name of the table in HBase to write to.
ddl                       |       |The CREATE TABLE query for the HBase table where the events will be                                                    upserted to. If specified, the query will be executed. Recommended to include the IF NOT EXISTS clause in the ddl.
serializer                |  |Event serializers for processing the Kafka Message.This Plugin supports all Phoenix Flume Event Serializers. Like regex, json
serializer.regex          |(.*)   |The regular expression for parsing the message. 
serializer.columns        |       |The columns that will be extracted from the Flume event for inserting         into HBase. 
serializer.headers        |       |Headers of the Flume Events that go as part of the UPSERT query. The  data type for these columns are VARCHAR by default.
serializer.rowkeyType     |     |A custom row key generator . Can be one of timestamp,date,uuid,random and     nanotimestamp. This should be configured in cases  where we need a custom row key value to be auto generated and set for the primary key column.


**Note:** This Plugin supports all Phoenix Flume Event Serializers.

**RegexEventSerializer** which primarily breaks the Kafka Message based on the regex specified in the configuration file.

**JsonEventSerializer** which primarily breaks the Kafka Message based on the schema specified in the configuration file.
