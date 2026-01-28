import express from "express";
import cors from "cors";

const app = express();

app.use(cors());          // allow requests from your React dev server
app.use(express.json());  // parse JSON bodies

app.post("/generate", async (req, res) => {
  const { industry, city, years } = req.body;

  const prompt = `
Write a warm, professional "About Me" paragraph for a ${industry} company in ${city} with ${years} years of experience.
Tone: trustworthy, friendly, confident.
Length: 120–160 words.
  `;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  res.json({ about: data.message.content });
});

app.listen(3000, () => {
  console.log("Service Scribe backend running on http://localhost:3000");
});
