"use client"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, FileText } from "lucide-react"

export default async function UpcomingExams() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/login")
  }

  // Сурагчийн авах шалгалтуудыг татах
  const upcomingExams = await prisma.examAssignment.findMany({
    where: {
      studentId: user.id,
      status: "assigned",
    },
    include: {
      exam: true,
    },
    orderBy: {
      exam: {
        scheduledDate: "asc",
      },
    },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Авах шалгалтууд</h1>
        <Link
          href="/student/exams"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FileText size={18} className="mr-2" />
          Шалгалт үүсэх
        </Link>
      </div>

      {upcomingExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Авах шалгалт одоогоор байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingExams.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <h2 className="text-xl font-bold mb-1">{assignment.exam.subject}</h2>
                <p className="text-gray-600 mb-4">
                  {assignment.exam.grade}-р анги | {assignment.exam.topic}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm font-medium">Өдөр:</span>
                    <span className="text-sm ml-2">
                      {new Date(assignment.exam.scheduledDate).toISOString().split("T")[0]}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm font-medium">Эхлэх цаг:</span>
                    <span className="text-sm ml-2">
                      {assignment.exam.startTime ? assignment.exam.startTime : "Тодорхойгүй"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm font-medium">Хугацаа:</span>
                    <span className="text-sm ml-2">{assignment.exam.duration || 40} мин</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <FileText size={16} className="mr-2" />
                    <span className="text-sm font-medium">Даалгавар:</span>
                    <span className="text-sm ml-2">{assignment.exam.questionCount || 30}</span>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-200">
                <Link
                  href={`/student/exams/${assignment.examId}`}
                  className="flex-1 px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium"
                >
                  Дэлгэрэнгүй
                </Link>
                <button
                  className="flex-1 px-4 py-3 text-center text-red-600 hover:bg-red-50 font-medium border-l border-gray-200"
                  onClick={() => {
                    // Устгах үйлдэл
                  }}
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
