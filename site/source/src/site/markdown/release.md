# How to do a release
Following instructions walks you through releasing Phoenix-4.15.0-HBase-1.3. These steps needs to be repeated for all HBase branches.

## Pre-Reqs
1. Make sure you have setup your user for release signing. Details http://www.apache.org/dev/release-signing.html.
2. Clone the branch locally from which you want to do a release.
3. Set version to release and commit. 

    <pre>
    mvn versions:set -DnewVersion=4.15.0-HBase-1.3 -DgenerateBackupPoms=false
    </pre>
## Build binary and source tars 
   
    <pre>
    $ cd dev; ./make_rc.sh
    </pre>
Follow the instructions. Signed binary and source tars will be generated in the _release_ directory. As last part of this script, it will ask if you want to tag the branch at this time (sample tag: `v4.15.0-HBase-1.3-rc0`). If all looks good then svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix 

## Voting
1. Svn commit binary and source tars to https://dist.apache.org/repos/dist/dev/phoenix
2. Initiate the vote email. See example [here](https://www.mail-archive.com/dev@phoenix.apache.org/msg41202.html)
3. In case the RC (Release Candidate) is rejected via the vote, you will have to repeat the above process and re-initiate the vote for the next RC (RC0, RC1, etc.).

## Release
1. Once voting is successful (say for RC1), copy artifacts to https://dist.apache.org/repos/dist/release/phoenix: 

    <pre>
    svn mv https://dist.apache.org/repos/dist/dev/phoenix/apache-phoenix-4.15.0-HBase-1.3-rc1      
           https://dist.apache.org/repos/dist/release/phoenix/apache-phoenix-4.15.0-HBase-1.3
    </pre>

2. Set release tag and commit: 

    <pre>
    git tag -a v4.15.0-HBase-1.3 v4.15.0-HBase-1.3-rc1 -m "Phoenix v4.15.0-HBase-1.3 release"
    </pre>
3. Remove any obsolete releases on https://dist.apache.org/repos/dist/release/phoenix given the current release.

4. Ensure your ~/.m2/settings.xml is setup correctly: 

    ```
	    <server>
	      <id>apache.releases.https</id>
	      <username> <!-- YOUR APACHE USERNAME --> </username>
	      <password> <!-- YOUR APACHE PASSWORD --> </password>
	    </server>
    ```

5. Note that the head of the branch may have progressed with patches between the time your vote was sent out and your vote passed, so you want to make sure that you revert the code base to the tag of the RC that passed. Release to maven (remove release directory from local repo if present): 

    <pre>
    mvn clean deploy gpg:sign -DperformRelease=true -Dgpg.passphrase=[your_pass_phrase_here]
    -Dgpg.keyname=[your_key_here] -DskipTests -P release -pl phoenix-core,phoenix-tracing-webapp,phoenix-pherf,phoenix-client,phoenix-server -am
    </pre>

    **Note** [phoenix-queryserver](https://github.com/apache/phoenix-queryserver) and [phoenix-connectors](https://github.com/apache/phoenix-connectors) have been moved to their own repo and their releases are carried out separately.

    **Note** You may need to skip JavaDoc generation by passing in the following flag: `-Dmaven.javadoc.skip=true `

6. Go to https://repository.apache.org/#stagingRepositories and <code>close</code> -> <code>release</code> the staged artifacts (takes a while so you may need to `refresh` multiple times).
7. Create new branch based on current release if needed, for ex: 4.15 branches in this case.
8. Set version to the upcoming SNAPSHOT and commit: 

    <pre>
    mvn versions:set -DnewVersion=4.16.0-HBase-1.3-SNAPSHOT -DgenerateBackupPoms=false
    </pre>
9. Create a JIRA to update PHOENIX_MAJOR_VERSION, PHOENIX_MINOR_VERSION and PHOENIX_PATCH_NUMBER in MetaDataProtocol.java appropriately to next version (4, 16, 0 respectively in this case) and compatible_client_versions.json file with the client versions that are compatible against the next version ( In this case 4.14.3 and 4.15.0 would be the backward compatible clients for 4.16.0 ). This Jira should be committed/marked with fixVersion of the next release candidate.
10. Add documentation of released version to the [downloads page](http://phoenix.apache.org/download.html) and [wiki](https://en.wikipedia.org/wiki/Apache_Phoenix).
11. Send out an announcement email. See example [here](https://www.mail-archive.com/dev@phoenix.apache.org/msg54764.html).
12. Bulk close Jiras that were marked for the release fixVersion.  

**Congratulations!**
