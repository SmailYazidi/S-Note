import mongoose from "mongoose"

const noteItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
noteItemSchema.index({ userId: 1, type: 1 })
noteItemSchema.index({ userId: 1, updatedAt: -1 })

export default mongoose.models.NoteItem || mongoose.model("NoteItem", noteItemSchema)
