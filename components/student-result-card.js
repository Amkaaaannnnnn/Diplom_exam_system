import Link from "next/link"
import { Calendar, Clock, Award } from "lucide-react"

export default function StudentResultCard({ result }) {
  if (!result) return null

  const exam = result.exam || {}
  const score = result.score || 0
  const earnedPoints = result.earnedPoints || Math.round((score * exam.totalPoints) / 100)

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Тодорхойгүй"
    const date = new Date(dateString)
    return date.toLocaleDateString("mn-MN")
  }

  // Get grade letter
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Get grade color
  const getGradeColor = (score) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium">{exam.title || "Тодорхойгүй"}</h2>
            <p className="text-gray-500">{exam.subject || "Тодорхойгүй"}</p>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(score)}`}>
              {getGrade(score)}
            </span>
            <span className="ml-2 text-lg font-bold">{score}%</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Огноо: {formatDate(result.submittedAt || result.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <Award className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">
              Оноо: {earnedPoints}/{exam.totalPoints || "?"}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">
              Хугацаа:{" "}
              {result.startedAt && result.submittedAt
                ? `${Math.floor((new Date(result.submittedAt) - new Date(result.startedAt)) / 60000)} мин`
                : "Тодорхойгүй"}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href={`/student/results/${result.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Дэлгэрэнгүй харах
          </Link>
        </div>
      </div>
    </div>
  )
}
