import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function StudentDetail({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  const { id } = params

  // Сурагчийн мэдээллийг татах
  const student = await prisma.user.findUnique({
    where: { id },
  })

  if (!student || student.role !== "student") {
    notFound()
  }

  // Сурагчийн дүнгийн мэдээллийг татах
  const results = await prisma.result.findMany({
    where: {
      userId: student.id,
      exam: {
        userId: user.id, // Зөвхөн энэ багшийн шалгалтын дүнг харуулах
      },
    },
    include: {
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Дундаж оноо тооцоолох
  const averageScore = results.length > 0 ? results.reduce((acc, result) => acc + result.score, 0) / results.length : 0

  // Хамгийн өндөр оноо
  const highestScore = results.length > 0 ? Math.max(...results.map((result) => result.score)) : 0

  // Хамгийн бага оноо
  const lowestScore = results.length > 0 ? Math.min(...results.map((result) => result.score)) : 0

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
      <div className="mb-6">
        <Link href="/teacher/students" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft size={16} className="mr-1" />
          Сурагчдын жагсаалт руу буцах
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{student.name}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Сурагчийн мэдээлэл</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Нэр:</span>
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Нэвтрэх нэр:</span>
                <span className="font-medium">{student.username}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">И-мэйл:</span>
                <span className="font-medium">{student.email}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Анги:</span>
                <span className="font-medium">{student.className}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Статус:</span>
                <span className="font-medium">
                  {student.status === "ACTIVE" ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Идэвхтэй</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Идэвхгүй</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Дүнгийн статистик</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-500">Нийт шалгалт:</span>
                <span className="font-medium">{results.length}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Дундаж оноо:</span>
                <span className="font-medium">{Math.round(averageScore)}%</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Хамгийн өндөр:</span>
                <span className="font-medium">{Math.round(highestScore)}%</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">Хамгийн бага:</span>
                <span className="font-medium">{Math.round(lowestScore)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-4">Дүнгийн тайлан</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Шалгалтын нэр
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хичээл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оноо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Үнэлгээ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length > 0 ? (
              results.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/teacher/exams/${result.exam.id}`} className="hover:text-blue-600">
                      {result.exam.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.exam.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        getGrade(result.score) === "A"
                          ? "bg-green-100 text-green-800"
                          : getGrade(result.score) === "B"
                            ? "bg-blue-100 text-blue-800"
                            : getGrade(result.score) === "C"
                              ? "bg-yellow-100 text-yellow-800"
                              : getGrade(result.score) === "D"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getGrade(result.score)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Дүн олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
