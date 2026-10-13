/* Lucian UX/UI Prompt #095 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#095 */
// 모양이 바뀌는 막대 차트. 매출 대신 작업 수(src/works.ts)를 연도·분류·클라이언트별로 센다
import { useEffect, useRef } from "react";
import "./U095.css";

// t: 합계 제목, l: 막대 아래 이름, f: 머리말 이름, v: 값, p: 합계 옆 증감 문구(시간순 묶음만, 아니면 빈 값)
export type U095Set = { seg: string; t: string; l: string[]; f: string[]; v: number[]; p: string; trend: boolean };
export type U095Data = { sets: U095Set[]; group: string; bars: string; avg: string; prev: string; fmt: (v: number) => string };

const SLOTS = 12;

export function U095({ data }: { data: U095Data }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const D = data.sets;
    const fmt = data.fmt;
    const lab = root.querySelector<HTMLElement>(".u095-lab")!;
    const big = root.querySelector<HTMLElement>(".u095-v b")!;
    const dl = root.querySelector<HTMLElement>(".u095-dl")!;
    const seg = root.querySelector<HTMLElement>(".u095-seg")!;
    const segs = Array.from(root.querySelectorAll<HTMLButtonElement>(".u095-seg button"));
    const grid = root.querySelector<HTMLElement>(".u095-grid")!;
    const bars = root.querySelector<HTMLElement>(".u095-bars")!;
    const avg = root.querySelector<HTMLElement>(".u095-avg")!;
    const tip = root.querySelector<HTMLElement>(".u095-tip")!;
    const ch = root.querySelector<HTMLElement>(".u095-ch")!;
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    const B: HTMLButtonElement[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "u095-b off";
      b.tabIndex = -1;
      b.append(document.createElement("i"), document.createElement("em"));
      bars.appendChild(b);
      B.push(b);
    }
    const G = [0, 1, 2, 3].map((k) => {
      const g = document.createElement("div");
      g.className = "u095-gl";
      g.style.bottom = ((k / 3) * 100).toFixed(3) + "%";
      g.append(document.createElement("span"));
      grid.appendChild(g);
      return g;
    });
    let set = 0;
    let act = -1;
    let pin = -1;
    let shown = 0;
    let tw = 0;
    let first1 = 0;
    let first2 = 0;
    // 건수라 눈금은 정수 위주. 0 이나 아주 작은 값에서도 눈금이 소수로 쪼개지지 않게 최소 3 칸
    const axis = (v: number) => String(+v.toFixed(1));
    function nice(m: number) {
      m = Math.max(3, m);
      const p = Math.pow(10, Math.floor(Math.log10(m / 3)));
      const s = [1, 2, 2.5, 5, 10].map((k) => k * p).filter((k) => k * 3 >= m)[0];
      return s * 3;
    }
    // 큰 숫자는 이전 값에서 새 값으로 굴러가듯 이어진다
    function roll(to: number) {
      cancelAnimationFrame(tw);
      const from = shown;
      const t0 = performance.now();
      const dur = rm ? 1 : 420;
      const f = (n: number) => {
        if (!root!.isConnected) return;
        const k = Math.min(1, (n - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        shown = from + (to - from) * e;
        big.textContent = fmt(shown);
        if (k < 1) tw = requestAnimationFrame(f);
      };
      f(t0);
    }
    // 앞 값이 0 이면 비율이 없으니 비운다
    function pct(a: number, b: number) {
      if (!b) return "";
      const r = (a - b) / b;
      return (r >= 0 ? "+" : "−") + Math.abs(Math.round(r * 100)) + "%";
    }
    function header() {
      const d = D[set];
      const idx = act >= 0 ? act : pin;
      if (idx >= 0) {
        lab.textContent = d.f[idx];
        roll(d.v[idx]);
        const p = d.trend && idx ? pct(d.v[idx], d.v[idx - 1]) : "";
        dl.textContent = p ? data.prev + " " + p : "";
        dl.classList.toggle("dn", !!p && d.v[idx] < d.v[idx - 1]);
      } else {
        const sum = d.v.reduce((a, b) => a + b, 0);
        const n = d.v.length;
        lab.textContent = d.t;
        roll(sum);
        const p = d.trend && n > 1 ? pct(d.v[n - 1], d.v[n - 2]) : "";
        dl.textContent = p ? d.p + " " + p : "";
        dl.classList.toggle("dn", !!p && d.v[n - 1] < d.v[n - 2]);
      }
    }
    // 막대 개수가 달라도 같은 12칸을 재사용해서 폭·높이가 이어서 바뀌게 한다
    function draw(k: number, first?: boolean) {
      set = k;
      act = -1;
      pin = -1;
      const d = D[k];
      const n = d.v.length;
      const max = nice(Math.max(...d.v));
      const mean = d.v.reduce((a, b) => a + b, 0) / n;
      segs.forEach((s, j) => s.setAttribute("aria-pressed", String(j === k)));
      seg.style.setProperty("--k", String(k));
      B.forEach((b, j) => {
        const isOn = j < n;
        b.classList.toggle("off", !isOn);
        b.classList.remove("on", "pin");
        b.classList.toggle("last", j === n - 1);
        b.style.setProperty("--d", String(j));
        b.style.setProperty("--pad", n > 8 ? "2.5px" : "5px");
        if (isOn) {
          b.querySelector("em")!.textContent = d.l[j];
          b.setAttribute("aria-label", d.f[j] + " " + fmt(d.v[j]));
          b.style.setProperty("--h", first ? "0" : (d.v[j] / max).toFixed(3));
        } else b.style.setProperty("--h", "0");
        b.tabIndex = isOn && j === n - 1 ? 0 : -1;
      });
      if (first)
        first1 = requestAnimationFrame(() => {
          first2 = requestAnimationFrame(() => {
            B.forEach((b, j) => {
              if (j < n) b.style.setProperty("--h", (d.v[j] / max).toFixed(3));
            });
          });
        });
      G.forEach((g, j) => {
        const s = g.firstChild as HTMLElement;
        s.textContent = axis((max * j) / 3);
        s.style.opacity = Math.abs(j / 3 - mean / max) < 0.07 ? "0" : "1";
      });
      avg.style.setProperty("--a", (mean / max).toFixed(3));
      (avg.firstChild as HTMLElement).textContent = data.avg;
      root!.classList.remove("has");
      header();
    }
    function show(j: number) {
      act = j;
      B.forEach((b, k) => b.classList.toggle("on", k === j || (j < 0 && k === pin)));
      const idx = j >= 0 ? j : pin;
      root!.classList.toggle("has", idx >= 0);
      if (idx >= 0) {
        const d = D[set];
        const b = B[idx];
        (tip.firstChild as HTMLElement).textContent = fmt(d.v[idx]);
        const sm = tip.querySelector("small")!;
        const p = d.trend && idx ? pct(d.v[idx], d.v[idx - 1]) : "";
        sm.textContent = p;
        sm.classList.toggle("dn", !!p && d.v[idx] < d.v[idx - 1]);
        const cw = ch.clientWidth;
        const tw2 = tip.offsetWidth;
        const cx = b.offsetLeft + b.offsetWidth / 2;
        const hh = parseFloat(b.style.getPropertyValue("--h")) * (ch.clientHeight - 26);
        tip.style.setProperty("--tx", Math.max(0, Math.min(cw - tw2, cx - tw2 / 2)).toFixed(1) + "px");
        tip.style.setProperty("--ty", Math.max(-6, ch.clientHeight - 26 - hh - 36).toFixed(1) + "px");
      }
      header();
    }
    function idxAt(x: number) {
      const n = D[set].v.length;
      let best = 0;
      for (let j = 0; j < n; j++) {
        const r = B[j].getBoundingClientRect();
        if (x >= r.left) best = j;
      }
      return best;
    }
    bars.addEventListener("pointermove", (e) => show(idxAt(e.clientX)), on);
    bars.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "mouse") {
          bars.setPointerCapture(e.pointerId);
          show(idxAt(e.clientX));
        }
      },
      on,
    );
    bars.addEventListener("pointerleave", () => show(-1), on);
    bars.addEventListener(
      "click",
      (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".u095-b");
        if (!b) return;
        const j = B.indexOf(b);
        pin = pin === j ? -1 : j;
        B.forEach((x, k) => x.classList.toggle("pin", k === pin));
        show(j);
      },
      on,
    );
    bars.addEventListener(
      "keydown",
      (e) => {
        const n = D[set].v.length;
        const j = B.indexOf(document.activeElement as HTMLButtonElement);
        let to = e.key === "ArrowRight" ? j + 1 : e.key === "ArrowLeft" ? j - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
        if (to === null) return;
        e.preventDefault();
        to = Math.max(0, Math.min(n - 1, to));
        B.forEach((b, k) => (b.tabIndex = k === to ? 0 : -1));
        B[to].focus();
        show(to);
      },
      on,
    );
    bars.addEventListener(
      "focusin",
      (e) => {
        const j = B.indexOf(e.target as HTMLButtonElement);
        if (j >= 0) show(j);
      },
      on,
    );
    bars.addEventListener(
      "focusout",
      (e) => {
        if (!bars.contains(e.relatedTarget as Node | null)) show(-1);
      },
      on,
    );
    segs.forEach((s, k) =>
      s.addEventListener(
        "click",
        () => {
          if (k !== set) draw(k);
        },
        on,
      ),
    );
    draw(0, !rm);
    return () => {
      ac.abort();
      cancelAnimationFrame(tw);
      cancelAnimationFrame(first1);
      cancelAnimationFrame(first2);
      bars.replaceChildren();
      grid.replaceChildren();
      root.classList.remove("has");
    };
  }, [data]);

  return (
    <div ref={ref} className="ux u095">
      <div className="u095-h">
        <div>
          <div className="u095-top">
            <small className="u095-lab" />
            <span className="u095-dl" />
          </div>
          <div className="u095-v">
            <b />
          </div>
        </div>
        <div className="u095-seg" role="group" aria-label={data.group}>
          {data.sets.map((s, k) => (
            <button key={s.seg} type="button" aria-pressed={k === 0}>
              {s.seg}
            </button>
          ))}
        </div>
      </div>
      <div className="u095-ch">
        <div className="u095-grid" aria-hidden="true" />
        <div className="u095-bars" role="group" aria-label={data.bars} />
        <div className="u095-avg" aria-hidden="true">
          <span />
        </div>
        <div className="u095-tip" aria-hidden="true">
          <span />
          <small />
        </div>
      </div>
    </div>
  );
}
