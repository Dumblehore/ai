'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialQuestions, Question } from '../data/questionsBank';

export interface UserProfile {
  name: string;
  email: string;
  targetPercentile: number;
  estimatedPercentile: number;
  studyStreak: number;
  studyHoursToday: number;
  solvedCount: number;
  completedTestsCount: number;
  accuracy: number;
  aiReadinessScore: number;
  lastActiveDate: string;
}

export interface TestAttempt {
  id: string;
  title: string;
  type: 'Full Mock' | 'Sectional' | 'Topic-wise' | 'Custom';
  date: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  score: number; // 3 marks for correct, -1 for incorrect MCQ, 0 for incorrect TITA
  accuracy: number;
  timeSpent: number; // in seconds
  sectionBreakdown: {
    VARC: { attempted: number; correct: number; timeSpent: number };
    DILR: { attempted: number; correct: number; timeSpent: number };
    QA: { attempted: number; correct: number; timeSpent: number };
  };
  mistakeCounts: {
    'Conceptual Error': number;
    'Calculation Error': number;
    'Careless Mistake': number;
    'Misread Question': number;
    'Poor Time Management': number;
    'Lucky Guess': number;
    'Incorrect Elimination': number;
    'Panic Under Time Pressure': number;
  };
  questionsAnswered: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    mistakeType?: string;
  }[];
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  metric: string;
  category: 'algebra' | 'mock-tests' | 'study-hours' | 'accuracy' | 'questions';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeCode: string; // Icon identifier
  unlockedAt?: string;
}

export interface Flashcard {
  id: string;
  category: 'Formula' | 'Vocabulary' | 'Shortcut' | 'Concept';
  front: string;
  back: string;
  isFavorite: boolean;
  topic?: string;
}

export interface SpacedRepetitionCard {
  id: string;
  questionId: string;
  intervalDays: number; // 1, 3, 7, 14, 30
  nextReviewDate: string; // ISO String
  history: { date: string; correct: boolean }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserProfile | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  questions: Question[];
  testHistory: TestAttempt[];
  activeGoals: Goal[];
  achievements: Achievement[];
  flashcards: Flashcard[];
  spacedRepetition: SpacedRepetitionCard[];
  chatMessages: ChatMessage[];
  addChatMessage: (text: string) => void;
  submitTest: (attempt: Omit<TestAttempt, 'id' | 'date'>) => void;
  toggleFlashcardFavorite: (id: string) => void;
  answerSpacedCard: (id: string, correct: boolean) => void;
  addGoal: (title: string, targetValue: number, metric: string, category: Goal['category']) => void;
  addQuestion: (q: Omit<Question, 'id'>) => void;
  deleteQuestion: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [testHistory, setTestHistory] = useState<TestAttempt[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [spacedRepetition, setSpacedRepetition] = useState<SpacedRepetitionCard[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Apply Theme on load and change
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cat_user');
    const storedHistory = localStorage.getItem('cat_test_history');
    const storedGoals = localStorage.getItem('cat_goals');
    const storedAchievements = localStorage.getItem('cat_achievements');
    const storedFlashcards = localStorage.getItem('cat_flashcards');
    const storedSpaced = localStorage.getItem('cat_spaced');
    const storedChat = localStorage.getItem('cat_chat');
    const storedQuestions = localStorage.getItem('cat_custom_questions');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Setup initial dummy user for standard access
      const defaultUser: UserProfile = {
        name: 'Yash Mohan',
        email: 'yash@example.com',
        targetPercentile: 99.5,
        estimatedPercentile: 94.6,
        studyStreak: 8,
        studyHoursToday: 2.1,
        solvedCount: 154,
        completedTestsCount: 7,
        accuracy: 74,
        aiReadinessScore: 78,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      setUser(defaultUser);
      localStorage.setItem('cat_user', JSON.stringify(defaultUser));
    }

    if (storedHistory) {
      setTestHistory(JSON.parse(storedHistory));
    } else {
      // Seed initial realistic test results
      const initialHistory: TestAttempt[] = [
        {
          id: 'test-1',
          title: 'QA Sectional - Arithmetic Special',
          type: 'Sectional',
          date: '2026-06-25',
          totalQuestions: 10,
          attempted: 8,
          correct: 6,
          score: 16, // 6*3 - 2*1 = 16
          accuracy: 75,
          timeSpent: 960,
          sectionBreakdown: {
            VARC: { attempted: 0, correct: 0, timeSpent: 0 },
            DILR: { attempted: 0, correct: 0, timeSpent: 0 },
            QA: { attempted: 8, correct: 6, timeSpent: 960 },
          },
          mistakeCounts: {
            'Conceptual Error': 1,
            'Calculation Error': 1,
            'Careless Mistake': 0,
            'Misread Question': 0,
            'Poor Time Management': 0,
            'Lucky Guess': 0,
            'Incorrect Elimination': 0,
            'Panic Under Time Pressure': 0,
          },
          questionsAnswered: [
            { questionId: 'qa-arith-1', userAnswer: '1', isCorrect: true, timeSpent: 90 },
            { questionId: 'qa-alg-1', userAnswer: '4', isCorrect: true, timeSpent: 110 },
            { questionId: 'qa-geom-1', userAnswer: '0', isCorrect: true, timeSpent: 95 },
            { questionId: 'qa-num-1', userAnswer: '1', isCorrect: true, timeSpent: 45 },
            { questionId: 'qa-mod-1', userAnswer: '0', isCorrect: true, timeSpent: 60 },
          ],
        },
        {
          id: 'test-2',
          title: 'Full CAT Mock - Diagnostic 1',
          type: 'Full Mock',
          date: '2026-07-02',
          totalQuestions: 20,
          attempted: 15,
          correct: 11,
          score: 29, // 11*3 - 4*1 = 29
          accuracy: 73,
          timeSpent: 1800,
          sectionBreakdown: {
            VARC: { attempted: 4, correct: 3, timeSpent: 400 },
            DILR: { attempted: 6, correct: 4, timeSpent: 800 },
            QA: { attempted: 5, correct: 4, timeSpent: 600 },
          },
          mistakeCounts: {
            'Conceptual Error': 1,
            'Calculation Error': 0,
            'Careless Mistake': 1,
            'Misread Question': 1,
            'Poor Time Management': 0,
            'Lucky Guess': 0,
            'Incorrect Elimination': 1,
            'Panic Under Time Pressure': 0,
          },
          questionsAnswered: [],
        },
      ];
      setTestHistory(initialHistory);
      localStorage.setItem('cat_test_history', JSON.stringify(initialHistory));
    }

    if (storedGoals) {
      setActiveGoals(JSON.parse(storedGoals));
    } else {
      const defaultGoals: Goal[] = [
        { id: 'g-1', title: 'Complete Algebra Formula Revision', targetValue: 1, currentValue: 0, metric: 'Sheet', category: 'algebra' },
        { id: 'g-2', title: 'Attempt 5 Sectional Mock Tests', targetValue: 5, currentValue: 2, metric: 'Tests', category: 'mock-tests' },
        { id: 'g-3', title: 'Daily Study Hours', targetValue: 3, currentValue: 2.1, metric: 'Hours', category: 'study-hours' },
        { id: 'g-4', title: 'Improve QA Accuracy to 80%', targetValue: 80, currentValue: 75, metric: '%', category: 'accuracy' },
      ];
      setActiveGoals(defaultGoals);
      localStorage.setItem('cat_goals', JSON.stringify(defaultGoals));
    }

    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    } else {
      const defaultAchievements: Achievement[] = [
        { id: 'a-1', title: 'Consistency King', description: 'Study 7 days in a row', badgeCode: 'Zap', unlockedAt: '2026-07-05T10:00:00Z' },
        { id: 'a-2', title: 'Accuracy Guru', description: 'Achieve >85% accuracy in any sectional test', badgeCode: 'Target', unlockedAt: '2026-06-25T11:00:00Z' },
        { id: 'a-3', title: 'Speed Demon', description: 'Solve a hard QA question under 45 seconds', badgeCode: 'Flame' },
        { id: 'a-4', title: 'Set Theory Champ', description: 'Get a perfect score on a DILR Venn Diagram set', badgeCode: 'Layers' },
        { id: 'a-5', title: 'Admin Mastermind', description: 'Create a custom question in the bank', badgeCode: 'Settings' },
      ];
      setAchievements(defaultAchievements);
      localStorage.setItem('cat_achievements', JSON.stringify(defaultAchievements));
    }

    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    } else {
      const defaultFlashcards: Flashcard[] = [
        { id: 'f-1', category: 'Formula', front: 'Sum of internal angles of an n-sided polygon', back: '(n - 2) * 180 degrees', isFavorite: true, topic: 'Geometry' },
        { id: 'f-2', category: 'Vocabulary', front: 'Equivocating', back: 'Using ambiguous language to conceal the truth or avoid committing oneself', isFavorite: false, topic: 'VARC' },
        { id: 'f-3', category: 'Shortcut', front: 'Euler\'s Totient function for prime p', back: 'φ(p) = p - 1. Used to calculate remainders of type a^b mod p.', isFavorite: true, topic: 'Number System' },
        { id: 'f-4', category: 'Concept', front: 'Stars and Bars theorem (distributions)', back: 'Ways to distribute n identical items among r distinct bins such that each child gets at least 1 is (n-1)C(r-1); if empty bins allowed: (n+r-1)C(r-1).', isFavorite: false, topic: 'Modern Math' },
        { id: 'f-5', category: 'Vocabulary', front: 'Anachronism', back: 'A thing belonging or appropriate to a period other than that in which it exists, especially a thing that is conspicuously old-fashioned', isFavorite: false, topic: 'VARC' },
        { id: 'f-6', category: 'Formula', front: 'Area of an equilateral triangle with side "a"', back: '(√3 / 4) * a^2', isFavorite: false, topic: 'Geometry' },
        { id: 'f-7', category: 'Shortcut', front: 'Work & Efficiency Shortcut', back: 'If A does work in "a" days and B in "b" days, together they take (a * b) / (a + b) days.', isFavorite: false, topic: 'Arithmetic' },
      ];
      setFlashcards(defaultFlashcards);
      localStorage.setItem('cat_flashcards', JSON.stringify(defaultFlashcards));
    }

    if (storedSpaced) {
      setSpacedRepetition(JSON.parse(storedSpaced));
    } else {
      // Setup some default spaced repetition items due today
      const todayISO = new Date().toISOString().split('T')[0];
      const defaultSpaced: SpacedRepetitionCard[] = [
        { id: 'sr-1', questionId: 'qa-alg-1', intervalDays: 1, nextReviewDate: todayISO, history: [] },
        { id: 'sr-2', questionId: 'varc-pj-1', intervalDays: 3, nextReviewDate: todayISO, history: [] },
        { id: 'sr-3', questionId: 'dilr-set-1-q2', intervalDays: 7, nextReviewDate: todayISO, history: [] },
      ];
      setSpacedRepetition(defaultSpaced);
      localStorage.setItem('cat_spaced', JSON.stringify(defaultSpaced));
    }

    if (storedChat) {
      setChatMessages(JSON.parse(storedChat));
    } else {
      const defaultChat: ChatMessage[] = [
        { id: 'c-1', sender: 'ai', text: 'Hello Yash! I am your AI CAT mentor. I have analyzed your previous performance. You are doing exceptionally well in Arithmetic, but your speed in Geometry and Algebra can be optimized. How can I help you today?', timestamp: '08:30 AM' },
      ];
      setChatMessages(defaultChat);
      localStorage.setItem('cat_chat', JSON.stringify(defaultChat));
    }

    if (storedQuestions) {
      setQuestions([...initialQuestions, ...JSON.parse(storedQuestions)]);
    }
  }, []);

  const login = (email: string, name?: string) => {
    const defaultUser: UserProfile = {
      name: name || 'Yash Mohan',
      email: email,
      targetPercentile: 99.5,
      estimatedPercentile: 94.6,
      studyStreak: 8,
      studyHoursToday: 2.1,
      solvedCount: 154,
      completedTestsCount: 7,
      accuracy: 74,
      aiReadinessScore: 78,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    setUser(defaultUser);
    localStorage.setItem('cat_user', JSON.stringify(defaultUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cat_user');
  };

  const addChatMessage = (text: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: timeString,
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    localStorage.setItem('cat_chat', JSON.stringify(newMessages));

    // Simple Mentor response engine
    setTimeout(() => {
      let aiResponseText = `I hear you. Let's work on this topic together. Do you want me to generate some practice questions on it or teach you a shortcut?`;
      const query = text.toLowerCase();
      if (query.includes('formula') || query.includes('geometry') || query.includes('area')) {
        aiResponseText = `For Geometry, remember the crucial shortcut for the area of a triangle: Area = 1/2 * a * b * sin(C). If sin(C) = 1, it's a right triangle! Let's practice writing this down. I've added a new flashcard to your deck for revision!`;
      } else if (query.includes('shortcut') || query.includes('math') || query.includes('solve')) {
        aiResponseText = `In QA, using options elimination is key. For TITA questions, focus on Fermat's Little Theorem (a^(p-1) mod p = 1) or Euler's Totient function to bypass heavy calculations. It saves an average of 45 seconds per question!`;
      } else if (query.includes('dilr') || query.includes('sets') || query.includes('seating')) {
        aiResponseText = `In DILR, your selection rate is 70%, but you spend over 12 minutes on hard arrangement sets. I advise: scan all 4 sets in the first 5 minutes. Classify them, and attempt the sets with simple Venn diagrams or tables first. Skip games & tournaments if the rules take more than 2 pages to explain.`;
      } else if (query.includes('varc') || query.includes('rc') || query.includes('reading')) {
        aiResponseText = `For Reading Comprehension, prioritize understanding the author's tone and primary purpose. Avoid 'extreme' options containing words like 'always', 'never', 'only', or 'absolutely'. The correct answer in VARC is usually moderate and directly supported by paragraph scope.`;
      } else if (query.includes('motivation') || query.includes('stress') || query.includes('panic')) {
        aiResponseText = `CAT is not a test of knowledge, it is a test of decision-making under pressure. You don't need 100% score for a 99% percentile; even a 50% net score is historically enough! Take a deep breath. You've solved 150+ questions and maintained an 8-day study streak. You are on track!`;
      }

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...newMessages, aiMsg];
      setChatMessages(finalMessages);
      localStorage.setItem('cat_chat', JSON.stringify(finalMessages));
    }, 1000);
  };

  const submitTest = (attemptData: Omit<TestAttempt, 'id' | 'date'>) => {
    if (!user) return;

    const id = 'test-' + Math.random().toString(36).substr(2, 9);
    const date = new Date().toISOString().split('T')[0];
    const newAttempt: TestAttempt = {
      ...attemptData,
      id,
      date,
    };

    const newHistory = [newAttempt, ...testHistory];
    setTestHistory(newHistory);
    localStorage.setItem('cat_test_history', JSON.stringify(newHistory));

    // Update User Stats
    const totalSolved = user.solvedCount + attemptData.attempted;
    const totalTests = user.completedTestsCount + 1;
    // Calculate new overall accuracy weighted by questions attempted
    const newAccuracy = Math.round(
      ((user.accuracy * user.solvedCount) + (attemptData.accuracy * attemptData.attempted)) /
      (user.solvedCount + attemptData.attempted)
    );

    // Dynamic percentile simulator based on performance
    let percentileChange = 0;
    if (attemptData.accuracy > 80) percentileChange = 0.5;
    else if (attemptData.accuracy > 70) percentileChange = 0.2;
    else if (attemptData.accuracy < 50) percentileChange = -0.3;

    const newEstimatedPercentile = Math.min(99.99, Math.max(80.0, +(user.estimatedPercentile + percentileChange).toFixed(2)));
    const newAIReadinessScore = Math.min(100, Math.max(50, Math.round(newAccuracy * 0.85 + (totalTests * 2))));

    const updatedUser: UserProfile = {
      ...user,
      solvedCount: totalSolved,
      completedTestsCount: totalTests,
      accuracy: newAccuracy,
      estimatedPercentile: newEstimatedPercentile,
      aiReadinessScore: newAIReadinessScore,
    };

    setUser(updatedUser);
    localStorage.setItem('cat_user', JSON.stringify(updatedUser));

    // Spaced repetition schedule for incorrect questions
    const newSpacedCards: SpacedRepetitionCard[] = [...spacedRepetition];
    attemptData.questionsAnswered.forEach((q) => {
      if (!q.isCorrect) {
        // Schedule in 1 day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const cardId = 'sr-' + Math.random().toString(36).substr(2, 9);
        newSpacedCards.push({
          id: cardId,
          questionId: q.questionId,
          intervalDays: 1,
          nextReviewDate: tomorrow.toISOString().split('T')[0],
          history: [],
        });
      }
    });
    setSpacedRepetition(newSpacedCards);
    localStorage.setItem('cat_spaced', JSON.stringify(newSpacedCards));

    // Check goals progress
    const updatedGoals = activeGoals.map((goal) => {
      if (goal.category === 'mock-tests') {
        return { ...goal, currentValue: Math.min(goal.targetValue, goal.currentValue + 1) };
      }
      if (goal.category === 'questions') {
        return { ...goal, currentValue: Math.min(goal.targetValue, goal.currentValue + attemptData.attempted) };
      }
      if (goal.category === 'accuracy' && attemptData.title.includes('QA')) {
        return { ...goal, currentValue: Math.round((goal.currentValue + attemptData.accuracy) / 2) };
      }
      return goal;
    });
    setActiveGoals(updatedGoals);
    localStorage.setItem('cat_goals', JSON.stringify(updatedGoals));

    // Check badges unlocks
    const updatedAchievements = achievements.map((ach) => {
      if (ach.id === 'a-2' && !ach.unlockedAt && attemptData.accuracy >= 85) {
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      if (ach.id === 'a-4' && !ach.unlockedAt && attemptData.accuracy === 100 && attemptData.title.includes('Venn')) {
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });
    setAchievements(updatedAchievements);
    localStorage.setItem('cat_achievements', JSON.stringify(updatedAchievements));
  };

  const toggleFlashcardFavorite = (id: string) => {
    const updated = flashcards.map((card) =>
      card.id === id ? { ...card, isFavorite: !card.isFavorite } : card
    );
    setFlashcards(updated);
    localStorage.setItem('cat_flashcards', JSON.stringify(updated));
  };

  const answerSpacedCard = (id: string, correct: boolean) => {
    const intervals = [1, 3, 7, 14, 30];
    const updated = spacedRepetition.map((card) => {
      if (card.id !== id) return card;

      let nextIndex = 0;
      if (correct) {
        const currentIndex = intervals.indexOf(card.intervalDays);
        nextIndex = Math.min(intervals.length - 1, currentIndex + 1);
      } else {
        // Fall back to 1 day if incorrect
        nextIndex = 0;
      }

      const nextInterval = intervals[nextIndex];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextInterval);

      return {
        ...card,
        intervalDays: nextInterval,
        nextReviewDate: nextDate.toISOString().split('T')[0],
        history: [...card.history, { date: new Date().toISOString().split('T')[0], correct }],
      };
    });

    setSpacedRepetition(updated);
    localStorage.setItem('cat_spaced', JSON.stringify(updated));
  };

  const addGoal = (title: string, targetValue: number, metric: string, category: Goal['category']) => {
    const newGoal: Goal = {
      id: 'g-' + Math.random().toString(36).substr(2, 9),
      title,
      targetValue,
      currentValue: 0,
      metric,
      category,
    };
    const updated = [...activeGoals, newGoal];
    setActiveGoals(updated);
    localStorage.setItem('cat_goals', JSON.stringify(updated));
  };

  const addQuestion = (qData: Omit<Question, 'id'>) => {
    const id = 'custom-' + Math.random().toString(36).substr(2, 9);
    const newQ: Question = { ...qData, id };
    const customList = [...questions.filter((q) => q.id.startsWith('custom-')), newQ];
    localStorage.setItem('cat_custom_questions', JSON.stringify(customList));

    setQuestions([...questions, newQ]);

    // Unlock Admin Mastermind badge
    const updatedAchievements = achievements.map((ach) => {
      if (ach.id === 'a-5' && !ach.unlockedAt) {
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });
    setAchievements(updatedAchievements);
    localStorage.setItem('cat_achievements', JSON.stringify(updatedAchievements));
  };

  const deleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);

    if (id.startsWith('custom-')) {
      const customList = updatedQuestions.filter((q) => q.id.startsWith('custom-'));
      localStorage.setItem('cat_custom_questions', JSON.stringify(customList));
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        login,
        logout,
        questions,
        testHistory,
        activeGoals,
        achievements,
        flashcards,
        spacedRepetition,
        chatMessages,
        addChatMessage,
        submitTest,
        toggleFlashcardFavorite,
        answerSpacedCard,
        addGoal,
        addQuestion,
        deleteQuestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
