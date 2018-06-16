var apacheUrl = "http://www.apache.org/dist/phoenix/"
var dynUrl = "http://www.apache.org/dyn/closer.lua/phoenix/"

function parcelFolderHtml(version) {
    return '<li><a href="' + apacheUrl + 'apache-phoenix-' + version + '/parcels/">parcels</a></li>';
}

function addRelease(version, date, commit) {
    var tr = document.createElement('tr');
    var parcelsHtml = version.includes('-cdh') ? parcelFolderHtml(version) : ''
    tr.innerHTML =
        '<td>' + version + '</td>' +
        '<td>' + date + '</td>' +
        '<td><a href="https://git-wip-us.apache.org/repos/asf?p=phoenix.git;a=commit;h=' + commit + '">' + commit + '</a></td>' +
        '<td><ul><li>' +
          '<a href="' + dynUrl + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz">bin</a> ( ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz.sha256">sha256</a> ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz.sha512">sha512</a> ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/bin/apache-phoenix-' + version + '-bin.tar.gz.asc">asc</a> ' +
        ')</li><li>' +
          '<a href="' + dynUrl + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz">src</a> ( ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz.sha256">sha256</a> ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz.sha512">sha512</a> ' +
          '<a href="' + apacheUrl + 'apache-phoenix-' + version + '/src/apache-phoenix-' + version + '-src.tar.gz.asc">asc</a> ' +
        ')</li>' +  parcelsHtml +
        '</ul></td>';
    document.getElementById('releases').appendChild(tr);
}



