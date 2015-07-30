# Dynamic Columns

Sometimes defining a static schema up front is not feasible. Instead, a subset of columns may be specified at table [create](language/index.html#create_table) time while the rest would be specified at [query](language/index.html#select) time. As of Phoenix 1.2, specifying columns dynamically is now supported by allowing column definitions to included in parenthesis after the table in the <code>FROM</code> clause on a <code>SELECT</code> statement. Although this is not standard SQL, it is useful to surface this type of functionality to leverage the late binding ability of HBase.

For example:

    SELECT eventTime, lastGCTime, usedMemory, maxMemory
    FROM EventLog(lastGCTime TIME, usedMemory BIGINT, maxMemory BIGINT)
    WHERE eventType = 'OOM' AND lastGCTime < eventTime - 1

Where you may have defined only a subset of your event columns at create time, since each event type may have different properties:

    CREATE TABLE EventLog (
        eventId BIGINT NOT NULL,
        eventTime TIME NOT NULL,
        eventType CHAR(3) 
        CONSTRAINT pk PRIMARY KEY (eventId, eventTime))

To upsert a row with dynamic columns:

   UPSERT INTO EventLog (eventId, eventTime, eventType, lastGCTime TIME, usedMemory BIGINT, maxMemory BIGINT)
      VALUES(1, CURRENT_TIME(), 'abc', CURRENT_TIME(), 512, 1024);
