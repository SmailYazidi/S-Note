import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import { createSession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user (password will be hashed by the pre-save hook in the User model)
    const newUser = new UserModel({
      name,
      email,
      password, // This will be hashed automatically by the User model
    })

    await newUser.save()

    // Create session for the new user
    const sessionId = await createSession(newUser._id.toString(), newUser.email)

    return NextResponse.json(
      {
        message: "User created successfully",
        sessionId,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
