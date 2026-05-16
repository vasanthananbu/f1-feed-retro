import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SideQuest } from '../types';
import { Swords, Vote, HelpCircle, Trophy, ChevronRight } from 'lucide-react';

interface SideQuestPanelProps {
  quests: SideQuest[];
  onComplete: (id: string, answer?: number) => void;
  onDismiss: (id: string) => void;
}

export default function SideQuestPanel({ quests, onComplete, onDismiss }: SideQuestPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [activeQuestIndex, setActiveQuestIndex] = useState(0);

  if (quests.length === 0) return null;

  const currentQuest = quests[activeQuestIndex] || quests[0];

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="w-full max-w-lg bg-[var(--bg-secondary)] border-8 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.2)] p-8 pixel-border relative"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 px-6 py-2 border-4 border-black flex items-center gap-3">
          <Swords className="w-5 h-5 text-black" />
          <span className="text-xl font-black text-black uppercase italic tracking-tighter">MISSION ACTIVE</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-1 rounded text-black uppercase ${
                  currentQuest.type === 'MOMENT' ? 'bg-green-400' : currentQuest.type === 'POLL' ? 'bg-cyan-400' : 'bg-magenta-400'
                }`}>
                  {currentQuest.type}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-bold">QUEST {activeQuestIndex + 1}/{quests.length}</span>
             </div>
             <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={() => onDismiss(currentQuest.id)}
                 className="text-[10px] font-black hover:text-cyan-500 transition-colors uppercase flex items-center gap-1"
                 title="Move to bottom list"
               >
                 Minimize [M]
               </button>
               <button 
                 type="button"
                 onClick={() => onComplete(currentQuest.id)}
                 className="text-[10px] font-black hover:text-red-500 transition-colors uppercase"
               >
                 Skip [ESC]
               </button>
             </div>
          </div>

          <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase mb-2 leading-tight">{currentQuest.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 uppercase font-bold border-l-4 border-[var(--border-primary)] pl-4">{currentQuest.description}</p>

          <div className="grid gap-3">
              {currentQuest.type === 'POLL' && currentQuest.options && currentQuest.options.map((option, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onComplete(currentQuest.id, idx)}
                  className="w-full p-4 border-4 border-[var(--border-primary)] hover:border-cyan-400 hover:bg-cyan-400/10 text-sm font-black text-[var(--text-primary)] transition-all uppercase flex items-center justify-between group"
                >
                  {option}
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100" />
                </button>
              ))}

              {currentQuest.type === 'QUIZ' && currentQuest.options && currentQuest.options.map((option, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    if (selectedAnswers[currentQuest.id] !== undefined) return;
                    setSelectedAnswers(prev => ({ ...prev, [currentQuest.id]: idx }));
                    setTimeout(() => onComplete(currentQuest.id, idx), 1500);
                  }}
                  className={`text-left w-full p-4 border-4 text-sm font-black transition-all uppercase flex items-center justify-between ${
                    selectedAnswers[currentQuest.id] === idx 
                      ? idx === currentQuest.correctOption ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-500'
                      : 'border-[var(--border-primary)] text-[var(--text-primary)] hover:border-magenta-400'
                  }`}
                >
                  {option}
                  {selectedAnswers[currentQuest.id] === idx && (idx === currentQuest.correctOption ? 'CORRECT' : 'INCORRECT')}
                </button>
              ))}

              {currentQuest.type === 'MOMENT' && (
                <button
                  type="button"
                  onClick={() => onComplete(currentQuest.id)}
                  className="w-full p-6 border-4 border-green-500 bg-green-500/10 text-green-400 text-lg font-black uppercase hover:bg-green-500/20 transition-all flex items-center justify-center gap-4 group"
                >
                  <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  ACKNOWLEDGE ACHIEVEMENT
                </button>
              )}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center opacity-40">
           <div className="flex gap-1">
             {quests.map((_, i) => (
               <div key={i} className={`h-1.5 w-8 ${i === activeQuestIndex ? 'bg-yellow-500' : 'bg-gray-700'}`} />
             ))}
           </div>
           <div className="text-[10px] font-black uppercase">F1 DATA LINK // SECURE</div>
        </div>
      </motion.div>
    </div>
  );
}
