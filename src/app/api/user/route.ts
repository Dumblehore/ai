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

    // Fetch all questions to map questionId to section
    const dbQuestions = await prisma.question.findMany({
      select: { id: true, section: true }
    });
    const questionSectionMap = new Map(dbQuestions.map(q => [q.id, q.section]));

    const formattedAttempts = user.attempts.map(attempt => {
      const sectionBreakdown = {
        VARC: { attempted: 0, correct: 0, timeSpent: 0 },
        DILR: { attempted: 0, correct: 0, timeSpent: 0 },
        QA: { attempted: 0, correct: 0, timeSpent: 0 }
      };

      const mistakeCounts = {
        'Conceptual Error': 0,
        'Calculation Error': 0,
        'Careless Mistake': 0,
        'Misread Question': 0,
        'Poor Time Management': 0,
        'Lucky Guess': 0,
        'Incorrect Elimination': 0,
        'Panic Under Time Pressure': 0
      };

      attempt.answers.forEach(ans => {
        const rawSection = questionSectionMap.get(ans.questionId) || 'QA';
        // Normalize section name to match keys
        const section = (rawSection === 'VARC' || rawSection === 'DILR' || rawSection === 'QA') ? rawSection : 'QA';
        
        const isAnswered = ans.userAnswer && ans.userAnswer.trim() !== '';
        
        if (isAnswered) {
          sectionBreakdown[section].attempted++;
          if (ans.isCorrect) {
            sectionBreakdown[section].correct++;
          }
        }
        sectionBreakdown[section].timeSpent += ans.timeSpent;

        if (ans.mistakeType && ans.mistakeType in mistakeCounts) {
          mistakeCounts[ans.mistakeType as keyof typeof mistakeCounts]++;
        }
      });

      return {
        id: attempt.id,
        title: attempt.title,
        type: attempt.type,
        date: attempt.date,
        totalQuestions: attempt.totalQuestions,
        attempted: attempt.attempted,
        correct: attempt.correct,
        score: attempt.score,
        accuracy: attempt.accuracy,
        timeSpent: attempt.timeSpent,
        percentile: attempt.percentile,
        sectionBreakdown,
        mistakeCounts,
        questionsAnswered: attempt.answers.map(ans => ({
          questionId: ans.questionId,
          userAnswer: ans.userAnswer,
          isCorrect: ans.isCorrect,
          timeSpent: ans.timeSpent,
          mistakeType: ans.mistakeType || undefined
        }))
      };
    });

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
      testHistory: formattedAttempts,
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
