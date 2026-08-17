import{j as e}from"./jsx-runtime-CUISpl0r.js";let i=`Segment Scan turns a Phoenix table into *N* contiguous, non-overlapping key ranges
that you can hand out to a pool of workers to drive a parallel full-table scan. It is
the natural primitive for ETL exports, table validation/repair tools, bulk
re-encoding, and anything else that needs to walk every row as fast as the cluster
can serve it. Available in Phoenix 5.3.0
([PHOENIX-7684](https://issues.apache.org/jira/browse/PHOENIX-7684)).

## When to use it

Reach for Segment Scan when you want to **read every row** and you'd rather have many
workers do it concurrently than one client streaming sequentially. Typical use cases:

* Snapshot exports to a data lake / warehouse.
* Backfills or re-encodes (e.g. moving a column from \`VARBINARY\` to
  [\`VARBINARY_ENCODED\`](/docs/features/varbinary-encoded)).
* Validation/repair scripts that scrub or hash every row.
* DynamoDB-style parallel scan against a Phoenix-backed table.

If you only want to read *some* rows (e.g. by a key prefix or an indexed predicate),
issue a normal SQL query — Segment Scan is for full-table fan-out, not selective
filtering.

## Basic usage

\`TOTAL_SEGMENTS() = N\` in the \`WHERE\` clause asks Phoenix to return *N* segment
boundaries instead of running the query against the data. The boundaries are
projected via the \`SCAN_START_KEY()\` and \`SCAN_END_KEY()\` functions:

\`\`\`sql
SELECT SCAN_START_KEY(), SCAN_END_KEY()
FROM my_table
WHERE TOTAL_SEGMENTS() = 16;
\`\`\`

You get back one row per segment with two \`VARBINARY\` columns: the **start key** and
the **end key** of that range, as raw HBase row-key bytes. Either may be empty — an
empty start key means "from the beginning of the table"; an empty end key means
"to the end of the table".

To scan a segment, pass each \`(start_key, end_key)\` pair back into a regular Phoenix
SQL query, using \`SCAN_START_KEY()\` and \`SCAN_END_KEY()\` as predicates with the
bytes bound as parameters:

\`\`\`sql
SELECT pk, v1, v2 FROM my_table
WHERE SCAN_START_KEY() = ? AND SCAN_END_KEY() = ?;
\`\`\`

Phoenix translates these predicates into the underlying HBase scan bounds for you,
so a worker pool can stay in plain SQL — each worker runs its own query against one
segment, in parallel.

## How many segments you actually get

The number of segments returned is **\`min(N, num_regions)\`**:

* If \`N <= num_regions\`, Phoenix bundles consecutive regions together so you get
  exactly \`N\` segments. The grouping is as even as possible — with \`r = num_regions
  mod N\` segments getting one extra region.
* If \`N > num_regions\`, you simply get one segment per region. Phoenix will not
  split a region's key range into smaller sub-ranges for you, so the **maximum
  achievable parallelism is bounded by the number of regions in the table**.

If you want more parallelism than your region count permits, pre-split the table or
salt it; Segment Scan respects whatever the current region layout is.

\`N\` must be a positive integer. Passing \`0\` or a negative value returns SQL error
code \`221\` ("TOTAL\\_SEGMENTS() value must be greater than 0").

## How it actually runs

\`TOTAL_SEGMENTS()\` is a marker, not a server-side function. The Phoenix planner sees
it during compilation and replaces the query plan entirely with a client-side plan
that:

1. Looks up the table's current region locations.
2. Buckets them into \`min(N, num_regions)\` contiguous groups.
3. Returns each group's combined \`(start_key, end_key)\` as a result row.

No region-server scan is issued for this query — it's a metadata-only operation, so
it's cheap to call, and it doesn't read or count any of the actual data.

## Things to watch for

* **Region layout changes between discovery and scan.** The segments you got back
  reflect the region layout at the time of the call. If the table splits or merges
  between segment discovery and your parallel scan, your \`(start_key, end_key)\`
  ranges are still valid as byte ranges — they just may not align with current
  regions. The parallel scan still works; you just lose some of the
  region-locality benefit.
* **Each segment can still hold a lot of data.** Segments correspond to one or more
  whole regions. If your regions are large or unevenly populated, individual
  workers may end up scanning more than others. Use this with the standard scan
  controls (paging, batch sizes) rather than relying on Segment Scan to balance row
  counts.
* **Segment Scan describes ranges; it doesn't scan.** The parallel scan itself is
  your responsibility — a worker pool takes one \`(start_key, end_key)\` per task and
  runs a regular Phoenix query bounded with \`SCAN_START_KEY() = ? AND SCAN_END_KEY() = ?\`.
`,r={title:"Segment Scan",description:"Get N evenly-bucketed key ranges for a Phoenix table so a client can drive a parallel full-table scan."},o=[{href:"https://issues.apache.org/jira/browse/PHOENIX-7684"},{href:"/docs/features/varbinary-encoded"}],l={contents:[{heading:void 0,content:`Segment Scan turns a Phoenix table into *N* contiguous, non-overlapping key ranges
that you can hand out to a pool of workers to drive a parallel full-table scan. It is
the natural primitive for ETL exports, table validation/repair tools, bulk
re-encoding, and anything else that needs to walk every row as fast as the cluster
can serve it. Available in Phoenix 5.3.0
(PHOENIX-7684).`},{heading:"segment-scan-when",content:`Reach for Segment Scan when you want to **read every row** and you'd rather have many
workers do it concurrently than one client streaming sequentially. Typical use cases:`},{heading:"segment-scan-when",content:"Snapshot exports to a data lake / warehouse."},{heading:"segment-scan-when",content:"Backfills or re-encodes (e.g. moving a column from `VARBINARY` to\n`VARBINARY_ENCODED`)."},{heading:"segment-scan-when",content:"Validation/repair scripts that scrub or hash every row."},{heading:"segment-scan-when",content:"DynamoDB-style parallel scan against a Phoenix-backed table."},{heading:"segment-scan-when",content:`If you only want to read *some* rows (e.g. by a key prefix or an indexed predicate),
issue a normal SQL query — Segment Scan is for full-table fan-out, not selective
filtering.`},{heading:"segment-scan-usage",content:"`TOTAL_SEGMENTS() = N` in the `WHERE` clause asks Phoenix to return *N* segment\nboundaries instead of running the query against the data. The boundaries are\nprojected via the `SCAN_START_KEY()` and `SCAN_END_KEY()` functions:"},{heading:"segment-scan-usage",content:`You get back one row per segment with two \`VARBINARY\` columns: the **start key** and
the **end key** of that range, as raw HBase row-key bytes. Either may be empty — an
empty start key means "from the beginning of the table"; an empty end key means
"to the end of the table".`},{heading:"segment-scan-usage",content:"To scan a segment, pass each `(start_key, end_key)` pair back into a regular Phoenix\nSQL query, using `SCAN_START_KEY()` and `SCAN_END_KEY()` as predicates with the\nbytes bound as parameters:"},{heading:"segment-scan-usage",content:`Phoenix translates these predicates into the underlying HBase scan bounds for you,
so a worker pool can stay in plain SQL — each worker runs its own query against one
segment, in parallel.`},{heading:"segment-scan-count",content:"The number of segments returned is &#x2A;*`min(N, num_regions)`**:"},{heading:"segment-scan-count",content:"If `N <= num_regions`, Phoenix bundles consecutive regions together so you get\nexactly `N` segments. The grouping is as even as possible — with `r = num_regions\nmod N` segments getting one extra region."},{heading:"segment-scan-count",content:"If `N > num_regions`, you simply get one segment per region. Phoenix will not\nsplit a region's key range into smaller sub-ranges for you, so the **maximum\nachievable parallelism is bounded by the number of regions in the table**."},{heading:"segment-scan-count",content:`If you want more parallelism than your region count permits, pre-split the table or
salt it; Segment Scan respects whatever the current region layout is.`},{heading:"segment-scan-count",content:'`N` must be a positive integer. Passing `0` or a negative value returns SQL error\ncode `221` ("TOTAL\\_SEGMENTS() value must be greater than 0").'},{heading:"segment-scan-how",content:"`TOTAL_SEGMENTS()` is a marker, not a server-side function. The Phoenix planner sees\nit during compilation and replaces the query plan entirely with a client-side plan\nthat:"},{heading:"segment-scan-how",content:"Looks up the table's current region locations."},{heading:"segment-scan-how",content:"Buckets them into `min(N, num_regions)` contiguous groups."},{heading:"segment-scan-how",content:"Returns each group's combined `(start_key, end_key)` as a result row."},{heading:"segment-scan-how",content:`No region-server scan is issued for this query — it's a metadata-only operation, so
it's cheap to call, and it doesn't read or count any of the actual data.`},{heading:"segment-scan-watch",content:`**Region layout changes between discovery and scan.** The segments you got back
reflect the region layout at the time of the call. If the table splits or merges
between segment discovery and your parallel scan, your \`(start_key, end_key)\`
ranges are still valid as byte ranges — they just may not align with current
regions. The parallel scan still works; you just lose some of the
region-locality benefit.`},{heading:"segment-scan-watch",content:`**Each segment can still hold a lot of data.** Segments correspond to one or more
whole regions. If your regions are large or unevenly populated, individual
workers may end up scanning more than others. Use this with the standard scan
controls (paging, batch sizes) rather than relying on Segment Scan to balance row
counts.`},{heading:"segment-scan-watch",content:"**Segment Scan describes ranges; it doesn't scan.** The parallel scan itself is\nyour responsibility — a worker pool takes one `(start_key, end_key)` per task and\nruns a regular Phoenix query bounded with `SCAN_START_KEY() = ? AND SCAN_END_KEY() = ?`."}],headings:[{id:"segment-scan-when",content:"When to use it"},{id:"segment-scan-usage",content:"Basic usage"},{id:"segment-scan-count",content:"How many segments you actually get"},{id:"segment-scan-how",content:"How it actually runs"},{id:"segment-scan-watch",content:"Things to watch for"}]},h=[{depth:2,url:"#segment-scan-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#segment-scan-usage",title:e.jsx(e.Fragment,{children:"Basic usage"})},{depth:2,url:"#segment-scan-count",title:e.jsx(e.Fragment,{children:"How many segments you actually get"})},{depth:2,url:"#segment-scan-how",title:e.jsx(e.Fragment,{children:"How it actually runs"})},{depth:2,url:"#segment-scan-watch",title:e.jsx(e.Fragment,{children:"Things to watch for"})}];function s(t){const n={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Segment Scan turns a Phoenix table into ",e.jsx(n.em,{children:"N"}),` contiguous, non-overlapping key ranges
that you can hand out to a pool of workers to drive a parallel full-table scan. It is
the natural primitive for ETL exports, table validation/repair tools, bulk
re-encoding, and anything else that needs to walk every row as fast as the cluster
can serve it. Available in Phoenix 5.3.0
(`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-7684",children:"PHOENIX-7684"}),")."]}),`
`,e.jsx(n.h2,{id:"segment-scan-when",children:"When to use it"}),`
`,e.jsxs(n.p,{children:["Reach for Segment Scan when you want to ",e.jsx(n.strong,{children:"read every row"}),` and you'd rather have many
workers do it concurrently than one client streaming sequentially. Typical use cases:`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Snapshot exports to a data lake / warehouse."}),`
`,e.jsxs(n.li,{children:["Backfills or re-encodes (e.g. moving a column from ",e.jsx(n.code,{children:"VARBINARY"}),` to
`,e.jsx(n.a,{href:"/docs/features/varbinary-encoded",children:e.jsx(n.code,{children:"VARBINARY_ENCODED"})}),")."]}),`
`,e.jsx(n.li,{children:"Validation/repair scripts that scrub or hash every row."}),`
`,e.jsx(n.li,{children:"DynamoDB-style parallel scan against a Phoenix-backed table."}),`
`]}),`
`,e.jsxs(n.p,{children:["If you only want to read ",e.jsx(n.em,{children:"some"}),` rows (e.g. by a key prefix or an indexed predicate),
issue a normal SQL query — Segment Scan is for full-table fan-out, not selective
filtering.`]}),`
`,e.jsx(n.h2,{id:"segment-scan-usage",children:"Basic usage"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"TOTAL_SEGMENTS() = N"})," in the ",e.jsx(n.code,{children:"WHERE"})," clause asks Phoenix to return ",e.jsx(n.em,{children:"N"}),` segment
boundaries instead of running the query against the data. The boundaries are
projected via the `,e.jsx(n.code,{children:"SCAN_START_KEY()"})," and ",e.jsx(n.code,{children:"SCAN_END_KEY()"})," functions:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" SCAN_START_KEY(), SCAN_END_KEY()"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TOTAL_SEGMENTS() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 16"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsxs(n.p,{children:["You get back one row per segment with two ",e.jsx(n.code,{children:"VARBINARY"})," columns: the ",e.jsx(n.strong,{children:"start key"}),` and
the `,e.jsx(n.strong,{children:"end key"}),` of that range, as raw HBase row-key bytes. Either may be empty — an
empty start key means "from the beginning of the table"; an empty end key means
"to the end of the table".`]}),`
`,e.jsxs(n.p,{children:["To scan a segment, pass each ",e.jsx(n.code,{children:"(start_key, end_key)"}),` pair back into a regular Phoenix
SQL query, using `,e.jsx(n.code,{children:"SCAN_START_KEY()"})," and ",e.jsx(n.code,{children:"SCAN_END_KEY()"}),` as predicates with the
bytes bound as parameters:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk, v1, v2 "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"WHERE"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" SCAN_START_KEY() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ? "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AND"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" SCAN_END_KEY() "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ?;"})]})]})})}),`
`,e.jsx(n.p,{children:`Phoenix translates these predicates into the underlying HBase scan bounds for you,
so a worker pool can stay in plain SQL — each worker runs its own query against one
segment, in parallel.`}),`
`,e.jsx(n.h2,{id:"segment-scan-count",children:"How many segments you actually get"}),`
`,e.jsxs(n.p,{children:["The number of segments returned is ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"min(N, num_regions)"})}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If ",e.jsx(n.code,{children:"N <= num_regions"}),`, Phoenix bundles consecutive regions together so you get
exactly `,e.jsx(n.code,{children:"N"})," segments. The grouping is as even as possible — with ",e.jsx(n.code,{children:"r = num_regions mod N"})," segments getting one extra region."]}),`
`,e.jsxs(n.li,{children:["If ",e.jsx(n.code,{children:"N > num_regions"}),`, you simply get one segment per region. Phoenix will not
split a region's key range into smaller sub-ranges for you, so the `,e.jsx(n.strong,{children:`maximum
achievable parallelism is bounded by the number of regions in the table`}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:`If you want more parallelism than your region count permits, pre-split the table or
salt it; Segment Scan respects whatever the current region layout is.`}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"N"})," must be a positive integer. Passing ",e.jsx(n.code,{children:"0"}),` or a negative value returns SQL error
code `,e.jsx(n.code,{children:"221"}),' ("TOTAL_SEGMENTS() value must be greater than 0").']}),`
`,e.jsx(n.h2,{id:"segment-scan-how",children:"How it actually runs"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"TOTAL_SEGMENTS()"}),` is a marker, not a server-side function. The Phoenix planner sees
it during compilation and replaces the query plan entirely with a client-side plan
that:`]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Looks up the table's current region locations."}),`
`,e.jsxs(n.li,{children:["Buckets them into ",e.jsx(n.code,{children:"min(N, num_regions)"})," contiguous groups."]}),`
`,e.jsxs(n.li,{children:["Returns each group's combined ",e.jsx(n.code,{children:"(start_key, end_key)"})," as a result row."]}),`
`]}),`
`,e.jsx(n.p,{children:`No region-server scan is issued for this query — it's a metadata-only operation, so
it's cheap to call, and it doesn't read or count any of the actual data.`}),`
`,e.jsx(n.h2,{id:"segment-scan-watch",children:"Things to watch for"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Region layout changes between discovery and scan."}),` The segments you got back
reflect the region layout at the time of the call. If the table splits or merges
between segment discovery and your parallel scan, your `,e.jsx(n.code,{children:"(start_key, end_key)"}),`
ranges are still valid as byte ranges — they just may not align with current
regions. The parallel scan still works; you just lose some of the
region-locality benefit.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Each segment can still hold a lot of data."}),` Segments correspond to one or more
whole regions. If your regions are large or unevenly populated, individual
workers may end up scanning more than others. Use this with the standard scan
controls (paging, batch sizes) rather than relying on Segment Scan to balance row
counts.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Segment Scan describes ranges; it doesn't scan."}),` The parallel scan itself is
your responsibility — a worker pool takes one `,e.jsx(n.code,{children:"(start_key, end_key)"}),` per task and
runs a regular Phoenix query bounded with `,e.jsx(n.code,{children:"SCAN_START_KEY() = ? AND SCAN_END_KEY() = ?"}),"."]}),`
`]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{i as _markdown,c as default,o as extractedReferences,r as frontmatter,l as structuredData,h as toc};
