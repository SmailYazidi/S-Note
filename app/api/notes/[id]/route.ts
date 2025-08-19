import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import NoteItem from "@/models/NoteItem"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Simple validation for MongoDB ObjectId format (24 hex characters)
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid note ID" }, { status: 400 })
    }

    await connectDB()
    const note = await NoteItem.findOne({
      _id: params.id,
      userId: session.userId,
    }).lean()

    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: note })
  } catch (error) {
    console.error("Get note error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Authorization header missing or invalid")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      console.log("Invalid session for ID:", sessionId)
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      console.log("Invalid note ID:", params.id)
      return NextResponse.json({ success: false, error: "Invalid note ID" }, { status: 400 })
    }

    const { type, title, content } = await request.json()
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (type !== undefined) {
      if (!["note", "password"].includes(type)) {
        console.log("Invalid note type:", type)
        return NextResponse.json({ success: false, error: "Invalid note type" }, { status: 400 })
      }
      updateData.type = type
    }

    console.log("Update data:", updateData)
    console.log("Session userId:", session.userId)

    await connectDB()

    // Remove .lean() to ensure Mongoose applies validators and updates correctly
    const note = await NoteItem.findOneAndUpdate(
      { _id: params.id, userId: session.userId },
      updateData,
      { new: true, runValidators: true }
    )

    console.log("Update result:", note)

    if (!note) {
      console.log("Note not found or userId mismatch")
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: note })
  } catch (error) {
    console.error("Update note error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await SessionStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    // Simple validation for MongoDB ObjectId format
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid note ID" }, { status: 400 });
    }

    await connectDB();
    const note = await NoteItem.findOneAndDelete({
      _id: params.id,
      userId: session.userId,
    });

    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}