// 시안 비교 보드: 다이얼 조합을 저장해 나란히 본다. 카드마다 그 시안의 토큰을 inline style 로 심어서
// :root 와 상관없이 그 카드만 그 토큰으로 칠해진다. 누르면 그 시안을 입고, 토스트로 되돌릴 수 있다.
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { buildTokens, sameDials } from "../tokens/engine.ts";
import { MAX_VARIANTS, VARIANTS_KEY, addVariant, parseVariants, removeVariant, renameVariant, type Variant } from "../tokens/variants.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";
import { Corners } from "./Annot.tsx";

function readVariants(): Variant[] {
  try {
    return parseVariants(JSON.parse(window.localStorage.getItem(VARIANTS_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function VariantBoard() {
  const { lang, t } = useLang();
  const V = t.front.variants;
  const { dials, set, toast } = useTokens();
  const [list, setList] = useState<Variant[]>(readVariants);

  useEffect(() => {
    try {
      window.localStorage.setItem(VARIANTS_KEY, JSON.stringify(list));
    } catch {
      // 저장소가 막혀 있어도 이번 방문 동안은 보인다
    }
  }, [list]);

  const save = () => {
    const r = addVariant(list, dials, newId());
    if (r.status === "full") return toast(t.toasts.variantsFull(MAX_VARIANTS));
    if (r.status === "exists") return toast(t.toasts.variantExists(r.variant?.name ?? ""));
    setList(r.list);
    toast(t.toasts.variantSaved(r.variant?.name ?? ""));
  };
  const wear = (v: Variant) => {
    if (sameDials(v.dials, dials)) return;
    const before = dials;
    set(v.dials);
    toast(t.toasts.variantWearing(v.name), { label: t.toasts.undo, onClick: () => set(before) });
  };
  const full = list.length >= MAX_VARIANTS;

  return (
    <div className="variants">
      <div className="variants__head mono">
        <span>
          {V.label} <span className="take__hint">· {V.hint}</span>
        </span>
        <span className="variants__tools">
          <span aria-live="polite">{V.count(list.length, MAX_VARIANTS)}</span>
          <button type="button" className="btn btn--sm" onClick={save} disabled={full} title={full ? V.full : undefined}>
            {V.save}
          </button>
        </span>
      </div>
      {list.length === 0 ? (
        <p className="variants__empty">{V.empty}</p>
      ) : (
        <ul className="variants__list" role="list">
          {list.map((v, i) => (
            <VariantCard
              key={v.id}
              v={v}
              index={i}
              on={sameDials(v.dials, dials)}
              lang={lang}
              onWear={() => wear(v)}
              onRename={(name) => setList((l) => renameVariant(l, v.id, name))}
              onRemove={() => setList((l) => removeVariant(l, v.id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type CardProps = { v: Variant; index: number; on: boolean; lang: string; onWear: () => void; onRename: (name: string) => void; onRemove: () => void };

function VariantCard({ v, index, on, lang, onWear, onRename, onRemove }: CardProps) {
  const { t } = useLang();
  const V = t.front.variants;
  const S = t.front.sample;
  // 이 카드 범위의 토큰. 제목 자간은 :root 에서 언어로 갈리므로 여기서도 다시 고른다
  const style = useMemo(() => {
    const vars = buildTokens(v.dials).vars;
    return {
      ...vars,
      "--heading-tracking": lang === "ko" ? vars["--heading-tracking-hangul"] : vars["--heading-tracking-latin"],
      colorScheme: v.dials.theme,
    } as CSSProperties;
  }, [v.dials, lang]);
  // 고치는 중일 때만 입력값을 따로 든다. null 이면 저장된 이름
  const [name, setName] = useState<string | null>(null);
  const commit = () => {
    if (name !== null) onRename(name);
    setName(null);
  };
  const d = v.dials;

  return (
    <li className="vcard" style={style} data-theme={d.theme} data-on={on || undefined}>
      <button type="button" className="vcard__wear" aria-pressed={on} aria-label={V.wear(v.name)} onClick={onWear}>
        <Corners />
        <span className="vcard__top mono" aria-hidden="true">
          <span className={on ? "vcard__on" : undefined}>
            {String(index + 1).padStart(2, "0")} / {String(MAX_VARIANTS).padStart(2, "0")}
            {on && ` · ${V.on}`}
          </span>
          <span>
            {d.hue}° · {d.theme}
          </span>
        </span>
        <span className="vcard__greet" aria-hidden="true">
          {S.greet}
        </span>
        <span className="vcard__bars" aria-hidden="true">
          {[0.5, 0.8, 0.35, 0.95, 0.6].map((h, i) => (
            <i key={i} style={{ height: `${h * 100}%` }} data-on={i === 3 || undefined} />
          ))}
        </span>
        <span className="vcard__row" aria-hidden="true">
          <span className="vcard__btn">{S.cta}</span>
          <span className="vcard__btn vcard__btn--ghost">{S.ghost}</span>
          <span className="chip">{S.chip}</span>
        </span>
      </button>
      <div className="vcard__foot">
        <input
          className="vcard__name mono"
          value={name ?? v.name}
          maxLength={16}
          aria-label={V.rename(v.name)}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setName(null);
          }}
        />
        <button type="button" className="iconbtn vcard__del" aria-label={V.remove(v.name)} title={V.remove(v.name)} onClick={onRemove}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  );
}
