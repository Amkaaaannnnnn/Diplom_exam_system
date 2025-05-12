import { getServerUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Search, Filter } from "lucide-react"

export default async function TeacherUpcomingExamsPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Get current date
  const now = new Date()

  // Fetch upcoming exams created by this teacher
  const upcomingExams = await prisma.exam.findMany({
    where: {
      userId: user.id,
      examDate: {
        gte: now,
      },
    },
    orderBy: {
      examDate: "asc",
    },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Авах шалгалтууд</h1>
        <Link
          href="/teacher/exams/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Шалгалт үүсгэх
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Авах шалгалтууд ({upcomingExams.length})</h2>
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

        {upcomingExams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">Авах шалгалт байхгүй байна.</p>
            <Link href="/teacher/exams/new" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <PlusCircle size={16} className="mr-1" />
              Шалгалт үүсгэх
            </Link>
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
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingExams.map((exam) => (
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
                      {exam.examTime ? ` ${exam.examTime}` : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* This would need to be updated to show the actual count */}-
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link href={`/teacher/exams/${exam.id}`} className="text-blue-600 hover:text-blue-800">
                          Харах
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href={`/teacher/exams/edit/${exam.id}`} className="text-blue-600 hover:text-blue-800">
                          Засах
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href={`/teacher/exams/delete/${exam.id}`} className="text-red-600 hover:text-red-800">
                          Устгах
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
