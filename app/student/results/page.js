import { ExamResultCard } from "@/components/exam-result-card"

export default async function StudentResultsPage() {
  // Fetch results data
  const results = await fetchResults()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Шалгалтын дүнгүүд</h1>

      {results.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">Танд одоогоор шалгалтын дүн байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <a
              key={result.id}
              href={`/student/results/${result.id}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <ExamResultCard result={result} exam={result.exam} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock function to fetch results
async function fetchResults() {
  // In a real app, you would fetch from your API
  try {
    const response = await fetch("/api/results", { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to fetch results")
    return await response.json()
  } catch (error) {
    console.error("Error fetching results:", error)
    return []
  }
}
