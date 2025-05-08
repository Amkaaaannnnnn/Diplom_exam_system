-- Drop tables if they exist
DROP TABLE IF EXISTS "result";
DROP TABLE IF EXISTS "notification";
DROP TABLE IF EXISTS "exam";
DROP TABLE IF EXISTS "subject";
DROP TABLE IF EXISTS "user";

-- Create user table
CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "register" TEXT,
  "role" TEXT NOT NULL,
  "className" TEXT,
  "subject" TEXT,
  "password" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdat" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create subject table
CREATE TABLE "subject" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE
);

-- Create exam table
CREATE TABLE "exam" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "subject" TEXT NOT NULL,
  "createdat" TIMESTAMP NOT NULL DEFAULT NOW(),
  "userid" TEXT NOT NULL REFERENCES "user"("id")
);

-- Create notification table
CREATE TABLE "notification" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdat" TIMESTAMP NOT NULL DEFAULT NOW(),
  "userid" TEXT NOT NULL REFERENCES "user"("id")
);

-- Create result table
CREATE TABLE "result" (
  "id" TEXT PRIMARY KEY,
  "score" DOUBLE PRECISION NOT NULL,
  "createdat" TIMESTAMP NOT NULL DEFAULT NOW(),
  "userid" TEXT NOT NULL REFERENCES "user"("id"),
  "examid" TEXT NOT NULL REFERENCES "exam"("id")
);

-- Create indexes
CREATE INDEX "user_username_idx" ON "user"("username");
CREATE INDEX "user_role_idx" ON "user"("role");
CREATE INDEX "exam_userid_idx" ON "exam"("userid");
CREATE INDEX "notification_userid_idx" ON "notification"("userid");
CREATE INDEX "result_userid_idx" ON "result"("userid");
CREATE INDEX "result_examid_idx" ON "result"("examid");
