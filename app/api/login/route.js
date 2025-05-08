import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signJWT } from "@/lib/auth"

// Make sure this is exported as a named function
export async function POST(req) {
  try {
    console.log("Login API called")

    // Parse the request body as JSON
    const body = await req.json().catch((err) => {
      console.error("Error parsing request body:", err)
      return null
    })

    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { username, password } = body

    console.log("Login attempt:", { username }) // Log the login attempt

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user
      .findUnique({
        where: { username },
      })
      .catch((err) => {
        console.error("Database error when finding user:", err)
        return null
      })

    console.log("User found:", user ? "Yes" : "No") // Log if user was found

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password).catch((err) => {
      console.error("Error comparing passwords:", err)
      return false
    })

    console.log("Password valid:", isPasswordValid) // Log if password is valid

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Your account is inactive" }, { status: 403 })
    }

    // Create session
    const session = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }

    // Sign JWT
    const token = await signJWT(session).catch((err) => {
      console.error("Error signing JWT:", err)
      return null
    })

    if (!token) {
      return NextResponse.json({ error: "Error creating authentication token" }, { status: 500 })
    }

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "An error occurred during login",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
