# Transactions (beta)
Above and beyond the row-level transactional semantics of HBase, Phoenix adds cross row and cross table transaction support with full [ACID](https://en.wikipedia.org/wiki/ACID) semantics by integrating with [Tephra](http://tephra.io/), now an Apache incubator project. Tephra provides snapshot isolation of concurrent transactions by implementing multi-versioned concurrency control.

Setting up a system to use transactions in Phoenix requires two steps:

1. Add the following config to your client side <code>hbase-site.xml</code> file to enable transactions:

    <pre>
    &lt;property&gt;
      &lt;name&gt;phoenix.transactions.enabled&lt;/name&gt;
      &lt;value&gt;true&lt;/value&gt;
    &lt;/property&gt;
    </pre>

2. Add the following config to your server side <code>hbase-site.xml</code> file to configure the transaction manager:
   The "Transaction Server Configuration" section of [Tephra](https://github.com/caskdata/tephra) describes the available configuration options.

    <pre>
    &lt;property&gt;
      &lt;name&gt;data.tx.snapshot.dir&lt;/name&gt;
      &lt;value&gt;/tmp/tephra/snapshots&lt;/value&gt;
    &lt;/property&gt;
    </pre>

    Also set the transaction timeout (time after which open transactions become invalid) to a reasonable value.

    <pre>
    &lt;property&gt;
      &lt;name&gt;data.tx.timeout&lt;/name&gt;
      &lt;value&gt;60&lt;/value&gt;
    &lt;/property&gt;
    </pre>

3. Set $HBASE_HOME and start the transaction manager:

    <pre>
    ./bin/tephra
    </pre>

The transaction manager would typically be configured to run on one or more of the master nodes in your HBase cluster.

Once this setup is done, transactions may then be enabled on a table by table basis by using the <code>TRANSACTIONAL=true</code> property when you create your table:

    CREATE TABLE my_table (k BIGINT PRIMARY KEY, v VARCHAR) TRANSACTIONAL=true;

An existing table may also be altered to be transactional, **but be careful because you cannot switch a transactional table back to being non transactional**:

    ALTER TABLE my_other_table SET TRANSACTIONAL=true;

A transaction is started implicitly through the execution of a statement on a transactional table and then finished through either a commit or rollback. Once started, the statements will not see any data committed by other transactions until the transaction is complete. They will, however, see their own uncommitted data. For example:

    SELECT * FROM my_table; -- This will start a transaction
    UPSERT INTO my_table VALUES (1,'A');
    SELECT count(*) FROM my_table WHERE k=1; -- Will see uncommitted row
    DELETE FROM my_other_table WHERE k=2;
    !commit -- Other transactions will now see your updates and you will see theirs

An exception is thrown if a transaction tries to commit a row that conflicts with other overlapping transaction that already committed. For example:

    UPSERT INTO my_table VALUES (1,'A');

In a second transaction perform a commit for the same row.

    UPSERT INTO my_table VALUES (1,'B');
    !commit

Now if you try to commit the first transaction you will get an exception

    java.sql.SQLException: ERROR 523 (42900): Transaction aborted due to conflict with other mutations. Conflict detected for transaction 1454112544975000000.

Queries are only able to view commits that completed before the current transaction started and are not able to view the in progress changes of other transactions.

Indexes added to a transactional table are transactional as well with regard to their incremental maintenance. For example, the following index added to my_table will be kept transactional consistent with its data table as mutations are made:

    CREATE INDEX  my_table (k BIGINT PRIMARY KEY, v VARCHAR) TRANSACTIONAL=true;

During a commit, if either the index or data table write fails an exception is thrown and the client can either rollback or retry. 
If the commit fails both the index and data table rows are not visible.

An external Tephra transaction that has already been started can be used with Phoenix by setting the transaction context of the phoenix connection :

<pre>setTransactionContext(TransactionContext txContext)</pre>

##Limitations

1. Starting a transaction on a connection with an SCN set is not allowed. 
2. Setting the maximum number of versions property while creating a transactional table limits the number of snapshots available for concurrent transactions. 
3. When a transaction times out or if it cannot be rolled back by the client, it is added to an invalid list. This list can potentially grow if there are a lot of failed or timed out transactions. 
For now, an adminstrator can manually clear transactions from this list after a major compaction has occurred. [TEPHRA-35](https://issues.cask.co/browse/TEPHRA-35) describes ongoing work to automatically remove transactions from the invalid list once all data associated with the transaction has been removed.
4. If adding an index asynchronously to an existing transactional table, make sure to run a major compaction before issuing the CREATE INDEX ASYNC command as otherwise invalid and/or uncommitted transactions may appear in your index [PHOENIX-2154](https://issues.apache.org/jira/browse/PHOENIX-2154).

