# How to do a release

## Pre-Reqs
1. Make sure you have setup your user for release signing. Details http://www.apache.org/dev/release-signing.html.
2. Clone the branch locally from which you want to do a release.
3. Verify CHANGES file is updated
4. Verify all pom.xml files in project have the correct release version (i.e. does not contain SNAPSHOT)

## Command for building binary and source tars 

```
$ cd dev; ./make_rc.sh
```

Follow the instructions. Signed binary and source tars will be generated in _release_ directory. As last part of this script, it will ask if you want to tag branch at this time. If all looks good then svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix 

## Final step

1. Initiate vote email. See example [here](http://mail-archives.apache.org/mod_mbox/phoenix-dev/201408.mbox/%3cCAAF1JdgVOLLVVuymR6hzo9PxGeKOa_fz2ZAZX4C6R4TCSaiZcg@mail.gmail.com%3e)
2. Svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix
