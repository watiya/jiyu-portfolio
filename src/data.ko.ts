// data.ts 의 한국어판. 영문 항목과 같은 키(slug, name, company)로 묶는다. 직함·회사 표기는 resume/resume.ko.md 를 따른다.
// 사실은 영문 내용에서만 가져온다. 앱 이름은 영어 그대로, 앱이 쓰는 한국어 이름만 koName 으로 더한다.

export const STEPS_KO: { title: string; body: string }[] = [
  { title: "기준을 찾습니다", body: "지금 기준이 어디에 있고 어디서 갈라졌는지 찾습니다." },
  { title: "경계를 적습니다", body: "프로덕트가 정할 것과 개발이 정할 것을 가릅니다." },
  { title: "시스템을 설계합니다", body: "낱 화면보다 토큰·구조·정책이 먼저입니다." },
  { title: "코드로 짓습니다", body: "화면과 그 기준을 실행되는 코드로 냅니다." },
  { title: "규칙을 검사로 바꿉니다", body: "조용히 지나가던 실패가 크게 울리는 검사가 됩니다." },
];

// 키는 영문 company
export const JOURNEY_KO: Record<string, { role: string; company: string; period: string }> = {
  Starzip: { role: "UX/UI · PM/PO · Design 총괄", company: "Starzip", period: "2026 - 현재" },
  "OVERTAKE Labs": { role: "UI/UX Designer", company: "OVERTAKE Labs", period: "2024 - 2026" },
  Flask: { role: "UI/UX Designer", company: "플래스크", period: "2022 - 2023" },
  "Friends Games / METABORA": { role: "UI/UX Designer", company: "프렌즈게임즈 / 메타보라", period: "2021 - 2022" },
  Way2bit: { role: "UI/UX Designer", company: "Way2bit", period: "2018 - 2021" },
  "TLX PASS": { role: "UI/UX Designer", company: "TLX PASS", period: "2018" },
  Syworks: { role: "Designer", company: "Syworks", period: "2017 - 2018" },
  "Mog Communications": { role: "Designer / Freelancer", company: "Mog Communications", period: "2017" },
  Freelance: { role: "UI/UX Designer", company: "프리랜스", period: "2015 - 2017" },
  SocialApps: { role: "UI/UX Designer", company: "SocialApps", period: "2012 - 2016" },
  "PNP Soft, NSoft": { role: "UI Designer", company: "피앤피소프트 · 엔소프트", period: "2003 - 2011" },
};

export const WRITING_KO: Record<string, { title: string }> = {
  "dials-to-design-md": { title: "토큰을 보여 주는 데서 그치지 않고 가져가게 하기" },
  "wording-as-risk": { title: "동사 하나를 규제 노출로 다루기" },
  "delivery-operations": { title: "출시 일정을 게이트 하나로 접기" },
  "content-studio": { title: "디자이너를 기다리지 않게 도구를 만들기" },
  "canon-and-mirrors": { title: "모든 복제본이 스스로 밝히게 하기" },
};

// 키는 영문 name. koName 은 앱 자체가 쓰는 한국어 이름
export const APPS_KO: Record<string, { koName: string; badge: string; kind: string; note: string; line: string }> = {
  "Seoul Boom": { koName: "서울붐", badge: "운영 중", kind: "여행", note: "iPhone + 웹", line: "서울 주요 장소의 실시간 혼잡도. 위젯과 한산 알림까지." },
  Runpop: { koName: "런팝", badge: "iPhone + Watch", kind: "러닝", note: "iOS + watchOS", line: "음악은 그대로 두고 한 걸음에 한 번 조용히 클릭하는 러닝 메트로놈." },
  Ttokuoka: { koName: "또쿠오카", badge: "최신", kind: "여행", note: "iPhone + 웹", line: "한국어 후쿠오카 길잡이. 야타이, 회화, 면세 도움, 오프라인에서도 됩니다." },
  Carenote: { koName: "케어노트", badge: "iPhone 프로토타입", kind: "건강", note: "iPhone + 웹", line: "이식 환자의 진료일, 약, 검사 추이를 중심으로 다시 설계한 병원 앱." },
  Ppopjido: { koName: "뽑지도", badge: "지도 + 카드", kind: "수집", note: "웹", line: "한국과 일본의 캡슐토이와 포켓몬 카드 지도." },
  Tory: { koName: "토리", badge: "프로토타입", kind: "커플", note: "웹 프로토타입", line: "하나의 실로 이어진 커플 앱. 타임라인과 실시간 데이트 모드." },
  Wishrun: { koName: "위시런", badge: "iPhone + 건강", kind: "러닝", note: "iOS", line: "첫 5km 대회를 위한 7주 플랜을 앱으로. 애플 건강에서 달리기 기록을 읽습니다." },
  Bapsim: { koName: "밥심", badge: "설계 중", kind: "식단", note: "설계 캔버스", line: "한 상 그대로 기록하는 한식 식단. 밥, 국, 반찬을 네 번 탭으로." },
};

// data.ts 의 NOW.items 와 같은 순서
export const NOW_KO: string[] = [
  "11월 말 후쿠오카 여행 전에 또쿠오카를 마무리하고 있습니다",
  "서울붐 App Store 제출을 준비하고 있습니다",
  "런팝을 Apple Watch 실기기로 시험하고 있습니다",
];
