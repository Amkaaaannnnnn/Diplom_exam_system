import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, username, email, register, className } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username,
        email,
        register,
        className
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        register: true,
        className: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("USER UPDATE ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
