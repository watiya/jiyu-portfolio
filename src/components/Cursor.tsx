import { useEffect, useRef } from "react";
import { useTokens } from "../tokens/useTokens.ts";

// 설계 도면 커서. 십자선 + 좌표, 짚을 수 있는 것 위에선 링이 그 요소의 토큰 이름을 읽는다.
// 마우스(정밀 포인터)에서만 켠다. 터치·펜은 기본 동작 그대로.
const INTERACTIVE = "a, button, [role='button'], [role='option'], summary, label, select";

export function Cursor() {
  const { inspect } = useTokens();
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const el = root.current!;
    const r = ring.current!;
    const lb = label.current!;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.dataset.on = "";
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = e.target as Element | null;
      const field = t?.closest("input, textarea, [contenteditable='true']");
      const slider = t?.closest("[role='slider']");
      const hit = slider ?? t?.closest(INTERACTIVE);
      el.dataset.mode = field ? "text" : slider ? "drag" : hit ? "hit" : "idle";

      if (hit && !field) {
        const box = hit.getBoundingClientRect();
        // 작은 요소는 요소 테두리에 맞추고, 큰 요소(카드)는 커서 둘레 링으로 둔다
        if (box.width <= 320 && box.height <= 80) {
          r.style.width = `${box.width + 8}px`;
          r.style.height = `${box.height + 8}px`;
          r.style.transform = `translate3d(${box.left - 4 - e.clientX}px, ${box.top - 4 - e.clientY}px, 0)`;
        } else {
          r.style.width = r.style.height = "32px";
          r.style.transform = "translate3d(-16px, -16px, 0)";
        }
      } else {
        r.style.width = r.style.height = "0px";
        r.style.transform = "translate3d(0, 0, 0)";
      }

      const tok = t?.closest("[data-token]")?.getAttribute("data-token")?.split(/\s+/)[0];
      lb.textContent = slider ? "drag ↔" : hit && tok ? tok : `${Math.round(e.clientX)}, ${Math.round(e.clientY)}`;
    };
    const onLeave = () => delete el.dataset.on;
    const onDown = () => (el.dataset.down = "");
    const onUp = () => delete el.dataset.down;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={root} className="cursor" data-inspect={inspect || undefined} aria-hidden="true">
      <div ref={ring} className="cursor__ring" />
      <i className="cursor__x" />
      <i className="cursor__y" />
      <span ref={label} className="cursor__label" />
    </div>
  );
}
