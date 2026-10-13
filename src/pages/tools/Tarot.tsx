// 타로 (/tools/tarot). 질문은 화면에만 있고 어디로도 가지 않는다. 카드는 crypto 난수로 뽑고, 공유 코드에는 카드 번호와 방향만 담는다.
import { useEffect, useState } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { useTokens } from "../../tokens/useTokens.ts";
import { CARDS, decodeTarot, draw, encodeTarot, summarize, type Draw, type Shape, type Spread } from "../../tools/tarot.ts";
import { copyText, readCode, shareUrl, writeCode } from "../../tools/share.ts";
import { Corners } from "../../components/Annot.tsx";
import { ToolActions, ToolShell } from "./Shell.tsx";

const FILL: Record<string, string> = { a: "var(--accent-default)", b: "var(--accent-secondary)", i: "var(--text-default)", s: "var(--accent-soft)", l: "var(--line-strong)", n: "none" };

function Glyph({ shapes }: { shapes: Shape[] }) {
  return (
    <svg className="tcard__glyph" viewBox="0 0 100 160" aria-hidden="true">
      {shapes.map((s, i) => {
        const common = { fill: FILL[s.k === "l" ? "n" : s.f], stroke: "s" in s && s.s ? FILL[s.s] : "none", strokeWidth: s.k === "l" ? (s.w ?? 2) : 2, strokeLinecap: "round" as const };
        if (s.k === "c") return <circle key={i} cx={s.x} cy={s.y} r={s.r} {...common} />;
        if (s.k === "r") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} {...common} />;
        if (s.k === "p") return <path key={i} d={s.d} {...common} strokeLinejoin="round" />;
        return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} />;
      })}
    </svg>
  );
}

export function Tarot({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const T = t.toolsPage;
  const R = T.tarot;
  const { toast, tokens } = useTokens();
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<Spread>(3);
  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const still = tokens.dials.motion === "off";

  useEffect(() => {
    const code = readCode();
    const decoded = code ? decodeTarot(code) : null;
    if (decoded) {
      setDraws(decoded);
      setSpread(decoded.length as Spread);
      setFlipped(decoded.map(() => true));
    }
  }, []);

  const doDraw = () => {
    const d = draw(spread);
    setDraws(d);
    setFlipped(d.map(() => false));
    writeCode(encodeTarot(d));
    // 모션이 꺼져 있으면 바로 보여 준다. 켜져 있으면 한 장씩 차례로 뒤집는다
    if (still) setFlipped(d.map(() => true));
    else d.forEach((_, i) => window.setTimeout(() => setFlipped((f) => f.map((v, k) => (k === i ? true : v))), 500 + i * 450));
  };
  const reset = () => {
    setDraws(null);
    setFlipped([]);
    writeCode(null);
  };
  const share = async () => {
    if (!draws) return;
    toast((await copyText(shareUrl("/tools/tarot", encodeTarot(draws)))) ? T.shared : t.toasts.copyFailed);
  };
  const allUp = draws !== null && flipped.every(Boolean);

  return (
    <ToolShell slug="tarot" go={go}>
      <div className="tarot">
        <div className="tarot__ctl" data-token="card.bg card.line card.radius">
          <label className="sform__f tarot__q">
            <span className="mono">
              {R.question} <span className="sform__opt">({T.optional})</span>
            </span>
            <input className="fx-input" type="text" value={question} maxLength={80} onChange={(e) => setQuestion(e.target.value)} placeholder="..." autoComplete="off" />
            <span className="mono tarot__hint">{R.questionHint}</span>
          </label>
          <div className="sform__row">
            <span className="sform__label mono">{R.spread}</span>
            <div className="seg sform__seg" role="radiogroup" aria-label={R.spread}>
              {([1, 3] as Spread[]).map((n) => (
                <label key={n} className="seg__item" data-on={spread === n || undefined}>
                  <input type="radio" name="spread" value={n} checked={spread === n} onChange={() => setSpread(n)} disabled={draws !== null} />
                  <span>{n === 1 ? R.one : R.three}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="fx__formbtns">
            {!draws ? (
              <button type="button" className="btn" data-token="button.bg button.fg button.radius" onClick={doDraw}>
                {R.draw}
              </button>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={reset}>
                {R.redraw}
              </button>
            )}
          </div>
        </div>

        <div className="tarot__table" data-n={spread}>
          {(draws ?? Array.from({ length: spread }, () => null)).map((d, i) => {
            const card = d ? CARDS[d.n] : null;
            const up = d !== null && flipped[i];
            return (
              <div key={i} className="tslot">
                {spread === 3 && <span className="tslot__pos mono">{R.positions[i]}</span>}
                <button
                  type="button"
                  className="tcard"
                  data-up={up || undefined}
                  data-rev={(d?.rev && up) || undefined}
                  disabled={!d || up}
                  aria-label={card && up ? R.cardLabel(card.name[lang]) : R.flip}
                  onClick={() => setFlipped((f) => f.map((v, k) => (k === i ? true : v)))}
                >
                  <span className="tcard__inner">
                    <span className="tcard__back" data-token="accent.default accent.on">
                      <Corners />
                      <span className="tcard__backmark" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                    <span className="tcard__face" data-token="card.bg card.line">
                      {card && (
                        <>
                          <span className="tcard__n mono">{String(card.n).padStart(2, "0")}</span>
                          <Glyph shapes={card.glyph} />
                          <span className="tcard__name">{card.name[lang]}</span>
                        </>
                      )}
                    </span>
                  </span>
                </button>
                {card && up && (
                  <span className="tslot__dir mono" data-rev={d?.rev || undefined}>
                    {d?.rev ? R.reversed : R.upright}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {draws && allUp && (
          <div className="fx__result tres">
            {question.trim() && <p className="tres__q">"{question.trim()}"</p>}
            <ol className="tres__cards" role="list">
              {draws.map((d, i) => {
                const c = CARDS[d.n];
                const m = d.rev ? c.rev : c.up;
                return (
                  <li key={i} className="tres__card" data-token="surface.raised line.default">
                    <span className="mono tres__pos">
                      {spread === 3 ? `${R.positions[i]} · ` : ""}
                      {c.name[lang]} · {d.rev ? R.reversed : R.upright}
                    </span>
                    <span className="tres__words">{m.words[lang]}</span>
                    <p className="tres__line">{m.line[lang]}</p>
                  </li>
                );
              })}
            </ol>
            <div className="tres__sum" data-token="card.bg card.line card.radius">
              <span className="mono fx__label">{R.summary}</span>
              <p>{summarize(draws, lang)}</p>
            </div>
            <ToolActions>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => void share()}>
                {T.share}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                {R.redraw}
              </button>
            </ToolActions>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
