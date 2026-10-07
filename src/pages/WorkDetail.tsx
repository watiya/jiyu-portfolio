// 작업 상세: 스펙 시트. 왼쪽 고정 메타(연도·클라이언트·역할·분류·장수)와 버튼, 오른쪽 본문(이름·한 줄·표지·설명·화면 띠).
// 설명과 한 줄은 v4 에서 기계로 옮긴 것이다(works.ts, works.desc.ts). 비어 있는 자리는 v4 와 같은 말로 비워 둔다.
import { useEffect, useState } from "react";
import { useLang } from "../i18n/useLang.ts";
import { internalClick } from "../router.ts";
import { SectionLabel } from "../components/Annot.tsx";
import { WORKS } from "../works.ts";
import { WORK_DESCRIPTIONS } from "../works.desc.ts";
import { CANVAS_COUNT, hasCanvas, loadCanvas, type CanvasFrame } from "../canvas/data.ts";
import { NotFound } from "./AppDetail.tsx";

const pad = (n: number) => String(n).padStart(2, "0");

// 캔버스 첫 페이지의 앞 여섯 장. 상세에서 캔버스로 들어가기 전에 무엇이 있는지 보여 준다
function Shots({ slug, go, label, frameLabel }: { slug: string; go: (href: string) => void; label: string; frameLabel: (n: number) => string }) {
  // 어느 슬러그의 것인지 함께 둔다. 슬러그가 바뀌면 이전 작업의 띠가 잠깐 남지 않는다
  const [loaded, setLoaded] = useState<{ slug: string; frames: CanvasFrame[] } | null>(null);
  useEffect(() => {
    let live = true;
    loadCanvas(slug).then((d) => live && setLoaded({ slug, frames: d?.pages[0]?.frames.slice(0, 6) ?? [] }));
    return () => {
      live = false;
    };
  }, [slug]);
  const frames = loaded?.slug === slug ? loaded.frames : [];
  if (frames.length === 0) return null;
  return (
    <a className="wkshots" href={`/work/${slug}/canvas`} onClick={internalClick(go)} aria-label={label} data-token="card.bg card.line">
      {frames.map((f, k) => (
        <img key={f.id} src={f.src} alt={frameLabel(k + 1)} width={f.w} height={f.h} loading="lazy" decoding="async" />
      ))}
    </a>
  );
}

export function WorkDetail({ slug, go }: { slug: string; go: (href: string) => void }) {
  const { lang, t } = useLang();
  const W = t.work;
  const i = WORKS.findIndex((w) => w.slug === slug);
  const onClick = internalClick(go);
  if (i === -1) return <NotFound path={`/work/${slug}`} go={go} />;
  const w = WORKS[i];
  const prev = WORKS[(i + WORKS.length - 1) % WORKS.length];
  const next = WORKS[(i + 1) % WORKS.length];
  const canvas = hasCanvas(slug);
  const desc = WORK_DESCRIPTIONS[slug]?.[lang] ?? "";

  // v4 의 규칙 그대로. 한 줄과 설명이 둘 다 없고 캔버스가 있으면 「설명 대신 화면」을 한 줄 자리에 두고 설명 문단은 그리지 않는다.
  // 한 줄은 있는데 설명만 없으면 「아직 쓰지 않았다」다. 그쪽은 쓸 것이 있는데 안 쓴 자리다
  const canvasOnly = !w.tagline[lang] && !desc && canvas;
  const tagline = w.tagline[lang] || (canvas ? W.canvasOnly : W.pending);
  const paragraphs = canvasOnly ? [] : (desc || W.pending).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="detail workdoc container">
      <SectionLabel
        index={pad(i + 1)}
        title={`${W.detailLabel} · ${W.categories[w.category]}`}
        aside={
          <a href="/work" onClick={onClick} className="seclabel__link">
            ← {W.back}
          </a>
        }
      />
      <div className="detail__grid">
        <aside className="detail__meta" aria-label={t.detail.spec}>
          <dl className="spec mono">
            <div className="spec__row">
              <dt>{W.year}</dt>
              <dd>{w.year}</dd>
            </div>
            {w.client && (
              <div className="spec__row">
                <dt>{W.client}</dt>
                <dd>{w.client}</dd>
              </div>
            )}
            {w.role && (
              <div className="spec__row">
                <dt>{W.role}</dt>
                <dd>{w.role[lang]}</dd>
              </div>
            )}
            <div className="spec__row">
              <dt>{W.category}</dt>
              <dd>{W.categories[w.category]}</dd>
            </div>
            {canvas && (
              <div className="spec__row">
                <dt>{W.canvas.label}</dt>
                <dd>{W.screens(CANVAS_COUNT[slug])}</dd>
              </div>
            )}
          </dl>
          <div className="detail__actions">
            {w.caseSlug && (
              <a className="btn btn--sm" href={`/cases/${w.caseSlug}`} onClick={onClick} data-token="button.bg button.fg">
                {W.readCase}
              </a>
            )}
            {w.here && (
              <a className={`btn btn--sm${w.caseSlug ? " btn--ghost" : ""}`} href={w.here} onClick={onClick}>
                {W.openHere}
              </a>
            )}
            {canvas && (
              <a className={`btn btn--sm${w.caseSlug || w.here ? " btn--ghost" : ""}`} href={`/work/${slug}/canvas`} onClick={onClick} data-token="button.bg button.fg">
                {W.openCanvas}
              </a>
            )}
            {w.liveUrl && (
              <a className="btn btn--ghost btn--sm" href={w.liveUrl} target="_blank" rel="noreferrer">
                {W.visit}
              </a>
            )}
          </div>
        </aside>
        <div className="detail__body">
          <h1 className="h1">{w.name}</h1>
          <p className="lede">{tagline}</p>
          {!w.noCover && (
            <figure className="caseimg" data-token="line.default radius.2">
              <img src={`/work/${slug}.webp`} alt={W.cover(w.name)} width={1600} height={1000} loading="eager" decoding="async" />
            </figure>
          )}
          {paragraphs.length > 0 && (
            <div className="prose">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          )}
          {canvas && <Shots slug={slug} go={go} label={W.openCanvas} frameLabel={(n) => W.canvas.frame(w.name, n)} />}
        </div>
      </div>
      <nav className="detail__nav" aria-label={W.otherWork}>
        <a href={`/work/${prev.slug}`} onClick={onClick}>
          ← {pad(i === 0 ? WORKS.length : i)} {prev.name}
        </a>
        <a href="/work" onClick={onClick}>
          {W.back}
        </a>
        <a href={`/work/${next.slug}`} onClick={onClick}>
          {pad(((i + 1) % WORKS.length) + 1)} {next.name} →
        </a>
      </nav>
    </article>
  );
}
