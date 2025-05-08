/*
  Warnings:

  - You are about to drop the column `isRead` on the `notification` table. All the data in the column will be lost.
  - You are about to alter the column `earnedPoints` on the `result` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `totalPoints` on the `result` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `question_result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "question_result" DROP CONSTRAINT "question_result_resultId_fkey";

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "isRead";

-- AlterTable
ALTER TABLE "result" ADD COLUMN     "answers" JSONB,
ALTER COLUMN "earnedPoints" DROP NOT NULL,
ALTER COLUMN "earnedPoints" DROP DEFAULT,
ALTER COLUMN "earnedPoints" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPoints" DROP NOT NULL,
ALTER COLUMN "totalPoints" DROP DEFAULT,
ALTER COLUMN "totalPoints" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "question_result";
