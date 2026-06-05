// 瓷瓶
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

// keyPhase: 0=未觸發 1=大圖提示(等待點擊) 2=飛入動畫 3=已收入
type KeyPhase = 0 | 1 | 2 | 3;

function BlushDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSFX } = useAudio();
  const paramId = searchParams.get('id');
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [showBottomText, setShowBottomText] = useState(true);

  // 瓷器狀態
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [keyPhase, setKeyPhase] = useState<KeyPhase>(0);
  const [showClueHint, setShowClueHint] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [inventoryForceOpen, setInventoryForceOpen] = useState(false);
  const [slotTarget, setSlotTarget] = useState<{ left: string; top: string } | null>(null);

  // 取得鑰匙後的對話內容
  const DIALOG_LINE: Line = {
    text: '原來如此...最危險的地方就是最安全的地方。她把鑰匙藏在貴妃賞賜的瓶底，是在防著誰？',
    headExpression: 'normal',
  };
  const DIALOG_CHAR = {
    id: 'A',
    name: '沈答應',
    color: '#5e1f22',
    headPortraits: { normal: '/A_normal.png' },
  };
  // porcelain2 是否已被點起（false=底部初始位置，true=中央可旋轉）
  const [porcelainLifted, setPorcelainLifted] = useState(false);
  // 初始下移量（px），等圖片載入後計算
  const [initY, setInitY] = useState(300);
  const porcelainRef = useRef<HTMLImageElement>(null);
  const dragStartAngleRef = useRef(0);
  const dragStartRotationRef = useRef(0);
  const hasBeenLiftedRef = useRef(false);

  // 靜態配置自定義配置：直接在此控制背景圖
  const DETAIL_LAYOUT = {
    background: {
      scale: 1.0,
      imgX: 0,
      imgY: 0
    }
  };

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const isReload = navEntry ? navEntry.type === 'reload' : false;
    if (false && isReload) {
      localStorage.removeItem('game-inventory');
      window.dispatchEvent(new Event('inventory-update'));
      sessionStorage.clear();
      return;
    }
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots = stored ? JSON.parse(stored) : [];
    
      if (slots[0] === '/key.png') {
        setKeyPhase(3);
        setShowBottomText(false);
        setShowClueHint(true);
      }
    } catch {}
  }, []);

  // 用快捷鍵 Ctrl + E 同步編輯模式狀態
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        setIsEditMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 圖片載入後計算初始下移量（讓底部距畫面底部約 20px）
  // 用 naturalHeight/naturalWidth 算比例，避免 offsetHeight 在某些時機為 0 的問題
  const handlePorcelainLoad = useCallback(() => {
    if (porcelainRef.current) {
      const el = porcelainRef.current;
      const renderedWidth = el.offsetWidth || 384; // w-96 fallback
      const aspectRatio = el.naturalHeight / (el.naturalWidth || 1);
      const imgH = renderedWidth * aspectRatio;
      const vh = window.innerHeight;
      const targetY = vh / 2 - 20 - imgH / 2;
      console.log('initY=', targetY);
      setInitY(targetY);
    }
  }, []);

  // resize 時重新計算初始位置
  useEffect(() => {
    window.addEventListener('resize', handlePorcelainLoad);
    return () => window.removeEventListener('resize', handlePorcelainLoad);
  }, [handlePorcelainLoad]);

  // 計算滑鼠相對於瓷器中心的角度
  const getAngleFromCenter = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!porcelainRef.current) return 0;
    const rect = porcelainRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  }, []);

  const handlePorcelainMouseDown = useCallback((e: React.MouseEvent) => {
    // phase 3：點擊顯示「已取得線索」
    if (keyPhase === 3) {
      setShowClueHint(true);
      return;
    }
    // 尚未被點起：點一下移到中央
    if (!porcelainLifted) {
      hasBeenLiftedRef.current = true;
      setPorcelainLifted(true);
      return;
    }
    // 已在中央且尚未觸發鑰匙：開始拖拽旋轉
    if (keyPhase !== 0) return;
    e.preventDefault();
    dragStartAngleRef.current = getAngleFromCenter(e);
    dragStartRotationRef.current = rotation;
    setIsDragging(true);
  }, [getAngleFromCenter, rotation, keyPhase, porcelainLifted]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const currentAngle = getAngleFromCenter(e);
      const delta = currentAngle - dragStartAngleRef.current;
      setRotation(dragStartRotationRef.current + delta);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const currentAngle = getAngleFromCenter(e);
      const delta = currentAngle - dragStartAngleRef.current;
      const finalRotation = ((dragStartRotationRef.current + delta) % 360 + 360) % 360;
      setRotation(finalRotation);

      if (keyPhase === 0 && finalRotation >= 135 && finalRotation <= 225) {
        playSFX('button_click');
        setKeyPhase(1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getAngleFromCenter, keyPhase, playSFX]);

  // 玩家點擊空白處：先開 bar → 等 bar 展開 → 測量 slot 0 位置 → 開始飛入動畫
  const handleKeyPopupClick = useCallback(() => {
    setInventoryForceOpen(true);
    setTimeout(() => {
      const el = document.querySelector('[data-inventory-slot="0"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlotTarget({
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
        });
      }
      setKeyPhase(2);
    }, 400); // 等 bar 滑入動畫完成
  }, []);

  // 飛入動畫完成：寫入 localStorage、通知 InventoryBar、瓷器回到底部
  const handleKeyAnimationComplete = useCallback(() => {
    try {
      const stored = localStorage.getItem('game-inventory');
      const slots: (string | null)[] = stored ? JSON.parse(stored) : [null, null, null, null, null];
      slots[0] = '/key.png';
      localStorage.setItem('game-inventory', JSON.stringify(slots));
      window.dispatchEvent(new Event('inventory-update'));
    } catch {}
    
    setKeyPhase(3);
    setPorcelainLifted(false);
    setRotation(0);
    setShowBottomText(false);
    setTimeout(() => setShowDialog(true), 600);
  }, []);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hotspot = INVESTIGATION_HOTSPOTS.find(h => h.id === paramId) ||
                  INVESTIGATION_HOTSPOTS.find(h => h.id === '1') ||
                  INVESTIGATION_HOTSPOTS.find(h => h.name.includes('多寶閣的瓷瓶'));

  const updateConstraints = useCallback(() => {
    if (viewportRef.current && contentRef.current) {
      const viewportWidth = viewportRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;
      if (contentWidth > viewportWidth) {
        const limit = (contentWidth - viewportWidth) / 2;
        setDragConstraints({ left: -limit, right: limit });
      } else {
        setDragConstraints({ left: 0, right: 0 });
      }
    }
  }, []);

  useEffect(() => {
    updateConstraints();
    const observer = new ResizeObserver(updateConstraints);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [updateConstraints]);

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
    <div
      ref={viewportRef}
      className="relative w-full h-screen overflow-hidden bg-stone-950 text-stone-200 select-none font-serif flex items-center justify-center"
    >
      {/* 頂部資訊條 (拆分組件) */}
      <InvestigationHeader
        title={hotspot.name}
        subtitle="細節查看"
        category="Detail View"
        onBack={() => router.back()}
      />

      {/* 背景容器：置中填滿且不允許拖拽 */}
      <div
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
      >
        <img
          src={hotspot.detailBackgroundUrl || "/porcelain.png"}
          alt={hotspot.name}
          className="min-w-full min-h-full w-auto h-auto max-w-none pointer-events-none select-none transition-transform duration-300"
          style={{
            transform: `scale(${DETAIL_LAYOUT.background.scale}) translate(${DETAIL_LAYOUT.background.imgX}%, ${DETAIL_LAYOUT.background.imgY}%)`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* porcelain2.png：初始在底部，點擊後移到中央可旋轉 */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <motion.img
          ref={porcelainRef}
          src="/porcelain2.png"
          alt="porcelain2"
          draggable={false}
          onLoad={handlePorcelainLoad}
          onMouseDown={handlePorcelainMouseDown}
          className="w-96 h-auto select-none pointer-events-auto"
          animate={{
            y: porcelainLifted ? 0 : initY,
            rotate: rotation,
          }}
          transition={
            porcelainLifted || hasBeenLiftedRef.current
              ? { y: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, rotate: { duration: 0 } }
              : { y: { duration: 0 }, rotate: { duration: 0 } }
          }
          style={{
            cursor: keyPhase === 3
              ? 'pointer'
              : !porcelainLifted
              ? 'pointer'
              : (isDragging ? 'grabbing' : 'grab'),
          }}
        />
      </div>

      {/* Phase 1：取得鑰匙大圖提示，點擊空白處繼續 */}
      <AnimatePresence>
        {keyPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleKeyPopupClick}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src="/key.png"
              alt="key"
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
              取得「精緻的小鑰匙」
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

      {/* Phase 2：鑰匙從中央縮小飛入道具欄第一格 */}
      {keyPhase === 2 && (
        <motion.div
          className="fixed z-900 pointer-events-none"
          initial={{ left: '50vw', top: '50vh', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          animate={{
            left: slotTarget?.left ?? 'calc(100vw - 536px)',
            top: slotTarget?.top ?? 'calc(100vh - 60px)',
            x: '-50%', y: '-50%', scale: 0.2, opacity: 0.9
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={handleKeyAnimationComplete}
        >
          <img src="/key.png" alt="key" className="w-56 h-56 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.9)]" />
        </motion.div>
      )}

      {/* 取得鑰匙後的對話框 */}
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
              nextLine={() => { setShowDialog(false); setInventoryForceOpen(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 已取得線索提示（點擊一下後漸隱） */}
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

      {/* 底部感性文字 - 慢速漸顯之極簡設計 */}
      <AnimatePresence>
        {showBottomText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onClick={() => setShowBottomText(false)}
            className="absolute bottom-16 left-8 md:left-16 z-50 cursor-pointer max-w-xl"
          >
            <div className="relative group">
              <p className="text-white/90 text-base md:text-lg leading-loose tracking-[0.15em] font-medium drop-shadow-[2px_2px_2px_rgba(0,0,0,0.9)]">
              「這也是貴妃送來的稀世珍品...她生前極度厭惡這瓶子，怎麼會擺在這麼顯眼的地方？」
              </p>

              {/* 極簡引導線 */}
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

      {/* 道具欄 (右下角折疊) - 編輯模式時提高 z-index 以便操作 */}
      <div className={isEditMode ? 'z-2000' : 'z-40'}>
        <InventoryBar isEditMode={isEditMode} forceOpen={inventoryForceOpen} forceClose={showDialog} />
      </div>

      {/* 對話紀錄 (側邊欄) */}
      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={[]}
        showDefaultMemory
      />

      {/* 遊戲選單 (彈窗) */}
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
