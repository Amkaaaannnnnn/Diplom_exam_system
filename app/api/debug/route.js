import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

export async function GET(req) {
  try {
    // Get current user
    const user = await getServerUser()

    // Get database info
    const databaseInfo = {
      tables: {
        user: {
          count: await prisma.user.count(),
        },
        exam: {
          count: await prisma.exam.count(),
        },
        question: {
          count: await prisma.question.count(),
        },
        result: {
          count: await prisma.result.count(),
        },
        answer: {
          count: 0, // This table might not exist, so we'll set it to 0
        },
      },
    }

    // Get server info
    const serverInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || "development",
    }

    return NextResponse.json({
      user,
      databaseInfo,
      serverInfo,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

