import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let a=`A Phoenix [view](/docs/features/views) is a logical table that shares a single physical
HBase table with its sibling views. **View TTL** lets each view define its **own** data
retention policy on top of that shared table. Rows that have outlived their view's TTL
disappear from queries against that view and are eventually removed in the background —
without affecting any other view (or the base table). Available in Phoenix 5.3.0
([PHOENIX-6978](https://issues.apache.org/jira/browse/PHOENIX-6978)).

## When to use it

The classic case is **multi-tenant retention**: one shared base table, many tenant
views, each tenant gets a different retention window driven by its plan, region, or
contract.

| Scenario                                                                           | View TTL fit                                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Per-tenant retention windows on one shared base table                              | Yes                                                            |
| Per-use-case retention (e.g., "raw events 7 days, audit 1 year")                   | Yes                                                            |
| Per-tenant **extra columns** on top of the shared base table (each tenant's view)  | Yes — views can extend the base schema, View TTL still applies |
| Same retention for the entire physical table                                       | Use a regular table-level \`TTL\` instead                        |
| Retention based on row content rather than age                                     | Use [Conditional TTL](/docs/features/conditional-ttl)          |
| Different **base-table** schemas per tenant (different PK, different core columns) | Use separate tables — View TTL doesn't apply                   |

If the retention rule is the same for everyone reading the table, set \`TTL\` on the
table itself; you don't need View TTL.

## Enable the feature

View TTL is **off by default**. Enable it cluster-wide by setting this server-side
property and restarting region servers:

\`\`\`text
phoenix.view.ttl.enabled = true
\`\`\`

While the feature is disabled, attempts to declare \`TTL\` on a view return a SQL error
explaining the property must be turned on.

## Defining a TTL on a view

Set \`TTL\` (in seconds) as a property on \`CREATE VIEW\`. Different views over the same
base table can use different values:

\`\`\`sql
CREATE TABLE events_base (
    tenant_id VARCHAR NOT NULL,
    bucket    VARCHAR NOT NULL,
    event_id  VARCHAR NOT NULL,
    payload   VARCHAR,
    CONSTRAINT pk PRIMARY KEY (tenant_id, bucket, event_id)
) MULTI_TENANT = true;

-- 7-day retention for tenant 'acme'
CREATE VIEW acme_events AS
    SELECT * FROM events_base WHERE tenant_id = 'acme'
TTL = 604800;

-- 30-day retention on the same base table for tenant 'globex'
CREATE VIEW globex_events AS
    SELECT * FROM events_base WHERE tenant_id = 'globex'
TTL = 2592000;
\`\`\`

Adjust the value later, or remove the TTL entirely:

\`\`\`sql
ALTER VIEW acme_events SET TTL = 1209600;   -- bump to 14 days
ALTER VIEW acme_events SET TTL = NONE;       -- remove TTL (rows kept indefinitely)
\`\`\`

## Inheritance and child views

A child view inherits its parent view's TTL. **Child views cannot override** the
parent's value — the TTL belongs to the view that owns it. If you need different
retention windows for two slices of the same parent, create them as siblings under a
common parent rather than nesting.

In multi-tenant mode, each tenant connection sees its own view; setting TTL on a
tenant view applies retention to that tenant's slice only.

## How it actually expires data

Two things happen to expired rows:

1. **Read-time filter (immediate).** Whenever a query goes through a view, Phoenix
   filters out rows whose age exceeds the view's TTL — so as soon as a row is "too
   old" for a view, it disappears from queries against that view, even before
   physical deletion.
2. **Phoenix compaction (eventual).** Expired rows are physically removed by
   Phoenix's compaction during HBase region compactions. This reclaims disk and
   stops the rows showing up via lower-level scans. There is no separate cleanup
   job — physical removal happens whenever the underlying HBase regions compact.

## Combining with Conditional TTL

A view's \`TTL\` can also be a SQL boolean expression instead of a number, in which
case it follows the [Conditional TTL](/docs/features/conditional-ttl) rules. This
unlocks expiry based on row content (e.g. *expire 30 days after \`STATUS\` becomes
\`'CLOSED'\`*), and the strict-vs-relaxed enforcement modes documented there.
`,h={title:"View TTL",description:"Per-view retention on top of a shared base table — different views can age data out on different schedules without splitting the table."},l=[{href:"/docs/features/views"},{href:"https://issues.apache.org/jira/browse/PHOENIX-6978"},{href:"/docs/features/conditional-ttl"},{href:"/docs/features/conditional-ttl"}],r={contents:[{heading:void 0,content:`A Phoenix view is a logical table that shares a single physical
HBase table with its sibling views. View TTL lets each view define its own data
retention policy on top of that shared table. Rows that have outlived their view's TTL
disappear from queries against that view and are eventually removed in the background —
without affecting any other view (or the base table). Available in Phoenix 5.3.0
(PHOENIX-6978).`},{heading:"view-ttl-when",content:`The classic case is multi-tenant retention: one shared base table, many tenant
views, each tenant gets a different retention window driven by its plan, region, or
contract.`},{heading:"view-ttl-when",content:"Scenario"},{heading:"view-ttl-when",content:"View TTL fit"},{heading:"view-ttl-when",content:"Per-tenant retention windows on one shared base table"},{heading:"view-ttl-when",content:"Yes"},{heading:"view-ttl-when",content:'Per-use-case retention (e.g., "raw events 7 days, audit 1 year")'},{heading:"view-ttl-when",content:"Yes"},{heading:"view-ttl-when",content:"Per-tenant extra columns on top of the shared base table (each tenant's view)"},{heading:"view-ttl-when",content:"Yes — views can extend the base schema, View TTL still applies"},{heading:"view-ttl-when",content:"Same retention for the entire physical table"},{heading:"view-ttl-when",content:"Use a regular table-level TTL instead"},{heading:"view-ttl-when",content:"Retention based on row content rather than age"},{heading:"view-ttl-when",content:"Use Conditional TTL"},{heading:"view-ttl-when",content:"Different base-table schemas per tenant (different PK, different core columns)"},{heading:"view-ttl-when",content:"Use separate tables — View TTL doesn't apply"},{heading:"view-ttl-when",content:`If the retention rule is the same for everyone reading the table, set TTL on the
table itself; you don't need View TTL.`},{heading:"view-ttl-enable",content:`View TTL is off by default. Enable it cluster-wide by setting this server-side
property and restarting region servers:`},{heading:"view-ttl-enable",content:`While the feature is disabled, attempts to declare TTL on a view return a SQL error
explaining the property must be turned on.`},{heading:"view-ttl-define",content:`Set TTL (in seconds) as a property on CREATE VIEW. Different views over the same
base table can use different values:`},{heading:"view-ttl-define",content:"Adjust the value later, or remove the TTL entirely:"},{heading:"view-ttl-inheritance",content:`A child view inherits its parent view's TTL. Child views cannot override the
parent's value — the TTL belongs to the view that owns it. If you need different
retention windows for two slices of the same parent, create them as siblings under a
common parent rather than nesting.`},{heading:"view-ttl-inheritance",content:`In multi-tenant mode, each tenant connection sees its own view; setting TTL on a
tenant view applies retention to that tenant's slice only.`},{heading:"view-ttl-how",content:"Two things happen to expired rows:"},{heading:"view-ttl-how",content:`Read-time filter (immediate). Whenever a query goes through a view, Phoenix
filters out rows whose age exceeds the view's TTL — so as soon as a row is "too
old" for a view, it disappears from queries against that view, even before
physical deletion.`},{heading:"view-ttl-how",content:`Phoenix compaction (eventual). Expired rows are physically removed by
Phoenix's compaction during HBase region compactions. This reclaims disk and
stops the rows showing up via lower-level scans. There is no separate cleanup
job — physical removal happens whenever the underlying HBase regions compact.`},{heading:"view-ttl-conditional",content:`A view's TTL can also be a SQL boolean expression instead of a number, in which
case it follows the Conditional TTL rules. This
unlocks expiry based on row content (e.g. expire 30 days after STATUS becomes
'CLOSED'), and the strict-vs-relaxed enforcement modes documented there.`}],headings:[{id:"view-ttl-when",content:"When to use it"},{id:"view-ttl-enable",content:"Enable the feature"},{id:"view-ttl-define",content:"Defining a TTL on a view"},{id:"view-ttl-inheritance",content:"Inheritance and child views"},{id:"view-ttl-how",content:"How it actually expires data"},{id:"view-ttl-conditional",content:"Combining with Conditional TTL"}]};const d=[{depth:2,url:"#view-ttl-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#view-ttl-enable",title:e.jsx(e.Fragment,{children:"Enable the feature"})},{depth:2,url:"#view-ttl-define",title:e.jsx(e.Fragment,{children:"Defining a TTL on a view"})},{depth:2,url:"#view-ttl-inheritance",title:e.jsx(e.Fragment,{children:"Inheritance and child views"})},{depth:2,url:"#view-ttl-how",title:e.jsx(e.Fragment,{children:"How it actually expires data"})},{depth:2,url:"#view-ttl-conditional",title:e.jsx(e.Fragment,{children:"Combining with Conditional TTL"})}];function t(n){const i={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["A Phoenix ",e.jsx(i.a,{href:"/docs/features/views",children:"view"}),` is a logical table that shares a single physical
HBase table with its sibling views. `,e.jsx(i.strong,{children:"View TTL"})," lets each view define its ",e.jsx(i.strong,{children:"own"}),` data
retention policy on top of that shared table. Rows that have outlived their view's TTL
disappear from queries against that view and are eventually removed in the background —
without affecting any other view (or the base table). Available in Phoenix 5.3.0
(`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-6978",children:"PHOENIX-6978"}),")."]}),`
`,e.jsx(i.h2,{id:"view-ttl-when",children:"When to use it"}),`
`,e.jsxs(i.p,{children:["The classic case is ",e.jsx(i.strong,{children:"multi-tenant retention"}),`: one shared base table, many tenant
views, each tenant gets a different retention window driven by its plan, region, or
contract.`]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Scenario"}),e.jsx(i.th,{children:"View TTL fit"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Per-tenant retention windows on one shared base table"}),e.jsx(i.td,{children:"Yes"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:'Per-use-case retention (e.g., "raw events 7 days, audit 1 year")'}),e.jsx(i.td,{children:"Yes"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["Per-tenant ",e.jsx(i.strong,{children:"extra columns"})," on top of the shared base table (each tenant's view)"]}),e.jsx(i.td,{children:"Yes — views can extend the base schema, View TTL still applies"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Same retention for the entire physical table"}),e.jsxs(i.td,{children:["Use a regular table-level ",e.jsx(i.code,{children:"TTL"})," instead"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Retention based on row content rather than age"}),e.jsxs(i.td,{children:["Use ",e.jsx(i.a,{href:"/docs/features/conditional-ttl",children:"Conditional TTL"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["Different ",e.jsx(i.strong,{children:"base-table"})," schemas per tenant (different PK, different core columns)"]}),e.jsx(i.td,{children:"Use separate tables — View TTL doesn't apply"})]})]})]}),`
`,e.jsxs(i.p,{children:["If the retention rule is the same for everyone reading the table, set ",e.jsx(i.code,{children:"TTL"}),` on the
table itself; you don't need View TTL.`]}),`
`,e.jsx(i.h2,{id:"view-ttl-enable",children:"Enable the feature"}),`
`,e.jsxs(i.p,{children:["View TTL is ",e.jsx(i.strong,{children:"off by default"}),`. Enable it cluster-wide by setting this server-side
property and restarting region servers:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"phoenix.view.ttl.enabled = true"})})})})}),`
`,e.jsxs(i.p,{children:["While the feature is disabled, attempts to declare ",e.jsx(i.code,{children:"TTL"}),` on a view return a SQL error
explaining the property must be turned on.`]}),`
`,e.jsx(i.h2,{id:"view-ttl-define",children:"Defining a TTL on a view"}),`
`,e.jsxs(i.p,{children:["Set ",e.jsx(i.code,{children:"TTL"})," (in seconds) as a property on ",e.jsx(i.code,{children:"CREATE VIEW"}),`. Different views over the same
base table can use different values:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" events_base"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    tenant_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    bucket    "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    event_id  "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    payload   "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    CONSTRAINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (tenant_id, bucket, event_id)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") MULTI_TENANT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" true;"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 7-day retention for tenant 'acme'"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" acme_events"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" AS"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" *"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events_base "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" tenant_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'acme'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 604800"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 30-day retention on the same base table for tenant 'globex'"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" globex_events"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" AS"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" *"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events_base "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" tenant_id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'globex'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2592000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.p,{children:"Adjust the value later, or remove the TTL entirely:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" acme_events "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1209600"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";   "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- bump to 14 days"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" VIEW"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" acme_events "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NONE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";       "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- remove TTL (rows kept indefinitely)"})]})]})})}),`
`,e.jsx(i.h2,{id:"view-ttl-inheritance",children:"Inheritance and child views"}),`
`,e.jsxs(i.p,{children:["A child view inherits its parent view's TTL. ",e.jsx(i.strong,{children:"Child views cannot override"}),` the
parent's value — the TTL belongs to the view that owns it. If you need different
retention windows for two slices of the same parent, create them as siblings under a
common parent rather than nesting.`]}),`
`,e.jsx(i.p,{children:`In multi-tenant mode, each tenant connection sees its own view; setting TTL on a
tenant view applies retention to that tenant's slice only.`}),`
`,e.jsx(i.h2,{id:"view-ttl-how",children:"How it actually expires data"}),`
`,e.jsx(i.p,{children:"Two things happen to expired rows:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Read-time filter (immediate)."}),` Whenever a query goes through a view, Phoenix
filters out rows whose age exceeds the view's TTL — so as soon as a row is "too
old" for a view, it disappears from queries against that view, even before
physical deletion.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Phoenix compaction (eventual)."}),` Expired rows are physically removed by
Phoenix's compaction during HBase region compactions. This reclaims disk and
stops the rows showing up via lower-level scans. There is no separate cleanup
job — physical removal happens whenever the underlying HBase regions compact.`]}),`
`]}),`
`,e.jsx(i.h2,{id:"view-ttl-conditional",children:"Combining with Conditional TTL"}),`
`,e.jsxs(i.p,{children:["A view's ",e.jsx(i.code,{children:"TTL"}),` can also be a SQL boolean expression instead of a number, in which
case it follows the `,e.jsx(i.a,{href:"/docs/features/conditional-ttl",children:"Conditional TTL"}),` rules. This
unlocks expiry based on row content (e.g. `,e.jsxs(i.em,{children:["expire 30 days after ",e.jsx(i.code,{children:"STATUS"}),` becomes
`,e.jsx(i.code,{children:"'CLOSED'"})]}),"), and the strict-vs-relaxed enforcement modes documented there."]})]})}function o(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{a as _markdown,o as default,l as extractedReferences,h as frontmatter,r as structuredData,d as toc};
