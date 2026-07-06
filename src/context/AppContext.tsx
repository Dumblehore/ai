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
  recommendationsJson: string;
  role: string;
}

export interface TestAttempt {
  id: string;
  title: string;
  type: 'Full Mock' | 'Sectional' | 'Topic-wise' | 'Custom' | 'Previous Year';
  date: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  score: number;
  accuracy: number;
  timeSpent: number;
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
  badgeCode: string;
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
  intervalDays: number;
  nextReviewDate: string;
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
  loadingState: boolean;
  login: (email: string, name?: string, password?: string, isSignUp?: boolean) => Promise<boolean>;
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
  toggleRecommendation: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [testHistory, setTestHistory] = useState<TestAttempt[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [spacedRepetition, setSpacedRepetition] = useState<SpacedRepetitionCard[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Apply Theme on load
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

  // Sync state with DB
  const syncStateFromApi = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setTestHistory(data.testHistory);
        setActiveGoals(data.activeGoals);
        setFlashcards(data.flashcards);
        setSpacedRepetition(data.spacedRepetition);
        setChatMessages(data.chatMessages);

        // Update achievements based on mock details
        const completedCount = data.profile.completedTestsCount;
        const accuracyVal = data.profile.accuracy;
        const streakVal = data.profile.studyStreak;

        const defaultAchievements: Achievement[] = [
          { id: 'a-1', title: 'Consistency King', description: 'Study 7 days in a row', badgeCode: 'Zap', unlockedAt: streakVal >= 7 ? new Date().toISOString() : undefined },
          { id: 'a-2', title: 'Accuracy Guru', description: 'Achieve >85% accuracy in any sectional test', badgeCode: 'Target', unlockedAt: accuracyVal >= 80 ? new Date().toISOString() : undefined },
          { id: 'a-3', title: 'Speed Demon', description: 'Solve a hard QA question under 45 seconds', badgeCode: 'Flame' },
          { id: 'a-4', title: 'Set Theory Champ', description: 'Get a perfect score on a DILR Venn Diagram set', badgeCode: 'Layers' },
          { id: 'a-5', title: 'Admin Mastermind', description: 'Create a custom question in the bank', badgeCode: 'Settings' },
        ];
        setAchievements(defaultAchievements);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('API connection failed, falling back to mock logs:', e);
    } finally {
      setLoadingState(false);
    }
  };

  // Sync on mount
  useEffect(() => {
    syncStateFromApi();
    const storedQuestions = localStorage.getItem('cat_custom_questions');
    if (storedQuestions) {
      setQuestions([...initialQuestions, ...JSON.parse(storedQuestions)]);
    }
  }, []);

  const login = async (email: string, name?: string, password?: string, isSignUp = false): Promise<boolean> => {
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = {
        email,
        password: password || 'password123',
        ...(isSignUp && { name: name || 'Student' })
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await syncStateFromApi();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTestHistory([]);
      setActiveGoals([]);
      setFlashcards([]);
      setSpacedRepetition([]);
      setChatMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const addChatMessage = async (text: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localUserMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: timeString,
    };

    // Optimistic local update
    const tempMessages = [...chatMessages, localUserMsg];
    setChatMessages(tempMessages);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages([...tempMessages, data.aiMessage]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitTest = async (attemptData: Omit<TestAttempt, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData)
      });

      if (res.ok) {
        await syncStateFromApi();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFlashcardFavorite = async (id: string) => {
    try {
      const res = await fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: id })
      });

      if (res.ok) {
        // Toggle locally
        setFlashcards(flashcards.map(card => 
          card.id === id ? { ...card, isFavorite: !card.isFavorite } : card
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const answerSpacedCard = async (id: string, correct: boolean) => {
    try {
      const res = await fetch('/api/spaced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: id, correct })
      });

      if (res.ok) {
        await syncStateFromApi();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addGoal = async (title: string, targetValue: number, metric: string, category: Goal['category']) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, targetValue, metric, category })
      });

      if (res.ok) {
        await syncStateFromApi();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addQuestion = (qData: Omit<Question, 'id'>) => {
    const id = 'custom-' + Math.random().toString(36).substr(2, 9);
    const newQ: Question = { ...qData, id };
    const customList = [...questions.filter((q) => q.id.startsWith('custom-')), newQ];
    localStorage.setItem('cat_custom_questions', JSON.stringify(customList));
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);

    if (id.startsWith('custom-')) {
      const customList = updatedQuestions.filter((q) => q.id.startsWith('custom-'));
      localStorage.setItem('cat_custom_questions', JSON.stringify(customList));
    }
  };

  const toggleRecommendation = async (id: string) => {
    if (!user) return;
    try {
      const recs = JSON.parse(user.recommendationsJson || '[]');
      const updated = recs.map((r: any) => (r.id === id ? { ...r, done: !r.done } : r));
      const recommendationsJson = JSON.stringify(updated);

      // Optimistic state update
      setUser({ ...user, recommendationsJson });

      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationsJson })
      });
    } catch (e) {
      console.error('Error toggling recommendation:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        loadingState,
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
        toggleRecommendation,
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
