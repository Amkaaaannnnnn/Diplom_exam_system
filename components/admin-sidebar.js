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
 <div className="h-screen w-64  border-r border-gray-200 flex flex-col">
  <div className="p-4 border-b border-gray-200">
    <h1 className="text-xl font-bold text-black">Шалгалтын систем</h1>
  </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/admin") &&
                !isActive("/admin/users") &&
                !isActive("/admin/exams") &&
                !isActive("/admin/reports") &&
                !isActive("/admin/settings")
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home size={20} />
              <span>Хянах самбар</span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/admin/users") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users size={20} />
              <span>Хэрэглэгчид</span>
            </Link>
          </li>

          <li>
            <button
              onClick={() => setExamsOpen(!examsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
                isActive("/admin/exams") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span>Шалгалт</span>
              </div>
              {examsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {examsOpen && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/exams/all"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      pathname === "/admin/exams/all" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Бүх шалгалтууд</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/admin/reports"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/admin/reports") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart2 size={20} />
              <span>Тайлан</span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/admin/settings") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
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
            <p className="font-medium">{user?.name || "Админ"}</p>
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
