import { motion } from 'motion/react';

export default function RetroGrid() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none opacity-20">
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1000px',
        }}
      >
        <motion.div
          animate={{
            translateY: [0, 40],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-x-0 top-1/2 bottom-[-100%] h-[200%]"
          style={{
            transform: 'rotateX(60deg)',
            background: `
              linear-gradient(to bottom, transparent, #000 80%),
              linear-gradient(90deg, rgba(34, 255, 34, 0.4) 1px, transparent 1px),
              linear-gradient(rgba(34, 255, 34, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        />
      </div>
      
      {/* Horizon glow */}
      <div className="absolute top-1/2 left-0 right-0 h-32 bg-green-900/10 blur-[100px]" />
    </div>
  );
}
