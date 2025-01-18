import { z } from "zod";

const ScoreSection = z.object({
  score: z.number().min(0).max(100),
  recommendations: z.array(z.string().max(200)).min(1).max(3),
});

export const ChunkFeedbackSchema = z.object({
  security: ScoreSection.extend({
    criticalIssues: z.array(z.string()).max(5),
    bestPractices: z.array(z.string()).max(5),
  }),
  maintainability: ScoreSection.extend({
    technicalDebt: z.array(z.string()).max(5),
    quickWins: z.array(z.string()).max(3),
  }),
  architecture: ScoreSection.extend({
    patterns: z.array(z.string()).max(3),
    scalabilityIssues: z.array(z.string()).max(3),
  }),
  reliability: ScoreSection.extend({
    errorProne: z.array(z.string()).max(3),
    robustness: z.array(z.string()).max(3),
  }),
});

export const UnifiedFeedbackSchema = z.object({
  security: ScoreSection.extend({
    criticalIssues: z.array(z.string()).max(2),
    bestPractices: z.array(z.string()).max(3),
  }),
  maintainability: ScoreSection.extend({
    technicalDebt: z.array(z.string()).max(3),
    quickWins: z.array(z.string()).max(2),
  }),
  architecture: ScoreSection.extend({
    patterns: z.array(z.string()).max(2),
    scalabilityIssues: z.array(z.string()).max(2),
  }),
  reliability: ScoreSection.extend({
    errorProne: z.array(z.string()).max(2),
    robustness: z.array(z.string()).max(2),
  }),
});
