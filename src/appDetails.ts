// 앱 상세(/apps/:slug) 본문. 사실은 각 프로젝트 레포와 진행 기록에서 옮겼다. 숫자를 지어내지 않는다.
import { isHiddenApp } from "./hidden.ts";
export type AppDetail = {
  slug: string;
  name: string; // APPS 의 name 과 같아야 한다
  title: string; // 글 제목
  dek: string; // 제목 아래 한두 줄
  date: string;
  meta: { label: string; value: string }[];
  stack: string[];
  sections: { heading: string; body: string[] }[];
  shots: string[]; // public/apps/<slug>/ 아래 화면들. 비어 있으면 카드 화면 하나만 쓴다
};

const ALL_APP_DETAILS: AppDetail[] = [
  {
    slug: "seoul-boom",
    name: "Seoul Boom",
    title: "Telling travelers where Seoul is quiet, right now",
    dek: "A crowd-level app for visitors, built on the city's open real-time data and shipped to the iPhone with widgets and alerts.",
    date: "Sep 2026",
    meta: [
      { label: "Role", value: "Design and build, solo" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "Live, App Store in review prep" },
    ],
    stack: ["React", "TypeScript", "Capacitor", "WidgetKit", "APNs", "Upstash", "Leaflet"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Seoul publishes live crowd levels for its busiest places, but only as a Korean data API. Travelers who would benefit most never see it.",
          "The app picks 18 places a visitor actually goes to and answers one question for each: is it easy to visit now, or crowded?",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A server function normalizes the city API and caches it for a minute, since the browser cannot call it directly. The same code runs in local dev and on Vercel.",
          "On top of that: a map with clay pins and a 12-hour forecast slider, a Plan tab with suggested routes and opening hours, indoor picks when it rains or the air is bad, and a Korean phrase card for each situation.",
          "The iPhone app wraps the same React code with Capacitor, then adds what a website cannot: home and lock screen widgets, and a push alert when a place you are watching turns quiet. A scheduler checks every 10 minutes and sends through APNs. The alert was tested end to end and arrived on a real iPhone and Apple Watch.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "No emoji anywhere. Every place and route got a clay illustration, UI icons moved to one icon set, and a mascot, Boomchi, shows the crowd level in four expressions, so the app reads as one product.",
          "Station and bike-share names are shown in English first with Korean below, so a traveler can match the sign in front of them. All 44 stations and 117 bike-share stops across the 18 places were checked, with none missing.",
        ],
      },
    ],
    shots: ["/apps/seoul-boom/map.png", "/apps/seoul-boom/plan.png", "/apps/seoul-boom/korean.png"],
  },
  {
    slug: "runpop",
    name: "Runpop",
    title: "A metronome that keeps your playlist",
    dek: "One quiet click per step, laid over the music you already run to. Native on iPhone and Apple Watch.",
    date: "Sep 2026",
    meta: [
      { label: "Role", value: "Design and build, solo" },
      { label: "Platform", value: "iOS + watchOS, native" },
      { label: "Status", value: "On device, App Store prep" },
    ],
    stack: ["SwiftUI", "watchOS", "HealthKit", "Live Activities", "WidgetKit", "XcodeGen"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Cadence apps usually replace your music with a beat. Runners who train by steps per minute still want their own playlist.",
          "Runpop adds a single click per step on top of whatever is playing, and lets the target cadence change across a run as a plan.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A native iPhone app with run plans, four click sounds, pause and resume, a summary, and a history with per-run detail: heart rate, cadence, stride, pace, and splits. 46 tests pass.",
          "An Apple Watch app that can run on its own, with complications and a widget extension, plus a Live Activity on the phone that shows the current segment of the plan.",
          "Workouts are saved to the Health app from the watch, and the phone reads heart rate and calories back from HealthKit.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The running screen shows only the target, not live measurements. Measured cadence lives in the history, where it is useful instead of distracting.",
          "On the phone the click sits over your music, and on the watch the beat is a vibration. Matching the tempo of a track is left out, because Apple Music does not give out BPM.",
          "Screens and widgets were designed first as a web canvas, reviewed, then rebuilt natively, so design review never waited on a simulator.",
          "The run detail with heart rate came from tester feedback: the first history had no measured cadence and no detail screen.",
        ],
      },
    ],
    shots: ["/apps/runpop/running.png", "/apps/runpop/plan.png", "/apps/runpop/detail.png", "/apps/runpop/watch.png"],
  },
  {
    slug: "ttokuoka",
    name: "Ttokuoka",
    title: "A Fukuoka trip that still works offline",
    dek: "A Korean-language companion for Fukuoka, where Koreans were 57.3% of foreign arrivals in 2024: food, shopping, phrases, tax-free help, and the last train home.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Research, design, and build" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "On device, for a trip in late November" },
    ],
    stack: ["React", "TypeScript", "Capacitor", "Service worker", "Vercel functions"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Koreans are the largest group of foreign visitors to Fukuoka, and many go back again and again: 46.3% of Koreans who travel to Japan have been five or more times. The tools they use are built for booking, not for the evening itself.",
          "Research narrowed it down: where to eat tonight (94 operating yatai stalls, counted from the city's open data), what is open, how to get back to the hotel, and how the tax-free refund works once the system changes on November 1, 2026.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Four tabs: Today, Stores (food and shopping), Log, and Guide (phrases and info). Yatai street stalls come from the city's open data, with an open-tonight estimate from regular hours and the night's rain chance.",
          "A trip screen for dates and flights, a three-day forecast, the nearest station's last train, a show-the-driver card with an Uber link, and a tax-free receipt tracker with a departure-day checklist.",
          "The Log tab keeps the trip day by day, with places and what you spent, shared with the tax-free receipts. A departure-day mode for Incheon reads the airport's passenger forecast and live departure-hall waits, and works out when to leave.",
          "A service worker keeps the main screens and viewed map tiles available offline, and the same build ships as an iPhone app.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "It started as a personal tool for one trip, then turned general: a default home that works with no plan, and your own itinerary on top.",
          "It shares a visual system with Seoul Boom, so the two read as a series: clay illustrations per category and a mascot of its own.",
        ],
      },
    ],
    shots: ["/apps/ttokuoka/food.png", "/apps/ttokuoka/shop.png", "/apps/ttokuoka/words.png", "/apps/ttokuoka/info.png"],
  },
  {
    slug: "carenote",
    name: "Carenote",
    title: "A hospital app that knows what visit day is like",
    dek: "A redesign of a university hospital's patient app, built around one kidney transplant patient: the visit day, the immunosuppressant clock, and the numbers that matter.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Research, design, and build" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "Prototype, on device" },
    ],
    stack: ["React", "TypeScript", "Capacitor", "PWA", "Hand-drawn SVG charts"],
    sections: [
      {
        heading: "Why I made it",
        body: [
          "I use a university hospital's patient app myself. Every visit I ran into the same friction, so I wrote down what got in the way and rebuilt the app with those fixes applied.",
          "The patient in the demo is made up; the problems below come from real use.",
        ],
      },
      {
        heading: "The problem",
        body: [
          "The existing app opened on a promotion banner and a grid of icons. The next appointment hid behind a floating button, and visit notes were raw record text that buried the one thing to do, like a blood draw two hours before the visit.",
          "Lab results cut off test names, mixed languages, and drew trends without clear ranges. Nothing guided a patient through the day itself: blood draw, wait, doctor, payment, pharmacy.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Five tabs: home, schedule, tests, meds, and records. Home leads with the next visit, a countdown, and a checklist of what to prepare.",
          "A visit-day mode that steps through check-in, blood draw, waiting, the doctor, payment, and the pharmacy, with a live queue count and a floor map for each step.",
          "Kidney function first on the tests tab, with each value placed on its reference range. An immunosuppressant clock on the meds tab, and a reminder that the morning dose waits until after the blood draw.",
          "Every string ships in Korean and English, every date is relative to today so the demo always reads true, and the same build installs on an iPhone with Capacitor.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The hospital, the patient, and every number are made up. No real hospital name, logo, or record appears anywhere in the public build or the screens.",
          "Outpatient, inpatient, and emergency stopped being separate sections and became filter chips on one record list, which removed three copies of the same data.",
        ],
      },
    ],
    shots: ["/apps/carenote/visit.png", "/apps/carenote/meds.png", "/apps/carenote/labs.png", "/apps/carenote/schedule.png"],
  },
  {
    slug: "ppopjido",
    name: "Ppopjido",
    title: "Finding the series that is still in stock",
    dek: "A user-reported map for capsule prizes and Pokemon cards in Korea and Japan, searched by series name.",
    date: "Sep 2026",
    meta: [
      { label: "Role", value: "Design and build, solo" },
      { label: "Platform", value: "Web" },
      { label: "Status", value: "Live" },
    ],
    stack: ["React", "TypeScript", "Leaflet", "OpenStreetMap"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Collectors know the series they want, not the shop. Existing maps list products and prices, but not whether anything is left.",
          "So the product is about stock: search a series, see which shops still have it, and report what you found.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Series search across 41 series, a shop map, and three kinds of items, with cards carrying in-stock, sold-out, and a per-person limit.",
          "A tab bar that folds to icons while you scroll, and a mascot used on the sign-in banner and as the map pin.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "Scope was cut on purpose to prize lotteries and Pokemon cards, in Korea and Japan, after finding that product and price listings already existed elsewhere.",
          "The map moved to OpenStreetMap tiles, which need no key or billing account and work in both countries.",
        ],
      },
    ],
    shots: ["/apps/ppopjido/map.png", "/apps/ppopjido/report.png", "/apps/ppopjido/me.png"],
  },
  {
    slug: "tory",
    name: "Tory",
    title: "A couple app, redrawn from a 2013 plan",
    dek: "An old proposal of mine, rethought for today: one shared thread of moments, and a date mode that runs while you are together.",
    date: "Sep 2026",
    meta: [
      { label: "Role", value: "Product, design, and build" },
      { label: "Platform", value: "Web prototype, iPhone planned" },
      { label: "Status", value: "Prototype" },
    ],
    stack: ["React", "TypeScript", "Design canvas"],
    sections: [
      {
        heading: "The problem",
        body: [
          "The social-network style of couple app has faded. What people use now are small rituals and widgets.",
          "None of the apps I looked at recorded the date itself. That became the center: start a date, see the time together, say goodbye, and get a recap card.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A full screen design as a living canvas inside the repo, real React frames on pannable pages, before any production code.",
          "A working prototype with a shared timeline, the date flow from start to recap, and the moment the two of you first connected.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The thread is the brand. Two strands, one for each person, and the logo is a heart wound from yarn.",
          "The first skin felt dated, so the direction moved to a calm minimal look. Later skins felt like too much, so I took back only the parts of the 2013 design that still carried meaning and settled on a knit-clay yarn ball in ink and vermilion, set in Manrope and Noto Sans KR with no serif. That tone is now in the app and the design canvas.",
        ],
      },
    ],
    shots: ["/apps/tory/connect.png", "/apps/tory/date.png", "/apps/tory/widgets.png"],
  },
  {
    slug: "bapsim",
    name: "Bapsim",
    title: "Logging a Korean meal the way it is served",
    dek: "Rice, soup, and sides on one tray. Four taps, and you have carbs, protein, fat, and sodium for the day.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Product, design, and build" },
      { label: "Platform", value: "Web, app planned" },
      { label: "Status", value: "In design" },
    ],
    stack: ["React", "TypeScript", "Design canvas"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Most nutrition apps assume a plate of separate items. A Korean meal is a tray: one bowl of rice, a soup or stew, and several shared sides.",
          "Bapsim starts from that tray, so logging matches how the meal is actually laid out.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A 13-screen design canvas covering first use, today, the menu, records, and a coach, with daily targets calculated from goal, height, weight, and activity.",
          "The app shell with a tab bar and a center add button, ready for the first real feature set.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The coach starts as written guidance, not a live model, so it can ship without an AI dependency.",
          "Tokens and components are kept separate from the food domain, so the same interface can later carry sleep, water, or running.",
        ],
      },
    ],
    shots: ["/apps/bapsim/today.png", "/apps/bapsim/menu.png", "/apps/bapsim/records.png", "/apps/bapsim/coach.png"],
  },
  {
    slug: "wishrun",
    name: "Wishrun",
    title: "A race plan that knows what today is",
    dek: "A seven-week training plan for a first 5K came as a PDF. The app keeps the plan word for word and adds what a PDF cannot: today's session, the week you are in, and how the runs are trending.",
    date: "Aug 2026",
    meta: [
      { label: "Role", value: "Product, design, and build" },
      { label: "Platform", value: "iOS, Apple Health" },
      { label: "Status", value: "Personal build" },
    ],
    stack: ["Expo", "React Native", "TypeScript", "HealthKit"],
    sections: [
      {
        heading: "The problem",
        body: [
          "The plan for a 5K race in Hanam arrived as a PDF: seven weeks of sessions by day, heart-rate zones, two gym routines, and race-day checklists.",
          "A PDF cannot tell you which day it is, which week you are in, or whether your runs are actually getting easier.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Ten screens on one source. The plan text lives in a single file and is never reworded. The week and the countdown are computed from today's date.",
          "Today's session with its heart-rate zone, a seven-week card stack, the gym routines with a minimum version, a race checklist and timeline, and a trend page drawing planned against actual distance, pace, and heart rate.",
          "Runs come in from Apple Health, read only, matched by date.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The web build was removed. Apple Watch data cannot be reached from Safari, so the web version was always half the app.",
          "Runs outside the plan count toward pace and heart rate but not toward the weekly distance bars. Those bars measure keeping to the plan, and counting extra runs would make a missed week look kept.",
          "On a day with two runs, only the longer one is used. Merging them would average two different workouts into a pace that means nothing. Entries typed by hand are never overwritten by a sync.",
          "Only the style was borrowed from an airline UI kit: color, type, radius, and the language of its cards. The screens themselves are original.",
        ],
      },
    ],
    shots: [],
  },
  {
    slug: "finishline",
    name: "Finishline",
    title: "Any race, planned backward from race day",
    dek: "Wishrun was built for one race. Finishline turns the plan into data: pick an event and a date, say how far you run today and which days you are free, and it writes the weeks between now and the start line.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Product, design, and build" },
      { label: "Platform", value: "iOS, Apple Health" },
      { label: "Status", value: "In progress" },
    ],
    stack: ["Expo", "React Native", "TypeScript", "HealthKit"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Wishrun kept one PDF plan word for word, so it only worked for one 5K. Signing up for another race meant writing a new app.",
          "Most people do not have a coach's plan at all. They have a race, a date, and a guess about how far they can run now.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A three-step onboarding: the race and its date, your current long run, and the days you can train. Races come from a public race calendar, searchable by name, region, or venue, with open registration listed first.",
          "A plan generator for 5K, 10K, 15K, and the half. It starts on the day you save or the next Monday, runs up to sixteen weeks, and grows the long run by no more than ten percent a week toward a peak.",
          "Two goals. Finish keeps three easy runs a week. A time goal adds a fourth day with intervals and tempo, and every pace is derived from the target time.",
          "More than one race. A spring half and an autumn 10K can sit side by side, each with its own checks and logs. Once race day passes, it moves to past races with the finish time, pace, sessions done, and distance trained.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The original Wishrun plan stays in the app as the sample, unchanged. The screens read one plan object, so the generated plan and the hand-written one look the same.",
          "Longer plans get a recovery week every fourth week, and races of 10K and up get a one-week taper only when there are nine weeks or more. When time is short, the peak comes down and the plan says so, instead of cramming.",
          "Intervals and tempo start in week three. The first two weeks are easy running only.",
          "Progress belongs to a race, not to the app. A session id like week 3 Tuesday means a different workout in another plan, so switching races shelves the current one with all its checks and brings the other back as it was.",
          "The finish time is just the log on the race session. There is no separate result form; the record screen reads what you already entered on race day.",
        ],
      },
    ],
    shots: ["/apps/finishline/today.png", "/apps/finishline/calendar.png", "/apps/finishline/races.png", "/apps/finishline/past-race.png"],
  },
];

export const APP_DETAILS: AppDetail[] = ALL_APP_DETAILS.filter((d) => !isHiddenApp(d.slug));
