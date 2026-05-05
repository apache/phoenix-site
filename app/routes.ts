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
  type RouteConfig,
  index,
  layout,
  route
} from "@react-router/dev/routes";

export default [
  // Landing
  layout("./pages/_landing/landing-layout.tsx", [
    index("routes/_landing/home.tsx"),
    route("downloads", "routes/_landing/downloads.tsx"),
    route("mailing-lists", "routes/_landing/mailing-lists.tsx"),
    route("news", "routes/_landing/news.tsx"),
    route("team", "routes/_landing/team.tsx"),
    route("who-is-using", "routes/_landing/who-is-using.tsx"),
    route("recent-improvements", "routes/_landing/recent-improvements.tsx"),
    route("roadmap", "routes/_landing/roadmap.tsx"),
    route("release-notes", "routes/_landing/release-notes.tsx"),
    route("issues-tracking", "routes/_landing/issues-tracking.tsx"),
    route("source-repository", "routes/_landing/source-repository.tsx"),
    route("tech-talks", "routes/_landing/tech-talks.tsx"),
    route("presentations", "routes/_landing/presentations.tsx")
  ]),
  // Docs
  layout("./pages/_docs/docs-layout.tsx", [
    route("docs/*", "routes/_docs/docs.tsx")
  ]),
  // Static Resources
  route("phoenixcon-2018", "routes/phoenixcon-2018.tsx"),
  route("phoenixcon-archives", "routes/phoenixcon-archives.tsx"),
  // API (Rendered at build time)
  route("llms-full.txt", "routes/_api/llms-full.ts"),
  route("api/search", "routes/_api/search.ts")
] satisfies RouteConfig;
