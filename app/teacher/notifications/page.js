"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2 } from "lucide-react"

export default function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) {
          throw new Error("Мэдэгдлүүдийг татахад алдаа гарлаа")
        }
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Мэдэгдлийг уншсанаар тэмдэглэхэд алдаа гарлаа")
      }

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
      alert(`Алдаа гарлаа: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Мэдэгдлийг устгахад алдаа гарлаа")
      }

      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
      alert(`Алдаа гарлаа: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p>Ачаалж байна...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Мэдэгдлүүд</h1>

      {notifications.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Танд одоогоор мэдэгдэл байхгүй байна.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                notification.isRead ? "border-gray-200" : "border-blue-300 bg-blue-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{notification.title}</h2>
                  <p className="text-gray-600 mt-1">{notification.content}</p>
                  <p className="text-gray-400 text-sm mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-600"
                      title="Уншсанаар тэмдэглэх"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Устгах"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
