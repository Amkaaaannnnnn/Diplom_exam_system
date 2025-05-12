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

    // Get the exam to check permissions
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if user is admin or the teacher who created the exam
    if (user.role !== "ADMIN" && exam.createdBy.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all results for this exam with student information
    const results = await prisma.examResult.findMany({
      where: { examId: id },
      include: {
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
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                correctAnswer: true,
                // Don't include options directly in the select
              },
            },
          },
        },
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching exam results:", error)
    return NextResponse.json({ error: "Failed to fetch exam results" }, { status: 500 })
  }
}
