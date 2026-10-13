import { Suspense, lazy, useEffect } from "react";
import { Cursor } from "./components/Cursor.tsx";
import { Header } from "./components/Header.tsx";
import { Inspector } from "./components/Inspector.tsx";
import { Palette } from "./components/Palette.tsx";
import { TokenPanel } from "./components/TokenPanel.tsx";
import { Toasts } from "./components/Toast.tsx";
import { Home } from "./pages/Home.tsx";
import { Front } from "./pages/Front.tsx";
import { Tools } from "./pages/Tools.tsx";
// 도구 넷은 따로 싣는다. 사주 만세력(lunar-typescript)이 커서 첫 화면 묶음에 넣지 않는다
const Saju = lazy(() => import("./pages/tools/Saju.tsx").then((m) => ({ default: m.Saju })));
const Mbti = lazy(() => import("./pages/tools/Mbti.tsx").then((m) => ({ default: m.Mbti })));
const Tarot = lazy(() => import("./pages/tools/Tarot.tsx").then((m) => ({ default: m.Tarot })));
const Gunghap = lazy(() => import("./pages/tools/Gunghap.tsx").then((m) => ({ default: m.Gunghap })));
import { AppDetail, NotFound } from "./pages/AppDetail.tsx";
import { AppsIndex } from "./pages/AppsIndex.tsx";
import { System } from "./pages/System.tsx";
import { About } from "./pages/About.tsx";
import { Cases } from "./pages/Cases.tsx";
import { CaseDetail } from "./pages/CaseDetail.tsx";
import { Work } from "./pages/Work.tsx";
import { WorkDetail } from "./pages/WorkDetail.tsx";
import { Canvas } from "./pages/Canvas.tsx";
import { WORKS } from "./works.ts";
import { Resume } from "./pages/Resume.tsx";
import { getCase } from "./cases/content.ts";
import { useRoute } from "./router.ts";
import { TokenProvider } from "./tokens/store.tsx";
import { useTokens } from "./tokens/useTokens.ts";
import { LangProvider } from "./i18n/LangProvider.tsx";
import { useLang } from "./i18n/useLang.ts";
import { APP_DETAILS } from "./appDetails.ts";

function Shell() {
  const [route, go] = useRoute();
  const { setPanelOpen, setInspect, setPaletteOpen, paletteOpen, inspect } = useTokens();
  const { t, lang } = useLang();

  // 단축키: I 검사, T 토큰, ⌘K 팔레트. 입력 중엔 글자 키를 무시
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (paletteOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || t.getAttribute("role") === "slider")) return;
      if (e.key === "i" || e.key === "I") setInspect((v) => !v);
      if (e.key === "t" || e.key === "T") setPanelOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setInspect, setPanelOpen, setPaletteOpen, paletteOpen]);

  // 문서 제목과 설명은 경로와 언어를 따른다
  useEffect(() => {
    const titles: Record<string, string> = { front: t.front.title, tools: t.titles.tools, home: t.titles.home, cases: t.titles.cases, work: t.titles.work, apps: t.titles.apps, system: t.titles.system, about: t.titles.about, resume: t.titles.resume };
    const appName = route.name === "app" ? APP_DETAILS.find((d) => d.slug === route.slug)?.name : undefined;
    const kase = route.name === "case" ? getCase(lang, route.slug) : undefined;
    const work = route.name === "workDetail" || route.name === "canvas" ? WORKS.find((w) => w.slug === route.slug) : undefined;
    document.title =
      route.name === "tool" ? t.titles.tool(t.toolsPage.items[route.slug].name)
      : route.name === "app" ? (appName ? t.titles.app(appName) : t.titles.notFound)
      : route.name === "case" ? (kase ? t.titles.case(kase.title) : t.titles.notFound)
      : route.name === "workDetail" ? (work ? t.titles.workDetail(work.name) : t.titles.notFound)
      : route.name === "canvas" ? (work ? t.titles.canvas(work.name) : t.titles.notFound)
      : titles[route.name] ?? t.titles.notFound;
    const appDek = route.name === "app" ? APP_DETAILS.find((d) => d.slug === route.slug)?.dek : undefined;
    document.querySelector('meta[name="description"]')?.setAttribute("content", kase?.summary ?? appDek ?? work?.tagline[lang] ?? t.metaDescription);
  }, [route, t, lang]);

  const current = route.name === "tools" || route.name === "tool" ? "/tools" : route.name === "apps" || route.name === "app" ? "/apps" : route.name === "cases" || route.name === "case" ? "/cases" : route.name === "work" || route.name === "workDetail" || route.name === "canvas" ? "/work" : route.name === "resume" ? "/resume" : route.name === "system" ? "/system" : route.name === "about" ? "/about" : route.name === "home" ? "/projects" : "";

  return (
    <>
      <a href="#main" className="skip">
        {t.skip}
      </a>
      {/* 캔버스는 사이트 헤더 없이 화면 전체를 쓴다. 돌아가는 길은 캔버스 줄의 ← Back 이 맡고, 단축키(⌘K·I·T)는 전역이라 그대로 산다 */}
      {route.name !== "canvas" && <Header go={go} current={current} />}
      <main id="main">
        {route.name === "front" && <Front go={go} />}
        {route.name === "tools" && <Tools go={go} />}
        {route.name === "tool" && (
          <Suspense fallback={null}>
            {route.slug === "saju" && <Saju go={go} />}
            {route.slug === "mbti" && <Mbti go={go} />}
            {route.slug === "tarot" && <Tarot go={go} />}
            {route.slug === "gunghap" && <Gunghap go={go} />}
          </Suspense>
        )}
        {route.name === "home" && <Home go={go} />}
        {route.name === "apps" && <AppsIndex go={go} />}
        {route.name === "system" && <System go={go} />}
        {route.name === "about" && <About />}
        {route.name === "app" && <AppDetail slug={route.slug} go={go} />}
        {route.name === "cases" && <Cases go={go} />}
        {route.name === "case" && <CaseDetail slug={route.slug} go={go} />}
        {route.name === "work" && <Work go={go} />}
        {route.name === "workDetail" && <WorkDetail slug={route.slug} go={go} />}
        {route.name === "canvas" && <Canvas slug={route.slug} go={go} />}
        {route.name === "resume" && <Resume go={go} />}
        {route.name === "notfound" && <NotFound path={route.path} go={go} />}
      </main>
      <div className="gridlines" aria-hidden="true">
        <div className="container gridlines__cols">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <TokenPanel />
      {inspect && <Inspector />}
      {paletteOpen && <Palette go={go} />}
      <Toasts />
      <Cursor />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <TokenProvider>
        <Shell />
      </TokenProvider>
    </LangProvider>
  );
}
