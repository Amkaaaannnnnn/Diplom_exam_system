"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditStudentResultPage({ params }) {
  const router = useRouter()
  const { id, studentId } = params

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exam, setExam] = useState(null)
  const [student, setStudent] = useState(null)
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch exam data
        const examResponse = await fetch(`/api/exams/${id}`)
        if (!examResponse.ok) {
          throw new Error("Failed to fetch exam")
        }
        const examData = await examResponse.json()
        setExam(examData)

        // Fetch student data
        const studentResponse = await fetch(`/api/users/${studentId}`)
        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student")
        }
        const studentData = await studentResponse.json()
        setStudent(studentData)

        // Fetch result data
        const resultResponse = await fetch(`/api/exams/${id}/results`)
        if (!resultResponse.ok) {
          if (resultResponse.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch results")
        }
        const resultsData = await resultResponse.json()

        // Find the specific student's result
        const studentResult = resultsData.find((r) => r.userId === studentId)
        if (!studentResult) {
          throw new Error("Student result not found")
        }

        setResult(studentResult)
        setAnswers(
          studentResult.answers.map((answer) => ({
            ...answer,
            isCorrect: answer.isCorrect,
            feedback: answer.feedback || "",
          })),
        )
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, studentId, router])

  const handleCorrectChange = (answerId, isCorrect) => {
    setAnswers((prev) => prev.map((answer) => (answer.id === answerId ? { ...answer, isCorrect } : answer)))
  }

  const handleFeedbackChange = (answerId, feedback) => {
    setAnswers((prev) => prev.map((answer) => (answer.id === answerId ? { ...answer, feedback } : answer)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setSaveError(null)
      setSaveSuccess(false)

      // Prepare data for submission
      const updatedAnswers = answers.map(({ id, isCorrect, feedback }) => ({
        id,
        isCorrect,
        feedback,
      }))

      // Submit the updated answers
      const response = await fetch(`/api/results/${result.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: updatedAnswers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update result")
      }

      setSaveSuccess(true)

      // Redirect after successful save
      setTimeout(() => {
        router.push(`/teacher/exams/results/${id}/student/${studentId}`)
      }, 1500)
    } catch (err) {
      console.error("Error saving result:", err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Алдаа гарлаа: {error}</div>
        <div className="mt-4">
          <Link href={`/teacher/exams/results/${id}`} className="text-blue-500 hover:underline">
            Бүх дүн рүү буцах
          </Link>
        </div>
      </div>
    )
  }

  if (!exam || !student || !result) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Мэдээлэл олдсонгүй</div>
        <div className="mt-4">
          <Link href={`/teacher/exams/results/${id}`} className="text-blue-500 hover:underline">
            Бүх дүн рүү буцах
          </Link>
        </div>
      </div>
    )
  }

  // Calculate score
  const totalQuestions = answers.length
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={`/teacher/exams/results/${id}/student/${studentId}`}
            className="text-blue-500 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Дүн харах хуудас руу буцах
          </Link>
          <h1 className="text-2xl font-bold mt-2">{exam.title} - Дүн засах</h1>
          <p className="text-gray-600">
            {student.name} ({student.className})
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Амжилттай хадгаллаа! Дүн харах хуудас руу шилжүүлж байна...
        </div>
      )}

      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Алдаа гарлаа: {saveError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Шалгалтын дүн</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Оноо:</p>
            <p className="font-medium">
              {correctAnswers}/{totalQuestions}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Хувь:</p>
            <p className="font-medium">{score}%</p>
          </div>
          <div>
            <p className="text-gray-600">Үнэлгээ:</p>
            <p className={`font-medium ${score >= 70 ? "text-green-600" : "text-red-600"}`}>
              {score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Хариултууд засах</h2>

          {answers.map((answer, index) => {
            // Parse options if they exist and are in string format
            let options = []
            if (answer.question.type === "MULTIPLE_CHOICE" && answer.question.options) {
              try {
                if (typeof answer.question.options === "string") {
                  options = JSON.parse(answer.question.options)
                } else if (Array.isArray(answer.question.options)) {
                  options = answer.question.options
                }
              } catch (e) {
                console.error("Error parsing options:", e)
              }
            }

            return (
              <div key={answer.id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between">
                  <h3 className="font-medium">Асуулт {index + 1}</h3>
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => handleCorrectChange(answer.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Зөв</span>
                    </label>
                  </div>
                </div>

                <p className="my-2">{answer.question.text}</p>

                {answer.question.type === "MULTIPLE_CHOICE" && (
                  <div className="ml-4 mt-2">
                    {options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`
                        p-2 my-1 rounded
                        ${answer.answer === option ? "bg-blue-50" : ""}
                        ${answer.question.correctAnswer === option ? "border-l-4 border-green-500" : ""}
                      `}
                      >
                        {option}
                        {answer.answer === option && <span className="ml-2 text-blue-600">← Сурагчийн хариулт</span>}
                        {answer.question.correctAnswer === option && (
                          <span className="ml-2 text-green-600">← Зөв хариулт</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {answer.question.type === "TRUE_FALSE" && (
                  <div className="ml-4 mt-2">
                    <div
                      className={`p-2 my-1 rounded ${answer.answer === "true" ? "bg-blue-50" : ""} ${answer.question.correctAnswer === "true" ? "border-l-4 border-green-500" : ""}`}
                    >
                      Үнэн
                      {answer.answer === "true" && <span className="ml-2 text-blue-600">← Сурагчийн хариулт</span>}
                      {answer.question.correctAnswer === "true" && (
                        <span className="ml-2 text-green-600">← Зөв хариулт</span>
                      )}
                    </div>
                    <div
                      className={`p-2 my-1 rounded ${answer.answer === "false" ? "bg-blue-50" : ""} ${answer.question.correctAnswer === "false" ? "border-l-4 border-green-500" : ""}`}
                    >
                      Худал
                      {answer.answer === "false" && <span className="ml-2 text-blue-600">← Сурагчийн хариулт</span>}
                      {answer.question.correctAnswer === "false" && (
                        <span className="ml-2 text-green-600">← Зөв хариулт</span>
                      )}
                    </div>
                  </div>
                )}

                {answer.question.type === "SHORT_ANSWER" && (
                  <div className="ml-4 mt-2">
                    <div className="mb-2">
                      <span className="font-medium">Зөв хариулт:</span>
                      <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                        {answer.question.correctAnswer}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Сурагчийн хариулт:</span>
                      <div className="p-2 bg-blue-50 rounded">{answer.answer}</div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Багшийн тайлбар:</label>
                  <textarea
                    value={answer.feedback}
                    onChange={(e) => handleFeedbackChange(answer.id, e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Энд тайлбар бичнэ үү..."
                  ></textarea>
                </div>
              </div>
            )
          })}

          <div className="mt-6 flex justify-end">
            <Link
              href={`/teacher/exams/results/${id}/student/${studentId}`}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
            >
              Цуцлах
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
