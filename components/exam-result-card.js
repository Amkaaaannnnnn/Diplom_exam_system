import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx"
import { Badge } from "./ui/badge.jsx"
import { Progress } from "./ui/progress.jsx"

export function ExamResultCard({ result, exam }) {
  if (!result || !exam) return null

  const isPassed = result.score >= 60
  const grade = getGradeLabel(result.score)

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${isPassed ? "bg-green-500" : "bg-red-500"}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{exam.title}</CardTitle>
            <CardDescription>{exam.subject}</CardDescription>
          </div>
          <Badge variant={isPassed ? "success" : "destructive"}>{isPassed ? "Тэнцсэн" : "Тэнцээгүй"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${grade.color} flex items-center justify-center mr-3`}>
              <span className="text-white font-bold">{grade.label}</span>
            </div>
            <div>
              <p className="font-bold text-lg">{result.score}%</p>
              <p className="text-sm text-gray-500">
                {result.earnedPoints || 0}/{result.totalPoints || exam.totalPoints || 100} оноо
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center justify-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {new Date(result.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Progress value={result.score} className="h-2" />
      </CardContent>
    </Card>
  )
}

// Helper function to get grade label
function getGradeLabel(score) {
  if (score >= 90) return { label: "A", color: "bg-green-500" }
  if (score >= 80) return { label: "B", color: "bg-green-400" }
  if (score >= 70) return { label: "C", color: "bg-yellow-400" }
  if (score >= 60) return { label: "D", color: "bg-orange-400" }
  return { label: "F", color: "bg-red-500" }
}
