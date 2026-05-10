"use client";

import React from 'react';
import { History, Play } from 'lucide-react';

interface SidebarActionsProps {
  onOpenHistory: () => void;
  onOpenMenu: () => void;
}

import { useAudio } from '../lib/AudioContext';

export default function SidebarActions({ onOpenHistory, onOpenMenu }: SidebarActionsProps) {
  const { playSFX } = useAudio();

  const handleAction = (cb: () => void) => {
    playSFX('button_click');
    cb();
  };
  return (
    <div className="absolute top-6 right-6 flex flex-col gap-4 z-100">
      <MenuButtonCircle icon={<History size={20} />} onClick={() => handleAction(onOpenHistory)} label="往事" />
      <MenuButtonCircle icon={<Play size={20} />} onClick={() => handleAction(onOpenMenu)} label="選單" />
    </div>
  );
}

function MenuButtonCircle({ icon, onClick, label }: { icon: any, onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group cursor-pointer shrink-0">
      <div 
        className="flex items-center justify-center bg-black/60 backdrop-blur-md border border-[#D4AF37]/20 rounded-full text-[#D4AF37] group-hover:bg-[#8B0000] group-hover:text-white transition-all shadow-xl active:scale-95"
        style={{ 
          width: 'clamp(44px, 5.5vw, 56px)', 
          height: 'clamp(44px, 5.5vw, 56px)' 
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 'clamp(18px, 2vw, 22px)' 
        } as any)}
      </div>
      <span className="tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', color: '#D4AF37' }}>{label}</span>
    </button>
  );
}