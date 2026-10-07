// 언어 상태의 순수 부분. 결정 순서: URL ?lang > localStorage > navigator.language(ko*) > en
export type Lang = "en" | "ko";
export const LANGS: Lang[] = ["en", "ko"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_KEY = "v8.lang";

export const isLang = (v: unknown): v is Lang => v === "en" || v === "ko";

export function resolveLang(query: string | null | undefined, stored: string | null | undefined, navigatorLang: string | null | undefined): Lang {
  if (isLang(query)) return query;
  if (isLang(stored)) return stored;
  if (navigatorLang && /^ko\b/i.test(navigatorLang)) return "ko";
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
  return resolveLang(new URLSearchParams(window.location.search).get("lang"), stored, window.navigator.language);
}

export function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // 무시
  }
}
