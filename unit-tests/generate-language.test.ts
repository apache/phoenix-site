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

import { describe, it, expect } from "vitest";
import {
  parseCsv,
  toAnchor,
  escapeMdxText,
  escapeTemplateLiteral,
  buildMdx,
  type CsvEntry,
  type Section
} from "../scripts/generate-language";

// ---------------------------------------------------------------------------
// parseCsv
// ---------------------------------------------------------------------------
describe("parseCsv", () => {
  it("skips the header row", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","SELECT","sel","desc","ex"`;
    expect(parseCsv(csv)).toHaveLength(1);
  });

  it("parses a minimal valid row", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","SELECT","sel","desc","ex"`;
    const [row] = parseCsv(csv);
    expect(row).toMatchObject({
      section: "Commands",
      topic: "SELECT",
      syntax: "sel",
      text: "desc",
      example: "ex"
    });
  });

  it("handles quoted fields containing commas", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","A, B","syn","text, more","ex"`;
    const [row] = parseCsv(csv);
    expect(row.topic).toBe("A, B");
    expect(row.text).toBe("text, more");
  });

  it("handles quoted fields containing embedded newlines", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","SELECT","line1\nline2","desc","ex"`;
    const [row] = parseCsv(csv);
    expect(row.syntax).toBe("line1\nline2");
  });

  it('handles "" as an escaped quote inside a quoted field', () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","SELECT","a ""quoted"" word","desc","ex"`;
    const [row] = parseCsv(csv);
    expect(row.syntax).toBe('a "quoted" word');
  });

  it("trims leading/trailing whitespace from field values", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n" Commands "," SELECT ","syn","text","ex"`;
    const [row] = parseCsv(csv);
    expect(row.section).toBe("Commands");
    expect(row.topic).toBe("SELECT");
  });

  it("skips blank lines between records", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","A","s","t","e"\n\n"Commands","B","s","t","e"`;
    expect(parseCsv(csv)).toHaveLength(2);
  });

  it("skips rows with fewer than 5 fields", () => {
    const csv = `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"\n"Commands","A","s","t"`;
    expect(parseCsv(csv)).toHaveLength(0);
  });

  it("returns an empty array for a header-only CSV", () => {
    expect(
      parseCsv(`"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"`)
    ).toHaveLength(0);
  });

  it("parses multiple rows preserving order", () => {
    const csv = [
      `"SECTION","TOPIC","SYNTAX","TEXT","EXAMPLE"`,
      `"Commands","SELECT","s1","t1","e1"`,
      `"Commands","INSERT","s2","t2","e2"`,
      `"Data Types","INTEGER","s3","t3","e3"`
    ].join("\n");
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.topic)).toEqual(["SELECT", "INSERT", "INTEGER"]);
  });
});

// ---------------------------------------------------------------------------
// toAnchor
// ---------------------------------------------------------------------------
describe("toAnchor", () => {
  it("lowercases the topic", () => {
    expect(toAnchor("SELECT")).toBe("select");
  });

  it("replaces spaces with hyphens", () => {
    expect(toAnchor("Select Statement")).toBe("select-statement");
  });

  it("collapses multiple non-alphanumeric chars into a single hyphen", () => {
    expect(toAnchor("Functions (Aggregate)")).toBe("functions-aggregate");
  });

  it("strips leading and trailing hyphens", () => {
    expect(toAnchor("(CREATE TABLE)")).toBe("create-table");
  });

  it("preserves digits", () => {
    expect(toAnchor("UNSIGNED_INT")).toBe("unsigned-int");
  });
});

// ---------------------------------------------------------------------------
// escapeMdxText
// ---------------------------------------------------------------------------
describe("escapeMdxText", () => {
  it("escapes opening curly braces", () => {
    expect(escapeMdxText("value {foo}")).toBe("value \\{foo\\}");
  });

  it("escapes closing curly braces", () => {
    expect(escapeMdxText("}")).toBe("\\}");
  });

  it("replaces < with &lt;", () => {
    expect(escapeMdxText("a < b")).toBe("a &lt; b");
  });

  it("does not escape >", () => {
    expect(escapeMdxText("a > b")).toBe("a > b");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeMdxText("hello world")).toBe("hello world");
  });
});

// ---------------------------------------------------------------------------
// escapeTemplateLiteral
// ---------------------------------------------------------------------------
describe("escapeTemplateLiteral", () => {
  it("escapes backticks", () => {
    expect(escapeTemplateLiteral("a`b")).toBe("a\\`b");
  });

  it("escapes ${ template expressions", () => {
    expect(escapeTemplateLiteral("${foo}")).toBe("\\${foo}");
  });

  it("escapes backslashes", () => {
    expect(escapeTemplateLiteral("a\\b")).toBe("a\\\\b");
  });

  it("escapes backslash before backtick correctly", () => {
    expect(escapeTemplateLiteral("\\`")).toBe("\\\\\\`");
  });

  it("leaves ordinary text unchanged", () => {
    expect(escapeTemplateLiteral("SELECT * FROM t")).toBe("SELECT * FROM t");
  });
});

// ---------------------------------------------------------------------------
// buildMdx
// ---------------------------------------------------------------------------

function makeEntry(overrides: Partial<CsvEntry> = {}): CsvEntry {
  return {
    section: "Commands",
    topic: "SELECT",
    syntax: "selectStatement",
    text: "Selects data.",
    example: "SELECT * FROM t;",
    ...overrides
  };
}

function makeSection(name: string, entries: CsvEntry[]): Section {
  return { name, items: entries };
}

describe("buildMdx", () => {
  const topicIndex = {
    select: "select",
    "select statement": "select-statement"
  };

  it("starts with valid YAML frontmatter", () => {
    const mdx = buildMdx("My Title", "My desc", [], topicIndex);
    expect(mdx).toMatch(/^---\ntitle: "My Title"\ndescription: "My desc"\n---/);
  });

  it("does not import RailroadDiagram (it is provided globally via baseMdxComponents)", () => {
    const mdx = buildMdx("T", "D", [], topicIndex);
    expect(mdx).not.toContain(`import { RailroadDiagram }`);
  });

  it("exports topicIndex as a JS object literal", () => {
    const mdx = buildMdx("T", "D", [], topicIndex);
    expect(mdx).toContain("export const topicIndex = {");
    expect(mdx).toContain('"select": "select"');
  });

  it("emits a ## heading for each section", () => {
    const sections = [makeSection("Commands", [makeEntry()])];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("## Commands");
  });

  it("emits a ### heading for each entry", () => {
    const sections = [
      makeSection("Commands", [makeEntry({ topic: "SELECT" })])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("### SELECT");
  });

  it("renders a <RailroadDiagram> component for each entry", () => {
    const sections = [
      makeSection("Commands", [makeEntry({ syntax: "SELECT col FROM t" })])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("<RailroadDiagram");
    expect(mdx).toContain("SELECT col FROM t");
    expect(mdx).toContain("anchors={topicIndex}");
  });

  it("escapes backticks in the syntax prop", () => {
    const sections = [makeSection("Commands", [makeEntry({ syntax: "a`b" })])];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("a\\`b");
  });

  it("emits description text as paragraphs", () => {
    const sections = [
      makeSection("Commands", [
        makeEntry({ text: "First para.\n\nSecond para." })
      ])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("First para.");
    expect(mdx).toContain("Second para.");
  });

  it("escapes curly braces in description text", () => {
    const sections = [
      makeSection("Commands", [makeEntry({ text: "Use {value} here." })])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("Use \\{value\\} here.");
  });

  it("wraps the example in a ```sql code block", () => {
    const sections = [
      makeSection("Commands", [makeEntry({ example: "SELECT 1;" })])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("```sql\nSELECT 1;\n```");
  });

  it("omits the example block when example is empty", () => {
    const sections = [makeSection("Commands", [makeEntry({ example: "" })])];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).not.toContain("```sql");
  });

  it("omits description when text is empty", () => {
    const sections = [makeSection("Commands", [makeEntry({ text: "" })])];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    // Should still have the RailroadDiagram but no extra paragraphs
    expect(mdx).toContain("<RailroadDiagram");
    expect(mdx).not.toContain("Selects data.");
  });

  it("handles multiple sections and entries", () => {
    const sections = [
      makeSection("Commands", [
        makeEntry({ topic: "SELECT" }),
        makeEntry({ topic: "DELETE" })
      ]),
      makeSection("Data Types", [makeEntry({ topic: "INTEGER" })])
    ];
    const mdx = buildMdx("T", "D", sections, topicIndex);
    expect(mdx).toContain("## Commands");
    expect(mdx).toContain("### SELECT");
    expect(mdx).toContain("### DELETE");
    expect(mdx).toContain("## Data Types");
    expect(mdx).toContain("### INTEGER");
  });
});
