// 妝匣
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
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

// letterPhase: 0=未觸發 1=大圖提示 2=飛入動畫 3=已收入
type LetterPhase = 0 | 1 | 2 | 3;

const JEWELRY_DIALOG_LINES: Line[] = [
  {
    text: '這是她寫給大將軍父親的家書？墨跡有些凌亂...',
    headExpression: 'normal',
  },
  {
    text: '『……哥哥在邊疆連戰連捷，宮中人人道賀。可近來聖心難測，皇上每每提及哥哥的軍功，雖笑意盈盈，那笑卻未達眼底，盡是試探與防備……』',
    headExpression: 'normal',
  },
  {
    text: '『阿爹，宮牆風冷，女兒心頭惶恐。總覺得這潑天的恩寵下，藏著誅心的殺機……』',
    headExpression: 'normal',
  },
];

const JEWELRY_DIALOG_CHAR = {
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

  // 妝匣狀態
  const [boxOpen, setBoxOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [letterPhase, setLetterPhase] = useState<LetterPhase>(0);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLineIndex, setDialogLineIndex] = useState(0);
  const [showClueHint, setShowClueHint] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<{ left: string; top: string } | null>(null);
  const boxContainerRef = useRef<HTMLDivElement>(null);

  // 靜態配置
  const DETAIL_LAYOUT = {
    background: { scale: 1.0, imgX: 0, imgY: 7 }
  };

  // 初始化：讀取道具欄狀態
  useEffect(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        if (arr[0]) setHasKey(true);
        if (arr[1]) {
          setLetterPhase(3);
          setBoxOpen(true);
          setShowBottomText(false);
          setShowClueHint(true);
        }
      }
    } catch {}
    // 監聽道具欄更新（例如 porcelain 取得 key 後）
    const syncInventory = () => {
      try {
        const stored = localStorage.getItem('game-inventory');
        if (stored) {
          const arr = JSON.parse(stored) as (string | null)[];
          setHasKey(!!arr[0]);
        }
      } catch {}
    };
    window.addEventListener('inventory-update', syncInventory);
    return () => window.removeEventListener('inventory-update', syncInventory);
  }, []);

  // 用快捷鍵 Ctrl + E 同步編輯模式狀態
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') setIsEditMode(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 玩家把 key 拖到妝匣上
  const handleItemDrop = useCallback((slotIndex: number, x: number, y: number) => {
    if (slotIndex !== 0 || !hasKey || boxOpen) return;
    if (!boxContainerRef.current) return;

    const rect = boxContainerRef.current.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;

    // 播放音效
    new Audio('/open.mp3').play().catch(() => {});

    // 打開妝匣
    setBoxOpen(true);
    setShowBottomText(false);

    // 從道具欄移除 key
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[0] = null;
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
      setHasKey(false);
    } catch {}

    // 稍候顯示信件彈出
    setTimeout(() => setLetterPhase(1), 600);
  }, [hasKey, boxOpen]);

  // 玩家點擊信件大圖：先開 bar → 等 bar 展開 → 測量 slot 1 位置 → 開始飛入動畫
  const handleLetterPopupClick = useCallback(() => {
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
      setLetterPhase(2);
    }, 400);
  }, []);

  // 信件飛入完成：寫入 slot 2、顯示 dialog
  const handleLetterAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[1] = '/letter.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}
    setLetterPhase(3);
    setInventoryForceOpen(false);
    setTimeout(() => setShowDialog(true), 300);
  }, []);

  // Dialog 換頁 / 關閉
  const handleNextDialogLine = useCallback(() => {
    if (dialogLineIndex < JEWELRY_DIALOG_LINES.length - 1) {
      setDialogLineIndex(prev => prev + 1);
    } else {
      setShowDialog(false);
      setDialogLineIndex(0);
    }
  }, [dialogLineIndex]);

  const hotspot = INVESTIGATION_HOTSPOTS.find(h => h.id === paramId) ||
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '2') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('妝匣'));

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
      {/* 頂部資訊條 */}
      <InvestigationHeader
        title={hotspot.name}
        subtitle="細節查看"
        category="Detail View"
        onBack={() => router.back()}
      />

      {/* 背景容器：可作為 key 的拖放目標 */}
      <div
        ref={boxContainerRef}
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
      >
        <img
          src={boxOpen ? '/jewelry_box2.png' : (hotspot.detailBackgroundUrl || '/jewelry_box.png')}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none pointer-events-none select-none transition-all duration-700"
          style={{
            transform: `scale(${DETAIL_LAYOUT.background.scale}) translate(${DETAIL_LAYOUT.background.imgX}%, ${DETAIL_LAYOUT.background.imgY}%)`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* Phase 1：信件大圖提示，點擊繼續 */}
      <AnimatePresence>
        {letterPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleLetterPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/letter.png"
              alt="letter"
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
              取得「家書」
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

      {/* Phase 2：信件從中央縮小飛入道具欄第二格 */}
      {letterPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: slotTarget?.left ?? 'calc(100vw - 446px)',
            top: slotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleLetterAnimationComplete}
        >
          <img src="/letter.png" alt="letter" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* 已取得線索提示 */}
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

      {/* Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            key={dialogLineIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={JEWELRY_DIALOG_LINES[dialogLineIndex]}
              currentChar={JEWELRY_DIALOG_CHAR}
              nextLine={handleNextDialogLine}
            />
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
                「這是她平時慣用的紫檀妝匣，今日竟然上了鎖……這鎖孔極小，看來得找把特製的精緻鑰匙才能打開。裡面到底藏了什麼，讓她臨死前還要如此小心防備？」
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

      {/* 道具欄：若有 key 且妝匣未開，slot 0 可拖拽 */}
      <div className={isEditMode ? 'z-2000' : 'z-40'}>
        <InventoryBar
          isEditMode={isEditMode}
          forceOpen={inventoryForceOpen}
          draggableSlots={hasKey && !boxOpen ? [0] : []}
          onItemDrop={handleItemDrop}
        />
      </div>

      {/* 對話紀錄 */}
      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={[]}
      />

      {/* 遊戲選單 */}
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
