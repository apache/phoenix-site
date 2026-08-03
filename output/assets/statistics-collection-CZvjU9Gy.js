import{j as e}from"./jsx-runtime-CUISpl0r.js";let a=`The \`UPDATE STATISTICS\` command updates the statistics collected on a table.
This command collects a set of keys per region per column family that
are equal byte distanced from each other. These collected keys are called *guideposts*
and they act as *hints/guides* to improve the parallelization of queries on a given
target region.

Statistics are also automatically collected during major compactions and region splits so
manually running this command may not be necessary.

## Parallelization

Phoenix breaks up queries into multiple scans and runs them in parallel to reduce latency.
Parallelization in Phoenix is driven by statistics-related configuration parameters.
Each chunk of data between guideposts will be run in parallel in a separate scan to improve
query performance. The chunk size is determined by the \`GUIDE_POSTS_WIDTH\` table property (Phoenix 4.9+)
or the global server-side \`phoenix.stats.guidepost.width\` parameter if the table property is
not set. As the size of the chunks decrease,
you'll want to increase \`phoenix.query.queueSize\` as more work will be queued in that
case. Note that at a minimum, separate scans will be run for each table region. Statistics in Phoenix
provides a means of gaining intraregion parallelization. In addition to the guidepost width specification,
the client-side \`phoenix.query.threadPoolSize\` and \`phoenix.query.queueSize\` parameters
and the server-side \`hbase.regionserver.handler.count\` parameter have an impact on the amount
of parallelization.

## Examples

To update the statistics for a given table \`my_table\`, execute the following command:

\`\`\`sql
UPDATE STATISTICS my_table
\`\`\`

The above syntax would collect the statistics for the table my\\_table and all the index tables,
views and view index tables associated with the table my\\_table.

The equivalent syntax is:

\`\`\`sql
UPDATE STATISTICS my_table ALL
\`\`\`

To collect statistics on the index table only:

\`\`\`sql
UPDATE STATISTICS my_table INDEX
\`\`\`

To collect statistics on the table only:

\`\`\`sql
UPDATE STATISTICS my_table COLUMNS
\`\`\`

To modify the guidepost width to 10MB for a table, execute the following command:

\`\`\`sql
ALTER TABLE my_table SET GUIDE_POSTS_WIDTH = 10000000
\`\`\`

To remove the guidepost width, set the property to null:

\`\`\`sql
ALTER TABLE my_table SET GUIDE_POSTS_WIDTH = null
\`\`\`

## Known issues

**Duplicated records** (SQL count shows more rows than HBase \`row_count\`) can occur in Phoenix versions earlier than **4.12**.

This may happen for tables with several regions where guideposts were not generated for the last region(s) because the region size is smaller than the guidepost width.
In that case, parallel scans for those regions may start with the latest guidepost instead of the region start key.
This was **fixed in 4.12** as part of [PHOENIX-4007](https://issues.apache.org/jira/browse/PHOENIX-4007).

## Configuration

The configuration parameters controlling statistics collection include:

1. \`phoenix.stats.guidepost.width\`
   * A server-side parameter that specifies the number of bytes between guideposts.
     A smaller amount increases parallelization, but also increases the number of
     chunks which must be merged on the client side.
   * The default value is 104857600 (100 MB).
2. \`phoenix.stats.updateFrequency\`
   * A server-side parameter that determines the frequency in milliseconds for which statistics
     will be refreshed from the statistics table and subsequently used by the client.
   * The default value is 900000 (15 mins).
3. \`phoenix.stats.minUpdateFrequency\` - A client-side parameter that determines the minimum amount of time in milliseconds that
   must pass before statistics may again be manually collected through another \`UPDATE
   STATISTICS\` call. - The default value is \`phoenix.stats.updateFrequency\` divided by two (7.5 mins).
4. \`phoenix.stats.useCurrentTime\`
   * An advanced server-side parameter that, if true, causes the current time on the server-side
     to be used as the timestamp of rows in the statistics table when background tasks such as
     compactions or splits occur. If false, then the max timestamp found while traversing the
     table over which statistics are being collected is used as the timestamp. Unless your
     client is controlling the timestamps while reading and writing data, this parameter
     should be left alone.
   * The default value is true.
5. \`phoenix.use.stats.parallelization\`
   * This configuration is available starting in Phoenix 4.12. It controls whether statistical information
     on the data should be used to drive query parallelization.
   * The default value is true.
`,l={title:"Statistics Collection",description:"How Phoenix collects and uses guidepost statistics for query parallelization, with commands and configuration."},o=[{href:"https://issues.apache.org/jira/browse/PHOENIX-4007"}],r={contents:[{heading:void 0,content:`The \`UPDATE STATISTICS\` command updates the statistics collected on a table.
This command collects a set of keys per region per column family that
are equal byte distanced from each other. These collected keys are called *guideposts*
and they act as *hints/guides* to improve the parallelization of queries on a given
target region.`},{heading:void 0,content:`Statistics are also automatically collected during major compactions and region splits so
manually running this command may not be necessary.`},{heading:"statistics-collection-parallelization",content:"Phoenix breaks up queries into multiple scans and runs them in parallel to reduce latency.\nParallelization in Phoenix is driven by statistics-related configuration parameters.\nEach chunk of data between guideposts will be run in parallel in a separate scan to improve\nquery performance. The chunk size is determined by the `GUIDE_POSTS_WIDTH` table property (Phoenix 4.9+)\nor the global server-side `phoenix.stats.guidepost.width` parameter if the table property is\nnot set. As the size of the chunks decrease,\nyou'll want to increase `phoenix.query.queueSize` as more work will be queued in that\ncase. Note that at a minimum, separate scans will be run for each table region. Statistics in Phoenix\nprovides a means of gaining intraregion parallelization. In addition to the guidepost width specification,\nthe client-side `phoenix.query.threadPoolSize` and `phoenix.query.queueSize` parameters\nand the server-side `hbase.regionserver.handler.count` parameter have an impact on the amount\nof parallelization."},{heading:"statistics-collection-examples",content:"To update the statistics for a given table `my_table`, execute the following command:"},{heading:"statistics-collection-examples",content:`The above syntax would collect the statistics for the table my\\_table and all the index tables,
views and view index tables associated with the table my\\_table.`},{heading:"statistics-collection-examples",content:"The equivalent syntax is:"},{heading:"statistics-collection-examples",content:"To collect statistics on the index table only:"},{heading:"statistics-collection-examples",content:"To collect statistics on the table only:"},{heading:"statistics-collection-examples",content:"To modify the guidepost width to 10MB for a table, execute the following command:"},{heading:"statistics-collection-examples",content:"To remove the guidepost width, set the property to null:"},{heading:"known-issues",content:"**Duplicated records** (SQL count shows more rows than HBase `row_count`) can occur in Phoenix versions earlier than **4.12**."},{heading:"known-issues",content:`This may happen for tables with several regions where guideposts were not generated for the last region(s) because the region size is smaller than the guidepost width.
In that case, parallel scans for those regions may start with the latest guidepost instead of the region start key.
This was **fixed in 4.12** as part of PHOENIX-4007.`},{heading:"statistics-collection-configuration",content:"The configuration parameters controlling statistics collection include:"},{heading:"statistics-collection-configuration",content:"`phoenix.stats.guidepost.width`"},{heading:"statistics-collection-configuration",content:`A server-side parameter that specifies the number of bytes between guideposts.
A smaller amount increases parallelization, but also increases the number of
chunks which must be merged on the client side.`},{heading:"statistics-collection-configuration",content:"The default value is 104857600 (100 MB)."},{heading:"statistics-collection-configuration",content:"`phoenix.stats.updateFrequency`"},{heading:"statistics-collection-configuration",content:`A server-side parameter that determines the frequency in milliseconds for which statistics
will be refreshed from the statistics table and subsequently used by the client.`},{heading:"statistics-collection-configuration",content:"The default value is 900000 (15 mins)."},{heading:"statistics-collection-configuration",content:"`phoenix.stats.minUpdateFrequency` - A client-side parameter that determines the minimum amount of time in milliseconds that\nmust pass before statistics may again be manually collected through another `UPDATE\nSTATISTICS` call. - The default value is `phoenix.stats.updateFrequency` divided by two (7.5 mins)."},{heading:"statistics-collection-configuration",content:"`phoenix.stats.useCurrentTime`"},{heading:"statistics-collection-configuration",content:`An advanced server-side parameter that, if true, causes the current time on the server-side
to be used as the timestamp of rows in the statistics table when background tasks such as
compactions or splits occur. If false, then the max timestamp found while traversing the
table over which statistics are being collected is used as the timestamp. Unless your
client is controlling the timestamps while reading and writing data, this parameter
should be left alone.`},{heading:"statistics-collection-configuration",content:"The default value is true."},{heading:"statistics-collection-configuration",content:"`phoenix.use.stats.parallelization`"},{heading:"statistics-collection-configuration",content:`This configuration is available starting in Phoenix 4.12. It controls whether statistical information
on the data should be used to drive query parallelization.`},{heading:"statistics-collection-configuration",content:"The default value is true."}],headings:[{id:"statistics-collection-parallelization",content:"Parallelization"},{id:"statistics-collection-examples",content:"Examples"},{id:"known-issues",content:"Known issues"},{id:"statistics-collection-configuration",content:"Configuration"}]},h=[{depth:2,url:"#statistics-collection-parallelization",title:e.jsx(e.Fragment,{children:"Parallelization"})},{depth:2,url:"#statistics-collection-examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#known-issues",title:e.jsx(e.Fragment,{children:"Known issues"})},{depth:2,url:"#statistics-collection-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})}];function s(i){const t={a:"a",code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"UPDATE STATISTICS"}),` command updates the statistics collected on a table.
This command collects a set of keys per region per column family that
are equal byte distanced from each other. These collected keys are called `,e.jsx(t.em,{children:"guideposts"}),`
and they act as `,e.jsx(t.em,{children:"hints/guides"}),` to improve the parallelization of queries on a given
target region.`]}),`
`,e.jsx(t.p,{children:`Statistics are also automatically collected during major compactions and region splits so
manually running this command may not be necessary.`}),`
`,e.jsx(t.h2,{id:"statistics-collection-parallelization",children:"Parallelization"}),`
`,e.jsxs(t.p,{children:[`Phoenix breaks up queries into multiple scans and runs them in parallel to reduce latency.
Parallelization in Phoenix is driven by statistics-related configuration parameters.
Each chunk of data between guideposts will be run in parallel in a separate scan to improve
query performance. The chunk size is determined by the `,e.jsx(t.code,{children:"GUIDE_POSTS_WIDTH"}),` table property (Phoenix 4.9+)
or the global server-side `,e.jsx(t.code,{children:"phoenix.stats.guidepost.width"}),` parameter if the table property is
not set. As the size of the chunks decrease,
you'll want to increase `,e.jsx(t.code,{children:"phoenix.query.queueSize"}),` as more work will be queued in that
case. Note that at a minimum, separate scans will be run for each table region. Statistics in Phoenix
provides a means of gaining intraregion parallelization. In addition to the guidepost width specification,
the client-side `,e.jsx(t.code,{children:"phoenix.query.threadPoolSize"})," and ",e.jsx(t.code,{children:"phoenix.query.queueSize"}),` parameters
and the server-side `,e.jsx(t.code,{children:"hbase.regionserver.handler.count"}),` parameter have an impact on the amount
of parallelization.`]}),`
`,e.jsx(t.h2,{id:"statistics-collection-examples",children:"Examples"}),`
`,e.jsxs(t.p,{children:["To update the statistics for a given table ",e.jsx(t.code,{children:"my_table"}),", execute the following command:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"UPDATE"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" STATISTICS"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table"})]})})})}),`
`,e.jsx(t.p,{children:`The above syntax would collect the statistics for the table my_table and all the index tables,
views and view index tables associated with the table my_table.`}),`
`,e.jsx(t.p,{children:"The equivalent syntax is:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"UPDATE"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" STATISTICS"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table ALL"})]})})})}),`
`,e.jsx(t.p,{children:"To collect statistics on the index table only:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"UPDATE"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" STATISTICS"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INDEX"})]})})})}),`
`,e.jsx(t.p,{children:"To collect statistics on the table only:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"UPDATE"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" STATISTICS"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table COLUMNS"})]})})})}),`
`,e.jsx(t.p,{children:"To modify the guidepost width to 10MB for a table, execute the following command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" GUIDE_POSTS_WIDTH "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 10000000"})]})})})}),`
`,e.jsx(t.p,{children:"To remove the guidepost width, set the property to null:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ALTER"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_table "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SET"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" GUIDE_POSTS_WIDTH "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" null"})]})})})}),`
`,e.jsx(t.h2,{id:"known-issues",children:"Known issues"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"Duplicated records"})," (SQL count shows more rows than HBase ",e.jsx(t.code,{children:"row_count"}),") can occur in Phoenix versions earlier than ",e.jsx(t.strong,{children:"4.12"}),"."]}),`
`,e.jsxs(t.p,{children:[`This may happen for tables with several regions where guideposts were not generated for the last region(s) because the region size is smaller than the guidepost width.
In that case, parallel scans for those regions may start with the latest guidepost instead of the region start key.
This was `,e.jsx(t.strong,{children:"fixed in 4.12"})," as part of ",e.jsx(t.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4007",children:"PHOENIX-4007"}),"."]}),`
`,e.jsx(t.h2,{id:"statistics-collection-configuration",children:"Configuration"}),`
`,e.jsx(t.p,{children:"The configuration parameters controlling statistics collection include:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"phoenix.stats.guidepost.width"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:`A server-side parameter that specifies the number of bytes between guideposts.
A smaller amount increases parallelization, but also increases the number of
chunks which must be merged on the client side.`}),`
`,e.jsx(t.li,{children:"The default value is 104857600 (100 MB)."}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"phoenix.stats.updateFrequency"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:`A server-side parameter that determines the frequency in milliseconds for which statistics
will be refreshed from the statistics table and subsequently used by the client.`}),`
`,e.jsx(t.li,{children:"The default value is 900000 (15 mins)."}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"phoenix.stats.minUpdateFrequency"}),` - A client-side parameter that determines the minimum amount of time in milliseconds that
must pass before statistics may again be manually collected through another `,e.jsx(t.code,{children:"UPDATE STATISTICS"})," call. - The default value is ",e.jsx(t.code,{children:"phoenix.stats.updateFrequency"})," divided by two (7.5 mins)."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"phoenix.stats.useCurrentTime"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:`An advanced server-side parameter that, if true, causes the current time on the server-side
to be used as the timestamp of rows in the statistics table when background tasks such as
compactions or splits occur. If false, then the max timestamp found while traversing the
table over which statistics are being collected is used as the timestamp. Unless your
client is controlling the timestamps while reading and writing data, this parameter
should be left alone.`}),`
`,e.jsx(t.li,{children:"The default value is true."}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"phoenix.use.stats.parallelization"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:`This configuration is available starting in Phoenix 4.12. It controls whether statistical information
on the data should be used to drive query parallelization.`}),`
`,e.jsx(t.li,{children:"The default value is true."}),`
`]}),`
`]}),`
`]})]})}function c(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(s,{...i})}):s(i)}export{a as _markdown,c as default,o as extractedReferences,l as frontmatter,r as structuredData,h as toc};
