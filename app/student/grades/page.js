import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function StudentGrades() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch results for this student
  const results = await prisma.result.findMany({
    where: {
      userId: user.id,
    },
    include: {
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Дүнгийн тайлан</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm font-medium">1</span>
            </div>
            <span className="text-gray-600 text-sm">Нийт шалгалт</span>
          </div>
          <div className="text-2xl font-bold">1</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-600 text-sm font-medium">%</span>
            </div>
            <span className="text-gray-600 text-sm">Дундаж оноо</span>
          </div>
          <div className="text-2xl font-bold">17%</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-sm font-medium">%</span>
            </div>
            <span className="text-gray-600 text-sm">Хамгийн өндөр</span>
          </div>
          <div className="text-2xl font-bold">17%</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm font-medium">%</span>
            </div>
            <span className="text-gray-600 text-sm">Хамгийн бага</span>
          </div>
          <div className="text-2xl font-bold">17%</div>
        </div>
      </div>

      <div className="flex mb-4 gap-4">
        <div className="w-1/2">
          <select className="border border-gray-300 rounded-md px-3 py-2 w-40">
            <option>Бүгд</option>
          </select>
        </div>
        <div className="w-1/2">
          <select className="border border-gray-300 rounded-md px-3 py-2 w-40">
            <option>Бүгд</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хичээл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Шалгалтын нэр
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төрөл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оноо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хувь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Үнэлгээ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дэлгэрэнгүй
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Математик</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2-р улирлын шалгалт</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Алгебр</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-17</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5/15</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "17%" }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">17%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  F
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Харах</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
