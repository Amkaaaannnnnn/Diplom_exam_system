import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Get a specific exam
export async function GET(req, { params }) {
  try {
    const examId = params.id

    // Check if we should include answers (for result viewing)
    const url = new URL(req.url)
    const includeAnswers = url.searchParams.get("includeAnswers") === "true"

    // Check if the current user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (currentUser.role === "student" && !includeAnswers) {
      // For students taking the exam, check if they are assigned to this exam
      const assignment = await prisma.examAssignment.findFirst({
        where: {
          examId: examId,
          userId: currentUser.id,
        },
      })

      if (!assignment) {
        return NextResponse.json({ error: "Not authorized to access this exam" }, { status: 403 })
      }

      // Get exam for student without correct answers
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          questions: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
              options: true,
              // Don't include correctAnswer for students taking the exam
            },
          },
        },
      })

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }

      return NextResponse.json(exam)
    } else {
      // For teachers, admins, or students viewing their results
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          questions: true, // Include all question data including correct answers
        },
      })

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }

      // Teachers can only see their own exams
      if (currentUser.role === "teacher" && exam.userId !== currentUser.id) {
        return NextResponse.json({ error: "Not authorized to access this exam" }, { status: 403 })
      }

      // For students viewing results, verify they have taken this exam
      if (currentUser.role === "student" && includeAnswers) {
        const result = await prisma.examResult.findFirst({
          where: {
            examId: examId,
            userId: currentUser.id,
          },
        })

        if (!result) {
          return NextResponse.json({ error: "Not authorized to view exam answers" }, { status: 403 })
        }
      }

      return NextResponse.json(exam)
    }
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: "An error occurred while fetching the exam" }, { status: 500 })
  }
}

// Update an exam
export async function PUT(req, { params }) {
  try {
    const examId = params.id

    // Check if the current user is an admin or the teacher who created the exam
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Only allow admin or the teacher who created the exam to update it
    if (currentUser.role !== "admin" && exam.userId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { title, description, subject, className, duration, totalPoints, examDate, examTime, questions } = body

    // Validate required fields
    if (!title || !subject) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Delete existing questions
    await prisma.question.deleteMany({
      where: { examId: examId },
    })

    // Update the exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title,
        description,
        subject,
        className,
        duration: Number.parseInt(duration) || 30,
        totalPoints: Number.parseInt(totalPoints) || 100,
        examDate: examDate ? new Date(examDate) : null,
        examTime,
        questions: {
          create:
            questions && questions.length > 0
              ? questions.map((q) => ({
                  text: q.text || "",
                  type: q.type || "select",
                  points: Number.parseInt(q.points) || 1,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer || "",
                  userId: currentUser.id, // Add the userId field to fix the createdBy error
                }))
              : [],
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json(updatedExam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "An error occurred while updating the exam: " + error.message }, { status: 500 })
  }
}

// Delete an exam
export async function DELETE(req, { params }) {
  try {
    const examId = params.id

    // Check if the current user is an admin or the teacher who created the exam
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Only allow admin or the teacher who created the exam to delete it
    if (currentUser.role !== "admin" && exam.userId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Шалгалттай холбоотой бүх өгөгдлийг устгах
    // Prisma схемийг шалгаж, зөв моделийн нэрсийг ашиглах

    // 1. Шалгалтын хариултуудыг устгах (examAnswer гэсэн модель байгаа эсэхийг шалгах)
    try {
      // Шалгалтын хариултуудыг устгах
      if (prisma.examAnswer) {
        await prisma.examAnswer.deleteMany({
          where: {
            question: {
              examId: examId,
            },
          },
        })
      }
    } catch (error) {
      console.log("ExamAnswer model not found or error deleting answers:", error)
      // Алдаа гарсан ч үргэлжлүүлэх
    }

    // 2. Шалгалтын дүнгүүдийг устгах
    try {
      // Шалгалтын дүнгүүдийг устгах
      if (prisma.examResult) {
        await prisma.examResult.deleteMany({
          where: { examId: examId },
        })
      } else if (prisma.result) {
        await prisma.result.deleteMany({
          where: { examId: examId },
        })
      }
    } catch (error) {
      console.log("Result model not found or error deleting results:", error)
      // Алдаа гарсан ч үргэлжлүүлэх
    }

    // 3. Шалгалтын оноолтуудыг устгах
    try {
      if (prisma.examAssignment) {
        await prisma.examAssignment.deleteMany({
          where: { examId: examId },
        })
      }
    } catch (error) {
      console.log("ExamAssignment model not found or error deleting assignments:", error)
      // Алдаа гарсан ч үргэлжлүүлэх
    }

    // 4. Шалгалтын асуултуудыг устгах
    try {
      await prisma.question.deleteMany({
        where: { examId: examId },
      })
    } catch (error) {
      console.log("Error deleting questions:", error)
      // Алдаа гарсан ч үргэлжлүүлэх
    }

    // 5. Шалгалтыг устгах
    await prisma.exam.delete({
      where: { id: examId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "An error occurred while deleting the exam: " + error.message }, { status: 500 })
  }
}
