"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart2, Settings, LogOut } from "lucide-react"

interface SidebarProps {
  user: {
    name: string
    username: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    })
    window.location.href = "/login"
  }

  return (
    <div className="w-[210px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Link href="/student" className="flex items-center gap-2 text-blue-600 font-medium">
          <Home size={20} />
          <span>Хянах самбар</span>
        </Link>
      </div>

      <div className="mt-6">
        <div className="px-4 mb-2">
          <Link
            href="/student/exams"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/student/exams") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={20} />
            <span>Шалгалт</span>
          </Link>
          <div className="ml-6 mt-1">
            <Link
              href="/student/exams/upcoming"
              className={`flex items-center p-2 text-sm ${
                pathname === "/student/exams/upcoming" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Өгсөн шалгалтууд
            </Link>
            <Link
              href="/student/exams/missed"
              className={`flex items-center p-2 text-sm ${
                pathname === "/student/exams/missed" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Хоцорсон шалгалтууд
            </Link>
          </div>
        </div>

        <div className="px-4 mb-2">
          <Link
            href="/student/grades"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/student/grades") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
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
