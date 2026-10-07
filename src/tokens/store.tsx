// 다이얼 상태: URL 쿼리 > localStorage > 기본값. 변경 시 :root 에 CSS 변수를 심고 보정 건수를 알린다.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TokenContext, type ToastItem, type TokenCtx } from "./context.ts";
import { DEFAULT_DIALS, buildTokens, dialsToQuery, parseDials, presetBySlug, sameDials, type Dials } from "./engine.ts";
import { useLang } from "../i18n/useLang.ts";
import { DEFAULT_LANG } from "../i18n/lang.ts";

const STORAGE_KEY = "v8.tokens";
const QUERY_KEYS = ["hue", "sec", "neutral", "pairing", "radius", "density", "motion", "theme"];

function readInitial(): Dials {
  if (typeof window === "undefined") return DEFAULT_DIALS;
  const q = new URLSearchParams(window.location.search);
  // ?preset=<slug> 는 그 앱의 토큰으로 시작한다
  const preset = q.get("preset") ? presetBySlug(q.get("preset") as string) : undefined;
  if (preset) return { ...DEFAULT_DIALS, ...preset.dials };
  if (QUERY_KEYS.some((k) => q.has(k))) return parseDials(q);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return parseDials(JSON.parse(raw));
  } catch {
    // 저장소가 막혀 있어도 사이트는 동작한다
  }
  return DEFAULT_DIALS;
}

function persist(d: Dials) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // 무시
  }
}

const mqReduced = () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { lang, t } = useLang();
  const T = t.toasts;
  // 보정 알림은 다이얼이 바뀔 때만. 언어 교체로 다시 울리지 않게 ref 로 읽는다
  const TRef = useRef(T);
  useEffect(() => {
    TRef.current = T;
  }, [T]);
  const [dials, setDials] = useState<Dials>(readInitial);
  const [panelOpen, setPanelOpen] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [reducedMotion, setReducedMotion] = useState(() => mqReduced()?.matches ?? false);
  // 모션 줄이기는 off 로 취급한다. 다이얼 값 자체는 사용자 선택을 지킨다
  const tokens = useMemo(() => buildTokens(reducedMotion ? { ...dials, motion: "off" } : dials), [dials, reducedMotion]);
  const toastId = useRef(0);
  const firstRun = useRef(true);

  useEffect(() => {
    const mq = mqReduced();
    if (!mq) return;
    const on = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (text: string, action?: ToastItem["action"]) => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-2), { id, text, action }]);
      window.setTimeout(() => dismissToast(id), action ? 6000 : 3600);
    },
    [dismissToast],
  );

  // CSS 변수 주입. 첫 렌더 전에 심어 깜빡임을 줄인다
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(tokens.vars)) root.style.setProperty(k, v);
    root.dataset.theme = dials.theme;
    root.dataset.motion = tokens.dials.motion;
    root.style.colorScheme = dials.theme;
  }, [tokens, dials.theme]);

  // 보정 알림: 사용자가 바꾼 뒤에만 (첫 로드는 조용히)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    persist(dials);
    const n = tokens.fixes.length;
    if (n > 0) {
      const names = tokens.fixes.map((f) => f.token).join(", ");
      toast(TRef.current.fixed(n, names));
    }
  }, [dials, tokens, toast]);

  useEffect(() => {
    document.documentElement.dataset.inspect = inspect ? "on" : "off";
  }, [inspect]);
  useEffect(() => {
    document.documentElement.dataset.panel = panelOpen ? "open" : "closed";
  }, [panelOpen]);

  // 색상 다이얼을 직접 돌리면 프리셋의 둘째 색은 내려놓는다
  const set = useCallback((patch: Partial<Dials>) => {
    setDials((d) => parseDials({ ...d, ...patch, ...(patch.hue !== undefined && patch.secondary === undefined ? { secondary: null } : {}) }, d));
  }, []);
  const reset = useCallback(() => {
    setDials(DEFAULT_DIALS);
    toast(T.reset);
  }, [toast, T]);
  const applyPreset = useCallback(
    (slug: string, withUndo = false) => {
      const p = presetBySlug(slug);
      if (!p) return;
      setDials((prev) => {
        const next = parseDials({ ...DEFAULT_DIALS, ...p.dials });
        if (withUndo) {
          const before = prev;
          toast(T.wearing(p.name), { label: T.undo, onClick: () => setDials(before) });
        } else {
          toast(T.wearing(p.name));
        }
        return next;
      });
    },
    [toast, T],
  );
  const copyLink = useCallback(async () => {
    // 기본 언어가 아닐 때만 lang 을 붙인다
    const q = [dialsToQuery(dials), lang !== DEFAULT_LANG ? `lang=${lang}` : ""].filter(Boolean).join("&");
    const url = `${window.location.origin}${window.location.pathname}${q ? `?${q}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      toast(T.linkCopied);
      return true;
    } catch {
      toast(T.linkFailed);
      window.history.replaceState(null, "", url);
      return false;
    }
  }, [dials, lang, toast, T]);

  const value = useMemo<TokenCtx>(
    () => ({
      dials,
      tokens,
      isDefault: sameDials(dials, DEFAULT_DIALS),
      reducedMotion,
      set,
      reset,
      applyPreset,
      copyLink,
      panelOpen,
      setPanelOpen,
      inspect,
      setInspect,
      paletteOpen,
      setPaletteOpen,
      toasts,
      toast,
      dismissToast,
    }),
    [dials, tokens, reducedMotion, set, reset, applyPreset, copyLink, panelOpen, inspect, paletteOpen, toasts, toast, dismissToast],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}
