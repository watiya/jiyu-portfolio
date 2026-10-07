// 작은 훅들: 섹션 등장, 서울 시계
import { useEffect, useRef, useState } from "react";

// 뷰포트에 들어오면 data-revealed 를 단다. transform/opacity 만 바꾸므로 레이아웃은 밀리지 않는다
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.revealed = "true";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.revealed = "true";
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const formatClock = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());

export function useClock(timeZone: string) {
  const [time, setTime] = useState(() => formatClock(timeZone));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatClock(timeZone)), 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}
