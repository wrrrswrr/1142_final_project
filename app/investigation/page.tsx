'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import SidebarActions from '.././components/SidebarActions';
import GameMenu from '.././components/GameMenu';
import HistoryLog from '.././components/HistoryLog';
import { BACKGROUNDS } from '.././script';
import { ChevronLeft } from 'lucide-react';
import HotspotEditor from '.././components/HotspotEditor';
import { INVESTIGATION_HOTSPOTS, HotspotData } from '.././data/investigationHotspots';
import InvestigationHeader from '.././components/InvestigationHeader';
import InventoryBar from '.././components/InventoryBar';
import { useAudio } from '.././lib/AudioContext';


export default function InvestigationPage() {
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { playBGM, playSFX } = useAudio();

  useEffect(() => {
    // 播放調查背景音樂（如果已經在播則不會重啟）
    playBGM('investigation');
  }, [playBGM]);


  // 檢查是否為從劇情銜接過來
  useEffect(() => {
    const flag = sessionStorage.getItem('show-investigation-intro');
    if (flag === 'true') {
      setShowTitle(true);
      sessionStorage.removeItem('show-investigation-intro');
      const timer = setTimeout(() => setShowTitle(false), 3000);
      return () => clearTimeout(timer);
    }
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

  // 動態計算拖拽限制：確保背景邊線不會滑進去
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

  const handleHotspotClick = (hotspot: HotspotData) => {
    playSFX('button_click');
    console.log(`點擊了區域: ${hotspot.name}`);
    if (hotspot.targetUrl) {
      router.push(hotspot.targetUrl);
    }
  };

  const bgUrl = BACKGROUNDS['night_inside']?.url || "/night_inside.png";

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-screen overflow-hidden bg-stone-950 text-stone-200 select-none font-serif cursor-default flex items-end justify-center"
    >
      {/* 頂部資訊條 (拆分組件) */}
      <InvestigationHeader title="長信宮內" subtitle="深夜" />

      {/* 可拖拽的調查區域 */}
      <motion.div
        ref={contentRef}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragMomentum={false}
        className="relative h-screen min-w-full shrink-0 flex items-end justify-center"
        style={{
          cursor: isEditMode ? 'crosshair' : 'grab',
          // 確保比例正確且至少貼合三邊
          width: 'max(100vw, 177.77vh)',
        }}
        whileTap={{ cursor: isEditMode ? 'crosshair' : 'grabbing' }}
      >
        {/* 背景與熱點容器：必須填滿父容器以保證同步 */}
        <div className="relative w-full h-full">
          {/* 背景圖：object-cover + object-bottom 確保左右下三邊貼齊，比例不變且裁剪頂部 */}
          <img
            src={bgUrl}
            alt="Palace Background"
            className="w-full h-full object-cover object-bottom pointer-events-none select-none"
            onLoad={updateConstraints}
          />
          {/* 熱點感應層 (多邊形區域) */}
          <svg
            viewBox="0 0 100 56.25"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 z-10 w-full h-full pointer-events-none"
          >
            <defs>
              <filter id="hotspotBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
              </filter>
            </defs>

            {INVESTIGATION_HOTSPOTS.map((hotspot) => (
              <polygon
                key={hotspot.id}
                points={hotspot.points.map(p => `${p.x},${p.y * 0.5625}`).join(' ')}
                className={`pointer-events-auto transition-all duration-300 ${isEditMode
                  ? 'fill-[#D4AF37]/40 stroke-[#D4AF37] stroke-[0.3]'
                  : 'fill-transparent hover:fill-white/10'
                  }`}
                style={{
                  cursor: isEditMode ? 'crosshair' : 'pointer',
                  filter: !isEditMode ? 'url(#hotspotBlur)' : 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotspotClick(hotspot);
                }}
              />
            ))}
          </svg>

          {/* 熱點編輯器 (僅開發環境可用，使用 Ctrl + E 呼叫) */}
          <HotspotEditor />
        </div>
      </motion.div>

      {/* 調查開始標題動畫 - 增加 pointer-events-auto 以允許點擊即關閉，防止卡死 */}
      <AnimatePresence mode="wait">
        {showTitle && (
          <motion.div
            key="investigation-intro-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-200 flex items-center justify-center bg-black/30 shadow-2xl cursor-pointer pointer-events-auto"
            onClick={() => setShowTitle(false)}
          >
            <div className="text-center select-none pointer-events-none">
              <motion.h1 
                initial={{ scale: 0.9, letterSpacing: '2em' }}
                animate={{ scale: 1, letterSpacing: '1.5em' }}
                className="text-3xl md:text-5xl font-bold text-[#D4AF37] pl-[1.5em] drop-shadow-[0_2px_20px_rgba(0,0,0,1)]"
              >
                調查開始
              </motion.h1>
              <p className="text-stone-500 mt-8 tracking-[0.3em] font-sans text-xs opacity-60">點擊任意處繼續</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右上角功能按鈕 (固定位置) */}
      <div className="absolute top-6 right-6 z-50">
        <SidebarActions
          onOpenHistory={() => setShowHistory(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </div>

      {/* 道具欄 (右下角折疊) - 編輯模式時提高 z-index 以便操作 */}
      <div className={isEditMode ? 'z-2000' : 'z-40'}>
        <InventoryBar isEditMode={isEditMode} />
      </div>

      {/* 對話紀錄 (側邊欄) */}
      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={[]}
        showDefaultMemory
      />

      {/* 遊戲選單 (包含儲存、讀取、設定) */}
      <GameMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onReset={() => {
          localStorage.removeItem('vn-save-ancient');
          router.push('/');
        }}
      />
    </div >
  );
}
