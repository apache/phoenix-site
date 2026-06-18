import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let l=`## Prerequisites

* Node.js 22.x (minimum \`22.12.0\`)
* npm (bundled with Node.js)

## Building Phoenix Project Website

1. Clone the repository:

\`\`\`shell
git clone git@github.com:apache/phoenix-site.git
cd phoenix-site
\`\`\`

2. During development, install dependencies:

\`\`\`shell
npm ci
\`\`\`

3. For local iteration, run checks/build directly when needed:

\`\`\`shell
npm run ci
\`\`\`

4. Before opening a pull request, run the mandatory build script:

\`\`\`shell
./build.sh
\`\`\`

\`build.sh\` is required for all contributors. It:

* ensures Node/npm are available
* runs a clean install (\`npm ci\`)
* runs full validation/build (\`npm run ci\`)
* copies \`build/client/\` into \`output/\`

There is no remote CI/CD runner currently executing this script. The generated \`output/\` directory is a build artifact that must be committed and pushed with your PR.

## Publishing Website Artifact

Current publishing flow:

1. Run \`./build.sh\` locally
2. Commit both source changes and updated \`output/\`
3. Push your branch and open a PR

After merge, \`output/\` is used as the website artifact for deployment.

## Local Testing During Development

Start the development server with hot reload:

\`\`\`shell
npm run dev
\`\`\`

By default, the website is available at:

\`\`\`shell
http://localhost:5173
\`\`\`

To test the production build locally:

\`\`\`shell
npm run start
\`\`\`
`,r={title:"Building Website",description:"Build and test the Apache Phoenix website locally with the current React + TypeScript workflow."},h=[],d={contents:[{heading:"building-website-prerequisites",content:"Node.js 22.x (minimum 22.12.0)"},{heading:"building-website-prerequisites",content:"npm (bundled with Node.js)"},{heading:"building-phoenix-project-website",content:"Clone the repository:"},{heading:"building-phoenix-project-website",content:"During development, install dependencies:"},{heading:"building-phoenix-project-website",content:"For local iteration, run checks/build directly when needed:"},{heading:"building-phoenix-project-website",content:"Before opening a pull request, run the mandatory build script:"},{heading:"building-phoenix-project-website",content:"build.sh is required for all contributors. It:"},{heading:"building-phoenix-project-website",content:"ensures Node/npm are available"},{heading:"building-phoenix-project-website",content:"runs a clean install (npm ci)"},{heading:"building-phoenix-project-website",content:"runs full validation/build (npm run ci)"},{heading:"building-phoenix-project-website",content:"copies build/client/ into output/"},{heading:"building-phoenix-project-website",content:"There is no remote CI/CD runner currently executing this script. The generated output/ directory is a build artifact that must be committed and pushed with your PR."},{heading:"publishing-website-artifact",content:"Current publishing flow:"},{heading:"publishing-website-artifact",content:"Run ./build.sh locally"},{heading:"publishing-website-artifact",content:"Commit both source changes and updated output/"},{heading:"publishing-website-artifact",content:"Push your branch and open a PR"},{heading:"publishing-website-artifact",content:"After merge, output/ is used as the website artifact for deployment."},{heading:"local-testing-during-development",content:"Start the development server with hot reload:"},{heading:"local-testing-during-development",content:"By default, the website is available at:"},{heading:"local-testing-during-development",content:"To test the production build locally:"}],headings:[{id:"building-website-prerequisites",content:"Prerequisites"},{id:"building-phoenix-project-website",content:"Building Phoenix Project Website"},{id:"publishing-website-artifact",content:"Publishing Website Artifact"},{id:"local-testing-during-development",content:"Local Testing During Development"}]};const a=[{depth:2,url:"#building-website-prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#building-phoenix-project-website",title:e.jsx(e.Fragment,{children:"Building Phoenix Project Website"})},{depth:2,url:"#publishing-website-artifact",title:e.jsx(e.Fragment,{children:"Publishing Website Artifact"})},{depth:2,url:"#local-testing-during-development",title:e.jsx(e.Fragment,{children:"Local Testing During Development"})}];function t(n){const i={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"building-website-prerequisites",children:"Prerequisites"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Node.js 22.x (minimum ",e.jsx(i.code,{children:"22.12.0"}),")"]}),`
`,e.jsx(i.li,{children:"npm (bundled with Node.js)"}),`
`]}),`
`,e.jsx(i.h2,{id:"building-phoenix-project-website",children:"Building Phoenix Project Website"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Clone the repository:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clone"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git@github.com:apache/phoenix-site.git"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" phoenix-site"})]})]})})}),`
`,e.jsxs(i.ol,{start:"2",children:[`
`,e.jsx(i.li,{children:"During development, install dependencies:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ci"})]})})})}),`
`,e.jsxs(i.ol,{start:"3",children:[`
`,e.jsx(i.li,{children:"For local iteration, run checks/build directly when needed:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ci"})]})})})}),`
`,e.jsxs(i.ol,{start:"4",children:[`
`,e.jsx(i.li,{children:"Before opening a pull request, run the mandatory build script:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./build.sh"})})})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"build.sh"})," is required for all contributors. It:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"ensures Node/npm are available"}),`
`,e.jsxs(i.li,{children:["runs a clean install (",e.jsx(i.code,{children:"npm ci"}),")"]}),`
`,e.jsxs(i.li,{children:["runs full validation/build (",e.jsx(i.code,{children:"npm run ci"}),")"]}),`
`,e.jsxs(i.li,{children:["copies ",e.jsx(i.code,{children:"build/client/"})," into ",e.jsx(i.code,{children:"output/"})]}),`
`]}),`
`,e.jsxs(i.p,{children:["There is no remote CI/CD runner currently executing this script. The generated ",e.jsx(i.code,{children:"output/"})," directory is a build artifact that must be committed and pushed with your PR."]}),`
`,e.jsx(i.h2,{id:"publishing-website-artifact",children:"Publishing Website Artifact"}),`
`,e.jsx(i.p,{children:"Current publishing flow:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["Run ",e.jsx(i.code,{children:"./build.sh"})," locally"]}),`
`,e.jsxs(i.li,{children:["Commit both source changes and updated ",e.jsx(i.code,{children:"output/"})]}),`
`,e.jsx(i.li,{children:"Push your branch and open a PR"}),`
`]}),`
`,e.jsxs(i.p,{children:["After merge, ",e.jsx(i.code,{children:"output/"})," is used as the website artifact for deployment."]}),`
`,e.jsx(i.h2,{id:"local-testing-during-development",children:"Local Testing During Development"}),`
`,e.jsx(i.p,{children:"Start the development server with hot reload:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev"})]})})})}),`
`,e.jsx(i.p,{children:"By default, the website is available at:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"http://localhost:5173"})})})})}),`
`,e.jsx(i.p,{children:"To test the production build locally:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"})]})})})})]})}function c(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{l as _markdown,c as default,h as extractedReferences,r as frontmatter,d as structuredData,a as toc};
