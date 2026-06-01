// 古箏
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
import { appendMemoryLog } from '../lib/memoryLog';
import { motion, AnimatePresence } from 'motion/react';
import { Line } from '../types';

type DruglistPhase = 0 | 1 | 2 | 3;

const NOTE_FILES = ['do', 're', 'mi', 'sol', 'la'];

const SAD_DIALOG_LINE: Line = {
  text: '(彈奏)這首曲子...是姊姊生前最常彈奏給我聽的...',
  headExpression: 'sad',
};
const NORMAL_DIALOG_LINE: Line = {
  text: '這是...暗格？',
  headExpression: 'normal',
};
const DRUGLIST_DIALOG_LINES: Line[] = [
  { text: '這是內務府的密檔！', headExpression: 'normal' },
  { text: '『...御前侍衛領取寒髓散一包...』寒髓散是皇家秘藥，無色無味，見血封喉...', headExpression: 'normal' },
  { text: '能調動御前侍衛的...只有...', headExpression: 'angry' },
];
const DIALOG_CHAR = {
  id: 'A',
  name: '沈答應',
  color: '#5e1f22',
  headPortraits: { normal: '/A_normal.png', sad: '/A_sad.png', angry: '/A_angry.png' },
};

interface Ripple { id: number; x: number; y: number }

function GuzhengContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSFX } = useAudio();
  const paramId = searchParams.get('id');
  const isReplay = searchParams.get('replay') === 'true';
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBottomText, setShowBottomText] = useState(true);

  const [guzhengOpen, setGuzhengOpen] = useState(false);
  const [druglistPhase, setDruglistPhase] = useState<DruglistPhase>(0);
  const [dialogSeq, setDialogSeq] = useState(0);
  const [druglistLineIndex, setDruglistLineIndex] = useState(0);
  const [guzhengReady, setGuzhengReady] = useState(false);
  const [showClueHint, setShowClueHint] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<{ left: string; top: string } | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // noteMode: 'zone3only' = only 3rd quarter; 'zones23' = 2nd+3rd quarters; 'none' = disabled
  const noteMode: 'zone3only' | 'zones23' | 'none' = !guzhengOpen
    ? 'zone3only'
    : druglistPhase === 3 && dialogSeq === 0
      ? 'zones23'
      : 'none';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        if (arr[2] === '/druglist.png') {
          setGuzhengOpen(true);
          setDruglistPhase(3);
          setShowBottomText(false);
          if (isReplay) { setDialogSeq(3); setDruglistLineIndex(0); } else { setShowClueHint(true); }
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
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '4') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('古箏'));

  const playNoteAndRipple = useCallback((e: React.MouseEvent) => {
    const note = NOTE_FILES[Math.floor(Math.random() * NOTE_FILES.length)];
    new Audio(`/${note}.mp3`).play().catch(() => {});
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
  }, []);

  // silk (slot 2) dropped into middle 60% of viewport height
  const handleItemDrop = useCallback((slotIndex: number, _x: number, y: number) => {
    if (slotIndex !== 2 || guzhengOpen || druglistPhase !== 0) return;
    const vh = window.innerHeight;
    if (y < vh * 0.2 || y > vh * 0.8) return;

    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[2] = null;
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}

    const audio = new Audio('/guzheng.mp3');
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => setGuzhengReady(true));
    setGuzhengOpen(true);
    setShowBottomText(false);
    setTimeout(() => setDialogSeq(1), 400);
  }, [guzhengOpen, druglistPhase]);

  // sad dialog — blocked until guzheng.mp3 finishes
  const handleSadDialogEnd = useCallback(() => {
    if (!guzhengReady) return;
    new Audio('/open.mp3').play().catch(() => {});
    setDialogSeq(2);
  }, [guzhengReady]);

  const handleNormalDialogEnd = useCallback(() => {
    setDialogSeq(0);
    setTimeout(() => setDruglistPhase(1), 300);
  }, []);

  // druglist popup click → open bar → fly to slot 2
  const handleDruglistPopupClick = useCallback(() => {
    setInventoryForceOpen(true);
    setTimeout(() => {
      const el = document.querySelector('[data-inventory-slot="2"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlotTarget({
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
        });
      }
      setDruglistPhase(2);
    }, 400);
  }, []);

  const handleDruglistAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[2] = '/druglist.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
      appendMemoryLog('/druglist.png');
    } catch {}
    setDruglistPhase(3);
    setInventoryForceOpen(false);
    setDruglistLineIndex(0);
    setTimeout(() => setDialogSeq(3), 300);
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
          src={guzhengOpen ? '/guzheng2.png' : (hotspot.detailBackgroundUrl || '/guzheng.png')}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none pointer-events-none select-none transition-all duration-700"
          style={{ transformOrigin: 'center center' }}
        />

        {/* 音符互動區 - 第三等份（guzheng.png時） */}
        {noteMode === 'zone3only' && (
          <div
            onClick={playNoteAndRipple}
            className="absolute cursor-pointer"
            style={{ top: '47%', height: '22%', width: '80%', left: '23%'}}
          />
        )}

        {/* 音符互動區 - 第二+三等份（取得druglist後） */}
        {noteMode === 'zones23' && (
          <div
            onClick={playNoteAndRipple}
            className="absolute cursor-pointer"
            style={{ top: '25%', height: '45%', width: '80%',left: '23%'}}
          />
        )}
      </div>

      {/* 點擊漣漪動畫 */}
      {ripples.map(r => (
        <motion.div
          key={r.id}
          className="fixed pointer-events-none rounded-full border-2 border-[#D4AF37]"
          style={{ left: r.x, top: r.y, x: '-50%', y: '-50%', width: 48, height: 48, zIndex: 200 }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}

      {/* druglist Phase 1：大圖提示 */}
      <AnimatePresence>
        {druglistPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleDruglistPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/druglist.png"
              alt="druglist"
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
              取得「內務府領藥單」
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

      {/* druglist Phase 2：飛入 slot 2 */}
      {druglistPhase === 2 && (
        <motion.div
          className="fixed z-150 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: slotTarget?.left ?? 'calc(100vw - 356px)',
            top: slotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleDruglistAnimationComplete}
        >
          <img src="/druglist.png" alt="druglist" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* sad dialog */}
      <AnimatePresence>
        {dialogSeq === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={SAD_DIALOG_LINE}
              currentChar={DIALOG_CHAR}
              nextLine={handleSadDialogEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* normal dialog */}
      <AnimatePresence>
        {dialogSeq === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={NORMAL_DIALOG_LINE}
              currentChar={DIALOG_CHAR}
              nextLine={handleNormalDialogEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* druglist dialog (3 lines) */}
      <AnimatePresence>
        {dialogSeq === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-120 pointer-events-none"
          >
            <DialogueBox
              currentLine={DRUGLIST_DIALOG_LINES[druglistLineIndex]}
              currentChar={DIALOG_CHAR}
              nextLine={() => {
                if (druglistLineIndex < DRUGLIST_DIALOG_LINES.length - 1) {
                  setDruglistLineIndex(prev => prev + 1);
                } else {
                  setDialogSeq(0);
                  setDruglistLineIndex(0);
                }
              }}
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
                「她最珍愛的古箏...弦怎麼斷了？斷口邊緣還有乾涸的血跡，像是被指甲生生扯斷的...」
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
          forceClose={(guzhengOpen && druglistPhase === 0) || dialogSeq !== 0}
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

export default function GuzhengPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <GuzhengContent />
    </Suspense>
  );
}
