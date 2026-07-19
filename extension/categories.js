// Small, hand-picked domain -> category map. Anything not listed falls back to "Other".
// This is a fun heuristic, not a precise classifier.
const DOMAIN_CATEGORIES = {
  "github.com": "Dev & Tools",
  "stackoverflow.com": "Dev & Tools",
  "npmjs.com": "Dev & Tools",
  "developer.mozilla.org": "Dev & Tools",
  "gitlab.com": "Dev & Tools",
  "vercel.com": "Dev & Tools",
  "codepen.io": "Dev & Tools",
  "replit.com": "Dev & Tools",

  "youtube.com": "Entertainment",
  "netflix.com": "Entertainment",
  "twitch.tv": "Entertainment",
  "hulu.com": "Entertainment",
  "disneyplus.com": "Entertainment",
  "spotify.com": "Entertainment",

  "twitter.com": "Social",
  "x.com": "Social",
  "reddit.com": "Social",
  "facebook.com": "Social",
  "instagram.com": "Social",
  "linkedin.com": "Social",
  "tiktok.com": "Social",
  "threads.net": "Social",

  "amazon.com": "Shopping",
  "ebay.com": "Shopping",
  "etsy.com": "Shopping",
  "target.com": "Shopping",
  "walmart.com": "Shopping",

  "nytimes.com": "News",
  "cnn.com": "News",
  "bbc.com": "News",
  "washingtonpost.com": "News",
  "reuters.com": "News",
  "apnews.com": "News",

  "google.com": "Search",
  "bing.com": "Search",
  "duckduckgo.com": "Search",

  "mail.google.com": "Email",
  "outlook.com": "Email",
  "outlook.office.com": "Email",
};

function categorize(domain) {
  return DOMAIN_CATEGORIES[domain] || "Other";
}

const CATEGORY_THEMES = {
  "Dev & Tools": { from: "#1f2937", to: "#0ea5e9", noun: "Builder" },
  "Entertainment": { from: "#7c2d12", to: "#f97316", noun: "Binge-Watcher" },
  "Social": { from: "#4c1d95", to: "#d946ef", noun: "Scroller" },
  "Shopping": { from: "#134e4a", to: "#10b981", noun: "Shopper" },
  "News": { from: "#1e3a8a", to: "#3b82f6", noun: "Newshound" },
  "Search": { from: "#312e81", to: "#6366f1", noun: "Seeker" },
  "Email": { from: "#374151", to: "#9ca3af", noun: "Inbox Warrior" },
  "Other": { from: "#3f3f46", to: "#a1a1aa", noun: "Wanderer" },
};
