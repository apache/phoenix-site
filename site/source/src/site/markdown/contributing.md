# Contributing to Apache Phoenix

## General process

The general process for contributing code to Phoenix works as follows:

1. Discuss your changes on the dev mailing list
2. Create a JIRA issue unless there already is one
3. Setup your development environment
4. Prepare a patch containing your changes
5. Submit the patch

These steps are explained in greater detail below.

### Discuss on the mailing list

It's often best to discuss a change on the public mailing lists before creating and submitting a patch.

If you're unsure whether certain behavior in Phoenix is a bug, please send a mail to the [user mailing list](mailing_list.html) to check.

If you're considering adding major new functionality to Phoenix, it's a good idea to first discuss the idea on the [developer mailing list](mailing_list.html) to make sure that your plans are in line with others in the Phoenix community.

### Log a JIRA ticket

The first step is to create a ticket on the [Phoenix JIRA](http://issues.apache.org/jira/browse/PHOENIX). 

### Setup development environment

To setup your development, see [these](develop.html) directions.

### Generate a patch

There are two general approaches that can be used for creating and submitting a patch: GitHub pull requests, or manually creating a patch with Git. Both of these are explained below.

Regardless of which approach is taken, please make sure to follow the Phoenix code conventions (more information below). Whenever possible, unit tests or integration tests should be included with patches.

The commit message should reference the jira ticket issue (which has the format
`PHOENIX-{NUMBER}`).


#### GitHub workflow

1. Create a pull request in GitHub for the [mirror of the Phoenix Git repository](https://github.com/apache/phoenix). 
2. Add a comment in the Jira issue with a link to the pull request. This makes it clear that the patch is ready for review.

#### Local Git workflow

1. Create a local branch `git checkout -b <branch name>`
2. Make and commit changes
3. Generate a patch based on the name of the JIRA issue, as follows:

    `git format-patch --stdout HEAD^ > PHOENIX-{NUMBER}.patch`

4. Attach the created patch file to the jira ticket

## Code conventions

The Phoenix code conventions are similar to the [Sun/Oracle Java Code Convention](http://www.oracle.com/technetwork/java/index-135089.html). We use 4 spaces (no tabs) for indentation, and limit lines to 100 characters.

Eclipse code formatting settings and import order settings (which can also be imported into Intellij IDEA) are available in the dev directory of the Phoenix codebase.

All new source files should include the Apache license header.


# Committer workflow

In general, the "rebase" workflow should be used with the Phoenix codebase  (see [this blog post](http://randyfay.com/content/rebase-workflow-git) for more information on the difference between the "merge" and "rebase" workflows in Git).

A patch file can be downloaded from a GitHub pull request by adding ".patch" to the end of the pull request url, e.g. https://github.com/apache/phoenix/pull/35.patch

When applying a patch contributed from a user, please use the "git am" command if a fully-formatted patch file is available, as this preserves the contributor's contact information. Otherwise, the contributor's name should be added to the commit message.

If a single ticket consists of a patch with multiple commits, the commits can be squashed into a single commit using `git rebase`.
