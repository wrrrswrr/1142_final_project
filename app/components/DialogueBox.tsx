"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Line } from '../types';

const DIALOG_BOX_IMAGE = "/dialog.png";
const DEBUG_ALIGNMENT = false;

const TYPEWRITER_SPEED = 50; // 每個字的間隔 (ms)

const LAYOUT = {
    portrait: {
        left: "9.35%", top: "18.7%", width: "15.75%", height: "71%", radius: "0px",
        bgColor: "rgba(240, 230, 210, 0.8)", imgScale: 2, imgX: "0%", imgY: "0%",
    },
    name: {
        left: "30.2%", top: "11%", width: "16.9%", height: "15%", fontSize: "1.5rem", spacing: "0.4em",
        color: "#5e1f22"
    },
    text: {
        left: "29.4%", top: "38%", width: "58%", height: "35%", fontSize: "1.3rem", lineHeight: "1.6",
        color: "#4e3d35"
    },
    nextIcon: {
        right: "5%", bottom: "12%", size: "1.2rem",
        color: "#D4AF37"
    }
};

export default function DialogueBox({
    currentLine,
    currentChar,
    nextLine,
    isFirstDialogueAfterMonologue
}: {
    currentLine: Line;
    currentChar: any;
    nextLine: () => void;
    isFirstDialogueAfterMonologue?: boolean;
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 重置打字機效果
    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);

        let currentIndex = 0;
        const fullText = currentLine.text;

        // 清除之前的計時器與延遲
        if (timerRef.current) clearInterval(timerRef.current);
        if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);

        // 如果是轉場後的第一句對話，延遲啟動打字機，等待對話框淡入完成
        const startDelay = isFirstDialogueAfterMonologue ? 1100 : 0;

        const startTypewriter = () => {
            timerRef.current = setInterval(() => {
                currentIndex++;
                setDisplayedText(fullText.slice(0, currentIndex));
                if (currentIndex >= fullText.length) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsComplete(true);
                }
            }, TYPEWRITER_SPEED);
        };

        delayTimeoutRef.current = setTimeout(startTypewriter, startDelay);

        return () => {
            if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentLine.text, isFirstDialogueAfterMonologue]);

    const handleBoxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isComplete) {
            // 如果還在延遲中或打字中，直接停止計時器並顯示全文
            if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            setDisplayedText(currentLine.text);
            setIsComplete(true);
        } else {
            // 如果已經跑完，進入下一句
            nextLine();
        }
    };

    return (
        <div className={`absolute bottom-6 inset-x-0 ${currentLine.isMonologue ? 'z-50 h-screen bottom-0 px-0' : 'z-20'} px-4 md:px-12 pointer-events-none transition-all duration-700`}>
            <div className={`relative w-full max-w-7xl mx-auto pointer-events-auto ${currentLine.isMonologue ? 'h-full max-w-none' : 'aspect-1920/460 md:max-h-[320px]'}`}>
                <AnimatePresence>
                    {currentLine.isMonologue ? (
                        /* 獨白模式 UI */
                        <motion.div
                            key={`monologue-${currentLine.text.slice(0, 10)}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.0 }}
                            onClick={handleBoxClick}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer px-10 bg-black/90 z-50"
                        >
                            <div
                                className="font-serif tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                style={{
                                    fontSize: currentLine.monologueFontSize || '3.5rem',
                                    lineHeight: '1.8'
                                }}
                            >
                                {currentLine.text.split("").map((char, index) => (
                                    <motion.span
                                        key={`${currentLine.text}-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: index < displayedText.length ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                            <div className={`absolute bottom-[10%] animate-bounce opacity-40 ${isComplete ? 'block' : 'hidden'}`}>
                                <div className="w-6 h-6 border-r-4 border-b-4 border-white rotate-45" />
                            </div>
                        </motion.div>
                    ) : (
                        /* 一般對話模式 UI */
                        <motion.div
                            key="dialogue"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{
                                duration: 0.8,
                                delay: isFirstDialogueAfterMonologue ? 2 : 0
                            }}
                            onClick={handleBoxClick}
                            className="relative w-full h-full cursor-pointer group"
                        >
                            <div
                                className="absolute inset-0 z-0 bg-contain bg-no-repeat bg-center"
                                style={{ backgroundImage: `url(${DIALOG_BOX_IMAGE})` }}
                            />

                            {/* 頭像插槽 */}
                            <div
                                className={`absolute z-20 overflow-hidden flex items-start justify-center ${DEBUG_ALIGNMENT ? 'border-2 border-red-500 bg-red-500/10' : ''}`}
                                style={{
                                    left: LAYOUT.portrait.left,
                                    top: LAYOUT.portrait.top,
                                    width: LAYOUT.portrait.width,
                                    height: LAYOUT.portrait.height,
                                    borderRadius: LAYOUT.portrait.radius,
                                    backgroundColor: LAYOUT.portrait.bgColor
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {currentChar?.headPortraits && (
                                        <motion.img
                                            key={currentChar.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            src={currentChar.headPortraits[currentLine.headExpression || 'normal']}
                                            alt="Head Portrait"
                                            className="max-w-none origin-top"
                                            style={{
                                                width: '100%',
                                                transform: `translate(${LAYOUT.portrait.imgX}, ${LAYOUT.portrait.imgY}) scale(${LAYOUT.portrait.imgScale})`
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 姓名插槽 */}
                            <div
                                className={`absolute z-20 flex items-center justify-center ${DEBUG_ALIGNMENT ? 'border border-blue-500 bg-blue-500/10' : ''}`}
                                style={{
                                    left: LAYOUT.name.left,
                                    top: LAYOUT.name.top,
                                    width: LAYOUT.name.width,
                                    height: LAYOUT.name.height
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {currentChar && (
                                        <motion.span
                                            key={currentChar.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-bold drop-shadow-md whitespace-nowrap"
                                            style={{
                                                fontSize: LAYOUT.name.fontSize,
                                                letterSpacing: LAYOUT.name.spacing,
                                                color: currentChar.color || LAYOUT.name.color
                                            }}
                                        >
                                            {currentChar.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 文字插槽 */}
                            <div
                                className={`absolute z-20 font-serif tracking-widest flex items-start overflow-hidden ${DEBUG_ALIGNMENT ? 'border border-green-500 bg-green-500/10' : ''}`}
                                style={{
                                    left: LAYOUT.text.left,
                                    top: LAYOUT.text.top,
                                    width: LAYOUT.text.width,
                                    height: LAYOUT.text.height,
                                    fontSize: LAYOUT.text.fontSize,
                                    lineHeight: LAYOUT.text.lineHeight,
                                    color: LAYOUT.text.color
                                }}
                            >
                                <div className="drop-shadow-sm">
                                    {currentLine.text.split("").map((char, index) => (
                                        <motion.span
                                            key={`${currentLine.text}-${index}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: index < displayedText.length ? 1 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>

                            {/* 下一步圖示 */}
                            <div
                                className={`absolute z-20 animate-bounce opacity-40 group-hover:opacity-80 transition-opacity ${isComplete ? 'block' : 'hidden'}`}
                                style={{
                                    right: LAYOUT.nextIcon.right,
                                    bottom: LAYOUT.nextIcon.bottom,
                                    fontSize: LAYOUT.nextIcon.size
                                }}
                            >
                                <div
                                    className="w-5 h-5 border-r-4 border-b-4 rotate-45"
                                    style={{ borderColor: LAYOUT.nextIcon.color }}
                                ></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
