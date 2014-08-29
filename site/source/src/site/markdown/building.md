# Building Phoenix Project

Phoenix is a fully mavenized project. Download [source](source.html) and build simply by doing:

```
$ mvn package
```
builds, runs fast unit tests and package Phoenix and put the resulting jars (phoenix-[version].jar and phoenix-[version]-client.jar) in the generated phoenix-core/target/ and phoenix-assembly/target/ directories respectively.


To build, but skip running the fast unit tests, you can do:

```
 $ mvn package -DskipTests
```

To build against hadoop2, you can do:

```
 $ mvn package -DskipTests -Dhadoop.profile=2
```

To run all tests including long running integration tests

```
 $ mvn install
```

To only build the generated parser (i.e. <code>PhoenixSQLLexer</code> and <code>PhoenixSQLParser</code>), you can do:

```
 $ mvn install -DskipTests
 $ mvn process-sources
```

To build an Eclipse project, install the m2e plugin and do an File->Import...->Import Existing Maven Projects selecting the root directory of Phoenix.

## Maven ##

Phoenix is also hosted at Apache Maven Repository. You can add it to your mavenized project by adding the following to your pom:

```
 <repositories>
   ...
    <repository>
      <id>apache release</id>
      <url>https://repository.apache.org/content/repositories/releases/</url>
    </repository>
    ...
  </repositories>
  
  <dependencies>
    ...
    <dependency>
        <groupId>org.apache.phoenix</groupId>
        <artifactId>phoenix-core</artifactId>
        <version>[version]</version>
    </dependency>
    ...
  </dependencies>
```
Note: [version] can be replaced by 3.1.0, 4.1.0, 3.0.0-incubating, 4.0.0-incubating, etc.

## Branches ##
Phoenix 3.0 is running against hbase0.94+, Phoenix 4.0 is running against hbase0.98.1+ and Phoenix master branch is running against hbase trunk branch.

<hr/>

See also: 

[Building Project Web Site](building_website.html)

[How to do a release](release.html)
