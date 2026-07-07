'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp, TestAttempt } from '@/context/AppContext';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Flame, 
  AlertTriangle, 
  Clock, 
  Award,
  ChevronRight,
  Send,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const CoachContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { testHistory, chatMessages, addChatMessage, questions } = useApp();
  
  const showLatestReport = searchParams.get('report') === 'latest';
  const [activeTab, setActiveTab] = useState<'coach' | 'report'>('coach');
  const [inputText, setInputText] = useState('');
  const [selectedReviewQId, setSelectedReviewQId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Set default tab on load
  useEffect(() => {
    if (showLatestReport && testHistory.length > 0) {
      setActiveTab('report');
    }
  }, [showLatestReport, testHistory]);

  const latestTest: TestAttempt | undefined = testHistory[0];

  // AI Advice Generator based on test results
  const getAiCoachingFeedback = (test: TestAttempt | undefined) => {
    if (!test) {
      return [
        "Your Arithmetic accuracy is solid at 80%. Let\'s maintain this.",
        "Scan DILR sets for 3 minutes before attempting to filter out heavy seating matrices.",
        "Revise your quadratic formula sheets. Spaced cards are waiting in your deck.",
      ];
    }

    const feedbacks = [];
    if (test.accuracy >= 80) {
      feedbacks.push("Your selection accuracy is excellent. You are targeting the correct questions.");
    } else {
      feedbacks.push("You consistently attempt difficult Level 5 questions early. Prioritize scanning the section for Easy/Medium ones first.");
    }

    // Mistake analysis advice
    const conceptual = test.mistakeCounts['Conceptual Error'] || 0;
    const careless = test.mistakeCounts['Careless Mistake'] || 0;
    const calc = test.mistakeCounts['Calculation Error'] || 0;
    
    if (conceptual > careless) {
      feedbacks.push("Your errors are predominantly conceptual. Pause testing and revise the Algebra & Geometry formulas.");
    } else {
      feedbacks.push("Your errors are mostly Careless slips. Double-check your basic arithmetic equations before entering TITA responses.");
    }

    // Section specific advice
    if (test.sectionBreakdown.QA.attempted > 0) {
      feedbacks.push("Attempt easier Arithmetic questions before moving to coordinate Geometry.");
    }
    if (test.sectionBreakdown.VARC.attempted > 0) {
      feedbacks.push("Your Reading Comprehension accuracy remains a primary strength. Build on this buffer.");
    }

    return feedbacks;
  };

  const aiFeedback = getAiCoachingFeedback(latestTest);

  // Prepare mistake matrix data for Recharts
  const getMistakeData = (test: TestAttempt | undefined) => {
    if (!test) return [];
    return Object.entries(test.mistakeCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  const mistakeData = getMistakeData(latestTest);
  const MISTAKE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#14b8a6', '#6366f1'];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addChatMessage(inputText);
    setInputText('');
  };

  const triggerQuickPrompt = (prompt: string) => {
    addChatMessage(prompt);
  };

  // Find question details for Review
  const getQuestionDetails = (qId: string) => {
    return questions.find(q => q.id === qId);
  };

  return (
    <div className="space-y-8">
      {/* Header Tabs */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Mentor & Diagnostics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review test diagnostics, consult the study coach, and audit careless errors.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-muted/60 p-1 rounded-lg border border-border text-xs">
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-4 py-2 rounded-md font-bold transition flex items-center gap-1.5 ${
              activeTab === 'coach' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare size={14} /> AI Study Coach
          </button>
          <button
            onClick={() => setActiveTab('report')}
            disabled={testHistory.length === 0}
            className={`px-4 py-2 rounded-md font-bold transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === 'report' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp size={14} /> Performance Report
          </button>
        </div>
      </div>

      {/* Dynamic Tab Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side View */}
        <div className="lg:col-span-7 h-full flex flex-col">
          
          {activeTab === 'coach' ? (
            /* Chat Interface */
            <div className="bg-card border border-border rounded-2xl flex flex-col h-[550px] shadow-sm relative overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-secondary/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-sm">Active Coach: Aether Mentor</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Prepped on recent QA & DILR logs</span>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                        isAi ? 'bg-primary text-white' : 'bg-secondary border border-border text-foreground'
                      }`}>
                        {isAi ? 'AI' : 'Me'}
                      </div>
                      
                      <div className="space-y-1">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isAi 
                            ? 'bg-secondary/60 text-foreground border border-border/40 rounded-tl-none' 
                            : 'bg-primary text-primary-foreground rounded-tr-none'
                        }`}>
                          {isAi ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                              className="prose dark:prose-invert max-w-none text-xs break-words space-y-1.5"
                            >
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            msg.text
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground block px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Options */}
              <div className="px-4 py-2 border-t border-border/50 bg-secondary/10 flex gap-2 overflow-x-auto text-[10px]">
                <button 
                  onClick={() => triggerQuickPrompt("Explain DILR arrangements scanning shortcut")}
                  className="bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full font-semibold shrink-0"
                >
                  DILR Shortcut
                </button>
                <button 
                  onClick={() => triggerQuickPrompt("Give me a Geometry formula review")}
                  className="bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full font-semibold shrink-0"
                >
                  Geometry formula
                </button>
                <button 
                  onClick={() => triggerQuickPrompt("Explain relative speed train question math")}
                  className="bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full font-semibold shrink-0"
                >
                  Explain Train Question
                </button>
                <button 
                  onClick={() => triggerQuickPrompt("Suggest a target score for 99%ile in DILR")}
                  className="bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full font-semibold shrink-0"
                >
                  99%ile Targets
                </button>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a doubt, request shortcuts, or ask to teach concept..."
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white p-2.5 rounded-xl transition shadow shadow-primary/20 shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          ) : (
            /* Post Test Analysis Report view */
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-extrabold text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Test Score Diagnostic
                </h2>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-secondary/40 border border-border/80 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</span>
                    <p className="text-xl font-bold text-foreground">{latestTest?.score} pts</p>
                    <span className="text-[9px] text-muted-foreground block">{latestTest?.correct}C / {latestTest?.attempted - latestTest?.correct}W</span>
                  </div>

                  <div className="bg-secondary/40 border border-border/80 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Accuracy</span>
                    <p className="text-xl font-bold text-primary">{latestTest?.accuracy}%</p>
                    <span className="text-[9px] text-muted-foreground block">Attempted {latestTest?.attempted} / {latestTest?.totalQuestions}</span>
                  </div>

                  <div className="bg-secondary/40 border border-border/80 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time Spent</span>
                    <p className="text-xl font-bold text-foreground">
                      {Math.floor((latestTest?.timeSpent || 0) / 60)}m { (latestTest?.timeSpent || 0) % 60 }s
                    </p>
                    <span className="text-[9px] text-muted-foreground block">Avg {Math.round((latestTest?.timeSpent || 0) / (latestTest?.attempted || 1))}s/q</span>
                  </div>
                </div>
              </div>

              {/* Mistake Heatmap chart */}
              {mistakeData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-extrabold text-base flex items-center gap-2">
                    <AlertTriangle size={18} className="text-primary" /> Mistake matrix distribution
                  </h2>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mistakeData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={130} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {mistakeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={MISTAKE_COLORS[index % MISTAKE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Panel (5 cols): AI recommendations or Question Reviewer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Coaching panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-12 w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Sparkles size={18} className="text-primary fill-current" /> AI Mentor Review
            </h2>

            <div className="space-y-3 text-xs">
              {aiFeedback.map((text, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-3 bg-secondary/40 border border-border/80 rounded-xl leading-normal">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-foreground/90 font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section Question Review panel (Toggled if in report view) */}
          {activeTab === 'report' && latestTest && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Solved Questions Audit
              </h2>
              <p className="text-[10px] text-muted-foreground">Select a question to inspect formulas, fastest shortcuts, and common traps.</p>

              <div className="grid grid-cols-5 gap-2 pb-2">
                {latestTest.questionsAnswered.map((item, idx) => (
                  <button
                    key={item.questionId}
                    onClick={() => setSelectedReviewQId(item.questionId)}
                    className={`h-9 rounded border transition flex items-center justify-center font-bold text-xs ${
                      selectedReviewQId === item.questionId 
                        ? 'ring-2 ring-primary ring-offset-1'
                        : ''
                    } ${
                      item.isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>

              {/* Selected Question Detail expansion panel */}
              {selectedReviewQId && (
                (() => {
                  const details = getQuestionDetails(selectedReviewQId);
                  const attemptDetails = latestTest.questionsAnswered.find(q => q.questionId === selectedReviewQId);
                  
                  if (!details) return null;

                  return (
                    <div className="border-t border-border pt-4 space-y-4 text-xs">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                        <span>{details.topic} ({details.difficulty})</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> User Time: {attemptDetails?.timeSpent}s / Ideal: {details.idealTime}s
                        </span>
                      </div>

                      <div className="bg-secondary/40 border border-border p-3 rounded-xl font-medium leading-relaxed text-foreground truncate max-h-16 whitespace-normal overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {details.questionText}
                        </ReactMarkdown>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block">✓ Step-by-Step Explanation:</span>
                          <div className="text-muted-foreground leading-normal mt-0.5 space-y-1">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {details.explanation}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {details.shortcut && (
                          <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl">
                            <span className="font-bold text-primary flex items-center gap-1">
                              <Sparkles size={12} className="fill-current" /> Fastest Mentor Shortcut:
                            </span>
                            <div className="text-muted-foreground leading-normal mt-1 space-y-1">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {details.shortcut}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {details.trap && (
                          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                            <span className="font-bold text-amber-500 flex items-center gap-1">
                              <AlertTriangle size={12} /> Avoid the Trap:
                            </span>
                            <div className="text-muted-foreground leading-normal mt-1 space-y-1">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {details.trap}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default function AIStudyCoach() {
  return (
    <Suspense fallback={
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <CoachContent />
    </Suspense>
  );
}
