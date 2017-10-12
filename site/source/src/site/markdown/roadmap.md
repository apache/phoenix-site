# Roadmap

Our roadmap is driven by our user community. Below, in prioritized order, is the current plan for Phoenix:

1. **[Stress and chaos testing](https://issues.apache.org/jira/browse/PHOENIX-3146)**. Open source and automate the running of stress and chaos tests that exercise Phoenix and HBase under high load and failure conditions.
14. **Security Features**. A number of existing HBase security features could be surfaced and leveraged at the Phoenix level.
    * **[Support GRANT and REVOKE](https://issues.apache.org/jira/browse/PHOENIX-672)**. Support the standard GRANT and REVOKE SQL commands through an HBase AccessController.
    * **[Support Cell-level security](https://issues.apache.org/jira/browse/PHOENIX-684)**. Surface cell-level security now that HBase supports it.
1. **[Compatibility testing](https://issues.apache.org/jira/browse/PHOENIX-3183)**. Open source and automate the running of backward compatibility tests for Phoenix and HBase, including new server versions of Phoenix working with older client versions and unreleased HBase versions compiling with existing Phoenix versions.
15. **[Cost-based Query Optimization]((https://issues.apache.org/jira/browse/PHOENIX-1177))**. Enhance existing [statistics collection](update_statistics.html) by enabling further query optmizations based on the size and cardinality of the data.
    * **[Generate histograms](https://issues.apache.org/jira/browse/PHOENIX-1178)** to drive query optimization decisions such as secondary index usage and join ordering based on cardinalities to produce the most efficient query plan.
1. **[Join Improvements](https://issues.apache.org/jira/browse/PHOENIX-1167)**. Enhance our join capabilities in a variety of ways:<br/>
    *  **[Table-stats-guided choice between hash join and sort-merge join](https://issues.apache.org/jira/browse/PHOENIX-1556)**. Base hash join versus many-to-many decision on how many guideposts will be traversed for RHS table(s).
    *  **[Inlined parent/child joins](https://issues.apache.org/jira/browse/PHOENIX-150)**. Optimize parent/child joins by storing child rows inside of a parent row, forming the column qualifier through a known prefix plus the child row primary key.
2. **[Subquery enhancements](subqueries.html)**, which includes support for **[correlated subqueries in the HAVING clause](https://issues.apache.org/jira/browse/PHOENIX-1388)** and **[using subqueries as expressions](https://issues.apache.org/jira/browse/PHOENIX-1392)**.
19. **Schema Evolution**. Phoenix supports adding and removing columns through the [ALTER TABLE] (language/index.html#alter) DDL command, but changing the data type of, or renaming, an existing column is not yet supported.
1. **[Apache Calcite adapter](https://calcite.incubator.apache.org/)**. Create a Phoenix adapter for Calcite to increase the breadth of our SQL support, plug into a rich cost-based optimizer framework, and enable potential interop with other adapters. **See our [calcite branch](https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=shortlog;h=refs/heads/calcite) to try this and track our progress.**
17. **[OLAP Extensions](https://issues.apache.org/jira/browse/PHOENIX-154)**. Support the `WINDOW`, `PARTITION OVER`, `RANK`, and other SQL-92 extensions.
7. **[STRUCT type](https://issues.apache.org/jira/browse/PHOENIX-477)**. Allow declarations of multiple fields of different data types that would be packed into a single cell to reduce the per column storage overhead.
15. **[Surface encryption features](https://issues.apache.org/jira/browse/PHOENIX-673)**. Surface specification of what should be encrypted now that HBase supports transparent encryption.
