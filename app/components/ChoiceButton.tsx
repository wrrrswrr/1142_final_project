'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  delay?: number;
}

import { useAudio } from '../lib/AudioContext';

export default function ChoiceButton({ text, onClick, delay = 0 }: ChoiceButtonProps) {
  const { playSFX } = useAudio();

  const handleClick = () => {
    playSFX('button_click');
    onClick();
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onClick={handleClick}
      className="group relative w-full cursor-pointer"
    >
      {/* 按鈕背景與邊框 */}
      <div className="absolute inset-0 bg-stone-900/90 border-t border-b border-[#D4AF37]/30 transition-all duration-300 group-hover:bg-[#D4AF37]/10" />
      
      {/* 裝飾性內邊框 */}
      <div className="absolute inset-1 border border-[#D4AF37]/20 pointer-events-none" />
      
      {/* 四角裝飾 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#D4AF37] opacity-60" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#D4AF37] opacity-60" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#D4AF37] opacity-60" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#D4AF37] opacity-60" />

      {/* 文字內容 */}
      <div className="relative px-12 py-5 text-[#D4AF37] tracking-[0.6em] text-xl font-bold transition-all duration-300 group-hover:tracking-[0.8em] group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {text}
      </div>

      {/* Hover 裝飾線 */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        className="absolute bottom-2 left-12 right-12 h-1px bg-[#D4AF37] origin-center"
      />
    </motion.button>
  );
}
