import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    // Get the current user from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const { id } = params

    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: true,
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            points: true,
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if user is admin, the teacher who created the exam, or a student assigned to the exam
    if (user.role === "student") {
      // Check if the student is assigned to this exam
      const assignment = await prisma.examAssignment.findFirst({
        where: {
          examId: id,
          userId: user.id,
        },
      })

      if (!assignment) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (user.role === "teacher" && exam.user.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Get the current user from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Only teachers and admins can update exams
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()

    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if user is admin or the teacher who created the exam
    if (user.role !== "admin" && exam.user.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the exam
    const updatedExam = await prisma.exam.update({
      where: { id },
      data,
    })

    return NextResponse.json(updatedExam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get the current user from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Only teachers and admins can delete exams
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params

    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if user is admin or the teacher who created the exam
    if (user.role !== "admin" && exam.user.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the exam
    await prisma.exam.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 })
  }
}
