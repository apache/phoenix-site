# Who is using Apache Phoenix?

![Salesforce logo](/images/using/sf.png)

In our Force.com platform, we rely on Apache Phoenix to run interactive queries against big data residing in HBase leveraging

- multi-tenant tables for customization and scale out across our diverse customer schemas
- aggregation to build roll-up summaries
- secondary indexes to improve performance

> "Apache Phoenix is the foundation of our big data stack, allowing us to run interactive queries against HBase data in a performant manner."

Steven Tamm, CTO

---

![Bloomberg logo](/images/using/bb.jpeg)

At Bloomberg, patterns of access to financial datasets are diverse and complex. HBase provides the scalability and strong consistency that our use cases demand. However, we need more than a key-value store. We need ANSI SQL to reduce the barriers to adoption, we need features such as secondary indices to support lookups along multiple axes and cursors to handle UI pagination. Apache Phoenix provides a rich set of capabilities above HBase that makes it a critical piece of our data platform.

Saurabh Agarwal, Bloomberg Data Platform

---

![eHarmony logo](/images/using/eharmony.png)

At eHarmony, Apache Phoenix serves as an SQL abstraction for the HBase storage where we maintain details about potential relationship matches identified for our users. We store presentation-ready user match feeds in HBase, and serve the data to one of the most visited pages on [eharmony.com](http://www.eharmony.com). Apache Phoenix helped us to build a query abstraction layer that eased our development process, enabling us to to apply various filters and sorting on the aggregated data in the HBase store.

> "The integration with Apache Phoenix has not only stabilized our system, but also reduced response time for loading hundreds of matches on a page to below 200ms."

Vijay Vangapandu, Principal Software Engineer

---

![Hortonworks logo](/images/using/hw.png)

Hortonworks supports Apache Phoenix as a feature rich ANSI SQL interface for Apache HBase in Hortonworks Data Platform (HDP). It plays a critical role for our customers who want diverse choice for data access in Hadoop and want a simple interface to build low-latency, large scale applications. Critical features, such as secondary indexing have made Phoenix the API of choice for building these HBase applications.

Devaraj Das, Cofounder

---

![CertusNet logo](/images/using/cn.png)

At CertusNet we utilize HBase for Gigabytes level data storage and processing per five minutes. We found Phoenix most appropriate for easy-to-use sql layer and JDBC query support, even more highlighting secondary-indexes support, cause we are expecting both query performance and data manipulation load balancing for our HBase processing architecture.

> "For us, the most valuable feature are index support and query convenience for our HBase data processing."

Fulin Sun, Software Enginneer

---

![TEOCO logo](/images/using/teoco.png)

TEOCO is a leading provider of assurance and analytics solutions to communications service providers worldwide.
At Teoco we use Phoenix to provide fast access to customers activity records. The system is required to manage tens of billions of records per day.

Phoenix allows us easy and rapid development using it's SQL interface while maintaining HBase performance and throughput. It's saves the need to handle and manage lower level operations, and allows clean and maintainable code.

Cahana Ori, Director of Research and Development

---

![Interset logo](/images/using/interset.png)

Interset lives at the intersection of analytics and cybersecurity, providing a cyberattack threat detection solution that uses behavioral analytics, machine learning and big data to protect critical data.

Phoenix allows us to perform the dynamic and ad-hoc queries to build machine learning models that represent normal activity, in order to detect abnormal, anomalous and risky behaviors. With behavioral models and input features that vary across datasets, the expressiveness of Phoenix's SQL interface becomes a critical, enabling and accelerative technology that allows us to build threat detection models to keep up with customer and market demand.

Stephan Jou, CTO

---

![PubMatic logo](/images/using/pubmatic.png)

PubMatic utilizes Phoenix to improve the data analytics capabilities it provides to a global roster of leading brands and over 40 of the comScore top 100 publishers.

- Utilizing a combination of Phoenix and Hbase in an enterprise data warehouse appliance with all the tenets of MPP architecture
- Doing analytics on almost 140 Billion records (15+ TB of data) with near real time SLAs
- The analytics platform is able to serve 100K+ queries per day and can scale linearly as well as horizontally with the growth of the company
- With deep analytics, the company can make more intelligent decisions, and analyze performance and alignment with business objectives

Sudhir Kulkarni, VP of Data and Analytics

---

![Delta Projects logo](/images/using/dp.png)

At Delta Projects we use Phoenix for storing data as a basis for measuring activities and generating reports. We chose Phoenix because it provides the scalability of HBase and the expressiveness of SQL.

Kristoffer Sjögren, System Developer

---

![Sogou logo](/images/using/sogou.png)

We adopted Apache Phoenix since 2015, mainly for two scenarios:

1.  Business Intelligence: We use HBase+Phoenix to store billion records of our Ad Exchange, thanks to the SQL abstraction and secondary indexes of Phoenix, we can provide multidimensional statistical and analytical reports to our advertisers, empowering them with thorough insight to make the intelligent decisions maximizing their investment revenue.
2.  Technology Infrastructure： Our Monitoring Platform and Distributed Service Tracing Platform uses HBase+Phoenix to continuously collect various metrics and logs(about 100k records per second at present) ,and with the high performance of Phoenix we can easily generate statistics for our system operation health measurement and service dependency analysis.

Cheng Lei, Infrastructure Software Engineer

---

![HomeAway logo](/images/using/homeaway.png)

Apache Phoenix enables easy integration with HBase for systems that rely on JDBC/SQL. HomeAway, the world leader in Vacation Rentals, leverages Phoenix as a SQL abstraction for HBase's powerful columnar storage to generate statistics for vacation rental owners on HomeAway's Owner Dashboard. These statistics help HomeAway vacation rental owners gain key insights about the performance of their vacation rental, how well it is doing against 'the market', and how well it is doing historically.

From a pool of billions of records that go back 2 years, HomeAway is able to serve up customer-facing webpages from HBase, using Phoenix, in less than a second for the majority of our vacation rental owners. With Phoenix and HBase, HomeAway is able to share the same insight it has internally on the vacation rental market to its owners empowering them with the necessary data to make the right decisions maximizing their return on their vacation rental investment.

René X. Parra, Principal Architect

---

![Sift Science logo](/images/using/ss.png)

At Sift Science we use Phoenix to power our OLAP infrastructure. This influences our machine learning feature engineering which is critical in the model training pipeline. Having a simple SQL-based interface also allows us to expose data insights outside of the engineering organization. Finally, running Phoenix on top of our existing HBase infrastructure gives us the ability to scale our ad-hoc query needs.

Andrey Gusev, Tech Lead, Machine Learning Infrastructure

---

![Alibaba logo](/images/using/ab.png)

At Alibaba there're two main scenarios of using Phoenix:

1.  Large dataset with relatively small result set, say 10 thousands of records or so. We choose to use Phoenix in this kind of scenario because it's much more easier for user to use than HBase native api, meantime it supports orderby/groupby syntax
2.  Large dataset with large result set, it might be millions of records in the result set even after PrimaryKey filter, and often along with lots of aggregation/orderby/groupby invocation. We choose to use Pheonix in this kind of scenario because Pheonix makes it possible to do complicated query in HBase, and it supports more and more features in traditional DB like oracle, which makes it much more easier for our user to migrate there BI query onto HBase

Jaywong, Software Engineer

---

![ebay logo](/images/using/ebay.png)

We have been exploring Phoenix since July, 2014 and have successfully achieved couple of analytics use cases with huge data set. We were able to achieve read/write performance in ms even slicing and dicing data in many dimensions.

1.  Path or Flow analysis
    This use case was very specific and targeted for core mobile native apps where we were trying to find user behavior with many dimension App, Version, device , OS version, carrier etc. This was offline process where we process and aggregate daily data and load once in phoenix schema.
2.  Real Time analytics data trend.
    This is near real time aggregation of tracking data to find trend of events with multi-dimensional. It does write aggregated data to hBase + Phoenix continuously (at present 12k-15k/s records) and read for report generation at the same time.

Jogendar Singh, Engineering Manager, Mobile Platform

---

![NGDATA logo](/images/using/ng.png)

Apache Phoenix allows users of our customer analytics platform Lily to easily ingest and manage customer fact data. Our users don't have to learn complex or specific APIs for this, but can tap into a familiar competence: SQL. NGDATA is happy to both use and contribute to the Apache Phoenix project, which proves to be a solid choice backed by a great community on a day-to-day basis.

Steven Noels, CTO

---

![Pacific Northwest logo](/images/using/pn.png)

Apache Phoenix has helped us load and query hundreds of billions of records. The salting and secondary indexes have saved considerable development time and the SQL interface has been an easy entry point for developers.

Ralph Perko, Software Architect/Developer

---

![Socialbakers logo](/images/using/sb.png)

At Socialbakers we use Phoenix for on demand data aggregations. Because of the floating time range of our custom reports we aggregate hundreds of megabytes per request on the server side. Phoenix can handle those requests with low latency and high throughput. It also provides an easy to use SQL interface and helps us build scalable and highly available applications quickly and reliably.

> "For us, the most valuable feature is the out of the box server side aggregations."

Martin Homolka, CTO
