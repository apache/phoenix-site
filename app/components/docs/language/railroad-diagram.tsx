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

import { syntaxToSvg } from "./parse-bnf";

interface RailroadDiagramProps {
  syntax: string;
  anchors: Record<string, string>;
}

/**
 * Renders railroad/syntax diagram SVGs for a given BNF syntax string.
 *
 * syntaxToSvg produces a complete SVG string (no DOM needed) with native
 * SVG <a href="#anchor"> links already embedded for non-terminal boxes.
 * No useEffect, no client-side JavaScript — just static HTML.
 */
export function RailroadDiagram({ syntax, anchors }: RailroadDiagramProps) {
  return (
    <div
      className="railroad-diagram-wrapper overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: syntaxToSvg(syntax, anchors) }}
      aria-label="Syntax diagram"
    />
  );
}
