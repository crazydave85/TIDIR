import { $ } from "bun";

console.log("🚀 Starting MD Agent assessment with Gemini...");

// 1. Read agent instructions from the new REVIEW.md file
const agentInstructions = await Bun.file("REVIEW.md").text();

// 2. Dynamically read all Markdown files in the newly synced 'main' branch
const glob = new Bun.Glob("**/*.md");
let contentToAssess = "";
for await (const file of glob.scan(".")) {
  // Exclude the REVIEW.md file and hidden/system folders from the assessment
  if (file === "REVIEW.md" || file.startsWith(".github/") || file.includes("node_modules")) continue; 
  const fileContent = await Bun.file(file).text();
  contentToAssess += `\n\n--- Start of ${file} ---\n${fileContent}\n--- End of ${file} ---\n`;
}

// 3. System Prompt: Force JSON output so the script can route the decision
const systemPrompt = `${agentInstructions}

IMPORTANT INSTRUCTIONS:
Assess the provided markdown files based on the REVIEW.md criteria. 
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
}`;
// 3. Call the Gemini API with a Retry Loop
let response;
const maxRetries = 5;
let delay = 10000; // Start with a 10-second wait

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  // Be sure to use your working model version here (e.g. gemini-1.5-flash or whatever you settled on)
  response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY as string
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: contentToAssess }] }],
      generationConfig: { response_mime_type: "application/json" } 
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

const data = await response.json();
const assessment = JSON.parse(data.candidates[0].content.parts[0].text);
// 5. Execute GitHub commands based on the AI's decision
console.log(`🤖 AI Decision: ${assessment.action.toUpperCase()}`);

const repoName = process.env.GITHUB_REPOSITORY;
const isDryRun = process.env.DRY_RUN === "true";

if (assessment.action === "issue") {
  if (isDryRun) {
    console.log(`[DRY RUN] 🛡️ Would have created Issue in Haribu/TIDIR: ${assessment.title}`);
  } else {
    await $`gh issue create --repo Haribu/TIDIR --title ${assessment.title} --body ${assessment.body}`;
    console.log(`✅ Created Issue in parent repo: ${assessment.title}`);
  }

} else if (assessment.action === "pr") {
  const branchName = `agent-updates-${Date.now()}`;
  
  if (isDryRun) {
    console.log(`[DRY RUN] 🛡️ Would have created PR to Haribu/TIDIR from branch: ${branchName}`);
    console.log(`[DRY RUN] 🛡️ PR Title: ${assessment.title}`);
    console.log(`[DRY RUN] 🛡️ Files it wanted to update: ${assessment.filesToUpdate.map((f: any) => f.path).join(', ')}`);
  } else {
    await $`git checkout -b ${branchName}`;

    for (const file of assessment.filesToUpdate) {
      await Bun.write(file.path, file.content);
      console.log(`✏️ Updated: ${file.path}`);
    }

    await $`git config user.name "github-actions[bot]"`;
    await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
    await $`git add .`;
    await $`git commit -m ${assessment.title}`;
    await $`git push origin ${branchName}`;
    
    await $`gh pr create --repo Haribu/TIDIR --base main --title ${assessment.title} --body ${assessment.body} --head ${branchName}`;
    console.log(`✅ Created Pull Request: ${assessment.title}`);
  }

} else {
  console.log("✅ Assessment passed. No action required.");
}

// 6. Ensure the markdown body is printed so the GitHub Action captures it for the Summary
console.log(assessment.body);
