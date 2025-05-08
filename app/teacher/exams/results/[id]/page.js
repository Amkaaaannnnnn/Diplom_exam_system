import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Search, SortAsc, Clock, Users } from "lucide-react"

export default async function ExamResults({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/")
  }

  const { id } = params

  // Шалгалтын мэдээллийг авах
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  })

  if (!exam) {
    notFound()
  }

  // Багш зөвхөн өөрийн шалгалтын дүнг харах боломжтой
  if (user.role === "teacher" && exam.userId !== user.id) {
    redirect("/teacher/exams")
  }

  // Шалгалтын дүнгүүдийг авах
  const results = await prisma.result.findMany({
    where: {
      examId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          className: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  })

  // Статистик тооцоолох
  const totalStudents = results.length
  const averageScore =
    totalStudents > 0 ? Math.round(results.reduce((acc, result) => acc + result.score, 0) / totalStudents) : 0
  const passRate =
    totalStudents > 0 ? Math.round((results.filter((result) => result.score >= 60).length / totalStudents) * 100) : 0

  // Оноо хуваарилалт
  const scoreDistribution = {
    "90-100": results.filter((r) => r.score >= 90).length,
    "80-89": results.filter((r) => r.score >= 80 && r.score < 90).length,
    "70-79": results.filter((r) => r.score >= 70 && r.score < 80).length,
    "60-69": results.filter((r) => r.score >= 60 && r.score < 70).length,
    "0-59": results.filter((r) => r.score < 60).length,
  }

  // Үнэлгээ тодорхойлох
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/teacher/results" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-gray-500 ml-2">
          {exam.subject} | {exam.className} | {new Date(exam.examDate).toLocaleDateString()}
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">
            <Download size={18} />
            <span>Тайлан татах</span>
          </button>
        </div>
      </div>

      {/* Key statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Нийт сурагч</div>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <div className="flex items-center mt-2">
            <Users className="text-blue-500" size={18} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Дундаж оноо</div>
          <div className="text-2xl font-bold">{averageScore}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                averageScore >= 80 ? "bg-green-500" : averageScore >= 60 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Тэнцсэн хувь</div>
          <div className="text-2xl font-bold">{passRate}%</div>
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${passRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Хугацаа</div>
          <div className="text-2xl font-bold">{exam.duration} мин</div>
          <div className="flex items-center mt-2">
            <Clock className="text-purple-500" size={18} />
          </div>
        </div>
      </div>

      {/* Score distribution */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Оноо хуваарилалт</h3>
        <div className="space-y-3">
          {Object.entries(scoreDistribution).map(([range, count]) => (
            <div key={range} className="flex items-center">
              <div className="w-20 text-sm">{range}</div>
              <div className="flex-1 mx-2">
                <div className="bg-gray-200 h-5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      range === "90-100"
                        ? "bg-green-500"
                        : range === "80-89"
                          ? "bg-blue-500"
                          : range === "70-79"
                            ? "bg-yellow-500"
                            : range === "60-69"
                              ? "bg-orange-500"
                              : "bg-red-500"
                    }`}
                    style={{ width: `${totalStudents > 0 ? (count / totalStudents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Хайх..."
              className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Бүгд</option>
            <option value="passed">Тэнцсэн</option>
            <option value="failed">Тэнцээгүй</option>
          </select>
        </div>
      </div>

      {/* Results table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                №
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  Сурагчийн нэр <SortAsc size={14} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  Оноо <SortAsc size={14} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  Хувь <SortAsc size={14} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  Үнэлгээ <SortAsc size={14} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Төлөв
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  Зарцуулсан хугацаа <SortAsc size={14} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Дэлгэрэнгүй
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Дүн олдсонгүй
                </td>
              </tr>
            ) : (
              results.map((result, index) => {
                const grade = getGrade(result.score)
                const duration = Math.floor((new Date(result.submittedAt) - new Date(result.startedAt)) / 60000)

                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.user.name}</div>
                      <div className="text-xs text-gray-500">{result.user.className}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round((result.score * exam.totalPoints) / 100)}/{exam.totalPoints}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          result.score >= 90
                            ? "text-green-600"
                            : result.score >= 80
                              ? "text-blue-600"
                              : result.score >= 70
                                ? "text-yellow-600"
                                : result.score >= 60
                                  ? "text-orange-600"
                                  : "text-red-600"
                        }`}
                      >
                        {result.score}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          grade === "A"
                            ? "bg-green-100 text-green-800"
                            : grade === "B"
                              ? "bg-blue-100 text-blue-800"
                              : grade === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : grade === "D"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {grade}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">Дууссан</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{duration} мин</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/teacher/exams/results/${id}/student/${result.userId}`}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md mr-2"
                      >
                        Харах
                      </Link>
                      <Link
                        href={`/teacher/exams/results/${id}/student/${result.userId}/edit`}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                      >
                        Засах
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
