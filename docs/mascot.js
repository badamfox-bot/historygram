// A small "mascot family" in the vein of Kirby / MLP / Happy Tree Friends:
// one consistent big-eyed, glossy, thick-outlined character, where only the
// color (from the category theme), expression, and action change.
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
  "Email": { brow: "droopy", mouth: "flat", squint: 0.3, ears: "round" },
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

// A real limb from a shoulder point (on the body) to a hand position, so
// held objects always read as physically gripped rather than floating
// disembodied props next to the character.
function drawArm(ctx, sx, sy, hx, hy, r, bodyColor, outlineColor) {
  const dx = hx - sx;
  const dy = hy - sy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const thick = r * 0.12;

  ctx.beginPath();
  ctx.moveTo(sx + nx * thick, sy + ny * thick);
  ctx.lineTo(hx + nx * thick * 0.75, hy + ny * thick * 0.75);
  ctx.lineTo(hx - nx * thick * 0.75, hy - ny * thick * 0.75);
  ctx.lineTo(sx - nx * thick, sy - ny * thick);
  ctx.closePath();
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.lineWidth = r * 0.035;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.lineWidth = r * 0.035;
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

// A screen (laptop-style: flat base + a panel hinged at the back edge and
// tilted backward) held in the creature's lap, facing up toward its own
// face rather than out at the viewer like a poster. drawScreenContent(ctx, r)
// draws inside the panel's local, already-transformed coordinate space.
function drawLaptop(ctx, cx, baseY, r, accent, outlineColor, drawScreenContent) {
  ctx.fillStyle = "#e7e7ee";
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, baseY);
  ctx.lineTo(cx + r * 0.42, baseY);
  ctx.lineTo(cx + r * 0.32, baseY - r * 0.15);
  ctx.lineTo(cx - r * 0.32, baseY - r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, baseY - r * 0.15);
  ctx.transform(1, 0, -0.1, 1, 0, 0);
  roundRectPath(ctx, -r * 0.34, -r * 0.5, r * 0.68, r * 0.5, 5);
  ctx.fillStyle = outlineColor;
  ctx.fill();
  roundRectPath(ctx, -r * 0.28, -r * 0.44, r * 0.56, r * 0.4, 3);
  ctx.fillStyle = accent;
  ctx.fill();
  if (drawScreenContent) drawScreenContent(ctx, r);
  ctx.restore();
}

function drawAction(ctx, cx, cy, r, category, accent, outlineColor, bodyColor, time) {
  const lS = { x: cx - r * 0.62, y: cy + r * 0.08 };
  const rS = { x: cx + r * 0.62, y: cy + r * 0.08 };

  ctx.fillStyle = accent;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = r * 0.03;

  switch (category) {
    case "Dev & Tools": {
      const baseY = cy + r * 0.62;
      drawLaptop(ctx, cx, baseY, r, accent, outlineColor, (c, rr) => {
        c.fillStyle = "rgba(255,255,255,0.9)";
        c.font = `700 ${Math.round(rr * 0.2)}px monospace`;
        c.textAlign = "center";
        c.fillText("</>", 0, rr * 0.04);
      });
      const bounce = Math.sin(time / 130) * r * 0.02;
      drawArm(ctx, lS.x, lS.y, cx - r * 0.16, baseY - bounce, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, cx + r * 0.16, baseY + bounce, r, bodyColor, outlineColor);
      break;
    }

    case "Email": {
      const baseY = cy + r * 0.62;
      drawLaptop(ctx, cx, baseY, r, accent, outlineColor, (c, rr) => {
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.moveTo(-rr * 0.17, -rr * 0.18);
        c.lineTo(rr * 0.17, -rr * 0.18);
        c.lineTo(rr * 0.17, rr * 0.06);
        c.lineTo(-rr * 0.17, rr * 0.06);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(0,0,0,0.35)";
        c.lineWidth = rr * 0.015;
        c.beginPath();
        c.moveTo(-rr * 0.17, -rr * 0.18);
        c.lineTo(0, -rr * 0.02);
        c.lineTo(rr * 0.17, -rr * 0.18);
        c.stroke();
      });

      const bounce = Math.sin(time / 130) * r * 0.02;
      drawArm(ctx, lS.x, lS.y, cx - r * 0.16, baseY - bounce, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, cx + r * 0.16, baseY + bounce, r, bodyColor, outlineColor);

      // envelopes fly out to be sent, and arrive back in, above the screen
      const screenX = cx;
      const screenY = baseY - r * 0.15 - r * 0.25;
      const flights = [
        { period: 2600, offset: 0, out: true, ang: -1.1 },
        { period: 2600, offset: 1300, out: false, ang: -0.35 },
      ];
      for (const f of flights) {
        const t = ((time + f.offset) % f.period) / f.period;
        const dist = r * 0.85;
        const farX = screenX + Math.cos(f.ang) * dist;
        const farY = screenY - r * 0.3 + Math.sin(f.ang) * dist * 0.5;
        const fromX = f.out ? screenX : farX;
        const fromY = f.out ? screenY : farY;
        const toX = f.out ? farX : screenX;
        const toY = f.out ? farY : screenY;
        const ex = fromX + (toX - fromX) * t;
        const ey = fromY + (toY - fromY) * t - Math.sin(t * Math.PI) * r * 0.1;
        const alpha = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(ex, ey);
        ctx.scale(0.55, 0.55);
        ctx.rotate(f.ang * 0.2);
        ctx.fillStyle = accent;
        roundRectPath(ctx, -r * 0.09, -r * 0.06, r * 0.18, r * 0.12, 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = r * 0.02;
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

    case "AI & Assistants": {
      const baseY = cy + r * 0.62;
      drawLaptop(ctx, cx, baseY, r, accent, outlineColor, (c, rr) => {
        c.fillStyle = "#ffffff";
        c.font = `700 ${Math.round(rr * 0.2)}px sans-serif`;
        c.textAlign = "center";
        c.fillText("✦", 0, rr * 0.02);
      });
      const bounce = Math.sin(time / 150) * r * 0.015;
      drawArm(ctx, lS.x, lS.y, cx - r * 0.16, baseY - bounce, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, cx + r * 0.16, baseY + bounce, r, bodyColor, outlineColor);

      // a little chat bubble with a typing indicator pops up beside its head
      const bx = cx + r * 0.55, by = cy - r * 0.2;
      roundRectPath(ctx, bx - r * 0.22, by - r * 0.14, r * 0.44, r * 0.28, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
      const dotPhase = Math.floor(time / 260) % 3;
      ctx.fillStyle = accent;
      for (let i = 0; i < 3; i++) {
        const active = dotPhase === i;
        ctx.beginPath();
        ctx.arc(bx - r * 0.11 + i * r * 0.11, by, active ? r * 0.045 : r * 0.028, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "Entertainment": {
      const baseY = cy + r * 0.6;
      ctx.fillStyle = outlineColor;
      ctx.fillRect(cx - r * 0.06, baseY - r * 0.06, r * 0.12, r * 0.08);

      ctx.save();
      ctx.translate(cx, baseY - r * 0.06);
      ctx.transform(1, 0, -0.08, 1, 0, 0);
      roundRectPath(ctx, -r * 0.42, -r * 0.36, r * 0.84, r * 0.36, 6);
      ctx.fillStyle = outlineColor;
      ctx.fill();
      roundRectPath(ctx, -r * 0.36, -r * 0.31, r * 0.72, r * 0.26, 3);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.moveTo(-r * 0.06, -r * 0.24);
      ctx.lineTo(r * 0.08, -r * 0.18);
      ctx.lineTo(-r * 0.06, -r * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const bucketX = cx + r * 0.55;
      const bucketY = cy + r * 0.15;
      drawArm(ctx, rS.x, rS.y, bucketX, bucketY, r, bodyColor, outlineColor);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(bucketX - r * 0.14, bucketY - r * 0.16);
      ctx.lineTo(bucketX + r * 0.14, bucketY - r * 0.16);
      ctx.lineTo(bucketX + r * 0.18, bucketY + r * 0.16);
      ctx.lineTo(bucketX - r * 0.18, bucketY + r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.02;
      ctx.stroke();

      const phase = (time % 1200) / 1200;
      if (phase < 0.8) {
        const mouthX = cx;
        const mouthY = cy + r * 0.31;
        const startX = bucketX;
        const startY = bucketY - r * 0.1;
        const kx = startX + (mouthX - startX) * phase;
        const ky = startY + (mouthY - startY) * phase - Math.sin(phase * Math.PI) * r * 0.2;
        ctx.beginPath();
        ctx.arc(kx, ky, r * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#ffe9a8";
        ctx.fill();
      }
      break;
    }

    case "Social": {
      const sx = cx + r * 0.5;
      const sy = cy - r * 0.1;
      drawArm(ctx, rS.x, rS.y, sx, sy + r * 0.15, r, bodyColor, outlineColor);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.25);
      ctx.fillStyle = accent;
      roundRectPath(ctx, -r * 0.15, -r * 0.26, r * 0.3, r * 0.48, 7);
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(0, -r * 0.14, r * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const flash = pulseWindow(time, 2400, 180);
      if (flash > 0) {
        ctx.save();
        ctx.globalAlpha = flash * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case "Shopping": {
      const swing = Math.sin(time / 650) * 0.12;
      for (const side of [-1, 1]) {
        const shoulder = side < 0 ? lS : rS;
        const hx = cx + side * r * 0.45;
        const hy = cy + r * 0.55;
        drawArm(ctx, shoulder.x, shoulder.y, hx, hy, r, bodyColor, outlineColor);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(swing * side);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(-r * 0.16, -r * 0.06);
        ctx.lineTo(r * 0.16, -r * 0.06);
        ctx.lineTo(r * 0.2, r * 0.3);
        ctx.lineTo(-r * 0.2, r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = r * 0.02;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -r * 0.06, r * 0.08, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case "News": {
      const bx = cx, by = cy + r * 0.48;
      const flip = Math.sin(time / 900);
      ctx.save();
      ctx.translate(bx, by);
      ctx.transform(1, 0, flip * 0.12, 1, 0, 0);
      roundRectPath(ctx, -r * 0.34, -r * 0.2, r * 0.68, r * 0.4, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.24, i * r * 0.1);
        ctx.lineTo(r * 0.24, i * r * 0.1);
        ctx.stroke();
      }
      ctx.restore();
      drawArm(ctx, lS.x, lS.y, bx - r * 0.28, by + r * 0.12, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, bx + r * 0.28, by + r * 0.12, r, bodyColor, outlineColor);
      break;
    }

    case "Search": {
      const scan = Math.sin(time / 850) * r * 0.1;
      const gx = cx + r * 0.32 + scan;
      const gy = cy - r * 0.1;
      drawArm(ctx, rS.x, rS.y, gx + r * 0.14, gy + r * 0.14, r, bodyColor, outlineColor);
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.2, 0, Math.PI * 2);
      ctx.lineWidth = r * 0.05;
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx + r * 0.14, gy + r * 0.14);
      ctx.lineTo(gx + r * 0.26, gy + r * 0.26);
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.045;
      ctx.stroke();
      break;
    }

    case "Finance": {
      const spin = time / 400;
      const squish = Math.abs(Math.cos(spin));
      const coinX = cx;
      const coinY = cy + r * 0.15 - Math.abs(Math.sin(spin * 0.6)) * r * 0.15;
      drawArm(ctx, rS.x, rS.y, cx + r * 0.2, cy + r * 0.5, r, bodyColor, outlineColor);
      ctx.save();
      ctx.translate(coinX, coinY);
      ctx.scale(squish, 1);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(r * 0.16)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("$", coinX, coinY + r * 0.05);
      break;
    }

    case "Productivity": {
      const bx = cx, by = cy + r * 0.5;
      roundRectPath(ctx, bx - r * 0.24, by - r * 0.28, r * 0.48, r * 0.56, 5);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = r * 0.035;
      for (const dy of [-r * 0.1, r * 0.05]) {
        ctx.beginPath();
        ctx.moveTo(bx - r * 0.14, by + dy);
        ctx.lineTo(bx + r * 0.14, by + dy);
        ctx.stroke();
      }
      drawArm(ctx, lS.x, lS.y, bx - r * 0.2, by, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, bx + r * 0.22, by + r * 0.15, r, bodyColor, outlineColor);

      const drawPhase = pulseWindow(time, 1800, 900);
      if (drawPhase > 0) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = r * 0.05;
        ctx.lineCap = "round";
        const p1 = Math.min(1, drawPhase * 2);
        ctx.beginPath();
        ctx.moveTo(bx - r * 0.06, by + r * 0.05);
        ctx.lineTo(bx - r * 0.06 + r * 0.06 * p1, by + r * 0.05 + r * 0.06 * p1);
        if (drawPhase > 0.4) {
          const p2 = Math.min(1, (drawPhase - 0.4) * 1.6);
          ctx.lineTo(bx + r * 0.14, by + r * 0.05 - r * 0.1 * p2);
        }
        ctx.stroke();
      }
      break;
    }

    case "Reference": {
      const bx = cx, by = cy + r * 0.5;
      const flip = Math.sin(time / 950);
      ctx.save();
      ctx.translate(bx, by);
      ctx.transform(1, 0, flip * 0.1, 1, 0, 0);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.2);
      ctx.lineTo(0, -r * 0.12);
      ctx.lineTo(r * 0.3, -r * 0.2);
      ctx.lineTo(r * 0.3, r * 0.22);
      ctx.lineTo(0, r * 0.14);
      ctx.lineTo(-r * 0.3, r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.12);
      ctx.lineTo(0, r * 0.14);
      ctx.strokeStyle = outlineColor;
      ctx.stroke();
      ctx.restore();
      drawArm(ctx, lS.x, lS.y, bx - r * 0.26, by + r * 0.18, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, bx + r * 0.26, by + r * 0.18, r, bodyColor, outlineColor);
      break;
    }

    case "Maps & Travel": {
      const bx = cx, by = cy + r * 0.5;
      roundRectPath(ctx, bx - r * 0.26, by - r * 0.2, r * 0.52, r * 0.4, 4);
      ctx.fillStyle = "#fdf6e3";
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = r * 0.03;
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.lineWidth = r * 0.02;
      ctx.beginPath();
      ctx.moveTo(bx - r * 0.18, by + r * 0.1);
      ctx.quadraticCurveTo(bx, by - r * 0.12, bx + r * 0.18, by + r * 0.05);
      ctx.stroke();
      drawArm(ctx, lS.x, lS.y, bx - r * 0.24, by + r * 0.16, r, bodyColor, outlineColor);
      drawArm(ctx, rS.x, rS.y, bx + r * 0.24, by + r * 0.16, r, bodyColor, outlineColor);

      // a little paper airplane loops around overhead
      const loop = time / 1100;
      const lx = cx + Math.cos(loop) * r * 0.95;
      const ly = cy - r * 0.85 + Math.sin(loop) * r * 0.2;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(loop + Math.PI / 2);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.11);
      ctx.lineTo(r * 0.055, r * 0.09);
      ctx.lineTo(0, r * 0.045);
      ctx.lineTo(-r * 0.055, r * 0.09);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case "Music": {
      const wave = Math.sin(time / 500) * 0.4;
      drawArm(
        ctx,
        rS.x,
        rS.y,
        cx + r * 0.75 + Math.cos(wave) * r * 0.1,
        cy - r * 0.05 + Math.sin(wave) * r * 0.1,
        r,
        bodyColor,
        outlineColor
      );

      const notes = [
        { glyph: "♪", size: 0.4, x: cx + r * 0.55, y: cy - r * 0.3, offset: 0 },
        { glyph: "♫", size: 0.28, x: cx - r * 0.5, y: cy - r * 0.2, offset: 700 },
      ];
      for (const n of notes) {
        const phase = ((time + n.offset) % 1500) / 1500;
        ctx.save();
        ctx.globalAlpha = 1 - phase;
        ctx.fillStyle = accent;
        ctx.font = `700 ${Math.round(r * n.size)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.glyph, n.x, n.y - phase * r * 0.6);
        ctx.restore();
      }
      break;
    }

    default: {
      const wobble = Math.sin(time / 260) * 0.4 + Math.sin(time / 410) * 0.3;
      const gx = cx + r * 0.5, gy = cy;
      drawArm(ctx, rS.x, rS.y, gx, gy, r, bodyColor, outlineColor);
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(wobble);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.13);
      ctx.lineTo(r * 0.05, 0);
      ctx.lineTo(0, r * 0.13);
      ctx.lineTo(-r * 0.05, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const scratch = Math.sin(time / 300) * r * 0.04;
      drawArm(ctx, lS.x, lS.y, cx - r * 0.4, cy - r * 0.7 + scratch, r, bodyColor, outlineColor);
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
