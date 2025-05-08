import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Бүх даалгаваруудыг авах
export async function GET(req) {
  try {
    // Одоогийн хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const url = new URL(req.url)
    const className = url.searchParams.get("className")
    const category = url.searchParams.get("category")
    const difficulty = url.searchParams.get("difficulty")
    const type = url.searchParams.get("type")

    // Хайлтын нөхцөл үүсгэх
    const where = {
      isInBank: true,
    }

    // Багш зөвхөн өөрийн даалгавруудыг харах эсвэл админ бол бүх даалгавруудыг харах
    if (currentUser.role === "teacher") {
      where.userId = currentUser.id
    } else if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    // Шүүлтүүр нэмэх
    if (className) {
      where.className = className
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (type) {
      where.type = type
    }

    // Даалгавруудыг татах
    const questions = await prisma.question.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Даалгаваруудыг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Даалгаваруудыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}

// Шинэ даалгавар үүсгэх
export async function POST(req) {
  try {
    // Одоогийн хэрэглэгч багш эсвэл админ эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { text, type, points, options, correctAnswer, className, category, difficulty, isInBank = true } = body

    // Шаардлагатай талбаруудыг шалгах
    if (!text || !type) {
      return NextResponse.json({ error: "Шаардлагатай талбарууд дутуу байна" }, { status: 400 })
    }

    // Даалгавар үүсгэх
    const question = await prisma.question.create({
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
        userId: currentUser.id,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Даалгавар үүсгэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Даалгавар үүсгэх үед алдаа гарлаа" }, { status: 500 })
  }
}

