"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VNState } from '../types';
import { SCRIPT, CHARACTERS } from '../script';
import { useAudio } from '../lib/AudioContext';

interface HistoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  history: VNState['history'];
}

export default function HistoryLog({ isOpen, onClose, history }: HistoryLogProps) {
  const { playSFX } = useAudio();

  const handleClose = () => {
    playSFX('button_click');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose} 
            className="fixed inset-0 bg-black/60 z-60" 
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0d0d0d] border-l-2 border-[#D4AF37]/20 z-70 p-10 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.8)]"
          >
            <h3 className="text-3xl font-black tracking-[0.5em] mb-10 text-[#D4AF37] border-b border-[#D4AF37]/10 pb-6 text-center font-serif">往事錄</h3>
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar font-serif">
              {history.length === 0 ? (
                <div className="text-stone-700 text-center py-20 italic">長河寂靜...</div>
              ) : (
                history.map((h, i) => {
                  const scene = SCRIPT.find(s => s.id === h.sceneId);
                  const line = scene?.lines[h.lineIndex];
                  const char = line?.characterId ? (CHARACTERS as any)[line.characterId] : null;
                  return (
                    <div key={i} className="group border-l-2 border-stone-800 pl-5 hover:border-[#8B0000] transition-colors">
                      <div className="text-xs font-bold mb-2 tracking-widest opacity-60 text-[#D4AF37]">{char?.name || '旁白'}</div>
                      <div className="text-lg text-stone-300 leading-relaxed">{line?.text}</div>
                    </div>
                  );
                })
              )}
            </div>
            <button 
              onClick={handleClose} 
              className="mt-8 py-3 border border-[#D4AF37]/30 text-[#D4AF37] tracking-[0.4em] font-bold hover:bg-[#D4AF37]/5 transition-colors rounded font-serif"
            >
              關閉卷軸
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
