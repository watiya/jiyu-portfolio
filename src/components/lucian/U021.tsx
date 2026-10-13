/* Lucian UX/UI Prompt #021 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#021 */
// 낮·밤 하늘 스위치. 상태는 사이트의 theme 다이얼이 정본이라 React 로 올렸고, 원래 스크립트의 클래스·aria 쓰기는 렌더가 한다
import "./U021.css";

type Props = {
  night: boolean;
  onToggle: () => void;
  label: string;
  dayText: string;
  nightText: string;
};

export function U021({ night, onToggle, label, dayText, nightText }: Props) {
  return (
    <div className={`ux u021${night ? " is-night" : ""}`}>
      <button className="u021-sw" type="button" role="switch" aria-checked={night} aria-label={label} onClick={onToggle}>
        <span className="u021-halo" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="u021-stars" aria-hidden="true">
          <i style={{ left: 30, top: 20 }} />
          <i style={{ left: 58, top: 56, animationDelay: "-.6s", width: 3, height: 3 }} />
          <i style={{ left: 86, top: 26, animationDelay: "-1.2s" }} />
          <i style={{ left: 44, top: 72, animationDelay: "-1.8s", width: 3, height: 3 }} />
          <i style={{ left: 110, top: 60, animationDelay: "-.9s", width: 2, height: 2 }} />
          <i style={{ left: 20, top: 46, animationDelay: "-1.5s", width: 2, height: 2 }} />
        </span>
        <span className="u021-clouds" aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="u021-knob" aria-hidden="true">
          <span className="u021-moon">
            <i />
            <i />
            <i />
          </span>
        </span>
      </button>
      <p className="u021-lab" aria-hidden="true">
        <span>
          {dayText}
          <small>light</small>
        </span>
        <span>
          {nightText}
          <small>dark</small>
        </span>
      </p>
    </div>
  );
}
