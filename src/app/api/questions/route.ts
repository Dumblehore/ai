import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.question.findMany({});
    
    // Parse optionsJson back to options array for frontend compatibility
    const formatted = questions.map(q => ({
      id: q.id,
      section: q.section,
      topic: q.topic,
      subtopic: q.subtopic || '',
      passage: q.passage || undefined,
      type: q.type,
      questionText: q.questionText,
      options: q.optionsJson ? JSON.parse(q.optionsJson) : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      shortcut: q.shortcut || '',
      trap: q.trap || '',
      difficulty: q.difficulty,
      idealTime: q.idealTime
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const {
      section,
      topic,
      subtopic,
      passage,
      type,
      questionText,
      options, // Array
      correctAnswer,
      explanation,
      shortcut,
      trap,
      difficulty,
      idealTime
    } = await req.json();

    if (!section || !topic || !type || !questionText || correctAnswer === undefined || !explanation) {
      return NextResponse.json({ error: 'Missing required question parameters.' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        section,
        topic,
        subtopic,
        passage,
        type,
        questionText,
        optionsJson: options ? JSON.stringify(options) : null,
        correctAnswer: String(correctAnswer),
        explanation,
        shortcut,
        trap,
        difficulty,
        idealTime: idealTime ? parseInt(idealTime, 10) : 90
      }
    });

    return NextResponse.json(newQuestion);
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required.' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
