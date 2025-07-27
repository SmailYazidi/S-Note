import mongoose, { Schema, type Document } from "mongoose"

export interface ISession extends Document {
  _id: string
  sessionId: string
  userId: string
  createdAt: Date
  expiresAt: Date
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
  {
    timestamps: true,
  },
)

// TTL index for automatic cleanup
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)
