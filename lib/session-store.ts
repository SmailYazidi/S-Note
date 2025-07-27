import connectDB from "./mongodb"
import Session from "@/models/Session"
import { randomBytes } from "crypto"

export interface SessionData {
  sessionId: string
  userId: string
  expiresAt: Date
}

export class SessionStore {
  static async createSession(userId: string): Promise<string> {
    await connectDB()

    const sessionId = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await Session.create({
      sessionId,
      userId,
      expiresAt,
    })

    return sessionId
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    await connectDB()

    const session = await Session.findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!session) {
      return null
    }

    return {
      sessionId: session.sessionId,
      userId: session.userId.toString(),
      expiresAt: session.expiresAt,
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await connectDB()
    await Session.deleteOne({ sessionId })
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await connectDB()
    await Session.deleteMany({ expiresAt: { $lt: new Date() } })
  }
}
