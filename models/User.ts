import mongoose, { Document, Schema, Model, models } from 'mongoose';

export interface INoteItem {
  id: string;
  type: 'note' | 'password';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  notes: INoteItem[];
}

const NoteItemSchema = new Schema<INoteItem>({
  id: { type: String, required: true },
  type: { type: String, enum: ['note', 'password'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notes: { type: [NoteItemSchema], default: [] },
});

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
