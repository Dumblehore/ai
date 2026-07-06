'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
  Cell
} from 'recharts';

// Default static benchmarks for empty profiles
const defaultAccuracyData = [
  { name: 'Mock 1', accuracy: 65, avg: 60 },
  { name: 'Sec QA', accuracy: 72, avg: 62 },
  { name: 'Sec VARC', accuracy: 70, avg: 61 },
  { name: 'Mock 2', accuracy: 68, avg: 60 },
  { name: 'Sec DILR', accuracy: 75, avg: 63 },
  { name: 'Mock 3', accuracy: 74, avg: 62 },
  { name: 'Latest Mock', accuracy: 82, avg: 64 },
];

const defaultPercentileData = [
  { date: 'May 15', percentile: 88.4 },
  { date: 'May 30', percentile: 89.2 },
  { date: 'Jun 10', percentile: 91.5 },
  { date: 'Jun 22', percentile: 90.8 },
  { date: 'Jun 28', percentile: 92.4 },
  { date: 'Jul 02', percentile: 93.1 },
  { date: 'Jul 06', percentile: 94.6 },
];

const defaultTimeAllocationData = [
  { name: 'VARC', value: 45, color: '#6366f1' }, // Indigo
  { name: 'DILR', value: 35, color: '#ec4899' }, // Pink
  { name: 'QA', value: 20, color: '#10b981' },   // Emerald
];

export const AccuracyChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { testHistory } = useApp();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  // Calculate dynamic accuracy trends
  const historyData = [...testHistory].reverse().map((t, idx) => ({
    name: t.title.length > 8 ? t.title.substring(0, 8) + '..' : t.title,
    accuracy: t.accuracy,
    avg: 64
  }));

  const data = historyData.length > 0 ? historyData : defaultAccuracyData;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis domain={[30, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
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
  const { testHistory } = useApp();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  // Calculate dynamic percentile trend
  const historyData = [...testHistory].reverse().map((t, idx) => ({
    date: t.date.substring(5), // MM-DD format
    percentile: t.percentile || 90.0
  }));

  const data = historyData.length > 0 ? historyData : defaultPercentileData;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis domain={[50, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
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
  const { testHistory, user } = useApp();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  // Calculate dynamic weekly study progress
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay(); // 0 is Sun
  const todayDayStr = days[(todayIndex + 6) % 7];

  const testHoursByDay: Record<string, number> = {};
  days.forEach(d => { testHoursByDay[d] = 0; });

  testHistory.forEach(t => {
    const testDate = new Date(t.date);
    const dayStr = days[(testDate.getDay() + 6) % 7];
    const diffTime = Math.abs(new Date().getTime() - testDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      testHoursByDay[dayStr] += t.timeSpent / 3600; // convert to hours
    }
  });

  // Blend in current day study hours today
  if (user) {
    testHoursByDay[todayDayStr] = Math.max(testHoursByDay[todayDayStr], user.studyHoursToday);
  }

  const data = days.map(d => ({
    day: d,
    hours: +(testHoursByDay[d] || 0.5).toFixed(1), // min styling baseline
    goal: d === 'Sat' || d === 'Sun' ? 4 : 3
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
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
  const { testHistory } = useApp();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  // Compile mastery indices by parsing individual answers
  const topicScores: Record<string, { correct: number; total: number }> = {
    'Arithmetic': { correct: 8, total: 10 },
    'Algebra': { correct: 7, total: 10 },
    'Geometry': { correct: 6, total: 10 },
    'Modern Math': { correct: 4, total: 10 },
    'DILR Logic': { correct: 8, total: 10 },
    'DILR Sets': { correct: 7, total: 10 },
    'VARC Reading': { correct: 8, total: 10 },
    'VARC Verbal': { correct: 7, total: 10 },
  };

  testHistory.forEach(attempt => {
    attempt.questionsAnswered?.forEach(ans => {
      let topicKey = 'Arithmetic';
      const qId = ans.questionId.toLowerCase();
      if (qId.includes('alg')) topicKey = 'Algebra';
      else if (qId.includes('geo')) topicKey = 'Geometry';
      else if (qId.includes('mod') || qId.includes('num')) topicKey = 'Modern Math';
      else if (qId.includes('set') || qId.includes('venn')) topicKey = 'DILR Sets';
      else if (qId.includes('arr') || qId.includes('logic')) topicKey = 'DILR Logic';
      else if (qId.includes('rc') || qId.includes('read')) topicKey = 'VARC Reading';
      else if (qId.includes('pj') || qId.includes('verb')) topicKey = 'VARC Verbal';
      
      if (topicScores[topicKey]) {
        topicScores[topicKey].total += 1;
        if (ans.isCorrect) {
          topicScores[topicKey].correct += 1;
        }
      }
    });
  });

  const data = Object.keys(topicScores).map(topic => ({
    topic,
    score: Math.round((topicScores[topic].correct / topicScores[topic].total) * 100),
    fullMark: 100
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" fontSize={9} />
          <Radar name="Mastery" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TimeAllocationChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { testHistory } = useApp();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse bg-muted/40 rounded-lg"></div>;

  let varcTime = 0;
  let dilrTime = 0;
  let qaTime = 0;

  testHistory.forEach(t => {
    t.questionsAnswered?.forEach(ans => {
      const qId = ans.questionId.toLowerCase();
      if (qId.startsWith('varc')) varcTime += ans.timeSpent;
      else if (qId.startsWith('dilr')) dilrTime += ans.timeSpent;
      else if (qId.startsWith('qa')) qaTime += ans.timeSpent;
    });
  });

  const total = varcTime + dilrTime + qaTime;
  let data = defaultTimeAllocationData;
  if (total > 0) {
    data = [
      { name: 'VARC', value: Math.round((varcTime / total) * 100), color: '#6366f1' },
      { name: 'DILR', value: Math.round((dilrTime / total) * 100), color: '#ec4899' },
      { name: 'QA', value: Math.round((qaTime / total) * 100), color: '#10b981' }
    ];
  }

  return (
    <div className="h-64 w-full flex flex-col justify-between">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 pb-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-xs font-medium text-foreground">{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
