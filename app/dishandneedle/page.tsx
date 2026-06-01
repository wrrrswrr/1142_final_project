// 藥碟銀針
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InvestigationHeader from '../components/InvestigationHeader';
import SidebarActions from '../components/SidebarActions';
import GameMenu from '../components/GameMenu';
import HistoryLog from '../components/HistoryLog';
import { INVESTIGATION_HOTSPOTS } from '../data/investigationHotspots';
import InventoryBar from '../components/InventoryBar';
import DialogueBox from '../components/DialogueBox';
import { useAudio } from '.././lib/AudioContext';
import { appendMemoryLog } from '../lib/memoryLog';
import { motion, AnimatePresence } from 'motion/react';
import { Line } from '../types';

type NeedleBlackPhase = 0 | 1 | 2 | 3;

const DIALOG_LINE: Line = {
  text: '黑了...這茶裡果然有毒！難道真的是貴妃嫉妒她得寵，竟敢在賞賜的茶裡下毒？！我必須找到這毒藥的來源...',
  headExpression: 'angry',
};
const DIALOG_CHAR = {
  id: 'A',
  name: '沈答應',
  color: '#5e1f22',
  headPortraits: { normal: '/A_normal.png', angry: '/A_angry.png' },
};

function BlushDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSFX } = useAudio();
  const paramId = searchParams.get('id');
  const isReplay = searchParams.get('replay') === 'true';
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBottomText, setShowBottomText] = useState(true);

  // 場景狀態：0=初始, 1=茶水已倒入碟中(dish2), 2=已取得黑針
  const [dishPhase, setDishPhase] = useState(0);
  const [needleBlackPhase, setNeedleBlackPhase] = useState<NeedleBlackPhase>(0);
  const [showClueHint, setShowClueHint] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<{ left: string; top: string } | null>(null);

  const cupRef = useRef<HTMLDivElement>(null);
  const needleDraggedRef = useRef(false);

  const DETAIL_LAYOUT = {
    background: { scale: 1.0, imgX: 0, imgY: 0 }
  };

  // 初始化：讀取道具欄狀態
  useEffect(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        if (arr[1] === '/needle_black.png') {
          setNeedleBlackPhase(3);
          setDishPhase(2);
          setShowBottomText(false);
          if (isReplay) { setShowDialog(true); } else { setShowClueHint(true); }
        } else if (arr[1] === '/liquid.png') {
          // 已有茶水但未泡針，可進行下一步
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
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '5') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('藥碟與銀針'));

  // 從 bar 拖道具到場景 — liquid 倒入杯中
  const handleItemDrop = useCallback((slotIndex: number, x: number, y: number) => {
    if (dishPhase !== 0 || slotIndex !== 1) return;
    if (!cupRef.current) return;
    const rect = cupRef.current.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;

    // 移除 liquid，切換為 dish2
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[1] = null;
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}
    new Audio('/pourtea.mp3').play().catch(() => {});
    setDishPhase(1);
    setShowBottomText(false);
  }, [dishPhase]);

  // 場景中的銀針拖進杯子 → 觸發黑針 popup
  const handleNeedleDragEnd = useCallback((_: unknown, info: { point: { x: number; y: number } }) => {
    if (dishPhase !== 1 || needleBlackPhase !== 0) return;
    if (!cupRef.current) return;
    const rect = cupRef.current.getBoundingClientRect();
    if (
      info.point.x >= rect.left && info.point.x <= rect.right &&
      info.point.y >= rect.top && info.point.y <= rect.bottom
    ) {
      setNeedleBlackPhase(1);
      setShowBottomText(false);
    }
  }, [dishPhase, needleBlackPhase]);

  // 玩家點擊黑針大圖：先開 bar → 測量 slot 1 → 飛入動畫
  const handleNeedleBlackPopupClick = useCallback(() => {
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
      setNeedleBlackPhase(2);
    }, 400);
  }, []);

  // 飛入完成：寫入 slot 1、顯示 dialog
  const handleNeedleBlackAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[1] = '/needle_black.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
      appendMemoryLog('/needle_black.png');
    } catch {}
    setNeedleBlackPhase(3);
    setDishPhase(2);
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

  const bgSrc = dishPhase >= 1
    ? '/dish_and_needle2.png'
    : (hotspot.detailBackgroundUrl || '/dish_and_needle.png');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 text-stone-200 select-none font-serif flex items-center justify-center">
      <InvestigationHeader
        title={hotspot.name}
        subtitle="細節查看"
        category="Detail View"
        onBack={() => router.back()}
      />

      {/* 背景圖 */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src={bgSrc}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none pointer-events-none select-none transition-all duration-700"
          style={{
            transform: `scale(${DETAIL_LAYOUT.background.scale}) translate(${DETAIL_LAYOUT.background.imgX}%, ${DETAIL_LAYOUT.background.imgY}%)`,
            transformOrigin: 'center center',
          }}
        />

        {/* 杯子拖放目標區（不可見） */}
        <div
          ref={cupRef}
          className="absolute pointer-events-none"
          style={{ left: '28%', top: '32%', width: '28%', height: '36%' }}
        />

        {/* 場景中的銀針 — 可拖動，放在11點鐘方向 */}
        {dishPhase <= 1 && needleBlackPhase === 0 && (
          <motion.img
            src="/needle.png"
            alt="needle"
            drag
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleNeedleDragEnd}
            className="absolute w-28 h-auto object-contain select-none"
            style={{
              left: '58%',
              top: '40%',
              rotate: '-30deg',
              cursor: 'grab',
              zIndex: 20,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))',
            }}
            whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 9999 }}
          />
        )}
      </div>

      {/* Phase 1：黑針大圖提示 */}
      <AnimatePresence>
        {needleBlackPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleNeedleBlackPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/needle_black.png"
              alt="needle_black"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="w-56 h-56 object-contain drop-shadow-[0_0_32px_rgba(212,175,55,1)]"
              style={{ rotate: '-30deg' }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-6 text-[#D4AF37] text-2xl tracking-[0.4em] font-serif drop-shadow-[2px_2px_6px_rgba(0,0,0,1)]"
            >
              取得「發黑的銀針」
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

      {/* Phase 2：黑針從中央縮小飛入道具欄第二格 */}
      {needleBlackPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: slotTarget?.left ?? 'calc(100vw - 446px)',
            top: slotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleNeedleBlackAnimationComplete}
        >
          <img src="/needle_black.png" alt="needle_black" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" style={{ rotate: '-30deg' }} />
        </motion.div>
      )}

      {/* 取得黑針後的對話框 */}
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
                「案几上放著太醫留下的白瓷藥碟與銀針。宮裡的規矩，凡是入口的湯藥都得先用銀針試過。她近來身子弱，原本每日都要喝些補藥，如今藥還沒送來，人卻已經不在了……」
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
          onItemDrop={handleItemDrop}
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
