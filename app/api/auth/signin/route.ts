import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import { createSession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find user by email
    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Compare password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionId = await createSession(user._id.toString(), user.email)

    return NextResponse.json({
      message: "Sign in successful",
      sessionId,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
