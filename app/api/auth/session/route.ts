import { type NextRequest, NextResponse } from "next/server"
import { SessionStore } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false })
    }

    const sessionId = authHeader.substring(7)
    const session = await SessionStore.getSession(sessionId)

    return NextResponse.json({ valid: !!session })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ valid: false })
  }
}
