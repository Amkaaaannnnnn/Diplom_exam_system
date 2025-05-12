"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

export default function QuestionForm({ question = null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [subjects, setSubjects] = useState([])

 
  const convertOldTypeToNew = (oldType) => {
    if (oldType === "text" || oldType === "number") {
      return "fill"
    }
    return oldType
  }

  const [formData, setFormData] = useState({
    text: question?.text || "",
    type: question ? convertOldTypeToNew(question.type) : "select",
    points: question?.points || 1,
    options: question?.options || [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ],
    correctAnswer: question?.correctAnswer || "A",
    className: question?.className || "",
    category: question?.category || "",
    subject: question?.subject || "", 
    difficulty: question?.difficulty || "Дунд",
    isInBank: question?.isInBank !== false, 
  })

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects")
        if (response.ok) {
          const data = await response.json()
          setSubjects(data)
        } else {
          console.error("Хичээлүүдийг татахад алдаа гарлаа:", response.status)
        }
      } catch (error) {
        console.error("Хичээлүүдийг татахад алдаа гарлаа:", error)
      }
    }

    fetchSubjects()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "type") {

      let newCorrectAnswer = formData.correctAnswer

      if (value === "select") {
        newCorrectAnswer = formData.options && formData.options.length > 0 ? formData.options[0].id : "A"
      } else if (value === "multiselect") {
        newCorrectAnswer = []
      } else if (value === "fill") {
        newCorrectAnswer = ""
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        correctAnswer: newCorrectAnswer,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index].text = value
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {

    const newId = String.fromCharCode(65 + formData.options.length) // 65 нь "A" код
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "" }],
    }))
  }

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError("Хамгийн багадаа 2 сонголттой байх ёстой")
      return
    }

    const newOptions = formData.options.filter((_, i) => i !== index)


    let newCorrectAnswer = formData.correctAnswer
    const removedId = formData.options[index].id

    if (formData.type === "Нэг сонголттой" && formData.correctAnswer === removedId) {
      newCorrectAnswer = newOptions[0].id
    } else if (formData.type === "Олон сонголттой" && Array.isArray(formData.correctAnswer)) {
      newCorrectAnswer = formData.correctAnswer.filter((id) => id !== removedId)
    }

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")


    if (!formData.text.trim()) {
      setError("Асуулт хоосон байна")
      setIsLoading(false)
      return
    }

    if (
      (formData.type === "select" || formData.type === "multiselect") &&
      formData.options.some((opt) => !opt.text.trim())
    ) {
      setError("Бүх сонголтууд хоосон байж болохгүй")
      setIsLoading(false)
      return
    }

    try {
      const endpoint = question ? `/api/questions/${question.id}` : "/api/questions"
      const method = question ? "PUT" : "POST"


      const apiData = {
        text: formData.text,
        type: formData.type,
        points: Number(formData.points) || 1,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        className: formData.className,
        category: formData.category,
        subject: formData.subject, 
        difficulty: formData.difficulty,
        isInBank: formData.isInBank !== false,
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Асуулт хадгалахад алдаа гарлаа")
      }

      router.push("/teacher/question-bank")
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Асуулт
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Төрөл
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="select">Нэг сонголттой</option>
            <option value="multiselect">Олон сонголттой</option>
            <option value="fill">Нөхөх</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Хичээл
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Сонгоно уу</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
            Анги
          </label>
          <select
            id="className"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Сонгоно уу</option>
            <option value="7">7-р анги</option>
            <option value="8">8-р анги</option>
            <option value="9">9-р анги</option>
            <option value="10">10-р анги</option>
            <option value="11">11-р анги</option>
            <option value="12">12-р анги</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Сэдэв
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Жишээ: Алгебр, Геометр, гэх мэт."
          />
        </div>

        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
            Оноо
          </label>
          <input
            type="number"
            id="points"
            name="points"
            min="1"
            max="100"
            value={formData.points}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Түвшин
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="Хөнгөн">Хөнгөн</option>
            <option value="Дунд">Дунд</option>
            <option value="Хүнд">Хүнд</option>
            <option value="Маш хүнд">Маш хүнд</option>
          </select>
        </div>
      </div>

      {(formData.type === "select" || formData.type === "multiselect") && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Сонголтууд</label>
            <button
              type="button"
              onClick={addOption}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md flex items-center text-sm"
            >
              <Plus size={14} className="mr-1" />
              Сонголт нэмэх
            </button>
          </div>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md">{option.id}</div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder={`Сонголт ${option.id}`}
                  required
                />
                <div className="flex items-center">
                  <input
                    type={formData.type === "select" ? "radio" : "checkbox"}
                    name="correctAnswer"
                    checked={
                      formData.type === "select"
                        ? formData.correctAnswer === option.id
                        : Array.isArray(formData.correctAnswer) && formData.correctAnswer.includes(option.id)
                    }
                    onChange={() => {
                      if (formData.type === "select") {
                        setFormData((prev) => ({ ...prev, correctAnswer: option.id }))
                      } else {
                        const currentAnswers = Array.isArray(formData.correctAnswer) ? formData.correctAnswer : []
                        const newAnswers = currentAnswers.includes(option.id)
                          ? currentAnswers.filter((id) => id !== option.id)
                          : [...currentAnswers, option.id]
                        setFormData((prev) => ({ ...prev, correctAnswer: newAnswers }))
                      }
                    }}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Зөв</label>
                </div>
                <button type="button" onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.type === "fill" && (
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Зөв хариулт (нөхөх)
          </label>
          <input
            type="text"
            id="answer"
            value={formData.correctAnswer || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isInBank"
          name="isInBank"
          checked={formData.isInBank}
          onChange={(e) => setFormData((prev) => ({ ...prev, isInBank: e.target.checked }))}
          className="mr-2"
        />
        <label htmlFor="isInBank" className="text-sm text-gray-700">
          Асуултын санд оруулах
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push("/teacher/question-bank")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Цуцлах
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {isLoading ? "Хадгалж байна..." : question ? "Шинэчлэх" : "Хадгалах"}
        </button>
      </div>
    </form>
  )
}
