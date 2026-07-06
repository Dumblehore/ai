'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Seed data
const accuracyData = [
  { name: 'Mock 1', accuracy: 65, avg: 60 },
  { name: 'Sec QA', accuracy: 72, avg: 62 },
  { name: 'Sec VARC', accuracy: 70, avg: 61 },
  { name: 'Mock 2', accuracy: 68, avg: 60 },
  { name: 'Sec DILR', accuracy: 75, avg: 63 },
  { name: 'Mock 3', accuracy: 74, avg: 62 },
  { name: 'Latest Mock', accuracy: 82, avg: 64 },
];

const percentileData = [
  { date: 'May 15', percentile: 88.4 },
  { date: 'May 30', percentile: 89.2 },
  { date: 'Jun 10', percentile: 91.5 },
  { date: 'Jun 22', percentile: 90.8 },
  { date: 'Jun 28', percentile: 92.4 },
  { date: 'Jul 02', percentile: 93.1 },
  { date: 'Jul 06', percentile: 94.6 },
];

const studyHoursData = [
  { day: 'Mon', hours: 2.5, goal: 3 },
  { day: 'Tue', hours: 3.2, goal: 3 },
  { day: 'Wed', hours: 1.8, goal: 3 },
  { day: 'Thu', hours: 4.0, goal: 3 },
  { day: 'Fri', hours: 2.8, goal: 3 },
  { day: 'Sat', hours: 5.1, goal: 4 },
  { day: 'Sun', hours: 3.5, goal: 4 },
];

const topicMasteryData = [
  { topic: 'Arithmetic', score: 88, fullMark: 100 },
  { topic: 'Algebra', score: 72, fullMark: 100 },
  { topic: 'Geometry', score: 60, fullMark: 100 },
  { topic: 'Modern Math', score: 45, fullMark: 100 },
  { topic: 'DILR Logic', score: 78, fullMark: 100 },
  { topic: 'DILR Sets', score: 68, fullMark: 100 },
  { topic: 'VARC Reading', score: 82, fullMark: 100 },
  { topic: 'VARC Verbal', score: 70, fullMark: 100 },
];

const timeAllocationData = [
  { name: 'VARC', value: 45, color: '#6366f1' }, // Indigo
  { name: 'DILR', value: 35, color: '#ec4899' }, // Pink
  { name: 'QA', value: 20, color: '#10b981' },   // Emerald
];

export const AccuracyChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis domain={[40, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAccuracy)" name="Your Accuracy %" />
          <Area type="monotone" dataKey="avg" stroke="var(--muted-foreground)" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Batch Avg %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PercentileGrowthChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={percentileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis domain={[80, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <Line type="monotone" dataKey="percentile" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} name="CAT Percentile" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StudyHoursChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={studyHoursData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Study Hours" />
          <Bar dataKey="goal" fill="var(--muted)" radius={[4, 4, 0, 0]} name="Daily Goal" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicMasteryChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topicMasteryData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" fontSize={9} />
          <Radar name="Mastery" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TimeAllocationChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  return (
    <div className="h-64 w-full flex flex-col justify-between">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={timeAllocationData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {timeAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 pb-2">
        {timeAllocationData.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-xs font-medium text-foreground">{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
