import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ExamTakingClient from "./exam-taking-client"
import Link from "next/link"

export default async function TakeExamPage({ params }) {
  const { id } = params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/")
  }

  try {
    // Fetch the exam with questions
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
            <span className="block sm:inline"> Энэ шалгалтыг өгөх эрх байхгүй байна.</span>
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
    const existingResult = await prisma.result.findFirst({
      where: {
        examId: id,
        userId: user.id,
      },
    })

    if (existingResult) {
      return (
        <div className="p-6">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Анхааруулга!</strong>
            <span className="block sm:inline"> Та энэ шалгалтыг өмнө нь өгсөн байна.</span>
          </div>
          <div className="mt-4">
            <Link href={`/student/results/${existingResult.id}`} className="text-blue-600 hover:text-blue-800">
              Дүн харах
            </Link>
          </div>
        </div>
      )
    }

    // Check if the exam is active
    const now = new Date()
    let examStartTime = null
    let examEndTime = null
    let isActive = true

    if (exam.examDate) {
      examStartTime = new Date(exam.examDate)
      if (exam.examTime) {
        const [hours, minutes] = exam.examTime.split(":").map(Number)
        examStartTime.setHours(hours, minutes, 0)
      }

      examEndTime = new Date(examStartTime)
      examEndTime.setMinutes(examEndTime.getMinutes() + (exam.duration || 60))

      if (now < examStartTime) {
        isActive = false
        return (
          <div className="p-6">
            <div
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Анхааруулга!</strong>
              <span className="block sm:inline"> Шалгалт эхлээгүй байна.</span>
            </div>
            <div className="mt-4">
              <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
                Шалгалтууд руу буцах
              </Link>
            </div>
          </div>
        )
      }

      if (now > examEndTime) {
        isActive = false
        return (
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Анхааруулга!</strong>
              <span className="block sm:inline"> Шалгалтын хугацаа дууссан байна.</span>
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

    // Make sure examQuestions is an array and has questions
    if (!Array.isArray(exam.examQuestions) || exam.examQuestions.length === 0) {
      return (
        <div className="p-6">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Анхааруулга!</strong>
            <span className="block sm:inline"> Энэ шалгалтад асуулт байхгүй байна.</span>
          </div>
          <div className="mt-4">
            <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
              Шалгалтууд руу буцах
            </Link>
          </div>
        </div>
      )
    }

    // Prepare questions for the client
    const questions = exam.examQuestions.map((eq) => ({
      id: eq.question.id,
      text: eq.question.text,
      type: eq.question.type,
      options: eq.question.options,
      points: eq.question.points,
    }))

    return (
      <ExamTakingClient
        exam={{
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          totalPoints: exam.totalPoints,
          subject: exam.subject,
          className: exam.className,
          questions: questions,
        }}
        examEndTime={examEndTime}
      />
    )
  } catch (error) {
    console.error("Error fetching exam for taking:", error)
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
