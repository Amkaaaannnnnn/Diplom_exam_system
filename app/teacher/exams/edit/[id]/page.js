import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ExamForm from "../../components/exam-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditExam({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }

  const examId = params.id

  try {
    // Шалгалтын мэдээллийг татах (examQuestions-оор дамжуулж асуулт татна)
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        examQuestions: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!exam) {
      redirect("/teacher/exams")
    }

    // exam.questions гэж нэрлэхэд тохируулах (useForm-д дамжуулахад хялбар)
    const questions = exam.examQuestions.map((eq) => eq.question)

    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Шалгалт засах</h1>
        </div>

        <ExamForm exam={{ ...exam, questions }} />
      </div>
    )
  } catch (error) {
    console.error("Шалгалтын мэдээлэл татахад алдаа гарлаа:", error)
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/teacher/exams" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Шалгалт засах</h1>
        </div>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Шалгалтын мэдээлэл татахад алдаа гарлаа. Дахин оролдоно уу.
        </div>
      </div>
    )
  }
}
