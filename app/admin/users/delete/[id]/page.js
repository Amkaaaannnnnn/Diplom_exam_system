"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DeleteUser({ params }) {
  const router = useRouter()
  const { id } = params
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`)
        if (!response.ok) {
          throw new Error("Хэрэглэгчийн мэдээллийг татахад алдаа гарлаа")
        }
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Хэрэглэгчийг устгахад алдаа гарлаа")
      }

      router.push("/admin/users")
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
        <Link href="/admin/users" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Хэрэглэгч олдсонгүй
        </div>
        <Link href="/admin/users" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Хэрэглэгч устгах</h1>
        <Link href="/admin/users" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Анхааруулга</h2>
          <p className="text-red-700">
            Та "{user.name}" нэртэй хэрэглэгчийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Хэрэглэгчийн мэдээлэл:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Нэр:</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Нэвтрэх нэр:</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">И-мэйл:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Эрх:</p>
              <p className="font-medium">
                {user.role === "admin" ? "Админ" : user.role === "teacher" ? "Багш" : "Сурагч"}
              </p>
            </div>
            {user.role === "student" && user.className && (
              <div>
                <p className="text-sm text-gray-500">Анги:</p>
                <p className="font-medium">{user.className}</p>
              </div>
            )}
            {user.role === "teacher" && user.subject && (
              <div>
                <p className="text-sm text-gray-500">Хичээл:</p>
                <p className="font-medium">{user.subject}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link href="/admin/users" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
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
