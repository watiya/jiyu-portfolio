// 콘텐츠 정본은 resume/resume.en.md 와 brainchild/content/projects. 여기는 화면용 발췌다.
import { isHiddenApp } from "./hidden.ts";
export const EMAIL = "brainchild.jiyu@gmail.com";
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/watiya" },
  { label: "Team · Brainchild Works", href: "https://brainchild.works" },
] as const;

// 회사 사례는 src/cases/(md 원문), 이전 포트폴리오 작업 색인은 src/works.ts 에 있다.

export type Step = { title: string; body: string };
export const STEPS: Step[] = [
  { title: "Find the source", body: "Locate where the truth lives today, and where it is split." },
  { title: "Write the boundary", body: "Decide what product owns and what engineering owns." },
  { title: "Design the system", body: "Tokens, structure, and policy before individual screens." },
  { title: "Build it in code", body: "Screens and the source of truth, shipped as running code." },
  { title: "Turn rules into checks", body: "Silent failures become checks that fail loudly." },
];

export const JOURNEY = [
  { year: 2026, role: "Head of UX/UI, PM/PO and Design", company: "Starzip", period: "2026 - Now" },
  { year: 2024, role: "UI/UX Designer", company: "OVERTAKE Labs", period: "2024 - 2026" },
  { year: 2022, role: "UI/UX Designer", company: "Flask", period: "2022 - 2023" },
  { year: 2021, role: "UI/UX Designer", company: "Friends Games / METABORA", period: "2021 - 2022" },
  { year: 2018, role: "UI/UX Designer", company: "Way2bit", period: "2018 - 2021" },
  { year: 2018, role: "UI/UX Designer", company: "TLX PASS", period: "2018" },
  { year: 2017, role: "Designer", company: "Syworks", period: "2017 - 2018" },
  { year: 2017, role: "Designer / Freelancer", company: "Mog Communications", period: "2017" },
  { year: 2015, role: "UI/UX Designer", company: "Freelance", period: "2015 - 2017" },
  { year: 2012, role: "UI/UX Designer", company: "SocialApps", period: "2012 - 2016" },
  { year: 2003, role: "UI Designer", company: "PNP Soft, NSoft", period: "2003 - 2011" },
];

export const WRITING: { slug: string; title: string }[] = [
  { slug: "dials-to-design-md", title: "Not just showing the tokens, but letting people take them" },
  { slug: "wording-as-risk", title: "Treating a single verb as regulatory exposure" },
  { slug: "delivery-operations", title: "Collapsing a release schedule to one gate" },
  { slug: "content-studio", title: "Building the tool so nobody waits for a designer" },
  { slug: "canon-and-mirrors", title: "Making every mirror declare itself" },
];

// 지금 하는 일. asOf 는 이 목록을 마지막으로 확인한 날(YYYY-MM-DD)이고, 푸터의 갱신일이 이 값을 따른다.
export const NOW: { asOf: string; items: string[] } = {
  asOf: "2026-10-07",
  items: [
    "Finishing Ttokuoka before a real trip to Fukuoka in late November",
    "Preparing Seoul Boom for App Store submission",
    "Testing Runpop on a real Apple Watch",
  ],
};

// v6(Kaden) 의 중심: 개인 신규 앱. 화면은 라이브 캡처(밥심은 설계 화면, 런팝은 스토어 스크린샷)
// href 가 없으면 공개 주소가 없는 앱(개인 기기 설치만)이다
// featured 는 홈 #apps(토큰 쇼케이스)에 세우는 앱. 나머지는 /apps 목록에만 나온다. 숨김은 src/hidden.ts 가 따로 맡는다
// series 는 마스코트로 묶인 앱 묶음. 붐치(서울붐) · 멘치(또쿠오카). 같은 시리즈끼리 목록·상세에서 서로를 가리킨다
export type Series = "boomchi" | "menchi";
export type App = { name: string; badge: string; kind: string; note: string; line: string; image: string; href?: string; featured?: boolean; series?: Series };

const ALL_APPS: App[] = [
  { name: "Seoul Boom", badge: "Live now", kind: "Travel", note: "iPhone + web", line: "Live crowd levels for Seoul's busiest spots, with widgets and quiet-hour alerts.", image: "/side/seoulboom.png", href: "https://seoulboom.com", featured: true, series: "boomchi" },
  { name: "Runpop", badge: "iPhone + Watch", kind: "Running", note: "iOS + watchOS", line: "A running metronome that keeps your music and adds one quiet click per step.", image: "/side/runpop.png", href: "https://runpop.app", featured: true },
  { name: "Ttokuoka", badge: "Newest", kind: "Travel", note: "iPhone + web", line: "A Fukuoka companion in Korean: yatai, phrases, tax-free help, works offline.", image: "/side/ttokuoka.png", href: "https://ttokuoka.vercel.app", featured: true, series: "menchi" },
  { name: "Carenote", badge: "iPhone prototype", kind: "Health", note: "iPhone + web", line: "A hospital app redesigned around a transplant patient's visit day, meds, and lab trends.", image: "/side/carenote.png", href: "https://carenote-sooty.vercel.app", featured: true },
  { name: "Ppopjido", badge: "Map + cards", kind: "Collectors", note: "Web", line: "A map for capsule toys and Pokemon cards across Korea and Japan.", image: "/side/ppopjido.png", href: "https://ppopjido.vercel.app" },
  { name: "Tory", badge: "Prototype", kind: "Couples", note: "Web prototype", line: "A couple app built on one shared thread: a timeline and a live date mode.", image: "/side/tory.png", href: "https://tory-ashen.vercel.app" },
  { name: "Bapsim", badge: "In design", kind: "Food", note: "Design canvas", line: "Korean meal logging as a tray: rice, soup, and sides in four taps.", image: "/side/bapsim.png", href: "https://bapsim-app.vercel.app/design/" },
  { name: "Wishrun", badge: "iPhone + Health", kind: "Running", note: "iOS", line: "A seven-week plan for a first 5K, turned into an app that reads runs from Apple Health.", image: "/side/wishrun.png" },
  { name: "Finishline", badge: "5K to full", kind: "Running", note: "iPhone + web", line: "From 5K to the full marathon: pick a race and a date, and the app builds the training plan backward from race day.", image: "/side/finishline.png", href: "https://finishline-mu.vercel.app", featured: true },
  { name: "Hangul Boom", badge: "9 stops", kind: "Language", note: "iPhone + web", line: "Learn to read Hangul on the flight to Seoul: nine stops with Boomchi, fully offline.", image: "/side/hangul-boom.png", href: "https://hangul-boom.vercel.app", series: "boomchi" },
  { name: "Menchi Kana", badge: "208 kana", kind: "Language", note: "iPhone + web", line: "Hiragana and katakana along Fukuoka's subway lines, with handwriting checked stroke by stroke.", image: "/side/menchi-kana.png", href: "https://menchi-kana.vercel.app", series: "menchi" },
  { name: "Menchi Voca", badge: "120 words", kind: "Language", note: "iPhone + web", line: "120 Japanese words for a Fukuoka trip, by scene. Missed words come back after 1, 3 and 7 days.", image: "/side/menchi-voca.png", href: "https://menchi-voca.vercel.app", series: "menchi" },
  { name: "Puzzle Lounge", badge: "5 puzzles", kind: "Puzzles", note: "iPhone", line: "Five offline puzzles with endless levels, six difficulties, and a collectible every five levels.", image: "/side/puzzle-lounge.png", series: "boomchi" },
];
export const APPS: App[] = ALL_APPS.filter((a) => !isHiddenApp(a.name.toLowerCase().replace(/\s+/g, "-")));
