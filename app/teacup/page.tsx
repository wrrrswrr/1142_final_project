// 茶杯
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InvestigationHeader from '../components/InvestigationHeader';
import SidebarActions from '../components/SidebarActions';
import GameMenu from '../components/GameMenu';
import HistoryLog from '../components/HistoryLog';
import { INVESTIGATION_HOTSPOTS } from '../data/investigationHotspots';
import InventoryBar from '../components/InventoryBar';
import DialogueBox from '../components/DialogueBox';
import { useAudio } from '.././lib/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import { Line } from '../types';

type LiquidPhase = 0 | 1 | 2 | 3;

const DIALOG_LINE: Line = {
  text: '茶水聞著有一股極淡的腥苦味，完全不是上等茶葉該有的香氣……這杯熙貴妃逼著她收下的茶裡，到底摻了什麼要命的東西？',
  headExpression: 'normal',
};
const DIALOG_CHAR = {
  id: 'A',
  name: '沈答應',
  color: '#5e1f22',
  headPortraits: { normal: '/A_normal.png' },
};

function BlushDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSFX } = useAudio();
  const paramId = searchParams.get('id');
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBottomText, setShowBottomText] = useState(true);

  const [teacupOpen, setTeacupOpen] = useState(false);
  const [liquidPhase, setLiquidPhase] = useState<LiquidPhase>(0);
  const [showClueHint, setShowClueHint] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<{ left: string; top: string } | null>(null);

  const DETAIL_LAYOUT = {
    background: { scale: 1.0, imgX: 0, imgY: 0 }
  };

  // 初始化：讀取道具欄狀態
  useEffect(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        if (arr[1] === '/liquid.png' || arr[1] === '/needle_black.png') {
          setLiquidPhase(3);
          setTeacupOpen(true);
          setShowBottomText(false);
          setShowClueHint(true);
        }
      }
    } catch {}
  }, []);

  // 用快捷鍵 Ctrl + E 同步編輯模式狀態
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') setIsEditMode(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hotspot = INVESTIGATION_HOTSPOTS.find(h => h.id === paramId) ||
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '3') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('茶杯'));

  // 點擊茶杯中央白色部分
  const handleTeacupClick = useCallback(() => {
    if (teacupOpen || liquidPhase !== 0) return;
    new Audio('/pourtea.mp3').play().catch(() => {});
    setTeacupOpen(true);
    setShowBottomText(false);
    setTimeout(() => setLiquidPhase(1), 500);
  }, [teacupOpen, liquidPhase]);

  // 玩家點擊液體大圖：先開 bar → 測量 slot 1 → 飛入動畫
  const handleLiquidPopupClick = useCallback(() => {
    setInventoryForceOpen(true);
    setTimeout(() => {
      const el = document.querySelector('[data-inventory-slot="1"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlotTarget({
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
        });
      }
      setLiquidPhase(2);
    }, 400);
  }, []);

  // 飛入完成：寫入 slot 1、顯示 dialog
  const handleLiquidAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[1] = '/liquid.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}
    setLiquidPhase(3);
    setInventoryForceOpen(false);
    setTimeout(() => setShowDialog(true), 300);
  }, []);

  if (!hotspot) {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 gap-4">
        <p className="text-xl tracking-widest opacity-50">未找到調查目標...</p>
        <button
          onClick={() => router.push('/investigation')}
          className="px-6 py-2 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all rounded"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 text-stone-200 select-none font-serif flex items-center justify-center">
      <InvestigationHeader
        title={hotspot.name}
        subtitle="細節查看"
        category="Detail View"
        onBack={() => router.back()}
      />

      {/* 背景圖 + 可點擊中心區 */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src={teacupOpen ? '/teacup2.png' : (hotspot.detailBackgroundUrl || '/teacup.png')}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none select-none transition-all duration-500"
          style={{
            transform: `scale(${DETAIL_LAYOUT.background.scale}) translate(${DETAIL_LAYOUT.background.imgX}%, ${DETAIL_LAYOUT.background.imgY}%)`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        />
        {/* 可點擊的中央白色區域 */}
        {!teacupOpen && liquidPhase === 0 && (
          <div
            onClick={handleTeacupClick}
            className="absolute cursor-pointer"
            style={{ left: '35%', top: '30%', width: '30%', height: '40%' }}
          />
        )}
      </div>

      {/* Phase 1：液體大圖提示 */}
      <AnimatePresence>
        {liquidPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleLiquidPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/liquid.png"
              alt="liquid"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="w-56 h-56 object-contain drop-shadow-[0_0_32px_rgba(212,175,55,1)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-6 text-[#D4AF37] text-2xl tracking-[0.4em] font-serif drop-shadow-[2px_2px_6px_rgba(0,0,0,1)]"
            >
              取得「杯中的不明液體」
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 text-white text-xs tracking-[0.6em] uppercase"
            >
              點擊任意處繼續
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2：液體從中央縮小飛入道具欄第二格 */}
      {liquidPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: slotTarget?.left ?? 'calc(100vw - 446px)',
            top: slotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleLiquidAnimationComplete}
        >
          <img src="/liquid.png" alt="liquid" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* 取得茶水後的對話框 */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={DIALOG_LINE}
              currentChar={DIALOG_CHAR}
              nextLine={() => setShowDialog(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 已取得線索提示（再次進入時） */}
      <AnimatePresence>
        {showClueHint && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={() => setShowClueHint(false)}
            className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer pointer-events-auto"
          >
            <div className="relative group text-center">
              <p className="text-white/90 text-4xl tracking-[0.3em] font-serif font-medium drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                已取得線索
              </p>
              <div className="mt-6 flex items-center justify-center gap-4 opacity-30 group-hover:opacity-50 transition-opacity duration-1000">
                <div className="w-12 h-px bg-white" />
                <span className="text-white text-[9px] tracking-[0.8em] uppercase">點擊關閉</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部感性文字 */}
      <AnimatePresence>
        {showBottomText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            onClick={() => setShowBottomText(false)}
            className="absolute bottom-16 left-8 md:left-16 z-50 cursor-pointer max-w-xl"
          >
            <div className="relative group">
              <p className="text-white/90 text-base md:text-lg leading-loose tracking-[0.15em] font-medium drop-shadow-[2px_2px_2px_rgba(0,0,0,0.9)]">
                「這味道...應是貴妃贈與她的龍涎茶香，但似是有股不名的氣味混雜其中...？」
              </p>
              <div className="mt-6 flex items-center gap-4 opacity-30 group-hover:opacity-50 transition-opacity duration-1000">
                <div className="w-12 h-px bg-white" />
                <span className="text-white text-[9px] tracking-[0.8em] uppercase">點擊關閉</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右上角功能按鈕 */}
      <div className="absolute top-6 right-6 z-50">
        <SidebarActions
          onOpenHistory={() => setShowHistory(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </div>

      {/* 道具欄 */}
      <div className={isEditMode ? 'z-2000' : 'z-40'}>
        <InventoryBar
          isEditMode={isEditMode}
          forceOpen={inventoryForceOpen}
          forceClose={showDialog}
        />
      </div>

      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={[]}
        showDefaultMemory
      />

      <GameMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onReset={() => {
          localStorage.removeItem('vn-save-ancient');
          router.push('/');
        }}
      />
    </div>
  );
}

export default function BlushDetailPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <BlushDetailContent />
    </Suspense>
  );
}
