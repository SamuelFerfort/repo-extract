import OpenAI from "openai";

if (!process.env.AI_API_KEY) {
  throw new Error("Missing AI_API_KEY environment variable");
}

if (!process.env.AI_BASE_URL) {
  throw new Error("Missing AI_BASE_URL environment variable");
}

export const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});