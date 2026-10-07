// v4(portfolio.brainchild.kr) 에서 작업 설명·캔버스 문안·캔버스 이미지를 기계로 가져온다. 손으로 옮기지 않는다.
// v4 를 고친 뒤 다시 돌리면 같은 자리가 같은 값으로 덮인다. 인자는 v4 의 demo 폴더. 기본은 옆 폴더다.
// 2026-10-07 v4 정리 뒤로는 이 사이트 쪽이 정본이다. 다시 돌리면 여기서 고친 설명·문안이 v4 값으로 덮이니 돌리지 않는다. v4 는 _archive/jiyu-portfolio-v4 에 있다.
//   node scripts/import-v4.ts [../jiyu-portfolio-v4/demo]
// 끝나면 scripts/canvas-manifest.ts 를 이어서 돌려 프레임 목록을 다시 뽑는다.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const V4 = resolve(process.argv[2] ?? join(ROOT, "../jiyu-portfolio-v4/demo"));

type Text = { ko: string; en: string };
type V4Work = { slug: string; description: Text };

async function main() {
  if (!existsSync(join(V4, "lib/data.ts"))) throw new Error(`import-v4: v4 를 찾지 못했다: ${V4}`);
  const { works } = (await import(join(V4, "lib/data.ts"))) as { works: V4Work[] };

  // 설명 문단. 비어 있는 항목은 적지 않는다. 화면이 「아직 쓰지 않았다」로 그린다
  const described = works.filter((w) => w.description.ko || w.description.en);
  const lines = described.map((w) => `  ${JSON.stringify(w.slug)}: { ko: ${JSON.stringify(w.description.ko)}, en: ${JSON.stringify(w.description.en)} },`);
  const header = [
    "// v4(portfolio.brainchild.kr) 작업 설명 문단. scripts/import-v4.ts 가 lib/data.ts 에서 기계로 뽑았다. 손으로 고치지 말고 v4 를 고친 뒤 다시 뽑는다.",
    "// 문단은 빈 줄로 갈린다. 설명이 비어 있던 항목은 여기 없고, 상세 화면이 그 자리를 빈 것으로 그린다.",
    'import type { Lang } from "./i18n/lang.ts";',
    "",
    "export const WORK_DESCRIPTIONS: Record<string, Record<Lang, string>> = {",
  ];
  writeFileSync(join(ROOT, "src/works.desc.ts"), [...header, ...lines, "};", ""].join("\n"));

  // 캔버스 문안(페이지 이름·프레임 제목·흐름)은 그대로 복사한다
  const copyDir = join(ROOT, "src/content/canvas/copy");
  rmSync(copyDir, { recursive: true, force: true });
  mkdirSync(copyDir, { recursive: true });
  const copies = readdirSync(join(V4, "content/canvas")).filter((f) => f.endsWith(".json"));
  for (const f of copies) cpSync(join(V4, "content/canvas", f), join(copyDir, f));

  // 캔버스 이미지. 작업 폴더 안의 도구 흔적(.omc 등 점 폴더)은 거른다
  const assets = join(ROOT, "public/canvas");
  rmSync(assets, { recursive: true, force: true });
  cpSync(join(V4, "assets/canvas"), assets, {
    recursive: true,
    filter: (src) => {
      const name = src.split("/").pop() ?? "";
      return !name.startsWith(".") && (!/\.\w+$/.test(name) || /\.(webp|png|jpe?g|avif)$/i.test(name));
    },
  });

  console.log(`import-v4: descriptions ${described.length}/${works.length}, copy ${copies.length}, assets → public/canvas`);
}

main();
