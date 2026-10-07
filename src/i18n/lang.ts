// 언어 상태의 순수 부분. 결정 순서: URL ?lang > localStorage > ko
// 첫 진입은 기기 언어와 상관없이 한국어다 (2026-10-07). 영어는 토글로 고르면 저장된다.
export type Lang = "en" | "ko";
export const LANGS: Lang[] = ["en", "ko"];
export const DEFAULT_LANG: Lang = "ko";
export const LANG_KEY = "v8.lang";

export const isLang = (v: unknown): v is Lang => v === "en" || v === "ko";

export function resolveLang(query: string | null | undefined, stored: string | null | undefined): Lang {
  if (isLang(query)) return query;
  if (isLang(stored)) return stored;
  return DEFAULT_LANG;
}

export function readLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(LANG_KEY);
  } catch {
    // 저장소가 막혀 있어도 동작한다
  }
  return resolveLang(new URLSearchParams(window.location.search).get("lang"), stored);
}

export function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // 무시
  }
}
