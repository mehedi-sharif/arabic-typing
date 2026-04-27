import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";
import StatsPage from "./StatsPage";

// ─── Responsive hook ───────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

// ─── Lesson Data ───────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 1,
    title: "الحروف الأولى",
    titleEn: "First Letters",
    description: "Learn the home row keys: ب ت ث ن ي",
    letters: ["ب", "ت", "ث", "ن", "ي"],
    words: ["بنت", "بيت", "ثبت", "نبت", "تين"],
    sentences: ["بنت في بيت", "نبت تين"],
  },
  {
    id: 2,
    title: "حروف جديدة",
    titleEn: "New Letters",
    description: "Learn: ا ل م ك هـ",
    letters: ["ا", "ل", "م", "ك", "ه"],
    words: ["كلام", "ملك", "هلال", "مال", "كلمة"],
    sentences: ["ملك كلام", "هلال مال"],
  },
  {
    id: 3,
    title: "المزيد من الحروف",
    titleEn: "More Letters",
    description: "Learn: س ش ر ز د",
    letters: ["س", "ش", "ر", "ز", "د"],
    words: ["درس", "شمس", "رسم", "زرد", "سرد"],
    sentences: ["درس رسم شمس", "سرد زرد"],
  },
  {
    id: 4,
    title: "حروف إضافية",
    titleEn: "Additional Letters",
    description: "Learn: ع غ ف ق و",
    letters: ["ع", "غ", "ف", "ق", "و"],
    words: ["عقل", "فوق", "غرف", "وقف", "قوس"],
    sentences: ["عقل فوق غرف", "وقف قوس"],
  },
  {
    id: 5,
    title: "حروف متقدمة",
    titleEn: "Advanced Letters",
    description: "Learn: ح خ ص ض ط ظ",
    letters: ["ح", "خ", "ص", "ض", "ط", "ظ"],
    words: ["حصاد", "خطاب", "ضخم", "طبخ", "ظهر"],
    sentences: ["حصاد خطاب ضخم", "طبخ ظهر"],
  },
  {
    id: 6,
    title: "تحدي الكلمات",
    titleEn: "Word Challenge",
    description: "Practice full words with all letters",
    letters: [],
    words: ["مدرسة", "كتاب", "قلم", "حاسوب", "شاشة", "لوحة", "مفتاح", "برنامج"],
    sentences: ["كتاب في مدرسة", "قلم على لوحة", "حاسوب وشاشة"],
  },
];

// ─── Hard Lesson Data (Quran Surahs — no tashkeel for typing) ─────────
const HARD_LESSONS = [
  {
    id: "h1",
    title: "الفاتحة",
    titleEn: "Al-Fatiha",
    description: "The Opening — 7 verses",
    emoji: "📖",
    ayaat: [
      "بسم الله الرحمن الرحيم",
      "الحمد لله رب العالمين",
      "الرحمن الرحيم",
      "مالك يوم الدين",
      "اياك نعبد واياك نستعين",
      "اهدنا الصراط المستقيم",
      "صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين",
    ],
  },
  {
    id: "h2",
    title: "الإخلاص",
    titleEn: "Al-Ikhlas",
    description: "Sincerity — 4 verses",
    emoji: "✨",
    ayaat: [
      "قل هو الله احد",
      "الله الصمد",
      "لم يلد ولم يولد",
      "ولم يكن له كفوا احد",
    ],
  },
  {
    id: "h3",
    title: "الفلق",
    titleEn: "Al-Falaq",
    description: "The Daybreak — 5 verses",
    emoji: "🌅",
    ayaat: [
      "قل اعوذ برب الفلق",
      "من شر ما خلق",
      "ومن شر غاسق اذا وقب",
      "ومن شر النفاثات في العقد",
      "ومن شر حاسد اذا حسد",
    ],
  },
  {
    id: "h4",
    title: "الناس",
    titleEn: "An-Nas",
    description: "Mankind — 6 verses",
    emoji: "👥",
    ayaat: [
      "قل اعوذ برب الناس",
      "ملك الناس",
      "اله الناس",
      "من شر الوسواس الخناس",
      "الذي يوسوس في صدور الناس",
      "من الجنة والناس",
    ],
  },
  {
    id: "h5",
    title: "الكوثر",
    titleEn: "Al-Kawthar",
    description: "Abundance — 3 verses",
    emoji: "🌊",
    ayaat: [
      "انا اعطيناك الكوثر",
      "فصل لربك وانحر",
      "ان شانئك هو الابتر",
    ],
  },
  {
    id: "h6",
    title: "العصر",
    titleEn: "Al-Asr",
    description: "The Declining Day — 3 verses",
    emoji: "⏳",
    ayaat: [
      "والعصر",
      "ان الانسان لفي خسر",
      "الا الذين امنوا وعملوا الصالحات وتواصوا بالحق وتواصوا بالصبر",
    ],
  },
];

// ─── Arabic Keyboard Layout ───────────────────────────────────────────
const KEYBOARD_ROWS = [
  [
    { ar: "ذ", en: "`" }, { ar: "١", en: "1" }, { ar: "٢", en: "2" },
    { ar: "٣", en: "3" }, { ar: "٤", en: "4" }, { ar: "٥", en: "5" },
    { ar: "٦", en: "6" }, { ar: "٧", en: "7" }, { ar: "٨", en: "8" },
    { ar: "٩", en: "9" }, { ar: "٠", en: "0" }, { ar: "-", en: "-" },
    { ar: "=", en: "=" },
  ],
  [
    { ar: "ض", en: "q" }, { ar: "ص", en: "w" }, { ar: "ث", en: "e" },
    { ar: "ق", en: "r" }, { ar: "ف", en: "t" }, { ar: "غ", en: "y" },
    { ar: "ع", en: "u" }, { ar: "ه", en: "i" }, { ar: "خ", en: "o" },
    { ar: "ح", en: "p" }, { ar: "ج", en: "[" }, { ar: "د", en: "]" },
  ],
  [
    { ar: "ش", en: "a" }, { ar: "س", en: "s" }, { ar: "ي", en: "d" },
    { ar: "ب", en: "f" }, { ar: "ل", en: "g" }, { ar: "ا", en: "h" },
    { ar: "ت", en: "j" }, { ar: "ن", en: "k" }, { ar: "م", en: "l" },
    { ar: "ك", en: ";" }, { ar: "ط", en: "'" },
  ],
  [
    { ar: "ئ", en: "z" }, { ar: "ء", en: "x" }, { ar: "ؤ", en: "c" },
    { ar: "ر", en: "v" }, { ar: "لا", en: "b" }, { ar: "ى", en: "n" },
    { ar: "ة", en: "m" }, { ar: "و", en: "," }, { ar: "ز", en: "." },
    { ar: "ظ", en: "/" },
  ],
];

const KEY_MAP = {};
const AR_TO_EN = {};
KEYBOARD_ROWS.forEach((row) =>
  row.forEach((k) => {
    KEY_MAP[k.en] = k.ar;
    AR_TO_EN[k.ar] = k.en;
  })
);
const ARABIC_CHARS = new Set(Object.keys(AR_TO_EN));

// ─── Finger color mapping ──────────────────────────────────────────────
// Which finger presses which key (standard touch typing)
const FINGER_COLORS = {
  pinkyL:  "#ef4444",  // red
  ringL:   "#f97316",  // orange
  middleL: "#eab308",  // yellow
  indexL:  "#22c55e",  // green
  indexR:  "#3b82f6",  // blue
  middleR: "#a855f7",  // purple
  ringR:   "#f97316",  // orange
  pinkyR:  "#ef4444",  // red
  thumb:   "#64748b",  // gray (space)
};

// Map english key → finger
const KEY_FINGER = {
  "`": "pinkyL", "1": "pinkyL", "2": "ringL", "3": "middleL", "4": "indexL",
  "5": "indexL", "6": "indexR", "7": "indexR", "8": "middleR", "9": "ringR",
  "0": "pinkyR", "-": "pinkyR", "=": "pinkyR",
  "q": "pinkyL", "w": "ringL", "e": "middleL", "r": "indexL", "t": "indexL",
  "y": "indexR", "u": "indexR", "i": "middleR", "o": "ringR", "p": "pinkyR",
  "[": "pinkyR", "]": "pinkyR",
  "a": "pinkyL", "s": "ringL", "d": "middleL", "f": "indexL", "g": "indexL",
  "h": "indexR", "j": "indexR", "k": "middleR", "l": "ringR", ";": "pinkyR",
  "'": "pinkyR",
  "z": "pinkyL", "x": "ringL", "c": "middleL", "v": "indexL", "b": "indexL",
  "n": "indexR", "m": "indexR", ",": "middleR", ".": "ringR", "/": "pinkyR",
  " ": "thumb",
};

// ─── Utility ───────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Components ────────────────────────────────────────────────────────

function VirtualKeyboard({ activeKey, highlightKeys, onKeyTap, isMobile, showFingers }) {
  const keySize = isMobile ? 28 : 48;
  const keyFont = isMobile ? 13 : 20;
  const subFont = isMobile ? 7 : 9;
  const gap = isMobile ? 2 : 4;
  const spaceW = isMobile ? 180 : 320;
  const spaceH = isMobile ? 32 : 42;

  return (
    <div style={{ direction: "ltr", margin: isMobile ? "12px auto" : "24px auto", maxWidth: 720 }}>
      {KEYBOARD_ROWS.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "flex",
            justifyContent: "center",
            gap,
            marginBottom: gap,
            paddingLeft: isMobile
              ? (ri === 1 ? 10 : ri === 2 ? 20 : ri === 3 ? 30 : 0)
              : (ri === 1 ? 20 : ri === 2 ? 40 : ri === 3 ? 60 : 0),
          }}
        >
          {row.map((k) => {
            const isActive = activeKey === k.en;
            const isHighlight = highlightKeys.includes(k.ar);
            return (
              <div
                key={k.en}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onKeyTap && onKeyTap(k.ar, k.en);
                }}
                style={{
                  width: keySize,
                  height: keySize,
                  borderRadius: isMobile ? 5 : 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  background: isActive
                    ? "#10b981"
                    : isHighlight
                    ? "#fbbf24"
                    : showFingers
                    ? `${FINGER_COLORS[KEY_FINGER[k.en]] || "#1e293b"}22`
                    : "#1e293b",
                  color: isActive || isHighlight ? "#0f172a" : "#e2e8f0",
                  border: `${isMobile ? 1 : 2}px solid ${
                    isActive ? "#059669" : isHighlight ? "#f59e0b" : showFingers ? (FINGER_COLORS[KEY_FINGER[k.en]] || "#334155") + "88" : "#334155"
                  }`,
                  borderBottom: showFingers && !isActive && !isHighlight
                    ? `3px solid ${FINGER_COLORS[KEY_FINGER[k.en]] || "#334155"}`
                    : undefined,
                  transition: "all 0.15s ease",
                  transform: isActive ? "scale(1.12)" : "scale(1)",
                  boxShadow: isActive
                    ? "0 0 12px rgba(16,185,129,0.5)"
                    : "none",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
                }}
              >
                <span style={{ fontSize: keyFont, lineHeight: 1 }}>{k.ar}</span>
                {!isMobile && (
                  <span
                    style={{
                      fontSize: subFont,
                      opacity: 0.5,
                      marginTop: 2,
                      fontFamily: "monospace",
                    }}
                  >
                    {k.en}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {/* Spacebar */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: gap }}>
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onKeyTap && onKeyTap(" ", " ");
          }}
          style={{
            width: spaceW,
            height: spaceH,
            borderRadius: isMobile ? 5 : 8,
            background: activeKey === " " ? "#10b981" : showFingers ? `${FINGER_COLORS.thumb}22` : "#1e293b",
            border: `${isMobile ? 1 : 2}px solid ${activeKey === " " ? "#059669" : showFingers ? FINGER_COLORS.thumb + "88" : "#334155"}`,
            borderBottom: showFingers && activeKey !== " " ? `3px solid ${FINGER_COLORS.thumb}` : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: activeKey === " " ? "#0f172a" : "#94a3b8",
            fontSize: isMobile ? 11 : 13,
            fontWeight: 500,
            transition: "all 0.15s ease",
            cursor: "pointer",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          SPACE
        </div>
      </div>
    </div>
  );
}

function StatsBar({ wpm, accuracy, streak, elapsed, isMobile }) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const stats = [
    { label: "WPM", value: wpm, icon: "⚡", color: "#3b82f6" },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      icon: "🎯",
      color: accuracy >= 90 ? "#10b981" : accuracy >= 70 ? "#f59e0b" : "#ef4444",
    },
    { label: "Streak", value: streak, icon: "🔥", color: "#f97316" },
    {
      label: "Time",
      value: `${mins}:${secs.toString().padStart(2, "0")}`,
      icon: "⏱",
      color: "#8b5cf6",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, auto)",
        gap: isMobile ? 6 : 16,
        justifyContent: isMobile ? "stretch" : "center",
        margin: isMobile ? "10px 0" : "16px 0",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: "#1e293b",
            borderRadius: isMobile ? 8 : 12,
            padding: isMobile ? "8px 6px" : "12px 24px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: isMobile ? 2 : 10,
            border: `1px solid ${s.color}33`,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: isMobile ? 16 : 22 }}>{s.icon}</span>
          <div>
            <div
              style={{
                fontSize: isMobile ? 16 : 22,
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: isMobile ? 9 : 11, color: "#94a3b8", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ margin: "12px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 4,
        }}
      >
        <span>Progress</span>
        <span>
          {current}/{total} ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#1e293b",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #3b82f6, #10b981)",
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function LessonSelector({ lessons, currentLesson, onSelect, completedLessons, isMobile }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "repeat(auto-fill, minmax(140px, 1fr))"
          : "repeat(auto-fill, minmax(220px, 1fr))",
        gap: isMobile ? 8 : 12,
        margin: isMobile ? "12px 0" : "20px 0",
      }}
    >
      {lessons.map((l) => {
        const isActive = currentLesson?.id === l.id;
        const isCompleted = completedLessons.includes(l.id);
        return (
          <button
            key={l.id}
            onClick={() => onSelect(l)}
            style={{
              background: isActive
                ? "linear-gradient(135deg, #1e40af, #3b82f6)"
                : isCompleted
                ? "#064e3b"
                : "#1e293b",
              border: `2px solid ${
                isActive ? "#3b82f6" : isCompleted ? "#10b981" : "#334155"
              }`,
              borderRadius: 12,
              padding: isMobile ? 10 : 16,
              cursor: "pointer",
              textAlign: "right",
              direction: "rtl",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            {isCompleted && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  fontSize: isMobile ? 14 : 18,
                }}
              >
                ✅
              </span>
            )}
            <div
              style={{
                fontSize: isMobile ? 9 : 10,
                color: "#64748b",
                marginBottom: 4,
                textAlign: "left",
                direction: "ltr",
              }}
            >
              Lesson {l.id}
            </div>
            <div
              style={{
                fontSize: isMobile ? 15 : 18,
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: 4,
                fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
              }}
            >
              {l.title}
            </div>
            <div style={{ fontSize: isMobile ? 10 : 12, color: "#94a3b8" }}>
              {l.titleEn}
            </div>
            {!isMobile && (
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 8,
                  direction: "ltr",
                  textAlign: "left",
                }}
              >
                {l.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Hard Lesson Selector ──────────────────────────────────────────────
function HardLessonSelector({ onSelect, completedHard, isMobile }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "repeat(auto-fill, minmax(140px, 1fr))"
          : "repeat(auto-fill, minmax(200px, 1fr))",
        gap: isMobile ? 8 : 12,
        margin: isMobile ? "12px 0" : "16px 0",
      }}
    >
      {HARD_LESSONS.map((l) => {
        const isDone = completedHard.includes(l.id);
        return (
          <button
            key={l.id}
            onClick={() => onSelect(l)}
            style={{
              background: isDone
                ? "linear-gradient(135deg, #064e3b, #065f46)"
                : "linear-gradient(135deg, #1e293b, #1e1b4b)",
              border: `2px solid ${isDone ? "#10b981" : "#7c3aed44"}`,
              borderRadius: 14,
              padding: isMobile ? 12 : 18,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            {isDone && (
              <span style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>✅</span>
            )}
            <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: 6 }}>{l.emoji}</div>
            <div
              style={{
                fontSize: isMobile ? 18 : 22,
                fontWeight: 700,
                color: "#f1f5f9",
                fontFamily: "'Noto Sans Arabic', sans-serif",
                marginBottom: 4,
                direction: "rtl",
              }}
            >
              {l.title}
            </div>
            <div style={{ fontSize: isMobile ? 11 : 13, color: "#a78bfa", fontWeight: 600 }}>
              {l.titleEn}
            </div>
            <div style={{ fontSize: isMobile ? 10 : 11, color: "#64748b", marginTop: 4 }}>
              {l.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Explore Keyboard Screen ───────────────────────────────────────────

// Arabic letter names for pronunciation
const ARABIC_LETTER_NAMES = {
  "ذ": "ذال", "ض": "ضاد", "ص": "صاد", "ث": "ثاء", "ق": "قاف",
  "ف": "فاء", "غ": "غين", "ع": "عين", "ه": "هاء", "خ": "خاء",
  "ح": "حاء", "ج": "جيم", "د": "دال", "ش": "شين", "س": "سين",
  "ي": "ياء", "ب": "باء", "ل": "لام", "ا": "ألف", "ت": "تاء",
  "ن": "نون", "م": "ميم", "ك": "كاف", "ط": "طاء", "ئ": "ئاء",
  "ء": "همزة", "ؤ": "ؤاء", "ر": "راء", "لا": "لا", "ى": "ألف مقصورة",
  "ة": "تاء مربوطة", "و": "واو", "ز": "زاي", "ظ": "ظاء",
};

let _audioEl = null;
function speakArabic(text) {
  try {
    if (_audioEl) {
      _audioEl.pause();
      _audioEl.currentTime = 0;
    }
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(text)}`;
    _audioEl = new Audio(url);
    _audioEl.play().catch(() => {
      // Fallback to Web Speech API
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ar";
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
      }
    });
  } catch {
    // silent fail
  }
}

function ExploreKeyboard({ isMobile, onBack }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const keySize = isMobile ? 36 : 56;
  const keyFont = isMobile ? 16 : 24;
  const subFont = isMobile ? 8 : 11;
  const gap = isMobile ? 3 : 5;

  // Listen for physical keyboard
  useEffect(() => {
    const handler = (e) => {
      const enKey = e.key.toLowerCase();
      const arChar = KEY_MAP[enKey];
      if (arChar) {
        e.preventDefault();
        setSelectedKey({ ar: arChar, en: enKey });
        setPressedKeys((prev) => new Set([...prev, enKey]));
        if (soundEnabled) {
          const name = ARABIC_LETTER_NAMES[arChar] || arChar;
          speakArabic(name);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const progress = pressedKeys.size;
  const total = KEYBOARD_ROWS.reduce((sum, row) => sum + row.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 20 }}>
        <button
          onClick={onBack}
          style={{
            background: "#334155",
            color: "#94a3b8",
            border: "none",
            borderRadius: 8,
            padding: isMobile ? "6px 10px" : "8px 16px",
            fontSize: isMobile ? 11 : 13,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
          🔍 Explore the Keyboard
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? "#064e3b" : "#334155",
              color: soundEnabled ? "#10b981" : "#64748b",
              border: `1px solid ${soundEnabled ? "#10b981" : "#475569"}`,
              borderRadius: 8,
              padding: isMobile ? "4px 8px" : "6px 12px",
              fontSize: isMobile ? 14 : 18,
              cursor: "pointer",
            }}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <span style={{ fontSize: isMobile ? 10 : 12, color: "#64748b" }}>
            {progress}/{total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, marginBottom: isMobile ? 12 : 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${total > 0 ? (progress / total) * 100 : 0}%`, background: "linear-gradient(90deg, #3b82f6, #10b981)", borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>

      {/* Selected key display */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: isMobile ? 12 : 16,
          padding: isMobile ? "20px 12px" : "32px 24px",
          textAlign: "center",
          marginBottom: isMobile ? 12 : 20,
          minHeight: isMobile ? 100 : 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${selectedKey ? "#3b82f633" : "#1e293b"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        {selectedKey ? (
          <>
            <div
              style={{
                fontSize: isMobile ? 64 : 96,
                fontWeight: 700,
                fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
                color: "#f1f5f9",
                lineHeight: 1.2,
              }}
            >
              {selectedKey.ar}
            </div>
            {ARABIC_LETTER_NAMES[selectedKey.ar] && (
              <div style={{ marginTop: 4, fontSize: isMobile ? 16 : 20, color: "#94a3b8", fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                {ARABIC_LETTER_NAMES[selectedKey.ar]}
              </div>
            )}
            <button
              onClick={() => {
                const name = ARABIC_LETTER_NAMES[selectedKey.ar] || selectedKey.ar;
                speakArabic(name);
              }}
              style={{
                background: "#1e40af",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: isMobile ? "6px 16px" : "8px 20px",
                fontSize: isMobile ? 13 : 15,
                cursor: "pointer",
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🔊 Listen again
            </button>
            <div style={{ marginTop: 10, fontSize: isMobile ? 13 : 16, color: "#94a3b8" }}>
              Key:{" "}
              <span
                style={{
                  background: "#334155",
                  padding: "2px 10px",
                  borderRadius: 4,
                  color: "#fbbf24",
                  fontWeight: 600,
                  fontFamily: "monospace",
                  fontSize: isMobile ? 14 : 18,
                }}
              >
                {selectedKey.en.toUpperCase()}
              </span>
            </div>
          </>
        ) : (
          <div style={{ color: "#475569", fontSize: isMobile ? 14 : 18 }}>
            {isMobile ? "Tap a key below to see its letter" : "Press any key or tap below to see its Arabic letter"}
          </div>
        )}
      </div>

      {/* Instruction */}
      <p style={{ textAlign: "center", fontSize: isMobile ? 11 : 13, color: "#64748b", marginBottom: isMobile ? 8 : 12 }}>
        {isMobile ? "Tap each key to learn it" : "Press keys on your keyboard or tap below"} • Discovered keys turn <span style={{ color: "#10b981" }}>green</span>
      </p>

      {/* Interactive keyboard */}
      <div style={{ direction: "ltr", margin: "0 auto", maxWidth: 780 }}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              justifyContent: "center",
              gap,
              marginBottom: gap,
              paddingLeft: isMobile
                ? (ri === 1 ? 12 : ri === 2 ? 24 : ri === 3 ? 36 : 0)
                : (ri === 1 ? 24 : ri === 2 ? 48 : ri === 3 ? 72 : 0),
            }}
          >
            {row.map((k) => {
              const isSelected = selectedKey?.en === k.en;
              const isDiscovered = pressedKeys.has(k.en);
              return (
                <div
                  key={k.en}
                  onClick={() => {
                    setSelectedKey(k);
                    setPressedKeys((prev) => new Set([...prev, k.en]));
                    if (soundEnabled) {
                      const name = ARABIC_LETTER_NAMES[k.ar] || k.ar;
                      speakArabic(name);
                    }
                  }}
                  style={{
                    width: keySize,
                    height: keySize,
                    borderRadius: isMobile ? 6 : 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    background: isSelected
                      ? "linear-gradient(135deg, #1e40af, #3b82f6)"
                      : isDiscovered
                      ? "#064e3b"
                      : `${FINGER_COLORS[KEY_FINGER[k.en]] || "#1e293b"}18`,
                    color: isSelected ? "#fff" : isDiscovered ? "#10b981" : "#e2e8f0",
                    border: `${isMobile ? 1 : 2}px solid ${
                      isSelected ? "#3b82f6" : isDiscovered ? "#10b981" : (FINGER_COLORS[KEY_FINGER[k.en]] || "#334155") + "66"
                    }`,
                    borderBottom: !isSelected && !isDiscovered
                      ? `3px solid ${FINGER_COLORS[KEY_FINGER[k.en]] || "#334155"}`
                      : undefined,
                    transition: "all 0.2s ease",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    boxShadow: isSelected ? "0 0 16px rgba(59,130,246,0.5)" : "none",
                    cursor: "pointer",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
                  }}
                >
                  <span style={{ fontSize: keyFont, lineHeight: 1 }}>{k.ar}</span>
                  <span
                    style={{
                      fontSize: subFont,
                      opacity: 0.5,
                      marginTop: 2,
                      fontFamily: "monospace",
                    }}
                  >
                    {k.en}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Discovered count */}
      {progress > 0 && progress < total && (
        <p style={{ textAlign: "center", fontSize: isMobile ? 11 : 13, color: "#64748b", marginTop: isMobile ? 10 : 16 }}>
          🎯 {total - progress} keys left to discover!
        </p>
      )}
      {progress >= total && (
        <p style={{ textAlign: "center", fontSize: isMobile ? 13 : 16, color: "#10b981", marginTop: isMobile ? 10 : 16, fontWeight: 600 }}>
          🏆 You've explored every key! Ready to start a lesson?
        </p>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────

export default function ArabicTypingApp() {
  const isMobile = useIsMobile();
  const [screen, setScreen] = useState("home");
  const [lesson, setLesson] = useState(null);
  const [phase, setPhase] = useState("letters");
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const [showFingers, setShowFingers] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // ── Hard mode state ──────────────────────────────────────────────────
  const [hardLesson, setHardLesson] = useState(null);
  const [hardIdx, setHardIdx] = useState(0);
  const [hardTyped, setHardTyped] = useState("");
  const [hardStartTime, setHardStartTime] = useState(null);
  const [hardElapsed, setHardElapsed] = useState(0);
  const [hardTotalChars, setHardTotalChars] = useState(0);
  const [hardCorrectChars, setHardCorrectChars] = useState(0);
  const [completedHard, setCompletedHard] = useState([]);
  const hardTimerRef = useRef(null);

  const currentTarget = items[currentIdx] || "";

  // Timer
  useEffect(() => {
    if (screen === "practice" && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, startTime]);

  // Auto-focus (desktop)
  useEffect(() => {
    if (screen === "practice" && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [screen, currentIdx, phase, isMobile]);

  const wpm =
    elapsed > 0 ? Math.round((correctChars / 5 / elapsed) * 60) : 0;
  const accuracy =
    totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  const nextExpectedChar = currentTarget[typed.length] || "";
  const highlightKeys = [];
  if (nextExpectedChar && nextExpectedChar !== " ") {
    KEYBOARD_ROWS.forEach((row) =>
      row.forEach((k) => {
        if (k.ar === nextExpectedChar) highlightKeys.push(k.ar);
      })
    );
  }

  const hintKey = (() => {
    if (!nextExpectedChar) return "";
    if (nextExpectedChar === " ") return "SPACE";
    for (const row of KEYBOARD_ROWS) {
      for (const k of row) {
        if (k.ar === nextExpectedChar) return k.en.toUpperCase();
      }
    }
    return "";
  })();

  const startLesson = useCallback((l) => {
    setLesson(l);
    setScreen("practice");
    // Surah lessons: go straight to sentences (line by line)
    if (l.id === 7 || l.id === 8) {
      setPhase("sentences");
      setItems([...l.sentences]);
    } else {
      setPhase("letters");
      const letterItems =
        l.letters.length > 0
          ? shuffleArray([...l.letters, ...l.letters, ...l.letters]).slice(0, 10)
          : [];
      setItems(letterItems.length > 0 ? letterItems : shuffleArray(l.words));
      if (letterItems.length === 0) setPhase("words");
    }
    setCurrentIdx(0);
    setTyped("");
    setErrors(0);
    setTotalChars(0);
    setCorrectChars(0);
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setElapsed(0);
    setFeedback(null);
  }, []);

  const advancePhase = useCallback(() => {
    if (phase === "letters" && lesson.words.length > 0) {
      setPhase("words");
      setItems(shuffleArray(lesson.words));
      setCurrentIdx(0);
      setTyped("");
      setFeedback(null);
    } else if (phase === "words" && lesson.sentences.length > 0) {
      setPhase("sentences");
      setItems([...lesson.sentences]);
      setCurrentIdx(0);
      setTyped("");
      setFeedback(null);
    } else {
      setCompletedLessons((prev) =>
        prev.includes(lesson.id) ? prev : [...prev, lesson.id]
      );
      setScreen("results");
    }
  }, [phase, lesson]);

  // ── Hard mode timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen === "hard" && hardStartTime) {
      hardTimerRef.current = setInterval(() => {
        setHardElapsed(Math.floor((Date.now() - hardStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(hardTimerRef.current);
  }, [screen, hardStartTime]);

  const startHardLesson = useCallback((l) => {
    setHardLesson(l);
    setHardIdx(0);
    setHardTyped("");
    setHardStartTime(Date.now());
    setHardElapsed(0);
    setHardTotalChars(0);
    setHardCorrectChars(0);
    setScreen("hard");
  }, []);

  // ── Hard mode keyboard handler ───────────────────────────────────────
  const handleHardKeyDown = useCallback(
    (e) => {
      if (screen !== "hard" || !hardLesson) return;
      if (e.key === "Escape") { setScreen("home"); return; }

      const ayah = hardLesson.ayaat[hardIdx] || "";

      if (e.key === "Backspace") {
        e.preventDefault();
        setHardTyped((prev) => prev.slice(0, -1));
        return;
      }

      // Map english key → arabic char (same as normal mode)
      let arabicChar = null;
      if (e.key === " ") {
        arabicChar = " ";
      } else if (KEY_MAP[e.key.toLowerCase()]) {
        arabicChar = KEY_MAP[e.key.toLowerCase()];
      } else if (ARABIC_CHARS.has(e.key)) {
        arabicChar = e.key;
      }
      if (!arabicChar) return;
      e.preventDefault();

      // Don't type beyond the ayah length
      if (hardTyped.length >= ayah.length) return;

      const expected = ayah[hardTyped.length];
      const isCorrect = arabicChar === expected;

      setHardTotalChars((p) => p + 1);
      if (isCorrect) setHardCorrectChars((p) => p + 1);
      setHardTyped((prev) => prev + arabicChar);

      // Auto-advance when full ayah typed
      if (hardTyped.length + 1 >= ayah.length) {
        setTimeout(() => {
          const next = hardIdx + 1;
          if (next < hardLesson.ayaat.length) {
            setHardIdx(next);
            setHardTyped("");
          } else {
            setCompletedHard((prev) =>
              prev.includes(hardLesson.id) ? prev : [...prev, hardLesson.id]
            );
            setScreen("hard-results");
          }
        }, 600);
      }
    },
    [screen, hardLesson, hardIdx, hardTyped]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleHardKeyDown);
    return () => window.removeEventListener("keydown", handleHardKeyDown);
  }, [handleHardKeyDown]);

  // ── Derived hard mode stats ──────────────────────────────────────────
  const hardWpm = hardElapsed > 0 ? Math.round((hardCorrectChars / 5 / hardElapsed) * 60) : 0;
  const hardAccuracy = hardTotalChars > 0 ? Math.round((hardCorrectChars / hardTotalChars) * 100) : 100;

  // ── Activity logging ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen === "results" && lesson) {
      supabase.from("activity_logs").insert({
        lesson_id: String(lesson.id),
        lesson_title: lesson.title,
        lesson_title_en: lesson.titleEn,
        lesson_type: "normal",
        wpm,
        accuracy,
        duration_seconds: elapsed,
        best_streak: bestStreak,
        total_chars: totalChars,
        correct_chars: correctChars,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    if (screen === "hard-results" && hardLesson) {
      supabase.from("activity_logs").insert({
        lesson_id: String(hardLesson.id),
        lesson_title: hardLesson.title,
        lesson_title_en: hardLesson.titleEn,
        lesson_type: "hard",
        wpm: hardWpm,
        accuracy: hardAccuracy,
        duration_seconds: hardElapsed,
        best_streak: 0,
        total_chars: hardTotalChars,
        correct_chars: hardCorrectChars,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Shared input handler (used by both keyboard events and tap)
  const processInput = useCallback(
    (arabicChar, enKey) => {
      if (screen !== "practice") return;

      setActiveKey(enKey === " " ? " " : enKey);
      setTimeout(() => setActiveKey(""), 150);

      const expected = currentTarget[typed.length];
      if (!expected) return;

      setTotalChars((p) => p + 1);

      if (arabicChar === expected) {
        setCorrectChars((p) => p + 1);
        setStreak((p) => {
          const ns = p + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
        setFeedback({ type: "correct", char: arabicChar });

        const newTyped = typed + arabicChar;
        setTyped(newTyped);

        if (newTyped.length >= currentTarget.length) {
          setTimeout(() => {
            if (currentIdx + 1 < items.length) {
              setCurrentIdx((p) => p + 1);
              setTyped("");
              setFeedback(null);
            } else {
              advancePhase();
            }
          }, 300);
        }
      } else {
        setErrors((p) => p + 1);
        setStreak(0);
        setFeedback({ type: "wrong", char: arabicChar });
      }

      setTimeout(() => setFeedback(null), 500);
    },
    [screen, typed, currentTarget, currentIdx, items, advancePhase]
  );

  // Handle virtual keyboard tap (mobile)
  const handleKeyTap = useCallback(
    (arabicChar, enKey) => {
      processInput(arabicChar, enKey);
    },
    [processInput]
  );

  // Handle physical keyboard (desktop)
  const handleKeyDown = useCallback(
    (e) => {
      if (screen !== "practice") return;

      if (e.key === "Escape") {
        setScreen("home");
        return;
      }

      let arabicChar = null;
      let enKey = null;
      if (e.key === " ") {
        arabicChar = " ";
        enKey = " ";
      } else if (KEY_MAP[e.key.toLowerCase()]) {
        enKey = e.key.toLowerCase();
        arabicChar = KEY_MAP[enKey];
      } else if (ARABIC_CHARS.has(e.key)) {
        arabicChar = e.key;
        enKey = AR_TO_EN[e.key] || "";
      }

      if (!arabicChar) return;
      e.preventDefault();
      processInput(arabicChar, enKey);
    },
    [screen, processInput]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ─── Render ────────────────────────────────────────────────────────

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
    color: "#f1f5f9",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Arabic', sans-serif",
    padding: isMobile ? "12px 8px" : "24px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    background: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 16 : 32,
    maxWidth: 900,
    margin: "0 auto",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  };

  // ─── HOME SCREEN ────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 32 }}>
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>⌨️</div>
            <h1
              style={{
                fontSize: isMobile ? 24 : 36,
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(135deg, #3b82f6, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Arabic Typing Tutor
            </h1>
            <p
              style={{
                fontSize: isMobile ? 16 : 20,
                color: "#94a3b8",
                margin: "8px 0 0 0",
                fontFamily: "'Noto Sans Arabic', sans-serif",
                direction: "rtl",
              }}
            >
              تعلم الكتابة بالعربية
            </p>
            <p style={{ fontSize: isMobile ? 12 : 14, color: "#64748b", marginTop: 4 }}>
              Learn to type in Arabic step by step
            </p>
            <button
              onClick={() => setScreen("stats")}
              style={{ marginTop: 14, background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#94a3b8", border: "1px solid #334155", borderRadius: 10, padding: isMobile ? "8px 18px" : "10px 24px", fontSize: isMobile ? 12 : 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              📊 Activity Log
            </button>
          </div>

          <h2
            style={{
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: 8,
            }}
          >
            Choose a Lesson
          </h2>
          <LessonSelector
            lessons={LESSONS}
            currentLesson={lesson}
            onSelect={startLesson}
            completedLessons={completedLessons}
            isMobile={isMobile}
          />

          {/* Hard Lessons divider */}
          <div style={{ margin: isMobile ? "24px 0 12px" : "36px 0 16px", position: "relative" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #7c3aed66, transparent)" }} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(30,41,59,0.95)",
                padding: "4px 16px",
                borderRadius: 20,
                border: "1px solid #7c3aed66",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: isMobile ? 10 : 12, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Hard Mode
              </span>
            </div>
          </div>

          {/* Hard lessons banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e1b4b, #2e1065)",
              borderRadius: 14,
              padding: isMobile ? "14px 12px" : "18px 20px",
              marginBottom: isMobile ? 12 : 16,
              border: "1px solid #7c3aed44",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: isMobile ? 28 : 36, flexShrink: 0 }}>🕌</div>
            <div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#c4b5fd", marginBottom: 4 }}>
                Choose Hard Lessons
              </div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: "#64748b", lineHeight: 1.5 }}>
                Type Quran surahs from memory — no keyboard guide, no hints. Just you and the text.
              </div>
            </div>
          </div>

          <HardLessonSelector
            onSelect={startHardLesson}
            completedHard={completedHard}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }

  // ─── STATS SCREEN ────────────────────────────────────────────────────
  if (screen === "stats") {
    return <StatsPage onBack={() => setScreen("home")} isMobile={isMobile} />;
  }

  // ─── EXPLORE SCREEN ──────────────────────────────────────────────────
  if (screen === "explore") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <ExploreKeyboard isMobile={isMobile} onBack={() => setScreen("home")} />
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ─────────────────────────────────────────────────
  if (screen === "results") {
    const grade =
      accuracy >= 95
        ? { emoji: "🏆", text: "Excellent!", color: "#10b981" }
        : accuracy >= 80
        ? { emoji: "⭐", text: "Great Job!", color: "#3b82f6" }
        : accuracy >= 60
        ? { emoji: "👍", text: "Good Effort!", color: "#f59e0b" }
        : { emoji: "💪", text: "Keep Practicing!", color: "#ef4444" };

    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: isMobile ? 48 : 64, marginBottom: 16 }}>{grade.emoji}</div>
          <h2
            style={{
              fontSize: isMobile ? 24 : 32,
              fontWeight: 800,
              color: grade.color,
              margin: "0 0 8px 0",
            }}
          >
            {grade.text}
          </h2>
          <p style={{ color: "#94a3b8", margin: "0 0 24px 0", fontSize: isMobile ? 13 : 16 }}>
            Lesson {lesson.id}: {lesson.titleEn} — Complete!
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: isMobile ? 8 : 16,
              maxWidth: 400,
              margin: "0 auto 24px",
            }}
          >
            {[
              { label: "Speed", value: `${wpm} WPM`, color: "#3b82f6" },
              { label: "Accuracy", value: `${accuracy}%`, color: "#10b981" },
              { label: "Best Streak", value: bestStreak, color: "#f97316" },
              {
                label: "Time",
                value: `${Math.floor(elapsed / 60)}:${(elapsed % 60)
                  .toString()
                  .padStart(2, "0")}`,
                color: "#8b5cf6",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0f172a",
                  borderRadius: 12,
                  padding: isMobile ? 12 : 20,
                  border: `1px solid ${s.color}33`,
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 20 : 28,
                    fontWeight: 700,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: "#64748b", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: isMobile ? 8 : 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => startLesson(lesson)}
              style={{
                background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: isMobile ? "10px 18px" : "12px 28px",
                fontSize: isMobile ? 13 : 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Retry
            </button>
            <button
              onClick={() => setScreen("home")}
              style={{
                background: "#334155",
                color: "#e2e8f0",
                border: "none",
                borderRadius: 10,
                padding: isMobile ? "10px 18px" : "12px 28px",
                fontSize: isMobile ? 13 : 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📚 Lessons
            </button>
            {lesson.id < LESSONS.length && (
              <button
                onClick={() => startLesson(LESSONS[lesson.id])}
                style={{
                  background: "linear-gradient(135deg, #065f46, #10b981)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: isMobile ? "10px 18px" : "12px 28px",
                  fontSize: isMobile ? 13 : 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ➡️ Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── HARD PRACTICE SCREEN ───────────────────────────────────────────
  if (screen === "hard" && hardLesson) {
    const ayah = hardLesson.ayaat[hardIdx] || "";
    const hMins = Math.floor(hardElapsed / 60);
    const hSecs = hardElapsed % 60;

    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 20 }}>
            <button
              onClick={() => setScreen("home")}
              style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: isMobile ? "6px 10px" : "8px 16px", fontSize: isMobile ? 11 : 13, cursor: "pointer" }}
            >
              ← Back
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 10 : 12, color: "#64748b" }}>Hard Mode 🔥</div>
              <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, margin: 0, color: "#c4b5fd", fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                {hardLesson.title}
              </h2>
            </div>
            <div style={{ background: "#2e1065", border: "1px solid #7c3aed66", borderRadius: 20, padding: isMobile ? "4px 10px" : "6px 16px", fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#a78bfa" }}>
              {hardIdx + 1} / {hardLesson.ayaat.length}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: isMobile ? 6 : 14, justifyContent: "center", marginBottom: isMobile ? 12 : 18, flexWrap: "wrap" }}>
            {[
              { icon: "⚡", label: "WPM", value: hardWpm, color: "#3b82f6" },
              { icon: "🎯", label: "Accuracy", value: `${hardAccuracy}%`, color: hardAccuracy >= 90 ? "#10b981" : hardAccuracy >= 70 ? "#f59e0b" : "#ef4444" },
              { icon: "⏱", label: "Time", value: `${hMins}:${hSecs.toString().padStart(2, "0")}`, color: "#8b5cf6" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#1e293b", borderRadius: isMobile ? 8 : 12, padding: isMobile ? "8px 14px" : "10px 22px", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${s.color}33` }}>
                <span style={{ fontSize: isMobile ? 16 : 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: isMobile ? 9 : 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <ProgressBar current={hardIdx} total={hardLesson.ayaat.length} />

          {/* Ayah display + typed output */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: isMobile ? 14 : 20,
              padding: isMobile ? "24px 16px" : "40px 36px",
              margin: isMobile ? "14px 0" : "20px 0",
              border: "1px solid #1e293b",
              direction: "rtl",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Surah number badge */}
            <div style={{ position: "absolute", top: 12, left: 12, fontSize: 10, color: "#475569", fontFamily: "monospace", direction: "ltr" }}>
              Ayah {hardIdx + 1}
            </div>

            {/* Target ayah — all chars shown */}
            <div
              style={{
                fontSize: isMobile ? 28 : 40,
                fontWeight: 700,
                fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
                lineHeight: 1.8,
                marginBottom: isMobile ? 20 : 28,
                color: "#334155",
                letterSpacing: 2,
                wordBreak: "break-word",
              }}
            >
              {ayah.split("").map((char, i) => {
                const typed_i = hardTyped[i];
                const isCorrect = typed_i === char;
                const isTyped = i < hardTyped.length;
                const isCurrent = i === hardTyped.length;
                return (
                  <span
                    key={i}
                    style={{
                      color: isTyped
                        ? isCorrect ? "#10b981" : "#ef4444"
                        : isCurrent ? "#fbbf24" : "#475569",
                      borderBottom: isCurrent ? "3px solid #fbbf24" : "3px solid transparent",
                      paddingBottom: 2,
                      transition: "color 0.15s ease",
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#1e293b", marginBottom: isMobile ? 16 : 22 }} />

            {/* User typed output */}
            <div style={{ minHeight: isMobile ? 40 : 52 }}>
              <div
                style={{
                  fontSize: isMobile ? 22 : 32,
                  fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
                  lineHeight: 1.8,
                  letterSpacing: 2,
                  wordBreak: "break-word",
                  color: "#e2e8f0",
                }}
              >
                {hardTyped.length === 0 ? (
                  <span style={{ color: "#334155", fontSize: isMobile ? 14 : 18 }}>
                    ابدأ الكتابة... — Start typing...
                  </span>
                ) : (
                  hardTyped.split("").map((char, i) => {
                    const isCorrect = char === ayah[i];
                    return (
                      <span
                        key={i}
                        style={{
                          color: isCorrect ? "#10b981" : "#ef4444",
                        }}
                      >
                        {char}
                      </span>
                    );
                  })
                )}
                {/* Blinking cursor */}
                {hardTyped.length < ayah.length && (
                  <span
                    style={{
                      display: "inline-block",
                      width: isMobile ? 2 : 3,
                      height: isMobile ? 24 : 32,
                      background: "#fbbf24",
                      verticalAlign: "middle",
                      marginRight: 2,
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* No keyboard hint */}
          <div style={{ textAlign: "center", fontSize: isMobile ? 10 : 12, color: "#475569", marginTop: 4 }}>
            🔥 Hard mode — no keyboard guide &nbsp;•&nbsp; <kbd style={{ color: "#64748b", fontFamily: "monospace" }}>Backspace</kbd> to correct &nbsp;•&nbsp; <kbd style={{ color: "#64748b", fontFamily: "monospace" }}>ESC</kbd> to go back
          </div>

          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>
      </div>
    );
  }

  // ─── HARD RESULTS SCREEN ────────────────────────────────────────────
  if (screen === "hard-results" && hardLesson) {
    const hMins = Math.floor(hardElapsed / 60);
    const hSecs = hardElapsed % 60;
    const grade =
      hardAccuracy >= 95 ? { emoji: "🏆", text: "Excellent!", color: "#10b981" }
      : hardAccuracy >= 80 ? { emoji: "⭐", text: "Great Job!", color: "#3b82f6" }
      : hardAccuracy >= 60 ? { emoji: "👍", text: "Good Effort!", color: "#f59e0b" }
      : { emoji: "💪", text: "Keep Practicing!", color: "#ef4444" };

    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 16, color: "#a78bfa", marginBottom: 8 }}>🔥 Hard Mode Complete</div>
          <div style={{ fontSize: isMobile ? 48 : 64, marginBottom: 12 }}>{grade.emoji}</div>
          <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: grade.color, margin: "0 0 6px 0" }}>{grade.text}</h2>
          <p style={{ color: "#94a3b8", margin: "0 0 24px 0", fontFamily: "'Noto Sans Arabic', sans-serif", fontSize: isMobile ? 16 : 20 }}>
            {hardLesson.title} — {hardLesson.titleEn}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 8 : 14, maxWidth: 480, margin: "0 auto 28px" }}>
            {[
              { label: "Speed", value: `${hardWpm} WPM`, color: "#3b82f6" },
              { label: "Accuracy", value: `${hardAccuracy}%`, color: "#10b981" },
              { label: "Time", value: `${hMins}:${hSecs.toString().padStart(2, "0")}`, color: "#8b5cf6" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#0f172a", borderRadius: 12, padding: isMobile ? 12 : 18, border: `1px solid ${s.color}33` }}>
                <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: isMobile ? 8 : 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => startHardLesson(hardLesson)} style={{ background: "linear-gradient(135deg, #2e1065, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, padding: isMobile ? "10px 18px" : "12px 26px", fontSize: isMobile ? 13 : 15, fontWeight: 600, cursor: "pointer" }}>
              🔄 Retry
            </button>
            <button onClick={() => setScreen("home")} style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 10, padding: isMobile ? "10px 18px" : "12px 26px", fontSize: isMobile ? 13 : 15, fontWeight: 600, cursor: "pointer" }}>
              📚 All Lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ────────────────────────────────────────────────
  const phaseLabel =
    phase === "letters"
      ? "📝 Letters"
      : phase === "words"
      ? "📖 Words"
      : "📄 Sentences";

  const targetFontSize = isMobile
    ? (phase === "letters" ? 48 : phase === "words" ? 32 : 24)
    : (phase === "letters" ? 72 : phase === "words" ? 48 : 36);

  const typedFontSize = isMobile
    ? (phase === "letters" ? 32 : 20)
    : (phase === "letters" ? 48 : 28);

  return (
    <div style={containerStyle} onClick={(e) => { if (!isMobile) { e.preventDefault(); inputRef.current?.focus(); } }}>
      <div style={cardStyle}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? 10 : 16,
            gap: 8,
          }}
        >
          <button
            onClick={() => setScreen("home")}
            style={{
              background: "#334155",
              color: "#94a3b8",
              border: "none",
              borderRadius: 8,
              padding: isMobile ? "6px 10px" : "8px 16px",
              fontSize: isMobile ? 11 : 13,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <span style={{ fontSize: isMobile ? 11 : 13, color: "#64748b" }}>
              Lesson {lesson.id}
            </span>
            <h2
              style={{
                fontSize: isMobile ? 16 : 20,
                fontWeight: 700,
                margin: 0,
                color: "#e2e8f0",
                fontFamily: "'Noto Sans Arabic', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {lesson.title}
            </h2>
          </div>
          <div
            style={{
              background:
                phase === "letters"
                  ? "#1e40af"
                  : phase === "words"
                  ? "#7c3aed"
                  : "#047857",
              color: "#fff",
              borderRadius: 20,
              padding: isMobile ? "4px 8px" : "6px 14px",
              fontSize: isMobile ? 10 : 13,
              fontWeight: 600,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {phaseLabel}
          </div>
        </div>

        <StatsBar
          wpm={wpm}
          accuracy={accuracy}
          streak={streak}
          elapsed={elapsed}
          isMobile={isMobile}
        />
        <ProgressBar current={currentIdx} total={items.length} />

        {/* Typing Area */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? "20px 12px" : "32px 24px",
            textAlign: "center",
            margin: isMobile ? "12px 0" : "20px 0",
            height: isMobile ? 160 : 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: `2px solid ${
              feedback?.type === "wrong"
                ? "#ef4444"
                : feedback?.type === "correct"
                ? "#10b98133"
                : "#1e293b"
            }`,
            transition: "border-color 0.3s ease",
          }}
        >
          {/* Target display */}
          <div
            style={{
              fontSize: targetFontSize,
              fontWeight: 700,
              direction: "rtl",
              fontFamily: "'Noto Sans Arabic', 'Amiri', sans-serif",
              lineHeight: 1.4,
              letterSpacing: phase === "letters" ? 0 : isMobile ? 2 : 4,
              marginBottom: isMobile ? 8 : 16,
              wordBreak: "break-word",
            }}
          >
            {currentTarget.split("").map((char, i) => {
              const isTyped = i < typed.length;
              const isCurrent = i === typed.length;
              return (
                <span
                  key={i}
                  style={{
                    color: isTyped
                      ? "#10b981"
                      : isCurrent
                      ? "#fbbf24"
                      : "#475569",
                    textDecoration: "underline",
                    textUnderlineOffset: 8,
                    textDecorationColor: isCurrent ? "#fbbf24" : "transparent",
                    transition: "color 0.2s ease",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* What user typed */}
          <div
            style={{
              fontSize: typedFontSize,
              color: "#3b82f6",
              direction: "rtl",
              fontFamily: "'Noto Sans Arabic', sans-serif",
              height: isMobile ? 28 : 40,
              lineHeight: isMobile ? "28px" : "40px",
              overflow: "hidden",
              opacity: typed.length > 0 ? 1 : 0.3,
            }}
          >
            {typed || "..."}
          </div>


        </div>

        {/* Hint — always rendered, visibility toggled to prevent layout shift */}
        <div
          style={{
            textAlign: "center",
            fontSize: isMobile ? 11 : 13,
            color: "#64748b",
            marginBottom: 8,
            height: isMobile ? 20 : 24,
            overflow: "hidden",
            visibility: showHint && hintKey ? "visible" : "hidden",
          }}
        >
            💡 {isMobile ? "Tap" : "Press"}{" "}
            <span
              style={{
                background: "#334155",
                padding: "2px 8px",
                borderRadius: 4,
                color: "#fbbf24",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              {hintKey}
            </span>{" "}
            for{" "}
            <span
              style={{
                fontFamily: "'Noto Sans Arabic', sans-serif",
                fontSize: isMobile ? 14 : 16,
                color: "#fbbf24",
              }}
            >
              {nextExpectedChar === " " ? "⎵" : nextExpectedChar}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                marginLeft: 8,
                cursor: "pointer",
                fontSize: isMobile ? 10 : 11,
              }}
            >
              hide
            </button>
        </div>

        {/* Finger guide toggle */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowFingers(!showFingers); }}
            style={{
              background: showFingers ? "#1e3a5f" : "#334155",
              color: showFingers ? "#3b82f6" : "#64748b",
              border: `1px solid ${showFingers ? "#3b82f6" + "44" : "#475569"}`,
              borderRadius: 6,
              padding: isMobile ? "4px 10px" : "5px 14px",
              fontSize: isMobile ? 10 : 12,
              cursor: "pointer",
            }}
          >
            {showFingers ? "✋ Finger guide ON" : "✋ Finger guide OFF"}
          </button>
        </div>

        {/* Finger legend */}
        {showFingers && (
          <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 4 : 8, flexWrap: "wrap", marginBottom: 4 }}>
            {[
              { label: "Pinky", color: FINGER_COLORS.pinkyL },
              { label: "Ring", color: FINGER_COLORS.ringL },
              { label: "Middle", color: FINGER_COLORS.middleL },
              { label: "Index L", color: FINGER_COLORS.indexL },
              { label: "Index R", color: FINGER_COLORS.indexR },
              { label: "Middle", color: FINGER_COLORS.middleR },
              { label: "Thumb", color: FINGER_COLORS.thumb },
            ].map((f) => (
              <div key={f.label + f.color} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: isMobile ? 8 : 10, color: "#94a3b8" }}>
                <div style={{ width: isMobile ? 8 : 10, height: isMobile ? 8 : 10, borderRadius: 2, background: f.color }} />
                {f.label}
              </div>
            ))}
          </div>
        )}

        {/* Virtual Keyboard */}
        <VirtualKeyboard
          activeKey={activeKey}
          highlightKeys={highlightKeys}
          onKeyTap={handleKeyTap}
          isMobile={isMobile}
          showFingers={showFingers}
        />

        {/* Hidden input for desktop focus — off-screen to prevent scroll */}
        <input
          ref={inputRef}
          style={{
            position: "fixed",
            top: -100,
            left: -100,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          }}
          tabIndex={isMobile ? -1 : 0}
          autoFocus={!isMobile}
          readOnly={isMobile}
        />

        <div
          style={{
            textAlign: "center",
            fontSize: isMobile ? 10 : 12,
            color: "#475569",
            marginTop: 8,
          }}
        >
          {isMobile
            ? "Tap the keys above to type"
            : "Press ESC to go back • Click anywhere to refocus"}
        </div>
      </div>
    </div>
  );
}
