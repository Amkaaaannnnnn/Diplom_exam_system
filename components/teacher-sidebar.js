"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Home,
  Users,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckSquare,
  Database,
  HelpCircle,
} from "lucide-react"

export default function TeacherSidebar() {
  const pathname = usePathname()
  const [examDropdownOpen, setExamDropdownOpen] = useState(true)

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
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Шалгалтын систем</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/teacher"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher") && !isActive("/teacher/exams") && !isActive("/teacher/students") && !isActive("/teacher/reports") && !isActive("/teacher/settings") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Home size={20} />
              <span>Шалгалтын сан</span>
            </Link>
          </li>

          <li>
            <Link
              href="/teacher/students"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/students") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Users size={20} />
              <span>Сурагчид</span>
            </Link>
          </li>

          <li>
            <button
              onClick={() => setExamDropdownOpen(!examDropdownOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${isActive("/teacher/exams") || isActive("/teacher/question-bank") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} />
                <span>Шалгалт</span>
              </div>
              {examDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {examDropdownOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/teacher/exams"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${pathname === "/teacher/exams" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Database size={16} />
                    <span>Шалгалтын сан</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/teacher/exams/upcoming"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/exams/upcoming") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Calendar size={16} />
                    <span>Авах шалгалтууд</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/teacher/exams/completed"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/exams/completed") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <CheckSquare size={16} />
                    <span>Авсан шалгалтууд</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/teacher/question-bank"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/question-bank") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <HelpCircle size={16} />
                    <span>Асуултын сан</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/teacher/reports"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/reports") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <BarChart2 size={20} />
              <span>Тайлан</span>
            </Link>
          </li>

          <li>
            <Link
              href="/teacher/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/teacher/settings") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
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
            <p className="font-medium">Багш - Б. Батчимэг</p>
            <p className="text-sm text-gray-500">TCH00001</p>
          </div>
        </div>
        <button onClick={handleLogout} 
        className="flex items-center gap-2 mt-4 text-red-600 hover:text-red-800">
          <LogOut size={18} />
          <span>Гарах</span>
        </button>
      </div>
    </div>
  )
}
