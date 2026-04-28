import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`To support atomic upsert, an optional \`ON DUPLICATE KEY\` clause, similar to the MySQL syntax, has been
incorporated into the \`UPSERT VALUES\` command as of Phoenix 4.9. The general syntax is described
[here](/docs/grammar#upsert-values). This feature provides a superset of the HBase \`Increment\` and
\`CheckAndPut\` functionality to enable atomic upserts. On the server-side, when the commit
is processed, the row being updated will be locked while the current column values are read and the
\`ON DUPLICATE KEY\` clause is executed. Given that the row must be locked and read when the \`ON DUPLICATE KEY\`
clause is used, there will be a performance penalty (much like there is for an HBase \`Put\` versus a \`CheckAndPut\`).

In the presence of the \`ON DUPLICATE KEY\` clause, if the row already exists, the \`VALUES\` specified will
be ignored and instead either:

* the row will not be updated if \`ON DUPLICATE KEY IGNORE\` is specified or
* the row will be updated (under lock) by executing the expressions following the \`ON DUPLICATE KEY UPDATE\`
  clause.

Multiple \`UPSERT\` statements for the same row in the same commit batch will be processed in the order of their
execution. Thus the same result will be produced when auto commit is on or off.

## Examples

For example, to atomically increment two counter columns, you would execute the following command:

\`\`\`sql
UPSERT INTO my_table(id, counter1, counter2) VALUES ('abc', 0, 0)
ON DUPLICATE KEY UPDATE counter1 = counter1 + 1, counter2 = counter2 + 1;
\`\`\`

To only update a column if it doesn't yet exist:

\`\`\`sql
UPSERT INTO my_table(id, my_col) VALUES ('abc', 100)
ON DUPLICATE KEY IGNORE;
\`\`\`

Note that arbitrarily complex expressions may be used in this new clause:

\`\`\`sql
UPSERT INTO my_table(id, total_deal_size, deal_size) VALUES ('abc', 0, 100)
ON DUPLICATE KEY UPDATE
    total_deal_size = total_deal_size + deal_size,
    approval_reqd = CASE WHEN total_deal_size < 100 THEN 'NONE'
    WHEN total_deal_size < 1000 THEN 'MANAGER APPROVAL'
    ELSE 'VP APPROVAL' END;
\`\`\`

## ON DUPLICATE KEY UPDATE\\_ONLY

\`UPDATE_ONLY\` is a third variant of the \`ON DUPLICATE KEY\` clause, available from
Phoenix 5.3.0 ([PHOENIX-7648](https://issues.apache.org/jira/browse/PHOENIX-7648)).
Unlike \`UPDATE\`, the \`VALUES\` are **not** inserted when the row is missing — the
statement is a no-op in that case. Use it when an \`UPSERT\` should behave purely as a
conditional in-place update.

\`\`\`sql
UPSERT INTO inventory(id, qty) VALUES ('sku-42', 0)
ON DUPLICATE KEY UPDATE_ONLY qty = qty - 1;
\`\`\`

If \`id = 'sku-42'\` already exists, its \`qty\` is decremented under the row lock.
If it doesn't, the supplied \`VALUES\` are discarded and nothing is written.

The three forms compared:

| Clause                             | Row missing                | Row present    |
| ---------------------------------- | -------------------------- | -------------- |
| \`ON DUPLICATE KEY IGNORE\`          | Insert from \`VALUES\`       | No-op          |
| \`ON DUPLICATE KEY UPDATE ...\`      | Insert from \`VALUES\`       | Run the update |
| \`ON DUPLICATE KEY UPDATE_ONLY ...\` | No-op (\`VALUES\` discarded) | Run the update |

## Returning the affected row

A single-row \`UPSERT\` or \`DELETE\` can append \`RETURNING *\` to return the affected row
as a JDBC \`ResultSet\` in the same round-trip, available from Phoenix 5.3.0
([PHOENIX-7651](https://issues.apache.org/jira/browse/PHOENIX-7651)). The returned
row reflects the **server-side state after the mutation** — including any values
computed by an \`ON DUPLICATE KEY UPDATE\` clause under the row lock.

This collapses two common patterns into one round-trip:

* **Atomic read-modify-write counters** — increment, then read the new value
  without a follow-up \`SELECT\` (and without risking a different writer slipping in
  between).
* **Tombstoning / queue consumers** — atomically delete a row and read the payload
  you just removed, useful for idempotent replay and "claim the next task" patterns.

\`\`\`sql
-- Atomic increment that also returns the post-update row.
UPSERT INTO counters(id, hits) VALUES ('home', 0)
ON DUPLICATE KEY UPDATE hits = hits + 1
RETURNING *;

-- Atomic delete returning the row that was removed.
DELETE FROM tasks WHERE id = ? RETURNING *;
\`\`\`

The statement must affect a single row when \`RETURNING *\` is used. Drivers iterate
the returned \`ResultSet\` exactly like the result of a regular \`SELECT\`.

## Limitations

The following limitations are enforced for the \`ON DUPLICATE KEY\` clause usage:

* Primary key columns may not be updated, since this would essentially be creating a *new* row.
* Transactional tables may not use this clause as atomic upserts are already possible through
  exception handling when a conflict occurs.
* Immutable tables may not use this clause as by definition there should be no updates to
  existing rows.
* The \`CURRENT_SCN\` property may not be set on connection when this clause is used as HBase
  does not handle atomicity unless the latest value is being updated.
* The same column should not be updated more than once in the same statement.
* No aggregation or references to sequences are allowed within the clause.
* Global indexes on columns being atomically updated are not supported, as potentially a separate RPC across the wire would be made while the row is under lock to maintain the secondary index.
`,h={title:"Atomic Upsert",description:"Use UPSERT ... ON DUPLICATE KEY for atomic row-level updates in Phoenix, with examples and limitations."},l=[{href:"/docs/grammar#upsert-values"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7648"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7651"}],r={contents:[{heading:void 0,content:`To support atomic upsert, an optional ON DUPLICATE KEY clause, similar to the MySQL syntax, has been
incorporated into the UPSERT VALUES command as of Phoenix 4.9. The general syntax is described
here. This feature provides a superset of the HBase Increment and
CheckAndPut functionality to enable atomic upserts. On the server-side, when the commit
is processed, the row being updated will be locked while the current column values are read and the
ON DUPLICATE KEY clause is executed. Given that the row must be locked and read when the ON DUPLICATE KEY
clause is used, there will be a performance penalty (much like there is for an HBase Put versus a CheckAndPut).`},{heading:void 0,content:`In the presence of the ON DUPLICATE KEY clause, if the row already exists, the VALUES specified will
be ignored and instead either:`},{heading:void 0,content:"the row will not be updated if ON DUPLICATE KEY IGNORE is specified or"},{heading:void 0,content:`the row will be updated (under lock) by executing the expressions following the ON DUPLICATE KEY UPDATE
clause.`},{heading:void 0,content:`Multiple UPSERT statements for the same row in the same commit batch will be processed in the order of their
execution. Thus the same result will be produced when auto commit is on or off.`},{heading:"atomic-upsert-examples",content:"For example, to atomically increment two counter columns, you would execute the following command:"},{heading:"atomic-upsert-examples",content:"To only update a column if it doesn't yet exist:"},{heading:"atomic-upsert-examples",content:"Note that arbitrarily complex expressions may be used in this new clause:"},{heading:"atomic-upsert-update-only",content:`UPDATE_ONLY is a third variant of the ON DUPLICATE KEY clause, available from
Phoenix 5.3.0 (PHOENIX-7648).
Unlike UPDATE, the VALUES are not inserted when the row is missing — the
statement is a no-op in that case. Use it when an UPSERT should behave purely as a
conditional in-place update.`},{heading:"atomic-upsert-update-only",content:`If id = 'sku-42' already exists, its qty is decremented under the row lock.
If it doesn't, the supplied VALUES are discarded and nothing is written.`},{heading:"atomic-upsert-update-only",content:"The three forms compared:"},{heading:"atomic-upsert-update-only",content:"Clause"},{heading:"atomic-upsert-update-only",content:"Row missing"},{heading:"atomic-upsert-update-only",content:"Row present"},{heading:"atomic-upsert-update-only",content:"ON DUPLICATE KEY IGNORE"},{heading:"atomic-upsert-update-only",content:"Insert from VALUES"},{heading:"atomic-upsert-update-only",content:"No-op"},{heading:"atomic-upsert-update-only",content:"ON DUPLICATE KEY UPDATE ..."},{heading:"atomic-upsert-update-only",content:"Insert from VALUES"},{heading:"atomic-upsert-update-only",content:"Run the update"},{heading:"atomic-upsert-update-only",content:"ON DUPLICATE KEY UPDATE_ONLY ..."},{heading:"atomic-upsert-update-only",content:"No-op (VALUES discarded)"},{heading:"atomic-upsert-update-only",content:"Run the update"},{heading:"atomic-upsert-returning",content:`A single-row UPSERT or DELETE can append RETURNING * to return the affected row
as a JDBC ResultSet in the same round-trip, available from Phoenix 5.3.0
(PHOENIX-7651). The returned
row reflects the server-side state after the mutation — including any values
computed by an ON DUPLICATE KEY UPDATE clause under the row lock.`},{heading:"atomic-upsert-returning",content:"This collapses two common patterns into one round-trip:"},{heading:"atomic-upsert-returning",content:`Atomic read-modify-write counters — increment, then read the new value
without a follow-up SELECT (and without risking a different writer slipping in
between).`},{heading:"atomic-upsert-returning",content:`Tombstoning / queue consumers — atomically delete a row and read the payload
you just removed, useful for idempotent replay and "claim the next task" patterns.`},{heading:"atomic-upsert-returning",content:`The statement must affect a single row when RETURNING * is used. Drivers iterate
the returned ResultSet exactly like the result of a regular SELECT.`},{heading:"atomic-upsert-limitations",content:"The following limitations are enforced for the ON DUPLICATE KEY clause usage:"},{heading:"atomic-upsert-limitations",content:"Primary key columns may not be updated, since this would essentially be creating a new row."},{heading:"atomic-upsert-limitations",content:`Transactional tables may not use this clause as atomic upserts are already possible through
exception handling when a conflict occurs.`},{heading:"atomic-upsert-limitations",content:`Immutable tables may not use this clause as by definition there should be no updates to
existing rows.`},{heading:"atomic-upsert-limitations",content:`The CURRENT_SCN property may not be set on connection when this clause is used as HBase
does not handle atomicity unless the latest value is being updated.`},{heading:"atomic-upsert-limitations",content:"The same column should not be updated more than once in the same statement."},{heading:"atomic-upsert-limitations",content:"No aggregation or references to sequences are allowed within the clause."},{heading:"atomic-upsert-limitations",content:"Global indexes on columns being atomically updated are not supported, as potentially a separate RPC across the wire would be made while the row is under lock to maintain the secondary index."}],headings:[{id:"atomic-upsert-examples",content:"Examples"},{id:"atomic-upsert-update-only",content:"ON DUPLICATE KEY UPDATE_ONLY"},{id:"atomic-upsert-returning",content:"Returning the affected row"},{id:"atomic-upsert-limitations",content:"Limitations"}]};const d=[{depth:2,url:"#atomic-upsert-examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#atomic-upsert-update-only",title:e.jsx(e.Fragment,{children:"ON DUPLICATE KEY UPDATE_ONLY"})},{depth:2,url:"#atomic-upsert-returning",title:e.jsx(e.Fragment,{children:"Returning the affected row"})},{depth:2,url:"#atomic-upsert-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function t(s){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["To support atomic upsert, an optional ",e.jsx(i.code,{children:"ON DUPLICATE KEY"}),` clause, similar to the MySQL syntax, has been
incorporated into the `,e.jsx(i.code,{children:"UPSERT VALUES"}),` command as of Phoenix 4.9. The general syntax is described
`,e.jsx(i.a,{href:"/docs/grammar#upsert-values",children:"here"}),". This feature provides a superset of the HBase ",e.jsx(i.code,{children:"Increment"}),` and
`,e.jsx(i.code,{children:"CheckAndPut"}),` functionality to enable atomic upserts. On the server-side, when the commit
is processed, the row being updated will be locked while the current column values are read and the
`,e.jsx(i.code,{children:"ON DUPLICATE KEY"})," clause is executed. Given that the row must be locked and read when the ",e.jsx(i.code,{children:"ON DUPLICATE KEY"}),`
clause is used, there will be a performance penalty (much like there is for an HBase `,e.jsx(i.code,{children:"Put"})," versus a ",e.jsx(i.code,{children:"CheckAndPut"}),")."]}),`
`,e.jsxs(i.p,{children:["In the presence of the ",e.jsx(i.code,{children:"ON DUPLICATE KEY"})," clause, if the row already exists, the ",e.jsx(i.code,{children:"VALUES"}),` specified will
be ignored and instead either:`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["the row will not be updated if ",e.jsx(i.code,{children:"ON DUPLICATE KEY IGNORE"})," is specified or"]}),`
`,e.jsxs(i.li,{children:["the row will be updated (under lock) by executing the expressions following the ",e.jsx(i.code,{children:"ON DUPLICATE KEY UPDATE"}),`
clause.`]}),`
`]}),`
`,e.jsxs(i.p,{children:["Multiple ",e.jsx(i.code,{children:"UPSERT"}),` statements for the same row in the same commit batch will be processed in the order of their
execution. Thus the same result will be produced when auto commit is on or off.`]}),`
`,e.jsx(i.h2,{id:"atomic-upsert-examples",children:"Examples"}),`
`,e.jsx(i.p,{children:"For example, to atomically increment two counter columns, you would execute the following command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table(id, counter1, counter2) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'abc'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" UPDATE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counter1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counter1 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", counter2 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counter2 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:"To only update a column if it doesn't yet exist:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table(id, my_col) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'abc'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" IGNORE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:"Note that arbitrarily complex expressions may be used in this new clause:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table(id, total_deal_size, deal_size) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'abc'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" UPDATE"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    total_deal_size "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" total_deal_size "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" deal_size,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    approval_reqd "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" CASE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" WHEN"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" total_deal_size "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 100"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" THEN"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'NONE'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    WHEN"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" total_deal_size "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1000"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" THEN"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'MANAGER APPROVAL'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ELSE"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'VP APPROVAL'"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" END"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.h2,{id:"atomic-upsert-update-only",children:"ON DUPLICATE KEY UPDATE_ONLY"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"UPDATE_ONLY"})," is a third variant of the ",e.jsx(i.code,{children:"ON DUPLICATE KEY"}),` clause, available from
Phoenix 5.3.0 (`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7648",children:"PHOENIX-7648"}),`).
Unlike `,e.jsx(i.code,{children:"UPDATE"}),", the ",e.jsx(i.code,{children:"VALUES"})," are ",e.jsx(i.strong,{children:"not"}),` inserted when the row is missing — the
statement is a no-op in that case. Use it when an `,e.jsx(i.code,{children:"UPSERT"}),` should behave purely as a
conditional in-place update.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" inventory(id, qty) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'sku-42'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" UPDATE_ONLY qty "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" qty "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:["If ",e.jsx(i.code,{children:"id = 'sku-42'"})," already exists, its ",e.jsx(i.code,{children:"qty"}),` is decremented under the row lock.
If it doesn't, the supplied `,e.jsx(i.code,{children:"VALUES"})," are discarded and nothing is written."]}),`
`,e.jsx(i.p,{children:"The three forms compared:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Clause"}),e.jsx(i.th,{children:"Row missing"}),e.jsx(i.th,{children:"Row present"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ON DUPLICATE KEY IGNORE"})}),e.jsxs(i.td,{children:["Insert from ",e.jsx(i.code,{children:"VALUES"})]}),e.jsx(i.td,{children:"No-op"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ON DUPLICATE KEY UPDATE ..."})}),e.jsxs(i.td,{children:["Insert from ",e.jsx(i.code,{children:"VALUES"})]}),e.jsx(i.td,{children:"Run the update"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"ON DUPLICATE KEY UPDATE_ONLY ..."})}),e.jsxs(i.td,{children:["No-op (",e.jsx(i.code,{children:"VALUES"})," discarded)"]}),e.jsx(i.td,{children:"Run the update"})]})]})]}),`
`,e.jsx(i.h2,{id:"atomic-upsert-returning",children:"Returning the affected row"}),`
`,e.jsxs(i.p,{children:["A single-row ",e.jsx(i.code,{children:"UPSERT"})," or ",e.jsx(i.code,{children:"DELETE"})," can append ",e.jsx(i.code,{children:"RETURNING *"}),` to return the affected row
as a JDBC `,e.jsx(i.code,{children:"ResultSet"}),` in the same round-trip, available from Phoenix 5.3.0
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7651",children:"PHOENIX-7651"}),`). The returned
row reflects the `,e.jsx(i.strong,{children:"server-side state after the mutation"}),` — including any values
computed by an `,e.jsx(i.code,{children:"ON DUPLICATE KEY UPDATE"})," clause under the row lock."]}),`
`,e.jsx(i.p,{children:"This collapses two common patterns into one round-trip:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Atomic read-modify-write counters"}),` — increment, then read the new value
without a follow-up `,e.jsx(i.code,{children:"SELECT"}),` (and without risking a different writer slipping in
between).`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Tombstoning / queue consumers"}),` — atomically delete a row and read the payload
you just removed, useful for idempotent replay and "claim the next task" patterns.`]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Atomic increment that also returns the post-update row."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counters(id, hits) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'home'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" UPDATE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hits "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hits "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"RETURNING "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Atomic delete returning the row that was removed."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DELETE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" tasks "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ? RETURNING "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:["The statement must affect a single row when ",e.jsx(i.code,{children:"RETURNING *"}),` is used. Drivers iterate
the returned `,e.jsx(i.code,{children:"ResultSet"})," exactly like the result of a regular ",e.jsx(i.code,{children:"SELECT"}),"."]}),`
`,e.jsx(i.h2,{id:"atomic-upsert-limitations",children:"Limitations"}),`
`,e.jsxs(i.p,{children:["The following limitations are enforced for the ",e.jsx(i.code,{children:"ON DUPLICATE KEY"})," clause usage:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Primary key columns may not be updated, since this would essentially be creating a ",e.jsx(i.em,{children:"new"})," row."]}),`
`,e.jsx(i.li,{children:`Transactional tables may not use this clause as atomic upserts are already possible through
exception handling when a conflict occurs.`}),`
`,e.jsx(i.li,{children:`Immutable tables may not use this clause as by definition there should be no updates to
existing rows.`}),`
`,e.jsxs(i.li,{children:["The ",e.jsx(i.code,{children:"CURRENT_SCN"}),` property may not be set on connection when this clause is used as HBase
does not handle atomicity unless the latest value is being updated.`]}),`
`,e.jsx(i.li,{children:"The same column should not be updated more than once in the same statement."}),`
`,e.jsx(i.li,{children:"No aggregation or references to sequences are allowed within the clause."}),`
`,e.jsx(i.li,{children:"Global indexes on columns being atomically updated are not supported, as potentially a separate RPC across the wire would be made while the row is under lock to maintain the secondary index."}),`
`]})]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{a as _markdown,o as default,l as extractedReferences,h as frontmatter,r as structuredData,d as toc};
