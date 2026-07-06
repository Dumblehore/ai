const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records (Optional for reset)
  await prisma.chatMessage.deleteMany({});
  await prisma.spacedCard.deleteMany({});
  await prisma.flashcard.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.questionAnswer.deleteMany({});
  await prisma.testAttempt.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create default user
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const defaultRecs = [
    { id: 'rec-1', text: 'Solve 2 Reading Comprehension sets', time: '40m', done: false, type: 'VARC' },
    { id: 'rec-2', text: 'Practice 20 Arithmetic Questions', time: '45m', done: false, type: 'QA' },
    { id: 'rec-3', text: 'Analyze 1 Logical Seating Arrangement set', time: '30m', done: true, type: 'DILR' },
    { id: 'rec-4', text: 'Revise Geometry formula flashcards', time: '15m', done: false, type: 'Revision' },
    { id: 'rec-5', text: 'Review Spaced Repetition Due Cards', time: '20m', done: false, type: 'Revision' },
  ];

  const user = await prisma.user.create({
    data: {
      name: 'Yash Mohan',
      email: 'yash@example.com',
      password: hashedPassword,
      role: 'student',
      recommendationsJson: JSON.stringify(defaultRecs),
      targetPercentile: 99.5,
      estimatedPercentile: 94.6,
      studyStreak: 8,
      studyHoursToday: 2.1,
      solvedCount: 154,
      completedTestsCount: 7,
      accuracy: 74,
      aiReadinessScore: 78,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }
  });

  const adminHashed = bcrypt.hashSync('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Aether Mentor Admin',
      email: 'admin@aether.ai',
      password: adminHashed,
      role: 'admin',
      targetPercentile: 99.9,
      estimatedPercentile: 99.9,
      studyStreak: 100,
      studyHoursToday: 0.0,
      solvedCount: 1000,
      completedTestsCount: 50,
      accuracy: 95,
      aiReadinessScore: 99,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }
  });

  console.log(`Created default user: ${user.email} and admin: ${admin.email}`);

  // 3. Create default goals
  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: 'Complete Algebra Formula Revision', targetValue: 1, currentValue: 0, metric: 'Sheet', category: 'algebra' },
      { userId: user.id, title: 'Attempt 5 Sectional Mock Tests', targetValue: 5, currentValue: 2, metric: 'Tests', category: 'mock-tests' },
      { userId: user.id, title: 'Daily Study Hours', targetValue: 3, currentValue: 2.1, metric: 'Hours', category: 'study-hours' },
      { userId: user.id, title: 'Improve QA Accuracy to 80%', targetValue: 80, currentValue: 75, metric: '%', category: 'accuracy' }
    ]
  });

  console.log('Seeded default user goals');

  // 4. Create default flashcards
  await prisma.flashcard.createMany({
    data: [
      { userId: user.id, category: 'Formula', front: 'Sum of internal angles of an n-sided polygon', back: '(n - 2) * 180 degrees', isFavorite: true, topic: 'Geometry' },
      { userId: user.id, category: 'Vocabulary', front: 'Equivocating', back: 'Using ambiguous language to conceal the truth or avoid committing oneself', isFavorite: false, topic: 'VARC' },
      { userId: user.id, category: 'Shortcut', front: 'Euler\'s Totient function for prime p', back: 'φ(p) = p - 1. Used to calculate remainders of type a^b mod p.', isFavorite: true, topic: 'Number System' },
      { userId: user.id, category: 'Concept', front: 'Stars and Bars theorem (distributions)', back: 'Ways to distribute n identical items among r distinct bins such that each child gets at least 1 is (n-1)C(r-1); if empty bins allowed: (n+r-1)C(r-1).', isFavorite: false, topic: 'Modern Math' },
      { userId: user.id, category: 'Vocabulary', front: 'Anachronism', back: 'A thing belonging or appropriate to a period other than that in which it exists, especially a thing that is conspicuously old-fashioned', isFavorite: false, topic: 'VARC' }
    ]
  });

  console.log('Seeded default flippable flashcards');

  // 5. Create default spaced repetition cards
  const todayISO = new Date().toISOString().split('T')[0];
  await prisma.spacedCard.createMany({
    data: [
      { userId: user.id, questionId: 'qa-alg-1', intervalDays: 1, nextReviewDate: todayISO, historyJson: '[]' },
      { userId: user.id, questionId: 'varc-pj-1', intervalDays: 3, nextReviewDate: todayISO, historyJson: '[]' },
      { userId: user.id, questionId: 'dilr-set-1-q2', intervalDays: 7, nextReviewDate: todayISO, historyJson: '[]' }
    ]
  });

  console.log('Seeded default spaced cards');

  // 6. Create default chat logs
  await prisma.chatMessage.create({
    data: {
      userId: user.id,
      sender: 'ai',
      text: 'Hello Yash! I am your AI CAT mentor. I have analyzed your database profiles. You are doing exceptionally well in Arithmetic, but your speed in Geometry and Algebra can be optimized. How can I help you today?',
      timestamp: '08:30 AM'
    }
  });

  console.log('Seeded default AI Coach chat logs');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
