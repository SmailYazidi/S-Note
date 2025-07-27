import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const sessionId = authHeader.substring(7)
      await SessionStore.deleteSession(sessionId)
    }

    return NextResponse.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
