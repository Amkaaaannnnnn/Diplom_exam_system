"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, FileText } from "lucide-react"

export default function UpcomingExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch("/api/exams/upcoming")
        if (!response.ok) {
          throw new Error("Failed to fetch upcoming exams")
        }
        const data = await response.json()
        setExams(data)
      } catch (error) {
        console.error("Error fetching upcoming exams:", error)
        setError("Ирэх шалгалтуудыг ачаалахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [])

  // Шалгалт эхлэх боломжтой эсэхийг шалгах
  const canStartExam = (exam) => {
    if (!exam || !exam.examDate) return false

    const examDate = new Date(exam.examDate)

    // Хэрэв цаг заасан бол тухайн цагийг тооцох
    if (exam.examTime) {
      const [hours, minutes] = exam.examTime.split(":").map(Number)
      examDate.setHours(hours, minutes, 0)
    }

    return new Date() >= examDate
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Ирэх шалгалтууд</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Ирэх шалгалтууд</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ирэх шалгалтууд</h1>

      {exams.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">Танд одоогоор ирэх шалгалт байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">{exam.title}</h2>
                <p className="text-gray-600">{exam.subject}</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Тодорхойгүй"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {exam.examTime || "Тодорхойгүй"} | {exam.duration} минут
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{exam.totalPoints} оноо</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {canStartExam(exam) ? (
                  <Link
                    href={`/student/exams/${exam.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md"
                  >
                    Шалгалт өгөх
                  </Link>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-center">
                    <p className="text-yellow-700 text-sm">
                      Шалгалт {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : ""}
                      {exam.examTime ? ` ${exam.examTime}` : ""} цагт эхэлнэ
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
