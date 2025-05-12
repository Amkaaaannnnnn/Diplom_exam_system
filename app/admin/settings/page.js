"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
export default function AdminSettings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    register: "",
    currentPassword: "",
    newPassword: ""
  })

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me")
      const data = await res.json()
      setUser(data)
      setFormData({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        register: data.register || "",
        currentPassword: "",
        newPassword: ""
      })
    }
    fetchUser()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const userRes = await fetch("/api/users/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        register: formData.register
      })
    })

    const passwordRes = await fetch("/api/users/update-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
    })

    if (userRes.ok && passwordRes.ok) {
      alert("Амжилттай хадгалагдлаа")
    } else {
      alert("Алдаа гарлаа")
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Үндсэн мэдээлэл</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэвтрэх нэр</label>
                <Input name="username" value={formData.username} onChange={handleChange} placeholder="Нэвтрэх нэр" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Нэр" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Регистр</label>
                <Input name="register" value={formData.register} onChange={handleChange} placeholder="Регистр" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
                <Input name="email" value={formData.email} onChange={handleChange} placeholder="И-мэйл" />
              </div>
            <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Шинэ нууц үг</label>
                <Input
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Шинэ нууц үг"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-gray-500">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Button type="submit" className="px-6 py-2 text-lg bg-blue-600 hover:bg-blue-500">
                Хадгалах
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
