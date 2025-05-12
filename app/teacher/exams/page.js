import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Eye, Edit, Trash2 } from "lucide-react"

export default async function TeacherExams() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Багшийн үүсгэсэн шалгалтуудыг татах
const exams = await prisma.exam.findMany({
  where: {
    userId: user.id,
  },
  include: {
    examQuestions: { include: { question: true }, },
    assignedTo: true,
    Result: true,
  },
  orderBy: {
    createdAt: "desc",
  },
})



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Шалгалтын сан</h1>
        <Link
          href="/teacher/exams/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Шалгалт нэмэх
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  Огноо
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Асуултын тоо
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/teacher/exams/${exam.id}`} className="text-blue-600 hover:underline">
                      {exam.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{exam.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exam.examDate ? new Date(exam.examDate).toISOString().split("T")[0] : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{exam.examQuestions.length}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        href={`/teacher/exams/${exam.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Харах"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/teacher/exams/edit/${exam.id}`}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Засах"
                      >
                        <Edit size={18} />
                      </Link>
                      <Link
                        href={`/teacher/exams/delete/${exam.id}`}
                        className="text-red-600 hover:text-red-900"
                        title="Устгах"
                      >
                        <Trash2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
