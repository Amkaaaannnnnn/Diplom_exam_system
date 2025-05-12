import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

export async function GET(request, { params }) {
  try {
    console.log("GET /api/exams/[id] - Start", new Date().toISOString())

    const { id } = params
    console.log("GET /api/exams/[id] - Exam ID:", id)

    // Get the current user
    const user = await getServerUser()
    if (!user) {
      console.log("GET /api/exams/[id] - No user found")
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
    }

    console.log("GET /api/exams/[id] - User found:", user.id, user.role)

    // Find the exam with appropriate includes based on user role
    const examQuery = {
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                className: true,
              },
            },
          },
        },
      },
    }

    // Add examQuestions for all users, but limit what students can see
    if (user.role === "student") {
      examQuery.include.examQuestions = {
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
      }
    } else {
      examQuery.include.examQuestions = {
        include: {
          question: true,
        },
      }
    }

    // For students, also check if they have a result for this exam
    let studentResult = null
    if (user.role === "student") {
      studentResult = await prisma.result.findFirst({
        where: {
          examId: id,
          userId: user.id,
        },
      })
    }

    const exam = await prisma.exam.findUnique(examQuery)

    if (!exam) {
      console.log("GET /api/exams/[id] - Exam not found")
      return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 })
    }

    console.log("GET /api/exams/[id] - Exam found, checking permissions...")

    // Check permissions
    if (user.role === "teacher" && exam.userId !== user.id) {
      console.log("GET /api/exams/[id] - Teacher not owner of exam")
      return NextResponse.json({ error: "Энэ шалгалтыг харах эрх байхгүй байна" }, { status: 403 })
    }

    if (user.role === "student") {
      // Check if the exam is assigned to this student
      const isAssigned = exam.assignedTo.some((assignment) => assignment.userId === user.id)

      if (!isAssigned) {
        console.log("GET /api/exams/[id] - Exam not assigned to student")
        return NextResponse.json({ error: "Энэ шалгалтыг харах эрх байхгүй байна" }, { status: 403 })
      }

      // Add the result information to the response for students
      exam.studentResult = studentResult
    }

    console.log("GET /api/exams/[id] - Returning exam data")
    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: `Шалгалтын мэдээлэл татахад алдаа гарлаа: ${error.message}` }, { status: 500 })
  }
}

// Update an exam
export async function PUT(req, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Шалгалтын ID заавал шаардлагатай" }, { status: 400 })
    }

    // Check if the current user is an admin or teacher
    const user = await getServerUser()

    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, subject, className, duration, totalPoints, examDate, examTime, questions } = body

    // Validate required fields
    if (!title || !subject || !className) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

    // Check if the exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    })

    if (!existingExam) {
      return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 })
    }

    // Check if the user has permission to update this exam
    if (user.role === "teacher" && existingExam.userId !== user.id) {
      return NextResponse.json({ error: "Энэ шалгалтыг засах эрхгүй байна" }, { status: 403 })
    }

    // Update the exam with questions in a transaction
    const updatedExam = await prisma.$transaction(async (tx) => {
      // Update the exam
      const exam = await tx.exam.update({
        where: { id },
        data: {
          title,
          description,
          subject,
          className,
          duration: duration ? Number.parseInt(duration) : 30,
          totalPoints: totalPoints ? Number.parseInt(totalPoints) : 100,
          examDate: examDate ? new Date(examDate) : null,
          examTime,
        },
      })

      // Delete existing questions
      await tx.question.deleteMany({
        where: { examId: id },
      })

      // Create new questions
      if (questions && questions.length > 0) {
        for (const q of questions) {
          await tx.question.create({
            data: {
              text: q.text,
              type: q.type,
              points: q.points || 1,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              userId: user.id, // Багшийн ID-г нэмж өгөх
              exam: {
                connect: { id: exam.id },
              },
            },
          })
        }
      }

      return exam
    })

    // Fetch the complete updated exam with questions
    const completeExam = await prisma.exam.findUnique({
      where: { id: updatedExam.id },
      include: {
        user: true,
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    })

    // Fetch questions separately
    const examQuestions = await prisma.question.findMany({
      where: { examId: id },
    })

    // Add questions to the response
    completeExam.questions = examQuestions

    return NextResponse.json(completeExam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json(
      {
        error: "Шалгалт шинэчлэх үед алдаа гарлаа",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Delete an exam
export async function DELETE(req, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Шалгалтын ID заавал шаардлагатай" }, { status: 400 })
    }

    // Check if the current user is an admin or teacher
    const user = await getServerUser()

    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    // Check if the exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    })

    if (!existingExam) {
      return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 })
    }

    // Check if the user has permission to delete this exam
    if (user.role === "teacher" && existingExam.userId !== user.id) {
      return NextResponse.json({ error: "Энэ шалгалтыг устгах эрхгүй байна" }, { status: 403 })
    }

    // Delete the exam and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete exam results
      await tx.result.deleteMany({
        where: {
          examId: id,
        },
      })

      // Delete exam assignments
      await tx.examAssignment.deleteMany({
        where: {
          examId: id,
        },
      })

      // Delete questions
      await tx.question.deleteMany({
        where: {
          examId: id,
        },
      })

      // Delete the exam
      await tx.exam.delete({
        where: {
          id,
        },
      })
    })

    return NextResponse.json({ success: true, message: "Шалгалт амжилттай устгагдлаа" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json(
      {
        error: "Шалгалт устгах үед алдаа гарлаа",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
