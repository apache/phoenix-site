# ARRAY Type

The Apache Phoenix 3.0/4.0 release introduces support for the [JDBC ARRAY type](http://docs.oracle.com/javase/tutorial/jdbc/basics/array.html). Any primitive type may be used in an ARRAY. Here is an example of declaring an array type when creating a table:

    CREATE TABLE regions (
        region_name VARCHAR PRIMARY KEY,
        zips VARCHAR ARRAY[10],
        CONSTRAINT pk PRIMARY KEY (region_name));

or alternately:

    CREATE TABLE regions (
        region_name VARCHAR PRIMARY KEY,
        zips VARCHAR[],
        CONSTRAINT pk PRIMARY KEY (region_name));

Insertion into the array may be done entirely through a SQL statement:

    UPSERT INTO regions(region_name,zips)
    VALUES('SF Bay Area',ARRAY['94115','94030','94125']);

or programmatically through JDBC:

    PreparedStatement stmt = conn.prepareStatement("UPSERT INTO regions VALUES(?,?)");
    stmt.setString(1,"SF Bay Area");
    String[] zips =  new String[] {"94115","94030","94125"};
    Array array = conn.createArrayOf("VARCHAR", zips);
    stmt.setArray(2, array);
    stmt.execute();

The entire array may be selected:

    SELECT zips FROM regions WHERE region_name = 'SF Bay Area';

or an individual element in the array may be accessed via a subscript notation. The subscript is one-based, so the following would select the first element:

    SELECT zip[1] FROM regions WHERE region_name = 'SF Bay Area';

Use of the array subscript notation is supported in other expressions as well, for example in a WHERE clause:

    SELECT region_name FROM regions WHERE zip[1] = '94030' OR zip[2] = '94030' OR zip[3] = '94030';

The length of the array grows dynamically as needed with the current length and is accessible through the ARRAY_LENGTH build it function:

    SELECT ARRAY_LENGTH(zips) FROM regions;

Attempts to access an array element beyond the current length will evaluate to <code>null</code>.

For searching in an array, built-in functions like ANY and ALL are provided.  For example,

    SELECT region_name FROM regions WHERE '94030' = ANY(zip);
    SELECT region_name FROM regions WHERE '94030' = ALL(zip);

The built-in function ANY checks if any of the element in the array satisfies the condition and it is equivalent to OR condition:

    SELECT region_name FROM regions WHERE zip[1] = '94030' OR zip[2] = '94030' OR zip[3] = '94030';

The built-in function ALL checks if all the elements in the array satisfies the condition and it is equivalent to AND condition:

    SELECT region_name FROM regions WHERE zip[1] = '94030' AND zip[2] = '94030' AND zip[3] = '94030';



###Limitations
* Only one dimensional arrays are currently supported
* For an array of fixed width types, null elements occurring in the middle of an array are not tracked.
* The declaration of an array length at DDL time is not enforced currently, but maybe in the future. Note that it is persisted with the table metadata.
* An array may only be used as the last column in a primary key constraint.
* Partial update of an array is currently not possible. Instead, the array may be manipulated on the client-side and then upserted back in its entirety.
