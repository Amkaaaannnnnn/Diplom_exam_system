import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req) {
  try {
    // Check if the current user is an admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    // Define the subjects to add
    const subjectsToAdd = [
      { name: "Математик" },
      { name: "Физик" },
      { name: "Хими" },
      { name: "Биологи" },
      { name: "Англи хэл" },
      { name: "Монгол хэл" },
      { name: "Түүх" },
      { name: "Газар зүй" },
      { name: "Мэдээлэл зүй" },
    ]

    // Add each subject if it doesn't exist
    const results = []
    for (const subject of subjectsToAdd) {
      const existingSubject = await prisma.subject.findUnique({
        where: { name: subject.name },
      })

      if (!existingSubject) {
        const newSubject = await prisma.subject.create({
          data: subject,
        })
        results.push({ ...newSubject, status: "created" })
      } else {
        results.push({ ...existingSubject, status: "already_exists" })
      }
    }

    return NextResponse.json({
      message: "Хичээлүүд амжилттай нэмэгдлээ",
      subjects: results,
    })
  } catch (error) {
    console.error("Хичээл нэмэхэд алдаа гарлаа:", error)
    return NextResponse.json({ error: "Хичээл нэмэх үед алдаа гарлаа" }, { status: 500 })
  }
}
