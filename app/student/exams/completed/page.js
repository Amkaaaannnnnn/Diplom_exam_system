"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, FileText, CheckCircle } from "lucide-react"

export default function CompletedExams() {
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Дууссан шалгалтуудыг татах
        const examsResponse = await fetch("/api/exams/completed")
        if (!examsResponse.ok) {
          throw new Error("Failed to fetch completed exams")
        }
        const examsData = await examsResponse.json()
        setExams(examsData)

        // Шалгалтын дүнгүүдийг татах
        const resultsResponse = await fetch("/api/results")
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json()
          setResults(resultsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Дууссан шалгалтуудыг ачаалахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Шалгалтын дүнг олох
  const findResult = (examId) => {
    return results.find((result) => result.examId === examId)
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Дууссан шалгалтууд</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Дууссан шалгалтууд</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Дууссан шалгалтууд</h1>

      {exams.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">Танд одоогоор дууссан шалгалт байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const result = findResult(exam.id)

            return (
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
                    <span>{exam.duration} минут</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{exam.totalPoints} оноо</span>
                  </div>
                  {result && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>
                        Оноо: {result.earnedPoints}/{result.totalPoints} ({result.score}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  {result ? (
                    <Link
                      href={`/student/results/${result.id}`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-md"
                    >
                      Дүн харах
                    </Link>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-center">
                      <p className="text-yellow-700 text-sm">Дүн боловсруулж байна</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
