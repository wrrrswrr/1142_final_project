'use client';

import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChoiceButton from '.././components/ChoiceButton';

function EndingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  const endings: Record<string, { title: string; subtitle: string; description: string }> = {
    'endingA': {
      title: '盲目的復仇',
      subtitle: 'BLIND REVENGE',
      description: '妳以為看穿了局，卻不知自己也是他手裡的一把刀。',
    },
    'endingB': {
      title: '無聲的真相',
      subtitle: 'SILENT TRUTH',
      description: '最絕望的不是找不到兇手，而是兇手就坐在龍椅之上。',
    }
  };

  const currentEnding = endings[type || 'endingA'] || endings['endingA'];

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-serif">
      {/* 背景裝飾 */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-stone-900/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-stone-900/50 to-transparent pointer-events-none" />
      
      {/* 結局文字 */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[#D4AF37] tracking-[0.8em] text-sm md:text-base font-light mb-8"
        >
          達成結局
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-stone-100 tracking-[0.3em] mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {currentEnding.title}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="text-stone-500 tracking-[0.5em] text-xs md:text-sm mb-16 font-light"
        >
          {currentEnding.subtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="relative py-8 md:py-12 border-y border-[#D4AF37]/20"
        >
          {/* 四角裝飾 */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF37]/40" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#D4AF37]/40" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#D4AF37]/40" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF37]/40" />
          
          <p className="text-stone-200 text-lg md:text-2xl leading-relaxed tracking-[0.2em]">
            {currentEnding.description}
          </p>
        </motion.div>
      </div>

      {/* 按鈕 */}
      <div className="relative z-10 mt-24 w-full max-w-sm">
        <ChoiceButton 
          text="再次遊玩" 
          onClick={() => {
            localStorage.removeItem('vn-save-ancient');
            router.push('/');
          }} 
          delay={3.5}
        />
      </div>

      {/* 裝飾線條 */}
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 3, delay: 1 }}
        className="absolute left-10 top-0 bottom-0 w-1px bg-stone-800/50"
      />
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 3, delay: 1.2 }}
        className="absolute right-10 top-0 bottom-0 w-1px bg-stone-800/50"
      />
    </div>
  );
}

export default function EndingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black" />}>
      <EndingContent />
    </Suspense>
  );
}
