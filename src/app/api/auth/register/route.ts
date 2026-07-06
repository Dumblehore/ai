import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email address is already registered.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        targetPercentile: 99.5,
        estimatedPercentile: 90.0,
        studyStreak: 1,
        studyHoursToday: 0.0,
        solvedCount: 0,
        completedTestsCount: 0,
        accuracy: 0.0,
        aiReadinessScore: 50,
        lastActiveDate: new Date().toISOString().split('T')[0]
      },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Set cookie response
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      targetPercentile: user.targetPercentile,
      estimatedPercentile: user.estimatedPercentile,
      studyStreak: user.studyStreak,
      studyHoursToday: user.studyHoursToday,
      solvedCount: user.solvedCount,
      completedTestsCount: user.completedTestsCount,
      accuracy: user.accuracy,
      aiReadinessScore: user.aiReadinessScore,
    });

    // Set HTTP-Only Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred during registration.' },
      { status: 500 }
    );
  }
}
