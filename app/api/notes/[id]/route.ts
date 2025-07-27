import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    await connectDB()
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    await connectDB()
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    await connectDB()
    const note = await NoteItem.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
