#Backward Compatibility
Phoenix maintains backward compatibility across at least two minor releases to allow for **no downtime** through server-side rolling
restarts upon upgrading. See below for details.

##Versioning Convention
Phoenix uses a standard three number versioning schema of the form:

    <major version> . <minor version> . <patch version>

For example, **<code>4.2.1</code>** has a major version of **<code>4</code>**,
a minor version of **<code>2</code>**, and a patch version of **<code>1</code>**.

##Patch Release
Upgrading to a new patch release (i.e. only the patch version has changed) is the simplest case. The jar upgrade may occur in any order: client first or server first, and a mix of clients with different patch release versions is fine.

##Minor Release
When upgrading to a new minor release (i.e. the major version is the same, but the minor
version has changed), sometimes modifications to the system tables are necessary to either
fix a bug or provide a new feature. This upgrade will occur automatically the first time a
newly upgraded client connects to the newly upgraded server. It is **required** that the
server-side jar be upgraded first across your entire cluster, before any clients are
upgraded. An older client (two minor versions back) will work with a newer server jar when
the minor version is different, but not visa versa. In other words, clients do not need to
be upgraded in lock step with the server. However, as the server version moves forward,
the client version should move forward as well. This allows Phoenix to evolve its client/server
protocol while still providing clients sufficient time to upgrade their clients.

As of the 4.3 release, a mix of clients on different minor release versions is supported as well
(note that prior releases required all clients to be upgraded at the same time). Another improvement
as of the 4.3 release is that an upgrade may be done directly from one minor version to another
higher minor version (prior releases required an upgrade to each minor version in between).

##Major Release
Upgrading to a new major release may require downtime as well as potentially the running of a migration
script. Additionally, all clients and servers may need to be upgraded at the same time. This will be
determined on a release by release basis.


##Release Notes
Specific details on issues and their fixes that may impact you may be found [here](release_notes.html).
