import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let s=`Phoenix maintains backward compatibility across at least two minor releases to allow for **no downtime** through server-side rolling
restarts upon upgrading. See below for details.

## Versioning Convention

Phoenix uses a standard three number versioning schema of the form:

\`\`\`text
<major version> . <minor version> . <patch version>
\`\`\`

For example, **\`4.2.1\`** has a major version of **\`4\`**,
a minor version of **\`2\`**, and a patch version of **\`1\`**.

## Patch Release

Upgrading to a new patch release (i.e. only the patch version has changed) is the simplest case. The jar upgrade may occur in any order: client first or server first, and a mix of clients with different patch release versions is fine.

## Minor Release

When upgrading to a new minor release (i.e. the major version is the same, but the minor
version has changed), sometimes modifications to the system tables are necessary to either
fix a bug or provide a new feature. This upgrade will occur automatically the first time a
newly upgraded client connects to the newly upgraded server. It is **required** that the
server-side jar be upgraded first across your entire cluster, before any clients are
upgraded. An older client (two minor versions back) will work with a newer server jar when
the minor version is different, but not vice versa. In other words, clients do not need to
be upgraded in lock step with the server. However, as the server version moves forward,
the client version should move forward as well. This allows Phoenix to evolve its client/server
protocol while still providing clients sufficient time to upgrade their clients.

As of the 4.3 release, a mix of clients on different minor release versions is supported as well
(note that prior releases required all clients to be upgraded at the same time). Another improvement
as of the 4.3 release is that an upgrade may be done directly from one minor version to another
higher minor version (prior releases required an upgrade to each minor version in between).

## Major Release

Upgrading to a new major release may require downtime as well as potentially the running of a migration
script. Additionally, all clients and servers may need to be upgraded at the same time. This will be
determined on a release-by-release basis.

## Release Notes

Specific details on issues and their fixes that may impact you can be found [here](/release-notes).
`,o={title:"Backward Compatibility",description:"Phoenix upgrade compatibility across patch, minor, and major releases."},a=[{href:"/release-notes"}],l={contents:[{heading:void 0,content:`Phoenix maintains backward compatibility across at least two minor releases to allow for no downtime through server-side rolling
restarts upon upgrading. See below for details.`},{heading:"versioning-convention",content:"Phoenix uses a standard three number versioning schema of the form:"},{heading:"versioning-convention",content:`For example, 4.2.1 has a major version of 4,
a minor version of 2, and a patch version of 1.`},{heading:"patch-release",content:"Upgrading to a new patch release (i.e. only the patch version has changed) is the simplest case. The jar upgrade may occur in any order: client first or server first, and a mix of clients with different patch release versions is fine."},{heading:"minor-release",content:`When upgrading to a new minor release (i.e. the major version is the same, but the minor
version has changed), sometimes modifications to the system tables are necessary to either
fix a bug or provide a new feature. This upgrade will occur automatically the first time a
newly upgraded client connects to the newly upgraded server. It is required that the
server-side jar be upgraded first across your entire cluster, before any clients are
upgraded. An older client (two minor versions back) will work with a newer server jar when
the minor version is different, but not vice versa. In other words, clients do not need to
be upgraded in lock step with the server. However, as the server version moves forward,
the client version should move forward as well. This allows Phoenix to evolve its client/server
protocol while still providing clients sufficient time to upgrade their clients.`},{heading:"minor-release",content:`As of the 4.3 release, a mix of clients on different minor release versions is supported as well
(note that prior releases required all clients to be upgraded at the same time). Another improvement
as of the 4.3 release is that an upgrade may be done directly from one minor version to another
higher minor version (prior releases required an upgrade to each minor version in between).`},{heading:"major-release",content:`Upgrading to a new major release may require downtime as well as potentially the running of a migration
script. Additionally, all clients and servers may need to be upgraded at the same time. This will be
determined on a release-by-release basis.`},{heading:"release-notes",content:"Specific details on issues and their fixes that may impact you can be found here."}],headings:[{id:"versioning-convention",content:"Versioning Convention"},{id:"patch-release",content:"Patch Release"},{id:"minor-release",content:"Minor Release"},{id:"major-release",content:"Major Release"},{id:"release-notes",content:"Release Notes"}]};const d=[{depth:2,url:"#versioning-convention",title:e.jsx(e.Fragment,{children:"Versioning Convention"})},{depth:2,url:"#patch-release",title:e.jsx(e.Fragment,{children:"Patch Release"})},{depth:2,url:"#minor-release",title:e.jsx(e.Fragment,{children:"Minor Release"})},{depth:2,url:"#major-release",title:e.jsx(e.Fragment,{children:"Major Release"})},{depth:2,url:"#release-notes",title:e.jsx(e.Fragment,{children:"Release Notes"})}];function i(r){const n={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",span:"span",strong:"strong",...r.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["Phoenix maintains backward compatibility across at least two minor releases to allow for ",e.jsx(n.strong,{children:"no downtime"}),` through server-side rolling
restarts upon upgrading. See below for details.`]}),`
`,e.jsx(n.h2,{id:"versioning-convention",children:"Versioning Convention"}),`
`,e.jsx(n.p,{children:"Phoenix uses a standard three number versioning schema of the form:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"<major version> . <minor version> . <patch version>"})})})})}),`
`,e.jsxs(n.p,{children:["For example, ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"4.2.1"})})," has a major version of ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"4"})}),`,
a minor version of `,e.jsx(n.strong,{children:e.jsx(n.code,{children:"2"})}),", and a patch version of ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"1"})}),"."]}),`
`,e.jsx(n.h2,{id:"patch-release",children:"Patch Release"}),`
`,e.jsx(n.p,{children:"Upgrading to a new patch release (i.e. only the patch version has changed) is the simplest case. The jar upgrade may occur in any order: client first or server first, and a mix of clients with different patch release versions is fine."}),`
`,e.jsx(n.h2,{id:"minor-release",children:"Minor Release"}),`
`,e.jsxs(n.p,{children:[`When upgrading to a new minor release (i.e. the major version is the same, but the minor
version has changed), sometimes modifications to the system tables are necessary to either
fix a bug or provide a new feature. This upgrade will occur automatically the first time a
newly upgraded client connects to the newly upgraded server. It is `,e.jsx(n.strong,{children:"required"}),` that the
server-side jar be upgraded first across your entire cluster, before any clients are
upgraded. An older client (two minor versions back) will work with a newer server jar when
the minor version is different, but not vice versa. In other words, clients do not need to
be upgraded in lock step with the server. However, as the server version moves forward,
the client version should move forward as well. This allows Phoenix to evolve its client/server
protocol while still providing clients sufficient time to upgrade their clients.`]}),`
`,e.jsx(n.p,{children:`As of the 4.3 release, a mix of clients on different minor release versions is supported as well
(note that prior releases required all clients to be upgraded at the same time). Another improvement
as of the 4.3 release is that an upgrade may be done directly from one minor version to another
higher minor version (prior releases required an upgrade to each minor version in between).`}),`
`,e.jsx(n.h2,{id:"major-release",children:"Major Release"}),`
`,e.jsx(n.p,{children:`Upgrading to a new major release may require downtime as well as potentially the running of a migration
script. Additionally, all clients and servers may need to be upgraded at the same time. This will be
determined on a release-by-release basis.`}),`
`,e.jsx(n.h2,{id:"release-notes",children:"Release Notes"}),`
`,e.jsxs(n.p,{children:["Specific details on issues and their fixes that may impact you can be found ",e.jsx(n.a,{href:"/release-notes",children:"here"}),"."]})]})}function h(r={}){const{wrapper:n}=r.components||{};return n?e.jsx(n,{...r,children:e.jsx(i,{...r})}):i(r)}export{s as _markdown,h as default,a as extractedReferences,o as frontmatter,l as structuredData,d as toc};
