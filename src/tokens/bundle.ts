// 짚어서 남긴 메모를 코딩 에이전트에 그대로 붙여 넣을 Markdown 한 장으로 묶는다.
// 받는 쪽이 에이전트라 문구는 영어로 고정한다. 메모 본문은 쓴 그대로.
import { resolveToken, type Dials, type Tokens } from "./engine.ts";

export type Note = {
  id: number;
  tokens: string[]; // data-token 에 적힌 토큰 이름
  label: string; // 요소 설명 (태그·클래스·글자)
  path: string; // 핀을 다시 찾을 CSS 경로
  body: string;
};

const dialLine = (d: Dials) =>
  Object.entries(d)
    .map(([k, v]) => `${k}=${v ?? "-"}`)
    .join(" · ");

export function toAgentBundle(tokens: Tokens, notes: Note[], link: string): string {
  const lines = [
    "# Brainchild token handoff",
    "",
    `- Theme link: ${link}`,
    `- Dials: ${dialLine(tokens.dials)}`,
    "- Token names map to CSS variables: `card.bg` is `--card-bg`. Values below are resolved from the dials above.",
    "",
    "## Notes",
    "",
  ];
  if (notes.length === 0) lines.push("No notes. Apply the tokens from the theme link as they are.", "");
  notes.forEach((n, i) => {
    lines.push(`### ${i + 1}. ${n.label}`, "");
    const chains = n.tokens.map((name) => resolveToken(name, tokens));
    n.tokens.forEach((name, j) => {
      const c = chains[j];
      lines.push(c ? `- \`${c.text}\`` : `- \`${name}\` (not a token in this set)`);
    });
    lines.push("", `> ${n.body.trim().replace(/\n+/g, "\n> ")}`, "");
  });
  return lines.join("\n");
}

// 세션 저장소에서 읽은 메모. 모양이 맞는 것만 남긴다
export function parseNotes(raw: unknown): Note[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (n): n is Note =>
      !!n &&
      typeof n === "object" &&
      Number.isInteger(n.id) &&
      Array.isArray(n.tokens) &&
      n.tokens.every((x: unknown) => typeof x === "string") &&
      typeof n.label === "string" &&
      typeof n.path === "string" &&
      typeof n.body === "string" &&
      n.body.trim() !== "",
  );
}
