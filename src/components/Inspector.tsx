// 검사 모드: data-token 요소에 올리면 토큰 사슬 툴팁과 간격 레드라인을 그린다. 값은 엔진에서 실시간으로 푼다.
// 검사가 켜졌을 때만 마운트되므로 상태는 매번 새것이다. 부품을 클릭하면 번호 핀과 메모 입력이 뜬다 (메모는 store 에 남는다).
import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { resolveToken } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";

type Draft = { el: HTMLElement; tokens: string[]; label: string; path: string };

const tokenNames = (el: HTMLElement) => el.dataset.token?.split(/\s+/).filter(Boolean) ?? [];

// 핀을 다시 찾을 경로. id 가 있으면 거기서 끊는다
function cssPath(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    if (cur.id) {
      parts.unshift(`#${CSS.escape(cur.id)}`);
      return parts.join(" > ");
    }
    const tag = cur.tagName;
    const parent: Element | null = cur.parentElement;
    const same = parent ? [...parent.children].filter((c) => c.tagName === tag) : [];
    parts.unshift(same.length > 1 ? `${tag.toLowerCase()}:nth-of-type(${same.indexOf(cur) + 1})` : tag.toLowerCase());
    cur = parent;
  }
  return ["body", ...parts].join(" > ");
}

// 에이전트가 읽을 요소 설명: 태그.첫 클래스 "글자"
function describe(el: HTMLElement): string {
  const cls = el.classList[0] ? `.${el.classList[0]}` : "";
  // 글자 조각을 띄어 이어 붙인다. innerText 는 CSS 대문자 변환까지 따라와서 쓰지 않는다
  const words: string[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) words.push(walk.currentNode.textContent ?? "");
  const raw = (el.getAttribute("aria-label") || words.join(" ")).replace(/\s+/g, " ").trim();
  const text = raw.length > 32 ? `${raw.slice(0, 32)}...` : raw;
  return `${el.tagName.toLowerCase()}${cls}${text ? ` "${text}"` : ""}`;
}

const find = (path: string) => {
  try {
    return document.querySelector<HTMLElement>(path);
  } catch {
    return null;
  }
};

export function Inspector() {
  const { setInspect, tokens, notes, addNote } = useTokens();
  const { t } = useLang();
  const I = t.inspect;
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [text, setText] = useState("");
  const draftRef = useRef<Draft | null>(null);
  const backTo = useRef<HTMLElement | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  // 커서 위치: 눈금자 표시와 십자선. 마우스일 때만
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const closeDraft = () => {
    draftRef.current = null;
    setDraft(null);
    setText("");
    backTo.current?.focus?.();
  };

  useEffect(() => {
    const pick = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-token]") as HTMLElement | null;
      if (el && el.closest(".inspector")) return;
      setTarget(el);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // 메모 입력 중이면 입력만 닫는다
      if (draftRef.current) {
        draftRef.current = null;
        setDraft(null);
        setText("");
        backTo.current?.focus?.();
        return;
      }
      setInspect(false);
    };
    // 부품 클릭은 원래 동작 대신 메모를 연다. 메모 상자·헤더 도구·토스트는 그대로 둔다
    const click = (e: MouseEvent) => {
      const hit = e.target as HTMLElement | null;
      if (!hit?.closest || hit.closest(".inspector, [data-note-skip], .toasts")) return;
      const el = hit.closest<HTMLElement>("[data-token]");
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      backTo.current = document.activeElement as HTMLElement | null;
      const d = { el, tokens: tokenNames(el), label: describe(el), path: cssPath(el) };
      draftRef.current = d;
      setDraft(d);
      setText("");
    };
    document.addEventListener("pointerover", pick);
    document.addEventListener("focusin", pick);
    document.addEventListener("click", click, true);
    window.addEventListener("keydown", key);
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCursor({ x: Math.round(e.clientX), y: Math.round(e.clientY) }));
    };
    window.addEventListener("pointermove", move);
    // 스크롤·리사이즈마다 다시 잰다
    window.addEventListener("scroll", bump, true);
    window.addEventListener("resize", bump);
    return () => {
      document.removeEventListener("pointerover", pick);
      document.removeEventListener("focusin", pick);
      document.removeEventListener("click", click, true);
      window.removeEventListener("keydown", key);
      window.removeEventListener("scroll", bump, true);
      window.removeEventListener("resize", bump);
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [setInspect]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft || !text.trim()) return;
    addNote({ tokens: draft.tokens, label: draft.label, path: draft.path, body: text.trim() });
    closeDraft();
  };

  // 메모 입력 중엔 그 부품을 붙잡아 둔다
  const live = draft?.el ?? target;
  const el = live?.isConnected ? live : null;
  const box = el ? el.getBoundingClientRect() : null;
  const cs = el ? getComputedStyle(el) : null;
  const [pt, pr, pb, pl] = cs ? [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat) : [0, 0, 0, 0];
  const names = el ? tokenNames(el) : [];
  const chains = names.map((n) => resolveToken(n, tokens)).filter((c): c is NonNullable<typeof c> => c !== null);
  const below = box ? box.top < 120 : false;

  const pins = notes.map((n, i) => ({ n: i + 1, id: n.id, box: find(n.path)?.getBoundingClientRect() })).filter((p) => p.box && p.box.width > 0);
  const dbox = draft?.el.isConnected ? draft.el.getBoundingClientRect() : null;
  const dBelow = dbox ? dbox.bottom + 200 < window.innerHeight : true;

  return (
    <div className="inspector">
      <div aria-hidden="true">
      <div className="inspector__rows" />
      {cursor && (
        <>
          <i className="crosshair crosshair--x" style={{ top: cursor.y }} />
          <i className="crosshair crosshair--y" style={{ left: cursor.x }} />
        </>
      )}
      <Rulers cursor={cursor} />
      <div className="inspector__status mono">
        <span className="inspector__dot" />
        <span>{I.label}</span>
        <span className="inspector__sep">·</span>
        <span>
          {window.innerWidth} × {window.innerHeight}
        </span>
        <span className="inspector__sep">·</span>
        <span>{I.grid}</span>
        <span className="inspector__sep">·</span>
        <span className="inspector__notes">{I.notes(notes.length)}</span>
        <span className="inspector__sep inspector__hint">·</span>
        <span className="inspector__hint">{I.pin}</span>
        <span className="inspector__done">
          {I.done} <kbd>Esc</kbd>
        </span>
      </div>

      {pins.map((p) => (
        <span key={p.id} className="pin mono" style={{ top: p.box?.top, left: p.box?.left }}>
          {p.n}
        </span>
      ))}

      {box && (
        <>
          <div className="redline" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
            {pt > 0 && (
              <i className="redline__pad" style={{ top: 0, left: 0, right: 0, height: pt }}>
                <span>{pt}</span>
              </i>
            )}
            {pb > 0 && (
              <i className="redline__pad" style={{ bottom: 0, left: 0, right: 0, height: pb }}>
                <span>{pb}</span>
              </i>
            )}
            {pl > 0 && (
              <i className="redline__pad" style={{ top: pt, bottom: pb, left: 0, width: pl }}>
                <span>{pl}</span>
              </i>
            )}
            {pr > 0 && (
              <i className="redline__pad" style={{ top: pt, bottom: pb, right: 0, width: pr }}>
                <span>{pr}</span>
              </i>
            )}
            <span className="redline__size mono" data-below={below || undefined}>
              {el?.tagName.toLowerCase()} · {Math.round(box.width)} × {Math.round(box.height)}
            </span>
          </div>
          {chains.length > 0 && !draft && (
            <div
              className="chain mono"
              data-testid="chain"
              style={{
                left: Math.max(8, Math.min(box.left, window.innerWidth - 8 - 420)),
                top: below ? box.top + box.height + 26 : undefined,
                bottom: below ? undefined : window.innerHeight - box.top + 26,
              }}
            >
              {chains.map((c) => (
                <div key={c.text} className="chain__row">
                  {c.links.map((l, i) => (
                    <span key={l.name} className="chain__link">
                      {i > 0 && <span className="chain__arrow">→</span>}
                      {l.name}
                    </span>
                  ))}
                  <span className="chain__eq">=</span>
                  {/^#/.test(c.value) && <i className="chain__swatch" style={{ background: c.value }} />}
                  <span className="chain__value">{c.value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>

      {draft && dbox && (
        <form
          className="notedraft"
          aria-label={I.draft(notes.length + 1)}
          onSubmit={save}
          style={{
            left: Math.max(8, Math.min(dbox.left, window.innerWidth - 8 - 320)),
            top: dBelow ? dbox.bottom + 8 : undefined,
            bottom: dBelow ? undefined : window.innerHeight - dbox.top + 8,
          }}
        >
          <span className="pin pin--inline mono" style={{ position: "absolute", top: -11, left: -11 }} aria-hidden="true">
            {notes.length + 1}
          </span>
          <div className="notedraft__label mono">{draft.label}</div>
          {draft.tokens.length > 0 && <div className="notedraft__tokens mono">{draft.tokens.join(" · ")}</div>}
          <textarea
            className="fx-input notedraft__input"
            rows={2}
            autoFocus
            value={text}
            placeholder={I.placeholder}
            aria-label={I.draft(notes.length + 1)}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter 는 남기기, Shift+Enter 는 줄바꿈
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="notedraft__row">
            <button type="submit" className="btn btn--sm" disabled={!text.trim()}>
              {I.save}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={closeDraft}>
              {I.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// 위·왼쪽 눈금자. 8px 잔눈금, 80px 마다 숫자, 커서 자리는 강조색 칸
function Rulers({ cursor }: { cursor: { x: number; y: number } | null }) {
  const xs = Array.from({ length: Math.ceil(window.innerWidth / 80) }, (_, i) => i * 80).slice(1);
  const ys = Array.from({ length: Math.ceil(window.innerHeight / 80) }, (_, i) => i * 80).slice(1);
  return (
    <>
      <div className="ruler ruler--x mono">
        {xs.map((x) => (
          <span key={x} className="ruler__n" style={{ left: x }}>
            {x}
          </span>
        ))}
        {cursor && (
          <span className="ruler__mark" style={{ left: cursor.x }}>
            {cursor.x}
          </span>
        )}
      </div>
      <div className="ruler ruler--y mono">
        {ys.map((y) => (
          <span key={y} className="ruler__n" style={{ top: y }}>
            {y}
          </span>
        ))}
        {cursor && (
          <span className="ruler__mark" style={{ top: cursor.y }}>
            {cursor.y}
          </span>
        )}
      </div>
      <i className="ruler__corner" />
    </>
  );
}
