# Developing for Apache Phoenix
Below are the steps necessary to setup your development environment so that you may contribute to Apache Phoenix.

* [Getting Started](#gettingStarted)
* [Setup local Git Repository](#localGit)
* [Eclipse](#eclipse)
    * [Get Settings and Preferences Correct](#eclipsePrefs)
    * [Connecting to Jira](#eclipseJira)
    * [Commit](#eclipseCommit)
* [Intellij](#intellij)
    * [Simplified Setup](#intellijSetup)
    * [Local repository setup](#intellijLocalSetup)
    * [Get Settings and Preferences Correct](#intellijPrefs)
    * [Connecting to Jira](#intellijJira)
    * [Commit](#intellijCommit)
* [Contributing Finished Work](#contribute)
    * [Pull Requests](#pullRequest)

<a id='gettingStarted'></a>
## Getting Started
1. Review the [How to Contribute](contributing.html) documentation.
1. Sign up for a [github.com](https://github.com/) account if you don't have one.
1. Go to the [Phoenix Github Repository](https://github.com/apache/phoenix) and create a fork of the repository which will create repository {username}/phoenix.
1. Setup git locally.
    * [Instructions](https://help.github.com/articles/set-up-git/)
    * [Download](http://git-scm.com/downloads)
1. Make sure you have a jdk (Phoenix requires [JDK 7](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html)).
1. Make sure you have [maven 3+](http://maven.apache.org/download.cgi) installed.
1. Add the following to you .bashrc or equivalent to make sure maven and java are configured to run from command line correctly.

    <pre>
    export JAVA_HOME={path to jdk}
    export JDK_HOME={path to jdk}
    export M2_HOME={patch to maven}
    export PATH=$M2_HOME/bin:$PATH
    </pre>

<a id='localGit'></a>
## Setup Local Git Repository
Note that you may find it easier to clone from the IDE of your choosing as it may speed things up for you especially with Intellij

1. Create a local clone of your new forked repository

    <pre>
    git clone https://github.com/{username}/phoenix.git
    </pre>
1. Configure your local repository to be able to sync with the apache/phoenix repository

    <pre>
    cd {repository}
    git remote add upstream https://github.com/apache/phoenix.git
    </pre>
1. Setup your development environment

<a id='eclipse'></a>
## For Eclipse IDE for Java Developers (Luna)
1. [Download Eclipse](https://eclipse.org/downloads/packages/eclipse-ide-java-developers/lunar)
    * You will want 'Eclipse IDE for Java Developers' unless you want to install the following tools by hand
         * [m2e](http://download.eclipse.org/technology/m2e/releases/)
         * [egit](http://www.eclipse.org/egit/download/)
1. Configure Eclipse to handle Maven Issues appropriately so you don't see unnecessary errors.
    * Window -> Preferences -> Maven -> Errors/Warnings
    * Choose Ignore option for 'Plugin execution not covered by lifecycle configuation' -> Ok
1. Add a the local git repository to Eclipse
    * Window -> Show View -> Other... -> Git | Git Repositories -> Ok
    * Click 'Add an existing local Git Repository to this view'
    * Search for appropriate git repository
    * Finish
1. Import Maven Projects
    * File -> Import -> Maven -> Existing Maven Projects
    * Choose Root directory where phoenix git repository is located
    * Select All
    * Finish
1. Generate Lexer and Parser Files
    * Select phoenix-core project
    * Run -> Run As -> Maven generate-sources
1. Make sure you are setup to develop now.
    * Open IndexUtilTest.Java
    * Run -> Run As -> JUnit Test

<a id='eclipsePrefs'></a>
### Get Settings and Preferences Correct
1. Import General Preferences
    * File -> Import... -> General -> Preferences
    * From - {repository}/dev/eclipse_prefs_phoenix.epf
    * Import All
    * Finish
1. Import Code Templates
    * Window -> Preferences -> Java -> Code Style -> Code Templates -> Import...
    * Navigate to {repository}/dev/PhoenixCodeTemplate.xml -> Ok
1. Import Formatter
    * Window -> Preferences -> Java -> Code Style -> Formatter-> Import... 
    * Navigate to {repository}/dev/PhoenixCodeTemplate.xml -> Ok
1. Import correct import order settings
    * Window -> Preferences -> Java -> Code Style -> Organize Imports -> Import... 
    * Navigate to {repository}/dev/phoenix.importorder -> Ok
1. Make sure you use space for tabs
    * Window -> Preferences -> General -> Editors -> Text Editors 
    * Select 'Insert Spaces for tabs' -> Ok

<a id='eclipseJira'></a>
### Connecting to Jira
1. Install Connector for Jira
    * Help -> Install New Software -> Add
    * Location - http://update.atlassian.com/atlassian-eclipse-plugin/rest/e3.7 -> Atlassian Connector
    * Finish
1. Add Task Repository
    * Window -> Show View -> Mylyn -> Task Repositories -> Add Task Repository
    * JIRA -> Next -> Server - https://issues.apache.org/jira -> Validate Settings
    * Finish
1. Add Filter Of All JIRAs assigned to you
    * Right Click on Repository You added -> New Query... -> Predefined Filter
    * Select Phoenix Project -> Select Assigned to me
    * Finish

<a id='eclipseCommit'></a>
### Commit
1. Commit Changes and Push to Github with appropriate Message
    * CTRL-# -> Set Commit message to include jira number at beginning PHOENIX-####
    * Commit and Push

<a id='intellij'></a>
## For Intellij
* [Download Intellij](https://www.jetbrains.com/idea/download/) 
<a id='intellijSetup'></a>

#### If you don't have a local git repository setup
This will automatically create the local clone of your repository for you.  You will still want to add the remote upstream repository from above afterwards.

1. Clone Github project and Import Maven Projects to IDE
    * Check out from Version Control -> GitHub -> Enter your GitHub Login Info 
    * https://github.com/{username}/phoenix.git -> Check out from Versin Control | Yes
1. Generate Parser and Lexer Files
    * Maven Projects -> Phoenix Core -> Lifecycle -> compile
1. Compile Project
    * Build -> Make Project
1. Make sure you are setup to develop now.
    * Open IndexUtilTest.Java -> Run -> Run IndexUtilTest

<a id='intellijLocalSetup'></a>
#### If you already have a local git repository setup
1. Import Projects
    * Import Project
    * Select Directory of your local repository -> Next
    * Import project from external model -> Maven -> Next
    * Select 'Import Maven project automatically'
    * Select 'Create IntelliJ IDEA modules for aggregator projects'
    * Select 'Keep source and test folders on reimport'
    * Select 'Exclude build directory'
    * Select 'Use Maven output directories' -> Next
    * Select maven-3  -> Next
    * Next a whole bunch
1. Generate Parser and Lexer Files
    * Maven Projects -> Phoenix Core -> Lifecycle -> compile
1. Compile Project
    * Build -> Make Project
1. Make sure you are setup to develop now.
    * Open IndexUtilTest.Java -> Run -> Run IndexUtilTest

<a id='intellijPrefs'></a>
### Get Settings and Preferences Correct
1. Import Settings from eclipse profile
    * File -> Settings -> Editor -> Code Style -> Java
    * Set From... -> Import... -> Eclipse XML Profile -> {repository}/dev/PhoenixCodeTemplate.xml

<a id='intellijJira'></a>
### Connecting to Jira
1. Create Connection to Apache Jira
    * Tools -> Tasks and Contexts -> Configure Servers -> + -> Jira -> 
    * Server Url: 'https://issues.apache.org/jira' 
    * Query: 'project=Phoenix and ...'
1. Switch Easily between Tasks 
    * Tools-> Tasks and Contexts -> Open Task->PHOENIX-#### 
    * Select Create branch PHOENIX-#### from master->OK

<a id='intellijCommit'></a>
### Commit
1. Commit Changes and Push to Github with appropriate Message
    * VCS -> Commit -> Set Commit message to include jira number PHOENIX-####
    * Commit and Push

<a id='contribute'></a>
## Contributing finished work

<a id='pullRequest'></a>
### Create pull request 
1. Review the [How to Contribute](contributing.html) documentation.
1. Navigate to branch - https://github.com/{username}/phoenix/tree/{branchname}
1. Click Pull Request 
1. Confirm that you see  apache:master  ...  {username}:{branchname}
1. Make sure Title of pull request has the jira name at beginning PHOENIX-{####}
1. Click create pull request

