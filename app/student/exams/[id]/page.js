import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ExamDetailClient from "./exam-detail-client"
import Link from "next/link"

export default async function StudentExamDetailPage({ params }) {
  const { id } = params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/")
  }

  try {
    // Fetch the exam
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                options: true,
                points: true,
                // Don't include correctAnswer for students
              },
            },
          },
        },
        assignedTo: {
          where: {
            userId: user.id,
          },
        },
      },
    })

    if (!exam) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Алдаа!</strong>
            <span className="block sm:inline"> Шалгалт олдсонгүй.</span>
          </div>
          <div className="mt-4">
            <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
              Шалгалтууд руу буцах
            </Link>
          </div>
        </div>
      )
    }

    // Check if the exam is assigned to this student
    if (exam.assignedTo.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Алдаа!</strong>
            <span className="block sm:inline"> Энэ шалгалтыг харах эрх байхгүй байна.</span>
          </div>
          <div className="mt-4">
            <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
              Шалгалтууд руу буцах
            </Link>
          </div>
        </div>
      )
    }

    // Check if the student has already taken this exam
    const result = await prisma.result.findFirst({
      where: {
        examId: id,
        userId: user.id,
      },
    })

    // Determine exam status
    const now = new Date()
    let examStartTime = null
    let examEndTime = null
    let status = "upcoming"

    if (exam.examDate) {
      examStartTime = new Date(exam.examDate)
      if (exam.examTime) {
        const [hours, minutes] = exam.examTime.split(":").map(Number)
        examStartTime.setHours(hours, minutes, 0)
      }

      examEndTime = new Date(examStartTime)
      examEndTime.setMinutes(examEndTime.getMinutes() + (exam.duration || 60))

      if (result) {
        status = "completed"
      } else if (now > examEndTime) {
        status = "expired"
      } else if (now >= examStartTime) {
        status = "active"
      }
    } else {
      // If no exam date is set, consider it active
      if (result) {
        status = "completed"
      } else {
        status = "active"
      }
    }

    // Make sure examQuestions is an array
    if (!Array.isArray(exam.examQuestions)) {
      exam.examQuestions = []
    }

    return (
      <ExamDetailClient
        exam={exam}
        status={status}
        result={result}
        examStartTime={examStartTime}
        examEndTime={examEndTime}
      />
    )
  } catch (error) {
    console.error("Error fetching exam details:", error)
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Алдаа!</strong>
          <span className="block sm:inline"> Шалгалтын мэдээлэл татахад алдаа гарлаа: {error.message}</span>
        </div>
        <div className="mt-4">
          <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
  }
}
