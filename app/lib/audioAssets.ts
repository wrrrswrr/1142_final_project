export const AUDIO_ASSETS = {
    bgm: {
        chapter1_3_5: "/opening.mp3", // 1~3.5 BGM
        ending_a: "/endingA.mp3",
        ending_b: "/endingB.mp3",
        investigation: "/playing.mp3",
    },
    sfx: {
        button_click: "/button.mp3",
        transition_window: "/window.mp3", 
        transition_water: "/water.mp3", 
        dialogue_wind: "/wind.mp3",
        dialogue_slap: "/slap.mp3", 
        dialogue_burning: "/burning.mp3", 
        dialogue_fall: "/fall.mp3", 
        dialogue_smash: "/smash.mp3", 
        dialogue_footstep: "/footstep.mp3", 
        dialogue_shock: "/shock.mp3", 
        dialogue_pourtea: "/pourtea.mp3", 
    }
} as const;

export type AudioCategory = keyof typeof AUDIO_ASSETS;
export type InventorySound = keyof typeof AUDIO_ASSETS.sfx;
export type BGMSound = keyof typeof AUDIO_ASSETS.bgm;
