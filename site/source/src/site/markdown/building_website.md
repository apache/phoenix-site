# Building Phoenix Project Web Site

1. Make a local copy of source markdown files and html web pages

```
 $ svn checkout https://svn.apache.org/repos/asf/phoenix
```

2. Edit/Add source markdown files in `/src/site/markdown` directory.
2. Edit `phoenix-docs/src/docsrc/help/phoenix.csv` to update Reference pages, adding any missing new words to `phoenix-docs/src/tools/org/h2/build/doc/dictionary.txt`.
3. Run `build.sh` located at root to generate/update html web pages in `site/publish` directory
4. `svn commit` source markdown files and html web pages

# Local Testing During Development

The site uses protocol-relative URLs for included assets to support `http` as well as `https`.  This can cause assets to fail to load when working locally if not using a web server.  The root cause is that locally opened files use the `file:` protocol, but some assets live on remote servers thus requiring the `http:` or `https:` protocol.

For best results when testing locally, spin up a simple Python web server after generating the site.

```
cd site/publish
python -m SimpleHTTPServer 8000
```

Now you can access the website at `http://localhost:8000/` and your changes are available with a page refresh.
