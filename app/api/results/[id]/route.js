import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

export async function GET(req, { params }) {
  try {
    const { id } = params

    // Get current user for permission check
    const currentUser = await getServerUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Fetching result with ID: ${id}`)

    // Fetch the result with basic information
    const result = await prisma.result.findUnique({
      where: { id },
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
            userId: true,
            examDate: true,
            examTime: true,
            duration: true,
            totalPoints: true,
            examQuestions: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    })

    if (!result) {
      console.log(`Result with ID ${id} not found`)
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    console.log(`Result found: ${result.id}, processing answers`)

    // Process answers to include full question details
    const processedResult = { ...result }

    // Ensure answers is an array
    if (!Array.isArray(processedResult.answers)) {
      processedResult.answers = []
      console.log("Answers array was not found, creating empty array")
    }

    // Create a map of questions from the exam
    const questionMap = {}
    if (result.exam && result.exam.examQuestions) {
      result.exam.examQuestions.forEach((eq) => {
        if (eq.question) {
          questionMap[eq.question.id] = eq.question
          console.log(`Mapped question ${eq.question.id}: ${eq.question.text.substring(0, 30)}...`)
        }
      })
    }

    // If we couldn't get questions from examQuestions, try direct query
    if (Object.keys(questionMap).length === 0) {
      console.log("No questions found in examQuestions, trying direct query")
      try {
        const examQuestions = await prisma.question.findMany({
          where: {
            examId: result.exam.id,
          },
        })

        examQuestions.forEach((question) => {
          questionMap[question.id] = question
          console.log(`Mapped question ${question.id} from direct query: ${question.text.substring(0, 30)}...`)
        })
      } catch (error) {
        console.error("Error fetching questions directly:", error)
      }
    }

    // Enhance each answer with its corresponding question details
    processedResult.answers = processedResult.answers.map((answer) => {
      // Get the question ID from the answer
      const questionId = answer.questionId || (answer.question && answer.question.id)

      if (!questionId) {
        console.log("Answer missing questionId:", answer)
        return {
          ...answer,
          question: {
            id: `unknown-${Math.random().toString(36).substring(7)}`,
            text: "Асуултын ID олдсонгүй",
            type: "UNKNOWN",
            points: 1,
            options: [],
            correctAnswer: "",
          },
        }
      }

      // Find the question in our map
      const question = questionMap[questionId]

      if (!question) {
        console.log(`Question ${questionId} not found in map`)
        return {
          ...answer,
          question: {
            id: questionId,
            text: `Асуулт олдсонгүй (ID: ${questionId})`,
            type: "UNKNOWN",
            points: 1,
            options: [],
            correctAnswer: "",
          },
        }
      }

      // Return the answer with the full question
      return {
        ...answer,
        question,
      }
    })

    // Permission check
    const isTeacher = currentUser.role === "teacher"
    const isAdmin = currentUser.role === "admin"
    const isExamCreator = result.exam?.userId === currentUser.id
    const isStudent = currentUser.role === "student" && result.userId === currentUser.id

    if (!isAdmin && !isTeacher && !isExamCreator && !isStudent) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    console.log(`Returning processed result with ${processedResult.answers.length} answers`)
    return NextResponse.json(processedResult)
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: `Failed to fetch result: ${error.message}` }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params

    console.log(`PATCH request for result ID: ${id}`)

    // Parse the request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", JSON.stringify(body).substring(0, 200) + "...")
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { answers, score, feedback } = body

    // Get current user for permission check
    const currentUser = await getServerUser()
    if (!currentUser) {
      console.log("Unauthorized: No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`User: ${currentUser.id}, role: ${currentUser.role}`)

    // Only teachers and admins can update results
    if (currentUser.role !== "teacher" && currentUser.role !== "admin") {
      console.log("Permission denied: User is not a teacher or admin")
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Check if the result exists
    console.log(`Checking if result ${id} exists`)
    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!result) {
      console.log(`Result ${id} not found`)
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    // Additional permission check: only the exam creator or admin can update results
    if (currentUser.role !== "admin" && result.exam?.userId !== currentUser.id) {
      console.log(`Permission denied: User ${currentUser.id} is not the exam creator ${result.exam?.userId}`)
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Prepare the data to update
    const updateData = {}

    // Only update score if provided
    if (score !== undefined) {
      updateData.score = score
    }

    // Only update feedback if provided
    if (feedback !== undefined) {
      updateData.feedback = feedback
    }

    // Only update answers if provided
    if (answers) {
      // Process answers to remove circular references and unnecessary data
      const processedAnswers = answers.map((answer) => {
        // Create a new object with only the needed properties
        const { question, ...answerWithoutQuestion } = answer

        // Keep the questionId if it exists
        if (question && question.id && !answerWithoutQuestion.questionId) {
          answerWithoutQuestion.questionId = question.id
        }

        return answerWithoutQuestion
      })

      updateData.answers = processedAnswers
    }

    console.log(`Updating result ${id} with data:`, JSON.stringify(updateData).substring(0, 200) + "...")

    // Update the result with the new data
    const updatedResult = await prisma.result.update({
      where: { id },
      data: updateData,
    })

    console.log(`Result ${id} updated successfully`)
    return NextResponse.json(updatedResult)
  } catch (error) {
    console.error("Error updating result:", error)
    return NextResponse.json({ error: `Failed to update result: ${error.message}` }, { status: 500 })
  }
}
