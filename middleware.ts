// Vercel Routing Middleware. ?lang=ko 로 들어온 화면 요청을 한국어 메타가 박힌 dist/__ko/<경로>/index.html 로 돌린다.
// vercel.json rewrites 는 파일 확인 뒤에 돌아서 프리렌더된 경로(dist/apps/index.html 등)를 덮지 못한다. 미들웨어는 파일보다 먼저 돈다.
// 한국어판이 없는 경로(잠시 내린 경로·없는 슬러그)는 그대로 넘겨 SPA 가 받게 한다. 파일은 scripts/prerender-meta.ts 가 굽는다.
export const config = { matcher: ["/((?!__ko/|assets/).*)"] };

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (url.searchParams.get("lang") !== "ko" || /\.[a-z0-9]+$/i.test(url.pathname)) return undefined;
  const path = url.pathname.replace(/\/+$/, "");
  const target = new URL(`/__ko${path}/index.html`, url);
  const head = await fetch(target, { method: "HEAD" });
  if (!head.ok) return undefined;
  return new Response(null, { headers: { "x-middleware-rewrite": target.toString() } });
}
