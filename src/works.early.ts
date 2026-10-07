// 2019 이전 작업. 이전 포트폴리오(lib/data.ts 의 archived 묶음 23건)에서 옮겼다. works.ts 는 v4 에서 기계로 뽑는 파일이라 따로 둔다.
// 이름·연도·분류·클라이언트는 원천 그대로다. 예외: TLX PASS 는 이력서 정본(2018.04 - 2018.10)에 맞춰 2018.
// 원천에 설명이 없는 항목은 한 줄 소개를 비워 둔다. 캔버스가 없어서 링크 대신 표지 이미지(/work/early/<slug>.webp)로 열린다.
import type { Lang } from "./i18n/lang.ts";
import type { WorkCategory } from "./works.ts";

export type EarlyWork = {
  slug: string;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  category: WorkCategory;
  year: string;
  client?: Record<Lang, string>;
};

const same = (s: string): Record<Lang, string> => ({ ko: s, en: s });
const none: Record<Lang, string> = { ko: "", en: "" };

export const EARLY_WORKS: EarlyWork[] = [
  { slug: "tlx-pass", name: same("TLX PASS"), tagline: { ko: "새 TLX PASS 프로토타입과 리브랜딩", en: "A new TLX PASS prototype and a rebrand" }, category: "app-ui", year: "2018", client: same("TLX") },
  { slug: "khu-link", name: { ko: "경희대학교 산학협력 플랫폼", en: "KHU LINC+ Industry-Academia Platform" }, tagline: { ko: "사업 카테고리를 아이콘으로 정리하고 공지·뉴스·일정을 한 화면에 모은 메인", en: "A main page with business categories as icons and notices, news and schedule on one screen" }, category: "product-web", year: "2017", client: { ko: "경희대학교", en: "Kyung Hee University" } },
  { slug: "kbsmc-recruit", name: { ko: "강북삼성병원 채용 사이트", en: "Kangbuk Samsung Hospital Careers Site" }, tagline: { ko: "채용 공고, 지원 절차, 인재상, 복리후생을 지원자 동선에 맞춘 사이트", en: "Job posts, application steps and benefits arranged along the applicant's path" }, category: "product-web", year: "2017", client: { ko: "강북삼성병원", en: "Kangbuk Samsung Hospital" } },
  { slug: "cyworks-site", name: { ko: "싸이웍스 홈페이지", en: "Syworks Website" }, tagline: none, category: "product-web", year: "2017", client: { ko: "싸이웍스", en: "Syworks" } },
  { slug: "ioniq-longest-run", name: { ko: "아이오닉 롱기스트런", en: "IONIQ Longest Run" }, tagline: { ko: "달린 거리를 기록하고 순위와 캠페인 진행을 보여주는 러닝 캠페인 앱", en: "A running campaign app that logs distance and shows rankings and campaign progress" }, category: "app-ui", year: "2017", client: { ko: "현대자동차", en: "Hyundai Motor" } },
  { slug: "noto", name: same("Noto"), tagline: { ko: "자연주의 건강 쇼핑몰 녹토", en: "Noto, a naturalist health store" }, category: "brand", year: "2017", client: { ko: "싸이웍스", en: "Syworks" } },
  { slug: "kyungin-wedding-mobile", name: { ko: "경인웨딩 모바일", en: "Kyungin Wedding Mobile" }, tagline: none, category: "app-ui", year: "2017", client: { ko: "싸이웍스", en: "Syworks" } },
  { slug: "kyungin-wedding-web", name: { ko: "경인웨딩 웹", en: "Kyungin Wedding Web" }, tagline: none, category: "product-web", year: "2017", client: { ko: "싸이웍스", en: "Syworks" } },
  { slug: "kyungin-wedding-concept", name: { ko: "경인웨딩 웹 컨셉", en: "Kyungin Wedding Web Concept" }, tagline: none, category: "product-web", year: "2017", client: { ko: "경인웨딩", en: "Kyungin Wedding" } },
  { slug: "adt-safehome-web", name: { ko: "ADT 세이프홈 캡스홈 웹", en: "ADT Safe Home Capshome Web" }, tagline: { ko: "제품 소개, 서비스 안내, 견적, 상담 신청까지 이어지는 원페이지", en: "A one-page flow from product intro and service guide to quote and consultation request" }, category: "product-web", year: "2017", client: { ko: "ADT 캡스", en: "ADT Caps" } },
  { slug: "adt-safehome-mobile", name: { ko: "ADT 세이프홈 캡스홈 모바일", en: "ADT Safe Home Capshome Mobile" }, tagline: { ko: "같은 흐름을 모바일 페이지로 옮긴 것", en: "The same flow as a mobile page" }, category: "app-ui", year: "2017", client: { ko: "ADT 캡스", en: "ADT Caps" } },
  { slug: "ssu-mobile", name: { ko: "숭실대학교 모바일", en: "Soongsil University Mobile" }, tagline: none, category: "app-ui", year: "2017", client: { ko: "숭실대학교", en: "Soongsil University" } },
  { slug: "sungshin-mobile", name: { ko: "성신여자대학교 모바일", en: "Sungshin Women's University Mobile" }, tagline: none, category: "app-ui", year: "2017", client: { ko: "성신여자대학교", en: "Sungshin Women's University" } },
  { slug: "kpu-smart-factory", name: { ko: "한국산업기술대학교 스마트 팩토리 융합학과", en: "KPU Smart Factory Convergence Department" }, tagline: none, category: "product-web", year: "2017", client: { ko: "한국산업기술대학교", en: "Korea Polytechnic University" } },
  { slug: "hanyang-erica", name: { ko: "한양대학교 에리카", en: "Hanyang University ERICA" }, tagline: none, category: "product-web", year: "2017", client: { ko: "한양대학교", en: "Hanyang University" } },
  { slug: "dku-chatbot", name: { ko: "단국대 인공지능 챗봇 다이니", en: "Dankook University AI Chatbot DAANI" }, tagline: none, category: "product-web", year: "2017", client: { ko: "단국대학교", en: "Dankook University" } },
  { slug: "kyungin-dream", name: { ko: "경인드림", en: "Kyungin Dream" }, tagline: none, category: "product-web", year: "2017", client: { ko: "경인여자대학교", en: "Kyungin Women's University" } },
  { slug: "waoz", name: same("Waoz"), tagline: { ko: "야구 애플리케이션", en: "A baseball application" }, category: "app-ui", year: "2017", client: same("SocialApps") },
  { slug: "iparrot", name: same("iParrot"), tagline: { ko: "인플루언서 리포트", en: "An influencer report" }, category: "product-web", year: "2017", client: { ko: "모그커뮤니케이션즈", en: "Mog Communications" } },
  { slug: "honeycomb", name: same("HoneyComb"), tagline: { ko: "허니콤 브랜딩", en: "HoneyComb branding" }, category: "brand", year: "2017", client: { ko: "싸이웍스", en: "Syworks" } },
  { slug: "branding-previous", name: { ko: "브랜딩 작업들", en: "Earlier branding work" }, tagline: none, category: "brand", year: "2017" },
  { slug: "logo-previous", name: { ko: "로고 작업들", en: "Earlier logo work" }, tagline: none, category: "brand", year: "2017" },
  { slug: "app-previous", name: { ko: "이전 앱 작업들", en: "Earlier app work" }, tagline: none, category: "app-ui", year: "2017" },
];
