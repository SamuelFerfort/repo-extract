"use server";

import { extract } from "repo-extract";
import { RepoFeedbackSchema } from "../lib/schemas";
import { ai } from "../lib/ai";
import type { Action } from "./types";

export const generateRepoFeedback: Action = async (prevState, formData) => {
  try {
    const repoUrl = formData.get("url");

    if (!repoUrl || typeof repoUrl !== "string") {
      throw new Error("Invalid repository URL");
    }

    const repoData = await extract({
      source: repoUrl,
    });

    const systemPrompt = `
    You are an expert code reviewer providing detailed repository feedback.
    Analyze the given repository and provide feedback in JSON format.
    The output should follow this structure:

    {
      "security": {
        "score": number (0-100),
        "issues": [string],
        "recommendations": [string]
      },
      "codeQuality": {
        "score": number (0-100),
        "strengths": [string],
        "improvements": [string]
      },
      "architecture": {
        "score": number (0-100),
        "analysis": string,
        "suggestions": [string]
      },
      "performance": {
        "score": number (0-100),
        "findings": [string],
        "optimizations": [string]
      }
    }
    `;

    const userPrompt = `
    Analyze this repository and provide detailed feedback:
    
    ${repoData.content}
    
    Focus on:
    1. Security vulnerabilities and best practices
    2. Code quality and maintainability
    3. Architecture patterns and structure
    4. Performance considerations
    
    Provide comprehensive analysis with scores and detailed explanations in JSON format.
    `;

    const response = await ai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    const feedbackData = JSON.parse(content);
    const feedback = RepoFeedbackSchema.parse(feedbackData);

    return { feedback, error: null, rawRepoContent: repoData.content };
  } catch (error) {
    console.error("Analysis failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { ...prevState, error: errorMessage };
  }
};
