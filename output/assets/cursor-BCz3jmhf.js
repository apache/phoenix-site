import{j as s}from"./jsx-runtime-fm7E3NsZ.js";let h=`To work on a subset of rows from a query, Phoenix supports a \`CURSOR\` control structure. The sequence below shows how to use a cursor.

## Using a cursor

1. Define a cursor for a query using the \`DECLARE\` statement.

   \`\`\`java
   PreparedStatement statement = conn.prepareStatement(
       "DECLARE empCursor CURSOR FOR SELECT * FROM EMP_TABLE"
   );
   statement.execute();
   \`\`\`

2. Open the cursor.

   \`\`\`java
   statement = conn.prepareStatement("OPEN empCursor");
   statement.execute();
   \`\`\`

3. Fetch a subset of rows to work with.

   \`\`\`java
   statement = conn.prepareStatement("FETCH NEXT 10 ROWS FROM empCursor");
   ResultSet rset = statement.executeQuery();
   \`\`\`

4. Iterate through the fetched rows and process them as required.

   \`\`\`java
   while (rset.next()) {
       // ...
   }
   \`\`\`

5. Fetch additional sets of rows as needed, and close the cursor when done.

   \`\`\`java
   statement = conn.prepareStatement("CLOSE empCursor");
   statement.execute();
   \`\`\`
`,r={title:"Cursor",description:"Use CURSOR statements in Phoenix to process query results in controlled row batches."},a=[],l={contents:[{heading:void 0,content:"To work on a subset of rows from a query, Phoenix supports a CURSOR control structure. The sequence below shows how to use a cursor."},{heading:"using-a-cursor",content:"Define a cursor for a query using the DECLARE statement."},{heading:"using-a-cursor",content:"Open the cursor."},{heading:"using-a-cursor",content:"Fetch a subset of rows to work with."},{heading:"using-a-cursor",content:"Iterate through the fetched rows and process them as required."},{heading:"using-a-cursor",content:"Fetch additional sets of rows as needed, and close the cursor when done."}],headings:[{id:"using-a-cursor",content:"Using a cursor"}]};const c=[{depth:2,url:"#using-a-cursor",title:s.jsx(s.Fragment,{children:"Using a cursor"})}];function n(i){const e={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",...i.components};return s.jsxs(s.Fragment,{children:[s.jsxs(e.p,{children:["To work on a subset of rows from a query, Phoenix supports a ",s.jsx(e.code,{children:"CURSOR"})," control structure. The sequence below shows how to use a cursor."]}),`
`,s.jsx(e.h2,{id:"using-a-cursor",children:"Using a cursor"}),`
`,s.jsxs(e.ol,{children:[`
`,s.jsxs(e.li,{children:[`
`,s.jsxs(e.p,{children:["Define a cursor for a query using the ",s.jsx(e.code,{children:"DECLARE"})," statement."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"PreparedStatement statement "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "DECLARE empCursor CURSOR FOR SELECT * FROM EMP_TABLE"'})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"execute"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Open the cursor."}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"OPEN empCursor"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"execute"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Fetch a subset of rows to work with."}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"FETCH NEXT 10 ROWS FROM empCursor"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ResultSet rset "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" statement."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"executeQuery"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Iterate through the fetched rows and process them as required."}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"while"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (rset."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"next"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(e.li,{children:[`
`,s.jsx(e.p,{children:"Fetch additional sets of rows as needed, and close the cursor when done."}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"prepareStatement"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"CLOSE empCursor"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"statement."}),s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"execute"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]})]})})}),`
`]}),`
`]})]})}function d(i={}){const{wrapper:e}=i.components||{};return e?s.jsx(e,{...i,children:s.jsx(n,{...i})}):n(i)}export{h as _markdown,d as default,a as extractedReferences,r as frontmatter,l as structuredData,c as toc};
