"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function ExamNotification({ message, type = "success", onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : type === "error"
        ? "bg-red-50 border-red-200"
        : "bg-blue-50 border-blue-200"

  const textColor = type === "success" ? "text-green-800" : type === "error" ? "text-red-800" : "text-blue-800"

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-md border ${bgColor} max-w-md`}>
      <div className="flex items-start">
        <div className={`flex-1 ${textColor}`}>
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
