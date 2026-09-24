import { $ } from "bun";

console.log("🚀 Starting MD Agent assessment with Gemini...");

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

// 2. Dynamically read all Markdown files in the newly synced 'main' branch
const glob = new Bun.Glob("**/*.md");
let contentToAssess = "";
for await (const file of glob.scan(".")) {
  const normalized = file.replace(/\\/g, "/");
  // Exclude REVIEW.md, workflows, scripts, and system folders from assessment
  if (
    normalized === "REVIEW.md" ||
    normalized.startsWith(".github/") ||
    normalized.startsWith("scripts/") ||
    normalized.includes("node_modules")
  ) continue;
  const fileContent = await Bun.file(file).text();
  contentToAssess += `\n\n--- Start of ${file} ---\n${fileContent}\n--- End of ${file} ---\n`;
}

// 3. System Prompt: Force JSON output so the script can route the decision
const systemPrompt = `${agentInstructions}

IMPORTANT INSTRUCTIONS:
Assess the provided markdown files based on the REVIEW.md criteria. 
- Only suggest updates for documentation files (such as files under docs/ or README.md). 
- STRICTLY FORBIDDEN: NEVER suggest updates or create files for GitHub workflows (.github/**), automation scripts (scripts/**), or maintenance files (like REVIEW.md or run_brutality.ts).
- If you find major architectural deviations or issues that require discussion, set action to "issue".
- If you find minor typos or quick fixes that don't need discussion, set action to "pr" and provide the COMPLETE updated content for the files that need changing.
- If everything is perfect, set action to "none".

You MUST respond with ONLY valid JSON matching this schema:
{
  "action": "issue" | "pr" | "none",
  "title": "Short title for the issue or PR",
  "body": "Detailed markdown body for the issue/PR explaining the assessment...",
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
