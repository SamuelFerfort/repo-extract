import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { ScoreCardProps } from "@/lib/types";




export default function ScoreCard({
  title,
  score,
  summary,
  risks,
  actions,
}: ScoreCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{score}</span>
          <Progress value={score} className="w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{summary}</p>

          <div>
            <h4 className="font-medium mb-2">Risks</h4>
            <ul className="space-y-2">
              {risks.map((risk, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <ul className="space-y-2">
              {actions.map((action, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
