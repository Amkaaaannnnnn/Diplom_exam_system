"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserForm({ user = null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [subjects, setSubjects] = useState([])

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    register: user?.register || "",
    role: user?.role || "student",
    className: user?.className || "",
    subject: user?.subject || "",
    password: "",
    status: user?.status || "ACTIVE",
  })

  // Хичээлүүдийг татах
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects")
        if (response.ok) {
          const data = await response.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error("Хичээлүүдийг татахад алдаа гарлаа:", error)
      }
    }

    fetchSubjects()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const endpoint = user ? `/api/users/${user.id}` : "/api/users"
      const method = user ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Хэрэглэгч үүсгэхэд алдаа гарлаа")
      }

      router.push("/admin/users")
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Нэвтрэх нэр автоматаар үүсгэх
  const generateUsername = () => {
    if (formData.role && formData.name) {
      const prefix = formData.role === "admin" ? "ADM" : formData.role === "teacher" ? "TCH" : "STU"
      // Сүүлийн хэрэглэгчийн дугаарыг авах
      fetch("/api/users/last-id?role=" + formData.role)
        .then((res) => res.json())
        .then((data) => {
          const lastId = data.lastId || 0
          const newId = String(lastId + 1).padStart(4, "0")
          setFormData((prev) => ({ ...prev, username: `${prefix}${newId}` }))
        })
        .catch((err) => {
          console.error("Сүүлийн ID-г авахад алдаа гарлаа:", err)
          // Алдаа гарвал санамсаргүй дугаар үүсгэх
          const randomId = Math.floor(1000 + Math.random() * 9000)
          setFormData((prev) => ({ ...prev, username: `${prefix}${randomId}` }))
        })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Овог, нэр
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Нэвтрэх нэр
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <button
              type="button"
              onClick={generateUsername}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md"
            >
              Үүсгэх
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            И-мэйл
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="register" className="block text-sm font-medium text-gray-700 mb-1">
            Регистрийн дугаар
          </label>
          <input
            type="text"
            id="register"
            name="register"
            value={formData.register}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Эрх
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="student">Сурагч</option>
            <option value="teacher">Багш</option>
            <option value="admin">Админ</option>
          </select>
        </div>

        {formData.role === "student" && (
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
              Анги
            </label>
            <input
              type="text"
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Жишээ: 10а"
            />
          </div>
        )}

        {formData.role === "teacher" && (
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Хичээл
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Хичээл сонгох</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Нууц үг
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={!user}
            placeholder={user ? "Хэвээр үлдээх бол хоосон орхино уу" : ""}
          />
          <p className="text-xs text-gray-500 mt-1">Нууц үг нь хамгийн багадаа 8 тэмдэгт байх ёстой</p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="ACTIVE">Идэвхтэй</option>
            <option value="INACTIVE">Идэвхгүй</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {isLoading ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>
    </form>
  )
}
