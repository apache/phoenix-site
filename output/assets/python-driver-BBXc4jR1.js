import{j as i}from"./chunk-EPOLDU6W-B5LwAila.js";let r=`The Python driver for Apache Phoenix implements the [Python DB 2.0 API](https://www.python.org/dev/peps/pep-0249/) to access Phoenix via Phoenix Query Server.
The driver is tested with Python 2.7 and 3.5-3.8. This code was originally called [python-phoenixdb](https://code.oxygene.sk/lukas/python-phoenixdb)
and was graciously donated by its authors to the Apache Phoenix project.

All future development of the project is being done in Apache Phoenix.

## Installation

### From PyPI

The latest release is always available from PyPI, and can be installed by
\`pip\`/\`pip3\` as usual.

\`\`\`shell
pip3 install --user phoenixdb
\`\`\`

### From source

You can build \`phoenixdb\` from the official source release,
or use the latest development version from the source
[repository](/source-repository). The \`python-phoenixdb\` source
lives in the \`python-phoenixdb\` directory of the \`phoenix-queryserver\`
repository.

\`\`\`shell
$ cd python-phoenixdb # (Only when building from the git repo)
$ pip install -r requirements.txt
$ python setup.py install
\`\`\`

## Examples

\`\`\`python
import phoenixdb
import phoenixdb.cursor

database_url = 'http://localhost:8765/'
conn = phoenixdb.connect(database_url, autocommit=True)

cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR)")
cursor.execute("UPSERT INTO users VALUES (?, ?)", (1, 'admin'))
cursor.execute("SELECT * FROM users")
print(cursor.fetchall())

cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
cursor.execute("SELECT * FROM users WHERE id=1")
print(cursor.fetchone()['USERNAME'])
\`\`\`

## Limitations

* None presently known.

## Resources

* [PHOENIX-4636](https://issues.apache.org/jira/browse/PHOENIX-4636): Initial landing of the driver into Apache Phoenix.
* [PHOENIX-4688](https://issues.apache.org/jira/browse/PHOENIX-4688): Implementation of Kerberos authentication via SPNEGO.
`,t={title:"Python Driver",description:"Use the Phoenix DB-API Python driver with Phoenix Query Server."},l=[{href:"https://www.python.org/dev/peps/pep-0249/"},{href:"https://code.oxygene.sk/lukas/python-phoenixdb"},{href:"/source-repository"},{href:"https://issues.apache.org/jira/browse/PHOENIX-4636"},{href:"https://issues.apache.org/jira/browse/PHOENIX-4688"}],a={contents:[{heading:void 0,content:`The Python driver for Apache Phoenix implements the Python DB 2.0 API to access Phoenix via Phoenix Query Server.
The driver is tested with Python 2.7 and 3.5-3.8. This code was originally called python-phoenixdb
and was graciously donated by its authors to the Apache Phoenix project.`},{heading:void 0,content:"All future development of the project is being done in Apache Phoenix."},{heading:"from-pypi",content:`The latest release is always available from PyPI, and can be installed by
pip/pip3 as usual.`},{heading:"from-source",content:`You can build phoenixdb from the official source release,
or use the latest development version from the source
repository. The python-phoenixdb source
lives in the python-phoenixdb directory of the phoenix-queryserver
repository.`},{heading:"python-driver-limitations",content:"None presently known."},{heading:"python-driver-resources",content:"PHOENIX-4636: Initial landing of the driver into Apache Phoenix."},{heading:"python-driver-resources",content:"PHOENIX-4688: Implementation of Kerberos authentication via SPNEGO."}],headings:[{id:"python-driver-installation",content:"Installation"},{id:"from-pypi",content:"From PyPI"},{id:"from-source",content:"From source"},{id:"python-driver-examples",content:"Examples"},{id:"python-driver-limitations",content:"Limitations"},{id:"python-driver-resources",content:"Resources"}]};const o=[{depth:2,url:"#python-driver-installation",title:i.jsx(i.Fragment,{children:"Installation"})},{depth:3,url:"#from-pypi",title:i.jsx(i.Fragment,{children:"From PyPI"})},{depth:3,url:"#from-source",title:i.jsx(i.Fragment,{children:"From source"})},{depth:2,url:"#python-driver-examples",title:i.jsx(i.Fragment,{children:"Examples"})},{depth:2,url:"#python-driver-limitations",title:i.jsx(i.Fragment,{children:"Limitations"})},{depth:2,url:"#python-driver-resources",title:i.jsx(i.Fragment,{children:"Resources"})}];function n(s){const e={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsxs(e.p,{children:["The Python driver for Apache Phoenix implements the ",i.jsx(e.a,{href:"https://www.python.org/dev/peps/pep-0249/",children:"Python DB 2.0 API"}),` to access Phoenix via Phoenix Query Server.
The driver is tested with Python 2.7 and 3.5-3.8. This code was originally called `,i.jsx(e.a,{href:"https://code.oxygene.sk/lukas/python-phoenixdb",children:"python-phoenixdb"}),`
and was graciously donated by its authors to the Apache Phoenix project.`]}),`
`,i.jsx(e.p,{children:"All future development of the project is being done in Apache Phoenix."}),`
`,i.jsx(e.h2,{id:"python-driver-installation",children:"Installation"}),`
`,i.jsx(e.h3,{id:"from-pypi",children:"From PyPI"}),`
`,i.jsxs(e.p,{children:[`The latest release is always available from PyPI, and can be installed by
`,i.jsx(e.code,{children:"pip"}),"/",i.jsx(e.code,{children:"pip3"})," as usual."]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"pip3"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --user"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" phoenixdb"})]})})})}),`
`,i.jsx(e.h3,{id:"from-source",children:"From source"}),`
`,i.jsxs(e.p,{children:["You can build ",i.jsx(e.code,{children:"phoenixdb"}),` from the official source release,
or use the latest development version from the source
`,i.jsx(e.a,{href:"/source-repository",children:"repository"}),". The ",i.jsx(e.code,{children:"python-phoenixdb"}),` source
lives in the `,i.jsx(e.code,{children:"python-phoenixdb"})," directory of the ",i.jsx(e.code,{children:"phoenix-queryserver"}),`
repository.`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cd"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" python-phoenixdb"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:" # (Only when building from the git repo)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" pip"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -r"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" requirements.txt"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" python"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" setup.py"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]})]})})}),`
`,i.jsx(e.h2,{id:"python-driver-examples",children:"Examples"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" phoenixdb"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" phoenixdb.cursor"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"database_url "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'http://localhost:8765/'"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"conn "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" phoenixdb.connect(database_url, "}),i.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"autocommit"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"True"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn.cursor()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor.execute("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR)"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor.execute("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"UPSERT INTO users VALUES (?, ?)"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", ("}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'admin'"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"))"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor.execute("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"SELECT * FROM users"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"print"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cursor.fetchall())"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" conn.cursor("}),i.jsx(e.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"cursor_factory"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"phoenixdb.cursor.DictCursor)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"cursor.execute("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"SELECT * FROM users WHERE id=1"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"print"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cursor.fetchone()["}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'USERNAME'"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"])"})]})]})})}),`
`,i.jsx(e.h2,{id:"python-driver-limitations",children:"Limitations"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"None presently known."}),`
`]}),`
`,i.jsx(e.h2,{id:"python-driver-resources",children:"Resources"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4636",children:"PHOENIX-4636"}),": Initial landing of the driver into Apache Phoenix."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"https://issues.apache.org/jira/browse/PHOENIX-4688",children:"PHOENIX-4688"}),": Implementation of Kerberos authentication via SPNEGO."]}),`
`]})]})}function d(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(n,{...s})}):n(s)}export{r as _markdown,d as default,l as extractedReferences,t as frontmatter,a as structuredData,o as toc};
