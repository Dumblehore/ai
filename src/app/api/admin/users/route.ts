import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const caller = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!caller || caller.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access privilege required.' },
        { status: 403 }
      );
    }

    // Return list of all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        estimatedPercentile: true,
        completedTestsCount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Admin users read error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
