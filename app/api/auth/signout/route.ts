import { type NextRequest, NextResponse } from "next/server"
import { destroySession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (sessionId) {
      await destroySession(sessionId)
    }

    return NextResponse.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
