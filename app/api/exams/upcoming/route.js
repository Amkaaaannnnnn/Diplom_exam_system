import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const url = new URL(req.url)
    const role = url.searchParams.get("role")

    // Get current date and time
    const now = new Date()

    // Prepare the query based on the user's role
    let query = {}

    if (role === "teacher" && currentUser.role === "teacher") {
      // Teachers see their own upcoming exams
      query = {
        where: {
          userId: currentUser.id,
          OR: [
            {
              // Exams with a future date
              examDate: {
                gt: now,
              },
            },
            {
              // Exams with today's date but future time
              examDate: now.toISOString().split("T")[0],
              examTime: {
                gt: now.toTimeString().substring(0, 5), // HH:MM format
              },
            },
            {
              // Exams with no date (always show these)
              examDate: null,
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          examQuestions: {
            include: {
              question: true,
            },
          },
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
        orderBy: {
          examDate: "asc",
        },
      }
    } else if (role === "student" && currentUser.role === "student") {
      // Students see exams assigned to them that haven't started yet
      query = {
        where: {
          assignedTo: {
            some: {
              userId: currentUser.id,
            },
          },
          OR: [
            {
              // Exams with a future date
              examDate: {
                gt: now,
              },
            },
            {
              // Exams with today's date but future time
              examDate: now.toISOString().split("T")[0],
              examTime: {
                gt: now.toTimeString().substring(0, 5), // HH:MM format
              },
            },
            {
              // Exams with no date (always show these)
              examDate: null,
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          examQuestions: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                  points: true,
                  options: true,
                  // Don't include correctAnswer for students
                },
              },
            },
          },
        },
        orderBy: {
          examDate: "asc",
        },
      }
    } else {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    const exams = await prisma.exam.findMany(query)

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching upcoming exams:", error)
    return NextResponse.json(
      { error: "Ирэх шалгалтуудыг татах үед алдаа гарлаа", details: error.message },
      { status: 500 },
    )
  }
}
