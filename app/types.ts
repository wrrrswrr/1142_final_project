import { InventorySound } from './lib/audioAssets';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CharacterInfo {
  id: string;
  name: string;
  color?: string;
  headPortraits: Record<string, string>; // 多種頭像表情
  standingPortraits: Record<string, string>; // 立繪集合 (不同表情)
}

export interface BackgroundInfo {
  id: string;
  url: string;
}

export interface StandingPortraitEntry {
  characterId: string;
  expression: string;
  position?: 'left' | 'center' | 'right' | string;
  offset?: { x: string; y: string };
  scale?: number;
}

export interface Line {
  characterId?: string;
  text: string;
  backgroundId?: string;
  headExpression?: string; // 指定要使用的頭像表情 key
  standingPortraits?: StandingPortraitEntry[];
  isMonologue?: boolean; // 新增：是否為獨白模式（黑底居中文字）
  monologueFontSize?: string; // 新增：獨白模式可手動調整字體大小
  sfxKey?: InventorySound; // 新增：此行對話出現時播放的特定音效
  sfxLoop?: boolean; // 新增：音效是否循環播放
  stopSFXKey?: InventorySound; // 新增：此行對話出現時停止指定的音效
}

export interface Choice {
  text: string;
  targetSceneId: string;
  sfxKey?: InventorySound; // 新增：點擊此選項時播放的特定音效
}

export interface Scene {
  id: string;
  defaultBackgroundId?: string; // 章節特定背景
  nextSceneId?: string; // 線性故事流程：下一個章節 ID
  lines: Line[];
  choices?: Choice[];
  hasTransitionSFX?: boolean; // 是否播放轉場音效
  transitionSFXKey?: InventorySound; // 新增：可指定的轉場音效 Key (預設 transition_swish)
}

export interface VNState {
  currentSceneId: string;
  currentLineIndex: number;
  history: { sceneId: string; lineIndex: number }[];
  variables: Record<string, any>;
}
