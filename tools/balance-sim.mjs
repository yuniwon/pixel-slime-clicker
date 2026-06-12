#!/usr/bin/env node
'use strict';

const SAVE_VERSION = 10;
const PRESTIGE_UNLOCK = 1e9;
const MAX_LEVEL = 60;

const PRODUCERS = [
  { id: 'chick', name: '병아리', baseCost: 15, cps: 0.1 },
  { id: 'cat', name: '고양이', baseCost: 100, cps: 1 },
  { id: 'dog', name: '강아지', baseCost: 1100, cps: 8 },
  { id: 'rabbit', name: '로켓 토끼', baseCost: 12000, cps: 47 },
  { id: 'unicorn', name: '유니콘', baseCost: 130000, cps: 260 },
  { id: 'dragon', name: '아기 드래곤', baseCost: 1.4e6, cps: 1400 },
  { id: 'whale', name: '우주 고래', baseCost: 1.8e7, cps: 7800 },
  { id: 'planet', name: '코인 행성', baseCost: 2.8e8, cps: 44000 },
  { id: 'spirit', name: '별의 정령', baseCost: 6e9, cps: 260000 },
  { id: 'turtle', name: '시간 거북', baseCost: 1e11, cps: 1.6e6 },
];

const UPGRADES = [
  { id: 'glove1', name: '말랑 장갑', cost: 50, type: 'clickAdd', value: 1 },
  { id: 'glove2', name: '폭신 장갑', cost: 600, type: 'clickAdd', value: 5 },
  { id: 'glove3', name: '구름 장갑', cost: 7000, type: 'clickAdd', value: 25 },
  { id: 'hand1', name: '황금 손가락', cost: 2500, type: 'clickMul', value: 2 },
  { id: 'hand2', name: '다이아 손가락', cost: 50000, type: 'clickMul', value: 2 },
  { id: 'hand3', name: '별빛 손가락', cost: 1.2e6, type: 'clickMul', value: 3 },
  { id: 'snack1', name: '맛있는 간식', cost: 10000, type: 'cpsMul', value: 1.25 },
  { id: 'snack2', name: '딸기 케이크', cost: 250000, type: 'cpsMul', value: 1.5 },
  { id: 'snack3', name: '우주 피자', cost: 8e6, type: 'cpsMul', value: 2 },
  { id: 'click1', name: '응원봉', cost: 100000, type: 'clickCps', value: 0.01 },
  { id: 'click2', name: '슬라임 응원단', cost: 5e6, type: 'clickCps', value: 0.05 },
  { id: 'glove4', name: '은하 장갑', cost: 1.2e8, type: 'clickAdd', value: 120 },
  { id: 'glove5', name: '성운 장갑', cost: 4e9, type: 'clickAdd', value: 600 },
  { id: 'hand4', name: '무지개 손가락', cost: 1.5e9, type: 'clickMul', value: 2.5 },
  { id: 'hand5', name: '우주 손가락', cost: 4e11, type: 'clickMul', value: 3 },
  { id: 'snack4', name: '은하 도넛', cost: 1e9, type: 'cpsMul', value: 1.5 },
  { id: 'snack5', name: '별꿀 단지', cost: 5e10, type: 'cpsMul', value: 1.75 },
  { id: 'snack6', name: '우주 케이크', cost: 2e12, type: 'cpsMul', value: 2 },
  { id: 'click3', name: '슬라임 방송국', cost: 2e9, type: 'clickCps', value: 0.1 },
  { id: 'combo1u', name: '말랑 메트로놈', cost: 1.5e8, type: 'comboWin', value: 0.3 },
  { id: 'star1u', name: '별 망원경', cost: 6e8, type: 'starInt', value: 0.1 },
  { id: 'star2u', name: '별빛 자석', cost: 6e10, type: 'starBon', value: 1.25 },
  { id: 'perfect1', name: '퍼펙트 오일', cost: 8e9, type: 'perfAdd', value: 0.01 },
  { id: 'gold1', name: '황금 슬라임상', cost: 1.5e11, type: 'globMul', value: 1.1 },
  { id: 'gold2', name: '왕관 광택제', cost: 3e13, type: 'globMul', value: 1.15 },
];

const STAGES = [
  { name: '아기 초록 슬라임', atLevel: 1 },
  { name: '바다 슬라임', atLevel: 5 },
  { name: '딸기 슬라임', atLevel: 10 },
  { name: '황금 킹 슬라임', atLevel: 15 },
  { name: '전설의 갓 슬라임', atLevel: 20 },
];

const PERKS = [
  { id: 'sticky', name: '끈적한 기억', max: 10 },
  { id: 'promise', name: '친구의 약속', max: 10 },
  { id: 'starlight', name: '별빛 친화', max: 5 },
  { id: 'softtime', name: '말랑한 시간', max: 5 },
  { id: 'combo', name: '콤보 본능', max: 5 },
  { id: 'evoseed', name: '진화의 씨앗', max: 5 },
  { id: 'instinct', name: '별의 직감', max: 5 },
  { id: 'soulfire', name: '영혼의 불꽃', max: 20, costMul: 5 },
  { id: 'starborn', name: '별의 혈통', max: 10, costMul: 3 },
  { id: 'deeproot', name: '깊은 뿌리', max: 10, costMul: 2 },
];

const DECOR = [
  { id: 'cushion', name: '젤리 쿠션', cost: 5e4, boost: { click: 0.02 } },
  { id: 'pond', name: '작은 연못', cost: 5e5, boost: { cps: 0.02 } },
  { id: 'lamp', name: '별빛 램프', cost: 5e6, boost: { star: 3 } },
  { id: 'mat', name: '낮잠 매트', cost: 5e7, boost: { cps: 0.03 } },
  { id: 'fountain', name: '코인 분수', cost: 5e8, boost: { click: 0.05 } },
  { id: 'window', name: '우주 창문', cost: 1e10, boost: { cps: 0.05 } },
];

const RARITY = {
  common: { w: 70 },
  rare: { w: 22 },
  epic: { w: 7 },
  legendary: { w: 1 },
};

const BLESSINGS = [
  { id: 'sparkfinger', rarity: 'common', stack: true, tag: 'click', fx: c => { c.clickMul *= 1.08; } },
  { id: 'quietrich', rarity: 'common', stack: true, tag: 'farm', fx: c => { c.cpsMul *= 1.06; } },
  { id: 'warmstart', rarity: 'common', stack: true, tag: 'meta', fx: c => { c.clickMul *= 1.04; c.cpsMul *= 1.04; } },
  { id: 'comboKeep', rarity: 'common', stack: true, tag: 'click', fx: c => { c.comboWindow += 0.2; } },
  { id: 'firststep', rarity: 'common', stack: true, tag: 'farm', fx: c => { c.prodDisc *= 0.95; } },
  { id: 'cheapup', rarity: 'common', stack: true, tag: 'farm', fx: c => { c.upDisc *= 0.9; } },
  { id: 'dustsense', rarity: 'common', stack: true, tag: 'dream', fx: c => { c.wishDust += 1; } },
  { id: 'starlonger', rarity: 'common', stack: true, tag: 'star', fx: c => { c.starLinger += 2; } },
  { id: 'napecon', rarity: 'common', stack: true, tag: 'dream', fx: c => { c.offlineAdd += 0.05; } },
  { id: 'minirain', rarity: 'common', stack: true, tag: 'star', fx: c => { c.miniCount += 1; } },
  { id: 'jellysnack', rarity: 'common', stack: true, tag: 'meta', fx: c => { c.evoNeed *= 0.97; } },
  { id: 'tinyluck', rarity: 'common', stack: true, tag: 'meta', fx: c => { c.luck += 4; } },
  { id: 'festspark', rarity: 'common', stack: true, tag: 'click', fx: c => { c.perfectAdd += 0.01; } },
  { id: 'drumbeat', rarity: 'common', stack: true, tag: 'click', fx: c => { c.comboAmp += 0.08; } },
  { id: 'starcrumb', rarity: 'common', stack: true, tag: 'star', fx: c => { c.starBonus *= 1.1; } },
  { id: 'pocketwind', rarity: 'common', stack: true, tag: 'star', fx: c => { c.starInt *= 0.95; } },
  { id: 'elastic', rarity: 'rare', tag: 'click', fx: c => { c.comboStart = Math.max(c.comboStart, 5); } },
  { id: 'luckytip', rarity: 'rare', tag: 'click', fx: c => { c.perfectAdd += 0.02; } },
  { id: 'starhunch', rarity: 'rare', tag: 'star', fx: c => { c.starInt *= 0.88; } },
  { id: 'partylong', rarity: 'rare', tag: 'star', fx: c => { c.frenzyDur += 3; c.partyDur += 3; } },
  { id: 'slowcrown', rarity: 'rare', tag: 'meta', fx: c => { c.evoNeed *= 0.94; } },
  { id: 'soulwhisper', rarity: 'rare', tag: 'meta', fx: c => { c.soulFlat += 1; } },
  { id: 'goldenpaw', rarity: 'rare', tag: 'farm', fx: c => { c.prodDisc *= 0.88; } },
  { id: 'dreamfeast', rarity: 'rare', tag: 'dream', fx: c => { c.offlineAdd += 0.15; } },
  { id: 'starshower', rarity: 'rare', tag: 'star', fx: c => { c.miniCount += 3; } },
  { id: 'perfectecho', rarity: 'rare', tag: 'click', fx: c => { c.perfectPower += 2; } },
  { id: 'luckyscent', rarity: 'rare', tag: 'meta', fx: c => { c.luck += 12; } },
  { id: 'clickstorm', rarity: 'rare', tag: 'click', fx: c => { c.clickMul *= 1.2; } },
  { id: 'herdcall', rarity: 'rare', tag: 'farm', fx: c => { c.cpsMul *= 1.15; } },
  { id: 'wishwell', rarity: 'rare', tag: 'dream', fx: c => { c.wishDust += 2; } },
  { id: 'comboheart', rarity: 'epic', tag: 'click', fx: c => { c.comboCap = Math.max(c.comboCap, 80); } },
  { id: 'doublestar', rarity: 'epic', tag: 'star', fx: c => { c.starLingerMul *= 2; c.starBonus *= 1.25; } },
  { id: 'midasclick', rarity: 'epic', tag: 'click', fx: c => { c.clickCps += 0.03; } },
  { id: 'nightshift', rarity: 'epic', tag: 'dream', fx: c => { c.offlineFull = true; c.offlineCap += 4; } },
  { id: 'frenzyking', rarity: 'epic', tag: 'star', fx: c => { c.frenzyMulAdd += 2; } },
  { id: 'evostone', rarity: 'epic', tag: 'meta', fx: c => { c.evoNeed *= 0.88; } },
  { id: 'fortunecat', rarity: 'epic', tag: 'meta', fx: c => { c.luck += 25; } },
  { id: 'twinstars', rarity: 'legendary', tag: 'star', fx: c => { c.twinStars = true; } },
  { id: 'eternalcombo', rarity: 'legendary', tag: 'click', fx: c => { c.comboEternal = true; } },
  { id: 'perfectchain', rarity: 'legendary', tag: 'click', fx: c => { c.perfectX2 = true; c.perfectCombo = 5; } },
  { id: 'jackpot', rarity: 'legendary', tag: 'meta', fx: c => { c.globalMulX *= 1.3; } },
];

const SYNERGY_THRESHOLDS = Object.fromEntries(PRODUCERS.map(p => [p.id, [10, 25, 50, 100]]));
const TRAIT_BLESSING_TAG = { muscle: 'click', ranch: 'farm', star: 'star', dream: 'dream' };
const STRATEGY_DEFAULTS = {
  balanced: { clicksPerSecond: 2, activeRatio: 0.7, useGoldenStars: true, useDecor: true },
  click: { clicksPerSecond: 5, activeRatio: 0.85, useGoldenStars: true, useDecor: true },
  idle: { clicksPerSecond: 0.5, activeRatio: 0.25, useGoldenStars: true, useDecor: true },
  star: { clicksPerSecond: 2, activeRatio: 0.75, useGoldenStars: true, useDecor: true },
  prestige: { clicksPerSecond: 2, activeRatio: 0.65, useGoldenStars: true, useDecor: true },
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fmt(n) {
  if (!Number.isFinite(n)) return '∞';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(n >= 100 ? 0 : 2);
}

function minutesText(minutes) {
  if (minutes == null) return '미도달';
  return `${minutes.toFixed(1)}분`;
}

function defaultBc() {
  return {
    clickMul: 1,
    cpsMul: 1,
    globalMulX: 1,
    comboWindow: 0,
    comboCap: 50,
    comboAmp: 0,
    comboStart: 0,
    prodDisc: 1,
    upDisc: 1,
    starLinger: 0,
    starLingerMul: 1,
    starBonus: 1,
    starInt: 1,
    miniCount: 0,
    offlineAdd: 0,
    offlineFull: false,
    offlineCap: 0,
    frenzyDur: 0,
    partyDur: 0,
    frenzyMulAdd: 0,
    soulFlat: 0,
    evoNeed: 1,
    luck: 0,
    wishDust: 0,
    perfectAdd: 0,
    perfectPower: 5,
    perfectX2: false,
    perfectCombo: 0,
    twinStars: false,
    comboEternal: false,
    clickCps: 0,
  };
}

function defaultState() {
  return {
    version: SAVE_VERSION,
    coins: 0,
    totalEarned: 0,
    totalClicks: 0,
    producers: Object.fromEntries(PRODUCERS.map(p => [p.id, 0])),
    upgrades: {},
    achievements: {},
    stats: {
      lifetime: { bestCombo: 0, starsClicked: 0, earned: 0, cloudsSoothed: 0 },
      run: { clicks: 0, bestCombo: 0, starsClicked: 0, clickEarned: 0, idleEarned: 0, offlineEarned: 0 },
    },
    buffs: { discount: false },
    prestige: { souls: 0, totalSoulsEarned: 0, totalResets: 0, perks: {} },
    decor: {},
    story: {},
    codex: { stages: {}, traits: {}, friends: {}, blessings: {}, challenges: {} },
    stardust: 0,
    wishes: { active: [], completed: 0 },
    cosmetics: { owned: {}, equipped: {} },
    crystal: { plantedAt: 0, watered: '', count: 0, friendLv: {} },
    runBlessings: [],
    challenge: { active: null, startedAt: 0 },
    cosmicSeed: false,
  };
}

const levelTable = [0, 0, 100];
for (let L = 3; L <= MAX_LEVEL; L++) {
  levelTable[L] = levelTable[L - 1] * Math.min(3.4, 2 + 0.05 * Math.max(0, L - 12));
}

class BalanceSim {
  constructor(options = {}) {
    const strategy = options.buyStrategy || options.strategy || 'balanced';
    this.options = {
      ...STRATEGY_DEFAULTS[strategy],
      minutes: 240,
      autoPrestige: true,
      useBlessings: true,
      useDeepStart: true,
      useStartBlessings: true,
      useGoldenStars: true,
      useDecor: true,
      usePerks: true,
      ...options,
      buyStrategy: strategy,
    };
    this.rng = mulberry32(this.options.seed ?? 123);
    this.S = options.initialState ? clone(options.initialState) : defaultState();
    this.BC = defaultBc();
    this.combo = 0;
    this.comboTimer = 0;
    this.frenzyTimer = 0;
    this.frenzyEarned = 0;
    this.partyTimer = 0;
    this.festActive = 0;
    this.festWait = 60;
    this.time = 0;
    this.slimeLevel = this.currentLevelFor(this.S.totalEarned);
    this.stageIdx = this.stageForLevel(this.slimeLevel);
    this.currentTrait = null;
    this.starTimer = 20 + this.rng() * 40;
    this.twinFollow = false;
    this.milestones = {};
    this.goldenStarsClicked = 0;
    this.miniStarsClicked = 0;
    this.rebirthTimes = [];
    this.rebirths = 0;
    this.notes = [];
    this.computeBlessCache();
  }

  upSum(type) {
    return UPGRADES.reduce((sum, u) => sum + (this.S.upgrades[u.id] && u.type === type ? u.value : 0), 0);
  }

  upProd(type) {
    return UPGRADES.reduce((prod, u) => prod * (this.S.upgrades[u.id] && u.type === type ? u.value : 1), 1);
  }

  perkLv(id) {
    return this.S.prestige.perks[id] || 0;
  }

  perkCost(id) {
    const perk = PERKS.find(p => p.id === id);
    const next = this.perkLv(id) + 1;
    return next * next * ((perk && perk.costMul) || 1);
  }

  hasSyn(id, n) {
    return (this.S.producers[id] || 0) >= n;
  }

  producerCost(p, owned = this.S.producers[p.id]) {
    return Math.ceil(p.baseCost * Math.pow(1.15, owned) * this.BC.prodDisc);
  }

  crystalLv(id) {
    return this.S.crystal.friendLv[id] || 0;
  }

  achCount() {
    return Object.keys(this.S.achievements).length;
  }

  codexEntryCount() {
    return Object.keys(this.S.codex.stages).length +
      Object.keys(this.S.codex.traits).length +
      Object.keys(this.S.codex.friends).length +
      Object.keys(this.S.story).length;
  }

  decorAmp() {
    return 1 + (this.hasSyn('unicorn', 10) ? 0.1 : 0) + (this.hasSyn('planet', 10) ? 0.1 : 0);
  }

  decorClickMul() {
    let sum = 0;
    for (const d of DECOR) if (this.S.decor[d.id] && d.boost.click) sum += d.boost.click;
    return 1 + sum * this.decorAmp();
  }

  decorCpsMul() {
    let sum = 0;
    for (const d of DECOR) if (this.S.decor[d.id] && d.boost.cps) sum += d.boost.cps;
    return 1 + sum * this.decorAmp();
  }

  planetMul() {
    const n = this.S.producers.planet || 0;
    return 1 + 0.01 * Math.min(n, 25) + 0.002 * Math.max(0, n - 25);
  }

  soulMul() {
    const n = this.S.prestige.totalSoulsEarned;
    return 1 + 0.05 * Math.min(n, 100) + 0.02 * Math.min(Math.max(n - 100, 0), 400) + 0.005 * Math.max(n - 500, 0);
  }

  globalMul() {
    const codexBonus = this.hasSyn('unicorn', 50) ? 1 + 0.005 * this.codexEntryCount() : 1;
    const levelMul = 1 + (this.slimeLevel - 1) * 0.02;
    const soulfire = 1 + 0.1 * this.perkLv('soulfire');
    return (1 + this.achCount() * 0.01) * this.soulMul() * codexBonus * levelMul * this.BC.globalMulX *
      this.upProd('globMul') * soulfire * (this.hasSyn('turtle', 100) ? 1.1 : 1);
  }

  comboWindow() {
    return 0.9 + 0.15 * this.perkLv('combo') + this.BC.comboWindow + this.upSum('comboWin') + (this.hasSyn('turtle', 25) ? 0.3 : 0);
  }

  comboMul() {
    const amp = (this.hasSyn('chick', 25) ? 1.1 : 1) + this.BC.comboAmp;
    return 1 + Math.min(this.combo, this.BC.comboCap) * 0.02 * amp;
  }

  clickSynMul() {
    let m = 1;
    if (this.hasSyn('chick', 10)) m *= 1.05;
    if (this.hasSyn('chick', 50) && this.combo >= 30) m *= 1.2;
    if (this.hasSyn('dragon', 50) && this.frenzyTimer > 0) m *= 1.25;
    if (this.festActive > 0) m *= 2;
    return m;
  }

  cpsMulFactor() {
    let mul = this.upProd('cpsMul');
    return mul * this.globalMul() * (1 + 0.2 * this.perkLv('promise')) * this.decorCpsMul() *
      this.planetMul() * (this.hasSyn('whale', 50) ? 1.1 : 1) * (this.hasSyn('planet', 25) ? 1.1 : 1) *
      this.BC.cpsMul;
  }

  totalCps() {
    let base = 0;
    for (const p of PRODUCERS) base += p.cps * this.S.producers[p.id] * (1 + 0.01 * this.crystalLv(p.id));
    return base * this.cpsMulFactor();
  }

  clickPower() {
    let add = 1;
    let mul = 1;
    let cpsPart = 0;
    for (const u of UPGRADES) {
      if (!this.S.upgrades[u.id]) continue;
      if (u.type === 'clickAdd') add += u.value;
      if (u.type === 'clickMul') mul *= u.value;
      if (u.type === 'clickCps') cpsPart += u.value;
    }
    const sticky = 1 + 0.25 * this.perkLv('sticky');
    return add * mul * this.globalMul() * sticky * this.decorClickMul() * this.clickSynMul() * this.BC.clickMul +
      this.totalCps() * (cpsPart + this.BC.clickCps);
  }

  frenzyMul() {
    return this.frenzyTimer > 0 ? (this.hasSyn('dragon', 25) ? 8 : 7) + this.BC.frenzyMulAdd : 1;
  }

  frenzyMulForExpected() {
    return (this.hasSyn('dragon', 25) ? 8 : 7) + this.BC.frenzyMulAdd;
  }

  partyMul() {
    return this.partyTimer > 0 ? 5 : 1;
  }

  frenzyDuration() {
    return 20 + (this.hasSyn('dragon', 10) ? 2 : 0) + this.BC.frenzyDur;
  }

  partyDuration() {
    return 30 + (this.hasSyn('whale', 25) ? 5 : 0) + this.BC.partyDur;
  }

  starLinger() {
    let bonus = 0;
    for (const d of DECOR) if (this.S.decor[d.id] && d.boost.star) bonus += d.boost.star;
    return (10 + bonus * this.decorAmp() + (this.hasSyn('dog', 10) ? 1 : 0) + this.BC.starLinger) * this.BC.starLingerMul;
  }

  starIntervalMean() {
    return 70 * (1 - 0.08 * this.perkLv('starlight')) * (this.hasSyn('dog', 25) ? 0.95 : 1) *
      this.BC.starInt * (1 - this.upSum('starInt')) * (this.hasSyn('spirit', 10) ? 0.95 : 1);
  }

  starInterval() {
    return (40 + this.rng() * 60) * (1 - 0.08 * this.perkLv('starlight')) * (this.hasSyn('dog', 25) ? 0.95 : 1) *
      this.BC.starInt * (1 - this.upSum('starInt')) * (this.hasSyn('spirit', 10) ? 0.95 : 1);
  }

  starRewardMul() {
    return this.BC.starBonus * this.upProd('starBon') * (1 + 0.2 * this.perkLv('starborn')) * (this.hasSyn('spirit', 25) ? 1.2 : 1);
  }

  offlineRate() {
    if (this.BC.offlineFull) return 1;
    return Math.min(1, 0.5 + 0.1 * this.perkLv('softtime') + this.BC.offlineAdd);
  }

  offlineCapHours() {
    return 8 + (this.hasSyn('cat', 25) ? 1 : 0) + (this.hasSyn('whale', 10) ? 2 : 0) + this.BC.offlineCap +
      2 * this.perkLv('deeproot') + (this.hasSyn('turtle', 10) ? 3 : 0);
  }

  offlineSynMul() {
    return (this.hasSyn('cat', 10) ? 1.1 : 1) * (this.hasSyn('whale', 100) ? 1.15 : 1);
  }

  levelNeed(L) {
    if (L <= 1) return 0;
    const reduct = (1 - 0.05 * this.perkLv('evoseed')) * this.BC.evoNeed * (this.hasSyn('turtle', 50) ? 0.95 : 1);
    return levelTable[Math.min(L, MAX_LEVEL)] * reduct;
  }

  currentLevelFor(total) {
    if (total < this.levelNeed(2)) return 1;
    let L = 2;
    while (L < MAX_LEVEL && total >= this.levelNeed(L + 1)) L++;
    return L;
  }

  stageForLevel(level) {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) if (level >= STAGES[i].atLevel) idx = i;
    return idx;
  }

  soulsGain() {
    const E = this.S.totalEarned;
    if (E < 6e7) return 0;
    const depth = Math.log10(E / 6e7);
    const base = Math.floor((1 + 3 * Math.pow(depth, 2.2)) * (this.hasSyn('planet', 5) ? 1.05 : 1));
    return base + this.BC.soulFlat;
  }

  computeBlessCache() {
    this.BC = defaultBc();
    for (const id of this.S.runBlessings) {
      const b = BLESSINGS.find(x => x.id === id);
      if (b) b.fx(this.BC);
    }
  }

  chooseBlessing() {
    if (!this.options.useBlessings) return null;
    const rarityBonus = 1 + this.perkLv('instinct') * 0.05 + Math.min(this.BC.luck, 30) * 0.01;
    const weighted = BLESSINGS.map(b => {
      let w = RARITY[b.rarity].w;
      if (b.rarity !== 'common') w *= rarityBonus;
      w *= this.strategyBlessingBias(b);
      if (!b.stack && this.S.runBlessings.includes(b.id)) w *= 0.05;
      return { b, w };
    });
    let r = this.rng() * weighted.reduce((sum, x) => sum + x.w, 0);
    for (const x of weighted) {
      r -= x.w;
      if (r <= 0) return x.b;
    }
    return weighted[0].b;
  }

  strategyBlessingBias(b) {
    const s = this.options.buyStrategy;
    const tag = b.tag;
    if (s === 'click' && tag === 'click') return 2.2;
    if (s === 'idle' && (tag === 'farm' || tag === 'dream')) return 1.9;
    if (s === 'star' && tag === 'star') return 2.5;
    if (s === 'prestige' && tag === 'meta') return 2.0;
    return 1;
  }

  grantBlessings(count) {
    if (!this.options.useBlessings) return;
    for (let i = 0; i < count; i++) {
      const b = this.chooseBlessing();
      if (!b) continue;
      if (b.stack || !this.S.runBlessings.includes(b.id)) {
        this.S.runBlessings.push(b.id);
        this.S.codex.blessings[b.id] = true;
        b.fx(this.BC);
      }
    }
  }

  earnCoins(gain, kind) {
    if (gain <= 0 || !Number.isFinite(gain)) return;
    this.S.coins += gain;
    this.S.totalEarned += gain;
    this.S.stats.lifetime.earned += gain;
    if (kind === 'click') this.S.stats.run.clickEarned += gain;
    else if (kind === 'idle') this.S.stats.run.idleEarned += gain;
    else if (kind === 'offline') this.S.stats.run.offlineEarned += gain;
    if (this.frenzyTimer > 0) this.frenzyEarned += gain;
  }

  updateLevel() {
    const newLevel = this.currentLevelFor(this.S.totalEarned);
    if (newLevel <= this.slimeLevel) return;
    const oldLevel = this.slimeLevel;
    const blessingSteps = [];
    for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
      if (lv % 3 === 0) blessingSteps.push(lv);
    }
    this.slimeLevel = newLevel;
    this.stageIdx = this.stageForLevel(this.slimeLevel);
    this.grantBlessings(blessingSteps.length);
  }

  checkMilestones() {
    if (!this.milestones.firstFriend && PRODUCERS.some(p => this.S.producers[p.id] > 0)) this.milestones.firstFriend = this.time / 60;
    if (!this.milestones.firstUpgrade && Object.keys(this.S.upgrades).length > 0) this.milestones.firstUpgrade = this.time / 60;
    const levelMarks = [
      ['firstEvolution', 5],
      ['strawberry', 10],
      ['goldenKing', 15],
      ['godSlime', 20],
    ];
    for (const [key, lv] of levelMarks) {
      if (!this.milestones[key] && this.slimeLevel >= lv) this.milestones[key] = this.time / 60;
    }
    if (!this.milestones.firstRebirthAvailable && this.S.totalEarned >= PRESTIGE_UNLOCK && this.soulsGain() >= 1) {
      this.milestones.firstRebirthAvailable = this.time / 60;
    }
  }

  updateCodexAndAchievements() {
    this.stageIdx = this.stageForLevel(this.slimeLevel);
    for (let i = 0; i <= this.stageIdx; i++) this.S.codex.stages[i] = true;
    for (const p of PRODUCERS) {
      const owned = this.S.producers[p.id];
      if (owned <= 0) continue;
      const entry = this.S.codex.friends[p.id] || { discovered: true, maxOwned: 0 };
      entry.maxOwned = Math.max(entry.maxOwned, owned);
      this.S.codex.friends[p.id] = entry;
    }
    if (this.stageIdx >= 0) this.S.story.origin = true;
    if (this.stageIdx >= 1) this.S.story.sea = true;
    if (this.stageIdx >= 2) this.S.story.berry = true;
    if (this.stageIdx >= 3) this.S.story.king = true;
    if (this.stageIdx >= 4) this.S.story.god = true;
    if (this.S.prestige.totalResets >= 1) this.S.story.seed = true;

    const totalFriends = PRODUCERS.reduce((sum, p) => sum + this.S.producers[p.id], 0);
    const conditions = {
      click1: this.S.totalClicks >= 1,
      click100: this.S.totalClicks >= 100,
      click1k: this.S.totalClicks >= 1000,
      click10k: this.S.totalClicks >= 10000,
      click50k: this.S.totalClicks >= 50000,
      click200k: this.S.totalClicks >= 200000,
      combo30: this.S.stats.lifetime.bestCombo >= 30,
      combo50: this.S.stats.lifetime.bestCombo >= 50,
      chick10: this.S.producers.chick >= 10,
      chick50: this.S.producers.chick >= 50,
      cat25: this.S.producers.cat >= 25,
      friend100: totalFriends >= 100,
      friend300: totalFriends >= 300,
      star1: this.S.stats.lifetime.starsClicked >= 1,
      star10: this.S.stats.lifetime.starsClicked >= 10,
      coin1e4: this.S.stats.lifetime.earned >= 1e4,
      coin1e6: this.S.stats.lifetime.earned >= 1e6,
      coin1e8: this.S.stats.lifetime.earned >= 1e8,
      coin1e10: this.S.stats.lifetime.earned >= 1e10,
      life1e12: this.S.stats.lifetime.earned >= 1e12,
      life1e15: this.S.stats.lifetime.earned >= 1e15,
      evo1: this.stageIdx >= 1,
      evoMax: this.stageIdx >= STAGES.length - 1,
      level25: this.slimeLevel >= 25,
      level30: this.slimeLevel >= 30,
      level40: this.slimeLevel >= 40,
      allUp: UPGRADES.every(u => this.S.upgrades[u.id]),
      rebirth1: this.S.prestige.totalResets >= 1,
      rebirth3: this.S.prestige.totalResets >= 3,
      reset5: this.S.prestige.totalResets >= 5,
      reset10: this.S.prestige.totalResets >= 10,
      legendB: this.S.runBlessings.some(id => (BLESSINGS.find(b => b.id === id) || {}).rarity === 'legendary'),
      bless20: this.S.runBlessings.length >= 20,
      wish25: this.S.wishes.completed >= 25,
      wish100: this.S.wishes.completed >= 100,
      cloud10: this.S.stats.lifetime.cloudsSoothed >= 10,
    };
    for (const id of Object.keys(conditions)) if (conditions[id]) this.S.achievements[id] = true;
  }

  starWeights() {
    return [30, 25, 20, 15 + (this.hasSyn('rabbit', 50) ? 5 : 0), 10];
  }

  runStarEvent() {
    const weights = this.starWeights();
    const total = weights.reduce((a, w) => a + w, 0);
    let r = this.rng() * total;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    if (idx === 0) {
      this.frenzyEarned = 0;
      this.frenzyTimer = this.frenzyDuration();
    } else if (idx === 1) {
      let bonus = Math.max(this.totalCps() * 90, this.clickPower() * 150, 50);
      if (this.hasSyn('dog', 50)) bonus *= 1.2;
      bonus *= this.starRewardMul();
      this.earnCoins(bonus, 'event');
    } else if (idx === 2) {
      this.partyTimer = this.partyDuration();
    } else if (idx === 3) {
      this.S.buffs.discount = true;
    } else {
      this.spawnMiniStars();
    }
    if (this.BC.twinStars && !this.twinFollow) {
      this.twinFollow = true;
      this.starTimer = 1.5;
    } else {
      this.twinFollow = false;
      this.starTimer = this.starInterval();
    }
  }

  spawnMiniStars() {
    const count = 5 + (this.hasSyn('rabbit', 10) ? 1 : 0) + this.BC.miniCount;
    for (let i = 0; i < count; i++) {
      let bonus = Math.max(this.totalCps() * 8, this.clickPower() * 15, 25);
      if (this.hasSyn('rabbit', 25)) bonus *= 1.3;
      if (this.hasSyn('dog', 50)) bonus *= 1.2;
      bonus *= this.starRewardMul();
      this.earnCoins(bonus, 'event');
      this.miniStarsClicked++;
    }
  }

  tickStars(dt) {
    if (!this.options.useGoldenStars) return;
    this.starTimer -= dt;
    if (this.starTimer > 0) return;
    this.goldenStarsClicked++;
    this.S.stats.run.starsClicked++;
    this.S.stats.lifetime.starsClicked++;
    this.runStarEvent();
    if (this.hasSyn('rabbit', 100) && this.rng() < 0.2) this.spawnMiniStars();
  }

  tickClicking(dt) {
    const active = this.rng() < this.options.activeRatio;
    if (!active) {
      if (!this.BC.comboEternal) this.comboTimer -= dt;
      if (this.comboTimer <= 0 && !this.BC.comboEternal) this.combo = 0;
      return;
    }
    const exactClicks = this.options.clicksPerSecond * dt;
    const clickCount = Math.floor(exactClicks) + (this.rng() < exactClicks % 1 ? 1 : 0);
    for (let i = 0; i < clickCount; i++) {
      let gain = this.clickPower() * this.comboMul() * this.frenzyMul();
      const perfectChance = (0.03 + this.BC.perfectAdd + this.upSum('perfAdd')) * (this.BC.perfectX2 ? 2 : 1);
      if (this.rng() < perfectChance) {
        gain *= this.BC.perfectPower;
        if (this.BC.perfectCombo) this.combo += this.BC.perfectCombo;
      }
      this.earnCoins(gain, 'click');
      this.S.totalClicks++;
      this.S.stats.run.clicks++;
      this.combo++;
      if (this.combo < this.BC.comboStart) this.combo = this.BC.comboStart;
      this.comboTimer = this.comboWindow();
      this.S.stats.run.bestCombo = Math.max(this.S.stats.run.bestCombo, this.combo);
      this.S.stats.lifetime.bestCombo = Math.max(this.S.stats.lifetime.bestCombo, this.combo);
    }
  }

  tickTimers(dt) {
    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
      if (this.frenzyTimer <= 0) {
        this.frenzyTimer = 0;
        if (this.hasSyn('dragon', 100) && this.frenzyEarned > 0) this.earnCoins(this.frenzyEarned * 0.1, 'event');
        this.frenzyEarned = 0;
      }
    }
    if (this.partyTimer > 0) this.partyTimer = Math.max(0, this.partyTimer - dt);
    if (this.hasSyn('chick', 100)) {
      if (this.festActive > 0) this.festActive = Math.max(0, this.festActive - dt);
      else {
        this.festWait -= dt;
        if (this.festWait <= 0) {
          this.festActive = 10;
          this.festWait = 60;
        }
      }
    }
  }

  expectedStarRate() {
    if (!this.options.useGoldenStars) return 0;
    const weights = this.starWeights();
    const totalW = weights.reduce((a, w) => a + w, 0);
    const cps = this.totalCps();
    const click = this.clickPower();
    const baseRate = cps + click * this.options.clicksPerSecond * this.options.activeRatio;
    let coinBonus = Math.max(cps * 90, click * 150, 50) * (this.hasSyn('dog', 50) ? 1.2 : 1) * this.starRewardMul();
    const miniCount = 5 + (this.hasSyn('rabbit', 10) ? 1 : 0) + this.BC.miniCount;
    let miniBonus = Math.max(cps * 8, click * 15, 25) * (this.hasSyn('rabbit', 25) ? 1.3 : 1) *
      (this.hasSyn('dog', 50) ? 1.2 : 1) * this.starRewardMul() * miniCount;
    const frenzyBonus = baseRate * (this.frenzyMulForExpected() - 1) * this.frenzyDuration();
    const partyBonus = cps * 4 * this.partyDuration();
    const expected = (weights[0] * frenzyBonus + weights[1] * coinBonus + weights[2] * partyBonus + weights[4] * miniBonus) / totalW;
    return expected / Math.max(5, this.starIntervalMean());
  }

  neutralRate() {
    return this.totalCps() + this.clickPower() * this.options.clicksPerSecond * this.options.activeRatio * 1.5 + this.expectedStarRate();
  }

  withTemporaryChange(apply, measure) {
    const snapshot = clone({
      S: this.S,
      BC: this.BC,
      combo: this.combo,
      slimeLevel: this.slimeLevel,
      frenzyTimer: this.frenzyTimer,
      partyTimer: this.partyTimer,
      festActive: this.festActive,
    });
    apply();
    this.computeBlessCache();
    const value = measure();
    this.S = snapshot.S;
    this.BC = snapshot.BC;
    this.combo = snapshot.combo;
    this.slimeLevel = snapshot.slimeLevel;
    this.frenzyTimer = snapshot.frenzyTimer;
    this.partyTimer = snapshot.partyTimer;
    this.festActive = snapshot.festActive;
    return value;
  }

  strategyBias(kind, id) {
    const s = this.options.buyStrategy;
    const producerBias = {
      click: { chick: 1.8, dragon: 1.25, dog: 1.1 },
      idle: { cat: 1.45, whale: 1.45, planet: 1.1, turtle: 1.15, chick: 0.75 },
      star: { dog: 1.8, rabbit: 1.8, spirit: 1.5, dragon: 1.15 },
      prestige: { planet: 1.7, spirit: 1.35, turtle: 1.2, whale: 1.25, dragon: 1.1 },
      balanced: {},
    }[s] || {};
    const upgradeBias = {
      click: { glove1: 1.6, glove2: 1.6, glove3: 1.55, glove4: 1.5, glove5: 1.4, hand1: 1.7, hand2: 1.7, hand3: 1.7, hand4: 1.6, hand5: 1.5, click1: 1.4, click2: 1.4, click3: 1.35 },
      idle: { snack1: 1.7, snack2: 1.7, snack3: 1.7, snack4: 1.6, snack5: 1.6, snack6: 1.6, gold1: 1.2, gold2: 1.2 },
      star: { star1u: 1.8, star2u: 1.8, click1: 1.15, click2: 1.15 },
      prestige: { snack1: 1.35, snack2: 1.35, snack3: 1.35, snack4: 1.3, snack5: 1.3, click1: 1.15, click2: 1.15, gold1: 1.4, gold2: 1.4 },
      balanced: {},
    }[s] || {};
    const decorBias = {
      click: { cushion: 1.4, fountain: 1.4 },
      idle: { pond: 1.35, mat: 1.35, window: 1.35 },
      star: { lamp: 2.2 },
      prestige: { pond: 1.2, mat: 1.2, window: 1.2 },
      balanced: {},
    }[s] || {};
    if (kind === 'producer') return producerBias[id] || 1;
    if (kind === 'upgrade') return upgradeBias[id] || 1;
    if (kind === 'decor') return decorBias[id] || 1;
    return 1;
  }

  buyAffordableThings() {
    for (let guard = 0; guard < 120; guard++) {
      const candidates = [];
      const before = this.neutralRate();
      const discount = this.S.buffs.discount ? 0.5 : 1;
      for (const p of PRODUCERS) {
        const cost = this.producerCost(p) * discount;
        if (this.S.coins < cost) continue;
        const after = this.withTemporaryChange(() => { this.S.producers[p.id] += 1; }, () => this.neutralRate());
        const score = ((after - before) / cost) * this.strategyBias('producer', p.id);
        candidates.push({ kind: 'producer', id: p.id, cost, score });
      }
      for (const u of UPGRADES) {
        if (this.S.upgrades[u.id]) continue;
        const cost = u.cost * discount * this.BC.upDisc;
        if (this.S.coins < cost) continue;
        const after = this.withTemporaryChange(() => { this.S.upgrades[u.id] = true; }, () => this.neutralRate());
        const score = ((after - before) / cost) * this.strategyBias('upgrade', u.id);
        candidates.push({ kind: 'upgrade', id: u.id, cost, score });
      }
      if (this.options.useDecor) {
        for (const d of DECOR) {
          if (this.S.decor[d.id] || this.S.coins < d.cost) continue;
          const after = this.withTemporaryChange(() => { this.S.decor[d.id] = true; }, () => this.neutralRate());
          const score = ((after - before) / d.cost) * this.strategyBias('decor', d.id);
          candidates.push({ kind: 'decor', id: d.id, cost: d.cost, score });
        }
      }
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      if (!best || best.score <= 0) break;
      this.S.coins -= best.cost;
      if (best.kind === 'producer') this.S.producers[best.id] += 1;
      if (best.kind === 'upgrade') this.S.upgrades[best.id] = true;
      if (best.kind === 'decor') this.S.decor[best.id] = true;
      if (best.kind !== 'decor') this.consumeDiscount();
      this.updateCodexAndAchievements();
      this.checkMilestones();
    }
  }

  consumeDiscount() {
    if (this.S.buffs.discount) this.S.buffs.discount = false;
  }

  buyPrestigePerks() {
    if (!this.options.usePerks) return;
    const orderByStrategy = {
      balanced: ['promise', 'sticky', 'combo', 'starlight', 'evoseed', 'softtime', 'instinct', 'soulfire', 'starborn'],
      click: ['sticky', 'combo', 'promise', 'instinct', 'starlight', 'evoseed', 'soulfire'],
      idle: ['promise', 'softtime', 'evoseed', 'deeproot', 'starlight', 'sticky', 'soulfire'],
      star: ['starlight', 'starborn', 'promise', 'instinct', 'sticky', 'combo', 'soulfire'],
      prestige: ['promise', 'evoseed', 'soulfire', 'instinct', 'starlight', 'sticky', 'starborn'],
    }[this.options.buyStrategy] || [];
    let bought = true;
    while (bought) {
      bought = false;
      for (const id of orderByStrategy) {
        const perk = PERKS.find(p => p.id === id);
        const lv = this.perkLv(id);
        const cost = this.perkCost(id);
        if (perk && lv < perk.max && this.S.prestige.souls >= cost) {
          this.S.prestige.souls -= cost;
          this.S.prestige.perks[id] = lv + 1;
          bought = true;
        }
      }
    }
    this.computeBlessCache();
  }

  maybePrestige() {
    if (!this.options.autoPrestige || this.S.totalEarned < PRESTIGE_UNLOCK || this.soulsGain() < 1) return;
    const gain = this.soulsGain();
    this.S.prestige.souls += gain;
    this.S.prestige.totalSoulsEarned += gain;
    this.S.prestige.totalResets++;
    this.rebirths++;
    this.rebirthTimes.push(this.time / 60);
    this.S.achievements.rebirth1 = true;
    if (this.S.prestige.totalResets >= 3) this.S.achievements.rebirth3 = true;
    this.S.coins = 0;
    this.S.totalEarned = 0;
    this.S.producers = Object.fromEntries(PRODUCERS.map(p => [p.id, 0]));
    this.S.upgrades = {};
    this.S.buffs.discount = false;
    this.S.stats.run = defaultState().stats.run;
    this.S.runBlessings = [];
    this.combo = 0;
    this.comboTimer = 0;
    this.frenzyTimer = 0;
    this.partyTimer = 0;
    this.frenzyEarned = 0;
    this.festActive = 0;
    this.festWait = 60;
    this.starTimer = this.starInterval();
    this.buyPrestigePerks();
    this.computeBlessCache();
    let startLevel = 1;
    if (this.options.useDeepStart) startLevel = Math.min(1 + Math.floor(this.S.prestige.totalResets * 1.5), 15);
    if (startLevel > 1) {
      this.S.totalEarned = this.levelNeed(startLevel);
      this.slimeLevel = startLevel;
      if (this.options.useStartBlessings) this.grantBlessings(Math.ceil((startLevel - 1) / 3));
    } else {
      this.slimeLevel = 1;
    }
    this.stageIdx = this.stageForLevel(this.slimeLevel);
    this.S.story.seed = true;
    this.updateCodexAndAchievements();
  }

  step(dt = 1) {
    this.time += dt;
    const idleIncome = this.totalCps() * this.frenzyMul() * this.partyMul() * dt;
    this.earnCoins(idleIncome, 'idle');
    this.tickClicking(dt);
    this.tickTimers(dt);
    this.tickStars(dt);
    this.updateLevel();
    this.updateCodexAndAchievements();
    this.checkMilestones();
    this.buyAffordableThings();
    this.maybePrestige();
  }

  simulate(minutes = this.options.minutes) {
    const steps = Math.ceil(minutes * 60);
    for (let i = 0; i < steps; i++) this.step(1);
    return this.result(minutes);
  }

  unlockedSynergies() {
    const out = [];
    for (const p of PRODUCERS) {
      for (const at of SYNERGY_THRESHOLDS[p.id] || []) {
        if (this.S.producers[p.id] >= at) out.push(`${p.id}:${at}`);
      }
    }
    return out;
  }

  snapshot() {
    return {
      saveVersion: SAVE_VERSION,
      coins: this.S.coins,
      totalEarned: this.S.totalEarned,
      totalCps: this.totalCps(),
      clickPower: this.clickPower(),
      currentLevel: this.slimeLevel,
      currentStage: STAGES[this.stageForLevel(this.slimeLevel)].name,
      currentTrait: this.currentTrait?.name || null,
      achievementCount: this.achCount(),
      achievementMultiplier: 1 + this.achCount() * 0.01,
      prestigeSouls: this.S.prestige.souls,
      prestigeTotalSoulsEarned: this.S.prestige.totalSoulsEarned,
      soulMultiplier: this.soulMul(),
      perkLevels: clone(this.S.prestige.perks),
      blessingCount: this.S.runBlessings.length,
      blessingIds: clone(this.S.runBlessings),
      decorOwnedCount: Object.keys(this.S.decor).length,
      decorBonusBreakdown: {
        amp: this.decorAmp(),
        click: this.decorClickMul(),
        cps: this.decorCpsMul(),
        starLinger: this.starLinger(),
      },
      producerCounts: clone(this.S.producers),
      unlockedSynergies: this.unlockedSynergies(),
      cpsMultiplierBreakdown: {
        global: this.globalMul(),
        achievement: 1 + this.achCount() * 0.01,
        soul: this.soulMul(),
        decor: this.decorCpsMul(),
        planet: this.planetMul(),
        whale50: this.hasSyn('whale', 50) ? 1.1 : 1,
        planet25: this.hasSyn('planet', 25) ? 1.1 : 1,
        frenzy: this.frenzyMul(),
        party: this.partyMul(),
      },
      clickMultiplierBreakdown: {
        global: this.globalMul(),
        achievement: 1 + this.achCount() * 0.01,
        soul: this.soulMul(),
        decor: this.decorClickMul(),
        combo: this.comboMul(),
        synergy: this.clickSynMul(),
        frenzy: this.frenzyMul(),
      },
      goldenStarIntervalMean: this.starIntervalMean(),
      goldenStarLingerDuration: this.starLinger(),
      frenzyMultiplier: this.frenzyMulForExpected(),
      frenzyDuration: this.frenzyDuration(),
      partyMultiplier: 5,
      partyDuration: this.partyDuration(),
      offlineRewardRate: this.offlineRate(),
      offlineMaxHours: this.offlineCapHours(),
      offlineSynergyMultiplier: this.offlineSynMul(),
      soulsGain: this.soulsGain(),
      firstRebirthAvailability: this.S.totalEarned >= PRESTIGE_UNLOCK && this.soulsGain() >= 1,
      prestigeUnlock: PRESTIGE_UNLOCK,
    };
  }

  result(minutes) {
    const rebirthIntervals = this.rebirthTimes.map((time, i) => i === 0 ? time : time - this.rebirthTimes[i - 1]);
    return {
      strategy: this.options.buyStrategy,
      minutes,
      reachedFirstRebirth: !!this.milestones.firstRebirthAvailable || this.rebirthTimes.length > 0,
      timeToFirstRebirth: this.rebirthTimes[0] ?? this.milestones.firstRebirthAvailable ?? null,
      secondRebirthTime: this.rebirthTimes[1] ?? null,
      thirdRebirthTime: this.rebirthTimes[2] ?? null,
      totalEarned: this.S.totalEarned,
      coins: this.S.coins,
      stageName: STAGES[this.stageForLevel(this.slimeLevel)].name,
      level: this.slimeLevel,
      estimatedSoulsGain: this.soulsGain(),
      totalCps: this.totalCps(),
      clickPower: this.clickPower(),
      achievementsUnlocked: this.achCount(),
      producers: clone(this.S.producers),
      upgradesPurchased: Object.keys(this.S.upgrades).length,
      decorPurchased: Object.keys(this.S.decor).length,
      synergiesUnlocked: this.unlockedSynergies(),
      goldenStarsClicked: this.goldenStarsClicked,
      miniStarsClicked: this.miniStarsClicked,
      rebirths: this.rebirths,
      rebirthTimes: clone(this.rebirthTimes),
      rebirthIntervals,
      milestones: clone(this.milestones),
      snapshot: this.snapshot(),
      notes: clone(this.notes),
    };
  }
}

function resetToFreshStateForSimulation() {
  return defaultState();
}

function snapshot(options = {}) {
  return new BalanceSim(options).snapshot();
}

function simulateRun(options = {}) {
  const sim = new BalanceSim(options);
  return sim.simulate(options.minutes ?? 240);
}

function simulateStrategies(options = {}) {
  return Object.keys(STRATEGY_DEFAULTS).map((strategy, i) =>
    simulateRun({ ...options, buyStrategy: strategy, seed: (options.seed ?? 123) + i }));
}

function compareRiskScenarios(options = {}) {
  const baseOptions = { minutes: options.minutes ?? 240, autoPrestige: true, seed: options.seed ?? 123 };
  const variants = [
    ['baseline', {}],
    ['no_deep_start', { useDeepStart: false }],
    ['no_start_blessings', { useStartBlessings: false }],
    ['no_golden_stars', { useGoldenStars: false }],
    ['no_blessings', { useBlessings: false }],
  ];
  return Object.fromEntries(variants.map(([name, extra]) => [name, simulateStrategies({ ...baseOptions, ...extra })]));
}

function bonusStackAnalysis(totalSoulsEarned = 20) {
  const sim = new BalanceSim();
  sim.S.prestige.totalSoulsEarned = totalSoulsEarned;
  for (const p of PRODUCERS) sim.S.producers[p.id] = p.id === 'planet' ? 50 : 100;
  for (const u of UPGRADES) sim.S.upgrades[u.id] = true;
  for (const d of DECOR) sim.S.decor[d.id] = true;
  for (const id of ['sparkfinger', 'quietrich', 'starcrumb', 'frenzyking', 'doublestar', 'jackpot', 'comboheart']) sim.S.runBlessings.push(id);
  sim.computeBlessCache();
  sim.slimeLevel = 25;
  sim.combo = 80;
  sim.frenzyTimer = sim.frenzyDuration();
  sim.partyTimer = sim.partyDuration();
  sim.festActive = 10;
  sim.updateCodexAndAchievements();
  return [
    { combo: '광란 x 친구 파티', multiplier: sim.frenzyMul() * sim.partyMul(), note: '자동 생산 순간 배율' },
    { combo: '광란 x 드래곤50 x 콤보 x 병아리100', multiplier: sim.frenzyMul() * 1.25 * sim.comboMul() * 2, note: '클릭 순간 배율 핵심' },
    { combo: '총 획득 영혼 20개 x 업적', multiplier: sim.soulMul() * (1 + sim.achCount() * 0.01), note: '영구 전체 수입' },
    { combo: '코인 행성 50 x 행성25 시너지', multiplier: sim.planetMul() * 1.1, note: 'CPS 전용, 25 이후 소프트캡' },
    { combo: '장식 전체 x 유니콘10 x 행성10', multiplier: Math.max(sim.decorClickMul(), sim.decorCpsMul()), note: '장식 보너스 최대치' },
    { combo: '별 보상 축복/강화/특성 묶음', multiplier: sim.starRewardMul(), note: '황금별 코인/미니별 보상' },
  ].sort((a, b) => b.multiplier - a.multiplier);
}

function markdownReport(results, scenario = null) {
  const now = new Date().toISOString().slice(0, 10);
  const rows = results.map(r => `| ${r.strategy} | ${minutesText(r.rebirthIntervals[0])} | ${minutesText(r.rebirthIntervals[1])} | ${minutesText(r.rebirthIntervals[2])} | ${fmt(r.totalEarned)} | ${fmt(r.totalCps)} | ${fmt(r.clickPower)} | ${r.snapshot.blessingCount} | ${r.goldenStarsClicked} |`);
  const balanced = results.find(r => r.strategy === 'balanced') || results[0];
  const stacks = bonusStackAnalysis().map(x => `| ${x.combo} | x${x.multiplier.toFixed(2)} | ${x.note} |`).join('\n');
  let scenarioBlock = '';
  if (scenario) {
    const toRow = ([name, set]) => {
      const r = set.find(x => x.strategy === 'balanced') || set[0];
      return `| ${name} | ${minutesText(r.rebirthIntervals[0])} | ${minutesText(r.rebirthIntervals[1])} | ${minutesText(r.rebirthIntervals[2])} | ${r.snapshot.blessingCount} | ${r.goldenStarsClicked} |`;
    };
    scenarioBlock = `
## 위험 지점 분리 실험 (balanced)
| 시나리오 | 첫 환생 | 2회차 | 3회차 | 종료 축복 | 황금별 |
| --- | ---: | ---: | ---: | ---: | ---: |
${Object.entries(scenario).map(toRow).join('\n')}
`;
  }
  return `# Balance Report

## 측정 기준
- 날짜: ${now}
- 모델: v10 근사 시뮬레이터, \`SAVE_VERSION=${SAVE_VERSION}\`, \`PRESTIGE_UNLOCK=${fmt(PRESTIGE_UNLOCK)}\`
- 반영: 로그 영혼 공식, 레벨 곡선, 3레벨당 축복, 깊은 층 시작/시작 축복, 10종 친구, 25종 강화, 10종 특성, 황금별/미니별/광란/파티
- 주의: 브라우저의 실제 난수/클릭 리듬/플레이어 판단을 완벽히 재현하지 않는 ROI 기반 근사 모델

## 전략별 결과
| 전략 | 첫 환생 | 2회차 소요 | 3회차 소요 | 종료 이번 생 획득 | 종료 CPS | 종료 클릭 | 종료 축복 | 황금별 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## 구간 도달 시간 (balanced)
| 구간 | 시간 |
| --- | ---: |
| 첫 친구 | ${minutesText(balanced.milestones.firstFriend)} |
| 첫 업그레이드 | ${minutesText(balanced.milestones.firstUpgrade)} |
| 첫 진화 | ${minutesText(balanced.milestones.firstEvolution)} |
| 딸기 슬라임 | ${minutesText(balanced.milestones.strawberry)} |
| 황금 킹 슬라임 | ${minutesText(balanced.milestones.goldenKing)} |
| 갓 슬라임 | ${minutesText(balanced.milestones.godSlime)} |
| 첫 환생 가능 | ${minutesText(balanced.milestones.firstRebirthAvailable)} |

## 가장 강한 보너스 조합 Top
| 조합 | 배율 | 메모 |
| --- | ---: | --- |
${stacks}
${scenarioBlock}`;
}

function printCli() {
  const args = new Set(process.argv.slice(2));
  const minutes = Number(process.env.MINUTES || 240);
  const seed = Number(process.env.SEED || 123);
  const results = simulateStrategies({ minutes, autoPrestige: true, seed });
  const scenarios = args.has('--scenarios') ? compareRiskScenarios({ minutes, seed }) : null;
  if (args.has('--json')) {
    console.log(JSON.stringify({ results, scenarios, stacks: bonusStackAnalysis(), snapshot: snapshot() }, null, 2));
    return;
  }
  if (args.has('--markdown')) {
    console.log(markdownReport(results, scenarios));
    return;
  }
  console.log(`Balance simulation v10 (${minutes} minutes, autoPrestige=true, seed=${seed})`);
  console.table(results.map(r => ({
    strategy: r.strategy,
    firstRebirth: minutesText(r.rebirthIntervals[0]),
    secondLife: minutesText(r.rebirthIntervals[1]),
    thirdLife: minutesText(r.rebirthIntervals[2]),
    totalEarned: fmt(r.totalEarned),
    cps: fmt(r.totalCps),
    click: fmt(r.clickPower),
    level: r.level,
    blessings: r.snapshot.blessingCount,
    stars: r.goldenStarsClicked,
  })));
  console.log('\nBalanced milestones:', Object.fromEntries(Object.entries(results[0].milestones).map(([k, v]) => [k, minutesText(v)])));
  if (scenarios) {
    console.log('\nRisk scenarios (balanced):');
    console.table(Object.entries(scenarios).map(([name, set]) => {
      const r = set.find(x => x.strategy === 'balanced') || set[0];
      return {
        scenario: name,
        first: minutesText(r.rebirthIntervals[0]),
        second: minutesText(r.rebirthIntervals[1]),
        third: minutesText(r.rebirthIntervals[2]),
        blessings: r.snapshot.blessingCount,
        stars: r.goldenStarsClicked,
      };
    }));
  }
  console.log('\nTop bonus stacks:');
  console.table(bonusStackAnalysis().map(x => ({ combo: x.combo, multiplier: `x${x.multiplier.toFixed(2)}`, note: x.note })));
}

const cliPath = process.argv[1] ? process.argv[1].replaceAll('\\', '/') : '';
if (import.meta.url === `file://${cliPath}` || process.argv[1]?.endsWith('balance-sim.mjs')) {
  printCli();
}

export {
  BalanceSim,
  snapshot,
  simulateRun,
  simulateStrategies,
  compareRiskScenarios,
  resetToFreshStateForSimulation,
  bonusStackAnalysis,
  markdownReport,
};
