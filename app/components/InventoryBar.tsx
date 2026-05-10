'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive } from 'lucide-react';
import { useAudio } from '../lib/AudioContext';

export default function InventoryBar({ isEditMode = false }: { isEditMode?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { playSFX } = useAudio();
  const [config, setConfig] = useState({
    width: 500,
    bottom: 32,
    right: 32,
  });
  
  const handleToggle = () => {
    playSFX('button_click');
    setIsOpen(!isOpen);
  };

  const handleSlotClick = () => {
    playSFX('button_click');
  };

  return (
    <div 
      className="absolute z-40 flex flex-row-reverse items-center gap-4 origin-bottom-right"
      style={{ 
        bottom: `${config.bottom}px`, 
        right: `${config.right}px` 
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 z-10 group relative ${
          isOpen ? 'bg-[#D4AF37] text-stone-950 shadow-lg' : 'bg-stone-900/80 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-sm'
        }`}
      >
        <Archive className="w-6 h-6" />
         {/* 懸浮標籤 */}
         <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-900/90 border border-[#D4AF37]/50 rounded text-[#D4AF37] text-[10px] tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none font-serif shadow-xl">
          線索
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative flex items-center gap-4"
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
              style={{ width: `${config.width}px` }}
            >
              <img 
                src="/inventory.png" 
                alt="" 
                className="w-full h-auto block"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/inv/600/150?grayscale&blur=2"; 
                }}
              />
              {/* 內部道具範圍 (不顯示)*/}
              <div className="absolute inset-0 flex items-center justify-start px-[7%] gap-[4.66%]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square h-[33%] rounded-sm flex items-center justify-center relative group">
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
