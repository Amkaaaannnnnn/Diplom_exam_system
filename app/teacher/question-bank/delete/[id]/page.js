"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DeleteQuestion({ params }) {
  const router = useRouter()
  const { id } = params
  const [question, setQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${id}`)
        if (!response.ok) {
          throw new Error("Даалгаврын мэдээллийг татахад алдаа гарлаа")
        }
        const data = await response.json()
        setQuestion(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestion()
  }, [id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Даалгаврыг устгахад алдаа гарлаа")
      }

      router.push("/teacher/question-bank")
      router.refresh()
    } catch (err) {
      setError(err.message)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <p>Ачаалж байна...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Link href="/teacher/question-bank" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Асуулт олдсонгүй
        </div>
        <Link href="/teacher/question-bank" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Даалгавар устгах</h1>
        <Link href="/teacher/question-bank" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Анхааруулга</h2>
          <p className="text-red-700">Та дараах асуултыг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Асуултын дэлгэрэнгүй мэдээлэл:</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-500">Асуулт:</p>
              <p className="font-medium">{question.text}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Анги:</p>
                <p className="font-medium">{question.className || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Төрөл:</p>
                <p className="font-medium">
                  {question.type === "select"
                    ? "Нэг сонголттой"
                    : question.type === "multiselect"
                      ? "Олон сонголттой"
                       : question.type === "fill"
                          ? "Нөхөх"
                          : question.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Оноо:</p>
                <p className="font-medium">{question.points}</p>
              </div>
            </div>
            {question.options && (
              <div>
                <p className="text-sm text-gray-500">Сонголтын төрөл:</p>
                <div className="ml-4">
                  {question.options.map((option, index) => (
                    <p key={index} className="font-medium">
                      {option.id}: {option.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link href="/teacher/question-bank" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
            Цуцлах
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            {isDeleting ? "Устгаж байна..." : "Устгах"}
          </button>
        </div>
      </div>
    </div>
  )
}
