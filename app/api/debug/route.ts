import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: "success",
      message: "API is working",
      databaseConnected: true,
      userCount,
      env: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
        jwtSecret: process.env.JWT_SECRET ? "Set (hidden)" : "Not set",
      },
    })
  } catch (error: any) {
    console.error("Debug API error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "API error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
