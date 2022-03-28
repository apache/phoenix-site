# Phoenix Downloads

The below table lists mirrored release artifacts and their associated hashes and signatures available ONLY at apache.org.
The keys used to sign releases can be found in our published [KEYS](https://www.apache.org/dist/phoenix/KEYS) file.
See our installation instructions [here](installation.html), our release notes [here](release_notes.html),
and a list of fixes and new features [here](https://issues.apache.org/jira/secure/ReleaseNote.jspa?version=12334393&projectId=12315120).
Follow [Verify the Integrity of the Files](https://www.apache.org/dyn/closer.cgi#verify) for how to verify your mirrored downloads.

Current release 4.16.1 can run on Apache HBase 1.3, 1.4, 1.5 and 1.6.  
Current release 5.1.2 can run on Apache HBase 2.1, 2.2, 2.3 and 2.4

Please follow the appropriate link depending on your HBase version. 
 

<table id="core-releases">
<tr>
    <th width='180'>Phoenix Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

<table id="phoenix-thirdparty-releases">
<tr>
    <th width='180'>Phoenix Thirdparty Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

<table id="phoenix-omid-releases">
<tr>
    <th width='180'>Phoenix Omid Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

<table id="phoenix-tephra-releases">
<tr>
    <th width='180'>Phoenix Tephra Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

<table id="phoenix-queryserver-releases">
<tr>
    <th width='180'>Phoenix Query Server Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

<table id="python-phoenixdb-releases">
<tr>
    <th width='180'>Python Driver Version</th>
    <th width='100'>Release Date</th>
    <th>Download</th>
</tr>
</table>

If you are looking for an old release that is not present here or on the mirror, check the [Apache Archive](http://archive.apache.org/dist/phoenix/). 

<script src="/js/download.js"></script> 
<script>
//<![CDATA[
addRelease2('5.1.2', '07/jun/2021', '2.1', '2.2', '2.3', '2.4', '2.4.0');
addRelease2('4.16.1', '21/may/2021', '1.3', '1.4', '1.5', '1.6');
addPhoenixdbRelease('1.1.0','27/aug/2021');
addPhoenixThirdpartyRelease('1.1.0','01/feb/2021');
addPhoenixOmidRelease('1.0.2','23/nov/2020');
addPhoenixTephraRelease('0.16.1','13/may/2021');
addPhoenixQueryServerRelease('6.0.0','03/aug/2021');

//]]>
</script>
