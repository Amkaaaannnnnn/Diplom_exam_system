import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Use a simpler query structure to avoid errors
    let exams = []

    if (user.role === "student") {
      // For students, get exams assigned to them that haven't started yet
      try {
        // First check if examAssignment table exists
        let assignmentTableExists = false
        try {
          await prisma.$queryRaw`SELECT 1 FROM "examAssignment" LIMIT 1`
          assignmentTableExists = true
        } catch (error) {
          assignmentTableExists = false
        }

        if (assignmentTableExists) {
          const assignments = await prisma.examAssignment.findMany({
            where: {
              userId: user.id,
            },
            include: {
              exam: true,
            },
          })

          // Filter for upcoming exams
          exams = assignments
            .filter((assignment) => {
              const examDate = new Date(assignment.exam.examDate)
              return examDate > now
            })
            .map((assignment) => assignment.exam)
        } else {
          // Fallback to class-based assignment
          exams = await prisma.exam.findMany({
            where: {
              className: user.className,
              examDate: {
                gt: now,
              },
            },
          })
        }
      } catch (error) {
        console.error("Error fetching student exams:", error)
      }
    } else if (user.role === "teacher") {
      // For teachers, get their own exams that haven't started yet
      try {
        exams = await prisma.exam.findMany({
          where: {
            userId: user.id,
            examDate: {
              gt: now,
            },
          },
          orderBy: {
            examDate: "asc",
          },
        })
      } catch (error) {
        console.error("Error fetching teacher exams:", error)
      }
    }

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching upcoming exams:", error)
    return NextResponse.json({ message: "Error fetching upcoming exams" }, { status: 500 })
  }
}
