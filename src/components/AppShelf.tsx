// 앱 선반. 홈 #apps 와 /apps 가 같이 쓴다.
// 시리즈(붐치·멘치·그 밖)로 묶고, 묶음마다 첫 앱은 넓은 가로 카드, 나머지는 두 칸 카드다.
// 표지 바탕은 그 앱 프리셋의 첫 스와치 색. 틀(표지·이름·상태·발치)은 모든 카드가 같다.
import type { CSSProperties } from "react";
import { PhoneFrame } from "./PhoneFrame.tsx";
import { useLang } from "../i18n/useLang.ts";
import { getAppDetails, metaValue, type LocalApp } from "../i18n/content.ts";
import { PRESETS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { activePresetOf, ctaOf, slugOf } from "../lib.ts";
import { internalClick } from "../router.ts";

type Group = "boomchi" | "menchi" | "other";
const GROUPS: Group[] = ["boomchi", "menchi", "other"];

// lead 를 끄면 넓은 카드 없이 두 칸만 쓴다(상세 아래 "같은 시리즈" 처럼 둘셋만 놓일 때)
export function AppShelf({ apps, go, level, lead = true }: { apps: LocalApp[]; go: (href: string) => void; level: 2 | 3; lead?: boolean }) {
  const { lang, t } = useLang();
  const { dials } = useTokens();
  const details = getAppDetails(lang);
  const active = activePresetOf(dials);
  const onClick = internalClick(go);
  const H = `h${level}` as "h2" | "h3";
  const N = `h${level + 1}` as "h3" | "h4";
  const S = t.apps.shelf;

  return (
    <div className="shelf">
      {GROUPS.map((g) => {
        const list = apps.filter((a) => (a.series ?? "other") === g);
        if (list.length === 0) return null;
        return (
          <section key={g} className="shelf__group" aria-labelledby={`shelf-${g}`}>
            <header className="shelf__head">
              <span className="mono shelf__mascot">{S[g].mascot}</span>
              <H id={`shelf-${g}`} className="shelf__title">
                {g === "other" ? t.apps.others : t.appsPage.series[g]}
              </H>
              <p className="shelf__line">{S[g].line}</p>
              <span className="mono shelf__count">{t.apps.count(list.length)}</span>
            </header>
            <ul className="shelf__grid" role="list">
              {list.map((app, i) => {
                const slug = slugOf(app.name);
                const href = `/apps/${slug}`;
                const detail = details.find((d) => d.slug === slug);
                const preset = PRESETS.find((p) => p.slug === slug);
                const status = (detail && metaValue(detail, "Status")) ?? app.badge;
                const platform = (detail && metaValue(detail, "Platform")) ?? app.note;
                const wearing = active?.slug === slug;
                const wide = lead && i === 0;
                const cta = ctaOf(app.name, slug);
                // 넓은 카드는 상세 화면 둘째·셋째 장을 양옆에. 세로로 긴 캡처만 있을 때
                const sides = (detail?.shots ?? []).slice(1, 3);
                const phones = wide && sides.length === 2 ? [sides[0], app.image, sides[1]] : [app.image];
                return (
                  <li key={slug} className="sh" data-wide={wide || undefined} style={{ "--app-bg": preset?.swatches[0].hex } as CSSProperties} data-token="card.bg card.line card.radius">
                    <a className="sh__cover" href={href} onClick={onClick} tabIndex={-1} aria-hidden="true">
                      <span className="sh__phones" data-count={phones.length}>
                        {phones.map((src) => (
                          <PhoneFrame key={src} src={src} alt="" width={wide ? 150 : 140} />
                        ))}
                      </span>
                    </a>
                    <div className="sh__body">
                      <span className="mono sh__meta">
                        {app.kind} · {platform}
                      </span>
                      <N className="sh__name">
                        <a href={href} onClick={onClick}>
                          {app.name}
                          {app.koName && <span className="card__koname"> {app.koName}</span>} <span aria-hidden="true">→</span>
                        </a>
                      </N>
                      <p className="sh__line">{app.line}</p>
                      <div className="sh__status">
                        <span className="mono sh__label">
                          {t.apps.status}
                          {detail && <> · {detail.date}</>}
                        </span>
                        <strong>{status}</strong>
                      </div>
                      <div className="sh__foot">
                        {preset && (
                          <span className="apptile__dots" role="img" aria-label={t.apps.colors(app.name)}>
                            {preset.swatches.map((s) => (
                              <i key={s.hex} style={{ background: s.hex }} title={`${s.label} ${s.hex}`} />
                            ))}
                          </span>
                        )}
                        <span className="chip" data-current={wearing || undefined} data-token={wearing ? "badge.bg badge.fg" : "chip.bg chip.fg chip.radius"}>
                          {wearing ? t.apps.wearing : app.badge}
                        </span>
                        {cta ? (
                          <a className="btn btn--sm sh__cta" href={cta.href} target="_blank" rel="noreferrer" data-token="button.bg button.fg button.radius">
                            {t.apps.cta[cta.kind]} <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <span className="mono sh__nolink">{t.apps.noLink}</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
