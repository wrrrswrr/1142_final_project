'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAudio } from '../lib/AudioContext';

interface InvestigationHeaderProps {
    title: string;
    subtitle: string;
    category?: string;
    onBack?: () => void;
}

export default function InvestigationHeader({
    title,
    subtitle,
    category = "Investigation",
    onBack,
}: InvestigationHeaderProps) {

    const { playSFX } = useAudio();

  const handleBack = () => {
    if (onBack) {
      playSFX('button_click');
      onBack();
    }
  };
  
    return (
        <div
            className="absolute top-0 inset-x-0 z-40 bg-linear-to-b from-stone-950/90 via-stone-950/20 to-transparent flex items-center px-8 md:px-12 pointer-events-none"
            style={{ height: 'clamp(80px, 10vh, 100px)' }}
        >
            <div className="flex items-center gap-6 pointer-events-auto">
                {onBack && (
                    <button
                        className="p-2 md:p-3 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-full transition-all duration-300 border border-[#D4AF37]/30 bg-black/60 shadow-lg backdrop-blur-sm pointer-events-auto mr-2"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                )}
                <div className="relative pl-6 border-l-2 border-[#D4AF37]/60">
                    <div className="flex flex-col">
                        <span className="text-stone-400 tracking-[0.4em] uppercase font-bold opacity-80 mb-1" style={{ fontSize: 'clamp(10px, 1.1vw, 11px)' }}>
                            {category}
                        </span>
                        <div className="flex items-baseline gap-4">
                            <h2 className="font-bold tracking-[0.6em] text-stone-100 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]" style={{ fontSize: 'clamp(20px, 2.8vw, 28px)' }}>
                                {title}
                            </h2>
                            <span className="font-light text-[#D4AF37] tracking-[0.2em] border-l border-[#D4AF37]/30 pl-4 py-1" style={{ fontSize: 'clamp(12px, 1.4vw, 14px)' }}>
                                {subtitle}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
