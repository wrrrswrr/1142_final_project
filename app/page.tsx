/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAudio } from './lib/AudioContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [hasSave, setHasSave] = useState(false);
  const { stopBGM, playSFX } = useAudio();
  const router = useRouter();

  useEffect(() => {
    // 進入首頁停止所有 BGM
    stopBGM();
    
    const saved = localStorage.getItem('vn-save-ancient');
    if (saved) setHasSave(true);
  }, [stopBGM]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center font-serif text-white">
      {/* 背景裝飾 */}
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center grayscale"
        style={{ backgroundImage: 'url(/morning_inside.png)' }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

      {/* 標題區域 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center mb-16"
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-[0.2em] mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] text-[#D4AF37]">
          深宮謎案
        </h1>
        <p className="text-xl md:text-2xl tracking-[0.5em] text-stone-400 font-light">
          ANCIENT PALACE SECRETS
        </p>
      </motion.div>

      {/* 按鈕區域 */}
      <div className="relative z-10 flex flex-col gap-6 w-64">
        <Link href="/story" onClick={() => {
          playSFX('button_click');
          localStorage.removeItem('vn-save-ancient');
        }}>
          <motion.button
            whileHover={{ scale: 1.05, letterSpacing: '0.4em' }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 border border-[#D4AF37] text-[#D4AF37] text-xl tracking-[0.3em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            開始遊戲
          </motion.button>
        </Link>
      </div>

      {/* 底部文字 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute bottom-10 z-10 text-stone-600 text-sm tracking-widest"
      >
        © 2026 Web程式設計 第二組 期末專案
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap');
        body {
          background-color: black;
          margin: 0;
          font-family: 'Noto Serif TC', serif;
        }
      `}</style>
    </div>
  );
}
