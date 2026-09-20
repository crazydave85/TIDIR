#!/usr/bin/env bun
/**
 * lint-docs-math.ts
 *
 * Verifies that the built VitePress HTML files contain zero:
 * 1. Empty <mjx-container> nodes
 * 2. Unrendered MathJax error containers (data-mml-node="merror")
 * 3. Broken or unescaped math placeholders
 */

import fs from "fs";
import path from "path";

const DIST_DIR = path.resolve(import.meta.dir, "../docs/.vitepress/dist");

if (!fs.existsSync(DIST_DIR)) {
  console.error("❌ Error: docs/.vitepress/dist does not exist. Run 'bun ./scripts/build-docs.ts' first.");
  process.exit(1);
}

let totalFilesChecked = 0;
let errorsFound = 0;

function checkHtmlFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  totalFilesChecked++;
  const relativePath = path.relative(DIST_DIR, filePath);

  // Check 1: MathJax merror nodes
  if (content.includes('data-mml-node="merror"')) {
    console.error(`❌ [MathJax Syntax Error] in ${relativePath}: contains data-mml-node="merror"`);
    errorsFound++;
  }

  // Check 2: Empty mjx-container nodes (missing SVG or empty innerHTML)
  const containers = content.match(/<mjx-container[\s\S]*?<\/mjx-container>/g) || [];
  for (const c of containers) {
    if (!c.includes("<svg") || c.length < 60) {
      console.error(`❌ [Empty Math Container] in ${relativePath}: <mjx-container> has no SVG or content: ${c.substring(0, 100)}`);
      errorsFound++;
    }
  }

  // Check 3: Raw LaTeX math comparison bugs (e.g. $< or $> that got mangled into tags)
  if (content.includes("target: false positive rate )") || content.includes("target: false-positive rate )")) {
    console.error(`❌ [Missing Value Regression] in ${relativePath}: target false-positive rate value missing`);
    errorsFound++;
  }

  // Check 4: Empty parameter paren leaks (e.g. ">( )<" or ">()<" in HTML from stripped inline math)
  if (/>\s*\(\s*\)\s*</.test(content)) {
    console.error(`❌ [Empty Parameter Paren Leak] in ${relativePath}: contains empty parentheses in text node`);
    errorsFound++;
  }

  // Check 5: Unrendered raw math delimiters leaking into HTML
  if (content.includes("$\\le") || content.includes("$\\lt") || content.includes("$\\ge") || content.includes("$\\gt")) {
    console.error(`❌ [Unrendered Math Delimiter Leak] in ${relativePath}: contains unrendered raw math dollar expressions`);
    errorsFound++;
  }

  // Check 6: Swallowed math or fragmented TeX comments in text nodes
  if (
    content.includes("( or {") ||
    content.includes("Over  of all") ||
    content.includes("True Positive Rate ( )") ||
    content.includes("True Negative Rate ( )")
  ) {
    console.error(`❌ [Swallowed Math Regression] in ${relativePath}: contains fragmented or swallowed math text`);
    errorsFound++;
  }
}

function traverse(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      checkHtmlFile(fullPath);
    }
  }
}

console.log("🔍 Rigorously auditing compiled HTML for MathJax rendering errors & missing parameters...");
traverse(DIST_DIR);

console.log("========================================");
console.log(`Total HTML files audited: ${totalFilesChecked}`);
console.log(`Errors found: ${errorsFound}`);
console.log("========================================");

if (errorsFound > 0) {
  console.error("💥 Documentation HTML validation failed!");
  process.exit(1);
} else {
  console.log("🎉 All documentation math and parameter expressions verified clean!");
  process.exit(0);
}
