import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import TeacherSidebar from "@/components/teacher-sidebar"

export default async function TeacherLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar user={{ name: user.name, username: user.username }} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
