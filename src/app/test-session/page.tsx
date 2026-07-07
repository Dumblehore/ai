'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp, TestAttempt } from '@/context/AppContext';
import { Question } from '@/data/questionsBank';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessLaTeX } from '@/lib/mathUtils';
import { 
  Calculator, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  CheckCircle,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  ClipboardList,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Sub-component that reads search parameters
const ExamSimulator: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { questions, submitTest, user } = useApp();

  // Load configuration from URL
  const testType = searchParams.get('type') || 'Custom';
  const paramSection = searchParams.get('section');
  const paramDiff = searchParams.get('difficulty');
  const paramQCount = parseInt(searchParams.get('qCount') || '5', 10);
  const paramTime = parseInt(searchParams.get('time') || '20', 10);

  // Filter questions based on configuration
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: answer }
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, 'unvisited' | 'not-answered' | 'answered' | 'marked-review' | 'marked-answered-review'>>({});
  const [timeLeft, setTimeLeft] = useState(paramTime * 60);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  // Post-Test Mistake Survey States
  const [showSurvey, setShowSurvey] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState<{ question: Question; chosenAnswer: string }[]>([]);
  const [surveyClassifications, setSurveyClassifications] = useState<Record<string, string>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize questions
  useEffect(() => {
    let qList = [...questions];

    // 1. Filter by Section if requested
    if (paramSection && paramSection !== 'All') {
      qList = qList.filter(q => q.section === paramSection);
    }

    // 2. Filter by Difficulty if requested
    if (paramDiff && paramDiff !== 'Mixed') {
      qList = qList.filter(q => q.difficulty === paramDiff);
    }

    // 3. Shuffle and slice
    let fallback = false;
    if (qList.length === 0) {
      qList = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(5, questions.length));
      fallback = true;
    } else {
      qList = qList.sort(() => Math.random() - 0.5).slice(0, paramQCount);
    }

    setFilteredQuestions(qList);
    setFallbackTriggered(fallback);

    // Initialize statuses
    const initialStatuses: typeof questionStatuses = {};
    qList.forEach((q, idx) => {
      initialStatuses[q.id] = idx === 0 ? 'not-answered' : 'unvisited';
    });
    setQuestionStatuses(initialStatuses);
    setLoading(false);
  }, [questions, paramSection, paramDiff, paramQCount]);

  // Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Trigger Auto-submit
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [filteredQuestions]);

  // Full Screen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeQuestion = filteredQuestions[currentIndex];

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || showSurvey) return;

      // Scoping: Ignore shortcuts if the user is currently typing in an input field
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      // Check key combos first to avoid priority collisions
      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        setIsCalculatorOpen(prev => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 's') {
        handleSaveNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrev();
      } else if (e.key === 'm') {
        handleMarkReview();
      } else if (e.key === 'c') {
        handleClearResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, filteredQuestions]);

  // Exam Actions
  const handleSelectOption = (optIndex: string) => {
    setAnswers({ ...answers, [activeQuestion.id]: optIndex });
  };

  const handleTitaInput = (val: string) => {
    setAnswers({ ...answers, [activeQuestion.id]: val });
  };

  const handleSaveNext = () => {
    const currentQ = filteredQuestions[currentIndex];
    const answerGiven = answers[currentQ.id];

    // Update Status
    const newStatus = answerGiven && answerGiven.trim() !== '' ? 'answered' : 'not-answered';
    setQuestionStatuses(prev => ({ ...prev, [currentQ.id]: newStatus }));

    // Move to next
    if (currentIndex < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      // Mark next question as not-answered if it was unvisited
      if (questionStatuses[nextQ.id] === 'unvisited') {
        setQuestionStatuses(prev => ({ ...prev, [nextQ.id]: 'not-answered' }));
      }
    }
  };

  const handleMarkReview = () => {
    const currentQ = filteredQuestions[currentIndex];
    const answerGiven = answers[currentQ.id];

    const newStatus = answerGiven && answerGiven.trim() !== '' ? 'marked-answered-review' : 'marked-review';
    setQuestionStatuses(prev => ({ ...prev, [currentQ.id]: newStatus }));

    // Move to next
    if (currentIndex < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      if (questionStatuses[nextQ.id] === 'unvisited') {
        setQuestionStatuses(prev => ({ ...prev, [nextQ.id]: 'not-answered' }));
      }
    }
  };

  const handleClearResponse = () => {
    const currentQ = filteredQuestions[currentIndex];
    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);

    setQuestionStatuses(prev => ({ ...prev, [currentQ.id]: 'not-answered' }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePaletteClick = (index: number) => {
    const clickedQ = filteredQuestions[index];
    setCurrentIndex(index);
    if (questionStatuses[clickedQ.id] === 'unvisited') {
      setQuestionStatuses(prev => ({ ...prev, [clickedQ.id]: 'not-answered' }));
    }
  };

  // Submit trigger
  const onSubmitClick = () => {
    setShowSubmitModal(true);
  };

  // Intermediate step to evaluate answers and launch Mistake Survey if wrong answers exist
  const handleFinalSubmit = (force = false) => {
    setShowSubmitModal(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Compute correct/incorrect details
    const wrongList: typeof incorrectAttempts = [];
    filteredQuestions.forEach((q) => {
      const chosen = answers[q.id];
      const isCorrect = chosen === q.correctAnswer;
      if (chosen && !isCorrect) {
        wrongList.push({ question: q, chosenAnswer: chosen });
      }
    });

    if (wrongList.length > 0 && !force) {
      setIncorrectAttempts(wrongList);
      // Initialize mistake selections to "Careless Mistake"
      const defaultSurvey: Record<string, string> = {};
      wrongList.forEach(item => {
        defaultSurvey[item.question.id] = 'Careless Mistake';
      });
      setSurveyClassifications(defaultSurvey);
      setShowSurvey(true);
    } else {
      // Direct submission
      saveTestResultsAndExit({});
    }
  };

  const saveTestResultsAndExit = (surveyData: Record<string, string>) => {
    // 1. Calculate Score
    let correct = 0;
    let attempted = 0;
    let score = 0;

    const questionsAnswered: TestAttempt['questionsAnswered'] = [];
    const sectionBreakdown: TestAttempt['sectionBreakdown'] = {
      VARC: { attempted: 0, correct: 0, timeSpent: 0 },
      DILR: { attempted: 0, correct: 0, timeSpent: 0 },
      QA: { attempted: 0, correct: 0, timeSpent: 0 },
    };

    const mistakeCounts: TestAttempt['mistakeCounts'] = {
      'Conceptual Error': 0,
      'Calculation Error': 0,
      'Careless Mistake': 0,
      'Misread Question': 0,
      'Poor Time Management': 0,
      'Lucky Guess': 0,
      'Incorrect Elimination': 0,
      'Panic Under Time Pressure': 0,
    };

    filteredQuestions.forEach((q) => {
      const chosen = answers[q.id];
      const isAttempted = chosen !== undefined && chosen.trim() !== '';
      const isCorrect = isAttempted && chosen === q.correctAnswer;
      
      const timeSpentPerQ = Math.round((paramTime * 60 - timeLeft) / filteredQuestions.length);

      if (isAttempted) {
        attempted++;
        sectionBreakdown[q.section].attempted++;

        if (isCorrect) {
          correct++;
          score += 3;
          sectionBreakdown[q.section].correct++;
        } else {
          // Negative marking only for incorrect MCQs, not TITA
          if (q.type === 'MCQ') {
            score -= 1;
          }
          // Increment mistake counters
          const mType = surveyData[q.id] || 'Careless Mistake';
          mistakeCounts[mType as keyof typeof mistakeCounts]++;
        }
      }

      sectionBreakdown[q.section].timeSpent += timeSpentPerQ;

      questionsAnswered.push({
        questionId: q.id,
        userAnswer: chosen || '',
        isCorrect,
        timeSpent: timeSpentPerQ,
        mistakeType: isAttempted && !isCorrect ? (surveyData[q.id] || 'Careless Mistake') : undefined
      });
    });

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeSpent = paramTime * 60 - timeLeft;

    // 2. Submit to app provider
    submitTest({
      title: `${testType} Test - ${paramSection || 'Mixed'} Drill`,
      type: testType as TestAttempt['type'],
      totalQuestions: filteredQuestions.length,
      attempted,
      correct,
      score,
      accuracy,
      timeSpent,
      percentile: 90.0,
      sectionBreakdown,
      mistakeCounts,
      questionsAnswered,
    });

    // 3. Exit to post-test analysis screen
    // We pass analysis page redirect
    router.push('/dashboard/coach?report=latest');
  };

  // Scientific Calculator Handlers
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === 'Back') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '=') {
      try {
        // Safe evaluation simulation
        // Replace scientific symbols before evaluating
        let expr = calcDisplay
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E');
        
        // Count unclosed brackets
        const openBrackets = (expr.match(/\(/g) || []).length;
        const closeBrackets = (expr.match(/\)/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          expr += ')';
        }

        // Security sanitation: Strip out all allowed mathematical terms.
        // If anything other than safe symbols remains, block evaluation.
        const checkExpr = expr.replace(/Math\.(sin|cos|tan|log|log10|sqrt|PI|E)/g, '').replace(/[0-9+\-*/().\s]/g, '');
        if (checkExpr.length === 0) {
          const result = new Function(`return ${expr}`)();
          setCalcDisplay(Number(result).toFixed(4).replace(/\.?0+$/, '')); // clean float display
        } else {
          setCalcDisplay('Error');
        }
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(prev => {
        if (prev === '0' || prev === 'Error') {
          return val;
        }
        return prev + val;
      });
    }
  };

  if (loading || filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center text-slate-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="font-semibold">Loading CAT Secure Test Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 flex flex-col font-sans select-none antialiased">
      
      {/* TCS iON Style Exam Top Bar */}
      <header className="bg-[#1e3a8a] text-white px-4 py-2 flex items-center justify-between shadow-md border-b border-blue-900 select-none">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-sm uppercase tracking-wide bg-blue-800 px-3 py-1 rounded border border-blue-700/60 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={14} className="fill-current animate-pulse text-yellow-300" /> AetherCAT Exam Engine
          </span>
          <h1 className="text-xs font-semibold text-blue-200 hidden md:block">
            Test Type: <span className="text-white font-bold">{testType} ({paramSection || 'Mixed Sections'})</span>
          </h1>
        </div>

        {/* Section timers and full screen */}
        <div className="flex items-center gap-4">
          <div className="bg-red-600 border border-red-500 text-white font-mono font-bold text-sm px-4 py-1 rounded shadow-sm flex items-center gap-1.5 animate-pulse">
            <Clock size={16} /> Time Left: {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={() => setIsCalculatorOpen(prev => !prev)}
            className="bg-blue-800 hover:bg-blue-700 p-1.5 rounded border border-blue-700 text-xs font-semibold flex items-center gap-1"
            title="Scientific Calculator (Ctrl+C)"
          >
            <Calculator size={16} /> <span className="hidden sm:inline">Calculator</span>
          </button>

          <button 
            onClick={toggleFullscreen}
            className="bg-blue-800 hover:bg-blue-700 p-1.5 rounded border border-blue-700"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Candidate Profile Details & Active Section Tabs */}
      <div className="bg-[#e5e7eb] px-4 py-2 border-b border-slate-300 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 select-none">
        {/* Section Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1 text-xs font-bold">
            {(['VARC', 'DILR', 'QA'] as const).map((sec) => {
              const isSecActive = activeQuestion.section === sec;
              return (
                <span
                  key={sec}
                  className={`px-4 py-2 rounded-t-lg transition border-t border-x ${
                    isSecActive 
                      ? 'bg-white border-slate-300 text-blue-800 shadow-sm relative top-[1px]' 
                      : 'bg-slate-200/80 border-slate-200 text-slate-500 opacity-60'
                  }`}
                >
                  Section: {sec}
                </span>
              );
            })}
          </div>
          {fallbackTriggered && (
            <span className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/40 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
              <AlertTriangle size={12} /> Notice: Insufficient matching questions. Fallback practice set loaded.
            </span>
          )}
        </div>

        {/* Candidate Detail Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 px-3 py-1 rounded-lg shadow-sm self-end md:self-auto text-xs">
          <div className="h-8 w-8 rounded bg-slate-200 border border-slate-300 flex items-center justify-center font-extrabold text-blue-800 text-[10px]">
            {user?.name.split(' ').map(n => n[0]).join('') || 'ST'}
          </div>
          <div>
            <p className="font-bold text-slate-800">Candidate: <span className="text-blue-800">{user?.name || 'Student'}</span></p>
            <p className="text-[10px] text-slate-500">ID: {user?.email || 'test-taker'}</p>
          </div>
        </div>
      </div>

      {/* Main Screen Layout (Question Left-Right panels & palette) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Area (Question + Passage panels) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
          
          {/* Split 1: Passage Scroll Area (Visible for RC or LRDI Caselets) */}
          {activeQuestion.passage && (
            <div className="w-full md:w-[48%] border-b md:border-b-0 md:border-r border-slate-300 flex flex-col h-[40%] md:h-full">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info size={14} className="text-blue-600" /> Read the Passage / Caselet instructions below:
              </div>
              <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed text-slate-800 whitespace-pre-line select-text font-serif">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {preprocessLaTeX(activeQuestion.passage)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Split 2: Question Prompt and Options */}
          <div className="flex-1 flex flex-col overflow-hidden h-[60%] md:h-full">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 text-xs font-bold text-slate-700 flex justify-between items-center">
              <span>Question No. {currentIndex + 1}</span>
              <span className="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                {activeQuestion.type === 'MCQ' ? 'Multiple Choice' : 'TITA (Numerical)'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Question Text */}
              <div className="text-sm font-semibold leading-relaxed text-slate-800 whitespace-pre-line">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {preprocessLaTeX(activeQuestion.questionText)}
                </ReactMarkdown>
              </div>

              {/* Input Options */}
              {activeQuestion.type === 'MCQ' && activeQuestion.options ? (
                <div className="space-y-3 pt-2">
                  {activeQuestion.options.map((opt, optIndex) => {
                    const isSelected = answers[activeQuestion.id] === optIndex.toString();
                    return (
                      <label 
                        key={optIndex}
                        onClick={() => handleSelectOption(optIndex.toString())}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm' 
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5">
                          <input 
                            type="radio" 
                            name={`q-${activeQuestion.id}`} 
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                          />
                        </div>
                        <div className="flex-1">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {preprocessLaTeX(opt)}
                          </ReactMarkdown>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 max-w-sm pt-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type your numerical answer below</label>
                  <input
                    type="text"
                    value={answers[activeQuestion.id] || ''}
                    onChange={(e) => handleTitaInput(e.target.value)}
                    placeholder="Enter numeric response (e.g. 2314 or 4)"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none transition"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Palette Panel (TCS iON styled side drawer) */}
        <aside className="hidden lg:flex flex-col w-[260px] border-l border-slate-300 bg-slate-100 select-none">
          <div className="p-4 border-b border-slate-300 bg-slate-200">
            <h2 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Question Palette</h2>
          </div>

          {/* Palette grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="grid grid-cols-5 gap-2">
              {filteredQuestions.map((q, idx) => {
                const status = questionStatuses[q.id];
                const isActive = currentIndex === idx;

                let btnClass = 'bg-slate-200 text-slate-700 border-slate-300'; // unvisited
                if (status === 'not-answered') btnClass = 'bg-red-500 text-white border-red-600'; // unanswered/visited
                if (status === 'answered') btnClass = 'bg-green-500 text-white border-green-600'; // answered
                if (status === 'marked-review') btnClass = 'bg-purple-500 text-white border-purple-600 rounded-full'; // marked review
                if (status === 'marked-answered-review') btnClass = 'bg-purple-600 text-white border-purple-700 rounded-full border-b-4 border-green-400'; // marked & answered

                return (
                  <button
                    key={q.id}
                    onClick={() => handlePaletteClick(idx)}
                    className={`h-9 w-9 text-xs font-bold rounded border transition flex items-center justify-center hover:scale-105 ${btnClass} ${
                      isActive ? 'ring-2 ring-blue-600 ring-offset-1 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend guide */}
            <div className="border-t border-slate-300 pt-4 space-y-2 text-[10px] font-semibold text-slate-600">
              <p className="flex items-center gap-2"><span className="h-4 w-4 bg-slate-200 border border-slate-300 rounded block"></span> Not Visited</p>
              <p className="flex items-center gap-2"><span className="h-4 w-4 bg-red-500 border border-red-600 rounded block"></span> Not Answered</p>
              <p className="flex items-center gap-2"><span className="h-4 w-4 bg-green-500 border border-green-600 rounded block"></span> Answered</p>
              <p className="flex items-center gap-2"><span className="h-4 w-4 bg-purple-500 border border-purple-600 rounded-full block"></span> Marked for Review</p>
              <p className="flex items-center gap-2"><span className="h-4 w-4 bg-purple-600 border border-purple-700 border-b-2 border-green-400 rounded-full block"></span> Answered & Marked</p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-300 bg-slate-200">
            <button
              onClick={onSubmitClick}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-lg text-xs uppercase transition shadow"
            >
              Submit Section
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Exam Control Bar */}
      <footer className="bg-slate-200 border-t border-slate-300 px-6 py-4 flex flex-wrap justify-between items-center gap-4 select-none z-10 shadow-inner">
        <div className="flex gap-2">
          <button 
            onClick={handleClearResponse}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition"
          >
            Clear Response
          </button>
          <button 
            onClick={handleMarkReview}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm"
          >
            Mark for Review & Next
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none border border-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button 
            onClick={handleSaveNext}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition flex items-center gap-1 shadow"
          >
            Save & Next <ChevronRight size={14} />
          </button>
        </div>
      </footer>

      {/* Floating Scientific Calculator Screen */}
      {isCalculatorOpen && (
        <div className="fixed top-20 right-6 w-72 bg-[#2d3748] text-white rounded-xl shadow-2xl border border-slate-600 p-4 z-40 select-none">
          <div className="flex justify-between items-center pb-2 border-b border-slate-600 mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5 text-blue-300"><Calculator size={14} /> CAT Scientific Calc</span>
            <button onClick={() => setIsCalculatorOpen(false)} className="hover:text-red-400 transition"><X size={16} /></button>
          </div>

          {/* Calculator screen */}
          <div className="bg-slate-900 border border-slate-700 px-3 py-2 text-right rounded-lg text-lg font-mono mb-3 overflow-hidden text-emerald-400 font-bold truncate">
            {calcDisplay}
          </div>

          {/* Buttons layout */}
          <div className="grid grid-cols-5 gap-1.5 text-[10px] font-bold">
            {['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'π', 'e', '(', ')'].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded transition text-blue-200">{btn}</button>
            ))}
            
            {['7', '8', '9', '/', 'Back'].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded transition ${btn === 'Back' ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>{btn}</button>
            ))}
            
            {['4', '5', '6', '*', 'C'].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded transition ${btn === 'C' ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>{btn}</button>
            ))}
            
            {['1', '2', '3', '-', '('].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded transition">{btn}</button>
            ))}
            
            {['0', '.', '=', '+', ')'].map(btn => (
              <button key={btn} onClick={() => handleCalcClick(btn)} className={`p-2 rounded transition ${btn === '=' ? 'bg-green-700 hover:bg-green-600 col-span-1 text-white text-xs' : 'bg-slate-800 hover:bg-slate-700'}`}>{btn}</button>
            ))}
          </div>
          <p className="text-[8px] text-center text-slate-400 mt-2">Floating panel. Type on click. Ctrl+C to close.</p>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-500">
              <ClipboardList size={28} />
              <h3 className="text-lg font-bold text-slate-800">Submit Exam Session</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to submit this CAT practice set? Once submitted, you cannot change your answers. Your AI mentor will immediately compile a detailed diagnostic report.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition"
              >
                No, Back to Test
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-xs transition"
              >
                Yes, Submit Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mistake Classification Survey Modal */}
      {showSurvey && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-600 fill-current animate-pulse" size={20} /> AI Decision Error Audit
                </h3>
                <p className="text-xs text-slate-500">Categorize your incorrect attempts so the AI Mentor can tune revision alerts</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {incorrectAttempts.map((item, idx) => (
                <div key={item.question.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-indigo-600">Question #{idx + 1} ({item.question.topic})</span>
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Incorrect Attempt</span>
                  </div>
                  
                  <p className="font-semibold text-slate-800 leading-normal truncate">{item.question.questionText}</p>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Classify your error root-cause</label>
                    <select
                      value={surveyClassifications[item.question.id] || 'Careless Mistake'}
                      onChange={(e) => setSurveyClassifications({
                        ...surveyClassifications,
                        [item.question.id]: e.target.value
                      })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-semibold text-slate-700 focus:border-indigo-500"
                    >
                      <option value="Conceptual Error">Conceptual Error (theory gap/did not know formula)</option>
                      <option value="Calculation Error">Calculation Error (arithmetic/algebraic signs slip)</option>
                      <option value="Careless Mistake">Careless Mistake (silly error/read values wrongly)</option>
                      <option value="Misread Question">Misread Question (missed a constraint or double negatives)</option>
                      <option value="Poor Time Management">Poor Time Management (rushed the calculation under pressure)</option>
                      <option value="Lucky Guess">Lucky Guess (guessed correctly but did not know logic)</option>
                      <option value="Incorrect Elimination">Incorrect Elimination (eliminated correct option first)</option>
                      <option value="Panic Under Time Pressure">Panic (blindly guessed due to clock running out)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-900">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                These responses populate your <strong>Mistake Matrix Heatmap</strong>. Spaced repetition cards for conceptual errors will reappear in 1 day; calculation errors in 3 days.
              </p>
            </div>

            <button
              onClick={() => saveTestResultsAndExit(surveyClassifications)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
            >
              Analyze Test Performance & Save →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default function TestSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center text-slate-800">
        <div className="text-center space-y-4 animate-pulse">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="font-semibold">Securing Test Sandbox...</p>
        </div>
      </div>
    }>
      <ExamSimulator />
    </Suspense>
  );
}
