// 토큰 디더 필드: 천천히 흐르는 지형(겹친 사인파를 서로 비튼 높이장)을 Bayer 4×4 ordered 디더로 점 찍는다.
// 그림의 모든 값이 지금 토큰에서 온다. 점 색 = 중립·포인트 단계, 점 간격 = space.1, 점 모양 = radius.2(0 이면 네모),
// 속도 = motion. 다이얼을 돌리면 그 자리에서 다시 그린다. 장식이 아니라 "토큰이 번진다"를 보여 주는 견본이다.
import { useEffect, useRef } from "react";
import { useLang } from "../i18n/useLang.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { Corners } from "./Annot.tsx";

// 4×4 Bayer 행렬. 칸마다 문턱값 (b + 0.5) / 16
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((b) => (b + 0.5) / 16);
// 등고선 간격. 높이를 이만큼의 띠로 나눠 띠가 바뀌는 칸에 선 점을 찍는다
const BANDS = 5;
// 한 칸 안에서 점이 차지하는 비율. 나머지가 점 사이 틈이다
const DOT = 0.72;
// 프레임 간격(ms). 느린 지형이라 초당 20장이면 충분하다
const FRAME = 50;
const SPEED = { off: 0, calm: 1, lively: 2.2 } as const;

// 높이장 0..1. 좌표는 칸 단위를 화면 폭과 무관하게 맞추려고 미리 나눠서 받는다
function height(x: number, y: number, t: number): number {
  const wx = x + 0.6 * Math.sin(y * 1.3 + t * 0.7);
  const wy = y + 0.6 * Math.sin(x * 1.1 - t * 0.5);
  const v = Math.sin(wx * 1.7 + t) * 0.5 + Math.sin(wy * 2.1 - t * 0.8) * 0.35 + Math.sin((wx + wy) * 0.9 + t * 0.3) * 0.4;
  // 제곱으로 눌러 낮은 땅(빈 칸)을 넓히고 봉우리만 진하게 남긴다
  return Math.min(1, Math.max(0, Math.pow(v / 2.5 + 0.5, 1.6)));
}

export function Dither() {
  const { t: T } = useLang();
  const D = T.front.dither;
  const { tokens } = useTokens();
  const canvas = useRef<HTMLCanvasElement>(null);
  // 다이얼이 바뀌어 효과가 다시 걸려도 지형은 이어서 흐른다
  const clock = useRef(0);

  const dark = tokens.dials.theme === "dark";
  const n = (step: number) => tokens.vars[`--neutral-${step}`];
  const a = (step: number) => tokens.vars[`--accent-${step}`];
  // 낮은 곳부터: 비어 있음 → 중립 두 단계 → 포인트 스케일 → 포인트색(accent.default). 어두운 테마는 밝은 쪽으로 뒤집는다
  const ramp = [
    { name: dark ? "neutral.800" : "neutral.300", hex: dark ? n(800) : n(300) },
    { name: dark ? "neutral.600" : "neutral.500", hex: dark ? n(600) : n(500) },
    { name: dark ? "accent.300" : "accent.400", hex: dark ? a(300) : a(400) },
    { name: "accent.default", hex: tokens.semantic.accent.default },
  ];
  const contour = { name: "text.muted", hex: tokens.semantic.text.muted };
  const pitch = parseFloat(tokens.vars["--space-1"]);
  const round = tokens.dials.radius > 0;
  const speed = SPEED[tokens.dials.motion];
  const colors = [...ramp.map((r) => r.hex), contour.hex].join(" ");

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const palette = colors.split(" ");
    const levels = palette.length - 1; // 마지막은 등고선
    let raf = 0;
    let last = 0;
    let visible = false;
    let cols = 0;
    let rows = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = el.clientWidth;
      const h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / pitch);
      rows = Math.floor(h / pitch);
    };

    const draw = () => {
      const t = clock.current;
      ctx.clearRect(0, 0, el.width, el.height);
      // 칸 단위 좌표를 약 6 칸짜리 지형으로. 좁은 화면에서도 같은 크기의 산이 보이게 짧은 변 기준
      const unit = 6 / Math.max(1, Math.min(cols, rows * 1.6));
      const band = new Int8Array(cols * rows);
      const level = new Int8Array(cols * rows);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const v = height(i * unit, j * unit, t);
          const k = j * cols + i;
          band[k] = Math.floor(v * BANDS);
          const s = v * levels;
          const base = Math.floor(s);
          level[k] = Math.min(levels, s - base > BAYER[(j & 3) * 4 + (i & 3)] ? base + 1 : base);
        }
      const size = pitch * DOT;
      const off = (pitch - size) / 2;
      // 색마다 경로 하나로 모아 한 번에 칠한다
      for (let c = 1; c <= levels + 1; c++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < cols; i++) {
            const k = j * cols + i;
            const edge = (i + 1 < cols && band[k + 1] !== band[k]) || (j + 1 < rows && band[k + cols] !== band[k]);
            // 등고선 칸은 선 색이 덮는다. 같은 칸을 두 번 칠하지 않는다
            const want = edge ? levels + 1 : level[k];
            if (want !== c) continue;
            const x = i * pitch + off;
            const y = j * pitch + off;
            if (round) {
              ctx.moveTo(x + size, y + size / 2);
              ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            } else ctx.rect(x, y, size, size);
          }
        ctx.fillStyle = palette[c - 1];
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (now - last >= FRAME) {
        clock.current += ((last ? now - last : FRAME) / 1000) * 0.18 * speed;
        last = now;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (speed === 0 || raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    fit();
    draw();
    const ro = new ResizeObserver(() => {
      fit();
      draw();
    });
    ro.observe(el);
    // 화면 밖이면 rAF 를 멈춘다. 모션이 꺼져 있으면(모션 다이얼 off 또는 모션 줄이기) 한 장만 그린 채 서 있다
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [colors, pitch, round, speed]);

  const legend = [
    { role: D.peak, ...ramp[3] },
    { role: D.rise, ...ramp[2] },
    { role: D.field, ...ramp[1] },
    { role: D.contour, ...contour },
  ];
  return (
    <figure className="dither" aria-label={D.label} data-token={`accent.default ${ramp[2].name} ${ramp[1].name} ${ramp[0].name} text.muted space.1 radius.2`}>
      <header className="dither__head mono">
        <span>
          <span className="dither__idx">f1</span> / {D.label}
        </span>
        <span className="dither__val">
          bayer 4×4 · space.1 {tokens.vars["--space-1"]} · {round ? D.round : D.square}
        </span>
      </header>
      <div className="dither__stage">
        <Corners />
        <canvas ref={canvas} className="dither__canvas" aria-hidden="true" />
      </div>
      <figcaption className="dither__legend mono">
        {legend.map((l) => (
          <span key={l.role} className="dither__key">
            <i style={{ background: l.hex }} aria-hidden="true" data-round={round || undefined} />
            {l.role} <b>{l.name}</b>
          </span>
        ))}
        <span className="dither__still">{speed === 0 ? D.still : D.live}</span>
      </figcaption>
    </figure>
  );
}
