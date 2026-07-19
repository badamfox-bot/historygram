// Landing-page gallery: cycles through a hand-picked example for every
// category so visitors can see the full mascot family without installing
// the extension. Reuses the exact same drawMascot()/CATEGORY_THEMES as the
// real extension (mascot.js and categories.js here are copies of the
// extension's — keep them in sync when those change).

const DEMO_PROFILES = [
  { category: "Dev & Tools", domains: [["github.com", 61], ["stackoverflow.com", 44], ["npmjs.com", 33], ["developer.mozilla.org", 21], ["vercel.com", 14]], sites: 38, visits: 214, hour: 23 },
  { category: "Entertainment", domains: [["youtube.com", 88], ["netflix.com", 52], ["twitch.tv", 30], ["hulu.com", 17], ["disneyplus.com", 12]], sites: 22, visits: 260, hour: 21 },
  { category: "Social", domains: [["reddit.com", 71], ["x.com", 58], ["instagram.com", 40], ["tiktok.com", 29], ["linkedin.com", 15]], sites: 19, visits: 233, hour: 13 },
  { category: "Shopping", domains: [["amazon.com", 54], ["etsy.com", 26], ["target.com", 19], ["ebay.com", 14], ["walmart.com", 9]], sites: 27, visits: 141, hour: 20 },
  { category: "News", domains: [["nytimes.com", 39], ["bbc.com", 27], ["reuters.com", 18], ["cnn.com", 13], ["apnews.com", 9]], sites: 24, visits: 118, hour: 8 },
  { category: "Search", domains: [["google.com", 143], ["bing.com", 18], ["duckduckgo.com", 12], ["search.brave.com", 8], ["yandex.com", 3]], sites: 12, visits: 191, hour: 11 },
  { category: "Email", domains: [["mail.google.com", 96], ["outlook.com", 22], ["protonmail.com", 6]], sites: 8, visits: 128, hour: 9 },
  { category: "Finance", domains: [["chase.com", 24], ["fidelity.com", 19], ["paypal.com", 15], ["venmo.com", 11], ["robinhood.com", 7]], sites: 16, visits: 82, hour: 19 },
  { category: "Productivity", domains: [["notion.so", 47], ["slack.com", 41], ["docs.google.com", 35], ["trello.com", 18], ["asana.com", 10]], sites: 21, visits: 176, hour: 10 },
  { category: "Reference", domains: [["wikipedia.org", 63], ["khanacademy.org", 22], ["coursera.org", 14], ["dictionary.com", 9], ["edx.org", 6]], sites: 17, visits: 121, hour: 15 },
  { category: "Maps & Travel", domains: [["maps.google.com", 33], ["airbnb.com", 21], ["expedia.com", 15], ["booking.com", 11], ["kayak.com", 8]], sites: 14, visits: 96, hour: 17 },
  { category: "AI & Assistants", domains: [["claude.ai", 74], ["chatgpt.com", 38], ["perplexity.ai", 16], ["gemini.google.com", 9], ["copilot.microsoft.com", 5]], sites: 11, visits: 148, hour: 22 },
  { category: "Music", domains: [["spotify.com", 89], ["soundcloud.com", 24], ["music.apple.com", 13], ["bandcamp.com", 7], ["pandora.com", 4]], sites: 9, visits: 141, hour: 18 },
  { category: "Other", domains: [["myjournal.example", 18], ["hobbyforum.example", 15], ["localnews.example", 11], ["familyrecipes.example", 8], ["oldproject.example", 6]], sites: 31, visits: 89, hour: 12 },
];

const demoCanvas = document.getElementById("demoCanvas");
const demoCtx = demoCanvas.getContext("2d");
const demoLabel = document.getElementById("demoLabel");
const demoPrev = document.getElementById("demoPrev");
const demoNext = document.getElementById("demoNext");

let demoIndex = 0;

function formatHourDemo(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

function roundRectDemo(x, y, w, h, r) {
  demoCtx.beginPath();
  demoCtx.moveTo(x + r, y);
  demoCtx.arcTo(x + w, y, x + w, y + h, r);
  demoCtx.arcTo(x + w, y + h, x, y + h, r);
  demoCtx.arcTo(x, y + h, x, y, r);
  demoCtx.arcTo(x, y, x + w, y, r);
  demoCtx.closePath();
}

function wrapCenteredTextDemo(text, cx, cy, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (demoCtx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => demoCtx.fillText(line, cx, startY + i * lineHeight));
}

function drawDemoStat(x, y, value, label) {
  demoCtx.textAlign = "center";
  demoCtx.font = "800 56px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "#ffffff";
  demoCtx.fillText(String(value), x, y);
  demoCtx.font = "500 24px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "rgba(255,255,255,0.75)";
  demoCtx.fillText(label, x, y + 36);
}

function drawDemoCard(profile, time) {
  const W = demoCanvas.width;
  const H = demoCanvas.height;
  const theme = CATEGORY_THEMES[profile.category];
  const title = theme.noun;

  const gradient = demoCtx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, theme.from);
  gradient.addColorStop(1, theme.to);
  demoCtx.fillStyle = gradient;
  demoCtx.fillRect(0, 0, W, H);

  demoCtx.textAlign = "center";
  demoCtx.fillStyle = "rgba(255,255,255,0.8)";
  demoCtx.font = "600 34px 'Segoe UI', sans-serif";
  demoCtx.fillText("YOUR HISTORYGRAM", W / 2, 140);

  demoCtx.fillStyle = "#ffffff";
  demoCtx.font = "800 78px 'Segoe UI', sans-serif";
  wrapCenteredTextDemo(title, W / 2, 240, 900, 84);

  drawMascot(demoCtx, W / 2, 530, 145, profile.category, "", time);

  demoCtx.font = "500 30px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "rgba(255,255,255,0.85)";
  demoCtx.fillText(`Top category: ${profile.category}`, W / 2, 720);

  drawDemoStat(W * 0.27, 830, profile.sites, "sites visited");
  drawDemoStat(W * 0.73, 830, formatHourDemo(profile.hour), "busiest hour");

  demoCtx.textAlign = "center";
  demoCtx.font = "600 28px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "rgba(255,255,255,0.9)";
  demoCtx.fillText("TOP SITES", W / 2, 970);

  const maxCount = profile.domains[0][1];
  let y = 1020;
  for (const [domain, count] of profile.domains) {
    const barMaxWidth = 700;
    const barWidth = Math.max(20, (count / maxCount) * barMaxWidth);

    demoCtx.textAlign = "left";
    demoCtx.font = "500 26px 'Segoe UI', sans-serif";
    demoCtx.fillStyle = "#ffffff";
    demoCtx.fillText(domain, W / 2 - barMaxWidth / 2, y);

    demoCtx.fillStyle = "rgba(255,255,255,0.25)";
    roundRectDemo(W / 2 - barMaxWidth / 2, y + 14, barMaxWidth, 14, 7);
    demoCtx.fill();

    demoCtx.fillStyle = "rgba(255,255,255,0.9)";
    roundRectDemo(W / 2 - barMaxWidth / 2, y + 14, barWidth, 14, 7);
    demoCtx.fill();

    y += 70;
  }

  demoCtx.textAlign = "center";
  demoCtx.font = "400 22px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "rgba(255,255,255,0.6)";
  demoCtx.fillText(`Last 30 days · ${profile.visits} visits · example data`, W / 2, H - 60);
  demoCtx.font = "600 24px 'Segoe UI', sans-serif";
  demoCtx.fillStyle = "rgba(255,255,255,0.85)";
  demoCtx.fillText("historygram", W / 2, H - 25);
}

function updateDemoLabel() {
  demoLabel.textContent = `${demoIndex + 1} / ${DEMO_PROFILES.length} — ${DEMO_PROFILES[demoIndex].category}`;
}

demoPrev.addEventListener("click", () => {
  demoIndex = (demoIndex - 1 + DEMO_PROFILES.length) % DEMO_PROFILES.length;
  updateDemoLabel();
});

demoNext.addEventListener("click", () => {
  demoIndex = (demoIndex + 1) % DEMO_PROFILES.length;
  updateDemoLabel();
});

updateDemoLabel();

function demoLoop(time) {
  drawDemoCard(DEMO_PROFILES[demoIndex], time);
  requestAnimationFrame(demoLoop);
}
requestAnimationFrame(demoLoop);
