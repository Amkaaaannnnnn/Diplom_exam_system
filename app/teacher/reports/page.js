import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function TeacherReports() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Багшийн шалгалтуудыг татах
  const exams = await prisma.exam.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Шалгалт бүрийн дүнгийн мэдээллийг татах
  const examResults = await Promise.all(
    exams.map(async (exam) => {
      const results = await prisma.result.findMany({
        where: {
          examId: exam.id,
        },
        include: {
          user: true,
        },
      })

      // Дундаж оноо тооцоолох
      const averageScore =
        results.length > 0 ? results.reduce((acc, result) => acc + result.score, 0) / results.length : 0

      // Хамгийн өндөр оноо
      const highestScore = results.length > 0 ? Math.max(...results.map((result) => result.score)) : 0

      // Хамгийн бага оноо
      const lowestScore = results.length > 0 ? Math.min(...results.map((result) => result.score)) : 0

      // Тэнцсэн сурагчдын тоо (60% дээш)
      const passCount = results.filter((result) => result.score >= 60).length

      // Тэнцээгүй сурагчдын тоо (60% доош)
      const failCount = results.filter((result) => result.score < 60).length

      // Тэнцсэн хувь
      const passRate = results.length > 0 ? (passCount / results.length) * 100 : 0

      return {
        exam,
        results,
        stats: {
          totalStudents: results.length,
          averageScore,
          highestScore,
          lowestScore,
          passCount,
          failCount,
          passRate,
        },
      }
    }),
  )

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
      <h1 className="text-2xl font-bold mb-6">Тайлан</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Шалгалтын тоо</h2>
          <div className="text-4xl font-bold">{exams.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Нийт сурагч</h2>
          <div className="text-4xl font-bold">{studentsByClass.reduce((acc, cls) => acc + cls._count.id, 0)}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Дундаж тэнцсэн хувь</h2>
          <div className="text-4xl font-bold">
            {examResults.length > 0
              ? Math.round(examResults.reduce((acc, exam) => acc + exam.stats.passRate, 0) / examResults.length)
              : 0}
            %
          </div>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-4">Шалгалтын дүнгийн тайлан</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Шалгалтын нэр
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хичээл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Анги</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сурагчдын тоо
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дундаж оноо
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тэнцсэн хувь
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examResults.length > 0 ? (
              examResults.map(({ exam, stats }) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.totalStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(stats.averageScore)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(stats.passRate)}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Шалгалтын дүн олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  )
}
