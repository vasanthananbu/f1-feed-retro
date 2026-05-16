import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Telemetry, Lap, Interval } from '../types';
import { Gauge, Milestone, Timer, Info } from 'lucide-react';

interface RaceTrackProps {
  topDrivers: {
    driver: Driver;
    telemetry: Telemetry | null;
    lap: Lap | null;
    interval: Interval | null;
  }[];
  totalLaps: number;
  theme: 'dark' | 'light';
}

export default function RaceTrack({ topDrivers, totalLaps, theme }: RaceTrackProps) {
  const [hoveredDriver, setHoveredDriver] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const formatSpeed = (speed: number | undefined) => speed ? `${speed} KM/H` : '--- KM/H';

  return (
    <div ref={containerRef} className="w-full max-w-6xl mb-8 relative border-4 border-[var(--border-primary)] p-0 bg-[var(--bg-secondary)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pixel-border">
      {/* Header Bar */}
      <div className={`${theme === 'dark' ? 'bg-red-600' : 'bg-red-700'} px-4 py-1 flex items-center justify-between border-b-4 border-[var(--border-primary)] relative z-20`}>
        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
          <Milestone className="w-3 h-3" />
          <span className="hidden xs:inline">CHAMPIONSHIP CIRCUIT // TOP 3</span>
          <span className="xs:hidden">TOP 3 FEED</span>
        </div>
        <div className="text-[10px] font-black text-white uppercase opacity-60">MODE: VIRTUAL_RACE</div>
      </div>

      {/* Track Layout */}
      <div className="relative h-64 sm:h-72 w-full flex flex-col">
        {/* Grass Top */}
        <div className="h-4 sm:h-6 track-grass border-b-4 border-black flex items-center justify-around overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
             <div key={i} className="w-1 h-1 bg-white/10 rounded-full" />
          ))}
        </div>

        {/* Curb Top */}
        <div className="h-3 sm:h-4 curb-red-white border-b-4 border-black" />

        {/* Asphalt Center */}
        <div className="flex-1 track-asphalt relative z-10">
          {/* Lane Markings */}
          <div className="absolute inset-x-0 top-1/3 h-1 bg-white/10 border-t-2 border-dashed border-white/5" />
          <div className="absolute inset-x-0 top-2/3 h-1 bg-white/10 border-t-2 border-dashed border-white/5" />
          
          {/* Starting Line */}
          <div className="absolute left-10 sm:left-20 top-0 bottom-0 w-6 sm:w-8 bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,#000_10px,#000_20px)] opacity-30" />

          {/* Render Drivers */}
          <AnimatePresence>
            {topDrivers.map((item, idx) => {
              const { driver, telemetry, lap, interval } = item;
              const isHovered = hoveredDriver === driver.driver_number;

              // Responsive positioning
              const basePos = containerWidth * 0.2;
              const spacing = containerWidth * 0.15;
              const xPos = basePos + (2 - idx) * spacing;
              const yPos = (idx * (containerWidth < 640 ? 45 : 55)) + 30;

              return (
                <motion.div
                  key={driver.driver_number}
                  layout
                  initial={false}
                  animate={{ 
                    x: xPos, 
                    y: yPos,
                    zIndex: isHovered ? 1000 : 10 + (3 - idx) 
                  }}
                  transition={{ type: 'spring', stiffness: 70, damping: 20 }}
                  className="absolute pointer-events-auto"
                  onMouseEnter={() => setHoveredDriver(driver.driver_number)}
                  onMouseLeave={() => setHoveredDriver(null)}
                >
                  {/* Driver Label */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-[9px] font-black px-1.5 border-2 border-white/20 shadow-md" style={{ color: `#${driver.team_colour}` }}>
                    {idx === 0 && '👑 '}{driver.name_acronym}
                  </div>

                  {/* NES Style Car Sprite */}
                  <div className="relative w-16 sm:w-20 h-8 sm:h-10 flex items-center justify-center cursor-help">
                    {/* Tires */}
                    <div className="absolute left-2 sm:left-3 -top-1.5 w-3 sm:w-4 h-2.5 sm:h-3 bg-black rounded-sm border border-white/10" />
                    <div className="absolute left-2 sm:left-3 -bottom-1.5 w-3 sm:w-4 h-2.5 sm:h-3 bg-black rounded-sm border border-white/10" />
                    <div className="absolute right-3 sm:right-4 -top-1.5 w-3 sm:w-4 h-2.5 sm:h-3 bg-black rounded-sm border border-white/10" />
                    <div className="absolute right-3 sm:right-4 -bottom-1.5 w-3 sm:w-4 h-2.5 sm:h-3 bg-black rounded-sm border border-white/10" />
                    
                    {/* Rear Wing */}
                    <div className="absolute left-0 top-1 bottom-1 w-2 sm:w-3 bg-black rounded-sm" />
                    
                    {/* Main Body */}
                    <div className="w-11 sm:w-14 h-5 sm:h-6 rounded-sm border-2 border-black relative overflow-hidden" style={{ backgroundColor: `#${driver.team_colour}` }}>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                       <div className="absolute inset-y-1 right-4 sm:right-5 w-2 sm:w-3 bg-black/60 rounded-full border border-white/20" /> {/* Cockpit */}
                    </div>
                    
                    {/* Front Nose */}
                    <div className="absolute right-0.5 sm:right-1 top-2 bottom-2 w-3 sm:w-4 bg-black rounded-r-xl" />
                  </div>

                  {/* Hover Panel */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className={`absolute left-1/2 -translate-x-1/2 bottom-[120%] mb-4 w-64 border-4 p-3 z-[2000] shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-none ${theme === 'dark' ? 'bg-[#0a0a0a] border-white shadow-[0_0_50px_rgba(255,255,255,0.4)]' : 'bg-white border-black shadow-[0_0_50px_rgba(0,0,0,0.2)]'}`}
                      >
                        <div className={`flex justify-between items-center mb-2 border-b-2 pb-1 ${theme === 'dark' ? 'border-white/20' : 'border-black/10'}`}>
                          <span className={`text-xs font-black uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{driver.full_name}</span>
                          <span className="text-[10px] px-1 bg-yellow-400 text-black font-black leading-none flex items-center h-4">P{idx + 1}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Velocity</span>
                            <span className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} font-bold flex items-center gap-1`}>
                              <Gauge className="w-3 h-3" />
                              {formatSpeed(telemetry?.speed)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Lap Time</span>
                            <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold flex items-center gap-1`}>
                              <Timer className="w-3 h-3" />
                              L{lap?.lap_number || '--'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Sector Breakdown</span>
                            <div className="flex gap-2 text-[8px] mt-0.5">
                              <span className={`${theme === 'dark' ? 'text-green-500' : 'text-green-700'} font-bold`}>S1:{lap?.i1_speed || '---'}</span>
                              <span className={`${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-700'} font-bold`}>S2:{lap?.i2_speed || '---'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Drivetrain</span>
                            <span className={`${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-900'} font-mono`}>
                              {telemetry?.gear ? `G${telemetry.gear}` : '-'} / {telemetry?.rpm || '--'}RPM
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Relative Gap</span>
                            <span className="text-yellow-500 font-black">
                              {interval?.gap_to_leader ? `+${interval.gap_to_leader}S` : 'LEADER'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-black uppercase tracking-tighter">Completion</span>
                            <span className="text-red-500 font-black">
                              {totalLaps - (lap?.lap_number || 0)} LAPS REM
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 h-1.5 overflow-hidden border ${theme === 'dark' ? 'bg-cyan-900/50 border-cyan-800' : 'bg-cyan-100 border-cyan-400'}`}>
                          <motion.div 
                            className={`h-full ${theme === 'dark' ? 'bg-cyan-400 shadow-[0_0_8px_white]' : 'bg-cyan-600'}`} 
                            animate={{ width: `${Math.min(100, ((telemetry?.speed || 0) / 350) * 100)}%` }} 
                          />
                        </div>

                        <div className="mt-2 text-[7px] text-gray-600 flex items-center gap-1 font-black uppercase tracking-tight">
                           <Info className="w-2 h-2" />
                           <span>System: Synchronized // Feed: Secure</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Curb Bottom */}
        <div className="h-4 curb-red-white border-t-4 border-black" />

        {/* Grass Bottom */}
        <div className="h-6 track-grass border-t-4 border-black flex items-center justify-around overflow-hidden">
           {Array.from({ length: 10 }).map((_, i) => (
             <div key={i} className="w-1 h-1 bg-white/10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Track Info Screen */}
      <div className={`px-4 py-1.5 flex items-center justify-between border-t-4 border-black text-[9px] font-black text-white uppercase tracking-widest overflow-hidden transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-900'}`}>
        <div className="flex gap-4">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-400 rounded-full" /> TRACK: OPTIMAL</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-400 rounded-full" /> TELEMETRY: LINKED</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="animate-pulse">LIVE FEED ACTIVE</span>
           <span>v1.2.6</span>
        </div>
      </div>
    </div>
  );
}
