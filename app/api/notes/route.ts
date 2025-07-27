import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionId = authHeader?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await SessionStore.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await connectDB()
    const notes = await NoteItem.find({ userId: session.userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionId = authHeader?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await SessionStore.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { type, title, content } = await request.json()

    if (!type || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["note", "password"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    await connectDB()
    const note = await NoteItem.create({
      userId: session.userId,
      type,
      title,
      content,
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
