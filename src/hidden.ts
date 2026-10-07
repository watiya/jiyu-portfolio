// 완성도가 낮아 지금은 사이트에 내놓지 않는 앱. 데이터는 그대로 두고 여기서만 거른다.
// 되살리려면 이 목록에서 빼면 카드·상세·프리셋·프리렌더 경로가 함께 돌아온다
export const HIDDEN_APPS = new Set(["tory", "bapsim"]);
export const isHiddenApp = (slug: string) => HIDDEN_APPS.has(slug);
