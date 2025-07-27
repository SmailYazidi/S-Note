import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session-store"

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!sessionId) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    return NextResponse.json({
      message: "Session valid",
      userId: session.userId,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
