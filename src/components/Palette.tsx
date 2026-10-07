// 커맨드 팔레트. ⌘K / Ctrl K. 입력 하나에 포커스를 가두고 목록은 aria-activedescendant 로 가리킨다.
import { useEffect, useMemo, useRef, useState } from "react";
import { APP_DETAILS } from "../appDetails.ts";
import { getCases } from "../cases/content.ts";
import { EMAIL } from "../data.ts";
import { PRESETS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";
import { fuzzyScore } from "../lib.ts";

type Cmd = { id: string; label: string; hint: string; group: string; run: () => void };

export function Palette({ go }: { go: (href: string) => void }) {
  const { setPaletteOpen, set, dials, reset, applyPreset, copyLink, setInspect, setPanelOpen, toast } = useTokens();
  const { lang, setLang, t } = useLang();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const cmds = useMemo<Cmd[]>(() => {
    const p = t.palette;
    const g = p.groups;
    const close = () => setPaletteOpen(false);
    const nav = (href: string) => () => {
      close();
      go(href);
    };
    return [
      { id: "home", label: p.home, hint: "/projects", group: g.go, run: nav("/projects") },
      { id: "apps", label: t.sections.apps, hint: "/projects#apps", group: g.go, run: nav("/projects#apps") },
      { id: "system", label: t.sections.system, hint: "/projects#system", group: g.go, run: nav("/projects#system") },
      { id: "craft", label: t.sections.craft, hint: "/projects#craft", group: g.go, run: nav("/projects#craft") },
      { id: "cases", label: t.sections.cases, hint: "/cases", group: g.go, run: nav("/cases") },
      { id: "work", label: t.sections.work, hint: "/work", group: g.go, run: nav("/work") },
      { id: "writing", label: t.sections.writing, hint: "/writing", group: g.go, run: nav("/writing") },
      { id: "contact", label: t.sections.contact, hint: "/projects#contact", group: g.go, run: nav("/projects#contact") },
      ...APP_DETAILS.map((d) => ({ id: `app-${d.slug}`, label: p.openApp(d.name), hint: `/apps/${d.slug}`, group: g.apps, run: nav(`/apps/${d.slug}`) })),
      ...getCases(lang).map((d) => ({ id: `case-${d.slug}`, label: p.openCase(d.title), hint: `/cases/${d.slug}`, group: g.cases, run: nav(`/cases/${d.slug}`) })),
      ...PRESETS.map((pr) => ({
        id: `wear-${pr.slug}`,
        label: p.wear(pr.name),
        hint: pr.swatches.map((s) => s.hex).join(" "),
        group: g.tokens,
        run: () => {
          close();
          applyPreset(pr.slug, true);
        },
      })),
      {
        id: "theme",
        label: dials.theme === "dark" ? p.toLight : p.toDark,
        hint: p.hintTheme,
        group: g.tokens,
        run: () => {
          close();
          set({ theme: dials.theme === "dark" ? "light" : "dark" });
        },
      },
      {
        id: "panel",
        label: p.openPanel,
        hint: "T",
        group: g.tokens,
        run: () => {
          close();
          setPanelOpen(true);
        },
      },
      {
        id: "reset",
        label: p.reset,
        hint: p.hintDefaults,
        group: g.tokens,
        run: () => {
          close();
          reset();
        },
      },
      {
        id: "link",
        label: p.copyLink,
        hint: p.hintShare,
        group: g.tokens,
        run: () => {
          close();
          void copyLink();
        },
      },
      {
        id: "inspect",
        label: p.inspect,
        hint: "I",
        group: g.tools,
        run: () => {
          close();
          setInspect((v) => !v);
        },
      },
      {
        id: "lang",
        label: p.switchLang,
        hint: p.hintLang,
        group: g.tools,
        run: () => {
          close();
          setLang(lang === "ko" ? "en" : "ko");
        },
      },
      {
        id: "email",
        label: p.copyEmail,
        hint: EMAIL,
        group: g.tools,
        run: () => {
          close();
          navigator.clipboard
            .writeText(EMAIL)
            .then(() => toast(t.contact.copied))
            .catch(() => toast(t.contact.emailIs(EMAIL)));
        },
      },
    ];
  }, [applyPreset, copyLink, dials.theme, go, lang, reset, set, setInspect, setLang, setPaletteOpen, setPanelOpen, t, toast]);

  const results = useMemo(() => {
    const scored = cmds.map((c) => ({ c, s: fuzzyScore(q, `${c.label} ${c.hint}`) })).filter((x) => x.s > 0);
    if (q) scored.sort((a, b) => b.s - a.s);
    return scored.map((x) => x.c);
  }, [cmds, q]);

  // 열릴 때만 마운트되므로 상태는 매번 새것. 닫히면 열기 전 포커스로 복귀
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => prev?.focus?.();
  }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const onKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => (results.length ? (a + 1) % results.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(Math.max(0, results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        results[active]?.run();
        break;
      case "Escape":
        e.preventDefault();
        setPaletteOpen(false);
        break;
      case "Tab":
        e.preventDefault(); // 포커스는 입력 하나에 가둔다
        break;
    }
  };

  const activeId = results[active] ? `cmd-${results[active].id}` : undefined;

  return (
    <div className="palette-root" onMouseDown={(e) => e.target === e.currentTarget && setPaletteOpen(false)}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t.palette.label} onKeyDown={onKey}>
        <div className="palette__input-row">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="palette__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            placeholder={t.palette.placeholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="mono">Esc</kbd>
        </div>
        <ul id="palette-list" ref={listRef} className="palette__list" role="listbox" aria-label={t.palette.list}>
          {results.length === 0 && <li className="palette__empty mono">{t.palette.empty(q)}</li>}
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === active}
              className="palette__item"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c.run()}
            >
              <span className="palette__group mono">{c.group}</span>
              <span className="palette__label">{c.label}</span>
              <span className="palette__hint mono">{c.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
