import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req, { params }) {
  try {
    const resultId = params.id

    // Get the current user
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the result with exam data
    const result = await prisma.examResult.findUnique({
      where: { id: resultId },
      include: {
        exam: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            className: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    // Check if the user is authorized to share this result
    if (result.userId !== currentUser.id) {
      return NextResponse.json({ error: "Not authorized to share this result" }, { status: 403 })
    }

    // Create a notification for the teacher
    await prisma.notification.create({
      data: {
        title: "Шалгалтын дүн хуваалцсан",
        content: `${currentUser.name} сурагч "${result.exam.title}" шалгалтын дүнг тантай хуваалцлаа. Дүн: ${result.score}%`,
        userId: result.exam.userId, // Send to the teacher who created the exam
      },
    })

    return NextResponse.json({ success: true, message: "Result shared successfully" })
  } catch (error) {
    console.error("Error sharing result:", error)
    return NextResponse.json({ error: "An error occurred while sharing the result" }, { status: 500 })
  }
}
