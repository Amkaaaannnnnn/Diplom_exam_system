import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ExamDetailClient from "./exam-detail-client"

export default async function ExamDetail({ params }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch exam details
  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      examQuestions: {
        include: {
          question: true,
        },
      },
    },
  })

  if (!exam) {
    return {
      notFound: true,
    }
  }

  // Check if student is assigned to this exam
  const assignment = await prisma.examAssignment.findFirst({
    where: {
      examId: params.id,
      userId: user.id,
    },
  })

  if (!assignment) {
    redirect("/student/exams")
  }

  // Check if student has already taken this exam
  const result = await prisma.result.findFirst({
    where: {
      examId: params.id,
      userId: user.id,
    },
  })

  // Current time for comparison
  const now = new Date()

  // Parse exam date and time
  let examStartTime = null
  if (exam.examDate) {
    examStartTime = new Date(exam.examDate)
    if (exam.examTime) {
      const [hours, minutes] = exam.examTime.split(":").map(Number)
      examStartTime.setHours(hours, minutes, 0)
    }
  }

  // Calculate exam end time
  let examEndTime = null
  if (examStartTime) {
    examEndTime = new Date(examStartTime)
    examEndTime.setMinutes(examEndTime.getMinutes() + (exam.duration || 60))
  }

  // Determine exam status
  let status = "upcoming"
  if (result) {
    status = "completed"
  } else if (examEndTime && now > examEndTime) {
    status = "expired"
  } else if (examStartTime && now >= examStartTime) {
    status = "active"
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
}
