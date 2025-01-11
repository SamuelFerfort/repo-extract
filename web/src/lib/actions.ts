"use server";

import { extract } from "repo-extract";
import type { Action } from "./types";
import { z } from "zod";
import { generateUnifiedFeedback, analyzeChunk } from "./ai-service";

export const generateRepoFeedback: Action = async (prevState, formData) => {
    try {
      const repoUrl = formData.get("url");
  
      if (!repoUrl || typeof repoUrl !== "string") {
        throw new Error("Invalid repository URL");
      }
  
      // Extract repository content with 32k chunks
      const repoData = await extract({
        source: repoUrl,
        chunkSize: 32000, 
      });
  
      console.log("Repository Data:", repoData);
  
      // Analyze each chunk in parallel
      const chunkResults = await Promise.all(
        repoData.chunks.map(async (chunk) => {
          return await analyzeChunk(chunk);
        })
      );
  
      const unifiedFeedback = await generateUnifiedFeedback(chunkResults);
  
      return {
        feedback: unifiedFeedback,
        error: null,
        rawRepoContent: repoData.fullContent,
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