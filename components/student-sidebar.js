"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart2, Settings, LogOut, ChevronDown, ChevronRight, CheckSquare } from "lucide-react"

export default function StudentSidebar({ user }) {
  const pathname = usePathname()
  const [examsOpen, setExamsOpen] = useState(true)

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  // Гарах функцийг засах
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST", // POST хүсэлт ашиглах
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
    <div className="w-[210px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Link href="/student" className="flex items-center gap-2 text-blue-600 font-medium">
          <Home size={20} />
          <span>Хянах самбар</span>
        </Link>
      </div>

      <div className="mt-6 flex flex-col space-y-1">
        <div className="px-4 mb-2">
          <Link
            href="/student/exams"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/student/exams") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={20} />
            <span>Шалгалтын сан</span>
          </Link>
        </div>

        <div className="px-4 mb-2">
          <button
            onClick={() => setExamsOpen(!examsOpen)}
            className={`flex items-center justify-between w-full gap-2 p-2 rounded-md ${
              isActive("/student/exams/upcoming") || isActive("/student/exams/completed")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={20} />
              <span>Шалгалт</span>
            </div>
            {examsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {examsOpen && (
            <div className="ml-6 mt-1">
              <Link
                href="/student/exams/upcoming"
                className={`flex items-center p-2 text-sm ${
                  isActive("/student/exams/upcoming") ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Авах шалгалтууд
              </Link>
              <Link
                href="/student/exams/completed"
                className={`flex items-center p-2 text-sm ${
                  isActive("/student/exams/completed") ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Авсан шалгалтууд
              </Link>
            </div>
          )}
        </div>

        <div className="px-4 mb-2">
          <Link
            href="/student/results"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/student/results") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart2 size={20} />
            <span>Дүн</span>
          </Link>
        </div>

        <div className="px-4 mb-2">
          <Link
            href="/student/settings"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/student/settings") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings size={20} />
            <span>Тохиргоо</span>
          </Link>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-200 p-4">
        <div className="mb-4">
          <div className="text-sm font-medium">Нэвтэрсэн:</div>
          <div className="text-sm font-medium">{user?.name || "Сурагч"}</div>
          <div className="text-xs text-gray-500">{user?.username || ""}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Гарах</span>
        </button>
      </div>
    </div>
  )
}
