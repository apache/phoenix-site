To re-generate docs:
  edit src/docsrc/help/phoenix.csv based on updated BNF
  ./build.sh clean
  ./build.sh docs


"Other Grammar","Row timestamp column","
columnRef dataType [NOT NULL] [PRIMARY KEY [ASC | DESC] [ROW_TIMESTAMP]]
","
A primary key column can be declared as row timestamp. This maps the column
to the HBase row timestamp.
","
CREATE TABLE T (PK1 CHAR(15) NOT NULL, PK2 DATE NOT NULL, KV1 VARCHAR CONSTRAINT PK PRIMARY KEY(PK1, PK2 DESC ROW_TIMESTAMP))
"


