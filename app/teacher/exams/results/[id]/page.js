"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Search, Filter } from "lucide-react"

export default function ExamResults() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrade, setFilterGrade] = useState("all")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Шалгалтын мэдээллийг авах
        const examResponse = await fetch(`/api/exams/${id}`)

        if (!examResponse.ok) {
          if (examResponse.status === 401) {
            router.push("/login")
            return
          }

          const examError = await examResponse.json()
          throw new Error(examError.error || `Шалгалтын мэдээлэл татахад алдаа гарлаа: ${examResponse.status}`)
        }

        const examData = await examResponse.json()

        // Шалгалтын дүнг авах
        const resultsResponse = await fetch(`/api/exams/${id}/results`)

        if (!resultsResponse.ok) {
          // If unauthorized, redirect to login
          if (resultsResponse.status === 401) {
            router.push("/login")
            return
          }

          const resultsError = await resultsResponse.json()
          throw new Error(resultsError.error || `Шалгалтын дүн татахад алдаа гарлаа: ${resultsResponse.status}`)
        }

        const resultsData = await resultsResponse.json()

        setExam(examData)
        setResults(resultsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  // Үнэлгээ тодорхойлох
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Хайлт, шүүлтийн үр дүнг авах
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.user.className && result.user.className.toLowerCase().includes(searchTerm.toLowerCase()))

    const grade = getGrade(result.score)
    const matchesGrade = filterGrade === "all" || grade === filterGrade

    return matchesSearch && matchesGrade
  })

  // Дундаж оноог тооцоолох
  const calculateAverageScore = () => {
    if (!results.length) return 0
    const sum = results.reduce((acc, result) => acc + result.score, 0)
    return Math.round(sum / results.length)
  }

  // Тэнцсэн хувийг тооцоолох
  const calculatePassRate = () => {
    if (!results.length) return 0
    const passCount = results.filter((result) => result.score >= 60).length
    return Math.round((passCount / results.length) * 100)
  }

  // CSV файл татах
  const downloadCSV = () => {
    if (!results.length) return

    const headers = [
      "№",
      "Нэр",
      "Хэрэглэгчийн нэр",
      "Анги",
      "Оноо",
      "Хувь",
      "Үнэлгээ",
      "Эхэлсэн",
      "Дууссан",
      "Зарцуулсан",
    ]

    const rows = filteredResults.map((result, index) => {
      const startTime = result.startedAt ? new Date(result.startedAt) : null
      const endTime = result.submittedAt ? new Date(result.submittedAt) : null

      let duration = "Тодорхойгүй"
      if (startTime && endTime) {
        const durationMs = endTime - startTime
        const minutes = Math.floor(durationMs / 60000)
        const seconds = Math.floor((durationMs % 60000) / 1000)
        duration = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }

      return [
        index + 1,
        result.user.name,
        result.user.username,
        result.user.className || "",
        Math.round((result.score * (exam.totalPoints || 100)) / 100),
        result.score + "%",
        getGrade(result.score),
        startTime ? startTime.toLocaleString() : "Тодорхойгүй",
        endTime ? endTime.toLocaleString() : "Тодорхойгүй",
        duration,
      ]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${exam?.title || "exam"}_results.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
        <div className="mt-4">
          <Link href="/teacher/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Анхааруулга!</strong>
          <span className="block sm:inline"> Шалгалтын мэдээлэл олдсонгүй.</span>
        </div>
        <div className="mt-4">
          <Link href="/teacher/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/teacher/exams" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-gray-500 ml-2">
          {exam.subject} | {exam.className} | {new Date(exam.examDate).toLocaleDateString()}
        </div>
        <div className="ml-auto">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
            disabled={!results.length}
          >
            <Download size={18} />
            <span>Тайлан татах</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-1">Нийт сурагч</h2>
          <div className="text-3xl font-bold">{results.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-1">Дундаж оноо</h2>
          <div className="text-3xl font-bold">{calculateAverageScore()}%</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-1">Тэнцсэн хувь</h2>
          <div className="text-3xl font-bold">{calculatePassRate()}%</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-500 mb-1">Хугацаа</h2>
          <div className="text-3xl font-bold">{exam.duration} мин</div>
        </div>
      </div>

      {/* Score distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Оноо хуваарилалт</h2>
        <div className="space-y-2">
          {[
            { range: "90-100", color: "bg-green-500" },
            { range: "80-89", color: "bg-blue-500" },
            { range: "70-79", color: "bg-yellow-500" },
            { range: "60-69", color: "bg-orange-500" },
            { range: "0-59", color: "bg-red-500" },
          ].map((item) => {
            let count = 0
            const [min, max] = item.range.split("-").map(Number)

            count = results.filter((result) => result.score >= min && result.score <= max).length

            const percentage = results.length ? Math.round((count / results.length) * 100) : 0

            return (
              <div key={item.range} className="flex items-center">
                <div className="w-20 text-sm">{item.range}</div>
                <div className="flex-1 mx-2">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <div className="w-8 text-right">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Хайх..."
            className="pl-10 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">Бүгд</option>
            <option value="A">A (90-100%)</option>
            <option value="B">B (80-89%)</option>
            <option value="C">C (70-79%)</option>
            <option value="D">D (60-69%)</option>
            <option value="F">F (0-59%)</option>
          </select>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  Сурагчийн нэр
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
                  Хувь
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Үнэлгээ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Зарцуулсан
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
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => {
                  const startTime = result.startedAt ? new Date(result.startedAt) : null
                  const endTime = result.submittedAt ? new Date(result.submittedAt) : null

                  let duration = "Тодорхойгүй"
                  if (startTime && endTime) {
                    const durationMs = endTime - startTime
                    const minutes = Math.floor(durationMs / 60000)
                    const seconds = Math.floor((durationMs % 60000) / 1000)
                    duration = `${minutes} мин ${seconds} сек`
                  }

                  return (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.user.name}</div>
                        <div className="text-sm text-gray-500">{result.user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.user.className || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((result.score * (exam.totalPoints || 100)) / 100)}/{exam.totalPoints || 100}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/teacher/exams/results/${id}/student/${result.userId}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Харах
                        </Link>
                        <Link
                          href={`/teacher/exams/results/${id}/student/${result.userId}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Засах
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    {results.length === 0 ? "Шалгалтын дүн байхгүй байна" : "Хайлтад тохирох дүн олдсонгүй"}
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
