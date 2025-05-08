import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Calendar, AlertCircle } from "lucide-react"

export default async function MissedExams() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Хоцорсон шалгалтууд</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Химия</h3>
              <p className="text-gray-600 text-sm">10а анги | Нэгж хичээлийн шалгалт | Органик химия</p>
            </div>
          </div>

          <div className="flex items-center mb-2 text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>2025-08-05</span>
          </div>

          <div className="flex items-center mb-4 text-sm text-gray-600">
            <AlertCircle size={16} className="mr-2 text-red-500" />
            <span className="text-red-600">Хоцорсон</span>
          </div>

          <div className="flex items-center mb-4 text-sm text-gray-600">
            <span className="font-medium">Шалтгаан: Ирээгүй</span>
          </div>

          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md">
            Дахин өгөх боломжгүй
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Биологи</h3>
              <p className="text-gray-600 text-sm">10а анги | Ярьцын шалгалт | Ургамал судлал</p>
            </div>
          </div>

          <div className="flex items-center mb-2 text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>2025-08-10</span>
          </div>

          <div className="flex items-center mb-4 text-sm text-gray-600">
            <AlertCircle size={16} className="mr-2 text-red-500" />
            <span className="text-red-600">Хоцорсон</span>
          </div>

          <div className="flex items-center mb-4 text-sm text-gray-600">
            <span className="font-medium">Шалтгаан: Өвчтэй</span>
          </div>

          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md">
            Дахин өгөх боломжгүй
          </button>
        </div>
      </div>
    </div>
  )
}
