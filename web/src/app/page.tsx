"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useActionState } from "react";
import CopyIcon from "@/components/common/copy-button";
import { ActionState } from "@/lib/types";
import { generateRepoFeedback } from "@/lib/actions";
import ScoreCard from "@/components/common/score-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
const initialState: ActionState = {
  feedback: null,
  error: null,
  rawRepoContent: null,
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(
    generateRepoFeedback,
    initialState
  );

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
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
            {isPending ? "Analyzing..." : "Analyze Repository"}
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
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Issues</h4>
                      <ul className="space-y-2">
                        {state.feedback.security.issues.map((issue, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                          >
                            <span>{issue}</span>
                            <CopyIcon textToCopy={issue} />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {state.feedback.security.recommendations.map(
                          (rec, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{rec}</span>
                              <CopyIcon textToCopy={rec} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </ScoreCard>

                <ScoreCard
                  title="Code Quality"
                  score={state.feedback.codeQuality.score}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Strengths</h4>
                      <ul className="space-y-2">
                        {state.feedback.codeQuality.strengths.map(
                          (strength, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{strength}</span>
                              <CopyIcon textToCopy={strength} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Improvements</h4>
                      <ul className="space-y-2">
                        {state.feedback.codeQuality.improvements.map(
                          (improvement, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{improvement}</span>
                              <CopyIcon textToCopy={improvement} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </ScoreCard>

                <ScoreCard
                  title="Architecture"
                  score={state.feedback.architecture.score}
                >
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                      <span>{state.feedback.architecture.analysis}</span>
                      <CopyIcon
                        textToCopy={state.feedback.architecture.analysis}
                      />
                    </p>
                    <div>
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <ul className="space-y-2">
                        {state.feedback.architecture.suggestions.map(
                          (suggestion, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{suggestion}</span>
                              <CopyIcon textToCopy={suggestion} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </ScoreCard>

                <ScoreCard
                  title="Performance"
                  score={state.feedback.performance.score}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Findings</h4>
                      <ul className="space-y-2">
                        {state.feedback.performance.findings.map(
                          (finding, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{finding}</span>
                              <CopyIcon textToCopy={finding} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Optimizations</h4>
                      <ul className="space-y-2">
                        {state.feedback.performance.optimizations.map(
                          (optimization, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between"
                            >
                              <span>{optimization}</span>
                              <CopyIcon textToCopy={optimization} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </ScoreCard>
              </div>
            </TabsContent>

            <TabsContent value="raw">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Repository Content</CardTitle>
                  <CardDescription>
                    Copy the raw content to use with your preferred LLM
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <CopyIcon textToCopy={state.rawRepoContent || ""} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
