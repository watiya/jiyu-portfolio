// 받침에 따라 갈리는 조사를 고른다. 이름, 파일 이름처럼 값이 바뀌는 자리 뒤에 붙인다.
// 한글이 아닌 끝 글자는 읽는 소리로 받침을 정한다(영문 L·M·N·R, 숫자 0·1·3·6·7·8).
export type JosaPair = "이/가" | "을/를" | "은/는" | "과/와" | "으로/로";

// 0: 받침 없음, 8: ㄹ 받침, 그 밖: 다른 받침
function finalConsonant(word: string): number {
  const last = word.replace(/[^0-9A-Za-z가-힣]+$/, "").slice(-1);
  if (!last) return 0;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  const ch = last.toLowerCase();
  if (ch === "l" || ch === "r" || ch === "1" || ch === "7" || ch === "8") return 8;
  if (ch === "m" || ch === "n" || ch === "0" || ch === "3" || ch === "6") return 1;
  return 0;
}

export function josa(word: string, pair: JosaPair): string {
  const [withFinal, without] = pair.split("/");
  const f = finalConsonant(word);
  if (pair === "으로/로") return f === 0 || f === 8 ? without : withFinal;
  return f === 0 ? without : withFinal;
}
