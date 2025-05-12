import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

export async function GET(req, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")

    // Get current user for permission check
    const currentUser = await getServerUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Fetching results for exam: ${id}${studentId ? `, student: ${studentId}` : ""}`)

    // Permission check
    const isTeacher = currentUser.role === "teacher"
    const isAdmin = currentUser.role === "admin"

    // If not admin or teacher, check if the user is the student trying to access their own results
    if (!isAdmin && !isTeacher && (!studentId || studentId !== currentUser.id)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // If teacher, check if they created the exam
    if (isTeacher && !isAdmin) {
      const exam = await prisma.exam.findUnique({
        where: { id },
        select: { userId: true },
      })

      if (!exam || exam.userId !== currentUser.id) {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 })
      }
    }

    // Build the query
    const where = { examId: id }
    if (studentId) {
      where.userId = studentId
    }

    // Fetch results
    const results = await prisma.result.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            className: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            examDate: true,
            examTime: true,
            duration: true,
            examQuestions: {
              include: {
                question: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    })

    console.log(`Found ${results.length} results`)

    // If looking for a specific student and only one result, return it directly
    if (studentId && results.length === 1) {
      return NextResponse.json(results[0])
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching exam results:", error)
    return NextResponse.json({ error: `Failed to fetch exam results: ${error.message}` }, { status: 500 })
  }
}
