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

/**
 * Single-step generator: app/lib/resources/phoenix.csv → MDX reference pages.
 *
 * Outputs:
 *   app/pages/_docs/docs/_mdx/(multi-page)/grammar.mdx
 *   app/pages/_docs/docs/_mdx/(multi-page)/functions.mdx
 *   app/pages/_docs/docs/_mdx/(multi-page)/datatypes.mdx
 *
 * Run with:  npx tsx scripts/generate-language.ts
 * npm alias: npm run generate-language
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CsvEntry {
  section: string;
  topic: string;
  syntax: string;
  text: string;
  example: string;
  anchor?: string;
}

export interface Section {
  name: string;
  items: CsvEntry[];
}

interface FileDef {
  file: string;
  title: string;
  description: string;
  varName: string;
  sectionFilter: (name: string) => boolean;
}

// ---------------------------------------------------------------------------
// CSV parser  (quoted fields, embedded newlines, "" escape for literal quote)
// ---------------------------------------------------------------------------
export function parseCsv(text: string): CsvEntry[] {
  const records: CsvEntry[] = [];
  let pos = 0;

  function readField(): string | null {
    if (pos >= text.length) return null;
    if (text[pos] === '"') {
      pos++;
      let value = "";
      while (pos < text.length) {
        if (text[pos] === '"') {
          if (pos + 1 < text.length && text[pos + 1] === '"') {
            value += '"';
            pos += 2;
          } else {
            pos++;
            return value;
          }
        } else {
          value += text[pos++];
        }
      }
      return value;
    } else {
      let value = "";
      while (
        pos < text.length &&
        text[pos] !== "," &&
        text[pos] !== "\n" &&
        text[pos] !== "\r"
      ) {
        value += text[pos++];
      }
      return value;
    }
  }

  // Skip header line
  while (pos < text.length && text[pos] !== "\n") pos++;
  if (pos < text.length) pos++;

  while (pos < text.length) {
    while (pos < text.length && (text[pos] === "\n" || text[pos] === "\r"))
      pos++;
    if (pos >= text.length) break;

    const fields = [];
    for (let i = 0; i < 5; i++) {
      const field = readField();
      if (field === null) break;
      fields.push(field);
      if (i < 4 && pos < text.length && text[pos] === ",") pos++;
    }
    while (pos < text.length && text[pos] !== "\n") pos++;

    if (
      fields.length === 5 &&
      fields[0].trim() &&
      fields[0].trim() !== "SECTION"
    ) {
      records.push({
        section: fields[0].trim(),
        topic: fields[1].trim(),
        syntax: fields[2].trim(),
        text: fields[3].trim(),
        example: fields[4].trim()
      });
    }
  }
  return records;
}

// Matches Fumadocs' heading-slug algorithm (and our topicIndex keys)
export function toAnchor(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// MDX helpers
// ---------------------------------------------------------------------------
export function escapeMdxText(text: string): string {
  return text.replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/</g, "&lt;");
}

export function escapeTemplateLiteral(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

// ---------------------------------------------------------------------------
// Which sections go in which output file
// ---------------------------------------------------------------------------
const FILE_DEFS: FileDef[] = [
  {
    file: "grammar.mdx",
    title: "SQL Grammar",
    description:
      "SQL command and grammar reference for Apache Phoenix — SELECT, UPSERT, CREATE TABLE, indexes, and more.",
    varName: "grammarTopicIndex",
    sectionFilter: (name) => name === "Commands" || name === "Other Grammar"
  },
  {
    file: "functions.mdx",
    title: "SQL Functions",
    description:
      "Built-in SQL function reference for Apache Phoenix — aggregate, string, numeric, array, date/time, and general functions.",
    varName: "functionsTopicIndex",
    sectionFilter: (name) => name.startsWith("Functions")
  },
  {
    file: "datatypes.mdx",
    title: "Data Types",
    description: "SQL data type reference for Apache Phoenix.",
    varName: "datatypesTopicIndex",
    sectionFilter: (name) => name === "Data Types"
  }
];

export function buildMdx(
  title: string,
  description: string,
  sections: Section[],
  topicIndex: Record<string, string>,
  varName = "topicIndex"
): string {
  // Serialise topicIndex as a compact JS object literal for the MDX export
  const topicIndexLiteral =
    "{\n" +
    Object.entries(topicIndex)
      .map(([k, v]) => `  "${k}": "${v}"`)
      .join(",\n") +
    "\n}";

  const out = [
    "---",
    `title: "${title}"`,
    `description: "${description}"`,
    "---",
    "",
    `export const ${varName} = ${topicIndexLiteral}`,
    ""
  ];

  for (const section of sections) {
    out.push(`## ${section.name}`, "");

    for (const entry of section.items) {
      out.push(`### ${entry.topic}`, "");

      out.push(
        "<RailroadDiagram",
        `  syntax={\`${escapeTemplateLiteral(entry.syntax)}\`}`,
        `  anchors={${varName}}`,
        "/>",
        ""
      );

      if (entry.text?.trim()) {
        for (const para of entry.text
          .split(/\n\n+/)
          .map((p) => escapeMdxText(p.replace(/\n/g, " ").trim()))
          .filter(Boolean)) {
          out.push(para, "");
        }
      }

      if (entry.example?.trim()) {
        out.push("**Example**", "", "```sql", entry.example.trim(), "```", "");
      }
    }
  }

  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Main — only runs when the script is executed directly, not when imported
// ---------------------------------------------------------------------------
import { fileURLToPath } from "url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const csv = readFileSync(
    join(ROOT, "app", "lib", "resources", "phoenix.csv"),
    "utf8"
  );
  const entries = parseCsv(csv);

  const sectionMap = new Map<string, CsvEntry[]>();
  for (const entry of entries) {
    if (!sectionMap.has(entry.section)) sectionMap.set(entry.section, []);
    sectionMap
      .get(entry.section)!
      .push({ ...entry, anchor: toAnchor(entry.topic) });
  }
  const sections: Section[] = [...sectionMap.entries()].map(
    ([name, items]) => ({ name, items })
  );

  const topicIndex: Record<string, string> = {};
  for (const entry of entries) {
    topicIndex[entry.topic.toLowerCase()] = toAnchor(entry.topic);
    topicIndex[entry.topic.replace(/ Type$/, "").toLowerCase()] = toAnchor(
      entry.topic
    );
  }

  const multiPageDir = join(
    ROOT,
    "app",
    "pages",
    "_docs",
    "docs",
    "_mdx",
    "(multi-page)"
  );
  for (const def of FILE_DEFS) {
    const fileSections = sections.filter((s) => def.sectionFilter(s.name));
    const count = fileSections.reduce((n, s) => n + s.items.length, 0);
    writeFileSync(
      join(multiPageDir, def.file),
      buildMdx(
        def.title,
        def.description,
        fileSections,
        topicIndex,
        def.varName
      )
    );
    console.log(`✓ ${def.file} — ${count} entries`);
  }

  console.log(
    `\nTotal: ${entries.length} entries from app/lib/resources/phoenix.csv`
  );
}
