import type { ReactNode } from "react";

// 브라우저 창 프레임. 웹 화면 캡처를 담는다. 폰 프레임(PhoneFrame)과 같은 베젤 색을 쓴다.
// 주소창에는 사이트 주소의 호스트만 보인다. 주소가 없으면 빈 칸으로 둔다
export function BrowserFrame({ url, large = false, children }: { url?: string; large?: boolean; children: ReactNode }) {
  const host = url ? new URL(url).host.replace(/^www\./, "") : "";
  return (
    <span className="browser" data-large={large || undefined}>
      <span className="browser__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="browser__url mono">{host}</span>
      </span>
      <span className="browser__screen">{children}</span>
    </span>
  );
}
