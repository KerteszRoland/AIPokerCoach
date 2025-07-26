import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

export async function promptAI(prompt: string) {
  /*const aiResponseExample = fs.readFileSync(
    "./src/server/prompts/review_example.txt",
    "utf8"
  );
  return aiResponseExample;
  */

  dotenv.config();
  if (!process.env.GOOGLE_GEMINI_API) {
    throw new Error("GOOGLE_GEMINI_API is not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001", //"gemini-2.5-pro",
    tools: [],
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
