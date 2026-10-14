// Naro(따로 만든 운세 앱) 바로가기 링크. 깊은 풀이는 Naro 한 곳에서만 키운다.
// 링크 형식은 이 함수 하나에만 둔다. Naro 는 모르는 쿼리를 무시하고, 해시 경로(#/saju 등)는 지금 판에서도 먹는다.
import type { ToolSlug } from "../router.ts";
import type { SajuInput } from "./saju.ts";

export const NARO_URL = "https://naro-gamma.vercel.app";

const MENU: Record<ToolSlug, string> = { saju: "saju", mbti: "type", tarot: "tarot", gunghap: "match" };

export type NaroInput = { birth?: SajuInput; partner?: SajuInput; type?: string };

const p2 = (n: number) => String(n).padStart(2, "0");

// 생일 하나를 d·t·cal(·leap) 쿼리로. 두 번째 사람은 뒤에 2 를 붙인다
function birthQuery(q: URLSearchParams, b: SajuInput, suffix = "") {
  q.set(`d${suffix}`, `${b.year}-${p2(b.month)}-${p2(b.day)}`);
  if (b.hour !== undefined) q.set(`t${suffix}`, `${p2(b.hour)}:${p2(b.minute ?? 0)}`);
  q.set(`cal${suffix}`, b.calendar);
  if (b.calendar === "lunar" && b.leap) q.set(`leap${suffix}`, "1");
}

export function naroLink(tool: ToolSlug, input: NaroInput = {}): string {
  const q = new URLSearchParams({ menu: MENU[tool] });
  if (input.birth) birthQuery(q, input.birth);
  if (input.partner) birthQuery(q, input.partner, "2");
  if (input.type) q.set("type", input.type);
  return `${NARO_URL}/?${q.toString().replaceAll("%3A", ":")}#/${MENU[tool]}`;
}
