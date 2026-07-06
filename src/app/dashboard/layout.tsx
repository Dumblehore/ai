'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Flame,
  Target,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, badge, active, onClick }) => {
  return (
    <Link href={href} onClick={onClick}>
      <span
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
          active
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <span className="flex items-center gap-3">
          <span className={`transition-transform duration-200 group-hover:scale-110`}>
            {icon}
          </span>
          {label}
        </span>
        {badge && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              active
                ? 'bg-white/20 text-white'
                : 'bg-primary/10 text-primary dark:bg-primary/20'
            }`}
          >
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, user, logout } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying secure mentor session...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/dashboard/test', icon: <BookOpen size={18} />, label: 'Test Module', badge: 'CAT' },
    { href: '/dashboard/coach', icon: <MessageSquare size={18} />, label: 'AI Study Coach', badge: 'AI' },
    { href: '/dashboard/spaced-repetition', icon: <Layers size={18} />, label: 'Spaced Revision' },
    { href: '/dashboard/flashcards', icon: <Sparkles size={18} />, label: 'Flashcards' },
    { href: '/dashboard/goals', icon: <Target size={18} />, label: 'Goals & Badges' },
    { href: '/dashboard/profile', icon: <User size={18} />, label: 'My Mentor Profile' },
    ...(user.role === 'admin' ? [{ href: '/dashboard/admin', icon: <Settings size={18} />, label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background linear-grid overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-md z-20 shrink-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <span className="bg-primary text-white p-1 rounded-lg">
              <Sparkles size={20} className="fill-current" />
            </span>
            Aether<span className="text-primary font-extrabold">CAT</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-all duration-200"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-destructive hover:text-white text-muted-foreground transition-all duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md z-30">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <span className="bg-primary text-white p-1 rounded-lg">
              <Sparkles size={18} className="fill-current" />
            </span>
            Aether<span className="text-primary font-extrabold">CAT</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />

              {/* Sidebar Menu Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card z-50 flex flex-col md:hidden"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
                    <span className="bg-primary text-white p-1 rounded-lg">
                      <Sparkles size={18} className="fill-current" />
                    </span>
                    Aether<span className="text-primary font-extrabold">CAT</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                  {menuItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      active={pathname === item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>

                <div className="p-4 border-t border-border bg-secondary/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={toggleTheme}
                      className="flex-1 flex items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground"
                    >
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex-1 flex items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-destructive hover:text-white text-muted-foreground"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Dashboard Layout Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Top Stat Ribbon for Desktop */}
            <div className="hidden md:flex justify-between items-center bg-card/40 border border-border/80 px-6 py-4 rounded-xl backdrop-blur-md shadow-sm">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Current Prep Phase</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-sm font-semibold text-foreground">Active Mentorship Program</p>
                </div>
              </div>

              <div className="flex gap-8 items-center">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Estimated CAT Percentile</p>
                  <p className="text-lg font-extrabold text-primary">{user.estimatedPercentile}%ile</p>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <div className="flex items-center gap-1 justify-end font-extrabold text-amber-500">
                    <Flame size={16} className="fill-current" />
                    <span>{user.studyStreak} Days</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">AI Readiness Score</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-lg font-extrabold text-foreground">{user.aiReadinessScore}%</span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1 rounded font-bold uppercase">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subpage Contents */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
