/* Lucian UX/UI Prompt #039 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#039 */
// 미끄러지는 알약 탭. 탭은 앱 분류, 줄은 그 분류의 앱이고 줄을 누르면 앱 상세로 간다
import { useEffect, useId, useRef } from "react";
import "./U039.css";

export type U039Row = { name: string; badge: string; note: string; href: string; art: string };
export type U039Tab = { label: string; rows: U039Row[] };

type Props = { tabs: U039Tab[]; label: string; onNavigate: (href: string) => void };

export function U039({ tabs: data, label, onNavigate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();
  const navRef = useRef(onNavigate);
  useEffect(() => {
    navRef.current = onNavigate;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>(".u039-tab"));
    const pill = root.querySelector<HTMLElement>(".u039-pill")!;
    const panel = root.querySelector<HTMLElement>(".u039-panel")!;
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const timers = new Set<number>();
    const rm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    let cur = 0;
    let list: HTMLUListElement | null = null;
    function movePill(animate: boolean) {
      const t = tabs[cur];
      if (!animate) pill.style.transition = "none";
      pill.style.setProperty("--x", t.offsetLeft + "px");
      pill.style.setProperty("--w", t.offsetWidth + "px");
      if (!animate) {
        void pill.offsetWidth;
        pill.style.transition = "";
      }
    }
    // 원래는 innerHTML 로 줄을 만들지만 여기선 실제 데이터라 DOM 으로 짓는다
    function make(i: number) {
      const ul = document.createElement("ul");
      ul.className = "u039-list";
      data[i].rows.forEach((r, k) => {
        const li = document.createElement("li");
        li.className = "u039-row";
        li.style.transitionDelay = k * 45 + "ms";
        const art = document.createElement("span");
        art.className = "u039-art";
        art.style.setProperty("--g", r.art);
        art.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        const b = document.createElement("b");
        const a = document.createElement("a");
        a.href = r.href;
        a.textContent = r.name;
        b.append(a);
        if (r.badge) {
          const badge = document.createElement("span");
          badge.className = "u039-badge";
          badge.textContent = r.badge;
          b.append(badge);
        }
        const small = document.createElement("small");
        small.textContent = r.note;
        text.append(b, small);
        const em = document.createElement("em");
        em.textContent = "→";
        em.setAttribute("aria-hidden", "true");
        li.append(art, text, em);
        ul.append(li);
      });
      return ul;
    }
    // 새 목록은 이동한 방향에서 들어오고, 이전 목록은 반대쪽으로 빠진다. 줄마다 조금씩 늦게 움직인다
    function select(i: number, focus?: boolean) {
      if (i === cur && list) return;
      const dir = i > cur ? 1 : -1;
      cur = i;
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      movePill(true);
      const next = make(i);
      const old = list;
      list = next;
      if (!old || rm()) {
        if (old) old.remove();
        panel.appendChild(next);
        return;
      }
      Array.from(next.children as HTMLCollectionOf<HTMLElement>).forEach((r) => {
        r.style.transform = "translateX(" + dir * 70 + "%)";
        r.style.opacity = "0";
      });
      panel.appendChild(next);
      void next.offsetWidth;
      Array.from(next.children as HTMLCollectionOf<HTMLElement>).forEach((r) => {
        r.style.transform = "";
        r.style.opacity = "";
      });
      Array.from(old.children as HTMLCollectionOf<HTMLElement>).forEach((r) => {
        r.style.transform = "translateX(" + -dir * 60 + "%)";
        r.style.opacity = "0";
      });
      const id = window.setTimeout(() => {
        timers.delete(id);
        old.remove();
      }, 700);
      timers.add(id);
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i), on);
      t.addEventListener(
        "keydown",
        (e) => {
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (d) {
            e.preventDefault();
            select((i + d + tabs.length) % tabs.length, true);
          }
        },
        on,
      );
    });
    // 줄 링크는 사이트 라우터로 보낸다. 새 탭 열기 같은 수정 키는 브라우저에 맡긴다
    panel.addEventListener(
      "click",
      (e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navRef.current(a.getAttribute("href")!);
      },
      on,
    );
    list = make(0);
    panel.appendChild(list);
    tabs.forEach((t, k) => {
      t.setAttribute("aria-selected", String(k === 0));
      t.tabIndex = k === 0 ? 0 : -1;
    });
    movePill(false);
    return () => {
      ac.abort();
      timers.forEach((id) => window.clearTimeout(id));
      panel.replaceChildren();
    };
  }, [data]);

  return (
    <div ref={ref} className="ux u039">
      <div className="u039-tabs" role="tablist" aria-label={label}>
        <span className="u039-pill" aria-hidden="true" />
        {data.map((t) => (
          <button key={t.label} className="u039-tab" type="button" role="tab" aria-controls={uid}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="u039-panel" role="tabpanel" id={uid} />
    </div>
  );
}
