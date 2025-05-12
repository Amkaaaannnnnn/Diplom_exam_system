"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Search } from "lucide-react"

export default function ExamForm({ exam = null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [detailedError, setDetailedError] = useState("")
  const [bankQuestions, setBankQuestions] = useState([])
  const [showQuestionBank, setShowQuestionBank] = useState(false)
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([])
  const [filterClass, setFilterClass] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubject, setFilterSubject] = useState("")

  // Transform exam questions from examQuestions relation if needed
  const getQuestionsFromExam = (examData) => {
    if (!examData) return []

    // If the exam has examQuestions relation, extract the questions
    if (examData.examQuestions && Array.isArray(examData.examQuestions)) {
      return examData.examQuestions.map((eq) => eq.question)
    }

    // If the exam has direct questions array, use that
    if (examData.questions && Array.isArray(examData.questions)) {
      return examData.questions
    }

    return []
  }

  const [formData, setFormData] = useState({
    title: exam?.title || "",
    description: exam?.description || "",
    subject: exam?.subject || "",
    className: exam?.className || "",
    duration: exam?.duration || 30,
    totalPoints: exam?.totalPoints || 100,
    examDate: exam?.examDate ? new Date(exam.examDate).toISOString().split("T")[0] : "",
    examTime: exam?.examTime || "09:00",
    questions: getQuestionsFromExam(exam) || [],
  })

  // Хичээлүүдийг татах
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

    // Ангиудыг татах
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes")
        if (response.ok) {
          const data = await response.json()
          setClasses(data)
        } else {
          console.error("Ангиудыг татахад алдаа гарлаа:", response.status)
        }
      } catch (error) {
        console.error("Ангиудыг татахад алдаа гарлаа:", error)
      }
    }

    fetchSubjects()
    fetchClasses()
  }, [])

  // Даалгаварын сангаас даалгаврууд татах
  useEffect(() => {
    if (showQuestionBank) {
      const fetchQuestions = async () => {
        try {
          let url = "/api/questions"
          const params = new URLSearchParams()

          if (filterClass) {
            params.append("className", filterClass)
          }

          if (filterCategory) {
            params.append("category", filterCategory)
          }

          if (filterSubject) {
            params.append("subject", filterSubject)
          }

          if (params.toString()) {
            url += `?${params.toString()}`
          }

          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            setBankQuestions(data)
          } else {
            console.error("Даалгавруудыг татахад алдаа гарлаа:", response.status)
          }
        } catch (error) {
          console.error("Даалгавруудыг татахад алдаа гарлаа:", error)
        }
      }

      fetchQuestions()
    }
  }, [showQuestionBank, filterClass, filterCategory, filterSubject])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDetailedError("")

    try {
      const endpoint = exam ? `/api/exams/${exam.id}` : "/api/exams"
      const method = exam ? "PUT" : "POST"

      // Шалгалтын мэдээллийг бэлтгэх
      const examData = {
        ...formData,
        // Даалгавруудыг зөв форматтай болгох
        questions: formData.questions.map((q) => ({
          id: q.id,
          text: q.text || "",
          type: q.type || "select",
          points: Number(q.points) || 1,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          className: q.className || formData.className, // Ангийг шалгалтаас авах
          category: q.category || "", // Сэдвийг хадгалах
          // We'll still send subject even if it's not in the schema
          subject: q.subject || formData.subject, // Хичээлийг шалгалтаас авах
        })),
      }

      console.log("Sending data:", JSON.stringify(examData))

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      })

      // API хариуг авах
      let data
      try {
        const responseText = await response.text()
        try {
          data = JSON.parse(responseText)
        } catch (jsonError) {
          console.error("JSON боловсруулахад алдаа гарлаа:", jsonError)
          console.error("API буцаасан хариу:", responseText)
          setDetailedError(`API буцаасан хариу JSON биш байна: ${responseText}`)
          throw new Error("API буцаасан хариу JSON биш байна")
        }
      } catch (textError) {
        console.error("Хариу текст авахад алдаа гарлаа:", textError)
        throw new Error("API хариу авахад алдаа гарлаа")
      }

      if (!response.ok) {
        console.error("API алдааны хариу:", data)
        if (data && data.error) {
          setDetailedError(data.details || "Дэлгэрэнгүй мэдээлэл байхгүй")
          throw new Error(data.error)
        }
        throw new Error("Шалгалт үүсгэх үед алдаа гарлаа")
      }

      // Амжилттай үүссэн бол шалгалтын жагсаалт руу буцах
      router.push("/teacher/exams")
      router.refresh()
    } catch (err) {
      console.error("Форм илгээхэд алдаа гарлаа:", err)
      setError(err.message || "Шалгалт үүсгэх үед алдаа гарлаа")
    } finally {
      setIsLoading(false)
    }
  }

  // Даалгавар нэмэх
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(), // Түр ID
      text: "",
      type: "select",
      points: 1,
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctAnswer: "A",
      className: formData.className, // Шалгалтын ангийг авах
      subject: formData.subject, // Шалгалтын хичээлийг авах
      category: "", // Сэдэв хоосон эхлэх
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  // Даалгавар устгах
  const removeQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
  }

  // Даалгаврын мэдээллийг шинэчлэх
  const updateQuestion = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId) {
          // Хэрэв төрөл өөрчлөгдсөн бол зөв хариултыг дахин тохируулах
          if (field === "type") {
            let newCorrectAnswer = q.correctAnswer

            if (value === "select") {
              newCorrectAnswer = q.options && q.options.length > 0 ? q.options[0].id : "A"
            } else if (value === "multiselect") {
              newCorrectAnswer = []
            } else if (value === "fill") {
              newCorrectAnswer = ""
            }

            return { ...q, [field]: value, correctAnswer: newCorrectAnswer }
          }

          return { ...q, [field]: value }
        }
        return q
      }),
    }))
  }

  // Сонголтын мэдээллийг шинэчлэх
  const updateOption = (questionId, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex].text = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    }))
  }

  // Даалгаварын санг харуулах/нуух
  const toggleQuestionBank = () => {
    setShowQuestionBank(!showQuestionBank)
    // Шалгалтын хичээл, ангийг шүүлтүүрт оноох
    if (!showQuestionBank) {
      setFilterClass(formData.className)
      setFilterSubject(formData.subject)
    }
  }

  // Даалгаварын сангаас даалгавар сонгох
  const toggleSelectBankQuestion = (question) => {
    if (selectedBankQuestions.some((q) => q.id === question.id)) {
      setSelectedBankQuestions(selectedBankQuestions.filter((q) => q.id !== question.id))
    } else {
      setSelectedBankQuestions([...selectedBankQuestions, question])
    }
  }

  // Сонгосон даалгавруудыг шалгалтад нэмэх
  const addSelectedQuestionsToExam = () => {
    const newQuestions = selectedBankQuestions.map((q) => {
      // Хуучин төрлүүдийг шинэ төрлүүдэд хөрвүүлэх
      let newType = q.type
      if (q.type === "text" || q.type === "number") {
        newType = "fill"
      }

      return {
        id: q.id,
        text: q.text,
        type: newType,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
        className: q.className || formData.className, // Ангийг хадгалах
        category: q.category || "", // Сэдвийг хадгалах
        subject: q.subject || formData.subject, // Хичээлийг хадгалах
      }
    })

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ...newQuestions],
    }))

    setSelectedBankQuestions([])
    setShowQuestionBank(false)
  }

  // Төрлийн нэрийг Монгол хэлээр харуулах
  const getTypeDisplayName = (type) => {
    switch (type) {
      case "select":
        return "Нэг сонголттой"
      case "multiselect":
        return "Олон сонголттой"
      case "fill":
        return "Нөхөх"
      case "text":
        return "Текст (Нөхөх)"
      case "number":
        return "Тоон (Нөхөх)"
      default:
        return type
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {detailedError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Дэлгэрэнгүй алдаа:</p>
          <p>{detailedError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Шалгалтын нэр
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
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
            required
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
            required
          >
            <option value="">Сонгоно уу</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Үргэлжлэх хугацаа (минут)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">
            Нийт оноо
          </label>
          <input
            type="number"
            id="totalPoints"
            name="totalPoints"
            value={formData.totalPoints}
            onChange={handleChange}
            min="1"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-1">
            Шалгалтын огноо
          </label>
          <input
            type="date"
            id="examDate"
            name="examDate"
            value={formData.examDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 mb-1">
            Шалгалтын цаг
          </label>
          <input
            type="time"
            id="examTime"
            name="examTime"
            value={formData.examTime}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Тайлбар
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          ></textarea>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Даалгаврууд</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={toggleQuestionBank}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Search size={18} className="mr-1" />
              Даалгаврын сангаас сонгох
            </button>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Даалгавар нэмэх
            </button>
          </div>
        </div>

        {showQuestionBank && (
          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Даалгаврын сан</h3>

            <div className="mb-4 flex flex-wrap gap-4">
              <div className="w-60">
                <label htmlFor="bankClassFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Анги
                </label>
                <select
                  id="bankClassFilter"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Бүгд</option>
                  <option value="7">7-р анги</option>
                  <option value="8">8-р анги</option>
                  <option value="9">9-р анги</option>
                  <option value="10">10-р анги</option>
                  <option value="11">11-р анги</option>
                  <option value="12">12-р анги</option>
                </select>
              </div>

              <div className="w-60">
                <label htmlFor="bankSubjectFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Хичээл
                </label>
                <select
                  id="bankSubjectFilter"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Бүгд</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-60">
                <label htmlFor="bankCategoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Сэдэв
                </label>
                <input
                  type="text"
                  id="bankCategoryFilter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Сэдэв хайх"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-10 px-3 py-2"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Даалгавар
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Анги
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сэдэв
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Төрөл
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оноо
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bankQuestions.length > 0 ? (
                    bankQuestions.map((question) => (
                      <tr
                        key={question.id}
                        className={
                          selectedBankQuestions.some((q) => q.id === question.id) ? "bg-blue-50" : "hover:bg-gray-50"
                        }
                        onClick={() => toggleSelectBankQuestion(question)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedBankQuestions.some((q) => q.id === question.id)}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm">{question.text}</td>
                        <td className="px-3 py-2 text-sm">{question.className || "-"}</td>
                        <td className="px-3 py-2 text-sm">{question.category || "-"}</td>
                        <td className="px-3 py-2 text-sm">{getTypeDisplayName(question.type)}</td>
                        <td className="px-3 py-2 text-sm">{question.points}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-center text-sm text-gray-500">
                        Даалгавар олдсонгүй
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={addSelectedQuestionsToExam}
                disabled={selectedBankQuestions.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {selectedBankQuestions.length} даалгавар нэмэх
              </button>
            </div>
          </div>
        )}

        {formData.questions.length > 0 ? (
          <div className="space-y-6">
            {formData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Даалгавар #{index + 1} ({question.points} оноо)
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Даалгаврын текст</label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                      rows="2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="select">Нэг сонголттой</option>
                        <option value="multiselect">Олон сонголттой</option>
                        <option value="fill">Нөхөх</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Оноо</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, "points", Number(e.target.value))}
                        min="1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Сэдэв</label>
                      <input
                        type="text"
                        value={question.category || ""}
                        onChange={(e) => updateQuestion(question.id, "category", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Сэдэв оруулах"
                      />
                    </div>
                  </div>

                  {(question.type === "select" || question.type === "multiselect") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Сонголтууд</label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md">
                              {option.id}
                            </div>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                              placeholder={`Сонголт ${option.id}`}
                              required
                            />
                            <div className="flex items-center">
                              <input
                                type={question.type === "select" ? "radio" : "checkbox"}
                                name={`correctAnswer_${question.id}` ? "radio" : "checkbox"}
                                
                                checked={
                                  question.type === "select"
                                    ? question.correctAnswer === option.id
                                    : Array.isArray(question.correctAnswer) &&
                                      question.correctAnswer.includes(option.id)
                                }
                                onChange={() => {
                                  if (question.type === "select") {
                                    updateQuestion(question.id, "correctAnswer", option.id)
                                  } else {
                                    const currentAnswers = Array.isArray(question.correctAnswer)
                                      ? question.correctAnswer
                                      : []
                                    const newAnswers = currentAnswers.includes(option.id)
                                      ? currentAnswers.filter((id) => id !== option.id)
                                      : [...currentAnswers, option.id]
                                    updateQuestion(question.id, "correctAnswer", newAnswers)
                                  }
                                }}
                                className="mr-2"
                              />
                              <label className="text-sm text-gray-700">Зөв</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === "fill" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Зөв хариулт (нөхөх)</label>
                      <input
                        type="text"
                        value={question.correctAnswer || ""}
                        onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Даалгавар байхгүй байна. Даалгавар нэмнэ үү.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push("/teacher/exams")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Цуцлах
        </button>
        <button
          type="submit"
          disabled={isLoading || formData.questions.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isLoading ? "Хадгалж байна..." : exam ? "Шинэчлэх" : "Хадгалах"}
        </button>
      </div>
    </form>
  )
}
