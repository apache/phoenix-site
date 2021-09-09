# Building the Main Phoenix Project

Phoenix consists of several subprojects.

The core of the project is the `phoenix` project, which depends on the `phoenix-thirdparty`, `phoenix-omid` and `phoenix-tephra` projects.

`phoenix-queryserver` and `phoenix-connectors` are optional packages that depend on the `phoenix` project.

Check out the [source](source.html) and follow the build instructions in BUILDING.md (or README.md) in the root directory.


# Using Phoenix in a Maven Project #

Phoenix is also hosted at Apache Maven Repository and Maven Central. You can add it to your mavenized project by adding the following to your pom:

```
  <dependencies>
    ...
    <dependency>
        <groupId>org.apache.phoenix</groupId>
        <artifactId>phoenix-client-hbase-[hbase.profile]</artifactId>
        <version>[phoenix.version]</version>
    </dependency>
    ...
  </dependencies>
```

Where [phoenix.version] is the phoenix release i.e 5.1.2 or 4.16.1, and [hbase.profile] is
the supported HBase version, which you can see listed on the [download](download.html) page.

## Branches ##

The main Phoenix project currently has two active branches.

The 4.x branch works with HBase 1 and Hadoop 2, while the 5.x branch works with HBase 2 and Hadoop 3.
See the [download](download.html) page and BUILDING.md for the HBase versions
supported by each release.

<hr/>

See also: 

[Building Project Web Site](building_website.html)

[How to do a release](release.html)
