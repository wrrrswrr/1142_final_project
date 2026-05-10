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
import { useAudio } from '.././lib/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

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
  // 靜態配置自定義配置：直接在此控制背景圖
  const DETAIL_LAYOUT = {
    background: {
      scale: 1.0,  // 縮放比例
      imgX: 0,     // 水平偏移 (%)
      imgY: 0      // 垂直偏移 (%)
    }
  };


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
        <InventoryBar isEditMode={isEditMode} />
      </div>

      {/* 對話紀錄 (側邊欄) */}
      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={[]}
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


