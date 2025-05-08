/*
  Warnings:

  - You are about to drop the column `answers` on the `result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exam_assignment" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "result" DROP COLUMN "answers",
ADD COLUMN     "earnedPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "question_result" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "resultId" TEXT NOT NULL,

    CONSTRAINT "question_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "question_result" ADD CONSTRAINT "question_result_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
