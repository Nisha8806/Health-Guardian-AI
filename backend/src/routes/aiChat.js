import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const prompt = `
You are Health Guardian AI.

Rules:
- Answer only health, fitness, nutrition, medicines, lifestyle and wellness questions.
- Give simple English.
- Do not diagnose diseases with certainty.
- If symptoms are serious, advise consulting a doctor.
- Keep answers under 200 words.

User Question:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response.text;

    // Save user message
    await query(
      `INSERT INTO chat_history(user_id,message,is_user)
       VALUES($1,$2,true)`,
      [req.userId, message]
    );

    // Save AI reply
    await query(
      `INSERT INTO chat_history(user_id,message,is_user)
       VALUES($1,$2,false)`,
      [req.userId, reply]
    );

    res.json({
      reply,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

export default router;