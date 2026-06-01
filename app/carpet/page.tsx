// 地毯一角
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InvestigationHeader from '.././components/InvestigationHeader';
import SidebarActions from '.././components/SidebarActions';
import GameMenu from '.././components/GameMenu';
import HistoryLog from '.././components/HistoryLog';
import { INVESTIGATION_HOTSPOTS } from '.././data/investigationHotspots';
import InventoryBar from '../components/InventoryBar';
import DialogueBox from '../components/DialogueBox';
import { useAudio } from '.././lib/AudioContext';
import { appendMemoryLog } from '../lib/memoryLog';
import { motion, AnimatePresence } from 'motion/react';
import { Line } from '../types';

type SilkPhase = 0 | 1 | 2 | 3;
type StampPhase = 0 | 1 | 2 | 3;

const SILK_DIALOG_LINE: Line = {
  text: '這個絲線...似是很適合做成琴弦',
  headExpression: 'normal',
};
const STAMP_DIALOG_LINE: Line = {
  text: '等等！這是什麼？這玉質...這雕工...這是皇上從不離身的龍紋章！怎麼會有半枚碎在這裡？',
  headExpression: 'normal',
};
const DIALOG_CHAR = {
  id: 'A',
  name: '沈答應',
  color: '#5e1f22',
  headPortraits: { normal: '/A_normal.png' },
};

function CarpetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSFX } = useAudio();
  const paramId = searchParams.get('id');
  const isReplay = searchParams.get('replay') === 'true';
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBottomText, setShowBottomText] = useState(true);

  const [carpetOpen, setCarpetOpen] = useState(false);
  const [silkPhase, setSilkPhase] = useState<SilkPhase>(0);
  const [stampPhase, setStampPhase] = useState<StampPhase>(0);
  const [showSilkDialog, setShowSilkDialog] = useState(false);
  const [showStampDialog, setShowStampDialog] = useState(false);
  const [showClueHint, setShowClueHint] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [silkSlotTarget, setSilkSlotTarget] = useState<{ left: string; top: string } | null>(null);
  const [stampSlotTarget, setStampSlotTarget] = useState<{ left: string; top: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        if (arr[3] === '/stamp.png') {
          setSilkPhase(3);
          setStampPhase(3);
          setCarpetOpen(true);
          setShowBottomText(false);
          if (isReplay) { setShowStampDialog(true); } else { setShowClueHint(true); }
        } else if (arr[2] === '/silk.png') {
          setSilkPhase(3);
          setCarpetOpen(true);
          setShowBottomText(false);
          setShowClueHint(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') setIsEditMode(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hotspot = INVESTIGATION_HOTSPOTS.find(h => h.id === paramId) ||
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '6') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('地毯一角'));

  // 點擊右下區域（下半 × 右三分之一）
  const handleCarpetClick = useCallback(() => {
    if (carpetOpen || silkPhase !== 0) return;
    playSFX('button_click');
    setCarpetOpen(true);
    setShowBottomText(false);
    setTimeout(() => setSilkPhase(1), 400);
  }, [carpetOpen, silkPhase, playSFX]);

  // silk popup 點擊 → 飛入 slot 2
  const handleSilkPopupClick = useCallback(() => {
    setInventoryForceOpen(true);
    setTimeout(() => {
      const el = document.querySelector('[data-inventory-slot="2"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setSilkSlotTarget({
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
        });
      }
      setSilkPhase(2);
    }, 400);
  }, []);

  // silk 飛入完成
  const handleSilkAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[2] = '/silk.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}
    setSilkPhase(3);
    setInventoryForceOpen(false);
    setTimeout(() => setShowSilkDialog(true), 300);
  }, []);

  // silk dialog 結束 → stamp popup
  const handleSilkDialogEnd = useCallback(() => {
    setShowSilkDialog(false);
    setTimeout(() => setStampPhase(1), 300);
  }, []);

  // stamp popup 點擊 → 飛入 slot 3
  const handleStampPopupClick = useCallback(() => {
    setInventoryForceOpen(true);
    setTimeout(() => {
      const el = document.querySelector('[data-inventory-slot="3"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setStampSlotTarget({
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
        });
      }
      setStampPhase(2);
    }, 400);
  }, []);

  // stamp 飛入完成
  const handleStampAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[3] = '/stamp.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
      appendMemoryLog('/stamp.png');
    } catch {}
    setStampPhase(3);
    setInventoryForceOpen(false);
    setTimeout(() => setShowStampDialog(true), 300);
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

      {/* 背景圖 */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src={carpetOpen ? '/carpet2.png' : (hotspot.detailBackgroundUrl || '/carpet1.png')}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none pointer-events-none select-none transition-all duration-700"
          style={{ transformOrigin: 'center center' }}
        />

        {/* 右下區域點擊熱區（下半 × 右三分之一） */}
        {!carpetOpen && silkPhase === 0 && (
          <div
            onClick={handleCarpetClick}
            className="absolute cursor-pointer"
            style={{ left: '66.67%', top: '50%', width: '33.33%', height: '50%' }}
          />
        )}
      </div>

      {/* silk Phase 1：大圖提示 */}
      <AnimatePresence>
        {silkPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleSilkPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/silk.png"
              alt="silk"
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
              取得「絲線」
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

      {/* silk Phase 2：飛入 slot 2 */}
      {silkPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: silkSlotTarget?.left ?? 'calc(100vw - 356px)',
            top: silkSlotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleSilkAnimationComplete}
        >
          <img src="/silk.png" alt="silk" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* silk dialog */}
      <AnimatePresence>
        {showSilkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={SILK_DIALOG_LINE}
              currentChar={DIALOG_CHAR}
              nextLine={handleSilkDialogEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* stamp Phase 1：大圖提示 */}
      <AnimatePresence>
        {stampPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleStampPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/stamp.png"
              alt="stamp"
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
              取得「半枚龍紋斷章」
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

      {/* stamp Phase 2：飛入 slot 3 */}
      {stampPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: stampSlotTarget?.left ?? 'calc(100vw - 266px)',
            top: stampSlotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleStampAnimationComplete}
        >
          <img src="/stamp.png" alt="stamp" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* stamp dialog */}
      <AnimatePresence>
        {showStampDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={STAMP_DIALOG_LINE}
              currentChar={DIALOG_CHAR}
              nextLine={() => setShowStampDialog(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                「這處地毯的邊緣怎麼微微翻起了？姐姐向來行事規矩，長信宮的宮人們也絕不敢如此粗心大意。」
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

      <div className={isEditMode ? 'z-2000' : 'z-40'}>
        <InventoryBar
          isEditMode={isEditMode}
          forceOpen={inventoryForceOpen}
          forceClose={showSilkDialog || showStampDialog}
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

export default function CarpetPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <CarpetContent />
    </Suspense>
  );
}
