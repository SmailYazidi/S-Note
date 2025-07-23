// /home/smail/Downloads/ani-mov/models/User.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

// Define the interface for the User document
// This extends Document from mongoose to include Mongoose-specific properties like _id
export interface User extends Document {
  email: string;
  username: string;
  password: string; // This field will store the hashed password
  avatar?: string; // Optional avatar URL
  createdAt: Date; // Handled by timestamps: true
  updatedAt: Date; // Handled by timestamps: true
}

// Define the Mongoose Schema for the User model
const UserSchema = new Schema<User>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true, // Remove whitespace from both ends
    lowercase: true, // Store email in lowercase for consistency
    match: [/.+@.+\..+/, 'Please enter a valid email address'], // Basic email format validation
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'], // Add a minimum length for password
  },
  avatar: {
    type: String,
    // You could add a default avatar URL here if desired:
    // default: 'https://placehold.co/150x150/cccccc/000000?text=User',
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to hash the password before saving
// This middleware runs before a document is saved to the database.
UserSchema.pre('save', async function(next) {
  // Check if the password field has been modified (new user creation or password update)
  if (this.isModified('password')) {
    try {
      // Generate a salt with a cost factor of 10 (recommended for good security)
      const salt = await bcrypt.genSalt(10);
      // Hash the plain-text password using the generated salt
      this.password = await bcrypt.hash(this.password, salt);
      next(); // Proceed with saving the document
    } catch (error: any) {
      // If an error occurs during hashing, pass it to the next middleware
      return next(error);
    }
  } else {
    // If the password was not modified, just proceed to save
    next();
  }
});

// Method to compare a candidate password with the stored hashed password
// This method will be available on instances of the User model (e.g., user.comparePassword('plainTextPassword'))
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Use bcrypt.compare to compare the plain-text password with the hashed one
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
// This prevents Mongoose from recompiling the model if it already exists (useful in hot-reloading environments)
export const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);
