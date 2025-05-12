"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalExams: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Хэрэглэгчийн мэдээлэл авах
        const userRes = await fetch("/api/me")
        if (!userRes.ok) {
          throw new Error(`Failed to fetch user: ${userRes.status}`)
        }
        const userData = await userRes.json()

        // Шалгалтын мэдээлэл авах
        let examsData = []
        try {
          const examsRes = await fetch("/api/exams")
          if (examsRes.ok) {
            examsData = await examsRes.json()
          } else {
            console.error(`Failed to fetch exams: ${examsRes.status}`)
          }
        } catch (examsError) {
          console.error("Error fetching exams:", examsError)
        }

        // Дүнгийн мэдээлэл авах
        let resultsData = []
        try {
          const resultsRes = await fetch("/api/results")
          if (resultsRes.ok) {
            resultsData = await resultsRes.json()
          } else {
            console.error(`Failed to fetch results: ${resultsRes.status}`)
          }
        } catch (resultsError) {
          console.error("Error fetching results:", resultsError)
        }

        setUser(userData.user || userData)
        // Ensure exams is always an array
        setExams(Array.isArray(examsData) ? examsData : [])
        // Ensure results is always an array
        setResults(Array.isArray(resultsData) ? resultsData : [])

        // Статистик тооцоолох
        if (resultsData.length > 0) {
          const scores = resultsData.map((r) => r.score || 0)
          setStats({
            totalExams: resultsData.length,
            avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
          })
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Үсгэн дүн тооцоолох функц
  const getGrade = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Дүнгийн өнгө тодорхойлох
  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-blue-500"
    if (score >= 70) return "bg-yellow-500"
    if (score >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  if (loading) {
    return <div className="p-8">Ачааллаж байна...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Алдаа гарлаа: {error}</div>
      </div>
    )
  }

  // Get unique subjects from exams
  const subjects = []
  if (exams && Array.isArray(exams)) {
    // Use a Set to get unique subjects
    const subjectSet = new Set()
    exams.forEach((exam) => {
      if (exam && exam.subject) {
        subjectSet.add(exam.subject)
      }
    })
    // Convert Set to Array
    subjects.push(...subjectSet)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Дүнгийн тайлан</h1>

      {/* Статистик хэсэг */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex flex-col items-center">
          <div className="text-gray-500 mb-1">Нийт шалгалт</div>
          <div className="text-3xl font-bold">{stats.totalExams}</div>
        </Card>

        <Card className="p-4 flex flex-col items-center">
          <div className="text-gray-500 mb-1">Дундаж оноо</div>
          <div className="text-3xl font-bold">{Math.round(stats.avgScore)}%</div>
        </Card>

        <Card className="p-4 flex flex-col items-center">
          <div className="text-gray-500 mb-1">Хамгийн өндөр</div>
          <div className="text-3xl font-bold">{Math.round(stats.highestScore)}%</div>
        </Card>

        <Card className="p-4 flex flex-col items-center">
          <div className="text-gray-500 mb-1">Хамгийн бага</div>
          <div className="text-3xl font-bold">{Math.round(stats.lowestScore)}%</div>
        </Card>
      </div>

      {/* Error message for results */}
      {results.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Дүнгийн мэдээлэл олдсонгүй. Та шалгалт өгөөгүй байж болно.</span>
          </div>
        </div>
      )}

      {/* Хайлтын хэсэг */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select className="border rounded p-2">
          <option value="">Бүгд</option>
          {/* Хичээлүүдийг давталтаар харуулах */}
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Дүнгийн жагсаалт */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Хичээл</th>
              <th className="p-3 text-left">Шалгалтын нэр</th>
              <th className="p-3 text-left">Төрөл</th>
              <th className="p-3 text-left">Огноо</th>
              <th className="p-3 text-left">Оноо</th>
              <th className="p-3 text-left">Хувь</th>
              <th className="p-3 text-left">Үнэлгээ</th>
              <th className="p-3 text-left">Дэлгэрэнгүй</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-3 text-center text-gray-500">
                  Дүн олдсонгүй
                </td>
              </tr>
            ) : (
              results.map((result) => {
                const exam = exams.find((e) => e.id === result.examId) || result.exam || {}
                const scorePercent = Math.round(result.score || 0)
                const grade = getGrade(scorePercent)

                return (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{exam.subject || "Тодорхойгүй"}</td>
                    <td className="p-3">{exam.title || "Тодорхойгүй"}</td>
                    <td className="p-3">{exam.subjectType || "Тодорхойгүй"}</td>
                    <td className="p-3">
                      {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Тодорхойгүй"}
                    </td>
                    <td className="p-3">
                      {result.earnedPoints || 0}/{exam.totalPoints || 0}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={scorePercent}
                          className="w-24 h-2"
                          indicatorClassName={getScoreColor(scorePercent)}
                        />
                        <span>{scorePercent}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={scorePercent >= 60 ? "default" : "destructive"}>{grade}</Badge>
                    </td>
                    <td className="p-3">
                      <Link href={`/student/results/${result.id}`} className="text-blue-500 hover:underline">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Харах</button>
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
