import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/auth-server"
import AdminSidebar from "@/components/admin-sidebar"

export default async function AdminLayout({ children }) {
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={{ name: user.name, username: user.username }} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
