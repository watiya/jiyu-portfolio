// 언어 Provider. <html lang> 을 맞추고 선택을 저장한다. 토큰·스크롤은 건드리지 않는다.
import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { LangContext, type LangCtx } from "./context.ts";
import { persistLang, readLang, type Lang } from "./lang.ts";
import { STRINGS } from "./ui.ts";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    persistLang(l);
  }, []);

  const value = useMemo<LangCtx>(() => ({ lang, setLang, t: STRINGS[lang] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
