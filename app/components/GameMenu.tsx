"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../lib/AudioContext';


interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export default function GameMenu({ isOpen, onClose, onReset }: GameMenuProps) {
  const { playSFX } = useAudio();

  const handleAction = (cb: () => void) => {
    playSFX('button_click');
    cb();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-9999 flex flex-col items-center justify-center p-6 font-serif"
          onClick={() => handleAction(onClose)}
          >
            <h2 className="text-7xl font-black tracking-[0.8em] text-[#D4AF37] mb-20 opacity-80 pl-[0.8em]">選單</h2>
            <div className="flex flex-col gap-8 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <MenuButtonStyle text="返回" onClick={() => handleAction(onClose)} />
              <MenuButtonStyle
                text="重來"
                onClick={() => {
                  localStorage.removeItem('vn-save-ancient');
                  localStorage.removeItem('game-inventory');
                  localStorage.removeItem('game-memory-log');
                  sessionStorage.clear();

                  window.location.href = '/';
                }}
                highlight
              />
              <button 
                onClick={() => handleAction(onClose)} 
                className="mt-20 text-stone-600 hover:text-stone-300 transition-colors tracking-[0.5em] text-xs font-bold font-sans"
              >
                EXIT TO REALITY
              </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuButtonStyle({ text, onClick, highlight = false }: { text: string, onClick: () => void, highlight?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`relative py-6 border-2 transition-all font-bold tracking-[1em] pl-[1em] text-2xl ${
        highlight 
          ? 'border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white'
          : 'border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
      }`}
    >
      {text}
    </button>
  );
}
