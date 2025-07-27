import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { SessionStore } from "@/lib/session-store"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save middleware
    })

    // Create session
    const sessionId = await SessionStore.createSession(user._id.toString())

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      sessionId,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
