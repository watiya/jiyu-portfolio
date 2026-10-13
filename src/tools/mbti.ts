// 성향 검사. 문항 20개(축마다 5개), 5점 척도. 점수는 축마다 앞 글자 쪽 비율(0~100)로 둔다.
// 결과는 유형 설명과 함께 이 사이트의 다이얼 값으로 이어진다. 그게 brainchild 다운 끝맺음이다.
import type { Lang } from "../i18n/lang.ts";
import type { Dials } from "../tokens/engine.ts";

export type Axis = "EI" | "SN" | "TF" | "JP";
export const AXES: Axis[] = ["EI", "SN", "TF", "JP"];
export type Question = { axis: Axis; dir: 1 | -1; text: Record<Lang, string> };

// dir 1: 동의할수록 앞 글자(E·S·T·J). dir -1: 동의할수록 뒷 글자
export const QUESTIONS: Question[] = [
  { axis: "EI", dir: 1, text: { ko: "사람들과 있다가 집에 오면 에너지가 채워져 있다.", en: "After time with people, I come home with more energy." } },
  { axis: "EI", dir: -1, text: { ko: "말하기 전에 머릿속에서 문장을 끝까지 만들어 본다.", en: "I finish the sentence in my head before I say it." } },
  { axis: "EI", dir: 1, text: { ko: "처음 보는 사람에게 먼저 말을 거는 편이다.", en: "I am usually the one who speaks first to a stranger." } },
  { axis: "EI", dir: -1, text: { ko: "주말 계획이 비어 있으면 안심이 된다.", en: "An empty weekend is a relief." } },
  { axis: "EI", dir: 1, text: { ko: "생각은 말로 꺼내면서 정리된다.", en: "My thoughts get sorted by saying them out loud." } },
  { axis: "SN", dir: 1, text: { ko: "설명은 예시와 숫자가 있어야 믿음이 간다.", en: "An explanation needs examples and numbers before I trust it." } },
  { axis: "SN", dir: -1, text: { ko: "지금 일보다 그 일이 어디로 이어질지가 먼저 보인다.", en: "I see where a thing leads before I see the thing itself." } },
  { axis: "SN", dir: 1, text: { ko: "해 본 방법이 있으면 그대로 다시 한다.", en: "If a method worked before, I use it again as is." } },
  { axis: "SN", dir: -1, text: { ko: "비유로 말하는 게 편하다.", en: "I find it easy to speak in metaphors." } },
  { axis: "SN", dir: 1, text: { ko: "설명서는 처음부터 순서대로 읽는다.", en: "I read the manual from the start, in order." } },
  { axis: "TF", dir: 1, text: { ko: "결정할 때 기분보다 근거를 먼저 본다.", en: "When deciding, I look at the reasons before the feelings." } },
  { axis: "TF", dir: -1, text: { ko: "맞는 말이라도 상대가 상할 것 같으면 돌려 말한다.", en: "Even when I am right, I soften it if it might hurt." } },
  { axis: "TF", dir: 1, text: { ko: "피드백은 직설적인 쪽이 고맙다.", en: "I prefer feedback that is blunt." } },
  { axis: "TF", dir: -1, text: { ko: "분위기가 가라앉으면 내가 먼저 느낀다.", en: "When the mood drops, I feel it first." } },
  { axis: "TF", dir: 1, text: { ko: "공정한 것이 친절한 것보다 중요하다.", en: "Being fair matters more than being kind." } },
  { axis: "JP", dir: 1, text: { ko: "일정이 정해져 있어야 마음이 편하다.", en: "I am at ease when the schedule is fixed." } },
  { axis: "JP", dir: -1, text: { ko: "마감 직전에 집중이 가장 잘 된다.", en: "I focus best right before the deadline." } },
  { axis: "JP", dir: 1, text: { ko: "할 일 목록을 지우는 것이 즐겁다.", en: "Crossing items off a list is a pleasure." } },
  { axis: "JP", dir: -1, text: { ko: "계획이 바뀌어도 크게 불편하지 않다.", en: "A change of plan does not bother me much." } },
  { axis: "JP", dir: 1, text: { ko: "여행은 예약을 끝내 놓고 떠난다.", en: "I leave for a trip with the bookings already done." } },
];

export type MbtiResult = { type: string; percent: Record<Axis, number> };

/** answers[i] 는 1~5. 빠진 답은 3(보통)으로 본다 */
export function scoreMbti(answers: (number | undefined)[]): MbtiResult {
  const sum: Record<Axis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
  const n: Record<Axis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
  QUESTIONS.forEach((q, i) => {
    const v = answers[i] ?? 3;
    sum[q.axis] += (v - 3) * q.dir;
    n[q.axis] += 1;
  });
  const percent = Object.fromEntries(AXES.map((a) => [a, Math.round(50 + (sum[a] / (2 * n[a])) * 50)])) as Record<Axis, number>;
  const type = AXES.map((a) => (percent[a] >= 50 ? a[0] : a[1])).join("");
  return { type, percent };
}

export const encodeMbti = (r: MbtiResult) => `m${r.type}.${AXES.map((a) => r.percent[a]).join("-")}`;
export function decodeMbti(code: string): MbtiResult | null {
  const m = /^m([EI][SN][TF][JP])\.(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})$/.exec(code);
  if (!m) return null;
  const vals = [m[2], m[3], m[4], m[5]].map(Number);
  if (vals.some((v) => v < 0 || v > 100)) return null;
  const percent = Object.fromEntries(AXES.map((a, i) => [a, vals[i]])) as Record<Axis, number>;
  const type = AXES.map((a) => (percent[a] >= 50 ? a[0] : a[1])).join("");
  return type === m[1] ? { type, percent } : null;
}

type Text = Record<Lang, string>;
export const TYPES: Record<string, { name: Text; line: Text }> = {
  INTJ: { name: { ko: "조용한 설계자", en: "The quiet architect" }, line: { ko: "큰 그림을 먼저 그리고, 그 안에서 혼자 오래 밀고 갑니다. 기준이 분명해서 설득보다 결과로 말합니다.", en: "Draws the big picture first, then pushes alone for a long time. Clear standards; speaks through results, not persuasion." } },
  INTP: { name: { ko: "원리를 캐는 사람", en: "The principle digger" }, line: { ko: "왜 그런지가 풀릴 때까지 파고듭니다. 정답보다 모형이 중요하고, 마감은 그다음입니다.", en: "Digs until the why comes loose. The model matters more than the answer; the deadline comes after." } },
  ENTJ: { name: { ko: "방향을 정하는 사람", en: "The direction setter" }, line: { ko: "목표가 보이면 길을 그리고 사람을 움직입니다. 속도가 빠르고, 느린 것을 참기 어려워합니다.", en: "Once the goal is visible, draws the route and moves people. Fast, and impatient with slow." } },
  ENTP: { name: { ko: "질문을 던지는 사람", en: "The question thrower" }, line: { ko: "당연한 것을 뒤집어 보는 데서 힘이 납니다. 아이디어는 넘치고, 끝맺음은 다른 손을 빌립니다.", en: "Energized by turning the obvious over. Ideas overflow; finishing borrows other hands." } },
  INFJ: { name: { ko: "조용히 읽는 사람", en: "The quiet reader" }, line: { ko: "사람과 상황의 결을 먼저 읽고, 뜻이 맞는 일에만 깊이 들어갑니다. 겉은 차분하고 안은 단단합니다.", en: "Reads the grain of people and situations first, going deep only where meaning fits. Calm outside, firm inside." } },
  INFP: { name: { ko: "자기 기준이 있는 사람", en: "The inner compass" }, line: { ko: "옳다고 느끼는 방향이 분명하고, 그 방향에서는 느리지만 멈추지 않습니다. 말보다 글이 편합니다.", en: "Knows which way feels right, slow but unstopping in that direction. Writing comes easier than speaking." } },
  ENFJ: { name: { ko: "사람을 세우는 사람", en: "The people builder" }, line: { ko: "다른 사람이 잘되는 장면을 먼저 봅니다. 분위기를 만들고 끌어 주지만, 자기 몫은 뒤로 미룹니다.", en: "Sees others doing well before anything else. Builds the mood and pulls people along; own share comes last." } },
  ENFP: { name: { ko: "불을 옮기는 사람", en: "The spark carrier" }, line: { ko: "가능성이 보이면 먼저 뛰어들고 주변에 옮깁니다. 시작이 많고, 고르는 일이 숙제입니다.", en: "Jumps first when possibility shows, and passes it around. Many starts; choosing is the homework." } },
  ISTJ: { name: { ko: "약속을 지키는 사람", en: "The promise keeper" }, line: { ko: "정해진 것을 정해진 대로 끝냅니다. 기록이 정확하고, 바뀌는 규칙에는 시간이 필요합니다.", en: "Finishes what was set, the way it was set. Accurate records; changing rules take time." } },
  ISFJ: { name: { ko: "뒤에서 챙기는 사람", en: "The quiet caretaker" }, line: { ko: "필요한 것을 말하기 전에 준비해 둡니다. 꾸준하고 세심하며, 티 내는 일은 서툽니다.", en: "Prepares what is needed before it is asked. Steady and attentive; poor at taking credit." } },
  ESTJ: { name: { ko: "판을 정리하는 사람", en: "The organizer" }, line: { ko: "흩어진 것을 역할과 순서로 묶습니다. 결정이 빠르고 책임을 피하지 않으며, 애매함을 싫어합니다.", en: "Ties loose things into roles and order. Quick to decide, never dodges responsibility, dislikes vagueness." } },
  ESFJ: { name: { ko: "자리를 만드는 사람", en: "The host" }, line: { ko: "모두가 편한 자리를 먼저 만듭니다. 기억력이 좋고 챙김이 구체적이며, 갈등이 길어지면 지칩니다.", en: "Makes a place where everyone is at ease. Good memory, concrete care; long conflict wears it down." } },
  ISTP: { name: { ko: "손으로 푸는 사람", en: "The hands-on fixer" }, line: { ko: "설명보다 직접 만져 보고 고칩니다. 말이 적고 판단이 빠르며, 묶이는 것을 싫어합니다.", en: "Touches and fixes before explaining. Few words, quick judgment, dislikes being tied down." } },
  ISFP: { name: { ko: "감각으로 사는 사람", en: "The sense dweller" }, line: { ko: "지금 눈앞의 색과 결을 즐깁니다. 조용히 자기 방식으로 만들고, 평가받는 일은 피합니다.", en: "Enjoys the color and texture right in front. Makes things quietly its own way, avoids being judged." } },
  ESTP: { name: { ko: "지금 움직이는 사람", en: "The mover" }, line: { ko: "생각보다 행동이 먼저고, 현장에서 가장 빠릅니다. 위험을 즐기고 긴 계획은 지루해합니다.", en: "Acts before thinking, fastest on the spot. Enjoys risk, bored by long plans." } },
  ESFP: { name: { ko: "장면을 밝히는 사람", en: "The scene lighter" }, line: { ko: "있는 자리를 환하게 만듭니다. 사람과 경험을 좋아하고, 혼자 오래 하는 일은 힘이 빠집니다.", en: "Brightens whatever room it is in. Loves people and experience; long solo work drains it." } },
};

export const AXIS_META: Record<Axis, { left: Record<Lang, string>; right: Record<Lang, string> }> = {
  EI: { left: { ko: "외향 E", en: "E · Extravert" }, right: { ko: "내향 I", en: "I · Introvert" } },
  SN: { left: { ko: "감각 S", en: "S · Sensing" }, right: { ko: "직관 N", en: "N · Intuition" } },
  TF: { left: { ko: "사고 T", en: "T · Thinking" }, right: { ko: "감정 F", en: "F · Feeling" } },
  JP: { left: { ko: "판단 J", en: "J · Judging" }, right: { ko: "인식 P", en: "P · Perceiving" } },
};

/** 유형 → 이 사이트의 다이얼. 기질(NT·NF·SJ·SP)이 색조를, 나머지 글자가 모서리·온도·모션·서체를 정한다 */
export function dialsOf(type: string): Partial<Dials> {
  const [e, s, t, j] = type.split("");
  const temperament = s === "N" ? (t === "T" ? "NT" : "NF") : j === "J" ? "SJ" : "SP";
  const hue = { NT: 265, NF: 325, SJ: 215, SP: 40 }[temperament];
  const pairing = { NT: "grotesk", NF: "editorial", SJ: "geist", SP: "funnel" }[temperament] as Dials["pairing"];
  return { hue, pairing, neutral: t === "T" ? "cool" : "warm", radius: j === "J" ? 8 : 18, motion: e === "E" ? "lively" : "calm", primary: null, secondary: null };
}
