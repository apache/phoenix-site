## Phoenix Map Reduce ##

Phoenix provides support for retrieving and writing to Phoenix tables from within MapReduce jobs. The framework now provides custom [InputFormat](http://hadoop.apache.org/docs/current/api/org/apache/hadoop/mapreduce/InputFormat.html) and [OutputFormat](http://hadoop.apache.org/docs/current/api/org/apache/hadoop/mapreduce/OutputFormat.html) classes [PhoenixInputFormat](https://github.com/apache/phoenix/blob/f84e5da33c21a728e73924c07506dd63e4621872/phoenix-core/src/main/java/org/apache/phoenix/mapreduce/PhoenixInputFormat.java) , [PhoenixOutputFormat](https://github.com/apache/phoenix/blob/f84e5da33c21a728e73924c07506dd63e4621872/phoenix-core/src/main/java/org/apache/phoenix/mapreduce/PhoenixOutputFormat.java). 

 
[PhoenixMapReduceUtil](https://github.com/apache/phoenix/blob/f84e5da33c21a728e73924c07506dd63e4621872/phoenix-core/src/main/java/org/apache/phoenix/mapreduce/util/PhoenixMapReduceUtil.java "PhoenixMapReduceUtil") provides several utility methods to set the input and output configuration parameters to the job.


When a Phoenix table is the source for the Map Reduce job, we can provide a SELECT query or pass a table name and specific columns to import data . To retrieve data from the table within the mapper class, we need to have a class that implements [DBWritable](http://hadoop.apache.org/docs/current/api/org/apache/hadoop/mapred/lib/db/DBWritable.html "DBWritable") and pass it as an argument to PhoenixMapReduceUtil.**setInput** method. The custom DBWritable class provides implementation for [readFields(ResultSet rs)](http://hadoop.apache.org/docs/current/api/org/apache/hadoop/mapreduce/lib/db/DBWritable.html#readFields%28java.sql.ResultSet%29 "readFields") that allows us to retrieve columns for each row. This custom DBWritable class will form the input value to the mapper class. 
>Note: The SELECT query must not perform any aggregation or use DISTINCT as these are not supported by our map-reduce integration.

Similarly, when writing to a Phoenix table, we use the PhoenixMapReduceUtil.**setOutput** method to set the output table and the columns. 
>Note: Phoenix internally builds the UPSERT query for you . 

The output key and value class for the job should always be NullWritable and the custom DBWritable class that implements the [write](http://hadoop.apache.org/docs/current/api/org/apache/hadoop/mapreduce/lib/db/DBWritable.html#write%28java.sql.PreparedStatement%29 "write") method . 


Let's dive into an example where we have a table, **STOCK** , that holds the master data of quarterly recordings in a double array for each year and we would like to find out the max price of each stock across all years.  Let's store the output to a **STOCK_STATS** table which is another Phoenix table. 
> Note , you can definitely have a job configured to read from hdfs and load into a phoenix table. 



a) *stock* 

     CREATE TABLE IF NOT EXISTS STOCK (STOCK_NAME VARCHAR NOT NULL ,RECORDING_YEAR INTEGER NOT  NULL, RECORDINGS_QUARTER DOUBLE array[] CONSTRAINT pk PRIMARY KEY (STOCK_NAME , RECORDING_YEAR));

b) *stock_stats* 
	
	CREATE TABLE IF NOT EXISTS STOCK_STATS (STOCK_NAME VARCHAR NOT NULL , MAX_RECORDING DOUBLE CONSTRAINT pk PRIMARY KEY (STOCK_NAME));

*Sample Data*

        UPSERT into STOCK values ('AAPL',2009,ARRAY[85.88,91.04,88.5,90.3]);
        UPSERT into STOCK values ('AAPL',2008,ARRAY[199.27,200.26,192.55,194.84]);
        UPSERT into STOCK values ('AAPL',2007,ARRAY[86.29,86.58,81.90,83.80]);
        UPSERT into STOCK values ('CSCO',2009,ARRAY[16.41,17.00,16.25,16.96]);
        UPSERT into STOCK values ('CSCO',2008,ARRAY[27.00,27.30,26.21,26.54]);
        UPSERT into STOCK values ('CSCO',2007,ARRAY[27.46,27.98,27.33,27.73]);
        UPSERT into STOCK values ('CSCO',2006,ARRAY[17.21,17.49,17.18,17.45]);
        UPSERT into STOCK values ('GOOG',2009,ARRAY[308.60,321.82,305.50,321.32]);
        UPSERT into STOCK values ('GOOG',2008,ARRAY[692.87,697.37,677.73,685.19]);
        UPSERT into STOCK values ('GOOG',2007,ARRAY[466.00,476.66,461.11,467.59]);
        UPSERT into STOCK values ('GOOG',2006,ARRAY[422.52,435.67,418.22,435.23]);
        UPSERT into STOCK values ('MSFT',2009,ARRAY[19.53,20.40,19.37,20.33]);
        UPSERT into STOCK values ('MSFT',2008,ARRAY[35.79,35.96,35.00,35.22]);
        UPSERT into STOCK values ('MSFT',2007,ARRAY[29.91,30.25,29.40,29.86]);
        UPSERT into STOCK values ('MSFT',2006,ARRAY[26.25,27.00,26.10,26.84]);
        UPSERT into STOCK values ('YHOO',2009,ARRAY[12.17,12.85,12.12,12.85]);
        UPSERT into STOCK values ('YHOO',2008,ARRAY[23.80,24.15,23.60,23.72]);
        UPSERT into STOCK values ('YHOO',2007,ARRAY[25.85,26.26,25.26,25.61]);
        UPSERT into STOCK values ('YHOO',2006,ARRAY[39.69,41.22,38.79,40.91]);


### Below is a simple job configuration  ###
	 
***Job Configuration***
 
	final Configuration configuration = HBaseConfiguration.create();
	final Job job = Job.getInstance(configuration, "phoenix-mr-job");
	
    // We can either specify a selectQuery or ignore it when we would like to retrieve all the columns
    final String selectQuery = "SELECT STOCK_NAME,RECORDING_YEAR,RECORDINGS_QUARTER FROM STOCK ";
	
    // StockWritable is the DBWritable class that enables us to process the Result of the above query
	PhoenixMapReduceUtil.setInput(job, StockWritable.class, "STOCK",  selectQuery);  
	
    // Set the target Phoenix table and the columns
	PhoenixMapReduceUtil.setOutput(job, "STOCK_STATS", "STOCK_NAME,MAX_RECORDING");
	
    job.setMapperClass(StockMapper.class);
	job.setReducerClass(StockReducer.class); 
	job.setOutputFormatClass(PhoenixOutputFormat.class);
	
	job.setMapOutputKeyClass(Text.class);
	job.setMapOutputValueClass(DoubleWritable.class);
	job.setOutputKeyClass(NullWritable.class);
	job.setOutputValueClass(StockWritable.class); 
	TableMapReduceUtil.addDependencyJars(job);
	job.waitForCompletion(true);
 

 ***StockWritable***
 
    
	
	public class StockWritable implements DBWritable,Writable {
 
		private String stockName;
	
		private int year;
	
		private double[] recordings;
	
    	private double maxPrice;	
	
		@Override
		public void readFields(DataInput input) throws IOException {

		}
	 
		@Override
		public void write(DataOutput output) throws IOException {
	 
		}
	 
		@Override
		public void readFields(ResultSet rs) throws SQLException {
			stockName = rs.getString("STOCK_NAME");
			year = rs.getInt("RECORDING_YEAR");
			final Array recordingsArray = rs.getArray("RECORDINGS_QUARTER");
			recordings = (double[])recordingsArray.getArray();
		}
	 
		@Override
		public void write(PreparedStatement pstmt) throws SQLException {
		   pstmt.setString(1, stockName);
		   pstmt.setDouble(2, maxPrice); 
		}
		
	    // getters / setters for the fields
	     ...
	     ...
	
	

***Stock Mapper***

	 
	 public static class StockMapper extends Mapper<NullWritable, StockWritable, Text , DoubleWritable> {
		
		private Text stock = new Text(); 
		private DoubleWritable price = new DoubleWritable ();
		
		@Override
		protected void map(NullWritable key, StockWritable stockWritable, Context context) throws IOException, InterruptedException {
			double[] recordings = stockWritable.getRecordings();
			final String stockName = stockWritable.getStockName();
			double maxPrice = Double.MIN_VALUE;
			for(double recording : recordings) {
				if(maxPrice < recording) {
					maxPrice = recording;
			  	}
			}
			stock.set(stockName);
			price.set(maxPrice);
			context.write(stock,price);
		}
	 
	}


	
***Stock Reducer***

	
	 public static class StockReducer extends Reducer<Text, DoubleWritable, NullWritable , StockWritable> {
		 
		@Override
		protected void reduce(Text key, Iterable<DoubleWritable> recordings, Context context) throws IOException, InterruptedException {
			double maxPrice = Double.MIN_VALUE;
			for(DoubleWritable recording : recordings) {
				if(maxPrice < recording.get()) {
					maxPrice = recording.get(); 
				}
			} 
		    final StockWritable stock = new StockWritable();
            stock.setStockName(key.toString());
			stock.setMaxPrice(maxPrice);
            context.write(NullWritable.get(),stock);
		}
	 
	}


***Packaging & Running***

   

1. Ensure phoenix-[version]-client.jar is in the classpath of your Map Reduce job jar.
2. To run the job, use the **hadoop jar** command with the necessary arguments.


 
