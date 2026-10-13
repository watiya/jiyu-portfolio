// 궁합. 두 사람의 사주(saju.ts 결과)를 겹쳐 본다. 일간 관계(생·극·비화·천간합), 지지의 합·충, 오행 보완을 각각 적고 점수는 그 합이다.
// 점수는 재미용 지표다. 계산 근거는 result.notes 로 전부 드러낸다.
import type { Lang } from "../i18n/lang.ts";
import { ELEMENTS, ELEMENT_META, type Element, type Pillar, type SajuResult } from "./saju.ts";

// 상생: 목→화→토→금→수→목. 상극: 목→토→수→화→금→목
const NEXT: Record<Element, Element> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const CONTROLS: Record<Element, Element> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
const GAN_HE: [string, string][] = [["甲", "己"], ["乙", "庚"], ["丙", "辛"], ["丁", "壬"], ["戊", "癸"]];
const LIU_HE: [string, string][] = [["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"]];
const SAN_HE: string[][] = [["寅", "午", "戌"], ["申", "子", "辰"], ["巳", "酉", "丑"], ["亥", "卯", "未"]];
const CHONG: [string, string][] = [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]];

const pairIn = (list: [string, string][], a: string, b: string) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const sanHe = (a: string, b: string) => a !== b && SAN_HE.some((g) => g.includes(a) && g.includes(b));

export type DayRelation = "same" | "aGivesB" | "bGivesA" | "aControlsB" | "bControlsA";
export type Note = { kind: "good" | "clash" | "fill"; text: Record<Lang, string> };
export type GunghapResult = {
  score: number;
  relation: DayRelation;
  ganHe: boolean;
  he: number;
  chong: number;
  notes: Note[];
};

const POS: Record<Lang, string[]> = { ko: ["연지", "월지", "일지", "시지"], en: ["year", "month", "day", "hour"] };

export function computeGunghap(a: SajuResult, b: SajuResult, names: [string, string]): GunghapResult {
  const [na, nb] = names;
  const notes: Note[] = [];
  let score = 50;

  // 1. 일간 관계
  const da = a.dayMaster;
  const db = b.dayMaster;
  let relation: DayRelation = "same";
  if (da.ganEl === db.ganEl) relation = "same";
  else if (NEXT[da.ganEl] === db.ganEl) relation = "aGivesB";
  else if (NEXT[db.ganEl] === da.ganEl) relation = "bGivesA";
  else if (CONTROLS[da.ganEl] === db.ganEl) relation = "aControlsB";
  else relation = "bControlsA";
  const ea = ELEMENT_META[da.ganEl];
  const eb = ELEMENT_META[db.ganEl];
  const rel: Record<DayRelation, { delta: number; kind: Note["kind"]; ko: string; en: string }> = {
    same: { delta: 8, kind: "good", ko: `두 사람의 일간이 같은 ${ea.koWord}입니다. 말하지 않아도 통하는 쪽이지만, 같은 자리에서 부딪히기도 합니다.`, en: `Both day masters are ${ea.en}. Much goes unsaid, and the same ground is where you collide.` },
    aGivesB: { delta: 14, kind: "good", ko: `${na}의 ${ea.koWord}이 ${nb}의 ${eb.koWord}을 살립니다. ${na}가 먼저 내어 주고 ${nb}가 자라는 흐름입니다.`, en: `${na}'s ${ea.en} feeds ${nb}'s ${eb.en}. ${na} gives first and ${nb} grows.` },
    bGivesA: { delta: 14, kind: "good", ko: `${nb}의 ${eb.koWord}이 ${na}의 ${ea.koWord}을 살립니다. ${nb}가 먼저 내어 주고 ${na}가 자라는 흐름입니다.`, en: `${nb}'s ${eb.en} feeds ${na}'s ${ea.en}. ${nb} gives first and ${na} grows.` },
    aControlsB: { delta: -6, kind: "clash", ko: `${na}의 ${ea.koWord}이 ${nb}의 ${eb.koWord}을 누르는 자리입니다. 기준을 ${na}가 정하기 쉽고, ${nb}에게는 숨 쉴 틈이 필요합니다.`, en: `${na}'s ${ea.en} presses on ${nb}'s ${eb.en}. ${na} tends to set the terms; ${nb} needs room to breathe.` },
    bControlsA: { delta: -6, kind: "clash", ko: `${nb}의 ${eb.koWord}이 ${na}의 ${ea.koWord}을 누르는 자리입니다. 기준을 ${nb}가 정하기 쉽고, ${na}에게는 숨 쉴 틈이 필요합니다.`, en: `${nb}'s ${eb.en} presses on ${na}'s ${ea.en}. ${nb} tends to set the terms; ${na} needs room to breathe.` },
  };
  score += rel[relation].delta;
  notes.push({ kind: rel[relation].kind, text: { ko: rel[relation].ko, en: rel[relation].en } });

  const ganHe = pairIn(GAN_HE, da.gan, db.gan);
  if (ganHe) {
    score += 10;
    notes.push({ kind: "good", text: { ko: `일간 ${da.ganKo}과 ${db.ganKo}은 천간합입니다. 서로를 끌어당기는 짝으로 봅니다.`, en: `Day stems ${da.gan} and ${db.gan} form a stem pair, read as a natural pull toward each other.` } });
  }

  // 2. 지지의 합·충: 같은 자리끼리 + 일지와 상대 전부
  const branches = (r: SajuResult): (Pillar | undefined)[] => [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.time];
  const ba = branches(a);
  const bb = branches(b);
  let he = 0;
  let chong = 0;
  const seen = new Set<string>();
  const check = (i: number, j: number, weight: number) => {
    const x = ba[i];
    const y = bb[j];
    if (!x || !y) return;
    const key = `${i}-${j}`;
    if (seen.has(key)) return;
    seen.add(key);
    const where = (lang: Lang) => (i === j ? POS[lang][i] : `${na} ${POS[lang][i]} · ${nb} ${POS[lang][j]}`);
    if (pairIn(LIU_HE, x.zhi, y.zhi) || sanHe(x.zhi, y.zhi)) {
      he += 1;
      score += 6 * weight;
      notes.push({ kind: "good", text: { ko: `${where("ko")}의 ${x.zhiKo}와 ${y.zhiKo}가 합을 이룹니다. 같이 있을 때 편한 자리입니다.`, en: `${x.zhi} and ${y.zhi} (${where("en")}) combine. An easy place to be together.` } });
    } else if (pairIn(CHONG, x.zhi, y.zhi)) {
      chong += 1;
      score -= 8 * weight;
      notes.push({ kind: "clash", text: { ko: `${where("ko")}의 ${x.zhiKo}와 ${y.zhiKo}가 충입니다. 생활 리듬이나 속도가 엇갈리기 쉬운 자리입니다.`, en: `${x.zhi} and ${y.zhi} (${where("en")}) clash. Rhythm and pace can cross here.` } });
    }
  };
  for (let i = 0; i < 4; i++) check(i, i, i === 2 ? 1.5 : 1);
  for (let j = 0; j < 4; j++) check(2, j, 1);
  for (let i = 0; i < 4; i++) check(i, 2, 1);

  // 3. 오행 보완: 한쪽에 거의 없는 기운을 상대가 넉넉히 갖고 있으면
  let fills = 0;
  for (const el of ELEMENTS) {
    const m = ELEMENT_META[el];
    if (a.percent[el] <= 8 && b.percent[el] >= 20) {
      fills += 1;
      notes.push({ kind: "fill", text: { ko: `${na}에게 적은 ${m.koWord}(${m.ko})을 ${nb}가 넉넉히 갖고 있습니다.`, en: `${nb} carries plenty of the ${m.en} that ${na} has little of.` } });
    }
    if (b.percent[el] <= 8 && a.percent[el] >= 20) {
      fills += 1;
      notes.push({ kind: "fill", text: { ko: `${nb}에게 적은 ${m.koWord}(${m.ko})을 ${na}가 넉넉히 갖고 있습니다.`, en: `${na} carries plenty of the ${m.en} that ${nb} has little of.` } });
    }
  }
  score += fills * 4;
  if (fills === 0) notes.push({ kind: "fill", text: { ko: "서로 채워 주는 오행은 뚜렷하지 않습니다. 비슷한 기운끼리라 닮은 점이 더 많습니다.", en: "No element clearly fills the other's gap. You are more alike than complementary." } });

  return { score: Math.max(20, Math.min(98, Math.round(score))), relation, ganHe, he, chong, notes };
}
