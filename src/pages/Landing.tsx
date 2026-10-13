// brainchild.kr 의 첫 화면. 옛 메인(어두운 바탕·파티클·큰 워드마크·빛 선)을 v8 토큰 위에 다시 세운다.
// 색은 전부 토큰에서 온다. 색조 다이얼을 돌리면 선과 입자가 같이 바뀐다.
// 폰을 가리키면 그 앱의 프리셋 색이 이 화면에만 미리 입혀지고, 누르면 사이트 전체에 고정된다.
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { internalClick } from "../router.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";
import { LANGS } from "../i18n/lang.ts";
import { isHiddenApp, isPrivatePath } from "../hidden.ts";
import { DEFAULT_DIALS, PRESETS, buildTokens, parseDials } from "../tokens/engine.ts";
import { getAppDetails, getApps } from "../i18n/content.ts";
import { activePresetOf, slugOf } from "../lib.ts";
import { PhoneFrame } from "../components/PhoneFrame.tsx";

// 미리보기는 색만 바꾼다. 서체·간격·모서리까지 바꾸면 화면이 출렁인다
const COLOR_VAR = /^--(accent|neutral|surface|line|focus|annot|selection|phone-bezel|text-(default|muted|subtle|inverse)$)/;
const previewVars = (slug: string): CSSProperties | undefined => {
  const p = PRESETS.find((x) => x.slug === slug);
  if (!p) return undefined;
  const { vars } = buildTokens(parseDials({ ...DEFAULT_DIALS, ...p.dials }));
  return Object.fromEntries(Object.entries(vars).filter(([k]) => COLOR_VAR.test(k))) as CSSProperties;
};

type Dot = { x: number; y: number; z: number; vx: number; vy: number };

// 모션이 켜져 있을 때만 깔리는 바탕 레이어
function Particles({ preview }: { preview: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { dials } = useTokens();
  const colors = useRef({ ink: "#fff", accent: "#fff" });

  // 색은 캔버스 자리에서 읽는다. 미리보기 변수가 이 화면에만 걸려 있어서
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const css = getComputedStyle(canvas);
    const ink = css.getPropertyValue("--text-inverse").trim() || "#fff";
    colors.current = { ink, accent: css.getPropertyValue("--accent-default").trim() || ink };
    // 다이얼이나 미리보기가 바뀌면 토큰 값을 다시 읽는다
  }, [dials, preview]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(140, (w * h) / 11000));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
      }));
    };

    const draw = () => {
      const { ink, accent } = colors.current;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      dots.forEach((d, i) => {
        d.x = (d.x + d.vx + w) % w;
        d.y = (d.y + d.vy + h) % h;
        // 가까운 입자일수록 마우스를 더 따라 움직여 깊이가 생긴다
        const px = d.x + mouse.x * 24 * d.z;
        const py = d.y + mouse.y * 24 * d.z;
        ctx.globalAlpha = 0.2 + d.z * 0.5;
        ctx.fillStyle = i % 9 === 0 ? accent : ink;
        ctx.beginPath();
        ctx.arc(px, py, d.z * 1.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / w - 0.5;
      mouse.ty = e.clientY / h - 0.5;
    };

    resize();
    loop();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="landing__particles" aria-hidden="true" />;
}

export function Landing({ go }: { go: (href: string) => void }) {
  const { dials, tokens, applyPreset } = useTokens();
  const { lang, setLang, t } = useLang();
  const onClick = internalClick(go);
  // 모션 줄이기도 토큰 쪽에서 off 로 접혀 온다
  const still = tokens.dials.motion === "off";
  const nav = [
    { href: "/projects", label: t.landing.nav.projects },
    { href: "/cases", label: t.landing.nav.cases },
    { href: "/projects#contact", label: t.landing.nav.contact },
  ].filter((n) => !isPrivatePath(n.href));

  // 첫 화면의 물건: featured 앱 중 프리셋과 화면이 있는 것 (숨긴 앱 제외)
  const details = getAppDetails(lang);
  const apps = getApps(lang)
    .filter((a) => a.featured)
    .map((a) => {
      const slug = slugOf(a.name);
      const detail = details.find((d) => d.slug === slug);
      const preset = PRESETS.find((p) => p.slug === slug);
      return { ...a, slug, preset, shot: detail?.shots[0] ?? a.image };
    })
    .filter((a) => a.preset && !isHiddenApp(a.slug))
    .slice(0, 5);
  const active = activePresetOf(dials);
  const [preview, setPreview] = useState<string | null>(null);
  const style = useMemo(() => (preview ? previewVars(preview) : undefined), [preview]);
  const previewName = apps.find((a) => a.slug === preview)?.name;
  const status = previewName ? t.landing.trying(previewName) : active ? t.landing.wearing(active.name) : t.landing.pick;
  const leave = (slug: string) => setPreview((p) => (p === slug ? null : p));

  return (
    <div className="landing" style={style} data-preview={preview ?? undefined} data-token="surface.inverse text.inverse accent.default">
      {!still && <Particles preview={preview} />}

      <div className="landing__meta mono" aria-hidden="true">
        <span>brainchild.kr</span>
        <span>
          {dials.hue}° · {dials.theme}
        </span>
      </div>

      <nav className="landing__nav" aria-label="Primary">
        {nav.map((n) => (
          <a key={n.href} href={n.href} onClick={onClick}>
            {n.label}
          </a>
        ))}
        <a href="https://brainchild.works" target="_blank" rel="noreferrer">
          {t.landing.nav.team} ↗
        </a>
      </nav>

      <div className="landing__center">
        <div className="landing__line landing__line--l" aria-hidden="true" />
        <h1 className="landing__mark">Brainchild</h1>
        <div className="landing__line landing__line--r" aria-hidden="true" />
      </div>

      {/* 줄은 문장 마디(쉼표·마침표)에서만 꺾는다 */}
      <p className="landing__lead">
        {t.landing.lead.split(/(?<=[,.]) /).map((part, i) => (
          <Fragment key={part}>
            {i > 0 && " "}
            <span>{part}</span>
          </Fragment>
        ))}
      </p>

      {/* 폰을 가리키거나 포커스하면 미리 입고, 누르면 사이트 전체에 고정한다(되돌리기 토스트 포함) */}
      <ul className="landing__apps" role="list" aria-label={t.nav.apps} onPointerLeave={() => setPreview(null)}>
        {apps.map((app, i) => (
          <li key={app.slug} className="landing__app">
            <button
              type="button"
              className="landing__phone"
              aria-pressed={active?.slug === app.slug}
              aria-label={t.landing.wear(app.name)}
              onPointerEnter={(e) => e.pointerType !== "touch" && setPreview(app.slug)}
              onFocus={() => setPreview(app.slug)}
              onBlur={() => leave(app.slug)}
              onClick={() => applyPreset(app.slug, true)}
            >
              <PhoneFrame src={app.shot} alt="" width={148} priority={i < 3} />
              <span className="landing__app-name mono" aria-hidden="true">
                {app.name}
                <span className="landing__dots">
                  {app.preset?.swatches.slice(0, 3).map((sw) => (
                    <i key={sw.hex} style={{ background: sw.hex }} />
                  ))}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="landing__status mono" aria-live="polite">
        {status}
      </p>

      <a className="landing__enter mono" href="/projects#apps" onClick={onClick}>
        {t.hero.browse} <span aria-hidden="true">→</span>
      </a>

      <div className="landing__foot mono">
        <span className="landing__hint">{t.landing.hint}</span>
        <div className="landing__lang" role="group" aria-label={t.tools.language}>
          {LANGS.map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} lang={l} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
