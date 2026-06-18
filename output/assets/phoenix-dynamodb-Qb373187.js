import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let i=`**Phoenix-DynamoDB** is a REST service that lets applications written against the
Amazon DynamoDB HTTP API talk to a Phoenix cluster instead. It is distributed as the
\`phoenix-dynamodb\` module of
[\`apache/phoenix-adapters\`](https://github.com/apache/phoenix-adapters).

This page describes when to choose it and points at the canonical source. Build
instructions, supported API surface, configuration reference, and deployment
notes live in the \`phoenix-adapters\` repo's own README and module documentation.

## When to use it

Reach for Phoenix-DynamoDB when:

* You have an existing application built against the AWS DynamoDB SDK and want to
  point it at a Phoenix cluster without rewriting the data-access layer.
* You want to serve DynamoDB-style document workloads from Phoenix and pair the
  REST front-end with the [BSON document type](/docs/features/bson) for the
  underlying storage and indexing.
* You need a REST endpoint in front of a Phoenix cluster that speaks a wire
  protocol most clients already know how to talk to.

For native Phoenix workloads, prefer the standard JDBC driver — it exposes the full
SQL surface, not just whatever subset the DynamoDB API maps onto.

## Where to find it

* Source and documentation:
  [\`github.com/apache/phoenix-adapters\`](https://github.com/apache/phoenix-adapters)
* Module: \`phoenix-dynamodb\`
`,h={title:"Phoenix-DynamoDB REST Service",description:"Run a DynamoDB-compatible REST endpoint on top of Apache Phoenix using the phoenix-dynamodb module from apache/phoenix-adapters."},d=[{href:"https://github.com/apache/phoenix-adapters"},{href:"/docs/features/bson"},{href:"https://github.com/apache/phoenix-adapters"}],s={contents:[{heading:void 0,content:`Phoenix-DynamoDB is a REST service that lets applications written against the
Amazon DynamoDB HTTP API talk to a Phoenix cluster instead. It is distributed as the
phoenix-dynamodb module of
apache/phoenix-adapters.`},{heading:void 0,content:`This page describes when to choose it and points at the canonical source. Build
instructions, supported API surface, configuration reference, and deployment
notes live in the phoenix-adapters repo's own README and module documentation.`},{heading:"phoenix-dynamodb-when",content:"Reach for Phoenix-DynamoDB when:"},{heading:"phoenix-dynamodb-when",content:`You have an existing application built against the AWS DynamoDB SDK and want to
point it at a Phoenix cluster without rewriting the data-access layer.`},{heading:"phoenix-dynamodb-when",content:`You want to serve DynamoDB-style document workloads from Phoenix and pair the
REST front-end with the BSON document type for the
underlying storage and indexing.`},{heading:"phoenix-dynamodb-when",content:`You need a REST endpoint in front of a Phoenix cluster that speaks a wire
protocol most clients already know how to talk to.`},{heading:"phoenix-dynamodb-when",content:`For native Phoenix workloads, prefer the standard JDBC driver — it exposes the full
SQL surface, not just whatever subset the DynamoDB API maps onto.`},{heading:"phoenix-dynamodb-where",content:`Source and documentation:
github.com/apache/phoenix-adapters`},{heading:"phoenix-dynamodb-where",content:"Module: phoenix-dynamodb"}],headings:[{id:"phoenix-dynamodb-when",content:"When to use it"},{id:"phoenix-dynamodb-where",content:"Where to find it"}]};const r=[{depth:2,url:"#phoenix-dynamodb-when",title:e.jsx(e.Fragment,{children:"When to use it"})},{depth:2,url:"#phoenix-dynamodb-where",title:e.jsx(e.Fragment,{children:"Where to find it"})}];function o(t){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Phoenix-DynamoDB"}),` is a REST service that lets applications written against the
Amazon DynamoDB HTTP API talk to a Phoenix cluster instead. It is distributed as the
`,e.jsx(n.code,{children:"phoenix-dynamodb"}),` module of
`,e.jsx(n.a,{href:"https://github.com/apache/phoenix-adapters",children:e.jsx(n.code,{children:"apache/phoenix-adapters"})}),"."]}),`
`,e.jsxs(n.p,{children:[`This page describes when to choose it and points at the canonical source. Build
instructions, supported API surface, configuration reference, and deployment
notes live in the `,e.jsx(n.code,{children:"phoenix-adapters"})," repo's own README and module documentation."]}),`
`,e.jsx(n.h2,{id:"phoenix-dynamodb-when",children:"When to use it"}),`
`,e.jsx(n.p,{children:"Reach for Phoenix-DynamoDB when:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`You have an existing application built against the AWS DynamoDB SDK and want to
point it at a Phoenix cluster without rewriting the data-access layer.`}),`
`,e.jsxs(n.li,{children:[`You want to serve DynamoDB-style document workloads from Phoenix and pair the
REST front-end with the `,e.jsx(n.a,{href:"/docs/features/bson",children:"BSON document type"}),` for the
underlying storage and indexing.`]}),`
`,e.jsx(n.li,{children:`You need a REST endpoint in front of a Phoenix cluster that speaks a wire
protocol most clients already know how to talk to.`}),`
`]}),`
`,e.jsx(n.p,{children:`For native Phoenix workloads, prefer the standard JDBC driver — it exposes the full
SQL surface, not just whatever subset the DynamoDB API maps onto.`}),`
`,e.jsx(n.h2,{id:"phoenix-dynamodb-where",children:"Where to find it"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`Source and documentation:
`,e.jsx(n.a,{href:"https://github.com/apache/phoenix-adapters",children:e.jsx(n.code,{children:"github.com/apache/phoenix-adapters"})})]}),`
`,e.jsxs(n.li,{children:["Module: ",e.jsx(n.code,{children:"phoenix-dynamodb"})]}),`
`]})]})}function c(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(o,{...t})}):o(t)}export{i as _markdown,c as default,d as extractedReferences,h as frontmatter,s as structuredData,r as toc};
