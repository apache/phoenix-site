#Tech Talks
The monthly tech talks is to bring the Phoenix community together to have technical discussions, share knowledge, and initiate further collaborations, innovations and improvements.   

The topics can be any technical subject related to Phoenix, including its internals, interfaces, operational aspects, and use cases, and technologies that it leverages, and can possibly leverage or adapt.


**When:** First Thursday of each month at 9AM PST  
**Duration:** 90 minutes (to allow the audience to participate and ask questions)    
**Meeting Link:** To attend the meetings, please use the video conference link to be provided here  
**Suggest Topics:** To suggest a topic to present in an upcoming meeting, please [send an email to the user and dev list](mailto:user@phoenix.apache.org,dev@phoenix.apache.org) 

## Upcoming Tech Talks
| Title |  Presenters | Abstract | When |
|-------|-------------|----------|------|
|TDB|||9AM PST July 01, 2021|

## Previous Tech Talks
| Title |  Presenters | Abstract | Resources | Recording | When |
|-------|-------------|----------|-----------|-----------|------|
|Atomic Upserts in Phoenix|Tanuj Khurana|Atomic upserts are supported for tables without global indexes. The current design of atomic upserts cannot be expanded to support tables with global indexes since doing index table updates results in cluster wide deadlocks. This talk covers how atomic upserts can be used, details around how it is implemented today, its limitations and how we can leverage the new global secondary indexing design to support atomic upserts on tables with global indexes.|[Slides](https://drive.google.com/file/d/1K_S0sVzBbDiENE80DQWNwO96h-7bM_cd/view?usp=sharing)|[Recording](https://drive.google.com/file/d/1SypY1Tg6BanQO1HlOnAukcqjCnK5hyFK/view?usp=sharing)|May 06, 2021|
|Phoenix Query Server, PhoenixDB, and Hue|Josh Elser, Istvan Toth, and Romain Rigaux|PhoenixDB is a new project which is a Python library for interacting with Phoenix with Phoenix Query Server (PQS). Hue is an open source SQL assistant for databases and data warehouses. In this talk, we give an overview of PQS, and recently completed and planned improvements for it, and introduce the PhoenixDB project. Then, we present Hue, and touch on the integration of PhoenixDB into Hue. Finally, we present a live demo of using PhoenixDB within Hue.|[PQS and PhoenixDB Slides](https://drive.google.com/file/d/1CeCEhJ_2vJZSLOAojHzBnsB9QX8Nvwmm/view?usp=sharing) - [Hue Slides](https://drive.google.com/file/d/1-3OwisGp1D5za2ukFW7DukrQkF3AJg9O/view?usp=sharing)|[Recording](https://drive.google.com/file/d/1Q19B28NwyaU36tdo7Q1a5djTJghFtv2j/view?usp=sharing)|April 01, 2021|
|Strongly Consistent Global Secondary Indexes|Kadir Ozdemir|Global secondary indexing, which enables efficient queries on non-primary key fields, is central to many use cases. Phoenix implements global secondary indexing by pairing a data table (the table that holds the entire user data) with physically separate (index) tables that are indexed on a different set of columns. Some use cases demand strong consistency between the data table and its indexes, meaning that regardless of whether a given query is served from a data table or an index table, the same result is returned. This talk presents the secondary indexing design to meet this strong consistency requirement.|[Slides](https://drive.google.com/file/d/1tToEJEXA47RIe_NGVHTXyYEIai0U94VQ/view?usp=sharing)|[Recording](https://drive.google.com/file/d/1y-bwkvZOG9hS-wTn50YklaNcfSljlJNH/view?usp=sharing)| March 04, 2021 | 

