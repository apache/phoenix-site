import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let t=`\`BSON\` is a native column type for storing schemaless document data alongside your
relational columns. Documents are stored in [Binary JSON](https://bsonspec.org/) — a
compact, length-prefixed format that is cheap to parse server-side and supports the
full set of value types (strings, numbers, dates, binary, booleans, nulls, arrays,
nested objects). Introduced in Phoenix 5.3.0
([PHOENIX-7330](https://issues.apache.org/jira/browse/PHOENIX-7330)).

The point of the type is not just to *hold* documents — it's that Phoenix can read,
filter, and **mutate individual fields** on the server without the client ever
deserializing the whole document.

## When to reach for BSON

| Use case                                                                   | Recommended type                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------- |
| Schema is well-known and stable                                            | Regular relational columns                        |
| A few optional/sparse fields on otherwise relational rows                  | [Dynamic Columns](/docs/features/dynamic-columns) |
| Variable-shape documents per row, server-side reads/filters/updates needed | **\`BSON\`**                                        |
| Variable-shape documents but the server never inspects them                | \`VARCHAR\` (raw JSON) or \`VARBINARY\`               |

Common cases for \`BSON\`:

* DynamoDB-style application objects backed by Phoenix.
* Customer / configuration / preferences documents that vary per row.
* Event payloads where downstream queries need to filter or project specific fields.
* Counters and per-field updates that must be atomic without rewriting the whole row.

## Defining a BSON column

\`\`\`sql
CREATE TABLE customer_profile (
    customer_id VARCHAR NOT NULL PRIMARY KEY,
    profile     BSON
);

UPSERT INTO customer_profile (customer_id, profile) VALUES (
    'C-1001',
    '{ "name": "Jane", "age": 34,
       "addresses": [ {"city": "Seattle", "zip": "98101"} ],
       "preferences": { "theme": "dark", "marketing": false } }'
);
\`\`\`

You may pass a JSON string literal as shown — Phoenix parses and converts it to BSON on
write — or bind a pre-built BSON document via JDBC.

A \`BSON\` column may also serve as a primary-key column. In a composite primary key it
must be the **last** column of the key (so the row-key encoding stays bounded for the
preceding columns).

## Field paths

All three BSON functions address fields with a small path syntax:

* \`name\` — top-level field
* \`addresses[0]\` — first element of an array
* \`addresses[0].city\` — nested field
* \`preferences.theme\` — nested field on a sub-document

## Reading fields: \`BSON_VALUE\`

\`BSON_VALUE(bson_column, field_path, target_type [, default])\` projects a single field
out of a document and returns it as the requested Phoenix data type. Returns \`NULL\` if
the path is missing — or the supplied default if you provide one.

\`\`\`sql
-- Project specific fields out of the document
SELECT customer_id,
       BSON_VALUE(profile, 'name',                'VARCHAR') AS name,
       BSON_VALUE(profile, 'age',                 'INTEGER') AS age,
       BSON_VALUE(profile, 'addresses[0].city',   'VARCHAR') AS city,
       BSON_VALUE(profile, 'preferences.theme',   'VARCHAR', 'light') AS theme
FROM customer_profile;

-- Filter on a single field
SELECT customer_id
FROM customer_profile
WHERE BSON_VALUE(profile, 'age', 'INTEGER') >= 18;
\`\`\`

\`BSON_VALUE\` can also return a sub-document (use \`'BSON'\` as the target type) and
return raw binary fields as \`VARBINARY_ENCODED\`. A companion function
\`BSON_VALUE_TYPE(bson_column, field_path)\` returns the BSON type of the field as a
string (e.g. \`'STRING'\`, \`'INT32'\`, \`'DOCUMENT'\`, \`'ARRAY'\`).

## Filtering rows: \`BSON_CONDITION_EXPRESSION\`

\`BSON_CONDITION_EXPRESSION(bson_column, expression)\` evaluates a boolean expression
over a document and returns \`TRUE\` or \`FALSE\`. Use it in a \`WHERE\` clause when you
want to filter on multiple document fields at once, or test for the existence/shape
of fields, without the verbosity of stacking multiple \`BSON_VALUE\` calls.

The expression language is intentionally small and DynamoDB-flavored:

* Comparisons: \`=\`, \`<>\` (or \`!=\`), \`<\`, \`<=\`, \`>\`, \`>=\`
* Boolean composition: \`AND\`, \`OR\`, \`NOT\`, parentheses
* Ranges and sets: \`BETWEEN ... AND ...\`, \`IN (...)\`, \`IS NULL\`
* Field presence: \`field_exists(name)\`, \`field_not_exists(name)\`
* String/array helpers: \`begins_with(field, value)\`, \`contains(field, value)\`
* Type and size: \`field_type(field, 'STRING' | 'NUMBER' | ...)\`, \`size(field)\`

\`\`\`sql
SELECT customer_id
FROM customer_profile
WHERE BSON_CONDITION_EXPRESSION(
    profile,
    'age >= 18
     AND begins_with(name, ''J'')
     AND field_exists(preferences.theme)'
);
\`\`\`

The expression is evaluated server-side, so rows are filtered before they cross the
network.

## Atomically updating fields: \`BSON_UPDATE_EXPRESSION\`

\`BSON_UPDATE_EXPRESSION(bson_column, expression)\` returns a new BSON document with
the requested mutations applied. The intended use is inside an
[atomic upsert](/docs/features/atomic-upsert) so an entire family of per-field updates
runs **under the row lock** in a single round-trip:

\`\`\`sql
UPSERT INTO customer_profile (customer_id, profile)
VALUES ('C-1001', '{}')
ON DUPLICATE KEY UPDATE
    profile = BSON_UPDATE_EXPRESSION(
        profile,
        'SET preferences.theme = ''dark'',
             age = if_not_exists(age, 0) + 1
         REMOVE legacy_flag'
    );
\`\`\`

Supported update verbs follow the DynamoDB convention:

* \`SET path = value\` — write a field (or nested path).
* \`REMOVE path[, path ...]\` — delete a field.
* \`ADD path number\` — atomic numeric increment / decrement on a single field.
* \`DELETE path value\` — remove a value from an array/set field.
* \`if_not_exists(path, default)\` — read-then-write helper for conditional defaults.

Because the update runs on the server under the row lock, this is the right primitive
for things like per-document counters, idempotent flag flips, and DynamoDB-style
conditional writes (combine with \`BSON_CONDITION_EXPRESSION\` in a \`WHERE\` clause).

## Indexing individual fields

To make a BSON-field filter fast, create a **functional index** on the projection:

\`\`\`sql
CREATE INDEX idx_profile_email
    ON customer_profile (BSON_VALUE(profile, 'email', 'VARCHAR'));

-- Phoenix can use the index for this query
SELECT customer_id
FROM customer_profile
WHERE BSON_VALUE(profile, 'email', 'VARCHAR') = 'jane@example.com';
\`\`\`

Combine with \`INCLUDE (...)\` to cover other projected columns, or rely on
[uncovered indexes](/docs/features/secondary-indexes#uncovered-indexes) when you only
filter on the indexed field.

## End-to-end example

Putting the pieces together — a customer-preferences scenario backed entirely by a
single BSON column:

\`\`\`sql
-- 1. Schema
CREATE TABLE customer_profile (
    customer_id VARCHAR NOT NULL PRIMARY KEY,
    profile     BSON
);

CREATE INDEX idx_profile_email
    ON customer_profile (BSON_VALUE(profile, 'email', 'VARCHAR'));

-- 2. Insert / replace
UPSERT INTO customer_profile VALUES (
    'C-1001',
    '{"email":"jane@example.com","age":34,"preferences":{"theme":"light"}}'
);

-- 3. Lookup by field via the functional index
SELECT customer_id
FROM customer_profile
WHERE BSON_VALUE(profile, 'email', 'VARCHAR') = 'jane@example.com';

-- 4. Filter on multiple fields
SELECT customer_id
FROM customer_profile
WHERE BSON_CONDITION_EXPRESSION(
    profile,
    'age >= 18 AND field_exists(preferences.theme)'
);

-- 5. Atomic per-field update under the row lock
UPSERT INTO customer_profile (customer_id, profile)
VALUES ('C-1001', '{}')
ON DUPLICATE KEY UPDATE
    profile = BSON_UPDATE_EXPRESSION(
        profile,
        'SET preferences.theme = ''dark'', login_count = if_not_exists(login_count, 0) + 1'
    );
\`\`\`

## Limitations

* A \`BSON\` column in a composite primary key must be the **last** PK column.
* The condition/update expression language is intentionally a small document-focused
  DSL, not full SQL. Combine it with regular SQL predicates on relational columns when
  you need joins, aggregations, or expressions across multiple rows.
* Functional indexes on \`BSON_VALUE(...)\` are scoped to one specific path/type pair —
  you'll typically want an index per hot field rather than a generic "BSON index".
`,h={title:"Document Data: BSON",description:"Store, query, filter, and atomically update Binary JSON (BSON) documents inside a Phoenix table — without round-tripping the document to the client."},a=[{href:"https://bsonspec.org/"},{href:"https://issues.apache.org/jira/browse/PHOENIX-7330"},{href:"/docs/features/dynamic-columns"},{href:"/docs/features/atomic-upsert"},{href:"/docs/features/secondary-indexes#uncovered-indexes"}],r={contents:[{heading:void 0,content:`BSON is a native column type for storing schemaless document data alongside your
relational columns. Documents are stored in Binary JSON — a
compact, length-prefixed format that is cheap to parse server-side and supports the
full set of value types (strings, numbers, dates, binary, booleans, nulls, arrays,
nested objects). Introduced in Phoenix 5.3.0
(PHOENIX-7330).`},{heading:void 0,content:`The point of the type is not just to hold documents — it's that Phoenix can read,
filter, and mutate individual fields on the server without the client ever
deserializing the whole document.`},{heading:"bson-when",content:"Use case"},{heading:"bson-when",content:"Recommended type"},{heading:"bson-when",content:"Schema is well-known and stable"},{heading:"bson-when",content:"Regular relational columns"},{heading:"bson-when",content:"A few optional/sparse fields on otherwise relational rows"},{heading:"bson-when",content:"Dynamic Columns"},{heading:"bson-when",content:"Variable-shape documents per row, server-side reads/filters/updates needed"},{heading:"bson-when",content:"BSON"},{heading:"bson-when",content:"Variable-shape documents but the server never inspects them"},{heading:"bson-when",content:"VARCHAR (raw JSON) or VARBINARY"},{heading:"bson-when",content:"Common cases for BSON:"},{heading:"bson-when",content:"DynamoDB-style application objects backed by Phoenix."},{heading:"bson-when",content:"Customer / configuration / preferences documents that vary per row."},{heading:"bson-when",content:"Event payloads where downstream queries need to filter or project specific fields."},{heading:"bson-when",content:"Counters and per-field updates that must be atomic without rewriting the whole row."},{heading:"bson-defining",content:`You may pass a JSON string literal as shown — Phoenix parses and converts it to BSON on
write — or bind a pre-built BSON document via JDBC.`},{heading:"bson-defining",content:`A BSON column may also serve as a primary-key column. In a composite primary key it
must be the last column of the key (so the row-key encoding stays bounded for the
preceding columns).`},{heading:"bson-paths",content:"All three BSON functions address fields with a small path syntax:"},{heading:"bson-paths",content:"name — top-level field"},{heading:"bson-paths",content:"addresses[0] — first element of an array"},{heading:"bson-paths",content:"addresses[0].city — nested field"},{heading:"bson-paths",content:"preferences.theme — nested field on a sub-document"},{heading:"bson-value",content:`BSON_VALUE(bson_column, field_path, target_type [, default]) projects a single field
out of a document and returns it as the requested Phoenix data type. Returns NULL if
the path is missing — or the supplied default if you provide one.`},{heading:"bson-value",content:`BSON_VALUE can also return a sub-document (use 'BSON' as the target type) and
return raw binary fields as VARBINARY_ENCODED. A companion function
BSON_VALUE_TYPE(bson_column, field_path) returns the BSON type of the field as a
string (e.g. 'STRING', 'INT32', 'DOCUMENT', 'ARRAY').`},{heading:"bson-condition-expression",content:`BSON_CONDITION_EXPRESSION(bson_column, expression) evaluates a boolean expression
over a document and returns TRUE or FALSE. Use it in a WHERE clause when you
want to filter on multiple document fields at once, or test for the existence/shape
of fields, without the verbosity of stacking multiple BSON_VALUE calls.`},{heading:"bson-condition-expression",content:"The expression language is intentionally small and DynamoDB-flavored:"},{heading:"bson-condition-expression",content:"Comparisons: =, <> (or !=), <, <=, >, >="},{heading:"bson-condition-expression",content:"Boolean composition: AND, OR, NOT, parentheses"},{heading:"bson-condition-expression",content:"Ranges and sets: BETWEEN ... AND ..., IN (...), IS NULL"},{heading:"bson-condition-expression",content:"Field presence: field_exists(name), field_not_exists(name)"},{heading:"bson-condition-expression",content:"String/array helpers: begins_with(field, value), contains(field, value)"},{heading:"bson-condition-expression",content:"Type and size: field_type(field, 'STRING' | 'NUMBER' | ...), size(field)"},{heading:"bson-condition-expression",content:`The expression is evaluated server-side, so rows are filtered before they cross the
network.`},{heading:"bson-update-expression",content:`BSON_UPDATE_EXPRESSION(bson_column, expression) returns a new BSON document with
the requested mutations applied. The intended use is inside an
atomic upsert so an entire family of per-field updates
runs under the row lock in a single round-trip:`},{heading:"bson-update-expression",content:"Supported update verbs follow the DynamoDB convention:"},{heading:"bson-update-expression",content:"SET path = value — write a field (or nested path)."},{heading:"bson-update-expression",content:"REMOVE path[, path ...] — delete a field."},{heading:"bson-update-expression",content:"ADD path number — atomic numeric increment / decrement on a single field."},{heading:"bson-update-expression",content:"DELETE path value — remove a value from an array/set field."},{heading:"bson-update-expression",content:"if_not_exists(path, default) — read-then-write helper for conditional defaults."},{heading:"bson-update-expression",content:`Because the update runs on the server under the row lock, this is the right primitive
for things like per-document counters, idempotent flag flips, and DynamoDB-style
conditional writes (combine with BSON_CONDITION_EXPRESSION in a WHERE clause).`},{heading:"bson-indexing",content:"To make a BSON-field filter fast, create a functional index on the projection:"},{heading:"bson-indexing",content:`Combine with INCLUDE (...) to cover other projected columns, or rely on
uncovered indexes when you only
filter on the indexed field.`},{heading:"bson-end-to-end",content:`Putting the pieces together — a customer-preferences scenario backed entirely by a
single BSON column:`},{heading:"bson-limitations",content:"A BSON column in a composite primary key must be the last PK column."},{heading:"bson-limitations",content:`The condition/update expression language is intentionally a small document-focused
DSL, not full SQL. Combine it with regular SQL predicates on relational columns when
you need joins, aggregations, or expressions across multiple rows.`},{heading:"bson-limitations",content:`Functional indexes on BSON_VALUE(...) are scoped to one specific path/type pair —
you'll typically want an index per hot field rather than a generic "BSON index".`}],headings:[{id:"bson-when",content:"When to reach for BSON"},{id:"bson-defining",content:"Defining a BSON column"},{id:"bson-paths",content:"Field paths"},{id:"bson-value",content:"Reading fields: BSON_VALUE"},{id:"bson-condition-expression",content:"Filtering rows: BSON_CONDITION_EXPRESSION"},{id:"bson-update-expression",content:"Atomically updating fields: BSON_UPDATE_EXPRESSION"},{id:"bson-indexing",content:"Indexing individual fields"},{id:"bson-end-to-end",content:"End-to-end example"},{id:"bson-limitations",content:"Limitations"}]};const d=[{depth:2,url:"#bson-when",title:e.jsx(e.Fragment,{children:"When to reach for BSON"})},{depth:2,url:"#bson-defining",title:e.jsx(e.Fragment,{children:"Defining a BSON column"})},{depth:2,url:"#bson-paths",title:e.jsx(e.Fragment,{children:"Field paths"})},{depth:2,url:"#bson-value",title:e.jsxs(e.Fragment,{children:["Reading fields: ",e.jsx("code",{children:"BSON_VALUE"})]})},{depth:2,url:"#bson-condition-expression",title:e.jsxs(e.Fragment,{children:["Filtering rows: ",e.jsx("code",{children:"BSON_CONDITION_EXPRESSION"})]})},{depth:2,url:"#bson-update-expression",title:e.jsxs(e.Fragment,{children:["Atomically updating fields: ",e.jsx("code",{children:"BSON_UPDATE_EXPRESSION"})]})},{depth:2,url:"#bson-indexing",title:e.jsx(e.Fragment,{children:"Indexing individual fields"})},{depth:2,url:"#bson-end-to-end",title:e.jsx(e.Fragment,{children:"End-to-end example"})},{depth:2,url:"#bson-limitations",title:e.jsx(e.Fragment,{children:"Limitations"})}];function n(s){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:[e.jsx(i.code,{children:"BSON"}),` is a native column type for storing schemaless document data alongside your
relational columns. Documents are stored in `,e.jsx(i.a,{href:"https://bsonspec.org/",children:"Binary JSON"}),` — a
compact, length-prefixed format that is cheap to parse server-side and supports the
full set of value types (strings, numbers, dates, binary, booleans, nulls, arrays,
nested objects). Introduced in Phoenix 5.3.0
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7330",children:"PHOENIX-7330"}),")."]}),`
`,e.jsxs(i.p,{children:["The point of the type is not just to ",e.jsx(i.em,{children:"hold"}),` documents — it's that Phoenix can read,
filter, and `,e.jsx(i.strong,{children:"mutate individual fields"}),` on the server without the client ever
deserializing the whole document.`]}),`
`,e.jsx(i.h2,{id:"bson-when",children:"When to reach for BSON"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Use case"}),e.jsx(i.th,{children:"Recommended type"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Schema is well-known and stable"}),e.jsx(i.td,{children:"Regular relational columns"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"A few optional/sparse fields on otherwise relational rows"}),e.jsx(i.td,{children:e.jsx(i.a,{href:"/docs/features/dynamic-columns",children:"Dynamic Columns"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Variable-shape documents per row, server-side reads/filters/updates needed"}),e.jsx(i.td,{children:e.jsx(i.strong,{children:e.jsx(i.code,{children:"BSON"})})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Variable-shape documents but the server never inspects them"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"VARCHAR"})," (raw JSON) or ",e.jsx(i.code,{children:"VARBINARY"})]})]})]})]}),`
`,e.jsxs(i.p,{children:["Common cases for ",e.jsx(i.code,{children:"BSON"}),":"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"DynamoDB-style application objects backed by Phoenix."}),`
`,e.jsx(i.li,{children:"Customer / configuration / preferences documents that vary per row."}),`
`,e.jsx(i.li,{children:"Event payloads where downstream queries need to filter or project specific fields."}),`
`,e.jsx(i.li,{children:"Counters and per-field updates that must be atomic without rewriting the whole row."}),`
`]}),`
`,e.jsx(i.h2,{id:"bson-defining",children:"Defining a BSON column"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" customer_profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    customer_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"     BSON"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile (customer_id, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    'C-1001'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`    '{ "name": "Jane", "age": 34,`})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'       "addresses": [ {"city": "Seattle", "zip": "98101"} ],'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`       "preferences": { "theme": "dark", "marketing": false } }'`})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsx(i.p,{children:`You may pass a JSON string literal as shown — Phoenix parses and converts it to BSON on
write — or bind a pre-built BSON document via JDBC.`}),`
`,e.jsxs(i.p,{children:["A ",e.jsx(i.code,{children:"BSON"}),` column may also serve as a primary-key column. In a composite primary key it
must be the `,e.jsx(i.strong,{children:"last"}),` column of the key (so the row-key encoding stays bounded for the
preceding columns).`]}),`
`,e.jsx(i.h2,{id:"bson-paths",children:"Field paths"}),`
`,e.jsx(i.p,{children:"All three BSON functions address fields with a small path syntax:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"name"})," — top-level field"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"addresses[0]"})," — first element of an array"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"addresses[0].city"})," — nested field"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"preferences.theme"})," — nested field on a sub-document"]}),`
`]}),`
`,e.jsxs(i.h2,{id:"bson-value",children:["Reading fields: ",e.jsx(i.code,{children:"BSON_VALUE"})]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"BSON_VALUE(bson_column, field_path, target_type [, default])"}),` projects a single field
out of a document and returns it as the requested Phoenix data type. Returns `,e.jsx(i.code,{children:"NULL"}),` if
the path is missing — or the supplied default if you provide one.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Project specific fields out of the document"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'name'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",                "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'age'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",                 "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'INTEGER'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" age,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'addresses[0].city'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",   "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" city,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"       BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'preferences.theme'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",   "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'light'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" theme"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile;"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Filter on a single field"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'age'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'INTEGER'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 18"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"BSON_VALUE"})," can also return a sub-document (use ",e.jsx(i.code,{children:"'BSON'"}),` as the target type) and
return raw binary fields as `,e.jsx(i.code,{children:"VARBINARY_ENCODED"}),`. A companion function
`,e.jsx(i.code,{children:"BSON_VALUE_TYPE(bson_column, field_path)"}),` returns the BSON type of the field as a
string (e.g. `,e.jsx(i.code,{children:"'STRING'"}),", ",e.jsx(i.code,{children:"'INT32'"}),", ",e.jsx(i.code,{children:"'DOCUMENT'"}),", ",e.jsx(i.code,{children:"'ARRAY'"}),")."]}),`
`,e.jsxs(i.h2,{id:"bson-condition-expression",children:["Filtering rows: ",e.jsx(i.code,{children:"BSON_CONDITION_EXPRESSION"})]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"BSON_CONDITION_EXPRESSION(bson_column, expression)"}),` evaluates a boolean expression
over a document and returns `,e.jsx(i.code,{children:"TRUE"})," or ",e.jsx(i.code,{children:"FALSE"}),". Use it in a ",e.jsx(i.code,{children:"WHERE"}),` clause when you
want to filter on multiple document fields at once, or test for the existence/shape
of fields, without the verbosity of stacking multiple `,e.jsx(i.code,{children:"BSON_VALUE"})," calls."]}),`
`,e.jsx(i.p,{children:"The expression language is intentionally small and DynamoDB-flavored:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Comparisons: ",e.jsx(i.code,{children:"="}),", ",e.jsx(i.code,{children:"<>"})," (or ",e.jsx(i.code,{children:"!="}),"), ",e.jsx(i.code,{children:"<"}),", ",e.jsx(i.code,{children:"<="}),", ",e.jsx(i.code,{children:">"}),", ",e.jsx(i.code,{children:">="})]}),`
`,e.jsxs(i.li,{children:["Boolean composition: ",e.jsx(i.code,{children:"AND"}),", ",e.jsx(i.code,{children:"OR"}),", ",e.jsx(i.code,{children:"NOT"}),", parentheses"]}),`
`,e.jsxs(i.li,{children:["Ranges and sets: ",e.jsx(i.code,{children:"BETWEEN ... AND ..."}),", ",e.jsx(i.code,{children:"IN (...)"}),", ",e.jsx(i.code,{children:"IS NULL"})]}),`
`,e.jsxs(i.li,{children:["Field presence: ",e.jsx(i.code,{children:"field_exists(name)"}),", ",e.jsx(i.code,{children:"field_not_exists(name)"})]}),`
`,e.jsxs(i.li,{children:["String/array helpers: ",e.jsx(i.code,{children:"begins_with(field, value)"}),", ",e.jsx(i.code,{children:"contains(field, value)"})]}),`
`,e.jsxs(i.li,{children:["Type and size: ",e.jsx(i.code,{children:"field_type(field, 'STRING' | 'NUMBER' | ...)"}),", ",e.jsx(i.code,{children:"size(field)"})]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_CONDITION_EXPRESSION("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    'age >= 18"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     AND begins_with(name, ''J'')"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"     AND field_exists(preferences.theme)'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,e.jsx(i.p,{children:`The expression is evaluated server-side, so rows are filtered before they cross the
network.`}),`
`,e.jsxs(i.h2,{id:"bson-update-expression",children:["Atomically updating fields: ",e.jsx(i.code,{children:"BSON_UPDATE_EXPRESSION"})]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"BSON_UPDATE_EXPRESSION(bson_column, expression)"}),` returns a new BSON document with
the requested mutations applied. The intended use is inside an
`,e.jsx(i.a,{href:"/docs/features/atomic-upsert",children:"atomic upsert"}),` so an entire family of per-field updates
runs `,e.jsx(i.strong,{children:"under the row lock"})," in a single round-trip:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile (customer_id, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'C-1001'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'{}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" UPDATE"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_UPDATE_EXPRESSION("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"        'SET preferences.theme = ''dark'',"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"             age = if_not_exists(age, 0) + 1"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"         REMOVE legacy_flag'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    );"})})]})})}),`
`,e.jsx(i.p,{children:"Supported update verbs follow the DynamoDB convention:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"SET path = value"})," — write a field (or nested path)."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"REMOVE path[, path ...]"})," — delete a field."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"ADD path number"})," — atomic numeric increment / decrement on a single field."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"DELETE path value"})," — remove a value from an array/set field."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"if_not_exists(path, default)"})," — read-then-write helper for conditional defaults."]}),`
`]}),`
`,e.jsxs(i.p,{children:[`Because the update runs on the server under the row lock, this is the right primitive
for things like per-document counters, idempotent flag flips, and DynamoDB-style
conditional writes (combine with `,e.jsx(i.code,{children:"BSON_CONDITION_EXPRESSION"})," in a ",e.jsx(i.code,{children:"WHERE"})," clause)."]}),`
`,e.jsx(i.h2,{id:"bson-indexing",children:"Indexing individual fields"}),`
`,e.jsxs(i.p,{children:["To make a BSON-field filter fast, create a ",e.jsx(i.strong,{children:"functional index"})," on the projection:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idx_profile_email"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile (BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'email'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Phoenix can use the index for this query"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'email'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'jane@example.com'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(i.p,{children:["Combine with ",e.jsx(i.code,{children:"INCLUDE (...)"}),` to cover other projected columns, or rely on
`,e.jsx(i.a,{href:"/docs/features/secondary-indexes#uncovered-indexes",children:"uncovered indexes"}),` when you only
filter on the indexed field.`]}),`
`,e.jsx(i.h2,{id:"bson-end-to-end",children:"End-to-end example"}),`
`,e.jsx(i.p,{children:`Putting the pieces together — a customer-preferences scenario backed entirely by a
single BSON column:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 1. Schema"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" customer_profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    customer_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"     BSON"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" INDEX"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idx_profile_email"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile (BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'email'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 2. Insert / replace"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    'C-1001'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`    '{"email":"jane@example.com","age":34,"preferences":{"theme":"light"}}'`})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 3. Lookup by field via the functional index"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_VALUE("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'email'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'VARCHAR'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'jane@example.com'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 4. Filter on multiple fields"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_id"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_CONDITION_EXPRESSION("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"    'age >= 18 AND field_exists(preferences.theme)'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 5. Atomic per-field update under the row lock"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UPSERT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" customer_profile (customer_id, "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VALUES"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'C-1001'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'{}'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ON"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" DUPLICATE "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" UPDATE"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    profile"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" BSON_UPDATE_EXPRESSION("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        profile"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"        'SET preferences.theme = ''dark'', login_count = if_not_exists(login_count, 0) + 1'"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    );"})})]})})}),`
`,e.jsx(i.h2,{id:"bson-limitations",children:"Limitations"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["A ",e.jsx(i.code,{children:"BSON"})," column in a composite primary key must be the ",e.jsx(i.strong,{children:"last"})," PK column."]}),`
`,e.jsx(i.li,{children:`The condition/update expression language is intentionally a small document-focused
DSL, not full SQL. Combine it with regular SQL predicates on relational columns when
you need joins, aggregations, or expressions across multiple rows.`}),`
`,e.jsxs(i.li,{children:["Functional indexes on ",e.jsx(i.code,{children:"BSON_VALUE(...)"}),` are scoped to one specific path/type pair —
you'll typically want an index per hot field rather than a generic "BSON index".`]}),`
`]})]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{t as _markdown,o as default,a as extractedReferences,h as frontmatter,r as structuredData,d as toc};
