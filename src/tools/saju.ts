// 사주 계산. 만세력은 lunar-typescript(오프라인)가 맡고, 여기서는 한글 표기·오행 분포·색 매핑만 한다.
// 입력은 브라우저 밖으로 나가지 않는다. 절기 경계(입춘 등)는 라이브러리의 절입 시각을 그대로 따른다.
import { Lunar, LunarUtil, Solar } from "lunar-typescript";
import type { Lang } from "../i18n/lang.ts";
import type { Neutral } from "../tokens/engine.ts";

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];

const GAN = "甲乙丙丁戊己庚辛壬癸";
const ZHI = "子丑寅卯辰巳午未申酉戌亥";
const GAN_KO = "갑을병정무기경신임계";
const ZHI_KO = "자축인묘진사오미신유술해";
const ANIMAL_KO = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const ANIMAL_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const EL_OF: Record<string, Element> = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };

export const ELEMENT_META: Record<Element, { hanja: string; ko: string; koWord: string; en: string; hue: number; neutral: Neutral }> = {
  wood: { hanja: "木", ko: "목", koWord: "나무", en: "Wood", hue: 150, neutral: "neutral" },
  fire: { hanja: "火", ko: "화", koWord: "불", en: "Fire", hue: 25, neutral: "warm" },
  earth: { hanja: "土", ko: "토", koWord: "흙", en: "Earth", hue: 75, neutral: "warm" },
  metal: { hanja: "金", ko: "금", koWord: "쇠", en: "Metal", hue: 270, neutral: "cool" },
  water: { hanja: "水", ko: "수", koWord: "물", en: "Water", hue: 235, neutral: "cool" },
};

export type Pillar = { gan: string; zhi: string; ganKo: string; zhiKo: string; ganEl: Element; zhiEl: Element; yang: boolean };
export type SajuInput = { year: number; month: number; day: number; hour?: number; minute?: number; calendar: "solar" | "lunar"; leap?: boolean };
export type SajuResult = {
  pillars: { year: Pillar; month: Pillar; day: Pillar; time?: Pillar };
  dayMaster: Pillar;
  animal: { ko: string; en: string };
  solar: string;
  lunar: string;
  weights: Record<Element, number>;
  percent: Record<Element, number>;
  strongest: Element;
  weakest: Element;
  missing: Element[];
};

const pillar = (gz: string): Pillar => {
  const gan = gz[0];
  const zhi = gz[1];
  const gi = GAN.indexOf(gan);
  const zi = ZHI.indexOf(zhi);
  return { gan, zhi, ganKo: GAN_KO[gi], zhiKo: ZHI_KO[zi], ganEl: EL_OF[LunarUtil.WU_XING_GAN[gan]], zhiEl: EL_OF[LunarUtil.WU_XING_ZHI[zhi]], yang: gi % 2 === 0 };
};

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** 입력이 달력에 있는 날인지. 음력은 윤달까지 라이브러리가 검사한다 */
export function validDate(input: SajuInput): boolean {
  const { year, month, day, calendar, leap, hour, minute } = input;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (hour !== undefined && (!Number.isInteger(hour) || hour < 0 || hour > 23)) return false;
  if (minute !== undefined && (!Number.isInteger(minute) || minute < 0 || minute > 59)) return false;
  try {
    if (calendar === "lunar") {
      Lunar.fromYmd(year, leap ? -month : month, day);
      return true;
    }
    const s = Solar.fromYmd(year, month, day);
    return s.getYear() === year && s.getMonth() === month && s.getDay() === day && !(month === 2 && day > 29) && !([4, 6, 9, 11].includes(month) && day > 30) && !(month === 2 && day === 29 && !isLeapYear(year));
  } catch {
    return false;
  }
}

export function computeSaju(input: SajuInput): SajuResult {
  const hasTime = input.hour !== undefined;
  const h = input.hour ?? 12;
  const mi = input.minute ?? 0;
  const lunar = input.calendar === "lunar" ? Lunar.fromYmdHms(input.year, input.leap ? -input.month : input.month, input.day, h, mi, 0) : Solar.fromYmdHms(input.year, input.month, input.day, h, mi, 0).getLunar();
  const solar = lunar.getSolar();
  const ec = lunar.getEightChar();
  const pillars = {
    year: pillar(ec.getYear()),
    month: pillar(ec.getMonth()),
    day: pillar(ec.getDay()),
    time: hasTime ? pillar(ec.getTime()) : undefined,
  };

  // 오행 가중치: 천간 1, 지지 본기 1, 지지의 나머지 지장간 0.3 씩
  const weights: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const add = (p: Pillar) => {
    weights[p.ganEl] += 1;
    const hidden = LunarUtil.ZHI_HIDE_GAN[p.zhi] ?? [];
    hidden.forEach((g, i) => {
      weights[EL_OF[LunarUtil.WU_XING_GAN[g]]] += i === 0 ? 1 : 0.3;
    });
  };
  [pillars.year, pillars.month, pillars.day, pillars.time].forEach((p) => p && add(p));
  const total = ELEMENTS.reduce((s, e) => s + weights[e], 0);
  const percent = Object.fromEntries(ELEMENTS.map((e) => [e, Math.round((weights[e] / total) * 100)])) as Record<Element, number>;
  const sorted = [...ELEMENTS].sort((a, b) => weights[b] - weights[a]);
  const zi = ZHI.indexOf(pillars.year.zhi);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    pillars,
    dayMaster: pillars.day,
    animal: { ko: ANIMAL_KO[zi], en: ANIMAL_EN[zi] },
    solar: `${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())}`,
    lunar: `${lunar.getYear()}-${pad(Math.abs(lunar.getMonth()))}-${pad(lunar.getDay())}${lunar.getMonth() < 0 ? "+" : ""}`,
    weights,
    percent,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    missing: ELEMENTS.filter((e) => weights[e] === 0),
  };
}

/** 결과 공유용 짧은 코드. 날짜·시·달력만 담는다(이름 없음) */
export function encodeSaju(i: SajuInput): string {
  const d = `${i.year}${String(i.month).padStart(2, "0")}${String(i.day).padStart(2, "0")}`;
  const t = i.hour === undefined ? "" : `.${String(i.hour).padStart(2, "0")}${String(i.minute ?? 0).padStart(2, "0")}`;
  const c = i.calendar === "lunar" ? (i.leap ? "L+" : "L") : "";
  return `s${d}${t}${c}`;
}

export function decodeSaju(code: string): SajuInput | null {
  const m = /^s(\d{4})(\d{2})(\d{2})(?:\.(\d{2})(\d{2}))?(L\+?)?$/.exec(code);
  if (!m) return null;
  const input: SajuInput = { year: +m[1], month: +m[2], day: +m[3], calendar: m[6] ? "lunar" : "solar", leap: m[6] === "L+" };
  if (m[4]) {
    input.hour = +m[4];
    input.minute = +m[5];
  }
  return validDate(input) ? input : null;
}

// ---------- 풀이 문구 ----------
// 일간(태어난 날의 천간) 열 가지. 단정하지 않는 짧은 평서문. 미래 예측은 쓰지 않는다

type Text = Record<Lang, string>;
export const DAY_MASTER: Record<string, { name: Text; line: Text }> = {
  甲: { name: { ko: "갑목 · 큰 나무", en: "Yang Wood · a tall tree" }, line: { ko: "위로 곧게 자라는 기운입니다. 방향이 정해지면 흔들림이 적고, 시작을 여는 쪽이 어울립니다. 굽히는 일에는 시간이 걸립니다.", en: "Grows straight up. Once the direction is set there is little wobble, and opening things suits you. Bending takes time." } },
  乙: { name: { ko: "을목 · 풀과 덩굴", en: "Yin Wood · grass and vines" }, line: { ko: "틈을 찾아 타고 오르는 기운입니다. 환경에 맞춰 모양을 바꾸는 데 능하고, 관계 안에서 힘을 냅니다. 혼자 버티는 일은 지칩니다.", en: "Finds the gap and climbs. Adapts its shape to the setting and draws strength from relationships. Holding out alone is tiring." } },
  丙: { name: { ko: "병화 · 해", en: "Yang Fire · the sun" }, line: { ko: "멀리까지 비추는 기운입니다. 주변을 밝히고 분위기를 바꾸는 데 익숙하고, 숨기는 것이 적습니다. 그늘을 두는 연습이 균형을 줍니다.", en: "Shines far. Used to lighting a room and shifting its mood, with little hidden. Leaving some shade brings balance." } },
  丁: { name: { ko: "정화 · 등불", en: "Yin Fire · a lamp" }, line: { ko: "가까운 곳을 오래 비추는 기운입니다. 세부를 보고 따뜻하게 돌보는 쪽이며, 집중이 깊습니다. 바람이 세면 흔들립니다.", en: "Lights what is near, for a long time. Sees detail and tends warmly, with deep focus. Strong wind unsettles it." } },
  戊: { name: { ko: "무토 · 산", en: "Yang Earth · a mountain" }, line: { ko: "자리를 지키는 기운입니다. 받아 주고 버티는 힘이 크고, 사람들이 기대어 옵니다. 움직임이 느린 만큼 한 번 정하면 오래 갑니다.", en: "Holds its ground. Strong at receiving and enduring, and people lean on it. Slow to move, long to stay once decided." } },
  己: { name: { ko: "기토 · 밭", en: "Yin Earth · a field" }, line: { ko: "무엇이든 길러 내는 기운입니다. 실무에 밝고 꾸준하며, 티 내지 않고 일을 끝냅니다. 자기 몫을 챙기는 데는 서툴 수 있습니다.", en: "Grows whatever is planted. Practical and steady, finishing work without show. Claiming its own share can be awkward." } },
  庚: { name: { ko: "경금 · 원석", en: "Yang Metal · raw ore" }, line: { ko: "단단하고 곧은 기운입니다. 옳고 그름이 분명하고 결단이 빠릅니다. 다듬어질수록 날이 서고, 부드러움은 따로 배웁니다.", en: "Hard and straight. Clear on right and wrong, quick to decide. Sharper as it is worked; softness is learned separately." } },
  辛: { name: { ko: "신금 · 보석", en: "Yin Metal · a cut gem" }, line: { ko: "작고 정밀한 기운입니다. 기준이 높고 마감이 깔끔하며, 섬세한 것을 알아봅니다. 흠에 예민한 만큼 스스로에게도 엄격합니다.", en: "Small and precise. High standards, clean finish, an eye for the fine. Sensitive to flaws, strict with itself too." } },
  壬: { name: { ko: "임수 · 바다", en: "Yang Water · the sea" }, line: { ko: "넓게 흐르는 기운입니다. 생각의 폭이 크고 담는 양이 많으며, 막히면 돌아갑니다. 깊이를 보여 주는 데는 시간이 걸립니다.", en: "Flows wide. Broad in thought and large in capacity, going around what blocks it. Showing its depth takes time." } },
  癸: { name: { ko: "계수 · 비와 이슬", en: "Yin Water · rain and dew" }, line: { ko: "스며드는 기운입니다. 눈치가 빠르고 감이 좋으며, 조용히 영향을 줍니다. 드러내지 않는 만큼 오해받을 때가 있습니다.", en: "Seeps in. Quick to read a room, intuitive, quietly influential. Being unshown, it is sometimes misread." } },
};

export const ELEMENT_TEXT: Record<Element, { strong: Text; missing: Text }> = {
  wood: { strong: { ko: "나무가 많습니다. 시작하고 뻗는 힘이 앞서고, 계획보다 성장이 먼저 보입니다.", en: "Wood leads. Starting and reaching come first, growth shows before the plan." }, missing: { ko: "나무가 비어 있습니다. 새로 벌이는 일은 의식적으로 자리를 만들어 주는 편이 좋습니다.", en: "Wood is empty. New beginnings may need a deliberate space of their own." } },
  fire: { strong: { ko: "불이 많습니다. 표현과 열기가 앞서고, 주변을 움직이는 쪽입니다.", en: "Fire leads. Expression and heat come first, moving the people around you." }, missing: { ko: "불이 비어 있습니다. 드러내는 일은 따로 챙기지 않으면 뒤로 밀립니다.", en: "Fire is empty. Showing your work slips unless you make time for it." } },
  earth: { strong: { ko: "흙이 많습니다. 받아 주고 버티는 힘이 앞서고, 안정을 먼저 찾습니다.", en: "Earth leads. Holding and enduring come first, stability before anything." }, missing: { ko: "흙이 비어 있습니다. 쉬어 가는 자리와 바탕을 일부러 두면 좋습니다.", en: "Earth is empty. A resting place and a base are worth setting on purpose." } },
  metal: { strong: { ko: "쇠가 많습니다. 기준과 마감이 앞서고, 정리하는 쪽입니다.", en: "Metal leads. Standards and finish come first, tidying what is loose." }, missing: { ko: "쇠가 비어 있습니다. 끝맺음과 거절은 연습이 필요한 자리입니다.", en: "Metal is empty. Closing things and saying no take practice." } },
  water: { strong: { ko: "물이 많습니다. 생각과 흐름이 앞서고, 깊이 들어가는 쪽입니다.", en: "Water leads. Thought and flow come first, going deep." }, missing: { ko: "물이 비어 있습니다. 머무는 생각보다 흘려보내는 쪽을 챙기면 좋습니다.", en: "Water is empty. Letting thoughts move on deserves some care." } },
};
