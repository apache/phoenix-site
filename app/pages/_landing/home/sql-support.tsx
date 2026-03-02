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

import { Code2, Database, Zap } from "lucide-react";

export function SqlSupportSection() {
  const highlights = [
    {
      icon: Database,
      title: "Complete SQL Support",
      description:
        "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, and more. Full DML and DDL support."
    },
    {
      icon: Zap,
      title: "Optimized Execution",
      description:
        "Queries compiled into HBase scans with coprocessors and custom filters for millisecond performance."
    },
    {
      icon: Code2,
      title: "JDBC Connection",
      description:
        "Connect using standard JDBC URL: jdbc:phoenix:server1,server2:port"
    }
  ];

  return (
    <section id="sql-support" className="border-border/60 bg-muted/30 border-b">
      <div className="container mx-auto px-4 pt-6 pb-12 md:pt-8 md:pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            SQL Support
          </h2>
          <p className="text-muted-foreground mt-2">
            Phoenix takes your SQL query, compiles it into HBase scans, and
            orchestrates execution to produce JDBC result sets.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border-border/60 bg-card flex flex-col items-center rounded-xl border p-6 text-center shadow-sm"
            >
              <Icon className="text-primary mb-3 size-10" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-6">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
