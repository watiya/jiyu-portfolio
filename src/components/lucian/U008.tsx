/* Lucian UX/UI Prompt #008 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#008 */
// 복사 버튼 체크 전환. 설치 명령어 대신 연락처를 복사한다. 탭은 이메일·GitHub, 앞부분(head)은 먹색, 뒷부분(tail)은 포인트색
import { useEffect, useRef } from "react";
import "./U008.css";

export type U008Option = { tab: string; head: string; tail: string; copy: string; aria: string };

type Props = { options: U008Option[]; tablist: string; copied: string };

export function U008({ options, tablist, copied }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const btn = root.querySelector<HTMLButtonElement>(".u008-btn")!;
    const cmd = root.querySelector<HTMLElement>(".u008-cmd")!;
    const tip = root.querySelector<HTMLElement>(".u008-tip")!;
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>(".u008-tab"));
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const rm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    let t = 0;
    let cur = 0;
    tip.textContent = "";
    // 실제 클립보드에 쓰고, 막힌 환경에서도 화면 반응은 똑같이 보여 준다
    function write(s: string) {
      try {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s).catch(() => {});
      } catch {
        // 무시
      }
      return Promise.resolve();
    }
    function show(i: number) {
      const b = document.createElement("b");
      b.textContent = options[i].tail;
      cmd.replaceChildren(options[i].head, b);
      btn.setAttribute("aria-label", options[i].aria);
    }
    btn.addEventListener(
      "click",
      () => {
        void write(options[cur].copy);
        window.clearTimeout(t);
        root.classList.remove("is-copied");
        void root.offsetWidth;
        root.classList.add("is-copied");
        tip.textContent = copied;
        t = window.setTimeout(() => {
          if (root.isConnected) {
            root.classList.remove("is-copied");
            tip.textContent = "";
          }
        }, 1800);
      },
      on,
    );
    // 탭을 바꾸면 값이 위에서 내려오며 바뀐다
    function select(i: number) {
      cur = i;
      tabs.forEach((tb, k) => {
        tb.setAttribute("aria-selected", String(k === i));
        tb.tabIndex = k === i ? 0 : -1;
      });
      show(i);
      if (cmd.animate && !rm()) cmd.animate([{ transform: "translateY(-60%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 360, easing: "cubic-bezier(.34,1.45,.64,1)" });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i), on);
      tab.addEventListener(
        "keydown",
        (e) => {
          const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (d) {
            e.preventDefault();
            const n = (i + d + tabs.length) % tabs.length;
            select(n);
            tabs[n].focus();
          }
        },
        on,
      );
    });
    tabs.forEach((tb, k) => {
      tb.setAttribute("aria-selected", String(k === 0));
      tb.tabIndex = k === 0 ? 0 : -1;
    });
    show(0);
    return () => {
      ac.abort();
      window.clearTimeout(t);
      root.classList.remove("is-copied");
    };
  }, [options, copied]);

  return (
    <div ref={ref} className="ux u008">
      <div className="u008-tabs" role="tablist" aria-label={tablist}>
        {options.map((o) => (
          <button key={o.tab} className="u008-tab" type="button" role="tab">
            {o.tab}
          </button>
        ))}
      </div>
      <div className="u008-box">
        <code className="u008-code">
          <em aria-hidden="true">›</em>
          <span className="u008-cmd" />
        </code>
        <button className="u008-btn" type="button">
          <svg className="u008-cp" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
            <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
          </svg>
          <svg className="u008-ok" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.5 12.5l4.2 4.2L18.5 8" />
          </svg>
        </button>
        <span className="u008-tip" role="status" />
      </div>
    </div>
  );
}
