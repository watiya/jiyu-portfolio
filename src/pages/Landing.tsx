// brainchild.kr 의 첫 화면. 옛 메인(어두운 바탕·파티클·큰 워드마크·빛 선)을 v8 토큰 위에 다시 세운다.
// 색은 전부 토큰에서 온다. 색조 다이얼을 돌리면 선과 입자가 같이 바뀐다.
import { useEffect, useRef } from "react";
import { internalClick } from "../router.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";
import { LANGS } from "../i18n/lang.ts";

type Dot = { x: number; y: number; z: number; vx: number; vy: number };

function Particles({ still }: { still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { dials } = useTokens();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--text-inverse").trim() || "#fff";
    const accent = css.getPropertyValue("--accent-default").trim() || ink;

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
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      dots.forEach((d, i) => {
        if (!still) {
          d.x = (d.x + d.vx + w) % w;
          d.y = (d.y + d.vy + h) % h;
        }
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
    if (still) draw();
    else loop();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
    // 다이얼이 바뀌면 토큰 값을 다시 읽는다
  }, [still, dials]);

  return <canvas ref={ref} className="landing__particles" aria-hidden="true" />;
}

export function Landing({ go }: { go: (href: string) => void }) {
  const { dials } = useTokens();
  const { lang, setLang, t } = useLang();
  const onClick = internalClick(go);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const still = dials.motion === "off" || reduce;
  const nav = [
    { href: "/projects", label: t.landing.nav.projects },
    { href: "/cases", label: t.landing.nav.cases },
    { href: "/projects#contact", label: t.landing.nav.contact },
  ];

  return (
    <div className="landing" data-token="surface.inverse text.inverse accent.default">
      <Particles still={still} />

      <div className="landing__meta mono" aria-hidden="true">
        <span>brainchild.kr</span>
        <span>
          v8 · {dials.hue}° · {dials.theme}
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
        <h1 className="landing__mark">Brainchild<span className="landing__mark-sub">-Jiyu</span></h1>
        <div className="landing__line landing__line--r" aria-hidden="true" />
      </div>

      <p className="landing__lead">
        {t.landing.lead}
      </p>

      <a className="landing__enter mono" href="/projects" onClick={onClick}>
        {t.landing.enter} <span aria-hidden="true">→</span>
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
