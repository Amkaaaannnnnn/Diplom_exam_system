"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Calendar, FileText, Eye } from "lucide-react"

export default function StudentResultsPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true)
        const response = await fetch("/api/results")
        if (!response.ok) {
          throw new Error("Шалгалтын дүнгүүдийг ачаалахад алдаа гарлаа")
        }
        const data = await response.json()
        setResults(data)

        // Extract unique subjects for filtering
        const uniqueSubjects = [...new Set(data.map((result) => result.exam?.subject).filter(Boolean))]
        setSubjects(uniqueSubjects)
      } catch (error) {
        console.error("Error fetching results:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  // Filter results based on search term and subject filter
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      searchTerm === "" ||
      result.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.exam?.subject?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = filterSubject === "" || result.exam?.subject === filterSubject

    return matchesSearch && matchesSubject
  })

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Тодорхойгүй"
    const date = new Date(dateString)
    return date.toLocaleDateString("mn-MN")
  }

  // Get grade letter
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Get grade color
  const getGradeColor = (score) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Алдаа!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Шалгалтын дүнгүүд</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Хайх..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">Бүх хичээл</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results list */}
      {filteredResults.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">Шалгалтын дүн олдсонгүй.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium">{result.exam?.title || "Тодорхойгүй"}</h2>
                    <p className="text-gray-500">{result.exam?.subject || "Тодорхойгүй"}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.score)}`}>
                      {getGrade(result.score)}
                    </span>
                    <span className="ml-2 text-lg font-bold">{result.score}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Огноо: {formatDate(result.submittedAt || result.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      Оноо: {result.earnedPoints || Math.round((result.score * result.exam?.totalPoints) / 100)}/
                      {result.exam?.totalPoints || "?"}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href={`/student/results/${result.id}`}
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Дэлгэрэнгүй
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
