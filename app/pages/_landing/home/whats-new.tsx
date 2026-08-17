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
  ArrowRight,
  Braces,
  Globe,
  RadioTower,
  Sparkles,
  Workflow
} from "lucide-react";
import { Link } from "@/components/link";

export function WhatsNewSection() {
  const items = [
    {
      title: "DynamoDB-Compatible REST API",
      desc: "Point your DynamoDB SDK clients at Phoenix using the phoenix-adapters REST service — no application rewrite required.",
      href: "/docs/integrations/phoenix-dynamodb",
      Icon: Globe
    },
    {
      title: "Document Data: BSON",
      desc: "Native binary JSON column type with server-side projection, filtering, and atomic per-field updates.",
      href: "/docs/features/bson",
      Icon: Braces
    },
    {
      title: "Change Data Capture",
      desc: "Stream row-level changes as ordered, partitioned events — read with standard SQL, with full split/merge lineage.",
      href: "/docs/features/change-data-capture",
      Icon: RadioTower
    },
    {
      title: "Eventually Consistent Indexes",
      desc: "Move global secondary index maintenance off the write path for write-heavy workloads — higher throughput, bounded staleness, no query-side changes.",
      href: "/docs/features/eventually-consistent-indexes",
      Icon: Workflow
    }
  ];

  return (
    <section id="whats-new" className="border-border/60 bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" aria-hidden />
            What's New in 5.3.1
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Latest Phoenix Highlights
          </h2>
          <p className="text-muted-foreground mt-2">
            Recent capabilities now available in the 5.3.1 release.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {items.map(({ title, desc, href, Icon }) => (
            <Link
              key={title}
              to={href}
              className="group border-border/60 bg-card hover:border-primary/60 flex h-full flex-col rounded-xl border p-6 shadow-sm transition-colors hover:shadow-md"
            >
              <div className="flex flex-1 flex-col">
                <Icon
                  className="text-primary mb-4 size-7 shrink-0"
                  aria-hidden
                />
                <h3 className="text-foreground min-h-14 text-lg leading-7 font-semibold text-balance">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {desc}
                </p>
              </div>
              <span className="text-primary mt-6 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
                Learn more <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/recent-improvements#release-5-3-1"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            See all features in 5.3.1
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
