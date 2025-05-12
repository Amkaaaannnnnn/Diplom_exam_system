import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("GET /api/me - Start", new Date().toISOString())

    const user = await getServerUser()

    if (!user) {
      console.log("GET /api/me - No user found")
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
    }

    console.log("GET /api/me - User found:", user.id, user.role)

    // Get the full user data from the database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        className: true,
        createdAt: true,
      },
    })

    if (!userData) {
      console.log("GET /api/me - User not found in database")
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })
    }

    console.log("GET /api/me - User data retrieved successfully")
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ error: "Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа" }, { status: 500 })
  }
}
