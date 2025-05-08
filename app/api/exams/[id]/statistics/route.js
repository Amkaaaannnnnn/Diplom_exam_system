import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req, { params }) {
  try {
    const examId = params.id

    // Get the current user
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "teacher" && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: true,
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this exam
    if (currentUser.role === "teacher" && exam.userId !== currentUser.id) {
      return NextResponse.json({ error: "Not authorized to view this exam" }, { status: 403 })
    }

    // Get all results for this exam
    const results = await prisma.examResult.findMany({
      where: { examId: examId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        questionResults: true,
      },
    })

    // Calculate statistics
    const totalStudents = results.length
    const averageScore = totalStudents > 0 ? results.reduce((sum, result) => sum + result.score, 0) / totalStudents : 0

    const passingRate =
      totalStudents > 0 ? (results.filter((result) => result.score >= 60).length / totalStudents) * 100 : 0

    // Calculate question statistics
    const questionStats = exam.questions.map((question) => {
      const questionResults = results.flatMap((result) =>
        result.questionResults.filter((qr) => qr.questionId === question.id),
      )

      const totalAnswers = questionResults.length
      const correctAnswers = questionResults.filter((qr) => qr.isCorrect).length
      const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0

      return {
        questionId: question.id,
        text: question.text,
        type: question.type,
        totalAnswers,
        correctAnswers,
        correctRate,
        difficulty: correctRate >= 80 ? "Easy" : correctRate >= 50 ? "Medium" : "Hard",
      }
    })

    // Calculate score distribution
    const scoreDistribution = {
      "0-20": results.filter((r) => r.score >= 0 && r.score < 20).length,
      "20-40": results.filter((r) => r.score >= 20 && r.score < 40).length,
      "40-60": results.filter((r) => r.score >= 40 && r.score < 60).length,
      "60-80": results.filter((r) => r.score >= 60 && r.score < 80).length,
      "80-100": results.filter((r) => r.score >= 80 && r.score <= 100).length,
    }

    return NextResponse.json({
      examId,
      examTitle: exam.title,
      totalStudents,
      averageScore,
      passingRate,
      highestScore: totalStudents > 0 ? Math.max(...results.map((r) => r.score)) : 0,
      lowestScore: totalStudents > 0 ? Math.min(...results.map((r) => r.score)) : 0,
      questionStats,
      scoreDistribution,
      results: results.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        username: r.user.username,
        score: r.score,
        submittedAt: r.submittedAt,
        passed: r.score >= 60,
      })),
    })
  } catch (error) {
    console.error("Error fetching exam statistics:", error)
    return NextResponse.json({ error: "An error occurred while fetching exam statistics" }, { status: 500 })
  }
}
