import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { SessionStore } from "@/lib/session-store"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 })
    }

    // Create new user (password will be hashed by the pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
    })

    // Create session
    const sessionId = await SessionStore.createSession(user._id.toString())

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        sessionId,
        user: {
          id: user._id,
          email: user.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
