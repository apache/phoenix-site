import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as o,a as l}from"./squirrel-CO237F3w.js";let c=`



## Installation

To install a pre-built Phoenix, use these directions:

* [Download](/downloads) and expand the latest \`phoenix-hbase-[hbase.version]-[phoenix.version]-bin.tar.gz\` for your HBase version.
* Add \`phoenix-server-hbase-[hbase.version]-[phoenix.version].jar\` to the classpath of all HBase region servers and masters, and remove any previous version. An easy way is to copy it into the HBase \`lib\` directory.
* Restart HBase.
* Add \`phoenix-client-hbase-[hbase.version]-[phoenix.version].jar\` to the classpath of any JDBC client.

To install Phoenix from source:

* [Download](/downloads) and expand the latest \`phoenix-[phoenix.version]-src.tar.gz\` for your HBase version, or check it out from the main source [repository](/source-repository).
* Follow the build instructions in \`BUILDING.md\` in the root directory of the source distribution/repository to build the binary assembly.
* Follow the instructions above, but use the assembly built from source.

### Getting Started

Want to get started quickly? Take a look at our [FAQs](/docs/faq) and quick start guide [here](/docs/quick-start).

#### Command Line

A terminal interface to execute SQL from the command line is now bundled with Phoenix. To start it, execute the following from the bin directory:

\`\`\`shell
$ sqlline.py [zk quorum hosts]
\`\`\`

To execute SQL scripts from the command line, you can include a SQL file argument like this:

\`\`\`shell
$ sqlline.py [zk quorum hosts] ../examples/stock_symbol.sql
\`\`\`

<img alt="sqlline" src={__img0} placeholder="blur" />

For more information, see the [manual](https://julianhyde.github.io/sqlline/manual.html).

##### Loading Data

In addition, you can use \`bin/psql.py\` to load CSV data or execute SQL scripts. For example:

\`\`\`shell
$ psql.py localhost ../examples/web_stat.sql ../examples/web_stat.csv ../examples/web_stat_queries.sql
\`\`\`

Other alternatives include:

* Using our [map-reduce based CSV loader](/docs/features/bulk-loading) for bigger data sets
* [Mapping an existing HBase table to a Phoenix table](/docs#mapping-to-an-existing-hbase-table) and using the [UPSERT SELECT](/docs/grammar#upsert-select) command to populate a new table.
* Populating the table through our [UPSERT VALUES](/docs/grammar#upsert-values) command.

#### SQuirreL SQL Client

If you'd rather use a client GUI to interact with Phoenix, download and install [SQuirrel](http://squirrel-sql.sourceforge.net/). Since Phoenix is a JDBC driver, integration with tools such as this are seamless. Here are the setup steps necessary:

<Steps>
  <Step>
    Remove prior \`phoenix-[_oldversion_]-client.jar\` from the SQuirreL \`lib\`
    directory, then copy \`phoenix-[_newversion_]-client.jar\` there (\`_newversion_\`
    should match the Phoenix server jar used with your HBase installation).
  </Step>

  <Step>
    Start SQuirreL and add a new driver (

    \`Drivers -> New Driver\`

    ).
  </Step>

  <Step>
    In Add Driver, set Name to \`Phoenix\`, and set the Example URL to
    \`jdbc:phoenix:localhost\`.
  </Step>

  <Step>
    Enter \`org.apache.phoenix.jdbc.PhoenixDriver\` into the Class Name field and
    click OK.
  </Step>

  <Step>
    Switch to Alias tab and create a new Alias (\`Aliases -> New Alias\`).
  </Step>

  <Step>
    In the dialog, use Name: *any name*, Driver: \`Phoenix\`, User Name: *anything*,
    Password: *anything*.
  </Step>

  <Step>
    Construct URL as follows: \`jdbc:phoenix:[zookeeper quorum server]\`. For
    example, to connect to local HBase use \`jdbc:phoenix:localhost\`.
  </Step>

  <Step>
    Press Test (it should succeed if everything is set up correctly), then press
    OK to close.
  </Step>

  <Step>
    Double-click your newly created Phoenix alias and click Connect. You are now
    ready to run SQL queries against Phoenix.
  </Step>
</Steps>

Through SQuirreL, you can issue SQL statements in the SQL tab (create tables, insert data, run queries), and inspect table metadata in the Object tab (for example, list tables, columns, primary keys, and types).

<img alt="squirrel" src={__img1} placeholder="blur" />

Note that most graphical clients that support generic JDBC drives should also work, and the setup process is usually similar.

### Samples

The best place to see samples are in our unit tests under src/test/java. The ones in the endToEnd package are tests demonstrating how to use all aspects of the Phoenix JDBC driver. We also have some examples in the examples directory.
`,u={title:"Installation",description:"Install and configure Apache Phoenix clients and server components.",icon:"Wrench"},p=[{href:"/downloads"},{href:"/downloads"},{href:"/source-repository"},{href:"/docs/faq"},{href:"/docs/quick-start"},{href:"https://julianhyde.github.io/sqlline/manual.html"},{href:"/docs/features/bulk-loading"},{href:"/docs#mapping-to-an-existing-hbase-table"},{href:"/docs/grammar#upsert-select"},{href:"/docs/grammar#upsert-values"},{href:"http://squirrel-sql.sourceforge.net/"}],m={contents:[{heading:"installation-installation",content:"To install a pre-built Phoenix, use these directions:"},{heading:"installation-installation",content:"Download and expand the latest phoenix-hbase-[hbase.version]-[phoenix.version]-bin.tar.gz for your HBase version."},{heading:"installation-installation",content:"Add phoenix-server-hbase-[hbase.version]-[phoenix.version].jar to the classpath of all HBase region servers and masters, and remove any previous version. An easy way is to copy it into the HBase lib directory."},{heading:"installation-installation",content:"Restart HBase."},{heading:"installation-installation",content:"Add phoenix-client-hbase-[hbase.version]-[phoenix.version].jar to the classpath of any JDBC client."},{heading:"installation-installation",content:"To install Phoenix from source:"},{heading:"installation-installation",content:"Download and expand the latest phoenix-[phoenix.version]-src.tar.gz for your HBase version, or check it out from the main source repository."},{heading:"installation-installation",content:"Follow the build instructions in BUILDING.md in the root directory of the source distribution/repository to build the binary assembly."},{heading:"installation-installation",content:"Follow the instructions above, but use the assembly built from source."},{heading:"installation-getting-started",content:"Want to get started quickly? Take a look at our FAQs and quick start guide here."},{heading:"command-line",content:"A terminal interface to execute SQL from the command line is now bundled with Phoenix. To start it, execute the following from the bin directory:"},{heading:"command-line",content:"To execute SQL scripts from the command line, you can include a SQL file argument like this:"},{heading:"command-line",content:"For more information, see the manual."},{heading:"loading-data",content:"In addition, you can use bin/psql.py to load CSV data or execute SQL scripts. For example:"},{heading:"loading-data",content:"Other alternatives include:"},{heading:"loading-data",content:"Using our map-reduce based CSV loader for bigger data sets"},{heading:"loading-data",content:"Mapping an existing HBase table to a Phoenix table and using the UPSERT SELECT command to populate a new table."},{heading:"loading-data",content:"Populating the table through our UPSERT VALUES command."},{heading:"squirrel-sql-client",content:"If you'd rather use a client GUI to interact with Phoenix, download and install SQuirrel. Since Phoenix is a JDBC driver, integration with tools such as this are seamless. Here are the setup steps necessary:"},{heading:"squirrel-sql-client",content:`Remove prior phoenix-[_oldversion_]-client.jar from the SQuirreL lib
directory, then copy phoenix-[_newversion_]-client.jar there (_newversion_
should match the Phoenix server jar used with your HBase installation).`},{heading:"squirrel-sql-client",content:`In Add Driver, set Name to Phoenix, and set the Example URL to
jdbc:phoenix:localhost.`},{heading:"squirrel-sql-client",content:`Enter org.apache.phoenix.jdbc.PhoenixDriver into the Class Name field and
click OK.`},{heading:"squirrel-sql-client",content:"Switch to Alias tab and create a new Alias (Aliases -> New Alias)."},{heading:"squirrel-sql-client",content:`In the dialog, use Name: any name, Driver: Phoenix, User Name: anything,
Password: anything.`},{heading:"squirrel-sql-client",content:`Construct URL as follows: jdbc:phoenix:[zookeeper quorum server]. For
example, to connect to local HBase use jdbc:phoenix:localhost.`},{heading:"squirrel-sql-client",content:`Press Test (it should succeed if everything is set up correctly), then press
OK to close.`},{heading:"squirrel-sql-client",content:`Double-click your newly created Phoenix alias and click Connect. You are now
ready to run SQL queries against Phoenix.`},{heading:"squirrel-sql-client",content:"Through SQuirreL, you can issue SQL statements in the SQL tab (create tables, insert data, run queries), and inspect table metadata in the Object tab (for example, list tables, columns, primary keys, and types)."},{heading:"squirrel-sql-client",content:"Note that most graphical clients that support generic JDBC drives should also work, and the setup process is usually similar."},{heading:"samples",content:"The best place to see samples are in our unit tests under src/test/java. The ones in the endToEnd package are tests demonstrating how to use all aspects of the Phoenix JDBC driver. We also have some examples in the examples directory."}],headings:[{id:"installation-installation",content:"Installation"},{id:"installation-getting-started",content:"Getting Started"},{id:"command-line",content:"Command Line"},{id:"loading-data",content:"Loading Data"},{id:"squirrel-sql-client",content:"SQuirreL SQL Client"},{id:"samples",content:"Samples"}]};const x=[{depth:2,url:"#installation-installation",title:e.jsx(e.Fragment,{children:"Installation"})},{depth:3,url:"#installation-getting-started",title:e.jsx(e.Fragment,{children:"Getting Started"})},{depth:4,url:"#command-line",title:e.jsx(e.Fragment,{children:"Command Line"})},{depth:5,url:"#loading-data",title:e.jsx(e.Fragment,{children:"Loading Data"})},{depth:4,url:"#squirrel-sql-client",title:e.jsx(e.Fragment,{children:"SQuirreL SQL Client"})},{depth:3,url:"#samples",title:e.jsx(e.Fragment,{children:"Samples"})}];function a(i){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",h5:"h5",img:"img",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components},{Step:t,Steps:s}=n;return t||r("Step"),s||r("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"installation-installation",children:"Installation"}),`
`,e.jsx(n.p,{children:"To install a pre-built Phoenix, use these directions:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/downloads",children:"Download"})," and expand the latest ",e.jsx(n.code,{children:"phoenix-hbase-[hbase.version]-[phoenix.version]-bin.tar.gz"})," for your HBase version."]}),`
`,e.jsxs(n.li,{children:["Add ",e.jsx(n.code,{children:"phoenix-server-hbase-[hbase.version]-[phoenix.version].jar"})," to the classpath of all HBase region servers and masters, and remove any previous version. An easy way is to copy it into the HBase ",e.jsx(n.code,{children:"lib"})," directory."]}),`
`,e.jsx(n.li,{children:"Restart HBase."}),`
`,e.jsxs(n.li,{children:["Add ",e.jsx(n.code,{children:"phoenix-client-hbase-[hbase.version]-[phoenix.version].jar"})," to the classpath of any JDBC client."]}),`
`]}),`
`,e.jsx(n.p,{children:"To install Phoenix from source:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/downloads",children:"Download"})," and expand the latest ",e.jsx(n.code,{children:"phoenix-[phoenix.version]-src.tar.gz"})," for your HBase version, or check it out from the main source ",e.jsx(n.a,{href:"/source-repository",children:"repository"}),"."]}),`
`,e.jsxs(n.li,{children:["Follow the build instructions in ",e.jsx(n.code,{children:"BUILDING.md"})," in the root directory of the source distribution/repository to build the binary assembly."]}),`
`,e.jsx(n.li,{children:"Follow the instructions above, but use the assembly built from source."}),`
`]}),`
`,e.jsx(n.h3,{id:"installation-getting-started",children:"Getting Started"}),`
`,e.jsxs(n.p,{children:["Want to get started quickly? Take a look at our ",e.jsx(n.a,{href:"/docs/faq",children:"FAQs"})," and quick start guide ",e.jsx(n.a,{href:"/docs/quick-start",children:"here"}),"."]}),`
`,e.jsx(n.h4,{id:"command-line",children:"Command Line"}),`
`,e.jsx(n.p,{children:"A terminal interface to execute SQL from the command line is now bundled with Phoenix. To start it, execute the following from the bin directory:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sqlline.py"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zk "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"quorum"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hosts]"})]})})})}),`
`,e.jsx(n.p,{children:"To execute SQL scripts from the command line, you can include a SQL file argument like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" sqlline.py"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [zk "}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"quorum"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hosts]"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../examples/stock_symbol.sql"})]})})})}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"sqlline",src:o,placeholder:"blur"})}),`
`,e.jsxs(n.p,{children:["For more information, see the ",e.jsx(n.a,{href:"https://julianhyde.github.io/sqlline/manual.html",children:"manual"}),"."]}),`
`,e.jsx(n.h5,{id:"loading-data",children:"Loading Data"}),`
`,e.jsxs(n.p,{children:["In addition, you can use ",e.jsx(n.code,{children:"bin/psql.py"})," to load CSV data or execute SQL scripts. For example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" psql.py"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" localhost"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../examples/web_stat.sql"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../examples/web_stat.csv"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ../examples/web_stat_queries.sql"})]})})})}),`
`,e.jsx(n.p,{children:"Other alternatives include:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Using our ",e.jsx(n.a,{href:"/docs/features/bulk-loading",children:"map-reduce based CSV loader"})," for bigger data sets"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs#mapping-to-an-existing-hbase-table",children:"Mapping an existing HBase table to a Phoenix table"})," and using the ",e.jsx(n.a,{href:"/docs/grammar#upsert-select",children:"UPSERT SELECT"})," command to populate a new table."]}),`
`,e.jsxs(n.li,{children:["Populating the table through our ",e.jsx(n.a,{href:"/docs/grammar#upsert-values",children:"UPSERT VALUES"})," command."]}),`
`]}),`
`,e.jsx(n.h4,{id:"squirrel-sql-client",children:"SQuirreL SQL Client"}),`
`,e.jsxs(n.p,{children:["If you'd rather use a client GUI to interact with Phoenix, download and install ",e.jsx(n.a,{href:"http://squirrel-sql.sourceforge.net/",children:"SQuirrel"}),". Since Phoenix is a JDBC driver, integration with tools such as this are seamless. Here are the setup steps necessary:"]}),`
`,e.jsxs(s,{children:[e.jsx(t,{children:e.jsxs(n.p,{children:["Remove prior ",e.jsx(n.code,{children:"phoenix-[_oldversion_]-client.jar"})," from the SQuirreL ",e.jsx(n.code,{children:"lib"}),`
directory, then copy `,e.jsx(n.code,{children:"phoenix-[_newversion_]-client.jar"})," there (",e.jsx(n.code,{children:"_newversion_"}),`
should match the Phoenix server jar used with your HBase installation).`]})}),e.jsxs(t,{children:["Start SQuirreL and add a new driver (",e.jsx(n.code,{children:"Drivers -> New Driver"}),")."]}),e.jsx(t,{children:e.jsxs(n.p,{children:["In Add Driver, set Name to ",e.jsx(n.code,{children:"Phoenix"}),`, and set the Example URL to
`,e.jsx(n.code,{children:"jdbc:phoenix:localhost"}),"."]})}),e.jsx(t,{children:e.jsxs(n.p,{children:["Enter ",e.jsx(n.code,{children:"org.apache.phoenix.jdbc.PhoenixDriver"}),` into the Class Name field and
click OK.`]})}),e.jsx(t,{children:e.jsxs(n.p,{children:["Switch to Alias tab and create a new Alias (",e.jsx(n.code,{children:"Aliases -> New Alias"}),")."]})}),e.jsx(t,{children:e.jsxs(n.p,{children:["In the dialog, use Name: ",e.jsx(n.em,{children:"any name"}),", Driver: ",e.jsx(n.code,{children:"Phoenix"}),", User Name: ",e.jsx(n.em,{children:"anything"}),`,
Password: `,e.jsx(n.em,{children:"anything"}),"."]})}),e.jsx(t,{children:e.jsxs(n.p,{children:["Construct URL as follows: ",e.jsx(n.code,{children:"jdbc:phoenix:[zookeeper quorum server]"}),`. For
example, to connect to local HBase use `,e.jsx(n.code,{children:"jdbc:phoenix:localhost"}),"."]})}),e.jsx(t,{children:e.jsx(n.p,{children:`Press Test (it should succeed if everything is set up correctly), then press
OK to close.`})}),e.jsx(t,{children:e.jsx(n.p,{children:`Double-click your newly created Phoenix alias and click Connect. You are now
ready to run SQL queries against Phoenix.`})})]}),`
`,e.jsx(n.p,{children:"Through SQuirreL, you can issue SQL statements in the SQL tab (create tables, insert data, run queries), and inspect table metadata in the Object tab (for example, list tables, columns, primary keys, and types)."}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"squirrel",src:l,placeholder:"blur"})}),`
`,e.jsx(n.p,{children:"Note that most graphical clients that support generic JDBC drives should also work, and the setup process is usually similar."}),`
`,e.jsx(n.h3,{id:"samples",children:"Samples"}),`
`,e.jsx(n.p,{children:"The best place to see samples are in our unit tests under src/test/java. The ones in the endToEnd package are tests demonstrating how to use all aspects of the Phoenix JDBC driver. We also have some examples in the examples directory."})]})}function g(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(a,{...i})}):a(i)}function r(i,n){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as _markdown,g as default,p as extractedReferences,u as frontmatter,m as structuredData,x as toc};
