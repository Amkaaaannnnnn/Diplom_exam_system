import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"


export async function POST(req) {
  try {
 
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { name, username, email, register, role, className, subject, password, status } = body


    if (!name || !username || !email || !password || !role || !status) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }


    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Нэвтрэх нэр давхардсан байна" }, { status: 400 })
    }


    const hashedPassword = await bcrypt.hash(password, 10)


    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        register,
        role,
        className,
        subject,
        password: hashedPassword,
        status,
      },
    })


    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Хэрэглэгч үүсгэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хэрэглэгч үүсгэх үед алдаа гарлаа" }, { status: 500 })
  }
}


export async function GET(req) {
  try {

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })


    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    console.error("Хэрэглэгчдийг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хэрэглэгчдийг татах үед алдаа гарлаа" }, { status: 500 })
  }
}
