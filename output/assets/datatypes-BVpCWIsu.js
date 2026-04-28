import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let l=`export const datatypesTopicIndex = {
  "select": "select",
  "upsert values": "upsert-values",
  "upsert select": "upsert-select",
  "delete": "delete",
  "declare cursor": "declare-cursor",
  "open cursor": "open-cursor",
  "fetch next": "fetch-next",
  "close": "close",
  "create table": "create-table",
  "drop table": "drop-table",
  "create function": "create-function",
  "drop function": "drop-function",
  "create view": "create-view",
  "drop view": "drop-view",
  "create sequence": "create-sequence",
  "drop sequence": "drop-sequence",
  "alter": "alter",
  "create index": "create-index",
  "drop index": "drop-index",
  "alter index": "alter-index",
  "explain": "explain",
  "constraint": "constraint",
  "update statistics": "update-statistics",
  "create schema": "create-schema",
  "use": "use",
  "drop schema": "drop-schema",
  "grant": "grant",
  "revoke": "revoke",
  "options": "options",
  "hint": "hint",
  "scan hint": "scan-hint",
  "cache hint": "cache-hint",
  "index hint": "index-hint",
  "small hint": "small-hint",
  "seek to column hint": "seek-to-column-hint",
  "join hint": "join-hint",
  "serial hint": "serial-hint",
  "column def": "column-def",
  "table ref": "table-ref",
  "sequence ref": "sequence-ref",
  "column ref": "column-ref",
  "select expression": "select-expression",
  "select statement": "select-statement",
  "split point": "split-point",
  "table spec": "table-spec",
  "aliased table ref": "aliased-table-ref",
  "join type": "join-type",
  "join": "join-type",
  "func argument": "func-argument",
  "class name": "class-name",
  "jar path": "jar-path",
  "order": "order",
  "expression": "expression",
  "and condition": "and-condition",
  "boolean condition": "boolean-condition",
  "condition": "condition",
  "rhs operand": "rhs-operand",
  "operand": "operand",
  "summand": "summand",
  "factor": "factor",
  "term": "term",
  "array constructor": "array-constructor",
  "sequence": "sequence",
  "cast": "cast",
  "row value constructor": "row-value-constructor",
  "bind parameter": "bind-parameter",
  "value": "value",
  "case": "case",
  "case when": "case-when",
  "name": "name",
  "quoted name": "quoted-name",
  "alias": "alias",
  "null": "null",
  "data type": "data-type",
  "data": "data-type",
  "sql data type": "sql-data-type",
  "sql data": "sql-data-type",
  "hbase data type": "hbase-data-type",
  "hbase data": "hbase-data-type",
  "string": "string",
  "boolean": "boolean-type",
  "numeric": "numeric",
  "int": "int",
  "long": "long",
  "decimal": "decimal-type",
  "number": "number",
  "comments": "comments",
  "integer type": "integer-type",
  "integer": "integer-type",
  "unsigned_int type": "unsigned-int-type",
  "unsigned_int": "unsigned-int-type",
  "bigint type": "bigint-type",
  "bigint": "bigint-type",
  "unsigned_long type": "unsigned-long-type",
  "unsigned_long": "unsigned-long-type",
  "tinyint type": "tinyint-type",
  "tinyint": "tinyint-type",
  "unsigned_tinyint type": "unsigned-tinyint-type",
  "unsigned_tinyint": "unsigned-tinyint-type",
  "smallint type": "smallint-type",
  "smallint": "smallint-type",
  "unsigned_smallint type": "unsigned-smallint-type",
  "unsigned_smallint": "unsigned-smallint-type",
  "float type": "float-type",
  "float": "float-type",
  "unsigned_float type": "unsigned-float-type",
  "unsigned_float": "unsigned-float-type",
  "double type": "double-type",
  "double": "double-type",
  "unsigned_double type": "unsigned-double-type",
  "unsigned_double": "unsigned-double-type",
  "decimal type": "decimal-type",
  "boolean type": "boolean-type",
  "time type": "time-type",
  "time": "time-type",
  "date type": "date-type",
  "date": "date-type",
  "timestamp type": "timestamp-type",
  "timestamp": "timestamp-type",
  "unsigned_time type": "unsigned-time-type",
  "unsigned_time": "unsigned-time-type",
  "unsigned_date type": "unsigned-date-type",
  "unsigned_date": "unsigned-date-type",
  "unsigned_timestamp type": "unsigned-timestamp-type",
  "unsigned_timestamp": "unsigned-timestamp-type",
  "varchar type": "varchar-type",
  "varchar": "varchar-type",
  "char type": "char-type",
  "char": "char-type",
  "binary type": "binary-type",
  "binary": "binary-type",
  "varbinary type": "varbinary-type",
  "varbinary": "varbinary-type",
  "varbinary_encoded type": "varbinary-encoded-type",
  "varbinary_encoded": "varbinary-encoded-type",
  "array": "array",
  "bson type": "bson-type",
  "bson": "bson-type",
  "avg": "avg",
  "count": "count",
  "approx_count_distinct": "approx-count-distinct",
  "max": "max",
  "min": "min",
  "sum": "sum",
  "percentile_cont": "percentile-cont",
  "percentile_disc": "percentile-disc",
  "percent_rank": "percent-rank",
  "first_value": "first-value",
  "last_value": "last-value",
  "first_values": "first-values",
  "last_values": "last-values",
  "nth_value": "nth-value",
  "stddev_pop": "stddev-pop",
  "stddev_samp": "stddev-samp",
  "round": "round",
  "ceil": "ceil",
  "floor": "floor",
  "trunc": "trunc",
  "substr": "substr",
  "instr": "instr",
  "trim": "trim",
  "ltrim": "ltrim",
  "rtrim": "rtrim",
  "lpad": "lpad",
  "array_elem": "array-elem",
  "array_length": "array-length",
  "array_append": "array-append",
  "array_prepend": "array-prepend",
  "array_cat": "array-cat",
  "array_fill": "array-fill",
  "array_to_string": "array-to-string",
  "any": "any",
  "all": "all",
  "length": "length",
  "regexp_substr": "regexp-substr",
  "regexp_replace": "regexp-replace",
  "regexp_split": "regexp-split",
  "md5": "md5",
  "invert": "invert",
  "encode": "encode",
  "decode": "decode",
  "to_number": "to-number",
  "rand": "rand",
  "upper": "upper",
  "lower": "lower",
  "reverse": "reverse",
  "to_char": "to-char",
  "to_date": "to-date",
  "current_date": "current-date",
  "to_time": "to-time",
  "to_timestamp": "to-timestamp",
  "current_time": "current-time",
  "convert_tz": "convert-tz",
  "timezone_offset": "timezone-offset",
  "now": "now",
  "year": "year",
  "month": "month",
  "week": "week",
  "dayofyear": "dayofyear",
  "dayofmonth": "dayofmonth",
  "dayofweek": "dayofweek",
  "hour": "hour",
  "minute": "minute",
  "second": "second",
  "coalesce": "coalesce",
  "sign": "sign",
  "abs": "abs",
  "sqrt": "sqrt",
  "cbrt": "cbrt",
  "exp": "exp",
  "power": "power",
  "ln": "ln",
  "log": "log",
  "get_bit": "get-bit",
  "get_byte": "get-byte",
  "octet_length": "octet-length",
  "set_bit": "set-bit",
  "set_byte": "set-byte",
  "collation_key": "collation-key"
}

## Data Types

### INTEGER Type

<RailroadDiagram syntax={\`INTEGER\`} anchors={datatypesTopicIndex} />

Possible values: -2147483648 to 2147483647.

Mapped to \`java.lang.Integer\`. The binary representation is a 4 byte integer with the sign bit flipped (so that negative values sorts before positive values).

**Example**

\`\`\`sql
INTEGER
\`\`\`

### UNSIGNED\\_INT Type

<RailroadDiagram syntax={\`UNSIGNED_INT\`} anchors={datatypesTopicIndex} />

Possible values: 0 to 2147483647. Mapped to \`java.lang.Integer\`. The binary representation is a 4 byte integer, matching the \`Bytes.toBytes(int)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_INT
\`\`\`

### BIGINT Type

<RailroadDiagram syntax={\`BIGINT\`} anchors={datatypesTopicIndex} />

Possible values: -9223372036854775808 to 9223372036854775807. Mapped to \`java.lang.Long\`. The binary representation is an 8 byte long with the sign bit flipped (so that negative values sorts before positive values).

**Example**

\`\`\`sql
BIGINT
\`\`\`

### UNSIGNED\\_LONG Type

<RailroadDiagram syntax={\`UNSIGNED_LONG\`} anchors={datatypesTopicIndex} />

Possible values: 0 to 9223372036854775807. Mapped to \`java.lang.Long\`. The binary representation is an 8 byte integer, matching the \`Bytes.toBytes(long)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_LONG
\`\`\`

### TINYINT Type

<RailroadDiagram syntax={\`TINYINT\`} anchors={datatypesTopicIndex} />

Possible values: -128 to 127. Mapped to \`java.lang.Byte\`. The binary representation is a single byte, with the sign bit flipped (so that negative values sorts before positive values).

**Example**

\`\`\`sql
TINYINT
\`\`\`

### UNSIGNED\\_TINYINT Type

<RailroadDiagram syntax={\`UNSIGNED_TINYINT\`} anchors={datatypesTopicIndex} />

Possible values: 0 to 127. Mapped to \`java.lang.Byte\`. The binary representation is a single byte, matching the \`Bytes.toBytes(byte)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_TINYINT
\`\`\`

### SMALLINT Type

<RailroadDiagram syntax={\`SMALLINT\`} anchors={datatypesTopicIndex} />

Possible values: -32768 to 32767. Mapped to \`java.lang.Short\`. The binary representation is a 2 byte short with the sign bit flipped (so that negative values sort before positive values).

**Example**

\`\`\`sql
SMALLINT
\`\`\`

### UNSIGNED\\_SMALLINT Type

<RailroadDiagram syntax={\`UNSIGNED_SMALLINT\`} anchors={datatypesTopicIndex} />

Possible values: 0 to 32767. Mapped to \`java.lang.Short\`. The binary representation is an 2 byte integer, matching the \`Bytes.toBytes(short)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_SMALLINT
\`\`\`

### FLOAT Type

<RailroadDiagram syntax={\`FLOAT\`} anchors={datatypesTopicIndex} />

Possible values: -3.402823466 E + 38 to 3.402823466 E + 38. Mapped to \`java.lang.Float\`. The binary representation is an 4 byte float with the sign bit flipped (so that negative values sort before positive values).

**Example**

\`\`\`sql
FLOAT
\`\`\`

### UNSIGNED\\_FLOAT Type

<RailroadDiagram syntax={\`UNSIGNED_FLOAT\`} anchors={datatypesTopicIndex} />

Possible values: 0 to 3.402823466 E + 38. Mapped to \`java.lang.Float\`. The binary representation is an 4 byte float matching the \`Bytes.toBytes(float)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_FLOAT
\`\`\`

### DOUBLE Type

<RailroadDiagram syntax={\`DOUBLE\`} anchors={datatypesTopicIndex} />

Possible values: -1.7976931348623158 E + 308 to 1.7976931348623158 E + 308. Mapped to \`java.lang.Double\`. The binary representation is an 8 byte double with the sign bit flipped (so that negative values sort before positive value).

**Example**

\`\`\`sql
DOUBLE
\`\`\`

### UNSIGNED\\_DOUBLE Type

<RailroadDiagram syntax={\`UNSIGNED_DOUBLE\`} anchors={datatypesTopicIndex} />

Possible values: 0 to  1.7976931348623158 E + 308. Mapped to \`java.lang.Double\`. The binary representation is an 8 byte double matching the \`Bytes.toBytes(double)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_DOUBLE
\`\`\`

### DECIMAL Type

<RailroadDiagram syntax={\`DECIMAL [ (precisionInt, scaleInt) ]\`} anchors={datatypesTopicIndex} />

Data type with fixed precision and scale. A user can specify precision and scale by expression \`DECIMAL(precision,scale)\` in a DDL statement, for example, DECIMAL(10,2). The maximum precision is 38 digits. Mapped to \`java.math.BigDecimal\`. The binary representation is binary comparable, variable length format. When used in a row key, it is terminated with a null byte unless it is the last column.

**Example**

\`\`\`sql
DECIMAL
DECIMAL(10,2)
\`\`\`

### BOOLEAN Type

<RailroadDiagram syntax={\`BOOLEAN\`} anchors={datatypesTopicIndex} />

Possible values: \`TRUE\` and \`FALSE\`.

Mapped to \`java.lang.Boolean\`. The binary representation is a single byte with \`0\` for false and \`1\` for true

**Example**

\`\`\`sql
BOOLEAN
\`\`\`

### TIME Type

<RailroadDiagram syntax={\`TIME\`} anchors={datatypesTopicIndex} />

The time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained. Mapped to \`java.sql.Time\`. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a TIME column than what is provided by "java.sql.Time". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Time" will format times based on the client's local time zone. Please note that this TIME type is different than the TIME type as defined by the SQL 92 standard in that it includes year, month, and day components. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.

**Example**

\`\`\`sql
TIME
\`\`\`

### DATE Type

<RailroadDiagram syntax={\`DATE\`} anchors={datatypesTopicIndex} />

The date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to \`java.sql.Date\`. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a DATE column than what is provided by "java.sql.Date". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Date" will format dates based on the client's local time zone. Please note that this DATE type is different than the DATE type as defined by the SQL 92 standard in that it includes a time component. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.

**Example**

\`\`\`sql
DATE
\`\`\`

### TIMESTAMP Type

<RailroadDiagram syntax={\`TIMESTAMP\`} anchors={datatypesTopicIndex} />

The timestamp data type. The format is yyyy-MM-dd hh:mm:ss\\[.nnnnnnnnn]. Mapped to \`java.sql.Timestamp\` with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos. Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Timestamp" will format timestamps based on the client's local time zone.

**Example**

\`\`\`sql
TIMESTAMP
\`\`\`

### UNSIGNED\\_TIME Type

<RailroadDiagram syntax={\`UNSIGNED_TIME\`} anchors={datatypesTopicIndex} />

The unsigned time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to the millisecond accuracy. Mapped to \`java.sql.Time\`. The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the \`HBase.toBytes(long)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_TIME
\`\`\`

### UNSIGNED\\_DATE Type

<RailroadDiagram syntax={\`UNSIGNED_DATE\`} anchors={datatypesTopicIndex} />

The unsigned date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to \`java.sql.Date\`. The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the \`HBase.toBytes(long)\` method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_DATE
\`\`\`

### UNSIGNED\\_TIMESTAMP Type

<RailroadDiagram syntax={\`UNSIGNED_TIMESTAMP\`} anchors={datatypesTopicIndex} />

The timestamp data type. The format is yyyy-MM-dd hh:mm:ss\\[.nnnnnnnnn]. Mapped to \`java.sql.Timestamp\` with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos with the long serialized through the HBase.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead.

**Example**

\`\`\`sql
UNSIGNED_TIMESTAMP
\`\`\`

### VARCHAR Type

<RailroadDiagram syntax={\`VARCHAR  [ ( precisionInt ) ]\`} anchors={datatypesTopicIndex} />

A variable length String with an optional max byte length. The binary representation is UTF8 matching the \`Bytes.toBytes(String)\` method. When used in a row key, it is terminated with a null byte unless it is the last column.

Mapped to \`java.lang.String\`.

**Example**

\`\`\`sql
VARCHAR
VARCHAR(255)
\`\`\`

### CHAR Type

<RailroadDiagram syntax={\`CHAR ( precisionInt )\`} anchors={datatypesTopicIndex} />

A fixed length String with single-byte characters. The binary representation is UTF8 matching the \`Bytes.toBytes(String)\` method.

Mapped to \`java.lang.String\`.

**Example**

\`\`\`sql
CHAR(10)
\`\`\`

### BINARY Type

<RailroadDiagram syntax={\`BINARY ( precisionInt )\`} anchors={datatypesTopicIndex} />

Raw fixed length byte array.

Mapped to \`byte[]\`.

**Example**

\`\`\`sql
BINARY
\`\`\`

### VARBINARY Type

<RailroadDiagram syntax={\`VARBINARY\`} anchors={datatypesTopicIndex} />

Raw variable length byte array.

Mapped to \`byte[]\`.

**Example**

\`\`\`sql
VARBINARY
\`\`\`

### VARBINARY\\_ENCODED Type

<RailroadDiagram syntax={\`VARBINARY_ENCODED\`} anchors={datatypesTopicIndex} />

Variable length byte array that escapes embedded \`0x00\` bytes so its sort order matches the lexicographic order of the original bytes. Use it anywhere ordering matters: a non-trailing column of a composite primary key, an index key, or a row value constructor over binary data.

Mapped to \`byte[]\`. See [VARBINARY\\_ENCODED](/docs/features/varbinary-encoded) for details.

**Example**

\`\`\`sql
VARBINARY_ENCODED
\`\`\`

### ARRAY

<RailroadDiagram syntax={\`ARRAY [ '[' [ dimensionInt ] ']' ]\`} anchors={datatypesTopicIndex} />

Mapped to \`java.sql.Array\`. Every primitive type except for \`VARBINARY\` may be declared as an \`ARRAY\`. Only single dimensional arrays are supported.

**Example**

\`\`\`sql
VARCHAR ARRAY
CHAR(10) ARRAY [5]
INTEGER []
INTEGER [100]
\`\`\`

### BSON Type

<RailroadDiagram syntax={\`BSON\`} anchors={datatypesTopicIndex} />

Native binary JSON document column for schemaless data. Phoenix can read individual fields with \`BSON_VALUE\`, filter rows with \`BSON_CONDITION_EXPRESSION\`, and atomically update fields with \`BSON_UPDATE_EXPRESSION\` — all evaluated server-side.

Stored as BSON bytes; returned as \`org.bson.RawBsonDocument\`. See [Document Data: BSON](/docs/features/bson) for details.

**Example**

\`\`\`sql
BSON
\`\`\`
`,o={title:"Data Types",description:"SQL data type reference for Apache Phoenix."},d=[{href:"/docs/features/varbinary-encoded"},{href:"/docs/features/bson"}],p={contents:[{heading:"integer-type",content:"Possible values: -2147483648 to 2147483647."},{heading:"integer-type",content:"Mapped to java.lang.Integer. The binary representation is a 4 byte integer with the sign bit flipped (so that negative values sorts before positive values)."},{heading:"integer-type",content:"Example"},{heading:"unsigned_int-type",content:"Possible values: 0 to 2147483647. Mapped to java.lang.Integer. The binary representation is a 4 byte integer, matching the Bytes.toBytes(int) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_int-type",content:"Example"},{heading:"bigint-type",content:"Possible values: -9223372036854775808 to 9223372036854775807. Mapped to java.lang.Long. The binary representation is an 8 byte long with the sign bit flipped (so that negative values sorts before positive values)."},{heading:"bigint-type",content:"Example"},{heading:"unsigned_long-type",content:"Possible values: 0 to 9223372036854775807. Mapped to java.lang.Long. The binary representation is an 8 byte integer, matching the Bytes.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_long-type",content:"Example"},{heading:"tinyint-type",content:"Possible values: -128 to 127. Mapped to java.lang.Byte. The binary representation is a single byte, with the sign bit flipped (so that negative values sorts before positive values)."},{heading:"tinyint-type",content:"Example"},{heading:"unsigned_tinyint-type",content:"Possible values: 0 to 127. Mapped to java.lang.Byte. The binary representation is a single byte, matching the Bytes.toBytes(byte) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_tinyint-type",content:"Example"},{heading:"smallint-type",content:"Possible values: -32768 to 32767. Mapped to java.lang.Short. The binary representation is a 2 byte short with the sign bit flipped (so that negative values sort before positive values)."},{heading:"smallint-type",content:"Example"},{heading:"unsigned_smallint-type",content:"Possible values: 0 to 32767. Mapped to java.lang.Short. The binary representation is an 2 byte integer, matching the Bytes.toBytes(short) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_smallint-type",content:"Example"},{heading:"float-type",content:"Possible values: -3.402823466 E + 38 to 3.402823466 E + 38. Mapped to java.lang.Float. The binary representation is an 4 byte float with the sign bit flipped (so that negative values sort before positive values)."},{heading:"float-type",content:"Example"},{heading:"unsigned_float-type",content:"Possible values: 0 to 3.402823466 E + 38. Mapped to java.lang.Float. The binary representation is an 4 byte float matching the Bytes.toBytes(float) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_float-type",content:"Example"},{heading:"double-type",content:"Possible values: -1.7976931348623158 E + 308 to 1.7976931348623158 E + 308. Mapped to java.lang.Double. The binary representation is an 8 byte double with the sign bit flipped (so that negative values sort before positive value)."},{heading:"double-type",content:"Example"},{heading:"unsigned_double-type",content:"Possible values: 0 to  1.7976931348623158 E + 308. Mapped to java.lang.Double. The binary representation is an 8 byte double matching the Bytes.toBytes(double) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_double-type",content:"Example"},{heading:"decimal-type",content:"Data type with fixed precision and scale. A user can specify precision and scale by expression DECIMAL(precision,scale) in a DDL statement, for example, DECIMAL(10,2). The maximum precision is 38 digits. Mapped to java.math.BigDecimal. The binary representation is binary comparable, variable length format. When used in a row key, it is terminated with a null byte unless it is the last column."},{heading:"decimal-type",content:"Example"},{heading:"boolean-type",content:"Possible values: TRUE and FALSE."},{heading:"boolean-type",content:"Mapped to java.lang.Boolean. The binary representation is a single byte with 0 for false and 1 for true"},{heading:"boolean-type",content:"Example"},{heading:"time-type",content:`The time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained. Mapped to java.sql.Time. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a TIME column than what is provided by "java.sql.Time". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Time" will format times based on the client's local time zone. Please note that this TIME type is different than the TIME type as defined by the SQL 92 standard in that it includes year, month, and day components. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.`},{heading:"time-type",content:"Example"},{heading:"date-type",content:`The date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to java.sql.Date. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a DATE column than what is provided by "java.sql.Date". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Date" will format dates based on the client's local time zone. Please note that this DATE type is different than the DATE type as defined by the SQL 92 standard in that it includes a time component. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.`},{heading:"date-type",content:"Example"},{heading:"timestamp-type",content:`The timestamp data type. The format is yyyy-MM-dd hh:mm:ss[.nnnnnnnnn]. Mapped to java.sql.Timestamp with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos. Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Timestamp" will format timestamps based on the client's local time zone.`},{heading:"timestamp-type",content:"Example"},{heading:"unsigned_time-type",content:"The unsigned time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to the millisecond accuracy. Mapped to java.sql.Time. The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the HBase.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_time-type",content:"Example"},{heading:"unsigned_date-type",content:"The unsigned date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to java.sql.Date. The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the HBase.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_date-type",content:"Example"},{heading:"unsigned_timestamp-type",content:"The timestamp data type. The format is yyyy-MM-dd hh:mm:ss[.nnnnnnnnn]. Mapped to java.sql.Timestamp with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos with the long serialized through the HBase.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."},{heading:"unsigned_timestamp-type",content:"Example"},{heading:"varchar-type",content:"A variable length String with an optional max byte length. The binary representation is UTF8 matching the Bytes.toBytes(String) method. When used in a row key, it is terminated with a null byte unless it is the last column."},{heading:"varchar-type",content:"Mapped to java.lang.String."},{heading:"varchar-type",content:"Example"},{heading:"char-type",content:"A fixed length String with single-byte characters. The binary representation is UTF8 matching the Bytes.toBytes(String) method."},{heading:"char-type",content:"Mapped to java.lang.String."},{heading:"char-type",content:"Example"},{heading:"binary-type",content:"Raw fixed length byte array."},{heading:"binary-type",content:"Mapped to byte[]."},{heading:"binary-type",content:"Example"},{heading:"varbinary-type",content:"Raw variable length byte array."},{heading:"varbinary-type",content:"Mapped to byte[]."},{heading:"varbinary-type",content:"Example"},{heading:"varbinary_encoded-type",content:"Variable length byte array that escapes embedded 0x00 bytes so its sort order matches the lexicographic order of the original bytes. Use it anywhere ordering matters: a non-trailing column of a composite primary key, an index key, or a row value constructor over binary data."},{heading:"varbinary_encoded-type",content:"Mapped to byte[]. See VARBINARY_ENCODED for details."},{heading:"varbinary_encoded-type",content:"Example"},{heading:"array",content:"Mapped to java.sql.Array. Every primitive type except for VARBINARY may be declared as an ARRAY. Only single dimensional arrays are supported."},{heading:"array",content:"Example"},{heading:"bson-type",content:"Native binary JSON document column for schemaless data. Phoenix can read individual fields with BSON_VALUE, filter rows with BSON_CONDITION_EXPRESSION, and atomically update fields with BSON_UPDATE_EXPRESSION — all evaluated server-side."},{heading:"bson-type",content:"Stored as BSON bytes; returned as org.bson.RawBsonDocument. See Document Data: BSON for details."},{heading:"bson-type",content:"Example"}],headings:[{id:"data-types",content:"Data Types"},{id:"integer-type",content:"INTEGER Type"},{id:"unsigned_int-type",content:"UNSIGNED_INT Type"},{id:"bigint-type",content:"BIGINT Type"},{id:"unsigned_long-type",content:"UNSIGNED_LONG Type"},{id:"tinyint-type",content:"TINYINT Type"},{id:"unsigned_tinyint-type",content:"UNSIGNED_TINYINT Type"},{id:"smallint-type",content:"SMALLINT Type"},{id:"unsigned_smallint-type",content:"UNSIGNED_SMALLINT Type"},{id:"float-type",content:"FLOAT Type"},{id:"unsigned_float-type",content:"UNSIGNED_FLOAT Type"},{id:"double-type",content:"DOUBLE Type"},{id:"unsigned_double-type",content:"UNSIGNED_DOUBLE Type"},{id:"decimal-type",content:"DECIMAL Type"},{id:"boolean-type",content:"BOOLEAN Type"},{id:"time-type",content:"TIME Type"},{id:"date-type",content:"DATE Type"},{id:"timestamp-type",content:"TIMESTAMP Type"},{id:"unsigned_time-type",content:"UNSIGNED_TIME Type"},{id:"unsigned_date-type",content:"UNSIGNED_DATE Type"},{id:"unsigned_timestamp-type",content:"UNSIGNED_TIMESTAMP Type"},{id:"varchar-type",content:"VARCHAR Type"},{id:"char-type",content:"CHAR Type"},{id:"binary-type",content:"BINARY Type"},{id:"varbinary-type",content:"VARBINARY Type"},{id:"varbinary_encoded-type",content:"VARBINARY_ENCODED Type"},{id:"array",content:"ARRAY"},{id:"bson-type",content:"BSON Type"}]};const i={select:"select","upsert values":"upsert-values","upsert select":"upsert-select",delete:"delete","declare cursor":"declare-cursor","open cursor":"open-cursor","fetch next":"fetch-next",close:"close","create table":"create-table","drop table":"drop-table","create function":"create-function","drop function":"drop-function","create view":"create-view","drop view":"drop-view","create sequence":"create-sequence","drop sequence":"drop-sequence",alter:"alter","create index":"create-index","drop index":"drop-index","alter index":"alter-index",explain:"explain",constraint:"constraint","update statistics":"update-statistics","create schema":"create-schema",use:"use","drop schema":"drop-schema",grant:"grant",revoke:"revoke",options:"options",hint:"hint","scan hint":"scan-hint","cache hint":"cache-hint","index hint":"index-hint","small hint":"small-hint","seek to column hint":"seek-to-column-hint","join hint":"join-hint","serial hint":"serial-hint","column def":"column-def","table ref":"table-ref","sequence ref":"sequence-ref","column ref":"column-ref","select expression":"select-expression","select statement":"select-statement","split point":"split-point","table spec":"table-spec","aliased table ref":"aliased-table-ref","join type":"join-type",join:"join-type","func argument":"func-argument","class name":"class-name","jar path":"jar-path",order:"order",expression:"expression","and condition":"and-condition","boolean condition":"boolean-condition",condition:"condition","rhs operand":"rhs-operand",operand:"operand",summand:"summand",factor:"factor",term:"term","array constructor":"array-constructor",sequence:"sequence",cast:"cast","row value constructor":"row-value-constructor","bind parameter":"bind-parameter",value:"value",case:"case","case when":"case-when",name:"name","quoted name":"quoted-name",alias:"alias",null:"null","data type":"data-type",data:"data-type","sql data type":"sql-data-type","sql data":"sql-data-type","hbase data type":"hbase-data-type","hbase data":"hbase-data-type",string:"string",boolean:"boolean-type",numeric:"numeric",int:"int",long:"long",decimal:"decimal-type",number:"number",comments:"comments","integer type":"integer-type",integer:"integer-type","unsigned_int type":"unsigned-int-type",unsigned_int:"unsigned-int-type","bigint type":"bigint-type",bigint:"bigint-type","unsigned_long type":"unsigned-long-type",unsigned_long:"unsigned-long-type","tinyint type":"tinyint-type",tinyint:"tinyint-type","unsigned_tinyint type":"unsigned-tinyint-type",unsigned_tinyint:"unsigned-tinyint-type","smallint type":"smallint-type",smallint:"smallint-type","unsigned_smallint type":"unsigned-smallint-type",unsigned_smallint:"unsigned-smallint-type","float type":"float-type",float:"float-type","unsigned_float type":"unsigned-float-type",unsigned_float:"unsigned-float-type","double type":"double-type",double:"double-type","unsigned_double type":"unsigned-double-type",unsigned_double:"unsigned-double-type","decimal type":"decimal-type","boolean type":"boolean-type","time type":"time-type",time:"time-type","date type":"date-type",date:"date-type","timestamp type":"timestamp-type",timestamp:"timestamp-type","unsigned_time type":"unsigned-time-type",unsigned_time:"unsigned-time-type","unsigned_date type":"unsigned-date-type",unsigned_date:"unsigned-date-type","unsigned_timestamp type":"unsigned-timestamp-type",unsigned_timestamp:"unsigned-timestamp-type","varchar type":"varchar-type",varchar:"varchar-type","char type":"char-type",char:"char-type","binary type":"binary-type",binary:"binary-type","varbinary type":"varbinary-type",varbinary:"varbinary-type","varbinary_encoded type":"varbinary-encoded-type",varbinary_encoded:"varbinary-encoded-type",array:"array","bson type":"bson-type",bson:"bson-type",avg:"avg",count:"count",approx_count_distinct:"approx-count-distinct",max:"max",min:"min",sum:"sum",percentile_cont:"percentile-cont",percentile_disc:"percentile-disc",percent_rank:"percent-rank",first_value:"first-value",last_value:"last-value",first_values:"first-values",last_values:"last-values",nth_value:"nth-value",stddev_pop:"stddev-pop",stddev_samp:"stddev-samp",round:"round",ceil:"ceil",floor:"floor",trunc:"trunc",substr:"substr",instr:"instr",trim:"trim",ltrim:"ltrim",rtrim:"rtrim",lpad:"lpad",array_elem:"array-elem",array_length:"array-length",array_append:"array-append",array_prepend:"array-prepend",array_cat:"array-cat",array_fill:"array-fill",array_to_string:"array-to-string",any:"any",all:"all",length:"length",regexp_substr:"regexp-substr",regexp_replace:"regexp-replace",regexp_split:"regexp-split",md5:"md5",invert:"invert",encode:"encode",decode:"decode",to_number:"to-number",rand:"rand",upper:"upper",lower:"lower",reverse:"reverse",to_char:"to-char",to_date:"to-date",current_date:"current-date",to_time:"to-time",to_timestamp:"to-timestamp",current_time:"current-time",convert_tz:"convert-tz",timezone_offset:"timezone-offset",now:"now",year:"year",month:"month",week:"week",dayofyear:"dayofyear",dayofmonth:"dayofmonth",dayofweek:"dayofweek",hour:"hour",minute:"minute",second:"second",coalesce:"coalesce",sign:"sign",abs:"abs",sqrt:"sqrt",cbrt:"cbrt",exp:"exp",power:"power",ln:"ln",log:"log",get_bit:"get-bit",get_byte:"get-byte",octet_length:"octet-length",set_bit:"set-bit",set_byte:"set-byte",collation_key:"collation-key"},c=[{depth:2,url:"#data-types",title:e.jsx(e.Fragment,{children:"Data Types"})},{depth:3,url:"#integer-type",title:e.jsx(e.Fragment,{children:"INTEGER Type"})},{depth:3,url:"#unsigned_int-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_INT Type"})},{depth:3,url:"#bigint-type",title:e.jsx(e.Fragment,{children:"BIGINT Type"})},{depth:3,url:"#unsigned_long-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_LONG Type"})},{depth:3,url:"#tinyint-type",title:e.jsx(e.Fragment,{children:"TINYINT Type"})},{depth:3,url:"#unsigned_tinyint-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_TINYINT Type"})},{depth:3,url:"#smallint-type",title:e.jsx(e.Fragment,{children:"SMALLINT Type"})},{depth:3,url:"#unsigned_smallint-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_SMALLINT Type"})},{depth:3,url:"#float-type",title:e.jsx(e.Fragment,{children:"FLOAT Type"})},{depth:3,url:"#unsigned_float-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_FLOAT Type"})},{depth:3,url:"#double-type",title:e.jsx(e.Fragment,{children:"DOUBLE Type"})},{depth:3,url:"#unsigned_double-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_DOUBLE Type"})},{depth:3,url:"#decimal-type",title:e.jsx(e.Fragment,{children:"DECIMAL Type"})},{depth:3,url:"#boolean-type",title:e.jsx(e.Fragment,{children:"BOOLEAN Type"})},{depth:3,url:"#time-type",title:e.jsx(e.Fragment,{children:"TIME Type"})},{depth:3,url:"#date-type",title:e.jsx(e.Fragment,{children:"DATE Type"})},{depth:3,url:"#timestamp-type",title:e.jsx(e.Fragment,{children:"TIMESTAMP Type"})},{depth:3,url:"#unsigned_time-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_TIME Type"})},{depth:3,url:"#unsigned_date-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_DATE Type"})},{depth:3,url:"#unsigned_timestamp-type",title:e.jsx(e.Fragment,{children:"UNSIGNED_TIMESTAMP Type"})},{depth:3,url:"#varchar-type",title:e.jsx(e.Fragment,{children:"VARCHAR Type"})},{depth:3,url:"#char-type",title:e.jsx(e.Fragment,{children:"CHAR Type"})},{depth:3,url:"#binary-type",title:e.jsx(e.Fragment,{children:"BINARY Type"})},{depth:3,url:"#varbinary-type",title:e.jsx(e.Fragment,{children:"VARBINARY Type"})},{depth:3,url:"#varbinary_encoded-type",title:e.jsx(e.Fragment,{children:"VARBINARY_ENCODED Type"})},{depth:3,url:"#array",title:e.jsx(e.Fragment,{children:"ARRAY"})},{depth:3,url:"#bson-type",title:e.jsx(e.Fragment,{children:"BSON Type"})}];function s(a){const t={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",strong:"strong",...a.components},{RailroadDiagram:n}=t;return n||r("RailroadDiagram"),e.jsxs(e.Fragment,{children:[e.jsx(t.h2,{id:"data-types",children:"Data Types"}),`
`,e.jsx(t.h3,{id:"integer-type",children:"INTEGER Type"}),`
`,e.jsx(n,{syntax:"INTEGER",anchors:i}),`
`,e.jsx(t.p,{children:"Possible values: -2147483648 to 2147483647."}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"java.lang.Integer"}),". The binary representation is a 4 byte integer with the sign bit flipped (so that negative values sorts before positive values)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTEGER"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_int-type",children:"UNSIGNED_INT Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_INT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to 2147483647. Mapped to ",e.jsx(t.code,{children:"java.lang.Integer"}),". The binary representation is a 4 byte integer, matching the ",e.jsx(t.code,{children:"Bytes.toBytes(int)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_INT"})})})})}),`
`,e.jsx(t.h3,{id:"bigint-type",children:"BIGINT Type"}),`
`,e.jsx(n,{syntax:"BIGINT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: -9223372036854775808 to 9223372036854775807. Mapped to ",e.jsx(t.code,{children:"java.lang.Long"}),". The binary representation is an 8 byte long with the sign bit flipped (so that negative values sorts before positive values)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BIGINT"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_long-type",children:"UNSIGNED_LONG Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_LONG",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to 9223372036854775807. Mapped to ",e.jsx(t.code,{children:"java.lang.Long"}),". The binary representation is an 8 byte integer, matching the ",e.jsx(t.code,{children:"Bytes.toBytes(long)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_LONG"})})})})}),`
`,e.jsx(t.h3,{id:"tinyint-type",children:"TINYINT Type"}),`
`,e.jsx(n,{syntax:"TINYINT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: -128 to 127. Mapped to ",e.jsx(t.code,{children:"java.lang.Byte"}),". The binary representation is a single byte, with the sign bit flipped (so that negative values sorts before positive values)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"TINYINT"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_tinyint-type",children:"UNSIGNED_TINYINT Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_TINYINT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to 127. Mapped to ",e.jsx(t.code,{children:"java.lang.Byte"}),". The binary representation is a single byte, matching the ",e.jsx(t.code,{children:"Bytes.toBytes(byte)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_TINYINT"})})})})}),`
`,e.jsx(t.h3,{id:"smallint-type",children:"SMALLINT Type"}),`
`,e.jsx(n,{syntax:"SMALLINT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: -32768 to 32767. Mapped to ",e.jsx(t.code,{children:"java.lang.Short"}),". The binary representation is a 2 byte short with the sign bit flipped (so that negative values sort before positive values)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"SMALLINT"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_smallint-type",children:"UNSIGNED_SMALLINT Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_SMALLINT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to 32767. Mapped to ",e.jsx(t.code,{children:"java.lang.Short"}),". The binary representation is an 2 byte integer, matching the ",e.jsx(t.code,{children:"Bytes.toBytes(short)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_SMALLINT"})})})})}),`
`,e.jsx(t.h3,{id:"float-type",children:"FLOAT Type"}),`
`,e.jsx(n,{syntax:"FLOAT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: -3.402823466 E + 38 to 3.402823466 E + 38. Mapped to ",e.jsx(t.code,{children:"java.lang.Float"}),". The binary representation is an 4 byte float with the sign bit flipped (so that negative values sort before positive values)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FLOAT"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_float-type",children:"UNSIGNED_FLOAT Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_FLOAT",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to 3.402823466 E + 38. Mapped to ",e.jsx(t.code,{children:"java.lang.Float"}),". The binary representation is an 4 byte float matching the ",e.jsx(t.code,{children:"Bytes.toBytes(float)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_FLOAT"})})})})}),`
`,e.jsx(t.h3,{id:"double-type",children:"DOUBLE Type"}),`
`,e.jsx(n,{syntax:"DOUBLE",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: -1.7976931348623158 E + 308 to 1.7976931348623158 E + 308. Mapped to ",e.jsx(t.code,{children:"java.lang.Double"}),". The binary representation is an 8 byte double with the sign bit flipped (so that negative values sort before positive value)."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"DOUBLE"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_double-type",children:"UNSIGNED_DOUBLE Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_DOUBLE",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: 0 to  1.7976931348623158 E + 308. Mapped to ",e.jsx(t.code,{children:"java.lang.Double"}),". The binary representation is an 8 byte double matching the ",e.jsx(t.code,{children:"Bytes.toBytes(double)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_DOUBLE"})})})})}),`
`,e.jsx(t.h3,{id:"decimal-type",children:"DECIMAL Type"}),`
`,e.jsx(n,{syntax:"DECIMAL [ (precisionInt, scaleInt) ]",anchors:i}),`
`,e.jsxs(t.p,{children:["Data type with fixed precision and scale. A user can specify precision and scale by expression ",e.jsx(t.code,{children:"DECIMAL(precision,scale)"})," in a DDL statement, for example, DECIMAL(10,2). The maximum precision is 38 digits. Mapped to ",e.jsx(t.code,{children:"java.math.BigDecimal"}),". The binary representation is binary comparable, variable length format. When used in a row key, it is terminated with a null byte unless it is the last column."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DECIMAL"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DECIMAL"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsx(t.h3,{id:"boolean-type",children:"BOOLEAN Type"}),`
`,e.jsx(n,{syntax:"BOOLEAN",anchors:i}),`
`,e.jsxs(t.p,{children:["Possible values: ",e.jsx(t.code,{children:"TRUE"})," and ",e.jsx(t.code,{children:"FALSE"}),"."]}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"java.lang.Boolean"}),". The binary representation is a single byte with ",e.jsx(t.code,{children:"0"})," for false and ",e.jsx(t.code,{children:"1"})," for true"]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BOOLEAN"})})})})}),`
`,e.jsx(t.h3,{id:"time-type",children:"TIME Type"}),`
`,e.jsx(n,{syntax:"TIME",anchors:i}),`
`,e.jsxs(t.p,{children:["The time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained. Mapped to ",e.jsx(t.code,{children:"java.sql.Time"}),`. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a TIME column than what is provided by "java.sql.Time". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Time" will format times based on the client's local time zone. Please note that this TIME type is different than the TIME type as defined by the SQL 92 standard in that it includes year, month, and day components. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"TIME"})})})})}),`
`,e.jsx(t.h3,{id:"date-type",children:"DATE Type"}),`
`,e.jsx(n,{syntax:"DATE",anchors:i}),`
`,e.jsxs(t.p,{children:["The date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to ",e.jsx(t.code,{children:"java.sql.Date"}),`. The binary representation is an 8 byte long (the number of milliseconds from the epoch), making it possible (although not necessarily recommended) to store more information within a DATE column than what is provided by "java.sql.Date". Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Date" will format dates based on the client's local time zone. Please note that this DATE type is different than the DATE type as defined by the SQL 92 standard in that it includes a time component. As such, it is not in compliance with the JDBC APIs. As the underlying data is still stored as a long, only the presentation of the value is incorrect.`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"DATE"})})})})}),`
`,e.jsx(t.h3,{id:"timestamp-type",children:"TIMESTAMP Type"}),`
`,e.jsx(n,{syntax:"TIMESTAMP",anchors:i}),`
`,e.jsxs(t.p,{children:["The timestamp data type. The format is yyyy-MM-dd hh:mm:ss[.nnnnnnnnn]. Mapped to ",e.jsx(t.code,{children:"java.sql.Timestamp"}),` with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos. Note that the internal representation is based on a number of milliseconds since the epoch (which is based on a time in GMT), while "java.sql.Timestamp" will format timestamps based on the client's local time zone.`]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"TIMESTAMP"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_time-type",children:"UNSIGNED_TIME Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_TIME",anchors:i}),`
`,e.jsxs(t.p,{children:["The unsigned time data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to the millisecond accuracy. Mapped to ",e.jsx(t.code,{children:"java.sql.Time"}),". The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the ",e.jsx(t.code,{children:"HBase.toBytes(long)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_TIME"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_date-type",children:"UNSIGNED_DATE Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_DATE",anchors:i}),`
`,e.jsxs(t.p,{children:["The unsigned date data type. The format is yyyy-MM-dd hh:mm:ss, with both the date and time parts maintained to a millisecond accuracy. Mapped to ",e.jsx(t.code,{children:"java.sql.Date"}),". The binary representation is an 8 byte long (the number of milliseconds from the epoch) matching the ",e.jsx(t.code,{children:"HBase.toBytes(long)"})," method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_DATE"})})})})}),`
`,e.jsx(t.h3,{id:"unsigned_timestamp-type",children:"UNSIGNED_TIMESTAMP Type"}),`
`,e.jsx(n,{syntax:"UNSIGNED_TIMESTAMP",anchors:i}),`
`,e.jsxs(t.p,{children:["The timestamp data type. The format is yyyy-MM-dd hh:mm:ss[.nnnnnnnnn]. Mapped to ",e.jsx(t.code,{children:"java.sql.Timestamp"})," with an internal representation of the number of nanos from the epoch. The binary representation is 12 bytes: an 8 byte long for the epoch time plus a 4 byte integer for the nanos with the long serialized through the HBase.toBytes(long) method. The purpose of this type is to map to existing HBase data that was serialized using this HBase utility method. If that is not the case, use the regular signed type instead."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"UNSIGNED_TIMESTAMP"})})})})}),`
`,e.jsx(t.h3,{id:"varchar-type",children:"VARCHAR Type"}),`
`,e.jsx(n,{syntax:"VARCHAR  [ ( precisionInt ) ]",anchors:i}),`
`,e.jsxs(t.p,{children:["A variable length String with an optional max byte length. The binary representation is UTF8 matching the ",e.jsx(t.code,{children:"Bytes.toBytes(String)"})," method. When used in a row key, it is terminated with a null byte unless it is the last column."]}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"java.lang.String"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"255"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsx(t.h3,{id:"char-type",children:"CHAR Type"}),`
`,e.jsx(n,{syntax:"CHAR ( precisionInt )",anchors:i}),`
`,e.jsxs(t.p,{children:["A fixed length String with single-byte characters. The binary representation is UTF8 matching the ",e.jsx(t.code,{children:"Bytes.toBytes(String)"})," method."]}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"java.lang.String"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CHAR"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsx(t.h3,{id:"binary-type",children:"BINARY Type"}),`
`,e.jsx(n,{syntax:"BINARY ( precisionInt )",anchors:i}),`
`,e.jsx(t.p,{children:"Raw fixed length byte array."}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"byte[]"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"BINARY"})})})})}),`
`,e.jsx(t.h3,{id:"varbinary-type",children:"VARBINARY Type"}),`
`,e.jsx(n,{syntax:"VARBINARY",anchors:i}),`
`,e.jsx(t.p,{children:"Raw variable length byte array."}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"byte[]"}),"."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARBINARY"})})})})}),`
`,e.jsx(t.h3,{id:"varbinary_encoded-type",children:"VARBINARY_ENCODED Type"}),`
`,e.jsx(n,{syntax:"VARBINARY_ENCODED",anchors:i}),`
`,e.jsxs(t.p,{children:["Variable length byte array that escapes embedded ",e.jsx(t.code,{children:"0x00"})," bytes so its sort order matches the lexicographic order of the original bytes. Use it anywhere ordering matters: a non-trailing column of a composite primary key, an index key, or a row value constructor over binary data."]}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"byte[]"}),". See ",e.jsx(t.a,{href:"/docs/features/varbinary-encoded",children:"VARBINARY_ENCODED"})," for details."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"VARBINARY_ENCODED"})})})})}),`
`,e.jsx(t.h3,{id:"array",children:"ARRAY"}),`
`,e.jsx(n,{syntax:"ARRAY [ '[' [ dimensionInt ] ']' ]",anchors:i}),`
`,e.jsxs(t.p,{children:["Mapped to ",e.jsx(t.code,{children:"java.sql.Array"}),". Every primitive type except for ",e.jsx(t.code,{children:"VARBINARY"})," may be declared as an ",e.jsx(t.code,{children:"ARRAY"}),". Only single dimensional arrays are supported."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"VARCHAR"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ARRAY"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"CHAR"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ARRAY"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [5]"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTEGER"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" []"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"INTEGER"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [100]"})]})]})})}),`
`,e.jsx(t.h3,{id:"bson-type",children:"BSON Type"}),`
`,e.jsx(n,{syntax:"BSON",anchors:i}),`
`,e.jsxs(t.p,{children:["Native binary JSON document column for schemaless data. Phoenix can read individual fields with ",e.jsx(t.code,{children:"BSON_VALUE"}),", filter rows with ",e.jsx(t.code,{children:"BSON_CONDITION_EXPRESSION"}),", and atomically update fields with ",e.jsx(t.code,{children:"BSON_UPDATE_EXPRESSION"})," — all evaluated server-side."]}),`
`,e.jsxs(t.p,{children:["Stored as BSON bytes; returned as ",e.jsx(t.code,{children:"org.bson.RawBsonDocument"}),". See ",e.jsx(t.a,{href:"/docs/features/bson",children:"Document Data: BSON"})," for details."]}),`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"Example"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"BSON"})})})})})]})}function y(a={}){const{wrapper:t}=a.components||{};return t?e.jsx(t,{...a,children:e.jsx(s,{...a})}):s(a)}function r(a,t){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,i as datatypesTopicIndex,y as default,d as extractedReferences,o as frontmatter,p as structuredData,c as toc};
