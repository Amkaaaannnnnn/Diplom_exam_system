import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/sidebar"

export default async function StudentLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={{ name: user.name, username: user.username }} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
