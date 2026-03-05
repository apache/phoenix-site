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
`,l={title:"Atomic Upsert",description:"Use UPSERT ... ON DUPLICATE KEY for atomic row-level updates in Phoenix, with examples and limitations."},h=[{href:"/docs/grammar#upsert-values"}],r={contents:[{heading:void 0,content:`To support atomic upsert, an optional ON DUPLICATE KEY clause, similar to the MySQL syntax, has been
incorporated into the UPSERT VALUES command as of Phoenix 4.9. The general syntax is described
here. This feature provides a superset of the HBase Increment and
CheckAndPut functionality to enable atomic upserts. On the server-side, when the commit
is processed, the row being updated will be locked while the current column values are read and the
ON DUPLICATE KEY clause is executed. Given that the row must be locked and read when the ON DUPLICATE KEY
clause is used, there will be a performance penalty (much like there is for an HBase Put versus a CheckAndPut).`},{heading:void 0,content:`In the presence of the ON DUPLICATE KEY clause, if the row already exists, the VALUES specified will
be ignored and instead either:`},{heading:void 0,content:"the row will not be updated if ON DUPLICATE KEY IGNORE is specified or"},{heading:void 0,content:`the row will be updated (under lock) by executing the expressions following the ON DUPLICATE KEY UPDATE
clause.`},{heading:void 0,content:`Multiple UPSERT statements for the same row in the same commit batch will be processed in the order of their
execution. Thus the same result will be produced when auto commit is on or off.`},{heading:"atomic-upsert-examples",content:"For example, to atomically increment two counter columns, you would execute the following command:"},{heading:"atomic-upsert-examples",content:"To only update a column if it doesn't yet exist:"},{heading:"atomic-upsert-examples",content:"Note that arbitrarily complex expressions may be used in this new clause:"},{heading:"atomic-upsert-limitations",content:"The following limitations are enforced for the ON DUPLICATE KEY clause usage:"},{heading:"atomic-upsert-limitations",content:"Primary key columns may not be updated, since this would essentially be creating a new row."},{heading:"atomic-upsert-limitations",content:`Transactional tables may not use this clause as atomic upserts are already possible through
exception handling when a conflict occurs.`},{heading:"atomic-upsert-limitations",content:`Immutable tables may not use this clause as by definition there should be no updates to
existing rows.`},{heading:"atomic-upsert-limitations",content:`The CURRENT_SCN property may not be set on connection when this clause is used as HBase
does not handle atomicity unless the latest value is being updated.`},{heading:"atomic-upsert-limitations",content:"The same column should not be updated more than once in the same statement."},{heading:"atomic-upsert-limitations",content:"No aggregation or references to sequences are allowed within the clause."},{heading:"atomic-upsert-limitations",content:"Global indexes on columns being atomically updated are not supported, as potentially a separate RPC across the wire would be made while the row is under lock to maintain the secondary index."}],headings:[{id:"atomic-upsert-examples",content:"Examples"},{id:"atomic-upsert-limitations",content:"Limitations"}]};const d=[{depth:2,url:"#atomic-upsert-examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#atomic-upsert-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function t(s){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["To support atomic upsert, an optional ",e.jsx(i.code,{children:"ON DUPLICATE KEY"}),` clause, similar to the MySQL syntax, has been
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
`]})]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{a as _markdown,o as default,h as extractedReferences,l as frontmatter,r as structuredData,d as toc};
