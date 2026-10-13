// 컴포넌트 밖에서도 쓰는 작은 함수들. 컴포넌트 파일에서 내보내면 Fast Refresh 가 깨져서 따로 둔다.
import { APP_DETAILS } from "./appDetails.ts";
import { APPS } from "./data.ts";
import { PRESETS, type Dials } from "./tokens/engine.ts";

// APPS 의 name 으로 상세와 프리셋을 잇는다
export const slugOf = (name: string) => APP_DETAILS.find((d) => d.name === name)?.slug ?? name.toLowerCase().replace(/\s+/g, "-");

// 지금 다이얼이 어느 프리셋과 정확히 같은지
export const activePresetOf = (dials: Dials) => PRESETS.find((p) => Object.entries(p.dials).every(([k, v]) => dials[k as keyof Dials] === v));

// 주 행동 문구는 영문 원본 데이터로 고른다. 주소가 없으면 null 이고, 화면은 버튼 없이 상태만 둔다
export function ctaOf(name: string, slug: string): { kind: "web" | "site" | "prototype"; href: string } | null {
  const app = APPS.find((a) => a.name === name);
  if (!app?.href) return null;
  const status = APP_DETAILS.find((d) => d.slug === slug)?.meta.find((m) => m.label === "Status")?.value ?? "";
  const kind = /prototype/i.test(status) ? "prototype" : /web/i.test(app.note) ? "web" : "site";
  return { kind, href: app.href };
}

// 부분수열 매칭. 연속 일치와 단어 첫 글자에 가산점. 0 이면 불일치
export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 1;
  let ti = 0;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return 0;
    const wordStart = found === 0 || /[\s./-]/.test(t[found - 1]);
    streak = found === ti ? streak + 1 : 0;
    score += 1 + streak + (wordStart ? 2 : 0);
    ti = found + 1;
  }
  return score;
}
