# Python Driver for Phoenix

The Python Driver for Apache Phoenix implements the [Python DB 2.0 API](https://www.python.org/dev/peps/pep-0249/) to access Phoenix via the Phoenix Query Server. The driver is tested with Python 2.7, 3.5, and 3.6. This code was originally called [Python Phoenixdb](https://code.oxygene.sk/lukas/python-phoenixdb) and was graciously donated by its authors to the Apache Phoenix project.

All future development of the project is being done in Apache Phoenix.

## Installation

Phoenix does not presently deploy the driver, so users must first build the driver and install it themselves:

```
$ cd python
$ pip install -r requirements.txt
$ python setup.py install
```

Deploying a binary release to central Python package-hosting services (e.g. installable via `pip`) will be done eventually. Presently, releases
are in source-form only.

## Examples

```
import phoenixdb
import phoenixdb.cursor

database_url = 'http://localhost:8765/'
conn = phoenixdb.connect(database_url, autocommit=True)

cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR)")
cursor.execute("UPSERT INTO users VALUES (?, ?)", (1, 'admin'))
cursor.execute("SELECT * FROM users")
print(cursor.fetchall())

cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
cursor.execute("SELECT * FROM users WHERE id=1")
print(cursor.fetchone()['USERNAME'])
```

## Limitations <a id="Limitations"></a>
* The driver presently does not support Kerberos authentication [PHOENIX-4688](https://issues.apache.org/jira/browse/PHOENIX-4688)

## Resources <a id="Resources"></a>
* [PHOENIX-4636] (https://issues.apache.org/jira/browse/PHOENIX-4636) : Initial landing of the driver into Apache Phoenix.
