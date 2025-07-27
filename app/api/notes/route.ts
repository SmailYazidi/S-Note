import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"
import mongoose from "mongoose"

// GET /api/notes - Get all notes for authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const notes = await NoteItem.find({ userId: session.userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { type, title, content } = await request.json()

    // Validation
    if (!type || !["note", "password"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const note = await NoteItem.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      type,
      title: title.trim(),
      content: content.trim(),
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
