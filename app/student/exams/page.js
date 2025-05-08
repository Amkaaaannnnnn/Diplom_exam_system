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
          questions: true,
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
    },
  })

  // Өгсөн шалгалтуудын ID-г хадгалах
  const takenExamIds = new Set(results.map((result) => result.examId))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Шалгалтууд</h1>

      {assignedExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Одоогоор шалгалт байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedExams.map(({ exam }) => {
            const hasTaken = takenExamIds.has(exam.id)

            return (
              <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold">{exam.title}</h2>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        hasTaken ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {hasTaken ? "Өгсөн" : "Шинэ"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{exam.subject}</p>
                  <div className="text-sm mb-4">
                    <p>
                      <span className="font-medium">Асуултын тоо:</span> {exam.questions?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium">Хугацаа:</span>{" "}
                      {exam.duration ? `${exam.duration} минут` : "Тодорхойгүй"}
                    </p>
                    <p>
                      <span className="font-medium">Багш:</span> {exam.user?.name || "Тодорхойгүй"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/student/exams/${exam.id}`}
                      className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      {hasTaken ? "Дүн харах" : "Шалгалт өгөх"}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
