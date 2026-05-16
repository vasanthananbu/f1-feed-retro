import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Session, Position, Lap, Pit, LiveState, Telemetry, Interval, SideQuest, AppNotification } from './types';
import * as f1Service from './services/f1Service';
import DriverRow from './components/DriverRow';
import RetroGrid from './components/RetroGrid';
import RaceTrack from './components/RaceTrack';
import SideQuestPanel from './components/SideQuestPanel';
import NotificationArea from './components/NotificationArea';
import KeyMomentAnnouncer from './components/KeyMomentAnnouncer';
import QuestLog from './components/QuestLog';
import KeyMomentLog from './components/KeyMomentLog';
import AIInsightBot from './components/AIInsightBot';
import * as geminiService from './services/geminiService';
import { Trophy, Radio, Activity, Map, Timer, MessageSquare, Swords, Sun, Moon, Zap } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPolls, setShowPolls] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [dismissedQuestIds, setDismissedQuestIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState<LiveState>({
    drivers: {},
    positions: {},
    laps: {},
    pits: {},
    penalties: {},
    telemetry: {},
    intervals: {},
    sideQuests: [],
    notifications: [],
    keyMoments: [],
    keyMomentHistory: [],
    fanStats: {
      xp: 0,
      level: 1,
      influence: 50
    },
    lastUpdate: new Date().toISOString(),
    session: null
  });
  const [prevPositions, setPrevPositions] = useState<Record<number, number>>({});
  const [sessionFastestLap, setSessionFastestLap] = useState<number>(Infinity);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [isSimulation, setIsSimulation] = useState(false);
  const [latestInsight, setLatestInsight] = useState('');

  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addNotification = (message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
    setState(prev => ({
      ...prev,
      notifications: [
        { id: Math.random().toString(36).substr(2, 9), message, type, timestamp: new Date().toISOString() },
        ...prev.notifications
      ].slice(0, 5)
    }));
  };

  const addKeyMoment = (moment: Omit<import('./types').KeyMoment, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      keyMoments: [...prev.keyMoments, { ...moment, id }],
      keyMomentHistory: [{ ...moment, id, timestamp: new Date().toISOString() } as any, ...prev.keyMomentHistory].slice(0, 50)
    }));
  };

  const removeKeyMoment = (id: string) => {
    setState(prev => ({
      ...prev,
      keyMoments: prev.keyMoments.filter(m => m.id !== id)
    }));
  };

  const addSideQuest = (quest: Omit<SideQuest, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      sideQuests: [
        { ...quest, id, timestamp: new Date().toISOString() },
        ...prev.sideQuests
      ].slice(0, 20)
    }));
    addNotification(`NEW QUEST: ${quest.title}`, 'INFO');
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const dismissQuest = (id: string) => {
    setDismissedQuestIds(prev => new Set([...prev, id]));
  };

  const completeQuest = (id: string, answer?: number) => {
    setDismissedQuestIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setState(prev => {
      const q = prev.sideQuests.find(sq => sq.id === id);
      const isCorrect = q?.type === 'QUIZ' && answer !== undefined && answer === q.correctOption;
      
      if (isCorrect) {
        setTimeout(() => addNotification(`CORRECT! YOU GAINED 250 XP`, 'SUCCESS'), 100);
      } else if (q?.type === 'POLL') {
        setTimeout(() => addNotification(`VOTE REGISTERED. +100 XP`, 'SUCCESS'), 100);
      }

      const xpGain = isCorrect ? 250 : (q?.type === 'MOMENT' ? 150 : 100);
      const nextXp = prev.fanStats.xp + xpGain;
      const nextLevel = Math.floor(nextXp / 1000) + 1;

      return {
        ...prev,
        sideQuests: prev.sideQuests.map(sq => 
          sq.id === id 
            ? { ...sq, isCompleted: true, userAnswer: answer } 
            : sq
        ),
        fanStats: {
          ...prev.fanStats,
          xp: nextXp,
          level: nextLevel,
          influence: Math.min(100, prev.fanStats.influence + (isCorrect ? 5 : 2))
        }
      };
    });
  };

  const fetchData = async () => {
    try {
      if (isSimulation) {
        const mock = f1Service.generateMockData();
        setState(prevState => {
          setPrevPositions(prevState.positions);
          
          const newPos: Record<number, number> = { ...prevState.positions };
          if (Math.random() > 0.8) {
             const keys = Object.keys(newPos).map(Number);
             const idx1 = Math.floor(Math.random() * keys.length);
             const idx2 = Math.floor(Math.random() * keys.length);
             const temp = newPos[keys[idx1]];
             newPos[keys[idx1]] = newPos[keys[idx2]];
             newPos[keys[idx2]] = temp;

             // Randomly trigger an overtake moment
             if (Math.random() > 0.6) {
                const driver = mock.drivers[idx1];
                if (driver) {
                  addKeyMoment({
                    type: 'OVERTAKE',
                    driverName: driver.full_name,
                    teamColour: driver.team_colour,
                    message: `${driver.name_acronym} CHARGES PAST THE COMPETITION!`
                  });
                }
             }
          }

          // Random crash simulation
          if (Math.random() > 0.99) {
             const driver = mock.drivers[Math.floor(Math.random() * mock.drivers.length)];
             addKeyMoment({
               type: 'ACCIDENT',
               driverName: driver.full_name,
               teamColour: driver.team_colour,
               message: `CRITICAL FAILURE DETECTED ON CAR ${driver.driver_number}`
             });
          }

          // Random fastest lap simulation
          if (Math.random() > 0.98) {
             const driver = mock.drivers[Math.floor(Math.random() * mock.drivers.length)];
             addKeyMoment({
               type: 'FASTEST_LAP',
               driverName: driver.full_name,
               teamColour: driver.team_colour,
               message: `PURPLE SECTOR! ${driver.name_acronym} SETS NEW FASTEST LAP`
             });
          }

          // Simulation logic for side quests
          let nextQuests = [...prevState.sideQuests];
          if (Math.random() > 0.9 && nextQuests.filter(q => !q.isCompleted).length < 3) {
            const types: Array<'POLL' | 'QUIZ'> = ['POLL', 'QUIZ'];
            const type = types[Math.floor(Math.random() * types.length)];
            const id = Math.random().toString(36).substr(2, 9);
            if (type === 'POLL') {
              nextQuests.unshift({
                id,
                type: 'POLL',
                title: 'DRIVER OF THE DAY',
                description: 'WHO HAS IMPRESSED YOU THE MOST SO FAR?',
                options: ['VERSTAPPEN', 'NORRIS', 'HAMILTON', 'LECLERC'],
                timestamp: new Date().toISOString()
              });
            } else {
              nextQuests.unshift({
                id,
                type: 'QUIZ',
                title: 'TECHNICAL KNOWLEDGE',
                description: 'WHICH TYRE COMPOUND IS INDICATED BY THE WHITE STRIPE?',
                options: ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE'],
                correctOption: 2,
                timestamp: new Date().toISOString()
              });
            }
          }

          return {
            ...prevState,
            drivers: mock.drivers.reduce((acc, d) => ({ ...acc, [d.driver_number]: d }), {}),
            positions: Object.keys(newPos).length > 0 ? newPos : mock.positions.reduce((acc, p) => ({ ...acc, [p.driver_number]: p.position }), {}),
            laps: mock.laps.reduce((acc, l) => ({ ...acc, [l.driver_number]: l }), {}),
            telemetry: mock.telemetry,
            intervals: mock.intervals.reduce((acc, i) => ({ ...acc, [i.driver_number]: i }), {}),
            sideQuests: nextQuests.slice(0, 20),
            lastUpdate: new Date().toISOString(),
            session: { 
              session_key: 0, 
              meeting_key: 0, 
              session_name: 'Simulated Race', 
              location: 'Virtual Circuit', 
              year: 2026, 
              session_type: 'Race', 
              country_name: 'World',
              date_start: new Date().toISOString()
            }
          };
        });
        setLoading(false);
        return;
      }

      let session = state.session;
      if (!session) {
        session = await f1Service.getLatestSession();
        if (!session) throw new Error('No active F1 session found');
      }

      const [driversListRaw, positionsListRaw, lapsListRaw, pitsListRaw, intervalsListRaw] = await Promise.all([
        Object.keys(state.drivers).length === 0 ? f1Service.getDrivers(session.session_key) : Promise.resolve([]),
        f1Service.getLatestPositions(session.session_key),
        f1Service.getLatestLaps(session.session_key),
        f1Service.getPits(session.session_key),
        f1Service.getLatestIntervals(session.session_key)
      ]);

      const driversList = Array.isArray(driversListRaw) ? driversListRaw : [];
      const positionsList = Array.isArray(positionsListRaw) ? positionsListRaw : [];
      const lapsList = Array.isArray(lapsListRaw) ? lapsListRaw : [];
      const intervalsList = Array.isArray(intervalsListRaw) ? intervalsListRaw : [];

      // Fetch race control messages for penalties
      const raceControlResponse = await fetch(`https://api.openf1.org/v1/race_control?session_key=${session.session_key}`);
      const raceControlData = await raceControlResponse.json();
      
      const newPenalties: Record<number, string[]> = {};
      const newMessages: string[] = [];
      
      if (Array.isArray(raceControlData)) {
        raceControlData.slice(-5).forEach(msg => {
          if (msg.message) {
            newMessages.push(msg.message);
            if (msg.message.includes('PENALTY') || msg.message.includes('TIME PENALTY')) {
               const match = msg.message.match(/CAR (\d+)/);
               if (match) {
                 const num = parseInt(match[1]);
                 newPenalties[num] = [...(newPenalties[num] || []), msg.message];
               }
            }
          }
        });
      }

      // Identify top 3
      const currentPositions = positionsList.reduce((acc, p) => {
        if (!acc[p.driver_number] || new Date(p.date) > new Date(state.lastUpdate)) {
           acc[p.driver_number] = p.position;
        }
        return acc;
      }, { ...state.positions });

      const top3Numbers = Object.keys(currentPositions)
        .map(Number)
        .sort((a, b) => currentPositions[a] - currentPositions[b])
        .slice(0, 3);

      // Fetch telemetry only for top 3
      const telemetryResults = await Promise.all(
        top3Numbers.map(num => f1Service.getLatestTelemetry(session!.session_key, num))
      );

      const nextTelemetry: Record<number, Telemetry> = { ...state.telemetry };
      telemetryResults.forEach((res, i) => {
        if (res) nextTelemetry[top3Numbers[i]] = res;
      });

      setState(prevState => {
        const nextDrivers = driversList.length > 0 
          ? driversList.reduce((acc, d) => ({ ...acc, [d.driver_number]: d }), {})
          : prevState.drivers;

        const nextPositions = positionsList.reduce((acc, p) => {
          if (!acc[p.driver_number] || new Date(p.date) > new Date(prevState.lastUpdate)) {
             acc[p.driver_number] = p.position;
          }
          return acc;
        }, { ...prevState.positions });

        const nextLaps = lapsList.reduce((acc, l) => {
          if (!acc[l.driver_number] || l.lap_number > (acc[l.driver_number]?.lap_number || 0)) {
            acc[l.driver_number] = l;
          }
          return acc;
        }, { ...prevState.laps });

        const nextIntervals = (intervalsList || []).reduce((acc, i) => {
          acc[i.driver_number] = i;
          return acc;
        }, { ...prevState.intervals });

        // Key Moment Detection
        const nextKeyMoments = [...prevState.keyMoments];
        
        // 1. Overtakes
        Object.keys(nextPositions).forEach(numStr => {
           const num = parseInt(numStr);
           if (prevState.positions[num] && nextPositions[num] < prevState.positions[num]) {
             const driver = nextDrivers[num];
             if (driver) {
               addKeyMoment({
                 type: 'OVERTAKE',
                 driverName: driver.full_name,
                 teamColour: driver.team_colour,
                 message: `${driver.name_acronym} CHARGES TO P${nextPositions[num]}`
               });
             }
           }
        });

        // 2. Fastest Lap
        Object.values(nextLaps).forEach((lap: any) => {
           if (lap.lap_duration && lap.lap_duration > 0 && lap.lap_duration < sessionFastestLap) {
             setSessionFastestLap(lap.lap_duration);
             const driver = nextDrivers[lap.driver_number];
             if (driver) {
               addKeyMoment({
                 type: 'FASTEST_LAP',
                 driverName: driver.full_name,
                 teamColour: driver.team_colour,
                 message: `NEW SCORCHING LAP: ${lap.lap_duration.toFixed(3)}s BY ${driver.name_acronym}`
               });
             }
           }
        });

        // 3. Accidents / Penalties
        if (newMessages.length > 0) { // simple check for new messages
           const latestMsg = newMessages[newMessages.length - 1];
           if (latestMsg.includes('ACCIDENT') || latestMsg.includes('STOPPED') || latestMsg.includes('RETIRED')) {
             addKeyMoment({
               type: 'ACCIDENT',
               message: latestMsg
             });
           }
        }

        // Notifications for position changes
        const nextNotifications = [...prevState.notifications];
        Object.keys(nextPositions).forEach(numStr => {
           const num = parseInt(numStr);
           if (prevState.positions[num] && nextPositions[num] < prevState.positions[num]) {
              nextNotifications.unshift({
                id: Math.random().toString(36).substr(2, 9),
                message: `${nextDrivers[num]?.name_acronym || 'DRIVER'} MOVED UP TO P${nextPositions[num]}!`,
                type: 'SUCCESS',
                timestamp: new Date().toISOString()
              });
           }
        });

        setPrevPositions(prevState.positions);
        setMessages(newMessages);

        return {
          ...prevState,
          session,
          drivers: nextDrivers,
          positions: nextPositions,
          laps: nextLaps,
          penalties: newPenalties,
          telemetry: nextTelemetry,
          intervals: nextIntervals,
          notifications: nextNotifications.slice(0, 5),
          lastUpdate: new Date().toISOString()
        };
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    pollInterval.current = setInterval(fetchData, isSimulation ? 3000 : 10000); // Poll faster in simulation
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isSimulation]);

  // AI Insights and Generation Loop
  useEffect(() => {
    const aiInterval = setInterval(async () => {
      if (loading || Object.keys(state.drivers).length === 0) return;

      // 1. Get AI Insight
      const insight = await geminiService.getRaceInsights(state);
      setLatestInsight(insight);

      // 2. Randomly generate an AI Quest
      if (showPolls && Math.random() > 0.7) {
        const aiQuest = await geminiService.generateAIQuest(state);
        if (aiQuest) {
          addSideQuest(aiQuest as any);
        }
      }

      // 3. Randomly generate an AI Key Moment
      if (showAnnouncements && Math.random() > 0.8) {
        const aiMoment = await geminiService.generateAIKeyMoment(state);
        if (aiMoment) {
          addKeyMoment(aiMoment as any);
        }
      }
    }, 45000); // Every 45 seconds

    return () => clearInterval(aiInterval);
  }, [state, loading, showPolls, showAnnouncements]);

  const sortedDriverNumbers = useMemo(() => {
    return Object.keys(state.positions)
      .map(Number)
      .sort((a, b) => state.positions[a] - state.positions[b]);
  }, [state.positions]);

  const top3DriversData = useMemo(() => {
    return sortedDriverNumbers.slice(0, 3).map(num => ({
      driver: state.drivers[num] || { driver_number: num, full_name: 'Unknown', name_acronym: 'UNK', team_name: 'Unknown', team_colour: '555', country_code: 'UN' },
      telemetry: state.telemetry[num] || null,
      lap: state.laps[num] || null,
      interval: state.intervals[num] || null
    }));
  }, [sortedDriverNumbers, state.drivers, state.telemetry, state.laps, state.intervals]);

  const remainingDrivers = sortedDriverNumbers;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-green-500 animate-pulse" />
          <span className="text-green-500 text-xl tracking-[0.5em] animate-pulse">INITIATING TELEMETRY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 flex flex-col items-center overflow-x-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-[#e4e3e0]'}`}>
      <div className="crt-overlay" />
      {theme === 'dark' && <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(45,90,39,0.15)_0%,transparent_70%)] pointer-events-none" /> }
      <RetroGrid />
      <NotificationArea notifications={state.notifications} onRemove={removeNotification} />
      <AnimatePresence>
        {showPolls && state.sideQuests.filter(q => !q.isCompleted && !dismissedQuestIds.has(q.id)).length > 0 && (
          <SideQuestPanel 
            quests={state.sideQuests.filter(q => !q.isCompleted && !dismissedQuestIds.has(q.id))} 
            onComplete={completeQuest} 
            onDismiss={dismissQuest}
          />
        )}
      </AnimatePresence>
      {showAnnouncements && <KeyMomentAnnouncer moments={state.keyMoments} onComplete={removeKeyMoment} />}
      
      {/* Header */}
      <header className={`w-full max-w-6xl mb-6 flex flex-col gap-4 border-2 p-4 lcd-bg transition-colors ${theme === 'dark' ? 'border-white/10 text-white' : 'border-black/20 text-black'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col text-left">
            <h1 className={`text-3xl sm:text-4xl font-black italic tracking-tighter flex items-center gap-3 transition-colors ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <Radio className={`w-6 h-6 sm:w-8 sm:h-8 animate-pulse ${theme === 'dark' ? 'text-red-600' : 'text-red-700'}`} />
              LIVE F1 FEED
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
              <div className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Map className="w-3 h-3" />
                <span className="uppercase">{state.session?.location || 'Unknown'}</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="uppercase">{state.session?.session_name || 'Race'}</span>
              </div>
            </div>
            
            {/* Fan Experience Bar */}
            <div className="mt-4 flex flex-col gap-1 w-full sm:w-64">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Remote Engineer Lvl {state.fanStats.level}</span>
                <span className="text-[9px] font-mono opacity-60">XP {state.fanStats.xp % 1000} / 1000</span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                <motion.div 
                  className="h-full bg-cyan-500"
                  animate={{ width: `${(state.fanStats.xp % 1000) / 10}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto text-right flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
              <button 
                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                 className={`p-2 border-2 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black hover:bg-black/10 shadow-sm'}`}
                 title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
               >
                 {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               </button>
               <button 
                 onClick={() => setShowPolls(!showPolls)}
                 className={`px-3 py-1.5 border-2 text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                   showPolls 
                    ? (theme === 'dark' ? 'bg-cyan-900/30 border-cyan-400/50 text-cyan-400' : 'bg-cyan-50 border-cyan-600 text-cyan-700 shadow-sm')
                    : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white opacity-50' : 'bg-black/5 border-black/10 text-black opacity-50')
                 }`}
                 title={showPolls ? "Disable Poll Popups" : "Enable Poll Popups"}
               >
                 <MessageSquare className="w-3 h-3" />
                 <span className="hidden xs:inline">{showPolls ? 'POLLS ON' : 'POLLS OFF'}</span>
              </button>
              <button 
                 onClick={() => setShowAnnouncements(!showAnnouncements)}
                 className={`px-3 py-1.5 border-2 text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                   showAnnouncements 
                    ? (theme === 'dark' ? 'bg-magenta-900/30 border-magenta-400/50 text-magenta-400' : 'bg-magenta-50 border-magenta-600 text-magenta-700 shadow-sm')
                    : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white opacity-50' : 'bg-black/5 border-black/10 text-black opacity-50')
                 }`}
                 title={showAnnouncements ? "Disable Live Moment Popups" : "Enable Live Moment Popups"}
               >
                 <Zap className="w-3 h-3" />
                 <span className="hidden xs:inline">{showAnnouncements ? 'LIVE ON' : 'LIVE OFF'}</span>
              </button>
              <div className="flex flex-col items-end">
                <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-black">Local Event Time</div>
                <div className={`text-2xl sm:text-3xl font-mono leading-none ${theme === 'dark' ? 'retro-glow-yellow' : 'text-black font-black underline'}`}>
                  {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const nextSimState = !isSimulation;
                setIsSimulation(nextSimState);
                setLoading(true);
                // Clear existing state when toggling to ensure fresh start
                setState(prev => ({
                  ...prev,
                  drivers: {},
                  positions: {},
                  laps: {},
                  telemetry: {},
                  lastUpdate: new Date().toISOString()
                }));
              }}
              className={`mt-2 text-[8px] font-bold border px-2 py-1 transition-all w-full sm:w-auto ${isSimulation ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : (theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-500 hover:border-white/40' : 'bg-black/5 border-black/30 text-black font-black hover:border-black/50 shadow-sm')}`}
            >
              {isSimulation ? 'LIVE STREAM: STOPPED (SIM ACTIVE)' : 'INITIATE SIMULATION'}
            </button>
          </div>
        </div>

        <div className={`flex items-center justify-between border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
           <div className="flex gap-8">
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-black">Status</span>
                 <span className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-green-500' : 'text-green-700'}`}>
                    <Activity className="w-3 h-3" />
                    TRACK CLEAR
                 </span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-black">Year</span>
                 <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{state.session?.year}</span>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
           </div>
        </div>

        {/* Message Ticker */}
        {messages.length > 0 && (
          <div className={`mt-2 border-t pt-2 flex items-center gap-3 overflow-hidden ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
            <MessageSquare className={`w-3 h-3 shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`} />
            <div className="flex-1 overflow-hidden">
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-cyan-400/80' : 'text-cyan-900/80'}`}
              >
                {messages.join(' // ')}
              </motion.div>
            </div>
          </div>
        )}
      </header>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full text-left">
          {/* Retro Race Track (Top 3) */}
          <RaceTrack topDrivers={top3DriversData} totalLaps={75} theme={theme} />

          {/* Main Standings Table (Remaining) */}
          <main className="w-full relative mt-8 overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-[450px]">
              <div className={`flex items-center h-12 px-4 mb-2 border-4 text-[12px] font-black uppercase tracking-widest pixel-border transition-colors ${theme === 'dark' ? 'bg-black border-black text-white' : 'bg-white border-black text-black'}`}>
                <div className={`w-14 text-center border-r-4 h-full flex items-center justify-center ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>Pos</div>
                <div className="flex-1 px-4">Driver // Constructor</div>
                <div className={`w-24 sm:w-32 text-right px-4 border-l-4 h-full flex items-center justify-end ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>Latest Lap</div>
              </div>

              <div className="flex flex-col gap-1">
                <AnimatePresence mode="popLayout">
                  {remainingDrivers.map((driverNum) => {
                    const driverData = state.drivers[driverNum] || { driver_number: driverNum, full_name: 'Unknown', name_acronym: 'UNK', team_name: 'Unknown', team_colour: '555', country_code: 'UN' };
                    return (
                      <DriverRow
                        key={driverNum}
                        driver={driverData}
                        position={state.positions[driverNum]}
                        prevPosition={prevPositions[driverNum] || null}
                        lastLap={state.laps[driverNum] || null}
                        isPitting={false} 
                        penalties={state.penalties[driverNum] || []}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {sortedDriverNumbers.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/10 mt-2">
                    <span className="text-red-500 font-mono italic animate-pulse">NO LIVE DATA STREAMS DETECTED</span>
                    <button 
                      onClick={fetchData}
                      className="mt-4 px-4 py-2 border border-white/20 hover:bg-white/10 text-[10px] font-bold transition-colors"
                    >
                       RETRY LINK
                    </button>
                 </div>
              )}
            </div>
          </main>

          {/* Mission Control / Quest Log & Key Moments */}
          <div className="flex flex-col gap-8 w-full">
            <QuestLog quests={state.sideQuests} onComplete={completeQuest} theme={theme} />
            <KeyMomentLog history={state.keyMomentHistory} theme={theme} />
          </div>

        </div>
      </div>

      <AIInsightBot state={state} latestInsight={latestInsight} theme={theme} />

      {/* Footer */}
      <footer className={`mt-12 w-full max-w-6xl flex justify-between items-center text-[10px] border-t pt-4 transition-colors ${theme === 'dark' ? 'text-gray-600 border-white/5' : 'text-gray-500 border-black/5'}`}>
        <div>© 2026 RETROGP SYSTEMS INC.</div>
        <div className="flex gap-4">
          <span>SIGNAL: OPTIMAL</span>
          <span>SYSTEMS: ONLINE</span>
        </div>
      </footer>
    </div>
  );
}
