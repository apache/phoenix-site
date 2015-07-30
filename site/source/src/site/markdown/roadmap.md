# Roadmap

Our roadmap is driven by our user community. Below, in prioritized order, is the current plan for Phoenix:

1. **[Transaction Support](https://issues.apache.org/jira/browse/PHOENIX-1674)**. Support transactions by integrating with [Tephra](https://github.com/continuuity/tephra). **See our [txn branch](https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=shortlog;h=refs/heads/txn) to try this and track our progress.**
2. **[Apache Calcite](https://calcite.incubator.apache.org/) Adapter**. Create a Phoenix adapter for Calcite to increase the breadth of our SQL support, plug into a rich cost-based optimizer framework, and enable potential interop with other adapters. **See our [calcite branch](https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=shortlog;h=refs/heads/calcite) to try this and track our progress.**
3. **[JSON Support](https://issues.apache.org/jira/browse/PHOENIX-628)**. Support a JSON data type and implement the standard operators and built-in functions similar to Postgres. **See our [json branch](https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=shortlog;h=refs/heads/json) to try this and track our progress.**
10. **[Monitoring and Management Improvements](https://issues.apache.org/jira/browse/PHOENIX-1121)**. Though we support [tracing](tracing.html) now, there's more work to do to better _operationalize_ Phoenix.
15. **[Cost-based Query Optimization]((https://issues.apache.org/jira/browse/PHOENIX-1177))**. Enhance existing [statistics collection](update_statistics.html) by enabling further query optmizations based on the size and cardinality of the data.
    * **[Generate histograms](https://issues.apache.org/jira/browse/PHOENIX-1178)** to drive query optimization decisions such as secondary index usage and join ordering based on cardinalities to produce the most efficient query plan.
1. **[Join Improvements](https://issues.apache.org/jira/browse/PHOENIX-1167)**. Enhance our join capabilities in a variety of ways:<br/>
    *  **[Table-stats-guided choice between hash join and sort-merge join](https://issues.apache.org/jira/browse/PHOENIX-1556)**. Base hash join versus many-to-many decision on how many guideposts will be traversed for RHS table(s).
    *  **[Inlined parent/child joins](https://issues.apache.org/jira/browse/PHOENIX-150)**. Optimize parent/child joins by storing child rows inside of a parent row, forming the column qualifier through a known prefix plus the child row primary key.
2. **[Subquery](subqueries.html) Enhancement**, which includes support for **[correlated subqueries in the HAVING clause](https://issues.apache.org/jira/browse/PHOENIX-1388)** and **[using subqueries as expressions](https://issues.apache.org/jira/browse/PHOENIX-1392)**.
6. **[DEFAULT declaration](https://issues.apache.org/jira/browse/PHOENIX-476)**. When creating a table, we should allow a DEFAULT declaration in our CREATE TABLE statement.
7. **[STRUCT type](https://issues.apache.org/jira/browse/PHOENIX-477)**. Allow declarations of multiple fields of different data types that would be packed into a single cell to reduce the per column storage overhead.
17. **[OLAP Extensions](https://issues.apache.org/jira/browse/PHOENIX-154)**. Support the `WINDOW`, `PARTITION OVER`, `RANK`, and other SQL-92 extensions.
16. **[Multi-version Row Queries](https://issues.apache.org/jira/browse/PHOENIX-590)**. Expose the time dimension of rows through a built-in function to allow aggregation and trending over multiple row versions.
18. **[Table Sampling](https://issues.apache.org/jira/browse/PHOENIX-153)**. Support the <code>TABLESAMPLE</code> clause by implementing a filter that uses the guideposts established by stats gathering to only return n rows per region.
14. **Security Features**. A number of existing HBase security features in 0.94 could be leverage and new security features being added to 0.98 could be leveraged in the future.
    * **[Support GRANT and REVOKE](https://issues.apache.org/jira/browse/PHOENIX-672)**. Support the standard GRANT and REVOKE SQL commands through an HBase AccessController.
    * **[Surface support for encryption](https://issues.apache.org/jira/browse/PHOENIX-673)**. Surface specification of what should be encrypted now that HBase supports transparent encryption.
    * **[Support Cell-level security](https://issues.apache.org/jira/browse/PHOENIX-684)**. Surface cell-level security now that HBase supports it.
19. **Schema Evolution**. Phoenix supports adding and removing columns through the [ALTER TABLE] (language/index.html#alter) DDL command, but changing the data type of, or renaming, an existing column is not yet supported.
20. **[Apache Sqoop integration](https://issues.apache.org/jira/browse/PHOENIX-763)**. Enable Sqoop to import Phoenix-compliant HBase tables from relational databases.
