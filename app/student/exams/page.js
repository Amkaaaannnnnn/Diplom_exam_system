import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function StudentExams() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Энэ сурагчид оноогдсон шалгалтуудыг татах
  const assignedExams = await prisma.examAssignment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      exam: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
          examQuestions: {
            include: {
              question: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Сурагчийн өгсөн шалгалтуудыг татах
  const results = await prisma.result.findMany({
    where: {
      userId: user.id,
    },
    select: {
      examId: true,
      id: true,
    },
  })

  // Өгсөн шалгалтуудын ID-г хадгалах
  const takenExamIds = new Map(results.map((result) => [result.examId, result.id]))

  // Current time for comparison
  const now = new Date()

  // Process exams with status information
  const processedExams = assignedExams.map(({ exam }) => {
    const hasTaken = takenExamIds.has(exam.id)
    const resultId = hasTaken ? takenExamIds.get(exam.id) : null

    // Parse exam date and time
    let examStartTime = null
    if (exam.examDate) {
      examStartTime = new Date(exam.examDate)
      if (exam.examTime) {
        const [hours, minutes] = exam.examTime.split(":").map(Number)
        examStartTime.setHours(hours, minutes, 0)
      }
    }

    // Calculate exam end time
    let examEndTime = null
    if (examStartTime) {
      examEndTime = new Date(examStartTime)
      examEndTime.setMinutes(examEndTime.getMinutes() + (exam.duration || 60))
    }

    // Determine exam status
    let status = "upcoming"
    if (hasTaken) {
      status = "completed"
    } else if (examEndTime && now > examEndTime) {
      status = "expired"
    } else if (examStartTime && now >= examStartTime) {
      status = "active"
    }

    return {
      ...exam,
      hasTaken,
      resultId,
      status,
      examStartTime,
      examEndTime,
      questionCount: exam.examQuestions?.length || 0,
    }
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Шалгалтууд</h1>

      {processedExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Одоогоор шалгалт байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedExams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{exam.title}</h2>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      exam.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : exam.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : exam.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {exam.status === "completed"
                      ? "Өгсөн"
                      : exam.status === "expired"
                        ? "Хугацаа дууссан"
                        : exam.status === "active"
                          ? "Идэвхтэй"
                          : "Хүлээгдэж буй"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{exam.subject}</p>
                <div className="text-sm mb-4">
                  <p>
                    <span className="font-medium">Асуултын тоо:</span> {exam.questionCount}
                  </p>
                  <p>
                    <span className="font-medium">Хугацаа:</span>{" "}
                    {exam.duration ? `${exam.duration} минут` : "Тодорхойгүй"}
                  </p>
                  <p>
                    <span className="font-medium">Багш:</span> {exam.user?.name || "Тодорхойгүй"}
                  </p>
                  {exam.examDate && (
                    <p>
                      <span className="font-medium">Огноо:</span> {new Date(exam.examDate).toLocaleDateString()}
                      {exam.examTime ? ` ${exam.examTime}` : ""}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  {exam.status === "completed" ? (
                    <Link
                      href={`/student/results/${exam.resultId}`}
                      className="block w-full text-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Дүн харах
                    </Link>
                  ) : exam.status === "expired" ? (
                    <div className="block w-full text-center py-2 px-4 bg-gray-400 text-white rounded cursor-not-allowed">
                      Хугацаа дууссан
                    </div>
                  ) : exam.status === "active" ? (
                    <Link
                      href={`/student/exams/${exam.id}`}
                      className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Шалгалт өгөх
                    </Link>
                  ) : (
                    <div className="block w-full text-center py-2 px-4 bg-yellow-500 text-white rounded cursor-not-allowed">
                      Хүлээгдэж буй
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
