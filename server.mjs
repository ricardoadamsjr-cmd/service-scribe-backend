import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "Mode is required" });
    }

    // --- MODE: ABOUT US ---
    if (mode === "about") {
      const { industry, city, years } = req.body;
      if (!industry || !city || !years) {
        return res.status(400).json({ error: "Please fill out all fields: industry, city, and years" });
      }

      const prompt = `Write a warm, professional "About Us" paragraph for a ${industry} company in ${city} with ${years} years of experience. Tone: trustworthy, friendly, confident. Length: 120–160 words.`;
      const aiResponse = await callOllama(prompt);
      return res.json({ about: aiResponse });
    }

    // --- MODE: RESPONDER ---
    if (mode === "responder") {
      const { originalPost, comment, tone } = req.body;
      if (!originalPost || !comment || !tone) {
        return res.status(400).json({ error: "Please fill out all fields: original post, comment, and tone" });
      }

      const prompt = `You are a helpful social media assistant. Write a reply to a comment.\n\nORIGINAL POST:\n${originalPost}\n\nCOMMENT TO REPLY TO:\n${comment}\n\nREPLY TONE: ${tone}\n\nWrite a helpful, engaging reply in the specified tone. Keep it concise (2-3 sentences).`;
      const aiResponse = await callOllama(prompt);
      return res.json({ reply: aiResponse });
    }

    // --- MODE: SENTIMENT (NEW) ---
    if (mode === "sentiment") {
      const { rawComments } = req.body;
      if (!rawComments) {
        return res.status(400).json({ error: "Please provide the text/comments to analyze" });
      }

      const prompt = `
        You are a sentiment analysis expert. I am going to provide a block of text that is a raw copy-paste from a social media page or website. 
        
        TASK:
        1. Ignore all "noise" like timestamps, "Reply" buttons, "Like" counts, and usernames.
        2. Identify the actual user comments and reviews.
        3. Provide a sentiment breakdown in percentage (e.g., 80% Positive, 20% Negative).
        4. Provide a very short summary (max 2 sentences) of the overall feedback.

        RAW TEXT:
        ${rawComments}

        FORMAT YOUR RESPONSE LIKE THIS:
        SENTIMENT: [Percentage Breakdown]
        SUMMARY: [Your 2-sentence summary]
      `;

      const aiResponse = await callOllama(prompt);
      return res.json({ sentiment: aiResponse });
    }

    return res.status(400).json({ error: "Invalid mode." });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * Helper function to talk to Ollama
 */
async function callOllama(prompt) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      messages: [{ role: "user", content: prompt }],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.message?.content || data?.response || "No response generated from AI.";
}

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});