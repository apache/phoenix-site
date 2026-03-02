//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { FeatureCard } from "@/pages/_landing/home/feature-card";

export function FeaturesSection() {
  const features = [
    {
      title: "Standard SQL & JDBC",
      desc: "Use familiar SQL queries and JDBC APIs with full ACID transaction capabilities."
    },
    {
      title: "Millisecond Performance",
      desc: "Low latency performance for small queries or seconds for tens of millions of rows."
    },
    {
      title: "Schema Flexibility",
      desc: "Schema-on-read flexibility from the NoSQL world leveraging HBase as backing store."
    },
    {
      title: "Hadoop Ecosystem",
      desc: "Fully integrated with Spark, Hive, Pig, Flume, and Map Reduce."
    }
  ];
  return (
    <section id="features" className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Why Phoenix
        </h2>
        <p className="text-muted-foreground mt-2">
          The trusted data platform for OLTP and operational analytics on
          Hadoop.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <FeatureCard key={f.title} title={f.title}>
            {f.desc}
          </FeatureCard>
        ))}
      </div>
    </section>
  );
}
