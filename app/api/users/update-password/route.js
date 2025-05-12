import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    const passwordMatch = await bcrypt.compare(currentPassword, existingUser.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Хуучин нууц үг буруу байна" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" })
  } catch (error) {
    console.error("Password Update Error:", error)
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 })
  }
}
