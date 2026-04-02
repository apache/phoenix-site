import{j as i}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as h}from"./pho-BiacCdLr.js";let t=`

<img alt="PHO logo" src={__img0} placeholder="blur" />

PHO is an Object Relational Mapping (ORM) library for building and executing queries on HBase using Apache Phoenix.
It provides ORM-style mappings and DSL-style query building. Initially developed and open sourced by eHarmony, it is available on [GitHub](https://github.com/eHarmony/pho).

Its interfaces and generic annotations make it possible to switch data store APIs in the future without changing query definitions.
Currently, it supports HBase integration through Apache Phoenix, and can be extended with other implementations.

## Entity Class

Suppose we have the following \`TestClass\` we want to query in our data store:

\`\`\`java
// class must be annotated with Entity
import com.google.code.morphia.annotations.Embedded;
import com.google.code.morphia.annotations.Entity;

@Entity(value = "user_matches")
public class MatchDataFeedItemDto {
    @Embedded
    private MatchCommunicationElement communication;
    @Embedded
    private MatchElement match;
    @Embedded
    private MatchProfileElement matchedUser;
}

public class MatchElement {
    // row key
    @Property(value = "UID")
    private long userId;
    @Property(value = "MID")
    private long matchId;
    @Property(value = "DLVRYDT")
    private Date deliveredDate;
    @Property(value = "STATUS")
    private int status;
}
\`\`\`

## Query Building

Query building can be done in DSL style. More advanced query building is under development, but for now we will use a combination of \`QueryBuilder\` and static, Hibernate-style \`Restrictions\` methods to construct queries.

### Simple queries

Construct a query to find all user matches delivered in the past two days and not in a closed state.

\`\`\`java
import com.eharmony.datastore.api.DataStoreApi;
import com.eharmony.datastore.model.MatchDataFeedItemDto;
import com.eharmony.datastore.query.QuerySelect;
import com.eharmony.datastore.query.builder.QueryBuilder;
import com.eharmony.datastore.query.criterion.Restrictions;

@Repository
public class MatchStoreQueryRepositoryImpl implements MatchStoreQueryRepository {
    final QuerySelect<MatchDataFeedItemDto, MatchDataFeedItemDto> query = QueryBuilder
        .builderFor(MatchDataFeedItemDto.class)
        .select()
        .add(Restrictions.eq("userId", userId))
        .add(Restrictions.eq("status", 2))
        .add(Restrictions.gt("deliveredDate", timeThreshold.getTime()))
        .build();

    Iterable<MatchDataFeedItemDto> feedItems = dataStoreApi.findAll(query);
}
\`\`\`

### Compound queries

Construct a more complex query where we find items older than one day, include multiple status values, order by \`deliveryDate\`, and limit result size to 10.

\`\`\`java
// provided
List<Integer> statusFilters = request.getMatchStatusFilters();
String sortBy = request.getSortBy();
Disjunction disjunction = new Disjunction();

for (Integer statusFilter : statusFilters) {
    disjunction.add(Restrictions.eq("status", statusFilter));
}

final QuerySelect<MatchDataFeedItemDto, MatchDataFeedItemDto> query = QueryBuilder
    .builderFor(MatchDataFeedItemDto.class)
    .select()
    .add(Restrictions.eq("userId", userId))
    .add(Restrictions.gt("deliveredDate", timeThreshold.getTime()))
    .add(disjunction)
    .addOrder(new Ordering(sortBy, Order.DESCENDING))
    .build();

Iterable<MatchDataFeedItemDto> feedItems = dataStoreApi.findAll(query);
\`\`\`

By default, expressions are combined with \`AND\` when added separately.

### Query Interface

The following query components are supported:

\`\`\`java
// equals
EqualityExpression eq(String propertyName, Object value);

// does not equal
EqualityExpression ne(String propertyName, Object value);

// less than
EqualityExpression lt(String propertyName, Object value);

// less than or equal
EqualityExpression lte(String propertyName, Object value);

// greater than
EqualityExpression gt(String propertyName, Object value);

// greater than or equal
EqualityExpression gte(String propertyName, Object value);

// between from and to (inclusive)
RangeExpression between(String propertyName, Object from, Object to);

// and - takes a variable list of expressions as arguments
Conjunction and(Criterion... criteria);

// or - takes a variable list of expressions as arguments
Disjunction or(Criterion... criteria);

\`\`\`

### Resolving Entity and Property Names

Always use the property names of your Java objects in your queries.
If these names differ from those used in your datastore, use annotations to provide mappings.
Entity resolvers are configured to map entity classes to table or collection names.
Property resolvers are configured to map object variable names to column or field names.

The following annotations are currently supported for the indicated data store type.
Custom \`EntityResolvers\` and \`PropertyResolvers\` are straightforward to configure and create.

See [Morphia annotations](https://code.google.com/p/morphia/wiki/AllAnnotations) for entity class annotation mappings.

## Query Execution

The QueryExecutor interface supports the following operations:

\`\`\`java
// return an iterable of type R from the query against type T
// (R and T are often the same type)
<T, R> Iterable<R> findAll(QuerySelect<T, R> query);

// return one R from the query against type T
<T, R> R findOne(QuerySelect<T, R> query);

// save the entity of type T to the data store
<T> T save(T entity);

// save all entities in the provided iterable to the data store
<T> Iterable<T> save(Iterable<T> entities);

// save entities in batches with a configured batch size
<T> int[] saveBatch(Iterable<T> entities);
\`\`\`

## Configuration

Here are some example Spring configuration files for HBase using Apache Phoenix.

### HBase

Configuration properties:

\`\`\`properties
hbase.connection.url=jdbc:phoenix:zkhost:2181
\`\`\`

\`\`\`xml
<util:list id="entityPropertiesMappings">
    <value>com.eharmony.datastore.model.MatchDataFeedItemDto</value>
</util:list>

<bean id="entityPropertiesMappingContext" class="com.eharmony.pho.mapper.EntityPropertiesMappingContext">
    <constructor-arg ref="entityPropertiesMappings"/>
</bean>

<bean id="entityPropertiesResolver" class="com.eharmony.pho.mapper.EntityPropertiesResolver">
    <constructor-arg ref="entityPropertiesMappingContext"/>
</bean>

<bean id="phoenixHBaseQueryTranslator" class="com.eharmony.pho.hbase.translator.PhoenixHBaseQueryTranslator">
    <constructor-arg name="propertyResolver" ref="entityPropertiesResolver" />
</bean>

<bean id="phoenixProjectedResultMapper" class="com.eharmony.pho.hbase.mapper.PhoenixProjectedResultMapper">
    <constructor-arg name="entityPropertiesResolver" ref="entityPropertiesResolver" />
</bean>

<bean id="phoenixHBaseQueryExecutor" class="com.eharmony.pho.hbase.query.PhoenixHBaseQueryExecutor">
    <constructor-arg name="queryTranslator" ref="phoenixHBaseQueryTranslator"/>
    <constructor-arg name="resultMapper" ref="phoenixProjectedResultMapper" />
</bean>

<bean id="dataStoreApi" class="com.eharmony.pho.hbase.PhoenixHBaseDataStoreApiImpl">
    <constructor-arg name="connectionUrl" value="\${hbase.connection.url}"/>
    <constructor-arg name="queryExecutor" ref="phoenixHBaseQueryExecutor"/>
</bean>
\`\`\`
`,r={title:"Phoenix ORM library",description:"Guide to PHO (Phoenix-HBase ORM) for entity mapping, query building, execution, and configuration."},d=[{href:"https://github.com/eHarmony/pho"},{href:"https://code.google.com/p/morphia/wiki/AllAnnotations"}],k={contents:[{heading:void 0,content:`PHO is an Object Relational Mapping (ORM) library for building and executing queries on HBase using Apache Phoenix.
It provides ORM-style mappings and DSL-style query building. Initially developed and open sourced by eHarmony, it is available on GitHub.`},{heading:void 0,content:`Its interfaces and generic annotations make it possible to switch data store APIs in the future without changing query definitions.
Currently, it supports HBase integration through Apache Phoenix, and can be extended with other implementations.`},{heading:"entity-class",content:"Suppose we have the following TestClass we want to query in our data store:"},{heading:"query-building",content:"Query building can be done in DSL style. More advanced query building is under development, but for now we will use a combination of QueryBuilder and static, Hibernate-style Restrictions methods to construct queries."},{heading:"simple-queries",content:"Construct a query to find all user matches delivered in the past two days and not in a closed state."},{heading:"compound-queries",content:"Construct a more complex query where we find items older than one day, include multiple status values, order by deliveryDate, and limit result size to 10."},{heading:"compound-queries",content:"By default, expressions are combined with AND when added separately."},{heading:"query-interface",content:"The following query components are supported:"},{heading:"resolving-entity-and-property-names",content:`Always use the property names of your Java objects in your queries.
If these names differ from those used in your datastore, use annotations to provide mappings.
Entity resolvers are configured to map entity classes to table or collection names.
Property resolvers are configured to map object variable names to column or field names.`},{heading:"resolving-entity-and-property-names",content:`The following annotations are currently supported for the indicated data store type.
Custom EntityResolvers and PropertyResolvers are straightforward to configure and create.`},{heading:"resolving-entity-and-property-names",content:"See Morphia annotations for entity class annotation mappings."},{heading:"query-execution",content:"The QueryExecutor interface supports the following operations:"},{heading:"phoenix-orm-library-configuration",content:"Here are some example Spring configuration files for HBase using Apache Phoenix."},{heading:"hbase",content:"Configuration properties:"}],headings:[{id:"entity-class",content:"Entity Class"},{id:"query-building",content:"Query Building"},{id:"simple-queries",content:"Simple queries"},{id:"compound-queries",content:"Compound queries"},{id:"query-interface",content:"Query Interface"},{id:"resolving-entity-and-property-names",content:"Resolving Entity and Property Names"},{id:"query-execution",content:"Query Execution"},{id:"phoenix-orm-library-configuration",content:"Configuration"},{id:"hbase",content:"HBase"}]};const c=[{depth:2,url:"#entity-class",title:i.jsx(i.Fragment,{children:"Entity Class"})},{depth:2,url:"#query-building",title:i.jsx(i.Fragment,{children:"Query Building"})},{depth:3,url:"#simple-queries",title:i.jsx(i.Fragment,{children:"Simple queries"})},{depth:3,url:"#compound-queries",title:i.jsx(i.Fragment,{children:"Compound queries"})},{depth:3,url:"#query-interface",title:i.jsx(i.Fragment,{children:"Query Interface"})},{depth:3,url:"#resolving-entity-and-property-names",title:i.jsx(i.Fragment,{children:"Resolving Entity and Property Names"})},{depth:2,url:"#query-execution",title:i.jsx(i.Fragment,{children:"Query Execution"})},{depth:2,url:"#phoenix-orm-library-configuration",title:i.jsx(i.Fragment,{children:"Configuration"})},{depth:3,url:"#hbase",title:i.jsx(i.Fragment,{children:"HBase"})}];function n(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",img:"img",p:"p",pre:"pre",span:"span",...e.components};return i.jsxs(i.Fragment,{children:[i.jsx(s.p,{children:i.jsx(s.img,{alt:"PHO logo",src:h,placeholder:"blur"})}),`
`,i.jsxs(s.p,{children:[`PHO is an Object Relational Mapping (ORM) library for building and executing queries on HBase using Apache Phoenix.
It provides ORM-style mappings and DSL-style query building. Initially developed and open sourced by eHarmony, it is available on `,i.jsx(s.a,{href:"https://github.com/eHarmony/pho",children:"GitHub"}),"."]}),`
`,i.jsx(s.p,{children:`Its interfaces and generic annotations make it possible to switch data store APIs in the future without changing query definitions.
Currently, it supports HBase integration through Apache Phoenix, and can be extended with other implementations.`}),`
`,i.jsx(s.h2,{id:"entity-class",children:"Entity Class"}),`
`,i.jsxs(s.p,{children:["Suppose we have the following ",i.jsx(s.code,{children:"TestClass"})," we want to query in our data store:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// class must be annotated with Entity"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.google.code.morphia.annotations.Embedded;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.google.code.morphia.annotations.Entity;"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"@"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Entity"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "user_matches"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Embedded"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" MatchCommunicationElement communication;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Embedded"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" MatchElement match;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Embedded"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" MatchProfileElement matchedUser;"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MatchElement"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // row key"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Property"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "UID"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" long"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" userId;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Property"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "MID"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" long"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" matchId;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Property"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "DLVRYDT"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Date deliveredDate;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    @"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Property"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "STATUS"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    private"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" status;"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(s.h2,{id:"query-building",children:"Query Building"}),`
`,i.jsxs(s.p,{children:["Query building can be done in DSL style. More advanced query building is under development, but for now we will use a combination of ",i.jsx(s.code,{children:"QueryBuilder"})," and static, Hibernate-style ",i.jsx(s.code,{children:"Restrictions"})," methods to construct queries."]}),`
`,i.jsx(s.h3,{id:"simple-queries",children:"Simple queries"}),`
`,i.jsx(s.p,{children:"Construct a query to find all user matches delivered in the past two days and not in a closed state."}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.eharmony.datastore.api.DataStoreApi;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.eharmony.datastore.model.MatchDataFeedItemDto;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.eharmony.datastore.query.QuerySelect;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.eharmony.datastore.query.builder.QueryBuilder;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.eharmony.datastore.query.criterion.Restrictions;"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"@"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Repository"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MatchStoreQueryRepositoryImpl"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" implements"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MatchStoreQueryRepository"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    final"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" QuerySelect<"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> query "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" QueryBuilder"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"builderFor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MatchDataFeedItemDto.class)"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"select"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"eq"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"userId"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", userId))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"eq"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"status"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gt"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"deliveredDate"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", timeThreshold."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTime"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"build"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Iterable<"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> feedItems "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" dataStoreApi."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"findAll"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(query);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(s.h3,{id:"compound-queries",children:"Compound queries"}),`
`,i.jsxs(s.p,{children:["Construct a more complex query where we find items older than one day, include multiple status values, order by ",i.jsx(s.code,{children:"deliveryDate"}),", and limit result size to 10."]}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// provided"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"List<"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"Integer"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> statusFilters "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" request."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getMatchStatusFilters"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"String sortBy "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" request."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getSortBy"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Disjunction disjunction "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Disjunction"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Integer statusFilter "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" statusFilters) {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    disjunction."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"eq"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"status"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", statusFilter));"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"final"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" QuerySelect<"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> query "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" QueryBuilder"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"builderFor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(MatchDataFeedItemDto.class)"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"select"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"eq"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"userId"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", userId))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Restrictions."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gt"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"deliveredDate"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", timeThreshold."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTime"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(disjunction)"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addOrder"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Ordering"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sortBy, Order.DESCENDING))"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"build"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Iterable<"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"MatchDataFeedItemDto"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> feedItems "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" dataStoreApi."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"findAll"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(query);"})]})]})})}),`
`,i.jsxs(s.p,{children:["By default, expressions are combined with ",i.jsx(s.code,{children:"AND"})," when added separately."]}),`
`,i.jsx(s.h3,{id:"query-interface",children:"Query Interface"}),`
`,i.jsx(s.p,{children:"The following query components are supported:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// equals"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"eq"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// does not equal"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ne"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// less than"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lt"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// less than or equal"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lte"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// greater than"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gt"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// greater than or equal"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"EqualityExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"gte"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object value);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// between from and to (inclusive)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"RangeExpression "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"between"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String propertyName, Object from, Object to);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// and - takes a variable list of expressions as arguments"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Conjunction "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"and"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Criterion... criteria);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// or - takes a variable list of expressions as arguments"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Disjunction "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"or"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Criterion... criteria);"})]})]})})}),`
`,i.jsx(s.h3,{id:"resolving-entity-and-property-names",children:"Resolving Entity and Property Names"}),`
`,i.jsx(s.p,{children:`Always use the property names of your Java objects in your queries.
If these names differ from those used in your datastore, use annotations to provide mappings.
Entity resolvers are configured to map entity classes to table or collection names.
Property resolvers are configured to map object variable names to column or field names.`}),`
`,i.jsxs(s.p,{children:[`The following annotations are currently supported for the indicated data store type.
Custom `,i.jsx(s.code,{children:"EntityResolvers"})," and ",i.jsx(s.code,{children:"PropertyResolvers"})," are straightforward to configure and create."]}),`
`,i.jsxs(s.p,{children:["See ",i.jsx(s.a,{href:"https://code.google.com/p/morphia/wiki/AllAnnotations",children:"Morphia annotations"})," for entity class annotation mappings."]}),`
`,i.jsx(s.h2,{id:"query-execution",children:"Query Execution"}),`
`,i.jsx(s.p,{children:"The QueryExecutor interface supports the following operations:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// return an iterable of type R from the query against type T"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// (R and T are often the same type)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T, R"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Iterable"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"R"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" findAll"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(QuerySelect"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T, R"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" query);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// return one R from the query against type T"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T, R"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" R "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"findOne"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(QuerySelect"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T, R"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" query);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// save the entity of type T to the data store"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" T "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(T entity);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// save all entities in the provided iterable to the data store"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Iterable"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" save"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Iterable"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entities);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// save entities in batches with a configured batch size"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" int"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"saveBatch"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Iterable"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"T"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entities);"})]})]})})}),`
`,i.jsx(s.h2,{id:"phoenix-orm-library-configuration",children:"Configuration"}),`
`,i.jsx(s.p,{children:"Here are some example Spring configuration files for HBase using Apache Phoenix."}),`
`,i.jsx(s.h3,{id:"hbase",children:"HBase"}),`
`,i.jsx(s.p,{children:"Configuration properties:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(s.code,{children:i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"hbase.connection.url"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"=jdbc:phoenix:zkhost:2181"})]})})})}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"util:list"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesMappings"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">com.eharmony.datastore.model.MatchDataFeedItemDto</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"util:list"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesMappingContext"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.mapper.EntityPropertiesMappingContext"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesMappings"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.mapper.EntityPropertiesResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesMappingContext"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixHBaseQueryTranslator"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.hbase.translator.PhoenixHBaseQueryTranslator"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"propertyResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" />"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixProjectedResultMapper"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.hbase.mapper.PhoenixProjectedResultMapper"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"entityPropertiesResolver"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" />"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixHBaseQueryExecutor"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.hbase.query.PhoenixHBaseQueryExecutor"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"queryTranslator"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixHBaseQueryTranslator"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"resultMapper"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixProjectedResultMapper"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" />"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" id"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"dataStoreApi"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"com.eharmony.pho.hbase.PhoenixHBaseDataStoreApiImpl"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"connectionUrl"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" value"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"${hbase.connection.url}"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    <"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"constructor-arg"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" name"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"queryExecutor"'}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ref"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"phoenixHBaseQueryExecutor"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"/>"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"bean"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})})]})}function p(e={}){const{wrapper:s}=e.components||{};return s?i.jsx(s,{...e,children:i.jsx(n,{...e})}):n(e)}export{t as _markdown,p as default,d as extractedReferences,r as frontmatter,k as structuredData,c as toc};
