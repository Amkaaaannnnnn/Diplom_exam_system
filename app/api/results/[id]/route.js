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

export async function GET(req, { params }) {
  try {
    const { id } = params

    // Get the current user
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the result with the given ID
    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            questions: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            className: true,
            register: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Шалгалтын дүн олдсонгүй" }, { status: 404 })
    }

    // Check if the user is authorized to view this result
    // Students can only view their own results
    // Teachers can view all results for exams they created
    // Admins can view all results
    if (
      (currentUser.role === "student" && result.userId !== currentUser.id) ||
      (currentUser.role === "teacher" && result.exam.userId !== currentUser.id && currentUser.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Format the response
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: "Шалгалтын дүнг татахад алдаа гарлаа" }, { status: 500 })
  }
}
