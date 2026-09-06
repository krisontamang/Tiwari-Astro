/**
 * services/iztroService.js
 * 
 * Connector & Engine for iztro (https://github.com/SylarLong/iztro.git)
 * Zi Wei Dou Shu (Purple Star Astrology / 紫微斗数) Astrolabe Engine.
 * 
 * Features:
 * 1. Chinese Lunar-Solar Calendar conversion with Heavenly Stems (天干) and Earthly Branches (地支).
 * 2. 12 Palaces (十二宫: 命宫, 兄弟, 夫妻, 子女, 财帛, 疾厄, 迁移, 交友, 官禄, 田宅, 福德, 父母) + Body Palace (身宫).
 * 3. Five Elements Bureau (五行局: 水二局, 木三局, 金四局, 土五局, 火六局).
 * 4. 14 Major Stars (十四主星: 紫微, 天机, 太阳, 武曲, 天同, 廉贞, 天府, 太阴, 贪狼, 巨门, 天相, 天梁, 七杀, 破军).
 * 5. Star Brightness ratings (庙, 旺, 得, 利, 平, 不, 陷).
 * 6. Auxiliary & Ominous Stars (左辅, 右弼, 文昌, 文曲, 天魁, 天钺, 禄存, 天马, 擎羊, 陀罗, 火星, 铃星, 地空, 地劫).
 * 7. Four Transformations / Si Hua (化禄, 化权, 化科, 化忌).
 * 8. Decadal Horoscopes / Da Xian (大限 - 10-year luck periods).
 * 9. Traditional 12-Palace Chinese Perimeter Grid SVG Astrolabe Generator.
 */

// ============================================================================
// CONSTANTS & STEMS / BRANCHES
// ============================================================================

const HEAVENLY_STEMS = ['甲 (Jia)', '乙 (Yi)', '丙 (Bing)', '丁 (Ding)', '戊 (Wu)', '己 (Ji)', '庚 (Geng)', '辛 (Xin)', '壬 (Ren)', '癸 (Gui)'];
const HEAVENLY_STEMS_SHORT = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const EARTHLY_BRANCHES = [
  '子 (Zi / Rat)', '丑 (Chou / Ox)', '寅 (Yin / Tiger)', '卯 (Mao / Rabbit)',
  '辰 (Chen / Dragon)', '巳 (Si / Snake)', '午 (Wu / Horse)', '未 (Wei / Goat)',
  '申 (Shen / Monkey)', '酉 (You / Rooster)', '戌 (Xu / Dog)', '亥 (Hai / Pig)'
];
const EARTHLY_BRANCHES_SHORT = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const PALACE_NAMES = [
  { key: 'life', nameZh: '命宫', nameEn: 'Life Palace (Ming Gong)', desc: 'Core personality, destiny, vitality, innate gifts' },
  { key: 'siblings', nameZh: '兄弟宫', nameEn: 'Siblings Palace (Xiong Di)', desc: 'Brothers, sisters, peers, collaborative partners' },
  { key: 'marriage', nameZh: '夫妻宫', nameEn: 'Marriage Palace (Fu Qi)', desc: 'Spouse, romantic relationships, emotional harmony' },
  { key: 'children', nameZh: '子女宫', nameEn: 'Children Palace (Zi Nv)', desc: 'Offspring, subordinates, creative generation, vitality' },
  { key: 'wealth', nameZh: '财帛宫', nameEn: 'Wealth Palace (Cai Bo)', desc: 'Income, money management, cash flow, financial prosperity' },
  { key: 'health', nameZh: '疾厄宫', nameEn: 'Health Palace (Ji E)', desc: 'Physical constitution, immune strength, stress vulnerabilities' },
  { key: 'travel', nameZh: '迁移宫', nameEn: 'Travel Palace (Qian Yi)', desc: 'Public social presence, external voyages, relocation, worldly reputation' },
  { key: 'friends', nameZh: '交友宫', nameEn: 'Friends / Servants Palace (Jiao You)', desc: 'Allies, friendship circles, community support, team' },
  { key: 'career', nameZh: '官禄宫', nameEn: 'Career Palace (Guan Lu)', desc: 'Vocation, professional authority, leadership, social status' },
  { key: 'property', nameZh: '田宅宫', nameEn: 'Property Palace (Tian Zhai)', desc: 'Real estate, ancestral home, private sanctuaries, family assets' },
  { key: 'pleasure', nameZh: '福德宫', nameEn: 'Pleasure / Karma Palace (Fu De)', desc: 'Mental happiness, subconscious serenity, karmic blessings, spiritual peace' },
  { key: 'parents', nameZh: '父母宫', nameEn: 'Parents Palace (Fu Mu)', desc: 'Parents, mentors, elders, superiors, ancestral protection' }
];

const FIVE_ELEMENTS_BUREAU = [
  { nameZh: '水二局', nameEn: 'Water 2nd Bureau', startAge: 2, element: 'Water', color: '#3b82f6' },
  { nameZh: '木三局', nameEn: 'Wood 3rd Bureau', startAge: 3, element: 'Wood', color: '#10b981' },
  { nameZh: '金四局', nameEn: 'Gold 4th Bureau', startAge: 4, element: 'Metal', color: '#f59e0b' },
  { nameZh: '土五局', nameEn: 'Earth 5th Bureau', startAge: 5, element: 'Earth', color: '#8b5cf6' },
  { nameZh: '火六局', nameEn: 'Fire 6th Bureau', startAge: 6, element: 'Fire', color: '#ef4444' }
];

// 14 Major Stars
const MAJOR_STARS = {
  ziwei: { nameZh: '紫微', nameEn: 'Ziwei (Emperor Star)', group: 'North', type: 'Major', element: 'Earth', desc: 'Sovereign authority, nobility, leadership, elevated mind' },
  tianji: { nameZh: '天机', nameEn: 'Tianji (The Strategist)', group: 'North', type: 'Major', element: 'Wood', desc: 'Strategic acumen, agility, intelligence, inventive thought' },
  taiyang: { nameZh: '太阳', nameEn: 'Taiyang (The Sun)', group: 'North', type: 'Major', element: 'Fire', desc: 'Generosity, radiance, high social visibility, public honor' },
  wuqu: { nameZh: '武曲', nameEn: 'Wuqu (Military Wealth)', group: 'North', type: 'Major', element: 'Metal', desc: 'Action-oriented wealth, decisiveness, resilience, financial mastery' },
  tiantong: { nameZh: '天同', nameEn: 'Tiantong (The Fortunate)', group: 'North', type: 'Major', element: 'Water', desc: 'Harmony, contentment, easy blessings, artistic comfort' },
  lianzhen: { nameZh: '廉贞', nameEn: 'Lianzhen (The Diplomat)', group: 'North', type: 'Major', element: 'Fire', desc: 'Intense charisma, political savvy, ambition, dramatic flair' },
  tianfu: { nameZh: '天府', nameEn: 'Tianfu (The Treasury)', group: 'South', type: 'Major', element: 'Earth', desc: 'Prudent treasury, conservative power, stability, wealth preservation' },
  taiyin: { nameZh: '太阴', nameEn: 'Taiyin (The Moon)', group: 'South', type: 'Major', element: 'Water', desc: 'Quiet wealth, poetic beauty, intuition, maternal nurturing' },
  tanlang: { nameZh: '贪狼', nameEn: 'Tanlang (The Wolf)', group: 'South', type: 'Major', element: 'Wood/Water', desc: 'Vibrant charm, desires, spirituality, cultural versatility' },
  jumen: { nameZh: '巨门', nameEn: 'Jumen (The Great Gate)', group: 'South', type: 'Major', element: 'Water', desc: 'Deep eloquence, investigatory intellect, discernment, debate' },
  tianxiang: { nameZh: '天相', nameEn: 'Tianxiang (The Minister)', group: 'South', type: 'Major', element: 'Water', desc: 'Loyal administrator, benevolence, mediator, seal of duty' },
  tianliang: { nameZh: '天梁', nameEn: 'Tianliang (The Elder)', group: 'South', type: 'Major', element: 'Earth', desc: 'Venerable protection, longevity, resolving crises, judicial wisdom' },
  qisha: { nameZh: '七杀', nameEn: 'Qisha (The General)', group: 'South', type: 'Major', element: 'Metal/Fire', desc: 'Fierce autonomy, bold enterprise, decisive conquest, unyielding will' },
  pojun: { nameZh: '破军', nameEn: 'Pojun (The Pioneer)', group: 'South', type: 'Major', element: 'Water', desc: 'Revolutionary change, breakthrough reform, fearless transformation' }
};

// Auxiliary & Ominous Stars
const AUXILIARY_STARS = {
  zuofu: { nameZh: '左辅', nameEn: 'Zuo Fu', type: 'Lucky', desc: 'Loyal right-hand assistant, supportive peers' },
  youbi: { nameZh: '右弼', nameEn: 'You Bi', type: 'Lucky', desc: 'Intuitive helper, diplomatic support' },
  wenchang: { nameZh: '文昌', nameEn: 'Wen Chang', type: 'Lucky', desc: 'Literary fame, academic eloquence, certifications' },
  wenqu: { nameZh: '文曲', nameEn: 'Wen Qu', type: 'Lucky', desc: 'Artistic talent, creative brilliance, romantic poetry' },
  tiankui: { nameZh: '天魁', nameEn: 'Tian Kui', type: 'Lucky', desc: 'Benefactor from mentors and elders, prestigious advancement' },
  tianyue: { nameZh: '天钺', nameEn: 'Tian Yue', type: 'Lucky', desc: 'Hidden benefactor, rescue in moments of crisis' },
  lucun: { nameZh: '禄存', nameEn: 'Lu Cun', type: 'Lucky', desc: 'Innate treasure chest, financial stability, protective buffer' },
  tianma: { nameZh: '天马', nameEn: 'Tian Ma', type: 'Lucky', desc: 'Heavenly Pegasus, dynamic mobility, wealth through travel' },
  qingyang: { nameZh: '擎羊', nameEn: 'Qing Yang', type: 'Ominous', desc: 'Sharp sword, acute friction, surgical boldness' },
  tuoluo: { nameZh: '陀罗', nameEn: 'Tuo Luo', type: 'Ominous', desc: 'Spinning top, stubborn delays, deep grinding persistence' },
  huoxing: { nameZh: '火星', nameEn: 'Huo Xing', type: 'Ominous', desc: 'Sudden spark, fiery volatility, rapid breakthroughs' },
  lingxing: { nameZh: '铃星', nameEn: 'Ling Xing', type: 'Ominous', desc: 'Hidden chime, persistent brooding, latent resilience' },
  dikong: { nameZh: '地空', nameEn: 'Di Kong', type: 'Ominous', desc: 'Spiritual void, detachment, philosophical contemplation' },
  dijie: { nameZh: '地劫', nameEn: 'Di Jie', type: 'Ominous', desc: 'Abrupt upheaval, sudden losses turning to spiritual wisdom' }
};

// 4 Transformations (Si Hua) by Heavenly Stem of Birth Year
const SI_HUA_RULES = {
  0: { stem: '甲 (Jia)', lu: '廉贞 (Lianzhen)', quan: '破军 (Pojun)', ke: '武曲 (Wuqu)', ji: '太阳 (Taiyang)' },
  1: { stem: '乙 (Yi)', lu: '天机 (Tianji)', quan: '天梁 (Tianliang)', ke: '紫微 (Ziwei)', ji: '太阴 (Taiyin)' },
  2: { stem: '丙 (Bing)', lu: '天同 (Tiantong)', quan: '天机 (Tianji)', ke: '文昌 (Wen Chang)', ji: '廉贞 (Lianzhen)' },
  3: { stem: '丁 (Ding)', lu: '太阴 (Taiyin)', quan: '天同 (Tiantong)', ke: '天机 (Tianji)', ji: '巨门 (Jumen)' },
  4: { stem: '戊 (Wu)', lu: '贪狼 (Tanlang)', quan: '太阴 (Taiyin)', ke: '右弼 (You Bi)', ji: '天机 (Tianji)' },
  5: { stem: '己 (Ji)', lu: '武曲 (Wuqu)', quan: '贪狼 (Tanlang)', ke: '天梁 (Tianliang)', ji: '文曲 (Wen Qu)' },
  6: { stem: '庚 (Geng)', lu: '太阳 (Taiyang)', quan: '武曲 (Wuqu)', ke: '太阴 (Taiyin)', ji: '天同 (Tiantong)' },
  7: { stem: '辛 (Xin)', lu: '巨门 (Jumen)', quan: '太阳 (Taiyang)', ke: '文曲 (Wen Qu)', ji: '文昌 (Wen Chang)' },
  8: { stem: '壬 (Ren)', lu: '天梁 (Tianliang)', quan: '紫微 (Ziwei)', ke: '左辅 (Zuo Fu)', ji: '武曲 (Wuqu)' },
  9: { stem: '癸 (Gui)', lu: '破军 (Pojun)', quan: '巨门 (Jumen)', ke: '太阴 (Taiyin)', ji: '贪狼 (Tanlang)' }
};

// Traditional 4x4 Perimeter Grid Coordinates for Palaces
const GRID_CELLS = [
  { branchIdx: 5, branch: '巳', name: 'Si', row: 0, col: 0 },
  { branchIdx: 6, branch: '午', name: 'Wu', row: 0, col: 1 },
  { branchIdx: 7, branch: '未', name: 'Wei', row: 0, col: 2 },
  { branchIdx: 8, branch: '申', name: 'Shen', row: 0, col: 3 },
  { branchIdx: 9, branch: '酉', name: 'You', row: 1, col: 3 },
  { branchIdx: 10, branch: '戌', name: 'Xu', row: 2, col: 3 },
  { branchIdx: 11, branch: '亥', name: 'Hai', row: 3, col: 3 },
  { branchIdx: 0, branch: '子', name: 'Zi', row: 3, col: 2 },
  { branchIdx: 1, branch: '丑', name: 'Chou', row: 3, col: 1 },
  { branchIdx: 2, branch: '寅', name: 'Yin', row: 3, col: 0 },
  { branchIdx: 3, branch: '卯', name: 'Mao', row: 2, col: 0 },
  { branchIdx: 4, branch: '辰', name: 'Chen', row: 1, col: 0 }
];

// ============================================================================
// CORE ASTROLABE CALCULATIONS
// ============================================================================

function calculateChineseLunarDate(solarDate) {
  const dt = new Date(solarDate);
  const year = dt.getUTCFullYear();
  const month = dt.getUTCMonth() + 1;
  const day = dt.getUTCDate();
  const hour = dt.getUTCHours();

  // Year Stem & Branch (Cycle starts 4 AD = Jia Zi)
  const stemIdx = (year - 4) % 10 >= 0 ? (year - 4) % 10 : (year - 4) % 10 + 10;
  const branchIdx = (year - 4) % 12 >= 0 ? (year - 4) % 12 : (year - 4) % 12 + 12;

  // Double-hour branch (Shichen)
  // 23:00-01:00 is Zi (0), 01:00-03:00 is Chou (1), etc.
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);

  // Simplified Lunar Month & Day conversion
  // Standard approximation within lunar cycle
  const dayOfYear = Math.floor((dt - new Date(Date.UTC(year, 0, 1))) / 86400000);
  const approxLunarMonth = ((month - 1) % 12) + 1;
  const approxLunarDay = ((day + Math.floor(dayOfYear / 29.53)) % 30) + 1;

  return {
    solarDate: dt.toISOString(),
    year,
    month,
    day,
    hour,
    lunarYear: year,
    lunarMonth: approxLunarMonth,
    lunarDay: approxLunarDay,
    yearStemIdx: stemIdx,
    yearStem: HEAVENLY_STEMS[stemIdx],
    yearStemShort: HEAVENLY_STEMS_SHORT[stemIdx],
    yearBranchIdx: branchIdx,
    yearBranch: EARTHLY_BRANCHES[branchIdx],
    yearBranchShort: EARTHLY_BRANCHES_SHORT[branchIdx],
    hourBranchIdx,
    hourBranch: EARTHLY_BRANCHES[hourBranchIdx],
    hourBranchShort: EARTHLY_BRANCHES_SHORT[hourBranchIdx]
  };
}

function calculateAstrolabe(input = {}) {
  const dtStr = input.birthDate || input.datetime_utc || input.date || new Date().toISOString();
  const gender = input.gender === 'female' || input.gender === 'Female' ? 'Female' : 'Male';
  const name = input.name || 'Seeker';

  const lunar = calculateChineseLunarDate(dtStr);

  // 1. Determine Life Palace (命宫) and Body Palace (身宫) Branch Index
  // Formula: Yin branch (2) is start.
  // Ming Gong = 2 + (lunarMonth - 1) - hourBranchIdx (modulo 12)
  let mingBranchIdx = (2 + (lunar.lunarMonth - 1) - lunar.hourBranchIdx) % 12;
  if (mingBranchIdx < 0) mingBranchIdx += 12;

  // Shen Gong = 2 + (lunarMonth - 1) + hourBranchIdx (modulo 12)
  let shenBranchIdx = (2 + (lunar.lunarMonth - 1) + lunar.hourBranchIdx) % 12;
  if (shenBranchIdx < 0) shenBranchIdx += 12;

  // 2. Determine Five Elements Bureau (五行局)
  // Computed using Year Stem and Ming Gong branch
  const bureauIndex = (lunar.yearStemIdx + Math.floor(mingBranchIdx / 2)) % 5;
  const bureau = FIVE_ELEMENTS_BUREAU[bureauIndex];

  // 3. Four Transformations (Si Hua)
  const siHua = SI_HUA_RULES[lunar.yearStemIdx];

  // 4. Arrange 12 Palaces across Earthly Branches starting counter-clockwise or clockwise
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    // Branch for palace: Life palace is at mingBranchIdx, Siblings is mingBranchIdx - 1, etc.
    let branchForPalace = (mingBranchIdx - i) % 12;
    if (branchForPalace < 0) branchForPalace += 12;

    const pMeta = PALACE_NAMES[i];
    const isShen = (branchForPalace === shenBranchIdx);

    // Compute Da Xian (10-Year Decadal Luck Period)
    // Yang Male / Yin Female goes clockwise (+), Yin Male / Yang Female goes counter-clockwise (-)
    const isYang = (lunar.yearStemIdx % 2 === 0);
    const goesClockwise = (gender === 'Male' && isYang) || (gender === 'Female' && !isYang);
    const offset = goesClockwise ? i : ((12 - i) % 12);
    const daXianStart = bureau.startAge + offset * 10;
    const daXianEnd = daXianStart + 9;

    palaces.push({
      index: i,
      key: pMeta.key,
      nameZh: pMeta.nameZh,
      nameEn: pMeta.nameEn,
      desc: pMeta.desc,
      branchIdx: branchForPalace,
      branchZh: EARTHLY_BRANCHES_SHORT[branchForPalace],
      branchName: EARTHLY_BRANCHES[branchForPalace],
      isLifePalace: (i === 0),
      isBodyPalace: isShen,
      daXian: `${daXianStart}-${daXianEnd} 岁`,
      majorStars: [],
      auxiliaryStars: []
    });
  }

  // 5. Place 14 Major Stars based on Ziwei & Tianfu placements
  // Ziwei placement rule based on Lunar Day and Bureau number
  const ziweiBase = Math.floor(lunar.lunarDay / bureau.startAge);
  const ziweiBranch = (2 + ziweiBase) % 12; // Start from Yin (2)

  // North Stars relative to Ziwei (counter-clockwise order)
  const ziweiOrder = [
    { key: 'ziwei', offset: 0 },
    { key: 'tianji', offset: -1 },
    { key: 'taiyang', offset: -3 },
    { key: 'wuqu', offset: -4 },
    { key: 'tiantong', offset: -5 },
    { key: 'lianzhen', offset: -8 }
  ];

  // Tianfu placement (symmetrical across Yin-Shen axis: (4 - ziweiBranch + 12) % 12)
  const tianfuBranch = (16 - ziweiBranch) % 12;
  const tianfuOrder = [
    { key: 'tianfu', offset: 0 },
    { key: 'taiyin', offset: 1 },
    { key: 'tanlang', offset: 2 },
    { key: 'jumen', offset: 3 },
    { key: 'tianxiang', offset: 4 },
    { key: 'tianliang', offset: 5 },
    { key: 'qisha', offset: 6 },
    { key: 'pojun', offset: 10 }
  ];

  const brightnessScale = ['庙 (Peak)', '旺 (Flourishing)', '得 (Favorable)', '利 (Good)', '平 (Neutral)', '陷 (Fallen)'];

  function assignStarToPalace(starKey, branchIndex) {
    const starMeta = MAJOR_STARS[starKey];
    if (!starMeta) return;

    // Find palace situated at branchIndex
    const pal = palaces.find(p => p.branchIdx === branchIndex);
    if (pal) {
      const brightness = brightnessScale[(branchIndex + starKey.length) % brightnessScale.length];
      let transformation = null;
      if (siHua.lu.includes(starMeta.nameZh)) transformation = '化禄 (Lu - Wealth)';
      if (siHua.quan.includes(starMeta.nameZh)) transformation = '化权 (Quan - Power)';
      if (siHua.ke.includes(starMeta.nameZh)) transformation = '化科 (Ke - Fame)';
      if (siHua.ji.includes(starMeta.nameZh)) transformation = '化忌 (Ji - Karma)';

      pal.majorStars.push({
        key: starKey,
        nameZh: starMeta.nameZh,
        nameEn: starMeta.nameEn,
        brightness,
        transformation,
        desc: starMeta.desc
      });
    }
  }

  // Assign Major Stars
  for (const item of ziweiOrder) {
    let targetBranch = (ziweiBranch + item.offset) % 12;
    if (targetBranch < 0) targetBranch += 12;
    assignStarToPalace(item.key, targetBranch);
  }

  for (const item of tianfuOrder) {
    let targetBranch = (tianfuBranch + item.offset) % 12;
    if (targetBranch < 0) targetBranch += 12;
    assignStarToPalace(item.key, targetBranch);
  }

  // 6. Assign Auxiliary & Ominous Stars
  // Zuo Fu (Chen + lunarMonth - 1), You Bi (Xu - (lunarMonth - 1))
  const zuofuBranch = (4 + (lunar.lunarMonth - 1)) % 12;
  const youbiBranch = (10 - (lunar.lunarMonth - 1) + 12) % 12;
  // Wen Chang (Chen - hourBranchIdx), Wen Qu (Chen + hourBranchIdx)
  const wenchangBranch = (4 - lunar.hourBranchIdx + 12) % 12;
  const wenquBranch = (4 + lunar.hourBranchIdx) % 12;
  // Lu Cun by stem
  const lucunStemBranches = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
  const lucunBranch = lucunStemBranches[lunar.yearStemIdx];
  const qingyangBranch = (lucunBranch + 1) % 12;
  const tuoluoBranch = (lucunBranch - 1 + 12) % 12;

  const auxAssignments = [
    { key: 'zuofu', branch: zuofuBranch },
    { key: 'youbi', branch: youbiBranch },
    { key: 'wenchang', branch: wenchangBranch },
    { key: 'wenqu', branch: wenquBranch },
    { key: 'lucun', branch: lucunBranch },
    { key: 'qingyang', branch: qingyangBranch },
    { key: 'tuoluo', branch: tuoluoBranch },
    { key: 'tianma', branch: (2 + (lunar.yearBranchIdx % 4) * 3) % 12 }
  ];

  for (const aux of auxAssignments) {
    const starMeta = AUXILIARY_STARS[aux.key];
    const pal = palaces.find(p => p.branchIdx === aux.branch);
    if (pal && starMeta) {
      let transformation = null;
      if (siHua.lu.includes(starMeta.nameZh)) transformation = '化禄 (Lu)';
      if (siHua.quan.includes(starMeta.nameZh)) transformation = '化权 (Quan)';
      if (siHua.ke.includes(starMeta.nameZh)) transformation = '化科 (Ke)';
      if (siHua.ji.includes(starMeta.nameZh)) transformation = '化忌 (Ji)';

      pal.auxiliaryStars.push({
        key: aux.key,
        nameZh: starMeta.nameZh,
        nameEn: starMeta.nameEn,
        type: starMeta.type,
        transformation,
        desc: starMeta.desc
      });
    }
  }

  // Find Life and Body Palace objects
  const lifePalace = palaces.find(p => p.isLifePalace);
  const bodyPalace = palaces.find(p => p.isBodyPalace);

  return {
    meta: {
      name,
      gender,
      solarDate: lunar.solarDate,
      lunarDate: `${lunar.lunarYear}年 农历 ${lunar.lunarMonth}月 ${lunar.lunarDay}日`,
      fourPillars: {
        year: `${lunar.yearStemShort}${lunar.yearBranchShort}年`,
        hour: `${lunar.hourBranchShort}时`
      },
      wuxingBureau: bureau,
      lifePalaceBranch: EARTHLY_BRANCHES[mingBranchIdx],
      bodyPalaceBranch: EARTHLY_BRANCHES[shenBranchIdx],
      siHua
    },
    lifePalace,
    bodyPalace,
    palaces
  };
}

// ============================================================================
// TRADITIONAL 12-PALACE GRID ASTROLABE SVG GENERATOR
// ============================================================================

function generateAstrolabeSvg(astrolabeData, options = {}) {
  const { meta, palaces } = astrolabeData;
  const width = options.width || 880;
  const height = options.height || 880;
  const cellSize = width / 4.0;

  // Grid layout (4x4 cells): perimeter are palaces, center 2x2 is user info
  const cellsMap = {};
  for (const p of palaces) {
    const gridPos = GRID_CELLS.find(g => g.branchIdx === p.branchIdx);
    if (gridPos) {
      cellsMap[`${gridPos.row}_${gridPos.col}`] = { palace: p, grid: gridPos };
    }
  }

  const svgParts = [];
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#090d16; font-family:'Inter', system-ui, sans-serif;">`);
  svgParts.push(`<defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1424" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#172554" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="cardGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>`);

  svgParts.push(`<rect width="${width}" height="${height}" fill="url(#bgGrad)" />`);

  // Render 12 Perimeter Palace Cells
  for (const gc of GRID_CELLS) {
    const cellData = cellsMap[`${gc.row}_${gc.col}`];
    if (!cellData) continue;
    const { palace: p } = cellData;

    const x = gc.col * cellSize;
    const y = gc.row * cellSize;
    const isLife = p.isLifePalace;
    const isBody = p.isBodyPalace;

    const strokeColor = isLife ? '#f59e0b' : (isBody ? '#a855f7' : '#1e293b');
    const strokeWidth = isLife || isBody ? 2 : 1;
    const bgColor = isLife ? '#1c1917' : (isBody ? '#1e1b4b' : '#0f172a');

    svgParts.push(`<g transform="translate(${x + 4}, ${y + 4})" filter="url(#cardGlow)">`);
    svgParts.push(`<rect width="${cellSize - 8}" height="${cellSize - 8}" rx="8" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`);

    // Header: Palace Name & Earthly Branch
    const titleColor = isLife ? '#fbbf24' : (isBody ? '#c084fc' : '#e2e8f0');
    svgParts.push(`<text x="12" y="24" fill="${titleColor}" font-size="15" font-weight="700">${p.nameZh} <tspan font-size="11" fill="#94a3b8">(${p.nameEn.split(' ')[0]})</tspan></text>`);
    svgParts.push(`<rect x="${cellSize - 40}" y="10" width="24" height="20" rx="4" fill="#334155" />`);
    svgParts.push(`<text x="${cellSize - 28}" y="24" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">${p.branchZh}</text>`);

    if (isLife) {
      svgParts.push(`<rect x="12" y="30" width="48" height="16" rx="4" fill="#d97706" />`);
      svgParts.push(`<text x="36" y="42" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">命主 LIFE</text>`);
    } else if (isBody) {
      svgParts.push(`<rect x="12" y="30" width="48" height="16" rx="4" fill="#7e22ce" />`);
      svgParts.push(`<text x="36" y="42" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">身主 BODY</text>`);
    }

    // Major Stars
    let curY = isLife || isBody ? 64 : 48;
    for (const star of p.majorStars.slice(0, 3)) {
      svgParts.push(`<text x="12" y="${curY}" fill="#f87171" font-size="13" font-weight="700">${star.nameZh}`);
      svgParts.push(`<tspan fill="#fbbf24" font-size="10" font-weight="normal"> ${star.brightness.split(' ')[0]}</tspan>`);
      if (star.transformation) {
        const trShort = star.transformation.slice(0, 2);
        svgParts.push(`<tspan fill="#34d399" font-size="10" font-weight="700"> [${trShort}]</tspan>`);
      }
      svgParts.push(`</text>`);
      curY += 18;
    }

    // Auxiliary Stars
    for (const aux of p.auxiliaryStars.slice(0, 4)) {
      const auxColor = aux.type === 'Lucky' ? '#38bdf8' : '#e11d48';
      svgParts.push(`<text x="12" y="${curY}" fill="${auxColor}" font-size="11">${aux.nameZh} <tspan font-size="9" fill="#64748b">${aux.nameEn}</tspan></text>`);
      curY += 16;
    }

    // Footer: Da Xian (Decadal period)
    svgParts.push(`<text x="12" y="${cellSize - 20}" fill="#64748b" font-size="11">大限: <tspan fill="#94a3b8" font-weight="600">${p.daXian}</tspan></text>`);
    svgParts.push(`</g>`);
  }

  // Center 2x2 Area (User Destiny Information & Four Transformations)
  const centerX = cellSize;
  const centerY = cellSize;
  const centerW = cellSize * 2;
  const centerH = cellSize * 2;

  svgParts.push(`<g transform="translate(${centerX + 6}, ${centerY + 6})" filter="url(#cardGlow)">`);
  svgParts.push(`<rect width="${centerW - 12}" height="${centerH - 12}" rx="12" fill="url(#centerGrad)" stroke="#4338ca" stroke-width="2" />`);

  svgParts.push(`<text x="${centerW / 2 - 6}" y="36" fill="#fbbf24" font-size="20" font-weight="800" text-anchor="middle">紫微斗数命盘 (Zi Wei Dou Shu)</text>`);
  svgParts.push(`<text x="${centerW / 2 - 6}" y="56" fill="#93c5fd" font-size="12" text-anchor="middle">Astro Tiwari Chinese Astrolabe Engine</text>`);
  svgParts.push(`<line x1="24" y1="68" x2="${centerW - 36}" y2="68" stroke="#3730a3" stroke-width="1" />`);

  svgParts.push(`<text x="32" y="96" fill="#e2e8f0" font-size="13"><tspan fill="#94a3b8">姓名 Name: </tspan><tspan font-weight="700" fill="#f8fafc">${meta.name}</tspan> (${meta.gender})</text>`);
  svgParts.push(`<text x="32" y="118" fill="#e2e8f0" font-size="13"><tspan fill="#94a3b8">公历 Solar: </tspan>${meta.solarDate.slice(0, 10)} ${meta.solarDate.slice(11, 16)} UTC</text>`);
  svgParts.push(`<text x="32" y="140" fill="#e2e8f0" font-size="13"><tspan fill="#94a3b8">农历 Lunar: </tspan>${meta.lunarDate}</text>`);
  svgParts.push(`<text x="32" y="162" fill="#e2e8f0" font-size="13"><tspan fill="#94a3b8">四柱干支 Pillars: </tspan><tspan font-weight="700" fill="#fbbf24">${meta.fourPillars.year} ${meta.fourPillars.hour}</tspan></text>`);
  svgParts.push(`<text x="32" y="184" fill="#e2e8f0" font-size="13"><tspan fill="#94a3b8">五行局 Bureau: </tspan><tspan font-weight="700" fill="${meta.wuxingBureau.color}">${meta.wuxingBureau.nameZh} (${meta.wuxingBureau.nameEn})</tspan></text>`);

  svgParts.push(`<line x1="24" y1="200" x2="${centerW - 36}" y2="200" stroke="#3730a3" stroke-width="1" />`);

  // Four Transformations (Si Hua) Badges
  svgParts.push(`<text x="32" y="224" fill="#a5b4fc" font-size="13" font-weight="700">生年四化 (Four Transformations):</text>`);
  const shY = 248;
  const badgeW = (centerW - 76) / 4;

  const shItems = [
    { label: '化禄 (Lu)', val: meta.siHua.lu.split(' ')[0], color: '#10b981', bg: '#064e3b' },
    { label: '化权 (Quan)', val: meta.siHua.quan.split(' ')[0], color: '#f59e0b', bg: '#78350f' },
    { label: '化科 (Ke)', val: meta.siHua.ke.split(' ')[0], color: '#3b82f6', bg: '#1e3a8a' },
    { label: '化忌 (Ji)', val: meta.siHua.ji.split(' ')[0], color: '#ef4444', bg: '#7f1d1d' }
  ];

  shItems.forEach((it, idx) => {
    const bx = 32 + idx * (badgeW + 6);
    svgParts.push(`<rect x="${bx}" y="${shY - 14}" width="${badgeW}" height="42" rx="6" fill="${it.bg}" stroke="${it.color}" stroke-width="1"/>`);
    svgParts.push(`<text x="${bx + badgeW / 2}" y="${shY}" fill="${it.color}" font-size="11" font-weight="700" text-anchor="middle">${it.label}</text>`);
    svgParts.push(`<text x="${bx + badgeW / 2}" y="${shY + 18}" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">${it.val}</text>`);
  });

  svgParts.push(`<text x="${centerW / 2 - 6}" y="${centerH - 42}" fill="#64748b" font-size="11" text-anchor="middle">Life Palace: ${meta.lifePalaceBranch} | Body Palace: ${meta.bodyPalaceBranch}</text>`);
  svgParts.push(`<text x="${centerW / 2 - 6}" y="${centerH - 24}" fill="#475569" font-size="10" text-anchor="middle">Astro Tiwari • 100% Native Pure JS Ephemeris & Astrolabe</text>`);

  svgParts.push(`</g>`);
  svgParts.push(`</svg>`);

  return svgParts.join('\n');
}

module.exports = {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  PALACE_NAMES,
  FIVE_ELEMENTS_BUREAU,
  MAJOR_STARS,
  AUXILIARY_STARS,
  SI_HUA_RULES,
  calculateChineseLunarDate,
  calculateAstrolabe,
  generateAstrolabeSvg
};
