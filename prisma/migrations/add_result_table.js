const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration: add_result_table")

  try {
    // Check if the result table exists
    let tableExists = false
    try {
      await prisma.$queryRaw`SELECT 1 FROM "result" LIMIT 1`
      tableExists = true
    } catch (error) {
      console.log("Result table does not exist, creating it...")
    }

    if (!tableExists) {
      // Create the result table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "result" (
          "id" TEXT NOT NULL,
          "examId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "score" DOUBLE PRECISION NOT NULL,
          "correctAnswers" INTEGER NOT NULL,
          "totalQuestions" INTEGER NOT NULL,
          "startedAt" TIMESTAMP(3),
          "submittedAt" TIMESTAMP(3) NOT NULL,
          "feedback" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          
          CONSTRAINT "result_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `

      console.log("Result table created successfully")
    } else {
      console.log("Result table already exists")
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
