import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { category, front, back, topic } = await req.json();

    if (!category || !front || !back) {
      return NextResponse.json({ error: 'Category, front, and back are required.' }, { status: 400 });
    }

    const newCard = await prisma.flashcard.create({
      data: {
        category,
        front,
        back,
        topic,
        userId
      }
    });

    return NextResponse.json(newCard);
  } catch (error: any) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required.' }, { status: 400 });
    }

    const card = await prisma.flashcard.findUnique({
      where: { id: cardId }
    });

    if (!card || card.userId !== userId) {
      return NextResponse.json({ error: 'Flashcard not found.' }, { status: 404 });
    }

    const updated = await prisma.flashcard.update({
      where: { id: cardId },
      data: {
        isFavorite: !card.isFavorite
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error toggling flashcard favorite:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
