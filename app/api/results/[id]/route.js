import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const result = await prisma.examResult.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            createdBy: true,
            subject: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            className: true,
            register: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    // Check permissions
    if (user.role === "STUDENT") {
      // Students can only view their own results
      if (result.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } else if (user.role === "TEACHER") {
      // Teachers can only view results for exams they created
      if (result.exam.createdById !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
    // Admins can view all results

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUser()

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // Get the result to check permissions
    const result = await prisma.examResult.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            createdBy: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    // Check if user is admin or the teacher who created the exam
    if (user.role !== "ADMIN" && result.exam.createdBy.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update answers
    if (data.answers && Array.isArray(data.answers)) {
      // Update each answer
      for (const answer of data.answers) {
        await prisma.examAnswer.update({
          where: { id: answer.id },
          data: {
            isCorrect: answer.isCorrect,
            feedback: answer.feedback,
          },
        })
      }

      // Recalculate the score
      const updatedAnswers = await prisma.examAnswer.findMany({
        where: { examResultId: id },
      })

      const totalQuestions = updatedAnswers.length
      const correctAnswers = updatedAnswers.filter((a) => a.isCorrect).length
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

      // Update the result with the new score
      await prisma.examResult.update({
        where: { id },
        data: {
          correctAnswers,
          score,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating result:", error)
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 })
  }
}
