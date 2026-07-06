import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cardId, correct } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required.' }, { status: 400 });
    }

    const card = await prisma.spacedCard.findUnique({
      where: { id: cardId }
    });

    if (!card || card.userId !== userId) {
      return NextResponse.json({ error: 'Spaced card not found.' }, { status: 404 });
    }

    // Leitner System Intervals: 1d, 3d, 7d, 14d, 30d
    const intervals = [1, 3, 7, 14, 30];
    let nextIndex = 0;
    
    if (correct) {
      const currentIndex = intervals.indexOf(card.intervalDays);
      nextIndex = Math.min(intervals.length - 1, currentIndex + 1);
    } else {
      nextIndex = 0; // reset to 1 day on error
    }

    const nextInterval = intervals[nextIndex];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    const nextReviewDate = nextDate.toISOString().split('T')[0];

    // Load history
    const history = JSON.parse(card.historyJson || '[]');
    history.push({
      date: new Date().toISOString().split('T')[0],
      correct
    });

    const updated = await prisma.spacedCard.update({
      where: { id: cardId },
      data: {
        intervalDays: nextInterval,
        nextReviewDate,
        historyJson: JSON.stringify(history)
      }
    });

    return NextResponse.json({
      id: updated.id,
      intervalDays: updated.intervalDays,
      nextReviewDate: updated.nextReviewDate,
      history
    });
  } catch (error: any) {
    console.error('Error updating spaced card:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
