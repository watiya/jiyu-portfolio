// 토큰 컨텍스트의 모양. 훅과 Provider 는 각자 파일에 둔다 (fast refresh 때문에 분리).
import { createContext } from "react";
import type { Dials, Tokens } from "./engine.ts";

export type ToastItem = { id: number; text: string; action?: { label: string; onClick: () => void } };

export type TokenCtx = {
  dials: Dials;
  tokens: Tokens;
  isDefault: boolean;
  reducedMotion: boolean;
  set: (patch: Partial<Dials>) => void;
  reset: () => void;
  applyPreset: (slug: string, withUndo?: boolean) => void;
  copyLink: () => Promise<boolean>;
  panelOpen: boolean;
  setPanelOpen: (open: boolean | ((v: boolean) => boolean)) => void;
  inspect: boolean;
  setInspect: (v: boolean | ((v: boolean) => boolean)) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  toasts: ToastItem[];
  toast: (text: string, action?: ToastItem["action"]) => void;
  dismissToast: (id: number) => void;
  // 변경 기록: 되돌릴 수 있는 단계(back)와 다시 할 수 있는 단계(fwd)
  history: { back: number; fwd: number };
  undo: () => void;
  redo: () => void;
};

export const TokenContext = createContext<TokenCtx | null>(null);
