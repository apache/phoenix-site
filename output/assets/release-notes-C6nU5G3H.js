import{j as e,w as a}from"./chunk-EPOLDU6W-B5LwAila.js";import{M as h}from"./mdx-components-DCKvNlAs.js";import"./mdx-DLDzmbRN.js";import"./index-DXIctz1v.js";import"./index-jbG8BFt3.js";import"./index-FCA4GwU0.js";import"./utils-Cu_tFavh.js";import"./link-DuHRbjfY.js";import"./external-link-jmuPj2if.js";import"./createLucideIcon-BidaCVke.js";e.jsx(e.Fragment,{children:"Release Notes"}),e.jsx(e.Fragment,{children:"Phoenix 5.0.0-alpha Release Notes"}),e.jsx(e.Fragment,{children:"Phoenix-4.8.0 Release Notes"}),e.jsx(e.Fragment,{children:"Phoenix-4.5.0 Release Notes"});function n(s){const i={a:"a",code:"code",h1:"h1",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"release-notes",children:"Release Notes"}),`
`,e.jsx(i.p,{children:`Release notes provide details on issues and their fixes which may have an impact on prior
Phoenix behavior. For some issues an upgrade may be required to be performed for a fix to
take effect. See below for directions specific to a particular release.`}),`
`,e.jsx(i.h3,{id:"phoenix-500-alpha-release-notes",children:"Phoenix 5.0.0-alpha Release Notes"}),`
`,e.jsx(i.p,{children:`Phoenix 5.0.0-alpha is a "preview" release. This release is the first
version of Phoenix which is compatible with Apache Hadoop 3.0.x and Apache
HBase 2.0.x. This release also is designated an "alpha" release because
there are several known deficiencies which impact the production readiness.
This release should be used carefully by users who have taken the time
to understand what is known to be working and what is not.`}),`
`,e.jsx(i.p,{children:"Known issues:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"The Apache Hive integration is known to be non-functional (PHOENIX-4423)"}),`
`,e.jsx(i.li,{children:"Split/Merge logic with Phoenix local indexes are broken (PHOENIX-4440)"}),`
`,e.jsx(i.li,{children:"Apache Teprha integration/transactional tables are non-functional (PHOENIX-4580)"}),`
`,e.jsx(i.li,{children:'Point-in-time queries and tools that look at "old" cells are broken, e.g. IndexScrutiny (PHOENIX-4378)'}),`
`]}),`
`,e.jsx(i.p,{children:`The developers would like to encourage users to test this release out and
report any observed issues so that the official 5.0.0 release quality may
be significantly improved.`}),`
`,e.jsx(i.h3,{id:"phoenix-480-release-notes",children:"Phoenix-4.8.0 Release Notes"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-3164",children:"PHOENIX-3164"}),` is a relatively serious
bug that affects the `,e.jsx(i.a,{href:"/docs/features/query-server",children:"Phoenix Query Server"}),`
deployed with "security enabled" (Kerberos or Active Directory). Due to another late-game
change in the 4.8.0 release as well as an issue with the use of Hadoop's UserGroupInformation
class, every "client session" to the Phoenix Query Server with security enabled will
result in a new instance of the Phoenix JDBC driver `,e.jsx(i.code,{children:"PhoenixConnection"}),` (and other related
classes). This ultimately results in a new connection to ZooKeeper for each "client session".`]}),`
`,e.jsxs(i.p,{children:[`Within a short amount of time of active use with the Phoenix Query Server creating a new ZooKeeper
connection for each "client session", the number of ZooKeeper connections will have grown rapidly
likely triggering ZooKeeper's built-in denial of service protection
(`,e.jsx(i.a,{href:"https://zookeeper.apache.org/doc/r3.4.8/zookeeperAdmin.html",children:"maxClientCnxns"}),`). This
will cause all future connections to ZooKeeper by the host running the Phoenix Query Server to
be dropped. This would prevent all HBase client API calls which need to access ZooKeeper
from completing.`]}),`
`,e.jsxs(i.p,{children:["As part of ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-1734",children:"PHOENIX-1734"}),` we have changed
the local index implementation to store index data in the separate column families in the same
data table. So while upgrading the phoenix at server we need to remove below local index
related configurations from `,e.jsx(i.code,{children:"hbase-site.xml"}),` and run upgrade steps mentioned
`,e.jsx(i.a,{href:"/docs/features/secondary-indexes#upgrading-local-indexes-created-before-480",children:"here"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.master.loadbalancer.class</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix.hbase.index.balancer.IndexLoadBalancer</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.master.classes</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.phoenix.hbase.index.master.IndexMasterObserver</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.coprocessor.regionserver.classes</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.regionserver.LocalIndexMerger</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(i.h3,{id:"phoenix-450-release-notes",children:"Phoenix-4.5.0 Release Notes"}),`
`,e.jsxs(i.p,{children:["Both ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-2067",children:"PHOENIX-2067"}),` and
`,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-2120",children:"PHOENIX-2120"}),` cause rows to not be ordered
correctly for the following types of columns:`]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"VARCHAR DESC columns"}),`
`,e.jsx(i.li,{children:"DECIMAL DESC columns"}),`
`,e.jsx(i.li,{children:"ARRAY DESC columns"}),`
`,e.jsx(i.li,{children:"Nullable DESC columns which are indexed (impacts the index, but not the data table)"}),`
`,e.jsx(i.li,{children:"BINARY columns included in the primary key constraint"}),`
`]}),`
`,e.jsx(i.p,{children:"To get an idea if any of your tables are impacted, you may run the following command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -u"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_host_name"})]})})})}),`
`,e.jsxs(i.p,{children:[`This will look through all tables you've defined and indicate if any upgrades are necessary.
Ensure your client-side `,e.jsx(i.code,{children:"phoenix.query.timeoutMs"}),` property and server-side
`,e.jsx(i.code,{children:"hbase.regionserver.lease.period"})," are set high enough for the command to complete."]}),`
`,e.jsx(i.p,{children:"To upgrade the tables, run the same command, but list the tables you'd like upgraded like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -u"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_host_name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table1"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table3"})]})})})}),`
`,e.jsx(i.p,{children:`This will first make a snapshot of your table and then upgrade it. If any problems occur
during the upgrade process, the snapshot of your original table will be restored. Again, make
sure your timeouts are set high enough, as the tables being upgraded need to be rewritten
in order to fix them.`}),`
`,e.jsx(i.p,{children:`For the case of BINARY columns, no update is required if you've always provided all of
the bytes making up that column value (i.e. you have not relied on Phoenix to auto-pad the
column up to the fixed length). In this case, you should bypass the upgrade by running the
following command:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -u"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -b"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my_host_name"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table1"})]})})})}),`
`,e.jsx(i.p,{children:`This is important, because the PHOENIX-2120 was caused by BINARY columns being incorrectly
padded with a space characters instead of a zero byte characters. The upgrade will replace
trailing space characters with zero byte characters which may be invalid if the space
characters are legitimate/intentional characters. Unfortunately, Phoenix has no way to know
if this is the case.`}),`
`,e.jsx(i.p,{children:`Upgrading your tables is important, as without this, Phoenix will need to reorder rows it
retrieves back from the server when otherwise not necessary. This will have a large negative
impact on performance until the upgrade is performed.`}),`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Future releases of Phoenix may require that affected tables be upgraded prior to moving to the new release."})})]})}function r(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}function l(){return e.jsx(h,{Content:r,className:"mt-12"})}function j({}){return[{title:"Release Notes - Apache Phoenix"},{name:"description",content:"Release notes and upgrade considerations for Apache Phoenix releases."}]}const m=a(function(){return e.jsx(l,{})});export{m as default,j as meta};
