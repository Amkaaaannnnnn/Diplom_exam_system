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
      // Teachers see their own completed exams
      query = {
        where: {
          userId: currentUser.id,
          AND: [
            {
              // Exams with a date (not null)
              examDate: {
                not: null,
              },
            },
            {
              OR: [
                {
                  // Exams with a past date
                  examDate: {
                    lt: now,
                  },
                },
                {
                  // Exams with today's date but past time
                  examDate: now.toISOString().split("T")[0],
                  examTime: {
                    lte: now.toTimeString().substring(0, 5), // HH:MM format
                  },
                },
              ],
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
          results: {
            select: {
              id: true,
              userId: true,
              score: true,
              maxScore: true,
              submittedAt: true,
            },
          },
        },
        orderBy: {
          examDate: "desc",
        },
      }
    } else if (role === "student" && currentUser.role === "student") {
      // Students see completed exams assigned to them
      query = {
        where: {
          assignedTo: {
            some: {
              userId: currentUser.id,
            },
          },
          AND: [
            {
              // Exams with a date (not null)
              examDate: {
                not: null,
              },
            },
            {
              OR: [
                {
                  // Exams with a past date
                  examDate: {
                    lt: now,
                  },
                },
                {
                  // Exams with today's date but past time
                  examDate: now.toISOString().split("T")[0],
                  examTime: {
                    lte: now.toTimeString().substring(0, 5), // HH:MM format
                  },
                },
              ],
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
          results: {
            where: {
              userId: currentUser.id,
            },
            select: {
              id: true,
              score: true,
              maxScore: true,
              submittedAt: true,
            },
          },
        },
        orderBy: {
          examDate: "desc",
        },
      }
    } else {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    const exams = await prisma.exam.findMany(query)

    // For teachers, calculate statistics for each exam
    if (role === "teacher") {
      const examsWithStats = exams.map((exam) => {
        const totalStudents = exam.assignedTo.length
        const completedCount = exam.results.length
        const totalScores = exam.results.reduce((sum, result) => sum + result.score, 0)
        const averageScore = completedCount > 0 ? Math.round(totalScores / completedCount) : 0

        return {
          ...exam,
          totalStudents,
          completedCount,
          averageScore,
        }
      })

      return NextResponse.json(examsWithStats)
    }

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching completed exams:", error)
    return NextResponse.json(
      { error: "Дууссан шалгалтуудыг татах үед алдаа гарлаа", details: error.message },
      { status: 500 },
    )
  }
}
