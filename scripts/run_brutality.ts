import { $ } from "bun";

console.log("🚀 Starting MD Agent assessment with Gemini...");

// Security guard: Strictly deny modification or creation of maintenance, workflow, and script files
const FORBIDDEN_PATTERNS = [
  ".github",
  "scripts",
  "REVIEW.md",
  "run_brutality",
  "sync.yml",
  "package.json",
  "bun.lock"
];

function isForbiddenFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return FORBIDDEN_PATTERNS.some(pattern => {
    const p = pattern.toLowerCase();
    return normalized === p || normalized.startsWith(`${p}/`) || normalized.includes(p);
  });
}

// 1. Read agent instructions from REVIEW.md (from custom path, /tmp/agent-tools, or current dir)
const reviewFileCandidates = [
  process.env.REVIEW_FILE,
  "/tmp/agent-tools/REVIEW.md",
  "REVIEW.md"
].filter(Boolean) as string[];

let agentInstructions = "";
for (const candidate of reviewFileCandidates) {
  if (await Bun.file(candidate).exists()) {
    agentInstructions = await Bun.file(candidate).text();
    break;
  }
}

if (!agentInstructions) {
  console.error("❌ Could not find REVIEW.md instructions file in any candidate location.");
  process.exit(1);
}

// 2. Discover Changed Files & Git Diff (Ingress)
const beforeSha = process.env.BEFORE_SHA?.trim();
const afterSha = process.env.AFTER_SHA?.trim();

let changedFiles: string[] = [];
let diffText = "";

if (beforeSha && afterSha && beforeSha !== afterSha) {
  try {
    const diffFilesRaw = await $`git diff --name-only ${beforeSha} ${afterSha}`.text();
    changedFiles = diffFilesRaw
      .split("\n")
      .map(f => f.trim().replace(/\\/g, "/"))
      .filter(f => f.endsWith(".md") && !isForbiddenFile(f));
    
    diffText = (await $`git diff ${beforeSha} ${afterSha} -- "*.md"`.text()).trim();
    console.log(`🔍 Detected ${changedFiles.length} changed markdown file(s) between ${beforeSha.slice(0, 7)}..${afterSha.slice(0, 7)}`);
  } catch (err: any) {
    console.warn(`⚠️ Could not diff ${beforeSha}..${afterSha}: ${err.message}. Trying HEAD~1.`);
  }
}

// Fallback: check HEAD~1 if before/after SHA was not provided or produced no diff
if (changedFiles.length === 0) {
  try {
    const diffFilesRaw = await $`git diff --name-only HEAD~1 HEAD`.text();
    changedFiles = diffFilesRaw
      .split("\n")
      .map(f => f.trim().replace(/\\/g, "/"))
      .filter(f => f.endsWith(".md") && !isForbiddenFile(f));
    
    diffText = (await $`git diff HEAD~1 HEAD -- "*.md"`.text()).trim();
    if (changedFiles.length > 0) {
      console.log(`🔍 Detected ${changedFiles.length} changed markdown file(s) in latest commit (HEAD~1..HEAD)`);
    }
  } catch {
    // ignore
  }
}

// If still empty (e.g. forced run with no new commits), inspect key architectural components
if (changedFiles.length === 0) {
  console.log("ℹ️ No specific commit diff detected. Running broad assessment of core components...");
  const glob = new Bun.Glob("**/*.md");
  for await (const file of glob.scan(".")) {
    const normalized = file.replace(/\\/g, "/");
    if (!isForbiddenFile(normalized)) {
      changedFiles.push(normalized);
    }
  }
}

// 3. Tier 3: Complete Revised Text of Modified Files
let modifiedFilesContent = "";
for (const file of changedFiles) {
  if (await Bun.file(file).exists()) {
    const text = await Bun.file(file).text();
    modifiedFilesContent += `\n\n--- Start of Modified File: ${file} ---\n${text}\n--- End of Modified File: ${file} ---\n`;
  }
}

// 4. Tier 4: Discover Impact Radius (Dependent & Referencing Repository Files)
const impactFiles = new Set<string>();
const glob = new Bun.Glob("**/*.md");
const allMarkdownFiles: string[] = [];

for await (const file of glob.scan(".")) {
  const normalized = file.replace(/\\/g, "/");
  if (!isForbiddenFile(normalized) && !changedFiles.includes(normalized)) {
    allMarkdownFiles.push(normalized);
  }
}

for (const changedFile of changedFiles) {
  const baseName = changedFile.split("/").pop()?.replace(/\.md$/, "") || "";
  const slug = changedFile.replace(/^docs\//, "").replace(/\.md$/, "");

  for (const otherFile of allMarkdownFiles) {
    if (impactFiles.has(otherFile)) continue;
    try {
      const otherContent = await Bun.file(otherFile).text();
      if (
        otherContent.includes(changedFile) ||
        (slug && otherContent.includes(slug)) ||
        (baseName && otherContent.includes(baseName))
      ) {
        impactFiles.add(otherFile);
      }
    } catch {
      // ignore read error
    }
  }
}

// Cap impact radius files to 8 to maintain optimal token efficiency (~10k-15k total tokens)
const selectedImpactFiles = Array.from(impactFiles).slice(0, 8);
let impactRadiusContent = "";
if (selectedImpactFiles.length > 0) {
  console.log(`🌐 Resolved Impact Radius: ${selectedImpactFiles.length} dependent/referencing file(s) (${selectedImpactFiles.join(", ")})`);
  for (const file of selectedImpactFiles) {
    const text = await Bun.file(file).text();
    impactRadiusContent += `\n\n--- Start of Dependent File: ${file} ---\n${text}\n--- End of Dependent File: ${file} ---\n`;
  }
} else {
  console.log("🌐 Resolved Impact Radius: No direct cross-referencing files found.");
}

// 5. Tier 1: Global Architectural Constitution & Invariants Context
let globalConstitution = "";
if (await Bun.file("docs/public/llms.txt").exists()) {
  globalConstitution = await Bun.file("docs/public/llms.txt").text();
} else if (await Bun.file("docs/architecture/00-architectural-invariants.md").exists()) {
  globalConstitution = await Bun.file("docs/architecture/00-architectural-invariants.md").text();
}

// 6. Compile 4-Tier Assessment Payload
const contentToAssess = `
=== TIER 1: GLOBAL ARCHITECTURAL CONSTITUTION & 11 INVARIANTS ===
The following is the authoritative specification of the 11 TIDIR Invariants, normative contracts, and component taxonomy:
${globalConstitution}

=== TIER 2: RECENT UPSTREAM MODIFICATIONS (GIT DIFF) ===
The upstream repository recently introduced the following line-by-line diff:
${diffText || "Full file inspection mode (no line diff available)."}

=== TIER 3: FULL REVISED TEXT OF MODIFIED FILES ===
Below is the complete revised content of each modified file:
${modifiedFilesContent}

=== TIER 4: IMPACT RADIUS (DEPENDENT & REFERENCING FILES ACROSS CODEBASE) ===
The following files in the repository directly reference or depend upon the modified files:
${impactRadiusContent || "No direct cross-referencing files found."}
`;

// 7. System Prompt: Direct Gemini using REVIEW.md criteria across the 4-tier payload
const systemPrompt = `${agentInstructions}

IMPORTANT INSTRUCTIONS FOR RECENT UPDATE ASSESSMENT:
You are assessing the recent modifications made to the TIDIR reference architecture based strictly on the criteria, roles, templates, and principles defined in REVIEW.md.

You are provided with a 4-tier context payload:
- TIER 1: The authoritative TIDIR Architectural Constitution (11 Non-Negotiable Invariants) and reference contracts.
- TIER 2: The exact git diff showing what was recently added, edited, or removed.
- TIER 3: The complete text of the modified files.
- TIER 4: The Impact Radius (dependent/referencing repository files that link to or rely upon the modified files).

Assess the changes according to the two-phase assessment defined in REVIEW.md:
1. Framework Alignment: Ensure data models, event logging, and telemetry ingestion strictly align with OCSF. Validate that threat behaviors map to MITRE ATT&CK, countermeasures to MITRE D3FEND, and AI/ML security to MITRE ATLAS.
2. Strict Vendor Neutrality: The architecture must remain 100% open and vendor-neutral. Actively flag and reject commercial product promotions, vendor bias, or proprietary tool lock-in. Focus on capabilities, not specific commercial tools.
3. Cross-Impact & Invariant Integrity: Do the modifications in Tier 2/3 violate any of the 11 Invariants in Tier 1, or break statements, references, or assumptions in the dependent documents in Tier 4?
4. Sanity & Sense Checks: Adhere to established cybersecurity best practices and logical flow.
5. Dual-Agent Action Decision (per REVIEW.md):
   - "issue": Major architectural deviations, framework conflicts, vendor bias, or broken cross-component logic.
   - "pr": Minor typos, broken link repairs, or small wording improvements (provide COMPLETE updated file text).
   - "none": Everything is consistent, sound, and compliant.

STRICT FILE SAFETY RESTRICTIONS:
- Only propose PR updates for documentation files (under docs/ or README.md).
- NEVER propose changes to .github workflows, scripts, or maintenance files (like REVIEW.md or run_brutality.ts).

You MUST respond with ONLY valid JSON matching this schema:
{
  "action": "issue" | "pr" | "none",
  "title": "Short title for the issue or PR (use conventional commits for PRs, e.g. fix(docs): ..., or [RFC] ... for issues)",
  "body": "Detailed markdown body formatted strictly according to the PR or Issue template in REVIEW.md",
  "filesToUpdate": [
    { 
      "path": "path/to/file.md", 
      "content": "The COMPLETE new text for this file (required if action is 'pr')" 
    }
  ]
}

CRITICAL JSON FORMATTING REQUIREMENT:
Your output MUST be strictly valid JSON. Any backslashes (such as in LaTeX math formulas like \\lt, \\le, \\log, or in file paths) MUST be double-escaped as \\\\ inside JSON strings so that invalid escape characters (like \\l) are never produced.`;

// Helper: Sanitize invalid backslash escape sequences and raw control characters inside JSON strings
function sanitizeJsonString(jsonStr: string): string {
  let inString = false;
  let result = "";
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    if (!inString) {
      if (char === '"') inString = true;
      result += char;
    } else {
      if (char === '"') {
        inString = false;
        result += char;
      } else if (char === "\\") {
        const next = jsonStr[i + 1];
        if (next === undefined) {
          result += "\\\\";
        } else if (['"', "\\", "/", "b", "f", "n", "r", "t"].includes(next)) {
          result += "\\" + next;
          i++;
        } else if (next === "u" && /^[0-9a-fA-F]{4}$/.test(jsonStr.slice(i + 2, i + 6))) {
          result += jsonStr.slice(i, i + 6);
          i += 5;
        } else {
          // Invalid escape character (e.g. \l from LaTeX \lt or \le, \a, etc.)
          // Double the backslash so JSON.parse treats it as an escaped backslash literal
          result += "\\\\";
        }
      } else if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else {
        result += char;
      }
    }
  }
  return result;
}

// Helper: Safely extract and parse JSON from model output
function parseAssessmentJson(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.includes("```json")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
  }

  if (!cleaned.startsWith("{") && cleaned.includes("{")) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (initialErr: any) {
    console.warn(`⚠️ Direct JSON parse failed (${initialErr.message}). Attempting automatic escape-character sanitization...`);
    const sanitized = sanitizeJsonString(cleaned);
    try {
      return JSON.parse(sanitized);
    } catch (sanitizedErr: any) {
      console.error("❌ Failed to parse JSON even after sanitization:", sanitizedErr.message);
      console.error("--- RAW MODEL OUTPUT START ---");
      console.error(rawText);
      console.error("--- RAW MODEL OUTPUT END ---");
      throw sanitizedErr;
    }
  }
}

// 4. Call the Gemini API with a Retry Loop
let response;
const maxRetries = 5;
let delay = 60000; // Start with a 60-second wait

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  // Be sure to use your working model version here (e.g. gemini-1.5-flash or whatever you settled on)
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY as string
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: contentToAssess }] }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: {
          type: "OBJECT",
          properties: {
            action: { type: "STRING", enum: ["issue", "pr", "none"] },
            title: { type: "STRING" },
            body: { type: "STRING" },
            filesToUpdate: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  path: { type: "STRING" },
                  content: { type: "STRING" }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["action", "title", "body"]
        }
      }
    })
  });

  if (response.ok) {
    break; // Request succeeded, exit the loop
  }

  const errorText = await response.text();

  // If it's a 503 (Unavailable) or 429 (Rate Limit), try again
  if (response.status === 503 || response.status === 429) {
    console.warn(`⚠️ API busy (Attempt ${attempt}/${maxRetries}): ${response.status}`);

    if (attempt < maxRetries) {
      console.log(`⏳ Waiting ${delay / 1000} seconds before retrying...`);
      await Bun.sleep(delay);
      delay *= 2; // Double the wait time for the next attempt (10s -> 20s -> 40s -> 80s)
    } else {
      console.log("🛑 Max retries reached. Skipping assessment so workflow does not fail.");
      process.exit(0); // Exits with a success code so the GitHub Action passes
    }
  } else {
    // For fatal errors (like bad API keys or malformed JSON), crash immediately
    console.error(`❌ Fatal API Error (${response.status}):`, errorText);
    process.exit(1);
  }
}

if (!response || !response.ok) {
  console.error("❌ Fatal: No successful response received from Gemini API.");
  process.exit(1);
}

const data = await response.json();
const candidate = data.candidates?.[0];
const rawText = candidate?.content?.parts?.[0]?.text;

if (!rawText) {
  console.error("❌ No text content returned by Gemini API. Response payload:", JSON.stringify(data, null, 2));
  process.exit(1);
}

const assessment = parseAssessmentJson(rawText);

// 5. Execute GitHub commands based on the AI's decision
console.log(`🤖 AI Decision: ${(assessment.action || "NONE").toUpperCase()}`);

const repoName = process.env.GITHUB_REPOSITORY;
const targetRepo = process.env.UPSTREAM_REPO || "Haribu/TIDIR";
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || (repoName ? repoName.split("/")[0] : "");
const isDryRun = process.env.DRY_RUN === "true";
const rawFilesToUpdate = Array.isArray(assessment.filesToUpdate) ? assessment.filesToUpdate : [];

if (assessment.action === "issue") {
  if (isDryRun) {
    console.log(`[DRY RUN] 🛡️ Would have created Issue in ${targetRepo}: ${assessment.title}`);
  } else {
    await $`gh issue create --repo ${targetRepo} --title ${assessment.title} --body ${assessment.body}`;
    console.log(`✅ Created Issue in parent repo (${targetRepo}): ${assessment.title}`);
  }

} else if (assessment.action === "pr") {
  const branchName = `agent-updates-${Date.now()}`;
  const headRef = repoOwner ? `${repoOwner}:${branchName}` : branchName;

  // Filter out any attempt to touch maintenance, script, or workflow files
  const safeFilesToUpdate = rawFilesToUpdate.filter((file: { path: string }) => {
    if (isForbiddenFile(file.path)) {
      console.warn(`🛡️ Security filter: Blocked attempt to update forbidden/maintenance file in PR: ${file.path}`);
      return false;
    }
    return true;
  });

  if (safeFilesToUpdate.length === 0) {
    console.log("ℹ️ No eligible documentation files to update. Skipping PR creation.");
    process.exit(0);
  }

  if (isDryRun) {
    console.log(`[DRY RUN] 🛡️ Would have created PR to ${targetRepo} from branch: ${headRef}`);
    console.log(`[DRY RUN] 🛡️ PR Title: ${assessment.title}`);
    console.log(`[DRY RUN] 🛡️ Files it wanted to update: ${safeFilesToUpdate.map((f: any) => f.path).join(', ')}`);
  } else {
    await $`git checkout -b ${branchName}`;

    for (const file of safeFilesToUpdate) {
      await Bun.write(file.path, file.content);
      console.log(`✏️ Updated: ${file.path}`);
      await $`git add ${file.path}`;
    }

    const stagedChanges = (await $`git diff --cached --name-only`.text()).trim();
    if (!stagedChanges) {
      console.log("⚠️ No staged file changes detected after applying updates. Skipping commit and PR creation.");
      process.exit(0);
    }

    // Safety assertion: ensure zero forbidden files leaked into staged changes
    const stagedList = stagedChanges.split("\n").map(s => s.trim()).filter(Boolean);
    const forbiddenStaged = stagedList.filter(f => isForbiddenFile(f));
    if (forbiddenStaged.length > 0) {
      console.error(`❌ Security Violation: Staged changes contain forbidden maintenance files: ${forbiddenStaged.join(", ")}`);
      process.exit(1);
    }

    await $`git config user.name "github-actions[bot]"`;
    await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
    await $`git commit -m ${assessment.title}`;
    await $`git push -u origin ${branchName}`;

    await $`gh pr create --repo ${targetRepo} --base main --title ${assessment.title} --body ${assessment.body} --head ${headRef}`;
    console.log(`✅ Created Pull Request on ${targetRepo}: ${assessment.title}`);
  }

} else {
  console.log("✅ Assessment passed. No action required.");
}

// 6. Ensure the markdown body is printed so the GitHub Action captures it for the Summary
console.log(assessment.body || "No assessment body provided.");
