import { ChunkFeedbackSchema, UnifiedFeedbackSchema } from "./schemas";
import { z } from "zod";

export type ChunkFeedback = z.infer<typeof ChunkFeedbackSchema>;
export type UnifiedFeedback = z.infer<typeof UnifiedFeedbackSchema>;

export type RepoFeedback = ChunkFeedback | UnifiedFeedback;

export type FeedbackSuccess = {
  success: true;
  data: UnifiedFeedback; 
};

export type ActionState = {
  feedback: UnifiedFeedback | null;
  error: string | null;
  rawRepoContent: string | null;
  tree: string | null;
};

export type FeedbackError = {
  success: false;
  error: string;
};

export type FeedbackResult = FeedbackSuccess | FeedbackError;

export type Action = (
  prevState: ActionState,
  formData: FormData
) => Promise<ActionState>;

export interface ScoreCardProps {
  title: string;
  score: number;
  summary: string;
  risks: string[]; 
  actions: string[]; 
  children?: React.ReactNode;
}
