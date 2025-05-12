"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { PlusCircle, Edit, Trash2, Filter } from "lucide-react"

// Question types
const questionTypes = [
  { id: "select", name: "Нэг сонголттой" },
  { id: "multiselect", name: "Олон сонголттой" },
  { id: "fill", name: "Нөхөх" },
]

// Format question type for display
const getQuestionTypeName = (type) => {
  const found = questionTypes.find((t) => t.id === type)
  return found ? found.name : type
}

export default function QuestionBankClient({ questions, uniqueClasses, uniqueCategories, initialFilters }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState(initialFilters || {})

  const updateFilter = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)

    // Update URL
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    router.push(`/teacher/question-bank?${params.toString()}`)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Асуултын сан</h1>
        <Link
          href="/teacher/question-bank/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          <span>Асуулт нэмэх</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h2 className="text-lg font-medium">Шүүлтүүр</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Анги
            </label>
            <select
              id="class-filter"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.className || ""}
              onChange={(e) => updateFilter("className", e.target.value)}
            >
              <option value="">Бүгд</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Хичээл
            </label>
            <select
              id="subject-filter"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.subject || ""}
              onChange={(e) => updateFilter("subject", e.target.value)}
            >
              <option value="">Бүгд</option>
              <option value="Математик">Математик</option>
              <option value="Физик">Физик</option>
              <option value="Хими">Хими</option>
              <option value="Биологи">Биологи</option>
              <option value="Англи хэл">Англи хэл</option>
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Төрөл
            </label>
            <select
              id="category-filter"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.category || ""}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">Бүгд</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Асуултын төрөл
            </label>
            <select
              id="type-filter"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.type || ""}
              onChange={(e) => updateFilter("type", e.target.value)}
            >
              <option value="">Бүгд</option>
              {questionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Асуулт
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Сэдэв
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Төрөл
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Анги
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Оноо
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Асуулт олдсонгүй
                  </td>
                </tr>
              ) : (
                questions.map((question, index) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{question.text}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.category || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.className || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.points}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/teacher/question-bank/edit/${question.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={18} />
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
