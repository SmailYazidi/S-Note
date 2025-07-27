import { v4 as uuidv4 } from "uuid"
import connectToDatabase from "./mongodb"
import { SessionModel } from "@/models/Session"

export async function createSession(userId: string): Promise<string> {
  await connectToDatabase()

  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await SessionModel.create({
    sessionId,
    userId,
    expiresAt,
  })

  return sessionId
}

export async function getSession(sessionId: string): Promise<{ userId: string } | null> {
  await connectToDatabase()

  const session = await SessionModel.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  return { userId: session.userId.toString() }
}

export async function destroySession(sessionId: string): Promise<void> {
  await connectToDatabase()
  await SessionModel.deleteOne({ sessionId })
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await connectToDatabase()
  await SessionModel.deleteMany({ userId })
}
