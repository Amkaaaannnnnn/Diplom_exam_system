import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/auth-server"

export default async function TeacherExamsPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  // Redirect to completed exams
  redirect("/teacher/exams/completed")
}
