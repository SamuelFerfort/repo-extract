import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { ScoreCardProps } from "@/lib/types";
const ScoreCard = ({ title, score, children }: ScoreCardProps) => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{score}</span>
        <Progress value={score} className="w-20" />
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default ScoreCard;
