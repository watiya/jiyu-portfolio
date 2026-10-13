// 재미요소 공통: 도구 카드 넷, 도구 화면 셸(머리말·원칙·고지), 도구별 작은 도형.
import type { ReactNode } from "react";
import { useLang } from "../../i18n/useLang.ts";
import { internalClick, TOOL_SLUGS, type ToolSlug } from "../../router.ts";
import { Corners, SectionLabel } from "../../components/Annot.tsx";

// 도구마다 토큰 색으로 그린 작은 도형. 아이콘 세트를 쓰지 않고 차트 언어(점·막대·빗금·링)로 맞췄다
export function ToolGlyph({ slug }: { slug: ToolSlug }) {
  const a = "var(--accent-default)";
  const b = "var(--accent-secondary)";
  const l = "var(--line-strong)";
  return (
    <svg className="toolglyph" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      {slug === "saju" && (
        <>
          <polygon points="24,6 41,18 35,39 13,39 7,18" fill="none" stroke={l} />
          <polygon points="24,12 34,20 31,32 17,32 13,20" fill={a} fillOpacity="0.28" stroke={a} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="2.5" fill={b} />
        </>
      )}
      {slug === "mbti" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="6" y={8 + i * 9} width="36" height="5" rx="2.5" fill={l} fillOpacity="0.5" />
              <rect x={[6, 20, 12, 24][i]} y={8 + i * 9} width={[22, 16, 20, 18][i]} height="5" rx="2.5" fill={i % 2 ? b : a} />
            </g>
          ))}
        </>
      )}
      {slug === "tarot" && (
        <>
          <rect x="10" y="4" width="28" height="40" rx="3" fill="none" stroke={l} />
          <rect x="14" y="8" width="20" height="32" rx="2" fill={a} fillOpacity="0.18" />
          <path d="M24 14 L26.5 21 L34 21.5 L28 26 L30 33 L24 29 L18 33 L20 26 L14 21.5 L21.5 21 Z" fill={b} />
        </>
      )}
      {slug === "gunghap" && (
        <>
          <circle cx="19" cy="24" r="13" fill={a} fillOpacity="0.28" stroke={a} strokeWidth="1.5" />
          <circle cx="29" cy="24" r="13" fill={b} fillOpacity="0.28" stroke={b} strokeWidth="1.5" />
          <path d="M24 13.5 A13 13 0 0 1 24 34.5 A13 13 0 0 1 24 13.5 Z" fill="var(--text-default)" fillOpacity="0.6" />
        </>
      )}
    </svg>
  );
}

export function ToolCards({ go, compact = false }: { go: (href: string) => void; compact?: boolean }) {
  const { t } = useLang();
  const onClick = internalClick(go);
  return (
    <ul className="toolcards" role="list" data-compact={compact || undefined}>
      {TOOL_SLUGS.map((slug, i) => {
        const item = t.toolsPage.items[slug];
        return (
          <li key={slug}>
            <a className="toolcard" href={`/tools/${slug}`} onClick={onClick} data-token="card.bg card.line card.radius">
              <span className="toolcard__top mono">
                <span>{t.toolsPage.index(i + 1)}</span>
                <span aria-hidden="true">→</span>
              </span>
              <span className="toolcard__stage">
                <Corners />
                <ToolGlyph slug={slug} />
              </span>
              <span className="toolcard__name">{item.name}</span>
              <span className="toolcard__line">{item.line}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function ToolShell({ slug, go, children }: { slug: ToolSlug; go: (href: string) => void; children: ReactNode }) {
  const { t } = useLang();
  const T = t.toolsPage;
  const n = TOOL_SLUGS.indexOf(slug) + 1;
  const item = T.items[slug];
  return (
    <article className="fx container" data-tool={slug}>
      <SectionLabel
        index={`0${n}`}
        title={T.title}
        aside={
          <a href="/tools" onClick={internalClick(go)} className="seclabel__link">
            ← {T.all}
          </a>
        }
      />
      <header className="fx__head">
        <span className="fx__glyph" aria-hidden="true">
          <ToolGlyph slug={slug} />
        </span>
        <div>
          <h1 className="h1">{item.name}</h1>
          <p className="lede">{item.line}</p>
        </div>
      </header>
      {children}
      <footer className="fx__foot">
        <ol className="fx__principles mono" role="list">
          {T.principles.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </footer>
    </article>
  );
}

/** 결과 아래 공통 행동 줄: 링크 복사·다이얼 열기 등 */
export function ToolActions({ children }: { children: ReactNode }) {
  return <div className="fx__actions">{children}</div>;
}
