import { ai } from "./ai-config";
import { CHUNK_ANALYSIS_PROMPT, UNIFICATION_PROMPT } from "./constants";
import { UnifiedFeedbackSchema, ChunkFeedbackSchema } from "./schemas";
import { ChunkFeedback } from "./types";

export async function generateUnifiedFeedback(chunkResults: ChunkFeedback[]) {
  const combinedFeedbackPrompt = `Combine and unify the following feedback into a single, coherent analysis: ${JSON.stringify(
    chunkResults
  )}`;

  const response = await ai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: UNIFICATION_PROMPT },
      { role: "user", content: combinedFeedbackPrompt },
    ],
    response_format: { type: "json_object" },
  });

  if (!response.choices[0].message.content) {
    throw new Error("No content received from AI");
  }

  const parsedFeedback = JSON.parse(response.choices[0].message.content);
  return UnifiedFeedbackSchema.parse(parsedFeedback);
}

export async function analyzeChunk(chunk: string) {
  const response = await ai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: CHUNK_ANALYSIS_PROMPT },
      { role: "user", content: chunk },
    ],
    response_format: { type: "json_object" },
  });

  if (!response.choices[0].message.content) {
    throw new Error("No content received from AI");
  }

  const parsedFeedback = JSON.parse(response.choices[0].message.content);
  return ChunkFeedbackSchema.parse(parsedFeedback);
}
