import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function DELETE(req: NextRequest) {
  const { userId, noteId } = await req.json();

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  user.notes = user.notes.filter(note => note.id !== noteId);
  await user.save();

  return NextResponse.json({ message: 'Note deleted', notes: user.notes });
}
