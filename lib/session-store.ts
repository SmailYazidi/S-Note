import { randomBytes } from "crypto"
import connectDB from "./mongodb"
import Session from "../models/Session"

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

  static async getSession(sessionId: string): Promise<{ userId: string } | null> {
    await connectDB()

    const session = await Session.findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    return session ? { userId: session.userId.toString() } : null
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
