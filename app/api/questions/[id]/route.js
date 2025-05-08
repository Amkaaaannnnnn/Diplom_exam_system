import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Тодорхой даалгаврыг авах
export async function GET(req, { params }) {
  try {
    const { id } = params

    // Одоогийн хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    if (!question) {
      return NextResponse.json({ error: "Даалгавар олдсонгүй" }, { status: 404 })
    }

    // Багш зөвхөн өөрийн даалгаврыг харах эсвэл админ бол бүх даалгаврыг харах
    if (currentUser.role === "teacher" && question.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Даалгаврыг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Даалгаварыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}

// Даалгаврыг шинэчлэх
export async function PUT(req, { params }) {
  try {
    const { id } = params

    // Одоогийн хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Даалгавар олдсонгүй" }, { status: 404 })
    }

    // Багш зөвхөн өөрийн даалгаврыг засах эсвэл админ бол бүх даалгаврыг засах
    if (currentUser.role !== "admin" && existingQuestion.userId !== currentUser.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    const body = await req.json()
    const { text, type, points, options, correctAnswer, className, category, difficulty, isInBank } = body

    // Шаардлагатай талбаруудыг шалгах
    if (!text || !type) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

    // Даалгаврыг шинэчлэх
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        points: points || 1,
        options,
        correctAnswer,
        className,
        category,
        difficulty,
        isInBank,
      },
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Даалгаврыг шинэчлэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Даалгаврыг шинэчлэх үед алдаа гарлаа" }, { status: 500 })
  }
}

// Даалгаврыг устгах
export async function DELETE(req, { params }) {
  try {
    const { id } = params

    // Одоогийн хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Даалгавар олдсонгүй" }, { status: 404 })
    }

    // Багш зөвхөн өөрийн даалгаврыг устгах эсвэл админ бол бүх даалгаврыг устгах
    if (currentUser.role !== "admin" && existingQuestion.userId !== currentUser.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    // Даалгаврыг устгах
    await prisma.question.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Даалгаврыг устгахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Даалгаврыг устгах үед алдаа гарлаа" }, { status: 500 })
  }
}
