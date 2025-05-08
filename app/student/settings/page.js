import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function StudentSettings() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Тохиргоо</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Хувийн мэдээлэл</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue="Б"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue="Амгалан"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue={user.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
              <input type="tel" className="w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Хадгалах</button>
        </div>
      </div>
    </div>
  )
}
