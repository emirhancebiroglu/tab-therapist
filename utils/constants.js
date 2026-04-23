// TabTherapist Constants
// Eşik değerler ve kişilik tipi aralıkları

export const THRESHOLDS = {
  tabHoarder: 30,
  moderateUser: 15,
  minimalist: 5
};

export const PERSONALITY_TYPES = {
  aspirational: { min: 80, max: 100, name: 'Aspirational' },
  balanced: { min: 50, max: 79, name: 'Balanced' },
  relaxed: { min: 20, max: 49, name: 'Relaxed' },
  hoarder: { min: 0, max: 19, name: 'Hoarder' }
};

export const STORAGE_KEYS = {
  tabHistory: 'tabHistory',
  tabStats: 'tabStats',
  lastAnalysis: 'lastAnalysis'
};

// v2 Storage Keys
export const STORAGE_KEYS_V2 = {
  ARCHIVE: "tabtherapist_v2_archive",
  VELOCITY_LOG: "tabtherapist_v2_velocity_log",
  SWITCH_LOG: "tabtherapist_v2_switch_log",
  SETTINGS: "tabtherapist_v2_settings",
  META: "tabtherapist_v2_meta"
};

// Insurance Policy eşiği (saat)
export const INSURANCE_POLICY_THRESHOLD_HOURS = 48;

// Velocity log window (ms)
export const VELOCITY_WINDOW_MS = 3600000; // 1 saat
export const VELOCITY_MAX_EVENTS = 500;

// Context Switch window (dakika)
export const SWITCH_WINDOW_MINUTES = 30;
export const SWITCH_MAX_ACTIVATIONS = 300;

// Storage limitleri (byte)
export const STORAGE_WARNING_THRESHOLD = 8 * 1024 * 1024;   // 8MB
export const STORAGE_CRITICAL_THRESHOLD = 9.5 * 1024 * 1024; // 9.5MB

// Domain → Kategori haritası
export const CATEGORY_MAP = {
  "github.com": "development",
  "gitlab.com": "development",
  "stackoverflow.com": "development",
  "developer.mozilla.org": "development",
  "npmjs.com": "development",
  "docs.python.org": "development",
  "youtube.com": "media",
  "netflix.com": "media",
  "twitch.tv": "media",
  "spotify.com": "media",
  "twitter.com": "social",
  "x.com": "social",
  "linkedin.com": "social",
  "reddit.com": "social",
  "instagram.com": "social",
  "docs.google.com": "productivity",
  "sheets.google.com": "productivity",
  "notion.so": "productivity",
  "trello.com": "productivity",
  "figma.com": "productivity",
  "gmail.com": "communication",
  "mail.google.com": "communication",
  "outlook.live.com": "communication",
  "slack.com": "communication",
  "discord.com": "communication",
  "amazon.com": "shopping",
  "trendyol.com": "shopping",
  "hepsiburada.com": "shopping",
  "medium.com": "research",
  "dev.to": "research",
  "arxiv.org": "research",
  "scholar.google.com": "research",
  "wikipedia.org": "research",
  "news.ycombinator.com": "news",
  "bbc.com": "news",
  "cnn.com": "news"
};

// Memory Pressure domain multiplier'ları
export const MEMORY_MULTIPLIERS = {
  "youtube.com": 3.0, "twitch.tv": 3.0,
  "twitter.com": 2.0, "x.com": 2.0,
  "facebook.com": 2.5, "instagram.com": 2.0,
  "gmail.com": 1.5, "mail.google.com": 1.5,
  "docs.google.com": 1.8, "sheets.google.com": 1.8,
  "figma.com": 2.5, "canva.com": 2.0,
  "reddit.com": 1.8, "discord.com": 2.0
};
export const MEMORY_BASE_MB = 50;

// v2 Skor ağırlıkları
export const SCORE_WEIGHTS_V2 = {
  tabCount: 0.15,
  avgAge: 0.15,
  duplicates: 0.10,
  insurancePolicy: 0.20,
  domainConcentration: 0.05,
  windowCount: 0.05,
  attentionFragment: 0.15,
  contextSwitch: 0.10,
  memoryPressure: 0.05
};

// v2 Kişilik tipleri
export const PERSONALITY_TYPES_V2 = [
  { min: 0,  max: 10,  name: "Zen Master",      emoji: "🧘", description: "Dijital minimalist." },
  { min: 11, max: 25,  name: "Tidy Surfer",      emoji: "🏄", description: "Düzenli ve kontrollü." },
  { min: 26, max: 45,  name: "Casual Browser",   emoji: "😎", description: "Normal, sağlıklı kullanım." },
  { min: 46, max: 65,  name: "Tab Enthusiast",   emoji: "📚", description: "Biraz fazla ama idare eder." },
  { min: 66, max: 80,  name: "Digital Hoarder",  emoji: "📦", description: "Ciddi biriktirici." },
  { min: 81, max: 95,  name: "Tab Tornado",      emoji: "🌪️", description: "Kontrol dışı." },
  { min: 96, max: 100, name: "Tab Apocalypse",   emoji: "💥", description: "Acil müdahale gerekli." }
];

// Kategori renkleri ve emoji'leri
export const CATEGORY_STYLES = {
  development:   { color: "#4ecdc4", emoji: "💻" },
  media:         { color: "#ff6b6b", emoji: "🎬" },
  social:        { color: "#a78bfa", emoji: "💬" },
  productivity:  { color: "#e2b714", emoji: "📊" },
  communication: { color: "#60a5fa", emoji: "✉️" },
  shopping:      { color: "#f472b6", emoji: "🛒" },
  research:      { color: "#34d399", emoji: "📚" },
  news:          { color: "#fb923c", emoji: "📰" },
  other:         { color: "#8892b0", emoji: "🔗" }
};
