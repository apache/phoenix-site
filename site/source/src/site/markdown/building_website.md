# Prerequisites

The Website build script has severely bit-rotted see [PHOENIX-6867](https://issues.apache.org/jira/browse/PHOENIX-6867)

 - The maven site.xml must have proxy set for the `http://conjars.org` org repo
 - The mvn command must be configured to use Java 1.8. Newer versions won't work.

# Building Phoenix Project Web Site

1. Make a local copy of source markdown files and html web pages

```
 $ git clone git@github.com:apache/phoenix-site.git
```

2. Edit/Add source markdown files in `site/source/src/site/markdown` directory.
2. Edit `phoenix-docs/src/docsrc/help/phoenix.csv` to update Reference pages, adding any missing new words to `phoenix-docs/src/tools/org/h2/build/doc/dictionary.txt`.
3. Run `build.sh` located at root to generate/update html web pages in `output` directory
4. `git commit` source markdown files and html web pages then `git commit` and `git push`
5. Create a pull request in GitHub for the [mirror of the Phoenix Site Git repository](https://github.com/apache/phoenix-site). Similarly to the GitHub workflow mentioned in the [contributing](contributing.html) page.

# Local Testing During Development

The site uses protocol-relative URLs for included assets to support `http` as well as `https`.  This can cause assets to fail to load when working locally if not using a web server.  The root cause is that locally opened files use the `file:` protocol, but some assets live on remote servers thus requiring the `http:` or `https:` protocol.

For best results when testing locally, spin up a simple Python web server after generating the site.

```
cd output
python -m SimpleHTTPServer 8000
```

NOTE: If working with  python3, use below command to spin up a simple Python web server

```
python3 -m http.server 8000
```

Now you can access the website at [http://localhost:8000](http://localhost:8000) and your changes are available with a page refresh.

