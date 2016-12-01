# Atomic Upsert

To support atomic upsert, an optional ON DUPLICATE KEY clause, similar to the MySQL syntax, has been
encorporated into the UPSERT VALUES command as of Phoenix 4.9. The general syntax is described
[here](language/index.html#upsert_values). This feature provides a superset of the HBase Increment and
CheckAndPut functionality to enable atomic upserts. On the server-side, when the commit
is processed, the row being updated will be locked while the current column values are read and the
ON DUPLICATE KEY clause is executed. Given that the row must be locked and read when the ON DUPLICATE KEY
clause is used, there will be a performance penalty (much like there is for an HBase Put versus a CheckAndPut).

In the presence of the ON DUPLICATE KEY clause, if the row already exists, the VALUES specified will
be ignored and instead either:

* the row will not be updated if ON DUPLICATE KEY IGNORE is specified or
* the row will be updated (under lock) by executing the expressions following the ON DUPLICATE KEY UPDATE 
clause.

Multiple UPSERT statements for the same row in the same commit batch will be processed in the order of their
execution. Thus the same result will be produced when auto commit is on or off.

## Examples

For example, to atomically increment two counter columns, you would execute the following command:

    UPSERT INTO my_table(id, counter1, counter2) VALUES ('abc', 0, 0)
    ON DUPLICATE KEY UPDATE counter1 = counter1 + 1, counter2 = counter2 + 1;

To only update a column if it doesn't yet exist:

    UPSERT INTO my_table(id, my_col) VALUES ('abc', 100)
    ON DUPLICATE KEY IGNORE;

Note that arbitrarily complex expressions may be used in this new clause:

    UPSERT INTO my_table(id, total_deal_size, deal_size) VALUES ('abc', 0, 100)
    ON DUPLICATE KEY UPDATE
        total_deal_size = total_deal_size + deal_size,
        approval_reqd = CASE WHEN total_deal_size < 100 THEN 'NONE'
        WHEN total_deal_size < 1000 THEN 'MANAGER APPROVAL'
        ELSE 'VP APPROVAL' END;

## Limitations

The following limitations are enforced for the ON DUPLICATE KEY clause usage:

* Primary key columns may not be updated, since this would essentially be creating a *new* row.
* Transactional tables may not use this clause as atomic upserts are already possible through
  exception handling when a conflict occurs.
* Immutable tables may not use this clause as by definition there should be no updates to
  existing rows
* The CURRENT_SCN property may not be set on connection when this clause is used as HBase
  does not handle atomicity unless the latest value is being updated.
* The same column should not be updated more than once in the same statement.
* No aggregation or references to sequences are allowed within the clause.
* Although global indexes on columns being atomically updated are supported, it's not recommended
  as a potentially a separate RPC across the wire would be made while the row is under lock to
  maintain the secondary index.

