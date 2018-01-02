# Bulk Data Loading

Phoenix provides two methods for bulk loading data into Phoenix tables:

* Single-threaded client loading tool for CSV formatted data via the [psql](download.html#Loading-Data) command
* MapReduce-based bulk load tool for CSV and JSON formatted data

The psql tool is typically appropriate for tens of megabytes, while the MapReduce-based loader is typically better for larger load volumes.

Use of both loaders is described below.

## Sample data

For the following examples, we will assume that we have a CSV file named "data.csv" with the following content:

    12345,John,Doe
    67890,Mary,Poppins

We will use a table with the following structure:

     CREATE TABLE example (
        my_pk bigint not null,
        m.first_name varchar(50),
        m.last_name varchar(50) 
        CONSTRAINT pk PRIMARY KEY (my_pk))

## Loading via PSQL

The psql command is invoked via `psql.py` in the Phoenix bin directory. In order to use it to load CSV data, it is invoked by providing the connection information for your HBase cluster, the name of the table to load data into, and the path to the CSV file or files. Note that all CSV files to be loaded must have the '.csv' file extension (this is because arbitrary SQL scripts with the '.sql' file extension can also be supplied on the PSQL command line).

To load the example data outlined above into HBase running on the local machine, run the following command:

    bin/psql.py -t EXAMPLE localhost data.csv

The following parameters can be used for loading data with PSQL:

| *Parameter* | *Description* |
|-------------|---------------|
| -t          | Provide the name of the table in which to load data. By default, the name of the table is taken from the name of the CSV file. This parameter is case-sensitive |
| -h          | Overrides the column names to which the CSV data maps and is case sensitive. A special value of in-line indicating that the first line of the CSV file determines the column to which the data maps. |
| -s          | Run in strict mode, throwing an error on CSV parsing errors |
| -d          | Supply a custom delimiter or delimiters for CSV parsing |
| -q          | Supply a custom phrase delimiter, defaults to double quote character |
| -e          | Supply a custom escape character, default is a backslash |
| -a          | Supply an array delimiter (explained in more detail below) |

## Loading via MapReduce

For higher-throughput loading distributed over the cluster, the MapReduce loader can be used. This loader first converts all data into HFiles, and then provides the created HFiles to HBase after the HFile creation is complete. 

The CSV MapReduce loader is launched using the `hadoop` command with the Phoenix client jar, as follows:

    hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.CsvBulkLoadTool --table EXAMPLE --input /data/example.csv

When using Phoenix 4.0 and above, there is a known HBase issue( "Notice to Mapreduce users of HBase 0.96.1 and above" https://hbase.apache.org/book.html ), you should use following command:

    HADOOP_CLASSPATH=$(hbase mapredcp):/path/to/hbase/conf hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.CsvBulkLoadTool --table EXAMPLE --input /data/example.csv

OR

    HADOOP_CLASSPATH=/path/to/hbase-protocol.jar:/path/to/hbase/conf hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.CsvBulkLoadTool --table EXAMPLE --input /data/example.csv

The JSON MapReduce loader is launched using the `hadoop` command with the Phoenix client jar, as follows:

    hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.JsonBulkLoadTool --table EXAMPLE --input /data/example.json

The input file must be present on HDFS (not the local filesystem where the command is being run). 

The following parameters can be used with the MapReduce loader.

| *Parameter*                | *Description*                                 |
|----------------------------|-----------------------------------------------|
|-i,--input                  |Input CSV path (mandatory)                     |
|-t,--table                  |Phoenix table name (mandatory)                 |
|-a,--array-delimiter        |Array element delimiter (optional)             |
|-c,--import-columns         |Comma-separated list of columns to be imported |
|-d,--delimiter              |Input delimiter, defaults to comma             |
|-g,--ignore-errors          |Ignore input errors                            |
|-o,--output                 |Output path for temporary HFiles (optional)    |
|-s,--schema                 |Phoenix schema name (optional)                 |
|-z,--zookeeper              |Zookeeper quorum to connect to (optional)      |
|-it,--index-table           |Index table name to load (optional)


### Notes on the MapReduce importer
The current MR-based bulk loader will run one MR job to load your data table and one MR per index table to populate your indexes. Use the -it option to only load one of your index tables.

#### Permissions issues when uploading HFiles

There can be issues due to file permissions on the created HFiles in the final stage of a bulk load, when the created HFiles are handed over to HBase. HBase needs to be able to move the created HFiles, which means that it needs to have write access to the directories where the files have been written. If this is not the case, the uploading of HFiles will hang for a very long time before finally failing.

There are two main workarounds for this issue: running the bulk load process as the `hbase` user, or creating the output files with as readable for all users.

The first option can be done by simply starting the hadoop command with `sudo -u hbase`, i.e. 

    sudo -u hbase hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.CsvBulkLoadTool --table EXAMPLE --input /data/example.csv

Creating the output files as readable by all can be done by setting the `fs.permissions.umask-mode` configuration setting to "000". This can be set in the hadoop configuration on the machine being used to submit the job, or can be set for the job only during submission on the command line as follows:

    hadoop jar phoenix-<version>-client.jar org.apache.phoenix.mapreduce.CsvBulkLoadTool -Dfs.permissions.umask-mode=000 --table EXAMPLE --input /data/example.csv

#### Loading array data

Both the PSQL loader and MapReduce loader support loading array values with the `-a` flag. Arrays in a CSV file are represented by a field that uses a different delimiter than the main CSV delimiter. For example, the following file would represent an id field and an array of integers:

    1,2:3:4
    2,3:4,5

To load this file, the default delimiter (comma) would be used, and the array delimiter (colon) would be supplied with the parameter `-a ':'`.

#### A note on separator characters

The default separator character for both loaders is a comma (,). A common separator for input files is the tab character, 
which can be tricky to supply on the command line. A common mistake is trying to supply a tab as the separator by typing the following

    -d '\t'

This will not work, as the shell will supply this value as two characters (a backslash and a 't') to Phoenix.

Two ways in which you can supply a special character such as a tab on the command line are as follows:

1. By preceding the string representation of a tab with a dollar sign:

    -d $'\\t'

2. By entering the separator as Ctrl+v, and then pressing the tab key:
    
    -d '^v&lt;tab&gt;'
