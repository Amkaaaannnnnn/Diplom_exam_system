import { getServerUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Search, Filter, Users } from "lucide-react"

export default async function TeacherCompletedExamsPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Get current date
  const now = new Date()

  // Fetch completed exams created by this teacher
  const completedExams = await prisma.exam.findMany({
    where: {
      userId: user.id,
      examDate: {
        lt: now,
      },
    },
    orderBy: {
      examDate: "desc",
    },
    include: {
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
      Result: true,
    },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Авсан шалгалтууд</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Авсан шалгалтууд ({completedExams.length})</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Хайх..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {completedExams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">Авсан шалгалт байхгүй байна.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Шалгалтын нэр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хичээл
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Анги
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сурагчид
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дундаж оноо
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дэлгэрэнгүй
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedExams.map((exam) => {
                  // Calculate how many students have taken the exam
                  const totalAssigned = exam.assignedTo.length
                  const totalCompleted = exam.Result.length

                  // Calculate average score
                  const averageScore =
                    totalCompleted > 0
                      ? Math.round(exam.Result.reduce((sum, result) => sum + result.score, 0) / totalCompleted)
                      : 0

                  return (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/teacher/exams/${exam.id}`} className="text-blue-600 hover:text-blue-800">
                          {exam.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{exam.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{exam.className}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exam.examDate ? new Date(exam.examDate).toISOString().split("T")[0] : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {totalCompleted} / {totalAssigned} (
                        {totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {totalCompleted > 0 ? `${averageScore} / ${exam.totalPoints}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/teacher/exams/results/${exam.id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center w-fit"
                        >
                          <Users size={16} className="mr-1" />
                          Харах
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
