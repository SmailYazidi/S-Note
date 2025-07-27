import mongoose, { Schema, type Document } from "mongoose"

export interface INoteItem extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  title: string
  content: string
  type: "note" | "password"
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
    type: {
      type: String,
      enum: ["note", "password"],
      default: "note",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
NoteItemSchema.index({ userId: 1, createdAt: -1 })
NoteItemSchema.index({ userId: 1, type: 1 })

export const NoteItemModel = mongoose.models.NoteItem || mongoose.model<INoteItem>("NoteItem", NoteItemSchema)
