import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { NoteItemModel } from "@/models/NoteItem"
import { getSession } from "@/lib/session-store"

// GET - Fetch all notes for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    await connectToDatabase()

    const notes = await NoteItemModel.find({ userId: session.userId }).sort({ updatedAt: -1 })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Get notes error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Create a new note
export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    const { type, title, content } = await req.json()

    if (!type || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const newNote = new NoteItemModel({
      userId: session.userId,
      type,
      title,
      content,
    })

    await newNote.save()

    return NextResponse.json(
      {
        message: "Note created successfully",
        note: newNote,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
