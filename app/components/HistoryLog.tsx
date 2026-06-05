"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { VNState } from '../types';
import { SCRIPT, CHARACTERS } from '../script';
import { useAudio } from '../lib/AudioContext';

const MEMORY_CONFIG: Record<string, { name: string; route: string }> = {
  '/letter.png':      { name: '未寄出的家書', route: '/jewelrybox' },
  '/needle_black.png':{ name: '發黑的銀針',   route: '/dishandneedle' },
  '/druglist.png':    { name: '內務府領藥單', route: '/guzheng' },
  '/stamp.png':       { name: '半枚龍紋斷章', route: '/carpet' },
};

interface HistoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  history: VNState['history'];
  showDefaultMemory?: boolean;
}

export default function HistoryLog({ isOpen, onClose, history, showDefaultMemory = false }: HistoryLogProps) {
  const { playSFX } = useAudio();
  const router = useRouter();
  const [memoryLog, setMemoryLog] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('game-memory-log');
        setMemoryLog(stored ? JSON.parse(stored) : []);
      } catch { setMemoryLog([]); }
    };
    load();
    window.addEventListener('memory-log-update', load);
    return () => window.removeEventListener('memory-log-update', load);
  }, []);

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
            className="fixed inset-0 bg-black/60 z-9998" 
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0d0d0d] border-l-2 border-[#D4AF37]/20 z-9999 p-10 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.8)]"
          >
            <h3 className="text-3xl font-black tracking-[0.5em] mb-10 text-[#D4AF37] border-b border-[#D4AF37]/10 pb-6 text-center font-serif">往事錄</h3>
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar font-serif">
              {showDefaultMemory && (
                <div
                  className="relative w-full shrink-0 cursor-pointer"
                  onClick={() => { onClose(); router.push('/story?restart=true'); }}
                >
                  {/* dialog2.png 自然撐開卡片高度 */}
                  <img src="/dialog2.png" alt="" className="w-full h-auto block pointer-events-none select-none" />

                  {/* ── 人物圖（左側框） ──
                      left/top/width/height → 對齊 dialog2 左邊方框
                      scale(N)              → 半身大小，調大小用這個 */}
                  <div
                    className="absolute overflow-hidden flex items-start justify-center"
                    style={{ left: '2.83%', top: '11.7%', width: '18.68%', height: '81%', backgroundColor: 'rgba(240,230,210,0.85)' }}
                  >
                    <img
                      src="/D_sad.png"
                      alt=""
                      className="max-w-none origin-top"
                      style={{ width: '100%', transform: 'scale(2.6)' }}
                    />
                  </div>

                  {/* ── 「劇情回顧」文字（右側框中間偏左） ──
                      left → 右框左邊起點（約 29%）
                      top  → 垂直置中（約 38%）
                      fontSize → 字大小 */}
                  <div
                    className="absolute flex items-center"
                    style={{ left: '32%', top: '38%', width: '56%' }}
                  >
                    <span
                      className="font-bold font-serif tracking-[0.4em]"
                      style={{ fontSize: '1.1rem', color: '#5e1f22' }}
                    >
                      劇情回顧
                    </span>
                  </div>
                </div>
              )}
              {/* ── 道具回憶卡（依取得順序排列）── */}
              {memoryLog.map((src) => {
                const cfg = MEMORY_CONFIG[src];
                if (!cfg) return null;
                return (
                  <div
                    key={src}
                    className="relative w-full shrink-0 cursor-pointer"
                    onClick={() => { onClose(); router.push(`${cfg.route}?replay=true`); }}
                  >
                    <img src="/dialog2.png" alt="" className="w-full h-auto block pointer-events-none select-none" />
                    {/* 左側道具圖（黃色底） */}
                    <div
                      className="absolute overflow-hidden flex items-center justify-center"
                      style={{ left: '2.83%', top: '11.7%', width: '18.68%', height: '81%', backgroundColor: 'rgba(240,230,210,0.85)' }}
                    >
                      <img src={src} alt="" className="w-[90%] h-[90%] object-contain" />
                    </div>
                    {/* 右側文字 */}
                    <div
                      className="absolute flex items-center"
                      style={{ left: '32%', top: '38%', width: '56%' }}
                    >
                      <span className="font-bold font-serif tracking-[0.3em]" style={{ fontSize: '0.95rem', color: '#5e1f22' }}>
                        {cfg.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {history.length === 0 && !showDefaultMemory && memoryLog.length === 0 ? (
                <div className="text-stone-700 text-center py-20 italic">長河寂靜...</div>
              ) : history.length > 0 ? (
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
              ) : null}
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
