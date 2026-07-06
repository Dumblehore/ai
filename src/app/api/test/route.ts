import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateCatPercentile } from '@/lib/percentile';

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
      timeSpent,
      questionsAnswered
    } = await req.json();

    if (!questionsAnswered || !Array.isArray(questionsAnswered)) {
      return NextResponse.json({ error: 'Missing answer log data.' }, { status: 400 });
    }

    // Fetch active user profile
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 1. Server-Side Correctness & Score Validation
    // Fetch central mock bank questions
    const dbQuestions = await prisma.question.findMany({});
    const questionMap = new Map(dbQuestions.map(q => [q.id, q]));

    let calculatedCorrect = 0;
    let calculatedAttempted = 0;
    let calculatedScore = 0;

    const validatedAnswers = questionsAnswered.map((ans: any) => {
      const q = questionMap.get(ans.questionId);
      
      // Fallback for custom user admin questions not in database bank
      if (!q) {
        const isUserAnswered = ans.userAnswer !== undefined && ans.userAnswer !== null && ans.userAnswer.trim() !== '';
        if (isUserAnswered) {
          calculatedAttempted++;
          if (ans.isCorrect) {
            calculatedCorrect++;
            calculatedScore += 3;
          } else {
            // default penalty
            calculatedScore -= (ans.type === 'TITA' ? 0 : 1);
          }
        }
        return ans;
      }

      const isUserAnswered = ans.userAnswer !== undefined && ans.userAnswer !== null && ans.userAnswer.trim() !== '';
      const isCorrect = isUserAnswered && q.correctAnswer.trim().toLowerCase() === ans.userAnswer.trim().toLowerCase();

      if (isUserAnswered) {
        calculatedAttempted++;
        if (isCorrect) {
          calculatedCorrect++;
          calculatedScore += 3;
        } else {
          // Apply negative marking for MCQ only
          const isMcq = q.type === 'MCQ';
          if (isMcq) {
            calculatedScore -= 1;
          }
        }
      }

      return {
        questionId: ans.questionId,
        userAnswer: ans.userAnswer,
        isCorrect,
        timeSpent: ans.timeSpent,
        mistakeType: ans.mistakeType
      };
    });

    const calculatedAccuracy = calculatedAttempted > 0 
      ? Math.round((calculatedCorrect / calculatedAttempted) * 100) 
      : 0;

    // 2. Calculate realistic percentile based on actual CAT distributions
    const maxPossibleScore = totalQuestions * 3;
    const attemptPercentile = calculateCatPercentile(calculatedScore, maxPossibleScore);

    // Dynamic smoothing filter: User percentile updates gradually (70% weight on history, 30% on latest mock)
    const currentPercentile = user.estimatedPercentile || 90.0;
    const newPercentile = +(currentPercentile * 0.7 + attemptPercentile * 0.3).toFixed(2);

    // Recalculate User Profile Stats
    const updatedSolvedCount = user.solvedCount + calculatedAttempted;
    const updatedCompletedTests = user.completedTestsCount + 1;
    const updatedAccuracy = user.solvedCount > 0 
      ? Math.round(((user.accuracy * user.solvedCount) + (calculatedAccuracy * calculatedAttempted)) / updatedSolvedCount)
      : calculatedAccuracy;

    const newAIReadinessScore = Math.min(
      100,
      Math.max(45, Math.round(updatedAccuracy * 0.85 + (updatedCompletedTests * 1.5)))
    );

    // 3. Database Transactions to write all records safely
    const result = await prisma.$transaction(async (tx) => {
      // Create Test Attempt
      const attempt = await tx.testAttempt.create({
        data: {
          title,
          type,
          date: new Date().toISOString().split('T')[0],
          totalQuestions,
          attempted: calculatedAttempted,
          correct: calculatedCorrect,
          score: calculatedScore,
          accuracy: calculatedAccuracy,
          timeSpent,
          percentile: attemptPercentile, // Snapshotted test percentile
          userId,
          answers: {
            create: validatedAnswers.map((q: any) => ({
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
      const incorrectQuestions = validatedAnswers.filter((q: any) => !q.isCorrect && q.userAnswer !== '');

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
            data: { currentValue: Math.min(goal.targetValue, goal.currentValue + calculatedAttempted) }
          });
        } else if (goal.category === 'accuracy' && title.toLowerCase().includes('qa')) {
          await tx.goal.update({
            where: { id: goal.id },
            data: { currentValue: Math.round((goal.currentValue + calculatedAccuracy) / 2) }
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
