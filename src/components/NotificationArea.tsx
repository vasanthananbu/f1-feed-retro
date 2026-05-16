import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationAreaProps {
  notifications: AppNotification[];
  onRemove: (id: string) => void;
}

export default function NotificationArea({ notifications, onRemove }: NotificationAreaProps) {
  return (
    <div className="fixed bottom-24 right-4 sm:bottom-36 sm:right-8 z-[1000] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-4 p-4 border-4 border-black shadow-[8px_8px_0px_#000] pixel-border ${
              notif.type === 'WARNING' ? 'bg-red-900' : notif.type === 'SUCCESS' ? 'bg-green-900' : 'bg-blue-900'
            }`}
          >
            <div className="shrink-0 mt-1">
              {notif.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-red-100" />}
              {notif.type === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-100" />}
              {notif.type === 'INFO' && <Bell className="w-5 h-5 text-blue-100" />}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase text-white/60 mb-1 tracking-widest">System Alert</div>
              <div className="text-xs font-bold text-white leading-tight uppercase">{notif.message}</div>
            </div>
            <button 
              onClick={() => onRemove(notif.id)}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
