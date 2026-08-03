import{j as e}from"./jsx-runtime-CUISpl0r.js";let r=`Phoenix supports per-row time-to-live (TTL) so that rows can be expired and removed
without an application-issued \`DELETE\`. There are three flavors, and one orthogonal
table property — \`IS_STRICT_TTL\` — that controls how aggressively expired rows are
hidden from reads.

## Time-based TTL

Set a numeric value (in seconds) on the \`TTL\` table property at \`CREATE TABLE\` time
to age every row out a fixed duration after its cell timestamp:

\`\`\`sql
CREATE TABLE events (...) TTL = 604800;   -- 7 days
ALTER TABLE events SET TTL = 2592000;     -- bump to 30 days
ALTER TABLE events SET TTL = NONE;        -- remove TTL
\`\`\`

Rows older than the TTL are removed by Phoenix compaction during HBase region
compactions. Time-based TTL is the right choice when retention is a flat duration
that applies uniformly to every row in the table.

## View TTL

Each [view](/docs/features/views) over a shared base table can set its own retention
window, so different tenants or use cases can age data out independently without
splitting the underlying table. See [View TTL](/docs/features/view-ttl) for the
full feature.

## Conditional TTL

Express row expiration as a SQL boolean expression evaluated against the row's own
column values, instead of a fixed duration. A row is considered expired the moment
the expression evaluates to \`TRUE\` for that row. See
[Conditional TTL](/docs/features/conditional-ttl) for the full feature.

## Strict vs Relaxed TTL

\`IS_STRICT_TTL\` is a table property that controls **how strictly expired rows are
hidden from reads**. It applies to every flavor of TTL above — time-based, view,
and conditional. The default is \`true\` (strict).

| Mode                                         | Behavior                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Strict** (\`IS_STRICT_TTL = true\`, default) | Expired rows are filtered out on every read path — they're invisible to queries the moment they expire.                               |
| **Relaxed** (\`IS_STRICT_TTL = false\`)        | Expired rows remain **visible to readers until major compaction** physically removes them. Similar to DynamoDB's TTL expiry behavior. |

The trade-off:

* **Strict** gives you a strong "expired = invisible" guarantee. It's the right
  choice when retention is a correctness or compliance concern.
* **Relaxed** has a cheaper write path. The largest gain is with
  [Conditional TTL](/docs/features/conditional-ttl): under strict mode, every
  mutation reads the current row state to evaluate the TTL expression, which adds
  latency. Relaxed mode skips that pre-read.

\`\`\`sql
-- Strict (default).
CREATE TABLE strict_events (...) TTL = 604800;

-- Relaxed: cheaper write path, eventual visibility of expired rows.
CREATE TABLE relaxed_events (...) TTL = 604800, IS_STRICT_TTL = false;
\`\`\`

You can also switch a table between modes:

\`\`\`sql
ALTER TABLE events SET IS_STRICT_TTL = false;
\`\`\`

Start with the default. Switch to relaxed only when the cheaper write path is the
right trade-off for your workload and eventual visibility of expired rows is
acceptable for your readers.
`,a={title:"TTL",description:"Phoenix TTL flavors (time-based, view, conditional) and the IS_STRICT_TTL property that controls visibility of expired rows."},l=[{href:"/docs/features/views"},{href:"/docs/features/view-ttl"},{href:"/docs/features/conditional-ttl"},{href:"/docs/features/conditional-ttl"}],h={contents:[{heading:void 0,content:"Phoenix supports per-row time-to-live (TTL) so that rows can be expired and removed\nwithout an application-issued `DELETE`. There are three flavors, and one orthogonal\ntable property — `IS_STRICT_TTL` — that controls how aggressively expired rows are\nhidden from reads."},{heading:"time-based-ttl",content:"Set a numeric value (in seconds) on the `TTL` table property at `CREATE TABLE` time\nto age every row out a fixed duration after its cell timestamp:"},{heading:"time-based-ttl",content:`Rows older than the TTL are removed by Phoenix compaction during HBase region
compactions. Time-based TTL is the right choice when retention is a flat duration
that applies uniformly to every row in the table.`},{heading:"view-ttl-summary",content:`Each view over a shared base table can set its own retention
window, so different tenants or use cases can age data out independently without
splitting the underlying table. See View TTL for the
full feature.`},{heading:"conditional-ttl-summary",content:`Express row expiration as a SQL boolean expression evaluated against the row's own
column values, instead of a fixed duration. A row is considered expired the moment
the expression evaluates to \`TRUE\` for that row. See
Conditional TTL for the full feature.`},{heading:"strict-vs-relaxed-ttl",content:"`IS_STRICT_TTL` is a table property that controls **how strictly expired rows are\nhidden from reads**. It applies to every flavor of TTL above — time-based, view,\nand conditional. The default is `true` (strict)."},{heading:"strict-vs-relaxed-ttl",content:"Mode"},{heading:"strict-vs-relaxed-ttl",content:"Behavior"},{heading:"strict-vs-relaxed-ttl",content:"**Strict** (`IS_STRICT_TTL = true`, default)"},{heading:"strict-vs-relaxed-ttl",content:"Expired rows are filtered out on every read path — they're invisible to queries the moment they expire."},{heading:"strict-vs-relaxed-ttl",content:"**Relaxed** (`IS_STRICT_TTL = false`)"},{heading:"strict-vs-relaxed-ttl",content:"Expired rows remain **visible to readers until major compaction** physically removes them. Similar to DynamoDB's TTL expiry behavior."},{heading:"strict-vs-relaxed-ttl",content:"The trade-off:"},{heading:"strict-vs-relaxed-ttl",content:`**Strict** gives you a strong "expired = invisible" guarantee. It's the right
choice when retention is a correctness or compliance concern.`},{heading:"strict-vs-relaxed-ttl",content:`**Relaxed** has a cheaper write path. The largest gain is with
Conditional TTL: under strict mode, every
mutation reads the current row state to evaluate the TTL expression, which adds
latency. Relaxed mode skips that pre-read.`},{heading:"strict-vs-relaxed-ttl",content:"You can also switch a table between modes:"},{heading:"strict-vs-relaxed-ttl",content:`Start with the default. Switch to relaxed only when the cheaper write path is the
right trade-off for your workload and eventual visibility of expired rows is
acceptable for your readers.`}],headings:[{id:"time-based-ttl",content:"Time-based TTL"},{id:"view-ttl-summary",content:"View TTL"},{id:"conditional-ttl-summary",content:"Conditional TTL"},{id:"strict-vs-relaxed-ttl",content:"Strict vs Relaxed TTL"}]},d=[{depth:2,url:"#time-based-ttl",title:e.jsx(e.Fragment,{children:"Time-based TTL"})},{depth:2,url:"#view-ttl-summary",title:e.jsx(e.Fragment,{children:"View TTL"})},{depth:2,url:"#conditional-ttl-summary",title:e.jsx(e.Fragment,{children:"Conditional TTL"})},{depth:2,url:"#strict-vs-relaxed-ttl",title:e.jsx(e.Fragment,{children:"Strict vs Relaxed TTL"})}];function s(t){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:[`Phoenix supports per-row time-to-live (TTL) so that rows can be expired and removed
without an application-issued `,e.jsx(i.code,{children:"DELETE"}),`. There are three flavors, and one orthogonal
table property — `,e.jsx(i.code,{children:"IS_STRICT_TTL"}),` — that controls how aggressively expired rows are
hidden from reads.`]}),`
`,e.jsx(i.h2,{id:"time-based-ttl",children:"Time-based TTL"}),`
`,e.jsxs(i.p,{children:["Set a numeric value (in seconds) on the ",e.jsx(i.code,{children:"TTL"})," table property at ",e.jsx(i.code,{children:"CREATE TABLE"}),` time
to age every row out a fixed duration after its cell timestamp:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" events"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (...) TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 604800"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";   "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- 7 days"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2592000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";     "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- bump to 30 days"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NONE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";        "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- remove TTL"})]})]})})}),`
`,e.jsx(i.p,{children:`Rows older than the TTL are removed by Phoenix compaction during HBase region
compactions. Time-based TTL is the right choice when retention is a flat duration
that applies uniformly to every row in the table.`}),`
`,e.jsx(i.h2,{id:"view-ttl-summary",children:"View TTL"}),`
`,e.jsxs(i.p,{children:["Each ",e.jsx(i.a,{href:"/docs/features/views",children:"view"}),` over a shared base table can set its own retention
window, so different tenants or use cases can age data out independently without
splitting the underlying table. See `,e.jsx(i.a,{href:"/docs/features/view-ttl",children:"View TTL"}),` for the
full feature.`]}),`
`,e.jsx(i.h2,{id:"conditional-ttl-summary",children:"Conditional TTL"}),`
`,e.jsxs(i.p,{children:[`Express row expiration as a SQL boolean expression evaluated against the row's own
column values, instead of a fixed duration. A row is considered expired the moment
the expression evaluates to `,e.jsx(i.code,{children:"TRUE"}),` for that row. See
`,e.jsx(i.a,{href:"/docs/features/conditional-ttl",children:"Conditional TTL"})," for the full feature."]}),`
`,e.jsx(i.h2,{id:"strict-vs-relaxed-ttl",children:"Strict vs Relaxed TTL"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"IS_STRICT_TTL"})," is a table property that controls ",e.jsx(i.strong,{children:`how strictly expired rows are
hidden from reads`}),`. It applies to every flavor of TTL above — time-based, view,
and conditional. The default is `,e.jsx(i.code,{children:"true"})," (strict)."]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Mode"}),e.jsx(i.th,{children:"Behavior"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.strong,{children:"Strict"})," (",e.jsx(i.code,{children:"IS_STRICT_TTL = true"}),", default)"]}),e.jsx(i.td,{children:"Expired rows are filtered out on every read path — they're invisible to queries the moment they expire."})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.strong,{children:"Relaxed"})," (",e.jsx(i.code,{children:"IS_STRICT_TTL = false"}),")"]}),e.jsxs(i.td,{children:["Expired rows remain ",e.jsx(i.strong,{children:"visible to readers until major compaction"})," physically removes them. Similar to DynamoDB's TTL expiry behavior."]})]})]})]}),`
`,e.jsx(i.p,{children:"The trade-off:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Strict"}),` gives you a strong "expired = invisible" guarantee. It's the right
choice when retention is a correctness or compliance concern.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Relaxed"}),` has a cheaper write path. The largest gain is with
`,e.jsx(i.a,{href:"/docs/features/conditional-ttl",children:"Conditional TTL"}),`: under strict mode, every
mutation reads the current row state to evaluate the TTL expression, which adds
latency. Relaxed mode skips that pre-read.`]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Strict (default)."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" strict_events"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (...) TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 604800"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"-- Relaxed: cheaper write path, eventual visibility of expired rows."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" relaxed_events"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (...) TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 604800"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", IS_STRICT_TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" false;"})]})]})})}),`
`,e.jsx(i.p,{children:"You can also switch a table between modes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" events "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IS_STRICT_TTL "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" false;"})]})})})}),`
`,e.jsx(i.p,{children:`Start with the default. Switch to relaxed only when the cheaper write path is the
right trade-off for your workload and eventual visibility of expired rows is
acceptable for your readers.`})]})}function o(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(s,{...t})}):s(t)}export{r as _markdown,o as default,l as extractedReferences,a as frontmatter,h as structuredData,d as toc};
