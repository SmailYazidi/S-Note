import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"
import mongoose from "mongoose"

// GET - Fetch a specific note
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const note = await NoteItem.findOne({
      _id: params.id,
      userId: session.userId,
    }).lean()

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update a note
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const { type, title, content } = await request.json()
    const updateData: any = {}

    if (type !== undefined) {
      if (!["note", "password"].includes(type)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
      }
      updateData.type = type
    }

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 })
      }
      updateData.title = title.trim()
    }

    if (content !== undefined) {
      if (content.trim().length === 0) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 })
      }
      updateData.content = content.trim()
    }

    const note = await NoteItem.findOneAndUpdate({ _id: params.id, userId: session.userId }, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const note = await NoteItem.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
