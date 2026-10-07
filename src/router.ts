// history API 위의 작은 라우터. 경로가 열이라 라이브러리는 두지 않는다.
import { useCallback, useEffect, useState, type MouseEvent } from "react";

export type Route =
  | { name: "landing" }
  | { name: "home" }
  | { name: "app"; slug: string }
  | { name: "cases" }
  | { name: "case"; slug: string }
  | { name: "work" }
  | { name: "workDetail"; slug: string }
  | { name: "canvas"; slug: string }
  | { name: "resume" }
  | { name: "notfound"; path: string };

export function parseRoute(path: string): Route {
  const clean = path.replace(/\/+$/, "") || "/";
  // 루트는 brainchild.kr 의 첫 화면, 포트폴리오 홈은 옛 주소 그대로 /projects
  if (clean === "/") return { name: "landing" };
  if (clean === "/projects") return { name: "home" };
  // /writing 은 사례와 겹쳐 10-07 에 접었다. 남은 링크는 사례 목록으로 받는다
  if (clean === "/writing") return { name: "cases" };
  // /case-studies 는 3단계까지의 주소. 바깥에 남은 링크를 위해 같은 화면으로 받는다
  if (clean === "/cases" || clean === "/case-studies") return { name: "cases" };
  if (clean === "/work") return { name: "work" };
  if (clean === "/resume") return { name: "resume" };
  const app = clean.match(/^\/apps\/([a-z0-9-]+)$/);
  if (app) return { name: "app", slug: app[1] };
  const kase = clean.match(/^\/cases\/([a-z0-9-]+)$/);
  if (kase) return { name: "case", slug: kase[1] };
  // 작업 상세와 캔버스. 슬러그는 v4(portfolio.brainchild.kr) 의 /work/<slug> 와 1:1 이라 그쪽 주소를 그대로 넘겨받는다
  const canvas = clean.match(/^\/work\/([a-z0-9-]+)\/canvas$/);
  if (canvas) return { name: "canvas", slug: canvas[1] };
  const work = clean.match(/^\/work\/([a-z0-9-]+)$/);
  if (work) return { name: "workDetail", slug: work[1] };
  return { name: "notfound", path: clean };
}

export function useRoute(): [Route, (href: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  const go = useCallback((href: string) => {
    const url = new URL(href, window.location.origin);
    const scrollToHash = () => document.getElementById(url.hash.slice(1))?.scrollIntoView({ block: "start" });
    if (url.pathname === window.location.pathname && url.hash) {
      scrollToHash();
      window.history.replaceState(null, "", url.pathname + window.location.search + url.hash);
      return;
    }
    // 토큰 쿼리는 유지한 채 경로만 바꾼다
    window.history.pushState(null, "", url.pathname + window.location.search + url.hash);
    setPath(url.pathname);
    if (url.hash) requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
    else window.scrollTo(0, 0);
  }, []);
  return [parseRoute(path), go];
}

// 내부 링크 클릭을 가로채는 핸들러. 새 탭·수정키는 브라우저에 맡긴다
export function internalClick(go: (href: string) => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = e.currentTarget.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    e.preventDefault();
    go(href);
  };
}
