import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized user session.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attempts: {
          orderBy: { date: 'desc' },
          include: { answers: true }
        },
        goals: true,
        flashcards: true,
        spacedCards: true,
        chatMessages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetPercentile: user.targetPercentile,
        estimatedPercentile: user.estimatedPercentile,
        studyStreak: user.studyStreak,
        studyHoursToday: user.studyHoursToday,
        solvedCount: user.solvedCount,
        completedTestsCount: user.completedTestsCount,
        accuracy: user.accuracy,
        aiReadinessScore: user.aiReadinessScore,
        lastActiveDate: user.lastActiveDate,
        recommendationsJson: user.recommendationsJson
      },
      testHistory: user.attempts,
      activeGoals: user.goals,
      flashcards: user.flashcards,
      spacedRepetition: user.spacedCards.map(c => ({
        id: c.id,
        questionId: c.questionId,
        intervalDays: c.intervalDays,
        nextReviewDate: c.nextReviewDate,
        history: JSON.parse(c.historyJson)
      })),
      chatMessages: user.chatMessages
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, email, targetPercentile, recommendationsJson } = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(targetPercentile && { targetPercentile: +targetPercentile }),
        ...(recommendationsJson && { recommendationsJson })
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      targetPercentile: updated.targetPercentile,
      recommendationsJson: updated.recommendationsJson
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
