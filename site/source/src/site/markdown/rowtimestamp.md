# Row timestamp

Phoenix v 4.6 now provides a way of mapping HBase’s native row timestamp to a Phoenix column. This helps take advantage of various optimizations that HBase provides for time ranges on the store files as well as various query optimization capabilities built within Phoenix.

For a column to be designated as ROW_TIMESTAMP, certain constraints need to be followed:
<ul>
<li> Only a primary key column of type TIME, DATE, TIMESTAMP, BIGINT, UNSIGNED_LONG can be designated as ROW_TIMESTAMP. </li>
<li> Only one primary key column can be designated as ROW_TIMESTAMP. </li>
<li> The value of the column cannot be null (since it is directly mapped to HBase row timestamp). This also means a column can be declared as ROW_TIMESTAMP only when creating the table. </li>
<li> Value of a ROW_TIMESTAMP column cannot be negative. This means for a DATE/TIME/TIMESTAMP, the corresponding epoch time in milliseconds cannot be less than zero. </li>
</ul>


When upserting rows for a table with row timestamp column, using UPSERT VALUES or UPSERT SELECT, one could explicitly provide the value for the row timestamp column or let Phoenix automatically set it. When not specified, Phoenix sets the value of the row timestamp column to be the server side time. The value of the column also ends up being the timestamp of the corresponding row in HBase.


<b>Sample schema:</b>

CREATE TABLE DESTINATION_METRICS_TABLE  
(CREATED_DATE DATE NOT NULL,   
METRIC_ID CHAR(15) NOT NULL,  
METRIC_VALUE LONG  
CONSTRAINT PK PRIMARY KEY(CREATED_DATE <b>ROW_TIMESTAMP</b>, METRIC_ID))  
SALT_BUCKETS = 8;  

UPSERT INTO DESTINATION_METRICS_TABLE VALUES (?, ?, ?) - this sets the value of CREATED_DATE to the value specified in corresponding bind param.

UPSERT INTO DESTINATION_METRICS_TABLE (METRIC_ID, METRIC_VALUE) VALUES (?, ?) - this sets the value of CREATED_DATE to the server side time.

UPSERT INTO DESTINATION_METRICS_TABLE (CREATED_DATE, METRICS_ID, METRIC_VALUE) SELECT DATE, METRICS_ID, METRIC_VALUE FROM SOURCE_METRICS_TABLE - this sets the value of the CREATED_DATE to the DATE selected from the SOURCE_METRICS_TABLE

UPSERT INTO DESTINATION_METRICS_TABLE (METRICS_ID, METRIC_VALUE) SELECT METRICS_ID, METRIC_VALUE FROM SOURCE_METRICS_TABLE - this sets the value of the created_date in destination table to the server timestamp.


When querying by filtering on the row timestamp column, apart from doing the regular optimizations that Phoenix does for row key columns, Phoenix is also able to appropriately set the min and max time ranges on the scans. With the help of this time range information, HBase on the server side is able to entirely skip those store files which do not have fall in the time range. This greatly improves performance especially when querying the tail-end of the data.