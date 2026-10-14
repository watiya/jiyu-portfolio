// 다이얼 상태: URL 쿼리 > localStorage > 기본값. 변경 시 :root 에 CSS 변수를 심고 보정 건수를 알린다.
// 변경 기록(되돌리기·다시하기)과 검사 모드에서 짚은 메모도 여기서 들고 있다.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TokenContext, type ToastItem, type TokenCtx } from "./context.ts";
import { DEFAULT_DIALS, PRESET_BASE, buildTokens, dialsToQuery, parseDials, presetBySlug, sameDials, type Dials } from "./engine.ts";
import { record, redo as redoStep, seal, startHistory, undo as undoStep } from "./history.ts";
import { parseNotes, toAgentBundle, type Note } from "./bundle.ts";
import { themeLink } from "./export.ts";
import { useLang } from "../i18n/useLang.ts";
import { DEFAULT_LANG } from "../i18n/lang.ts";

const STORAGE_KEY = "v8.tokens";
// 메모는 세션 동안만. 탭을 닫으면 사라진다
const NOTES_KEY = "v8.notes";
const QUERY_KEYS = ["hue", "pri", "sec", "neutral", "paper", "pairing", "radius", "scale", "density", "motion", "theme"];

function readInitial(): Dials {
  if (typeof window === "undefined") return DEFAULT_DIALS;
  const q = new URLSearchParams(window.location.search);
  // ?preset=<slug> 는 그 앱의 토큰으로 시작한다
  const preset = q.get("preset") ? presetBySlug(q.get("preset") as string) : undefined;
  if (preset) return { ...PRESET_BASE, ...preset.dials };
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

function readNotes(): Note[] {
  try {
    return parseNotes(JSON.parse(window.sessionStorage.getItem(NOTES_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

// 입력칸에서는 ⌘Z 를 그 칸에 맡긴다
const typing = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
};

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
  // 기록 본체는 ref, 화면에는 단계 수만 상태로 내보낸다
  const hist = useRef(startHistory(dials));
  const [steps, setSteps] = useState({ back: 0, fwd: 0 });
  const [notes, setNotes] = useState<Note[]>(readNotes);

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

  // 다이얼이 바뀔 때마다 기록. 되돌리기로 온 값은 present 와 같아서 다시 쌓이지 않는다
  useEffect(() => {
    const next = record(hist.current, dials, Date.now());
    if (next === hist.current) return;
    hist.current = next;
    setSteps({ back: next.past.length, fwd: next.future.length });
  }, [dials]);

  const step = useCallback((dir: "back" | "fwd") => {
    const next = dir === "back" ? undoStep(hist.current) : redoStep(hist.current);
    if (next === hist.current) return;
    hist.current = next;
    setSteps({ back: next.past.length, fwd: next.future.length });
    setDials(next.present);
  }, []);
  const undo = useCallback(() => step("back"), [step]);
  const redo = useCallback(() => step("fwd"), [step]);

  // 누르고 뗄 때 묶음을 닫는다: 드래그 한 번, 키 한 번이 한 단계. ⌘Z · ⇧⌘Z 는 사이트 어디서나
  useEffect(() => {
    const close = () => (hist.current = seal(hist.current));
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || (e.key !== "z" && e.key !== "Z") || typing(e.target)) return;
      e.preventDefault();
      step(e.shiftKey ? "fwd" : "back");
    };
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("pointerup", close);
    window.addEventListener("keyup", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("pointerup", close);
      window.removeEventListener("keyup", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [step]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      // 무시
    }
  }, [notes]);
  const addNote = useCallback((n: Omit<Note, "id">) => setNotes((list) => [...list, { ...n, id: Math.max(0, ...list.map((x) => x.id)) + 1 }]), []);
  const removeNote = useCallback((id: number) => setNotes((list) => list.filter((x) => x.id !== id)), []);
  const clearNotes = useCallback(() => setNotes([]), []);
  // 링크와 값은 사용자가 고른 다이얼 그대로 (모션 줄이기 보정 전)
  const copyBundle = useCallback(async () => {
    const chosen = buildTokens(dials);
    try {
      await navigator.clipboard.writeText(toAgentBundle(chosen, notes, themeLink(chosen)));
      toast(T.bundleCopied(notes.length));
      return true;
    } catch {
      toast(T.copyFailed);
      return false;
    }
  }, [dials, notes, toast, T]);

  useEffect(() => {
    document.documentElement.dataset.inspect = inspect ? "on" : "off";
  }, [inspect]);
  useEffect(() => {
    document.documentElement.dataset.panel = panelOpen ? "open" : "closed";
  }, [panelOpen]);

  // 색상 다이얼을 직접 돌리면 프리셋의 브랜드 색(primary·secondary)은 내려놓는다
  const set = useCallback((patch: Partial<Dials>) => {
    setDials((d) =>
      parseDials(
        {
          ...d,
          ...patch,
          ...(patch.hue !== undefined && patch.secondary === undefined ? { secondary: null } : {}),
          ...(patch.hue !== undefined && patch.primary === undefined ? { primary: null } : {}),
        },
        d,
      ),
    );
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
        const next = parseDials({ ...PRESET_BASE, ...p.dials });
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
      history: steps,
      undo,
      redo,
      notes,
      addNote,
      removeNote,
      clearNotes,
      copyBundle,
    }),
    [dials, tokens, reducedMotion, set, reset, applyPreset, copyLink, panelOpen, inspect, paletteOpen, toasts, toast, dismissToast, steps, undo, redo, notes, addNote, removeNote, clearNotes, copyBundle],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}
