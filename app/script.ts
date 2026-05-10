/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene, CharacterInfo, BackgroundInfo } from './types';

export const BACKGROUNDS: Record<string, BackgroundInfo> = {
  'morning_inside': { id: 'morning_inside', url: '/morning_inside.png' },
  'garden': { id: 'garden', url: '/garden.png' },
  'night_outside': { id: 'night_outside', url: '/night_outside.png' },
  'night_inside': { id: 'night_inside', url: '/night_inside.png' },
  'window': { id: 'window', url: '/window.png' },
  'banquet': { id: 'banquet', url: '/banquet.png' },
};

export const CHARACTERS: Record<string, CharacterInfo> = {
  heroine: {
    id: 'heroine',
    name: '沈答應',
    color: '#5e1f22',
    headPortraits: {
      'normal': '/A_normal.png',
      'sad': '/A_sad.png',
      'angry': '/A_angry.png',
    },
    standingPortraits: {
      'normal': '/A_normal.png',
      'sad': '/A_sad.png',
      'angry': '/A_angry.png',
    }
  },
  king: {
    id: 'king',
    name: '皇上',
    color: '#5e1f22',
    headPortraits: {
      'normal': '/B_normal.png',
      'smile': '/B_smile.png',
    },
    standingPortraits: {
      'normal': '/B_normal.png',
      'smile': '/B_smile.png',
    }
  },
  consort: {
    id: 'consort',
    name: '熙貴妃',
    color: '#5e1f22',
    headPortraits: {
      'normal': '/C_normal.png',
      'angry': '/C_angry.png',
    },
    standingPortraits: {
      'normal': '/C_normal.png',
      'angry': '/C_angry.png',
    }
  },
  lady: {
    id: 'lady',
    name: '惠貴人',
    color: '#5e1f22',
    headPortraits: {
      'normal': '/D_normal.png',
      'sad': '/D_sad.png',
    },
    standingPortraits: {
      'normal': '/D_normal.png',
      'sad': '/D_sad.png',
    }
  },
};

export const SCRIPT: Scene[] = [
  {
    id: 'start',
    defaultBackgroundId: 'morning_inside',
    nextSceneId: 'chapter1',
    lines: [
      {
        characterId: 'heroine',
        text: '夜風冷得刺骨。',
        isMonologue: true,
        monologueFontSize: '2rem',
        sfxKey: 'dialogue_wind',
      },
      {
        characterId: 'heroine',
        text: '看著眼前的「長信宮」，前幾日的景象依然歷歷在目……',
        isMonologue: true,
        monologueFontSize: '2rem'
      },
      {
        characterId: 'heroine',
        text: '這座富麗堂皇的囚籠，吃人從不吐骨頭。',
        isMonologue: true,
        monologueFontSize: '2rem'
      }
    ]
  },
  {
    id: 'chapter1',
    defaultBackgroundId: 'morning_inside',
    lines: [
      {
        characterId: 'heroine',
        text: '(長信宮內，陽光灑落，惠貴人正在撫琴，我坐在一旁替她理著繡線)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'center' }],
        stopSFXKey: 'dialogue_wind'
      },
      {
        characterId: 'lady',
        text: '妹妹，妳看這新開的梅花。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'lady',
        text: '若是哪天我們能出宮，真想帶妳去塞外，看看我哥哥信裡說的，那漫山遍野的雪……',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'center' }],
      },
      {
        text: '太監尖銳的通報聲突然響起：「皇上駕到——！」',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'heroine',
        text: '(惠貴人與我連忙跪下請安)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'normal', position: 'left' }],
      },
      {
        characterId: 'king',
        text: '（快步上前，親自扶起惠貴人）',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'king',
        text: '惠兒的琴聲，朕在宮外都聽見了。快起來，妳身子弱，不必多禮。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'lady',
        text: '臣妾叩見皇上。不知皇上白日會來，臣妾有失遠迎。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'king',
        text: '（輕輕握住惠貴人的手，順勢將一支金步搖插入她髮間，笑意盈盈）',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'king',
        text: '妳兄長在邊疆大捷，斬敵三千，朕心甚慰，特地來看看妳。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'king',
        text: '只要惠家軍繼續為朕盡忠……不，只要愛妃在宮中安心養性，朕定保妳一世榮華。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'heroine',
        text: '(我跪在後方不敢抬頭，卻瞥見皇上雖然笑著，但握著惠貴人的手卻微微用力。)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
      {
        characterId: 'heroine',
        text: '(那眼神裡……沒有半分情意，只有深不見底的試探與冰冷。)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'king', expression: 'smile', position: 'left' }],
      },
    ],
    nextSceneId: 'chapter2'
  },
  {
    id: 'chapter2',
    defaultBackgroundId: 'garden',
    lines: [
      {
        characterId: 'heroine',
        text: '(隔日，我與惠貴人在園中散步，前方突然被一群人擋住去路)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'consort',
        text: '（坐在步輦上，居高臨下，把玩著護甲，發出一聲冷笑）',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
      {
        characterId: 'consort',
        text: '喲，這不是我們風頭正盛的惠貴人嗎？怎麼，兄長打了勝仗，連見了本宮都忘了行禮？',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
      {
        characterId: 'lady',
        text: '臣妾給熙貴妃娘娘請安。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'normal', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
      {
        text: '「啪！」一記清脆的耳光響起，熙貴妃身邊的掌事宮女，狠狠搧了惠貴人貼身丫鬟一巴掌，丫鬟嘴角滲血，卻不敢哭出聲',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'angry', position: 'left' }],
        sfxKey: 'dialogue_slap'
      },
      {
        characterId: 'consort',
        text: '沒規矩的東西！主子說話，有你這賤婢抬頭的份？！惠貴人，本宮今日就教教妳這宮裡的規矩。',
        headExpression: 'angry',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'angry', position: 'left' }],
      },
      {
        characterId: 'consort',
        text: '來人，把本宮那罐『龍涎茶』，還有多寶閣上的御賜瓷瓶賞給她。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
      {
        text: '宮女將東西強行塞入惠貴人懷中',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'angry', position: 'left' }],
      },
      {
        characterId: 'consort',
        text: '別以為有了點軍功，就能飛上枝頭。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
      {
        characterId: 'consort',
        text: '這茶，妳可得給本宮一滴不剩地喝下去，好好『降、降、火』。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'lady', expression: 'sad', position: 'right' }, { characterId: 'consort', expression: 'normal', position: 'left' }],
      },
    ],
    nextSceneId: 'chapter3'
  },
  {
    id: 'chapter3',
    defaultBackgroundId: 'night_outside',
    lines: [
      {
        characterId: 'heroine',
        text: '那是我們最後一次見面。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '昨夜，長信宮突然傳出喪鐘。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '太醫說是急病，宮人議論是失寵鬱結，也有人偷偷竊語，說是被暗中陷害。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '今日一早，她的遺體便被匆匆運走，宮門落鎖，彷彿她這個人從未存在過。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '可是我不信。',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '她昨日還笑著說要帶我看雪。',
        headExpression: 'angry',
      },
    ],
    nextSceneId: 'chapter3_window'
  },
  {
    id: 'chapter3_window',
    defaultBackgroundId: 'window',
    hasTransitionSFX: true,
    transitionSFXKey: 'transition_window',
    lines: [
      {
        characterId: 'heroine',
        text: '這扇窗戶……似乎沒有鎖緊。',
        headExpression: 'normal',
      },
    ],
    choices: [
      { text: '翻過窗戶', targetSceneId: 'chapter3.5' }
    ]
  },
  {
    id: 'chapter3.5',
    defaultBackgroundId: 'night_inside',
    nextSceneId: 'investigation',
    lines: [
      {
        characterId: 'heroine',
        text: '(伴隨著木頭乾澀的「吱呀」聲，翻身潛入昏暗的長信宮。)',
        headExpression: 'normal',
      },
      {
        text: '(屋內一片死寂，月光透過窗櫺灑在地毯上，空氣中殘留著惠貴人生前最愛的脂粉味，以及一絲不易察覺的苦澀氣息。)',
      },
      {
        characterId: 'heroine',
        text: '(站定，看著凌亂的房間，眼神變得堅定)',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '姐姐，無論是誰……哪怕是這宮裡最尊貴的人，我也要讓真相大白。',
        headExpression: 'angry',
      },
    ],
  },
  {
    id: 'endingA',
    defaultBackgroundId: 'garden',
    hasTransitionSFX: true,
    transitionSFXKey: 'transition_water',
    lines: [
      {
        characterId: 'heroine',
        text: '我將沾毒的銀針與熙貴妃賞賜的茶杯，暗中交給了太后與皇上。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '物證俱在，皇上震怒，下令褫奪熙貴妃封號，打入冷宮。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '皇上念我揭發有功，又與惠貴人情同姐妹，特意將我召至御花園寬慰。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'king',
        text: '(穿著常服，正神色平靜地將魚餌灑入池中。)',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '熙貴妃驕縱跋扈，朕早有耳聞，卻沒想到她竟歹毒至此。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '若不是妳心細如髮，用銀針驗出了那杯龍涎茶有異，惠兒恐怕真要含冤九泉了。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'heroine',
        text: '臣妾只是不願姐姐死得不明不白。那茶水太醫驗過後也說是罕見的劇毒……',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '是啊。熙貴妃也是糊塗，竟敢動用『寒髓散』這種無色無味的禁藥。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '她以為能神不知鬼不覺地偽裝成急病，卻沒算到妳會深夜潛入去查探。妳做得很對，替朕，也替惠兒討回了公道。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '(語畢，轉過身繼續餵魚。)',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'heroine',
        text: '(僵在原地，大腦在一瞬間轟然炸開，連呼吸都停滯了。)',
        headExpression: 'angry',
        sfxKey: 'dialogue_shock',
      },
      {
        characterId: 'heroine',
        text: '內心: 等等……寒髓散？！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 太醫驗證毒茶時，只對外宣稱是「不知名的劇毒」。',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 我之所以知道那是「寒髓散」，是因為我修好古箏後，在暗格裡找到了那張內務府的領料單！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 那張單子只有我知道，我從未向任何人提起，也沒有作為證據交出去。',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 皇上……皇上怎麼會精準地說出「寒髓散」這個名字？！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '(無數被忽視的細節在腦海中瘋狂串聯：)',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 寒髓散是皇家秘藥，只有內務府才有……熙貴妃母家再大，也根本拿不到！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 那半枚掉在長信宮死角的龍紋斷章……根本不是皇上以前不小心遺落的。',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 案發當晚，皇上就在長信宮！是他親自把寒髓散下在了熙貴妃送來的茶裡！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '內心: 他不僅殺了姐姐，還順水推舟，利用我找到的「毒茶」除掉了母家勢力龐大的熙貴妃！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '(忍不住微微發抖，抬起頭，卻發現皇上不知何時已經停止了餵魚。)',
        headExpression: 'angry',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '(正偏過頭，用一種深不見底、毫無溫度的眼神，靜靜地盯著沈答應慘白的臉。)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '愛妃的臉色怎麼這麼難看？可是……想到了什麼不該想的事情？',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
    ],
    nextSceneId: 'endingA-1'
  },
  {
    id: 'endingA-1',
    defaultBackgroundId: 'garden',
    lines: [
      {
        text: '建元七年冬，沈答應因思念惠貴人過度，精神恍惚，失足落入御花園太液池中，溺水身亡。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
    ]
  },
  {
    id: 'endingB',
    defaultBackgroundId: 'night_inside',
    lines: [
      {
        characterId: 'heroine',
        text: '我將所有的線索串聯在一起。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '貴妃的跋扈只是表象，真正能調動御前侍衛領取劇毒，又能讓謹慎的惠貴人毫無防備喝下毒茶的，只有這天下之主。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'king',
        text: '（站在古箏旁，親手倒了一杯茶。）',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
        sfxKey: 'dialogue_pourtea',
      },
      {
        characterId: 'king',
        text: '惠兒，熙貴妃跋扈，委屈妳了。先喝了這杯茶，補補身子。',
        headExpression: 'smile',
        standingPortraits: [{ characterId: 'king', expression: 'smile', position: 'center' }],
      },
      {
        characterId: 'lady',
        text: '（毫無防備地接過，飲下後臉色驟變，痛苦地捂住喉嚨，跌倒在古箏旁）',
        headExpression: 'sad',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
        sfxKey: 'dialogue_fall',
      },
      {
        characterId: 'lady',
        text: '皇上……這茶……為什麼……',
        headExpression: 'sad',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        characterId: 'king',
        text: '（眼神瞬間變得冷酷，死死按住惠貴人的肩膀，防止她呼救。)',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
      {
        text: '(掙扎間，他的玉珮撞擊桌角，碎裂落地，惠貴人的指甲也猛地劃斷了琴弦。）',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
        sfxKey: 'dialogue_smash',
      },
      {
        characterId: 'king',
        text: '別怪朕。要怪，就怪妳哥哥的軍功太盛了。朕的江山，容不下一個可能擁有惠家血脈的皇子。',
        headExpression: 'normal',
        standingPortraits: [{ characterId: 'king', expression: 'normal', position: 'center' }],
      },
    ],
    nextSceneId: 'endingB-1'
  },
  {
    id: 'endingB-1',
    defaultBackgroundId: 'night_inside',
    lines: [
      {
        characterId: 'heroine',
        text: '原來如此……原來如此！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '什麼恩寵，什麼賞賜，全都是裹著蜜糖的砒霜！',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '姐姐到死的那一刻，看著平日裡對她柔情百轉的枕邊人親手餵下毒藥，該有多絕望？',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '(猛地轉身，抓起證據，想要衝出殿外。)',
        headExpression: 'angry',
      },
      {
        characterId: 'heroine',
        text: '(手剛碰到門框，卻像觸電般停住了。)',
        headExpression: 'angry',
      },
      {
        text: '(門外，傳來巡邏侍衛整齊劃一的腳步聲，以及遠處乾清宮傳來的更漏聲。)',
        sfxKey: 'dialogue_footstep',
      },
      {
        characterId: 'heroine',
        text: '（腳步聲漸遠，慢慢滑坐在門背後，眼淚無聲地落下）',
        headExpression: 'sad',
        stopSFXKey: 'dialogue_footstep',
      },
      {
        characterId: 'heroine',
        text: '告發？向誰告發？',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '這紫禁城裡，他就是天。太后為了皇家顏面會將我亂棍打死。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '若消息傳到邊疆，惠家軍一旦生變，皇上便有了名正言順剿滅惠家的理由……',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '姐姐最珍視的家族，將會因我而覆滅。',
        headExpression: 'sad',
      },
      {
        characterId: 'heroine',
        text: '(顫抖著手，將領料單放進了燭火中。看著火苗將證據一點點吞噬，化為灰燼。)',
        headExpression: 'sad',
        sfxKey: 'dialogue_burning',
      },     
    ],
    nextSceneId: 'endingB-2'
  },
  {
    id: 'endingB-2',
    defaultBackgroundId: 'garden',
    lines: [
      {
        characterId: 'heroine',
        text: '姐姐……對不起。',
        isMonologue: true,
        monologueFontSize: '2rem',
        stopSFXKey: 'dialogue_burning',
      },
      {
        characterId: 'heroine',
        text: '在這座金碧輝煌的牢籠裡，有些真相，從一開始就不被允許存在。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '妳放心，我會活下去。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '我會帶著這個深淵般的秘密，在這吃人的宮裡，一點一點地爬上去……',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
      {
        characterId: 'heroine',
        text: '直到有一天，我能親手掀翻這盤棋。',
        isMonologue: true,
        monologueFontSize: '2rem',
      },
    ]
  },
];
