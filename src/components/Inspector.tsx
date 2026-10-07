// 검사 모드: data-token 요소에 올리면 토큰 사슬 툴팁과 간격 레드라인을 그린다. 값은 엔진에서 실시간으로 푼다.
// 검사가 켜졌을 때만 마운트되므로 상태는 매번 새것이다.
import { useEffect, useReducer, useState } from "react";
import { resolveToken } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";

export function Inspector() {
  const { setInspect, tokens } = useTokens();
  const { t } = useLang();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const pick = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-token]") as HTMLElement | null;
      if (el && el.closest(".inspector")) return;
      setTarget(el);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspect(false);
    };
    document.addEventListener("pointerover", pick);
    document.addEventListener("focusin", pick);
    window.addEventListener("keydown", key);
    // 스크롤·리사이즈마다 다시 잰다
    window.addEventListener("scroll", bump, true);
    window.addEventListener("resize", bump);
    return () => {
      document.removeEventListener("pointerover", pick);
      document.removeEventListener("focusin", pick);
      window.removeEventListener("keydown", key);
      window.removeEventListener("scroll", bump, true);
      window.removeEventListener("resize", bump);
    };
  }, [setInspect]);

  const el = target?.isConnected ? target : null;
  const box = el ? el.getBoundingClientRect() : null;
  const cs = el ? getComputedStyle(el) : null;
  const [pt, pr, pb, pl] = cs ? [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat) : [0, 0, 0, 0];
  const names = el?.dataset.token?.split(/\s+/).filter(Boolean) ?? [];
  const chains = names.map((n) => resolveToken(n, tokens)).filter((c): c is NonNullable<typeof c> => c !== null);
  const below = box ? box.top < 120 : false;

  return (
    <div className="inspector" aria-hidden="true">
      <div className="inspector__status mono">
        <span className="inspector__dot" />
        {t.inspect.status} <kbd>Esc</kbd> {t.inspect.exits}
      </div>

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
            <span className="redline__size mono">
              {Math.round(box.width)} × {Math.round(box.height)}
            </span>
          </div>
          {chains.length > 0 && (
            <div
              className="chain mono"
              data-testid="chain"
              style={{
                left: Math.max(8, Math.min(box.left, window.innerWidth - 8 - 420)),
                top: below ? box.top + box.height + 8 : undefined,
                bottom: below ? undefined : window.innerHeight - box.top + 8,
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
  );
}
