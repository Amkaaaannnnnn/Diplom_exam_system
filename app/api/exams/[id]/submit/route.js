import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// Make sure we have a valid JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change"

// Helper function to get current user from cookies
async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function POST(req, { params }) {
  try {
    // Get the exam ID from params
    const examId = params.id

    // Get the current user
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the student is assigned to this exam
    const assignment = await prisma.examAssignment.findFirst({
      where: {
        examId: examId,
        userId: currentUser.id,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "You are not assigned to this exam" }, { status: 403 })
    }

    // Check if the student has already taken this exam
    const existingResult = await prisma.result.findFirst({
      where: {
        examId: examId,
        userId: currentUser.id,
      },
    })

    if (existingResult) {
      return NextResponse.json({
        message: "You have already taken this exam",
        resultId: existingResult.id,
      })
    }

    // Get the exam with questions and correct answers
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Get the answers from the request body
    const { answers } = await req.json()

    // Calculate the score
    let earnedPoints = 0
    let totalPoints = 0
    const questionResults = []

    for (const question of exam.questions) {
      totalPoints += question.points
      const studentAnswer = answers[question.id]
      let isCorrect = false

      // Check if the answer is correct based on question type
      if (question.type === "select") {
        isCorrect = studentAnswer === question.correctAnswer
      } else if (question.type === "multiselect") {
        // For multiselect, all selected options must match the correct answers
        const correctAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : typeof question.correctAnswer === "string"
            ? question.correctAnswer.split(",").map((a) => a.trim())
            : []

        isCorrect =
          studentAnswer &&
          Array.isArray(studentAnswer) &&
          studentAnswer.length === correctAnswers.length &&
          studentAnswer.every((a) => correctAnswers.includes(a))
      } else if (question.type === "text") {
        // For text, do a case-insensitive comparison
        isCorrect =
          studentAnswer &&
          question.correctAnswer &&
          studentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      } else if (question.type === "number") {
        // For number, convert to number and compare
        isCorrect = Number(studentAnswer) === Number(question.correctAnswer)
      }

      // Add points if the answer is correct
      if (isCorrect) {
        earnedPoints += question.points
      }

      // Save the question result
      questionResults.push({
        questionId: question.id,
        studentAnswer: typeof studentAnswer === "object" ? JSON.stringify(studentAnswer) : studentAnswer,
        isCorrect,
      })
    }

    // Calculate the percentage score
    const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    // Create the exam result with answers field
    const result = await prisma.result.create({
      data: {
        examId: examId,
        userId: currentUser.id,
        score: percentageScore,
        earnedPoints: earnedPoints,
        totalPoints: totalPoints,
        answers: questionResults, // JSON хэлбэрээр хадгалах
      },
    })

    // Update the exam assignment status to COMPLETED
    await prisma.examAssignment.update({
      where: {
        id: assignment.id,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      resultId: result.id,
      score: percentageScore,
      earnedPoints,
      totalPoints,
      message: `Шалгалт амжилттай дууслаа. Таны оноо: ${earnedPoints}/${totalPoints} (${percentageScore}%)`,
      passed: percentageScore >= 60,
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "An error occurred while submitting the exam" }, { status: 500 })
  }
}
