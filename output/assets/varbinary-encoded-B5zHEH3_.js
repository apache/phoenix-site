import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`\`VARBINARY_ENCODED\` is the safe choice whenever you need a variable-length binary
column that participates in **ordering**: a non-trailing column of a composite primary
key, a secondary-index key, or a row value constructor used for paged queries.
Introduced in Phoenix 5.3.0
([PHOENIX-7357](https://issues.apache.org/jira/browse/PHOENIX-7357)).

## When to use it

Pick \`VARBINARY_ENCODED\` over \`VARBINARY\` when **any** of the following is true:

* The column is part of a multi-column primary key and is **not** the last PK column.
* The column is used as part of an index key.
* You scan with row value constructors (e.g., \`WHERE (a, b) > (?, ?)\` for keyset
  pagination) and one of the columns is binary.
* The binary value can contain \`0x00\` bytes and you cannot guarantee it never will.

Stick with \`VARBINARY\` only when the column is purely a payload — i.e. it's never used
in a \`WHERE\`, \`ORDER BY\`, index, or non-trailing PK position.

The reason: \`VARBINARY\` uses \`0x00\` as a separator between columns in the encoded row
key, so an embedded \`0x00\` byte in an earlier PK column collides with the separator and
breaks ordering. \`VARBINARY_ENCODED\` escapes zero bytes during encoding so the
byte-by-byte sort order of the encoded form matches the lexicographic order of the
original bytes. The transform is reversed on read, so application code keeps seeing the
original bytes.

## Defining columns

Use it like any other column type — including in any position of a composite key:

\`\`\`sql
CREATE TABLE events (
    bucket       VARBINARY_ENCODED NOT NULL,
    event_id     VARBINARY_ENCODED NOT NULL,
    payload      VARBINARY,
    CONSTRAINT pk PRIMARY KEY (bucket, event_id)
);
\`\`\`

Literals use the standard hex form \`x'...'\` in both \`UPSERT\` and \`WHERE\`:

\`\`\`sql
UPSERT INTO events (bucket, event_id, payload)
VALUES (x'01ff00ab', x'00007fa1', x'deadbeef');

SELECT * FROM events
WHERE bucket = x'01ff00ab' AND event_id = x'00007fa1';
\`\`\`

## Paged scans with row value constructors

The intended use case for \`VARBINARY_ENCODED\` in a composite key is keyset pagination
that resumes from the last seen row. Because the type orders correctly, you can drive
this with a row value constructor without any application-level encoding:

\`\`\`sql
SELECT bucket, event_id, payload
FROM events
WHERE (bucket, event_id) > (?, ?)
ORDER BY bucket, event_id
LIMIT 100;
\`\`\`

Bind the two parameters to the last row seen by the previous page; Phoenix turns the
predicate into an efficient seek directly to the resume point. See
[Paged Queries](/docs/features/paged-queries) for the broader pattern.

## Sizing and storage

The encoded form is at most 1 extra byte per \`0x00\` byte in the value. For typical
inputs (random IDs, hashes, opaque tokens) the overhead is effectively zero. Plan a bit
of headroom only when values are known to contain many zero bytes (e.g. fixed-width
integers stored raw with a lot of high-order zeros — in which case a fixed-width
\`UNSIGNED_*\` type is usually a better choice anyway).

## Migrating from VARBINARY

Phoenix does not support changing a column's type in place via \`ALTER TABLE\`, so
moving an existing \`VARBINARY\` column to \`VARBINARY_ENCODED\` is a copy-and-switch
operation:

1. Create a new table with the same schema but with the affected columns declared as
   \`VARBINARY_ENCODED\`.
2. Backfill: \`UPSERT INTO new_table SELECT ... FROM old_table;\` (Phoenix re-encodes
   the values into the new physical layout for you).
3. Cut over reads and writes to the new table, then drop the old one.

For a brand-new column that you're adding to an existing table, you can declare it as
\`VARBINARY_ENCODED\` directly with \`ALTER TABLE ... ADD ...\`.
`,r={title:"VARBINARY_ENCODED",description:"A variable-length binary type that sorts correctly anywhere in a composite key — use it for row keys, index keys, and row value constructors that contain binary data."},h=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7357"},{href:"/docs/features/paged-queries"}],o={contents:[{heading:void 0,content:`VARBINARY_ENCODED is the safe choice whenever you need a variable-length binary
column that participates in ordering: a non-trailing column of a composite primary
key, a secondary-index key, or a row value constructor used for paged queries.
Introduced in Phoenix 5.3.0
(PHOENIX-7357).`},{heading:"varbinary-encoded-when",content:"Pick VARBINARY_ENCODED over VARBINARY when any of the following is true:"},{heading:"varbinary-encoded-when",content:"The column is part of a multi-column primary key and is not the last PK column."},{heading:"varbinary-encoded-when",content:"The column is used as part of an index key."},{heading:"varbinary-encoded-when",content:`You scan with row value constructors (e.g., WHERE (a, b) > (?, ?) for keyset
pagination) and one of the columns is binary.`},{heading:"varbinary-encoded-when",content:"The binary value can contain 0x00 bytes and you cannot guarantee it never will."},{heading:"varbinary-encoded-when",content:`Stick with VARBINARY only when the column is purely a payload — i.e. it's never used
in a WHERE, ORDER BY, index, or non-trailing PK position.`},{heading:"varbinary-encoded-when",content:`The reason: VARBINARY uses 0x00 as a separator between columns in the encoded row
key, so an embedded 0x00 byte in an earlier PK column collides with the separator and
breaks ordering. VARBINARY_ENCODED escapes zero bytes during encoding so the
byte-by-byte sort order of the encoded form matches the lexicographic order of the
original bytes. The transform is reversed on read, so application code keeps seeing the
original bytes.`},{heading:"varbinary-encoded-defining",content:"Use it like any other column type — including in any position of a composite key:"},{heading:"varbinary-encoded-defining",content:"Literals use the standard hex form x'...' in both UPSERT and WHERE:"},{heading:"varbinary-encoded-paging",content:`The intended use case for VARBINARY_ENCODED in a composite key is keyset pagination
that resumes from the last seen row. Because the type orders correctly, you can drive
this with a row value constructor without any application-level encoding:`},{heading:"varbinary-encoded-paging",content:`Bind the two parameters to the last row seen by the previous page; Phoenix turns the
predicate into an efficient seek directly to the resume point. See
Paged Queries for the broader pattern.`},{heading:"varbinary-encoded-sizing",content:`The encoded form is at most 1 extra byte per 0x00 byte in the value. For typical
inputs (random IDs, hashes, opaque tokens) the overhead is effectively zero. Plan a bit
of headroom only when values are known to contain many zero bytes (e.g. fixed-width
integers stored raw with a lot of high-order zeros — in which case a fixed-width
UNSIGNED_* type is usually a better choice anyway).`},{heading:"varbinary-encoded-migrating",content:`Phoenix does not support changing a column's type in place via ALTER TABLE, so
moving an existing VARBINARY column to VARBINARY_ENCODED is a copy-and-switch
operation:`},{heading:"varbinary-encoded-migrating",content:`Create a new table with the same schema but with the affected columns declared as
VARBINARY_ENCODED.`},{heading:"varbinary-encoded-migrating",content:`Backfill: UPSERT INTO new_table SELECT ... FROM old_table; (Phoenix re-encodes
the values into the new physical layout for you).`},{heading:"varbinary-encoded-migrating",content:"Cut over reads and writes to the new table, then drop the old one."},{heading:"varbinary-encoded-migrating",content:`For a brand-new column that you're adding to an existing table, you can declare it as
VARBINARY_ENCODED directly with ALTER TABLE ... ADD ....`}],headings:[{id:"varbinary-encoded-when",content:"When to use it"},{id:"varbinary-encoded-defining",content:"Defining columns"},{id:"varbinary-encoded-paging",content:"Paged scans with row value constructors"},{id:"varbinary-encoded-sizing",content:"Sizing and storage"},{id:"varbinary-encoded-migrating",content:"Migrating from VARBINARY"}]};const d=[{depth:2,url:"#varbinary-encoded-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#varbinary-encoded-defining",title:e.jsx(e.Fragment,{children:"Defining columns"})},{depth:2,url:"#varbinary-encoded-paging",title:e.jsx(e.Fragment,{children:"Paged scans with row value constructors"})},{depth:2,url:"#varbinary-encoded-sizing",title:e.jsx(e.Fragment,{children:"Sizing and storage"})},{depth:2,url:"#varbinary-encoded-migrating",title:e.jsx(e.Fragment,{children:"Migrating from VARBINARY"})}];function s(i){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:[e.jsx(n.code,{children:"VARBINARY_ENCODED"}),` is the safe choice whenever you need a variable-length binary
column that participates in `,e.jsx(n.strong,{children:"ordering"}),`: a non-trailing column of a composite primary
key, a secondary-index key, or a row value constructor used for paged queries.
Introduced in Phoenix 5.3.0
(`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7357",children:"PHOENIX-7357"}),")."]}),`
`,e.jsx(n.h2,{id:"varbinary-encoded-when",children:"When to use it"}),`
`,e.jsxs(n.p,{children:["Pick ",e.jsx(n.code,{children:"VARBINARY_ENCODED"})," over ",e.jsx(n.code,{children:"VARBINARY"})," when ",e.jsx(n.strong,{children:"any"})," of the following is true:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The column is part of a multi-column primary key and is ",e.jsx(n.strong,{children:"not"})," the last PK column."]}),`
`,e.jsx(n.li,{children:"The column is used as part of an index key."}),`
`,e.jsxs(n.li,{children:["You scan with row value constructors (e.g., ",e.jsx(n.code,{children:"WHERE (a, b) > (?, ?)"}),` for keyset
pagination) and one of the columns is binary.`]}),`
`,e.jsxs(n.li,{children:["The binary value can contain ",e.jsx(n.code,{children:"0x00"})," bytes and you cannot guarantee it never will."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Stick with ",e.jsx(n.code,{children:"VARBINARY"}),` only when the column is purely a payload — i.e. it's never used
in a `,e.jsx(n.code,{children:"WHERE"}),", ",e.jsx(n.code,{children:"ORDER BY"}),", index, or non-trailing PK position."]}),`
`,e.jsxs(n.p,{children:["The reason: ",e.jsx(n.code,{children:"VARBINARY"})," uses ",e.jsx(n.code,{children:"0x00"}),` as a separator between columns in the encoded row
key, so an embedded `,e.jsx(n.code,{children:"0x00"}),` byte in an earlier PK column collides with the separator and
breaks ordering. `,e.jsx(n.code,{children:"VARBINARY_ENCODED"}),` escapes zero bytes during encoding so the
byte-by-byte sort order of the encoded form matches the lexicographic order of the
original bytes. The transform is reversed on read, so application code keeps seeing the
original bytes.`]}),`
`,e.jsx(n.h2,{id:"varbinary-encoded-defining",children:"Defining columns"}),`
`,e.jsx(n.p,{children:"Use it like any other column type — including in any position of a composite key:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" events"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    bucket       VARBINARY_ENCODED "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"NOT NULL"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    event_id     VARBINARY_ENCODED "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"NOT NULL"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    payload      "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARBINARY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    CONSTRAINT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (bucket, event_id)"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsxs(n.p,{children:["Literals use the standard hex form ",e.jsx(n.code,{children:"x'...'"})," in both ",e.jsx(n.code,{children:"UPSERT"})," and ",e.jsx(n.code,{children:"WHERE"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events (bucket, event_id, payload)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'01ff00ab'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'00007fa1'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'deadbeef'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" *"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" bucket "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'01ff00ab'"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" event_id "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'00007fa1'"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(n.h2,{id:"varbinary-encoded-paging",children:"Paged scans with row value constructors"}),`
`,e.jsxs(n.p,{children:["The intended use case for ",e.jsx(n.code,{children:"VARBINARY_ENCODED"}),` in a composite key is keyset pagination
that resumes from the last seen row. Because the type orders correctly, you can drive
this with a row value constructor without any application-level encoding:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" bucket, event_id, payload"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (bucket, event_id) "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (?, ?)"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" bucket, event_id"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"LIMIT"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 100"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(n.p,{children:[`Bind the two parameters to the last row seen by the previous page; Phoenix turns the
predicate into an efficient seek directly to the resume point. See
`,e.jsx(n.a,{href:"/docs/features/paged-queries",children:"Paged Queries"})," for the broader pattern."]}),`
`,e.jsx(n.h2,{id:"varbinary-encoded-sizing",children:"Sizing and storage"}),`
`,e.jsxs(n.p,{children:["The encoded form is at most 1 extra byte per ",e.jsx(n.code,{children:"0x00"}),` byte in the value. For typical
inputs (random IDs, hashes, opaque tokens) the overhead is effectively zero. Plan a bit
of headroom only when values are known to contain many zero bytes (e.g. fixed-width
integers stored raw with a lot of high-order zeros — in which case a fixed-width
`,e.jsx(n.code,{children:"UNSIGNED_*"})," type is usually a better choice anyway)."]}),`
`,e.jsx(n.h2,{id:"varbinary-encoded-migrating",children:"Migrating from VARBINARY"}),`
`,e.jsxs(n.p,{children:["Phoenix does not support changing a column's type in place via ",e.jsx(n.code,{children:"ALTER TABLE"}),`, so
moving an existing `,e.jsx(n.code,{children:"VARBINARY"})," column to ",e.jsx(n.code,{children:"VARBINARY_ENCODED"}),` is a copy-and-switch
operation:`]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`Create a new table with the same schema but with the affected columns declared as
`,e.jsx(n.code,{children:"VARBINARY_ENCODED"}),"."]}),`
`,e.jsxs(n.li,{children:["Backfill: ",e.jsx(n.code,{children:"UPSERT INTO new_table SELECT ... FROM old_table;"}),` (Phoenix re-encodes
the values into the new physical layout for you).`]}),`
`,e.jsx(n.li,{children:"Cut over reads and writes to the new table, then drop the old one."}),`
`]}),`
`,e.jsxs(n.p,{children:[`For a brand-new column that you're adding to an existing table, you can declare it as
`,e.jsx(n.code,{children:"VARBINARY_ENCODED"})," directly with ",e.jsx(n.code,{children:"ALTER TABLE ... ADD ..."}),"."]})]})}function l(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{a as _markdown,l as default,h as extractedReferences,r as frontmatter,o as structuredData,d as toc};
