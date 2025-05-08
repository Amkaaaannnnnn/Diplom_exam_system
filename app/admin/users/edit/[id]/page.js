import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import UserForm from "../../components/user-form"

export default async function EditUser({ params }) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/login")
  }

  if (currentUser.role !== "admin") {
    redirect("/login")
  }

  const { id } = params

  // Засах хэрэглэгчийг татах
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    redirect("/admin/users")
  }

  // Нууц үгийг хасах
  const { password, ...userWithoutPassword } = user

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Хэрэглэгч засах</h1>
        <Link href="/admin/users" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UserForm user={userWithoutPassword} />
      </div>
    </div>
  )
}
