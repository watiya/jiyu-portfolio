import { useState } from "react";

// 폰 프레임. 실제 화면 캡처를 담는다. 프레임 높이는 캡처 비율을 그대로 따라가서 잘리지 않는다.
// 세로로 길지 않은 캡처(워치 등)는 폰이 아니므로 베젤 없이 둔다.
// 시뮬레이터 캡처는 상태바와 아일랜드가 이미 찍혀 있어서 프레임 쪽 아일랜드를 뺀다.
const NATIVE = ["/apps/runpop/", "/side/runpop.png"];
export function PhoneFrame({ src, alt, width = 176, priority = false }: { src: string; alt: string; width?: number; priority?: boolean }) {
  const [wide, setWide] = useState(false);
  return (
    <span className="phone" data-bare={wide || undefined} data-native={NATIVE.some((p) => src.startsWith(p)) || undefined} style={{ width: wide ? width * 1.3 : width }}>
      <span className="phone__island" aria-hidden="true" />
      <span className="phone__screen">
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={(e) => setWide(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth < 1.6)}
        />
      </span>
    </span>
  );
}
