// 성향 검사 (/tools/mbti). 스무 문항 5점 척도. 결과는 유형·네 축 막대·설명이고, 끝은 이 사이트의 다이얼로 이어진다.
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { useTokens } from "../../tokens/useTokens.ts";
import { PRESETS } from "../../tokens/engine.ts";
import { AXES, AXIS_META, QUESTIONS, TYPES, decodeMbti, dialsOf, encodeMbti, scoreMbti, type MbtiResult } from "../../tools/mbti.ts";
import { copyText, readCode, shareUrl, writeCode } from "../../tools/share.ts";
import { Bipolar } from "../../tools/Charts.tsx";
import { ToolActions, ToolShell } from "./Shell.tsx";

const hueDist = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

export function Mbti({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const T = t.toolsPage;
  const M = T.mbti;
  const { set, toast, setPanelOpen } = useTokens();
  const [answers, setAnswers] = useState<(number | undefined)[]>(() => Array.from({ length: QUESTIONS.length }, () => undefined));
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const code = readCode();
    const decoded = code ? decodeMbti(code) : null;
    if (decoded) setResult(decoded);
  }, []);

  const done = answers.filter((a) => a !== undefined).length;
  const complete = done === QUESTIONS.length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!complete) return;
    const r = scoreMbti(answers);
    setResult(r);
    writeCode(encodeMbti(r));
    requestAnimationFrame(() => document.getElementById("mbti-result")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };
  const reset = () => {
    setResult(null);
    setTried(false);
    setAnswers(Array.from({ length: QUESTIONS.length }, () => undefined));
    writeCode(null);
    window.scrollTo(0, 0);
  };
  const share = async () => {
    if (!result) return;
    toast((await copyText(shareUrl("/tools/mbti", encodeMbti(result)))) ? T.shared : t.toasts.copyFailed);
  };

  const info = result ? TYPES[result.type] : null;
  const wear = result ? dialsOf(result.type) : null;
  const closest = useMemo(() => {
    if (!wear?.hue) return null;
    const h = wear.hue;
    return [...PRESETS].sort((a, b) => hueDist(a.dials.hue ?? 0, h) - hueDist(b.dials.hue ?? 0, h))[0] ?? null;
  }, [wear]);

  return (
    <ToolShell slug="mbti" go={go}>
      {!result && (
        <form className="quiz" onSubmit={submit}>
          <p className="quiz__progress mono" aria-live="polite">
            {M.progress(done, QUESTIONS.length)}
          </p>
          <ol className="quiz__list" role="list">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="quiz__q" data-token="card.bg card.line card.radius" data-missing={(tried && answers[i] === undefined) || undefined}>
                <span className="quiz__idx mono">q{String(i + 1).padStart(2, "0")}</span>
                <p className="quiz__text">{q.text[lang]}</p>
                <div className="quiz__scale" role="radiogroup" aria-label={q.text[lang]}>
                  <span className="quiz__end mono">{M.scale[0]}</span>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <label key={v} className="quiz__opt" data-on={answers[i] === v || undefined} title={M.scale[v - 1]}>
                      <input type="radio" name={`q${i}`} value={v} checked={answers[i] === v} onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? v : x)))} />
                      <span className="quiz__dot" data-size={Math.abs(v - 3)} aria-hidden="true" />
                      <span className="sr-only">{M.scale[v - 1]}</span>
                    </label>
                  ))}
                  <span className="quiz__end mono">{M.scale[4]}</span>
                </div>
              </li>
            ))}
          </ol>
          {tried && !complete && (
            <p className="sform__error mono" role="alert">
              {M.incomplete}
            </p>
          )}
          <div className="fx__formbtns">
            <button type="submit" className="btn" data-token="button.bg button.fg button.radius">
              {M.submit}
            </button>
          </div>
        </form>
      )}

      {result && info && wear && (
        <div id="mbti-result" className="fx__result mres">
          <div className="mres__type" data-token="card.bg card.line card.radius">
            <span className="mono fx__label">{M.type}</span>
            <p className="mres__code h1" style={{ color: `oklch(0.6 0.2 ${wear.hue})` }}>
              {result.type}
            </p>
            <p className="mres__name h2">{info.name[lang]}</p>
            <p className="mres__line">{info.line[lang]}</p>
          </div>
          <div className="mres__axes" data-token="surface.raised line.default">
            <span className="mono fx__label">{M.axes}</span>
            {AXES.map((a) => (
              <Bipolar key={a} left={AXIS_META[a].left[lang]} right={AXIS_META[a].right[lang]} pct={result.percent[a]} />
            ))}
          </div>
          <ToolActions>
            <button
              type="button"
              className="btn btn--sm"
              data-token="button.bg button.fg button.radius"
              onClick={() => {
                set(wear);
                setPanelOpen(true);
                toast(T.wore(result.type));
              }}
            >
              <i className="fx__sw" style={{ background: `oklch(0.72 0.17 ${wear.hue})` }} aria-hidden="true" />
              {T.wearHue}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void share()}>
              {T.share}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
              {T.again}
            </button>
          </ToolActions>
          {closest && <p className="mono fx__note">{M.closest(closest.name)}</p>}
        </div>
      )}
    </ToolShell>
  );
}
