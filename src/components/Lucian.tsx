// 토큰 쇼케이스: Lucian UX/UI Prompt(MIT) 요소 여섯 개를 모양·모션 그대로 옮기고, --ux-* 토큰을 이 사이트 토큰에 물렸다(lucian/lucian.css).
// 요소 파일마다 맨 위에 원본 라이선스 줄이 있다. 데이터는 전부 사이트의 실제 값이고, 동작은 실제 다이얼·라우터를 부른다.
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { EMAIL, SOCIALS } from "../data.ts";
import { WORKS, WORK_CATEGORIES } from "../works.ts";
import { useLang } from "../i18n/useLang.ts";
import { getApps } from "../i18n/content.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { PRESETS } from "../tokens/engine.ts";
import { slugOf } from "../lib.ts";
import { useReveal } from "../hooks.ts";
import { Corners, SectionLabel } from "./Annot.tsx";
import { U021 } from "./lucian/U021.tsx";
import { U017 } from "./lucian/U017.tsx";
import { U039, type U039Tab } from "./lucian/U039.tsx";
import { U095, type U095Data, type U095Set } from "./lucian/U095.tsx";
import { U044, type U044Item } from "./lucian/U044.tsx";
import { U008, type U008Option } from "./lucian/U008.tsx";
import "./lucian/lucian.css";

const LUCIAN = "https://lucianlabs.dev/uxui-prompt/";
const RADIUS_MAX = 24;

type ItemId = "sky" | "radius" | "tabs" | "chart" | "faq" | "copy";
// w·h 는 요소의 고정 크기(Footprint). 무대가 좁으면 이 비율 그대로 줄인다
const ITEMS: { id: ItemId; lucian: string; tokens: string[]; w: number; h: number }[] = [
  { id: "sky", lucian: "021", tokens: ["theme", "accent.default", "text.subtle"], w: 300, h: 210 },
  { id: "radius", lucian: "017", tokens: ["radius.2", "accent.default", "text.default", "surface.canvas"], w: 330, h: 210 },
  { id: "tabs", lucian: "039", tokens: ["surface.raised", "line.default", "text.default", "accent.soft"], w: 340, h: 380 },
  { id: "chart", lucian: "095", tokens: ["surface.raised", "accent.default", "accent.secondary", "neutral.200"], w: 340, h: 410 },
  { id: "faq", lucian: "044", tokens: ["surface.raised", "line.strong", "text.muted", "accent.default"], w: 350, h: 400 },
  { id: "copy", lucian: "008", tokens: ["surface.sunken", "line.strong", "accent.default", "accent.on"], w: 340, h: 170 },
];

export function Lucian({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  const ref = useReveal<HTMLElement>();
  const L = t.lucian;
  return (
    <section id="showcase" className="lucian container reveal" ref={ref} aria-labelledby="lucian-title">
      <SectionLabel
        index="05"
        title={t.sections.lucian}
        aside={
          <a className="seclabel__link" href={LUCIAN} target="_blank" rel="noreferrer">
            {L.aside} ↗
          </a>
        }
      />
      <div className="section__head">
        <h2 id="lucian-title" className="h2">
          {L.title}
        </h2>
        <p className="lede">{L.lede}</p>
      </div>
      <ul className="lucian__grid" role="list">
        {ITEMS.map((it) => (
          <li key={it.id}>
            <article className="craft__card" data-token="card.bg card.line card.radius card.pad">
              <div className="craft__stage lucian__stage" data-token="surface.sunken radius.2">
                <Corners />
                <Fit w={it.w} h={it.h}>
                  {it.id === "sky" && <Sky />}
                  {it.id === "radius" && <Radius />}
                  {it.id === "tabs" && <AppTabs go={go} />}
                  {it.id === "chart" && <WorkChart />}
                  {it.id === "faq" && <Faq go={go} />}
                  {it.id === "copy" && <Copy />}
                </Fit>
              </div>
              <div className="craft__body">
                <h3 className="craft__name">{L.items[it.id].title}</h3>
                <p className="craft__line">{L.items[it.id].line}</p>
                <dl className="craft__meta mono">
                  <dt>{L.tokens}</dt>
                  <dd>{it.tokens.join(" ")}</dd>
                  <dt>{L.source}</dt>
                  <dd>
                    <a href={`${LUCIAN}#${it.lucian}`} target="_blank" rel="noreferrer">
                      lucianlabs.dev/uxui-prompt/#{it.lucian} ↗
                    </a>
                  </dd>
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 고정 크기 요소를 무대 폭에 맞춰 축소한다. 높이도 같은 비율로 줄여 아래가 비지 않게 한다
function Fit({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--fit", Math.min(1, el.clientWidth / w).toFixed(4));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="lucian__fit" style={{ "--w": `${w}px`, "--h": `${h}px` } as React.CSSProperties}>
      <div className="lucian__fit-in">{children}</div>
    </div>
  );
}

// #021: 사이트의 theme 다이얼을 뒤집는다
function Sky() {
  const { dials, set } = useTokens();
  const C = useLang().t.lucian.sky;
  const night = dials.theme === "dark";
  return <U021 night={night} onToggle={() => set({ theme: night ? "light" : "dark" })} label={C.label} dayText={C.light} nightText={C.dark} />;
}

// #017: 사이트의 radius 다이얼(radius.2 기준값)을 움직인다
function Radius() {
  const { dials, set } = useTokens();
  const C = useLang().t.lucian.radius;
  return <U017 value={dials.radius} max={RADIUS_MAX} onChange={(radius) => set({ radius })} title={C.title} maxText={C.max(RADIUS_MAX)} label={C.label} />;
}

// #039: 공개 중인 앱을 분류(kind)별로. 줄의 그림은 앱 프리셋의 브랜드 색
function AppTabs({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const tabs = useMemo<U039Tab[]>(() => {
    const groups = new Map<string, U039Tab>();
    for (const app of getApps(lang)) {
      const slug = slugOf(app.name);
      const sw = PRESETS.find((p) => p.slug === slug)?.swatches ?? [];
      const art = sw.length >= 2 ? `linear-gradient(140deg,${sw[0].hex},${sw[1].hex})` : "linear-gradient(140deg,var(--accent-400),var(--accent-default))";
      const g = groups.get(app.kind) ?? { label: app.kind, rows: [] };
      g.rows.push({ name: app.name, badge: app.badge, note: app.note, href: `/apps/${slug}`, art });
      groups.set(app.kind, g);
    }
    // 요소의 칸 수에 맞춰 탭 4개, 줄 4개까지
    return [...groups.values()].slice(0, 4).map((g) => ({ ...g, rows: g.rows.slice(0, 4) }));
  }, [lang]);
  return <U039 tabs={tabs} label={t.lucian.tabs.label} onNavigate={go} />;
}

// #095: 작업 목록(src/works.ts)을 연도·분류·클라이언트별로 센다
function WorkChart() {
  const C = useLang().t.lucian.chart;
  const data = useMemo<U095Data>(() => {
    const years = WORKS.map((w) => Number(w.year));
    const y0 = Math.min(...years);
    const y1 = Math.max(...years);
    const ys = Array.from({ length: y1 - y0 + 1 }, (_, i) => String(y0 + i));
    const byYear: U095Set = {
      seg: C.segs.year,
      t: C.totals.year,
      l: ys.map((y) => `'${y.slice(2)}`),
      f: ys.map((y) => C.year(y)),
      v: ys.map((y) => WORKS.filter((w) => w.year === y).length),
      p: C.lastYear,
      trend: true,
    };
    const byType: U095Set = {
      seg: C.segs.type,
      t: C.totals.type,
      l: WORK_CATEGORIES.map((c) => C.types[c]),
      f: WORK_CATEGORIES.map((c) => C.typesFull[c]),
      v: WORK_CATEGORIES.map((c) => WORKS.filter((w) => w.category === c).length),
      p: "",
      trend: false,
    };
    // 많은 순, 클라이언트가 없는 작업은 맨 뒤 '기타'
    const counts = new Map<string, number>();
    for (const w of WORKS) if (w.client) counts.set(w.client, (counts.get(w.client) ?? 0) + 1);
    const clients = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    clients.push([C.other, WORKS.filter((w) => !w.client).length]);
    const byClient: U095Set = { seg: C.segs.client, t: C.totals.client, l: clients.map((c) => c[0]), f: clients.map((c) => c[0]), v: clients.map((c) => c[1]), p: "", trend: false };
    return { sets: [byYear, byType, byClient], group: C.group, bars: C.bars, avg: C.avg, prev: C.prev, fmt: (v) => C.count(Math.round(v)) };
  }, [C]);
  return <U095 data={data} />;
}

// #044: 협업 FAQ. 답은 사이트에 이미 있는 정보에서만
function Faq({ go }: { go: (href: string) => void }) {
  const F = useLang().t.lucian.faq;
  const items = useMemo<U044Item[]>(
    () => [
      { ...F.work, href: "/projects#system" },
      { ...F.stack, href: "/projects#apps" },
      { ...F.take, href: "/projects#system" },
      { q: F.contact.q, a: F.contact.a(EMAIL), link: F.contact.link, href: `mailto:${EMAIL}` },
    ],
    [F],
  );
  return <U044 items={items} onNavigate={go} />;
}

// #008: 연락 이메일(Contact 와 같은 주소)과 GitHub 주소를 복사한다
function Copy() {
  const C = useLang().t.lucian.copy;
  const options = useMemo<U008Option[]>(() => {
    const at = EMAIL.indexOf("@");
    const gh = SOCIALS.find((s) => s.label === "GitHub")!.href;
    const ghText = gh.replace(/^https?:\/\//, "");
    const cut = ghText.indexOf("/") + 1;
    return [
      { tab: "email", head: EMAIL.slice(0, at), tail: EMAIL.slice(at), copy: EMAIL, aria: C.email },
      { tab: "github", head: ghText.slice(0, cut), tail: ghText.slice(cut), copy: gh, aria: C.github },
    ];
  }, [C]);
  return <U008 options={options} tablist={C.tablist} copied={C.copied} />;
}
