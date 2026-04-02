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

import { Button } from "@/ui/button";
import { Link } from "@/components/link";

export function Hero() {
  return (
    <section>
      <div className="container mx-auto px-4 pt-32 pb-16 md:pt-48 md:pb-20">
        <div className="flex flex-col items-center text-center">
          <img
            src="/images/logo.svg"
            alt="Apache Phoenix logo"
            width={460}
            height={120.4}
            className="px-4 sm:px-0 dark:hidden"
          />
          <img
            src="/images/dark-theme-logo.svg"
            alt="Apache Phoenix logo"
            width={460}
            height={120.4}
            className="hidden px-4 sm:px-0 dark:block"
          />

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            We Put SQL Back in NoSQL
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty md:text-xl">
            Query HBase with standard SQL and JDBC. Low latency OLTP and
            operational analytics for Hadoop.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/downloads">Download Phoenix</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/docs">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
