import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Edit, Check, X } from "lucide-react"

export default async function StudentExamResult({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/")
  }

  const { id, studentId } = params

  // Шалгалтын мэдээллийг авах
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  })

  if (!exam) {
    notFound()
  }

  // Багш зөвхөн өөрийн шалгалтын дүнг харах боломжтой
  if (user.role === "teacher" && exam.userId !== user.id) {
    redirect("/teacher/exams")
  }

  // Сурагчийн мэдээллийг авах
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  })

  if (!student || student.role !== "student") {
    notFound()
  }

  // Шалгалтын дүнг авах
  const result = await prisma.result.findFirst({
    where: {
      examId: id,
      userId: studentId,
    },
  })

  if (!result) {
    notFound()
  }

  // Үнэлгээ тодорхойлох
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Хариултуудыг задлах
  const answers = result.answers || []

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/teacher/exams/results/${id}`} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-gray-500 ml-2">
          {exam.subject} | {exam.className} | {new Date(exam.examDate).toLocaleDateString()}
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href={`/teacher/exams/results/${id}/student/${studentId}/edit`}
            className="flex items-center gap-2 bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700"
          >
            <Edit size={18} />
            <span>Засах</span>
          </Link>
          <button className="flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">
            <Printer size={18} />
            <span>Хэвлэх</span>
          </button>
        </div>
      </div>

      {/* Student info and score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Сурагчийн мэдээлэл</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Нэр:</span>
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Нэвтрэх нэр:</span>
                <span className="font-medium">{student.username}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Анги:</span>
                <span className="font-medium">{student.className}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Шалгалтын дүн</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Оноо:</span>
                <span className="font-medium">
                  {Math.round((result.score * exam.totalPoints) / 100)}/{exam.totalPoints}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Хувь:</span>
                <span className="font-medium">{result.score}%</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Үнэлгээ:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    getGrade(result.score) === "A"
                      ? "bg-green-100 text-green-800"
                      : getGrade(result.score) === "B"
                        ? "bg-blue-100 text-blue-800"
                        : getGrade(result.score) === "C"
                          ? "bg-yellow-100 text-yellow-800"
                          : getGrade(result.score) === "D"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                  }`}
                >
                  {getGrade(result.score)}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Эхэлсэн:</span>
                <span className="font-medium">{new Date(result.startedAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Дууссан:</span>
                <span className="font-medium">{new Date(result.submittedAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Зарцуулсан:</span>
                <span className="font-medium">
                  {Math.floor((new Date(result.submittedAt) - new Date(result.startedAt)) / 60000)} мин
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <h2 className="text-xl font-medium mb-4">Хариултууд</h2>
      <div className="space-y-6">
        {exam.questions.map((question, index) => {
          const answer = answers.find((a) => a.questionId === question.id)
          const isCorrect = answer && answer.isCorrect

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

              {answer && answer.feedback && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-800 mb-1">Багшийн тайлбар:</div>
                  <div className="text-blue-700">{answer.feedback}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {result.feedback && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-6">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Багшийн ерөнхий тайлбар:</h2>
          <div className="text-blue-700">{result.feedback}</div>
        </div>
      )}
    </div>
  )
}
