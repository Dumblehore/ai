'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  Settings, 
  Cpu, 
  Layers, 
  Calendar, 
  Sliders, 
  Clock, 
  Play, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestHub() {
  const router = useRouter();
  const { questions } = useApp();

  // Custom Test Generator State
  const [section, setSection] = useState<'All' | 'VARC' | 'DILR' | 'QA'>('All');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Mixed');
  const [qCount, setQCount] = useState<number>(10);
  const [timeLimit, setTimeLimit] = useState<number>(20); // in minutes
  const [generating, setGenerating] = useState(false);

  // Available pre-configured tests
  const preConfiguredTests = [
    {
      id: 'mock-full-1',
      title: 'AetherCAT Premium Mock Test 1',
      type: 'Full Mock',
      questions: 20,
      time: 40, // 40 mins
      desc: 'Balanced diagnostic test simulating the actual CAT difficulty spread.',
      badge: 'Full Test',
      params: 'type=Full Mock&qCount=20&time=40'
    },
    {
      id: 'mock-varc-1',
      title: 'VARC Sectional - Reading Comprehension Drill',
      type: 'Sectional',
      questions: 4, // 1 RC set (2 qs) + 1 PJ + 1 PS
      time: 15,
      desc: 'Immersive focus on philosophical passages and para summary traps.',
      badge: 'VARC Sectional',
      params: 'type=Sectional&section=VARC&qCount=4&time=15'
    },
    {
      id: 'mock-dilr-1',
      title: 'DILR Sectional - Venn & Set Logic',
      type: 'Sectional',
      questions: 3, // 1 Venn set (2 qs) + 1 Knockout tournament
      time: 15,
      desc: 'Test your set representation limits with complex conditional bounds.',
      badge: 'DILR Sectional',
      params: 'type=Sectional&section=DILR&qCount=3&time=15'
    },
    {
      id: 'mock-qa-1',
      title: 'QA Sectional - Arithmetic & Equations',
      type: 'Sectional',
      questions: 5,
      time: 12,
      desc: 'Speed and accuracy tests for quadratic equations and TSD systems.',
      badge: 'QA Sectional',
      params: 'type=Sectional&section=QA&qCount=5&time=12'
    },
    {
      id: 'pyq-2023-1',
      title: 'CAT 2023 Actual Paper - Slot 1 (QA)',
      type: 'Previous Year',
      questions: 5,
      time: 12,
      desc: 'Real questions asked in the CAT 2023 exam slot 1 QA section.',
      badge: 'Actual PYQ',
      params: 'type=Previous Year&section=QA&qCount=5&time=12'
    }
  ];

  const handleStartPreconfigured = (params: string) => {
    router.push(`/test-session?${params}`);
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    // Simulate AI assembly
    setTimeout(() => {
      setGenerating(false);
      let queryParams = `type=Custom&qCount=${qCount}&time=${timeLimit}`;
      if (section !== 'All') queryParams += `&section=${section}`;
      if (difficulty !== 'Mixed') queryParams += `&difficulty=${difficulty}`;
      router.push(`/test-session?${queryParams}`);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">CAT Test Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select standard mock papers or generate a custom AI diagnostic drill to test targeted subtopics.
        </p>
      </div>

      {/* Main Grid: Left preconfigured list, Right custom AI generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Available Test Modules */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Curated Test Series
          </h2>

          <div className="space-y-4">
            {preConfiguredTests.map((test) => (
              <div 
                key={test.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 hover:shadow-sm transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {test.badge}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {test.time} Mins
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      • {test.questions} Questions
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-tight">{test.title}</h3>
                  <p className="text-xs text-muted-foreground">{test.desc}</p>
                </div>

                <button 
                  onClick={() => handleStartPreconfigured(test.params)}
                  className="bg-secondary text-foreground hover:bg-primary hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-stretch md:self-auto justify-center"
                >
                  Start <Play size={12} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): AI Custom Test Generator */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-12 w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="space-y-1">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Cpu size={18} className="text-primary" /> AI Test Generator
              </h2>
              <p className="text-xs text-muted-foreground">Assemble a specialized practice set matching your weakness areas</p>
            </div>

            <form onSubmit={handleGenerateCustom} className="space-y-4 text-xs font-semibold">
              {/* Choose Section */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider">Select Section</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['All', 'VARC', 'DILR', 'QA'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSection(s)}
                      className={`py-2 rounded-lg border text-center transition font-bold ${
                        section === s 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-card border-border hover:bg-secondary text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose Difficulty */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider">Select Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 rounded-lg border text-center transition font-bold ${
                        difficulty === d
                          ? 'bg-primary border-primary text-white'
                          : 'bg-card border-border hover:bg-secondary text-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of questions & time limit slider/selects */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase tracking-wider">Questions</label>
                  <select 
                    value={qCount} 
                    onChange={(e) => {
                      const count = +e.target.value;
                      setQCount(count);
                      // Auto-scale time: approx 2.5 minutes per question
                      setTimeLimit(Math.max(5, Math.ceil(count * 2)));
                    }}
                    className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary"
                  >
                    <option value={3}>3 Questions (Mini)</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions (Max)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase tracking-wider">Time Limit (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(+e.target.value)}
                    className="w-full bg-card border border-border rounded-lg p-2 text-foreground outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="bg-secondary/40 border border-border/80 p-3 rounded-xl flex items-start gap-2.5">
                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-normal font-normal">
                  Our system will pull questions matching the chosen difficulty, with an emphasis on your recent weak subtopics (e.g., Geometry formulas and Seating arrangements).
                </p>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 text-sm"
              >
                {generating ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Assemble Custom Practice <Play size={14} fill="currentColor" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
