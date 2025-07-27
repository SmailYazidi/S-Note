import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (sessionId) {
      await deleteSession(sessionId)
    }

    return NextResponse.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
