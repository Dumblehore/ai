'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { preprocessLaTeX } from '@/lib/mathUtils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpacedRepetition() {
  const { spacedRepetition, questions, answerSpacedCard } = useApp();
  
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [revealSolution, setRevealSolution] = useState(false);
  const [selectedUserAnswer, setSelectedUserAnswer] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const todayISO = new Date().toISOString().split('T')[0];

  // Filter cards due today or overdue
  const dueCards = spacedRepetition.filter(card => card.nextReviewDate <= todayISO);

  // Statistics
  const totalCards = spacedRepetition.length;
  const dueCount = dueCards.length;
  
  // Calculate retention rate based on history
  const getRetentionRate = () => {
    let correct = 0;
    let totalAttempts = 0;
    spacedRepetition.forEach(card => {
      card.history.forEach(h => {
        totalAttempts++;
        if (h.correct) correct++;
      });
    });
    if (totalAttempts === 0) return 86; // default high retention representation
    return Math.round((correct / totalAttempts) * 100);
  };

  const retentionRate = getRetentionRate();

  // Find question details for the currently active due card
  const activeCard = dueCards[currentReviewIndex];
  const activeQuestion = activeCard 
    ? questions.find(q => q.id === activeCard.questionId) 
    : null;

  const handleReveal = () => {
    setRevealSolution(true);
  };

  const handleGrade = (correct: boolean) => {
    if (!activeCard) return;
    
    // Call context to reschedule card
    answerSpacedCard(activeCard.id, correct);

    // Trigger feedback message
    setFeedbackMsg(correct ? "Excellent! Pushed to next interval." : "Scheduled for re-review tomorrow.");

    setTimeout(() => {
      setFeedbackMsg(null);
      setRevealSolution(false);
      setSelectedUserAnswer(null);
      
      // If we are at the end, it will naturally resolve
      if (currentReviewIndex >= dueCount - 1) {
        setCurrentReviewIndex(0);
      }
    }, 1500);
  };

  // Card interval distribution counts
  const intervalsDist = {
    '1 Day': spacedRepetition.filter(c => c.intervalDays === 1).length,
    '3 Days': spacedRepetition.filter(c => c.intervalDays === 3).length,
    '7 Days': spacedRepetition.filter(c => c.intervalDays === 7).length,
    '14 Days': spacedRepetition.filter(c => c.intervalDays === 14).length,
    '30 Days': spacedRepetition.filter(c => c.intervalDays === 30).length,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Layers className="text-primary" /> Spaced Revision Engine
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Automatically schedules incorrect exam questions to reappear in intervals. Correcting reviews builds long-term retrieval memory.
        </p>
      </div>

      {/* Grid: Left analytics and card details, Right card reviewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 cols): Retention Analytics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* General Stats */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-extrabold text-base flex items-center gap-2 text-foreground">
              <TrendingUp size={18} className="text-primary" /> Revision Deck Analytics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/40 border border-border p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Deck Cards</span>
                <p className="text-2xl font-bold text-foreground">{totalCards}</p>
                <span className="text-[9px] text-muted-foreground block">Flagged from test blunders</span>
              </div>
              <div className="bg-secondary/40 border border-border p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Memory Retention</span>
                <p className="text-2xl font-bold text-primary">{retentionRate}%</p>
                <span className="text-[9px] text-muted-foreground block">Target threshold is 85%</span>
              </div>
            </div>

            {/* Stage Distribution progress bars */}
            <div className="space-y-3.5 border-t border-border pt-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">Leitner Box Stages</span>
              
              {Object.entries(intervalsDist).map(([box, count]) => {
                const percent = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                return (
                  <div key={box} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">{box} stage</span>
                      <span className="text-muted-foreground">{count} cards ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-900 dark:text-amber-300 space-y-1 leading-normal">
              <p className="font-bold">Why Spaced Repetition?</p>
              <p className="font-medium opacity-90">
                Cognitive psychology shows that reviewing mistakes right before they vanish from short-term memory (intervals: 1d, 3d, 7d, 14d, 30d) permanently encodes the concept in long-term memory.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Spaced Repetition Card Reviewer */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm min-h-[420px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Feedback notification overlay */}
            <AnimatePresence>
              {feedbackMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex items-center justify-center p-6 text-center"
                >
                  <div className="space-y-3">
                    {feedbackMsg.includes('Excellent') ? (
                      <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                    ) : (
                      <Clock size={48} className="text-amber-500 mx-auto" />
                    )}
                    <p className="font-extrabold text-base text-foreground">{feedbackMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Check if cards are due */}
            {dueCount === 0 || !activeQuestion ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    You have completed all scheduled spaced revisions for today. Incorrect answers on future tests will automatically appear here.
                  </p>
                </div>
              </div>
            ) : (
              /* Review Active Question Card */
              <div className="flex-1 flex flex-col justify-between space-y-6">
                
                {/* Card Header metadata */}
                <div className="flex justify-between items-center border-b border-border/80 pb-3 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <BookOpen size={14} className="text-primary" /> Review {currentReviewIndex + 1} of {dueCount}
                  </span>
                  <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Due Today ({activeCard.intervalDays}d Stage)
                  </span>
                </div>

                {/* Question Body */}
                <div className="space-y-4 flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Topic: {activeQuestion.topic} &gt; {activeQuestion.subtopic} ({activeQuestion.difficulty} Difficulty)
                  </div>
                  
                  {activeQuestion.passage && (
                    <div className="bg-secondary/40 border border-border p-3.5 rounded-xl text-xs max-h-36 overflow-y-auto leading-relaxed select-text font-serif italic mb-3">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {preprocessLaTeX(activeQuestion.passage)}
                      </ReactMarkdown>
                    </div>
                  )}

                  <div className="text-sm font-semibold text-foreground leading-relaxed whitespace-pre-line select-text">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {preprocessLaTeX(activeQuestion.questionText)}
                    </ReactMarkdown>
                  </div>

                  {/* Option display (just visual preview, user can think or click show solution) */}
                  {activeQuestion.type === 'MCQ' && activeQuestion.options && (
                    <div className="grid grid-cols-1 gap-2 pt-2 text-xs">
                      {activeQuestion.options.map((opt, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedUserAnswer(i.toString())}
                          className={`p-3 border rounded-xl font-medium transition cursor-pointer select-none ${
                            selectedUserAnswer === i.toString()
                              ? 'bg-primary/5 border-primary/50 text-foreground'
                              : 'bg-card border-border hover:bg-secondary/20'
                          }`}
                        >
                          <span className="font-bold text-primary mr-1.5">{String.fromCharCode(65 + i)}.</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeQuestion.type === 'TITA' && (
                    <div className="max-w-xs pt-2">
                      <input
                        type="text"
                        placeholder="Solve in your notepad, then reveal solution"
                        disabled
                        className="w-full bg-secondary/50 border border-border/80 rounded-lg px-3 py-2 text-xs text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* Reveal Controls */}
                <div className="border-t border-border pt-4">
                  {!revealSolution ? (
                    <button
                      onClick={handleReveal}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      Reveal Correct Answer & Mentor Solution <Sparkles size={14} className="fill-current" />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Solution breakdown display */}
                      <div className="bg-secondary/40 border border-border/80 p-4 rounded-xl space-y-3 text-xs leading-normal">
                        <div>
                          <span className="font-extrabold text-foreground block">
                            Correct Answer: <span className="text-emerald-500 font-black">
                              {activeQuestion.type === 'MCQ' && activeQuestion.options 
                                ? activeQuestion.options[parseInt(activeQuestion.correctAnswer)] 
                                : activeQuestion.correctAnswer}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-muted-foreground block uppercase text-[9px]">Step-by-step Solution:</span>
                          <div className="text-muted-foreground mt-0.5 space-y-1">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {preprocessLaTeX(activeQuestion.explanation)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        {activeQuestion.shortcut && (
                          <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-lg text-[11px]">
                            <span className="font-bold text-primary block">Fastest Shortcut:</span>
                            <div className="text-muted-foreground mt-0.5 space-y-1">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {preprocessLaTeX(activeQuestion.shortcut)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grading options */}
                      <div className="space-y-2 text-center">
                        <p className="text-[10px] text-muted-foreground font-semibold">Did you solve this correctly?</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleGrade(false)}
                            className="bg-destructive/10 border border-destructive/20 hover:bg-destructive hover:text-white text-destructive font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={16} /> Got it Wrong
                          </button>
                          <button
                            onClick={() => handleGrade(true)}
                            className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={16} /> Got it Right
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
