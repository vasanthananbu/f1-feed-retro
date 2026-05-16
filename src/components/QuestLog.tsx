import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SideQuest } from '../types';
import { Swords, Vote, HelpCircle, Trophy, ChevronRight } from 'lucide-react';

interface QuestLogProps {
  quests: SideQuest[];
  onComplete: (id: string, answer?: number) => void;
  theme: 'dark' | 'light';
}

export default function QuestLog({ quests, onComplete, theme }: QuestLogProps) {
  return (
    <div className="w-full mt-8">
      <div className={`p-2 border-b-2 mb-4 flex items-center gap-2 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
        <Swords className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-black uppercase tracking-widest opacity-60">Quest Log // All Missions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border-4 p-4 pixel-border relative overflow-hidden group transition-all ${
                quest.isCompleted 
                  ? (theme === 'dark' ? 'opacity-40 grayscale-[0.5] border-white/5' : 'opacity-50 grayscale-[0.5] border-black/5')
                  : (theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10 shadow-sm')
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded text-black uppercase ${
                      quest.type === 'MOMENT' ? 'bg-green-400' : quest.type === 'POLL' ? 'bg-cyan-400' : 'bg-magenta-400'
                    }`}>
                      {quest.type}
                    </span>
                    {quest.isCompleted && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white text-black uppercase">COMPLETED</span>
                    )}
                  </div>
                  <span className="text-[8px] opacity-40 font-bold">{new Date(quest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <h3 className="text-xs font-black uppercase mb-1">{quest.title}</h3>
                <p className="text-[10px] opacity-60 leading-relaxed mb-4 uppercase font-bold">{quest.description}</p>

                {/* Interactive Options (smaller for log) */}
                <div className="flex flex-col gap-1">
                  {quest.type === 'POLL' && quest.options && quest.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={quest.isCompleted}
                      onClick={() => onComplete(quest.id, idx)}
                      className={`text-left w-full p-2 border-2 text-[9px] font-bold transition-all uppercase flex items-center justify-between group/opt ${
                        quest.isCompleted && quest.userAnswer === idx
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : theme === 'dark' ? 'border-white/10 hover:border-cyan-400' : 'border-black/10 hover:border-cyan-600'
                      }`}
                    >
                      {option}
                      {!quest.isCompleted && <ChevronRight className="w-3 h-3 opacity-0 group-hover/opt:opacity-100" />}
                      {quest.isCompleted && quest.userAnswer === idx && <Trophy className="w-3 h-3" />}
                    </button>
                  ))}

                  {quest.type === 'QUIZ' && quest.options && quest.options.map((option, idx) => {
                    const isSelected = quest.userAnswer === idx;
                    const isCorrect = idx === quest.correctOption;
                    
                    let statusClasses = theme === 'dark' ? 'border-white/10 hover:border-magenta-400' : 'border-black/10 hover:border-magenta-600';
                    
                    if (quest.isCompleted) {
                      if (isCorrect) statusClasses = 'border-green-500 bg-green-500/20 text-green-400';
                      else if (isSelected && !isCorrect) statusClasses = 'border-red-500 bg-red-500/20 text-red-500';
                      else statusClasses = 'border-white/5 opacity-40';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quest.isCompleted}
                        onClick={() => onComplete(quest.id, idx)}
                        className={`text-left w-full p-2 border-2 text-[9px] font-bold transition-all uppercase flex items-center justify-between ${statusClasses}`}
                      >
                        {option}
                        {quest.isCompleted && isCorrect && <Trophy className="w-3 h-3" />}
                      </button>
                    );
                  })}

                  {quest.type === 'MOMENT' && (
                    <button
                      disabled={quest.isCompleted}
                      onClick={() => onComplete(quest.id)}
                      className={`w-full p-2 border-2 text-[9px] font-black uppercase transition-all ${
                        quest.isCompleted 
                          ? 'border-white/5 opacity-40' 
                          : 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {quest.isCompleted ? 'ARCHIVED' : 'Archive Milestone'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {quests.length === 0 && (
          <div className={`col-span-full h-32 flex flex-col items-center justify-center border-4 border-dashed opacity-20 ${theme === 'dark' ? 'border-white/20' : 'border-black/20'}`}>
             <span className="text-[10px] font-black uppercase tracking-widest">No Active Missions // Standby</span>
          </div>
        )}
      </div>
    </div>
  );
}
