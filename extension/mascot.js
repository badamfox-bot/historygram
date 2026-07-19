// A small "mascot family" in the vein of Kirby / MLP / Happy Tree Friends:
// one consistent big-eyed, glossy, thick-outlined character, where only the
// color (from the category theme), expression, and held prop change.
// Drawn entirely with canvas primitives — no image assets to fetch or license.

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v)))
    .toString(16)
    .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(hex, target, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

const lighten = (hex, amt) => mix(hex, "#ffffff", amt);
const darken = (hex, amt) => mix(hex, "#000000", amt);

const EXPRESSIONS = {
  "Dev & Tools": { brow: "slant", mouth: "smirk" },
  "Entertainment": { brow: "raised", mouth: "grin" },
  "Social": { brow: "slant", mouth: "smirk", squint: 0.3, lookDx: -0.15 },
  "Shopping": { brow: "raised", mouth: "grin" },
  "News": { brow: "oneRaised", mouth: "flat" },
  "Search": { brow: "raised", mouth: "pursed", squint: 0.25, lookDy: -0.08 },
  "Email": { brow: "droopy", mouth: "flat", squint: 0.45 },
  "Finance": { brow: "raised", mouth: "grin" },
  "Productivity": { brow: "slant", mouth: "smirk" },
  "Reference": { brow: "oneRaised", mouth: "smile" },
  "Maps & Travel": { brow: "raised", mouth: "smile", lookDy: -0.08 },
  "AI & Assistants": { brow: "raised", mouth: "smile", sparkles: true },
  "Music": { closed: true, mouth: "o" },
  "Other": { brow: "raised", mouth: "o", crossed: true },
};

function drawMascot(ctx, cx, cy, r, category, prefix) {
  ctx.save();

  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
  const bodyColor = lighten(theme.to, 0.35);
  const outlineColor = darken(theme.to, 0.45);
  const expr = EXPRESSIONS[category] || EXPRESSIONS["Other"];

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.95, r * 0.7, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // Stub feet
  ctx.fillStyle = outlineColor;
  for (const dx of [-r * 0.32, r * 0.32]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + r * 0.88, r * 0.16, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.lineWidth = r * 0.06;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // Glossy highlight
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, cy - r * 0.5, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  drawFace(ctx, cx, cy - r * 0.05, r, expr, outlineColor);
  drawBlush(ctx, cx, cy, r, theme.to);

  if (expr.sparkles) drawSparkles(ctx, cx, cy, r);

  // Stub arm reaching toward the prop
  const propAngle = -0.35;
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.ellipse(
    cx + Math.cos(propAngle) * r * 0.85,
    cy + Math.sin(propAngle) * r * 0.85 + r * 0.35,
    r * 0.16,
    r * 0.11,
    propAngle,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  const accent = theme.to;
  drawProp(ctx, cx, cy, r, category, accent, outlineColor);

  if (prefix === "Night Owl ") drawNightModifier(ctx, cx, cy, r);
  else if (prefix === "Early Bird ") drawMorningModifier(ctx, cx, cy, r);

  ctx.restore();
}

function drawFace(ctx, cx, cy, r, expr, outlineColor) {
  const eyeDx = r * 0.3;
  const eyeY = cy - r * 0.02;
  const eyeR = r * 0.19;

  if (expr.closed) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = r * 0.035;
    for (const dx of [-eyeDx, eyeDx]) {
      ctx.beginPath();
      ctx.arc(cx + dx, eyeY, r * 0.14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
  } else {
    const lookDy = (expr.lookDy || 0) * r;
    if (expr.crossed) {
      const crossVal = r * 0.28;
      drawBigEye(ctx, cx - eyeDx, eyeY, eyeR, expr.squint || 0, crossVal, lookDy, outlineColor);
      drawBigEye(ctx, cx + eyeDx, eyeY, eyeR, expr.squint || 0, -crossVal, lookDy, outlineColor);
    } else {
      const lookDx = (expr.lookDx || 0) * r;
      drawBigEye(ctx, cx - eyeDx, eyeY, eyeR, expr.squint || 0, lookDx, lookDy, outlineColor);
      drawBigEye(ctx, cx + eyeDx, eyeY, eyeR, expr.squint || 0, lookDx, lookDy, outlineColor);
    }
  }

  drawEyebrows(ctx, cx, eyeY, r, eyeDx, expr.brow, outlineColor);
  drawMouth(ctx, cx, cy + r * 0.36, r, expr.mouth, outlineColor);
}

function drawBigEye(ctx, x, y, r, squint, lookDx, lookDy, outlineColor) {
  ctx.save();

  // white
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * (1 - squint * 0.6), 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = r * 0.14;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // clip iris/pupil to the eye white so squint eyelids look right
  ctx.clip();

  // iris
  const ix = x + lookDx;
  const iy = y + lookDy;
  ctx.beginPath();
  ctx.arc(ix, iy, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = "#2b2250";
  ctx.fill();

  // pupil
  ctx.beginPath();
  ctx.arc(ix, iy, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#0e0a1f";
  ctx.fill();

  // highlights
  ctx.beginPath();
  ctx.arc(ix - r * 0.28, iy - r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ix + r * 0.22, iy + r * 0.28, r * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fill();

  // eyelid for squint
  if (squint > 0) {
    ctx.beginPath();
    ctx.rect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 1.2 * squint);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  ctx.restore();
}

function drawEyebrows(ctx, cx, eyeY, r, eyeDx, style, outlineColor) {
  if (!style) return;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.045;
  ctx.lineCap = "round";
  const browY = eyeY - r * 0.42;

  const arch = (x, tilt) => {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.16, browY + tilt);
    ctx.quadraticCurveTo(x, browY - r * 0.1, x + r * 0.16, browY - tilt);
    ctx.stroke();
  };

  switch (style) {
    case "raised":
      arch(cx - eyeDx, r * 0.02);
      arch(cx + eyeDx, r * 0.02);
      break;
    case "oneRaised":
      arch(cx - eyeDx, -r * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx + eyeDx - r * 0.16, browY);
      ctx.lineTo(cx + eyeDx + r * 0.16, browY);
      ctx.stroke();
      break;
    case "slant":
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx - r * 0.16, browY + r * 0.05);
      ctx.lineTo(cx - eyeDx + r * 0.16, browY - r * 0.08);
      ctx.moveTo(cx + eyeDx - r * 0.16, browY - r * 0.08);
      ctx.lineTo(cx + eyeDx + r * 0.16, browY + r * 0.05);
      ctx.stroke();
      break;
    case "droopy":
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx - r * 0.16, browY - r * 0.05);
      ctx.lineTo(cx - eyeDx + r * 0.16, browY + r * 0.08);
      ctx.moveTo(cx + eyeDx - r * 0.16, browY + r * 0.08);
      ctx.lineTo(cx + eyeDx + r * 0.16, browY - r * 0.05);
      ctx.stroke();
      break;
  }
}

function drawMouth(ctx, cx, cy, r, style, outlineColor) {
  ctx.strokeStyle = outlineColor;
  ctx.fillStyle = outlineColor;
  ctx.lineWidth = r * 0.045;
  ctx.lineCap = "round";

  switch (style) {
    case "grin":
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.22, r * 0.16, 0, 0, Math.PI, false);
      ctx.fill();
      break;
    case "smile":
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.05, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    case "smirk":
      ctx.beginPath();
      ctx.arc(cx + r * 0.05, cy, r * 0.16, 0.15 * Math.PI, 0.7 * Math.PI);
      ctx.stroke();
      break;
    case "flat":
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.16, cy);
      ctx.lineTo(cx + r * 0.16, cy);
      ctx.stroke();
      break;
    case "pursed":
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "o":
    default:
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
  }
}

function drawBlush(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = color;
  for (const dx of [-r * 0.55, r * 0.55]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + r * 0.22, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSparkles(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = "#ffe97a";
  ctx.font = `${Math.round(r * 0.3)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("✦", cx - r * 0.9, cy - r * 0.75);
  ctx.font = `${Math.round(r * 0.22)}px sans-serif`;
  ctx.fillText("✦", cx + r * 0.95, cy - r * 0.55);
  ctx.restore();
}

function drawProp(ctx, cx, cy, r, category, accent, outlineColor) {
  const px = cx + r * 0.95;
  const py = cy + r * 0.55;

  ctx.fillStyle = accent;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.03;

  switch (category) {
    case "Dev & Tools": {
      roundRectPath(ctx, px - r * 0.3, py - r * 0.22, r * 0.6, r * 0.4, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(px - r * 0.24, py - r * 0.16, r * 0.48, r * 0.24);
      break;
    }
    case "Entertainment": {
      ctx.beginPath();
      ctx.moveTo(px - r * 0.22, py - r * 0.28);
      ctx.lineTo(px + r * 0.22, py - r * 0.28);
      ctx.lineTo(px + r * 0.3, py + r * 0.28);
      ctx.lineTo(px - r * 0.3, py + r * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "Social": {
      roundRectPath(ctx, px - r * 0.18, py - r * 0.3, r * 0.36, r * 0.58, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff5c7a";
      heart(ctx, px, py, r * 0.1);
      break;
    }
    case "Shopping": {
      ctx.beginPath();
      ctx.moveTo(px - r * 0.24, py - r * 0.24);
      ctx.lineTo(px + r * 0.24, py - r * 0.24);
      ctx.lineTo(px + r * 0.3, py + r * 0.3);
      ctx.lineTo(px - r * 0.3, py + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py - r * 0.24, r * 0.12, Math.PI, 0);
      ctx.stroke();
      break;
    }
    case "News": {
      roundRectPath(ctx, px - r * 0.32, py - r * 0.18, r * 0.64, r * 0.36, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(px - r * 0.24, py + i * r * 0.1);
        ctx.lineTo(px + r * 0.24, py + i * r * 0.1);
        ctx.stroke();
      }
      break;
    }
    case "Search": {
      ctx.beginPath();
      ctx.arc(px - r * 0.05, py - r * 0.05, r * 0.22, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + r * 0.12, py + r * 0.12);
      ctx.lineTo(px + r * 0.3, py + r * 0.3);
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
      break;
    }
    case "Email": {
      roundRectPath(ctx, px - r * 0.3, py - r * 0.2, r * 0.6, r * 0.4, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - r * 0.3, py - r * 0.2);
      ctx.lineTo(px, py + r * 0.05);
      ctx.lineTo(px + r * 0.3, py - r * 0.2);
      ctx.strokeStyle = outlineColor;
      ctx.stroke();
      break;
    }
    case "Finance": {
      for (const [dx, dy] of [[0, r * 0.1], [r * 0.08, -r * 0.05], [-r * 0.08, -r * 0.18]]) {
        ctx.beginPath();
        ctx.arc(px + dx, py + dy, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(r * 0.18)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("$", px - r * 0.08, py - r * 0.12);
      break;
    }
    case "Productivity": {
      roundRectPath(ctx, px - r * 0.26, py - r * 0.32, r * 0.52, r * 0.62, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = r * 0.04;
      for (const dy of [-r * 0.12, r * 0.05, r * 0.2]) {
        ctx.beginPath();
        ctx.moveTo(px - r * 0.16, py + dy);
        ctx.lineTo(px + r * 0.16, py + dy);
        ctx.stroke();
      }
      break;
    }
    case "Reference": {
      ctx.beginPath();
      ctx.moveTo(px - r * 0.28, py - r * 0.2);
      ctx.lineTo(px, py - r * 0.12);
      ctx.lineTo(px + r * 0.28, py - r * 0.2);
      ctx.lineTo(px + r * 0.28, py + r * 0.22);
      ctx.lineTo(px, py + r * 0.14);
      ctx.lineTo(px - r * 0.28, py + r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, py - r * 0.12);
      ctx.lineTo(px, py + r * 0.14);
      ctx.strokeStyle = outlineColor;
      ctx.stroke();
      break;
    }
    case "Maps & Travel": {
      ctx.beginPath();
      ctx.moveTo(px, py + r * 0.32);
      ctx.quadraticCurveTo(px - r * 0.28, py, px, py - r * 0.3);
      ctx.quadraticCurveTo(px + r * 0.28, py, px, py + r * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py - r * 0.08, r * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      break;
    }
    case "AI & Assistants": {
      ctx.fillStyle = accent;
      roundRectPath(ctx, px - r * 0.28, py - r * 0.22, r * 0.56, r * 0.36, 10);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - r * 0.08, py + r * 0.14);
      ctx.lineTo(px - r * 0.16, py + r * 0.3);
      ctx.lineTo(px + r * 0.02, py + r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(r * 0.16)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("✦", px, py + r * 0.02);
      break;
    }
    case "Music": {
      ctx.fillStyle = accent;
      ctx.font = `700 ${Math.round(r * 0.6)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.02;
      ctx.fillText("♪", px, py + r * 0.2);
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(px, py, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(px, py - r * 0.16);
      ctx.lineTo(px + r * 0.06, py);
      ctx.lineTo(px, py + r * 0.16);
      ctx.lineTo(px - r * 0.06, py);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawNightModifier(ctx, cx, cy, r) {
  ctx.fillStyle = "rgba(20,20,20,0.85)";
  roundRectPath(ctx, cx - r * 0.5, cy - r * 0.16, r * 0.32, r * 0.2, 6);
  ctx.fill();
  roundRectPath(ctx, cx + r * 0.18, cy - r * 0.16, r * 0.32, r * 0.2, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.18, cy - r * 0.08);
  ctx.lineTo(cx + r * 0.18, cy - r * 0.08);
  ctx.strokeStyle = "rgba(20,20,20,0.85)";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "#ffe27a";
  ctx.beginPath();
  ctx.arc(cx - r * 0.75, cy - r * 0.85, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx - r * 0.68, cy - r * 0.9, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMorningModifier(ctx, cx, cy, r) {
  const mx = cx - r * 0.95;
  const my = cy + r * 0.55;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 4;
  roundRectPath(ctx, mx - r * 0.2, my - r * 0.15, r * 0.4, r * 0.3, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(mx + r * 0.22, my, r * 0.1, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 3;
  for (const dx of [-r * 0.08, r * 0.08]) {
    ctx.beginPath();
    ctx.moveTo(mx + dx, my - r * 0.2);
    ctx.quadraticCurveTo(mx + dx - r * 0.05, my - r * 0.32, mx + dx, my - r * 0.42);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(cx + r * 0.85, cy - r * 0.9, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

function heart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x - size, y - size * 0.6, x - size * 1.4, y + size * 0.5, x, y + size * 1.3);
  ctx.bezierCurveTo(x + size * 1.4, y + size * 0.5, x + size, y - size * 0.6, x, y + size * 0.3);
  ctx.fill();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
