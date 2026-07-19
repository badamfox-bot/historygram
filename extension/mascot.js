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
  "Dev & Tools": { brow: "slant", mouth: "smirk", ears: "fox", whiskers: true },
  "Entertainment": { brow: "raised", mouth: "grin", ears: "bunny" },
  "Social": { brow: "slant", mouth: "smirk", squint: 0.3, lookDx: -0.15, ears: "bunny" },
  "Shopping": { brow: "raised", mouth: "grin", ears: "round" },
  "News": { brow: "oneRaised", mouth: "flat", ears: "fox", whiskers: true },
  "Search": { brow: "raised", mouth: "pursed", squint: 0.25, lookDy: -0.08, ears: "fox", whiskers: true },
  "Email": { brow: "droopy", mouth: "flat", squint: 0.45, ears: "round" },
  "Finance": { brow: "raised", mouth: "grin", ears: "round" },
  "Productivity": { brow: "slant", mouth: "smirk", ears: "round" },
  "Reference": { brow: "oneRaised", mouth: "smile", ears: "round" },
  "Maps & Travel": { brow: "raised", mouth: "smile", lookDy: -0.08, ears: "wing" },
  "AI & Assistants": { brow: "raised", mouth: "smile", sparkles: true, ears: "antenna" },
  "Music": { closed: true, mouth: "o", ears: "wing" },
  "Other": { brow: "raised", mouth: "o", crossed: true, ears: "round" },
};

function blinkPulse(time) {
  const cycle = 4200;
  const windowMs = 220;
  const t = time % cycle;
  if (t < cycle - windowMs) return 0;
  const p = (t - (cycle - windowMs)) / windowMs;
  return Math.sin(p * Math.PI);
}

function drawMascot(ctx, cx, cy, r, category, prefix, time = 0) {
  ctx.save();

  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
  const bodyColor = lighten(theme.to, 0.35);
  const outlineColor = darken(theme.to, 0.45);
  const expr = EXPRESSIONS[category] || EXPRESSIONS["Other"];

  const bob = Math.sin(time / 900) * r * 0.035;
  const bobNorm = Math.sin(time / 900); // -1..1
  const sway = Math.sin(time / 1500) * 0.035;

  // Ground shadow stays put; pulses gently with the bob for a grounded feel
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy + r * 0.95,
    r * 0.7 * (1 - bobNorm * 0.06),
    r * 0.16 * (1 - bobNorm * 0.06),
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(sway);
  ctx.translate(-cx, -cy);

  // Stub feet
  ctx.fillStyle = outlineColor;
  for (const dx of [-r * 0.32, r * 0.32]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + r * 0.88, r * 0.16, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tail, peeking out from behind (drawn before the body so the body overlaps its base)
  drawTail(ctx, cx, cy, r, bodyColor, outlineColor, time);

  // Ears, drawn before the body so the body overlaps their base — reads as attached
  drawEars(ctx, cx, cy, r, expr.ears || "round", bodyColor, outlineColor);

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

  drawFace(ctx, cx, cy - r * 0.05, r, expr, outlineColor, blinkPulse(time));
  drawBlush(ctx, cx, cy, r, theme.to);

  if (expr.sparkles) drawSparkles(ctx, cx, cy, r);

  const accent = theme.to;
  drawAction(ctx, cx, cy, r, category, accent, outlineColor, bodyColor, time);

  if (prefix === "Night Owl ") drawNightModifier(ctx, cx, cy, r);
  else if (prefix === "Early Bird ") drawMorningModifier(ctx, cx, cy, r);

  ctx.restore(); // undo bob/sway transform
  ctx.restore(); // outer save
}

function drawFace(ctx, cx, cy, r, expr, outlineColor, blink = 0) {
  const eyeDx = r * 0.3;
  const eyeY = cy - r * 0.02;
  const eyeR = r * 0.19;
  const squint = Math.min(1, (expr.squint || 0) + blink);

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
      drawBigEye(ctx, cx - eyeDx, eyeY, eyeR, squint, crossVal, lookDy, outlineColor);
      drawBigEye(ctx, cx + eyeDx, eyeY, eyeR, squint, -crossVal, lookDy, outlineColor);
    } else {
      const lookDx = (expr.lookDx || 0) * r;
      drawBigEye(ctx, cx - eyeDx, eyeY, eyeR, squint, lookDx, lookDy, outlineColor);
      drawBigEye(ctx, cx + eyeDx, eyeY, eyeR, squint, lookDx, lookDy, outlineColor);
    }
  }

  drawEyebrows(ctx, cx, eyeY, r, eyeDx, expr.brow, outlineColor);
  drawNose(ctx, cx, cy + r * 0.18, r, outlineColor);
  if (expr.whiskers) drawWhiskers(ctx, cx, cy + r * 0.2, r, outlineColor);
  drawMouth(ctx, cx, cy + r * 0.36, r, expr.mouth, outlineColor);
}

function drawNose(ctx, cx, cy, r, outlineColor) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.05, r * 0.035, 0, 0, Math.PI * 2);
  ctx.fillStyle = outlineColor;
  ctx.fill();
}

function drawWhiskers(ctx, cx, cy, r, outlineColor) {
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.025;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    for (const dy of [-r * 0.05, 0, r * 0.05]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.42, cy + dy);
      ctx.lineTo(cx + side * r * 0.68, cy + dy * 1.6);
      ctx.stroke();
    }
  }
}

function drawEars(ctx, cx, cy, r, style, bodyColor, outlineColor) {
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.05;

  const baseY = cy - r * 0.78;
  const dxs = [-r * 0.42, r * 0.42];

  switch (style) {
    case "fox":
      for (const dx of dxs) {
        const sign = Math.sign(dx) || 1;
        ctx.beginPath();
        ctx.moveTo(cx + dx - sign * r * 0.16, baseY + r * 0.15);
        ctx.lineTo(cx + dx + sign * r * 0.06, baseY - r * 0.42);
        ctx.lineTo(cx + dx + sign * r * 0.22, baseY + r * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "bunny":
      for (const dx of dxs) {
        ctx.beginPath();
        ctx.ellipse(cx + dx, baseY - r * 0.28, r * 0.15, r * 0.48, dx < 0 ? -0.12 : 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "wing":
      for (const dx of dxs) {
        const sign = Math.sign(dx) || 1;
        ctx.beginPath();
        ctx.moveTo(cx + dx - sign * r * 0.1, baseY + r * 0.2);
        ctx.quadraticCurveTo(cx + dx + sign * r * 0.42, baseY - r * 0.1, cx + dx + sign * r * 0.1, baseY - r * 0.4);
        ctx.quadraticCurveTo(cx + dx - sign * r * 0.05, baseY - r * 0.1, cx + dx - sign * r * 0.1, baseY + r * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "antenna":
      for (const dx of dxs) {
        ctx.beginPath();
        ctx.moveTo(cx + dx, baseY + r * 0.2);
        ctx.lineTo(cx + dx * 1.15, baseY - r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + dx * 1.15, baseY - r * 0.42, r * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "round":
    default:
      for (const dx of dxs) {
        ctx.beginPath();
        ctx.arc(cx + dx, baseY - r * 0.12, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
  }
}

function drawTail(ctx, cx, cy, r, bodyColor, outlineColor, time = 0) {
  const wag = Math.sin(time / 500) * 0.25;
  const tx = cx - r * 0.72;
  const ty = cy + r * 0.55;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(wag);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-r * 0.35, -r * 0.1, -r * 0.28, -r * 0.42);
  ctx.quadraticCurveTo(-r * 0.05, -r * 0.28, 0, 0);
  ctx.closePath();
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.lineWidth = r * 0.04;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();
  ctx.restore();
}

function drawHand(ctx, x, y, angle, r, bodyColor, outlineColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.16, r * 0.11, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.lineWidth = r * 0.04;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();
  ctx.restore();
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

function pulseWindow(time, cycle, windowMs) {
  const t = time % cycle;
  if (t < cycle - windowMs) return 0;
  const p = (t - (cycle - windowMs)) / windowMs;
  return Math.sin(p * Math.PI);
}

function drawAction(ctx, cx, cy, r, category, accent, outlineColor, bodyColor, time) {
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

      const bounce = Math.sin(time / 130) * r * 0.025;
      drawHand(ctx, px - r * 0.13, py + r * 0.24 - bounce, -0.15, r, bodyColor, outlineColor);
      drawHand(ctx, px + r * 0.13, py + r * 0.24 + bounce, 0.15, r, bodyColor, outlineColor);
      break;
    }
    case "Entertainment": {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(px - r * 0.22, py - r * 0.28);
      ctx.lineTo(px + r * 0.22, py - r * 0.28);
      ctx.lineTo(px + r * 0.3, py + r * 0.28);
      ctx.lineTo(px - r * 0.3, py + r * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawHand(ctx, px + r * 0.3, py + r * 0.1, 0.3, r, bodyColor, outlineColor);

      // a kernel arcs from the bucket up to the mouth on a loop
      const phase = (time % 1300) / 1300;
      if (phase < 0.82) {
        const mouthX = cx;
        const mouthY = cy + r * 0.31;
        const startX = px - r * 0.05;
        const startY = py - r * 0.2;
        const kx = startX + (mouthX - startX) * phase;
        const straightY = startY + (mouthY - startY) * phase;
        const ky = straightY - Math.sin(phase * Math.PI) * r * 0.35;
        ctx.beginPath();
        ctx.arc(kx, ky, r * 0.045, 0, Math.PI * 2);
        ctx.fillStyle = "#ffe9a8";
        ctx.fill();
      }
      break;
    }
    case "Social": {
      // held up for a selfie, with a periodic camera flash
      const sx = cx + r * 0.62;
      const sy = cy - r * 0.08;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.3);
      ctx.fillStyle = accent;
      roundRectPath(ctx, -r * 0.16, -r * 0.28, r * 0.32, r * 0.52, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(0, -r * 0.14, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawHand(ctx, sx - r * 0.05, sy + r * 0.32, -0.3, r, bodyColor, outlineColor);

      const flash = pulseWindow(time, 2400, 180);
      if (flash > 0) {
        ctx.save();
        ctx.globalAlpha = flash * 0.85;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      }
      break;
    }
    case "Shopping": {
      const swing = Math.sin(time / 650) * 0.12;
      ctx.save();
      ctx.translate(px, py - r * 0.15);
      ctx.rotate(swing);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-r * 0.24, -r * 0.09);
      ctx.lineTo(r * 0.24, -r * 0.09);
      ctx.lineTo(r * 0.3, r * 0.45);
      ctx.lineTo(-r * 0.3, r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -r * 0.09, r * 0.12, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
      drawHand(ctx, px, py + r * 0.15, swing, r, bodyColor, outlineColor);
      break;
    }
    case "News": {
      const flip = Math.sin(time / 900);
      ctx.save();
      ctx.translate(px, py);
      ctx.transform(1, 0, flip * 0.15, 1, 0, 0);
      roundRectPath(ctx, -r * 0.32, -r * 0.18, r * 0.64, r * 0.36, 4);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.24, i * r * 0.1);
        ctx.lineTo(r * 0.24, i * r * 0.1);
        ctx.stroke();
      }
      ctx.restore();
      drawHand(ctx, px - r * 0.28, py + r * 0.16, -0.2, r, bodyColor, outlineColor);
      drawHand(ctx, px + r * 0.28, py + r * 0.16, 0.2, r, bodyColor, outlineColor);
      break;
    }
    case "Search": {
      const scan = Math.sin(time / 850) * r * 0.14;
      ctx.beginPath();
      ctx.arc(px - r * 0.05 + scan, py - r * 0.05, r * 0.22, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + r * 0.12 + scan, py + r * 0.12);
      ctx.lineTo(px + r * 0.3 + scan, py + r * 0.3);
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
      drawHand(ctx, px + r * 0.3 + scan, py + r * 0.32, 0.3, r, bodyColor, outlineColor);
      break;
    }
    case "Email": {
      // a little desk: monitor showing an inbox, a keyboard, typing hands,
      // and envelopes flying out to be sent and back in as they arrive
      const deskY = py + r * 0.1;
      const deskW = r * 0.72;
      const monX = px - r * 0.02;
      const monY = deskY - r * 0.42;

      roundRectPath(ctx, monX - deskW / 2, monY - r * 0.32, deskW, r * 0.5, 6);
      ctx.fillStyle = outlineColor;
      ctx.fill();
      roundRectPath(ctx, monX - deskW / 2 + r * 0.05, monY - r * 0.32 + r * 0.05, deskW - r * 0.1, r * 0.5 - r * 0.1, 4);
      ctx.fillStyle = "#eaf3ff";
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const ry = monY - r * 0.17 + i * r * 0.13;
        ctx.beginPath();
        ctx.moveTo(monX - deskW / 2 + r * 0.1, ry);
        ctx.lineTo(monX + deskW / 2 - r * 0.1, ry);
        ctx.stroke();
      }
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(monX - deskW / 2 + r * 0.08, monY - r * 0.17, r * 0.03, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = outlineColor;
      ctx.fillRect(monX - r * 0.04, monY + r * 0.18, r * 0.08, r * 0.1);
      ctx.fillRect(monX - r * 0.15, deskY - r * 0.02, r * 0.3, r * 0.05);

      roundRectPath(ctx, monX - deskW / 2, deskY, deskW, r * 0.16, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.02;
      ctx.stroke();

      const bounce = Math.sin(time / 130) * r * 0.02;
      drawHand(ctx, monX - r * 0.15, deskY + r * 0.08 - bounce, -0.1, r, bodyColor, outlineColor);
      drawHand(ctx, monX + r * 0.15, deskY + r * 0.08 + bounce, 0.1, r, bodyColor, outlineColor);

      const flights = [
        { period: 2600, offset: 0, out: true, ang: -0.7 },
        { period: 2600, offset: 1300, out: false, ang: 0.9 },
        { period: 3400, offset: 900, out: true, ang: 0.35 },
      ];
      for (const f of flights) {
        const t = ((time + f.offset) % f.period) / f.period;
        const dist = r * 1.1;
        const farX = monX + Math.cos(f.ang) * dist;
        const farY = monY - r * 0.6 + Math.sin(f.ang) * dist * 0.4;
        const fromX = f.out ? monX : farX;
        const fromY = f.out ? monY - r * 0.1 : farY;
        const toX = f.out ? farX : monX;
        const toY = f.out ? farY : monY - r * 0.1;
        const ex = fromX + (toX - fromX) * t;
        const ey = fromY + (toY - fromY) * t - Math.sin(t * Math.PI) * r * 0.15;
        const alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
        const scale = f.out ? 0.5 + t * 0.6 : 1.1 - t * 0.6;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(ex, ey);
        ctx.scale(scale, scale);
        ctx.rotate(f.ang * 0.3);
        ctx.fillStyle = accent;
        roundRectPath(ctx, -r * 0.09, -r * 0.06, r * 0.18, r * 0.12, 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = r * 0.015;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r * 0.09, -r * 0.06);
        ctx.lineTo(0, r * 0.01);
        ctx.lineTo(r * 0.09, -r * 0.06);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }
    case "Finance": {
      const spin = time / 400;
      const squish = Math.abs(Math.cos(spin));
      const flipY = py - r * 0.5 - Math.abs(Math.sin(spin * 0.6)) * r * 0.15;
      ctx.save();
      ctx.translate(px, flipY);
      ctx.scale(squish, 1);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      drawHand(ctx, px, py + r * 0.1, 0, r, bodyColor, outlineColor);
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(r * 0.16)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("$", px, py - r * 0.05);
      break;
    }
    case "Productivity": {
      roundRectPath(ctx, px - r * 0.26, py - r * 0.32, r * 0.52, r * 0.62, 5);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = r * 0.04;
      for (const dy of [-r * 0.12, r * 0.05]) {
        ctx.beginPath();
        ctx.moveTo(px - r * 0.16, py + dy);
        ctx.lineTo(px + r * 0.16, py + dy);
        ctx.stroke();
      }

      const drawPhase = pulseWindow(time, 1800, 900);
      if (drawPhase > 0) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = r * 0.05;
        ctx.lineCap = "round";
        const p1 = Math.min(1, drawPhase * 2);
        ctx.beginPath();
        ctx.moveTo(px - r * 0.14, py + r * 0.2);
        ctx.lineTo(px - r * 0.14 + r * 0.08 * p1, py + r * 0.2 + r * 0.08 * p1);
        if (drawPhase > 0.4) {
          const p2 = Math.min(1, (drawPhase - 0.4) * 1.6);
          ctx.lineTo(px + r * 0.16, py + r * 0.2 - r * 0.14 * p2);
        }
        ctx.stroke();
      }

      drawHand(ctx, px + r * 0.2, py + r * 0.35, 0.2, r, bodyColor, outlineColor);
      break;
    }
    case "Reference": {
      const flip = Math.sin(time / 950);
      ctx.save();
      ctx.translate(px, py);
      ctx.transform(1, 0, flip * 0.1, 1, 0, 0);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-r * 0.28, -r * 0.2);
      ctx.lineTo(0, -r * 0.12);
      ctx.lineTo(r * 0.28, -r * 0.2);
      ctx.lineTo(r * 0.28, r * 0.22);
      ctx.lineTo(0, r * 0.14);
      ctx.lineTo(-r * 0.28, r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.12);
      ctx.lineTo(0, r * 0.14);
      ctx.strokeStyle = outlineColor;
      ctx.stroke();
      ctx.restore();
      drawHand(ctx, px - r * 0.26, py + r * 0.2, -0.2, r, bodyColor, outlineColor);
      drawHand(ctx, px + r * 0.26, py + r * 0.2, 0.2, r, bodyColor, outlineColor);
      break;
    }
    case "Maps & Travel": {
      ctx.beginPath();
      ctx.moveTo(px, py + r * 0.32);
      ctx.quadraticCurveTo(px - r * 0.28, py, px, py - r * 0.3);
      ctx.quadraticCurveTo(px + r * 0.28, py, px, py + r * 0.32);
      ctx.closePath();
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py - r * 0.08, r * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      drawHand(ctx, px, py + r * 0.34, 0, r, bodyColor, outlineColor);

      // a little paper airplane loops around overhead
      const loop = time / 1100;
      const lx = cx + Math.cos(loop) * r * 1.15;
      const ly = cy - r * 0.9 + Math.sin(loop) * r * 0.22;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(loop + Math.PI / 2);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.12);
      ctx.lineTo(r * 0.06, r * 0.1);
      ctx.lineTo(0, r * 0.05);
      ctx.lineTo(-r * 0.06, r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case "AI & Assistants": {
      roundRectPath(ctx, px - r * 0.28, py - r * 0.22, r * 0.56, r * 0.36, 10);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - r * 0.08, py + r * 0.14);
      ctx.lineTo(px - r * 0.16, py + r * 0.3);
      ctx.lineTo(px + r * 0.02, py + r * 0.16);
      ctx.closePath();
      ctx.fill();

      const dotPhase = Math.floor(time / 260) % 3;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) {
        const active = dotPhase === i;
        ctx.beginPath();
        ctx.arc(px - r * 0.14 + i * r * 0.14, py - r * 0.04, active ? r * 0.05 : r * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }

      drawHand(ctx, px - r * 0.05, py + r * 0.34, 0, r, bodyColor, outlineColor);
      break;
    }
    case "Music": {
      const phase = (time % 1700) / 1700;
      ctx.save();
      ctx.globalAlpha = 1 - phase;
      ctx.fillStyle = accent;
      ctx.font = `700 ${Math.round(r * 0.5)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("♪", px, py + r * 0.25 - phase * r * 0.9);
      ctx.restore();
      drawHand(ctx, px - r * 0.05, py + r * 0.32, -0.2, r, bodyColor, outlineColor);
      break;
    }
    default: {
      const wobble = Math.sin(time / 260) * 0.4 + Math.sin(time / 410) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, r * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(wobble);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.16);
      ctx.lineTo(r * 0.06, 0);
      ctx.lineTo(0, r * 0.16);
      ctx.lineTo(-r * 0.06, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const scratch = Math.sin(time / 300) * r * 0.04;
      drawHand(ctx, cx - r * 0.5, cy - r * 0.75 + scratch, 0.6, r, bodyColor, outlineColor);
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
