import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionId = authHeader?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    return NextResponse.json({ valid: true, userId: session.userId })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
