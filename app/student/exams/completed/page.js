import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, FileText, CheckCircle } from "lucide-react"

export default async function CompletedExams() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/login")
  }

  // Сурагчийн авсан шалгалтуудыг татах
  const completedExams = await prisma.examAssignment.findMany({
    where: {
      studentId: user.id,
      status: "completed",
    },
    include: {
      exam: true,
      result: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Авсан шалгалтууд</h1>
      </div>

      {completedExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Авсан шалгалт одоогоор байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedExams.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <h2 className="text-xl font-bold mb-1">{assignment.exam.subject}</h2>
                <p className="text-gray-600 mb-4">
                  {assignment.exam.grade}-р анги | {assignment.exam.topic}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm font-medium">Өдөр:</span>
                    <span className="text-sm ml-2">
                      {new Date(assignment.completedAt || assignment.exam.scheduledDate).toISOString().split("T")[0]}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <CheckCircle size={16} className="mr-2" />
                    <span className="text-sm font-medium">Оноо:</span>
                    <span className="text-sm ml-2">
                      {assignment.result
                        ? `${assignment.result.score}/${assignment.result.totalPoints}`
                        : "Тодорхойгүй"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <FileText size={16} className="mr-2" />
                    <span className="text-sm font-medium">Даалгавар:</span>
                    <span className="text-sm ml-2">{assignment.exam.questionCount || 30}</span>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-200">
                <Link
                  href={`/student/results/${assignment.resultId}`}
                  className="flex-1 px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium"
                >
                  Дүн харах
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
