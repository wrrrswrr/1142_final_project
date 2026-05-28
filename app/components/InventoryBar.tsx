'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive } from 'lucide-react';
import { useAudio } from '../lib/AudioContext';

export default function InventoryBar({
  isEditMode = false,
  forceOpen = false,
  draggableSlots = [],
  onItemDrop,
}: {
  isEditMode?: boolean;
  forceOpen?: boolean;
  draggableSlots?: number[];
  onItemDrop?: (slotIndex: number, x: number, y: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelVisible = forceOpen || isOpen;
  const { playSFX } = useAudio();
  const [config, setConfig] = useState({
    width: 500,
    bottom: 32,
    right: 32,
  });
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [previewItem, setPreviewItem] = useState<{ src: string; name: string } | null>(null);
  const didDragRef = useRef(false);

  const ITEM_NAMES: Record<string, string> = { '/key.png': '鑰匙', '/letter.png': '家書' };

  const loadSlots = () => {
    try {
      const stored = localStorage.getItem('game-inventory');
      if (stored) {
        const arr = JSON.parse(stored) as (string | null)[];
        const result: (string | null)[] = [null, null, null, null, null];
        arr.forEach((item, i) => { if (i < 5) result[i] = item; });
        setSlots(result);
      } else {
        setSlots([null, null, null, null, null]);
      }
    } catch {}
  };

  useEffect(() => {
    loadSlots();
    window.addEventListener('storage', loadSlots);
    window.addEventListener('inventory-update', loadSlots);
    // 頁面重整或關閉時清除道具欄紀錄
    const clearOnUnload = () => localStorage.removeItem('game-inventory');
    window.addEventListener('beforeunload', clearOnUnload);
    return () => {
      window.removeEventListener('storage', loadSlots);
      window.removeEventListener('inventory-update', loadSlots);
      window.removeEventListener('beforeunload', clearOnUnload);
    };
  }, []);

  const handleToggle = () => {
    playSFX('button_click');
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="absolute z-40 flex flex-row-reverse items-center gap-4 origin-bottom-right"
      style={{
        bottom: `${config.bottom}px`,
        right: `${config.right}px`,
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 z-10 group relative ${
          isOpen
            ? 'bg-[#D4AF37] text-stone-950 shadow-lg'
            : 'bg-stone-900/80 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-sm'
        }`}
      >
        <Archive className="w-6 h-6" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-900/90 border border-[#D4AF37]/50 rounded text-[#D4AF37] text-[10px] tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none font-serif shadow-xl">
          線索
        </div>
      </motion.button>

      {/* 物件預覽 overlay */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 z-500 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <motion.img
              src={previewItem.src}
              alt={previewItem.name}
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
              {previewItem.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 text-white text-xs tracking-[0.6em] uppercase"
            >
              點擊任意處關閉
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panelVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative flex items-center gap-4"
            style={{ overflow: 'visible' }}
          >
            {isEditMode && (
              <div className="flex flex-col gap-2 bg-black/90 p-3 rounded-lg border border-[#D4AF37]/50 pointer-events-auto text-[10px] font-mono text-[#D4AF37]">
                <div className="flex flex-col gap-1 text-white/50 mb-1">道具欄配置</div>
                <div className="flex flex-col gap-1">
                  <label>寬度 (px)</label>
                  <input
                    type="number"
                    value={config.width}
                    onChange={(e) => setConfig(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="bg-stone-800 border border-stone-600 px-1 py-0.5 rounded w-20 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>底距 (px)</label>
                  <input
                    type="number"
                    value={config.bottom}
                    onChange={(e) => setConfig(prev => ({ ...prev, bottom: Number(e.target.value) }))}
                    className="bg-stone-800 border border-stone-600 px-1 py-0.5 rounded w-20 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>右距 (px)</label>
                  <input
                    type="number"
                    value={config.right}
                    onChange={(e) => setConfig(prev => ({ ...prev, right: Number(e.target.value) }))}
                    className="bg-stone-800 border border-stone-600 px-1 py-0.5 rounded w-20 text-white"
                  />
                </div>
              </div>
            )}

            <div
              className="relative pointer-events-auto"
              style={{ width: `${config.width}px`, overflow: 'visible' }}
            >
              <img
                src="/inventory.png"
                alt=""
                className="w-full h-auto block"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/inv/600/150?grayscale&blur=2';
                }}
              />
              {/* 內部道具範圍 */}
              <div
                className="absolute inset-0 flex items-center justify-start px-[7%] gap-[4.66%]"
                style={{ overflow: 'visible' }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    data-inventory-slot={i}
                    className="aspect-square h-[33%] rounded-sm flex items-center justify-center relative group"
                    style={{ marginBottom: '10%', overflow: 'visible' }}
                  >
                    {slots[i] && draggableSlots.includes(i) ? (
                      /* 可拖拽的道具 */
                      <motion.img
                        src={slots[i]!}
                        alt=""
                        drag
                        dragSnapToOrigin
                        dragMomentum={false}
                        dragElastic={0}
                        onDragStart={() => { didDragRef.current = true; }}
                        onDragEnd={(_event, info) => {
                          onItemDrop?.(i, info.point.x, info.point.y);
                          setTimeout(() => { didDragRef.current = false; }, 100);
                        }}
                        onTap={() => {
                          if (didDragRef.current) return;
                          const src = slots[i]!;
                          setPreviewItem({ src, name: ITEM_NAMES[src] ?? src });
                        }}
                        className="w-full h-full object-contain"
                        style={{ translateY: '22%', cursor: 'grab', position: 'relative', zIndex: 50 }}
                        whileDrag={{ scale: 1.4, zIndex: 9999, cursor: 'grabbing' }}
                      />
                    ) : slots[i] ? (
                      <img
                        src={slots[i]!}
                        alt=""
                        className="w-full h-full object-contain cursor-pointer"
                        style={{ transform: 'translateY(22%)' }}
                        onClick={() => {
                          const src = slots[i]!;
                          setPreviewItem({ src, name: ITEM_NAMES[src] ?? src });
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
