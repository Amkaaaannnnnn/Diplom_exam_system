"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, FileText, BarChart2, Settings, LogOut, ChevronDown, ChevronRight } from "lucide-react"

export default function AdminSidebar({ user }) {
  const pathname = usePathname()
  const [examsOpen, setExamsOpen] = useState(false)

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
        <Link href="/admin" className="flex items-center gap-2 text-blue-600 font-medium">
          <Home size={20} />
          <span>Хянах самбар</span>
        </Link>
      </div>

      <div className="mt-6 flex flex-col space-y-1">
        <div className="px-4 mb-2">
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/users") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users size={20} />
            <span>Хэрэглэгчид</span>
          </Link>
        </div>

        <div className="px-4 mb-2">
          <button
            onClick={() => setExamsOpen(!examsOpen)}
            className={`flex items-center justify-between w-full gap-2 p-2 rounded-md ${
              isActive("/admin/exams") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <span>Шалгалт</span>
            </div>
            {examsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {examsOpen && (
            <div className="ml-6 mt-1">
              <Link
                href="/admin/exams/all"
                className={`flex items-center p-2 text-sm ${
                  pathname === "/admin/exams/all" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Бүх шалгалтууд
              </Link>
            </div>
          )}
        </div>

        <div className="px-4 mb-2">
          <Link
            href="/admin/reports"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/reports") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart2 size={20} />
            <span>Тайлан</span>
          </Link>
        </div>

        <div className="px-4 mb-2">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/settings") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
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
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.username}</div>
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
