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

import {
  ChartNoAxesCombined,
  Database,
  Layers,
  ScrollText,
  Search,
  Users
} from "lucide-react";

export function UseCasesSection() {
  const items = [
    {
      title: "Operational Analytics",
      desc: "Real-time SQL queries on operational data with ACID guarantees for business insights.",
      Icon: ChartNoAxesCombined
    },
    {
      title: "Low Latency OLTP",
      desc: "Transactional workloads with millisecond response times and full ACID support.",
      Icon: Database
    },
    {
      title: "Multi-tenant Applications",
      desc: "Build SaaS applications with tenant isolation using views and dynamic columns.",
      Icon: Users
    },
    {
      title: "Secondary Indexing",
      desc: "Fast lookups on non-primary key columns with automatic index maintenance.",
      Icon: Search
    },
    {
      title: "Time-Series Data",
      desc: "SQL queries over time-series data with efficient storage and retrieval patterns.",
      Icon: ScrollText
    },
    {
      title: "Data Integration",
      desc: "ETL pipelines with Spark, Hive, and Map Reduce for comprehensive data workflows.",
      Icon: Layers
    }
  ];
  return (
    <section id="use-cases" className="border-border/60 bg-muted/30 border-t">
      <div className="container mx-auto px-4 pt-12 pb-6 md:pt-16 md:pb-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Use Cases
          </h2>
          <p className="text-muted-foreground mt-2">
            Proven patterns where Phoenix delivers value.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="group border-border/60 bg-card rounded-xl border p-5 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <Icon
                  className="text-primary mt-0.5 size-[26px] shrink-0"
                  aria-hidden
                />
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
