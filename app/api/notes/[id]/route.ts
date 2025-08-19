import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Simple validation for MongoDB ObjectId format (24 hex characters)
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
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
    console.error("Get note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Simple validation for MongoDB ObjectId format
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const { type, title, content } = await request.json()
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (type !== undefined) {
      if (!["note", "password"].includes(type)) {
        return NextResponse.json({ error: "Invalid note type" }, { status: 400 })
      }
      updateData.type = type
    }

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
    console.error("Update note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await SessionStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Simple validation for MongoDB ObjectId format
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    await connectDB();
    const note = await NoteItem.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}