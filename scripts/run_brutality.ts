// 1. Read your agent instructions from your Markdown file
const agentInstructions = await Bun.file("AGENTS.md").text();

// 2. Read the content of the files that were just updated
// For a basic test, we'll just send a placeholder string
const contentToAssess = "Simulated content of updated markdown files..."; 

console.log("🚀 Starting MD Agent assessment with Gemini...");

// 3. Call the Gemini API using native fetch
const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Pass the API key via the x-goog-api-key header
    "x-goog-api-key": process.env.GEMINI_API_KEY as string 
  },
  body: JSON.stringify({
    // Gemini separates the system prompt into its own object
    systemInstruction: {
      parts: [{ text: agentInstructions }]
    },
    // The actual user prompt goes into the contents array
    contents: [
      {
        role: "user",
        parts: [{ text: `Please assess the following updates:\n\n${contentToAssess}` }]
      }
    ]
  })
});

if (!response.ok) {
  // Capturing response.text() helps debug specific Gemini API errors (like quota limits)
  console.error("❌ API request failed:", response.statusText, await response.text());
  process.exit(1); 
}

const data = await response.json();
// Gemini's response structure differs slightly from OpenAI's
const assessment = data.candidates[0].content.parts[0].text;

// 4. Output the result so the GitHub Action can capture it
console.log(assessment);
