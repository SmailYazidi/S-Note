import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      userId: session.userId,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
