'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Question } from '@/data/questionsBank';
import { 
  Settings, 
  Database, 
  UploadCloud, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPanel() {
  const { questions, addQuestion, deleteQuestion, user } = useApp();
  const [activeTab, setActiveTab] = useState<'questions' | 'csv' | 'users'>('questions');

  // Form State for creating new questions
  const [showAddForm, setShowAddForm] = useState(false);
  const [section, setSection] = useState<'VARC' | 'DILR' | 'QA'>('QA');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [qType, setQType] = useState<'MCQ' | 'TITA'>('MCQ');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [explanation, setExplanation] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [trap, setTrap] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [idealTime, setIdealTime] = useState<number>(90);
  
  // CSV Import States
  const [csvPreview, setCsvPreview] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Live Users from Database
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setLoadingUsers(true);
      fetch('/api/admin/users')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setLiveUsers(data);
          setLoadingUsers(false);
        })
        .catch((e) => {
          console.error(e);
          setLoadingUsers(false);
        });
    }
  }, [user]);

  // Authorization Shield
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-2xl max-w-md mx-auto space-y-5 shadow-sm">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
          <Lock size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Admin operations workspace is restricted. Please sign in with an authorized administrator account to manage mock bank databases.
          </p>
        </div>
        <Link href="/dashboard" className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm text-center">
          Return to Student Dashboard
        </Link>
      </div>
    );
  }

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !questionText || !correctAnswer) return;

    // Call Context action
    addQuestion({
      section,
      topic,
      subtopic,
      type: qType,
      questionText,
      options: qType === 'MCQ' ? options : undefined,
      correctAnswer,
      explanation,
      shortcut,
      trap,
      difficulty,
      idealTime: +idealTime,
      avgAccuracy: 75
    });

    // Reset Form
    setShowAddForm(false);
    setTopic('');
    setSubtopic('');
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('0');
    setExplanation('');
    setShortcut('');
    setTrap('');
  };

  // Simulated CSV importer parsing logic
  const handleSimulateCsvImport = () => {
    setImportStatus('parsing');
    
    setTimeout(() => {
      // Simulate adding 2 QA Arithmetic questions
      addQuestion({
        section: 'QA',
        topic: 'Arithmetic',
        subtopic: 'Percentages',
        type: 'MCQ',
        questionText: 'In an election, Candidate A got 40% of the total votes and lost to Candidate B by 1200 votes. What was the total number of votes polled?',
        options: ['4000', '5000', '6000', '8000'],
        correctAnswer: '2', // 6000 (Candidate B got 60%. Difference is 20%. 20% of Total = 1200 => Total = 6000)
        explanation: 'Candidate A gets 40% votes. Thus, Candidate B gets 60% votes. Difference = 60% - 40% = 20%. Given 20% of Total = 1200 => Total = 6000.',
        shortcut: 'Difference of 20% = 1200. Multiply by 5 to get 100% = 6000.',
        trap: 'Confusing 40% of total with 40% of remaining is a common voter percentage trap.',
        difficulty: 'Easy',
        idealTime: 60,
        avgAccuracy: 88
      });

      addQuestion({
        section: 'QA',
        topic: 'Arithmetic',
        subtopic: 'Profit & Loss',
        type: 'TITA',
        questionText: 'A dealer marks his goods 20% above the cost price and allows a discount of 10%. Find his net gain percentage.',
        correctAnswer: '8', // 1.2 * 0.9 = 1.08 => 8%
        explanation: 'Let CP = 100. Marked Price = 120. Selling Price after 10% discount = 120 - 12 = 108. Profit = 8%.',
        shortcut: 'Use net percentage change formula: a + b + ab/100 => 20 - 10 - 200/100 = 8%.',
        trap: 'Assuming profit is just 20% - 10% = 10% is a standard trap.',
        difficulty: 'Easy',
        idealTime: 45,
        avgAccuracy: 92
      });

      setImportStatus('success');
      setCsvPreview('Success: Registered 2 new QA questions into the database.');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Operations Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage test question databases, import batches of previous year papers, and review student analytics.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-muted/60 p-1 rounded-lg border border-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'questions' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database size={14} /> Questions Bank ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'csv' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UploadCloud size={14} /> Bulk CSV Import
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={14} /> Enrolled Candidates
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        
        {/* TAB 1: QUESTIONS BANK */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base">Test Bank registry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage live mock test questions bank</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Single Question
              </button>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="pb-3 w-[150px]">Section & Topic</th>
                    <th className="pb-3 w-[200px]">Question Text</th>
                    <th className="pb-3 text-center w-[80px]">Difficulty</th>
                    <th className="pb-3 text-center w-[80px]">Type</th>
                    <th className="pb-3 text-center w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-secondary/20">
                      <td className="py-4">
                        <span className={`text-[9px] px-1.5 py-0.25 rounded font-extrabold uppercase mr-1.5 ${
                          q.section === 'QA' ? 'bg-emerald-500/10 text-emerald-600' :
                          q.section === 'VARC' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-pink-500/10 text-pink-600'
                        }`}>
                          {q.section}
                        </span>
                        <span className="font-bold text-foreground block md:inline">{q.topic}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{q.subtopic}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-muted-foreground font-medium truncate max-w-[300px]">{q.questionText}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                          q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-500">{q.type}</td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete from Database"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BULK IMPORT (CSV) */}
        {activeTab === 'csv' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="font-bold text-base">Bulk Spreadsheet Upload</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Import batch questions or papers using standard CSV layouts</p>
            </div>

            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center space-y-4 hover:border-primary/50 transition">
              <UploadCloud size={48} className="text-muted-foreground mx-auto" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground">Drag and drop your spreadsheet here</p>
                <p className="text-muted-foreground">Accepts .csv format (max 5MB file sizes)</p>
              </div>
              <button 
                type="button"
                onClick={handleSimulateCsvImport}
                className="bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                Choose Local CSV File
              </button>
            </div>

            {/* Simulated CSV Log display */}
            {importStatus && (
              <div className="p-4 bg-secondary/50 border border-border rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  {importStatus === 'parsing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span className="text-muted-foreground">Parsing CSV columns...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">CSV Batch Import Successful!</span>
                    </>
                  )}
                </div>
                {csvPreview && <p className="text-[11px] text-muted-foreground leading-normal">{csvPreview}</p>}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER REGISTER */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-base">Enrolled mock candidates</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage users registered in the mentorship portal</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="pb-3">Candidate Details</th>
                    <th className="pb-3">Active Role</th>
                    <th className="pb-3 text-center">Completed Mocks</th>
                    <th className="pb-3 text-center">Estimated Percentile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground animate-pulse font-medium">
                        Loading live candidate registry...
                      </td>
                    </tr>
                  ) : liveUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground font-medium">
                        No candidates registered.
                      </td>
                    </tr>
                  ) : (
                    liveUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-secondary/20">
                        <td className="py-4">
                          <span className="font-bold text-foreground block">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground block">{u.email}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                            u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-foreground">{u.completedTestsCount} Mocks</td>
                        <td className="py-4 text-center text-primary font-extrabold text-sm">{u.estimatedPercentile}%ile</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add Single Question Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-100 text-slate-800 text-xs font-semibold my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-600" /> Create Exam Question (Database Entry)
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as typeof section)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-bold"
                  >
                    <option value="QA">QA (Quant)</option>
                    <option value="VARC">VARC</option>
                    <option value="DILR">DILR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Geometry"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Subtopic</label>
                  <input
                    type="text"
                    placeholder="e.g. Triangles"
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Question Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the mathematical or reading passage question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-medium leading-normal"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Question Format</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as typeof qType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-bold"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="TITA">TITA (Numerical Text)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Correct Answer Value</label>
                  <input
                    type="text"
                    required
                    placeholder={qType === 'MCQ' ? 'Option index (0, 1, 2, 3)' : 'e.g. 17 or 2314'}
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-bold"
                  >
                    <option value="Easy">Easy (Level 1-2)</option>
                    <option value="Medium">Medium (Level 3-4)</option>
                    <option value="Hard">Hard (Level 5)</option>
                  </select>
                </div>
              </div>

              {qType === 'MCQ' && (
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase">Multiple Choice Options</label>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        required={qType === 'MCQ'}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Step-by-step Solution</label>
                <textarea
                  rows={2}
                  placeholder="Provide complete solving instructions..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Fastest Shortcut (AI Mentor recommendation)</label>
                  <input
                    type="text"
                    placeholder="e.g. Use Fermat's Little Theorem"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Common Trap to Avoid</label>
                  <input
                    type="text"
                    placeholder="e.g. Squaring negative coefficients wrong"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Register Single Question & Save
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
