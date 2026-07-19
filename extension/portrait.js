const DAYS_BACK = 30;
const MAX_RESULTS = 10000;

const statusEl = document.getElementById("status");
const canvas = document.getElementById("portraitCanvas");
const downloadBtn = document.getElementById("downloadBtn");
const ctx = canvas.getContext("2d");

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

async function buildPortrait() {
  const startTime = Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000;
  const results = await api.history.search({
    text: "",
    startTime,
    maxResults: MAX_RESULTS,
  });

  if (results.length === 0) {
    statusEl.textContent =
      "No history found in the last 30 days — nothing to portrait yet.";
    return;
  }

  const domainCounts = {};
  const categoryCounts = {};
  const hourCounts = new Array(24).fill(0);
  let totalWeight = 0;

  for (const item of results) {
    const domain = hostnameOf(item.url);
    if (!domain) continue;

    const weight = item.visitCount && item.visitCount > 0 ? item.visitCount : 1;
    domainCounts[domain] = (domainCounts[domain] || 0) + weight;
    totalWeight += weight;

    const category = categorize(domain);
    categoryCounts[category] = (categoryCounts[category] || 0) + weight;

    const hour = new Date(item.lastVisitTime).getHours();
    hourCounts[hour] += weight;
  }

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topCategory = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const busiestHour = hourCounts.indexOf(Math.max(...hourCounts));

  const nightWeight = [22, 23, 0, 1, 2, 3, 4].reduce(
    (sum, h) => sum + hourCounts[h],
    0
  );
  const morningWeight = [5, 6, 7, 8].reduce((sum, h) => sum + hourCounts[h], 0);
  const nightShare = nightWeight / totalWeight;
  const morningShare = morningWeight / totalWeight;

  let prefix = "";
  if (nightShare > 0.35) prefix = "Night Owl ";
  else if (morningShare > 0.35) prefix = "Early Bird ";

  const theme = CATEGORY_THEMES[topCategory];
  const title = `${prefix}${theme.noun}`;

  render({
    title,
    topCategory,
    topDomains,
    uniqueSites: Object.keys(domainCounts).length,
    totalVisits: totalWeight,
    busiestHour,
    theme,
    prefix,
  });
}

function render({
  title,
  topCategory,
  topDomains,
  uniqueSites,
  totalVisits,
  busiestHour,
  theme,
  prefix,
}) {
  const W = canvas.width;
  const H = canvas.height;

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, theme.from);
  gradient.addColorStop(1, theme.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "600 34px 'Segoe UI', sans-serif";
  ctx.fillText("YOUR HISTORYGRAM", W / 2, 140);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 78px 'Segoe UI', sans-serif";
  wrapCenteredText(title, W / 2, 240, 900, 84);

  drawMascot(ctx, W / 2, 500, 150, topCategory, prefix);

  ctx.font = "500 30px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`Top category: ${topCategory}`, W / 2, 720);

  // Stat row
  drawStat(W * 0.27, 830, uniqueSites, "sites visited");
  drawStat(W * 0.73, 830, formatHour(busiestHour), "busiest hour");

  // Top domains list
  ctx.textAlign = "center";
  ctx.font = "600 28px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("TOP SITES", W / 2, 970);

  const maxCount = topDomains[0][1];
  let y = 1020;
  for (const [domain, count] of topDomains) {
    const barMaxWidth = 700;
    const barWidth = Math.max(20, (count / maxCount) * barMaxWidth);

    ctx.textAlign = "left";
    ctx.font = "500 26px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(domain, W / 2 - barMaxWidth / 2, y);

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    roundRect(W / 2 - barMaxWidth / 2, y + 14, barMaxWidth, 14, 7);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(W / 2 - barMaxWidth / 2, y + 14, barWidth, 14, 7);
    ctx.fill();

    y += 70;
  }

  ctx.textAlign = "center";
  ctx.font = "400 22px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(
    `Last ${DAYS_BACK} days · ${totalVisits} visits · generated locally`,
    W / 2,
    H - 60
  );
  ctx.font = "600 24px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("historygram", W / 2, H - 25);

  statusEl.classList.add("hidden");
  canvas.classList.remove("hidden");
  downloadBtn.classList.remove("hidden");
}

function drawStat(x, y, value, label) {
  ctx.textAlign = "center";
  ctx.font = "800 56px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(value), x, y);
  ctx.font = "500 24px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(label, x, y + 36);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapCenteredText(text, cx, cy, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineHeight);
  });
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "historygram.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

buildPortrait().catch((err) => {
  statusEl.textContent = `Something went wrong: ${err.message}`;
});
