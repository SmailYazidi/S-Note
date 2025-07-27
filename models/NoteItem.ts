import mongoose, { Schema, type Document, type Types } from "mongoose"

// Define the interface for the NoteItem document
export interface NoteItem extends Document {
  userId: Types.ObjectId // Reference to the User model's _id
  type: "note" | "password" // Enforce specific values
  title: string
  content: string
  createdAt: Date // Handled by timestamps: true
  updatedAt: Date // Handled by timestamps: true
}

// Define the Mongoose Schema for the NoteItem model
const NoteItemSchema = new Schema<NoteItem>(
  {
    userId: {
      type: Schema.Types.ObjectId, // Specifies that this field will store an ObjectId
      ref: "User", // This tells Mongoose that the ObjectId refers to the 'User' model
      required: [true, "User ID is required for a Note Item"],
      index: true, // Add an index for faster queries by userId
    },
    type: {
      type: String,
      enum: ["note", "password"], // Restrict the values to 'note' or 'password'
      required: [true, "Note type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true, // Remove whitespace from both ends
      minlength: [1, "Title cannot be empty"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      // No specific max length for content, but you might want to add one for very large notes
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
)

// Export the NoteItem model
// This prevents Mongoose from recompiling the model if it already exists (useful in hot-reloading environments)
export const NoteItemModel = mongoose.models.NoteItem || mongoose.model<NoteItem>("NoteItem", NoteItemSchema)
