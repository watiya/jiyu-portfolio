// 생년월일·시 입력. 사주 풀이와 궁합이 같이 쓴다. 값은 문자열로 들고 있다가 제출할 때만 숫자로 바꾼다.
import { useId } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { validDate, type SajuInput } from "../../tools/saju.ts";

export type SajuForm = { calendar: "solar" | "lunar"; leap: boolean; year: string; month: string; day: string; hour: string; minute: string };
export const EMPTY_FORM: SajuForm = { calendar: "solar", leap: false, year: "", month: "", day: "", hour: "", minute: "0" };

export function formOf(i: SajuInput): SajuForm {
  return { calendar: i.calendar, leap: !!i.leap, year: String(i.year), month: String(i.month), day: String(i.day), hour: i.hour === undefined ? "" : String(i.hour), minute: String(i.minute ?? 0) };
}

/** 폼 → 입력. 달력에 없는 날이면 null */
export function inputOf(f: SajuForm): SajuInput | null {
  const input: SajuInput = { year: +f.year, month: +f.month, day: +f.day, calendar: f.calendar, leap: f.calendar === "lunar" && f.leap };
  if (f.hour !== "") {
    input.hour = +f.hour;
    input.minute = Math.min(59, Math.max(0, +f.minute || 0));
  }
  return validDate(input) ? input : null;
}

export function SajuFields({ value, onChange, error }: { value: SajuForm; onChange: (next: SajuForm) => void; error?: string }) {
  const { t } = useLang();
  const S = t.toolsPage.saju;
  const id = useId();
  const up = (patch: Partial<SajuForm>) => onChange({ ...value, ...patch });
  return (
    <div className="sform">
      <div className="sform__row">
        <span className="sform__label mono">{S.calendar}</span>
        <div className="seg sform__seg" role="radiogroup" aria-label={S.calendar}>
          {(["solar", "lunar"] as const).map((c) => (
            <label key={c} className="seg__item" data-on={value.calendar === c || undefined}>
              <input type="radio" name={`${id}-cal`} value={c} checked={value.calendar === c} onChange={() => up({ calendar: c })} />
              <span>{S[c]}</span>
            </label>
          ))}
        </div>
        {value.calendar === "lunar" && (
          <label className="sform__check">
            <input type="checkbox" checked={value.leap} onChange={(e) => up({ leap: e.target.checked })} />
            <span>{S.leap}</span>
          </label>
        )}
      </div>
      <div className="sform__row sform__row--date">
        <label className="sform__f">
          <span className="mono">{S.year}</span>
          <input className="fx-input" type="number" inputMode="numeric" min={1900} max={2100} placeholder="1990" value={value.year} onChange={(e) => up({ year: e.target.value })} required />
        </label>
        <label className="sform__f">
          <span className="mono">{S.month}</span>
          <input className="fx-input" type="number" inputMode="numeric" min={1} max={12} placeholder="5" value={value.month} onChange={(e) => up({ month: e.target.value })} required />
        </label>
        <label className="sform__f">
          <span className="mono">{S.day}</span>
          <input className="fx-input" type="number" inputMode="numeric" min={1} max={31} placeholder="17" value={value.day} onChange={(e) => up({ day: e.target.value })} required />
        </label>
      </div>
      <div className="sform__row sform__row--time">
        <label className="sform__f">
          <span className="mono">
            {S.hour} <span className="sform__opt">({t.toolsPage.optional})</span>
          </span>
          <select className="fx-input" value={value.hour} onChange={(e) => up({ hour: e.target.value })}>
            <option value="">{S.unknownHour}</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>
        <label className="sform__f">
          <span className="mono">{S.minute}</span>
          <input className="fx-input" type="number" inputMode="numeric" min={0} max={59} value={value.minute} disabled={value.hour === ""} onChange={(e) => up({ minute: e.target.value })} />
        </label>
      </div>
      {error && (
        <p className="sform__error mono" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
