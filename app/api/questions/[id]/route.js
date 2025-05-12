import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"


export async function GET(req, { params }) {
  try {
    const { id } = params


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
      return NextResponse.json({ error: "Асуулт олдсонгүй" }, { status: 404 })
    }

    if (currentUser.role === "teacher" && question.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Асуулт татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Асуултыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params


    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Асуулт олдсонгүй" }, { status: 404 })
    }


    if (currentUser.role !== "admin" && existingQuestion.userId !== currentUser.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    const body = await req.json()
    const { text, type, points, options, correctAnswer, className, category, difficulty, isInBank } = body


    if (!text || !type) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

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
    console.error("Асуултыг шинэчлэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Асуултыг шинэчлэх үед алдаа гарлаа" }, { status: 500 })
  }
}


export async function DELETE(req, { params }) {
  try {
    const { id } = params

    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Асуулт олдсонгүй" }, { status: 404 })
    }

    if (currentUser.role !== "admin" && existingQuestion.userId !== currentUser.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    // ✅ Шалгалтад орсон эсэхийг шалгах
    const isUsedInExam = await prisma.examQuestion.findFirst({
      where: {
        questionId: id,
      },
    })

    if (isUsedInExam) {
      return NextResponse.json(
        { error: "Энэ асуулт аль хэдийн шалгалтад орсон тул устгах боломжгүй." },
        { status: 400 }
      )
    }

    await prisma.question.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Асуултыг устгахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Асуулт устгах үед алдаа гарлаа" }, { status: 500 })
  }
}
