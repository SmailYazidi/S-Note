import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { INoteItem } from '@/models/User';

export async function POST(req: NextRequest) {
  const { userId, note } = await req.json() as {
    userId: string;
    note: INoteItem;
  };

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  user.notes.push(note);
  await user.save();

  return NextResponse.json({ message: 'Note created', notes: user.notes });
}
