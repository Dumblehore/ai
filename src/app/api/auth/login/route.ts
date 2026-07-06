import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (checkRateLimit(`login_${ip}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email address or password credentials.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email address or password credentials.' },
        { status: 401 }
      );
    }

    // Check streak updates on login
    const today = new Date().toISOString().split('T')[0];
    let updatedStreak = user.studyStreak;
    if (user.lastActiveDate && user.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];
      
      if (user.lastActiveDate === yesterdayISO) {
        updatedStreak += 1; // Increment streak
      } else {
        updatedStreak = 1; // Reset streak
      }
    } else if (!user.lastActiveDate) {
      updatedStreak = 1;
    }

    // Update user active status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        studyStreak: updatedStreak,
        lastActiveDate: today
      }
    });

    // Generate JWT token
    const token = generateToken({ userId: updatedUser.id, email: updatedUser.email });

    // Set cookie response
    const response = NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      targetPercentile: updatedUser.targetPercentile,
      estimatedPercentile: updatedUser.estimatedPercentile,
      studyStreak: updatedUser.studyStreak,
      studyHoursToday: updatedUser.studyHoursToday,
      solvedCount: updatedUser.solvedCount,
      completedTestsCount: updatedUser.completedTestsCount,
      accuracy: updatedUser.accuracy,
      aiReadinessScore: updatedUser.aiReadinessScore,
    });

    // Set Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred during login.' },
      { status: 500 }
    );
  }
}
