'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Sparkles, Brain, Award, ShieldAlert, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const { login, user } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');
    const success = await login(email, name || undefined, password, isSignUp);
    setLoading(false);

    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg(isSignUp 
        ? 'Registration failed. Email might already exist.' 
        : 'Authentication failed. Please verify email and password.'
      );
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    // Automatically log in as the default seeded administrator for easy previewing
    const success = await login('admin@aether.ai', undefined, 'admin123', false);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg('Failed to initialize Admin demo credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden linear-grid">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="bg-primary text-white p-1 rounded-lg">
            <Sparkles size={20} className="fill-current" />
          </span>
          Aether<span className="text-primary font-extrabold">CAT</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
              document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-semibold hover:text-primary transition"
          >
            Sign In
          </button>
          <button 
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
              document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-primary/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            <Zap size={12} className="fill-current" /> Next-Gen AI Mentorship
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your personal <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">CAT Mentor</span>, not just a test bank.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
            AetherCAT tracks your decision cycles, classifies your careless mistakes, schedules spaced repetition reviews, and guides you to a 99.9%ile with a 24/7 custom AI coach.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
              <Brain className="text-primary mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-sm">Adaptive Tuning</h3>
                <p className="text-xs text-muted-foreground mt-1">Difficulty auto-adjusts based on category trends.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
              <ShieldAlert className="text-amber-400 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-sm">Mistake Logs</h3>
                <p className="text-xs text-muted-foreground mt-1">Answers categorized into Careless vs Concept errors.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
              <Award className="text-emerald-400 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-sm">99th Percentile Map</h3>
                <p className="text-xs text-muted-foreground mt-1">Predictive confidence models based on mock scores.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div id="auth-section" className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative">
            <div className="absolute top-0 right-12 w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold">
                {isSignUp ? 'Create your Mentor Account' : 'Welcome to AetherCAT'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Begin your personalized prep track today' : 'Sign in to resume your diagnostic profile'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={14} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:translate-y-[-1px] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    {isSignUp ? 'Register & Start' : 'Access Account'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative bg-[#0d0d0f] px-3 text-xs text-muted-foreground uppercase">Or Demo Sign In</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-3"
              title="Click to automatically sign in as the seed Admin account"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.71 5.71 0 0 1 8.28 12.8a5.71 5.71 0 0 1 5.711-5.73 5.62 5.62 0 0 1 3.86 1.53l3.05-3.048A9.94 9.94 0 0 0 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.78 0 9.77-4.07 9.77-9.93 0-.6-.05-1.185-.15-1.785H12.24z"/>
              </svg>
              Sign In as Admin (One-Click)
            </button>

            <div className="mt-6 text-center text-xs">
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-muted-foreground hover:text-primary transition"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New student? Create an account'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-white/5 relative z-10 text-center text-xs text-muted-foreground">
        © 2026 AetherCAT. Guided AI Mentorship for Premium B-School Prep.
      </footer>
    </div>
  );
}
