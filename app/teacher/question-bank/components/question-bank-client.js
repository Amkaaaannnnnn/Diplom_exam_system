"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, ChevronLeft } from "lucide-react"

export default function QuestionBankClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    questions: [],
    allClasses: [],
    allCategories: [],
    allDifficulties: [],
    allTypes: [],
  })

  const [filters, setFilters] = useState({
    className: "",
    category: "",
    difficulty: "",
    type: "",
  })

  const [filteredQuestions, setFilteredQuestions] = useState([])

  // Даалгаврын сангийн өгөгдлийг татах
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/questions/bank")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Даалгаврын сангийн өгөгдлийг татахад алдаа гарлаа")
        }

        const result = await response.json()
        setData(result)
        setFilteredQuestions(result.questions)
      } catch (err) {
        console.error("Даалгаврын сангийн өгөгдлийг татахад алдаа гарлаа:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Шүүлтүүрийг хэрэглэх
  useEffect(() => {
    if (data.questions.length > 0) {
      const filtered = data.questions.filter((question) => {
        // Анги шүүлтүүр
        if (filters.className && question.className !== filters.className) {
          return false
        }

        // Сэдэв шүүлтүүр
        if (filters.category && question.category !== filters.category) {
          return false
        }

        // Түвшин шүүлтүүр
        if (filters.difficulty && question.difficulty !== filters.difficulty) {
          return false
        }

        // Төрөл шүүлтүүр
        if (filters.type && question.type !== filters.type) {
          return false
        }

        return true
      })

      setFilteredQuestions(filtered)
    }
  }, [filters, data.questions])

  // Шүүлтүүрийн өөрчлөлтийг хадгалах
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Алдаа: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/teacher/exams" className="text-blue-500 hover:text-blue-700">
          Шалгалтын сан руу буцах
        </Link>
      </div>
    )
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
          <select
            id="classFilter"
            name="className"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filters.className}
            onChange={handleFilterChange}
          >
            <option value="">Бүгд</option>
            {data.allClasses.map((className) => (
              <option key={className} value={className}>
                {className}-р анги
              </option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Сэдэв
          </label>
          <select
            id="categoryFilter"
            name="category"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Бүгд</option>
            {data.allCategories.map(
              (category) =>
                category && (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ),
            )}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="difficultyFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Түвшин
          </label>
          <select
            id="difficultyFilter"
            name="difficulty"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">Бүгд</option>
            {data.allDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Төрөл
          </label>
          <select
            id="typeFilter"
            name="type"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">Бүгд</option>
            {data.allTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
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
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question, index) => (
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
