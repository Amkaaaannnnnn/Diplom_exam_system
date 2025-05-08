"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Printer, ArrowLeft, Download, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExamResultDetail({ params }) {
  const router = useRouter()
  const { id } = params
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/results/${id}`)
        if (!response.ok) {
          throw new Error("Шалгалтын дүнг татахад алдаа гарлаа")
        }
        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResult()
    }
  }, [id])

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // PDF татах функц - хэрэгжүүлэх шаардлагатай
    alert("PDF татах функц хэрэгжүүлэгдээгүй байна")
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/student/results")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
          </Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Шалгалтын дүн олдсонгүй.
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/student/results")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
          </Button>
        </div>
      </div>
    )
  }

  const isPassed = result.score >= 60

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Хэвлэх үед харагдахгүй байх товчууд */}
        <div className="print:hidden mb-6 flex flex-wrap justify-between items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/student/results")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF Татах
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Хэвлэх
            </Button>
          </div>
        </div>

        {/* Шалгалтын дүнгийн хуудас */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardContent className="p-0">
            <div className="border-b p-6">
              <h1 className="text-2xl font-bold">{result.exam.title}</h1>
              <p className="text-gray-600">{result.exam.subject}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-b">
              <div>
                <p className="text-gray-600 mb-1">Хэзээ: {new Date(result.submittedAt).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-1">Хугацаа: {result.exam.duration} минут</p>
                <p className="text-gray-600">Багш: {result.exam.user?.name || "Тодорхойгүй"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Нэр: {result.user.name}</p>
                <p className="text-gray-600 mb-1">Бүртгэлийн дугаар: {result.user.register || result.user.username}</p>
                <p className="text-gray-600">Анги: {result.user.className || "Тодорхойгүй"}</p>
              </div>
            </div>

            {/* Дүнгийн хэсэг */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-gray-500 text-sm">Оноо</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.earnedPoints}/{result.totalPoints}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-gray-500 text-sm">Хувь</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-gray-500 text-sm">Үнэлгээ</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{getLetterGrade(result.score)}</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                {isPassed ? (
                  <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full inline-block">
                    <span className="font-semibold">Тэнцсэн</span>
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 py-2 px-4 rounded-full inline-block">
                    <span className="font-semibold">Тэнцээгүй</span>
                  </div>
                )}
              </div>
            </div>

            {/* Багшийн тайлбар */}
            {result.feedback && (
              <div className="p-6 border-b">
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Багшийн тайлбар:</h3>
                    <p className="text-gray-700 mt-1">{result.feedback}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Асуултуудын хэсэг */}
            {result.answers && result.answers.length > 0 && (
              <div className="p-6">
                <Tabs defaultValue="all" className="print:hidden">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Бүх асуултууд</TabsTrigger>
                    <TabsTrigger value="correct">Зөв хариултууд</TabsTrigger>
                    <TabsTrigger value="incorrect">Буруу хариултууд</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-6">
                    {result.answers.map((answer, index) => {
                      // Find the corresponding question
                      const question = result.exam.questions.find((q) => q.id === answer.questionId)
                      if (!question) return null

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start mb-2">
                            <div
                              className={`flex-shrink-0 mt-1 mr-3 ${
                                answer.isCorrect ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {answer.isCorrect ? <Check size={20} /> : <X size={20} />}
                            </div>
                            <div>
                              <p className="font-medium">
                                {index + 1}. {question.text} ({question.points} оноо)
                              </p>
                            </div>
                          </div>

                          {/* Сонголтууд */}
                          {question.type === "select" && question.options && (
                            <div className="ml-8 mt-2">
                              {JSON.parse(JSON.stringify(question.options)).map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center mb-1">
                                  <div
                                    className={`h-5 w-5 border rounded-full mr-2 flex items-center justify-center text-xs
                                      ${
                                        answer.studentAnswer === option.id
                                          ? answer.isCorrect
                                            ? "bg-green-100 border-green-500"
                                            : "bg-red-100 border-red-500"
                                          : question.correctAnswer === option.id
                                            ? "bg-green-50 border-green-300"
                                            : ""
                                      }`}
                                  >
                                    {option.id}
                                  </div>
                                  <span
                                    className={`
                                    ${
                                      answer.studentAnswer === option.id
                                        ? answer.isCorrect
                                          ? "text-green-700 font-medium"
                                          : "text-red-700 font-medium"
                                        : question.correctAnswer === option.id
                                          ? "text-green-600"
                                          : ""
                                    }
                                  `}
                                  >
                                    {option.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Текст, тоо хариултууд */}
                          {(question.type === "text" || question.type === "number") && (
                            <div className="ml-8 mt-2">
                              <div className="mb-1">
                                <span className="text-gray-600">Таны хариулт: </span>
                                <span
                                  className={
                                    answer.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                  }
                                >
                                  {answer.studentAnswer}
                                </span>
                              </div>
                              {!answer.isCorrect && (
                                <div className="mb-1">
                                  <span className="text-gray-600">Зөв хариулт: </span>
                                  <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Асуултын тайлбар */}
                          {answer.feedback && (
                            <div className="ml-8 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">Тайлбар: </span>
                                {answer.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </TabsContent>

                  <TabsContent value="correct" className="space-y-6">
                    {result.answers
                      .filter((answer) => answer.isCorrect)
                      .map((answer, index) => {
                        const question = result.exam.questions.find((q) => q.id === answer.questionId)
                        if (!question) return null

                        return (
                          <div key={index} className="border rounded-lg p-4 border-green-200 bg-green-50">
                            <div className="flex items-start mb-2">
                              <div className="flex-shrink-0 mt-1 mr-3 text-green-500">
                                <Check size={20} />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {index + 1}. {question.text} ({question.points} оноо)
                                </p>
                              </div>
                            </div>

                            {/* Сонголтууд */}
                            {question.type === "select" && question.options && (
                              <div className="ml-8 mt-2">
                                {JSON.parse(JSON.stringify(question.options)).map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center mb-1">
                                    <div
                                      className={`h-5 w-5 border rounded-full mr-2 flex items-center justify-center text-xs
                                        ${
                                          answer.studentAnswer === option.id
                                            ? "bg-green-100 border-green-500"
                                            : option.id === question.correctAnswer
                                              ? "bg-green-50 border-green-300"
                                              : ""
                                        }`}
                                    >
                                      {option.id}
                                    </div>
                                    <span
                                      className={`
                                      ${
                                        answer.studentAnswer === option.id
                                          ? "text-green-700 font-medium"
                                          : option.id === question.correctAnswer
                                            ? "text-green-600"
                                            : ""
                                      }
                                    `}
                                    >
                                      {option.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Текст, тоо хариултууд */}
                            {(question.type === "text" || question.type === "number") && (
                              <div className="ml-8 mt-2">
                                <div className="mb-1">
                                  <span className="text-gray-600">Таны хариулт: </span>
                                  <span className="text-green-600 font-medium">{answer.studentAnswer}</span>
                                </div>
                              </div>
                            )}

                            {/* Асуултын тайлбар */}
                            {answer.feedback && (
                              <div className="ml-8 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                                <p className="text-sm text-blue-800">
                                  <span className="font-medium">Тайлбар: </span>
                                  {answer.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </TabsContent>

                  <TabsContent value="incorrect" className="space-y-6">
                    {result.answers
                      .filter((answer) => !answer.isCorrect)
                      .map((answer, index) => {
                        const question = result.exam.questions.find((q) => q.id === answer.questionId)
                        if (!question) return null

                        return (
                          <div key={index} className="border rounded-lg p-4 border-red-200 bg-red-50">
                            <div className="flex items-start mb-2">
                              <div className="flex-shrink-0 mt-1 mr-3 text-red-500">
                                <X size={20} />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {index + 1}. {question.text} ({question.points} оноо)
                                </p>
                              </div>
                            </div>

                            {/* Сонголтууд */}
                            {question.type === "select" && question.options && (
                              <div className="ml-8 mt-2">
                                {JSON.parse(JSON.stringify(question.options)).map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center mb-1">
                                    <div
                                      className={`h-5 w-5 border rounded-full mr-2 flex items-center justify-center text-xs
                                        ${
                                          answer.studentAnswer === option.id
                                            ? "bg-red-100 border-red-500"
                                            : option.id === question.correctAnswer
                                              ? "bg-green-100 border-green-500"
                                              : ""
                                        }`}
                                    >
                                      {option.id}
                                    </div>
                                    <span
                                      className={`
                                      ${
                                        answer.studentAnswer === option.id
                                          ? "text-red-700 font-medium"
                                          : option.id === question.correctAnswer
                                            ? "text-green-700 font-medium"
                                            : ""
                                      }
                                    `}
                                    >
                                      {option.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Текст, тоо хариултууд */}
                            {(question.type === "text" || question.type === "number") && (
                              <div className="ml-8 mt-2">
                                <div className="mb-1">
                                  <span className="text-gray-600">Таны хариулт: </span>
                                  <span className="text-red-600 font-medium">{answer.studentAnswer}</span>
                                </div>
                                <div className="mb-1">
                                  <span className="text-gray-600">Зөв хариулт: </span>
                                  <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                                </div>
                              </div>
                            )}

                            {/* Асуултын тайлбар */}
                            {answer.feedback && (
                              <div className="ml-8 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                                <p className="text-sm text-blue-800">
                                  <span className="font-medium">Тайлбар: </span>
                                  {answer.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </TabsContent>
                </Tabs>

                {/* Хэвлэх үед харагдах хэсэг */}
                <div className="hidden print:block space-y-6">
                  {result.answers.map((answer, index) => {
                    // Find the corresponding question
                    const question = result.exam.questions.find((q) => q.id === answer.questionId)
                    if (!question) return null

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start mb-2">
                          <div
                            className={`flex-shrink-0 mt-1 mr-3 ${
                              answer.isCorrect ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {answer.isCorrect ? <Check size={20} /> : <X size={20} />}
                          </div>
                          <div>
                            <p className="font-medium">
                              {index + 1}. {question.text} ({question.points} оноо)
                            </p>
                          </div>
                        </div>

                        {/* Сонголтууд */}
                        {question.type === "select" && question.options && (
                          <div className="ml-8 mt-2">
                            {JSON.parse(JSON.stringify(question.options)).map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center mb-1">
                                <div
                                  className={`h-5 w-5 border rounded-full mr-2 flex items-center justify-center text-xs
                                    ${
                                      answer.studentAnswer === option.id
                                        ? answer.isCorrect
                                          ? "bg-green-100 border-green-500"
                                          : "bg-red-100 border-red-500"
                                        : question.correctAnswer === option.id
                                          ? "bg-green-50 border-green-300"
                                          : ""
                                    }`}
                                >
                                  {option.id}
                                </div>
                                <span
                                  className={`
                                  ${
                                    answer.studentAnswer === option.id
                                      ? answer.isCorrect
                                        ? "text-green-700 font-medium"
                                        : "text-red-700 font-medium"
                                      : question.correctAnswer === option.id
                                        ? "text-green-600"
                                        : ""
                                  }
                                `}
                                >
                                  {option.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Текст, тоо хариултууд */}
                        {(question.type === "text" || question.type === "number") && (
                          <div className="ml-8 mt-2">
                            <div className="mb-1">
                              <span className="text-gray-600">Таны хариулт: </span>
                              <span
                                className={answer.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                              >
                                {answer.studentAnswer}
                              </span>
                            </div>
                            {!answer.isCorrect && (
                              <div className="mb-1">
                                <span className="text-gray-600">Зөв хариулт: </span>
                                <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Асуултын тайлбар */}
                        {answer.feedback && (
                          <div className="ml-8 mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Тайлбар: </span>
                              {answer.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
