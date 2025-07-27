import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    await SessionStore.deleteSession(sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
