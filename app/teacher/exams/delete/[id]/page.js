"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function DeleteExam({ params }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const examId = params.id

  // Шалгалтын мэдээллийг татах
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`)
        if (!response.ok) {
          throw new Error("Шалгалтын мэдээллийг татахад алдаа гарлаа")
        }
        const data = await response.json()
        setExam(data)
      } catch (err) {
        console.error("Шалгалтын мэдээллийг татахад алдаа гарлаа:", err)
        setError(err.message || "Шалгалтын мэдээллийг татахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId])

  const handleDelete = async () => {
    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Шалгалтыг устгах үед алдаа гарлаа")
      }

      // Амжилттай устгасны дараа шалгалтын жагсаалт руу буцах
      router.push("/teacher/exams")
      router.refresh()
    } catch (err) {
      console.error("Шалгалт устгахад алдаа гарлаа:", err)
      setError(err.message || "Шалгалтыг устгах үед алдаа гарлаа")
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Шалгалт устгах</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Шалгалт устгах</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Link href="/teacher/exams" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Шалгалт устгах</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <div className="flex items-center justify-center text-amber-500 mb-4">
          <AlertTriangle size={48} />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">{exam?.title} шалгалтыг устгахдаа итгэлтэй байна уу?</h2>

        <p className="text-gray-600 text-center mb-6">
          Энэ үйлдлийг буцаах боломжгүй. Шалгалт болон түүнтэй холбоотой бүх мэдээлэл устах болно.
        </p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="flex justify-center space-x-4">
          <Link href="/teacher/exams" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
            Цуцлах
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isDeleting ? "Устгаж байна..." : "Устгах"}
          </button>
        </div>
      </div>
    </div>
  )
}
