# Paged Queries

Phoenix supports , standard SQL constructs to enable paged queries 

* Row Value Constructors (RVC)
* OFFSET with limit

**Row Value Constructors (RVC)**

A row value constructor is an ordered sequence of values delimited by parentheses. For example:

    (4, 'foo', 3.5)
    ('Doe', 'Jane')
    (my_col1, my_col2, 'bar')

Just like with regular values, row value constructors may be used in comparison expression like this:

    WHERE (x,y,z) >= ('foo','bar')
    WHERE (last_name,first_name) = ('Jane','Doe')

Row value constructors are compared by conceptually concatenating the values together and comparing them against each other, with the leftmost part being most significant. Section 8.2 (comparison predicates) of the SQL-92 standard explains this in detail, but here are a few examples of predicates that would evaluate to true:

    (9, 5, 3) > (8, 8)
    ('foo', 'bar') < 'g'
    (1,2) = (1,2)
Row value constructors may also be used in an IN list expression to efficiently query for a set of rows given the composite primary key columns. For example, the following would be optimized to be a point get of three rows:

    WHERE (x,y) IN ((1,2),(3,4),(5,6))
Another primary use case for row value constructors is to support query-more type functionality by enabling an ordered set of rows to be incrementally stepped through. For example, the following query would step through a set of rows, 20 rows at a time:

    SELECT title, author, isbn, description 
    FROM library 
    WHERE published_date > 2010
    AND (title, author, isbn) > (?, ?, ?)
    ORDER BY title, author, isbn
    LIMIT 20

Assuming that the client binds the three bind variables to the values of the last row processed, the next invocation would find the next 20 rows that match the query. If the columns you supply in your row value constructor match in order the columns from your primary key (or from a secondary index), then Phoenix will be able to turn the row value constructor expression into the start row of your scan. This enables a very efficient mechanism to locate _at or after_ a row.

**OFFSET with LIMIT**

Use OFFSET to specify the starting row offset into the result set returned by your query and LIMIT to specify the page size.

For example, If page size is 10, then to select second page, following queries can be used(rows will be returned from 11 to 20):

    SELECT title, author, isbn, description
    FROM library
    WHERE published_date > 2010
    ORDER BY title, author, isbn
    LIMIT 10 OFFSET 10

Offset reads and skips the rows on the server or client depending upon the type of the query whereas RVC is effective for queries reading on primary axis as it can simply starts from the key provided.
