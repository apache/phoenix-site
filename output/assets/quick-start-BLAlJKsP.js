import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let h=`## What is this new Phoenix thing I've been hearing about?

Phoenix is an open source SQL skin for HBase. You use the standard JDBC APIs instead of the regular HBase client APIs to create tables, insert data, and query your HBase data.

### Doesn't putting an extra layer between my application and HBase just slow things down?

Actually, no. Phoenix achieves as good or likely better [performance](/docs/fundamentals/performance) than if you hand-coded it yourself (not to mention with a heck of a lot less code) by:

* compiling your SQL queries to native HBase scans
* determining the optimal start and stop for your scan key
* orchestrating the parallel execution of your scans
* bringing the computation to the data by
  * pushing the predicates in your where clause to a server-side filter
  * executing aggregate queries through server-side hooks (called co-processors)
* secondary indexes to improve performance for queries on non row key columns
* stats gathering to improve parallelization and guide choices between optimizations
* skip scan filter to optimize IN, LIKE, and OR queries
* optional salting of row keys to evenly distribute write load

### Ok, so it's fast. But why SQL? It's so 1970s

Well, that's kind of the point: give folks something with which they're already familiar. What better way to spur the adoption of HBase? On top of that, using JDBC and SQL:

* Reduces the amount of code users need to write
* Allows for performance optimizations transparent to the user
* Opens the door for leveraging and integrating lots of existing tooling

### But how can SQL support my favorite HBase technique of x,y,z

Didn't make it to the last HBase Meetup did you? SQL is just a way of expressing ***what you want to get*** not ***how you want to get it***. Check out my [presentation](http://files.meetup.com/1350427/IntelPhoenixHBaseMeetup.ppt) for various existing and to-be-done Phoenix features to support your favorite HBase trick. Have ideas of your own? We'd love to hear about them: file an [issue](/issues-tracking) for us and/or join our [mailing list](/mailing-lists).

## Blah, blah, blah - I just want to get started!

Ok, great! Just follow our [install instructions](/docs/installation):

* [download](/downloads) and expand our installation binary tar corresponding to your HBase version
* copy the phoenix server jar into the lib directory of every region server and master
* restart HBase
* add the phoenix client jar to the classpath of your JDBC client or application
* We have detailed instructions for [setting up SQuirreL SQL](/docs/installation#squirrel-sql-client) as your SQL client

## I don't want to download and setup anything else!

Ok, fair enough - you can create your own SQL scripts and execute them using our command line tools instead. Let's walk through an example now. Begin by navigating to the \`bin/\` directory of your Phoenix install location.

<Steps>
  <Step>
    ### First, let's create a \`us_population.sql\` file, containing a table definition:

    \`\`\`sql
    CREATE TABLE IF NOT EXISTS us_population (
      state CHAR(2) NOT NULL,
      city VARCHAR NOT NULL,
      population BIGINT
      CONSTRAINT my_pk PRIMARY KEY (state, city)
    );
    \`\`\`
  </Step>

  <Step>
    ### Now let's create a \`us_population.csv\` file containing some data to put in that table:

    \`\`\`csv
    NY,New York,8143197
    CA,Los Angeles,3844829
    IL,Chicago,2842518
    TX,Houston,2016582
    PA,Philadelphia,1463281
    AZ,Phoenix,1461575
    TX,San Antonio,1256509
    CA,San Diego,1255540
    TX,Dallas,1213825
    CA,San Jose,912332
    \`\`\`
  </Step>

  <Step>
    ### Execute the following command from a command terminal to create and populate the table

    \`\`\`bash
    ./psql.py <your_zookeeper_quorum> us_population.sql us_population.csv
    \`\`\`
  </Step>

  <Step>
    ### Start the interactive sql client

    \`\`\`bash
    ./sqlline.py <your_zookeeper_quorum>
    \`\`\`

    and issue a query

    \`\`\`sql
    SELECT state as "State",count(city) as "City Count",sum(population) as "Population Sum"
    FROM us_population
    GROUP BY state
    ORDER BY sum(population) DESC;
    \`\`\`
  </Step>
</Steps>

Congratulations! You've just created your first Phoenix table, inserted data into it, and executed an aggregate query with just a few lines of code in 15 minutes or less!

### Big deal - 10 rows! What else you got?

Ok, ok - tough crowd. Check out our \`bin/performance.py\` script to create as many rows as you want, for any schema you come up with, and run timed queries against it.

### Why is it called Phoenix anyway? Did some other project crash and burn and this is the next generation?

I'm sorry, but we're out of time and space, so we'll have to answer that next time!
`,r={title:"Quick Start",description:"Phoenix in 15 minutes or less.",icon:"Rocket"},d=[{href:"/docs/fundamentals/performance"},{href:"http://files.meetup.com/1350427/IntelPhoenixHBaseMeetup.ppt"},{href:"/issues-tracking"},{href:"/mailing-lists"},{href:"/docs/installation"},{href:"/downloads"},{href:"/docs/installation#squirrel-sql-client"}],c={contents:[{heading:"what-is-this-new-phoenix-thing-ive-been-hearing-about",content:"Phoenix is an open source SQL skin for HBase. You use the standard JDBC APIs instead of the regular HBase client APIs to create tables, insert data, and query your HBase data."},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"Actually, no. Phoenix achieves as good or likely better performance than if you hand-coded it yourself (not to mention with a heck of a lot less code) by:"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"compiling your SQL queries to native HBase scans"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"determining the optimal start and stop for your scan key"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"orchestrating the parallel execution of your scans"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"bringing the computation to the data by"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"pushing the predicates in your where clause to a server-side filter"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"executing aggregate queries through server-side hooks (called co-processors)"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"secondary indexes to improve performance for queries on non row key columns"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"stats gathering to improve parallelization and guide choices between optimizations"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"skip scan filter to optimize IN, LIKE, and OR queries"},{heading:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"optional salting of row keys to evenly distribute write load"},{heading:"ok-so-its-fast-but-why-sql-its-so-1970s",content:"Well, that's kind of the point: give folks something with which they're already familiar. What better way to spur the adoption of HBase? On top of that, using JDBC and SQL:"},{heading:"ok-so-its-fast-but-why-sql-its-so-1970s",content:"Reduces the amount of code users need to write"},{heading:"ok-so-its-fast-but-why-sql-its-so-1970s",content:"Allows for performance optimizations transparent to the user"},{heading:"ok-so-its-fast-but-why-sql-its-so-1970s",content:"Opens the door for leveraging and integrating lots of existing tooling"},{heading:"but-how-can-sql-support-my-favorite-hbase-technique-of-xyz",content:"Didn't make it to the last HBase Meetup did you? SQL is just a way of expressing what you want to get not how you want to get it. Check out my presentation for various existing and to-be-done Phoenix features to support your favorite HBase trick. Have ideas of your own? We'd love to hear about them: file an issue for us and/or join our mailing list."},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"Ok, great! Just follow our install instructions:"},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"download and expand our installation binary tar corresponding to your HBase version"},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"copy the phoenix server jar into the lib directory of every region server and master"},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"restart HBase"},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"add the phoenix client jar to the classpath of your JDBC client or application"},{heading:"blah-blah-blah---i-just-want-to-get-started",content:"We have detailed instructions for setting up SQuirreL SQL as your SQL client"},{heading:"i-dont-want-to-download-and-setup-anything-else",content:"Ok, fair enough - you can create your own SQL scripts and execute them using our command line tools instead. Let's walk through an example now. Begin by navigating to the bin/ directory of your Phoenix install location."},{heading:"start-the-interactive-sql-client",content:"and issue a query"},{heading:"start-the-interactive-sql-client",content:"Congratulations! You've just created your first Phoenix table, inserted data into it, and executed an aggregate query with just a few lines of code in 15 minutes or less!"},{heading:"big-deal---10-rows-what-else-you-got",content:"Ok, ok - tough crowd. Check out our bin/performance.py script to create as many rows as you want, for any schema you come up with, and run timed queries against it."},{heading:"why-is-it-called-phoenix-anyway-did-some-other-project-crash-and-burn-and-this-is-the-next-generation",content:"I'm sorry, but we're out of time and space, so we'll have to answer that next time!"}],headings:[{id:"what-is-this-new-phoenix-thing-ive-been-hearing-about",content:"What is this new Phoenix thing I've been hearing about?"},{id:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",content:"Doesn't putting an extra layer between my application and HBase just slow things down?"},{id:"ok-so-its-fast-but-why-sql-its-so-1970s",content:"Ok, so it's fast. But why SQL? It's so 1970s"},{id:"but-how-can-sql-support-my-favorite-hbase-technique-of-xyz",content:"But how can SQL support my favorite HBase technique of x,y,z"},{id:"blah-blah-blah---i-just-want-to-get-started",content:"Blah, blah, blah - I just want to get started!"},{id:"i-dont-want-to-download-and-setup-anything-else",content:"I don't want to download and setup anything else!"},{id:"first-lets-create-a-us_populationsql-file-containing-a-table-definition",content:"First, let's create a us_population.sql file, containing a table definition:"},{id:"now-lets-create-a-us_populationcsv-file-containing-some-data-to-put-in-that-table",content:"Now let's create a us_population.csv file containing some data to put in that table:"},{id:"execute-the-following-command-from-a-command-terminal-to-create-and-populate-the-table",content:"Execute the following command from a command terminal to create and populate the table"},{id:"start-the-interactive-sql-client",content:"Start the interactive sql client"},{id:"big-deal---10-rows-what-else-you-got",content:"Big deal - 10 rows! What else you got?"},{id:"why-is-it-called-phoenix-anyway-did-some-other-project-crash-and-burn-and-this-is-the-next-generation",content:"Why is it called Phoenix anyway? Did some other project crash and burn and this is the next generation?"}]};const u=[{depth:2,url:"#what-is-this-new-phoenix-thing-ive-been-hearing-about",title:e.jsx(e.Fragment,{children:"What is this new Phoenix thing I've been hearing about?"})},{depth:3,url:"#doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",title:e.jsx(e.Fragment,{children:"Doesn't putting an extra layer between my application and HBase just slow things down?"})},{depth:3,url:"#ok-so-its-fast-but-why-sql-its-so-1970s",title:e.jsx(e.Fragment,{children:"Ok, so it's fast. But why SQL? It's so 1970s"})},{depth:3,url:"#but-how-can-sql-support-my-favorite-hbase-technique-of-xyz",title:e.jsx(e.Fragment,{children:"But how can SQL support my favorite HBase technique of x,y,z"})},{depth:2,url:"#blah-blah-blah---i-just-want-to-get-started",title:e.jsx(e.Fragment,{children:"Blah, blah, blah - I just want to get started!"})},{depth:2,url:"#i-dont-want-to-download-and-setup-anything-else",title:e.jsx(e.Fragment,{children:"I don't want to download and setup anything else!"})},{depth:3,url:"#first-lets-create-a-us_populationsql-file-containing-a-table-definition",title:e.jsxs(e.Fragment,{children:["First, let's create a ",e.jsx("code",{children:"us_population.sql"})," file, containing a table definition:"]})},{depth:3,url:"#now-lets-create-a-us_populationcsv-file-containing-some-data-to-put-in-that-table",title:e.jsxs(e.Fragment,{children:["Now let's create a ",e.jsx("code",{children:"us_population.csv"})," file containing some data to put in that table:"]})},{depth:3,url:"#execute-the-following-command-from-a-command-terminal-to-create-and-populate-the-table",title:e.jsx(e.Fragment,{children:"Execute the following command from a command terminal to create and populate the table"})},{depth:3,url:"#start-the-interactive-sql-client",title:e.jsx(e.Fragment,{children:"Start the interactive sql client"})},{depth:3,url:"#big-deal---10-rows-what-else-you-got",title:e.jsx(e.Fragment,{children:"Big deal - 10 rows! What else you got?"})},{depth:3,url:"#why-is-it-called-phoenix-anyway-did-some-other-project-crash-and-burn-and-this-is-the-next-generation",title:e.jsx(e.Fragment,{children:"Why is it called Phoenix anyway? Did some other project crash and burn and this is the next generation?"})}];function a(t){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components},{Step:n,Steps:s}=i;return n||o("Step"),s||o("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"what-is-this-new-phoenix-thing-ive-been-hearing-about",children:"What is this new Phoenix thing I've been hearing about?"}),`
`,e.jsx(i.p,{children:"Phoenix is an open source SQL skin for HBase. You use the standard JDBC APIs instead of the regular HBase client APIs to create tables, insert data, and query your HBase data."}),`
`,e.jsx(i.h3,{id:"doesnt-putting-an-extra-layer-between-my-application-and-hbase-just-slow-things-down",children:"Doesn't putting an extra layer between my application and HBase just slow things down?"}),`
`,e.jsxs(i.p,{children:["Actually, no. Phoenix achieves as good or likely better ",e.jsx(i.a,{href:"/docs/fundamentals/performance",children:"performance"})," than if you hand-coded it yourself (not to mention with a heck of a lot less code) by:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"compiling your SQL queries to native HBase scans"}),`
`,e.jsx(i.li,{children:"determining the optimal start and stop for your scan key"}),`
`,e.jsx(i.li,{children:"orchestrating the parallel execution of your scans"}),`
`,e.jsxs(i.li,{children:["bringing the computation to the data by",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"pushing the predicates in your where clause to a server-side filter"}),`
`,e.jsx(i.li,{children:"executing aggregate queries through server-side hooks (called co-processors)"}),`
`]}),`
`]}),`
`,e.jsx(i.li,{children:"secondary indexes to improve performance for queries on non row key columns"}),`
`,e.jsx(i.li,{children:"stats gathering to improve parallelization and guide choices between optimizations"}),`
`,e.jsx(i.li,{children:"skip scan filter to optimize IN, LIKE, and OR queries"}),`
`,e.jsx(i.li,{children:"optional salting of row keys to evenly distribute write load"}),`
`]}),`
`,e.jsx(i.h3,{id:"ok-so-its-fast-but-why-sql-its-so-1970s",children:"Ok, so it's fast. But why SQL? It's so 1970s"}),`
`,e.jsx(i.p,{children:"Well, that's kind of the point: give folks something with which they're already familiar. What better way to spur the adoption of HBase? On top of that, using JDBC and SQL:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Reduces the amount of code users need to write"}),`
`,e.jsx(i.li,{children:"Allows for performance optimizations transparent to the user"}),`
`,e.jsx(i.li,{children:"Opens the door for leveraging and integrating lots of existing tooling"}),`
`]}),`
`,e.jsx(i.h3,{id:"but-how-can-sql-support-my-favorite-hbase-technique-of-xyz",children:"But how can SQL support my favorite HBase technique of x,y,z"}),`
`,e.jsxs(i.p,{children:["Didn't make it to the last HBase Meetup did you? SQL is just a way of expressing ",e.jsx(i.strong,{children:e.jsx(i.em,{children:"what you want to get"})})," not ",e.jsx(i.strong,{children:e.jsx(i.em,{children:"how you want to get it"})}),". Check out my ",e.jsx(i.a,{href:"http://files.meetup.com/1350427/IntelPhoenixHBaseMeetup.ppt",children:"presentation"})," for various existing and to-be-done Phoenix features to support your favorite HBase trick. Have ideas of your own? We'd love to hear about them: file an ",e.jsx(i.a,{href:"/issues-tracking",children:"issue"})," for us and/or join our ",e.jsx(i.a,{href:"/mailing-lists",children:"mailing list"}),"."]}),`
`,e.jsx(i.h2,{id:"blah-blah-blah---i-just-want-to-get-started",children:"Blah, blah, blah - I just want to get started!"}),`
`,e.jsxs(i.p,{children:["Ok, great! Just follow our ",e.jsx(i.a,{href:"/docs/installation",children:"install instructions"}),":"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/downloads",children:"download"})," and expand our installation binary tar corresponding to your HBase version"]}),`
`,e.jsx(i.li,{children:"copy the phoenix server jar into the lib directory of every region server and master"}),`
`,e.jsx(i.li,{children:"restart HBase"}),`
`,e.jsx(i.li,{children:"add the phoenix client jar to the classpath of your JDBC client or application"}),`
`,e.jsxs(i.li,{children:["We have detailed instructions for ",e.jsx(i.a,{href:"/docs/installation#squirrel-sql-client",children:"setting up SQuirreL SQL"})," as your SQL client"]}),`
`]}),`
`,e.jsx(i.h2,{id:"i-dont-want-to-download-and-setup-anything-else",children:"I don't want to download and setup anything else!"}),`
`,e.jsxs(i.p,{children:["Ok, fair enough - you can create your own SQL scripts and execute them using our command line tools instead. Let's walk through an example now. Begin by navigating to the ",e.jsx(i.code,{children:"bin/"})," directory of your Phoenix install location."]}),`
`,e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsxs(i.h3,{id:"first-lets-create-a-us_populationsql-file-containing-a-table-definition",children:["First, let's create a ",e.jsx(i.code,{children:"us_population.sql"})," file, containing a table definition:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CREATE"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" TABLE"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IF"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" EXISTS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" us_population ("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  state"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" CHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  city "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" NOT NULL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  population"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" BIGINT"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  CONSTRAINT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" my_pk "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"PRIMARY KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"state"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", city)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})})]}),e.jsxs(n,{children:[e.jsxs(i.h3,{id:"now-lets-create-a-us_populationcsv-file-containing-some-data-to-put-in-that-table",children:["Now let's create a ",e.jsx(i.code,{children:"us_population.csv"})," file containing some data to put in that table:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"NY,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"New York,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"8143197"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"CA,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Los Angeles,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"3844829"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"IL,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Chicago,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2842518"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TX,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Houston,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2016582"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"PA,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Philadelphia,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1463281"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"AZ,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Phoenix,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1461575"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TX,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"San Antonio,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1256509"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"CA,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"San Diego,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1255540"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TX,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Dallas,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"1213825"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"CA,"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"San Jose,"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"912332"})]})]})})})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"execute-the-following-command-from-a-command-terminal-to-create-and-populate-the-table",children:"Execute the following command from a command terminal to create and populate the table"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./psql.py"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"your_zookeeper_quoru"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"m"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" us_population.sql"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" us_population.csv"})]})})})})]}),e.jsxs(n,{children:[e.jsx(i.h3,{id:"start-the-interactive-sql-client",children:"Start the interactive sql client"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"./sqlline.py"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"your_zookeeper_quoru"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"m"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),e.jsx(i.p,{children:"and issue a query"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SELECT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" state"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "State"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"count"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(city) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "City Count"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"sum"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"population"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Population Sum"'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" us_population"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"GROUP BY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" state"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ORDER BY"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" sum"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"population"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DESC"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})})]})]}),`
`,e.jsx(i.p,{children:"Congratulations! You've just created your first Phoenix table, inserted data into it, and executed an aggregate query with just a few lines of code in 15 minutes or less!"}),`
`,e.jsx(i.h3,{id:"big-deal---10-rows-what-else-you-got",children:"Big deal - 10 rows! What else you got?"}),`
`,e.jsxs(i.p,{children:["Ok, ok - tough crowd. Check out our ",e.jsx(i.code,{children:"bin/performance.py"})," script to create as many rows as you want, for any schema you come up with, and run timed queries against it."]}),`
`,e.jsx(i.h3,{id:"why-is-it-called-phoenix-anyway-did-some-other-project-crash-and-burn-and-this-is-the-next-generation",children:"Why is it called Phoenix anyway? Did some other project crash and burn and this is the next generation?"}),`
`,e.jsx(i.p,{children:"I'm sorry, but we're out of time and space, so we'll have to answer that next time!"})]})}function p(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(a,{...t})}):a(t)}function o(t,i){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{h as _markdown,p as default,d as extractedReferences,r as frontmatter,c as structuredData,u as toc};
