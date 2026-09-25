import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

console.log("🔍 Checking documentation structure and navigation congruence...\n");

let errors: string[] = [];

// 1. Read VitePress config to extract all navigation links
const configContent = readFileSync("docs/.vitepress/config.ts", "utf-8");
const linkRegex = /link:\s*["']([^"']+)["']/g;
const configuredLinks = new Set<string>();
let match;
while ((match = linkRegex.exec(configContent)) !== null) {
  // Normalize links by removing trailing slashes and ensuring leading slash
  let l = match[1].trim();
  if (l.startsWith("http")) continue;
  if (!l.startsWith("/")) l = "/" + l;
  configuredLinks.add(l);
  if (l.endsWith("/")) {
    configuredLinks.add(l.slice(0, -1));
  } else {
    configuredLinks.add(l + "/");
  }
}

// 2. Validate Architectural Decision Records (ADRs)
const adrDir = "docs/adr";
const adrFiles = readdirSync(adrDir)
  .filter((f) => f.startsWith("0") && f.endsWith(".md"))
  .sort();

const adrIndexContent = readFileSync("docs/adr/index.md", "utf-8");

// Check ADR index count
const countMatch = adrIndexContent.match(/Total Decisions:\s*(\d+)/i);
if (!countMatch) {
  errors.push("❌ Could not find 'Total Decisions: <N>' header in docs/adr/index.md");
} else {
  const reportedCount = parseInt(countMatch[1], 10);
  if (reportedCount !== adrFiles.length) {
    errors.push(
      `❌ ADR count mismatch in docs/adr/index.md: reports ${reportedCount}, but ${adrFiles.length} ADR files exist.`
    );
  }
}

// Check each ADR file is linked in docs/adr/index.md and in VitePress config sidebar
for (const adrFile of adrFiles) {
  const baseName = adrFile.replace(/\.md$/, "");
  const adrLink = `/adr/${baseName}`;

  // Check docs/adr/index.md
  if (!adrIndexContent.includes(adrFile) && !adrIndexContent.includes(baseName)) {
    errors.push(`❌ ADR file '${adrFile}' is missing from the registry table in docs/adr/index.md`);
  }

  // Check VitePress sidebar navigation
  if (!configuredLinks.has(adrLink)) {
    errors.push(`❌ ADR '${adrFile}' is missing from the sidebar navigation in docs/.vitepress/config.ts (expected: ${adrLink})`);
  }
}

// 3. Check for Orphaned Architecture Specifications
function findMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (item.isFile() && item.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

const architectureFiles = findMarkdownFiles("docs/architecture");
for (const file of architectureFiles) {
  // Convert filepath to VitePress route, e.g. "docs/architecture/01-system-overview.md" -> "/architecture/01-system-overview"
  const route = "/" + file.replace(/^docs\//, "").replace(/\.md$/, "");
  if (!configuredLinks.has(route)) {
    errors.push(`❌ Architecture document '${file}' is orphaned: not linked in docs/.vitepress/config.ts navigation (route: ${route})`);
  }
}

// 4. Assert Zero Local Filesystem Paths or file:/// URLs in Documentation
const allDocs = findMarkdownFiles("docs");
const localPathRegex = /(?:file:\/\/\/|\/(?:Users|home)\/[a-zA-Z0-9_-]+|[A-Za-z]:\\(?:Users|home)\\[a-zA-Z0-9_-]+)/;

for (const docFile of allDocs) {
  const content = readFileSync(docFile, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (localPathRegex.test(line)) {
      errors.push(
        `❌ Local filesystem path or file:/// URL detected in '${docFile}' (line ${i + 1}): ${line.trim()}`
      );
    }
  }
}

// Summary Output
if (errors.length > 0) {
  console.error("❌ Documentation structure violations detected:\n");
  for (const err of errors) {
    console.error(`  ${err}`);
  }
  console.error("\nPlease update docs/adr/index.md, docs/.vitepress/config.ts, or clean up local paths to resolve these discrepancies.\n");
  process.exit(1);
} else {
  console.log(`✅ All ${adrFiles.length} ADRs are registered in index.md and wired into navigation.`);
  console.log(`✅ All ${architectureFiles.length} architecture specifications are linked in navigation.`);
  console.log(`✅ Audited ${allDocs.length} markdown documents: zero local filesystem paths or file:/// URLs detected.`);
  console.log("🎉 Documentation structure and navigation are fully congruent!\n");
}
