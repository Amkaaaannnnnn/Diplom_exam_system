"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Check, X } from "lucide-react"

export default function EditStudentExamResult() {
  const params = useParams()
  const router = useRouter()
  const { id, studentId } = params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exam, setExam] = useState(null)
  const [student, setStudent] = useState(null)
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Шалгалтын дүнг авах
        const resultResponse = await fetch(`/api/results/${id}?studentId=${studentId}`)
        if (!resultResponse.ok) {
          throw new Error("Failed to fetch result")
        }
        const resultData = await resultResponse.json()

        // Шалгалтын мэдээллийг авах
        const examResponse = await fetch(`/api/exams/${resultData.examId}`)
        if (!examResponse.ok) {
          throw new Error("Failed to fetch exam")
        }
        const examData = await examResponse.json()

        // Сурагчийн мэдээллийг авах
        const studentResponse = await fetch(`/api/users/${resultData.userId}`)
        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student")
        }
        const studentData = await studentResponse.json()

        setExam(examData)
        setStudent(studentData)
        setResult(resultData)
        setAnswers(resultData.answers || [])
        setFeedback(resultData.feedback || "")
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Өгөгдөл татахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, studentId])

  const handleAnswerCorrectChange = (questionId, isCorrect) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) => (answer.questionId === questionId ? { ...answer, isCorrect } : answer)),
    )
  }

  const handleAnswerFeedbackChange = (questionId, feedback) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) => (answer.questionId === questionId ? { ...answer, feedback } : answer)),
    )
  }

  const calculateScore = () => {
    if (!exam || !answers.length) return 0

    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0)
    const earnedPoints = answers.reduce((sum, answer) => {
      const question = exam.questions.find((q) => q.id === answer.questionId)
      return sum + (answer.isCorrect ? question?.points || 0 : 0)
    }, 0)

    return Math.round((earnedPoints / totalPoints) * 100)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Оноог тооцоолох
      const score = calculateScore()

      // Шалгалтын дүнг шинэчлэх
      const response = await fetch(`/api/results/${result.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score,
          answers,
          feedback,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update result")
      }

      // Амжилттай шинэчилсний дараа дэлгэрэнгүй хуудас руу буцах
      router.push(`/teacher/exams/results/${id}/student/${studentId}`)
    } catch (error) {
      console.error("Error saving result:", error)
      setError("Дүнг хадгалахад алдаа гарлаа")
    } finally {
      setSaving(false)
    }
  }

  // Үнэлгээ тодорхойлох
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Алдаа!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-4">
          <Link href={`/teacher/exams/results/${id}`} className="text-blue-600 hover:text-blue-800">
            Шалгалтын дүн рүү буцах
          </Link>
        </div>
      </div>
    )
  }

  const currentScore = calculateScore()

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/teacher/exams/results/${id}/student/${studentId}`} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Дүн засах: {exam.title}</h1>
        <div className="text-gray-500 ml-2">
          {student.name} | {student.className}
        </div>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
          </button>
        </div>
      </div>

      {/* Score summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Шалгалтын дүн</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Оноо:</span>
                <span className="font-medium">
                  {Math.round((currentScore * exam.totalPoints) / 100)}/{exam.totalPoints}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Хувь:</span>
                <span className="font-medium">{currentScore}%</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Үнэлгээ:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    getGrade(currentScore) === "A"
                      ? "bg-green-100 text-green-800"
                      : getGrade(currentScore) === "B"
                        ? "bg-blue-100 text-blue-800"
                        : getGrade(currentScore) === "C"
                          ? "bg-yellow-100 text-yellow-800"
                          : getGrade(currentScore) === "D"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                  }`}
                >
                  {getGrade(currentScore)}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-medium mb-4">Ерөнхий тайлбар</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Шалгалтын талаар ерөнхий тайлбар бичих..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Answers */}
      <h2 className="text-xl font-medium mb-4">Хариултууд</h2>
      <div className="space-y-6">
        {exam.questions.map((question, index) => {
          const answer = answers.find((a) => a.questionId === question.id)

          return (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="bg-gray-200 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-medium">{question.text}</h3>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{question.points} оноо</span>
                </div>
              </div>

              {question.type === "select" && (
                <div className="space-y-2 mt-4">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-md border ${
                        answer && answer.answer === option.id
                          ? answer.isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : question.correctAnswer === option.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            answer && answer.answer === option.id
                              ? answer.isCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-red-500 bg-red-500 text-white"
                              : question.correctAnswer === option.id
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-gray-300"
                          }`}
                        >
                          {answer && answer.answer === option.id && <Check size={12} />}
                          {!answer && question.correctAnswer === option.id && <Check size={12} />}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "multiselect" && (
                <div className="space-y-2 mt-4">
                  {question.options.map((option) => {
                    const isSelected = answer && Array.isArray(answer.answer) && answer.answer.includes(option.id)
                    const isCorrectOption =
                      Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option.id)

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-md border ${
                          isSelected
                            ? isCorrectOption
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : isCorrectOption
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${
                              isSelected
                                ? isCorrectOption
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-red-500 bg-red-500 text-white"
                                : isCorrectOption
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-gray-300"
                            }`}
                          >
                            {(isSelected || isCorrectOption) && <Check size={12} />}
                          </div>
                          <span>{option.text}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {(question.type === "text" || question.type === "number") && (
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Сурагчийн хариулт:</span>
                  </div>
                  <div
                    className={`p-3 rounded-md border ${
                      answer
                        ? answer.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    {answer ? answer.answer : "Хариулаагүй"}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Зөв хариулт:</span>
                    <div className="p-3 rounded-md border border-green-500 bg-green-50 mt-1">
                      {question.correctAnswer}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium mr-4">Хариулт зөв эсэх:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAnswerCorrectChange(question.id, true)}
                      className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                        answer && answer.isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Check size={16} />
                      <span>Зөв</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerCorrectChange(question.id, false)}
                      className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                        answer && answer.isCorrect === false
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <X size={16} />
                      <span>Буруу</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Тайлбар:</label>
                  <textarea
                    value={answer?.feedback || ""}
                    onChange={(e) => handleAnswerFeedbackChange(question.id, e.target.value)}
                    className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    placeholder="Энэ хариултын талаар тайлбар бичих..."
                  ></textarea>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white rounded-md px-6 py-3 hover:bg-green-700 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? "Хадгалж байна..." : "Хадгалах"}</span>
        </button>
      </div>
    </div>
  )
}
