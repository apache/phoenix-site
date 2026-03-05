import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`## How to Release

Phoenix has several repos: \`phoenix-thirdparty\`, \`phoenix-omid\`, \`phoenix-tephra\`, \`phoenix\`, \`phoenix-connectors\`, and \`phoenix-queryserver\`.
The create-release scripts provide a unified script to handle the release from each repo.
The create-release scripts are in the \`master\` branch of the \`phoenix\` repo, in the \`dev/create-release\` directory.

## Pre-Reqs

1. Make sure that the JIRAs included in the release have their fix-version and release notes fields set correctly, and are resolved.\\
   The script will query them and create the \`CHANGES\` and \`RELEASE_NOTES\` files from that information.\\
   Use \`dev/misc_utils/git_jira_fix_version_check.py\` to find discrepancies between commits and JIRAs.
2. Make sure you have set up your user for release signing. Details: [http://www.apache.org/dev/release-signing.html](http://www.apache.org/dev/release-signing.html).
3. Make sure you have set up Maven for deploying to the ASF repo. Details: [https://infra.apache.org/publishing-maven-artifacts.html](https://infra.apache.org/publishing-maven-artifacts.html).
4. Clone the Phoenix \`master\` branch locally (the script will download the actual repo to release itself).
5. Make sure Docker is running locally.

Note that Docker Desktop for Mac works, but will be slow (several hours for a Phoenix core release). Running on a native Linux machine is much faster because you avoid filesystem translation layer overhead.

## Do a dry run

Read \`/dev/create_release/README.txt\` to understand what the script does and how to set up \`gpg-agent\` for signing.

Run the \`dev/create-release/do-release-docker.sh -d <workdir> -p <project>\` command, where

* \`<project>\` is the repo name you're releasing from (i.e. phoenix)
* \`<workdir>\` is any existing directory that can be deleted

The script will ask a number of questions. Some of them will have intelligent default, but make sure you check them all:

\`\`\`text
  [stoty@IstvanToth-MBP15:~/workspaces/apache-phoenix/phoenix (PHOENIX-6307)$]dev/create-release/do-release-docker.sh -p phoenix -d ~/x/phoenix-build/
  Output directory already exists. Overwrite and continue? [y/n] y
  ========================
  === Gathering release details.

  PROJECT [phoenix]:
  GIT_BRANCH []: master
  Current branch VERSION is 5.1.0-SNAPSHOT.
  RELEASE_VERSION [5.1.0]:
  RC_COUNT [0]:
  RELEASE_TAG [5.1.0RC0]:
  This is a dry run. If tag does not actually exist, please confirm the ref that will be built for testing.
  GIT_REF [5.1.0RC0]:
  ASF_USERNAME [stoty]:
  GIT_NAME [Istvan Toth]:
  GPG_KEY [stoty@apache.org]:
  We think the key 'stoty@apache.org' corresponds to the key id '0x77E592D4'. Is this correct [y/n]? y
  ================
  Release details:
  GIT_BRANCH:      master
  RELEASE_VERSION: 5.1.0
  RELEASE_TAG:     5.1.0RC0
  API_DIFF_TAG:
  ASF_USERNAME:    stoty
  GPG_KEY:         0x77E592D4
  GIT_NAME:        Istvan Toth
  GIT_EMAIL:       stoty@apache.org
  DRY_RUN:         yes
  ================
\`\`\`

* \`PROJECT\`: the repo to release (default specified by \`-p\` on the command line)
* \`GIT_BRANCH\`: the git branch to use for release. This can be \`master\`, or a pre-created release branch.
* \`RC_COUNT\`: the RC number, starting from 0
* \`RELEASE_TAG\`: the git tag the script will tag the RC commit with.
* \`ASF_USERNAME\`: your ASF username, for publishing the release artifacts.
* \`ASF_PASSWORD\`: your ASF password, only for non-dry runs
* \`GIT_NAME\`/\`GIT_EMAIL\`: will be used for the RC commit
* \`GPG_KEY\`: ID for your GPG key. The script will offer a GPG secret key from your key ring, double-check that it is your code-signing key, and correct it if it is not.

The dry-run will generate the signed release files into \`<workdir>/output\` directory.
The Maven artifacts will be in \`<workdir>/output/phoenix-repo-XXXX\` local Maven repo, in the usual structure.

## Create real RC

If the dry-run release artifacts (source, binary, and Maven) check out, then publish a real RC to ASF.

Repeat the dry run process, but add the \`-f\` switch to the \`do-release-docker.sh\` command.

The script will upload the source and binary release artifacts to a directory under \`https://dist.apache.org/repos/dist/dev/phoenix/\`.
The script will also deploy the Maven artifacts to \`https://repository.apache.org/#stagingRepositories\`.
Check that these are present.

### Close the staging repository

The published staging repository is in the "open" state. Open staging repositories
are aggressively cleaned up, and may be removed by the time the vote passes.
To avoid this, [close](https://central.sonatype.org/publish/release/#locate-and-examine-your-staging-repository)
(but DO NOT release) the staging repository immediately after deployment.

## Voting

1. Initiate the vote email. See example [here](https://www.mail-archive.com/dev@phoenix.apache.org/msg41202.html), or use the \`<workdir>/output/vote.txt\` template generated by the script.
2. In case the RC (Release Candidate) is rejected via the vote, you will have to repeat the above process and re-initiate the vote for the next RC (RC0, RC1, etc.).

## Release

1. Once voting is successful (say for RC1), copy artifacts to \`https://dist.apache.org/repos/dist/release/phoenix\`:

   \`\`\`shell
   svn mv https://dist.apache.org/repos/dist/dev/phoenix/apache-phoenix-4.15.0-HBase-1.3-rc1 \\
          https://dist.apache.org/repos/dist/release/phoenix/apache-phoenix-4.15.0-HBase-1.3
   \`\`\`

2. Set release tag and commit:

   \`\`\`shell
   git tag -a v4.15.0-HBase-1.3 v4.15.0-HBase-1.3-rc1 -m "Phoenix v4.15.0-HBase-1.3 release"
   \`\`\`

3. Remove any obsolete releases on \`https://dist.apache.org/repos/dist/release/phoenix\` given the current release.

4. Go to \`https://repository.apache.org/#stagingRepositories\` and release the staged artifacts (this takes a while so you may need to refresh multiple times).

5. Create new branch based on current release if needed, for ex: 4.15 branches in this case.

6. Set version to the upcoming \`SNAPSHOT\` and commit:

   \`\`\`shell
   mvn versions:set -DnewVersion=4.16.0-HBase-1.3-SNAPSHOT -DgenerateBackupPoms=false
   \`\`\`

7. If releasing Phoenix (core) Create a JIRA to update \`PHOENIX_MAJOR_VERSION\`, \`PHOENIX_MINOR_VERSION\` and \`PHOENIX_PATCH_NUMBER\` in \`MetaDataProtocol.java\` appropriately to next version (4, 16, 0 respectively in this case) and \`compatible_client_versions.json\` file with the client versions that are compatible against the next version (in this case 4.14.3 and 4.15.0 would be the backward compatible clients for 4.16.0). This JIRA should be committed/marked with fixVersion of the next release candidate.

8. Add documentation of released version to the [downloads page](/downloads) and [wiki](https://en.wikipedia.org/wiki/Apache_Phoenix).

9. Update the [Apache Committee Report Helper DB](https://reporter.apache.org/addrelease.html?phoenix)

10. Send out an announcement email. See example [here](https://www.mail-archive.com/dev@phoenix.apache.org/msg54764.html).

11. Bulk close JIRAs that were marked for the release fixVersion.

**Congratulations!**
`,a={title:"How to Release",description:"Apache Phoenix release process, release candidates, and voting workflow."},o=[{href:"http://www.apache.org/dev/release-signing.html"},{href:"https://infra.apache.org/publishing-maven-artifacts.html"},{href:"https://central.sonatype.org/publish/release/#locate-and-examine-your-staging-repository"},{href:"https://www.mail-archive.com/dev@phoenix.apache.org/msg41202.html"},{href:"/downloads"},{href:"https://en.wikipedia.org/wiki/Apache_Phoenix"},{href:"https://reporter.apache.org/addrelease.html?phoenix"},{href:"https://www.mail-archive.com/dev@phoenix.apache.org/msg54764.html"}],h={contents:[{heading:"contributing-how-to-release",content:`Phoenix has several repos: phoenix-thirdparty, phoenix-omid, phoenix-tephra, phoenix, phoenix-connectors, and phoenix-queryserver.
The create-release scripts provide a unified script to handle the release from each repo.
The create-release scripts are in the master branch of the phoenix repo, in the dev/create-release directory.`},{heading:"pre-reqs",content:"Make sure that the JIRAs included in the release have their fix-version and release notes fields set correctly, and are resolved.The script will query them and create the CHANGES and RELEASE_NOTES files from that information.Use dev/misc_utils/git_jira_fix_version_check.py to find discrepancies between commits and JIRAs."},{heading:"pre-reqs",content:"Make sure you have set up your user for release signing. Details: http://www.apache.org/dev/release-signing.html."},{heading:"pre-reqs",content:"Make sure you have set up Maven for deploying to the ASF repo. Details: https://infra.apache.org/publishing-maven-artifacts.html."},{heading:"pre-reqs",content:"Clone the Phoenix master branch locally (the script will download the actual repo to release itself)."},{heading:"pre-reqs",content:"Make sure Docker is running locally."},{heading:"pre-reqs",content:"Note that Docker Desktop for Mac works, but will be slow (several hours for a Phoenix core release). Running on a native Linux machine is much faster because you avoid filesystem translation layer overhead."},{heading:"do-a-dry-run",content:"Read /dev/create_release/README.txt to understand what the script does and how to set up gpg-agent for signing."},{heading:"do-a-dry-run",content:"Run the dev/create-release/do-release-docker.sh -d <workdir> -p <project> command, where"},{heading:"do-a-dry-run",content:"<project> is the repo name you're releasing from (i.e. phoenix)"},{heading:"do-a-dry-run",content:"<workdir> is any existing directory that can be deleted"},{heading:"do-a-dry-run",content:"The script will ask a number of questions. Some of them will have intelligent default, but make sure you check them all:"},{heading:"do-a-dry-run",content:"PROJECT: the repo to release (default specified by -p on the command line)"},{heading:"do-a-dry-run",content:"GIT_BRANCH: the git branch to use for release. This can be master, or a pre-created release branch."},{heading:"do-a-dry-run",content:"RC_COUNT: the RC number, starting from 0"},{heading:"do-a-dry-run",content:"RELEASE_TAG: the git tag the script will tag the RC commit with."},{heading:"do-a-dry-run",content:"ASF_USERNAME: your ASF username, for publishing the release artifacts."},{heading:"do-a-dry-run",content:"ASF_PASSWORD: your ASF password, only for non-dry runs"},{heading:"do-a-dry-run",content:"GIT_NAME/GIT_EMAIL: will be used for the RC commit"},{heading:"do-a-dry-run",content:"GPG_KEY: ID for your GPG key. The script will offer a GPG secret key from your key ring, double-check that it is your code-signing key, and correct it if it is not."},{heading:"do-a-dry-run",content:`The dry-run will generate the signed release files into <workdir>/output directory.
The Maven artifacts will be in <workdir>/output/phoenix-repo-XXXX local Maven repo, in the usual structure.`},{heading:"create-real-rc",content:"If the dry-run release artifacts (source, binary, and Maven) check out, then publish a real RC to ASF."},{heading:"create-real-rc",content:"Repeat the dry run process, but add the -f switch to the do-release-docker.sh command."},{heading:"create-real-rc",content:`The script will upload the source and binary release artifacts to a directory under https://dist.apache.org/repos/dist/dev/phoenix/.
The script will also deploy the Maven artifacts to https://repository.apache.org/#stagingRepositories.
Check that these are present.`},{heading:"close-the-staging-repository",content:`The published staging repository is in the "open" state. Open staging repositories
are aggressively cleaned up, and may be removed by the time the vote passes.
To avoid this, close
(but DO NOT release) the staging repository immediately after deployment.`},{heading:"voting",content:"Initiate the vote email. See example here, or use the <workdir>/output/vote.txt template generated by the script."},{heading:"voting",content:"In case the RC (Release Candidate) is rejected via the vote, you will have to repeat the above process and re-initiate the vote for the next RC (RC0, RC1, etc.)."},{heading:"release",content:"Once voting is successful (say for RC1), copy artifacts to https://dist.apache.org/repos/dist/release/phoenix:"},{heading:"release",content:"Set release tag and commit:"},{heading:"release",content:"Remove any obsolete releases on https://dist.apache.org/repos/dist/release/phoenix given the current release."},{heading:"release",content:"Go to https://repository.apache.org/#stagingRepositories and release the staged artifacts (this takes a while so you may need to refresh multiple times)."},{heading:"release",content:"Create new branch based on current release if needed, for ex: 4.15 branches in this case."},{heading:"release",content:"Set version to the upcoming SNAPSHOT and commit:"},{heading:"release",content:"If releasing Phoenix (core) Create a JIRA to update PHOENIX_MAJOR_VERSION, PHOENIX_MINOR_VERSION and PHOENIX_PATCH_NUMBER in MetaDataProtocol.java appropriately to next version (4, 16, 0 respectively in this case) and compatible_client_versions.json file with the client versions that are compatible against the next version (in this case 4.14.3 and 4.15.0 would be the backward compatible clients for 4.16.0). This JIRA should be committed/marked with fixVersion of the next release candidate."},{heading:"release",content:"Add documentation of released version to the downloads page and wiki."},{heading:"release",content:"Update the Apache Committee Report Helper DB"},{heading:"release",content:"Send out an announcement email. See example here."},{heading:"release",content:"Bulk close JIRAs that were marked for the release fixVersion."},{heading:"release",content:"Congratulations!"}],headings:[{id:"contributing-how-to-release",content:"How to Release"},{id:"pre-reqs",content:"Pre-Reqs"},{id:"do-a-dry-run",content:"Do a dry run"},{id:"create-real-rc",content:"Create real RC"},{id:"close-the-staging-repository",content:"Close the staging repository"},{id:"voting",content:"Voting"},{id:"release",content:"Release"}]};const l=[{depth:2,url:"#contributing-how-to-release",title:e.jsx(e.Fragment,{children:"How to Release"})},{depth:2,url:"#pre-reqs",title:e.jsx(e.Fragment,{children:"Pre-Reqs"})},{depth:2,url:"#do-a-dry-run",title:e.jsx(e.Fragment,{children:"Do a dry run"})},{depth:2,url:"#create-real-rc",title:e.jsx(e.Fragment,{children:"Create real RC"})},{depth:3,url:"#close-the-staging-repository",title:e.jsx(e.Fragment,{children:"Close the staging repository"})},{depth:2,url:"#voting",title:e.jsx(e.Fragment,{children:"Voting"})},{depth:2,url:"#release",title:e.jsx(e.Fragment,{children:"Release"})}];function t(s){const n={a:"a",br:"br",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"contributing-how-to-release",children:"How to Release"}),`
`,e.jsxs(n.p,{children:["Phoenix has several repos: ",e.jsx(n.code,{children:"phoenix-thirdparty"}),", ",e.jsx(n.code,{children:"phoenix-omid"}),", ",e.jsx(n.code,{children:"phoenix-tephra"}),", ",e.jsx(n.code,{children:"phoenix"}),", ",e.jsx(n.code,{children:"phoenix-connectors"}),", and ",e.jsx(n.code,{children:"phoenix-queryserver"}),`.
The create-release scripts provide a unified script to handle the release from each repo.
The create-release scripts are in the `,e.jsx(n.code,{children:"master"})," branch of the ",e.jsx(n.code,{children:"phoenix"})," repo, in the ",e.jsx(n.code,{children:"dev/create-release"})," directory."]}),`
`,e.jsx(n.h2,{id:"pre-reqs",children:"Pre-Reqs"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Make sure that the JIRAs included in the release have their fix-version and release notes fields set correctly, and are resolved.",e.jsx(n.br,{}),`
`,"The script will query them and create the ",e.jsx(n.code,{children:"CHANGES"})," and ",e.jsx(n.code,{children:"RELEASE_NOTES"})," files from that information.",e.jsx(n.br,{}),`
`,"Use ",e.jsx(n.code,{children:"dev/misc_utils/git_jira_fix_version_check.py"})," to find discrepancies between commits and JIRAs."]}),`
`,e.jsxs(n.li,{children:["Make sure you have set up your user for release signing. Details: ",e.jsx(n.a,{href:"http://www.apache.org/dev/release-signing.html",children:"http://www.apache.org/dev/release-signing.html"}),"."]}),`
`,e.jsxs(n.li,{children:["Make sure you have set up Maven for deploying to the ASF repo. Details: ",e.jsx(n.a,{href:"https://infra.apache.org/publishing-maven-artifacts.html",children:"https://infra.apache.org/publishing-maven-artifacts.html"}),"."]}),`
`,e.jsxs(n.li,{children:["Clone the Phoenix ",e.jsx(n.code,{children:"master"})," branch locally (the script will download the actual repo to release itself)."]}),`
`,e.jsx(n.li,{children:"Make sure Docker is running locally."}),`
`]}),`
`,e.jsx(n.p,{children:"Note that Docker Desktop for Mac works, but will be slow (several hours for a Phoenix core release). Running on a native Linux machine is much faster because you avoid filesystem translation layer overhead."}),`
`,e.jsx(n.h2,{id:"do-a-dry-run",children:"Do a dry run"}),`
`,e.jsxs(n.p,{children:["Read ",e.jsx(n.code,{children:"/dev/create_release/README.txt"})," to understand what the script does and how to set up ",e.jsx(n.code,{children:"gpg-agent"})," for signing."]}),`
`,e.jsxs(n.p,{children:["Run the ",e.jsx(n.code,{children:"dev/create-release/do-release-docker.sh -d <workdir> -p <project>"})," command, where"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"<project>"})," is the repo name you're releasing from (i.e. phoenix)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"<workdir>"})," is any existing directory that can be deleted"]}),`
`]}),`
`,e.jsx(n.p,{children:"The script will ask a number of questions. Some of them will have intelligent default, but make sure you check them all:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  [stoty@IstvanToth-MBP15:~/workspaces/apache-phoenix/phoenix (PHOENIX-6307)$]dev/create-release/do-release-docker.sh -p phoenix -d ~/x/phoenix-build/"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  Output directory already exists. Overwrite and continue? [y/n] y"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ========================"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  === Gathering release details."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  PROJECT [phoenix]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_BRANCH []: master"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  Current branch VERSION is 5.1.0-SNAPSHOT."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  RELEASE_VERSION [5.1.0]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  RC_COUNT [0]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  RELEASE_TAG [5.1.0RC0]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  This is a dry run. If tag does not actually exist, please confirm the ref that will be built for testing."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_REF [5.1.0RC0]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ASF_USERNAME [stoty]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_NAME [Istvan Toth]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GPG_KEY [stoty@apache.org]:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  We think the key 'stoty@apache.org' corresponds to the key id '0x77E592D4'. Is this correct [y/n]? y"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ================"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  Release details:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_BRANCH:      master"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  RELEASE_VERSION: 5.1.0"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  RELEASE_TAG:     5.1.0RC0"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  API_DIFF_TAG:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ASF_USERNAME:    stoty"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GPG_KEY:         0x77E592D4"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_NAME:        Istvan Toth"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  GIT_EMAIL:       stoty@apache.org"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  DRY_RUN:         yes"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"  ================"})})]})})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"PROJECT"}),": the repo to release (default specified by ",e.jsx(n.code,{children:"-p"})," on the command line)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"GIT_BRANCH"}),": the git branch to use for release. This can be ",e.jsx(n.code,{children:"master"}),", or a pre-created release branch."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"RC_COUNT"}),": the RC number, starting from 0"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"RELEASE_TAG"}),": the git tag the script will tag the RC commit with."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ASF_USERNAME"}),": your ASF username, for publishing the release artifacts."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ASF_PASSWORD"}),": your ASF password, only for non-dry runs"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"GIT_NAME"}),"/",e.jsx(n.code,{children:"GIT_EMAIL"}),": will be used for the RC commit"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"GPG_KEY"}),": ID for your GPG key. The script will offer a GPG secret key from your key ring, double-check that it is your code-signing key, and correct it if it is not."]}),`
`]}),`
`,e.jsxs(n.p,{children:["The dry-run will generate the signed release files into ",e.jsx(n.code,{children:"<workdir>/output"}),` directory.
The Maven artifacts will be in `,e.jsx(n.code,{children:"<workdir>/output/phoenix-repo-XXXX"})," local Maven repo, in the usual structure."]}),`
`,e.jsx(n.h2,{id:"create-real-rc",children:"Create real RC"}),`
`,e.jsx(n.p,{children:"If the dry-run release artifacts (source, binary, and Maven) check out, then publish a real RC to ASF."}),`
`,e.jsxs(n.p,{children:["Repeat the dry run process, but add the ",e.jsx(n.code,{children:"-f"})," switch to the ",e.jsx(n.code,{children:"do-release-docker.sh"})," command."]}),`
`,e.jsxs(n.p,{children:["The script will upload the source and binary release artifacts to a directory under ",e.jsx(n.code,{children:"https://dist.apache.org/repos/dist/dev/phoenix/"}),`.
The script will also deploy the Maven artifacts to `,e.jsx(n.code,{children:"https://repository.apache.org/#stagingRepositories"}),`.
Check that these are present.`]}),`
`,e.jsx(n.h3,{id:"close-the-staging-repository",children:"Close the staging repository"}),`
`,e.jsxs(n.p,{children:[`The published staging repository is in the "open" state. Open staging repositories
are aggressively cleaned up, and may be removed by the time the vote passes.
To avoid this, `,e.jsx(n.a,{href:"https://central.sonatype.org/publish/release/#locate-and-examine-your-staging-repository",children:"close"}),`
(but DO NOT release) the staging repository immediately after deployment.`]}),`
`,e.jsx(n.h2,{id:"voting",children:"Voting"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Initiate the vote email. See example ",e.jsx(n.a,{href:"https://www.mail-archive.com/dev@phoenix.apache.org/msg41202.html",children:"here"}),", or use the ",e.jsx(n.code,{children:"<workdir>/output/vote.txt"})," template generated by the script."]}),`
`,e.jsx(n.li,{children:"In case the RC (Release Candidate) is rejected via the vote, you will have to repeat the above process and re-initiate the vote for the next RC (RC0, RC1, etc.)."}),`
`]}),`
`,e.jsx(n.h2,{id:"release",children:"Release"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Once voting is successful (say for RC1), copy artifacts to ",e.jsx(n.code,{children:"https://dist.apache.org/repos/dist/release/phoenix"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"svn"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mv"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" https://dist.apache.org/repos/dist/dev/phoenix/apache-phoenix-4.15.0-HBase-1.3-rc1"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"       https://dist.apache.org/repos/dist/release/phoenix/apache-phoenix-4.15.0-HBase-1.3"})})]})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Set release tag and commit:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tag"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -a"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" v4.15.0-HBase-1.3"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" v4.15.0-HBase-1.3-rc1"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -m"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Phoenix v4.15.0-HBase-1.3 release"'})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Remove any obsolete releases on ",e.jsx(n.code,{children:"https://dist.apache.org/repos/dist/release/phoenix"})," given the current release."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Go to ",e.jsx(n.code,{children:"https://repository.apache.org/#stagingRepositories"})," and release the staged artifacts (this takes a while so you may need to refresh multiple times)."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Create new branch based on current release if needed, for ex: 4.15 branches in this case."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Set version to the upcoming ",e.jsx(n.code,{children:"SNAPSHOT"})," and commit:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" versions:set"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DnewVersion=4.16.0-HBase-1.3-SNAPSHOT"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DgenerateBackupPoms=false"})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["If releasing Phoenix (core) Create a JIRA to update ",e.jsx(n.code,{children:"PHOENIX_MAJOR_VERSION"}),", ",e.jsx(n.code,{children:"PHOENIX_MINOR_VERSION"})," and ",e.jsx(n.code,{children:"PHOENIX_PATCH_NUMBER"})," in ",e.jsx(n.code,{children:"MetaDataProtocol.java"})," appropriately to next version (4, 16, 0 respectively in this case) and ",e.jsx(n.code,{children:"compatible_client_versions.json"})," file with the client versions that are compatible against the next version (in this case 4.14.3 and 4.15.0 would be the backward compatible clients for 4.16.0). This JIRA should be committed/marked with fixVersion of the next release candidate."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Add documentation of released version to the ",e.jsx(n.a,{href:"/downloads",children:"downloads page"})," and ",e.jsx(n.a,{href:"https://en.wikipedia.org/wiki/Apache_Phoenix",children:"wiki"}),"."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Update the ",e.jsx(n.a,{href:"https://reporter.apache.org/addrelease.html?phoenix",children:"Apache Committee Report Helper DB"})]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Send out an announcement email. See example ",e.jsx(n.a,{href:"https://www.mail-archive.com/dev@phoenix.apache.org/msg54764.html",children:"here"}),"."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Bulk close JIRAs that were marked for the release fixVersion."}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Congratulations!"})})]})}function c(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{r as _markdown,c as default,o as extractedReferences,a as frontmatter,h as structuredData,l as toc};
