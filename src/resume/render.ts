// 이력서 원고(content/resume/<lang>.md) → HTML. 페이지와 PDF 스크립트가 같은 함수를 쓴다.
// 공개 원고의 이름은 Jiyu 다. 본명은 저장소에 두지 않고, 로컬에서 PDF 를 뽑을 때만 `name` 으로 바꿔 넣는다.
import { renderMarkdown } from "../cases/markdown.ts";

export function renderResume(source: string, where: string, { name }: { name?: string } = {}): string {
  const raw = name ? source.replace(/^# .*$/m, `# ${name}`) : source;
  return renderMarkdown(raw, where, { extended: true });
}
