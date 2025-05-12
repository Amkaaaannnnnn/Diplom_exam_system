"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart2, Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react"

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const [examsOpen, setExamsOpen] = useState(true)

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  // Гарах функц
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        window.location.href = "/login"
      } else {
        console.error("Системээс гарахад алдаа гарлаа")
      }
    } catch (error) {
      console.error("Системээс гарахад алдаа гарлаа:", error)
    }
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Шалгалтын систем</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/student"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/student") &&
                !isActive("/student/exams") &&
                !isActive("/student/results") &&
                !isActive("/student/settings")
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home size={20} />
              <span>Хянах самбар</span>
            </Link>
          </li>

          <li>
            <button
              onClick={() => setExamsOpen(!examsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
                isActive("/student/exams") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span>Шалгалтууд</span>
              </div>
              {examsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {examsOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/student/exams"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      pathname === "/student/exams" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Бүх шалгалт</span>
                  </Link>
                </li>

              </ul>
            )}
          </li>

          <li>
            <Link
              href="/student/results"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/student/results") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart2 size={20} />
              <span>Шалгалтын дүнгүүд</span>
            </Link>
          </li>

          <li>
            <Link
              href="/student/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/student/settings") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} />
              <span>Тохиргоо</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user?.name || "Сурагч"}</p>
            <p className="text-sm text-gray-500">{user?.username || ""}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 mt-4 text-red-600 hover:text-red-800">
          <LogOut size={18} />
          <span>Гарах</span>
        </button>
      </div>
    </div>
  )
}
