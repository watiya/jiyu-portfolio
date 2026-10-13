/* Lucian UX/UI Prompt #044 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#044 */
// 자주 묻는 질문 아코디언. 답변 아래 링크는 사이트 안 경로면 라우터로, mailto 는 브라우저로 보낸다
import { useEffect, useId, useRef } from "react";
import "./U044.css";

export type U044Item = { q: string; a: string; link: string; href: string };

type Props = { items: U044Item[]; onNavigate: (href: string) => void };

export function U044({ items: data, onNavigate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();
  const navRef = useRef(onNavigate);
  useEffect(() => {
    navRef.current = onNavigate;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".u044-it"));
    const qs = items.map((it) => it.querySelector<HTMLButtonElement>(".u044-q")!);
    const ac = new AbortController();
    const on = { signal: ac.signal };
    function set(it: HTMLElement, open: boolean) {
      it.classList.toggle("open", open);
      it.querySelector(".u044-q")!.setAttribute("aria-expanded", String(open));
      // 접힌 답변 속 링크는 탭 순서에서 빠진다
      it.querySelector<HTMLAnchorElement>(".u044-a a")!.tabIndex = open ? 0 : -1;
    }
    items.forEach((it, i) => {
      set(it, it.classList.contains("open"));
      qs[i].addEventListener(
        "click",
        () => {
          const willOpen = !it.classList.contains("open");
          items.forEach((o) => {
            if (o !== it) set(o, false);
          });
          set(it, willOpen);
        },
        on,
      );
      qs[i].addEventListener(
        "keydown",
        (e) => {
          const n = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? qs.length - 1 : -2;
          if (n === -2) return;
          e.preventDefault();
          qs[(n + qs.length) % qs.length].focus();
        },
        on,
      );
      it.querySelector(".u044-a a")!.addEventListener(
        "click",
        (e) => {
          const me = e as MouseEvent;
          const href = (me.currentTarget as HTMLAnchorElement).getAttribute("href") ?? "";
          if (!href.startsWith("/") || me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;
          me.preventDefault();
          navRef.current(href);
        },
        on,
      );
    });
    return () => ac.abort();
  }, [data]);

  return (
    <div ref={ref} className="ux u044">
      {data.map((item, i) => {
        const n = String(i + 1).padStart(2, "0");
        return (
          <div key={n} className={i === 0 ? "u044-it open" : "u044-it"}>
            <button className="u044-q" type="button" id={`${uid}-q${i}`} aria-controls={`${uid}-a${i}`} aria-expanded={i === 0}>
              <span className="u044-n">{n}</span>
              <span className="u044-t">{item.q}</span>
              <span className="u044-pm" aria-hidden="true" />
            </button>
            <div className="u044-body" role="region" id={`${uid}-a${i}`} aria-labelledby={`${uid}-q${i}`}>
              <div>
                <div className="u044-a">
                  <p>{item.a}</p>
                  <a href={item.href}>
                    {item.link} <i aria-hidden="true">→</i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
