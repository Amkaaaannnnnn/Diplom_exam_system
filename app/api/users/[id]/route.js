import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth-server"

export async function GET(req, { params }) {
  try {
    console.log("GET /api/users/[id] - Start", new Date().toISOString())

    const { id } = params
    console.log("GET /api/users/[id] - User ID:", id)

    // Get the current user for permission check
    const currentUser = await getServerUser()
    if (!currentUser) {
      console.log("GET /api/users/[id] - No current user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("GET /api/users/[id] - Current user:", currentUser.id, currentUser.role)

    // Check permissions - teachers can view student data, admins can view all data
    const isTeacher = currentUser.role === "teacher"
    const isAdmin = currentUser.role === "admin"
    const isSelf = currentUser.id === id

    if (!isAdmin && !isTeacher && !isSelf) {
      console.log("GET /api/users/[id] - Permission denied")
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        className: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      console.log("GET /api/users/[id] - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("GET /api/users/[id] - User found:", user.id)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: `Failed to fetch user: ${error.message}` }, { status: 500 })
  }
}
