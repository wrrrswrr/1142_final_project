/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SCRIPT, CHARACTERS, BACKGROUNDS } from '.././script';
import { VNState, Line } from '.././types';
import { useRouter } from 'next/navigation';
import { useAudio } from '.././lib/AudioContext';

// 導入拆分後的組件
import DialogueBox from '.././components/DialogueBox';
import HistoryLog from '.././components/HistoryLog';
import GameMenu from '.././components/GameMenu';
import SidebarActions from '.././components/SidebarActions';
import ChoiceButton from '.././components/ChoiceButton';
import router from 'next/router';

const LOG_IMAGE = "/log.png";

const STANDING_LAYOUT = {
  // 定義預設的三個位置 (相對於螢幕中心)
  positions: {
    left: { x: "-14vw", y: "0px", scale: 1.0 },
    center: { x: "0px", y: "0px", scale: 1.0 },
    right: { x: "14vw", y: "0px", scale: 1.0 },
  },
  // 全域立繪高度與底部距離
  baseBottom: "-170px",
  baseHeight: "120vh"
};

export default function VNPage() {
  const [state, setState] = useState<VNState>(() => {
    if (typeof window === 'undefined') return { currentSceneId: 'start', currentLineIndex: 0, history: [], variables: {} };
    const saved = localStorage.getItem('vn-save-ancient');
    return saved ? JSON.parse(saved) : { currentSceneId: 'start', currentLineIndex: 0, history: [], variables: {} };
  });

  const { playBGM, playSFX, stopSFX } = useAudio();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const [isFlashBlack, setIsFlashBlack] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);

  // 音樂控制邏輯
  useEffect(() => {
    const sceneId = state.currentSceneId;
    if (sceneId.startsWith('chapter')) {
      playBGM('chapter1_3_5');
    } else if (sceneId.startsWith('endingA')) {
      playBGM('ending_a');
    } else if (sceneId.startsWith('endingB')) {
      playBGM('ending_b');
    }
  }, [state.currentSceneId, playBGM]);

  // 特定對話音效觸發
  useEffect(() => {
    const line = SCRIPT.find(s => s.id === state.currentSceneId)?.lines[state.currentLineIndex];
    if (!line) return;

     // 停止指定的音效
     if (line.stopSFXKey) {
      stopSFX(line.stopSFXKey);
    }

    // 優先播放腳本中指定的音效
    if (line.sfxKey) {
      playSFX(line.sfxKey, line.sfxLoop);
      return;
    }

  }, [state.currentSceneId, state.currentLineIndex, playSFX, stopSFX]);

  useEffect(() => {
    localStorage.setItem('vn-save-ancient', JSON.stringify(state));
  }, [state]);

  const currentScene = SCRIPT.find((s) => s.id === state.currentSceneId) || SCRIPT[0];
  const sceneLine: Line | undefined = currentScene.lines[state.currentLineIndex];

  // 判斷是否為回憶場景 (僅限結局 B 第一部分)
  const isMemoryScene = state.currentSceneId === 'endingB';

  // 安全檢查：若目前行不存在（可能是狀態同步中的短暫不一致），返回空或載入中
  if (!sceneLine) {
    return <div className="h-screen w-full bg-black" />;
  }

  // 判斷是否正要進入第一幕對話（從獨白切換過來、開場）
  const isEntranceLine = (state.currentLineIndex === 0) || (!sceneLine.isMonologue &&
    (currentScene.lines[state.currentLineIndex - 1]?.isMonologue)) || isFlashBlack;

  const currentChar = sceneLine.characterId ? (CHARACTERS as any)[sceneLine.characterId] : null;

  // 取得當前背景 URL
  const currentBackgroundUrl = sceneLine.isMonologue && !sceneLine.backgroundId
    ? null
    : (sceneLine.backgroundId && BACKGROUNDS[sceneLine.backgroundId]?.url) ||
    (currentScene.defaultBackgroundId && BACKGROUNDS[currentScene.defaultBackgroundId]?.url) ||
    LOG_IMAGE;

    const nextLine = useCallback(() => {
      // 如果這一個 Scene 有選項，且已經是最後一句，且尚未顯示選項，則改為顯示選項
      const isAtLastLine = state.currentLineIndex + 1 >= currentScene.lines.length;
      if (isAtLastLine && currentScene.choices && currentScene.choices.length > 0 && !choicesVisible) {
        setChoicesVisible(true);
        return; 
      }
  
      const isEndingMonologue = sceneLine.isMonologue &&
        (state.currentLineIndex + 1 >= currentScene.lines.length || !currentScene.lines[state.currentLineIndex + 1].isMonologue);
  
      if (isEndingMonologue && !isSceneTransitioning) {
        setIsSceneTransitioning(true);
        setTimeout(() => {
          setIsSceneTransitioning(false);
          proceedNextLine();
        }, 10);
      } else {
        proceedNextLine();
      }
    }, [state, currentScene, sceneLine, isSceneTransitioning]);
  
    const proceedNextLine = () => {
    if (state.currentLineIndex + 1 < currentScene.lines.length) {
      setState((prev) => ({
        ...prev,
        currentLineIndex: prev.currentLineIndex + 1,
        history: [...prev.history, { sceneId: prev.currentSceneId, lineIndex: prev.currentLineIndex }],
      }));

    } else {
      // 檢查是否是結局最終行
      if (state.currentSceneId === 'endingA-1') {
        setIsFlashBlack(true);
        setTimeout(() => router.push('/ending?type=endingA'), 1000);
      } else if (state.currentSceneId === 'endingB-2') {
        setIsFlashBlack(true);
        setTimeout(() => router.push('/ending?type=endingB'), 1000);

      } else if (currentScene.nextSceneId === 'investigation') {
        setIsFlashBlack(true);
        sessionStorage.setItem('show-investigation-intro', 'true');
        setTimeout(() => router.push('/investigation'), 1000);

      } else if (currentScene.nextSceneId) {
        // 章節切換
        if (currentScene.hasTransitionSFX) {
          const sfxKey = currentScene.transitionSFXKey || 'transition_swish' as any;
          playSFX(sfxKey);
        }
        setIsFlashBlack(true);
        setChoicesVisible(false);
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentSceneId: currentScene.nextSceneId!,
            currentLineIndex: 0,
            history: [...prev.history, { sceneId: prev.currentSceneId, lineIndex: prev.currentLineIndex }],
          }));
          // 切換完畢後淡出黑幕
          setTimeout(() => {
            setIsFlashBlack(false);
          }, 800);
        }, 900);
      }
    }
  };

  // Debug 功能：跳轉結局
  const jumpToEnding = (endingId: string) => {
    if (isFlashBlack) return;
    setIsFlashBlack(true);
    setChoicesVisible(false);
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        currentSceneId: endingId,
        currentLineIndex: 0,
        history: [...prev.history, { sceneId: prev.currentSceneId, lineIndex: prev.currentLineIndex }],
      }));
      setTimeout(() => {
        setIsFlashBlack(false);
      }, 800);
    }, 900);
  };

  const resetGame = () => {
    localStorage.removeItem('vn-save-ancient');
    window.location.href = '/';
  };

  const handleChoiceClick = (targetSceneId: string) => {
    const currentScene = SCRIPT.find((s) => s.id === state.currentSceneId);
    // 檢查選項是否有特定音效，否則檢查場景轉場音效
    const choice = currentScene?.choices?.find(c => c.targetSceneId === targetSceneId);
    if (choice?.sfxKey) {
      playSFX(choice.sfxKey);
    } else if (currentScene?.hasTransitionSFX) {
      const sfxKey = currentScene.transitionSFXKey || 'transition_swish' as any;
      playSFX(sfxKey);
    }
    setChoicesVisible(false);
    setIsFlashBlack(true);
    setTimeout(() => {
      setChoicesVisible(false); // 重置選項狀態
      setState((prev) => ({
        ...prev,
        currentSceneId: targetSceneId,
        currentLineIndex: 0,
        history: [...prev.history, { sceneId: prev.currentSceneId, lineIndex: prev.currentLineIndex }],
      }));
      setTimeout(() => {
        setIsFlashBlack(false);
      }, 800);
    }, 900);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black text-stone-200 select-none font-serif transition-all duration-1000 ${isMemoryScene ? 'grayscale contrast-125' : ''}`}>

      {/* 背景層 */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {!isSceneTransitioning && currentBackgroundUrl && (
            <motion.div
              key={currentBackgroundUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${LOG_IMAGE})` }}
            >
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={currentBackgroundUrl}
                alt="Background"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!isSceneTransitioning && !sceneLine.isMonologue && (
          <div
            className="absolute inset-x-0 flex justify-center items-end pointer-events-none z-10 overflow-visible"
            style={{ bottom: STANDING_LAYOUT.baseBottom }}
          >
            <AnimatePresence>
              {sceneLine.standingPortraits?.map((p) => {
                const char = CHARACTERS[p.characterId];
                if (!char) return null;
                const imgUrl = char.standingPortraits[p.expression];
                const posConfig = (STANDING_LAYOUT.positions as any)[p.position || 'center'] || STANDING_LAYOUT.positions.center;

                return (
                  <motion.div
                    key={`${state.currentSceneId}-${p.characterId}`}
                    initial={{ opacity: 0, x: `calc(-50% + ${posConfig.x})`, y: 40 }} // 增加初始縱向偏移量，讓 rising 感更強
                    animate={{
                      opacity: 1,
                      x: `calc(-50% + ${p.offset?.x || posConfig.x})`,
                      y: p.offset?.y || posConfig.y,
                      scale: p.scale || posConfig.scale
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{
                      delay: isEntranceLine ? 0.3 : 0,
                      duration: isEntranceLine ? 2 : 0.4,
                      ease: "easeOut"
                    }}
                    className="absolute left-1/2 bottom-0"
                    style={{ originY: "100%" }}
                  >
                    <img
                      className="object-contain pointer-events-none brightness-90"
                      style={{ height: STANDING_LAYOUT.baseHeight, maxWidth: 'none' }}
                      src={imgUrl}
                      alt={char.name}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* 記憶特效：暗角 */}
      <AnimatePresence>
        {isMemoryScene && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-25 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.7) 120%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* 右上角功能按鈕 */}
      <SidebarActions
        onOpenHistory={() => setShowHistory(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* 對話組件 */}
      <AnimatePresence>
        {!isSceneTransitioning && (
          <DialogueBox
            key={`dialogue-box-${state.currentSceneId}`}
            currentLine={sceneLine}
            currentChar={currentChar}
            nextLine={nextLine}
            isFirstDialogueAfterMonologue={isEntranceLine}
          />
        )}
      </AnimatePresence>

      {/* 選項介面 */}
      <AnimatePresence>
        {choicesVisible && currentScene.choices && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[30%] inset-x-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col gap-6 w-full max-w-lg px-4 pointer-events-auto">
              {currentScene.choices.map((choice, i) => (
                <ChoiceButton
                  key={i}
                  text={choice.text}
                  delay={i * 0.1 + 0.3}
                  onClick={() => handleChoiceClick(choice.targetSceneId)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 對話紀錄 (側邊欄) */}
      <HistoryLog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={state.history}
      />

      {/* 主選單 */}
      <GameMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onReset={resetGame}
      />

      {/* 閃黑過渡層 (放在最上層) */}
      <AnimatePresence>
        {isFlashBlack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-9999 bg-black flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-stone-500 tracking-[0.5em] text-sm"
            >
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug 結局觸發按鈕 (僅限開發預覽) */}
      <div className="absolute left-4 top-20 z-60 flex flex-col gap-2 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => jumpToEnding('endingA')}
          className="px-2 py-1 bg-stone-800 text-xs border border-stone-600 rounded"
        >
          DEBUG: Ending A
        </button>
        <button
          onClick={() => jumpToEnding('endingB')}
          className="px-2 py-1 bg-stone-800 text-xs border border-stone-600 rounded"
        >
          DEBUG: Ending B
        </button>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8B0000; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function setState(arg0: (prev: any) => any) {
  throw new Error('Function not implemented.');
}
function setChoicesVisible(arg0: boolean) {
  throw new Error('Function not implemented.');
}

function setIsFlashBlack(arg0: boolean) {
  throw new Error('Function not implemented.');
}

function playSFX(sfxKey: any) {
  throw new Error('Function not implemented.');
}

