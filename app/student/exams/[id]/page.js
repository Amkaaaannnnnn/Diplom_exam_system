"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx"

export default function ExamDetail({ params }) {
  const router = useRouter()
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchExam() {
      try {
        const response = await fetch(`/api/exams/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch exam")
        }
        const data = await response.json()
        setExam(data)
      } catch (error) {
        setError("Failed to load exam details")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [params.id])

  const handleStartExam = () => {
    router.push(`/student/exams/${params.id}/take`)
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Exam not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Subject: {exam.subject}</p>
            <p className="text-gray-600">Class: {exam.className || "N/A"}</p>
            <p className="text-gray-600">Total Points: {exam.totalPoints}</p>
          </div>
          <div>
            <p className="text-gray-600">Duration: {exam.duration} minutes</p>
            <p className="text-gray-600">
              Date: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-600">Time: {exam.examTime || "N/A"}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Read all questions carefully before answering.</li>
            <li>You have {exam.duration} minutes to complete this exam.</li>
            <li>Once you start, you cannot pause the timer.</li>
            <li>Make sure you have a stable internet connection.</li>
            <li>Click "Start Exam" when you are ready to begin.</li>
          </ul>
        </div>
        <div className="flex justify-end">
          <button onClick={handleStartExam} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
            Start Exam
          </button>
        </div>
      </div>
    </div>
  )
}
