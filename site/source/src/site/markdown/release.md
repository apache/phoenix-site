# How to do a release
Following instructions walks you through releasing Phoenix-4.11.0-HBase-0.98. These steps needs to be repeated for all HBase branches.

## Pre-Reqs
1. Make sure you have setup your user for release signing. Details http://www.apache.org/dev/release-signing.html.
2. Clone the branch locally from which you want to do a release.
3. Set version to release and commit. 

    <pre>
    mvn versions:set -DnewVersion=4.11.0-HBase-0.98 -DgenerateBackupPoms=false
    </pre>
## Build binary and source tars 
   
    <pre>
    $ cd dev; ./make_rc.sh
    </pre>
Follow the instructions. Signed binary and source tars will be generated in _release_ directory. As last part of this script, it will ask if you want to tag branch at this time. If all looks good then svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix 

## Voting
1. Svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix
2. Initiate vote email. See example [here](https://www.mail-archive.com/dev@phoenix.apache.org/msg41202.html)

## Release
1. Once voting is successful, copy artifacts to https://dist.apache.org/repos/dist/release/phoenix: 

    <pre>
    svn mv https://dist.apache.org/repos/dist/dev/phoenix/apache-phoenix-4.11.0-HBase-0.98-rc1      
           https://dist.apache.org/repos/dist/release/phoenix/apache-phoenix-4.11.0-HBase-0.98
    </pre>

2. Set release tag and commit: 

    <pre>
    git tag -a v4.11.0-HBase-0.98 v4.11.0-HBase-0.98-rc0 -m "Phoenix v4.11.0-HBase-0.98 release
    </pre>
3. Remove any obsolete releases on https://dist.apache.org/repos/dist/release/phoenix given the current release.

4. Release to maven (remove release directory from local repro if present): 

    <pre>
    mvn clean deploy gpg:sign -DperformRelease=true -Dgpg.passphrase=[your_pass_phrase_here]
    -Dgpg.keyname=[your_key_here] -DskipTests -P release -pl phoenix-core,phoenix-pig,phoenix-tracing-webapp,
    phoenix-queryserver,phoenix-spark,phoenix-flume,phoenix-pherf,phoenix-queryserver-client,phoenix-hive,phoenix-client,phoenix-server -am
    </pre>
5. Go to https://repository.apache.org/#stagingRepositories and <code>close</code> -> <code>release</code> the staged artifacts.
6. Set version back to upcoming SNAPSHOT and commit: 

    <pre>
    mvn versions:set -DnewVersion=4.12.0-HBase-0.98-SNAPSHOT -DgenerateBackupPoms=false
    </pre>
7. Create new branch based on current release if needed.
