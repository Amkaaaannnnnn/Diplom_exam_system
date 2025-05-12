"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Clock, Award, FileText, AlertTriangle } from "lucide-react"

export default function EditStudentExamResult() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true)
        console.log(`Fetching result for student: ${params.studentId}, exam: ${params.id}`)

        // First, find the result ID for this student and exam
        const resultsResponse = await fetch(`/api/exams/${params.id}/results?studentId=${params.studentId}`, {
          credentials: "include",
        })

        if (!resultsResponse.ok) {
          const errorText = await resultsResponse.text()
          console.error("Failed to fetch results:", errorText)

          try {
            const errorData = JSON.parse(errorText)
            throw new Error(errorData.error || `Шалгалтын дүн хайхад алдаа гарлаа: ${resultsResponse.status}`)
          } catch (e) {
            throw new Error(
              `Шалгалтын дүн хайхад алдаа гарлаа: ${resultsResponse.status} - ${errorText.substring(0, 100)}`,
            )
          }
        }

        const resultsData = await resultsResponse.json()
        console.log("Results data:", resultsData)

        if (!resultsData || (Array.isArray(resultsData) && resultsData.length === 0)) {
          throw new Error("Энэ сурагчийн шалгалтын дүн олдсонгүй")
        }

        // Get the result ID
        const resultId = Array.isArray(resultsData) ? resultsData[0].id : resultsData.id

        console.log(`Found result ID: ${resultId}, fetching details`)

        // Now fetch the detailed result
        const response = await fetch(`/api/results/${resultId}`, {
          credentials: "include",
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Failed to fetch result details:", errorText)

          try {
            const errorData = JSON.parse(errorText)
            throw new Error(errorData.error || `Шалгалтын дүнг ачаалахад алдаа гарлаа: ${response.status}`)
          } catch (e) {
            throw new Error(
              `Шалгалтын дүнг ачаалахад алдаа гарлаа: ${response.status} - ${errorText.substring(0, 100)}`,
            )
          }
        }

        const data = await response.json()
        console.log("Result details:", data)

        setResult(data)

        // Process answers to ensure they have complete question data
        const processedAnswers = (data.answers || []).map((answer, index) => {
          // Find the corresponding question from the exam
          let question = answer.question || null

          // If question is missing or incomplete, create a placeholder
          if (!question || !question.text || question.text === "Question text not available") {
            question = {
              id: answer.questionId || `question-${index}`,
              text: `Асуулт ${index + 1}`,
              type: "UNKNOWN",
              points: 1,
              options: [],
              correctAnswer: "",
            }
          }

          return {
            ...answer,
            question,
          }
        })

        setAnswers(processedAnswers)
        setScore(data.score || 0)
        setFeedback(data.feedback || "")

        // Calculate total points
        let earned = 0
        let total = 0
        processedAnswers.forEach((answer) => {
          if (answer.question) {
            const points = answer.question.points || 1
            total += points
            if (answer.isCorrect) {
              earned += points
            }
          }
        })
        setEarnedPoints(earned)
        setTotalPoints(total)

        setError(null)
      } catch (err) {
        console.error("Error fetching result:", err)
        setError(err.message || "Шалгалтын дүнг ачаалахад алдаа гарлаа")

        // Collect debug info
        try {
          const debugResponse = await fetch("/api/debug")
          if (debugResponse.ok) {
            const debugData = await debugResponse.json()
            setDebugInfo(debugData)
          }
        } catch (debugErr) {
          console.error("Failed to fetch debug info:", debugErr)
        }
      } finally {
        setLoading(false)
      }
    }

    if (params.id && params.studentId) {
      fetchResult()
    }
  }, [params.id, params.studentId])

  const handleAnswerChange = (index, isCorrect) => {
    const newAnswers = [...answers]
    newAnswers[index] = { ...newAnswers[index], isCorrect }
    setAnswers(newAnswers)

    // Recalculate earned points and score
    let earned = 0
    newAnswers.forEach((answer) => {
      if (answer.isCorrect && answer.question) {
        earned += answer.question.points || 1
      }
    })
    setEarnedPoints(earned)

    // Calculate percentage score
    const newScore = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0
    setScore(newScore)
  }

  const handleScoreChange = (e) => {
    const newScore = Math.min(100, Math.max(0, Number.parseInt(e.target.value) || 0))
    setScore(newScore)
  }

  const handleFeedbackChange = (index, feedback) => {
    const newAnswers = [...answers]
    newAnswers[index] = { ...newAnswers[index], feedback }
    setAnswers(newAnswers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      if (!result || !result.id) {
        throw new Error("Дүнгийн мэдээлэл олдсонгүй")
      }

      console.log("Saving result with ID:", result.id)
      console.log("Data to save:", {
        answers,
        score,
        feedback,
      })

      const response = await fetch(`/api/results/${result.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          score,
          feedback,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to save result:", errorText)

        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `Дүнг хадгалахад алдаа гарлаа: ${response.status}`)
        } catch (e) {
          throw new Error(`Дүнг хадгалахад алдаа гарлаа: ${response.status} - ${errorText.substring(0, 100)}`)
        }
      }

      // Navigate back to the results page
      router.push(`/teacher/exams/results/${params.id}`)
    } catch (err) {
      console.error("Error saving result:", err)
      setError(err.message || "Дүнг хадгалахад алдаа гарлаа")
      setSaving(false)
    }
  }

  // Хугацааг тооцоолох
  const calculateDuration = (startedAt, submittedAt) => {
    if (!startedAt || !submittedAt) return { minutes: 0, seconds: 0, text: "Тодорхойгүй" }
    const startTime = new Date(startedAt)
    const endTime = new Date(submittedAt)
    const durationMs = endTime - startTime

    // Хугацааг минут, секундээр харуулах
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return {
      minutes,
      seconds,
      text: `${minutes} мин ${seconds} сек`,
      totalMinutes: Math.round((durationMs / 60000) * 10) / 10, // Round to 1 decimal place
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <strong className="font-bold">Алдаа!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          <button
            onClick={() => router.push(`/teacher/exams/results/${params.id}`)}
            className="mt-4 bg-red-200 text-red-700 px-4 py-2 rounded hover:bg-red-300"
          >
            Буцах
          </button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <strong className="font-bold">Анхааруулга!</strong>
            <span className="block sm:inline ml-2">Шалгалтын дүн олдсонгүй.</span>
          </div>
          <button
            onClick={() => router.push(`/teacher/exams/results/${params.id}`)}
            className="mt-4 bg-yellow-200 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-300"
          >
            Буцах
          </button>
        </div>
      </div>
    )
  }

  const exam = result.exam || {}
  const user = result.user || {}
  const duration = calculateDuration(result.startedAt, result.submittedAt)

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/teacher/exams/results/${params.id}`} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Дүн засах: {user.name}</h1>
        <div className="text-gray-500 ml-2">
          {exam.title} | {user.className}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Ерөнхий мэдээлэл */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Сурагчийн мэдээлэл</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-gray-500">Нэр:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Нэвтрэх нэр:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Анги:</span>
                  <span className="font-medium">{user.className}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Шалгалтын дүн</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-32 text-gray-500">Оноо:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {earnedPoints}/{totalPoints}
                    </span>
                    <span className="text-sm text-gray-500">({Math.round((earnedPoints / totalPoints) * 100)}%)</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-gray-500">Хувь:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={score}
                      onChange={handleScoreChange}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>

                <div className="flex">
                  <span className="w-32 text-gray-500">Зарцуулсан:</span>
                  <span className="font-medium">{duration.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Шалгалтын статистик */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Шалгалтын статистик</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <FileText className="text-blue-500 mr-2" size={20} />
                <h3 className="font-medium">Асуултын тоо</h3>
              </div>
              <p className="text-2xl font-semibold">{answers.length}</p>
              <p className="text-sm text-gray-600">Нийт асуулт</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <Award className="text-green-500 mr-2" size={20} />
                <h3 className="font-medium">Зөв хариулсан</h3>
              </div>
              <p className="text-2xl font-semibold">
                {answers.filter((a) => a.isCorrect).length} / {answers.length}
              </p>
              <p className="text-sm text-gray-600">
                {answers.length > 0
                  ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
                  : 0}
                % зөв
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center mb-2">
                <Clock className="text-purple-500 mr-2" size={20} />
                <h3 className="font-medium">Хугацаа</h3>
              </div>
              <p className="text-2xl font-semibold">{duration.minutes} минут</p>
              <p className="text-sm text-gray-600">{duration.seconds} секунд</p>
            </div>
          </div>
        </div>

        {/* Багшийн тайлбар */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Багшийн тайлбар</h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Сурагчид өгөх тайлбар..."
          ></textarea>
        </div>

        {/* Хариултууд */}
        <h2 className="text-xl font-medium mb-4">Хариултууд</h2>
        <div className="space-y-6">
          {answers.map((answer, index) => {
            const question = answer.question || {
              text: `Асуулт ${index + 1}`,
              type: "UNKNOWN",
              points: 1,
              options: [],
              correctAnswer: "",
            }

            const studentAnswer = answer.answer || answer.studentAnswer || ""
            const correctAnswer = question.correctAnswer || ""

            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <span className="bg-gray-200 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-medium">{question.text}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">{question.points || 1} оноо</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id={`toggle-${index}`}
                        checked={answer.isCorrect}
                        onChange={(e) => handleAnswerChange(index, e.target.checked)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`toggle-${index}`}
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                          answer.isCorrect ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                            answer.isCorrect ? "translate-x-4" : "translate-x-0"
                          }`}
                        ></span>
                      </label>
                    </div>
                    <span className={answer.isCorrect ? "text-green-600" : "text-gray-500"}>
                      {answer.isCorrect ? "Зөв" : "Буруу"}
                    </span>
                  </div>
                </div>

                {/* Сурагчийн хариулт */}
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Сурагчийн хариулт:</span>
                  </div>
                  <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
                    {studentAnswer || "Хариулаагүй"}
                  </div>
                </div>

                {/* Зөв хариулт */}
                <div className="mt-2">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Зөв хариулт:</span>
                  </div>
                  <div className="p-3 rounded-md border border-green-200 bg-green-50">
                    {correctAnswer || "Тодорхойгүй"}
                  </div>
                </div>

                {/* Багшийн тайлбар */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Багшийн тайлбар:</label>
                  <textarea
                    value={answer.feedback || ""}
                    onChange={(e) => handleFeedbackChange(index, e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Энд тайлбар бичнэ үү..."
                  ></textarea>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/teacher/exams/results/${params.id}`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md mr-2"
          >
            Цуцлах
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Хадгалах
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
