"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useActionState } from "react";
import CopyIcon from "@/components/common/copy-button";
import { ActionState } from "@/lib/types";
import { generateRepoFeedback } from "@/lib/actions";
import ScoreCard from "@/components/common/score-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import Hero from "@/components/layout/hero";
import { Loader2 } from "lucide-react";

const initialState: ActionState = {
  feedback: null,
  error: null,
  rawRepoContent: null,
  tree: null,
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(
    generateRepoFeedback,
    initialState,
  );

  return (
    <main className="min-h-screen p-8  ">
      <div className="max-w-6xl mx-auto space-y-8">
        <Hero />
        <form action={formAction} className="flex gap-2">
          <Input
            type="url"
            name="url"
            className="flex-1"
            placeholder="Enter repository URL"
            required
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                {" "}
                <Loader2 className="animate-spin" /> Analyzing...
              </>
            ) : (
              "Analyze Repository"
            )}
          </Button>
        </form>

        {state.error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {isPending && <LoadingSkeleton />}
        {!isPending && state.feedback && (
          <Tabs defaultValue="analysis" className="space-y-4">
            <TabsList>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="raw">Raw Content</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ScoreCard
                  title="Security"
                  score={state.feedback.security.score}
                  risks={state.feedback.security.criticalIssues}
                  actions={state.feedback.security.bestPractices}
                />

                <ScoreCard
                  title="Maintainability"
                  score={state.feedback.maintainability.score}
                  risks={state.feedback.maintainability.technicalDebt}
                  actions={state.feedback.maintainability.quickWins}
                />

                <ScoreCard
                  title="Architecture"
                  score={state.feedback.architecture.score}
                  risks={state.feedback.architecture.scalabilityIssues}
                  actions={state.feedback.architecture.patterns}
                />

                <ScoreCard
                  title="Reliability"
                  score={state.feedback.reliability.score}
                  risks={state.feedback.reliability.errorProne}
                  actions={state.feedback.reliability.robustness}
                />
              </div>
            </TabsContent>

            <TabsContent value="raw">
              <Button className="flex items-center gap-2 text-sm ">
                <span>Raw Text </span>
                <CopyIcon textToCopy={state.rawRepoContent || ""} />
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
