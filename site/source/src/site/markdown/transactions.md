# Transactions (beta)
Above and beyond the row-level transactional semantics of HBase, Phoenix adds cross row and cross table transaction support with full ACID semantics by integrating with a transaction library named [Tephra](http://tephra.io/).

Setting up a system to use transactions in Phoenix requires two steps:

1. Enabling them through a new configuration option:

    <pre>
    &lt;property&gt;
      &lt;name&gt;phoenix.transactions.enabled&lt;/name&gt;
      &lt;value&gt;true&lt;/value&gt;
    &lt;/property&gt;
    </pre>
2. Starting an additional component, the transaction manager:

    <pre>
    ./bin/tephra-env.sh
    ./bin/tephra
    </pre>

The transaction manager would typically be configured to run on one or more of the master nodes in your HBase cluster.

Once this setup is done, transactions may then be enabled on a table by table basis by using the <code>TRANSACTIONAL=true</code> property when you create your table:

    CREATE TABLE my_table (k BIGINT PRIMARY KEY, v VARCHAR) TRANSACTIONAL=true;

An existing table may also be altered to be transactional, **but be careful because you cannot switch a transactional table back to being non transactional**:

    ALTER TABLE my_other_table SET TRANSACTIONAL=true;

Indexes added to a transactional table are transactional as well with regard to their incremental maintenance. For example, the following index added to my_table will be kept transactional consistent with its data table as mutations are made:

    CREATE INDEX  my_table (k BIGINT PRIMARY KEY, v VARCHAR) TRANSACTIONAL=true;

A transaction is started implicitly through the execution of a statement on a transactional table and then finished through either a commit or rollback. Once started, the statements will not see any data committed by other transactions until the transaction is complete. They will, however, see their own uncommitted data. For example:

    SELECT * FROM my_table; -- This will start a transaction
    UPSERT INTO my_table VALUES (1,'A');
    SELECT count(*) FROM my_table WHERE k=1; -- Will see uncommitted row
    DELETE FROM my_other_table WHERE k=2;
    COMMIT; -- Other transactions will now see your updates and you will see theirs

