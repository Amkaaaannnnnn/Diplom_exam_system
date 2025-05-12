"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ExamDetailClient({ exam, status, result, examStartTime, examEndTime }) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Calculate time left if exam is upcoming
      if (status === "upcoming" && examStartTime) {
        const diff = examStartTime - new Date()
        if (diff <= 0) {
          // Refresh the page if exam has started
          window.location.reload()
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        let timeLeftText = ""
        if (days > 0) timeLeftText += `${days} өдөр `
        if (hours > 0) timeLeftText += `${hours} цаг `
        timeLeftText += `${minutes} минут`

        setTimeLeft(timeLeftText)
      }
    }, 60000)

    // Initial calculation
    if (status === "upcoming" && examStartTime) {
      const diff = examStartTime - new Date()
      if (diff <= 0) {
        window.location.reload()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      let timeLeftText = ""
      if (days > 0) timeLeftText += `${days} өдөр `
      if (hours > 0) timeLeftText += `${hours} цаг `
      timeLeftText += `${minutes} минут`

      setTimeLeft(timeLeftText)
    }

    return () => clearInterval(timer)
  }, [status, examStartTime])

  const handleStartExam = () => {
    router.push(`/student/exams/${exam.id}/take`)
  }

  const handleViewResult = () => {
    if (result) {
      router.push(`/student/results/${result.id}`)
    }
  }

  // Safety check for exam object
  if (!exam) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Алдаа!</strong>
          <span className="block sm:inline"> Шалгалтын мэдээлэл олдсонгүй.</span>
        </div>
        <div className="mt-4">
          <Link href="/student/exams" className="text-blue-600 hover:text-blue-800">
            Шалгалтууд руу буцах
          </Link>
        </div>
      </div>
    )
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

  // Safely access examQuestions
  const examQuestions = exam.examQuestions || []

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Хичээл: {exam.subject}</p>
            <p className="text-gray-600">Анги: {exam.className || "Тодорхойгүй"}</p>
            <p className="text-gray-600">Нийт оноо: {exam.totalPoints}</p>
            <p className="text-gray-600">Асуултын тоо: {examQuestions.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Хугацаа: {exam.duration} минут</p>
            <p className="text-gray-600">
              Огноо: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Тодорхойгүй"}
            </p>
            <p className="text-gray-600">Цаг: {exam.examTime || "Тодорхойгүй"}</p>
            <p className="text-gray-600">Багш: {exam.user?.name || "Тодорхойгүй"}</p>
          </div>
        </div>

        {exam.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Тайлбар</h2>
            <p className="text-gray-700">{exam.description}</p>
          </div>
        )}

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

            {examQuestions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Асуултын жагсаалт</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 mb-2">Энэ шалгалт нийт {examQuestions.length} асуулттай.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examQuestions.map((eq, index) => (
                      <div key={eq.question?.id || index} className="border border-gray-200 rounded p-3 bg-white">
                        <p className="font-medium">Асуулт {index + 1}</p>
                        <p className="text-sm text-gray-600">Оноо: {eq.question?.points || 1}</p>
                        <p className="text-sm text-gray-600">
                          Төрөл:{" "}
                          {eq.question?.type === "MULTIPLE_CHOICE"
                            ? "Сонголттой"
                            : eq.question?.type === "TRUE_FALSE"
                              ? "Үнэн/Худал"
                              : eq.question?.type === "SHORT_ANSWER"
                                ? "Богино хариулт"
                                : "Бусад"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
              {timeLeft ? `Шалгалт эхлэх хүртэл ${timeLeft} үлдлээ.` : "Шалгалт эхлэх хүртэл хүлээнэ үү."}
            </p>

            {examQuestions.length > 0 && (
              <div className="mt-6 text-left">
                <h2 className="text-lg font-semibold mb-2">Асуултын жагсаалт</h2>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 mb-2">Энэ шалгалт нийт {examQuestions.length} асуулттай.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examQuestions.map((eq, index) => (
                      <div key={eq.question?.id || index} className="border border-gray-200 rounded p-3 bg-white">
                        <p className="font-medium">Асуулт {index + 1}</p>
                        <p className="text-sm text-gray-600">Оноо: {eq.question?.points || 1}</p>
                        <p className="text-sm text-gray-600">
                          Төрөл:{" "}
                          {eq.question?.type === "MULTIPLE_CHOICE"
                            ? "Сонголттой"
                            : eq.question?.type === "TRUE_FALSE"
                              ? "Үнэн/Худал"
                              : eq.question?.type === "SHORT_ANSWER"
                                ? "Богино хариулт"
                                : "Бусад"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
