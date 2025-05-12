import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react"

export default async function ViewExam({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  const examId = params.id

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
      userId: user.id,
    },
    include: {
      examQuestions: {
        include: {
          question: true,
        },
      },
      assignedTo: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
  })

  if (!exam) {
    redirect("/teacher/exams")
  }

  const questions = exam.examQuestions.map((eq) => eq.question)

  let results = []
  try {
    results = await prisma.result.findMany({
      where: {
        examId: examId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Шалгалтын дүнгийн мэдээллийг татахад алдаа гарлаа:", error)
  }

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
          {results.length > 0 && (
            <Link
              href={`/teacher/exams/results/${exam.id}`}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Users size={18} className="mr-1" />
              Дүнгүүд
            </Link>
          )}
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
              <span className="font-medium">{questions.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Оноогдсон сурагчид:</span>{" "}
              <span className="font-medium">{exam.assignedTo.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Шалгалт өгсөн:</span>{" "}
              <span className="font-medium">{results.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Дундаж оноо:</span>{" "}
              <span className="font-medium">
                {results.length > 0
                  ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
                  : "Тодорхойгүй"}
              </span>
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
      <h2 className="text-lg font-medium">Даалгаврууд ({questions.length})</h2>

{questions.map((question, index) => (
  <div key={question.id} className="p-4">
    <div className="flex justify-between">
      <h3 className="font-medium">Даалгавар #{index + 1} ({question.points} оноо)</h3>
            <span className="text-sm text-gray-500">
  {question.type === "select"
    ? "Нэг сонголттой"
    : question.type === "multiselect"
      ? "Олон сонголттой"
      : question.type === "fill"
        ? "Нөхөх"
        : ""}
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


              {question.type === "fill" && (
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

      {exam.assignedTo.length > 0 && (
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
      )}
    </div>
  )
}
