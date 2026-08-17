import{j as e}from"./jsx-runtime-CUISpl0r.js";let r=`## Getting Started

1. Review the [How to Contribute](/docs/contributing) documentation.
2. Sign up for a [GitHub](https://github.com/) account if you do not have one.
3. Go to the [Phoenix GitHub repository](https://github.com/apache/phoenix) and create a fork, which creates \`{username}/phoenix\`.
4. Set up Git locally.
   * [Instructions](https://help.github.com/articles/set-up-git/)
   * [Download](https://git-scm.com/downloads)
5. Make sure you have a JDK (Phoenix historically required [JDK 7](https://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html)).
6. Make sure you have [Maven 3+](https://maven.apache.org/download.cgi) installed.
7. Add the following to your \`.bashrc\` or equivalent to ensure Maven and Java are configured correctly for command-line usage.

\`\`\`shell
export JAVA_HOME={path to jdk}
export JDK_HOME={path to jdk}
export M2_HOME={path to maven}
export PATH=$M2_HOME/bin:$PATH
\`\`\`

## Other Phoenix Subprojects

The instructions here are for the main Phoenix project. For the other subprojects, use the corresponding [repository](/source-repository) and [JIRA project](/issues-tracking).

The Eclipse and IntelliJ setup instructions may not necessarily work well for the other projects.

## Setup Local Git Repository

You may find it easier to clone from your IDE of choice, especially with IntelliJ.

1. Create a local clone of your new forked repository

   \`\`\`shell
   git clone https://github.com/{username}/phoenix.git
   \`\`\`

2. Configure your local repository to be able to sync with the apache/phoenix repository

   \`\`\`shell
   cd {repository}
   git remote add upstream https://github.com/apache/phoenix.git
   \`\`\`

3. Setup your development environment

## For Eclipse IDE for Java Developers (Luna)

1. [Download Eclipse](https://eclipse.org/downloads/packages/eclipse-ide-java-developers/lunar)
   * You will want 'Eclipse IDE for Java Developers' unless you want to install the following tools by hand
     * [m2e](http://download.eclipse.org/technology/m2e/releases/)
     * [egit](http://www.eclipse.org/egit/download/)
2. Configure Eclipse to handle Maven Issues appropriately so you don't see unnecessary errors.
   * Window -> Preferences -> Maven -> Errors/Warnings
   * Choose Ignore option for 'Plugin execution not covered by lifecycle configuration' -> Ok
3. Add the local Git repository to Eclipse
   * Window -> Show View -> Other... -> Git | Git Repositories -> Ok
   * Click 'Add an existing local Git Repository to this view'
   * Search for appropriate git repository
   * Finish
4. Import Maven Projects
   * File -> Import -> Maven -> Existing Maven Projects
   * Choose Root directory where phoenix git repository is located
   * Select All
   * Finish
5. Generate Lexer and Parser Files
   * Select phoenix-core project
   * Run -> Run As -> Maven generate-sources
6. Make sure you are setup to develop now.
   * Open IndexUtilTest.Java
   * Run -> Run As -> JUnit Test

### Get Settings and Preferences Correct

1. Import General Preferences
   * File -> Import... -> General -> Preferences
   * From - \`{repository}/dev/eclipse_prefs_phoenix.epf\`
   * Import All
   * Finish
2. Import Code Templates
   * Window -> Preferences -> Java -> Code Style -> Code Templates -> Import...
   * Navigate to \`{repository}/dev/PhoenixCodeTemplate.xml\` -> Ok
3. Import Formatter
   * Window -> Preferences -> Java -> Code Style -> Formatter-> Import...
   * Navigate to \`{repository}/dev/PhoenixCodeTemplate.xml\` -> Ok
4. Import correct import order settings
   * Window -> Preferences -> Java -> Code Style -> Organize Imports -> Import...
   * Navigate to \`{repository}/dev/phoenix.importorder\` -> Ok
5. Make sure you use space for tabs
   * Window -> Preferences -> General -> Editors -> Text Editors
   * Select 'Insert Spaces for tabs' -> Ok

### Connecting to Jira

1. Install Connector for Jira
   * Help -> Install New Software -> Add
   * Location - [https://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7](https://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7) -> Atlassian Connector
   * Finish
2. Add Task Repository
   * Window -> Show View -> Mylyn -> Task Repositories -> Add Task Repository
   * JIRA -> Next -> Server - [https://issues.apache.org/jira](https://issues.apache.org/jira) -> Validate Settings
   * Finish
3. Add Filter Of All JIRAs assigned to you
   * Right Click on Repository You added -> New Query... -> Predefined Filter
   * Select Phoenix Project -> Select Assigned to me
   * Finish

### Commit

1. Commit Changes and Push to Github with appropriate Message
   * CTRL-# -> Set Commit message to include jira number at beginning PHOENIX-####
   * Commit and Push

## For Intellij

* [Download IntelliJ](https://www.jetbrains.com/idea/download/)

### If you don't have a local git repository setup

This will automatically create the local clone of your repository for you. You will still want to add the remote upstream repository from above afterwards.

1. Clone Github project and Import Maven Projects to IDE
   * Check out from Version Control -> GitHub -> Enter your GitHub Login Info
   * \`https://github.com/{username}/phoenix.git\` -> Check out from Version Control | Yes
2. Generate Parser and Lexer Files
   * Maven Projects -> Phoenix Core -> Lifecycle -> compile
3. Compile Project
   * Build -> Make Project
4. Make sure you are setup to develop now.
   * Open IndexUtilTest.Java -> Run -> Run IndexUtilTest

### If you already have a local git repository setup

1. Import Projects
   * Import Project
   * Select Directory of your local repository -> Next
   * Import project from external model -> Maven -> Next
   * Select 'Import Maven project automatically'
   * Select 'Create IntelliJ IDEA modules for aggregator projects'
   * Select 'Keep source and test folders on reimport'
   * Select 'Exclude build directory'
   * Select 'Use Maven output directories' -> Next
   * Select maven-3 -> Next
   * Next a whole bunch
2. Generate Parser and Lexer Files
   * Maven Projects -> Phoenix Core -> Lifecycle -> compile
3. Compile Project
   * Build -> Make Project
4. Make sure you are setup to develop now.
   * Open IndexUtilTest.Java -> Run -> Run IndexUtilTest

### Get Settings and Preferences Correct

1. Import Settings from eclipse profile
   * File -> Settings -> Editor -> Code Style -> Java
   * Set From... -> Import... -> Eclipse XML Profile -> \`{repository}/dev/PhoenixCodeTemplate.xml\`

### Connecting to Jira

1. Create Connection to Apache Jira
   * Tools -> Tasks and Contexts -> Configure Servers -> + -> Jira ->
   * Server Url: \`https://issues.apache.org/jira\`
   * Query: 'project=Phoenix and ...'
2. Switch Easily between Tasks
   * Tools-> Tasks and Contexts -> Open Task->PHOENIX-####
   * Select Create branch PHOENIX-#### from master->OK

### Commit

1. Commit Changes and Push to Github with appropriate Message
   * VCS -> Commit -> Set Commit message to include jira number PHOENIX-####
   * Commit and Push

## Contributing finished work

### Create pull request

1. Review the [How to Contribute](/docs/contributing) documentation.
2. Navigate to branch: \`https://github.com/{username}/phoenix/tree/{branchname}\`
3. Click Pull Request
4. Confirm that you see \`apache:master ... {username}:{branchname}\`
5. Make sure the pull request title begins with the JIRA key, for example \`PHOENIX-####\`.
6. Click Create pull request.
`,s={title:"Developing Phoenix",description:"Set up a local Apache Phoenix development environment, IDE preferences, and contribution workflow."},a=[{href:"/docs/contributing"},{href:"https://github.com/"},{href:"https://github.com/apache/phoenix"},{href:"https://help.github.com/articles/set-up-git/"},{href:"https://git-scm.com/downloads"},{href:"https://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html"},{href:"https://maven.apache.org/download.cgi"},{href:"/source-repository"},{href:"/issues-tracking"},{href:"https://eclipse.org/downloads/packages/eclipse-ide-java-developers/lunar"},{href:"http://download.eclipse.org/technology/m2e/releases/"},{href:"http://www.eclipse.org/egit/download/"},{href:"https://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7"},{href:"https://issues.apache.org/jira"},{href:"https://www.jetbrains.com/idea/download/"},{href:"/docs/contributing"}],l={contents:[{heading:"develop-getting-started",content:"Review the How to Contribute documentation."},{heading:"develop-getting-started",content:"Sign up for a GitHub account if you do not have one."},{heading:"develop-getting-started",content:"Go to the Phoenix GitHub repository and create a fork, which creates `{username}/phoenix`."},{heading:"develop-getting-started",content:"Set up Git locally."},{heading:"develop-getting-started",content:"Instructions"},{heading:"develop-getting-started",content:"Download"},{heading:"develop-getting-started",content:"Make sure you have a JDK (Phoenix historically required JDK 7)."},{heading:"develop-getting-started",content:"Make sure you have Maven 3+ installed."},{heading:"develop-getting-started",content:"Add the following to your `.bashrc` or equivalent to ensure Maven and Java are configured correctly for command-line usage."},{heading:"other-phoenix-subprojects",content:"The instructions here are for the main Phoenix project. For the other subprojects, use the corresponding repository and JIRA project."},{heading:"other-phoenix-subprojects",content:"The Eclipse and IntelliJ setup instructions may not necessarily work well for the other projects."},{heading:"setup-local-git-repository",content:"You may find it easier to clone from your IDE of choice, especially with IntelliJ."},{heading:"setup-local-git-repository",content:"Create a local clone of your new forked repository"},{heading:"setup-local-git-repository",content:"Configure your local repository to be able to sync with the apache/phoenix repository"},{heading:"setup-local-git-repository",content:"Setup your development environment"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Download Eclipse"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"You will want 'Eclipse IDE for Java Developers' unless you want to install the following tools by hand"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"m2e"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"egit"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Configure Eclipse to handle Maven Issues appropriately so you don't see unnecessary errors."},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Window -> Preferences -> Maven -> Errors/Warnings"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Choose Ignore option for 'Plugin execution not covered by lifecycle configuration' -> Ok"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Add the local Git repository to Eclipse"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Window -> Show View -> Other... -> Git | Git Repositories -> Ok"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Click 'Add an existing local Git Repository to this view'"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Search for appropriate git repository"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Finish"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Import Maven Projects"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"File -> Import -> Maven -> Existing Maven Projects"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Choose Root directory where phoenix git repository is located"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Select All"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Finish"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Generate Lexer and Parser Files"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Select phoenix-core project"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Run -> Run As -> Maven generate-sources"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Make sure you are setup to develop now."},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Open IndexUtilTest.Java"},{heading:"for-eclipse-ide-for-java-developers-luna",content:"Run -> Run As -> JUnit Test"},{heading:"get-settings-and-preferences-correct",content:"Import General Preferences"},{heading:"get-settings-and-preferences-correct",content:"File -> Import... -> General -> Preferences"},{heading:"get-settings-and-preferences-correct",content:"From - `{repository}/dev/eclipse_prefs_phoenix.epf`"},{heading:"get-settings-and-preferences-correct",content:"Import All"},{heading:"get-settings-and-preferences-correct",content:"Finish"},{heading:"get-settings-and-preferences-correct",content:"Import Code Templates"},{heading:"get-settings-and-preferences-correct",content:"Window -> Preferences -> Java -> Code Style -> Code Templates -> Import..."},{heading:"get-settings-and-preferences-correct",content:"Navigate to `{repository}/dev/PhoenixCodeTemplate.xml` -> Ok"},{heading:"get-settings-and-preferences-correct",content:"Import Formatter"},{heading:"get-settings-and-preferences-correct",content:"Window -> Preferences -> Java -> Code Style -> Formatter-> Import..."},{heading:"get-settings-and-preferences-correct",content:"Navigate to `{repository}/dev/PhoenixCodeTemplate.xml` -> Ok"},{heading:"get-settings-and-preferences-correct",content:"Import correct import order settings"},{heading:"get-settings-and-preferences-correct",content:"Window -> Preferences -> Java -> Code Style -> Organize Imports -> Import..."},{heading:"get-settings-and-preferences-correct",content:"Navigate to `{repository}/dev/phoenix.importorder` -> Ok"},{heading:"get-settings-and-preferences-correct",content:"Make sure you use space for tabs"},{heading:"get-settings-and-preferences-correct",content:"Window -> Preferences -> General -> Editors -> Text Editors"},{heading:"get-settings-and-preferences-correct",content:"Select 'Insert Spaces for tabs' -> Ok"},{heading:"connecting-to-jira",content:"Install Connector for Jira"},{heading:"connecting-to-jira",content:"Help -> Install New Software -> Add"},{heading:"connecting-to-jira",content:"Location - https\\://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7 -> Atlassian Connector"},{heading:"connecting-to-jira",content:"Finish"},{heading:"connecting-to-jira",content:"Add Task Repository"},{heading:"connecting-to-jira",content:"Window -> Show View -> Mylyn -> Task Repositories -> Add Task Repository"},{heading:"connecting-to-jira",content:"JIRA -> Next -> Server - https\\://issues.apache.org/jira -> Validate Settings"},{heading:"connecting-to-jira",content:"Finish"},{heading:"connecting-to-jira",content:"Add Filter Of All JIRAs assigned to you"},{heading:"connecting-to-jira",content:"Right Click on Repository You added -> New Query... -> Predefined Filter"},{heading:"connecting-to-jira",content:"Select Phoenix Project -> Select Assigned to me"},{heading:"connecting-to-jira",content:"Finish"},{heading:"commit",content:"Commit Changes and Push to Github with appropriate Message"},{heading:"commit",content:"CTRL-# -> Set Commit message to include jira number at beginning PHOENIX-####"},{heading:"commit",content:"Commit and Push"},{heading:"for-intellij",content:"Download IntelliJ"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"This will automatically create the local clone of your repository for you. You will still want to add the remote upstream repository from above afterwards."},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Clone Github project and Import Maven Projects to IDE"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Check out from Version Control -> GitHub -> Enter your GitHub Login Info"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"`https://github.com/{username}/phoenix.git` -> Check out from Version Control | Yes"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Generate Parser and Lexer Files"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Maven Projects -> Phoenix Core -> Lifecycle -> compile"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Compile Project"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Build -> Make Project"},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Make sure you are setup to develop now."},{heading:"if-you-dont-have-a-local-git-repository-setup",content:"Open IndexUtilTest.Java -> Run -> Run IndexUtilTest"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Import Projects"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Import Project"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select Directory of your local repository -> Next"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Import project from external model -> Maven -> Next"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select 'Import Maven project automatically'"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select 'Create IntelliJ IDEA modules for aggregator projects'"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select 'Keep source and test folders on reimport'"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select 'Exclude build directory'"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select 'Use Maven output directories' -> Next"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Select maven-3 -> Next"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Next a whole bunch"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Generate Parser and Lexer Files"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Maven Projects -> Phoenix Core -> Lifecycle -> compile"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Compile Project"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Build -> Make Project"},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Make sure you are setup to develop now."},{heading:"if-you-already-have-a-local-git-repository-setup",content:"Open IndexUtilTest.Java -> Run -> Run IndexUtilTest"},{heading:"get-settings-and-preferences-correct-1",content:"Import Settings from eclipse profile"},{heading:"get-settings-and-preferences-correct-1",content:"File -> Settings -> Editor -> Code Style -> Java"},{heading:"get-settings-and-preferences-correct-1",content:"Set From... -> Import... -> Eclipse XML Profile -> `{repository}/dev/PhoenixCodeTemplate.xml`"},{heading:"connecting-to-jira-1",content:"Create Connection to Apache Jira"},{heading:"connecting-to-jira-1",content:"Tools -> Tasks and Contexts -> Configure Servers -> + -> Jira ->"},{heading:"connecting-to-jira-1",content:"Server Url: `https://issues.apache.org/jira`"},{heading:"connecting-to-jira-1",content:"Query: 'project=Phoenix and ...'"},{heading:"connecting-to-jira-1",content:"Switch Easily between Tasks"},{heading:"connecting-to-jira-1",content:"Tools-> Tasks and Contexts -> Open Task->PHOENIX-####"},{heading:"connecting-to-jira-1",content:"Select Create branch PHOENIX-#### from master->OK"},{heading:"commit-1",content:"Commit Changes and Push to Github with appropriate Message"},{heading:"commit-1",content:"VCS -> Commit -> Set Commit message to include jira number PHOENIX-####"},{heading:"commit-1",content:"Commit and Push"},{heading:"create-pull-request",content:"Review the How to Contribute documentation."},{heading:"create-pull-request",content:"Navigate to branch: `https://github.com/{username}/phoenix/tree/{branchname}`"},{heading:"create-pull-request",content:"Click Pull Request"},{heading:"create-pull-request",content:"Confirm that you see `apache:master ... {username}:{branchname}`"},{heading:"create-pull-request",content:"Make sure the pull request title begins with the JIRA key, for example `PHOENIX-####`."},{heading:"create-pull-request",content:"Click Create pull request."}],headings:[{id:"develop-getting-started",content:"Getting Started"},{id:"other-phoenix-subprojects",content:"Other Phoenix Subprojects"},{id:"setup-local-git-repository",content:"Setup Local Git Repository"},{id:"for-eclipse-ide-for-java-developers-luna",content:"For Eclipse IDE for Java Developers (Luna)"},{id:"get-settings-and-preferences-correct",content:"Get Settings and Preferences Correct"},{id:"connecting-to-jira",content:"Connecting to Jira"},{id:"commit",content:"Commit"},{id:"for-intellij",content:"For Intellij"},{id:"if-you-dont-have-a-local-git-repository-setup",content:"If you don't have a local git repository setup"},{id:"if-you-already-have-a-local-git-repository-setup",content:"If you already have a local git repository setup"},{id:"get-settings-and-preferences-correct-1",content:"Get Settings and Preferences Correct"},{id:"connecting-to-jira-1",content:"Connecting to Jira"},{id:"commit-1",content:"Commit"},{id:"contributing-finished-work",content:"Contributing finished work"},{id:"create-pull-request",content:"Create pull request"}]},c=[{depth:2,url:"#develop-getting-started",title:e.jsx(e.Fragment,{children:"Getting Started"})},{depth:2,url:"#other-phoenix-subprojects",title:e.jsx(e.Fragment,{children:"Other Phoenix Subprojects"})},{depth:2,url:"#setup-local-git-repository",title:e.jsx(e.Fragment,{children:"Setup Local Git Repository"})},{depth:2,url:"#for-eclipse-ide-for-java-developers-luna",title:e.jsx(e.Fragment,{children:"For Eclipse IDE for Java Developers (Luna)"})},{depth:3,url:"#get-settings-and-preferences-correct",title:e.jsx(e.Fragment,{children:"Get Settings and Preferences Correct"})},{depth:3,url:"#connecting-to-jira",title:e.jsx(e.Fragment,{children:"Connecting to Jira"})},{depth:3,url:"#commit",title:e.jsx(e.Fragment,{children:"Commit"})},{depth:2,url:"#for-intellij",title:e.jsx(e.Fragment,{children:"For Intellij"})},{depth:3,url:"#if-you-dont-have-a-local-git-repository-setup",title:e.jsx(e.Fragment,{children:"If you don't have a local git repository setup"})},{depth:3,url:"#if-you-already-have-a-local-git-repository-setup",title:e.jsx(e.Fragment,{children:"If you already have a local git repository setup"})},{depth:3,url:"#get-settings-and-preferences-correct-1",title:e.jsx(e.Fragment,{children:"Get Settings and Preferences Correct"})},{depth:3,url:"#connecting-to-jira-1",title:e.jsx(e.Fragment,{children:"Connecting to Jira"})},{depth:3,url:"#commit-1",title:e.jsx(e.Fragment,{children:"Commit"})},{depth:2,url:"#contributing-finished-work",title:e.jsx(e.Fragment,{children:"Contributing finished work"})},{depth:3,url:"#create-pull-request",title:e.jsx(e.Fragment,{children:"Create pull request"})}];function i(t){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"develop-getting-started",children:"Getting Started"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Review the ",e.jsx(n.a,{href:"/docs/contributing",children:"How to Contribute"})," documentation."]}),`
`,e.jsxs(n.li,{children:["Sign up for a ",e.jsx(n.a,{href:"https://github.com/",children:"GitHub"})," account if you do not have one."]}),`
`,e.jsxs(n.li,{children:["Go to the ",e.jsx(n.a,{href:"https://github.com/apache/phoenix",children:"Phoenix GitHub repository"})," and create a fork, which creates ",e.jsx(n.code,{children:"{username}/phoenix"}),"."]}),`
`,e.jsxs(n.li,{children:["Set up Git locally.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://help.github.com/articles/set-up-git/",children:"Instructions"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://git-scm.com/downloads",children:"Download"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Make sure you have a JDK (Phoenix historically required ",e.jsx(n.a,{href:"https://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html",children:"JDK 7"}),")."]}),`
`,e.jsxs(n.li,{children:["Make sure you have ",e.jsx(n.a,{href:"https://maven.apache.org/download.cgi",children:"Maven 3+"})," installed."]}),`
`,e.jsxs(n.li,{children:["Add the following to your ",e.jsx(n.code,{children:".bashrc"})," or equivalent to ensure Maven and Java are configured correctly for command-line usage."]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" JAVA_HOME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"path"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jdk}"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" JDK_HOME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"path"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" jdk}"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" M2_HOME"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"path"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" maven}"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" PATH"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$M2_HOME/bin:$PATH"})]})]})})}),`
`,e.jsx(n.h2,{id:"other-phoenix-subprojects",children:"Other Phoenix Subprojects"}),`
`,e.jsxs(n.p,{children:["The instructions here are for the main Phoenix project. For the other subprojects, use the corresponding ",e.jsx(n.a,{href:"/source-repository",children:"repository"})," and ",e.jsx(n.a,{href:"/issues-tracking",children:"JIRA project"}),"."]}),`
`,e.jsx(n.p,{children:"The Eclipse and IntelliJ setup instructions may not necessarily work well for the other projects."}),`
`,e.jsx(n.h2,{id:"setup-local-git-repository",children:"Setup Local Git Repository"}),`
`,e.jsx(n.p,{children:"You may find it easier to clone from your IDE of choice, especially with IntelliJ."}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Create a local clone of your new forked repository"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clone"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://github.com/{username}/phoenix.git"})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Configure your local repository to be able to sync with the apache/phoenix repository"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" {repository}"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" remote"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" upstream"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://github.com/apache/phoenix.git"})]})]})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Setup your development environment"}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"for-eclipse-ide-for-java-developers-luna",children:"For Eclipse IDE for Java Developers (Luna)"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://eclipse.org/downloads/packages/eclipse-ide-java-developers/lunar",children:"Download Eclipse"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["You will want 'Eclipse IDE for Java Developers' unless you want to install the following tools by hand",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"http://download.eclipse.org/technology/m2e/releases/",children:"m2e"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"http://www.eclipse.org/egit/download/",children:"egit"})}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Configure Eclipse to handle Maven Issues appropriately so you don't see unnecessary errors.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Preferences -> Maven -> Errors/Warnings"}),`
`,e.jsx(n.li,{children:"Choose Ignore option for 'Plugin execution not covered by lifecycle configuration' -> Ok"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Add the local Git repository to Eclipse",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Show View -> Other... -> Git | Git Repositories -> Ok"}),`
`,e.jsx(n.li,{children:"Click 'Add an existing local Git Repository to this view'"}),`
`,e.jsx(n.li,{children:"Search for appropriate git repository"}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Import Maven Projects",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"File -> Import -> Maven -> Existing Maven Projects"}),`
`,e.jsx(n.li,{children:"Choose Root directory where phoenix git repository is located"}),`
`,e.jsx(n.li,{children:"Select All"}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Generate Lexer and Parser Files",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Select phoenix-core project"}),`
`,e.jsx(n.li,{children:"Run -> Run As -> Maven generate-sources"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Make sure you are setup to develop now.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open IndexUtilTest.Java"}),`
`,e.jsx(n.li,{children:"Run -> Run As -> JUnit Test"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"get-settings-and-preferences-correct",children:"Get Settings and Preferences Correct"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Import General Preferences",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"File -> Import... -> General -> Preferences"}),`
`,e.jsxs(n.li,{children:["From - ",e.jsx(n.code,{children:"{repository}/dev/eclipse_prefs_phoenix.epf"})]}),`
`,e.jsx(n.li,{children:"Import All"}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Import Code Templates",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Preferences -> Java -> Code Style -> Code Templates -> Import..."}),`
`,e.jsxs(n.li,{children:["Navigate to ",e.jsx(n.code,{children:"{repository}/dev/PhoenixCodeTemplate.xml"})," -> Ok"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Import Formatter",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Preferences -> Java -> Code Style -> Formatter-> Import..."}),`
`,e.jsxs(n.li,{children:["Navigate to ",e.jsx(n.code,{children:"{repository}/dev/PhoenixCodeTemplate.xml"})," -> Ok"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Import correct import order settings",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Preferences -> Java -> Code Style -> Organize Imports -> Import..."}),`
`,e.jsxs(n.li,{children:["Navigate to ",e.jsx(n.code,{children:"{repository}/dev/phoenix.importorder"})," -> Ok"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Make sure you use space for tabs",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Preferences -> General -> Editors -> Text Editors"}),`
`,e.jsx(n.li,{children:"Select 'Insert Spaces for tabs' -> Ok"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"connecting-to-jira",children:"Connecting to Jira"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Install Connector for Jira",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Help -> Install New Software -> Add"}),`
`,e.jsxs(n.li,{children:["Location - ",e.jsx(n.a,{href:"https://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7",children:"https://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7"})," -> Atlassian Connector"]}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Add Task Repository",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Window -> Show View -> Mylyn -> Task Repositories -> Add Task Repository"}),`
`,e.jsxs(n.li,{children:["JIRA -> Next -> Server - ",e.jsx(n.a,{href:"https://issues.apache.org/jira",children:"https://issues.apache.org/jira"})," -> Validate Settings"]}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Add Filter Of All JIRAs assigned to you",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Right Click on Repository You added -> New Query... -> Predefined Filter"}),`
`,e.jsx(n.li,{children:"Select Phoenix Project -> Select Assigned to me"}),`
`,e.jsx(n.li,{children:"Finish"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"commit",children:"Commit"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Commit Changes and Push to Github with appropriate Message",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"CTRL-# -> Set Commit message to include jira number at beginning PHOENIX-####"}),`
`,e.jsx(n.li,{children:"Commit and Push"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"for-intellij",children:"For Intellij"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://www.jetbrains.com/idea/download/",children:"Download IntelliJ"})}),`
`]}),`
`,e.jsx(n.h3,{id:"if-you-dont-have-a-local-git-repository-setup",children:"If you don't have a local git repository setup"}),`
`,e.jsx(n.p,{children:"This will automatically create the local clone of your repository for you. You will still want to add the remote upstream repository from above afterwards."}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Clone Github project and Import Maven Projects to IDE",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Check out from Version Control -> GitHub -> Enter your GitHub Login Info"}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"https://github.com/{username}/phoenix.git"})," -> Check out from Version Control | Yes"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Generate Parser and Lexer Files",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Maven Projects -> Phoenix Core -> Lifecycle -> compile"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Compile Project",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Build -> Make Project"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Make sure you are setup to develop now.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open IndexUtilTest.Java -> Run -> Run IndexUtilTest"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"if-you-already-have-a-local-git-repository-setup",children:"If you already have a local git repository setup"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Import Projects",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Import Project"}),`
`,e.jsx(n.li,{children:"Select Directory of your local repository -> Next"}),`
`,e.jsx(n.li,{children:"Import project from external model -> Maven -> Next"}),`
`,e.jsx(n.li,{children:"Select 'Import Maven project automatically'"}),`
`,e.jsx(n.li,{children:"Select 'Create IntelliJ IDEA modules for aggregator projects'"}),`
`,e.jsx(n.li,{children:"Select 'Keep source and test folders on reimport'"}),`
`,e.jsx(n.li,{children:"Select 'Exclude build directory'"}),`
`,e.jsx(n.li,{children:"Select 'Use Maven output directories' -> Next"}),`
`,e.jsx(n.li,{children:"Select maven-3 -> Next"}),`
`,e.jsx(n.li,{children:"Next a whole bunch"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Generate Parser and Lexer Files",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Maven Projects -> Phoenix Core -> Lifecycle -> compile"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Compile Project",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Build -> Make Project"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Make sure you are setup to develop now.",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open IndexUtilTest.Java -> Run -> Run IndexUtilTest"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"get-settings-and-preferences-correct-1",children:"Get Settings and Preferences Correct"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Import Settings from eclipse profile",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"File -> Settings -> Editor -> Code Style -> Java"}),`
`,e.jsxs(n.li,{children:["Set From... -> Import... -> Eclipse XML Profile -> ",e.jsx(n.code,{children:"{repository}/dev/PhoenixCodeTemplate.xml"})]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"connecting-to-jira-1",children:"Connecting to Jira"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Create Connection to Apache Jira",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Tools -> Tasks and Contexts -> Configure Servers -> + -> Jira ->"}),`
`,e.jsxs(n.li,{children:["Server Url: ",e.jsx(n.code,{children:"https://issues.apache.org/jira"})]}),`
`,e.jsx(n.li,{children:"Query: 'project=Phoenix and ...'"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Switch Easily between Tasks",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Tools-> Tasks and Contexts -> Open Task->PHOENIX-####"}),`
`,e.jsx(n.li,{children:"Select Create branch PHOENIX-#### from master->OK"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"commit-1",children:"Commit"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Commit Changes and Push to Github with appropriate Message",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"VCS -> Commit -> Set Commit message to include jira number PHOENIX-####"}),`
`,e.jsx(n.li,{children:"Commit and Push"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"contributing-finished-work",children:"Contributing finished work"}),`
`,e.jsx(n.h3,{id:"create-pull-request",children:"Create pull request"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Review the ",e.jsx(n.a,{href:"/docs/contributing",children:"How to Contribute"})," documentation."]}),`
`,e.jsxs(n.li,{children:["Navigate to branch: ",e.jsx(n.code,{children:"https://github.com/{username}/phoenix/tree/{branchname}"})]}),`
`,e.jsx(n.li,{children:"Click Pull Request"}),`
`,e.jsxs(n.li,{children:["Confirm that you see ",e.jsx(n.code,{children:"apache:master ... {username}:{branchname}"})]}),`
`,e.jsxs(n.li,{children:["Make sure the pull request title begins with the JIRA key, for example ",e.jsx(n.code,{children:"PHOENIX-####"}),"."]}),`
`,e.jsx(n.li,{children:"Click Create pull request."}),`
`]})]})}function d(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{r as _markdown,d as default,a as extractedReferences,s as frontmatter,l as structuredData,c as toc};
