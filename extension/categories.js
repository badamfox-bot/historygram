// Small, hand-picked domain -> category map, plus a lightweight keyword
// fallback for domains we don't have an exact match for. This is a fun
// heuristic, not a precise classifier.
const DOMAIN_CATEGORIES = {
  "github.com": "Dev & Tools",
  "stackoverflow.com": "Dev & Tools",
  "npmjs.com": "Dev & Tools",
  "developer.mozilla.org": "Dev & Tools",
  "gitlab.com": "Dev & Tools",
  "vercel.com": "Dev & Tools",
  "codepen.io": "Dev & Tools",
  "replit.com": "Dev & Tools",
  "stackexchange.com": "Dev & Tools",

  "youtube.com": "Entertainment",
  "netflix.com": "Entertainment",
  "twitch.tv": "Entertainment",
  "hulu.com": "Entertainment",
  "disneyplus.com": "Entertainment",
  "max.com": "Entertainment",
  "primevideo.com": "Entertainment",

  "twitter.com": "Social",
  "x.com": "Social",
  "reddit.com": "Social",
  "facebook.com": "Social",
  "instagram.com": "Social",
  "linkedin.com": "Social",
  "tiktok.com": "Social",
  "threads.net": "Social",
  "pinterest.com": "Social",
  "snapchat.com": "Social",

  "amazon.com": "Shopping",
  "ebay.com": "Shopping",
  "etsy.com": "Shopping",
  "target.com": "Shopping",
  "walmart.com": "Shopping",
  "shopify.com": "Shopping",

  "nytimes.com": "News",
  "cnn.com": "News",
  "bbc.com": "News",
  "washingtonpost.com": "News",
  "reuters.com": "News",
  "apnews.com": "News",
  "npr.org": "News",

  "google.com": "Search",
  "bing.com": "Search",
  "duckduckgo.com": "Search",
  "search.brave.com": "Search",
  "search.yahoo.com": "Search",
  "yandex.com": "Search",
  "startpage.com": "Search",
  "ecosia.org": "Search",
  "accounts.google.com": "Search",

  "mail.google.com": "Email",
  "outlook.com": "Email",
  "outlook.office.com": "Email",
  "mail.yahoo.com": "Email",
  "protonmail.com": "Email",

  "chase.com": "Finance",
  "bankofamerica.com": "Finance",
  "wellsfargo.com": "Finance",
  "paypal.com": "Finance",
  "venmo.com": "Finance",
  "creditkarma.com": "Finance",
  "mint.com": "Finance",
  "fidelity.com": "Finance",
  "schwab.com": "Finance",
  "vanguard.com": "Finance",
  "coinbase.com": "Finance",
  "robinhood.com": "Finance",

  "docs.google.com": "Productivity",
  "drive.google.com": "Productivity",
  "sheets.google.com": "Productivity",
  "slides.google.com": "Productivity",
  "calendar.google.com": "Productivity",
  "meet.google.com": "Productivity",
  "notion.so": "Productivity",
  "asana.com": "Productivity",
  "trello.com": "Productivity",
  "slack.com": "Productivity",
  "airtable.com": "Productivity",
  "clickup.com": "Productivity",
  "monday.com": "Productivity",
  "office.com": "Productivity",

  "wikipedia.org": "Reference",
  "en.wikipedia.org": "Reference",
  "wikihow.com": "Reference",
  "britannica.com": "Reference",
  "dictionary.com": "Reference",
  "khanacademy.org": "Reference",
  "coursera.org": "Reference",
  "edx.org": "Reference",

  "maps.google.com": "Maps & Travel",
  "expedia.com": "Maps & Travel",
  "booking.com": "Maps & Travel",
  "airbnb.com": "Maps & Travel",
  "kayak.com": "Maps & Travel",
  "tripadvisor.com": "Maps & Travel",
  "delta.com": "Maps & Travel",
  "united.com": "Maps & Travel",
  "southwest.com": "Maps & Travel",

  "chatgpt.com": "AI & Assistants",
  "chat.openai.com": "AI & Assistants",
  "openai.com": "AI & Assistants",
  "claude.ai": "AI & Assistants",
  "anthropic.com": "AI & Assistants",
  "gemini.google.com": "AI & Assistants",
  "perplexity.ai": "AI & Assistants",
  "copilot.microsoft.com": "AI & Assistants",

  "spotify.com": "Music",
  "soundcloud.com": "Music",
  "music.apple.com": "Music",
  "music.youtube.com": "Music",
  "pandora.com": "Music",
  "bandcamp.com": "Music",
};

// Keyword fallback for anything not in the exact map above.
const CATEGORY_KEYWORDS = [
  [/bank|paypal|venmo|creditkarma|fidelity|schwab|vanguard|coinbase|robinhood/, "Finance"],
  [/notion|asana|trello|clickup|monday\.com|slack|airtable|docs\.|drive\.|sheets\.|calendar\./, "Productivity"],
  [/wikipedia|wikihow|britannica|dictionary|thesaurus|khanacademy|coursera|\bedx\b/, "Reference"],
  [/\bmaps\.|expedia|booking\.com|airbnb|kayak|tripadvisor|\bairlines?\b|hotel/, "Maps & Travel"],
  [/openai|chatgpt|claude|anthropic|gemini|perplexity|copilot|midjourney/, "AI & Assistants"],
  [/spotify|soundcloud|\bmusic\.|pandora|bandcamp/, "Music"],
  [/youtube|netflix|twitch|hulu|disneyplus|primevideo/, "Entertainment"],
  [/twitter|reddit|facebook|instagram|linkedin|tiktok|threads\.net|pinterest|snapchat|\bx\.com/, "Social"],
  [/amazon|ebay|etsy|shopify|shop\./, "Shopping"],
  [/news|nytimes|cnn|bbc|reuters|apnews|npr\.org/, "News"],
  [/search\.|duckduckgo|bing\.com|yandex|startpage|ecosia/, "Search"],
  [/mail\.|outlook|protonmail/, "Email"],
  [/github|gitlab|stackoverflow|npmjs|developer\.|vercel|codepen|replit/, "Dev & Tools"],
];

function categorize(domain) {
  if (DOMAIN_CATEGORIES[domain]) return DOMAIN_CATEGORIES[domain];
  const d = domain.toLowerCase();
  for (const [pattern, category] of CATEGORY_KEYWORDS) {
    if (pattern.test(d)) return category;
  }
  return "Other";
}

// Every theme is a vivid two-color gradient — including "Other", which used
// to be flat gray and was the single biggest complaint about the card.
const CATEGORY_THEMES = {
  "Dev & Tools": { from: "#0b132b", to: "#3a86ff", noun: "Builder" },
  "Entertainment": { from: "#7b2ff7", to: "#f107a3", noun: "Binge-Watcher" },
  "Social": { from: "#a44cf7", to: "#ff61d2", noun: "Scroller" },
  "Shopping": { from: "#11998e", to: "#38ef7d", noun: "Shopper" },
  "News": { from: "#142850", to: "#00b4d8", noun: "Newshound" },
  "Search": { from: "#360033", to: "#0b8793", noun: "Seeker" },
  "Email": { from: "#f7971e", to: "#ffd200", noun: "Inbox Warrior" },
  "Finance": { from: "#f7b733", to: "#fc4a1a", noun: "Number Cruncher" },
  "Productivity": { from: "#43cea2", to: "#185a9d", noun: "Taskmaster" },
  "Reference": { from: "#ff9966", to: "#ff5e62", noun: "Know-It-All" },
  "Maps & Travel": { from: "#2193b0", to: "#6dd5ed", noun: "Globetrotter" },
  "AI & Assistants": { from: "#8e2de2", to: "#4a00e0", noun: "Robot Whisperer" },
  "Music": { from: "#ee0979", to: "#ff6a00", noun: "Melomaniac" },
  "Other": { from: "#12c2e9", to: "#f64f59", noun: "Wanderer" },
};
