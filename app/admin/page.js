import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, FileText, BookOpen } from "lucide-react"

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get counts for dashboard
  const studentCount = await prisma.user.count({
    where: { role: "student" },
  })

  const teacherCount = await prisma.user.count({
    where: { role: "teacher" },
  })

  const examCount = await prisma.exam.count()

  const subjectCount = await prisma.subject.count()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Системийн ерөнхий статистик</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-700 mb-1">Нийт Сурагч</div>
            <div className="text-3xl font-bold text-blue-900">{studentCount}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-green-700 mb-1">Нийт Багш</div>
            <div className="text-3xl font-bold text-green-900">{teacherCount}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-purple-700 mb-1">Нийт Шалгалт</div>
            <div className="text-3xl font-bold text-purple-900">{examCount}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <FileText className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-amber-700 mb-1">Нийт Анги</div>
            <div className="text-3xl font-bold text-amber-900">{subjectCount}</div>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <BookOpen className="text-amber-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Хэрэглэгчийн удирдлага
          </h2>
          <div className="space-y-3">
            <Link href="/admin/users" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
              Хэрэглэгчийн жагсаалт
            </Link>
            <Link href="/admin/users/new" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
              Шинэ хэрэглэгч нэмэх
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            Шалгалтын удирдлага
          </h2>
          <div className="space-y-3">
            <Link href="/admin/exams/all" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
              Шалгалтын жагсаалт
            </Link>
            <Link href="/admin/exams/new" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
              Шинэ шалгалт нэмэх
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
