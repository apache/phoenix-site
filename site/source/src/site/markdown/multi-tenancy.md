# Multi tenancy

### Highlights
* Multi-tenancy in Phoenix works via a combination of multi-tenant tables and tenant-specific connections (detailed below).
* Tenants open tenant-specific connections to Phoenix. These connections can only access data that belongs to the tenant.
* Tenants only see their own data in multi-tenant tables and can see all data in regular tables.
* In order to add their own columns, tenants create tenant-specific views on top of multi-tenant tables and add their own columns to the views.

### Multi-tenant tables
Multi-tenant tables in Phoenix are regular tables that are declared using the MULTI_TENANT=true DDL property. They work in conjuntion with tenant-specific connections (detailed below) to ensure that tenats only see their data in such tables. The first primary key column of multi-tenant tables identifies the tenant. For example:

    CREATE TABLE base.event (tenant_id VARCHAR, event_type CHAR(1), created_date DATE, event_id BIGINT)
    MULTI_TENANT=true;

The column that identifies the tenant may be given any name, but must of type VARCHAR or CHAR. Regular Phoenix connections work with such tables with no constraints, including working with data across tenant boundaries.

### Tenant-specific Connections
Tenants are identified by the presence or absence of the TenantId property at JDBC connection-time. A connection with a non-null TenantId is considered a tenant-specific connection. A connection with an unspecified or null TenantId is a regular connection.  A tenant-specific connection may only query:

* **all data in non-multi-tenant (global) tables**, that is tables created with a regular connection without the MULTI_TENANT=true declaration.
* **their own data in multi-tenant tables**.
* **their own schema**, which is to say it only sees tenant-specific views that were created by that tenant (detailed below).

For example, a tenant-specific connection is established like this:

    Properties props = new Properties();
    props.setProperty("TenantId", "Acme");
    Connection conn = DriverManager.getConnection("localhost", props);

### Tenant-specific Views (optional)
Tenant-specific views may only be created using tenant-specific connections. They are created the same way as views, however the base table must be a multi-tenant table or another view that eventually points to one. Tenant-specific views are typically used when new columns and/or filter criteria, specific to that tenant, are required. Otherwise the base table may be used directly through a tenant-specific connection as described above.

For example, a tenant-specific view may be defined as follows:

    CREATE VIEW acme.login_event(acme_user_id CHAR(15)) AS
    SELECT * FROM base.event
    WHERE event_type='L';

The tenant_id column is neither visible nor accessible to a tenant-specific view. Any reference to it will cause a ColumnNotFoundException. Just like any other Phoenix view, whether or not this view is updatable is based on the rules explained [here](views.html#Updatable_Views). In addition, indexes may be added to tenant-specific views just like to regular tables and views (with [these](http://phoenix.apache.org/views.html#Limitations) limitations).

### Tenant Data Isolation
Any DML or query that is performed on multi-tenant tables using a tenant-specific connections is automatically constrained to only operate on the tenant’s data. For the upsert operation, this means that Phoenix automatically populates the tenantId column with the tenant’s id specified at connection-time. For querying and delete, a where clause is transparently added to constrain the operations to only see data belonging to the current tenant.
