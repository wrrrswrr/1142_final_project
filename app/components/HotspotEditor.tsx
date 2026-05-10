'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Plus, Play, Trash2, Copy, Save } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Hotspot {
  id: string;
  name: string;
  points: Point[];
}

export default function HotspotEditor() {
  const [isActive, setIsActive] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 用快捷鍵 Ctrl + E 切換編輯器
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        setIsActive(!isActive);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isActive || !isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) return;
    const newHotspot: Hotspot = {
      id: Date.now().toString(),
      name: `區域 ${hotspots.length + 1}`,
      points: currentPoints,
    };
    setHotspots([...hotspots, newHotspot]);
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const deleteHotspot = (id: string) => {
    setHotspots(hotspots.filter(h => h.id !== id));
  };

  const copyToClipboard = () => {
    const data = JSON.stringify(hotspots, null, 2);
    navigator.clipboard.writeText(data);
    alert('座標數據已複製到剪貼簿！');
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-1000 pointer-events-none">
      {/* 畫布遮罩層 (僅 isActive 時可點擊) - 使用與背景圖同步的 16:9 比例與底部對齊 */}
      <div 
        ref={containerRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full aspect-video pointer-events-auto cursor-crosshair"
        onClick={handleContainerClick}
        onContextMenu={(e) => {
          e.preventDefault();
          finishPolygon();
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* 已完成的區域 */}
          {hotspots.map((h) => (
            <polygon
              key={h.id}
              points={h.points.map(p => `${p.x},${p.y}`).join(' ')}
              className="fill-[#D4AF37]/20 stroke-[#D4AF37] stroke-[0.5]"
            />
          ))}
          {/* 正在繪製的區域 */}
          {currentPoints.length > 0 && (
            <>
              <polyline
                points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
                className="fill-none stroke-blue-400 stroke-[0.5] stroke-dashed"
              />
              {currentPoints.map((p, i) => (
                <circle 
                  key={i} 
                  cx={p.x} 
                  cy={p.y} 
                  r="0.8" 
                  className="fill-blue-400" 
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* 控制面板 */}
      <motion.div 
        drag
        dragMomentum={false}
        className="absolute right-4 top-24 bottom-24 w-80 bg-stone-900/90 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
      >
        {/* 標題列 (拖拽柄) */}
        <div className="bg-[#D4AF37]/10 p-4 border-b border-[#D4AF37]/30 cursor-move flex items-center justify-between">
          <h3 className="text-[#D4AF37] font-bold flex items-center gap-2 select-none">
            <MousePointer2 size={18} /> 熱點編輯器
          </h3>
          <div className="text-[10px] text-[#D4AF37]/50 uppercase tracking-widest">Draggable</div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsDrawing(true)}
              disabled={isDrawing}
              className={`flex-1 p-2 rounded flex items-center justify-center gap-2 text-sm cursor-pointer ${isDrawing ? 'bg-stone-700 text-stone-500 cursor-not-allowed' : 'bg-[#D4AF37] text-stone-900 font-bold hover:bg-white transition-colors'}`}
            >
              <Plus size={16} /> 新建區域
            </button>
            {isDrawing && (
              <button
                onClick={finishPolygon}
                className="bg-green-600 text-white p-2 rounded flex items-center gap-2 text-sm cursor-pointer hover:bg-green-500 transition-colors"
              >
                <Save size={16} /> 完成
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-xs text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-800 pb-1">區域清單</div>
            {hotspots.length === 0 && !isDrawing && (
              <p className="text-stone-600 text-sm italic">點擊上方按鈕開始繪製區域 (右鍵完成)</p>
            )}
            {hotspots.map((h) => (
              <div key={h.id} className="group bg-stone-800/50 p-3 border border-stone-700 flex items-center justify-between hover:border-[#D4AF37]/50 transition-colors">
                <span className="text-stone-300 text-sm">{h.name}</span>
                <button 
                  onClick={() => deleteHotspot(h.id)}
                  className="text-stone-600 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-stone-800">
            <button
              onClick={copyToClipboard}
              className="w-full p-3 bg-stone-800 text-[#D4AF37] border border-[#D4AF37]/30 rounded hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Copy size={16} /> 複製 JSON 數據
            </button>
            <div className="text-[10px] text-stone-600 mt-4 space-y-1">
              <p>操作說明：</p>
              <p>1. 點擊「新建區域」</p>
              <p>2. 在畫面上點擊端點 (最少3點)</p>
              <p>3. 右鍵或點擊「完成」閉合區域</p>
              <p>4. 快捷鍵 Ctrl + E 隱藏編輯器</p>
              <p className="text-[#D4AF37]/40 pt-2 italic">* 可拖拽標題區域移動此面板</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
