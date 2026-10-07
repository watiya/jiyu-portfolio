// 캔버스: 한 작업의 화면을 늘어놓은 자리. v4 의 캔버스(페이지 탭·흐름 선·이동·확대·맞추기)를 그대로 옮기고 모양만 이 사이트의 토큰을 따른다.
// 좌표를 데이터에 적지 않고 고정 폭 세 칸으로 흘린다. 장수가 늘어도 배치를 다시 짤 일이 없다.
// 치수는 frames/<slug>.json 에 있어서 그림이 오기 전에 자리가 선다. 그래서 1,670장을 지연 로딩해도 흐름 선이 어긋나지 않는다.
// 좁은 화면(767px 아래)에서는 이동·확대 대신 위에서 아래로 흘린다. 손가락 하나로 옮기고 키보드 없이 확대하는 캔버스는 쓰기 어렵다.
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useLang } from "../i18n/useLang.ts";
import { internalClick } from "../router.ts";
import { WORKS } from "../works.ts";
import { flowOf, loadCanvas, type CanvasDoc, type CanvasFrame, type Text } from "../canvas/data.ts";
import { NotFound } from "./AppDetail.tsx";

const FRAME_WIDTH = 720;
const GAP = 72;
const COLUMNS = 3;
const PADDING = 96;
const CONTENT_WIDTH = COLUMNS * FRAME_WIDTH + (COLUMNS - 1) * GAP + PADDING * 2;
const MIN_SCALE = 0.05;
const MAX_SCALE = 4;
const ARROW = 8;
const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

type Point = { x: number; y: number };
type View = { x: number; y: number; scale: number };

/** 두 프레임을 잇는 꺾은선. 같은 칸이면 아래로, 아니면 옆으로 건너간다. 좌표는 흐름 배치(offsetLeft)에서 읽는다. getBoundingClientRect 는 배율이 곱해져 틀린다 */
function linkBetween(a: HTMLElement, b: HTMLElement): Point[] {
  const box = (el: HTMLElement) => ({ left: el.offsetLeft, top: el.offsetTop, right: el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight, cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2 });
  const from = box(a);
  const to = box(b);
  if (Math.abs(to.cx - from.cx) < 4) {
    // 바로 아래 칸이면 여백을 곧장 지난다. 사이에 다른 프레임이 끼면 왼쪽 여백으로 돌아 내려간다
    if (to.top - from.bottom <= GAP * 1.5) return [{ x: from.cx, y: from.bottom }, { x: to.cx, y: to.top - ARROW }];
    const gutter = from.left - GAP / 2;
    return [{ x: from.left, y: from.cy }, { x: gutter, y: from.cy }, { x: gutter, y: to.cy }, { x: to.left - ARROW, y: to.cy }];
  }
  const rightward = to.cx > from.cx;
  const startX = rightward ? from.right : from.left;
  const endX = rightward ? to.left - ARROW : to.right + ARROW;
  const midX = (startX + endX) / 2;
  return [{ x: startX, y: from.cy }, { x: midX, y: from.cy }, { x: midX, y: to.cy }, { x: endX, y: to.cy }];
}

/** 한 페이지의 흐름 선을 DOM 에서 잰다. 끝이 아직 안 그려진 선은 뺀다 */
function measureLinks(doc: CanvasDoc, pageKey: string, boxes: Map<string, HTMLElement>): Point[][] {
  const out: Point[][] = [];
  for (const [from, to] of flowOf(doc, pageKey)) {
    const a = boxes.get(from);
    const b = boxes.get(to);
    if (a && b) out.push(linkBetween(a, b));
  }
  return out;
}

/** 폭을 맞추고 맨 위로. 높이는 맞추지 않는다. 페이지를 통째로 찍은 긴 장 하나에 맞추면 나머지가 못 읽을 크기가 된다. 100% 를 넘겨 키우지도 않는다 */
function fitView(viewport: HTMLElement): View {
  const scale = clamp(Math.min(viewport.clientWidth / CONTENT_WIDTH, 1));
  return { scale, x: (viewport.clientWidth - CONTENT_WIDTH * scale) / 2, y: 0 };
}

// 흐름 선은 프레임과 같은 좌표계에 있어야 하므로 내용 안에 절대 배치로 깐다. 프레임보다 위에 그려야 화면에 가려 끊긴 것처럼 안 보인다
function Connectors({ links }: { links: Point[][] }) {
  if (links.length === 0) return null;
  return (
    <svg className="canvas__links" aria-hidden="true">
      {links.map((pts, i) => {
        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        const dx = Math.sign(last.x - prev.x);
        const dy = Math.sign(last.y - prev.y);
        const tip = { x: last.x + dx * ARROW, y: last.y + dy * ARROW };
        const wing = ARROW * 0.6;
        return (
          <g key={i}>
            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} />
            <polygon points={`${tip.x},${tip.y} ${last.x - dy * wing},${last.y + dx * wing} ${last.x + dy * wing},${last.y - dx * wing}`} />
          </g>
        );
      })}
    </svg>
  );
}

function Caption({ frame, lang }: { frame: CanvasFrame; lang: keyof Text }) {
  return (
    <figcaption className="canvas__cap">
      <span className="canvas__cap-title">{frame.title ? frame.title[lang] : frame.label}</span>
      {frame.desc && <span className="canvas__cap-desc">{frame.desc[lang]}</span>}
    </figcaption>
  );
}

function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export function Canvas({ slug, go }: { slug: string; go: (href: string) => void }) {
  const { lang, t } = useLang();
  const C = t.work.canvas;
  const W = t.work;
  const work = WORKS.find((w) => w.slug === slug);
  const onClick = internalClick(go);
  const narrow = useNarrow();

  // 프레임 목록은 이 화면을 열 때 가져온다. 어느 슬러그의 것인지 함께 둬서, 슬러그가 바뀌면 이전 것을 쓰지 않는다. 없는 슬러그는 404 로
  const [loaded, setLoaded] = useState<{ slug: string; doc: CanvasDoc | null } | null>(null);
  useEffect(() => {
    let live = true;
    loadCanvas(slug).then((d) => live && setLoaded({ slug, doc: d }));
    return () => {
      live = false;
    };
  }, [slug]);
  const ready = loaded?.slug === slug ? loaded.doc : null;
  const missing = loaded?.slug === slug && loaded.doc === null;

  // 페이지 탭도 슬러그에 묶는다. 다른 작업으로 가면 첫 페이지부터
  const [tab, setTab] = useState<{ slug: string; page: number } | null>(null);
  const page = tab?.slug === slug ? tab.page : 0;
  const setPage = (p: number) => setTab({ slug, page: p });
  const pages = ready?.pages ?? [];
  const current = pages[Math.min(page, Math.max(pages.length - 1, 0))];
  const frames = current?.frames ?? [];
  const pageKey = current?.key ?? "";

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, HTMLElement>());
  const [links, setLinks] = useState<Point[][]>([]);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  // 사람이 화면을 한 번이라도 움직였는지. 그 뒤로는 자동 맞춤이 옮겨 둔 화면을 튕기지 않는다
  const touched = useRef(false);

  const fit = () => {
    if (viewportRef.current) setView(fitView(viewportRef.current));
  };

  // 페이지가 바뀌면 맞추고 잰다. 배치가 바뀌면(글꼴·언어·창 크기) 다시 잰다. 치수를 알고 있어서 그림이 늦게 와도 배치는 안 바뀐다
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (narrow || !ready || !viewport || !content) return;
    touched.current = false;
    const measure = () => setLinks(measureLinks(ready, pageKey, boxes.current));
    setView(fitView(viewport));
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver((entries) => {
      if (entries.some((e) => e.target === viewport) && !touched.current) setView(fitView(viewport));
      measure();
    });
    ro.observe(content);
    ro.observe(viewport);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [narrow, ready, pageKey]);

  // 휠은 네이티브로 단다. React 의 휠 리스너는 passive 라 preventDefault 가 듣지 않고, Ctrl+휠이 브라우저 확대로 샌다
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || narrow || !ready) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      touched.current = true;
      if (e.ctrlKey || e.metaKey) {
        const rect = viewport.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        setView((prev) => {
          const next = clamp(prev.scale * Math.exp(-e.deltaY / 250));
          const ratio = next / prev.scale;
          // 커서가 가리키던 점이 제자리에 남도록 원점을 함께 옮긴다
          return { scale: next, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio };
        });
        return;
      }
      setView((prev) => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [narrow, ready]);

  const dragging = useRef<Point | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    touched.current = true;
    dragging.current = { x: e.clientX - view.x, y: e.clientY - view.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragging.current;
    if (!start) return;
    setView((prev) => ({ ...prev, x: e.clientX - start.x, y: e.clientY - start.y }));
  };
  const endDrag = () => {
    dragging.current = null;
  };

  /** 화면 한가운데를 붙잡고 배율만 바꾼다 */
  const zoomBy = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    touched.current = true;
    const px = viewport.clientWidth / 2;
    const py = viewport.clientHeight / 2;
    setView((prev) => {
      const next = clamp(prev.scale * factor);
      const ratio = next / prev.scale;
      return { scale: next, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio };
    });
  };

  if (!work || missing) return <NotFound path={`/work/${slug}/canvas`} go={go} />;

  return (
    <section className={`canvas${narrow ? " canvas--list" : ""}`} aria-label={`${work.name} · ${C.label}`} aria-busy={!ready}>
      <div className="canvas__bar mono" data-token="surface.raised line.default">
        <a className="canvas__back" href={`/work/${slug}`} onClick={onClick}>
          ← {C.back}
        </a>
        <span className="canvas__name">{work.name}</span>
        {pages.length > 1 && (
          <div className="canvas__tabs" role="tablist" aria-label={C.pages}>
            {pages.map((p, k) => (
              <button key={p.key} type="button" role="tab" aria-selected={k === page} className="canvas__tab" onClick={() => setPage(k)}>
                {p.title ? p.title[lang] : p.label}
              </button>
            ))}
          </div>
        )}
        {ready && <span className="canvas__count">{W.screens(frames.length)}</span>}
      </div>

      {narrow ? (
        <div className="canvas__list">
          {frames.map((f, k) => (
            <figure key={f.id} className="canvas__frame">
              <Caption frame={f} lang={lang} />
              <img src={f.src} alt={C.frame(work.name, k + 1)} width={f.w} height={f.h} loading="lazy" decoding="async" />
            </figure>
          ))}
          {ready && <p className="canvas__note">{C.listNote}</p>}
        </div>
      ) : (
        /* 확대 버튼과 힌트는 뷰포트의 형제로 둔다. 뷰포트 안에 두면 끌기용 포인터 캡처가 버튼의 클릭을 삼킨다 */
        <div className="canvas__stage">
          <div ref={viewportRef} className="canvas__viewport" data-token="surface.sunken line.default" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <div
            ref={contentRef}
            className="canvas__content"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, width: CONTENT_WIDTH, padding: PADDING, columnCount: COLUMNS, columnGap: GAP }}
          >
            <Connectors links={links} />
            {frames.map((f, k) => (
              <figure
                key={f.id}
                className="canvas__frame"
                ref={(el) => {
                  if (el) boxes.current.set(f.id, el);
                  else boxes.current.delete(f.id);
                }}
              >
                <Caption frame={f} lang={lang} />
                <img src={f.src} alt={C.frame(work.name, k + 1)} width={f.w} height={f.h} loading="lazy" decoding="async" draggable={false} />
              </figure>
            ))}
          </div>
          </div>
          <span className="canvas__hint" aria-hidden="true">
            {C.hint}
          </span>
          <div className="canvas__zoom" data-token="surface.raised line.default">
            <button type="button" onClick={() => zoomBy(1 / 1.2)} aria-label={C.zoomOut}>
              −
            </button>
            <span className="canvas__scale" aria-live="polite">
              {Math.round(view.scale * 100)}%
            </span>
            <button type="button" onClick={() => zoomBy(1.2)} aria-label={C.zoomIn}>
              +
            </button>
            <button type="button" onClick={fit} aria-label={C.fit}>
              ⬚
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
