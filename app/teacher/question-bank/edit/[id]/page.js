import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import QuestionForm from "../../components/question-form"

export default async function EditQuestion({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  const { id } = params

  // Даалгаврыг татах
  const question = await prisma.question.findUnique({
    where: { id },
  })

  if (!question || question.userId !== user.id) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Даалгавар засах</h1>
        <Link href="/teacher/question-bank" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Буцах
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <QuestionForm question={question} />
      </div>
    </div>
  )
}
