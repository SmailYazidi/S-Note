import mongoose, { Schema, type Document } from "mongoose"

export interface ISession extends Document {
  _id: string
  sessionId: string
  userId: mongoose.Types.ObjectId
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
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
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  },
)

export const SessionModel = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)
