# Roadmap

Our roadmap is driven by our user community. Below, in prioritized order, is the current plan for Phoenix:

1. **[Transaction Support](https://issues.apache.org/jira/browse/PHOENIX-400)**. Support transactions by integrating with an open source solution like [Tephra](https://github.com/continuuity/tephra), [Themis](https://github.com/XiaoMi/themis), or some other similar option.
1. **[Join Improvements](https://issues.apache.org/jira/browse/PHOENIX-1167)**. Enhance our join capabilities in a variety of ways:<br/>
    *  **[Many-to-many joins](https://issues.apache.org/jira/browse/PHOENIX-1179)**. Support joins where both sides are too large to fit into memory. 
    *  **[Inlined parent/child joins](https://issues.apache.org/jira/browse/PHOENIX-150)**. Optimize parent/child joins by storing child rows inside of a parent row, forming the column qualifier through a known prefix plus the child row primary key.
2. **[Subquery](subqueries.html) Enhancement**, which includes support for **[correlated subqueries in the HAVING clause](https://issues.apache.org/jira/browse/PHOENIX-1388)** and **[using subqueries as expressions](https://issues.apache.org/jira/browse/PHOENIX-1392)**.
15. **[Cost-based Query Optimization]((https://issues.apache.org/jira/browse/PHOENIX-1177))**. Enhance existing [statistics collection](update_statistics.html) by enabling further query optmizations based on the size and cardinality of the data.
    * **[Generate histograms](https://issues.apache.org/jira/browse/PHOENIX-1178)** to drive query optimization decisions such as secondary index usage and join ordering based on cardinalities to produce the most efficient query plan.
9. **[Functional Indexes](https://issues.apache.org/jira/browse/PHOENIX-514)**. Enables an index to contain the evaluation of an expression as opposed to just a column value and use the index when a statement contains this expression.
6. **Type Enhancements**. Additional work includes support for [DEFAULT declaration](https://issues.apache.org/jira/browse/PHOENIX-476) when creating a table, and for [STRUCT](https://issues.apache.org/jira/browse/PHOENIX-477) and [JSON](https://issues.apache.org/jira/browse/PHOENIX-628) data types.
10. **[Monitoring and Management Improvements](https://issues.apache.org/jira/browse/PHOENIX-1121)**. Though we support [tracing](tracing.html) now, there's more work to do to round out our monitoring and management capabilities.
17. **[OLAP Extensions](https://issues.apache.org/jira/browse/PHOENIX-154)**. Support the `WINDOW`, `PARTITION OVER`, `RANK`, and other SQL-92 extensions.
16. **[Multi-version Row Queries](https://issues.apache.org/jira/browse/PHOENIX-590)**. Expose the time dimension of rows through a built-in function to allow aggregation and trending over multiple row versions.
18. **[Table Sampling](https://issues.apache.org/jira/browse/PHOENIX-153)**. Support the <code>TABLESAMPLE</code> clause by implementing a filter that uses the guideposts established by stats gathering to only return n rows per region.
14. **Security Features**. A number of existing HBase security features in 0.94 could be leverage and new security features being added to 0.98 could be leveraged in the future.
    * **[Support GRANT and REVOKE](https://issues.apache.org/jira/browse/PHOENIX-672)**. Support the standard GRANT and REVOKE SQL commands through an HBase AccessController.
    * **[Surface support for encryption](https://issues.apache.org/jira/browse/PHOENIX-673)**. Surface specification of what should be encrypted now that HBase supports transparent encryption.
    * **[Support Cell-level security](https://issues.apache.org/jira/browse/PHOENIX-684)**. Surface cell-level security now that HBase supports it.
19. **Schema Evolution**. Phoenix supports adding and removing columns through the [ALTER TABLE] (language/index.html#alter) DDL command, but changing the data type of, or renaming, an existing column is not yet supported.
7. **Third Party Integration**. There are a number of open source projects with which interop with Phoenix could be added or improved:
    * **[Apache Sqoop integration](https://issues.apache.org/jira/browse/PHOENIX-763)**. Enable Sqoop to import Phoenix-compliant HBase tables from relational databases.
    * **[Improve Map-reduce integration](https://issues.apache.org/jira/browse/PHOENIX-687)**. It's possible that we could provide a processing model where the map and reduce functions can invoke Phoenix queries (though this needs some more thought).
    * **Apache Crunch integration**. Enable Apache Phoenix to easily be used as a more performant alternative in Apache Crunch to their HBase integration.
    * **Apache BigTop example**. Add an example usage of Apache Phoenix with other Big Data tools as a conical example in Apache BigTop.
