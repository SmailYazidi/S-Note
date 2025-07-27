import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { NoteItemModel } from "@/models/NoteItem"
import { getSession } from "@/lib/session-store"
import mongoose from "mongoose"

// GET - Fetch a specific note
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID format" }, { status: 400 })
    }

    await connectToDatabase()

    const note = await NoteItemModel.findOne({
      _id: params.id,
      userId: session.userId,
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Get note error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT - Update a note
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID format" }, { status: 400 })
    }

    const { type, title, content } = await req.json()

    if (!type || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["note", "password"].includes(type)) {
      return NextResponse.json({ error: "Invalid note type" }, { status: 400 })
    }

    await connectToDatabase()

    const updatedNote = await NoteItemModel.findOneAndUpdate(
      { _id: params.id, userId: session.userId },
      { type, title, content },
      { new: true, runValidators: true },
    )

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Note updated successfully",
      note: updatedNote,
    })
  } catch (error) {
    console.error("Update note error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID format" }, { status: 400 })
    }

    await connectToDatabase()

    const deletedNote = await NoteItemModel.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    })

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Note deleted successfully",
      note: deletedNote,
    })
  } catch (error) {
    console.error("Delete note error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
