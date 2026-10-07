// 콘텐츠 정본(영문)에 한국어판을 덧입혀 돌려준다. 화면은 이 함수들만 쓴다.
import { APPS, JOURNEY, NOW, STEPS, WRITING, type App } from "../data.ts";
import { APPS_KO, JOURNEY_KO, NOW_KO, STEPS_KO, WRITING_KO } from "../data.ko.ts";
import { APP_DETAILS, type AppDetail } from "../appDetails.ts";
import { APP_DETAILS_KO } from "../appDetails.ko.ts";
import type { Lang } from "./lang.ts";

export type LocalApp = App & { koName?: string };

export function getApps(lang: Lang): LocalApp[] {
  if (lang === "en") return APPS;
  return APPS.map((a) => {
    const k = APPS_KO[a.name];
    return k ? { ...a, badge: k.badge, kind: k.kind, note: k.note, line: k.line, koName: k.koName } : a;
  });
}

export function getSteps(lang: Lang) {
  return lang === "en" ? STEPS : STEPS.map((s, i) => STEPS_KO[i] ?? s);
}

export function getJourney(lang: Lang) {
  return lang === "en" ? JOURNEY : JOURNEY.map((j) => ({ ...j, ...JOURNEY_KO[j.company] }));
}

export function getWriting(lang: Lang) {
  return lang === "en" ? WRITING : WRITING.map((w) => ({ ...w, ...WRITING_KO[w.slug] }));
}

// 최근 글 n 건. WRITING 은 최신 글부터 적는다
export function getRecentWriting(lang: Lang, n: number) {
  return getWriting(lang).slice(0, n);
}

export function getNow(lang: Lang) {
  return { asOf: NOW.asOf, items: lang === "en" ? NOW.items : NOW.items.map((it, i) => NOW_KO[i] ?? it) };
}

// YYYY-MM-DD 를 언어에 맞는 표기로. 시간대에 밀리지 않게 문자열로 가른다
export function formatDay(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (lang === "ko") return `${y}. ${m}. ${d}.`;
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${d}, ${y}`;
}

export function getAppDetails(lang: Lang): AppDetail[] {
  if (lang === "en") return APP_DETAILS;
  return APP_DETAILS.map((d) => {
    const k = APP_DETAILS_KO[d.slug];
    return k ? { ...d, title: k.title, dek: k.dek, date: k.date, meta: k.meta, sections: k.sections } : d;
  });
}

export const koNameOf = (name: string) => APPS_KO[name]?.koName;

// 영문 라벨("Status" 등)로 메타 값을 찾는다. 한국어판은 라벨이 다르므로 영문 정본의 자리로 맞춘다
export function metaValue(detail: AppDetail, enLabel: string) {
  const canon = APP_DETAILS.find((d) => d.slug === detail.slug);
  const i = canon ? canon.meta.findIndex((m) => m.label === enLabel) : -1;
  return i >= 0 ? detail.meta[i]?.value : undefined;
}
