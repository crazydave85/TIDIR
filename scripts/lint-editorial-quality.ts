import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

console.log("🔍 Running TIDIR Editorial & Information-Quality Audit...\n");

let errors: string[] = [];
let warnings: string[] = [];
let notices: string[] = [];

// 1. Prohibited Marketing Absolutes & Known False Claims (ERROR)
const absoluteErrorRules = [
  {
    regex: /\b(eliminates?|eliminating)\s+hallucinations?\b/gi,
    message: "Claims absolute elimination of hallucinations (prefer: 'reduces unsupported recommendations via evidence grounding')"
  },
  {
    regex: /\b(absolute|complete)\s+data\s+sovereignty\b/gi,
    message: "Claims absolute data sovereignty (prefer: 'on-premises data boundary enforcement via sovereign clusters')"
  },
  {
    regex: /\b(solves?|solving)\s+the\s+base\s+rate\s+fallacy\b/gi,
    message: "Claims solving the base rate fallacy (prefer: 'mitigates operational consequences of the base rate fallacy')"
  },
  {
    regex: /\bguarantees?\s+zero\s+data\s+loss\b/gi,
    message: "Claims guaranteed zero data loss (prefer: 'designed to prevent telemetry loss via local NVMe spooling')"
  },
  {
    regex: /\bzero-risk\s+response\s+automation\b/gi,
    message: "Claims zero-risk response automation (prefer: 'blast-radius bounded response automation')"
  },
  {
    regex: /\b(guarantees?|guaranteeing)\s+100%\s+detection\b/gi,
    message: "Claims 100% detection guarantee"
  },
  {
    regex: /\bmathematically\s+indisputable\b/gi,
    message: "Rhetorical claim 'mathematically indisputable' (prefer: 'high-confidence, directly attributable' or 'cryptographically verifiable')"
  },
  {
    regex: /\bzero\s+censorship\b/gi,
    message: "Provocative/rhetorical phrasing 'zero censorship' (prefer: 'provider-independent defensive analysis')"
  },
  {
    regex: /\bmathematical\s+non-repudiation\b/gi,
    message: "Overstrong claim 'mathematical non-repudiation' (prefer: 'cryptographic tamper evidence' or 'integrity & reconstructability')"
  }
];

// 2. Editorial Warnings (WARNING — Likely editorial defect or overstrong claim)
const warningRules = [
  {
    regex: /\bsolves?\s+(these|the)\s+problems?\b/gi,
    message: "Overstrong claim 'solves these problems' (prefer: 'addresses these problems by...')"
  },
  {
    regex: /\bcatastrophic\s+blind\s+spots?\b/gi,
    message: "Theatrical phrasing 'catastrophic blind spots' (prefer: 'loss of defensive visibility')"
  },
  {
    regex: /\bmaster\s+(kill-switch|kill\s+switch)\b/gi,
    message: "Sci-fi/dramatic terminology 'master kill-switch' (prefer: 'cryptographically authenticated emergency stop')"
  },
  {
    regex: /\bguarantee\s+operational\s+continuity\b/gi,
    message: "Overstrong claim 'guarantee operational continuity' (prefer: 'preserve analytical capability' or 'improve operational continuity')"
  },
  {
    regex: /\benterprise-grade\b/gi,
    message: "Vague corporate adjective 'enterprise-grade'"
  },
  {
    regex: /\bworld-class\b/gi,
    message: "Marketing fluff 'world-class'"
  },
  {
    regex: /\brevolutionary\b/gi,
    message: "Marketing fluff 'revolutionary'"
  },
  {
    regex: /\b(delve|delving|tapestry|testament|seamlessly|plethora|myriad|paramount|supercharge|supercharging|unleash|unleashing)\b/gi,
    message: "High-probability AI writing cliché / marker"
  },
  {
    regex: /\b(leverage|leveraging|leveraged|leverages)\b/gi,
    message: "Corporate buzzword 'leverage' (prefer: 'use', 'apply', or 'exploit')"
  },
  {
    regex: /\b(utilize|utilizing|utilized|utilizes)\b/gi,
    message: "Stilted word 'utilize' (prefer: 'use')"
  },
  {
    regex: /\bcrown\s+jewels?\b/gi,
    message: "Corporate metaphor 'crown jewel(s)' (prefer: 'Tier 0 mission-critical assets' or 'critical infrastructure')"
  },
  {
    regex: /\b(furthermore|moreover)\b/gi,
    message: "Stilted essay connective (prefer direct sentence flow)"
  },
  {
    regex: /\b(paves?\s+the\s+way|vital\s+role|at\s+the\s+forefront\s+of|serves?\s+as\s+a\s+reminder)\b/gi,
    message: "Vacuous rhetorical cliché"
  },
  {
    regex: /\b(not\s+only\b.+\bbut\s+also|in\s+today['’]s\b|at\s+the\s+end\s+of\s+the\s+day\b|when\s+all\s+is\s+said\s+and\s+done\b)\b/gi,
    message: "Rhetorical connective / cliché (prefer direct factual exposition)"
  }
];

// 3. Reviewer Prompts / Notices (NOTICE)
// a) Empirical assertions requiring citation or qualification
const empiricalNoticeRules = [
  {
    regex: /\b(research shows|studies demonstrate|frequently causes|industry evidence suggests|humans are more likely to|models tend to)\b/gi,
    message: "Empirical assertion detected: citation or explicit qualification recommended"
  }
];

// b) High-density hyphenated noun stacks in prose (4+ words linked with hyphens)
const hyphenStackRegex = /\b[a-zA-Z]+-[a-zA-Z]+-[a-zA-Z]+-[a-zA-Z]+(-[a-zA-Z]+)*\b/g;

// Helper to crawl docs
function findFiles(dir: string, extensions: string[], fileList: string[] = []): string[] {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      if (item !== "node_modules" && item !== ".git" && item !== ".vitepress" && item !== "dist") {
        findFiles(fullPath, extensions, fileList);
      }
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Read glossary and foundations to whitelist known terms
let knownGlossaryTerms = new Set<string>();
try {
  const glossaryRaw = readFileSync("config/glossary.json", "utf-8");
  const glossary = JSON.parse(glossaryRaw);
  if (!glossary.terms || glossary.terms.length < 5) {
    errors.push("❌ config/glossary.json has insufficient term count (< 5)");
  }
  for (const t of glossary.terms) {
    if (!t.id || !t.term || !t.classification || !t.plain_english || !t.technical_definition) {
      errors.push(`❌ Glossary term '${t.id || "unknown"}' is missing required fields`);
    }
    if (t.term) {
      knownGlossaryTerms.add(t.term.toLowerCase());
    }
  }
} catch (e: any) {
  errors.push(`❌ Failed to read or parse config/glossary.json: ${e.message}`);
}

// Foundations Registry validation
try {
  const foundationsRaw = readFileSync("config/foundations.json", "utf-8");
  const foundations = JSON.parse(foundationsRaw);
  if (!foundations.foundations || foundations.foundations.length < 10) {
    errors.push("❌ config/foundations.json has insufficient foundation count (< 10)");
  }
  for (const f of foundations.foundations) {
    if (!f.id || !f.topic || !f.classification || !f.claim_supported || !f.citation || !f.canonical_url || !f.applies_to) {
      errors.push(`❌ Foundation entry '${f.id || "unknown"}' is missing required fields`);
    }
  }
} catch (e: any) {
  errors.push(`❌ Failed to read or parse config/foundations.json: ${e.message}`);
}

const targetFiles = findFiles("docs", [".md"]);

// Candidate concepts across corpus for new-concept detection
const multiWordConceptCounts = new Map<string, { count: number; files: Set<string>; lineInfo: string }>();

// Pattern for 3+ capitalized words in sequence (e.g. "Adaptive Evidential Confidence Boundary")
const candidateConceptRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,4}\b/g;

// Common non-concept phrase words to ignore
const commonEnglishStarters = new Set([
  "the", "this", "that", "these", "those", "when", "while", "where", "before", "after",
  "in", "on", "at", "for", "with", "without", "between", "under", "over", "each", "every",
  "figure", "table", "step", "section", "part", "tier", "domain", "layer", "service"
]);

for (const file of targetFiles) {
  // Skip 00-architectural-invariants.md for claims rules since it explicitly lists prohibited marketing absolutes
  const isInvariantDoc = file.includes("00-architectural-invariants.md");

  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");

  // Track heading numbers within parent scope
  const sectionNumbersByLevel = new Map<number, number[]>();
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Check heading numbering sequence
    const headingMatch = line.match(/^(#{2,4})\s+(\d+)\.\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const num = parseInt(headingMatch[2], 10);

      // Clear child level tracking when entering new parent heading
      for (const existingLevel of Array.from(sectionNumbersByLevel.keys())) {
        if (existingLevel > level) {
          sectionNumbersByLevel.delete(existingLevel);
        }
      }

      const existing = sectionNumbersByLevel.get(level) || [];
      if (existing.includes(num)) {
        errors.push(`❌ [Heading Numbering] ${file}:${lineNum} — Duplicate section number ${num} under same scope: '${line.trim()}'`);
      }
      existing.push(num);
      sectionNumbersByLevel.set(level, existing);
    } else if (line.match(/^#{2,4}\s+/)) {
      // Unnumbered heading resets child numbered lists
      const level = line.match(/^(#{2,4})\s+/)?.[1].length || 2;
      for (const existingLevel of Array.from(sectionNumbersByLevel.keys())) {
        if (existingLevel >= level) {
          sectionNumbersByLevel.delete(existingLevel);
        }
      }
    }

    // 0. Check formatting and punctuation AI markers
    if (/^#{1,6}\s+.*[🚀💡🔍⚡🔥✨🎉🎯📌🤖🧠📈🛡️]/u.test(line)) {
      warnings.push(`⚠️ [Formatting / AI Marker] ${file}:${lineNum} — Decorative emoji in markdown heading (prefer clean technical headings)`);
    }

    if (/^#{1,6}\s+(Conclusion|Summary|In Summary|Key Takeaways?|Wrapping Up)\b/i.test(line)) {
      warnings.push(`⚠️ [Formatting / AI Marker] ${file}:${lineNum} — Formulaic closing heading (prefer descriptive technical headings)`);
    }

    if (/^[*-]\s+.*;\s*(and|or)?\s*$/i.test(line)) {
      warnings.push(`⚠️ [Formatting / AI Marker] ${file}:${lineNum} — Semicolon-terminated bullet point (prefer clean sentences or comma lists)`);
    }

    if (!line.includes("|") && !line.includes("classDef") && !line.includes("http")) {
      const emCount = (line.match(/—/g) || []).length;
      if (emCount >= 3) {
        warnings.push(`⚠️ [Punctuation / AI Marker] ${file}:${lineNum} — Excessive em-dashes (≥ 3) on a single line`);
      }
    }

    if (/[«»‹›]/.test(line)) {
      warnings.push(`⚠️ [Punctuation / AI Marker] ${file}:${lineNum} — Non-standard guillemet quotation mark (prefer standard English quotes or markdown italics)`);
    }

    if (!isInvariantDoc) {
      // 1. Check claims discipline (Hard Errors)
      for (const rule of absoluteErrorRules) {
        if (rule.regex.test(line)) {
          errors.push(`❌ [Claims Error] ${file}:${lineNum} — ${rule.message}`);
        }
      }
    }

    // 2. Check editorial warnings (Likely editorial problems)
    for (const rule of warningRules) {
      if (rule.regex.test(line)) {
        warnings.push(`⚠️ [Editorial Warning] ${file}:${lineNum} — ${rule.message}`);
      }
    }

    // 3. Check empirical claim prompts (NOTICES)
    for (const rule of empiricalNoticeRules) {
      const match = line.match(rule.regex);
      if (match) {
        notices.push(`ℹ️ [Notice / Citation] ${file}:${lineNum} — Empirical claim '${match[0]}': citation or qualification recommended.`);
      }
    }

    // 4. Check hyphen stacks (clean line of markdown links, URLs, and code)
    if (!line.trim().startsWith("```") && !line.includes("classDef") && !line.includes("http")) {
      const allowedHyphenStacks = new Set([
        "state-of-record",
        "zero-data-egress",
        "end-to-end",
        "human-in-the-loop",
        "software-as-a-service",
        "living-off-the-land",
        "llm-as-a-judge",
        "model-as-a-judge",
        "out-of-the-box",
        "write-once-read-many",
        "mean-time-to-detect",
        "architecture-at-a-glance",
        "needle-in-a-haystack",
        "out-of-the-loop"
      ]);

      const cleanLine = line
        .replace(/<[^>]+>/g, "")                  // strip HTML tags
        .replace(/\([^)]+\)/g, "")                 // strip link URLs and parenthetical paths
        .replace(/\[[^\]]+\]/g, "")                // strip markdown link labels
        .replace(/`[^`]+`/g, "");                 // strip inline code

      const matches = cleanLine.match(hyphenStackRegex);
      if (matches) {
        for (const m of matches) {
          if (!allowedHyphenStacks.has(m.toLowerCase())) {
            warnings.push(`⚠️ [Hyphen Stack] ${file}:${lineNum} — High hyphen stack '${m}' in prose`);
          }
        }
      }
    }

    // 5. Detect repeated candidate multi-word architectural concepts
    if (!line.trim().startsWith("#") && !line.trim().startsWith("```") && !line.includes("http") && !line.includes("github.com")) {
      const conceptMatches = line.match(candidateConceptRegex);
      if (conceptMatches) {
        for (const phrase of conceptMatches) {
          const words = phrase.split(/\s+/);
          const firstWord = words[0].toLowerCase();
          if (commonEnglishStarters.has(firstWord)) continue;
          if (phrase.includes("Cyber Threat Intelligence") || phrase.includes("Incident Response") || phrase.includes("Open Cybersecurity Schema")) continue;

          const lower = phrase.toLowerCase();
          if (!knownGlossaryTerms.has(lower)) {
            const current = multiWordConceptCounts.get(phrase) || { count: 0, files: new Set(), lineInfo: `${file}:${lineNum}` };
            current.count += 1;
            current.files.add(file);
            multiWordConceptCounts.set(phrase, current);
          }
        }
      }
    }
  }
}

// Evaluate candidate concepts that appear repeatedly (>= 4 times across multiple files) and are not in glossary
for (const [phrase, info] of multiWordConceptCounts.entries()) {
  if (info.count >= 4 && info.files.size >= 2) {
    notices.push(`ℹ️ [Notice / Nomenclature Budget] ${info.lineInfo} (and ${info.count - 1} other places) — Uncatalogued multi-word concept '${phrase}'. If intentional, add to config/glossary.json with Established/Adapted/TIDIR-specific classification. Otherwise, consider ordinary language.`);
  }
}

console.log(`Audited ${targetFiles.length} documentation files.\n`);

if (notices.length > 0) {
  console.log(`ℹ️ Reviewer Notices (${notices.length}):`);
  notices.slice(0, 10).forEach((n) => console.log(`  ${n}`));
  if (notices.length > 10) {
    console.log(`  ... and ${notices.length - 10} more notices.`);
  }
  console.log("");
}

if (warnings.length > 0) {
  console.warn(`⚠️ Editorial Warnings (${warnings.length}):`);
  warnings.forEach((w) => console.warn(`  ${w}`));
  console.log("");
}

if (errors.length > 0) {
  console.error(`❌ Editorial Quality Errors (${errors.length}):`);
  errors.forEach((e) => console.error(`  ${e}`));
  console.log("");
  process.exit(1);
} else {
  console.log("🎉 Zero claims discipline, glossary, or structural violations found!");
}
