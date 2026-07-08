import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    res.json({
      reply: result.text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Gemini API Error",
    });
  }
});

export default router;