import { z } from "zod";

export const RepoFeedbackSchema = z.object({
  security: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  codeQuality: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    improvements: z.array(z.string())
  }),
  architecture: z.object({
    score: z.number().min(0).max(100),
    analysis: z.string(),
    suggestions: z.array(z.string())
  }),
  performance: z.object({
    score: z.number().min(0).max(100),
    findings: z.array(z.string()),
    optimizations: z.array(z.string())
  })
});

export type RepoFeedback = z.infer<typeof RepoFeedbackSchema>;