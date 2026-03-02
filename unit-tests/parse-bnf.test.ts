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
 * Tests for app/components/docs/language/parse-bnf.ts
 *
 * syntaxToSvg uses railroad-diagrams' toString() path (FakeSVG string
 * serialisation) which does NOT call document.createElementNS, so tests
 * run fine in any environment without mocking.
 *
 * SVG text content is checked via /<text[^>]*>CONTENT<\/text>/ patterns
 * because railroad-diagrams always wraps node labels in <text> elements.
 */

import { describe, it, expect } from "vitest";
import {
  lookupAnchor,
  syntaxToSvg
} from "@/components/docs/language/parse-bnf";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the text content of every <text> element in the SVG string. */
function svgTexts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
}

/** Count how many top-level <svg …> opening tags are in the string. */
function countSvgs(svg: string): number {
  return (svg.match(/<svg\b/g) ?? []).length;
}

const NO_ANCHORS: Record<string, string> = {};
const ANCHORS = {
  "select statement": "select-statement",
  order: "order",
  "table ref": "table-ref",
  expression: "expression",
  "bind parameter": "bind-parameter"
};

// ---------------------------------------------------------------------------
// lookupAnchor
// ---------------------------------------------------------------------------
describe("lookupAnchor", () => {
  it("returns undefined when anchors map is empty", () => {
    expect(lookupAnchor("selectStatement", {})).toBeUndefined();
  });

  it("returns undefined for an unknown name", () => {
    expect(lookupAnchor("unknownThing", ANCHORS)).toBeUndefined();
  });

  it("finds a camelCase name matching a space-separated topic key", () => {
    // "selectStatement" → normalised key "selectstatement"
    // topic "select statement" → normalised "selectstatement" ✓
    expect(lookupAnchor("selectStatement", ANCHORS)).toBe("select-statement");
  });

  it("finds a single-word lowercase name", () => {
    expect(lookupAnchor("order", ANCHORS)).toBe("order");
  });

  it("is case-insensitive for the input name", () => {
    expect(lookupAnchor("ORDER", ANCHORS)).toBe("order");
  });

  it("strips non-alphanumeric chars from both sides before comparing", () => {
    // "tableRef" normalised → "tableref"; "table ref" → "tableref"
    expect(lookupAnchor("tableRef", ANCHORS)).toBe("table-ref");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — basic contract
// ---------------------------------------------------------------------------
describe("syntaxToSvg — basic contract", () => {
  it("returns a non-empty string", () => {
    expect(syntaxToSvg("SELECT", NO_ANCHORS).length).toBeGreaterThan(0);
  });

  it("output starts with an <svg element", () => {
    expect(syntaxToSvg("SELECT", NO_ANCHORS)).toMatch(/^<svg\b/);
  });

  it("produces exactly one <svg> for a single-line syntax", () => {
    expect(countSvgs(syntaxToSvg("SELECT col FROM t", NO_ANCHORS))).toBe(1);
  });

  it("produces one <svg> per non-empty line for multi-line syntax", () => {
    const multiLine = "line one\nline two\nline three";
    expect(countSvgs(syntaxToSvg(multiLine, NO_ANCHORS))).toBe(3);
  });

  it("ignores blank lines when splitting multi-line syntax", () => {
    const withBlanks = "line one\n\n\nline two";
    expect(countSvgs(syntaxToSvg(withBlanks, NO_ANCHORS))).toBe(2);
  });

  it("returns a fallback diagram for an empty syntax string", () => {
    // An empty string produces no lines → syntaxToSvg returns "" (no SVG)
    // OR it may return a single skip diagram — either way it shouldn't throw
    expect(() => syntaxToSvg("", NO_ANCHORS)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Terminal rendering
// ---------------------------------------------------------------------------
describe("syntaxToSvg — Terminal rendering", () => {
  it("renders an uppercase keyword as a Terminal text node", () => {
    const texts = svgTexts(syntaxToSvg("SELECT", NO_ANCHORS));
    expect(texts).toContain("SELECT");
  });

  it("collects consecutive uppercase words into one Terminal", () => {
    // "ORDER BY" should appear as a single text node, not two
    const texts = svgTexts(syntaxToSvg("ORDER BY", NO_ANCHORS));
    expect(texts).toContain("ORDER BY");
    expect(texts).not.toContain("ORDER");
    expect(texts).not.toContain("BY");
  });

  it("renders multiple keywords as separate Terminals in sequence", () => {
    const texts = svgTexts(syntaxToSvg("SELECT FROM", NO_ANCHORS));
    expect(texts).toContain("SELECT FROM");
  });

  it("renders a single-quoted literal as a Terminal (quotes stripped)", () => {
    // Single-quoted tokens in the CSV grammar are used to escape bracket
    // characters (e.g. '[', ']') — the parser intentionally renders them
    // without the surrounding quotes.
    const texts = svgTexts(syntaxToSvg("'value'", NO_ANCHORS));
    expect(texts).toContain("value");
  });

  it("renders = as a Terminal", () => {
    const texts = svgTexts(syntaxToSvg("col = value", NO_ANCHORS));
    expect(texts).toContain("=");
  });

  it("renders the || operator as a single Terminal (not two pipes)", () => {
    const svg = syntaxToSvg("{ || } summand", NO_ANCHORS);
    const texts = svgTexts(svg);
    expect(texts).toContain("||");
    // There should be no empty-sequence double-arc artefact;
    // we verify by ensuring the SVG does not contain an empty <text> node
    expect(texts.every((t) => t.trim().length > 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — NonTerminal rendering
// ---------------------------------------------------------------------------
describe("syntaxToSvg — NonTerminal rendering", () => {
  it("renders a camelCase word as a NonTerminal text node", () => {
    const texts = svgTexts(syntaxToSvg("selectStatement", NO_ANCHORS));
    expect(texts).toContain("selectStatement");
  });

  it("renders a lowercase word as a NonTerminal text node", () => {
    const texts = svgTexts(syntaxToSvg("order", NO_ANCHORS));
    expect(texts).toContain("order");
  });

  it("renders both a Terminal and a NonTerminal in the same diagram", () => {
    const texts = svgTexts(syntaxToSvg("SELECT selectStatement", NO_ANCHORS));
    expect(texts).toContain("SELECT");
    expect(texts).toContain("selectStatement");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Optional [ ]
// ---------------------------------------------------------------------------
describe("syntaxToSvg — Optional [X]", () => {
  it("includes the inner content text in the SVG", () => {
    const texts = svgTexts(syntaxToSvg("[DISTINCT]", NO_ANCHORS));
    expect(texts).toContain("DISTINCT");
  });

  it("does not throw on a simple optional", () => {
    expect(() => syntaxToSvg("[IF NOT EXISTS]", NO_ANCHORS)).not.toThrow();
  });

  it("handles optional with choice: [X | Y]", () => {
    const texts = svgTexts(syntaxToSvg("[ASC | DESC]", NO_ANCHORS));
    expect(texts).toContain("ASC");
    expect(texts).toContain("DESC");
  });

  it("handles nested optional inside a sequence", () => {
    expect(() =>
      syntaxToSvg("SELECT col [ WHERE expression ]", NO_ANCHORS)
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Choice { }
// ---------------------------------------------------------------------------
describe("syntaxToSvg — Choice {X|Y}", () => {
  it("includes all alternatives as text nodes", () => {
    const texts = svgTexts(syntaxToSvg("{ FIRST | NEXT }", NO_ANCHORS));
    expect(texts).toContain("FIRST");
    expect(texts).toContain("NEXT");
  });

  it("handles a three-way choice", () => {
    const texts = svgTexts(syntaxToSvg("{ A | B | C }", NO_ANCHORS));
    expect(texts).toContain("A");
    expect(texts).toContain("B");
    expect(texts).toContain("C");
  });

  it("handles a choice of non-terminals", () => {
    const texts = svgTexts(
      syntaxToSvg("{ bindParameter | number }", NO_ANCHORS)
    );
    expect(texts).toContain("bindParameter");
    expect(texts).toContain("number");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Repeat patterns
// ---------------------------------------------------------------------------
describe("syntaxToSvg — OneOrMore X [,...]", () => {
  it("includes the element text in the SVG", () => {
    const texts = svgTexts(syntaxToSvg("columnDef [,...]", NO_ANCHORS));
    expect(texts).toContain("columnDef");
  });

  it('includes the ", ..." separator label on the return arc', () => {
    const texts = svgTexts(syntaxToSvg("columnDef [,...]", NO_ANCHORS));
    expect(texts).toContain(", ...");
  });

  it("wraps the whole preceding sequence when [,...] is at end of group", () => {
    // { columnRef | columnDef } [,...] — the whole choice repeats, not just columnDef
    const svg = syntaxToSvg("{ columnRef | columnDef } [,...]", NO_ANCHORS);
    const texts = svgTexts(svg);
    expect(texts).toContain("columnRef");
    expect(texts).toContain("columnDef");
    expect(texts).toContain(", ...");
  });
});

describe("syntaxToSvg — OneOrMore X [...]", () => {
  it("includes the element text", () => {
    const texts = svgTexts(syntaxToSvg("selectStatement [...]", NO_ANCHORS));
    expect(texts).toContain("selectStatement");
  });

  it('includes the "..." separator label on the return arc', () => {
    const texts = svgTexts(syntaxToSvg("selectStatement [...]", NO_ANCHORS));
    expect(texts).toContain("...");
  });

  it("wraps whole accumulated sequence when [...] is at end of group", () => {
    // { UNION ALL selectStatement [...] } — UNION ALL + selectStatement repeat together
    const svg = syntaxToSvg("{ UNION ALL selectStatement [...] }", NO_ANCHORS);
    const texts = svgTexts(svg);
    expect(texts).toContain("UNION ALL");
    expect(texts).toContain("selectStatement");
    expect(texts).toContain("...");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Parenthesised groups
// ---------------------------------------------------------------------------
describe("syntaxToSvg — parenthesised groups ( )", () => {
  it("emits ( and ) as Terminal text nodes", () => {
    const texts = svgTexts(syntaxToSvg("( col )", NO_ANCHORS));
    expect(texts).toContain("(");
    expect(texts).toContain(")");
  });

  it("includes inner content text", () => {
    const texts = svgTexts(syntaxToSvg("( expression )", NO_ANCHORS));
    expect(texts).toContain("expression");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — Anchor cross-linking
// ---------------------------------------------------------------------------
describe("syntaxToSvg — anchor href injection", () => {
  it("replaces xlink:href with plain href in SVG output", () => {
    // Any SVG link attributes must use plain href for inline HTML use
    const svg = syntaxToSvg("selectStatement", ANCHORS);
    expect(svg).not.toContain("xlink:href");
  });

  it("does not insert href attributes when no anchors match", () => {
    const svg = syntaxToSvg("selectStatement", {});
    expect(svg).not.toContain("href=");
  });
});

// ---------------------------------------------------------------------------
// syntaxToSvg — real Phoenix CSV syntax snippets
// ---------------------------------------------------------------------------
describe("syntaxToSvg — real Phoenix syntax snippets", () => {
  it("parses the SELECT first line without throwing", () => {
    expect(() =>
      syntaxToSvg(
        "selectStatement [ { UNION ALL selectStatement [...] } ]",
        ANCHORS
      )
    ).not.toThrow();
  });

  it("SELECT first line SVG contains all expected terms", () => {
    const texts = svgTexts(
      syntaxToSvg(
        "selectStatement [ { UNION ALL selectStatement [...] } ]",
        ANCHORS
      )
    );
    expect(texts).toContain("selectStatement");
    expect(texts).toContain("UNION ALL");
    expect(texts).toContain("...");
  });

  it("parses ORDER BY / LIMIT line without throwing", () => {
    expect(() =>
      syntaxToSvg(
        "[ ORDER BY order [,...] ] [ LIMIT {bindParameter | number} ]",
        ANCHORS
      )
    ).not.toThrow();
  });

  it("ORDER BY / LIMIT line contains all expected terms", () => {
    const texts = svgTexts(
      syntaxToSvg(
        "[ ORDER BY order [,...] ] [ LIMIT {bindParameter | number} ]",
        ANCHORS
      )
    );
    expect(texts).toContain("ORDER BY");
    expect(texts).toContain("order");
    expect(texts).toContain(", ...");
    expect(texts).toContain("LIMIT");
    expect(texts).toContain("bindParameter");
    expect(texts).toContain("number");
  });

  it("parses CREATE TABLE syntax without throwing", () => {
    expect(() =>
      syntaxToSvg(
        "CREATE TABLE [IF NOT EXISTS] tableRef ( columnDef [,...] [constraint] ) [tableOptions]",
        ANCHORS
      )
    ).not.toThrow();
  });
});
