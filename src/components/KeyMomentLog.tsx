import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyMoment } from '../types';
import { Zap, AlertTriangle, Trophy, History } from 'lucide-react';

interface KeyMomentLogProps {
  history: KeyMoment[];
  theme: 'dark' | 'light';
}

export default function KeyMomentLog({ history, theme }: KeyMomentLogProps) {
  return (
    <div className="w-full mt-8">
      <div className={`p-2 border-b-2 mb-4 flex items-center gap-2 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
        <History className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-black uppercase tracking-widest opacity-60">Session Events // Key Moments Log</span>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {history.map((moment) => (
            <motion.div
              key={moment.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 border-2 pixel-border flex items-center gap-4 transition-all ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/5 hover:bg-white/10' 
                  : 'bg-black/5 border-black/5 hover:bg-black/10 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center shrink-0 border-2 ${
                moment.type === 'ACCIDENT' ? 'bg-red-500/20 border-red-500 text-red-500' :
                moment.type === 'FASTEST_LAP' ? 'bg-magenta-500/20 border-magenta-500 text-magenta-500' :
                moment.type === 'OVERTAKE' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500' :
                'bg-yellow-500/20 border-yellow-500 text-yellow-500'
              }`}>
                {moment.type === 'ACCIDENT' && <AlertTriangle className="w-5 h-5" />}
                {moment.type === 'FASTEST_LAP' && <Zap className="w-5 h-5" />}
                {moment.type === 'OVERTAKE' && <Trophy className="w-5 h-5" />}
                {moment.type === 'PIT_STOP' && <History className="w-5 h-5" />}
                {moment.type === 'WINNER' && <Trophy className="w-5 h-5 text-yellow-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: moment.teamColour ? `#${moment.teamColour}` : undefined }}>
                    {moment.driverName || 'SYSTEM_MSG'}
                  </span>
                  <span className="text-[8px] opacity-40 font-bold uppercase">
                    {moment.type.replace('_', ' ')}
                  </span>
                </div>
                <p className={`text-xs font-bold uppercase tracking-tight truncate ${theme === 'dark' ? 'text-white/90' : 'text-black'}`}>
                  {moment.message}
                </p>
              </div>

              <div className="text-[9px] font-mono opacity-30 text-right">
                {new Date((moment as any).timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {history.length === 0 && (
          <div className={`h-20 flex items-center justify-center border-4 border-dashed opacity-20 ${theme === 'dark' ? 'border-white/20' : 'border-black/20'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">No Events Logged // Awaiting Feed</span>
          </div>
        )}
      </div>
    </div>
  );
}
