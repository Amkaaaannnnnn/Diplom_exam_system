import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"


export async function GET(req) {
  try {

    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id
    const userRole = decoded.role

    // Багш эсвэл админ эсэхийг шалгах
    if (userRole !== "teacher" && userRole !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 })
    }

    console.log("Асуултын сангийн өгөгдлийг татаж байна...", { userId })

    // Багшийн даалгаваруудыг татах
    const questions = await prisma.question.findMany({
      where: {
        userId: userId,
        isInBank: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`${questions.length} асуулт олдлоо`)

 
    const allClasses = ["7", "8", "9", "10", "11", "12"]


    const categories = await prisma.question.findMany({
      where: {
        userId: userId,
        isInBank: true,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    })

    const allCategories = categories.map((item) => item.category).filter(Boolean)


    const allDifficulties = ["Хөнгөн", "Дунд", "Хүнд", "Маш хүнд"]

    // Бүх төрлүүдийг авах
    const allTypes = [
      { id: "select", name: "Нэг сонголттой" },
      { id: "multiselect", name: "Олон сонголттой" },
      { id: "fill", name: "Нөхөх" },
    ]

    return NextResponse.json({
      questions,
      allClasses,
      allCategories,
      allDifficulties,
      allTypes,
    })
  } catch (error) {
    console.error("Асуултыг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Асуултыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}
