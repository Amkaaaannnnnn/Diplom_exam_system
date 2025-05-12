"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExamNotification } from "@/components/exam-notification"

export default function ExamTakingClient({ exam, examEndTime }) {
  const router = useRouter()
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExamFinished, setIsExamFinished] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!examEndTime) return

    const intervalId = setInterval(() => {
      const timeLeft = calculateTimeLeft()
      setTimeLeft(timeLeft)

      if (timeLeft.total <= 0) {
        setIsExamFinished(true)
        handleSubmit()
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [examEndTime])

  function calculateTimeLeft() {
    if (!examEndTime) return {}

    const difference = new Date(examEndTime).getTime() - new Date().getTime()

    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (isExamFinished) {
      setNotification({
        message: "Шалгалт дууссан. Хариултууд автоматаар илгээгдсэн.",
        type: "success",
      })
    } else {
      setNotification({
        message: "Шалгалтыг илгээж байна...",
        type: "info",
      })
    }

    try {
      const response = await fetch(`/api/exams/${exam.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      const data = await response.json()

      if (!response.ok) {
        setNotification({
          message: data.error || "Шалгалт илгээхэд алдаа гарлаа",
          type: "error",
        })
        return
      }

      setNotification({
        message: data.message || "Шалгалт амжилттай илгээгдлээ",
        type: "success",
      })

      setTimeout(() => {
        router.push(`/student/results/${data.resultId}`)
      }, 2000)
    } catch (error) {
      setNotification({
        message: error.message || "Шалгалт илгээхэд алдаа гарлаа",
        type: "error",
      })
    }
  }

  return (
    <div className="p-6">
      {notification && (
        <ExamNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
      <p className="text-gray-600 mb-4">Хичээл: {exam.subject}</p>
      <p className="text-gray-600 mb-4">
        Үлдсэн хугацаа: {timeLeft.minutes}:{timeLeft.seconds}
      </p>

      {exam.questions.map((question) => (
        <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-md">
          <h2 className="text-lg font-semibold mb-2">{question.text}</h2>
          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-2"
                  />
                  {option.text}
                </label>
              ))}
            </div>
          )}
          {question.type === "fill" && (
            <input
              type="text"
              name={question.id}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={isExamFinished}
      >
        {isExamFinished ? "Шалгалт дууссан" : "Шалгалт илгээх"}
      </button>
    </div>
  )
}
