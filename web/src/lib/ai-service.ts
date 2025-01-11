import { ai } from "./ai-config";
import { ZodSchema, z } from "zod";

export async function analyzeRepo<T extends ZodSchema>(
  userPrompt: string,
  systemPrompt: string,
  schema: T
): Promise<z.infer<T>> {
  const response = await ai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  if (!response.choices[0].message.content) {
    throw new Error("No content received from AI");
  }

  const parsedFeedback = JSON.parse(response.choices[0].message.content);
  return schema.parse(parsedFeedback);
}