import { internalClick } from "../router.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";
import { LANGS } from "../i18n/lang.ts";

const NAV = [
  { key: "apps", href: "/projects#apps", match: "/projects" },
  { key: "craft", href: "/projects#craft", match: "" },
  { key: "cases", href: "/cases", match: "/cases" },
  { key: "work", href: "/work", match: "/work" },
  { key: "writing", href: "/writing", match: "/writing" },
  { key: "contact", href: "/projects#contact", match: "" },
] as const;

export function Header({ go, current }: { go: (href: string) => void; current: string }) {
  const { panelOpen, setPanelOpen, inspect, setInspect, setPaletteOpen, dials } = useTokens();
  const { lang, setLang, t } = useLang();
  const onClick = internalClick(go);
  return (
    <header className="hdr" data-token="surface.canvas line.default">
      <div className="container hdr__row">
        <a href="/projects" className="hdr__brand" onClick={onClick}>
          {t.siteName}
          <span className="mono hdr__ver" aria-hidden="true">v8</span>
        </a>
        <nav className="hdr__nav" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.key} href={n.href} onClick={onClick} aria-current={n.match && current === n.match ? "page" : undefined} data-token="nav.active">
              {t.nav[n.key]}
            </a>
          ))}
        </nav>
        <div className="hdr__tools">
          <button type="button" className="tool tool--palette" onClick={() => setPaletteOpen(true)} title={t.tools.searchTitle} aria-label={t.tools.search}>
            <svg className="tool__icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="tool__label">{t.tools.search}</span>
            <kbd aria-hidden="true">⌘K</kbd>
          </button>
          <button type="button" className="tool tool--inspect" aria-pressed={inspect} onClick={() => setInspect((v) => !v)} title={t.tools.inspectTitle} aria-label={t.tools.inspect}>
            <svg className="tool__icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 5V2h3M11 2h3v3M14 11v3h-3M5 14H2v-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
            <span className="tool__label">{t.tools.inspect}</span>
            <kbd aria-hidden="true">I</kbd>
          </button>
          <button
            type="button"
            className="tool tool--tokens"
            aria-pressed={panelOpen}
            aria-controls="token-panel"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
            title={t.tools.tokensTitle}
            aria-label={t.tools.tokens}
          >
            <span className="tool__dot" aria-hidden="true" />
            <span className="tool__label">{t.tools.tokens}</span>
            <span className="mono tool__meta" aria-hidden="true">
              {dials.hue}° · {dials.theme}
            </span>
            <kbd aria-hidden="true">T</kbd>
          </button>
          <div className="lang" role="group" aria-label={t.tools.language}>
            {LANGS.map((l) => (
              <button key={l} type="button" className="lang__opt" aria-pressed={lang === l} lang={l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
