// v4(portfolio.brainchild.kr) 작업 목록. lib/data.ts 에서 기계로 옮겼다. 손으로 고치지 말고 v4 를 고친 뒤 다시 뽑는다.
// 제목·연도·분류·주소는 v4 에서 확인한 값이다. 예외: 한 줄 설명이 v4 에서 비어 있던 셋(bora-2-renewal, naoda-concept, metapick)은 이력서 문장으로 직접 채웠다. 다시 뽑으면 이 셋을 되살린다.
import type { Lang } from "./i18n/lang.ts";

export type WorkCategory = "design-system" | "app-ui" | "product-web" | "brand" | "concept";
export const WORK_CATEGORIES: WorkCategory[] = ["design-system", "app-ui", "product-web", "brand", "concept"];

export type Work = {
  slug: string;
  /** 제품명. 번역하지 않는다 */
  name: string;
  tagline: Record<Lang, string>;
  category: WorkCategory;
  year: string;
  client?: string;
  /** 이 사이트 안의 사례 슬러그(/cases/<slug>) */
  caseSlug?: string;
  /** 살아 있는 제품 주소 */
  liveUrl?: string;
  featured?: boolean;
  role?: Record<Lang, string>;
  /** 표지 이미지가 없는 항목. 있으면 /work/<slug>.webp */
  noCover?: true;
  /** v4 에 캔버스가 없고 이 사이트 안에서 돌아가는 작업. 캔버스 대신 이 경로로 연다 */
  here?: string;
};

export const WORKS: Work[] = [
  { slug: "dials-to-design-md", name: "Token Export", tagline: { ko: "토큰을 보여 주는 데서 그치지 않고 가져가게 하다", en: "Not just showing the tokens, but letting people take them" }, category: "design-system", year: "2026", caseSlug: "dials-to-design-md", here: "/projects#system", liveUrl: "https://www.brainchild.kr/projects#system", role: { ko: "설계 및 구현", en: "Design and build" }, noCover: true },
  { slug: "design-system-in-code", name: "Design System in Code", tagline: { ko: "디자인 도구를 기준 자리에서 내리고 코드를 공용 패키지로 올리다", en: "The design tool is no longer the source of truth, and the code moved into packages" }, category: "design-system", year: "2026", client: "Starzip", caseSlug: "design-system-in-code", featured: true },
  { slug: "screen-spec-board", name: "Screen Spec Board", tagline: { ko: "화면을 말로 세지 않고 판으로 세다", en: "Counting screens on a board instead of in conversation" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "design-system-in-code" },
  { slug: "wording-as-risk", name: "Wording as Risk", tagline: { ko: "단어 하나를 규제 리스크로 다루다", en: "Treating a single verb as regulatory exposure" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "wording-as-risk" },
  { slug: "canon-and-mirrors", name: "Canon and Mirrors", tagline: { ko: "미러가 자기가 미러임을 말하게 하고 반복되는 실수는 검사로 옮기다", en: "Making every mirror declare itself, and moving repeat mistakes into checks" }, category: "design-system", year: "2026", client: "Starzip", caseSlug: "canon-and-mirrors" },
  { slug: "delivery-operations", name: "Delivery Operations", tagline: { ko: "출시 일정을 게이트 하나로 줄이고 진행 현황을 화면에 세우다", en: "Collapsing a release schedule to one gate, then putting progress on a screen" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "delivery-operations" },
  { slug: "regression-as-checks", name: "Regression as Checks", tagline: { ko: "반복되는 실수를 문장이 아니라 검사로 옮기다", en: "Moving repeat mistakes out of prose and into checks" }, category: "design-system", year: "2026", client: "Starzip", caseSlug: "canon-and-mirrors" },
  { slug: "promotion-to-packages", name: "Promotion to Packages", tagline: { ko: "화면을 제품에서 꺼내 패키지로 올리다", en: "Lifting screens out of a product and into packages" }, category: "design-system", year: "2026", client: "Starzip", caseSlug: "design-system-in-code" },
  { slug: "internal-portal", name: "Internal Portal", tagline: { ko: "물어봐야 알 수 있던 것들을 한 화면에 세우다", en: "Putting what you had to ask for on one screen" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "delivery-operations" },
  { slug: "content-studio", name: "Content Studio", tagline: { ko: "디자이너를 기다리지 않아도 되게 도구를 만들다", en: "Building the tool so nobody has to wait for a designer" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "content-studio" },
  { slug: "entry-without-a-wallet", name: "Starzip Genesis", tagline: { ko: "지갑 없이도 끝까지 보게 하고 지갑은 살 때만 묻다", en: "Letting people see all of it without a wallet, and asking for one only at purchase" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "entry-without-a-wallet", liveUrl: "https://genesis.starzip.io/", featured: true },
  { slug: "exposure-as-a-build", name: "Store Valuation", tagline: { ko: "방화벽을 푸는 대신 나갈 것만 따로 짓다", en: "Building only what goes out, instead of opening the firewall" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "exposure-as-a-build", featured: true },
  { slug: "marketing-site", name: "Starzip Marketing Site", tagline: { ko: "회사와 제품을 처음 만나는 자리", en: "The first place people meet the company and the product" }, category: "product-web", year: "2026", client: "Starzip", liveUrl: "https://starzip.io/", role: { ko: "기획, 디자인", en: "Product planning, design" }, noCover: true },
  { slug: "symbol-redefinition", name: "Starzip Symbol", tagline: { ko: "이름이 뜻하는 것을 심볼이 직접 말하게 하다", en: "Making the symbol say what the name already means" }, category: "brand", year: "2026", client: "Starzip", role: { ko: "브랜드 디자인", en: "Brand design" }, noCover: true },
  { slug: "mobile-app", name: "Starzip App", tagline: { ko: "웹으로 다시 그린 화면 대신 앱 소스를 그대로 띄워 보다", en: "Reviewing the app from its own source instead of a screen redrawn for the web" }, category: "app-ui", year: "2026", client: "Starzip", role: { ko: "프로토타입 설계 및 구현", en: "Prototype design and build" } },
  { slug: "company-os", name: "Company OS", tagline: { ko: "도착지를 문서로 설명하는 대신 눈으로 보게 하다", en: "Showing the destination instead of describing it in a document" }, category: "product-web", year: "2026", client: "Starzip", role: { ko: "컨셉 설계 및 구현", en: "Concept design and build" } },
  { slug: "agent-console", name: "Agent Console", tagline: { ko: "단계를 사람이 채우는 대신 에이전트가 계획하고 사람이 승인하게 하다", en: "Letting an agent plan the steps and a person approve them" }, category: "product-web", year: "2026", client: "Starzip", role: { ko: "프로토타입 설계 및 구현", en: "Prototype design and build" } },
  { slug: "dex-beta", name: "Starzip DEX", tagline: { ko: "지역 상점 토큰을 사고파는 거래소의 베타부터 GA 까지", en: "The exchange for local-store tokens, from beta to GA" }, category: "product-web", year: "2026", client: "Starzip", caseSlug: "dex-beta", liveUrl: "https://dex.starzip.io", role: { ko: "제품 화면 설계 및 UI 구현", en: "Product screen design and UI build" } },
  { slug: "business-console", name: "Business Console", tagline: { ko: "상점 주인이 토큰을 발행하고 운영하는 콘솔과 그 뒤의 관리자·파트너 화면", en: "The console where a store owner issues and runs a token, and the admin and partner surfaces behind it" }, category: "product-web", year: "2026", client: "Starzip", role: { ko: "제품 화면 설계 및 UI 구현", en: "Product screen design and UI build" } },
  { slug: "member", name: "Member", tagline: { ko: "패스키로 들어와 퀘스트와 리워드로 이어지는 회원 자리", en: "The member surface - in through a passkey, on to quests and rewards" }, category: "product-web", year: "2026", client: "Starzip", role: { ko: "제품 화면 설계 및 UI 구현", en: "Product screen design and UI build" } },
  { slug: "wallet", name: "Wallet", tagline: { ko: "모바일·확장 프로그램·상점 결제, 지갑이 서는 세 자리", en: "Mobile, browser extension and in-store payment - the three places a wallet stands" }, category: "app-ui", year: "2026", client: "Starzip", role: { ko: "화면 설계 및 프로토타입 구현", en: "Screen design and prototype build" } },
  { slug: "hood-star", name: "우리동네스타", tagline: { ko: "동네 상권을 게임으로 - 여덟 번 다시 그린 모바일 프로토타입", en: "The neighbourhood economy as a game - a mobile prototype redrawn eight times" }, category: "concept", year: "2026", client: "Starzip", caseSlug: "hood-star", featured: true, role: { ko: "컨셉 설계 및 프로토타입 구현", en: "Concept design and prototype build" } },
  { slug: "starground", name: "스타그라운드", tagline: { ko: "서울 데이터로 하루 다섯 문제를 맞히는 모바일 게임", en: "A mobile game of five daily questions on Seoul data" }, category: "concept", year: "2026", client: "Starzip", role: { ko: "컨셉 설계 및 프로토타입 구현", en: "Concept design and prototype build" } },
  { slug: "pan", name: "판", tagline: { ko: "조선 장터 말투로 어제 동네 일을 맞히는 판 게임", en: "Guessing yesterday in the neighbourhood, in the voice of a Joseon market" }, category: "concept", year: "2026", client: "Starzip", role: { ko: "컨셉 설계 및 프로토타입 구현", en: "Concept design and prototype build" } },
  { slug: "por", name: "PoR", tagline: { ko: "지역 지수를 오른다 · 내린다 토큰으로 사고파는 오더북 시장", en: "An order-book market trading local indices as up and down tokens" }, category: "concept", year: "2026", client: "Starzip", role: { ko: "컨셉 설계 및 프로토타입 구현", en: "Concept design and prototype build" } },
  { slug: "playground-spikes", name: "Playground", tagline: { ko: "결정 전에 변형안을 나란히 놓는 자리", en: "Where variants sit side by side before a decision" }, category: "concept", year: "2026", client: "Starzip", role: { ko: "탐색 설계 및 프로토타입 구현", en: "Exploration design and prototype build" } },
  { slug: "docs-site", name: "Docs", tagline: { ko: "사용자·상점·파트너가 각자 읽는 문서 사이트와 백서", en: "The docs site and whitepaper, read by users, stores and partners each in their own lane" }, category: "product-web", year: "2026", client: "Starzip", liveUrl: "https://docs.starzip.io", role: { ko: "정보 구조 및 화면 설계", en: "Information architecture and screen design" } },
  { slug: "ui-workbench", name: "UI Workbench", tagline: { ko: "화면 지도·디자인 시스템 문서·예제가 한 앱에 있는 작업대", en: "The workbench - screen map, design-system docs and examples in one app" }, category: "design-system", year: "2026", client: "Starzip", role: { ko: "작업 환경 설계 및 구현", en: "Workbench design and build" } },
  { slug: "overtake-framer", name: "OVERTAKE Framer", tagline: { ko: "OVERTAKE 생태계의 구조와 방향을 전하는 제품 사이트", en: "A product site communicating the structure and vision of the OVERTAKE ecosystem" }, category: "product-web", year: "2025", client: "OVERTAKE", liveUrl: "https://overtake.world/", featured: true },
  { slug: "overtake-airdrop", name: "OVERTAKE Airdrop Rewards", tagline: { ko: "퀘스트로 쌓은 포인트를 토큰 보상으로 잇는 화면", en: "Turning points earned from quests into token rewards" }, category: "product-web", year: "2025", client: "OVERTAKE", liveUrl: "https://airdrop.overtake.world/event/airdrop/check" },
  { slug: "overtake-market", name: "OVERTAKE Marketplace", tagline: { ko: "게임 아이템 거래를 온체인으로 옮긴 장터", en: "A marketplace moving in-game item trading on-chain" }, category: "product-web", year: "2025", client: "OVERTAKE", liveUrl: "https://overtake.market/", featured: true },
  { slug: "overtake-market-act2", name: "OVERTAKE Marketplace Act2", tagline: { ko: "검증된 계정 거래를 화면에서 구분되게 만들다", en: "Making verified account trading legible on screen" }, category: "product-web", year: "2026", client: "OVERTAKE" },
  { slug: "overtake-quest", name: "Quest Platform", tagline: { ko: "퀘스트를 끝낼수록 자격이 쌓이는 것을 보이게 하다", en: "Showing eligibility accumulate as quests are completed" }, category: "product-web", year: "2024", client: "OVERTAKE", liveUrl: "https://airdrop.overtake.world/landing" },
  { slug: "overtake-quest-market", name: "Quest Platform Marketplace", tagline: { ko: "수집품을 찾아낼 수 있게 만든 거래 화면", en: "A trading surface built so collectibles can be found" }, category: "product-web", year: "2024", client: "OVERTAKE", liveUrl: "https://market.overtake.world/project-drops/SOMNIS?tab=trade" },
  { slug: "overtake-design-system", name: "OVERTAKE Design System", tagline: { ko: "제품이 커져도 무너지지 않는 부품과 변수를 두다", en: "Components and variables that hold as the product grows" }, category: "design-system", year: "2025", client: "OVERTAKE", featured: true },
  { slug: "overtake-brand", name: "Brand Identity", tagline: { ko: "브랜드가 무엇을 말하는지를 규칙으로 적다", en: "Writing down what the brand says, as rules" }, category: "brand", year: "2025", client: "OVERTAKE" },
  { slug: "stakehouse", name: "Stakehouse", tagline: { ko: "복잡한 규칙을 사용자가 읽을 수 있는 화면으로", en: "Turning protocol rules into something a person can read" }, category: "product-web", year: "2025", liveUrl: "https://stakehouse.fun/" },
  { slug: "tiktem", name: "tiktem.gg", tagline: { ko: "판매자가 자기 상점을 갖고 구매자와 직접 말하는 장터", en: "A marketplace where sellers keep a shop and talk to buyers directly" }, category: "product-web", year: "2025" },
  { slug: "shadcn-figma", name: "shadcn/ui Figma Design System", tagline: { ko: "웹 부품을 디자인 원시 요소로 옮겨 온 라이브러리", en: "A library translating web components into design primitives" }, category: "design-system", year: "2025" },
  { slug: "tailwind-figma", name: "Tailwind CSS Figma Library", tagline: { ko: "유틸리티 규약을 그대로 옮긴 디자인 부품 라이브러리", en: "A design component library mirroring the utility conventions" }, category: "design-system", year: "2024" },
  { slug: "bora-project", name: "BORA Project", tagline: { ko: "블록체인 디지털 콘텐츠 플랫폼", en: "A blockchain digital content platform" }, category: "app-ui", year: "2019", client: "BORA" },
  { slug: "bora-atoll", name: "BORA Atoll", tagline: { ko: "파트너사가 자기 서비스를 직접 붙이고 운영하는 관리 공간", en: "Where partners connect and operate their own services" }, category: "app-ui", year: "2019", client: "BORA" },
  { slug: "bora-lagoon", name: "BORA Lagoon", tagline: { ko: "개발자를 위해 연 오픈 테스트넷", en: "An open testnet for developers" }, category: "app-ui", year: "2019", client: "BORA" },
  { slug: "bora-island-wallet", name: "BORA Island Wallet", tagline: { ko: "블록체인 디지털 콘텐츠 플랫폼의 모바일 지갑", en: "The mobile wallet for a blockchain digital content platform" }, category: "app-ui", year: "2019", client: "BORA" },
  { slug: "bora-makers", name: "BORA Makers", tagline: { ko: "수집품 장터의 설계 시안", en: "A design concept for a collectibles marketplace" }, category: "app-ui", year: "2021", client: "BORA" },
  { slug: "bora-scope", name: "BORA Scope", tagline: { ko: "체인 위에서 일어난 일을 누구나 찾아볼 수 있게", en: "Making what happened on the chain searchable by anyone" }, category: "app-ui", year: "2022", client: "BORA" },
  { slug: "bora-2-guide", name: "BORA 2.0 GUIDE", tagline: { ko: "플랫폼이 무엇을 주는지 설명하는 안내 화면", en: "The guide surface explaining what the platform offers" }, category: "app-ui", year: "2022", client: "BORA" },
  { slug: "bora-2-renewal", name: "BORA 2.0 Renewal Concept", tagline: { ko: "BORA 2.0 의 리뉴얼 컨셉", en: "A renewal concept for BORA 2.0" }, category: "concept", year: "2022", client: "BORA" },
  { slug: "play2bit", name: "Play2bit", tagline: { ko: "글로벌 게임 플랫폼", en: "A global game platform" }, category: "product-web", year: "2021", client: "Play2bit" },
  { slug: "play2bit-membership", name: "Play2bit Membership", tagline: { ko: "글로벌 게임 플랫폼의 계정 화면", en: "The account surface of a global game platform" }, category: "product-web", year: "2021", client: "Play2bit" },
  { slug: "play2bit-app", name: "Play2bit App", tagline: { ko: "글로벌 게임 플랫폼의 앱", en: "The app for a global game platform" }, category: "app-ui", year: "2021", client: "Play2bit" },
  { slug: "moida", name: "MOIDA UX/UI Design", tagline: { ko: "게임 생활의 과거와 현재와 미래를 한자리에 모으다", en: "Gathering the past, present, and future of game life in one place" }, category: "app-ui", year: "2023" },
  { slug: "naoda-ui", name: "NAODA UI Design", tagline: { ko: "참여가 곧 자격이 되는 게임 플랫폼", en: "A platform where participation is the qualification" }, category: "app-ui", year: "2022" },
  { slug: "naoda-concept", name: "NAODA Concept Design", tagline: { ko: "참여가 곧 자격이 되는 플랫폼의 디자인 시스템과 마켓플레이스 프로토타입", en: "The design system and marketplace prototype for a platform where participation becomes eligibility" }, category: "concept", year: "2022" },
  { slug: "metapick", name: "MetaPick Concept Design", tagline: { ko: "METAPICK 디자인 시스템", en: "The METAPICK design system" }, category: "concept", year: "2021" },
  { slug: "spera-luckydaybet", name: "Spera - LuckyDayBet", tagline: { ko: "스테이블코인으로 입출금하는 게이밍 플랫폼", en: "A gaming platform with stablecoin deposits and withdrawals" }, category: "product-web", year: "2022" },
  { slug: "todayis", name: "Todayis", tagline: { ko: "오늘을 기록하고 디지털 자산으로 보관하다", en: "Recording today and keeping it as a digital asset" }, category: "app-ui", year: "2022" },
];

export const CANVAS_BASE = "https://portfolio.brainchild.kr";
export const canvasUrl = (lang: Lang, slug: string) => `${CANVAS_BASE}/${lang}/work/${slug}`;
