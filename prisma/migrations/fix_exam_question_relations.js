const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration to fix exam-question relations...")

  // 1. Get all exams
  const exams = await prisma.exam.findMany()
  console.log(`Found ${exams.length} exams`)

  // 2. For each exam, ensure examQuestions are properly linked
  for (const exam of exams) {
    console.log(`Processing exam: ${exam.id} - ${exam.title}`)

    // Get questions for this exam
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
    })
    console.log(`Found ${questions.length} questions for exam ${exam.id}`)

    // Check if examQuestions exist for this exam
    const existingExamQuestions = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
    })
    console.log(`Found ${existingExamQuestions.length} existing examQuestions for exam ${exam.id}`)

    // Create a map of existing exam questions
    const existingMap = {}
    existingExamQuestions.forEach((eq) => {
      existingMap[eq.questionId] = true
    })

    // Create missing examQuestions
    for (const question of questions) {
      if (!existingMap[question.id]) {
        console.log(`Creating examQuestion link for question ${question.id} in exam ${exam.id}`)
        await prisma.examQuestion.create({
          data: {
            examId: exam.id,
            questionId: question.id,
            points: question.points || 1,
          },
        })
      }
    }
  }

  // 3. Fix results to ensure they have proper question references
  const results = await prisma.result.findMany()
  console.log(`Found ${results.length} results to process`)

  for (const result of results) {
    console.log(`Processing result: ${result.id}`)

    if (!result.answers || !Array.isArray(result.answers)) {
      console.log(`Result ${result.id} has no answers or invalid answers format, skipping`)
      continue
    }

    let modified = false
    const updatedAnswers = result.answers.map((answer) => {
      // If answer already has a questionId, keep it
      if (answer.questionId) {
        return answer
      }

      // If answer has a question object with an id, extract the id
      if (answer.question && answer.question.id) {
        modified = true
        return {
          ...answer,
          questionId: answer.question.id,
          // Remove the question object to avoid circular references
          question: undefined,
        }
      }

      return answer
    })

    if (modified) {
      console.log(`Updating result ${result.id} with fixed answers`)
      await prisma.result.update({
        where: { id: result.id },
        data: { answers: updatedAnswers },
      })
    }
  }

  console.log("Migration completed successfully")
}

main()
  .catch((e) => {
    console.error("Migration failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
