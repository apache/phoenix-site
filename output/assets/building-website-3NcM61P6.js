import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`## Prerequisites

* Node.js 22.x (minimum \`22.12.0\`)
* npm (bundled with Node.js)

## Building Phoenix Project Website

1. Clone the repository:

\`\`\`shell
git clone git@github.com:apache/phoenix-site.git
cd phoenix-site
\`\`\`

2. Install dependencies:

\`\`\`shell
npm ci
\`\`\`

3. Generate language reference pages and Fumadocs metadata:

\`\`\`shell
npm run generate-language
npm run fumadocs-init
\`\`\`

4. Build the production website:

\`\`\`shell
npm run build
\`\`\`

The generated site is under \`build/client/\`.

For CI-style validation (lint, typecheck, unit/e2e tests, and build), run:

\`\`\`shell
npm run ci
\`\`\`

On Linux runners, you can use the root \`build.sh\` script, which bootstraps Node via \`nvm\` when needed, runs \`npm ci\`, and then runs \`npm run ci\`.

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
`,h={title:"Building Website",description:"Build and test the Apache Phoenix website locally with the current React + TypeScript workflow."},r=[],a={contents:[{heading:"building-website-prerequisites",content:"Node.js 22.x (minimum 22.12.0)"},{heading:"building-website-prerequisites",content:"npm (bundled with Node.js)"},{heading:"building-phoenix-project-website",content:"Clone the repository:"},{heading:"building-phoenix-project-website",content:"Install dependencies:"},{heading:"building-phoenix-project-website",content:"Generate language reference pages and Fumadocs metadata:"},{heading:"building-phoenix-project-website",content:"Build the production website:"},{heading:"building-phoenix-project-website",content:"The generated site is under build/client/."},{heading:"building-phoenix-project-website",content:"For CI-style validation (lint, typecheck, unit/e2e tests, and build), run:"},{heading:"building-phoenix-project-website",content:"On Linux runners, you can use the root build.sh script, which bootstraps Node via nvm when needed, runs npm ci, and then runs npm run ci."},{heading:"local-testing-during-development",content:"Start the development server with hot reload:"},{heading:"local-testing-during-development",content:"By default, the website is available at:"},{heading:"local-testing-during-development",content:"To test the production build locally:"}],headings:[{id:"building-website-prerequisites",content:"Prerequisites"},{id:"building-phoenix-project-website",content:"Building Phoenix Project Website"},{id:"local-testing-during-development",content:"Local Testing During Development"}]};const d=[{depth:2,url:"#building-website-prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:2,url:"#building-phoenix-project-website",title:e.jsx(e.Fragment,{children:"Building Phoenix Project Website"})},{depth:2,url:"#local-testing-during-development",title:e.jsx(e.Fragment,{children:"Local Testing During Development"})}];function s(n){const i={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"building-website-prerequisites",children:"Prerequisites"}),`
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
`,e.jsx(i.li,{children:"Install dependencies:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ci"})]})})})}),`
`,e.jsxs(i.ol,{start:"3",children:[`
`,e.jsx(i.li,{children:"Generate language reference pages and Fumadocs metadata:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" generate-language"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" fumadocs-init"})]})]})})}),`
`,e.jsxs(i.ol,{start:"4",children:[`
`,e.jsx(i.li,{children:"Build the production website:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" build"})]})})})}),`
`,e.jsxs(i.p,{children:["The generated site is under ",e.jsx(i.code,{children:"build/client/"}),"."]}),`
`,e.jsx(i.p,{children:"For CI-style validation (lint, typecheck, unit/e2e tests, and build), run:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ci"})]})})})}),`
`,e.jsxs(i.p,{children:["On Linux runners, you can use the root ",e.jsx(i.code,{children:"build.sh"})," script, which bootstraps Node via ",e.jsx(i.code,{children:"nvm"})," when needed, runs ",e.jsx(i.code,{children:"npm ci"}),", and then runs ",e.jsx(i.code,{children:"npm run ci"}),"."]}),`
`,e.jsx(i.h2,{id:"local-testing-during-development",children:"Local Testing During Development"}),`
`,e.jsx(i.p,{children:"Start the development server with hot reload:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev"})]})})})}),`
`,e.jsx(i.p,{children:"By default, the website is available at:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"http://localhost:5173"})})})})}),`
`,e.jsx(i.p,{children:"To test the production build locally:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"})]})})})})]})}function c(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{l as _markdown,c as default,r as extractedReferences,h as frontmatter,a as structuredData,d as toc};
