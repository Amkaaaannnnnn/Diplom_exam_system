"use server"

import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

// Make sure we have a valid JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change"

export async function signJWT(payload) {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined")
    }
    const token = jwt.sign(payload, JWT_SECRET)
    return token
  } catch (error) {
    console.error("Error signing JWT:", error)
    throw error
  }
}

export async function verifyJWT(token) {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined")
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

export async function getSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    return payload
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
    if (!session || !session.id) return null

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) return null

    // Don't return the password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Энэ функц API Route-д ашиглахаар зорилготой тул cookies() объектийг params-аар авна
export async function verifyAuth(requestCookies) {
  try {
    let token

    // Check if requestCookies is from Next.js Request object
    if (requestCookies.get) {
      token = requestCookies.get("token")?.value
    }
    // Check if requestCookies is from normal cookie object
    else if (requestCookies.token) {
      token = requestCookies.token
    }

    if (!token) {
      return { success: false, error: "Missing token" }
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return { success: false, error: "Invalid token" }
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error verifying auth:", error)
    return { success: false, error: "Error verifying token" }
  }
}
