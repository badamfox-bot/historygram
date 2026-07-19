// Engine B: soft, rounded, pastel "chibi" creatures. A real two-part
// silhouette (separate head + body, legs on the ground, species-specific
// ears/snout/tail) instead of one blob — a different animal per category.
// Self-contained (IIFE) so it can coexist on the same page as mascot.js
// (Engine A) and creature-c.js (Engine C) without name collisions.
const EngineB = (function () {
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex({ r, g, b }) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}`;
  }
  function mix(hex, target, amount) {
    const a = hexToRgb(hex), b = hexToRgb(target);
    return rgbToHex({ r: a.r + (b.r - a.r) * amount, g: a.g + (b.g - a.g) * amount, b: a.b + (b.b - a.b) * amount });
  }
  const lighten = (hex, amt) => mix(hex, "#ffffff", amt);
  const darken = (hex, amt) => mix(hex, "#000000", amt);

  function roundRect(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function blinkPulse(time, seed) {
    const cycle = 4000 + seed * 300;
    const windowMs = 200;
    const t = time % cycle;
    if (t < cycle - windowMs) return 0;
    const p = (t - (cycle - windowMs)) / windowMs;
    return Math.sin(p * Math.PI);
  }

  function draw(ctx, cx, cy, r, category, prefix, time) {
    const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
    const spec = speciesFor(category);
    const bodyColor = lighten(theme.to, 0.4);
    const outlineColor = darken(theme.to, 0.42);
    const seed = category.length;

    ctx.save();
    const bob = Math.sin(time / 900) * r * 0.03;
    const sway = Math.sin(time / 1500) * 0.03;

    // shadow, stays grounded
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.92, r * 0.55, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fill();

    ctx.translate(cx, cy + bob);
    ctx.rotate(sway);
    ctx.translate(-cx, -cy);

    const torsoCx = cx, torsoCy = cy + r * 0.2;
    const torsoRx = r * 0.5, torsoRy = r * 0.44;
    const headCx = cx, headCy = cy - r * 0.32;
    const headR = r * 0.38;
    const groundY = cy + r * 0.82;

    // legs
    ctx.fillStyle = outlineColor;
    if (spec.legs === 2) {
      for (const dx of [-r * 0.16, r * 0.16]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx, groundY, r * 0.13, r * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (spec.legs === 6) {
      for (let i = 0; i < 6; i++) {
        const dx = (i - 2.5) * r * 0.14;
        ctx.beginPath();
        ctx.ellipse(cx + dx, groundY - r * 0.02, r * 0.06, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (const dx of [-r * 0.32, -r * 0.11, r * 0.11, r * 0.32]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx, groundY, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // tail
    drawTail(ctx, torsoCx, torsoCy, r, spec.tail, bodyColor, outlineColor, time);

    // torso
    ctx.beginPath();
    ctx.ellipse(torsoCx, torsoCy, torsoRx, torsoRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    // ears (behind head)
    drawEars(ctx, headCx, headCy, headR, spec.ears, bodyColor, outlineColor);

    // head
    ctx.beginPath();
    ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    // glossy highlight
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(headCx - headR * 0.35, headCy - headR * 0.4, headR * 0.24, headR * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // snout
    drawSnout(ctx, headCx, headCy, headR, spec.snout, bodyColor, outlineColor);

    // eyes
    const blink = blinkPulse(time, seed);
    const eyeDx = headR * 0.42;
    const eyeY = headCy + headR * 0.05;
    drawEye(ctx, headCx - eyeDx, eyeY, headR * 0.26, blink, outlineColor);
    drawEye(ctx, headCx + eyeDx, eyeY, headR * 0.26, blink, outlineColor);

    // blush
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = theme.to;
    for (const dx of [-headR * 0.75, headR * 0.75]) {
      ctx.beginPath();
      ctx.ellipse(headCx + dx, headCy + headR * 0.35, headR * 0.18, headR * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // mouth
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = headR * 0.08;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(headCx, headCy + headR * 0.4, headR * 0.24, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // task badge, always well clear of the head/face
    const badgeX = cx + r * 0.82;
    const badgeY = cy + r * 0.35;
    drawBadge(ctx, spec, badgeX, badgeY, r, theme.to, outlineColor, time);

    if (prefix === "Night Owl ") drawNight(ctx, headCx, headCy, headR);
    else if (prefix === "Early Bird ") drawMorning(ctx, headCx, headCy, headR);

    ctx.restore();
  }

  function drawEye(ctx, x, y, r, blink, outlineColor) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (1 - blink * 0.85), 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#2b2250";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.22, y - r * 0.24, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.restore();
  }

  function drawEars(ctx, cx, cy, headR, style, bodyColor, outlineColor) {
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = headR * 0.14;
    const baseY = cy - headR * 0.7;
    const dxs = [-headR * 0.6, headR * 0.6];

    switch (style) {
      case "none":
        return;
      case "tiny":
        for (const dx of dxs) {
          ctx.beginPath();
          ctx.arc(cx + dx, baseY, headR * 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "long":
        for (const dx of dxs) {
          ctx.beginPath();
          ctx.ellipse(cx + dx, baseY - headR * 0.5, headR * 0.2, headR * 0.65, dx < 0 ? -0.15 : 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "tufts":
        for (const dx of dxs) {
          const sign = Math.sign(dx);
          ctx.beginPath();
          ctx.moveTo(cx + dx - sign * headR * 0.14, baseY + headR * 0.1);
          ctx.lineTo(cx + dx + sign * headR * 0.04, baseY - headR * 0.35);
          ctx.lineTo(cx + dx + sign * headR * 0.18, baseY + headR * 0.08);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "pointed":
        for (const dx of dxs) {
          const sign = Math.sign(dx);
          ctx.beginPath();
          ctx.moveTo(cx + dx - sign * headR * 0.2, baseY + headR * 0.2);
          ctx.lineTo(cx + dx + sign * headR * 0.05, baseY - headR * 0.5);
          ctx.lineTo(cx + dx + sign * headR * 0.28, baseY + headR * 0.15);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "small":
        for (const dx of dxs) {
          ctx.beginPath();
          ctx.arc(cx + dx, baseY, headR * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "round":
      default:
        for (const dx of dxs) {
          ctx.beginPath();
          ctx.arc(cx + dx, baseY, headR * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
    }
  }

  function drawSnout(ctx, cx, cy, headR, style, bodyColor, outlineColor) {
    const sy = cy + headR * 0.28;
    switch (style) {
      case "beak":
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.14, sy);
        ctx.lineTo(cx + headR * 0.14, sy);
        ctx.lineTo(cx, sy + headR * 0.22);
        ctx.closePath();
        ctx.fillStyle = "#f2a93b";
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headR * 0.05;
        ctx.stroke();
        break;
      case "pointed":
        ctx.beginPath();
        ctx.ellipse(cx, sy + headR * 0.05, headR * 0.16, headR * 0.11, 0, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headR * 0.04;
        ctx.stroke();
        break;
      case "mask":
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#2a2a2a";
        roundRect(ctx, cx - headR * 0.55, cy - headR * 0.1, headR * 1.1, headR * 0.32, headR * 0.14);
        ctx.fill();
        ctx.restore();
        break;
      case "teeth":
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, cx - headR * 0.14, sy - headR * 0.02, headR * 0.28, headR * 0.22, headR * 0.04);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, sy - headR * 0.02);
        ctx.lineTo(cx, sy + headR * 0.2);
        ctx.stroke();
        break;
      case "wide":
        ctx.beginPath();
        ctx.ellipse(cx, sy, headR * 0.32, headR * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headR * 0.04;
        ctx.stroke();
        break;
      case "round":
      default:
        ctx.beginPath();
        ctx.ellipse(cx, sy, headR * 0.1, headR * 0.07, 0, 0, Math.PI * 2);
        ctx.fillStyle = darken(bodyColor, 0.15);
        ctx.fill();
    }
  }

  function drawTail(ctx, cx, cy, r, style, bodyColor, outlineColor, time) {
    if (style === "none") return;
    const wag = Math.sin(time / 500) * 0.2;
    const tx = cx - r * 0.5, ty = cy + r * 0.15;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(wag);
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = r * 0.03;

    switch (style) {
      case "bushy":
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, -r * 0.15, r * 0.24, r * 0.32, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "ringed":
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(-r * 0.12 * i, -r * 0.08 * i, r * 0.14, r * 0.1, -0.4, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? bodyColor : outlineColor;
          ctx.fill();
        }
        break;
      case "puff":
        ctx.beginPath();
        ctx.arc(-r * 0.1, 0, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "flat":
        roundRect(ctx, -r * 0.35, -r * 0.1, r * 0.3, r * 0.2, r * 0.04);
        ctx.fill();
        ctx.stroke();
        break;
      case "fan":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-r * 0.32, -r * 0.15);
        ctx.lineTo(-r * 0.32, r * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case "thin":
      case "tiny":
      default:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-r * 0.25, -r * 0.05, -r * 0.2, -r * 0.28);
        ctx.lineWidth = r * 0.06;
        ctx.strokeStyle = bodyColor;
        ctx.stroke();
    }
    ctx.restore();
  }

  function drawBadge(ctx, spec, x, y, r, accent, outlineColor, time) {
    let bx = x, by = y, alpha = 1, scale = 1, rot = 0;

    switch (spec.action) {
      case "bounce": {
        by = y - Math.abs(Math.sin(time / 220)) * r * 0.06;
        break;
      }
      case "sway": {
        rot = Math.sin(time / 650) * 0.2;
        break;
      }
      case "spin": {
        rot = time / 500;
        scale = Math.abs(Math.cos(time / 500));
        break;
      }
      case "pulse": {
        scale = 1 + Math.sin(time / 260) * 0.08;
        break;
      }
      case "arc": {
        const phase = (time % 1300) / 1300;
        bx = x - Math.sin(phase * Math.PI) * r * 0.05;
        by = y - Math.sin(phase * Math.PI) * r * 0.18;
        alpha = phase < 0.85 ? 1 : (1 - phase) / 0.15;
        break;
      }
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(bx, by);
    ctx.rotate(rot);
    ctx.scale(scale, 1);

    roundRect(ctx, -r * 0.24, -r * 0.24, r * 0.48, r * 0.48, r * 0.12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.strokeStyle = accent;
    drawBadgeGlyph(ctx, spec.badge, r * 0.34);

    ctx.restore();
  }

  function drawBadgeGlyph(ctx, kind, s) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    switch (kind) {
      case "code":
        ctx.font = `700 ${Math.round(s * 0.6)}px monospace`;
        ctx.fillText("</>", 0, s * 0.02);
        break;
      case "dollar":
        ctx.font = `700 ${Math.round(s * 0.7)}px sans-serif`;
        ctx.fillText("$", 0, s * 0.02);
        break;
      case "sparkle":
        ctx.font = `700 ${Math.round(s * 0.65)}px sans-serif`;
        ctx.fillText("✦", 0, s * 0.02);
        break;
      case "note":
        ctx.font = `700 ${Math.round(s * 0.7)}px sans-serif`;
        ctx.fillText("♪", 0, s * 0.02);
        break;
      case "question":
        ctx.font = `700 ${Math.round(s * 0.7)}px sans-serif`;
        ctx.fillText("?", 0, s * 0.02);
        break;
      case "check":
        ctx.lineWidth = s * 0.14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(-s * 0.28, 0);
        ctx.lineTo(-s * 0.05, s * 0.25);
        ctx.lineTo(s * 0.3, -s * 0.22);
        ctx.stroke();
        break;
      case "heart":
        ctx.beginPath();
        ctx.moveTo(0, s * 0.28);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.15, -s * 0.28, -s * 0.5, 0, -s * 0.1);
        ctx.bezierCurveTo(s * 0.28, -s * 0.5, s * 0.5, -s * 0.15, 0, s * 0.28);
        ctx.fill();
        break;
      case "play":
        ctx.beginPath();
        ctx.moveTo(-s * 0.22, -s * 0.3);
        ctx.lineTo(s * 0.32, 0);
        ctx.lineTo(-s * 0.22, s * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
      case "lines":
        ctx.lineWidth = s * 0.1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(-s * 0.32, i * s * 0.22);
          ctx.lineTo(s * 0.32, i * s * 0.22);
          ctx.stroke();
        }
        break;
      case "magnifier":
        ctx.lineWidth = s * 0.14;
        ctx.beginPath();
        ctx.arc(-s * 0.06, -s * 0.06, s * 0.24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.12, s * 0.12);
        ctx.lineTo(s * 0.32, s * 0.32);
        ctx.stroke();
        break;
      case "envelope":
        ctx.lineWidth = s * 0.08;
        roundRect(ctx, -s * 0.34, -s * 0.24, s * 0.68, s * 0.48, s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.34, -s * 0.24);
        ctx.lineTo(0, s * 0.06);
        ctx.lineTo(s * 0.34, -s * 0.24);
        ctx.stroke();
        break;
      case "book":
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(-s * 0.32, -s * 0.22);
        ctx.lineTo(0, -s * 0.1);
        ctx.lineTo(s * 0.32, -s * 0.22);
        ctx.lineTo(s * 0.32, s * 0.24);
        ctx.lineTo(0, s * 0.12);
        ctx.lineTo(-s * 0.32, s * 0.24);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.1);
        ctx.lineTo(0, s * 0.12);
        ctx.stroke();
        break;
      case "plane":
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.32);
        ctx.lineTo(s * 0.18, s * 0.24);
        ctx.lineTo(0, s * 0.1);
        ctx.lineTo(-s * 0.18, s * 0.24);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  function drawNight(ctx, cx, cy, headR) {
    ctx.fillStyle = "rgba(20,20,20,0.85)";
    roundRect(ctx, cx - headR * 0.65, cy - headR * 0.1, headR * 0.5, headR * 0.28, headR * 0.08);
    ctx.fill();
    roundRect(ctx, cx + headR * 0.15, cy - headR * 0.1, headR * 0.5, headR * 0.28, headR * 0.08);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.15, cy);
    ctx.lineTo(cx + headR * 0.15, cy);
    ctx.strokeStyle = "rgba(20,20,20,0.85)";
    ctx.lineWidth = headR * 0.06;
    ctx.stroke();

    ctx.fillStyle = "#ffe27a";
    ctx.beginPath();
    ctx.arc(cx - headR * 1.1, cy - headR * 0.9, headR * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx - headR * 1.0, cy - headR * 0.96, headR * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMorning(ctx, cx, cy, headR) {
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(cx + headR * 1.15, cy - headR * 0.95, headR * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  return { draw };
})();
