// This is a manual migration script
// Run this with: node prisma/migrations/add_exam_assignment.js

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Running migration to add exam_assignment table...")

  try {
    // Check if the table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'exam_assignment'
      );
    `

    if (!tableExists[0].exists) {
      console.log("Creating exam_assignment table...")

      // Create the table
      await prisma.$executeRaw`
        CREATE TABLE "exam_assignment" (
          "id" TEXT PRIMARY KEY,
          "examid" TEXT NOT NULL,
          "userid" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdat" TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT "exam_assignment_examid_fkey" FOREIGN KEY ("examid") REFERENCES "exam"("id") ON DELETE CASCADE,
          CONSTRAINT "exam_assignment_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE CASCADE,
          CONSTRAINT "exam_assignment_examid_userid_key" UNIQUE ("examid", "userid")
        );
      `

      console.log("Table created successfully!")
    } else {
      console.log("Table exam_assignment already exists, skipping creation.")
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
