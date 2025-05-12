"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Check, X, Clock, Award, FileText, AlertTriangle } from "lucide-react"

export default function StudentExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true)
        const response = await fetch(`/api/results/${params.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Шалгалтын дүнг ачаалахад алдаа гарлаа")
        }
        const data = await response.json()
        setResult(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching result:", err)
        setError(err.message || "Шалгалтын дүнг ачаалахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchResult()
    }
  }, [params.id])

  // Үнэлгээ тодорхойлох
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Үнэлгээний өнгө тодорхойлох
  const getGradeColor = (score) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  // Хугацааг тооцоолох
  const calculateDuration = (startedAt, submittedAt) => {
    if (!startedAt || !submittedAt) return "Тодорхойгүй"
    const startTime = new Date(startedAt)
    const endTime = new Date(submittedAt)
    const durationMs = endTime - startTime

    // Хугацааг минут, секундээр харуулах
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return `${minutes} мин ${seconds} сек`
  }

  // Шалгалт өгсөн өдөр, цагийг форматлах
  const formatDateTime = (dateString) => {
    if (!dateString) return "Тодорхойгүй"
    const date = new Date(dateString)
    return date.toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
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
          <button
            onClick={() => router.push("/student/results")}
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
            onClick={() => router.push("/student/results")}
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
  const answers = result.answers || []

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/student/results" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{exam.title || "Шалгалтын дүн"}</h1>
        <div className="text-gray-500 ml-2">
          {exam.subject} | {exam.className} | {new Date(exam.examDate || result.createdAt).toLocaleDateString()}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
          >
            <Printer size={18} />
            <span>Хэвлэх</span>
          </button>
        </div>
      </div>

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
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Оноо:</span>
                <span className="font-medium">
                  {result.earnedPoints || Math.round((result.score * exam.totalPoints) / 100)}/{exam.totalPoints}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Хувь:</span>
                <span className="font-medium">{result.score}%</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-500">Үнэлгээ:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.score)}`}>
                  {getGrade(result.score)}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Эхэлсэн:</span>
                <span className="font-medium">{formatDateTime(result.startedAt)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Дууссан:</span>
                <span className="font-medium">{formatDateTime(result.submittedAt)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Зарцуулсан:</span>
                <span className="font-medium font-mono">{calculateDuration(result.startedAt, result.submittedAt)}</span>
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
            <p>{answers.length} асуулт</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <Clock className="text-green-500 mr-2" size={20} />
              <h3 className="font-medium">Хугацаа</h3>
            </div>
            <p>{exam.duration || "Тодорхойгүй"} минут</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center mb-2">
              <Award className="text-purple-500 mr-2" size={20} />
              <h3 className="font-medium">Зөв хариулсан</h3>
            </div>
            <p>
              {answers.filter((a) => a.isCorrect).length} / {answers.length} асуулт
            </p>
          </div>
        </div>
      </div>

      {/* Хариултууд */}
      <h2 className="text-xl font-medium mb-4">Хариултууд</h2>
      <div className="space-y-6">
        {answers.map((answer, index) => {
          const question = answer.question
          if (!question) return null

          const isCorrect = answer.isCorrect
          const studentAnswer = answer.studentAnswer || ""
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
                  <span className="text-gray-500 mr-2">{question.points} оноо</span>
                  {isCorrect !== undefined &&
                    (isCorrect ? (
                      <div className="bg-green-100 text-green-800 rounded-full p-1">
                        <Check size={16} />
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 rounded-full p-1">
                        <X size={16} />
                      </div>
                    ))}
                </div>
              </div>

              {/* Сонголтот асуулт */}
              {question.type === "select" && question.options && (
                <div className="space-y-2 mt-4">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-md border ${
                        studentAnswer === option.id
                          ? isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : correctAnswer === option.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            studentAnswer === option.id
                              ? isCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-red-500 bg-red-500 text-white"
                              : correctAnswer === option.id
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-gray-300"
                          }`}
                        >
                          {(studentAnswer === option.id || correctAnswer === option.id) && <Check size={12} />}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Олон сонголтот асуулт */}
              {question.type === "multiselect" && question.options && (
                <div className="space-y-2 mt-4">
                  {question.options.map((option) => {
                    let studentAnswerArray = []
                    try {
                      studentAnswerArray =
                        typeof studentAnswer === "string" && studentAnswer
                          ? JSON.parse(studentAnswer)
                          : Array.isArray(studentAnswer)
                            ? studentAnswer
                            : []
                    } catch (e) {
                      studentAnswerArray = [studentAnswer]
                    }

                    let correctAnswerArray = []
                    try {
                      correctAnswerArray =
                        typeof correctAnswer === "string" && correctAnswer
                          ? correctAnswer.startsWith("[")
                            ? JSON.parse(correctAnswer)
                            : [correctAnswer]
                          : Array.isArray(correctAnswer)
                            ? correctAnswer
                            : []
                    } catch (e) {
                      correctAnswerArray = [correctAnswer]
                    }

                    const isSelected = studentAnswerArray.includes(option.id)
                    const isCorrectOption = correctAnswerArray.includes(option.id)

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

              {/* Текст, тоо, нөхөх асуулт */}
              {(question.type === "text" || question.type === "number" || question.type === "fill") && (
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Таны хариулт:</span>
                  </div>
                  <div
                    className={`p-3 rounded-md border ${
                      isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                    }`}
                  >
                    {studentAnswer || "Хариулаагүй"}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Зөв хариулт:</span>
                    <div className="p-3 rounded-md border border-green-500 bg-green-50 mt-1">
                      {correctAnswer || "Тодорхойгүй"}
                    </div>
                  </div>
                </div>
              )}

              {/* Тайлбар */}
              {question.explanation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-800 mb-1">Тайлбар:</div>
                  <div className="text-blue-700">{question.explanation}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Багшийн тайлбар */}
      {result.feedback && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-6">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Багшийн тайлбар:</h2>
          <div className="text-blue-700">{result.feedback}</div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href="/student/results"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
        >
          Бүх дүнгүүд рүү буцах
        </Link>
      </div>
    </div>
  )
}
