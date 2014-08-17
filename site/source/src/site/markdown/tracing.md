# Tracing

As of Phoenix 4.1.0 we have added the ability to collect per-request traces. This allows you to see each important step in a query or insertion, all they way from the client through into the HBase side, and back again.

We leverage Cloudera's [HTrace](https://github.com/cloudera/htrace) library to seamlessly integrate with HBase's tracing utilities. We then take it a step further by then depositing these metrics into a Hadoop metrics2 sink that writes them into a phoenix table.

**Writing traces to a phoenix table is not supported on Hadoop1**

## Usage

There are only a couple small things you need to do to enable tracing a given request with Phoenix.

### Client Property

The frequency of tracing is determined by the client JDBC property:

```
phoenix.trace.frequency
```

There are three possible tracing frequencies you can use:

1. never 
    * This is the default
2. always 
    * Every request will be traced
3. probability
    * take traces with a probabilistic frequency
    * probability threshold set by: "phoenix.trace.probability.threshold"

By turning one of these properties on, you turn on merely collecting the traces. However, the traces need to be deposited somewhere

Example:

```
# Enable tracing on every request
Properties props = new Properties();
props.setProperty("phoenix.trace.frequency", "always");

# Or more simply
org.apache.phoenix.trace.Tracing.setSampling(props, Tracing.Frequency.ALWAYS);

# Enable tracing on 50% of requests
org.apache.phoenix.trace.Tracing.setSampling(props, Tracing.Frequency.ALWAYS);
props.setProperty("phoenix.trace.probability.threshold", .5)
```

### Enabling Tracing/Metrics2 Sink

This is where the traces are taken from the tracing framework and then deposited into a Phoenix table. Because the traces are transported through the Hadoop metrics2 framework, you need to add the following configs to your hadoop-metrics2.properties (or hadoop-metrics2-phoenix.properties) file on the classpath of both the * phoenix client* and *HBase regionservers*, and then restart all necessary processes to get them to pick up the configs.

```
# Hadoop2 metrics sink
phoenix.sink.*.class=org.apache.phoenix.trace.PhoenixMetricsWriter
# Writer that generically writes to phoenix tables
phoenix.sink.writer-class=org.apache.phoenix.trace.PhoenixTableMetricsWriter
```

## Reading Traces

Once the traces are deposited into the tracing table, by default <code>PHOENIX.TRACING_STATS</code>, but it is configurable in the HBase configuration via:

```
  <property>
    <name>phoenix._internal.trace.tablename</name>
    <value><your custom tracing table name></value>
  </property>
```

The tracing table is initialized via the ddl:

<pre>
    CREATE TABLE <b>PHOENIX.TRACING_STATS</b> (
      <b>trace_id</b> BIGINT NOT NULL,
      <b>parent_id</b> BIGINT NOT NULL,
      <b>span_id</b> BIGINT NOT NULL,
      <b>description</b> VARCHAR,
      <b>start_time</b> BIGINT,
      <b>end_time</b> BIGINT,
      <b>hostname</b> VARCHAR,
      <b>tags.count</b> SMALLINT,
      <b>annotations.count</b> SMALLINT,
      CONSTRAINT pk PRIMARY KEY (<b>trace_id, parent_id, span_id</b>)
</pre>

The tracing table also contains a number of dynamic columns for each trace, identified by a unique trace-id (id of the request), parent-id (id of the parent span) and individual span-id (id of the individual segment), may have multiple tags and annotations about what happened during the trace. Once you have the number of tags and annotations, you can retrieve them the table with a request like:

```
SELECT <columns>
  FROM PHOENIX.TRACING_STATS
  WHERE trace_id = ?
  AND parent_id = ?
  ANd span_id = ?
```
where columns is either "annotations.aX" or "tags.tX" where 'X' is the index of the dynamic column to lookup.

For more usage, look at our generic [TraceReader](https://github.com/apache/phoenix/blob/master/phoenix-core/src/main/java/org/apache/phoenix/trace/TraceReader.java) which can programatically read a number of traces from the tracing results table.
