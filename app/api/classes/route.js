import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"


export async function GET() {
  try {

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 })
    }

    // Ангиудыг сурагчдын className-ээс авах
    const classes = await prisma.user.groupBy({
      by: ["className"],
      where: {
        role: "student",
        className: {
          not: null,
        },
      },
      orderBy: {
        className: "asc",
      },
    })


    const formattedClasses = classes.map((cls) => ({
      id: cls.className,
      name: cls.className,
    }))

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error("Ангиудыг татахад алдаа гарлаа:", error)
    return NextResponse.json({ error: "Ангиудыг татах үед алдаа гарлаа" }, { status: 500 })
  }
}
