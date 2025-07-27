import { v4 as uuidv4 } from "uuid"
import connectDB from "./mongodb"
import Session from "@/models/Session"

export async function createSession(userId: string): Promise<string> {
  await connectDB()

  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await Session.create({
    sessionId,
    userId,
    expiresAt,
  })

  return sessionId
}

export async function getSession(sessionId: string): Promise<{ userId: string } | null> {
  await connectDB()

  const session = await Session.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  })

  if (!session) {
    return null
  }

  return { userId: session.userId }
}

export async function destroySession(sessionId: string): Promise<void> {
  await connectDB()

  await Session.deleteOne({ sessionId })
}

export async function cleanupExpiredSessions(): Promise<void> {
  await connectDB()

  await Session.deleteMany({
    expiresAt: { $lt: new Date() },
  })
}
