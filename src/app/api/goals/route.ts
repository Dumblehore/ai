import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { title, targetValue, metric, category } = await req.json();

    if (!title || targetValue <= 0 || !metric || !category) {
      return NextResponse.json({ error: 'Title, target value, metric, and category are required.' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetValue: +targetValue,
        currentValue: 0.0,
        metric,
        category,
        userId
      }
    });

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
