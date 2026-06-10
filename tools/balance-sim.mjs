#!/usr/bin/env node
'use strict';

const SAVE_VERSION = 5;
const PRESTIGE_UNLOCK = 1e9;

const PRODUCERS = [
  { id: 'chick', name: '병아리', baseCost: 15, cps: 0.1 },
  { id: 'cat', name: '고양이', baseCost: 100, cps: 1 },
  { id: 'dog', name: '강아지', baseCost: 1100, cps: 8 },
  { id: 'rabbit', name: '로켓 토끼', baseCost: 12000, cps: 47 },
  { id: 'unicorn', name: '유니콘', baseCost: 130000, cps: 260 },
  { id: 'dragon', name: '아기 드래곤', baseCost: 1.4e6, cps: 1400 },
  { id: 'whale', name: '우주 고래', baseCost: 1.8e7, cps: 7800 },
  { id: 'planet', name: '코인 행성', baseCost: 2.8e8, cps: 44000 },
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
];

const STAGES = [
  { name: '아기 초록 슬라임', need: 0 },
  { name: '바다 슬라임', need: 10000 },
  { name: '딸기 슬라임', need: 1e6 },
  { name: '황금 킹 슬라임', need: 1e8 },
  { name: '전설의 갓 슬라임', need: 1e10 },
];

const PERKS = [
  { id: 'sticky', name: '끈적한 기억', max: 10 },
  { id: 'promise', name: '친구의 약속', max: 10 },
  { id: 'starlight', name: '별빛 친화', max: 5 },
  { id: 'softtime', name: '말랑한 시간', max: 5 },
  { id: 'combo', name: '콤보 본능', max: 5 },
  { id: 'evoseed', name: '진화의 씨앗', max: 5 },
];

const DECOR = [
  { id: 'cushion', name: '젤리 쿠션', cost: 5e4, boost: { click: 0.02 } },
  { id: 'pond', name: '작은 연못', cost: 5e5, boost: { cps: 0.02 } },
  { id: 'lamp', name: '별빛 램프', cost: 5e6, boost: { star: 3 } },
  { id: 'mat', name: '낮잠 매트', cost: 5e7, boost: { cps: 0.03 } },
  { id: 'fountain', name: '코인 분수', cost: 5e8, boost: { click: 0.05 } },
  { id: 'window', name: '우주 창문', cost: 1e10, boost: { cps: 0.05 } },
];

const SYNERGY_THRESHOLDS = {
  chick: [10, 25, 50, 100],
  cat: [10, 25, 50, 100],
  dog: [10, 25, 50, 100],
  rabbit: [10, 25, 50, 100],
  unicorn: [10, 25, 50, 100],
  dragon: [10, 25, 50, 100],
  whale: [10, 25, 50, 100],
  planet: [1, 5, 10, 25],
};

const ACHIEVEMENTS = [
  'click1', 'click100', 'click1k', 'click10k', 'combo30', 'combo50',
  'chick10', 'chick50', 'cat25', 'friend100', 'star1', 'star10',
  'coin1e4', 'coin1e6', 'coin1e8', 'coin1e10', 'evo1', 'evoMax',
  'allUp', 'rebirth1', 'rebirth3',
];

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

function defaultState() {
  const producers = Object.fromEntries(PRODUCERS.map(p => [p.id, 0]));
  return {
    version: SAVE_VERSION,
    coins: 0,
    totalEarned: 0,
    totalClicks: 0,
    producers,
    upgrades: {},
    achievements: {},
    stats: {
      lifetime: { bestCombo: 0, starsClicked: 0, earned: 0 },
      run: { clicks: 0, bestCombo: 0, starsClicked: 0, clickEarned: 0, idleEarned: 0, offlineEarned: 0 },
    },
    buffs: { discount: false },
    prestige: { souls: 0, totalSoulsEarned: 0, totalResets: 0, perks: {} },
    decor: {},
    story: {},
    codex: { stages: {}, traits: {}, friends: {} },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fmt(n) {
  if (!Number.isFinite(n)) return '∞';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(n >= 100 ? 0 : 2);
}

function minutesText(minutes) {
  if (minutes == null) return '미도달';
  return `${minutes.toFixed(1)}분`;
}

class BalanceSim {
  constructor(options = {}) {
    const strategy = options.buyStrategy || options.strategy || 'balanced';
    this.options = { ...STRATEGY_DEFAULTS[strategy], ...options, buyStrategy: strategy };
    this.rng = mulberry32(this.options.seed ?? 123);
    this.S = options.initialState ? clone(options.initialState) : defaultState();
    this.combo = 0;
    this.comboTimer = 0;
    this.frenzyTimer = 0;
    this.frenzyEarned = 0;
    this.partyTimer = 0;
    this.festActive = 0;
    this.festWait = 60;
    this.time = 0;
    this.stageIdx = this.currentStageFor(this.S.totalEarned);
    this.currentTrait = null;
    this.starTimer = 20 + this.rng() * 40;
    this.milestones = {};
    this.goldenStarsClicked = 0;
    this.miniStarsClicked = 0;
    this.rebirthTimes = [];
    this.rebirths = 0;
    this.purchasedDecor = 0;
    this.notes = [];
  }

  producerCost(p, owned = this.S.producers[p.id]) {
    return Math.ceil(p.baseCost * Math.pow(1.15, owned));
  }

  perkLv(id) {
    return this.S.prestige.perks[id] || 0;
  }

  hasSyn(id, n) {
    return this.S.producers[id] >= n;
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

  planetMul() {
    const n = this.S.producers.planet;
    return 1 + 0.01 * Math.min(n, 25) + 0.002 * Math.max(0, n - 25);
  }

  soulMul() {
    return 1 + this.S.prestige.totalSoulsEarned * 0.05;
  }

  globalMul() {
    const codexBonus = this.hasSyn('unicorn', 50) ? 1 + 0.005 * this.codexEntryCount() : 1;
    return (1 + this.achCount() * 0.01) * this.soulMul() * codexBonus;
  }

  comboWindow() {
    return 0.9 + 0.15 * this.perkLv('combo');
  }

  comboMul() {
    const amp = this.hasSyn('chick', 25) ? 1.1 : 1;
    return 1 + Math.min(this.combo, 50) * 0.02 * amp;
  }

  clickSynMul() {
    let m = 1;
    if (this.hasSyn('chick', 10)) m *= 1.05;
    if (this.hasSyn('chick', 50) && this.combo >= 30) m *= 1.2;
    if (this.hasSyn('dragon', 50) && this.frenzyTimer > 0) m *= 1.25;
    if (this.festActive > 0) m *= 2;
    return m;
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
    return add * mul * this.globalMul() * sticky * this.decorClickMul() * this.clickSynMul() +
      this.totalCps() * cpsPart;
  }

  cpsMulFactor() {
    let mul = 1;
    for (const u of UPGRADES) {
      if (this.S.upgrades[u.id] && u.type === 'cpsMul') mul *= u.value;
    }
    return mul * this.globalMul() * (1 + 0.2 * this.perkLv('promise')) * this.decorCpsMul()
      * this.planetMul()
      * (this.hasSyn('whale', 50) ? 1.1 : 1)
      * (this.hasSyn('planet', 25) ? 1.1 : 1);
  }

  totalCps() {
    let base = 0;
    for (const p of PRODUCERS) base += p.cps * this.S.producers[p.id];
    return base * this.cpsMulFactor();
  }

  frenzyMul() {
    return this.frenzyTimer > 0 ? (this.hasSyn('dragon', 25) ? 8 : 7) : 1;
  }

  partyMul() {
    return this.partyTimer > 0 ? 5 : 1;
  }

  frenzyDuration() {
    return 20 + (this.hasSyn('dragon', 10) ? 2 : 0);
  }

  partyDuration() {
    return 30 + (this.hasSyn('whale', 25) ? 5 : 0);
  }

  starLinger() {
    let bonus = 0;
    for (const d of DECOR) if (this.S.decor[d.id] && d.boost.star) bonus += d.boost.star;
    return 10 + bonus * this.decorAmp() + (this.hasSyn('dog', 10) ? 1 : 0);
  }

  starIntervalMean() {
    return 70 * (1 - 0.08 * this.perkLv('starlight')) * (this.hasSyn('dog', 25) ? 0.95 : 1);
  }

  starInterval() {
    return (40 + this.rng() * 60) * (1 - 0.08 * this.perkLv('starlight')) * (this.hasSyn('dog', 25) ? 0.95 : 1);
  }

  offlineRate() {
    return Math.min(1, 0.5 + 0.1 * this.perkLv('softtime'));
  }

  offlineCapHours() {
    return 8 + (this.hasSyn('cat', 25) ? 1 : 0) + (this.hasSyn('whale', 10) ? 2 : 0);
  }

  offlineSynMul() {
    return (this.hasSyn('cat', 10) ? 1.1 : 1) * (this.hasSyn('whale', 100) ? 1.15 : 1);
  }

  soulsGain() {
    return Math.floor(Math.sqrt(this.S.totalEarned / 6e7) * (this.hasSyn('planet', 5) ? 1.05 : 1));
  }

  effNeed(i) {
    return STAGES[i].need * (1 - 0.05 * this.perkLv('evoseed'));
  }

  currentStageFor(total) {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) if (total >= this.effNeed(i)) idx = i;
    return idx;
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

  checkMilestones() {
    if (!this.milestones.firstFriend && PRODUCERS.some(p => this.S.producers[p.id] > 0)) {
      this.milestones.firstFriend = this.time / 60;
    }
    if (!this.milestones.firstUpgrade && Object.keys(this.S.upgrades).length > 0) {
      this.milestones.firstUpgrade = this.time / 60;
    }
    for (let i = 1; i < STAGES.length; i++) {
      const key = ['firstEvolution', 'strawberry', 'goldenKing', 'godSlime'][i - 1];
      if (!this.milestones[key] && this.S.totalEarned >= this.effNeed(i)) {
        this.milestones[key] = this.time / 60;
      }
    }
    if (!this.milestones.firstRebirthAvailable && this.S.totalEarned >= PRESTIGE_UNLOCK && this.soulsGain() >= 1) {
      this.milestones.firstRebirthAvailable = this.time / 60;
    }
  }

  updateCodexAndAchievements() {
    this.stageIdx = this.currentStageFor(this.S.totalEarned);
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
      combo30: this.S.stats.lifetime.bestCombo >= 30,
      combo50: this.S.stats.lifetime.bestCombo >= 50,
      chick10: this.S.producers.chick >= 10,
      chick50: this.S.producers.chick >= 50,
      cat25: this.S.producers.cat >= 25,
      friend100: totalFriends >= 100,
      star1: this.S.stats.lifetime.starsClicked >= 1,
      star10: this.S.stats.lifetime.starsClicked >= 10,
      coin1e4: this.S.stats.lifetime.earned >= 1e4,
      coin1e6: this.S.stats.lifetime.earned >= 1e6,
      coin1e8: this.S.stats.lifetime.earned >= 1e8,
      coin1e10: this.S.stats.lifetime.earned >= 1e10,
      evo1: this.stageIdx >= 1,
      evoMax: this.stageIdx >= STAGES.length - 1,
      allUp: UPGRADES.every(u => this.S.upgrades[u.id]),
      rebirth1: this.S.prestige.totalResets >= 1,
      rebirth3: this.S.prestige.totalResets >= 3,
    };
    for (const id of ACHIEVEMENTS) if (conditions[id]) this.S.achievements[id] = true;
  }

  expectedStarRate() {
    if (!this.options.useGoldenStars) return 0;
    const weights = this.starWeights();
    const totalW = weights.reduce((a, w) => a + w, 0);
    const cps = this.totalCps();
    const click = this.clickPower();
    const baseRate = cps + click * this.options.clicksPerSecond * this.options.activeRatio;
    const coinBonus = Math.max(cps * 90, click * 150, 50) * (this.hasSyn('dog', 50) ? 1.2 : 1);
    const miniCount = 5 + (this.hasSyn('rabbit', 10) ? 1 : 0);
    const miniBonus = Math.max(cps * 8, click * 15, 25) *
      (this.hasSyn('rabbit', 25) ? 1.3 : 1) * (this.hasSyn('dog', 50) ? 1.2 : 1) * miniCount;
    const frenzyBonus = baseRate * (this.frenzyMulForExpected() - 1) * this.frenzyDuration();
    const partyBonus = cps * (5 - 1) * this.partyDuration();
    const expected = (weights[0] * frenzyBonus + weights[1] * coinBonus + weights[2] * partyBonus + weights[4] * miniBonus) / totalW;
    return expected / this.starIntervalMean();
  }

  frenzyMulForExpected() {
    return this.hasSyn('dragon', 25) ? 8 : 7;
  }

  starWeights() {
    return [30, 25, 20, 15 + (this.hasSyn('rabbit', 50) ? 5 : 0), 10];
  }

  neutralRate() {
    return this.totalCps() + this.clickPower() * this.options.clicksPerSecond * this.options.activeRatio * 1.5 +
      this.expectedStarRate();
  }

  withTemporaryChange(apply, measure) {
    const snapshot = clone({
      S: this.S,
      combo: this.combo,
      frenzyTimer: this.frenzyTimer,
      partyTimer: this.partyTimer,
      festActive: this.festActive,
    });
    apply();
    const value = measure();
    this.S = snapshot.S;
    this.combo = snapshot.combo;
    this.frenzyTimer = snapshot.frenzyTimer;
    this.partyTimer = snapshot.partyTimer;
    this.festActive = snapshot.festActive;
    return value;
  }

  strategyBias(kind, id) {
    const s = this.options.buyStrategy;
    const producerBias = {
      click: { chick: 1.8, dragon: 1.25, dog: 1.1 },
      idle: { cat: 1.45, whale: 1.45, planet: 1.1, chick: 0.75 },
      star: { dog: 1.8, rabbit: 1.8, dragon: 1.15 },
      prestige: { planet: 1.7, whale: 1.25, dragon: 1.1 },
      balanced: {},
    }[s] || {};
    const upgradeBias = {
      click: { glove1: 1.6, glove2: 1.6, glove3: 1.55, hand1: 1.7, hand2: 1.7, hand3: 1.7, click1: 1.4, click2: 1.4 },
      idle: { snack1: 1.7, snack2: 1.7, snack3: 1.7 },
      star: { click1: 1.15, click2: 1.15 },
      prestige: { snack1: 1.35, snack2: 1.35, snack3: 1.35, click1: 1.15, click2: 1.15 },
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
    for (let guard = 0; guard < 100; guard++) {
      const candidates = [];
      const before = this.neutralRate();
      const discount = this.S.buffs.discount ? 0.5 : 1;

      for (const p of PRODUCERS) {
        const cost = this.producerCost(p) * discount;
        if (this.S.coins < cost) continue;
        const after = this.withTemporaryChange(
          () => { this.S.producers[p.id] += 1; },
          () => this.neutralRate(),
        );
        const score = ((after - before) / cost) * this.strategyBias('producer', p.id);
        candidates.push({ kind: 'producer', id: p.id, cost, score });
      }

      for (const u of UPGRADES) {
        if (this.S.upgrades[u.id]) continue;
        const cost = u.cost * discount;
        if (this.S.coins < cost) continue;
        const after = this.withTemporaryChange(
          () => { this.S.upgrades[u.id] = true; },
          () => this.neutralRate(),
        );
        const score = ((after - before) / cost) * this.strategyBias('upgrade', u.id);
        candidates.push({ kind: 'upgrade', id: u.id, cost, score });
      }

      if (this.options.useDecor) {
        for (const d of DECOR) {
          if (this.S.decor[d.id]) continue;
          if (this.S.coins < d.cost) continue;
          const after = this.withTemporaryChange(
            () => { this.S.decor[d.id] = true; },
            () => this.neutralRate(),
          );
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
      if (best.kind === 'decor') {
        this.S.decor[best.id] = true;
        this.purchasedDecor++;
      }
      if (best.kind !== 'decor') this.consumeDiscount();
      this.updateCodexAndAchievements();
      this.checkMilestones();
    }
  }

  consumeDiscount() {
    if (this.S.buffs.discount) this.S.buffs.discount = false;
  }

  tickClicking(dt) {
    const active = this.rng() < this.options.activeRatio;
    if (!active) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
      return;
    }
    const exactClicks = this.options.clicksPerSecond * dt;
    const clickCount = Math.floor(exactClicks) + (this.rng() < exactClicks % 1 ? 1 : 0);
    for (let i = 0; i < clickCount; i++) {
      const gain = this.clickPower() * this.comboMul() * this.frenzyMul();
      this.earnCoins(gain, 'click');
      this.S.totalClicks++;
      this.S.stats.run.clicks++;
      this.combo++;
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

  tickStars(dt) {
    if (!this.options.useGoldenStars) return;
    this.starTimer -= dt;
    if (this.starTimer > 0) return;
    this.goldenStarsClicked++;
    this.S.stats.run.starsClicked++;
    this.S.stats.lifetime.starsClicked++;
    this.runStarEvent();
    if (this.hasSyn('rabbit', 100) && this.rng() < 0.2) this.spawnMiniStars();
    this.starTimer = this.starInterval();
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
      this.earnCoins(bonus, 'event');
    } else if (idx === 2) {
      this.partyTimer = this.partyDuration();
    } else if (idx === 3) {
      this.S.buffs.discount = true;
    } else {
      this.spawnMiniStars();
    }
  }

  spawnMiniStars() {
    const count = 5 + (this.hasSyn('rabbit', 10) ? 1 : 0);
    for (let i = 0; i < count; i++) {
      let bonus = Math.max(this.totalCps() * 8, this.clickPower() * 15, 25);
      if (this.hasSyn('rabbit', 25)) bonus *= 1.3;
      if (this.hasSyn('dog', 50)) bonus *= 1.2;
      this.earnCoins(bonus, 'event');
      this.miniStarsClicked++;
    }
  }

  buyPrestigePerks() {
    const orderByStrategy = {
      balanced: ['promise', 'sticky', 'combo', 'starlight', 'evoseed', 'softtime'],
      click: ['sticky', 'combo', 'promise', 'starlight', 'evoseed', 'softtime'],
      idle: ['promise', 'softtime', 'evoseed', 'starlight', 'sticky', 'combo'],
      star: ['starlight', 'promise', 'sticky', 'combo', 'evoseed', 'softtime'],
      prestige: ['promise', 'evoseed', 'starlight', 'sticky', 'combo', 'softtime'],
    }[this.options.buyStrategy] || [];
    let bought = true;
    while (bought) {
      bought = false;
      for (const id of orderByStrategy) {
        const perk = PERKS.find(p => p.id === id);
        const lv = this.perkLv(id);
        const cost = lv + 1;
        if (lv < perk.max && this.S.prestige.souls >= cost) {
          this.S.prestige.souls -= cost;
          this.S.prestige.perks[id] = lv + 1;
          bought = true;
        }
      }
    }
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
    this.combo = 0;
    this.comboTimer = 0;
    this.frenzyTimer = 0;
    this.partyTimer = 0;
    this.frenzyEarned = 0;
    this.festActive = 0;
    this.festWait = 60;
    this.starTimer = this.starInterval();
    this.buyPrestigePerks();
    this.stageIdx = 0;
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
    this.updateCodexAndAchievements();
    this.checkMilestones();
    this.buyAffordableThings();
    this.maybePrestige();
  }

  simulate(minutes = 120) {
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
      coins: this.S.coins,
      totalEarned: this.S.totalEarned,
      totalCps: this.totalCps(),
      clickPower: this.clickPower(),
      currentStage: STAGES[this.currentStageFor(this.S.totalEarned)].name,
      currentTrait: this.currentTrait?.name || null,
      achievementCount: this.achCount(),
      achievementMultiplier: 1 + this.achCount() * 0.01,
      prestigeSouls: this.S.prestige.souls,
      prestigeTotalSoulsEarned: this.S.prestige.totalSoulsEarned,
      soulMultiplier: this.soulMul(),
      perkLevels: clone(this.S.prestige.perks),
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
      stageName: STAGES[this.currentStageFor(this.S.totalEarned)].name,
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
      rebirthTimes: this.rebirthTimes,
      rebirthIntervals,
      milestones: this.milestones,
      snapshot: this.snapshot(),
      notes: this.notes,
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
  return sim.simulate(options.minutes ?? 120);
}

function simulateStrategies(options = {}) {
  return Object.keys(STRATEGY_DEFAULTS).map((strategy, i) =>
    simulateRun({ ...options, buyStrategy: strategy, seed: (options.seed ?? 123) + i }));
}

function bonusStackAnalysis(totalSoulsEarned = 10) {
  const sim = new BalanceSim();
  sim.S.prestige.totalSoulsEarned = totalSoulsEarned;
  for (const p of PRODUCERS) sim.S.producers[p.id] = p.id === 'planet' ? 25 : 100;
  for (const u of UPGRADES) sim.S.upgrades[u.id] = true;
  for (const d of DECOR) sim.S.decor[d.id] = true;
  for (const id of ACHIEVEMENTS) sim.S.achievements[id] = true;
  sim.combo = 50;
  sim.frenzyTimer = sim.frenzyDuration();
  sim.partyTimer = sim.partyDuration();
  sim.festActive = 10;
  sim.updateCodexAndAchievements();
  return [
    { combo: '광란 x 친구 파티', multiplier: sim.frenzyMul() * sim.partyMul(), note: '자동 생산 순간 배율' },
    { combo: '광란 x 드래곤50 x 콤보50 x 병아리100', multiplier: sim.frenzyMul() * 1.25 * sim.comboMul() * 2, note: '클릭 순간 배율 핵심' },
    { combo: '총 획득 영혼 10개 x 업적 21개', multiplier: sim.soulMul() * (1 + sim.achCount() * 0.01), note: '영구 전체 수입' },
    { combo: '코인 행성 25 x 행성25 시너지', multiplier: sim.planetMul() * 1.1, note: 'CPS 전용' },
    { combo: '장식 전체 x 유니콘10 x 행성10', multiplier: Math.max(sim.decorClickMul(), sim.decorCpsMul()), note: '장식 보너스 최대치' },
  ].sort((a, b) => b.multiplier - a.multiplier);
}

function markdownReport(results, beforeResults = null) {
  const now = new Date().toISOString().slice(0, 10);
  const rows = results.map(r => `| ${r.strategy} | ${minutesText(r.rebirthIntervals[0])} | ${minutesText(r.rebirthIntervals[1])} | ${minutesText(r.rebirthIntervals[2])} | ${fmt(r.totalEarned)} | ${fmt(r.totalCps)} | ${fmt(r.clickPower)} | ${r.achievementsUnlocked} | ${r.synergiesUnlocked.length} | ${r.goldenStarsClicked} |`);
  const balanced = results.find(r => r.strategy === 'balanced') || results[0];
  const stacks = bonusStackAnalysis().map(x => `| ${x.combo} | x${x.multiplier.toFixed(2)} | ${x.note} |`).join('\n');
  const compare = beforeResults
    ? beforeResults.map((b, i) => `| ${b.strategy} | ${minutesText(b.rebirthIntervals[0])} | ${minutesText(results[i].rebirthIntervals[0])} | ${minutesText(b.rebirthIntervals[2])} | ${minutesText(results[i].rebirthIntervals[2])} |`).join('\n')
    : '| - | - | - | - | - |';

  return `# Balance Report

## 측정 기준
- 날짜: ${now}
- 커밋: \`git log -1 --format="%H %cs %s"\` 기준으로 확인
- 방식: \`node tools/balance-sim.mjs\` 근사 시뮬레이션
- 시뮬레이션은 실제 \`index.html\`의 생산자 비용, 강화, 장식, 업적, 영혼, 시너지, 광란/파티/황금별 이벤트 공식을 복제했다.
- 구매자는 완벽한 플레이어가 아니라 전략별 ROI로 친구/강화/장식을 구매하는 근사 모델이다.

## 전략별 결과
| 전략 | 첫 환생 | 2회차 소요 | 3회차 소요 | 종료 시 이번 생 획득 | 종료 CPS | 종료 클릭 | 업적 | 시너지 | 황금별 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## 구간 도달 시간
| 구간 | balanced |
| --- | ---: |
| 첫 친구 | ${minutesText(balanced.milestones.firstFriend)} |
| 첫 업그레이드 | ${minutesText(balanced.milestones.firstUpgrade)} |
| 첫 진화 | ${minutesText(balanced.milestones.firstEvolution)} |
| 딸기 슬라임 | ${minutesText(balanced.milestones.strawberry)} |
| 황금 킹 슬라임 | ${minutesText(balanced.milestones.goldenKing)} |
| 갓 슬라임 | ${minutesText(balanced.milestones.godSlime)} |
| 첫 환생 가능 | ${minutesText(balanced.milestones.firstRebirthAvailable)} |

## 가장 강한 보너스 조합 Top 5
| 조합 | 배율 | 메모 |
| --- | ---: | --- |
${stacks}

## 조정 전/후 비교
| 전략 | 조정 전 첫 환생 | 조정 후 첫 환생 | 조정 전 3회차 | 조정 후 3회차 |
| --- | ---: | ---: | ---: | ---: |
${compare}
`;
}

function printCli() {
  const args = new Set(process.argv.slice(2));
  const minutes = Number(process.env.MINUTES || 240);
  const results = simulateStrategies({ minutes, autoPrestige: true, seed: Number(process.env.SEED || 123) });
  if (args.has('--json')) {
    console.log(JSON.stringify({ results, stacks: bonusStackAnalysis(), snapshot: snapshot() }, null, 2));
    return;
  }
  if (args.has('--markdown')) {
    console.log(markdownReport(results));
    return;
  }
  console.log(`Balance simulation (${minutes} minutes, autoPrestige=true)`);
  console.table(results.map(r => ({
    strategy: r.strategy,
    firstRebirth: minutesText(r.rebirthIntervals[0]),
    secondLife: minutesText(r.rebirthIntervals[1]),
    thirdLife: minutesText(r.rebirthIntervals[2]),
    totalEarned: fmt(r.totalEarned),
    cps: fmt(r.totalCps),
    click: fmt(r.clickPower),
    achievements: r.achievementsUnlocked,
    synergies: r.synergiesUnlocked.length,
    stars: r.goldenStarsClicked,
  })));
  console.log('\nBalanced milestones:', Object.fromEntries(Object.entries(results[0].milestones).map(([k, v]) => [k, minutesText(v)])));
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
  resetToFreshStateForSimulation,
  bonusStackAnalysis,
  markdownReport,
};
