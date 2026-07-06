import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// Statistical scoring mapping based on actual CAT score distributions
// CAT total marks is 198 (66 questions). Our simulator adapts to varying mock question counts.
// We model score percentage (achieved score / max possible score).
function calculateCatPercentile(score: number, maxScore: number): number {
  if (maxScore <= 0) return 90.0;
  
  const ratio = score / maxScore;

  if (ratio >= 0.65) {
    // 99.7%ile to 99.99%ile
    return +(99.7 + (ratio - 0.65) * 0.85).toFixed(2);
  }
  if (ratio >= 0.45) {
    // 99.0%ile to 99.7%ile
    return +(99.0 + ((ratio - 0.45) / 0.20) * 0.7).toFixed(2);
  }
  if (ratio >= 0.30) {
    // 95.0%ile to 99.0%ile
    return +(95.0 + ((ratio - 0.30) / 0.15) * 4.0).toFixed(2);
  }
  if (ratio >= 0.20) {
    // 90.0%ile to 95.0%ile
    return +(90.0 + ((ratio - 0.20) / 0.10) * 5.0).toFixed(2);
  }
  if (ratio >= 0.10) {
    // 80.0%ile to 90.0%ile
    return +(80.0 + ((ratio - 0.10) / 0.10) * 10.0).toFixed(2);
  }
  
  // Under 80%ile range
  return Math.max(50.0, +(50.0 + (ratio / 0.10) * 30.0).toFixed(2));
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const {
      title,
      type,
      totalQuestions,
      attempted,
      correct,
      score,
      accuracy,
      timeSpent,
      sectionBreakdown,
      mistakeCounts,
      questionsAnswered
    } = await req.json();

    // Fetch active user profile
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 1. Calculate realistic percentile based on actual CAT distributions
    const maxPossibleScore = totalQuestions * 3;
    const attemptPercentile = calculateCatPercentile(score, maxPossibleScore);

    // Dynamic smoothing filter: User percentile updates gradually (70% weight on history, 30% on latest mock)
    const currentPercentile = user.estimatedPercentile || 90.0;
    const newPercentile = +(currentPercentile * 0.7 + attemptPercentile * 0.3).toFixed(2);

    // Recalculate User Profile Stats
    const updatedSolvedCount = user.solvedCount + attempted;
    const updatedCompletedTests = user.completedTestsCount + 1;
    const updatedAccuracy = user.solvedCount > 0 
      ? Math.round(((user.accuracy * user.solvedCount) + (accuracy * attempted)) / updatedSolvedCount)
      : accuracy;

    const newAIReadinessScore = Math.min(
      100,
      Math.max(45, Math.round(updatedAccuracy * 0.85 + (updatedCompletedTests * 1.5)))
    );

    // 2. Database Transactions to write all records safely
    const result = await prisma.$transaction(async (tx) => {
      // Create Test Attempt
      const attempt = await tx.testAttempt.create({
        data: {
          title,
          type,
          date: new Date().toISOString().split('T')[0],
          totalQuestions,
          attempted,
          correct,
          score,
          accuracy,
          timeSpent,
          userId,
          answers: {
            create: questionsAnswered.map((q: any) => ({
              questionId: q.questionId,
              userAnswer: q.userAnswer,
              isCorrect: q.isCorrect,
              timeSpent: q.timeSpent,
              mistakeType: q.mistakeType
            }))
          }
        },
        include: { answers: true }
      });

      // Spawns Spaced Cards for incorrect answers
      const todayISO = new Date().toISOString().split('T')[0];
      const incorrectQuestions = questionsAnswered.filter((q: any) => !q.isCorrect && q.userAnswer !== '');

      for (const q of incorrectQuestions) {
        // Schedule next review for tomorrow (1 day interval)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextReviewDate = tomorrow.toISOString().split('T')[0];

        // Check if card already exists for this user and question
        const existingCard = await tx.spacedCard.findFirst({
          where: { userId, questionId: q.questionId }
        });

        if (existingCard) {
          // Reset interval back to 1 day on mistake
          await tx.spacedCard.update({
            where: { id: existingCard.id },
            data: {
              intervalDays: 1,
              nextReviewDate
            }
          });
        } else {
          // Create new spaced card
          await tx.spacedCard.create({
            data: {
              userId,
              questionId: q.questionId,
              intervalDays: 1,
              nextReviewDate
            }
          });
        }
      }

      // Update User details
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          solvedCount: updatedSolvedCount,
          completedTestsCount: updatedCompletedTests,
          accuracy: updatedAccuracy,
          estimatedPercentile: newPercentile,
          aiReadinessScore: newAIReadinessScore
        }
      });

      // Update goals progress
      const userGoals = await tx.goal.findMany({ where: { userId } });
      for (const goal of userGoals) {
        if (goal.category === 'mock-tests') {
          await tx.goal.update({
            where: { id: goal.id },
            data: { currentValue: Math.min(goal.targetValue, goal.currentValue + 1) }
          });
        } else if (goal.category === 'questions') {
          await tx.goal.update({
            where: { id: goal.id },
            data: { currentValue: Math.min(goal.targetValue, goal.currentValue + attempted) }
          });
        } else if (goal.category === 'accuracy' && title.toLowerCase().includes('qa')) {
          await tx.goal.update({
            where: { id: goal.id },
            data: { currentValue: Math.round((goal.currentValue + accuracy) / 2) }
          });
        }
      }

      return { attempt, updatedUser };
    });

    return NextResponse.json({
      success: true,
      attemptId: result.attempt.id,
      estimatedPercentile: result.updatedUser.estimatedPercentile,
      aiReadinessScore: result.updatedUser.aiReadinessScore
    });

  } catch (error: any) {
    console.error('Test submission error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
