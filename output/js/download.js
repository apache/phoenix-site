var apacheUrlHttp = "http://www.apache.org/dist/phoenix/"
var apacheUrlHttps = "https://www.apache.org/dist/phoenix/"
var dynUrl = "http://www.apache.org/dyn/closer.lua/phoenix/"

function parcelFolderHtml(version) {
    return '<li><a href="' + apacheUrlHttp + 'apache-phoenix-' + version + '/parcels/">parcels</a></li>';
}

function addRelease(version, date) {
    var tr = document.createElement('tr');
    var parcelsHtml = version.includes('-cdh') ? parcelFolderHtml(version) : ''
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz">bin</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz.asc">asc</a> ]' +
        '</li><li>' +
          '<a href="' + dynUrl + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +  parcelsHtml +
        '</ul></td>';
    document.getElementById('core-releases').appendChild(tr);
}

function addRelease2(version, date) {
    var tr = document.createElement('tr');
    var parcelsHtml = version.includes('-cdh') ? parcelFolderHtml(version) : ''
    var phoenixBinariesHtml = '';
    for (var i=2; i < arguments.length; i++) {
        phoenixBinariesHtml += phoenixBinaryHtml(version, arguments[i]);
    }
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'phoenix-' + version + '/phoenix-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-' + version + '/phoenix-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-' + version + '/phoenix-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' + phoenixBinariesHtml + 
        '</ul></td>' + 
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-' + version + '/RELEASENOTES.md">Release Notes</a>' + 
        '</li></ul></td>' +
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-' + version + '/CHANGES.md">Changes</a>' + 
        '</li></ul></td>';
    document.getElementById('core-releases').appendChild(tr);
}

function phoenixBinaryHtml(version, hbaseVersion) {
  return '<li>' +
          '<a href="' + dynUrl + 'phoenix-' + version + '/phoenix-hbase-'+hbaseVersion + '-' + version + '-bin.tar.gz">hbase-'+hbaseVersion+'-bin</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-' + version + '/phoenix-hbase-'+hbaseVersion + '-' + version + '-bin.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-' + version + '/phoenix-hbase-'+hbaseVersion + '-' + version + '-bin.tar.gz.asc">asc</a> ]' +
        '</li>';
}


function addPhoenixdbRelease(version, date) {
    var tr = document.createElement('tr');
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'python-phoenixdb-' + version + '/src/python-phoenixdb-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'python-phoenixdb-' + version + '/src/python-phoenixdb-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'python-phoenixdb-' + version + '/src/python-phoenixdb-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +
        '</ul></td>';
    document.getElementById('python-phoenixdb-releases').appendChild(tr);
}

function addPhoenixThirdpartyRelease(version, date) {
    var tr = document.createElement('tr');
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'phoenix-thirdparty-' + version + '/phoenix-thirdparty-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-thirdparty-' + version + '/phoenix-thirdparty-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-thirdparty-' + version + '/phoenix-thirdparty-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +
        '</ul></td>' + 
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-thirdparty-' + version + '/RELEASENOTES.md">Release Notes</a>' + 
        '</li></ul></td>' +
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-thirdparty-' + version + '/CHANGES.md">Changes</a>' + 
        '</li></ul></td>';
    document.getElementById('phoenix-thirdparty-releases').appendChild(tr);
}

function addPhoenixOmidRelease(version, date) {
    var tr = document.createElement('tr');
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'phoenix-omid-' + version + '/phoenix-omid-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-omid-' + version + '/phoenix-omid-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-omid-' + version + '/phoenix-omid-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +
        '</ul></td>' + 
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-omid-' + version + '/RELEASENOTES.md">Release Notes</a>' + 
        '</li></ul></td>' +
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-omid-' + version + '/CHANGES.md">Changes</a>' + 
        '</li></ul></td>';
    document.getElementById('phoenix-omid-releases').appendChild(tr);
}

function addPhoenixTephraRelease(version, date) {
    var tr = document.createElement('tr');
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'phoenix-tephra-' + version + '/phoenix-tephra-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-tephra-' + version + '/phoenix-tephra-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-tephra-' + version + '/phoenix-tephra-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +
        '</ul></td>' + 
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-tephra-' + version + '/RELEASENOTES.md">Release Notes</a>' + 
        '</li></ul></td>' +
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-tephra-' + version + '/CHANGES.md">Changes</a>' + 
        '</li></ul></td>';
    document.getElementById('phoenix-tephra-releases').appendChild(tr);
}

function addPhoenixQueryServerRelease(version, date) {
    var tr = document.createElement('tr');
    var parcelsHtml = version.includes('-cdh') ? parcelFolderHtml(version) : ''
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-bin.tar.gz">bin</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-bin.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-bin.tar.gz.asc">asc</a> ]' +
        '</li><li>' +
          '<a href="' + dynUrl + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-src.tar.gz">src</a> ' +
          '&nbsp;&nbsp;' +
          '[ <a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-src.tar.gz.sha512">sha512</a>' +
          ' | <a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/phoenix-queryserver-' + version + '-src.tar.gz.asc">asc</a> ]' +
        '</li>' +  parcelsHtml +
        '</ul></td>' + 
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/RELEASENOTES.md">Release Notes</a>' + 
        '</li></ul></td>' +
        '<td><ul><li>' + 
           '<a href="' + apacheUrlHttps + 'phoenix-queryserver-' + version + '/CHANGES.md">Changes</a>' + 
        '</li></ul></td>';
    document.getElementById('phoenix-queryserver-releases').appendChild(tr);
}
