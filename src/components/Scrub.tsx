// 드래그로 숫자를 문지르는 주석 값. 마우스·터치·키보드 모두 같은 값을 움직인다.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  pxPerStep?: number; // 한 단계 움직이는 데 필요한 픽셀
  defaultValue: number;
  label: string;
  hint?: string;
  unit: string;
  decimals?: number;
  onChange: (v: number) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Scrub({ value, min, max, step, pxPerStep = 3, defaultValue, label, hint = "Drag or use arrow keys. Backspace resets.", unit, decimals = 0, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; v: number } | null>(null);
  const snap = useCallback((v: number) => Number(clamp(Math.round(v / step) * step, min, max).toFixed(decimals)), [step, min, max, decimals]);

  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 합성 포인터처럼 캡처가 안 되는 경우에도 드래그는 계속한다
    }
    start.current = { x: e.clientX, v: value };
    setDragging(true);
    e.currentTarget.focus();
  };
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!start.current) return;
    const mult = e.shiftKey ? 10 : 1;
    const delta = ((e.clientX - start.current.x) / pxPerStep) * step * mult;
    onChange(snap(start.current.v + delta));
  };
  const endDrag = (e: PointerEvent<HTMLSpanElement>) => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 드래그 중엔 문서 전체 커서를 문지르기 모양으로
  useEffect(() => {
    if (!dragging) return;
    document.body.classList.add("is-scrubbing");
    return () => document.body.classList.remove("is-scrubbing");
  }, [dragging]);

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    const mult = e.shiftKey ? 10 : 1;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step * mult;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step * mult;
        break;
      case "PageUp":
        next = value + step * 10;
        break;
      case "PageDown":
        next = value - step * 10;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      case "Backspace":
      case "Delete":
        next = defaultValue;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(snap(next));
  };

  const text = value.toFixed(decimals);
  return (
    <span
      className="scrub"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${text} ${unit}`}
      data-dragging={dragging || undefined}
      title={hint}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => onChange(defaultValue)}
      onKeyDown={onKeyDown}
    >
      <span className="scrub__value">{text}</span>
      <span className="scrub__unit">{unit}</span>
    </span>
  );
}
