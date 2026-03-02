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
 * Converts Phoenix SQL BNF syntax strings (from phoenix.csv) into
 * railroad-diagrams API call trees, ready for client-side SVG rendering.
 *
 * Grammar conventions used in the CSV:
 *   [X]       optional X
 *   {X|Y|Z}   choice between X, Y, Z
 *   X [,...]  one-or-more X separated by commas
 *   X [...]   one-or-more X (repeat)
 *   UPPERCASE multi-word  → Terminal
 *   camelCase / lowercase → NonTerminal (linked to anchor when known)
 */

// railroad-diagrams is a CJS package with no TS types.
// @ts-ignore
import rdDefault from "railroad-diagrams";
const rd = rdDefault as Record<string, (...a: any[]) => any>;

// ---------------------------------------------------------------------------
// Tokeniser
// ---------------------------------------------------------------------------
type TokKind =
  | "WORD"
  | "LBRACK"
  | "RBRACK"
  | "LBRACE"
  | "RBRACE"
  | "LPAREN"
  | "RPAREN"
  | "PIPE"
  | "COMMA"
  | "ELLIPSIS"
  | "EQUALS"
  | "QUOTED"
  | "EOF";

interface Tok {
  kind: TokKind;
  val: string;
}

function tokenise(input: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (c === "[") {
      toks.push({ kind: "LBRACK", val: "[" });
      i++;
      continue;
    }
    if (c === "]") {
      toks.push({ kind: "RBRACK", val: "]" });
      i++;
      continue;
    }
    if (c === "{") {
      toks.push({ kind: "LBRACE", val: "{" });
      i++;
      continue;
    }
    if (c === "}") {
      toks.push({ kind: "RBRACE", val: "}" });
      i++;
      continue;
    }
    if (c === "(") {
      toks.push({ kind: "LPAREN", val: "(" });
      i++;
      continue;
    }
    if (c === ")") {
      toks.push({ kind: "RPAREN", val: ")" });
      i++;
      continue;
    }
    if (c === "|") {
      // || is the SQL string-concatenation operator — treat as a Terminal word,
      // not two consecutive pipe (alternation) tokens.
      if (input[i + 1] === "|") {
        toks.push({ kind: "WORD", val: "||" });
        i += 2;
      } else {
        toks.push({ kind: "PIPE", val: "|" });
        i++;
      }
      continue;
    }
    if (c === "=") {
      toks.push({ kind: "EQUALS", val: "=" });
      i++;
      continue;
    }
    if (c === ",") {
      toks.push({ kind: "COMMA", val: "," });
      i++;
      continue;
    }

    // ellipsis — must be checked before standalone dot
    if (c === "." && input[i + 1] === "." && input[i + 2] === ".") {
      toks.push({ kind: "ELLIPSIS", val: "..." });
      i += 3;
      continue;
    }

    // standalone dot (decimal point in grammar, e.g. "[ - ] { number [ . number ] }")
    // Word-internal dots like familyName.col are already consumed by the word tokeniser below.
    if (c === ".") {
      toks.push({ kind: "WORD", val: "." });
      i++;
      continue;
    }

    // double-dash line comment prefix — must be checked before standalone dash
    if (c === "-" && input[i + 1] === "-") {
      toks.push({ kind: "WORD", val: "--" });
      i += 2;
      continue;
    }

    // standalone dash (unary minus / negation, e.g. "[ - ] number")
    // Dashes inside words like "camelCase-word" are consumed by the word tokeniser below.
    if (c === "-") {
      toks.push({ kind: "WORD", val: "-" });
      i++;
      continue;
    }

    // quoted string 'abc'
    if (c === "'") {
      i++;
      let v = "";
      while (i < input.length && input[i] !== "'") v += input[i++];
      i++; // closing quote
      toks.push({ kind: "QUOTED", val: v });
      continue;
    }

    // word: letters, digits, underscores, hyphens, dots, @
    if (/[a-zA-Z_]/.test(c)) {
      let w = "";
      while (i < input.length && /[a-zA-Z0-9_.@-]/.test(input[i]))
        w += input[i++];
      toks.push({ kind: "WORD", val: w });
      continue;
    }

    // digit-starting token — also consumes range notation like 0-9
    if (/[0-9]/.test(c)) {
      let w = "";
      while (i < input.length && /[0-9]/.test(input[i])) w += input[i++];
      // range notation: 0-9, 1-99, etc.
      if (input[i] === "-" && /[0-9a-zA-Z]/.test(input[i + 1])) {
        w += input[i++]; // -
        while (i < input.length && /[0-9a-zA-Z]/.test(input[i]))
          w += input[i++];
      }
      toks.push({ kind: "WORD", val: w });
      continue;
    }

    // SQL special symbols — emit as Terminal word tokens so they appear in diagrams

    // Two-char comparison operators — must be checked before their single-char prefixes
    if (c === "<" && input[i + 1] === "=") {
      toks.push({ kind: "WORD", val: "<=" });
      i += 2;
      continue;
    }
    if (c === ">" && input[i + 1] === "=") {
      toks.push({ kind: "WORD", val: ">=" });
      i += 2;
      continue;
    }
    if (c === "<" && input[i + 1] === ">") {
      toks.push({ kind: "WORD", val: "<>" });
      i += 2;
      continue;
    }
    if (c === "!" && input[i + 1] === "=") {
      toks.push({ kind: "WORD", val: "!=" });
      i += 2;
      continue;
    }

    if (c === "<") {
      toks.push({ kind: "WORD", val: "<" });
      i++;
      continue;
    }
    if (c === ">") {
      toks.push({ kind: "WORD", val: ">" });
      i++;
      continue;
    }
    if (c === "!") {
      toks.push({ kind: "WORD", val: "!" });
      i++;
      continue;
    }

    if (c === "*") {
      toks.push({ kind: "WORD", val: "*" });
      i++;
      continue;
    }
    if (c === "%") {
      toks.push({ kind: "WORD", val: "%" });
      i++;
      continue;
    }
    if (c === "?") {
      toks.push({ kind: "WORD", val: "?" });
      i++;
      continue;
    }
    if (c === ":") {
      toks.push({ kind: "WORD", val: ":" });
      i++;
      continue;
    }
    if (c === "+") {
      toks.push({ kind: "WORD", val: "+" });
      i++;
      continue;
    }

    // double-slash line comment prefix — must be checked before block comment and standalone /
    if (c === "/" && input[i + 1] === "/") {
      toks.push({ kind: "WORD", val: "//" });
      i += 2;
      continue;
    }

    // SQL block comment /*+ ... */ — must be checked before standalone /
    if (c === "/" && input[i + 1] === "*") {
      let w = "/";
      i++;
      while (i < input.length) {
        if (input[i] === "*" && input[i + 1] === "/") {
          w += "*/";
          i += 2;
          break;
        }
        w += input[i++];
      }
      toks.push({ kind: "WORD", val: w });
      continue;
    }

    if (c === "/") {
      toks.push({ kind: "WORD", val: "/" });
      i++;
      continue;
    }

    // skip unknown characters (<, >, # etc.)
    i++;
  }
  toks.push({ kind: "EOF", val: "" });
  return toks;
}

// ---------------------------------------------------------------------------
// Classifier helpers
// ---------------------------------------------------------------------------
function isUpperWord(w: string): boolean {
  // All uppercase letters/digits/underscores, OR a symbolic operator like ||
  return /^[A-Z][A-Z0-9_]*$/.test(w) || /^[^a-z]+$/.test(w);
}

function isNonTerminal(w: string): boolean {
  // camelCase OR starts with a lowercase letter
  return /^[a-z]/.test(w);
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------
class BnfParser {
  private toks: Tok[];
  private pos = 0;
  private anchors: Record<string, string>;

  constructor(toks: Tok[], anchors: Record<string, string>) {
    this.toks = toks;
    this.anchors = anchors;
  }

  private peek(): Tok {
    return this.toks[this.pos];
  }
  private consume(): Tok {
    return this.toks[this.pos++];
  }

  private href(name: string): string | undefined {
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    for (const [topic, anchor] of Object.entries(this.anchors)) {
      if (topic.replace(/[^a-z0-9]+/g, "") === key) return `#${anchor}`;
    }
    return undefined;
  }

  // Parse a flat sequence until one of `stopAt` token kinds is encountered
  private parseSeq(stopAt: TokKind[]): any[] {
    const items: any[] = [];
    while (true) {
      const t = this.peek();
      if (t.kind === "EOF" || stopAt.includes(t.kind)) break;

      const term = this.parseTerm();
      if (term === null) break;

      // Look ahead for postfix repeat patterns: [,...] or [...]
      if (this.peek().kind === "LBRACK") {
        const saved = this.pos;
        this.consume(); // [
        if (this.peek().kind === "COMMA") {
          this.consume(); // ,
          if (this.peek().kind === "ELLIPSIS") {
            this.consume(); // ...
            if (this.peek().kind === "RBRACK") {
              this.consume(); // ]
              // If [,...] is the last thing in this sequence (next token is a stop),
              // it repeats the WHOLE accumulated sequence with comma separator.
              // Otherwise it repeats only the immediately preceding term.
              const next = this.peek();
              if (
                next.kind === "EOF" ||
                stopAt.includes(next.kind) ||
                next.kind === "PIPE"
              ) {
                const all = [...items, term];
                const inner = all.length === 1 ? all[0] : rd.Sequence(...all);
                return [rd.OneOrMore(inner, rd.Terminal(", ..."))];
              }
              items.push(rd.OneOrMore(term, rd.Terminal(", ...")));
              continue;
            }
          }
        } else if (this.peek().kind === "ELLIPSIS") {
          this.consume(); // ...
          if (this.peek().kind === "RBRACK") {
            this.consume(); // ]
            // If [...] is the last thing in this sequence (next token is a stop),
            // it repeats the WHOLE accumulated sequence.
            // Otherwise it repeats only the immediately preceding term.
            // The Comment("...") appears on the return arc, matching the original
            // H2/Phoenix railroad diagram style.
            const next = this.peek();
            if (
              next.kind === "EOF" ||
              stopAt.includes(next.kind) ||
              next.kind === "PIPE"
            ) {
              const all = [...items, term];
              const inner = all.length === 1 ? all[0] : rd.Sequence(...all);
              return [rd.OneOrMore(inner, rd.Terminal("..."))];
            }
            items.push(rd.OneOrMore(term, rd.Terminal("...")));
            continue;
          }
        }
        // Not a repeat pattern — backtrack
        this.pos = saved;
      }

      items.push(term);
    }
    return items;
  }

  // Parse alternatives (sequences separated by |)
  private parseAlts(stopAt: TokKind[]): any[][] {
    const alts: any[][] = [];
    alts.push(this.parseSeq([...stopAt, "PIPE"]));
    while (this.peek().kind === "PIPE") {
      this.consume(); // |
      alts.push(this.parseSeq([...stopAt, "PIPE"]));
    }
    return alts;
  }

  private seqOrSingle(items: any[]): any {
    if (items.length === 0) return rd.Skip();
    if (items.length === 1) return items[0];
    return rd.Sequence(...items);
  }

  private altsToNode(alts: any[][]): any {
    const nodes = alts
      .map((a) => this.seqOrSingle(a))
      .filter((n) => n !== null);
    if (nodes.length === 0) return rd.Skip();
    if (nodes.length === 1) return nodes[0];
    return rd.Choice(0, ...nodes);
  }

  // Parse a single term (optional, group, paren, word, literal)
  private parseTerm(): any | null {
    const t = this.peek();

    if (t.kind === "EOF") return null;

    if (t.kind === "LBRACK") {
      this.consume(); // [
      const alts = this.parseAlts(["RBRACK"]);
      if (this.peek().kind === "RBRACK") this.consume(); // ]
      const inner = this.altsToNode(alts);
      // 'skip' → bypass is the straight top line, content curves below
      // (matches the original H2/Phoenix railroad diagram style)
      return rd.Optional(inner, "skip");
    }

    if (t.kind === "LBRACE") {
      this.consume(); // {
      const alts = this.parseAlts(["RBRACE"]);
      if (this.peek().kind === "RBRACE") this.consume(); // }
      return this.altsToNode(alts);
    }

    if (t.kind === "LPAREN") {
      this.consume(); // (
      const seq = this.parseSeq(["RPAREN"]);
      if (this.peek().kind === "RPAREN") this.consume(); // )
      return rd.Sequence(rd.Terminal("("), ...seq, rd.Terminal(")"));
    }

    if (t.kind === "WORD") {
      if (isUpperWord(t.val)) {
        // Collect consecutive proper-uppercase words into one Terminal.
        // Symbol tokens (*, +, /, -, etc.) satisfy isUpperWord() but must never
        // merge with adjacent keywords — so merging only starts when the first
        // token is itself a proper uppercase letter word.
        const isProperUpperWord = (w: string) => /^[A-Z][A-Z0-9_]*$/.test(w);
        const words: string[] = [this.consume().val];
        if (isProperUpperWord(words[0])) {
          while (
            this.peek().kind === "WORD" &&
            isUpperWord(this.peek().val) &&
            isProperUpperWord(this.peek().val)
          ) {
            words.push(this.consume().val);
          }
        }
        return rd.Terminal(words.join(" "));
      } else if (isNonTerminal(t.val)) {
        this.consume();
        const href = this.href(t.val);
        return rd.NonTerminal(t.val, href);
      } else {
        // Mixed-case word — treat as Terminal
        return rd.Terminal(this.consume().val);
      }
    }

    if (t.kind === "QUOTED") {
      this.consume();
      // Single-quoted tokens in the CSV grammar (e.g. '[', ']') are literal
      // characters used to disambiguate from BNF brackets — render without quotes.
      return rd.Terminal(t.val);
    }

    if (t.kind === "COMMA") {
      this.consume();
      return rd.Terminal(",");
    }

    if (t.kind === "EQUALS") {
      this.consume();
      return rd.Terminal("=");
    }

    // Skip tokens we can't handle (pipe at top level, unexpected brackets, etc.)
    this.consume();
    return null;
  }

  buildDiagram(): any {
    // Use parseAlts so top-level | (e.g. "TRUE | FALSE", "string | numeric | ...")
    // is treated as a Choice rather than silently dropping all but the first alt.
    const alts = this.parseAlts([]);
    const node = this.altsToNode(alts);
    return rd.Diagram(node);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Looks up the anchor id for a grammar name (camelCase non-terminal).
 * Uses the same normalisation as the BnfParser's href() method.
 */
export function lookupAnchor(
  name: string,
  anchors: Record<string, string>
): string | undefined {
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  for (const [topic, anchor] of Object.entries(anchors)) {
    if (topic.replace(/[^a-z0-9]+/g, "") === key) return anchor;
  }
  return undefined;
}

/**
 * Returns an SVG string for the given BNF syntax string.
 * Must be called in a browser environment (requires `document`).
 *
 * @param syntax   The SYNTAX field from phoenix.csv
 * @param anchors  Map of normalised topic name → anchor id (for cross-links)
 */
/**
 * Returns one or more SVG strings for the given BNF syntax string.
 *
 * Multi-line syntax entries (newline-separated) are split into individual
 * diagrams that stack vertically — matching the original Java-generated
 * output where each continuation line was its own railroad row.
 *
 * NonTerminal boxes (rect without rx/ry) whose text matches a known anchor
 * are wrapped in SVG <a href="#anchor"> elements so they act as native
 * in-page links — no JavaScript needed at runtime.
 *
 * @param syntax   The SYNTAX field from phoenix.csv
 * @param anchors  Map of normalised topic name → anchor id (for cross-links)
 */
export function syntaxToSvg(
  syntax: string,
  anchors: Record<string, string>
): string {
  return splitIntoRows(syntax)
    .map((row) => {
      const toks = tokenise(row);
      const parser = new BnfParser(toks, anchors);
      const svg = parser.buildDiagram().toString();
      return injectAnchorLinks(svg, anchors);
    })
    .join("\n");
}

/**
 * Splits a (possibly multi-line) syntax string into logical diagram rows.
 *
 * Simple newline splitting breaks multi-line entries like Term and Condition
 * where a single grammar rule spans many lines with its brackets unbalanced
 * mid-way, or where continuation alternatives begin with a leading `|`.
 *
 * Rules:
 *   - Accumulate lines until brackets/braces/parens are balanced (depth = 0)
 *     AND the next non-empty line does NOT start with `|` (which would mean
 *     it is a continuation alternative, not a new independent row).
 */
export function splitIntoRows(syntax: string): string[] {
  const rows: string[] = [];
  let current = "";
  let depth = 0;

  const lines = syntax
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const c of line) {
      if (c === "[" || c === "{" || c === "(") depth++;
      else if (c === "]" || c === "}" || c === ")") depth--;
    }

    current = current ? `${current} ${line}` : line;

    const nextLine = lines[i + 1]?.trim() ?? "";
    const nextIsContinuation = nextLine.startsWith("|");

    if (depth === 0 && !nextIsContinuation) {
      rows.push(current);
      current = "";
    }
  }

  if (current) rows.push(current);
  return rows.filter(Boolean);
}

/**
 * Post-processes a railroad SVG string to wrap NonTerminal boxes in
 * SVG <a href="#anchor"> elements.
 *
 * NonTerminal rects have no rx/ry attribute (Terminal rects have rx="10").
 * The regex matches <rect> (no rx) immediately followed by <text> whose
 * content starts with a lowercase letter (= a non-terminal name), then
 * wraps both in <a href="#anchor"> if a matching anchor exists.
 */
function injectAnchorLinks(
  svg: string,
  anchors: Record<string, string>
): string {
  return svg.replace(
    /(<rect\b(?![^>]*\brx\b)[^>]*><\/rect>)(\s*)(<text\b[^>]*>([a-z][a-zA-Z0-9]*)<\/text>)/g,
    (_, rect, ws, textEl, name) => {
      const anchor = lookupAnchor(name, anchors);
      if (!anchor) return `${rect}${ws}${textEl}`;
      return `<a href="#${anchor}">${rect}${ws}${textEl}</a>`;
    }
  );
}
