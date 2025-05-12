"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Submitting login form:", { username }) 


      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password, rememberMe }),
      })

      console.log("Response status:", response.status) 
      console.log("Response headers:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text.substring(0, 200) + "...") 
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("Response data:", data) 

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else if (data.user.role === "teacher") {
        router.push("/teacher")
      } else if (data.user.role === "student") {
        router.push("/student")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 mb-4 relative">
              <Image
                src="/placeholder.svg?key=iyhhh"
                alt="School Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800">Шалгалтын систем</h1>
            <p className="text-sm text-gray-600 mt-1">Та өөрийн бүртгэлтэй эрхээр нэвтэрнэ үү</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Хэрэглэгчийн нэр
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Хэрэглэгчийн нэр"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Нууц үг
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Нууц үг"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Намайг сана
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  Нууц үг мартсан?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Нэвтрэх..." : "Нэвтрэх"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
