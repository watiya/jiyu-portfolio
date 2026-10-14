// 다이얼 변경 기록. 되돌리기·다시하기용. 슬라이더 드래그처럼 잇달아 오는 변경은 한 단계로 묶는다.
import { sameDials, type Dials } from "./engine.ts";

export const HISTORY_LIMIT = 20;
// 이 시간 안에 이어 온 변경은 같은 단계. 드래그 중 이벤트 간격보다 넉넉하게
export const GROUP_MS = 500;

// at: 마지막 변경 시각. 0 이면 묶음이 닫혀 있어 다음 변경은 새 단계가 된다
export type History = { past: Dials[]; present: Dials; future: Dials[]; at: number };

export const startHistory = (present: Dials): History => ({ past: [], present, future: [], at: 0 });

export function record(h: History, next: Dials, now: number, groupMs = GROUP_MS): History {
  if (sameDials(next, h.present)) return h;
  const merging = h.at > 0 && now - h.at < groupMs && h.past.length > 0;
  if (merging) {
    // 드래그로 출발점에 돌아왔으면 그 단계는 없던 것으로
    if (sameDials(next, h.past[h.past.length - 1])) return { past: h.past.slice(0, -1), present: next, future: [], at: 0 };
    return { ...h, present: next, future: [], at: now };
  }
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [], at: now };
}

// 손을 떼면(pointerup) 묶음을 닫는다
export const seal = (h: History): History => (h.at === 0 ? h : { ...h, at: 0 });

export function undo(h: History): History {
  if (h.past.length === 0) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future].slice(0, HISTORY_LIMIT), at: 0 };
}

export function redo(h: History): History {
  if (h.future.length === 0) return h;
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: h.future[0], future: h.future.slice(1), at: 0 };
}
