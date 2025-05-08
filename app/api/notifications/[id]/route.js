import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req, { params }) {
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

    // Check if the user is authorized to view this notification
    if (notification.userId !== currentUser.id) {
      return NextResponse.json({ error: "Not authorized to view this notification" }, { status: 403 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json({ error: "An error occurred while fetching the notification" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
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

    // Check if the user is authorized to delete this notification
    if (notification.userId !== currentUser.id) {
      return NextResponse.json({ error: "Not authorized to delete this notification" }, { status: 403 })
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "An error occurred while deleting the notification" }, { status: 500 })
  }
}
