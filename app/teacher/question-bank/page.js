import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Plus, ChevronLeft } from "lucide-react"

export default async function QuestionBank() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Багшийн даалгаваруудыг татах
  const questions = await prisma.question.findMany({
    where: {
      userId: user.id,
      isInBank: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Ангиар бүлэглэх (хоосон бүлгийг арилгана)
  const categories = [...new Set(questions.map((q) => q.category).filter(Boolean))].sort()

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/teacher/exams" className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
          <ChevronLeft size={16} className="mr-1" />
          Шалгалтын сан руу буцах
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Даалгаврын сан</h1>
        <div className="flex space-x-3">
          <Link
            href="/teacher/question-bank/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Даалгавар нэмэх
          </Link>
        </div>
      </div>

      {/* Хайлтын хэсэг */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-60">
          <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Анги
          </label>
          <select id="classFilter" className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Бүгд</option>
            <option value="7">7-р анги</option>
            <option value="8">8-р анги</option>
            <option value="9">9-р анги</option>
            <option value="10">10-р анги</option>
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Сэдэв
          </label>
          <select id="categoryFilter" className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Бүгд</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="difficultyFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Түвшин
          </label>
          <select id="difficultyFilter" className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Бүгд</option>
            <option value="Хөнгөн">Хөнгөн</option>
            <option value="Дунд">Дунд</option>
            <option value="Хүнд">Хүнд</option>
            <option value="Маш хүнд">Маш хүнд</option>
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Төрөл
          </label>
          <select id="typeFilter" className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Бүгд</option>
            <option value="select">Нэг сонголттой</option>
            <option value="multiselect">Олон сонголттой</option>
            <option value="text">Текст</option>
            <option value="number">Тоон</option>
          </select>
        </div>
      </div>

      {/* Даалгаврын жагсаалт */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Анги</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Даалгавар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сэдэв
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Төрөл
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Түвшин
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оноо</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.length > 0 ? (
                questions.map((question, index) => (
                  <tr key={question.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.className || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{question.text}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.category || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.type === "select"
                        ? "Нэг сонголттой"
                        : question.type === "multiselect"
                          ? "Олон сонголттой"
                          : question.type === "text"
                            ? "Текст"
                            : question.type === "number"
                              ? "Тоон"
                              : question.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.difficulty || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          href={`/teacher/question-bank/edit/${question.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil size={18} />
                        </Link>
                        <Link
                          href={`/teacher/question-bank/delete/${question.id}`}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Даалгавар олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
