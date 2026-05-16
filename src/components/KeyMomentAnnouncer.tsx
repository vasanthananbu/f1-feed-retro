import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyMoment } from '../types';
import { X } from 'lucide-react';

interface KeyMomentAnnouncerProps {
  moments: KeyMoment[];
  onComplete: (id: string) => void;
}

export default function KeyMomentAnnouncer({ moments, onComplete }: KeyMomentAnnouncerProps) {
  const [currentMoment, setCurrentMoment] = useState<KeyMoment | null>(null);
  const [queue, setQueue] = useState<KeyMoment[]>([]);
  const [isBetweenMoments, setIsBetweenMoments] = useState(false);

  useEffect(() => {
    // Add new moments to queue
    setQueue(prev => {
      const newMoments = moments.filter(m => !prev.find(pm => pm.id === m.id) && currentMoment?.id !== m.id);
      return [...prev, ...newMoments];
    });
  }, [moments, currentMoment]);

  useEffect(() => {
    if (queue.length > 0 && !currentMoment && !isBetweenMoments) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentMoment(next);
    }
  }, [queue, currentMoment, isBetweenMoments]);

  useEffect(() => {
    if (currentMoment) {
      const timer = setTimeout(() => {
        handleComplete();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentMoment]);

  const handleComplete = () => {
    if (currentMoment) {
      onComplete(currentMoment.id);
      setCurrentMoment(null);
      setIsBetweenMoments(true);
      // Small cooldown to provide a breather between popups
      setTimeout(() => setIsBetweenMoments(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden flex items-center justify-center">
      <AnimatePresence>
        {currentMoment && (
          <motion.div 
            key={currentMoment.id} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex items-center justify-center w-full h-full"
          >
            {/* Close Button (Visible but pointer-events-auto) */}
            <button 
              type="button"
              onClick={handleComplete}
              className="absolute top-10 right-10 pointer-events-auto z-[2100] bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[10px] text-white font-black uppercase tracking-widest backdrop-blur-md"
            >
              Skip [ESC]
            </button>
            {/* The Racing Car Background Sweep */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute h-40 w-[200%] bg-gradient-to-r from-transparent via-red-600/20 to-transparent skew-x-12"
            />

            {/* The Car itself */}
            <motion.div
              initial={{ x: '-100vw' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 1.2, ease: 'linear' }}
              className="absolute"
            >
              <div className="relative">
                {/* Simplified Retro F1 Car Shape */}
                <div 
                  className="h-12 w-32 relative bg-red-600 pixel-border border-4 border-black shadow-[0_10px_0_rgba(0,0,0,0.5)]"
                  style={{ backgroundColor: currentMoment.teamColour ? `#${currentMoment.teamColour}` : undefined }}
                >
                  <div className="absolute -top-4 left-4 w-12 h-6 bg-inherit border-x-4 border-t-4 border-black" />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 border-2 border-black animate-pulse" />
                  {/* Wheels */}
                  <div className="absolute -bottom-4 left-2 w-6 h-6 bg-black rounded-full border-2 border-white/20" />
                  <div className="absolute -bottom-4 right-2 w-6 h-6 bg-black rounded-full border-2 border-white/20" />
                  {/* Spoiler */}
                  <div className="absolute -top-6 -left-2 w-10 h-2 bg-black" />
                </div>
                {/* Speed Lines */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col gap-2 pr-4">
                  <div className="h-1 w-24 bg-white/30 rounded-full animate-pulse" />
                  <div className="h-1 w-32 bg-white/20 rounded-full animate-pulse delay-75" />
                  <div className="h-1 w-20 bg-white/30 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </motion.div>

            {/* Announcement Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              className="relative z-10 text-center px-8 py-6 bg-black border-4 border-white pixel-border shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
              <button 
                type="button"
                onClick={handleComplete}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white text-black border-4 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors pointer-events-auto"
                title="Dismiss"
              >
                <X className="w-5 h-5 stroke-[4]" />
              </button>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Key Moment Detected</div>
              <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter mb-2">
                {currentMoment.type.replace('_', ' ')}
              </h2>
              <div className="h-1 w-24 bg-red-600 mx-auto mb-4" />
              <p className="text-lg font-mono text-white/90 uppercase tracking-tight">
                {currentMoment.message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
