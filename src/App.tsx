import { useEffect } from "react";
import { Cursor } from "./components/Cursor.tsx";
import { Header } from "./components/Header.tsx";
import { Inspector } from "./components/Inspector.tsx";
import { Palette } from "./components/Palette.tsx";
import { TokenPanel } from "./components/TokenPanel.tsx";
import { Toasts } from "./components/Toast.tsx";
import { Home } from "./pages/Home.tsx";
import { Landing } from "./pages/Landing.tsx";
import { AppDetail, NotFound } from "./pages/AppDetail.tsx";
import { Cases } from "./pages/Cases.tsx";
import { CaseDetail } from "./pages/CaseDetail.tsx";
import { Work } from "./pages/Work.tsx";
import { Resume } from "./pages/Resume.tsx";
import { getCase } from "./cases/content.ts";
import { Writing } from "./pages/Writing.tsx";
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
    const titles: Record<string, string> = { landing: t.landing.title, home: t.titles.home, writing: t.titles.writing, cases: t.titles.cases, work: t.titles.work, resume: t.titles.resume };
    const appName = route.name === "app" ? APP_DETAILS.find((d) => d.slug === route.slug)?.name : undefined;
    const kase = route.name === "case" ? getCase(lang, route.slug) : undefined;
    document.title =
      route.name === "app" ? (appName ? t.titles.app(appName) : t.titles.notFound)
      : route.name === "case" ? (kase ? t.titles.case(kase.title) : t.titles.notFound)
      : titles[route.name] ?? t.titles.notFound;
    const appDek = route.name === "app" ? APP_DETAILS.find((d) => d.slug === route.slug)?.dek : undefined;
    document.querySelector('meta[name="description"]')?.setAttribute("content", kase?.summary ?? appDek ?? t.metaDescription);
  }, [route, t, lang]);

  const current = route.name === "writing" ? "/writing" : route.name === "cases" || route.name === "case" ? "/cases" : route.name === "work" ? "/work" : route.name === "resume" ? "/resume" : route.name === "home" ? "/projects" : "";

  // 첫 화면은 헤더·격자 없이 한 장으로 둔다. 토큰 패널과 단축키는 그대로 산다
  if (route.name === "landing")
    return (
      <>
        <main id="main">
          <Landing go={go} />
        </main>
        <TokenPanel />
        {inspect && <Inspector />}
        {paletteOpen && <Palette go={go} />}
        <Toasts />
        <Cursor />
      </>
    );

  return (
    <>
      <a href="#main" className="skip">
        {t.skip}
      </a>
      <Header go={go} current={current} />
      <main id="main">
        {route.name === "home" && <Home go={go} />}
        {route.name === "app" && <AppDetail slug={route.slug} go={go} />}
        {route.name === "writing" && <Writing go={go} />}
        {route.name === "cases" && <Cases go={go} />}
        {route.name === "case" && <CaseDetail slug={route.slug} go={go} />}
        {route.name === "work" && <Work go={go} />}
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
