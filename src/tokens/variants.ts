// 시안: 다이얼 조합을 이름 붙여 저장해 나란히 비교한다. localStorage 에 담기는 값은 여기서만 읽고 쓴다.
import { parseDials, sameDials, type Dials } from "./engine.ts";

export const MAX_VARIANTS = 6;
export const NAME_MAX = 16;
export const VARIANTS_KEY = "v8.variants";

export type Variant = { id: string; name: string; dials: Dials };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 비어 있는 첫 글자. A·B·C 를 다 쓰면 그다음
export function nextName(list: Variant[]): string {
  const used = new Set(list.map((v) => v.name));
  return [...LETTERS].find((l) => !used.has(l)) ?? String(list.length + 1);
}

const cleanName = (name: string) => name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);

// 저장소에서 읽은 값. 깨진 항목은 버리고 다이얼은 엔진 규칙으로 다시 검증한다
export function parseVariants(raw: unknown): Variant[] {
  if (!Array.isArray(raw)) return [];
  const out: Variant[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { id, name, dials } = item as Record<string, unknown>;
    if (typeof id !== "string" || !id || out.some((v) => v.id === id)) continue;
    if (!dials || typeof dials !== "object") continue;
    const n = typeof name === "string" ? cleanName(name) : "";
    out.push({ id, name: n || nextName(out), dials: parseDials(dials as Record<string, unknown>) });
    if (out.length === MAX_VARIANTS) break;
  }
  return out;
}

export type AddResult = { list: Variant[]; status: "added" | "exists" | "full"; variant?: Variant };

// 같은 조합이 이미 있으면 새로 만들지 않고 그 시안을 알려 준다
export function addVariant(list: Variant[], dials: Dials, id: string): AddResult {
  const same = list.find((v) => sameDials(v.dials, dials));
  if (same) return { list, status: "exists", variant: same };
  if (list.length >= MAX_VARIANTS) return { list, status: "full" };
  const variant = { id, name: nextName(list), dials };
  return { list: [...list, variant], status: "added", variant };
}

// 빈 이름은 받지 않고 원래 이름을 지킨다
export function renameVariant(list: Variant[], id: string, name: string): Variant[] {
  const n = cleanName(name);
  if (!n) return list;
  return list.map((v) => (v.id === id ? { ...v, name: n } : v));
}

export const removeVariant = (list: Variant[], id: string): Variant[] => list.filter((v) => v.id !== id);
