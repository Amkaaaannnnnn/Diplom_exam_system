import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Helper function to get current user from cookies
async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_please_change")
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function GET(req) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the URL parameters
    const url = new URL(req.url)
    const studentId = url.searchParams.get("studentId")
    const examId = url.searchParams.get("examId")

    // Build the query based on the user role and parameters
    const whereClause = {}

    if (currentUser.role === "student") {
      // Students can only see their own results
      whereClause.userId = currentUser.id
    } else if (currentUser.role === "teacher") {
      // Teachers can see results for exams they created
      if (studentId) {
        // If studentId is provided, get results for that student
        whereClause.userId = studentId
        whereClause.exam = {
          userId: currentUser.id,
        }
      } else {
        // Otherwise, get all results for exams created by this teacher
        whereClause.exam = {
          userId: currentUser.id,
        }
      }
    } else if (currentUser.role === "admin") {
      // Admins can see all results
      if (studentId) {
        whereClause.userId = studentId
      }
    }

    // If examId is provided, filter by exam
    if (examId) {
      whereClause.examId = examId
    }

    // Get the results
    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            subjectType: true,
            className: true,
            totalPoints: true,
            examDate: true,
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
        submittedAt: "desc",
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
