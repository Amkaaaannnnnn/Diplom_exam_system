"use client"

import { useState } from "react"
import { Globe, Bell, Shield, Moon, Sun } from "lucide-react"

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState({
    email: true,
    web: true,
    exam: true,
  })

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Тохиргоо</h1>

      <div className="flex mb-6">
        <div className="w-64 mr-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className={`p-3 cursor-pointer ${
                activeTab === "general" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <div className="flex items-center">
                <Globe size={18} className="mr-2" />
                <span>Ерөнхий тохиргоо</span>
              </div>
            </div>
            <div
              className={`p-3 cursor-pointer ${
                activeTab === "notifications" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <div className="flex items-center">
                <Bell size={18} className="mr-2" />
                <span>Мэдэгдлийн тохиргоо</span>
              </div>
            </div>
            <div
              className={`p-3 cursor-pointer ${
                activeTab === "security" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <div className="flex items-center">
                <Shield size={18} className="mr-2" />
                <span>Аюулгүй байдал</span>
              </div>
            </div>
            <div
              className={`p-3 cursor-pointer ${
                activeTab === "appearance" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("appearance")}
            >
              <div className="flex items-center">
                {theme === "light" ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                <span>Харагдац</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === "general" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Ерөнхий тохиргоо</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                      Системийн нэр
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue="Сургуулийн менежментийн систем"
                    />
                  </div>
                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Системийн тайлбар
                    </label>
                    <textarea
                      id="siteDescription"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      defaultValue="Сургуулийн менежментийн систем нь сурагчид, багш нар, удирдлагуудад зориулсан цогц систем юм."
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Холбоо барих и-мэйл
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue="admin@school.edu"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Мэдэгдлийн тохиргоо</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">И-мэйл мэдэгдэл</h3>
                      <p className="text-sm text-gray-500">Шалгалт, даалгаврын талаар и-мэйл мэдэгдэл хүлээн авах</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        className="sr-only"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange("email")}
                      />
                      <label
                        htmlFor="emailNotifications"
                        className={`absolute inset-0 rounded-full cursor-pointer ${
                          notifications.email ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            notifications.email ? "transform translate-x-6" : ""
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Вэб мэдэгдэл</h3>
                      <p className="text-sm text-gray-500">Системд нэвтэрсэн үед мэдэгдэл хүлээн авах</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input
                        type="checkbox"
                        id="webNotifications"
                        className="sr-only"
                        checked={notifications.web}
                        onChange={() => handleNotificationChange("web")}
                      />
                      <label
                        htmlFor="webNotifications"
                        className={`absolute inset-0 rounded-full cursor-pointer ${
                          notifications.web ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            notifications.web ? "transform translate-x-6" : ""
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Шалгалтын мэдэгдэл</h3>
                      <p className="text-sm text-gray-500">Шинэ шалгалт нэмэгдсэн үед мэдэгдэл хүлээн авах</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input
                        type="checkbox"
                        id="examNotifications"
                        className="sr-only"
                        checked={notifications.exam}
                        onChange={() => handleNotificationChange("exam")}
                      />
                      <label
                        htmlFor="examNotifications"
                        className={`absolute inset-0 rounded-full cursor-pointer ${
                          notifications.exam ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            notifications.exam ? "transform translate-x-6" : ""
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Аюулгүй байдал</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Одоогийн нууц үг
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Шинэ нууц үг
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Нууц үг баталгаажуулах
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Хоёр алхамт баталгаажуулалт</h3>
                      <p className="text-sm text-gray-500">Нэвтрэх үед нэмэлт баталгаажуулалт шаардах</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input type="checkbox" id="twoFactor" className="sr-only" />
                      <label htmlFor="twoFactor" className="absolute inset-0 rounded-full cursor-pointer bg-gray-200">
                        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Харагдац</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Загвар</h3>
                    <div className="flex space-x-4">
                      <div
                        className={`border rounded-md p-4 cursor-pointer ${
                          theme === "light" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun size={24} className="mb-2" />
                        <div className="font-medium">Цайвар</div>
                      </div>
                      <div
                        className={`border rounded-md p-4 cursor-pointer ${
                          theme === "dark" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon size={24} className="mb-2" />
                        <div className="font-medium">Бараан</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Өнгө</h3>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                      <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                      <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500 cursor-pointer"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Хадгалах</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
