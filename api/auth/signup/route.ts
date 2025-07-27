import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { UserModel } from "@/models/User"

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.email === email ? "Email already exists" : "Username already exists",
        },
        { status: 409 },
      )
    }

    // Create new user (password will be hashed by the pre-save hook)
    const newUser = new UserModel({
      email,
      username,
      password, // This will be hashed automatically by the User model
    })

    await newUser.save()

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
