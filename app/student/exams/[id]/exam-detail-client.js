"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ExamDetailClient({ exam, status, result, examStartTime, examEndTime }) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleStartExam = () => {
    router.push(`/student/exams/${exam.id}/take`)
  }

  const handleViewResult = () => {
    if (result) {
      router.push(`/student/results/${result.id}`)
    }
  }

  if (status === "completed") {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-green-700">Шалгалт өгсөн</h2>
            <p className="text-green-600">Та энэ шалгалтыг өмнө нь өгсөн байна.</p>
            <div className="mt-4">
              <button
                onClick={handleViewResult}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                Дүн харах
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Хичээл: {exam.subject}</p>
            <p className="text-gray-600">Анги: {exam.className || "Тодорхойгүй"}</p>
            <p className="text-gray-600">Нийт оноо: {exam.totalPoints}</p>
          </div>
          <div>
            <p className="text-gray-600">Хугацаа: {exam.duration} минут</p>
            <p className="text-gray-600">
              Огноо: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Тодорхойгүй"}
            </p>
            <p className="text-gray-600">Цаг: {exam.examTime || "Тодорхойгүй"}</p>
          </div>
        </div>

        {status === "active" ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Зааварчилгаа</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Бүх асуултыг анхааралтай уншиж хариулна уу.</li>
                <li>Танд шалгалт өгөх {exam.duration} минутын хугацаа байна.</li>
                <li>Шалгалт эхэлсний дараа цагийг зогсоох боломжгүй.</li>
                <li>Интернэт холболт тогтвортой байгаа эсэхийг шалгана уу.</li>
                <li>Бэлэн болсон үедээ "Шалгалт эхлүүлэх" товчийг дарна уу.</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleStartExam}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Шалгалт эхлүүлэх
              </button>
            </div>
          </>
        ) : status === "expired" ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full text-center">
            <p className="text-red-700 font-medium">Шалгалтын хугацаа дууссан байна.</p>
            <p className="text-red-600 mt-2">
              Энэ шалгалтыг өгөх хугацаа {examEndTime ? examEndTime.toLocaleDateString() : ""}
              {examEndTime ? ` ${examEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""} цагт
              дууссан.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full text-center">
            <p className="text-yellow-700 font-medium">
              Шалгалт {examStartTime ? examStartTime.toLocaleDateString() : ""}
              {examStartTime ? ` ${examStartTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}{" "}
              цагт эхэлнэ.
            </p>
            <p className="text-yellow-600 mt-2">
              Шалгалт эхлэх хүртэл хүлээнэ үү. Шалгалт эхэлсэн үед та оролцох боломжтой болно.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
