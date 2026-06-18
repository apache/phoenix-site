import{j as e}from"./jsx-runtime-fm7E3NsZ.js";let o=`## General process

The general process for contributing code to Phoenix works as follows:

1. Discuss your changes on the dev mailing list
2. Create a JIRA issue unless there already is one
3. Setup your development environment
4. Prepare a patch containing your changes
5. Submit the patch

These steps are explained in greater detail below.

Note that the instructions below are for the main Phoenix project.
Use the corresponding [repository](/source-repository) for the other subprojects.
Tephra and Omid also have their own [JIRA projects](/issues-tracking).

### Discuss on the mailing list

It's often best to discuss a change on the public mailing lists before creating and submitting a patch.

If you're unsure whether certain behavior in Phoenix is a bug, please send a mail to the [user mailing list](/mailing-lists) to check.

If you're considering adding major new functionality to Phoenix, it's a good idea to first discuss the idea on the [developer mailing list](/mailing-lists) to make sure that your plans are in line with others in the Phoenix community.

### Log a JIRA ticket

The first step is to create a ticket on the [Phoenix JIRA](https://issues.apache.org/jira/browse/PHOENIX).

### Setup development environment

To set up your development environment, see [these directions](/docs/contributing/develop).

### Generate a patch

There are two general approaches for creating and submitting a patch: GitHub pull requests, or manual patch creation with Git. Both are explained below. Please make sure that the patch applies cleanly on all active branches, including **master** and the unified **4.x** branch.

Regardless of which approach is taken, please make sure to follow the Phoenix code conventions (more information below). Whenever possible, unit tests or integration tests should be included with patches.

Please make sure that the patch contains only one commit, then click the "Submit patch" button to automatically trigger tests on the patch.

The commit message should reference the JIRA ticket issue (which has the format
\`PHOENIX-{NUMBER}:{JIRA-TITLE}\`).

To effectively get the patch reviewed, please raise the pull request against an appropriate branch.

#### Naming convention for the patch

When generating a patch, make sure the patch name uses the following format:
\`PHOENIX-{NUMBER}.{BRANCH-NAME}.{VERSION}.patch\`

Examples: \`PHOENIX-4872.master.v1.patch\`, \`PHOENIX-4872.master.v2.patch\`, \`PHOENIX-4872.4.x-HBase-1.3.v1.patch\`, etc.

#### GitHub workflow

1. Create a pull request in GitHub for the [mirror of the Phoenix Git repository](https://github.com/apache/phoenix).
2. Generate a patch and attach it to JIRA so Hadoop QA runs automated tests.
3. If you update the PR, generate a new patch with a different name so patch changes are detected and tests run for the new patch.

#### Local Git workflow

1. Create a local branch:
   \`\`\`shell
   git checkout -b <branch-name>
   \`\`\`
2. Make and commit changes
3. Generate a patch based on the JIRA issue number:
   \`\`\`shell
   git format-patch --stdout HEAD^ > PHOENIX-{NUMBER}.patch
   \`\`\`
4. Attach the created patch file to the JIRA ticket.

## Code conventions

The Phoenix code conventions are similar to the [Sun/Oracle Java Code Convention](https://www.oracle.com/technetwork/java/index-135089.html). We use 4 spaces (no tabs) for indentation and limit lines to 100 characters.

Eclipse code formatting settings and import order settings (which can also be imported into Intellij IDEA) are available in the dev directory of the Phoenix codebase.

All new source files should include the Apache license header.

## Committer workflow

In general, the "rebase" workflow should be used with the Phoenix codebase (see [this blog post](http://randyfay.com/content/rebase-workflow-git) for more information on the difference between "merge" and "rebase" workflows in Git).

A patch file can be downloaded from a GitHub pull request by adding \`.patch\` to the end of the pull request URL, for example: \`https://github.com/apache/phoenix/pull/35.patch\`.

When applying a user-contributed patch, use \`git am\` when a fully formatted patch file is available, as this preserves contributor contact information. Otherwise, add the contributor's name to the commit message.

If a single ticket consists of a patch with multiple commits, the commits can be squashed into a single commit using \`git rebase\`.
`,s={title:"Contributing",description:"Contribution workflow for Apache Phoenix, including JIRA, patch/PR submission, and committer practices."},r=[{href:"/source-repository"},{href:"/issues-tracking"},{href:"/mailing-lists"},{href:"/mailing-lists"},{href:"https://issues.apache.org/jira/browse/PHOENIX"},{href:"/docs/contributing/develop"},{href:"https://github.com/apache/phoenix"},{href:"https://www.oracle.com/technetwork/java/index-135089.html"},{href:"http://randyfay.com/content/rebase-workflow-git"}],h={contents:[{heading:"general-process",content:"The general process for contributing code to Phoenix works as follows:"},{heading:"general-process",content:"Discuss your changes on the dev mailing list"},{heading:"general-process",content:"Create a JIRA issue unless there already is one"},{heading:"general-process",content:"Setup your development environment"},{heading:"general-process",content:"Prepare a patch containing your changes"},{heading:"general-process",content:"Submit the patch"},{heading:"general-process",content:"These steps are explained in greater detail below."},{heading:"general-process",content:`Note that the instructions below are for the main Phoenix project.
Use the corresponding repository for the other subprojects.
Tephra and Omid also have their own JIRA projects.`},{heading:"discuss-on-the-mailing-list",content:"It's often best to discuss a change on the public mailing lists before creating and submitting a patch."},{heading:"discuss-on-the-mailing-list",content:"If you're unsure whether certain behavior in Phoenix is a bug, please send a mail to the user mailing list to check."},{heading:"discuss-on-the-mailing-list",content:"If you're considering adding major new functionality to Phoenix, it's a good idea to first discuss the idea on the developer mailing list to make sure that your plans are in line with others in the Phoenix community."},{heading:"log-a-jira-ticket",content:"The first step is to create a ticket on the Phoenix JIRA."},{heading:"setup-development-environment",content:"To set up your development environment, see these directions."},{heading:"generate-a-patch",content:"There are two general approaches for creating and submitting a patch: GitHub pull requests, or manual patch creation with Git. Both are explained below. Please make sure that the patch applies cleanly on all active branches, including master and the unified 4.x branch."},{heading:"generate-a-patch",content:"Regardless of which approach is taken, please make sure to follow the Phoenix code conventions (more information below). Whenever possible, unit tests or integration tests should be included with patches."},{heading:"generate-a-patch",content:'Please make sure that the patch contains only one commit, then click the "Submit patch" button to automatically trigger tests on the patch.'},{heading:"generate-a-patch",content:`The commit message should reference the JIRA ticket issue (which has the format
PHOENIX-{NUMBER}:{JIRA-TITLE}).`},{heading:"generate-a-patch",content:"To effectively get the patch reviewed, please raise the pull request against an appropriate branch."},{heading:"naming-convention-for-the-patch",content:`When generating a patch, make sure the patch name uses the following format:
PHOENIX-{NUMBER}.{BRANCH-NAME}.{VERSION}.patch`},{heading:"naming-convention-for-the-patch",content:"Examples: PHOENIX-4872.master.v1.patch, PHOENIX-4872.master.v2.patch, PHOENIX-4872.4.x-HBase-1.3.v1.patch, etc."},{heading:"github-workflow",content:"Create a pull request in GitHub for the mirror of the Phoenix Git repository."},{heading:"github-workflow",content:"Generate a patch and attach it to JIRA so Hadoop QA runs automated tests."},{heading:"github-workflow",content:"If you update the PR, generate a new patch with a different name so patch changes are detected and tests run for the new patch."},{heading:"local-git-workflow",content:"Create a local branch:"},{heading:"local-git-workflow",content:"Make and commit changes"},{heading:"local-git-workflow",content:"Generate a patch based on the JIRA issue number:"},{heading:"local-git-workflow",content:"Attach the created patch file to the JIRA ticket."},{heading:"code-conventions",content:"The Phoenix code conventions are similar to the Sun/Oracle Java Code Convention. We use 4 spaces (no tabs) for indentation and limit lines to 100 characters."},{heading:"code-conventions",content:"Eclipse code formatting settings and import order settings (which can also be imported into Intellij IDEA) are available in the dev directory of the Phoenix codebase."},{heading:"code-conventions",content:"All new source files should include the Apache license header."},{heading:"committer-workflow",content:'In general, the "rebase" workflow should be used with the Phoenix codebase (see this blog post for more information on the difference between "merge" and "rebase" workflows in Git).'},{heading:"committer-workflow",content:"A patch file can be downloaded from a GitHub pull request by adding .patch to the end of the pull request URL, for example: https://github.com/apache/phoenix/pull/35.patch."},{heading:"committer-workflow",content:"When applying a user-contributed patch, use git am when a fully formatted patch file is available, as this preserves contributor contact information. Otherwise, add the contributor's name to the commit message."},{heading:"committer-workflow",content:"If a single ticket consists of a patch with multiple commits, the commits can be squashed into a single commit using git rebase."}],headings:[{id:"general-process",content:"General process"},{id:"discuss-on-the-mailing-list",content:"Discuss on the mailing list"},{id:"log-a-jira-ticket",content:"Log a JIRA ticket"},{id:"setup-development-environment",content:"Setup development environment"},{id:"generate-a-patch",content:"Generate a patch"},{id:"naming-convention-for-the-patch",content:"Naming convention for the patch"},{id:"github-workflow",content:"GitHub workflow"},{id:"local-git-workflow",content:"Local Git workflow"},{id:"code-conventions",content:"Code conventions"},{id:"committer-workflow",content:"Committer workflow"}]};const c=[{depth:2,url:"#general-process",title:e.jsx(e.Fragment,{children:"General process"})},{depth:3,url:"#discuss-on-the-mailing-list",title:e.jsx(e.Fragment,{children:"Discuss on the mailing list"})},{depth:3,url:"#log-a-jira-ticket",title:e.jsx(e.Fragment,{children:"Log a JIRA ticket"})},{depth:3,url:"#setup-development-environment",title:e.jsx(e.Fragment,{children:"Setup development environment"})},{depth:3,url:"#generate-a-patch",title:e.jsx(e.Fragment,{children:"Generate a patch"})},{depth:4,url:"#naming-convention-for-the-patch",title:e.jsx(e.Fragment,{children:"Naming convention for the patch"})},{depth:4,url:"#github-workflow",title:e.jsx(e.Fragment,{children:"GitHub workflow"})},{depth:4,url:"#local-git-workflow",title:e.jsx(e.Fragment,{children:"Local Git workflow"})},{depth:2,url:"#code-conventions",title:e.jsx(e.Fragment,{children:"Code conventions"})},{depth:2,url:"#committer-workflow",title:e.jsx(e.Fragment,{children:"Committer workflow"})}];function i(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"general-process",children:"General process"}),`
`,e.jsx(t.p,{children:"The general process for contributing code to Phoenix works as follows:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Discuss your changes on the dev mailing list"}),`
`,e.jsx(t.li,{children:"Create a JIRA issue unless there already is one"}),`
`,e.jsx(t.li,{children:"Setup your development environment"}),`
`,e.jsx(t.li,{children:"Prepare a patch containing your changes"}),`
`,e.jsx(t.li,{children:"Submit the patch"}),`
`]}),`
`,e.jsx(t.p,{children:"These steps are explained in greater detail below."}),`
`,e.jsxs(t.p,{children:[`Note that the instructions below are for the main Phoenix project.
Use the corresponding `,e.jsx(t.a,{href:"/source-repository",children:"repository"}),` for the other subprojects.
Tephra and Omid also have their own `,e.jsx(t.a,{href:"/issues-tracking",children:"JIRA projects"}),"."]}),`
`,e.jsx(t.h3,{id:"discuss-on-the-mailing-list",children:"Discuss on the mailing list"}),`
`,e.jsx(t.p,{children:"It's often best to discuss a change on the public mailing lists before creating and submitting a patch."}),`
`,e.jsxs(t.p,{children:["If you're unsure whether certain behavior in Phoenix is a bug, please send a mail to the ",e.jsx(t.a,{href:"/mailing-lists",children:"user mailing list"})," to check."]}),`
`,e.jsxs(t.p,{children:["If you're considering adding major new functionality to Phoenix, it's a good idea to first discuss the idea on the ",e.jsx(t.a,{href:"/mailing-lists",children:"developer mailing list"})," to make sure that your plans are in line with others in the Phoenix community."]}),`
`,e.jsx(t.h3,{id:"log-a-jira-ticket",children:"Log a JIRA ticket"}),`
`,e.jsxs(t.p,{children:["The first step is to create a ticket on the ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/PHOENIX",children:"Phoenix JIRA"}),"."]}),`
`,e.jsx(t.h3,{id:"setup-development-environment",children:"Setup development environment"}),`
`,e.jsxs(t.p,{children:["To set up your development environment, see ",e.jsx(t.a,{href:"/docs/contributing/develop",children:"these directions"}),"."]}),`
`,e.jsx(t.h3,{id:"generate-a-patch",children:"Generate a patch"}),`
`,e.jsxs(t.p,{children:["There are two general approaches for creating and submitting a patch: GitHub pull requests, or manual patch creation with Git. Both are explained below. Please make sure that the patch applies cleanly on all active branches, including ",e.jsx(t.strong,{children:"master"})," and the unified ",e.jsx(t.strong,{children:"4.x"})," branch."]}),`
`,e.jsx(t.p,{children:"Regardless of which approach is taken, please make sure to follow the Phoenix code conventions (more information below). Whenever possible, unit tests or integration tests should be included with patches."}),`
`,e.jsx(t.p,{children:'Please make sure that the patch contains only one commit, then click the "Submit patch" button to automatically trigger tests on the patch.'}),`
`,e.jsxs(t.p,{children:[`The commit message should reference the JIRA ticket issue (which has the format
`,e.jsx(t.code,{children:"PHOENIX-{NUMBER}:{JIRA-TITLE}"}),")."]}),`
`,e.jsx(t.p,{children:"To effectively get the patch reviewed, please raise the pull request against an appropriate branch."}),`
`,e.jsx(t.h4,{id:"naming-convention-for-the-patch",children:"Naming convention for the patch"}),`
`,e.jsxs(t.p,{children:[`When generating a patch, make sure the patch name uses the following format:
`,e.jsx(t.code,{children:"PHOENIX-{NUMBER}.{BRANCH-NAME}.{VERSION}.patch"})]}),`
`,e.jsxs(t.p,{children:["Examples: ",e.jsx(t.code,{children:"PHOENIX-4872.master.v1.patch"}),", ",e.jsx(t.code,{children:"PHOENIX-4872.master.v2.patch"}),", ",e.jsx(t.code,{children:"PHOENIX-4872.4.x-HBase-1.3.v1.patch"}),", etc."]}),`
`,e.jsx(t.h4,{id:"github-workflow",children:"GitHub workflow"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Create a pull request in GitHub for the ",e.jsx(t.a,{href:"https://github.com/apache/phoenix",children:"mirror of the Phoenix Git repository"}),"."]}),`
`,e.jsx(t.li,{children:"Generate a patch and attach it to JIRA so Hadoop QA runs automated tests."}),`
`,e.jsx(t.li,{children:"If you update the PR, generate a new patch with a different name so patch changes are detected and tests run for the new patch."}),`
`]}),`
`,e.jsx(t.h4,{id:"local-git-workflow",children:"Local Git workflow"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Create a local branch:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -b"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"branch-nam"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`]}),`
`,e.jsx(t.li,{children:"Make and commit changes"}),`
`,e.jsxs(t.li,{children:["Generate a patch based on the JIRA issue number:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" format-patch"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdout"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HEAD^"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" PHOENIX-{NUMBER}.patch"})]})})})}),`
`]}),`
`,e.jsx(t.li,{children:"Attach the created patch file to the JIRA ticket."}),`
`]}),`
`,e.jsx(t.h2,{id:"code-conventions",children:"Code conventions"}),`
`,e.jsxs(t.p,{children:["The Phoenix code conventions are similar to the ",e.jsx(t.a,{href:"https://www.oracle.com/technetwork/java/index-135089.html",children:"Sun/Oracle Java Code Convention"}),". We use 4 spaces (no tabs) for indentation and limit lines to 100 characters."]}),`
`,e.jsx(t.p,{children:"Eclipse code formatting settings and import order settings (which can also be imported into Intellij IDEA) are available in the dev directory of the Phoenix codebase."}),`
`,e.jsx(t.p,{children:"All new source files should include the Apache license header."}),`
`,e.jsx(t.h2,{id:"committer-workflow",children:"Committer workflow"}),`
`,e.jsxs(t.p,{children:['In general, the "rebase" workflow should be used with the Phoenix codebase (see ',e.jsx(t.a,{href:"http://randyfay.com/content/rebase-workflow-git",children:"this blog post"}),' for more information on the difference between "merge" and "rebase" workflows in Git).']}),`
`,e.jsxs(t.p,{children:["A patch file can be downloaded from a GitHub pull request by adding ",e.jsx(t.code,{children:".patch"})," to the end of the pull request URL, for example: ",e.jsx(t.code,{children:"https://github.com/apache/phoenix/pull/35.patch"}),"."]}),`
`,e.jsxs(t.p,{children:["When applying a user-contributed patch, use ",e.jsx(t.code,{children:"git am"})," when a fully formatted patch file is available, as this preserves contributor contact information. Otherwise, add the contributor's name to the commit message."]}),`
`,e.jsxs(t.p,{children:["If a single ticket consists of a patch with multiple commits, the commits can be squashed into a single commit using ",e.jsx(t.code,{children:"git rebase"}),"."]})]})}function l(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{o as _markdown,l as default,r as extractedReferences,s as frontmatter,h as structuredData,c as toc};
