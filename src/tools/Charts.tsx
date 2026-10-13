// 도구 결과용 작은 차트. brainchild-ui 차트 키트(레이더·링·빗금·알약 툴팁)의 모양을 이 사이트 토큰으로 다시 그렸다.
// 키트는 recharts + Tailwind 토큰에 묶여 있어서 패키지를 끌어오지 않고 SVG 로 옮겼다. 값은 0~1 로 받는다.
import { useId } from "react";

export type RadarSeries = { values: number[]; color: "a" | "b"; hatch?: boolean };

const COLOR = { a: "var(--accent-default)", b: "var(--accent-secondary)" };

/** 다각형 레이더. 축 수는 labels 길이. 계열은 하나 또는 둘(겹침) */
export function Radar({ labels, series, size = 240 }: { labels: string[]; series: RadarSeries[]; size?: number }) {
  const id = useId().replace(/:/g, "");
  const n = labels.length;
  const c = size / 2;
  const R = size * 0.34;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + Math.cos(a) * r, c + Math.sin(a) * r] as const;
  };
  const ring = (f: number) => labels.map((_, i) => pt(i, R * f).join(",")).join(" ");
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, R * Math.max(0.04, Math.min(1, v))).join(",")).join(" ");
  return (
    <svg className="chart chart--radar" viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-label={labels.join(", ")}>
      <defs>
        <pattern id={`${id}-h`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={COLOR.b} strokeWidth="1.4" />
        </pattern>
      </defs>
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--line-default)" />
      ))}
      {labels.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--line-default)" />;
      })}
      {series.map((s, k) => (
        <polygon
          key={k}
          className="chart__poly"
          points={poly(s.values)}
          fill={s.hatch ? `url(#${id}-h)` : COLOR[s.color]}
          fillOpacity={s.hatch ? 1 : 0.28}
          stroke={COLOR[s.color]}
          strokeWidth={s.hatch ? 2 : 1.5}
          strokeLinejoin="round"
        />
      ))}
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + size * 0.1);
        return (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.052} fill="var(--text-muted)" fontFamily="var(--font-mono)">
            {l}
          </text>
        );
      })}
    </svg>
  );
}

/** 양극 막대. pct 는 왼쪽 글자 쪽 비율(0~100) */
export function Bipolar({ left, right, pct }: { left: string; right: string; pct: number }) {
  const leftWins = pct >= 50;
  return (
    <div className="bipolar" role="img" aria-label={`${left} ${pct}% · ${right} ${100 - pct}%`}>
      <span className="bipolar__label mono" data-win={leftWins || undefined}>
        {left}
      </span>
      <span className="bipolar__track">
        <span className="bipolar__fill" style={{ left: leftWins ? `${100 - pct}%` : "50%", width: `${Math.abs(pct - 50)}%` }} />
        <span className="bipolar__mid" aria-hidden="true" />
      </span>
      <span className="bipolar__label mono" data-win={!leftWins || undefined}>
        {right}
      </span>
      <span className="bipolar__pct mono">{leftWins ? pct : 100 - pct}%</span>
    </div>
  );
}

/** 링 게이지. value 0~100 */
export function Ring({ value, label, size = 120 }: { value: number; label: string; size?: number }) {
  const r = size * 0.4;
  const C = 2 * Math.PI * r;
  return (
    <svg className="chart chart--ring" viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${label} ${value}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-default)" strokeWidth={size * 0.08} />
      <circle
        className="chart__arc"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={COLOR.a}
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        strokeDasharray={`${(C * value) / 100} ${C}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.26} fontWeight="600" fill="var(--text-default)" fontFamily="var(--font-heading)">
        {value}
      </text>
    </svg>
  );
}

/** 오행 다섯 칸 막대. 비율대로 폭을 나눈다 */
export function Stack({ items }: { items: { label: string; pct: number; hue: number }[] }) {
  return (
    <div className="stack" role="img" aria-label={items.map((i) => `${i.label} ${i.pct}%`).join(", ")}>
      {items.map((i) => (
        <span key={i.label} className="stack__seg" style={{ flexGrow: Math.max(i.pct, 2), background: `oklch(0.74 0.14 ${i.hue})` }} title={`${i.label} ${i.pct}%`}>
          {i.pct >= 12 && <span className="mono">{i.label}</span>}
        </span>
      ))}
    </div>
  );
}
