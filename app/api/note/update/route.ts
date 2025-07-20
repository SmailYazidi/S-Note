import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { INoteItem } from '@/models/User';

export async function PUT(req: NextRequest) {
  const { userId, note } = await req.json() as {
    userId: string;
    note: INoteItem;
  };

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const index = user.notes.findIndex(n => n.id === note.id);
  if (index === -1) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  user.notes[index] = note;
  await user.save();

  return NextResponse.json({ message: 'Note updated', notes: user.notes });
}
