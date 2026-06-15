import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let h=`## Building the Main Phoenix Project

Phoenix consists of several subprojects.

The core project is \`phoenix\`, which depends on \`phoenix-thirdparty\`, \`phoenix-omid\`, and \`phoenix-tephra\`.

\`phoenix-queryserver\` and \`phoenix-connectors\` are optional packages that also depend on \`phoenix\`.

Check out the [source](/source-repository) and follow the build instructions in \`BUILDING.md\` (or \`README.md\`) in the repository root.

## Using Phoenix in a Maven Project

Phoenix artifacts are published to Apache and Maven Central repositories. Add the dependency below to your \`pom.xml\`:

\`\`\`xml
<dependencies>
  <dependency>
    <groupId>org.apache.phoenix</groupId>
    <artifactId>phoenix-client-hbase-[hbase.profile]</artifactId>
    <version>[phoenix.version]</version>
  </dependency>
</dependencies>
\`\`\`

Where:

* \`[phoenix.version]\` is the Phoenix release version (for example, \`5.1.2\` or \`4.16.1\`)
* \`[hbase.profile]\` is the compatible HBase profile

See [Downloads](/downloads) for supported release/profile combinations.

## Branches

The main Phoenix project currently has two active branches.

* \`4.x\` works with HBase 1 and Hadoop 2
* \`5.x\` works with HBase 2 and Hadoop 3

See [Downloads](/downloads) and \`BUILDING.md\` for exact version compatibility by release.

See also:

* [Building Project Website](/docs/contributing/building-website)
* [How to Release](/docs/contributing/how-to-release)
`,r={title:"Building",description:"Build Apache Phoenix and add it to Maven-based projects."},t=[{href:"/source-repository"},{href:"/downloads"},{href:"/downloads"},{href:"/docs/contributing/building-website"},{href:"/docs/contributing/how-to-release"}],a={contents:[{heading:"building-the-main-phoenix-project",content:"Phoenix consists of several subprojects."},{heading:"building-the-main-phoenix-project",content:"The core project is phoenix, which depends on phoenix-thirdparty, phoenix-omid, and phoenix-tephra."},{heading:"building-the-main-phoenix-project",content:"phoenix-queryserver and phoenix-connectors are optional packages that also depend on phoenix."},{heading:"building-the-main-phoenix-project",content:"Check out the source and follow the build instructions in BUILDING.md (or README.md) in the repository root."},{heading:"using-phoenix-in-a-maven-project",content:"Phoenix artifacts are published to Apache and Maven Central repositories. Add the dependency below to your pom.xml:"},{heading:"using-phoenix-in-a-maven-project",content:"Where:"},{heading:"using-phoenix-in-a-maven-project",content:"[phoenix.version] is the Phoenix release version (for example, 5.1.2 or 4.16.1)"},{heading:"using-phoenix-in-a-maven-project",content:"[hbase.profile] is the compatible HBase profile"},{heading:"using-phoenix-in-a-maven-project",content:"See Downloads for supported release/profile combinations."},{heading:"branches",content:"The main Phoenix project currently has two active branches."},{heading:"branches",content:"4.x works with HBase 1 and Hadoop 2"},{heading:"branches",content:"5.x works with HBase 2 and Hadoop 3"},{heading:"branches",content:"See Downloads and BUILDING.md for exact version compatibility by release."},{heading:"branches",content:"See also:"},{heading:"branches",content:"Building Project Website"},{heading:"branches",content:"How to Release"}],headings:[{id:"building-the-main-phoenix-project",content:"Building the Main Phoenix Project"},{id:"using-phoenix-in-a-maven-project",content:"Using Phoenix in a Maven Project"},{id:"branches",content:"Branches"}]};const d=[{depth:2,url:"#building-the-main-phoenix-project",title:e.jsx(e.Fragment,{children:"Building the Main Phoenix Project"})},{depth:2,url:"#using-phoenix-in-a-maven-project",title:e.jsx(e.Fragment,{children:"Using Phoenix in a Maven Project"})},{depth:2,url:"#branches",title:e.jsx(e.Fragment,{children:"Branches"})}];function s(i){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"building-the-main-phoenix-project",children:"Building the Main Phoenix Project"}),`
`,e.jsx(n.p,{children:"Phoenix consists of several subprojects."}),`
`,e.jsxs(n.p,{children:["The core project is ",e.jsx(n.code,{children:"phoenix"}),", which depends on ",e.jsx(n.code,{children:"phoenix-thirdparty"}),", ",e.jsx(n.code,{children:"phoenix-omid"}),", and ",e.jsx(n.code,{children:"phoenix-tephra"}),"."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"phoenix-queryserver"})," and ",e.jsx(n.code,{children:"phoenix-connectors"})," are optional packages that also depend on ",e.jsx(n.code,{children:"phoenix"}),"."]}),`
`,e.jsxs(n.p,{children:["Check out the ",e.jsx(n.a,{href:"/source-repository",children:"source"})," and follow the build instructions in ",e.jsx(n.code,{children:"BUILDING.md"})," (or ",e.jsx(n.code,{children:"README.md"}),") in the repository root."]}),`
`,e.jsx(n.h2,{id:"using-phoenix-in-a-maven-project",children:"Using Phoenix in a Maven Project"}),`
`,e.jsxs(n.p,{children:["Phoenix artifacts are published to Apache and Maven Central repositories. Add the dependency below to your ",e.jsx(n.code,{children:"pom.xml"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependencies"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"groupId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">phoenix-client-hbase-[hbase.profile]</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"artifactId"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">[phoenix.version]</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"version"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependency"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"dependencies"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:"Where:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"[phoenix.version]"})," is the Phoenix release version (for example, ",e.jsx(n.code,{children:"5.1.2"})," or ",e.jsx(n.code,{children:"4.16.1"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"[hbase.profile]"})," is the compatible HBase profile"]}),`
`]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/downloads",children:"Downloads"})," for supported release/profile combinations."]}),`
`,e.jsx(n.h2,{id:"branches",children:"Branches"}),`
`,e.jsx(n.p,{children:"The main Phoenix project currently has two active branches."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"4.x"})," works with HBase 1 and Hadoop 2"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"5.x"})," works with HBase 2 and Hadoop 3"]}),`
`]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/downloads",children:"Downloads"})," and ",e.jsx(n.code,{children:"BUILDING.md"})," for exact version compatibility by release."]}),`
`,e.jsx(n.p,{children:"See also:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/contributing/building-website",children:"Building Project Website"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/contributing/how-to-release",children:"How to Release"})}),`
`]})]})}function c(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{h as _markdown,c as default,t as extractedReferences,r as frontmatter,a as structuredData,d as toc};
