"use server";

import { extract } from "repo-extract";
import type { Action } from "./types";
import { z } from "zod";
import { analyzeRepo } from "./ai-service";
import {
  UNIFICATION_PROMPT,
  CHUNK_ANALYSIS_PROMPT,
  FULL_REPO_ANALYSIS_PROMPT,
} from "./constants";
import { ChunkFeedbackSchema, UnifiedFeedbackSchema } from "./schemas";

export const generateRepoFeedback: Action = async (prevState, formData) => {
  try {
    const repoUrl = formData.get("url");

    if (!repoUrl || typeof repoUrl !== "string") {
      throw new Error("Invalid repository URL");
    }

    console.log("Starting analysis for:", repoUrl);
    const startTime = Date.now();
    // Extract repository content with 32k token chunks
    const repoData = await extract({
      source: repoUrl,
      chunkSize: 32000,
    });

    console.log(`Repository extracted in ${Date.now() - startTime}ms`);
    if (!repoData.fullContent) {
      throw new Error("Invalid repository URL");
    }
    let feedback;
    // If the repository is too large, analyze each chunk in parallel
    if (repoData.tokens > 50000) {
      console.log("Proccessing repository data in chunks");

      const chunkResults = await Promise.all(
        repoData.chunks.map(async (chunk) => {
          return await analyzeRepo(
            chunk,
            CHUNK_ANALYSIS_PROMPT,
            ChunkFeedbackSchema,
          );
        }),
      );

      const combinedFeedbackPrompt = `Combine and unify the following feedback into a single, coherent analysis, do NOT repeat the same feedback in multiple sections: ${JSON.stringify(
        chunkResults,
      )}`;
      feedback = await analyzeRepo(
        combinedFeedbackPrompt,
        UNIFICATION_PROMPT,
        UnifiedFeedbackSchema,
      );
    } else {
      // Analyze the entire repository content
      feedback = await analyzeRepo(
        repoData.fullContent,
        FULL_REPO_ANALYSIS_PROMPT,
        UnifiedFeedbackSchema,
      );
    }

    return {
      feedback,
      error: null,
      rawRepoContent: repoData.fullContent,
      tree: repoData.tree,
    };
  } catch (error) {
    console.error("Analysis failed:", error);

    const errorMessage =
      error instanceof z.ZodError
        ? "Failed to analyze repository. Please try again."
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

    return { ...prevState, error: errorMessage };
  }
};
