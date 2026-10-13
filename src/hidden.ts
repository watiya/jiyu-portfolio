// 완성도가 낮아 지금은 사이트에 내놓지 않는 앱. 데이터는 그대로 두고 여기서만 거른다.
// 되살리려면 이 목록에서 빼면 카드·상세·프리셋·프리렌더 경로가 함께 돌아온다
export const HIDDEN_APPS = new Set(["tory", "bapsim", "wishrun", "ppopjido"]);
export const isHiddenApp = (slug: string) => HIDDEN_APPS.has(slug);

// 예전 작업물(/work)·사례(/cases)·이력서(/resume)와 경력·소개 문단을 잠시 내린다(2026-10-14).
// 되살리려면 false 로 바꾸면 메뉴·홈 섹션·팔레트·프리렌더·사이트맵이 함께 돌아온다
export const HIDE_PRIVATE = true;
const PRIVATE_ROUTES = new Set(["cases", "case", "work", "workDetail", "canvas", "resume"]);
export const isPrivateRoute = (name: string) => HIDE_PRIVATE && PRIVATE_ROUTES.has(name);
export const isPrivatePath = (path: string) => HIDE_PRIVATE && /^\/(cases|case-studies|writing|work|resume)(\/|$)/.test(path);
