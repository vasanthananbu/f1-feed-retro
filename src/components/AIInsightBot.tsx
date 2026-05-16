import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, Send, Terminal, Cpu } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LiveState } from '../types';

interface AIInsightBotProps {
  state: LiveState;
  latestInsight: string;
  theme: 'dark' | 'light';
}

export default function AIInsightBot({ state, latestInsight, theme }: AIInsightBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: "INITIALIZING_F1_ANALYTICS_CORE... READY. AWAITING_QUERY." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (latestInsight && latestInsight !== messages[messages.length - 1]?.text) {
      setMessages(prev => [...prev, { role: 'ai', text: `BROADCAST_UP_LINK: ${latestInsight}` }]);
    }
  }, [latestInsight]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY missing");
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are the F1_ANALYTICS_CORE, a high-performance racing AI. 
        Answer the user's question about the race or generic F1 knowledge in a snappy, technical, retro-futuristic style.
        
        Current State:
        - Top 3: ${JSON.stringify(Object.values(state.drivers).filter(d => state.positions[d.driver_number] <= 3).map(d => d.full_name))}
        - Recent Events: ${JSON.stringify(state.keyMomentHistory.slice(0, 3))}
        
        User: ${userMsg}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "NO_RESPONSE_FOUND // BUFFER_EMPTY" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "ERROR // CORE_OVERHEATED // RETRY_LATELY" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full pixel-border z-[3000] flex items-center justify-center border-4 ${
          theme === 'dark' 
            ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
            : 'bg-cyan-600 border-black shadow-lg'
        }`}
      >
        <Bot className={`w-7 h-7 sm:w-8 sm:h-8 ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
        <div className="absolute -top-1 -right-1">
           <span className="flex h-3 w-3 sm:h-4 sm:w-4 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-red-500 border-2 border-white"></span>
           </span>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-20 right-4 sm:bottom-28 sm:right-8 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[400px] sm:h-[500px] pixel-border border-4 z-[3000] flex flex-col overflow-hidden ${
              theme === 'dark' 
                ? 'bg-black border-cyan-400/50' 
                : 'bg-white border-black shadow-2xl'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b-4 flex items-center justify-between ${theme === 'dark' ? 'bg-cyan-900/30 border-cyan-400/50' : 'bg-cyan-50 border-black'}`}>
               <div className="flex items-center gap-3">
                 <Cpu className="w-5 h-5 text-cyan-500" />
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500">F1_ANALYTICS_CORE</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-bold opacity-60 uppercase">System Status: Optimal</span>
                    </div>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-[8px] font-bold opacity-40 hover:opacity-100 uppercase">Minimize [X]</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 border-2 pixel-border text-[10px] uppercase font-bold leading-relaxed ${
                      msg.role === 'user' 
                        ? (theme === 'dark' ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/20 text-black')
                        : (theme === 'dark' ? 'bg-cyan-950 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-600/30 text-cyan-800')
                    }`}>
                       {msg.text}
                    </div>
                    <span className="text-[8px] opacity-30 mt-1 uppercase">
                       {msg.role === 'ai' ? 'CORE_OUT >' : 'USER_IN >'}
                    </span>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                 </div>
               )}
            </div>

            {/* Input */}
            <div className={`p-3 border-t-4 ${theme === 'dark' ? 'border-cyan-400/50' : 'border-black'}`}>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="QUERY_CORE_02..."
                    className={`flex-1 bg-transparent border-2 p-2 text-[10px] font-bold uppercase transition-all focus:outline-none ${
                        theme === 'dark' ? 'border-cyan-400/30 focus:border-cyan-400 text-white' : 'border-black/20 focus:border-black text-black'
                    }`}
                  />
                  <button 
                    onClick={handleSend}
                    className={`p-2 border-2 pixel-border ${
                        theme === 'dark' ? 'bg-cyan-500 border-cyan-400 hover:bg-cyan-400' : 'bg-black border-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Footer scanlines/noise effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanline-box" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
