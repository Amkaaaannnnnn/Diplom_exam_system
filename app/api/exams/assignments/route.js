import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Get exam assignments for the current user
export async function GET(req) {
  try {
    // Check if the current user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const examId = url.searchParams.get("examId")
    const userId = url.searchParams.get("userId")

    // Build the query based on role and parameters
    const query = {}

    if (currentUser.role === "student") {
      // Students can only see their own assignments
      query.userId = currentUser.id
    } else if (currentUser.role === "teacher") {
      // Teachers can see assignments for exams they created
      query.exam = {
        userId: currentUser.id,
      }

      // If userId is provided, filter by that student
      if (userId) {
        query.userId = userId
      }
    }

    // Add additional filters if provided
    if (status) {
      query.status = status
    }

    if (examId) {
      query.examId = examId
    }

    // Get assignments
    const assignments = await prisma.examAssignment.findMany({
      where: query,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            examDate: true,
            examTime: true,
            duration: true,
            totalPoints: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            className: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching exam assignments:", error)
    return NextResponse.json({ error: "Шалгалтын даалгаврыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}
