'use client';

import React, { useState } from 'react';
import { useApp, UserProfile } from '@/context/AppContext';
import { 
  User, 
  Target, 
  Calendar, 
  Award, 
  BookOpen, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorProfile() {
  const { user, testHistory } = useApp();
  
  // Local state for profile form
  const [name, setName] = useState(user?.name || 'Yash Mohan');
  const [email, setEmail] = useState(user?.email || 'yash@example.com');
  const [targetPercentile, setTargetPercentile] = useState(user?.targetPercentile || 99.5);
  const [targetColleges, setTargetColleges] = useState('IIM Ahmedabad, IIM Bangalore, IIM Calcutta');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate updating user profile in AppContext/localStorage
    const updatedUser: UserProfile = {
      ...user,
      name,
      email,
      targetPercentile: +targetPercentile
    };
    localStorage.setItem('cat_user', JSON.stringify(updatedUser));
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload(); // Reload context
    }, 1200);
  };

  // Generate GitHub-style study heatmap grid (last 12 weeks = 84 days)
  const renderStudyHeatmap = () => {
    const totalDays = 84;
    const studyHoursArray = Array.from({ length: totalDays }, (_, i) => {
      // Simulate random study patterns with weekend spikes
      const dayOfWeek = i % 7;
      if (i > 72) return dayOfWeek === 5 || dayOfWeek === 6 ? 4.5 : 2.1; // Recent 8 streak
      if (i === 12 || i === 34 || i === 56) return 0; // occasional rest days
      return dayOfWeek === 5 || dayOfWeek === 6 ? Math.random() * 5 + 1 : Math.random() * 2.5 + 0.5;
    });

    const getHeatmapColor = (hours: number) => {
      if (hours === 0) return 'bg-[#ebedf0] dark:bg-[#161b22]';
      if (hours < 1.5) return 'bg-[#9be9a8] dark:bg-[#0e4429]';
      if (hours < 3.0) return 'bg-[#40c463] dark:bg-[#006d32]';
      if (hours < 4.5) return 'bg-[#30a14e] dark:bg-[#26a641]';
      return 'bg-[#216e39] dark:bg-[#39d353]';
    };

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Weekly Study Heatmap (Last 12 Weeks)</span>
          <span className="flex items-center gap-1">Less <span className="h-2 w-2 rounded bg-secondary inline-block"></span><span className="h-2 w-2 rounded bg-emerald-500 inline-block"></span> More</span>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
          {studyHoursArray.map((hours, idx) => (
            <div
              key={idx}
              className={`h-3.5 w-3.5 rounded-sm transition-all duration-300 hover:scale-110 ${getHeatmapColor(hours)}`}
              title={`Day ${idx + 1}: ${hours.toFixed(1)} hours studied`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Mentorship Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review estimated target percentiles, target B-school ranges, and track historical consistency logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (7 cols): Calendar and analytics */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Study heatmap calendar */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Study Calendar Tracker
            </h2>
            {renderStudyHeatmap()}
            <p className="text-[11px] text-muted-foreground">
              Your 8-day active study streak has contributed to a 15% increase in your AI Readiness score over the past week.
            </p>
          </div>

          {/* Strength and weakness area maps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Strongest Topics
              </h3>
              
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">QA Arithmetic (88%)</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">VARC RC (82%)</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">DILR Venns (78%)</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">QA Remainders (80%)</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Weakest Topics
              </h3>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg">QA Geometry (60%)</span>
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg">QA Modern Math (45%)</span>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg">DILR Arrangement (68%)</span>
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg">VARC PJ (52%)</span>
              </div>
            </div>

          </div>

          {/* School prediction target confidence intervals */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Building size={18} className="text-primary" /> B-School Target Mapper
            </h2>
            <p className="text-xs text-muted-foreground">Confidence interval of crossing percentiles based on diagnostic tests:</p>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Probability of crossing 90th Percentile</span>
                <span className="text-emerald-500 font-extrabold">98% (High confidence)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Probability of crossing 95th Percentile</span>
                <span className="text-primary font-extrabold">85% (Optimal range)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Probability of crossing 99th Percentile</span>
                <span className="text-amber-500 font-extrabold">42% (Aspirational gap)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (5 cols): Settings form */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-12 w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="space-y-1">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Sliders size={18} className="text-primary" /> Profile Settings
              </h2>
              <p className="text-xs text-muted-foreground">Configure your target percentiles and personal metrics</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              
              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 outline-none text-foreground font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 outline-none text-foreground font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Target CAT %ile</label>
                  <input
                    type="number"
                    step="0.01"
                    min="80"
                    max="99.99"
                    required
                    value={targetPercentile}
                    onChange={(e) => setTargetPercentile(+e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2 outline-none text-foreground font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Current Est. %ile</label>
                  <input
                    type="text"
                    disabled
                    value={`${user.estimatedPercentile}%ile`}
                    className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Target B-Schools</label>
                <input
                  type="text"
                  value={targetColleges}
                  onChange={(e) => setTargetColleges(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 outline-none text-foreground font-medium"
                />
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-bold">
                  ✓ Profile preferences successfully saved!
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl transition shadow"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
