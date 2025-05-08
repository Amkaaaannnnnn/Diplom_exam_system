import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Сургуулийн менежментийн систем</h1>
        <p className="mb-8 text-gray-600">
          Сургуулийн менежментийн системд тавтай морил. Үргэлжлүүлэхийн тулд нэвтэрнэ үү.
        </p>
        <Link
          href="/login"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline block w-full text-center"
        >
          Нэвтрэх
        </Link>
      </div>
    </div>
  )
}
