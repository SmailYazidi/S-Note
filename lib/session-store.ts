import { SessionModel } from "@/models/Session"
import { v4 as uuidv4 } from "uuid"
import connectToDatabase from "./mongodb"

export async function createSession(userId: string): Promise<string> {
  await connectToDatabase()
  const sessionId = uuidv4()

  await SessionModel.create({
    sessionId,
    userId,
  })

  return sessionId
}


export async function getSession(sessionId: string) {
  await connectToDatabase()
  const now = new Date()

  const session = await SessionModel.findOne({
    sessionId,
    expiresAt: { $gt: now }, // ✅ only return if session is still valid
  })

  return session
}


export async function destroySession(sessionId: string) {
  await connectToDatabase()
  await SessionModel.deleteOne({ sessionId })
}
