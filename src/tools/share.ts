// 도구 결과의 공유 코드. 주소의 r 쿼리 하나에 담는다(토큰 쿼리와 나란히). 이름 같은 개인 정보는 코드에 넣지 않는다.
export function readCode(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("r");
}

/** 주소를 조용히 바꾼다(히스토리 추가 없음). null 이면 r 을 뗀다 */
export function writeCode(code: string | null) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set("r", code);
  else url.searchParams.delete("r");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

export function shareUrl(path: string, code: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set("r", code);
  return url.toString();
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
