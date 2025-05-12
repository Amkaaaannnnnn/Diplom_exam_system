import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StudentResultPage({ params }) {
  const user = await getUser()

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/login")
  }

  const { id, studentId } = params

  try {
    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        createdBy: true,
        subject: true,
      },
    })

    if (!exam) {
      return (
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Шалгалт олдсонгүй</div>
        </div>
      )
    }

    // Check if user is admin or the teacher who created the exam
    if (user.role !== "ADMIN" && exam.createdBy.id !== user.id) {
      return (
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Энэ шалгалтын дүнг харах эрх танд байхгүй байна
          </div>
        </div>
      )
    }

    // Get the student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return (
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Сурагч олдсонгүй</div>
        </div>
      )
    }

    // Get the exam result
    const result = await prisma.examResult.findFirst({
      where: {
        examId: id,
        userId: studentId,
      },
      include: {
        answers: {
          include: {
            question: true, // This will include all fields from the question model
          },
        },
      },
    })

    if (!result) {
      return (
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Шалгалтын дүн олдсонгүй</div>
        </div>
      )
    }

    // Calculate score
    const totalQuestions = result.answers.length
    const correctAnswers = result.answers.filter((answer) => answer.isCorrect).length
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href={`/teacher/exams/results/${id}`} className="text-blue-500 hover:underline flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Бүх дүн рүү буцах
            </Link>
            <h1 className="text-2xl font-bold mt-2">{exam.title}</h1>
            <p className="text-gray-600">
              {exam.subject.name} | {exam.totalPoints} оноо
            </p>
          </div>
          <Link
            href={`/teacher/exams/results/${id}/student/${studentId}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Дүн засах
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Сурагчийн мэдээлэл</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Нэр:</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Анги:</p>
              <p className="font-medium">{student.className}</p>
            </div>
            <div>
              <p className="text-gray-600">Регистр:</p>
              <p className="font-medium">{student.register}</p>
            </div>
            <div>
              <p className="text-gray-600">Хэрэглэгчийн нэр:</p>
              <p className="font-medium">{student.username}</p>
            </div>
          </div>
        </div>

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
            <div>
              <p className="text-gray-600">Дууссан:</p>
              <p className="font-medium">{new Date(result.submittedAt).toLocaleString("mn-MN")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Хариултууд</h2>
          {result.answers.map((answer, index) => (
            <div key={answer.id} className="border-b last:border-b-0 py-4">
              <div className="flex justify-between">
                <h3 className="font-medium">Асуулт {index + 1}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {answer.isCorrect ? "Зөв" : "Буруу"}
                </span>
              </div>
              <p className="my-2">{answer.question.text}</p>

              {answer.question.type === "MULTIPLE_CHOICE" && (
                <div className="ml-4 mt-2">
                  {JSON.parse(answer.question.options).map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`
                      p-2 my-1 rounded
                      ${
                        answer.answer === option
                          ? answer.isCorrect
                            ? "bg-green-100"
                            : "bg-red-100"
                          : answer.question.correctAnswer === option
                            ? "bg-green-100"
                            : ""
                      }
                    `}
                    >
                      {option}
                      {answer.answer === option && !answer.isCorrect && (
                        <span className="ml-2 text-red-600">← Сурагчийн хариулт</span>
                      )}
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
                    className={`p-2 my-1 rounded ${answer.answer === "true" ? (answer.isCorrect ? "bg-green-100" : "bg-red-100") : ""}`}
                  >
                    Үнэн
                    {answer.answer === "true" && !answer.isCorrect && (
                      <span className="ml-2 text-red-600">← Сурагчийн хариулт</span>
                    )}
                    {answer.question.correctAnswer === "true" && (
                      <span className="ml-2 text-green-600">← Зөв хариулт</span>
                    )}
                  </div>
                  <div
                    className={`p-2 my-1 rounded ${answer.answer === "false" ? (answer.isCorrect ? "bg-green-100" : "bg-red-100") : ""}`}
                  >
                    Худал
                    {answer.answer === "false" && !answer.isCorrect && (
                      <span className="ml-2 text-red-600">← Сурагчийн хариулт</span>
                    )}
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
                    <div className="p-2 bg-green-100 rounded">{answer.question.correctAnswer}</div>
                  </div>
                  <div>
                    <span className="font-medium">Сурагчийн хариулт:</span>
                    <div className={`p-2 rounded ${answer.isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                      {answer.answer}
                    </div>
                  </div>
                </div>
              )}

              {answer.feedback && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="font-medium">Багшийн тайлбар:</p>
                  <p>{answer.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching student result:", error)
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Алдаа гарлаа: {error.message}
        </div>
      </div>
    )
  }
}
