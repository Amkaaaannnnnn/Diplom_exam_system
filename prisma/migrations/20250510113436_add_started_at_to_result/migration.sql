/*
  Warnings:

  - You are about to drop the `result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_examid_fkey";

-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_userid_fkey";

-- AlterTable
ALTER TABLE "exam" ADD COLUMN     "subjectType" TEXT;

-- DropTable
DROP TABLE "result";

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "earnedPoints" INTEGER,
    "totalPoints" INTEGER,
    "answers" JSONB,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userid" TEXT NOT NULL,
    "examid" TEXT NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultHistory" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "previousScore" DOUBLE PRECISION NOT NULL,
    "newScore" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examid_fkey" FOREIGN KEY ("examid") REFERENCES "exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultHistory" ADD CONSTRAINT "ResultHistory_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultHistory" ADD CONSTRAINT "ResultHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
