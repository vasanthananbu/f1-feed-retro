import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Lap, Position } from '../types';
import { ChevronUp, ChevronDown, Minus, Clock, ShieldAlert } from 'lucide-react';

interface DriverRowProps {
  key?: React.Key;
  driver: Driver;
  position: number;
  prevPosition: number | null;
  lastLap: Lap | null;
  isPitting: boolean;
  penalties: string[];
}

export default function DriverRow({
  driver,
  position,
  prevPosition,
  lastLap,
  isPitting,
  penalties
}: DriverRowProps) {
  const getPositionChange = () => {
    if (prevPosition === null) return <Minus className="w-4 h-4 text-gray-500" />;
    if (position < prevPosition) return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (position > prevPosition) return <ChevronDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const formatLapTime = (duration: number | null) => {
    if (!duration) return '--.---';
    const seconds = Math.floor(duration);
    const milliseconds = Math.floor((duration - seconds) * 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + ':' : ''}${secs < 10 && mins > 0 ? '0' : ''}${secs}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className={`group relative flex items-center h-14 mb-1.5 border-l-8 overflow-hidden transition-all shadow-lg ${
        'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:bg-[var(--accent-cyan)]/5'
      }`}
      style={{ borderLeftColor: driver.team_colour ? `#${driver.team_colour}` : 'var(--text-primary)' }}
    >
      {/* Position */}
      <div className="w-14 flex flex-col items-center justify-center border-r border-[var(--border-primary)] bg-[var(--bg-primary)]/50">
        <span className="text-xl font-black retro-glow-cyan leading-none">{position}</span>
        <div className="mt-1">{getPositionChange()}</div>
      </div>

      {/* Driver Info */}
      <div className="flex-1 px-4 flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-[var(--text-primary)]">{driver.name_acronym}</span>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase hidden sm:inline">{driver.full_name}</span>
          </div>
          <span className="text-[10px] opacity-80 uppercase" style={{ color: driver.team_colour ? `#${driver.team_colour}` : 'var(--text-secondary)' }}>
            {driver.team_name}
          </span>
        </div>
      </div>

      {/* Status Icons */}
      <div className="flex items-center gap-2 px-2">
        <AnimatePresence mode="wait">
          {isPitting && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="px-2 py-0.5 rounded bg-magenta-500/20 border border-magenta-500 text-[10px] text-magenta-500 font-bold uppercase tracking-tighter retro-glow-magenta"
            >
              IN PIT
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {penalties.length > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1 bg-red-500/20 border border-red-500 px-1.5 py-0.5 rounded"
            >
              <ShieldAlert className="w-3 h-3 text-red-500" />
              <span className="text-[10px] text-red-500 font-bold uppercase">PEN</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Columns */}
      <div className="w-24 sm:w-32 text-right px-2 sm:px-4 border-l border-[var(--border-primary)] flex flex-col justify-center">
        <div className="flex items-center justify-end gap-1 text-[8px] sm:text-[10px] text-[var(--text-secondary)]">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>LAP</span>
        </div>
        <span className={`text-[12px] sm:text-sm font-mono ${lastLap?.is_pit_out_lap ? 'text-yellow-500' : 'retro-glow-green'}`}>
          {formatLapTime(lastLap?.lap_duration || null)}
        </span>
      </div>

      {/* Background decoration for overtakes */}
      <motion.div
        className="absolute inset-0 bg-green-500/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: position < (prevPosition || position) ? [0, 0.3, 0] : 0 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute inset-0 bg-red-500/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: position > (prevPosition || position) ? [0, 0.3, 0] : 0 }}
        transition={{ duration: 1 }}
      />
    </motion.div>
  );
}
