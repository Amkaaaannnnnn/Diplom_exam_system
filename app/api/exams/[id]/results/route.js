import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const examId = Number.parseInt(id)

    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a teacher
    if (authResult.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get exam details first to check if it exists
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
      include: {
        questions: true,
        assignments: {
          include: {
            student: true,
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Get all results for this exam
    const results = await prisma.examResult.findMany({
      where: {
        examId: examId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
      },
    })

    // Calculate exam statistics
    const totalStudents = exam.assignments.length
    const completedCount = results.length
    let totalScore = 0
    let passCount = 0

    // Transform the results to include student name and format
    const formattedResults = results.map((result) => {
      // Calculate percentage
      const percentage = Math.round((result.score / result.totalPoints) * 100)

      // Add to statistics
      totalScore += percentage
      if (percentage >= 60) {
        passCount++
      }

      // Determine grade based on percentage
      let grade = "F"
      if (percentage >= 90) grade = "A"
      else if (percentage >= 80) grade = "B"
      else if (percentage >= 70) grade = "C"
      else if (percentage >= 60) grade = "D"

      // Calculate duration in minutes
      const startTime = new Date(result.startedAt)
      const endTime = new Date(result.submittedAt)
      const durationMs = endTime - startTime
      const durationMinutes = Math.round(durationMs / 60000)

      return {
        id: result.id,
        studentId: result.student.studentId,
        name: `${result.student.lastName.charAt(0)}. ${result.student.firstName}`,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: percentage,
        grade: grade,
        status: "Дууссан",
        startedAt: result.startedAt,
        submittedAt: result.submittedAt,
        duration: durationMinutes,
        answers: result.answers,
      }
    })

    // Calculate average score and pass rate
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0
    const passRate = completedCount > 0 ? Math.round((passCount / completedCount) * 100) : 0

    // Add exam statistics to the response
    const examStats = {
      totalStudents,
      completedCount,
      averageScore,
      passRate,
      questionCount: exam.questions.length,
    }

    return NextResponse.json({
      results: formattedResults,
      stats: examStats,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        className: exam.className,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        examDate: exam.examDate,
        examTime: exam.examTime,
      },
    })
  } catch (error) {
    console.error("Error fetching exam results:", error)
    return NextResponse.json({ error: "Failed to fetch exam results" }, { status: 500 })
  }
}
