/* Lucian UX/UI Prompt #017 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#017 */
// 기울어지는 값 말풍선 슬라이더. 값은 사이트의 radius 다이얼(0~24px)이고, 바꾸면 onChange 로 다이얼을 돌린다
import { useEffect, useRef, useState } from "react";
import "./U017.css";

type Props = {
  value: number;
  max: number;
  onChange: (v: number) => void;
  title: string;
  maxText: string;
  label: string;
};

const TICKS = 4;

export function U017({ value, max, onChange, title, maxText, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const sync = useRef<((v: number) => void) | null>(null);
  const changeRef = useRef(onChange);
  // 첫 값만 마크업에 둔다. 이후 --v 는 스크립트만 쓴다
  const [initial] = useState(value);
  useEffect(() => {
    changeRef.current = onChange;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>(".u017-track")!;
    const thumb = root.querySelector<HTMLElement>(".u017-thumb")!;
    const bub = root.querySelector<HTMLElement>(".u017-bub")!;
    const out = root.querySelector<HTMLElement>(".u017-val")!;
    const ticks = Array.from(root.querySelectorAll<HTMLElement>(".u017-ticks span"));
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const rm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    const MAX = max;
    const STEP = 1;
    const PAGE = MAX / TICKS;
    let v = initial;
    let sent = v;
    let lastX = 0;
    let lastT = 0;
    let still = 0;
    function render() {
      const p = v / MAX;
      root!.style.setProperty("--v", p.toFixed(4));
      out.textContent = `${v}px`;
      thumb.setAttribute("aria-valuenow", String(v));
      thumb.setAttribute("aria-valuetext", `${v}px`);
      ticks.forEach((t, i) => t.classList.toggle("on", i / TICKS <= p + 0.001));
    }
    // 값이 바뀌었을 때만 다이얼로 보낸다
    function commit() {
      render();
      if (v !== sent) {
        sent = v;
        changeRef.current(v);
      }
    }
    // 움직이는 속도에 비례해 말풍선이 반대쪽으로 기울고, 멈추면 0도로 돌아온다
    function tilt(deg: number) {
      if (rm()) return;
      bub.style.setProperty("--tilt", Math.max(-22, Math.min(22, deg)).toFixed(1) + "deg");
      window.clearTimeout(still);
      still = window.setTimeout(() => bub.style.setProperty("--tilt", "0deg"), 90);
    }
    function fromX(x: number) {
      const r = track.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (x - r.left) / r.width));
      v = Math.round((p * MAX) / STEP) * STEP;
      commit();
    }
    track.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        track.setPointerCapture(e.pointerId);
        root.classList.add("is-drag");
        lastX = e.clientX;
        lastT = performance.now();
        fromX(e.clientX);
        thumb.focus({ preventScroll: true });
      },
      on,
    );
    track.addEventListener(
      "pointermove",
      (e) => {
        if (!track.hasPointerCapture(e.pointerId)) return;
        const now = performance.now();
        const vel = (e.clientX - lastX) / Math.max(8, now - lastT);
        lastX = e.clientX;
        lastT = now;
        tilt(-vel * 14);
        fromX(e.clientX);
      },
      on,
    );
    const end = () => {
      root.classList.remove("is-drag");
      bub.style.setProperty("--tilt", "0deg");
    };
    track.addEventListener("pointerup", end, on);
    track.addEventListener("pointercancel", end, on);
    thumb.addEventListener(
      "keydown",
      (e) => {
        const steps: Record<string, number> = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP, PageUp: PAGE, PageDown: -PAGE, Home: -MAX, End: MAX };
        const d = steps[e.key];
        if (!d) return;
        e.preventDefault();
        v = Math.max(0, Math.min(MAX, v + d));
        tilt(d > 0 ? -9 : 9);
        commit();
      },
      on,
    );
    // 다이얼이 다른 곳(토큰 패널·프리셋)에서 바뀌면 끌고 있지 않을 때만 따라간다
    sync.current = (next) => {
      if (root.classList.contains("is-drag") || next === v) return;
      v = Math.max(0, Math.min(MAX, next));
      sent = v;
      render();
    };
    render();
    return () => {
      ac.abort();
      window.clearTimeout(still);
      sync.current = null;
    };
  }, [max, initial]);

  useEffect(() => {
    sync.current?.(value);
  }, [value]);

  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((max * i) / TICKS));
  return (
    <div ref={ref} className="ux u017" style={{ "--v": initial / max } as React.CSSProperties}>
      <div className="u017-head">
        <b>{title}</b>
        <span>{maxText}</span>
      </div>
      <div className="u017-track">
        <span className="u017-fill" aria-hidden="true" />
        <span className="u017-bub" aria-hidden="true">
          <span className="u017-val" />
        </span>
        <span className="u017-thumb" role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={max} />
      </div>
      <div className="u017-ticks" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
