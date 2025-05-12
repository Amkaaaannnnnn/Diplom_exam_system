"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Plus, ChevronLeft } from "lucide-react"

export default function QuestionBankPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    className: "",
    category: "",
    difficulty: "",
    type: "",
  })
  const [classNames, setClassNames] = useState([])
  const [categories, setCategories] = useState([])
  const [difficulties, setDifficulties] = useState([])

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)
      try {
        const query = new URLSearchParams(filters).toString()
        const res = await fetch(`/api/questions?${query}`)
        const data = await res.json()
        setQuestions(data)

        const cls = [...new Set(data.map((q) => q.className).filter(Boolean))].sort()
        const cat = [...new Set(data.map((q) => q.category).filter(Boolean))].sort()
        const diff = [...new Set(data.map((q) => q.difficulty).filter(Boolean))].sort()
        setClassNames(cls)
        setCategories(cat)
        setDifficulties(diff)
      } catch (err) {
        console.error("Асуулт татахад алдаа гарлаа:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/teacher/exams" className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
          <ChevronLeft size={16} className="mr-1" />
          Шалгалтын сан руу буцах
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Асуултын сан</h1>
        <Link
          href="/teacher/question-bank/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Асуулт нэмэх
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-60">
          <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">Анги</label>
          <select
            id="classFilter"
            value={filters.className}
            onChange={(e) => handleFilterChange("className", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Бүгд</option>
            {classNames.map((className) => (
              <option key={className} value={className}>{className}-р анги</option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Сэдэв</label>
          <select
            id="categoryFilter"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Бүгд</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="difficultyFilter" className="block text-sm font-medium text-gray-700 mb-1">Түвшин</label>
          <select
            id="difficultyFilter"
            value={filters.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Бүгд</option>
            {difficulties.length > 0 ? difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            )) : (
              <>
                <option value="Хөнгөн">Хөнгөн</option>
                <option value="Дунд">Дунд</option>
                <option value="Хүнд">Хүнд</option>
                <option value="Маш хүнд">Маш хүнд</option>
              </>
            )}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
          <select
            id="typeFilter"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Бүгд</option>
            <option value="">Нэг сонголттой</option>
            <option value="">Олон сонголттой</option>
            <option value="">Нөхөх</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Анги</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Асуулт</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сэдэв</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төрөл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Түвшин</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оноо</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">Ачаалж байна...</td>
                </tr>
              ) : questions.length > 0 ? (
                questions.map((q, i) => (
                  <tr key={q.id}>
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4">{q.className || "-"}</td>
                    <td className="px-6 py-4">{q.text}</td>
                    <td className="px-6 py-4">{q.category || "-"}</td>
                    <td className="px-6 py-4">{q.type}</td>
                    <td className="px-6 py-4">{q.difficulty || "-"}</td>
                    <td className="px-6 py-4">{q.points}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link href={`/teacher/question-bank/edit/${q.id}`} className="text-blue-600 hover:text-blue-900">
                          <Pencil size={18} />
                        </Link>
                        <Link href={`/teacher/question-bank/delete/${q.id}`} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">Асуулт олдсонгүй</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
