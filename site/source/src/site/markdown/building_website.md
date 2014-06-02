# Building Phoenix Project Web Site

1. Make a local copy of source markdown files and html web pages

```
 $ svn checkout https://svn.apache.org/repos/asf/phoenix
```

2. Edit/Add source markdown files in `/src/site/markdown` directory
3. Run `build.sh` located at root to generate/update html web pages in `site/publish` directory
4. `svn commit` source markdown files and html web pages

