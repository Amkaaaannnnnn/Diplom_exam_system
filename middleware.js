import { NextResponse } from "next/server"

export function middleware(request) {
  // Allow all requests
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
