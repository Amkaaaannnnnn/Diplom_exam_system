import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Plus } from "lucide-react"

export default async function UsersList() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/login")
  }

  // Бүх хэрэглэгчдийг татах
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  // Эрхийн дэлгэрэнгүй харуулах
  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Админ</span>
      case "teacher":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Багш</span>
      case "student":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Сурагч</span>
      default:
        return role
    }
  }

  // Статусын дэлгэрэнгүй харуулах
  const getStatusDisplay = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Идэвхтэй</span>
      case "INACTIVE":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Идэвхгүй</span>
      default:
        return status
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Хэрэглэгчийн удирдлага</h1>
        <Link
          href="/admin/users/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Хэрэглэгч нэмэх
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нэр</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Нэвтрэх нэр
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  И-мэйл
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Эрх</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Бүртгүүлсэн огноо
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleDisplay(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusDisplay(user.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link href={`/admin/users/edit/${user.id}`} className="text-blue-600 hover:text-blue-900">
                        <Pencil size={18} />
                      </Link>
                      <Link href={`/admin/users/delete/${user.id}`} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
