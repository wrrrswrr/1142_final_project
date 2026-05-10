'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { AUDIO_ASSETS, BGMSound, InventorySound } from './audioAssets';

interface AudioContextType {
    playBGM: (key: BGMSound) => void;
    stopBGM: () => void;
    playSFX: (key: InventorySound, loop?: boolean) => void;
    stopSFX: (key: InventorySound) => void;
    setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const bgmRef = useRef<Howl | null>(null);
    const currentBGMKey = useRef<BGMSound | null>(null);
    const activeSFX = useRef<{ [key: string]: Howl }>({});

    const playBGM = (key: BGMSound) => {
        // 如果已經在播相同的 BGM，就不重複播放
        if (currentBGMKey.current === key && bgmRef.current?.playing()) return;

        // 停止當前 BGM
        if (bgmRef.current) {
            bgmRef.current.fade(bgmRef.current.volume(), 0, 1000);
            const oldBgm = bgmRef.current;
            setTimeout(() => oldBgm.stop(), 1000);
        }

        // 建立新 BGM
        const newBgm = new Howl({
            src: [AUDIO_ASSETS.bgm[key]],
            loop: true,
            volume: 0,
            html5: true, // 使用 HTML5 Audio 以處理較大檔案
        });

        newBgm.play();
        newBgm.fade(0, 0.5, 1000);

        bgmRef.current = newBgm;
        currentBGMKey.current = key;
    };

    const stopBGM = () => {
        if (bgmRef.current) {
            bgmRef.current.fade(bgmRef.current.volume(), 0, 1000);
            setTimeout(() => {
                bgmRef.current?.stop();
                currentBGMKey.current = null;
            }, 1000);
        }
    };

    const playSFX = (key: InventorySound, loop = false) => {
        // 如果該音效已經在循環播放且正在播放中，就不重複開啟
        if (loop && activeSFX.current[key]?.playing()) return;

        // 如果之前有舊的同名音效還在播，先停止它（避免疊加）
        if (activeSFX.current[key]) {
            activeSFX.current[key].stop();
        }

        const sfx = new Howl({
            src: [AUDIO_ASSETS.sfx[key]],
            volume: 0.7,
            loop: loop,
            onend: function () {
                if (!loop) delete activeSFX.current[key];
            },
            onloaderror: () => delete activeSFX.current[key],
            onplayerror: () => delete activeSFX.current[key]
          });
          
          activeSFX.current[key] = sfx;
          sfx.play();
        };

    const stopSFX = (key: InventorySound) => {
        const sound = activeSFX.current[key];
        if (sound) {
            // 使用較快的淡出並立即停止
            sound.fade(sound.volume(), 0, 300);
            setTimeout(() => {
              sound.stop();
              delete activeSFX.current[key];
            }, 350);
          }
        };

    const setVolume = (volume: number) => {
        Howl.prototype.volume(volume);
    };

    return (
        <AudioContext.Provider value={{ playBGM, stopBGM, playSFX, stopSFX, setVolume }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
