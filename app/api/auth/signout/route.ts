import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionId = authHeader?.replace("Bearer ", "")

    if (sessionId) {
      await SessionStore.deleteSession(sessionId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ success: true }) // Still return success even if cleanup fails
  }
}
