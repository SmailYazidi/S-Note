import mongoose from "mongoose"

const noteItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["note", "password"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
noteItemSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.NoteItem || mongoose.model("NoteItem", noteItemSchema)
