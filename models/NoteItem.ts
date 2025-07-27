import mongoose, { Schema, type Document } from "mongoose"

export interface INoteItem extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  type: "note" | "password"
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const NoteItemSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["note", "password"],
      required: true,
      default: "note",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient queries
NoteItemSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.NoteItem || mongoose.model<INoteItem>("NoteItem", NoteItemSchema)
