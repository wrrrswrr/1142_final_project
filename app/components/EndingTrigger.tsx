'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

const REQUIRED_ITEMS = ['/druglist.png', '/stamp.png', '/letter.png', '/needle_black.png'];

const CLUE_LABELS: Record<string, string> = {
  '/druglist.png': '內務府領藥單',
  '/stamp.png': '半枚龍紋斷章',
  '/letter.png': '未寄出的家書',
  '/needle_black.png': '發黑的銀針',
};

export default function EndingTrigger() {
  const router = useRouter();
  const [triggered, setTriggered] = useState(false);
  const [hoveredSuspect, setHoveredSuspect] = useState<'C' | 'B' | null>(null);

  // 監聽道具欄，若同時擁有三樣線索則觸發
  useEffect(() => {
    const checkInventory = () => {
      try {
        const stored = localStorage.getItem('game-inventory');
        if (!stored) return;
        const slots: (string | null)[] = JSON.parse(stored);
        const hasAll = REQUIRED_ITEMS.every(item => slots.includes(item));
        if (hasAll) setTriggered(true);
      } catch {}
    };

    checkInventory();
    window.addEventListener('inventory-update', checkInventory);
    return () => window.removeEventListener('inventory-update', checkInventory);
  }, []);

  const handleSuspectClick = (ending: 'endingA' | 'endingB') => {
    // 直接覆寫 story 的存檔，讓 story 頁面載入時從對應結局場景開始
    try {
      const saved = localStorage.getItem('vn-save-ancient');
      const state = saved ? JSON.parse(saved) : { variables: {}, history: [] };
      state.currentSceneId = ending;
      state.currentLineIndex = 0;
      localStorage.setItem('vn-save-ancient', JSON.stringify(state));
    } catch {}
    router.push('/story');
  };

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[9000] flex flex-col items-center justify-center font-serif"
          style={{ background: 'rgba(0,0,0,0.92)' }}
        >
          {/* 背景裝飾粒子光暈 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
            }}
          />

          {/* 三件線索浮現 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="flex gap-10 mb-12"
          >
            {REQUIRED_ITEMS.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.2, duration: 0.7, ease: 'backOut' }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-60"
                    style={{ background: 'rgba(212,175,55,0.4)', transform: 'scale(1.3)' }}
                  />
                  <img
                    src={src}
                    alt={CLUE_LABELS[src]}
                    className="relative w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.9)]"
                  />
                </div>
                <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-serif">
                  {CLUE_LABELS[src]}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* 提示文字 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-14 text-center"
          >
            <p className="text-stone-200 text-2xl md:text-3xl tracking-[0.4em] font-serif drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">
              線索收集完整
            </p>
            <p className="mt-3 text-[#D4AF37] text-lg tracking-[0.5em]">
              請小主指認兇手
            </p>
            {/* 裝飾線 */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="w-16 h-px bg-[#D4AF37]/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
              <div className="w-16 h-px bg-[#D4AF37]/40" />
            </div>
          </motion.div>

          {/* 兩位候選人 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex gap-20 md:gap-32 items-end"
          >
            {/* 左：熙貴妃 → endingA */}
            <SuspectCard
              src="/C_normal.png"
              name="熙貴妃"
              title="貴妃·熙氏"
              isHovered={hoveredSuspect === 'C'}
              onHover={() => setHoveredSuspect('C')}
              onLeave={() => setHoveredSuspect(null)}
              onClick={() => handleSuspectClick('endingA')}
              delay={2.0}
            />

            {/* 右：皇上 → endingB */}
            <SuspectCard
              src="/B_normal.png"
              name="皇上"
              title="天子·聖上"
              isHovered={hoveredSuspect === 'B'}
              onHover={() => setHoveredSuspect('B')}
              onLeave={() => setHoveredSuspect(null)}
              onClick={() => handleSuspectClick('endingB')}
              delay={2.2}
            />
          </motion.div>

          {/* 底部裝飾 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 2.8, duration: 1 }}
            className="absolute bottom-10 text-white text-[10px] tracking-[0.8em] uppercase"
          >
            點擊人像以指認
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 候選人卡片 ──────────────────────────────────────────
function SuspectCard({
  src,
  name,
  title,
  isHovered,
  onHover,
  onLeave,
  onClick,
  delay,
}: {
  src: string;
  name: string;
  title: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.9, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4 cursor-pointer group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* 人像 */}
      <motion.div
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative"
      >
        {/* hover 時背後金色光暈 */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 90% at 50% 80%, rgba(212,175,55,0.35) 0%, transparent 70%)',
            filter: 'blur(18px)',
            transform: 'scale(1.3)',
          }}
        />
        <img
          src={src}
          alt={name}
          className="relative w-52 h-64 md:w-64 md:h-80 object-contain object-bottom"
          style={{
            filter: isHovered
              ? 'drop-shadow(0 0 28px rgba(212,175,55,0.75)) brightness(1.08)'
              : 'brightness(0.82)',
            transition: 'filter 0.35s ease',
          }}
        />
      </motion.div>

      {/* 名稱 */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <p
          className="text-stone-200 text-xl tracking-[0.4em] font-serif"
          style={{ textShadow: isHovered ? '0 0 12px rgba(212,175,55,0.8)' : 'none' }}
        >
          {name}
        </p>
        <p className="mt-1 text-[#D4AF37]/60 text-[10px] tracking-[0.6em]">{title}</p>
      </motion.div>
    </motion.div>
  );
}
