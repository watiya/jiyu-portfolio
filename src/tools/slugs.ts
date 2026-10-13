// 재미요소 도구 슬러그. 라우터·프리렌더·팔레트가 같이 쓴다 (react 를 끌어오지 않는 파일이라 node 스크립트에서도 읽는다)
export type ToolSlug = "saju" | "mbti" | "tarot" | "gunghap";
export const TOOL_SLUGS: ToolSlug[] = ["saju", "mbti", "tarot", "gunghap"];
export const isToolSlug = (s: string): s is ToolSlug => (TOOL_SLUGS as string[]).includes(s);
