# Joins

The standard SQL join syntax (with some limitations) is now supported by Phoenix to combine records from two or more tables based on their fields having common values.

For example, we have the following tables to store our order records, our customer information and the item information we sell in those orders.

The "**Orders**" table:

OrderID         |CustomerID      |ItemID          |Quantity        |Date
----------------|----------------|----------------|----------------|----
1630781         |C004            |I001            |650             |09-01-2013
1630782         |C003            |I006            |2500            |09-02-2013
1630783         |C002            |I002            |340             |09-03-2013
1630784         |C004            |I006            |1260            |09-04-2013
1630785         |C005            |I003            |1500            |09-05-2013

The "**Customers**" table:

CustomerID      |CustomerName        |Country
----------------|--------------------|------- 
C001            |Telefunken          |Germany
C002            |Logica              |Belgium
C003            |Salora Oy           |Finland
C004            |Alps Nordic AB      |Sweden
C005            |Deister Electronics |Germany
C006            |Thales Nederland    |Netherlands

The "**Items**" table:

ItemID          |ItemName            |Price
----------------|--------------------|-----
I001            |BX016               |15.96
I002            |MU947               |20.35
I003            |MU3508              |9.60
I004            |XC7732              |55.24
I005            |XT0019              |12.65
I006            |XT2217              |12.35

You may get a combined view of the "Orders" table and the "Customers" table by running the following join query:

    SELECT O.OrderID, C.CustomerName, C.Country, O.Date
    FROM Orders AS O
    INNER JOIN Customers AS C
    ON O.CustomerID = C.CustomerID;

This will produce results like:

O.OrderID       |C.CustomerName      |C.Country       |O.Date
----------------|--------------------|----------------|------
1630781         |Alps Nordic AB      |Sweden          |09-01-2013
1630782         |Salora Oy           |Finland         |09-02-2013
1630783         |Logica              |Belgium         |09-03-2013
1630784         |Alps Nordic AB      |Sweden          |09-04-2013
1630785         |Deister Electronics |Germany         |09-05-2013

## Joining Tables with Indices

Secondary indices will be automatically utilized when running join queries. For example, if we create indices on the "Orders" table and the "Items" table respectively, which are defined as follows:

    CREATE INDEX iOrders ON Orders (ItemID) INCLUDE (CustomerID, Quantity);
    CREATE INDEX i2Orders ON Orders (CustomerID) INCLUDE (ItemID, Quantity);
    CREATE INDEX iItems ON Items (ItemName) INCLUDE (Price);

<a name="joining-tables-with-indices-eg1"></a>We can find out each item's total sales value by joining the "Items" table and the "Orders" table and then grouping the joined result with "ItemName" (and also adding some filtering conditions):

    SELECT ItemName, sum(Price * Quantity) AS OrderValue
    FROM Items
    JOIN Orders
    ON Items.ItemID = Orders.ItemID
    WHERE Orders.CustomerID > 'C002'
    GROUP BY ItemName;

The results will be like:

ItemName        |OrderValue
----------------|----------
BX016           |10374
MU3508          |14400
XT2217          |46436

The execution plan for this query (by running "EXPLAIN _query_") will be:

    CLIENT PARALLEL 32-WAY FULL SCAN OVER iItems 
        SERVER AGGREGATE INTO ORDERED DISTINCT ROWS BY [iItems.0:ItemName] 
    CLIENT MERGE SORT 
        PARALLEL INNER-JOIN TABLE 0 
            CLIENT PARALLEL 32-WAY RANGE SCAN OVER i2Orders ['C002'] - [*]

In this case, the index table "iItems" is used in place of the data table "Items" since the index table "iItems" is indexed on column "ItemName" and will hence benefit the GROUP-BY clause in this query. Meanwhile, the index table "i2Orders" is favored over the data table "Orders" and another index table "iOrders" because a range scan instead of a full scan can be applied as a result of the WHERE clause.

## Grouped Joins and Derived Tables<a name="grouped-joins-and-derived-tables"></a>

Phoenix also supports complex join syntax such as grouped joins (or sub joins) and joins with derived-tables. You can group joins by using parenthesis to prioritize certain joins before other joins are executed. You can also replace any one (or more) of your join tables with a subquery (derived table), which could be yet another join query.

For grouped joins, you can write something like:

    SELECT O.OrderID, I.ItemName, S.SupplierName
    FROM Orders AS O
    LEFT JOIN
        (Items AS I
         INNER JOIN Suppliers AS S
         ON I.SupplierID = S.SupplierID)
    ON O.ItemID = I.ItemID;

By replacing the sub join with a subquery (derived table), we get an equivalent query as:

    SELECT O.OrderID, J.ItemName, J.SupplierName
    FROM Orders AS O
    LEFT JOIN
        (SELECT ItemID, ItemName, SupplierName
         FROM Items AS I
         INNER JOIN Suppliers AS S
         ON I.SupplierID = S.SupplierID) AS J
    ON O.ItemID = J.ItemID;

As an alternative to the [earlier example](#joining-tables-with-indices-eg1) where we try to find out each item's sales figures, instead of using group-by after joining the two tables, we can join the "Items" table with the grouped result from the "Orders" table:

    SELECT ItemName, O.OrderValue
    FROM Items
    JOIN
        (SELECT ItemID, sum(Price * Quantity) AS OrderValue
         FROM Orders
         WHERE CustomerID > 'C002'
         GROUP BY ItemID) AS O
    ON Items.ItemID = O.ItemID;

## Hash Join vs. Sort-Merge Join

Basic hash join usually outperforms other types of join algorithms, but it has its limitations too, the most significant of which is the assumption that one of the relations must be small enough to fit into memory. Thus Phoenix now has both hash join and sort-merge join implemented to facilitate fast join operations as well as join between two large tables.

Phoenix currently uses the hash join algorithm whenever possible since it is usually much faster. However we have the hint "USE_SORT_MERGE_JOIN" for forcing the usage of sort-merge join in a query. The choice between these two join algorithms, together with detecting the smaller relation for hash join, will be done automatically in future under the guidance provided by table statistics.

## Foreign Key to Primary Key Join Optimization<a name="foreign-key-to-primary-key-join-optimization"></a>

Oftentimes a join will occur from a child table to a parent table, mapping the foreign key of the child table to the primary key of the parent. So instead of doing a full scan on the parent table, Phoenix will drive a skip-scan or a range-scan based on the foreign key values it got from the child table result.

Phoenix will extract and sort multiple key parts from the join keys so that it can get the most accurate key hints/ranges possible for the parent table scan.

For example, we have parent table "Employee" and child table "Patent" defined as:

    CREATE TABLE Employee (
        Region VARCHAR NOT NULL,
        LocalID VARCHAR NOT NULL,
        Name VARCHAR NOT NULL,
        StartDate DATE NOT NULL,
        CONSTRAINT pk PRIMARY KEY (Region, LocalID));

    CREATE TABLE Patent (
        PatentID VARCHAR NOT NULL,
        Region VARCHAR NOT NULL,
        LocalID VARCHAR NOT NULL,
        Title VARCHAR NOT NULL,
        Category VARCHAR NOT NULL,
        FileDate DATE NOT NULL,
        CONSTRAINT pk PRIMARY KEY (PatentID));

Now we’d like to find out all those employees who filed patents after January 2000 and list their names according to their patent count:

    SELECT E.Name, E.Region, P.PCount
    FROM Employee AS E
    JOIN
        (SELECT Region, LocalID, count(*) AS PCount
         FROM Patent
         WHERE P.FileDate >= to_date('2000/01/01')
         GROUP BY Region, LocalID) AS P
    ON E.Region = P.Region AND E.LocalID = P.LocalID

The above statement will do a skip-scan over the "Employee" table and will use both join key "Region" and "LocalID" for runtime key hint calculation. Below is the execution time of this query with and without this optimization on an "Employee" table of about _5000000_ records and a "Patent" table of about _1000_ records: 

W/O Optimization    |W/ Optimization
--------------------|---------------
8.1s                |0.4s

However, there are times when the foreign key values from the child table account for a complete primary key space in the parent table, thus using skip-scans would only be slower not faster. Yet you can always turn off the optimization by specifying hint "NO_CHILD_PARENT_OPTIMIZATION". Furthermore, table statistics will soon come in to help making smarter choices between the two schemes.

## Configuration

As mentioned earlier, if we decide to use the hash join approach for our join queries, the prerequisite is that either of the relations can be small enough to fit into memory in order to be broadcast over all servers that have the data of concern from the other relation. And aside from making sure that the region server heap size is big enough to hold the smaller relation, we might also need to pay a attention to a few configuration parameters that are crucial to running hash joins.

The servers-side caches are used to hold the hash table built upon the smaller relation. The size and the living time of the caches are controlled by the following parameters. Note that a relation can be a physical table, a view, a subquery, or a joined result of other relations in a multiple-join query.

1. phoenix.query.maxServerCacheBytes
    * Maximum size (in bytes) of the raw results of a relation before being compressed and sent over to the region servers.
    * Attempting to serializing the raw results of a relation with a size bigger than this setting will result in a MaxServerCacheSizeExceededException.
    * **Default: 104,857,600**
2. phoenix.query.maxGlobalMemoryPercentage
    * Percentage of total heap memory (i.e. Runtime.getRuntime().maxMemory()) that all threads may use.
    * The summed size of all living caches must be smaller than this global memory pool size. Otherwise, you would get an InsufficientMemoryException.
    * **Default: 15**
3. phoenix.coprocessor.maxServerCacheTimeToLiveMs
    * Maximum living time (in milliseconds) of server caches. A cache entry expires after this amount of time has passed since last access.
    * Consider adjusting this parameter when a server-side IOException("_Could not find hash cache for joinId_") happens. Getting warnings like "_Earlier hash cache(s) might have expired on servers_" might also be a sign that this number should be increased.
    * **Default: 30,000**

See our [Configuration and Tuning Guide](tuning.html) for more details.

Although changing parameters can sometimes be a solution to getting rid of the exceptions mentioned above, it is highly recommended that you first consider optimizing the join queries according to the information provided in the following section.

## Optimizing Your Query

Now that we know if using hash join it is most crucial to make sure that there will be enough memory for the query execution, but other than rush to change the configuration immediately, sometimes all you need to do is to know a bit of the interiors and adjust the sequence of the tables that appear in your join query.

Below is a description of the default join order (without the presence of table statistics) and of which side of the query will be taken as the "smaller" relation and be put into server cache:

1. _lhs_ INNER JOIN _rhs_

    _rhs_ will be built as hash table in server cache.

2. _lhs_ LEFT OUTER JOIN _rhs_

    _rhs_ will be built as hash table in server cache.

3. _lhs_ RIGHT OUTER JOIN _rhs_

    _lhs_ will be built as hash table in server cache.

The join order is more complicated with multiple-join queries. You can try running "EXPLAIN _join\_query_" to look at the actual execution plan. For multiple-inner-join queries, Phoenix applies star-join optimization by default, which means the leading (left-hand-side) table will be scanned only once joining all right-hand-side tables at the same time. You can turn off this optimization by specifying the hint "NO_STAR_JOIN" in your query if the overall size of all right-hand-side tables would exceed the memory size limit.

Let's take the previous query for example:

    SELECT O.OrderID, C.CustomerName, I.ItemName, I.Price, O.Quantity
    FROM Orders AS O
    INNER JOIN Customers AS C
    ON O.CustomerID = C.CustomerID
    INNER JOIN Items AS I
    ON O.ItemID = I.ItemID;

The default join order (using star-join optimization) will be:

    1. SCAN Customers --> BUILD HASH[0]
       SCAN Items --> BUILD HASH[1]
    2. SCAN Orders JOIN HASH[0], HASH[1] --> Final Resultset

Alternatively, if we use hint "NO_STAR_JOIN":

    SELECT /*+ NO_STAR_JOIN*/ O.OrderID, C.CustomerName, I.ItemName, I.Price, O.Quantity
    FROM Orders AS O
    INNER JOIN Customers AS C
    ON O.CustomerID = C.CustomerID
    INNER JOIN Items AS I
    ON O.ItemID = I.ItemID;

The join order will be:

    1. SCAN Customers --> BUILD HASH[0]
    2. SCAN Orders JOIN HASH[0]; CLOSE HASH[0] --> BUILD HASH[1]
    3. SCAN Items JOIN HASH[1] --> Final Resultset

It is also worth mentioning that not the entire dataset of the table should be counted into the memory consumption. Instead, only those columns used by the query, and of only the records that satisfy the predicates will be built into the server hash table.

## Limitations

In our Phoenix 3.3.0 and 4.3.0 releases, joins have the following restrictions and improvements to be made:

1. [PHOENIX-1555](https://issues.apache.org/jira/browse/PHOENIX-1555): Fallback to many-to-many join if hash join fails due to insufficient memory.
2. [PHOENIX-1556](https://issues.apache.org/jira/browse/PHOENIX-1556): Base hash join versus many-to-many decision on how many guideposts will be traversed for RHS table(s).

Continuous efforts are being made to bring in more performance enhancement for join queries based on table statistics. Please refer to our [Roadmap](roadmap.html) for more information.

