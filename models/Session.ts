import mongoose, { Schema, type Document } from "mongoose"

export interface ISession extends Document {
  _id: string
  sessionId: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)
