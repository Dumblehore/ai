'use client';

import React, { useState } from 'react';
import { useApp, Goal, Achievement } from '@/context/AppContext';
import { 
  Target, 
  Award, 
  Plus, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Lock,
  Layers,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoalsAndAchievements() {
  const { activeGoals, achievements, addGoal } = useApp();
  
  // Local state for modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [metric, setMetric] = useState('Questions');
  const [category, setCategory] = useState<Goal['category']>('questions');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || targetValue <= 0) return;
    
    addGoal(title, targetValue, metric, category);
    
    // Reset form
    setTitle('');
    setTargetValue(10);
    setMetric('Questions');
    setCategory('questions');
    setShowAddModal(false);
  };

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'Zap': return <Flame className="h-6 w-6 text-amber-500 fill-current" />;
      case 'Target': return <Target className="h-6 w-6 text-blue-500" />;
      case 'Flame': return <Zap className="h-6 w-6 text-indigo-500 fill-current animate-pulse" />;
      case 'Layers': return <Layers className="h-6 w-6 text-pink-500" />;
      case 'Settings': return <Trophy className="h-6 w-6 text-emerald-500" />;
      default: return <Award className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy className="text-primary" /> Goals & Gamified Achievements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build streaks, unlock badges, and configure daily preparation targets.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow shadow-primary/20 flex items-center gap-1.5"
        >
          <Plus size={14} /> Set Target Goal
        </button>
      </div>

      {/* Grid: Left targets list, Right achievements list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Targets list */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Target size={18} className="text-primary" /> Active Targets
          </h2>

          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <div key={goal.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-foreground">{goal.title}</h3>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Category: {goal.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {goal.currentValue} / {goal.targetValue} {goal.metric}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>{pct}% Completed</span>
                      {pct === 100 && (
                        <span className="text-emerald-500 flex items-center gap-0.5 font-bold uppercase">
                          <CheckCircle2 size={10} className="fill-current text-emerald-500" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Achievements Catalog */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Award size={18} className="text-primary" /> Badges Gallery
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = !!ach.unlockedAt;
              return (
                <div 
                  key={ach.id} 
                  className={`border rounded-2xl p-5 flex items-start gap-4 transition shadow-sm relative overflow-hidden ${
                    isUnlocked 
                      ? 'bg-card border-border/80' 
                      : 'bg-secondary/40 border-border/40 opacity-55'
                  }`}
                >
                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3 text-muted-foreground/60" title="Locked">
                      <Lock size={12} />
                    </div>
                  )}

                  <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-secondary' : 'bg-muted'
                  }`}>
                    {getBadgeIcon(ach.badgeCode)}
                  </div>

                  <div className="space-y-1 text-xs">
                    <h3 className={`font-bold text-sm leading-tight ${isUnlocked ? 'text-foreground font-extrabold' : 'text-muted-foreground'}`}>
                      {ach.title}
                    </h3>
                    <p className="text-muted-foreground leading-normal">{ach.description}</p>
                    {isUnlocked && ach.unlockedAt && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block pt-1">
                        Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-slate-800 text-xs font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-600" /> Create Custom Prep Target
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish 15 Geometry Mock sets"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-slate-500 uppercase">Target Metric Value</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Metric Unit</label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-bold"
                  >
                    <option value="Questions">Questions</option>
                    <option value="Tests">Tests</option>
                    <option value="Hours">Hours</option>
                    <option value="Sheet">Sheets</option>
                    <option value="%">% Accuracy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Category Area</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Goal['category'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700"
                >
                  <option value="questions">General Question Solving</option>
                  <option value="mock-tests">Mock Examinations</option>
                  <option value="study-hours">Study Hours & Dedication</option>
                  <option value="accuracy">Accuracy Improvement</option>
                  <option value="algebra">Algebra Specific drills</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Assemble Goal & Pin Target
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
