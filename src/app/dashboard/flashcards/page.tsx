'use client';

import React, { useState } from 'react';
import { useApp, Flashcard } from '@/context/AppContext';
import { 
  Sparkles, 
  Star, 
  Plus, 
  HelpCircle,
  Hash, 
  BookOpen, 
  Zap, 
  Rotate3d,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardDeck() {
  const { flashcards, toggleFlashcardFavorite, addFlashcard } = useApp();
  
  // Local state for active filters & creation modal
  const [filterCategory, setFilterCategory] = useState<'All' | Flashcard['category'] | 'Favorites'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [category, setCategory] = useState<Flashcard['category']>('Formula');
  const [topic, setTopic] = useState('');

  // Local state for tracking flipped cards by ID
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter list
  const filteredFlashcards = flashcards.filter(card => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Favorites') return card.isFavorite;
    return card.category === filterCategory;
  });

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) return;
    await addFlashcard(category, front, back, topic || undefined);
    setFront('');
    setBack('');
    setTopic('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: Flashcard['category']) => {
    switch (cat) {
      case 'Formula': return <Hash size={14} className="text-blue-500" />;
      case 'Vocabulary': return <BookOpen size={14} className="text-pink-500" />;
      case 'Shortcut': return <Zap size={14} className="text-amber-500" />;
      case 'Concept': return <Layers size={14} className="text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary" /> Memory Flashcards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review formulas, vocabulary lists, and mental arithmetic shortcuts. Click a card to flip it.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow shadow-primary/20 flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Card
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-muted/40 p-1.5 rounded-xl border border-border overflow-x-auto gap-1 text-xs">
        {(['All', 'Formula', 'Vocabulary', 'Shortcut', 'Concept', 'Favorites'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-bold transition shrink-0 ${
              filterCategory === cat
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Flashcards Grid with 3D Flip Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlashcards.map((card) => {
          const isFlipped = flippedCards[card.id] || false;
          return (
            <div 
              key={card.id}
              className="h-56 relative cursor-pointer"
              onClick={() => toggleFlip(card.id)}
              style={{ perspective: '1000px' }}
            >
              <div 
                className={`w-full h-full duration-500 rounded-2xl border border-border shadow-sm transform-style-3d relative transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                
                {/* FRONT FACE (Card front) */}
                <div className="absolute inset-0 bg-card p-6 flex flex-col justify-between backface-hidden rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="bg-secondary/60 border border-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      {getCategoryIcon(card.category)} {card.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlashcardFavorite(card.id);
                      }}
                      className="text-muted-foreground hover:text-amber-500 transition"
                    >
                      <Star size={16} className={card.isFavorite ? 'text-amber-500 fill-current' : ''} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center py-4">
                    <p className="font-bold text-sm leading-relaxed text-foreground select-text">{card.front}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                    <span>Topic: {card.topic || 'General'}</span>
                    <span className="flex items-center gap-1"><Rotate3d size={12} /> Click to Flip</span>
                  </div>
                </div>

                {/* BACK FACE (Card back) */}
                <div className="absolute inset-0 bg-secondary/80 p-6 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Mentor Explanation
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlashcardFavorite(card.id);
                      }}
                      className="text-muted-foreground hover:text-amber-500 transition"
                    >
                      <Star size={16} className={card.isFavorite ? 'text-amber-500 fill-current' : ''} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center py-4 select-text">
                    <p className="font-semibold text-xs leading-relaxed text-foreground whitespace-pre-line">{card.back}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                    <span>Topic: {card.topic || 'General'}</span>
                    <span className="flex items-center gap-1"><Rotate3d size={12} /> Click to Flip</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-slate-800 text-xs font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-600" /> Create Custom Flashcard
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Flashcard['category'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700"
                  >
                    <option value="Formula">Formula</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Shortcut">Shortcut</option>
                    <option value="Concept">Concept</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase">Topic / Subtopic</label>
                  <input
                    type="text"
                    placeholder="e.g. Geometry"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Front Prompt (Question/Term)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Inradius of a right angle triangle"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-medium leading-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase">Back Explanation (Formula/Definition)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. (a + b - c) / 2 where c is the hypotenuse"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none text-slate-700 font-medium leading-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Create Flashcard & Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Backface CSS style block injected */}
      <style jsx global>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

    </div>
  );
}
