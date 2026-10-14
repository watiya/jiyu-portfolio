// 검사 모드에서 짚은 메모 칩과 "에이전트에게 넘길 묶음" 복사. 메모를 남기는 자리는 Inspector 다.
import { useTokens } from "../tokens/useTokens.ts";
import { useLang } from "../i18n/useLang.ts";

export function NotesBox() {
  const { t } = useLang();
  const N = t.front.notes;
  const { notes, removeNote, clearNotes, copyBundle, inspect, setInspect } = useTokens();
  return (
    <div className="notes" data-note-skip="">
      <div className="take__head mono">
        <span>
          {N.label} <span className="take__hint">· {N.hint}</span>
        </span>
        <span className="take__source" aria-live="polite">
          {notes.length}
        </span>
      </div>
      {notes.length === 0 ? (
        <p className="notes__empty">{N.empty}</p>
      ) : (
        <ol className="notes__list" role="list">
          {notes.map((n, i) => (
            <li key={n.id} className="notechip">
              <span className="pin pin--inline mono" aria-hidden="true">
                {i + 1}
              </span>
              <span className="notechip__text">
                <span className="notechip__label mono">{n.label}</span>
                <span className="notechip__body">{n.body}</span>
              </span>
              <button type="button" className="iconbtn notechip__del" aria-label={N.remove(i + 1)} title={N.remove(i + 1)} onClick={() => removeNote(n.id)}>
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="take__row">
        <button type="button" className="btn btn--sm" onClick={() => void copyBundle()}>
          {N.copy}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" aria-pressed={inspect} onClick={() => setInspect((v) => !v)}>
          {inspect ? N.stop : N.start}
        </button>
        {notes.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearNotes}>
            {N.clear}
          </button>
        )}
      </div>
    </div>
  );
}
