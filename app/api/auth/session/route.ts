import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const session = await getSession(sessionId)

    return NextResponse.json({ valid: !!session })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
