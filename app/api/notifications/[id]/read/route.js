import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req, { params }) {
  try {
    const notificationId = params.id

    // Get the current user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Check if the user is authorized to update this notification
    if (notification.userId !== currentUser.id) {
      return NextResponse.json({ error: "Not authorized to update this notification" }, { status: 403 })
    }

    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "An error occurred while marking the notification as read" }, { status: 500 })
  }
}
