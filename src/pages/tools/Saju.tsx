// 사주 풀이 (/tools/saju). 입력은 브라우저 안에서 끝나고, 공유 링크(r=s...)에는 날짜·시·달력만 담긴다.
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { useTokens } from "../../tokens/useTokens.ts";
import { internalClick } from "../../router.ts";
import { computeSaju, decodeSaju, encodeSaju, DAY_MASTER, ELEMENTS, ELEMENT_META, ELEMENT_TEXT, type Pillar, type SajuInput, type SajuResult } from "../../tools/saju.ts";
import { copyText, readCode, shareUrl, writeCode } from "../../tools/share.ts";
import { Radar, Stack } from "../../tools/Charts.tsx";
import { EMPTY_FORM, SajuFields, formOf, inputOf, type SajuForm } from "./SajuForm.tsx";
import { ToolActions, ToolShell } from "./Shell.tsx";

export function Saju({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  const T = t.toolsPage;
  const S = T.saju;
  const { toast } = useTokens();
  const [form, setForm] = useState<SajuForm>(EMPTY_FORM);
  const [input, setInput] = useState<SajuInput | null>(null);
  const [error, setError] = useState<string | undefined>();

  // 주소에 결과 코드가 있으면 그 날짜로 바로 연다
  useEffect(() => {
    const code = readCode();
    const decoded = code ? decodeSaju(code) : null;
    if (decoded) {
      setInput(decoded);
      setForm(formOf(decoded));
    }
  }, []);

  const result = useMemo(() => (input ? computeSaju(input) : null), [input]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = inputOf(form);
    if (!next) {
      setError(S.invalid);
      return;
    }
    setError(undefined);
    setInput(next);
    writeCode(encodeSaju(next));
    requestAnimationFrame(() => document.getElementById("saju-result")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };
  const reset = () => {
    setInput(null);
    setForm(EMPTY_FORM);
    writeCode(null);
  };
  const share = async () => {
    if (!input) return;
    toast((await copyText(shareUrl("/tools/saju", encodeSaju(input)))) ? T.shared : t.toasts.copyFailed);
  };

  return (
    <ToolShell slug="saju" go={go}>
      <div className="fx__grid">
        <form className="fx__form" onSubmit={submit} data-token="card.bg card.line card.radius">
          <SajuFields value={form} onChange={setForm} error={error} />
          <div className="fx__formbtns">
            <button type="submit" className="btn" data-token="button.bg button.fg button.radius">
              {T.run}
            </button>
            {input && (
              <button type="button" className="btn btn--ghost" onClick={reset}>
                {T.again}
              </button>
            )}
          </div>
        </form>

        {result && input && (
          <div id="saju-result" className="fx__result">
            <SajuResultView result={result} />
            <ToolActions>
              <WearElement result={result} />
              <a className="btn btn--ghost btn--sm" href={`/tools/gunghap?r=g${encodeSaju(input)}`} onClick={internalClick(go)}>
                {S.toGunghap} →
              </a>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => void share()}>
                {T.share}
              </button>
            </ToolActions>
            <ul className="fx__notes mono" role="list">
              {S.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

const elColor = (el: Pillar["ganEl"]) => `oklch(0.74 0.14 ${ELEMENT_META[el].hue})`;

function PillarCard({ p, name }: { p: Pillar; name: string }) {
  return (
    <li className="pillar" data-token="surface.raised line.default">
      <span className="pillar__name mono">{name}</span>
      <span className="pillar__gz">
        <b style={{ color: elColor(p.ganEl) }}>{p.gan}</b>
        <b style={{ color: elColor(p.zhiEl) }}>{p.zhi}</b>
      </span>
      <span className="pillar__ko mono">
        {p.ganKo}
        {p.zhiKo}
      </span>
    </li>
  );
}

/** 결과 본문. 궁합 화면에서도 작은 판으로 쓴다 */
export function SajuResultView({ result, compact = false }: { result: SajuResult; compact?: boolean }) {
  const { lang, t } = useLang();
  const S = t.toolsPage.saju;
  const dm = DAY_MASTER[result.dayMaster.gan];
  const labels = ELEMENTS.map((e) => ELEMENT_META[e].ko);
  const values = ELEMENTS.map((e) => result.percent[e] / 45);
  const strongText = ELEMENT_TEXT[result.strongest].strong[lang];
  const missingText = result.missing.length ? result.missing.map((e) => ELEMENT_TEXT[e].missing[lang]).join(" ") : S.balanced;
  return (
    <div className="sres" data-compact={compact || undefined}>
      <p className="sres__dates mono">
        {S.dates(result.solar, result.lunar)} · {S.animal(result.animal[lang])}
      </p>
      <ul className="pillars" role="list" aria-label={S.pillars}>
        <PillarCard p={result.pillars.year} name={S.pillarNames.year} />
        <PillarCard p={result.pillars.month} name={S.pillarNames.month} />
        <PillarCard p={result.pillars.day} name={S.pillarNames.day} />
        {result.pillars.time ? (
          <PillarCard p={result.pillars.time} name={S.pillarNames.time} />
        ) : (
          <li className="pillar pillar--empty mono" data-token="surface.raised line.default">
            {S.noHour}
          </li>
        )}
      </ul>
      <div className="sres__dm">
        <span className="mono sres__label">{S.dayMaster}</span>
        <p className="sres__dmname h2">{dm.name[lang]}</p>
        {!compact && <p className="sres__dmline">{dm.line[lang]}</p>}
      </div>
      <div className="sres__el">
        <div className="sres__radar">
          <Radar labels={labels} series={[{ values, color: "a" }]} size={240} />
        </div>
        <div className="sres__elbody">
          <span className="mono sres__label">{S.elements}</span>
          <Stack items={ELEMENTS.map((e) => ({ label: `${ELEMENT_META[e].ko} ${result.percent[e]}%`, pct: result.percent[e], hue: ELEMENT_META[e].hue }))} />
          <dl className="sres__dl">
            <dt className="mono">{S.strong}</dt>
            <dd>{strongText}</dd>
            <dt className="mono">{S.missing}</dt>
            <dd>{missingText}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

/** 가장 많은 오행의 색으로 사이트 다이얼을 돌린다 */
export function WearElement({ result }: { result: SajuResult }) {
  const { lang, t } = useLang();
  const { set, toast, setPanelOpen } = useTokens();
  const meta = ELEMENT_META[result.strongest];
  const name = lang === "ko" ? `${meta.koWord}(${meta.ko})` : meta.en;
  return (
    <button
      type="button"
      className="btn btn--sm"
      data-token="button.bg button.fg button.radius"
      onClick={() => {
        set({ hue: meta.hue, neutral: meta.neutral });
        setPanelOpen(true);
        toast(t.toolsPage.wore(name));
      }}
    >
      <i className="fx__sw" style={{ background: `oklch(0.72 0.17 ${meta.hue})` }} aria-hidden="true" />
      {t.toolsPage.wearHue}
    </button>
  );
}
