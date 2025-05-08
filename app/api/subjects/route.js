import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Бүх хичээлүүдийг авах
export async function GET() {
  try {
    // Одоогийн хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Хичээлүүдийг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хичээлүүдийг татах үед алдаа гарлаа" }, { status: 500 })
  }
}

// Шинэ хичээл үүсгэх (зөвхөн админ)
export async function POST(req) {
  try {
    // Одоогийн хэрэглэгч админ эсэхийг шалгах
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    // Шаардлагатай талбаруудыг шалгах
    if (!name) {
      return NextResponse.json({ error: "Хичээлийн нэр оруулна уу" }, { status: 400 })
    }

    // Хичээл давхардсан эсэхийг шалгах
    const existingSubject = await prisma.subject.findUnique({
      where: { name },
    })

    if (existingSubject) {
      return NextResponse.json({ error: "Хичээл бүртгэгдсэн байна" }, { status: 400 })
    }

    // Хичээл үүсгэх
    const subject = await prisma.subject.create({
      data: {
        name,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error("Хичээл үүсгэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хичээл үүсгэх үед алдаа гарлаа" }, { status: 500 })
  }
}
