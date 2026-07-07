import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (checkRateLimit(`coach_${ip}`, 15, 60000)) {
      return NextResponse.json(
        { error: 'AI Coach rate limit exceeded. Please wait a minute before sending more queries.' },
        { status: 429 }
      );
    }
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }

    // 1. Fetch user profile context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attempts: {
          orderBy: { date: 'desc' },
          take: 3
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // 2. Fetch last 10 chat messages to initialize conversational memory
    const lastMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Sort to ascending chronological order
    const sortedHistory = [...lastMessages].reverse();

    // Map to Gemini SDK history model format
    // Filter out the very latest message if it was already saved (to prevent loop recursion)
    const chatHistory = sortedHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    }));

    // Save User message in DB
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = await prisma.chatMessage.create({
      data: {
        userId,
        sender: 'user',
        text,
        timestamp: timeString
      }
    });

    // 3. System Instructions for AI Mentor Persona
    const recentScores = user.attempts.map(a => `${a.title}: Score ${a.score} (${a.accuracy}% Accuracy)`).join('\n');
    const systemInstruction = `You are AetherCAT, a world-class personal mentor for the Indian Common Admission Test (CAT) preparation.
Your student is named ${user.name}.
Student Performance Profile:
- Target CAT Percentile: ${user.targetPercentile}%ile
- Estimated CAT Percentile: ${user.estimatedPercentile}%ile
- Overall Questions Attempted: ${user.solvedCount}
- Overall Question Accuracy: ${user.accuracy}%
- Mock Exams Completed: ${user.completedTestsCount}
- AI Readiness Score: ${user.aiReadinessScore}%

Recent Mock History:
${recentScores || 'No mock tests attempted yet.'}

Instructions:
- Provide highly actionable, specific advice. Avoid generic guidance.
- Focus on shortcuts (like options elimination, Fermat's remainder theorem, DILR grid representation).
- Be extremely motivating but professional, using markdown for structures.
- Reference the student's stats directly in your answer where appropriate.
- Keep the response relatively concise (2-3 paragraphs max).
- Utilize the chat history to remember preceding questions and context.
- ALWAYS render mathematical equations, symbols, fractions, powers, and expressions using standard LaTeX formatting. Use double dollar signs ($$) for block equations and single dollar signs ($) for inline math. For example, write $E=mc^2$ or $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$ instead of plain text, and $\log_b(x)$ instead of log_b(x). Never use plain text for math formulas.`;

    let aiResponseText = '';

    // 4. Generate response using Gemini API or local fallback
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          systemInstruction
        });

        // Start multi-turn chat session
        const chat = model.startChat({
          history: chatHistory
        });

        const result = await chat.sendMessage(text);
        aiResponseText = result.response.text();
      } catch (apiError) {
        console.error('Gemini API error, executing fallback:', apiError);
        aiResponseText = getLocalMentorFallback(text, user);
      }
    } else {
      aiResponseText = getLocalMentorFallback(text, user);
    }

    // Save AI response in DB
    const aiMsg = await prisma.chatMessage.create({
      data: {
        userId,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    return NextResponse.json({
      userMessage: userMsg,
      aiMessage: aiMsg
    });

  } catch (error: any) {
    console.error('AI Coach routing error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Local fallback heuristics
function getLocalMentorFallback(query: string, user: any): string {
  const q = query.toLowerCase();
  
  if (q.includes('formula') || q.includes('geometry') || q.includes('area')) {
    return `Hello **${user.name}**! For Geometry, remember the crucial shortcut for the area of a triangle: **Area = 1/2 * a * b * sin(C)**. If sin(C) = 1, it's a right triangle! I noticed your current estimated percentile is **${user.estimatedPercentile}%ile**. Let's push this up by practicing Geometry formulas daily. I have populated revision flashcards in your deck!`;
  }
  
  if (q.includes('shortcut') || q.includes('math') || q.includes('solve') || q.includes('quant') || q.includes('qa')) {
    return `In QA (Quant), using options elimination is key. For TITA questions, focus on **Fermat's Little Theorem** (a^(p-1) mod p ≡ 1) or Euler's Totient function to bypass heavy calculations. With your current **${user.accuracy}%** accuracy, saving an average of 45 seconds per question on calculations will push you past the **99%ile** mark!`;
  }
  
  if (q.includes('dilr') || q.includes('sets') || q.includes('seating') || q.includes('arrangements')) {
    return `For DILR arrangements, scan all 4 sets in the first 5 minutes. Classify them, and attempt sets with simple Venn diagrams or tables first. Since you have solved **${user.solvedCount}** questions, you have the foundational logical skill, but you spend too much time on hard arrangements. Skip games & tournaments if the rules take more than 2 pages to explain.`;
  }
  
  if (q.includes('varc') || q.includes('rc') || q.includes('reading') || q.includes('verbal')) {
    return `For Reading Comprehension, prioritize understanding the author's tone and primary purpose. Avoid 'extreme' options containing words like 'always', 'never', 'only', or 'absolutely'. The correct answer in VARC is usually moderate and directly supported by paragraph scope. Your verbal skills are strong; use it to buffer your DILR benchmarks.`;
  }
  
  if (q.includes('motivation') || q.includes('stress') || q.includes('panic') || q.includes('score')) {
    return `CAT is a test of decision-making under pressure, not just math. You do not need a 100% score for a **${user.targetPercentile}%ile**; historically, a 50% net score is more than enough! Take a deep breath. You have completed **${user.completedTestsCount}** tests and maintained an active streak of **${user.studyStreak}** days. Keep going!`;
  }

  return `Hey **${user.name}**! I hear you. Let's work on this topic together. Do you want me to generate some practice questions on it, teach you a specific shortcut, or analyze your last mock test?`;
}
