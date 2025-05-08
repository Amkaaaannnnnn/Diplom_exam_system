"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search } from "lucide-react"
import Link from "next/link"

export default function CompletedExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("Бүгд")
  const [gradeFilter, setGradeFilter] = useState("Бүгд")

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch("/api/exams?status=completed&role=teacher")
        if (response.ok) {
          const data = await response.json()
          setExams(data)
        } else {
          console.error("Failed to fetch exams")
        }
      } catch (error) {
        console.error("Error fetching exams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [])

  // Dummy data for demonstration - updated to match teacher input fields
  const dummyExams = [
    {
      id: 1,
      title: "2-р улирлын шалгалт",
      description: "Алгебрын үндсэн ойлголтууд, тэгшитгэлүүд",
      subject: "Математик",
      className: "10а анги",
      duration: 40,
      totalPoints: 100,
      examDate: "2025-09-10",
      examTime: "10:00",
      questions: Array(30).fill({}), // 30 questions
      completedCount: 30,
      totalStudents: 30,
      averageScore: 82,
    },
    {
      id: 2,
      title: "Хагас жилийн шалгалт",
      description: "Хүчний хуулиуд, энергийн хадгалалт",
      subject: "Физик",
      className: "7 анги",
      duration: 40,
      totalPoints: 100,
      examDate: "2025-08-15",
      examTime: "09:00",
      questions: Array(25).fill({}), // 25 questions
      completedCount: 28,
      totalStudents: 28,
      averageScore: 75,
    },
    {
      id: 3,
      title: "Улирлын шалгалт",
      description: "Химийн урвалууд, хүчил, суурь",
      subject: "Химия",
      className: "9 анги",
      duration: 40,
      totalPoints: 100,
      examDate: "2025-08-20",
      examTime: "11:00",
      questions: Array(20).fill({}), // 20 questions
      completedCount: 25,
      totalStudents: 25,
      averageScore: 79,
    },
  ]

  // Use dummy data if no exams are fetched
  const displayExams = exams.length > 0 ? exams : dummyExams

  // Get unique subjects and grades for filters
  const subjects = ["Бүгд", ...new Set(displayExams.map((exam) => exam.subject))]
  const grades = ["Бүгд", ...new Set(displayExams.map((exam) => exam.className))]

  // Filter exams based on search term and filters
  const filteredExams = displayExams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = subjectFilter === "Бүгд" || exam.subject === subjectFilter
    const matchesGrade = gradeFilter === "Бүгд" || exam.className === gradeFilter

    return matchesSearch && matchesSubject && matchesGrade
  })

  const handleExportResults = () => {
    alert("Шалгалтын дүнг татаж авах функц")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Авсан шалгалтууд</h1>
        <Link
          href="/teacher/exams/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          Шалгалт үүсгэх
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              <button className="border border-gray-300 rounded-md p-2 hover:bg-gray-100">
                <Filter size={20} />
              </button>
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={handleExportResults}
              className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
            >
              <Download size={18} />
              <span>Татаж авах</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Шалгалтын нэр
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Хичээл
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
                    Огноо
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Сурагчид
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Дундаж оноо
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
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Шалгалт олдсонгүй
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exam.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exam.className}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(exam.examDate).toLocaleDateString("mn-MN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {exam.completedCount}/{exam.totalStudents}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exam.averageScore}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/teacher/exams/results/${exam.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Харах
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
