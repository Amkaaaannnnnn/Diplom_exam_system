import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Users, BarChart2, Plus } from "lucide-react"

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  const exams = await prisma.exam.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Багшийн хичээлийн сурагчдын дүнгийн мэдээлэл
  const results = await prisma.result.findMany({
    where: {
      exam: {
        userId: user.id,
      },
    },
    include: {
      user: true,
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  // Ангиар бүлэглэсэн сурагчдын тоо
  const studentsByClass = await prisma.user.groupBy({
    by: ["className"],
    where: {
      role: "student",
      className: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      className: "asc",
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Багшийн хянах самбар</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start mb-4">
            <div className="mr-4 p-2 bg-blue-50 rounded-md">
              <FileText className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Шалгалтын сан</h3>
              <p className="text-gray-600 text-sm">Шалгалтууд болон даалгаврууд</p>
            </div>
          </div>
          <Link
            href="/teacher/exams"
            className="block mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
          >
            Шалгалтын сан руу орох
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start mb-4">
            <div className="mr-4 p-2 bg-green-50 rounded-md">
              <Users className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Сурагчид</h3>
              <p className="text-gray-600 text-sm">Сурагчдын мэдээлэл, дүн</p>
            </div>
          </div>
          <Link
            href="/teacher/students"
            className="block mt-4 text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
          >
            Сурагчдын жагсаалт
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start mb-4">
            <div className="mr-4 p-2 bg-purple-50 rounded-md">
              <BarChart2 className="text-purple-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Тайлан</h3>
              <p className="text-gray-600 text-sm">Дүнгийн тайлан, статистик</p>
            </div>
          </div>
          <Link
            href="/teacher/reports"
            className="block mt-4 text-center bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md"
          >
            Тайлан харах
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Сүүлийн шалгалтууд</h2>
            <Link href="/teacher/exams/new" className="flex items-center text-blue-500 hover:text-blue-700">
              <Plus size={16} className="mr-1" />
              Шалгалт нэмэх
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/teacher/exams/${exam.id}`} className="hover:text-blue-600">
                          {exam.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(exam.createdAt).toISOString().split("T")[0]}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Шалгалт олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Сурагчдын дүн</h2>
            <Link href="/teacher/results" className="text-blue-500 hover:text-blue-700">
              Бүгдийг харах
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сурагч
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Шалгалт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Оноо
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.length > 0 ? (
                  results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.exam.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Дүн олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Ангиар</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {studentsByClass.map((classGroup) => (
            <div
              key={classGroup.className}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
            >
              <div>
                <div className="text-sm text-gray-500">Анги</div>
                <div className="font-medium">{classGroup.className}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Сурагч</div>
                <div className="font-medium text-center">{classGroup._count.id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
