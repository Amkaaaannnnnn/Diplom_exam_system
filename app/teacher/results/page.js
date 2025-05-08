import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, Search, Filter, Download } from "lucide-react"

export default async function TeacherResults() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/")
  }

  // Багшийн үүсгэсэн шалгалтуудын дүнг авах
  const results = await prisma.result.findMany({
    where: {
      exam: {
        userId: user.id,
      },
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          subject: true,
          className: true,
          examDate: true,
        },
      },
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

  // Шалгалтуудыг бүлэглэх
  const examResults = {}
  results.forEach((result) => {
    if (!examResults[result.examId]) {
      examResults[result.examId] = {
        exam: result.exam,
        results: [],
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      }
    }
    examResults[result.examId].results.push(result)
  })

  // Статистик тооцоолох
  Object.keys(examResults).forEach((examId) => {
    const examData = examResults[examId]
    const scores = examData.results.map((r) => r.score)

    examData.averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    examData.highestScore = scores.length > 0 ? Math.max(...scores) : 0

    examData.lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    examData.passRate =
      scores.length > 0 ? Math.round((scores.filter((score) => score >= 60).length / scores.length) * 100) : 0
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Шалгалтын дүнгүүд</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Хайх..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Filter size={16} />
            <span>Шүүх</span>
          </button>
        </div>
      </div>

      {Object.keys(examResults).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(examResults).map((examData) => (
            <div
              key={examData.exam.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium mb-1">
                  <Link href={`/teacher/exams/results/${examData.exam.id}`} className="hover:text-blue-600">
                    {examData.exam.title}
                  </Link>
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="mr-2">{examData.exam.subject}</span>
                  <span>•</span>
                  <span className="mx-2">{examData.exam.className}</span>
                  <span>•</span>
                  <span className="ml-2 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(examData.exam.examDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Сурагчдын тоо</div>
                    <div className="text-xl font-semibold">{examData.results.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Дундаж оноо</div>
                    <div className="text-xl font-semibold">{examData.averageScore}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Тэнцсэн хувь</div>
                    <div className="text-xl font-semibold">{examData.passRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Хамгийн өндөр</div>
                    <div className="text-xl font-semibold">{examData.highestScore}%</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link
                    href={`/teacher/exams/results/${examData.exam.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Дэлгэрэнгүй харах
                  </Link>
                  <button className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium">
                    <Download size={14} className="mr-1" />
                    Тайлан татах
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">Шалгалтын дүн олдсонгүй</p>
          <Link
            href="/teacher/exams/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Шалгалт үүсгэх
          </Link>
        </div>
      )}
    </div>
  )
}
