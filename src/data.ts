// 콘텐츠 정본은 resume/resume.en.md 와 brainchild/content/projects. 여기는 화면용 발췌다.
export const EMAIL = "brainchild.jiyu@gmail.com";
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/watiya" },
  { label: "X", href: "https://twitter.com/brainchild_jiyu" },
  { label: "Portfolio", href: "https://portfolio.brainchild.kr" },
  { label: "Team · Brainchild Works", href: "https://brainchild.works" },
] as const;

export const COMPANIES = ["Starzip", "OVERTAKE", "Flask", "Friends Games", "METABORA", "Way2bit", "BORA", "SocialApps"];

// 회사 사례는 src/cases/(md 원문), 이전 포트폴리오 작업 색인은 src/works.ts 에 있다.

export const SERVICES = [
  {
    icon: "layers",
    title: "Design systems",
    body: "Primitive and semantic token layers, theme checks, and promotion criteria. The standard lives in running code, and drift is caught by machine.",
  },
  {
    icon: "layout",
    title: "Information architecture",
    body: "Structure first, then screens. Navigation, states, and edge cases designed as one system rather than page by page.",
  },
  {
    icon: "scale",
    title: "Product policy",
    body: "Wording systems for regulated screens, confirmed state, and acceptance criteria that can actually be verified.",
  },
  {
    icon: "code",
    title: "Build in code",
    body: "React and Next.js, with Claude Code in the daily loop. Most product screens, backend aside, I build myself.",
  },
  {
    icon: "rocket",
    title: "Delivery operations",
    body: "Role boundaries written down, one release gate, and progress that aggregates itself on every ticket.",
  },
] as const;

export type Step = { title: string; body: string };
export const STEPS: Step[] = [
  { title: "Find the source", body: "Locate where the truth lives today, and where it is split." },
  { title: "Write the boundary", body: "Decide what product owns and what engineering owns." },
  { title: "Design the system", body: "Tokens, structure, and policy before individual screens." },
  { title: "Build it in code", body: "Screens and the source of truth, shipped as running code." },
  { title: "Turn rules into checks", body: "Silent failures become checks that fail loudly." },
];

export const TOOLS = [
  { id: "figma", name: "Figma", desc: "Design and prototyping", tag: "Since 2016" },
  { id: "react", name: "React", desc: "Product screens in code", tag: "Daily" },
  { id: "nextdotjs", name: "Next.js", desc: "Sites and apps", tag: "Daily" },
  { id: "claude", name: "Claude Code", desc: "The daily build loop", tag: "Daily" },
  { id: "tailwindcss", name: "Tailwind CSS", desc: "Tokens to utilities", tag: "Daily" },
  { id: "framer", name: "Framer", desc: "Landing and marketing sites", tag: "Often" },
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

export const FAQ = [
  {
    q: "What kind of role are you looking for?",
    a: "Design leadership where the system, the policy, and the screens sit in one seat. Product teams that want a designer who also ships code.",
  },
  {
    q: "Do you write production code?",
    a: "Yes. React and Next.js, with Claude Code in the daily loop. At Starzip I built most product screens myself, 2,621 commits in 3.8 months.",
  },
  {
    q: "Which domains have you worked in?",
    a: "Mostly blockchain and gaming products: BORA, Play2bit, NAODA, OVERTAKE, and Starzip, plus regulated wording for financial screens.",
  },
  {
    q: "Do you take freelance or side projects?",
    a: "Yes, through Brainchild Works. Sites, design systems, and product screens built end to end.",
  },
  {
    q: "Where are you based?",
    a: "Seoul, Korea. Working in Korean and English, available remotely.",
  },
];

export const WRITING: { slug: string; title: string }[] = [
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
export type App = { name: string; badge: string; kind: string; note: string; line: string; image: string; href: string };

export const APPS: App[] = [
  { name: "Seoul Boom", badge: "Live now", kind: "Travel", note: "iPhone + web", line: "Live crowd levels for Seoul's busiest spots, with widgets and quiet-hour alerts.", image: "/side/seoulboom.png", href: "https://seoulboom.com" },
  { name: "Runpop", badge: "iPhone + Watch", kind: "Running", note: "iOS + watchOS", line: "A running metronome that keeps your music and adds one quiet click per step.", image: "/side/runpop.png", href: "https://runpop.app" },
  { name: "Ttokuoka", badge: "Newest", kind: "Travel", note: "iPhone + web", line: "A Fukuoka companion in Korean: yatai, phrases, tax-free help, works offline.", image: "/side/ttokuoka.png", href: "https://ttokuoka.vercel.app" },
  { name: "Carenote", badge: "iPhone prototype", kind: "Health", note: "iPhone + web", line: "A hospital app redesigned around a transplant patient's visit day, meds, and lab trends.", image: "/side/carenote.png", href: "https://carenote-sooty.vercel.app" },
  { name: "Ppopjido", badge: "Map + cards", kind: "Collectors", note: "Web", line: "A map for capsule toys and Pokemon cards across Korea and Japan.", image: "/side/ppopjido.png", href: "https://ppopjido.vercel.app" },
  { name: "Tory", badge: "Prototype", kind: "Couples", note: "Web prototype", line: "A couple app built on one shared thread: a timeline and a live date mode.", image: "/side/tory.png", href: "https://tory-ashen.vercel.app" },
  { name: "Bapsim", badge: "In design", kind: "Food", note: "Design canvas", line: "Korean meal logging as a tray: rice, soup, and sides in four taps.", image: "/side/bapsim.png", href: "https://bapsim-app.vercel.app/design/" },
];

export const OFFER = [
  "Design system in code",
  "Information architecture",
  "Regulated wording review",
  "Screens built in React",
  "Release gate and checks",
  "Korean and English",
];
