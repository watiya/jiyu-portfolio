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
    stack: ["SwiftUI", "watchOS", "HealthKit", "MapKit", "Core Location", "Live Activities", "WidgetKit", "XcodeGen"],
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
          "A native iPhone app with run plans, four click sounds, pause and resume, a summary, and a history with per-run detail: heart rate, cadence, stride, pace, splits, a route map, and temperature, humidity, elevation gain and running power. 83 tests pass.",
          "An Apple Watch app that can run on its own. Like the built-in Workout app, its running screen has three vertical pages (beat ring / heart rate, live cadence, pace and distance / heart rate zones), and it records its own GPS route and elevation gain. It has complications and a widget extension, plus a Live Activity on the phone that shows the current segment of the plan.",
          "Workouts are saved to the Health app from the watch along with the route, and the phone reads heart rate, calories, route and weather back from HealthKit. There is no server.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The first running screen leads with the target beat, with just live heart rate and distance in one line. Measured cadence, pace and heart rate zones sit one swipe away, where they are useful instead of distracting.",
          "On the phone the click sits over your music, and on the watch the beat is a vibration. Matching the tempo of a track is left out, because Apple Music does not give out BPM.",
          "Screens and widgets were designed first as a web canvas, reviewed, then rebuilt natively, so design review never waited on a simulator.",
          "The run detail with heart rate came from tester feedback: the first history had no measured cadence and no detail screen. After a real run, “heart rate matters as much as cadence” turned the watch screen into three pages, and the watch now records its own route so the map shows up without the Workout app.",
        ],
      },
    ],
    shots: ["/apps/runpop/running.png", "/apps/runpop/detail.png", "/apps/runpop/map.png", "/apps/runpop/watch.png"],
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
      { label: "Platform", value: "iOS, Apple Health, web" },
      { label: "Status", value: "On my phone, web live" },
    ],
    stack: ["Expo", "React Native", "TypeScript", "HealthKit", "Vite"],
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
          "A three-step onboarding: the race and its date, your current long run, and the days you can train. Races come from two public race calendars merged into one list of about two hundred, searchable by name, region, or venue, with open registration listed first.",
          "A plan generator for 5K, 10K, 15K, the half, and the full marathon. It starts on the day you save or the next Monday, runs up to sixteen weeks (twenty for the full), and grows the long run by no more than ten percent a week toward a peak. The full peaks at a 32 km long run with a two-week taper.",
          "Two goals. Finish keeps three easy runs a week. A time goal adds a fourth day with intervals and tempo, and every pace is derived from the target time.",
          "More than one race. A spring half and an autumn 10K can sit side by side, each with its own checks and logs. Once race day passes, it moves to past races with the finish time, pace, sessions done, and distance trained.",
          "A web version and a second app. The same plan data runs in a browser at finishline-mu.vercel.app, and a second React Native app wears that lighter lime look with the first app's tab bar and motion. Both carry a checkered flag logo.",
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
          "One plan engine, three faces. The generator and race list live in a shared folder, so the iOS app, the web app, and the second app all build the same weeks from the same inputs.",
        ],
      },
    ],
    shots: ["/apps/finishline/today.png", "/apps/finishline/calendar.png", "/apps/finishline/races.png", "/apps/finishline/past-race.png"],
  },
  {
    slug: "hangul-boom",
    name: "Hangul Boom",
    title: "Reading Korean before the plane lands",
    dek: "A flight-length course in reading Hangul for visitors to Seoul. Boomchi flies the route as a paper plane, nine stops from Boarding to Landing, with no connection needed.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Product, design, and build" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "On two iPhones, App Store listing drafted" },
    ],
    stack: ["React", "TypeScript", "Vite", "Capacitor", "Motion", "Google Cloud TTS", "Playwright"],
    sections: [
      {
        heading: "The problem",
        body: [
          "A visitor flying to Seoul spends hours with no signal, then lands among signs, menus, and station names they cannot sound out.",
          "The app sets one goal for that flight: read Hangul aloud by the time the plane lands. Meaning, grammar, and conversation are left out on purpose.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Nine stops, from Boarding to Landing, teaching 36 letters (17 vowels and 19 consonants) and 111 words, each word with a picture and a recording you can tap.",
          "Every stop runs the same loop: learn a few letters and why they look the way they do, snap them into syllable blocks, read, flip loanword cards, then a 10-question checkpoint. Eight right opens the next stop, and misses go to a review deck.",
          "On first launch you pick a 2, 5, or 10+ hour flight and the app suggests a pace. The Landing stop reads 13 real Seoul signs, from exits and metro lines to a pharmacy and a money exchange, and ends with an entry stamp.",
          "Four tabs: Flight (the route and the next stop), Chart (the Hangul chart filling in as you learn), Words (a picture word book with a borrowed-from-English filter), and Review.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "Every word at a stop uses only letters taught up to that stop. A self-test checks the whole word list against the curriculum whenever a word is added.",
          "The reward is a loanword. Around Cruise, coffee, pizza, and cheese turn out to be readable, and that moment of finding English inside Korean is what each stop builds toward.",
          "Consonants are recorded and shown as syllables with ㅏ (가, 나), so every letter has something to hear. Romanization sits under each word and can be switched off once you no longer need it.",
          "The interface is English, and Korean appears only in what is being learned. Recordings, fonts, and pictures are bundled, the app makes no network requests, and progress stays on the device.",
          "It shares Seoul Boom's look and its mascot Boomchi, so the two read as one series.",
        ],
      },
    ],
    shots: ["/apps/hangul-boom/map.png", "/apps/hangul-boom/build.png", "/apps/hangul-boom/aha.png", "/apps/hangul-boom/words.png"],
  },
  {
    slug: "menchi-kana",
    name: "Menchi Kana",
    title: "Kana, one subway stop at a time",
    dek: "Hiragana and katakana for Korean travelers headed to Fukuoka, laid out along the city's subway lines. Stroke order is drawn for you, and your own handwriting is checked stroke by stroke.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Research, design, and build" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "On two iPhones, App Store listing drafted" },
    ],
    stack: ["React", "TypeScript", "Vite", "Capacitor", "KanjiVG", "Google Cloud TTS", "Playwright"],
    sections: [
      {
        heading: "The problem",
        body: [
          "The app is for Korean speakers who start from zero kana before a Fukuoka trip. A survey of 13 kana apps found that the mnemonic-heavy ones lean on English words, the Korean ones offer no memory hooks at all, and none practice on what a traveler actually reads: menus, signs, and station names.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Hiragana rides Fukuoka's Airport Line and katakana the Nanakuma Line, 20 stops each. A stop opens once the one before it is passed.",
          "104 characters per script: 46 basic, 20 voiced, 5 semi-voiced, and 33 combined. Each card has the Korean sound, a one-line memory hook in Korean, a recording, and stroke order drawn one stroke at a time with numbers and arrows.",
          "Writing practice in three steps: trace, write from the letter alone, then write into a blank square. Each stroke is checked for order, direction, position, and shape, and a stroke missed twice is shown in color.",
          "Stop quizzes mix letter to sound, sound to letter, look-alike pairs such as か and が, and writing from a sound. A gojūon table lights up learned letters, and a reading page shows 9 hiragana-only phrases and 22 katakana loanwords from menus, signs, and hotels, with letters you have not learned yet dimmed.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "The research first set handwriting grading aside as another app's strength. It came back later in a different form: judged per stroke with the reason shown, using KanjiVG stroke data (CC BY-SA 3.0).",
          "The first pronunciation audio came from macOS voices, which cannot ship in a store app. All of it was regenerated with Google Cloud TTS, and it plays through a small native plugin so the iPhone's silent switch does not mute it.",
          "Fully offline: recordings, fonts, and stroke data are bundled. No account, no server, no permissions, and progress stays on the device.",
          "It is part of the Menchi series with Ttokuoka and Menchi Voca, and Settings opens the sibling apps directly.",
        ],
      },
    ],
    shots: ["/apps/menchi-kana/home.png", "/apps/menchi-kana/card.png", "/apps/menchi-kana/write.png", "/apps/menchi-kana/table.png"],
  },
  {
    slug: "menchi-voca",
    name: "Menchi Voca",
    title: "120 words for one city",
    dek: "The next step after Menchi Kana: Japanese words you will meet in Fukuoka, grouped by scene, read with furigana, and reviewed on a short fixed schedule.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Research, design, and build" },
      { label: "Platform", value: "iPhone app + web" },
      { label: "Status", value: "On two iPhones, App Store listing drafted" },
    ],
    stack: ["React", "TypeScript", "Vite", "Capacitor", "Google Cloud TTS"],
    sections: [
      {
        heading: "The problem",
        body: [
          "Korean JLPT vocabulary apps start from the N5 list and cover kanji with furigana, while travel phrasebooks have no way to practice. Neither is organized around the scenes of a trip.",
          "The goal is narrow: someone who finished Menchi Kana can read 120 words they will meet in Fukuoka and knows what they mean.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Six scenes of 20 words: greetings, food and yatai, convenience store and shopping, transit, hotel, and numbers and time. In each scene the kana-only words come first and the kanji words open after them, 56 and 64 across the app.",
          "Large-type cards with the meaning, an example sentence (119 in all), furigana over kanji, an optional Korean sound line, and a recording.",
          "Two games, pick the meaning and pick what you heard, four choices each. Finishing a scene shows three travel sentences built from its words, 18 in all, such as asking for an extra noodle refill or the bill.",
          "Missed words come back a day later, then after 3 and 7 days, and graduate after that. The full list searches by Japanese, furigana, Korean sound, or meaning.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "Fixed intervals instead of a full spaced-repetition engine. In the research, the biggest complaint in one SRS app's reviews was a morning backlog of over a hundred cards.",
          "Words were taken from the travel phrases already in Ttokuoka plus basic N5 words, and example sentences use those phrases first, so a learned word turns up in a sentence you will actually say.",
          "Kana words before kanji, so the cards build on what Menchi Kana taught. Furigana, the Korean sound line, autoplay, and sound effects each have their own switch.",
          "Offline and private like the rest of the series: audio, fonts, and pictures are bundled, there is no account, and review history stays on the device.",
        ],
      },
    ],
    shots: ["/apps/menchi-voca/home.png", "/apps/menchi-voca/card.png", "/apps/menchi-voca/quiz.png", "/apps/menchi-voca/review.png"],
  },
  {
    slug: "puzzle-lounge",
    name: "Puzzle Lounge",
    title: "Five puzzles for airplane mode",
    dek: "The second version of a small puzzle arcade: five games, one shared way of playing, endless levels, and the series mascots hosting each game.",
    date: "Oct 2026",
    meta: [
      { label: "Role", value: "Design and build, solo" },
      { label: "Platform", value: "iPhone app" },
      { label: "Status", value: "On two iPhones, before store release" },
    ],
    stack: ["React", "TypeScript", "Vite", "Capacitor", "Motion", "Haptics"],
    sections: [
      {
        heading: "The problem",
        body: [
          "The first version, an arcade built around BoomDoku, put a level screen between the hub and every game.",
          "The rewrite is meant for airplane mode and a few spare minutes: one tap on a game card opens a board, with no ads, no login, and no network.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Five puzzles. BoomDoku (one Boomchi in every row, column, and color area, none touching), Minesweeper, Sudoku, Nonogram with 62 hand-drawn pictures, and Metro Link, where stations of the same color are joined.",
          "Every game has an endless level road with six difficulties. The difficulty rises with the level, and difficulties already reached stay open for practice. Every five levels earns a collectible, kept in an album on the Records tab.",
          "Three lives per board, a daily board that is the same for everyone, a streak calendar with badges, and Korean and English.",
          "All five games share one save shape and one play frame (header, lives, tools, fail and result screens), so adding a game means one folder and one line in the registry.",
        ],
      },
      {
        heading: "Decisions worth noting",
        body: [
          "Each game has a fixed host from the series: Boomchi of Seoul for BoomDoku and Sudoku, Menchi of Fukuoka for Minesweeper, Dandi of Busan for Metro Link, and Yenchi of Nha Trang for Nonogram.",
          "Two looks in one app. Everyday screens keep Seoul Boom's off-white with white cards, while the hub and result screens sit on an ink stage.",
          "Owned collectibles follow from the level alone, so saves needed no new field, and an older save receives everything its level has already earned.",
        ],
      },
    ],
    shots: ["/apps/puzzle-lounge/lounge.png", "/apps/puzzle-lounge/boomdoku.png", "/apps/puzzle-lounge/nonogram.png", "/apps/puzzle-lounge/records.png"],
  },
];

export const APP_DETAILS: AppDetail[] = ALL_APP_DETAILS.filter((d) => !isHiddenApp(d.slug));
