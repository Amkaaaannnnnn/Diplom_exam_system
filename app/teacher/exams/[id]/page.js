"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

export default function ExamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exam, setExam] = useState(null)

  useEffect(() => {
    async function fetchExam() {
      try {
        setLoading(true)
        const response = await fetch(`/api/exams/${id}`, {
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Шалгалтын мэдээлэл татахад алдаа гарлаа")
        }

        const examData = await response.json()
        setExam(examData)

        // Check if the exam has already ended
        const isExamEnded = checkIfExamEnded(examData)
        if (isExamEnded) {
          // Redirect to completed exams
          router.push("/teacher/exams/completed")
          return
        }

        // Check if the exam hasn't started yet
        const isExamUpcoming = checkIfExamUpcoming(examData)
        if (isExamUpcoming) {
          // Redirect to upcoming exams
          router.push("/teacher/exams/upcoming")
          return
        }
      } catch (error) {
        console.error("Error fetching exam:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [id, router])

  // Function to check if the exam has already ended
  const checkIfExamEnded = (exam) => {
    if (!exam || !exam.examDate) return false

    const examDate = new Date(exam.examDate)

    // If exam time is specified, add it to the date
    if (exam.examTime) {
      const [hours, minutes] = exam.examTime.split(":").map(Number)
      examDate.setHours(hours, minutes, 0)
    }

    // Add the duration to get the end time
    const examEndTime = new Date(examDate)
    examEndTime.setMinutes(examEndTime.getMinutes() + (exam.duration || 0))

    // Check if current time is after the end time
    return new Date() > examEndTime
  }

  // Function to check if the exam hasn't started yet
  const checkIfExamUpcoming = (exam) => {
    if (!exam || !exam.examDate) return false

    const examDate = new Date(exam.examDate)

    // If exam time is specified, add it to the date
    if (exam.examTime) {
      const [hours, minutes] = exam.examTime.split(":").map(Number)
      examDate.setHours(hours, minutes, 0)
    }

    // Check if current time is before the start time
    return new Date() < examDate
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
          <Link href="/teacher/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Анхааруулга!</strong>
          <span className="block sm:inline"> Шалгалтын мэдээлэл олдсонгүй.</span>
        </div>
        <div className="mt-4">
          <Link href="/teacher/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
  }

  // Render exam details
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/teacher/exams/edit/${exam.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Pencil size={18} className="mr-1" />
            Засах
          </Link>
          <Link
            href={`/teacher/exams/delete/${exam.id}`}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Trash2 size={18} className="mr-1" />
            Устгах
          </Link>
          {/* {results.length > 0 && (
            <Link
              href={`/teacher/exams/results/${exam.id}`}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Users size={18} className="mr-1" />
              Дүнгүүд
            </Link>
          )} */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-2">Ерөнхий мэдээлэл</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Хичээл:</span> <span className="font-medium">{exam.subject}</span>
            </div>
            <div>
              <span className="text-gray-500">Анги:</span> <span className="font-medium">{exam.className}</span>
            </div>
            <div>
              <span className="text-gray-500">Үргэлжлэх хугацаа:</span>{" "}
              <span className="font-medium">{exam.duration} минут</span>
            </div>
            <div>
              <span className="text-gray-500">Нийт оноо:</span> <span className="font-medium">{exam.totalPoints}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-2">Шалгалтын огноо</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Огноо:</span>{" "}
              <span className="font-medium">
                {exam.examDate ? new Date(exam.examDate).toISOString().split("T")[0] : "Тодорхойгүй"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Цаг:</span>{" "}
              <span className="font-medium">{exam.examTime || "Тодорхойгүй"}</span>
            </div>
            <div>
              <span className="text-gray-500">Үүсгэсэн:</span>{" "}
              <span className="font-medium">{new Date(exam.createdAt).toISOString().split("T")[0]}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-2">Статистик</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Даалгаврын тоо:</span>{" "}
              <span className="font-medium">{exam.questions.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Оноогдсон сурагчид:</span>{" "}
              <span className="font-medium">{exam.assignedTo.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Шалгалт өгсөн:</span>{" "}
              {/* <span className="font-medium">{results.length}</span> */}
            </div>
            <div>
              <span className="text-gray-500">Дундаж оноо:</span>{" "}
              {/* <span className="font-medium">
                {results.length > 0
                  ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
                  : "Тодорхойгүй"}
              </span> */}
            </div>
          </div>
        </div>
      </div>

      {exam.description && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-medium mb-2">Тайлбар</h2>
          <p className="text-gray-700">{exam.description}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Даалгаврууд ({exam.questions.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="p-4">
              <div className="flex justify-between">
                <h3 className="font-medium">
                  Даалгавар #{index + 1} ({question.points} оноо)
                </h3>
                <span className="text-sm text-gray-500">
                  {question.type === "select"
                    ? "Нэг сонголттой"
                    : question.type === "multiselect"
                      ? "Олон сонголттой"
                      : question.type === "text"
                        ? "Текст"
                        : "Тоон"}
                </span>
              </div>
              <p className="mt-2 mb-4">{question.text}</p>

              {(question.type === "select" || question.type === "multiselect") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-2 rounded-md border ${
                        Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.includes(option.id)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                          : question.correctAnswer === option.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md mr-2">
                          {option.id}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(question.type === "text" || question.type === "number") && (
                <div className="mt-2">
                  <div className="font-medium text-sm text-gray-500 mb-1">Зөв хариулт:</div>
                  <div className="p-2 rounded-md border border-green-500 bg-green-50 inline-block">
                    {question.correctAnswer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* {exam.assignedTo.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Оноогдсон сурагчид ({exam.assignedTo.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бүртгэлийн дугаар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дүн
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exam.assignedTo.map((assignment) => {
                  const result = results.find((r) => r.userId === assignment.userId)
                  return (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : assignment.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {assignment.status === "COMPLETED"
                            ? "Дууссан"
                            : assignment.status === "IN_PROGRESS"
                              ? "Хийж байгаа"
                              : "Хүлээгдэж буй"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result ? (
                          <Link
                            href={`/teacher/exams/results/${exam.id}/student/${assignment.userId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {result.score} / {exam.totalPoints} ({Math.round((result.score / exam.totalPoints) * 100)}%)
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )} */}
    </div>
  )
}
