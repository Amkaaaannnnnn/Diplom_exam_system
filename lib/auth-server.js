import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

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

    console.log("Verifying JWT with secret:", JWT_SECRET.substring(0, 3) + "...")

    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("JWT verified successfully:", decoded)
    return decoded
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

export async function getServerSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.log("No token found in cookies")
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      console.log("Invalid token")
      return null
    }

    return payload
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export async function getServerUser() {
  try {
    const session = await getServerSession()
    if (!session || !session.id) {
      console.log("No valid session")
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      console.log("User not found")
      return null
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
