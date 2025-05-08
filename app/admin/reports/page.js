import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BarChart2, PieChart, LineChart } from "lucide-react"

export default async function AdminReports() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/login")
  }

  // Get counts for reports
  const studentCount = await prisma.user.count({
    where: { role: "student" },
  })

  const teacherCount = await prisma.user.count({
    where: { role: "teacher" },
  })

  const examCount = await prisma.exam.count()

  // Get recent exams
  const recentExams = await prisma.exam.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  })

  // Get recent results
  const recentResults = await prisma.result.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      exam: true,
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Тайлан</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <BarChart2 className="mr-2" size={20} />
            Хэрэглэгчийн тайлан
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Нийт сурагч:</span>
              <span className="font-medium">{studentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Нийт багш:</span>
              <span className="font-medium">{teacherCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Нийт хэрэглэгч:</span>
              <span className="font-medium">{studentCount + teacherCount + 1}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <PieChart className="mr-2" size={20} />
            Шалгалтын тайлан
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Нийт шалгалт:</span>
              <span className="font-medium">{examCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Өнөөдрийн шалгалт:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ирэх 7 хоногийн шалгалт:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <LineChart className="mr-2" size={20} />
            Дүнгийн тайлан
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Дундаж оноо:</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Хамгийн өндөр оноо:</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Хамгийн бага оноо:</span>
              <span className="font-medium">0%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Сүүлийн шалгалтууд</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Шалгалтын нэр
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хичээл
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Багш
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{exam.title}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{exam.subject}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{exam.user.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {new Date(exam.createdAt).toISOString().split("T")[0]}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                      Шалгалт олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Сүүлийн дүнгүүд</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сурагч
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Шалгалт
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Оноо
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{result.user.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{result.exam.title}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{result.score}%</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {new Date(result.createdAt).toISOString().split("T")[0]}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                      Дүн олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
