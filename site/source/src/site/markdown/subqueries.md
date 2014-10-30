#Subqueries

Phoenix now supports subqueries in the _WHERE_ clause and the _FROM_ clause. Subqueries can be specified in many places, like _IN/NOT IN_, _EXISTS/NOT EXISTS_, unmodified comparison operators or _ANY/SOME/ALL_ comparison operators.

##Subqueries with IN or NOT IN

The following query finds the names of the items that have sales record after Sept 2nd 2013. The inner query returns a list of items that satisfy the search criteria and the outer query will make use of this list to find matching entries.

    SELECT ItemName
    FROM Items 
    WHERE ItemID IN 
        (SELECT ItemID
         FROM Orders
         WHERE Date >= to_date('2013/09/02'));

##Subqueries with EXISTS or NOT EXISTS

EXISTS simply tests the existence of the returned rows by the inner query. If the inner query returns one or more rows, EXISTS returns a value of _TRUE_; otherwise a value of _FALSE_. Many EXISTS queries are used to achieve the same goal as with IN queries or with ANY/SOME/ALL comparison queries. The below query returns the same results as the query in the previous example does:

    SELECT ItemName
    FROM Items i
    WHERE EXISTS 
        (SELECT *
         FROM Orders
         WHERE Date >= to_date('2013/09/02')
         AND ItemID = i.ItemID);

##Semi-joins and Anti-joins

Queries with IN/NOT IN or EXISTS/NOT EXISTS are implemented with semi-joins and anti-joins wherever possible. A semi-join is different from a conventional join in that rows in the first table will be returned at most once, regardless of how many matches the second table contains for a certain row in the first table. A semi-join returns all those rows from the first table which can find at least one match in the second table. An IN or EXISTS construct is often translated into semi-joins.

An anti-join is the opposite of a semi-join. The results of an anti-join are all those rows from the first table that can find no match in the second table. A NOT IN or NOT EXISTS construct is often translated into anti-joins.

###Semi-join Optimization

The "[Foreign Key to Primary Key Join Optimization](joins.html#foreign-key-to-primary-key-join-optimization)" mentioned in Phoenix [Joins](joins.html) is equally applied to semi-joins. So if a skip-scan is driven for a semi-join qualified for this optimization and the IN or EXISTS semantics can be fully substituted by the skip-scan alone, the server-side join operation will not happen at all.

##Subqueries with Comparison Operators

Subqueries can be specified as the right-hand-side operand of the comparison operators (=, < >, >, > =, <, ! >, ! <, or < =).

The below example is to find the participants whose contest scores are greater than the overall average score.

    SELECT ID, Name
    FROM Contest
    WHERE Score >
        (SELECT avg(Score)
         FROM Contest)
    ORDER BY Score DESC;

A subquery introduced with an unmodified comparison operator (a comparison operator not followed by ANY or ALL) must only return a single row; otherwise it would result in getting a SQL error message.

##Subqueries with ANY/SOME/ALL Comparison Operators

Subqueries can be introduced with a comparison operator modified by the keywords ANY, SOME or ALL, which has exactly the same semantics with static arrays, only that the array elements have to be dynamically computed through the execution of the inner query.

The following query provides an example which lists the orders with a quantity greater than or equal to the maximum order quantity of any item.

    SELECT OrderID
    FROM Orders
    WHERE quantity >= ANY
        (SELECT max(quantity)
         FROM Orders
         GROUP BY ItemID);

##Correlated Subqueries

Correlated subqueries (also known as synchronized subqueries) are subqueries that contain references to the outer queries. Unlike independent subqueries, which only need to be evaluated once, the correlated inner query result depends on the outer query values and may differ from row to row.

The following example finds the patents filed earlier than or equal to all patents filed within the same region:

    SELECT PatentID, Title
    FROM Patents p
    WHERE FileDate <= ALL
        (SELECT FileDate
         FROM Patents
         WHERE Region = p.Region);

Phoenix optimizes such queries by rewriting them into equivalent join queries so that the inner query only has be to executed once instead of for each row in the outer query. The above correlated subquery will be rewritten in Phoenix as:

    SELECT PatentID, Title
    FROM Patents p
    JOIN
        (SELECT Region col1, collect_distinct(FileDate) col2
         FROM Patent
         GROUP BY Region) t1
    ON Region = t1.col1
    WHERE FileDate <= ALL(t1.col2);

Here, _collect\_distinct()_ is a reserved internal funtion in Phoenix, which essentially collects all different values of a certain column or expression into a Phoenix Array.

##AND/OR Branches and Multiple levels of Nesting
Correlated subqueries or independent subqueries can be specified anywhere in the WHERE clause, whether in AND branches or in OR branches. And a query can have more than one level of subquery nesting, which means a subquery can include yet another (or more) subquery in itself.

Below is an example of a complicated query that has multiple levels of subqueries connected with AND and OR branches, which is to find the items not involved in the orders sold to customers in Belgium with a quantity lower than 1000 or to customers in Germany with a quantity lower than 2000:

    SELECT ItemID, ItemName
    FROM Items i
    WHERE NOT EXISTS
        (SELECT *
         FROM Orders
         WHERE CustomerID IN
             (SELECT CustomerID
              FROM Customers
              WHERE Country = ‘Belgium’)
         AND Quantity < 1000
         AND ItemID = i.ItemID)
    OR ItemID != ALL
        (SELECT ItemID
         FROM Orders
         WHERE CustomerID IN
             (SELECT CustomerID
              FROM Customers
              WHERE Country = ‘Germany’)
         AND Quantity < 2000);

##Row subqueries

A subquery can return multiple fields in one row, which is considered returning a row constructor. The row constructor on both sides of the operator (IN/NOT IN, EXISTS/NOT EXISTS or comparison operator) must contain the same number of values, like in the below example:

    SELECT column1, column2
    FROM t1
    WHERE (column1, column2) IN
        (SELECT column3, column4
         FROM t2
         WHERE column5 = ‘nowhere’);

This query returns all pairs of (column1, column2) that can match any pair of (column3, column4) in the second table after being filtered by condition: column5 = ‘nowhere’.

##Derived Tables

Subqueries specified in the FROM clause are also called derived tables. For example, suppose you want to list a set of maximum values of a grouped table by their frequency of occurrence, and the below query will return the desired result:

    SELECT m, count(*) 
    FROM 
        (SELECT max(x) m 
         FROM a1 
         GROUP BY name) AS t 
    GROUP BY m
    ORDER BY count(*) DESC;

Derived tables can also be specified anywhere in a join query as join-tables. Please refer to the "[Grouped Joins and Derived Tables](joins.html#grouped-joins-and-derived-tables)" section of Phoenix [Joins](joins.html) for more information and examples.

##Limitations

In our Phoenix 3.2 and 4.2 releases, the subquery support has the following restrictions:

1. [PHOENIX-1388](https://issues.apache.org/jira/browse/PHOENIX-1388) Support correlated subqueries in the HAVING clause.
2. [PHOENIX-1392](https://issues.apache.org/jira/browse/PHOENIX-1392) Using subqueries as expressions.

