import express from "express";
import pkg from "body-parser";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

config();
const { json } = pkg;
const app = express();
app.use(json());
app.use(cors());
const MODEL_NAME = "gemini-2.0-flash";
const PORT = process.env.PORT || 3000;

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
    res.json({ message: "Hello from Gemini API!" });
});

app.post("/chat", async (req, res) => {
  const { personality, history, latestMessage } = req.body;

  if (!personality || !latestMessage) {
    return res.status(400).json({ error: "Missing personality or latestMessage" });
  }

  try {
    const model = genai.getGenerativeModel({ model: MODEL_NAME });

    let prompt = `Give the response max upto 100 words only ,can be less than 100 words also as per requirement.You are simulating a person with the following profile:\n\n${JSON.stringify(personality, null, 2)}\n\n`;

    if (history && history.length > 0) {
      prompt += "Conversation so far:\n";
      history.forEach((msg, idx) => {
        prompt += `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.message}\n`;
      });
    }

    prompt += `User: ${latestMessage}\nAgent:`;

    const result = await model.generateContent(prompt);
    const output = result.response.text().trim();

    res.json({ response: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
