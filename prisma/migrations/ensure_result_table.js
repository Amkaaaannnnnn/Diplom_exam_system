import { prisma } from "@/lib/prisma"

export async function ensureResultTable() {
  try {
    console.log("Checking if result table exists...")

    // Try to query the result table
    try {
      await prisma.$queryRaw`SELECT 1 FROM "result" LIMIT 1`
      console.log("Result table exists.")
      return true
    } catch (error) {
      console.log("Result table does not exist, creating it...")

      // Create the result table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "result" (
          "id" TEXT NOT NULL,
          "examId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "score" DOUBLE PRECISION NOT NULL,
          "maxScore" DOUBLE PRECISION NOT NULL,
          "answers" JSONB,
          "startedAt" TIMESTAMP(3),
          "submittedAt" TIMESTAMP(3) NOT NULL,
          "feedback" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          
          CONSTRAINT "result_pkey" PRIMARY KEY ("id")
        )
      `

      // Create indexes
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "result_examId_idx" ON "result"("examId")
      `

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "result_userId_idx" ON "result"("userId")
      `

      console.log("Result table created successfully.")
      return true
    }
  } catch (error) {
    console.error("Error ensuring result table:", error)
    return false
  }
}
