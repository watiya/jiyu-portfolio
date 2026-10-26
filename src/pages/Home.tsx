import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EMAIL, SOCIALS } from "../data.ts";
import { useLang } from "../i18n/useLang.ts";
import { formatDay, getApps, getJourney, getNow, getRecentWriting } from "../i18n/content.ts";
import { getCases } from "../cases/content.ts";
import type { Lang } from "../i18n/lang.ts";
import { PAIRING_META } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { internalClick } from "../router.ts";
import { useClock, useReveal } from "../hooks.ts";
import { Scrub } from "../components/Scrub.tsx";
import { Corners, SectionLabel, TokenTag } from "../components/Annot.tsx";
import { AppShelf } from "../components/AppShelf.tsx";
import { Dials } from "../components/Dials.tsx";
import { HIDE_PRIVATE } from "../hidden.ts";

// 한글 제목은 글자가 넓고 어센더가 없어 기본값을 따로 둔다.
// ko 90 은 지금 문장이 두 줄에 들어가는 크기(100 이면 1440 폭에서 세 줄로 꺾인다)
const HERO_DEFAULTS: Record<Lang, { size: number; leading: number; tracking: number }> = {
  en: { size: 120, leading: 0.95, tracking: -0.03 },
  ko: { size: 90, leading: 1.0, tracking: -0.015 },
};

export function Home({ go }: { go: (href: string) => void }) {
  const { lang } = useLang();
  return (
    <>
      <Hero key={lang} go={go} />
      <Apps go={go} />
      {/* 층 설명(Layers)과 크래프트는 /system 으로 옮겼다. 홈에는 다이얼 보드 하나만 */}
      <Dials />
      {/* 사례·경력은 잠시 내렸다(hidden.ts) */}
      {!HIDE_PRIVATE && <CaseStudies go={go} />}
      {!HIDE_PRIVATE && <Journey />}
      <Contact go={go} />
    </>
  );
}

// ---------- 01 Hero ----------

function Hero({ go }: { go: (href: string) => void }) {
  const { dials, tokens } = useTokens();
  const { lang, t } = useLang();
  const HERO_DEFAULT = HERO_DEFAULTS[lang];
  const [size, setSize] = useState(HERO_DEFAULT.size);
  const [leading, setLeading] = useState(HERO_DEFAULT.leading);
  const [tracking, setTracking] = useState(HERO_DEFAULT.tracking);
  const pair = PAIRING_META[dials.pairing];
  const family = pair.heading.split(",")[0].replace(/'/g, "") + (lang === "ko" ? " + Pretendard" : "");
  const lineBox = Math.round(size * leading);
  const now = getNow(lang);
  const typed = useTypewriter(t.hero.headline, tokens.dials.motion !== "off");
  const done = typed >= t.hero.headline.length;
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  // 제목의 실제 줄 상자를 재서 치수선을 글자에 붙인다
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const h1 = titleRef.current;
    if (!sheet || !h1) return;
    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(h1);
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
      const base = sheet.getBoundingClientRect();
      const lines: { top: number; bottom: number; left: number; right: number }[] = [];
      for (const r of rects) {
        const line = lines.find((l) => Math.abs(l.top - r.top) < 6);
        if (line) {
          line.left = Math.min(line.left, r.left);
          line.right = Math.max(line.right, r.right);
          line.bottom = Math.max(line.bottom, r.bottom);
        } else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
      lines.sort((a, b) => a.top - b.top);
      if (!lines.length) return;
      const h1Rect = h1.getBoundingClientRect();
      const lineH = h1Rect.height / lines.length;
      const l2 = lines[1] ?? lines[0];
      sheet.style.setProperty("--t-left", `${Math.round(lines[0].left - base.left)}px`);
      sheet.style.setProperty("--t-top", `${Math.round(h1Rect.top - base.top)}px`);
      sheet.style.setProperty("--l2-right", `${Math.round(l2.right - base.left)}px`);
      sheet.style.setProperty("--line-h", `${Math.round(lineH * 100) / 100}px`);
      sheet.dataset.lines = String(lines.length);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(h1);
    ro.observe(sheet);
    document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [size, leading, tracking, dials.pairing, dials.density, lang]);

  // 커서는 마지막으로 친 글자의 오른쪽에 붙인다. 공백 뒤면 다음 글자 앞(줄이 바뀌면 다음 줄 첫머리)
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const caret = caretRef.current;
    if (!sheet || !caret) return;
    const place = () => {
      const typedNode = typedRef.current?.firstChild;
      const restNode = restRef.current?.firstChild;
      const text = t.hero.headline;
      const range = document.createRange();
      let x: number;
      let rect: DOMRect | undefined;
      if (typedNode && typed > 0 && text[typed - 1] !== " ") {
        range.setStart(typedNode, typed - 1);
        range.setEnd(typedNode, typed);
        rect = Array.from(range.getClientRects()).at(-1);
        x = rect?.right ?? 0;
      } else if (restNode) {
        range.setStart(restNode, 0);
        range.setEnd(restNode, 1);
        rect = range.getClientRects()[0];
        x = rect?.left ?? 0;
      } else return;
      if (!rect) return;
      const base = sheet.getBoundingClientRect();
      caret.style.setProperty("--cx", `${Math.round(x - base.left)}px`);
      caret.style.setProperty("--cy", `${Math.round(rect.top - base.top + rect.height * 0.1)}px`);
      caret.style.setProperty("--ch", `${Math.round(rect.height * 0.8)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(sheet);
    document.fonts.ready.then(place);
    return () => ro.disconnect();
  }, [typed, size, leading, tracking, dials.pairing, dials.density, lang, t.hero.headline]);

  const style = {
    "--hero-size": `${size}px`,
    "--hero-size-n": String(size),
    "--hero-leading": String(leading),
    "--hero-tracking": `${tracking}em`,
  } as React.CSSProperties;

  return (
    <section className="hero container" style={style} aria-labelledby="hero-title" data-typed={done || undefined}>
      <SectionLabel index="01" title={t.sections.hero} aside={<>{t.hero.aside}</>} />

      <div className="hero__sheet" ref={sheetRef}>
        <Corners />
        {/* 아직 안 친 글자도 자리는 차지한다. 줄이 미리 정해져 있어 치수선과 줄바꿈이 흔들리지 않는다 */}
        <h1 id="hero-title" className="hero__title" ref={titleRef} aria-label={t.hero.headline} data-token="text.default font.heading">
          <span ref={typedRef} aria-hidden="true">{t.hero.headline.slice(0, typed)}</span>
          <span ref={restRef} className="hero__rest" aria-hidden="true">
            {t.hero.headline.slice(typed)}
          </span>
        </h1>
        <span ref={caretRef} className="hero__caret" data-done={done || undefined} aria-hidden="true" />

        {/* 크기: 첫 줄 왼쪽의 세로 치수선 */}
        <div className="dim dim--size">
          <span className="dim__line" aria-hidden="true" />
          <span className="dim__label">
            <Scrub value={size} min={48} max={200} step={1} pxPerStep={2} defaultValue={HERO_DEFAULT.size} label={t.hero.fontSize} unit="px" hint={t.hero.scrubHint} onChange={setSize} />
            <TokenTag>font.size</TokenTag>
          </span>
        </div>

        {/* 행간: 둘째 줄 오른쪽의 세로 치수선 */}
        <div className="dim dim--leading">
          <span className="dim__line" aria-hidden="true" />
          <span className="dim__label">
            <Scrub value={leading} min={0.8} max={1.4} step={0.01} pxPerStep={4} decimals={2} defaultValue={HERO_DEFAULT.leading} label={t.hero.lineHeight} unit="lh" hint={t.hero.scrubHint} onChange={setLeading} />
            <TokenTag>font.leading</TokenTag>
          </span>
        </div>

        {/* 자간: 제목 아래의 가로 자 */}
        <div className="dim dim--tracking">
          <span className="dim__ruler" aria-hidden="true" />
          <span className="dim__label">
            <Scrub value={tracking} min={-0.08} max={0.08} step={0.005} pxPerStep={4} decimals={3} defaultValue={HERO_DEFAULT.tracking} label={t.hero.letterSpacing} unit="em" hint={t.hero.scrubHint} onChange={setTracking} />
            <TokenTag>font.tracking</TokenTag>
          </span>
        </div>
      </div>

      <div className="hero__spec mono" aria-label={t.hero.aside}>
        <span style={{ "--i": 0 } as React.CSSProperties}>{family}</span>
        <span style={{ "--i": 1 } as React.CSSProperties}>{pair.weight}</span>
        <span style={{ "--i": 2 } as React.CSSProperties}>
          {size}/{lineBox}
        </span>
        <span style={{ "--i": 3 } as React.CSSProperties}>{tracking.toFixed(3)}em</span>
        <span className="hero__spec-live" style={{ "--i": 4 } as React.CSSProperties} data-token="accent.secondary">
          {t.hero.live}
        </span>
      </div>

      <div className="hero__foot grid12">
        <div className="hero__who">
          <p className="hero__name">{t.hero.name}</p>
          {!HIDE_PRIVATE && (
            <>
              <p className="hero__role" data-token="text.muted">
                {t.hero.role}
              </p>
              <p className="hero__intro" data-token="text.default font.body">
                {t.hero.intro}
              </p>
            </>
          )}
          <p className="hero__now">
            <span className="mono hero__now-label" data-token="accent.text">
              {t.hero.now} · <time dateTime={now.asOf}>{formatDay(now.asOf, lang)}</time>
            </span>
            <span className="hero__now-items">
              {now.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
          </p>
        </div>
        <div className="hero__cta">
          <span className="mono hero__meta">{t.hero.place}</span>
          <div className="hero__btns">
            <a className="btn" href={`mailto:${EMAIL}`} data-token="button.bg button.fg button.radius">
              {t.hero.email}
            </a>
            <a className="btn btn--ghost" href="/projects#apps" onClick={internalClick(go)} data-token="line.strong button.radius">
              {t.hero.browse}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// 제목을 한 글자씩 친다. 공백·문장부호 뒤엔 사람처럼 조금 쉰다. 모션이 꺼져 있으면 처음부터 다 보인다
function useTypewriter(text: string, on: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    let i = 0;
    let id = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i >= text.length) return;
      const ch = text[i - 1];
      const pause = /[.,]/.test(ch) ? 220 : ch === " " ? 90 : 0;
      id = window.setTimeout(tick, 38 + Math.random() * 34 + pause);
    };
    id = window.setTimeout(tick, 450);
    return () => window.clearTimeout(id);
  }, [text, on]);
  return on ? n : text.length;
}

// ---------- 02 Apps ----------

function Apps({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const apps = getApps(lang);
  const ref = useReveal<HTMLElement>();
  return (
    <section id="apps" className="apps container reveal" ref={ref} aria-labelledby="apps-title">
      <SectionLabel index="02" title={t.sections.apps} aside={<>{t.apps.aside(apps.length)}</>} />
      <div className="section__head">
        <h2 id="apps-title" className="h2">
          {t.apps.title}
        </h2>
        <p className="lede">{t.apps.lede}</p>
      </div>
      <AppShelf apps={apps} go={go} level={3} />
    </section>
  );
}

// ---------- 05 Case studies ----------

function CaseStudies({ go }: { go: (href: string) => void }) {
  const ref = useReveal<HTMLElement>();
  const { lang, t } = useLang();
  const docs = getCases(lang);
  const recent = getRecentWriting(lang, 3);
  const onClick = internalClick(go);
  return (
    <section id="work" className="changelog container reveal" ref={ref} aria-labelledby="work-title">
      <SectionLabel
        index="04"
        title={t.sections.cases}
        aside={
          <a href="/cases" onClick={onClick} className="seclabel__link">
            {t.cases.aside(docs.length)}
          </a>
        }
      />
      <div className="section__head">
        <h2 id="work-title" className="h2">
          {t.cases.title}
        </h2>
        <p className="lede">{t.cases.lede}</p>
      </div>
      <ol className="rel" role="list">
        {docs.map((d) => (
          <li key={d.slug} className="rel__row" data-token="line.default">
            <span className="rel__idx mono">r{String(d.order).padStart(2, "0")}</span>
            <div className="rel__main">
              <a className="rel__title" href={`/cases/${d.slug}`} onClick={onClick}>
                {d.title}
              </a>
              <p className="rel__sub">{d.summary}</p>
            </div>
            <span className="rel__link mono" aria-hidden="true">
              {d.tag}
            </span>
          </li>
        ))}
      </ol>
      <p className="rel__more">
        <a href="/work" onClick={onClick}>
          {t.cases.moreOnWork} →
        </a>
      </p>
      {/* 글 한 줄씩. 글은 사례 본문으로 이어지므로 사례 페이지로 보낸다(/writing 은 10-07 에 접음) */}
      <div className="recent">
        <div className="recent__head mono">
          <span>{t.writing.recent}</span>
          <a href="/cases" onClick={onClick}>
            {t.writing.all} →
          </a>
        </div>
        <ul className="recent__list" role="list">
          {recent.map((w) => (
            <li key={w.slug} className="recent__row">
              <a className="recent__title" href={`/cases/${w.slug}`} onClick={onClick}>
                {w.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- 06 Journey ----------

function Journey() {
  const ref = useReveal<HTMLElement>();
  const { lang, t } = useLang();
  const rows = getJourney(lang);
  const n = rows.length;
  return (
    <section id="journey" className="journey container reveal" ref={ref} aria-labelledby="journey-title">
      <SectionLabel index="05" title={t.sections.journey} aside={<>{t.journey.aside(n, rows[n - 1].year)}</>} />
      <div className="section__head">
        <h2 id="journey-title" className="h2">
          {t.journey.title}
        </h2>
        <p className="lede">{t.journey.lede}</p>
      </div>
      <ol className="vers" role="list">
        {rows.map((j, i) => (
          <li key={j.company} className="vers__row" data-latest={i === 0 || undefined}>
            <span className="vers__v mono">v{n - i}</span>
            <span className="vers__co">{j.company}</span>
            <span className="vers__role">{j.role}</span>
            <span className="vers__period mono">{j.period}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------- 07 Contact ----------

// 링크 옆에 찍는 주소. 프로토콜과 끝 / 는 뺀다
const hostOf = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

// 첫 화면(Front)도 같은 연락 섹션을 쓴다
export function Contact({ go }: { go: (href: string) => void }) {
  const { toast } = useTokens();
  const { lang, t } = useLang();
  const time = useClock("Asia/Seoul");
  const ref = useReveal<HTMLElement>();
  // 갱신일은 지금 목록을 확인한 날에서 센다
  const updated = formatDay(getNow(lang).asOf, lang);
  const copy = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      e.preventDefault();
      toast(t.contact.copied);
    } catch {
      // 복사가 막히면 mailto 로 진행
    }
  };
  return (
    <section id="contact" className="contact container reveal" ref={ref} aria-labelledby="contact-title">
      <SectionLabel index={HIDE_PRIVATE ? "04" : "06"} title={t.sections.contact} aside={<>{t.contact.aside}</>} />
      <h2 id="contact-title" className="sr-only">
        {t.sections.contact}
      </h2>
      <div className="contact__grid">
        <div className="contact__lead">
          <p className="contact__invite" data-token="text.muted">
            {t.contact.invite}
          </p>
          <a className="contact__mail" href={`mailto:${EMAIL}`} onClick={(e) => void copy(e)} data-token="text.default font.heading">
            {EMAIL}
          </a>
          <span className="mono contact__time">
            <span className="contact__dot" aria-hidden="true" />
            {t.contact.place} · <time dateTime={time}>{time}</time>
          </span>
        </div>
        <div className="contact__elsewhere">
          <p className="mono contact__kicker">{t.contact.elsewhere}</p>
          <ul className="contact__links" role="list" data-token="line.default">
            {SOCIALS.map((s, i) => {
              const l = t.contact.links[s.key];
              return (
                <li key={s.key}>
                  <a className="contact__link" href={s.href} target="_blank" rel="noreferrer">
                    <span className="mono contact__idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="contact__body">
                      <span className="contact__label">{l.label}</span>
                      <span className="contact__note">{l.note}</span>
                    </span>
                    <span className="mono contact__host">{hostOf(s.href)}</span>
                    <span className="contact__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="mono contact__ver">
        {!HIDE_PRIVATE && (
          <>
            <a href="/projects#work" onClick={internalClick(go)}>
              {t.contact.changelog}
            </a>{" "}
            ·{" "}
          </>
        )}
        {t.contact.updated(updated)}
      </p>
    </section>
  );
}
