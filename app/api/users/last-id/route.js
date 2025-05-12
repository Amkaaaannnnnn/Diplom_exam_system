import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req) {
  try {

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    const url = new URL(req.url)
    const role = url.searchParams.get("role") || "student"


    const users = await prisma.user.findMany({
      where: {
        role: role,
      },
      orderBy: {
        username: "desc",
      },
      take: 1,
    })

    if (users.length === 0) {
      return NextResponse.json({ lastId: 0 })
    }


    const username = users[0].username
    const prefix = role === "admin" ? "ADM" : role === "teacher" ? "TCH" : "ST"
    const numericPart = username.replace(prefix, "")
    const lastId = Number.parseInt(numericPart, 10) || 0

    return NextResponse.json({ lastId })
  } catch (error) {
    console.error("Сүүлийн ID-г авахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Сүүлийн ID-г авах үед алдаа гарлаа", lastId: 0 }, { status: 500 })
  }
}
