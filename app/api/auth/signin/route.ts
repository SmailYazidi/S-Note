// ✅ /app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    console.log("Incoming email:", email)
    console.log("Incoming password:", password)

    await connectToDatabase()
    const user = await UserModel.findOne({ email })
    console.log("User from DB:", user)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const sessionId = await createSession(user._id.toString())

    return NextResponse.json({
      message: "Signed in successfully",
      sessionId,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
