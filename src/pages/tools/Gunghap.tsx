// 궁합 (/tools/gunghap). 두 사람의 사주를 겹친다. 공유 코드 g<a>_<b> 에는 두 날짜만 담기고 이름은 담기지 않는다.
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { useTokens } from "../../tokens/useTokens.ts";
import { internalClick } from "../../router.ts";
import { computeSaju, decodeSaju, encodeSaju, ELEMENTS, ELEMENT_META, type SajuInput } from "../../tools/saju.ts";
import { computeGunghap, type Note } from "../../tools/gunghap.ts";
import { copyText, readCode, shareUrl, writeCode } from "../../tools/share.ts";
import { Radar, Ring } from "../../tools/Charts.tsx";
import { EMPTY_FORM, SajuFields, formOf, inputOf, type SajuForm } from "./SajuForm.tsx";
import { SajuResultView } from "./Saju.tsx";
import { ToolActions, ToolShell } from "./Shell.tsx";

const encode = (a: SajuInput, b: SajuInput) => `g${encodeSaju(a)}_${encodeSaju(b)}`;
function decode(code: string): { a: SajuInput | null; b: SajuInput | null } {
  const m = /^g([^_]+)(?:_([^_]+))?$/.exec(code);
  if (!m) return { a: null, b: null };
  return { a: decodeSaju(m[1]), b: m[2] ? decodeSaju(m[2]) : null };
}

export function Gunghap({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const T = t.toolsPage;
  const G = T.gunghap;
  const { toast } = useTokens();
  const [names, setNames] = useState<[string, string]>(["", ""]);
  const [forms, setForms] = useState<[SajuForm, SajuForm]>([EMPTY_FORM, EMPTY_FORM]);
  const [inputs, setInputs] = useState<[SajuInput, SajuInput] | null>(null);
  const [errors, setErrors] = useState<[string | undefined, string | undefined]>([undefined, undefined]);

  useEffect(() => {
    const code = readCode();
    if (!code) return;
    const { a, b } = decode(code);
    if (a && b) {
      setInputs([a, b]);
      setForms([formOf(a), formOf(b)]);
    } else if (a) {
      // 사주 화면에서 "궁합 보기"로 넘어온 경우: 첫째 사람만 채워 둔다
      setForms([formOf(a), EMPTY_FORM]);
    }
  }, []);

  const label: [string, string] = [names[0].trim() || G.namePlaceholder[0], names[1].trim() || G.namePlaceholder[1]];
  const result = useMemo(() => {
    if (!inputs) return null;
    const a = computeSaju(inputs[0]);
    const b = computeSaju(inputs[1]);
    return { a, b, g: computeGunghap(a, b, label) };
  }, [inputs, label[0], label[1]]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const a = inputOf(forms[0]);
    const b = inputOf(forms[1]);
    setErrors([a ? undefined : T.saju.invalid, b ? undefined : T.saju.invalid]);
    if (!a || !b) return;
    setInputs([a, b]);
    writeCode(encode(a, b));
    requestAnimationFrame(() => document.getElementById("gunghap-result")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };
  const reset = () => {
    setInputs(null);
    writeCode(null);
  };
  const share = async () => {
    if (!inputs) return;
    toast((await copyText(shareUrl("/tools/gunghap", encode(inputs[0], inputs[1])))) ? T.shared : t.toasts.copyFailed);
  };
  const byKind = (k: Note["kind"]) => result?.g.notes.filter((n) => n.kind === k) ?? [];
  const labels = ELEMENTS.map((e) => ELEMENT_META[e].ko);

  return (
    <ToolShell slug="gunghap" go={go}>
      <form className="gform" onSubmit={submit}>
        {([0, 1] as const).map((i) => (
          <fieldset key={i} className="gform__person" data-token="card.bg card.line card.radius">
            <legend className="mono gform__legend">{i === 0 ? G.a : G.b}</legend>
            <label className="sform__f">
              <span className="mono">
                {G.name} <span className="sform__opt">({T.optional})</span>
              </span>
              <input className="fx-input" type="text" maxLength={12} value={names[i]} placeholder={G.namePlaceholder[i]} autoComplete="off" onChange={(e) => setNames((n) => (i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value]))} />
            </label>
            <SajuFields value={forms[i]} onChange={(f) => setForms((fs) => (i === 0 ? [f, fs[1]] : [fs[0], f]))} error={errors[i]} />
          </fieldset>
        ))}
        <div className="fx__formbtns gform__btns">
          <button type="submit" className="btn" data-token="button.bg button.fg button.radius">
            {T.run}
          </button>
          {inputs && (
            <button type="button" className="btn btn--ghost" onClick={reset}>
              {T.again}
            </button>
          )}
        </div>
      </form>

      {result && inputs && (
        <div id="gunghap-result" className="fx__result gres">
          <div className="gres__top">
            <div className="gres__score" data-token="card.bg card.line card.radius">
              <Ring value={result.g.score} label={G.score} size={132} />
              <div>
                <span className="mono fx__label">{G.score}</span>
                <p className="gres__names h2">
                  {label[0]} <span aria-hidden="true">×</span> {label[1]}
                </p>
                <p className="mono gres__hint">{G.scoreHint}</p>
              </div>
            </div>
            <div className="gres__overlay" data-token="surface.raised line.default">
              <span className="mono fx__label">{G.overlay}</span>
              <Radar
                labels={labels}
                series={[
                  { values: ELEMENTS.map((e) => result.a.percent[e] / 45), color: "a" },
                  { values: ELEMENTS.map((e) => result.b.percent[e] / 45), color: "b", hatch: true },
                ]}
                size={240}
              />
              <span className="mono gres__legend">{G.legend(label[0], label[1])}</span>
            </div>
          </div>
          <div className="gres__notes">
            {(["good", "clash", "fill"] as const).map((k) => (
              <section key={k} className="gres__group" data-kind={k} data-token="surface.raised line.default">
                <h2 className="gres__h mono">{G[k]}</h2>
                {byKind(k).length ? (
                  <ul role="list">
                    {byKind(k).map((n, i) => (
                      <li key={i}>{n.text[lang]}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mono gres__none">-</p>
                )}
              </section>
            ))}
          </div>
          <div className="gres__pair">
            {([0, 1] as const).map((i) => (
              <details key={i} className="gres__saju" data-token="surface.raised line.default">
                <summary className="mono">{G.toSaju(label[i])}</summary>
                <SajuResultView result={i === 0 ? result.a : result.b} compact />
                <a className="btn btn--ghost btn--sm" href={`/tools/saju?r=${encodeSaju(inputs[i])}`} onClick={internalClick(go)}>
                  {T.items.saju.name} →
                </a>
              </details>
            ))}
          </div>
          <ToolActions>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void share()}>
              {T.share}
            </button>
          </ToolActions>
        </div>
      )}
    </ToolShell>
  );
}
