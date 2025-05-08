"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ExamTakingPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${id}`)
        if (!response.ok) {
          throw new Error("Failed to load exam")
        }
        const examData = await response.json()
        setExam(examData)
        setTimeLeft(examData.duration * 60) // Convert minutes to seconds

        // Initialize answers object
        const initialAnswers = {}
        examData.questions.forEach((question) => {
          initialAnswers[question.id] = null
        })
        setAnswers(initialAnswers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [id])

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const validateAnswers = () => {
    // Check if all questions have answers
    const unansweredQuestions = Object.entries(answers).filter(
      ([id, answer]) => answer === null || answer === undefined || answer === "",
    )

    if (unansweredQuestions.length > 0) {
      return false
    }

    return true
  }

  const confirmSubmit = () => {
    if (validateAnswers()) {
      setShowConfirmation(true)
    } else {
      alert("Бүх асуултад хариулна уу")
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      const response = await fetch(`/api/exams/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to the result page
        router.push(`/student/results/${result.resultId}`)
      } else {
        setError(result.error || "Шалгалт явуулахад алдаа гарлаа")
      }
    } catch (err) {
      setError("Шалгалт явуулахад алдаа гарлаа: " + err.message)
    } finally {
      setSubmitting(false)
      setShowConfirmation(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <p>Ачаалж байна...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        <div className="mt-4">
          <button
            onClick={() => router.push("/student/exams")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Буцах
          </button>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Шалгалт олдсонгүй.
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push("/student/exams")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Буцах
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-gray-600">{exam.subject}</p>
            </div>
            <div className="bg-blue-50 text-blue-800 py-2 px-4 rounded-full font-medium">
              Үлдсэн хугацаа: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="space-y-6">
            {exam.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <p className="font-medium mb-3">
                  {index + 1}. {question.text} ({question.points} оноо)
                </p>

                {question.type === "select" && question.options && (
                  <div className="space-y-2 ml-4">
                    {JSON.parse(JSON.stringify(question.options)).map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question.id}-${option.id}`}
                          name={question.id}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`${question.id}-${option.id}`}>{option.text}</label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "text" && (
                  <div className="ml-4">
                    <input
                      type="text"
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Хариултаа энд бичнэ үү"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}

                {question.type === "number" && (
                  <div className="ml-4">
                    <input
                      type="number"
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Хариултаа энд бичнэ үү"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={confirmSubmit}
              disabled={submitting}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? "Илгээж байна..." : "Шалгалт дуусгах"}
            </button>
          </div>
        </div>
      </div>

      {/* Баталгаажуулах цонх */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Шалгалт дуусгах уу?</h3>
            <p className="mb-4">Таны хариултууд илгээгдэх болно. Үргэлжлүүлэх үү?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Цуцлах
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Тийм, дуусгах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
