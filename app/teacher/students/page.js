import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentsList() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher") {
    redirect("/login")
  }


  const students = await prisma.user.findMany({
    where: {
      role: "student",
    },
    orderBy: {
      name: "asc",
    },
  })


  const studentsByClass = {}
  students.forEach((student) => {
    if (!studentsByClass[student.className]) {
      studentsByClass[student.className] = []
    }
    studentsByClass[student.className].push(student)
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Сурагчид</h1>
      </div>

      {Object.keys(studentsByClass)
        .sort()
        .map((className) => (
          <div key={className} className="mb-8">
            <h2 className="text-xl font-medium mb-4">{className || "Анги тодорхойгүй"}</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Нэр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Нэвтрэх нэр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      И-мэйл
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsByClass[className].map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/teacher/students/${student.id}`} className="hover:text-blue-600">
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.status === "ACTIVE" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Идэвхтэй</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Идэвхгүй</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  )
}
