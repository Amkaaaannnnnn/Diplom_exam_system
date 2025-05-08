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

    let results

    if (currentUser.role === "student") {
      // For students, get only their results
      results = await prisma.result.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: true,
              duration: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      })
    } else if (currentUser.role === "teacher") {
      // For teachers, get results for exams they created
      results = await prisma.result.findMany({
        where: {
          exam: {
            userId: currentUser.id,
          },
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: true,
              duration: true,
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
    } else if (currentUser.role === "admin") {
      // For admins, get all results
      results = await prisma.result.findMany({
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: true,
              duration: true,
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
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
