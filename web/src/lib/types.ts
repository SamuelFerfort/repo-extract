import { RepoFeedbackSchema } from "./schemas";
import { z } from "zod";

export type RepoFeedback = z.infer<typeof RepoFeedbackSchema>;

export type FeedbackSuccess = {
  success: true;
  data: ReturnType<typeof RepoFeedbackSchema.parse>;
};

export type ActionState = {
    feedback: RepoFeedback | null;
    error: string | null;
    rawRepoContent: string | null;
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
    children: React.ReactNode;
  }