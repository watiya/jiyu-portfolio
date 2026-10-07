// 주석 장식: 모서리 십자, 섹션 라벨, 토큰 이름 라벨. 장식은 이것뿐이다.
import type { ReactNode } from "react";

export function Corners() {
  return (
    <span className="corners" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

// "01 / Hero" 식의 섹션 머리말. 오른쪽엔 보조 설명
export function SectionLabel({ index, title, aside }: { index: string; title: string; aside?: ReactNode }) {
  return (
    <div className="seclabel mono">
      <span>
        <span className="seclabel__index">{index}</span> / {title}
      </span>
      {aside && <span className="seclabel__aside">{aside}</span>}
    </div>
  );
}

// 요소가 어느 토큰에서 왔는지 적는 작은 라벨
export function TokenTag({ children }: { children: ReactNode }) {
  return <span className="tokentag mono">{children}</span>;
}
