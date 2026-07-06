'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  AccuracyChart, 
  PercentileGrowthChart, 
  StudyHoursChart, 
  TopicMasteryChart, 
  TimeAllocationChart 
} from '@/components/DashboardCharts';
import { 
  Flame, 
  Target, 
  Sparkles, 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomeDashboard() {
  const { user, activeGoals, achievements } = useApp();
  const [chartTab, setChartTab] = useState<'analytics' | 'activity' | 'mastery'>('analytics');

  if (!user) return null;

  // Today's recommendations checklist state (local state for interactivity)
  const initialRecommendations = [
    { id: 'rec-1', text: 'Solve 2 Reading Comprehension sets', time: '40m', done: false, type: 'VARC' },
    { id: 'rec-2', text: 'Practice 20 Arithmetic Questions', time: '45m', done: false, type: 'QA' },
    { id: 'rec-3', text: 'Analyze 1 Logical Seating Arrangement set', time: '30m', done: true, type: 'DILR' },
    { id: 'rec-4', text: 'Revise Geometry formula flashcards', time: '15m', done: false, type: 'Revision' },
    { id: 'rec-5', text: 'Review Spaced Repetition Due Cards', time: '20m', done: false, type: 'Revision' },
  ];

  const [recommendations, setRecommendations] = useState(initialRecommendations);

  const toggleRec = (id: string) => {
    setRecommendations(recommendations.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const completedRecCount = recommendations.filter(r => r.done).length;

  return (
    <div className="space-y-8">
      {/* Top Banner with animated sparkles */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent p-6 md:p-8"
      >
        <div className="absolute top-0 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{user.name}</span>!
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Your AI Mentor has generated a fresh daily plan based on your recent 75% accuracy in QA Arithmetic.
            </p>
          </div>
          <Link href="/dashboard/test">
            <span className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02]">
              Start Practice Session <Play size={16} fill="currentColor" />
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid: Left Statistics and Charts, Right Daily Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Stats & Visualizations */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl space-y-1 hover:border-primary/30 transition-all duration-200">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Est. Percentile</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{user.estimatedPercentile}</span>
                <span className="text-xs font-medium text-emerald-500">%ile</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">Top 5% of test-takers</span>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1 hover:border-primary/30 transition-all duration-200">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Accuracy</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{user.accuracy}</span>
                <span className="text-xs font-medium text-primary">%</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">Last 342 questions</span>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1 hover:border-amber-500/30 transition-all duration-200">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Active Streak</span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-amber-500">{user.studyStreak}</span>
                <Flame size={18} className="text-amber-500 fill-current animate-pulse" />
              </div>
              <span className="text-[10px] text-muted-foreground block">Multiplier unlocked</span>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1 hover:border-primary/30 transition-all duration-200">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Study Hours</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">{user.studyHoursToday}</span>
                <span className="text-xs font-medium text-muted-foreground">Hrs</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">Today\'s study session</span>
            </div>
          </div>

          {/* Charts Display Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/10">
              <div>
                <h2 className="font-bold text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Visual Analytics
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Realtime predictive models of your prep progress</p>
              </div>

              {/* Chart Tabs */}
              <div className="flex bg-muted/60 p-1 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setChartTab('analytics')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    chartTab === 'analytics' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Growth & Accuracy
                </button>
                <button
                  onClick={() => setChartTab('activity')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    chartTab === 'activity' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Study Allocation
                </button>
                <button
                  onClick={() => setChartTab('mastery')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    chartTab === 'mastery' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Topic Mastery
                </button>
              </div>
            </div>

            <div className="p-6">
              {chartTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Estimated Percentile Growth</h3>
                    <PercentileGrowthChart />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Accuracy over Last 7 Mock Tests</h3>
                    <AccuracyChart />
                  </div>
                </div>
              )}

              {chartTab === 'activity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Daily Study Hours (vs Goals)</h3>
                    <StudyHoursChart />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Prep Time Spent per Section</h3>
                    <TimeAllocationChart />
                  </div>
                </div>
              )}

              {chartTab === 'mastery' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <h3 className="text-sm font-semibold text-muted-foreground text-center">Sectional Subject Mastery Radar Map</h3>
                  <TopicMasteryChart />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Daily Recommendations & Active Goals */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Smart Recommendations */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-extrabold text-base flex items-center gap-2 text-foreground">
                  <Sparkles size={18} className="text-primary fill-current" /> Daily Focus
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Custom task sheet compiled by AI Mentor</p>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Active
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  onClick={() => toggleRec(rec.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    rec.done 
                      ? 'bg-secondary/40 border-border/50 opacity-60' 
                      : 'bg-card border-border hover:border-primary/20 hover:bg-secondary/20'
                  }`}
                >
                  <button className="mt-0.5">
                    {rec.done ? (
                      <CheckCircle size={18} className="text-emerald-500 fill-current" />
                    ) : (
                      <div className="h-[18px] w-[18px] rounded-full border border-muted-foreground/60 hover:border-primary"></div>
                    )}
                  </button>
                  <div className="flex-1 text-xs">
                    <p className={`font-medium ${rec.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {rec.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={10} /> {rec.time}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.25 rounded font-bold uppercase ${
                        rec.type === 'QA' ? 'bg-emerald-500/10 text-emerald-600' :
                        rec.type === 'VARC' ? 'bg-indigo-500/10 text-indigo-600' :
                        rec.type === 'DILR' ? 'bg-pink-500/10 text-pink-600' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {rec.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily study progress summary */}
            <div className="border-t border-border pt-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-muted-foreground">Target Study Time:</span>
                <p className="font-bold text-foreground">2 hrs 15 mins</p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Tasks Done:</span>
                <p className="font-extrabold text-primary">{completedRecCount} / {recommendations.length}</p>
              </div>
            </div>
          </div>

          {/* Goals Tracker */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Target size={18} className="text-primary" /> Core Goals
            </h2>
            
            <div className="space-y-4">
              {activeGoals.slice(0, 3).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground truncate max-w-[200px]">{goal.title}</span>
                      <span className="text-muted-foreground">{goal.currentValue}/{goal.targetValue} {goal.metric}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/dashboard/goals">
              <span className="text-xs text-primary font-bold hover:underline cursor-pointer block pt-2 text-center">
                Manage All Prep Goals →
              </span>
            </Link>
          </div>

          {/* Mini Achievements Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Award size={18} className="text-primary" /> Active Badges
            </h2>

            <div className="flex gap-3 flex-wrap">
              {achievements.filter(a => a.unlockedAt).slice(0, 3).map((ach) => (
                <div 
                  key={ach.id}
                  className="flex items-center gap-2 bg-secondary/50 border border-border/80 px-3 py-1.5 rounded-lg text-xs"
                >
                  <Award size={14} className="text-amber-500" />
                  <span className="font-semibold text-foreground">{ach.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
