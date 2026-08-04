# Security Model

This page describes the security model of Apache Phoenix.

Phoenix is a JDBC driver, SQL parser, and query planner layered on top of the Apache HBase client in the client JVM, together with a set of Coprocessor extensions installed inside Apache HBase RegionServers.

This page is intended to help operators deploy Phoenix safely, to help security researchers understand what constitutes a legitimate vulnerability, and to help the [Apache Security Team](https://www.apache.org/security/) efficiently triage incoming reports.

This page was created following the [ASF recommendation for documenting project security models](https://cwiki.apache.org/confluence/display/SECURITY/Documenting+your+security+model).

Phoenix inherits and layers on Apache HBase's [security model](https://hbase.apache.org/security-model/). Readers of this document should also be familiar with that document.

## Reporting Security Vulnerabilities

To report an undisclosed, sensitive security vulnerability in Apache Phoenix, please send your report privately via email to the Apache Software Foundation's security team at [security@apache.org](mailto:security@apache.org). Please do not use JIRA or any public channel for security reports.

Phoenix follows the [Apache Software Foundation's vulnerability handling policy](https://www.apache.org/security/).

## Assumption: Operator-Secured Production Deployments

Phoenix requires operators to configure authentication and authorization on the underlying HBase cluster for production deployments. This is the foundational assumption of the Phoenix security model. 

Phoenix ships with developer friendly defaults that match HBase's development friendly defaults, and it adds Phoenix-only opt in toggles that are also off by default, notably `phoenix.acls.enabled=false`, `phoenix.functions.allowUserDefinedFunctions=false`, the server-side mutation toggles `phoenix.client.enable.server.upsert.select` and companions, `phoenix.log.level=OFF`, `phoenix.audit.log.level=OFF`, and the optional `phoenix-tracing-webapp`. These defaults are intended solely to aid development, testing, and set up of CI/CD environments. They do not imply under any circumstances that deploying or running Phoenix without security is safe or desirable for production use.

No realistic production deployment runs Phoenix over an unsecured HBase cluster. The HBase documentation provides [comprehensive guidance on configuring HBase security](https://hbase.apache.org/book.html#security), including Kerberos authentication, SASL, Access Control Lists (ACLs), and visibility labels. Those controls also govern access to Phoenix tables and metadata.

Vulnerability reports that assume or require an insecure configuration as part of an attack chain are not valid security reports. Such reports describe the expected behavior of an intentionally unsecured configuration, not a security flaw.

## Trust Boundaries

### Network Perimeter

Phoenix's JDBC driver is layered on top of the standard HBase client. HBase services, and by extension Phoenix's server-side extensions, should not be directly exposed to the public internet. Operators are responsible for ensuring appropriate network level controls (firewalls, security groups, network segmentation) are in place.

### Cluster-Internal Trust

Phoenix's coprocessors run embedded inside HBase RegionServers and share the RegionServer trust boundaries. Compromising a RegionServer that hosts Phoenix coprocessors is effectively equivalent to compromising the entire cluster, the same as compromising any RegionServer in a plain HBase deployment. These are all components of a single distributed system that must cooperate to function.

Cross-process authentication is enforced by HBase's enabled authentication mechanisms, ensuring only legitimate cluster members can participate.

Note that "runs inside the RegionServer" relates to the scope of trust but does not imply the effective identity used to authorize any particular action. See [Server-Side Query Execution and Mutations](#server-side-query-execution-and-mutations) for how Phoenix distinguishes a user's identity from the service principal's identity.

### HDFS as Trusted Storage

Phoenix stores its metadata and all user tables as HBase tables, which are persisted to HDFS (or a compatible distributed filesystem, or S3 or an S3-compatible cloud object store). Phoenix assumes that the underlying storage layer access controls are correctly configured and that the storage layer is part of the same trust domain. An attacker with direct write access to the underlying storage layer can corrupt or manipulate Phoenix table data and metadata, regardless of any Phoenix- or HBase-level access controls.

### Client Trust Boundary

When authentication and authorization are configured, authentication is enforced by HBase, transitively via the JDBC driver's HBase connection. Any impersonation of end users must be arranged by the application before opening the JDBC connection. Authorization is enforced primarily by HBase ACLs. It is optionally augmented at the Phoenix DDL layer by `PhoenixAccessController` when `phoenix.acls.enabled=true` (see [Phoenix Access Control](#phoenix-access-control)). Unauthenticated clients are rejected at the HBase RPC layer.

When authentication is not configured, which is only recommended for development or test environments, any client that can reach HBase over the network can perform any operation. This is expected and intentional for that configuration.

## The Phoenix JDBC Driver

Phoenix is delivered primarily as a JDBC driver, a thick client library that is loaded into the application's JVM. The driver parses SQL, plans and compiles queries, and issues HBase Get/Scan/Mutate RPCs and coprocessor invocations when executing query plans. It has no Phoenix specific network protocol or server-side executors of its own.

The driver has no independent credential store. All Kerberos handling is delegated to the embedded ZooKeeper, Hadoop, and HBase client libraries. The Kerberos identity for a JDBC connection may be sourced from any of the following:

- The JDBC URL suffix `...:principal:keytab`, in the connection URI, depending on the connection form. The URL carries the _filesystem path_ to the keytab, not the key material.
- The legacy Phoenix configuration keys `hbase.myclient.principal` and `hbase.myclient.keytab`. These are marked deprecated but are still honored as fallbacks for compatibility.
- The caller's existing authentication context; for example, a prior `kinit` ticket cache or a `loginUserFromKeytab` performed by the application before it opens the JDBC connection.

On successful login, the driver logs the principal and the keytab file _path_ at `INFO` level. Reports of these appearing in log lines describe expected behavior. A filesystem path to a keytab is not itself a credential.

## The Phoenix SQL Parser and Query Planner

Phoenix's SQL parser and query planner run in the driver JVM, against untrusted user supplied SQL. The result is a compiled plan that the driver executes as a stream of HBase RPCs plus rich `Scan` attributes carrying serialized expressions, aggregators, projectors, hash-join plans, `UPSERT SELECT` server-side executions, `DELETE` aggregates, and top-N specifications.

### No privilege elevation for user actions

The compiled `Scan` attributes are evaluated by Phoenix RegionObservers on behalf of the calling RPC user. The RegionObserver JVM runs as the HBase service principal — that is the trust envelope — but the effective identity for authorization decisions on any data the query reads or writes is the RPC caller's user, as established by HBase's SASL layer (`RpcServer.getRequestUser()` / `User.getCurrent()`). HBase's authorization on the underlying Scan, Get, and Mutate RPCs applies exactly as it does for any other HBase client. A caller who cannot read a table via plain HBase cannot read it via a Phoenix scan-attribute payload either.

### SQL injection is an application-layer concern

Applications that build SQL by string concatenation of untrusted input are responsible for their own escaping and validation. The Phoenix JDBC driver supports parameterized `PreparedStatement`, which is the well-known JDBC approach for securing statements that must include user-supplied values. Phoenix does not sanitize user-concatenated SQL, and reports of SQL injection through application-level string concatenation are not Phoenix vulnerabilities.

## Gateway Services

HBase's REST and Thrift gateways operate as documented on the [HBase security model page](https://hbase.apache.org/security-model/).

The Phoenix Query Server (PQS), a gateway based on Apache Calcite Avatica, is maintained in the separate [apache/phoenix-queryserver](https://github.com/apache/phoenix-queryserver) project. Its security model is documented there and is out of scope for Apache Phoenix as such.

The `phoenix-tracing-webapp` is an optional Jetty-based UI and API intended for use within the trusted boundary only. It ships with no built-in authentication. Operators are responsible for placing it behind network level controls or a fronting reverse proxy that handles authentication.

## Coprocessors

See the [HBase security model on coprocessors](https://hbase.apache.org/security-model/#coprocessors) for the underlying security model.

Phoenix's coprocessors are installed on HBase tables at DDL time (during `CREATE TABLE` / `ALTER TABLE`) by mutating the `TableDescriptor`. Installing or altering a Phoenix table therefore requires the same HBase Admin permissions as required for loading and installing any coprocessor. When HBase level authorization is configured, only users with permission to modify table descriptors can affect Phoenix coprocessor loading. This is an HBase level protection mechanism.

RPC-initiated code paths (JDBC query execution, orchestrating HBase-level client Scans, Gets, Mutates, or Endpoint calls) execute with the effective identity of the authorized user under the calling user's HBase-authenticated identity. Phoenix will not silently elevate permissions. Background tasks running on the server side, such as housekeeping chores, read-repair, and index debuilding, act with the permissions of the HBase service principal.

## Phoenix System Metadata Tables

Phoenix stores its schema and operational state in `SYSTEM.*` tables. The set includes:

- `SYSTEM.CATALOG` — table, column, index, view, function, and link metadata
- `SYSTEM.CHILD_LINK` — parent-to-child view topology
- `SYSTEM.STATS` — table statistics and guideposts for the query planner
- `SYSTEM.SEQUENCE` — sequence counters
- `SYSTEM.FUNCTION` — UDF metadata (class name and jar path); see [User-Defined Functions](#user-defined-functions-udfs)
- `SYSTEM.LOG` — query and audit log rows (when enabled); see [Query Log and Audit Log](#query-log-and-audit-log-systemlog)
- `SYSTEM.MUTEX` — short-lived DDL coordination locks
- `SYSTEM.TASK` — asynchronous administrative tasks (rebuild, drop views, and so on)
- `SYSTEM.TRANSFORM` — online schema transformation state
- `SYSTEM.CDC_STREAM`, `SYSTEM.CDC_STREAM_STATUS`, `SYSTEM.IDX_CDC_TRACKER` — Change Data Capture metadata

Access to these tables ultimately depends on HBase ACLs on the individual `SYSTEM` tables or namespace. Operational convention is to grant end users `RX` (read and execute) on most `SYSTEM` tables, with `RWX` (read, write, execute) on `SYSTEM.SEQUENCE` and `SYSTEM.MUTEX`.

After the `PhoenixAccessController` (see next section) has performed its own permission check on a DDL request, `MetaDataEndpointImpl` commits the resulting `SYSTEM.CATALOG` and `SYSTEM.CHILD_LINK` changes with the permissions of the HBase service principal.

## Phoenix Access Control

Phoenix provides an optional access control enforcement mechanism, `PhoenixAccessController`, that bridges Phoenix DDL to the HBase access control checks. It is loaded when `phoenix.acls.enabled=true` (default `false`).

When enabled, and paired with the HBase `AccessController` , `GRANT` and `REVOKE` SQL statements are translated to `AccessControlClient` calls against HBase; and `CREATE`, `ALTER`, and `DROP` of `TABLE`, `VIEW`, `INDEX`, and `SCHEMA` are gated on HBase permissions (`READ`, `EXEC`, `CREATE`, `ADMIN`) on the appropriate resources.

`SHOW GRANTS` and equivalent inspection surfaces reflect HBase's state.

Phoenix does not maintain an independent privilege store. 

## Multi-Tenancy and Views

Phoenix's `TenantId` is a JDBC connection property that the query compiler translates into a leading row key prefix on multi-tenant tables. Views inject `WHERE` clauses and synthetic primary key values at compile time. 

This is logical isolation, performed by the client. A caller with HBase `READ` privileges on the physical table can read across tenants regardless of the JDBC `TenantId` on their connection. Real cross-tenant isolation in production requires enabling HBase ACLs on the physical tables, typically combined with Phoenix's schema-to-namespace mapping (see the [Namespace Mapping](/docs/features/namespace-mapping) documentation). Cross-tenant reads without those mechanisms enabled are not security vulnerabilities.

## Server-Side Query Execution and Mutations

This section states the general principle for what "runs on the server" actually means for authorization in Phoenix. It is written to make the model unambiguous.

Client-initiated server-side execution runs under the calling user's authenticated privileges. The authorization context established by HBase during RPC handling remains in effect for for all Phoenix server-side activity. HBase authorization to the underlying data applies exactly as it does for a plain HBase client. Phoenix does not require any elevated privilege for user actions. A caller who cannot read a table via plain HBase cannot use Phoenix to read it either.

Optional server-side `UPSERT SELECT` and `DELETE` acceleration (enabled with `phoenix.client.enable.server.upsert.select`, `phoenix.client.enable.server.upsert.mutations`, and `phoenix.client.enable.server.delete.mutations`) can cause commits to be issued through a server-side connection under the service principal rather than the RPC caller. Because this pattern deviates from the general model above, these optimizations are disabled by default and must be explicitly enabled by the operator.

## User-Defined Functions (UDFs)

Phoenix supports user defined scalar functions. The feature is off by default, enabled with `phoenix.functions.allowUserDefinedFunctions=true`.

When enabled, user defined functions, delivered as Java code packaged in JARs, may be loaded via HBase's `DynamicClassLoader` from `hbase.dynamic.jars.dir` _only_. Other jar paths are rejected. Function definitions are persisted in `SYSTEM.FUNCTION`.

Anyone who can both write to `hbase.dynamic.jars.dir` on the underlying storage layer and register a `FUNCTION` in `SYSTEM.FUNCTION` enables code execution on every RegionServer that evaluates SQL expressions which invoke the registered functions. Operators enabling UDFs should appropriately restrict HDFS/S3 write access to the jar directory and Phoenix privileges to execute DDL, using the appropriate mechanisms.

## Query Log and Audit Log (SYSTEM.LOG)

Phoenix can persist client side query and audit information into the `SYSTEM.LOG` table. This feature is off by default: `phoenix.log.level=OFF` and `phoenix.audit.log.level=OFF`.

When enabled, at `INFO` or higher, Phoenix will persist the SQL statement text (which may contain literals with sensitive data), together with client IP, user, tenant, and query identifiers. At `TRACE` level, Phoenix additionally persists bind parameter values and detailed scan metrics.

Operators who enable audit or query logging must restrict read access to `SYSTEM.LOG` with appropriate ACLs. Persisting SQL text and bind values in a shared table is an operator choice, not a Phoenix default. Sensitive data appearing in `SYSTEM.LOG` under user controlled logging levels is not, in itself, a Phoenix vulnerability.

## MapReduce, Bulk Load, and Command Line Tools

Phoenix ships a number of MapReduce and command line tools: `IndexTool`, `IndexScrutinyTool`, `IndexUpgradeTool`, `TransformTool`, `CsvBulkLoadTool`, `JsonBulkLoadTool`, `RegexBulkLoadTool`, `PhoenixSyncTableTool`, `SchemaTool`, `OrphanViewTool`, `UpdateStatisticsTool`, and so on.

Command line tools run with the privileges of the invoking OS user's Kerberos identity. MapReduce jobs use standard Hadoop delegation tokens. Phoenix does not employ its own tokens or authorization protocol. The `phoenix.mapreduce.tenantid` property scopes a job's view of a multi-tenant table.

Bulk load tools additionally require HDFS write access to the staging output directory and the HBase capability to run `LoadIncrementalHFiles` on the target table.

## Web UIs

Phoenix contributes no administrative web UI on HBase's Master or RegionServers.

The HBase server web UIs are governed by HBase's [security model for web UIs](https://hbase.apache.org/security-model/#web-uis) unchanged.

The Phoenix tracing webapp was discussed above in the [Gateway Services](#gateway-services) section.

## What Is Considered a Vulnerability

The following categories of issues are considered valid security vulnerabilities and should be reported to [security@apache.org](mailto:security@apache.org).

- **Authentication bypass** — Circumventing configured HBase authentication through the Phoenix JDBC driver, or through a Phoenix coprocessor RPC, to reach HBase resources without valid credentials.
- **Authorization bypass or privilege escalation** — Bypass of `PhoenixAccessController` checks when `phoenix.acls.enabled=true`, or any Phoenix code path that lets an authenticated user perform HBase operations beyond their granted ACL permissions, including gaining administrative or superuser capabilities.
- **Data corruption or loss** — Unauthorized modification or deletion of user data or `SYSTEM.*` metadata through a Phoenix code path when HBase ACLs and `phoenix.acls.enabled` are properly configured.
- **Cross-user or cross tenant data access** — Reading another user's or tenant's data through a Phoenix code path when HBase ACLs are correctly restrictive.
- **Remote code execution** — Achieving arbitrary code execution through a Phoenix code path that does not require prior write access to `hbase.dynamic.jars.dir` and does not require Admin-level HBase privileges.
- **Privilege escalation via server side execution** — A Phoenix code path where a client initiated operation lets the caller perform an HBase read or write that the caller's own HBase ACLs would not permit.
- **Credential exposure in logs** — Phoenix client logs, `SYSTEM.LOG`, or `SYSTEM.TRACING_STATS` recording Kerberos secrets, SASL tokens, or other secret material. User supplied SQL literals or bind values that happen to be revealed in operator enabled logging are the application's responsibility, not a Phoenix vulnerability.
- **Second order SQL injection via Phoenix-owned metadata** — a Phoenix code path that concatenates strings retrieved from a Phoenix metadata table into a SQL statement without validation. Phoenix's usual approach is to store these as parsed expression trees, so a finding in this category would describe a code path that has drifted from that pattern.

## What Is NOT Considered a Vulnerability

The following categories of reports do not constitute security vulnerabilities in Apache Phoenix. Where a category is also documented in HBase's security model, Phoenix inherits and reaffirms it.

- **Behavior in unsecured configurations** — Any issue that requires HBase authentication or authorization, or Phoenix's `phoenix.acls.enabled`, to be unconfigured as a prerequisite. The default configuration is for development only, and running it in production is an operator error, not a vulnerability.
- **Unauthenticated access to unconfigured gateways** — HBase's REST and Thrift gateways operating without authentication when authentication has not been configured, or the availability of the `phoenix-tracing-webapp` when the operator has not disabled it or restricted network access to it.
- **Administrative actions by authorized administrators** — HBase superusers and global administrators can, by design, perform any operation in the cluster. This includes loading Phoenix coprocessors via DDL, modifying any table, and accessing all data.
- **Access requiring operator-level cluster configuration changes** — Issues that require modifying `hbase-site.xml`, ZooKeeper ACLs, HDFS permissions, or the Phoenix client classpath. These require host level access, which is outside Phoenix's security boundary.
- **Information disclosure via administrative interfaces on trusted networks** — Version information, configuration details, schema information reflected by `SYSTEM.CATALOG`, and metrics visible in the web UIs when accessed from within the trusted network perimeter.
- **Version discovery** — Version information is not considered secret within Phoenix's (or HBase's) security model.
- **Username enumeration** — Phoenix relies on HBase's external authentication systems (Kerberos, LDAP) for identity management. Username enumeration risks or limitations are an authentication layer concern.
- **Exposure of services on untrusted networks** — Placing HBase (and therefore Phoenix's RegionServer-hosted coprocessors) directly on the public internet without firewalls or VPNs is an operator misconfiguration and not a Phoenix vulnerability.
- **Direct writes to `SYSTEM.*` by users granted `W` on those tables** — This describes an HBase ACL misconfiguration, not a Phoenix vulnerability. Phoenix relies on the correct application of HBase ACLs to protect its metadata tables.
- **Cross-tenant reads when the caller has HBase `READ` on the shared multi-tenant physical table** — Phoenix's `TenantId` is logical isolation performed at query compile time, not a real security boundary. True cross-tenant isolation requires HBase ACLs on the physical tables.
- **Loading of Phoenix coprocessors via `CREATE TABLE` or table descriptor edits by an HBase Admin** — Coprocessor loading via table schema is a supported HBase feature. Access to that operation must be restricted by HBase ACLs.
- **UDF-mediated code execution by users who can write to `hbase.dynamic.jars.dir` and register a `FUNCTION`** — Both prerequisites are controlled by the operator, who will accept the related risks and requirement to implement necessary controls.
- **Server-side `UPSERT SELECT` / `DELETE` aggregates writing under the service principal** — When the operator has explicitly enabled the `phoenix.client.enable.server.*` toggles, the operator will accept the related risks and requirement to implement necessary controls..
- **Presence of a Kerberos principal or keytab file _path_ in a JDBC URL or a log line** — These are not credentials themselves. Phoenix's driver logs the principal and keytab path at `INFO` on Kerberos login by design.
- **SQL injection resulting from application code that concatenates user input into SQL** — Phoenix supports parameterized `PreparedStatement`. Applications that build SQL by string concatenation are responsible for their own escaping and sanitization.
- **Behavior of the Phoenix Query Server (PQS)** — Its security model is documented at [apache/phoenix-queryserver](https://github.com/apache/phoenix-queryserver) and is out of scope for this page.
- **Denial of service through expensive user queries when operator-configured limits are absent or set high** — Phoenix provides resource controls such as `phoenix.query.timeoutMs`, `phoenix.query.maxServerCacheBytes`, `phoenix.query.maxGlobalMemoryPercentage`, and `phoenix.query.maxTenantMemoryPercentage`. Operators are responsible for setting these for their workload.
- **Blind or timing-based SQL inference by a caller who already holds `SELECT` on the target data** — response-time variation is inherent to SQL engines and does not, on its own, constitute an authorization bypass.
- **Structural information (schema names, column names) reflected in SQL error messages returned to the caller for the caller's own statement** — this is standard SQL-engine behavior. Applications that require opaque or sanitized error reports must wrap Phoenix exceptions.

## Security Hardening

The Phoenix project welcomes reports about potential security hardening improvements, even when the behavior described does not fall inside the formal vulnerability criteria above. Such reports are valuable and will be considered for implementation as security improvements. Patches are always welcome! Please use [JIRA](https://issues.apache.org/jira/browse/PHOENIX) for hardening suggestions, not the private security list, as these are by definition not vulnerability disclosures.

Examples of welcome hardening suggestions include:

- Improvements to documentation that make Phoenix's security expectations and configuration options clearer.
- Improvements to default configurations that reduce the risk of operator misconfiguration.
- Safer defaults for the opt-in toggles, such as `phoenix.acls.enabled` and the server-side mutation toggles.
- Expanded `PhoenixAccessController` coverage — for example, function DDL, or additional metadata endpoints.
- Better redaction of bind parameter values and SQL literals in `SYSTEM.LOG` and client logs.
- Startup or log warnings when Phoenix is deployed against an unsecured HBase, or with insecure combinations of toggles enabled.
- Better input validation that, while not exploitable in a secured deployment, improves robustness.
- Additional security controls that would enhance security when enabled.

## Transport Encryption

Phoenix has no distinct wire protocol. All Phoenix RPC traffic rides on HBase RPC. If HBase RPC SASL quality of protection is configured for confidentiality (`hbase.rpc.protection=privacy` / `auth-conf`), Phoenix inherits that confidentiality on the connections it opens.

Transport level encryption is supported and documented by HBase but is an operational choice tied to the deployment environment. Within a physically secured private datacenter, operators may reasonably choose not to encrypt intra-cluster traffic. In cloud environments or across network boundaries, transport encryption should be configured. See HBase's [TLS/RPC encryption documentation](https://hbase.apache.org/book.html#hbase.encryption.server) for details.

The decision to use or not use transport encryption is an operational choice that depends on the deployment environment. It does not change the authentication and authorization requirements described above.

## Encryption at Rest

Phoenix does not provide column level or transparent data encryption. Encryption at rest is provided by the underlying layers. HBase HFile encryption, if configured, protects Phoenix data files on the underlying filesystem. The underlying storage layer (HDFS at-rest encryption, or cloud object storage server-side encryption) protects the block level bytes.

Applications that require per-column cryptographic protection must implement that scheme in the application layer before `UPSERT`. Reports about the absence of a native Phoenix column encryption feature are hardening suggestions, not vulnerabilities.

## Further Reading

- [Apache HBase Security Model](https://hbase.apache.org/security-model/) — the canonical upstream security model this page layers on top of.
- [Apache HBase Reference Guide: Securing HBase](https://hbase.apache.org/book.html#security) — comprehensive HBase security configuration guide.
- [Phoenix Namespace Mapping](/docs/features/namespace-mapping) — schema-to-namespace mapping and the permissions it requires.
- [Phoenix Grammar (`GRANT` and `REVOKE`)](/docs/grammar) — Phoenix SQL access-control statements and their mapping to HBase ACLs.
- [Phoenix User-Defined Functions](/docs/features/user-defined-functions) — enabling and locking down UDFs.
- [Phoenix Query Server (PQS)](/docs/features/query-server) — with the definitive security model maintained by the [apache/phoenix-queryserver](https://github.com/apache/phoenix-queryserver) project.
- [Apache Software Foundation Security Policy](https://www.apache.org/security/) — the ASF-wide security policy and vulnerability handling process.
