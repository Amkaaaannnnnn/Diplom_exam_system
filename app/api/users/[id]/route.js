import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Тодорхой хэрэглэгчийг авах
export async function GET(req, { params }) {
  try {
    const { id } = params

    // Одоогийн хэрэглэгч админ эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })
    }

    // Нууц үгийг хариултаас хасах
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Хэрэглэгчийг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хэрэглэгчийг татах үед алдаа гарлаа" }, { status: 500 })
  }
}

// Хэрэглэгчийг шинэчлэх
export async function PUT(req, { params }) {
  try {
    const { id } = params

    // Одоогийн хэрэглэгч админ эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { name, username, email, register, role, className, subject, password, status } = body

    // Шаардлагатай талбаруудыг шалгах
    if (!name || !username || !email || !role || !status) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

    // Нэвтрэх нэр давхардсан эсэхийг шалгах (хэрэв өөрчлөгдсөн бол)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        id: { not: id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Нэвтрэх нэр давхардсан байна" }, { status: 400 })
    }

    // Шинэчлэх өгөгдлийг бэлтгэх
    const updateData = {
      name,
      username,
      email,
      register,
      role,
      className,
      subject,
      status,
    }


    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }


    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    })


    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Хэрэглэгчийг шинэчлэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хэрэглэгчийг шинэчлэх үед алдаа гарл��а" }, { status: 500 })
  }
}

// Хэрэглэгчийг устгах
export async function DELETE(req, { params }) {
  try {
    const { id } = params


    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }


    if (id === currentUser.id) {
      return NextResponse.json({ error: "Өөрийн бүртгэлийг устгах боломжгүй" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Хэрэглэгчийг устгахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хэрэглэгчийг устгах үед алдаа гарлаа" }, { status: 500 })
  }
}
