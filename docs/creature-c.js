// Engine C: bold, geometric, flat-color creatures. Same species/anatomy
// idea as Engine B (separate head + body, legs, species ears/snout/tail)
// but a deliberately different visual language: angular shapes, thick dark
// outlines, saturated flat color, simple dot eyes instead of glossy
// cartoon eyes. Self-contained (IIFE) to coexist with mascot.js and
// creature-b.js on the same page without collisions.
const EngineC = (function () {
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
    const cycle = 4400 + seed * 250;
    const windowMs = 160;
    const t = time % cycle;
    if (t < cycle - windowMs) return 0;
    const p = (t - (cycle - windowMs)) / windowMs;
    return Math.sin(p * Math.PI);
  }

  function draw(ctx, cx, cy, r, category, prefix, time) {
    const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
    const spec = speciesFor(category);
    const bodyColor = lighten(theme.to, 0.12);
    const outlineColor = darken(theme.to, 0.62);
    const seed = category.length;

    ctx.save();
    const bob = Math.sin(time / 950) * r * 0.025;
    const sway = Math.sin(time / 1600) * 0.02;

    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.92, r * 0.52, r * 0.11, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();

    ctx.translate(cx, cy + bob);
    ctx.rotate(sway);
    ctx.translate(-cx, -cy);

    const torsoCx = cx, torsoCy = cy + r * 0.2;
    const torsoW = r * 0.92, torsoH = r * 0.8;
    const headCx = cx, headCy = cy - r * 0.32;
    const headSize = r * 0.66;
    const groundY = cy + r * 0.82;

    ctx.fillStyle = outlineColor;
    if (spec.legs === 2) {
      for (const dx of [-r * 0.16, r * 0.16]) {
        roundRect(ctx, cx + dx - r * 0.07, groundY - r * 0.06, r * 0.14, r * 0.14, r * 0.03);
        ctx.fill();
      }
    } else if (spec.legs === 6) {
      for (let i = 0; i < 6; i++) {
        const dx = (i - 2.5) * r * 0.14;
        roundRect(ctx, cx + dx - r * 0.03, groundY - r * 0.08, r * 0.06, r * 0.1, r * 0.02);
        ctx.fill();
      }
    } else {
      for (const dx of [-r * 0.32, -r * 0.11, r * 0.11, r * 0.32]) {
        roundRect(ctx, cx + dx - r * 0.055, groundY - r * 0.05, r * 0.11, r * 0.12, r * 0.02);
        ctx.fill();
      }
    }

    drawTail(ctx, torsoCx, torsoCy, r, spec.tail, bodyColor, outlineColor, time);

    // torso: rounded rectangle, more graphic than an ellipse
    roundRect(ctx, torsoCx - torsoW / 2, torsoCy - torsoH / 2, torsoW, torsoH, r * 0.32);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = r * 0.075;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    drawEars(ctx, headCx, headCy, headSize, spec.ears, bodyColor, outlineColor);

    // head: rounded square, distinct mass from the torso
    roundRect(ctx, headCx - headSize / 2, headCy - headSize / 2, headSize, headSize, headSize * 0.42);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = r * 0.075;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    drawSnout(ctx, headCx, headCy, headSize, spec.snout, bodyColor, outlineColor);

    const blink = blinkPulse(time, seed);
    const eyeDx = headSize * 0.24;
    const eyeY = headCy + headSize * 0.02;
    drawEye(ctx, headCx - eyeDx, eyeY, headSize * 0.15, blink, outlineColor);
    drawEye(ctx, headCx + eyeDx, eyeY, headSize * 0.15, blink, outlineColor);

    // mouth: a simple confident flat-geometric smile
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = headSize * 0.06;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headCx - headSize * 0.16, headCy + headSize * 0.28);
    ctx.lineTo(headCx, headCy + headSize * 0.36);
    ctx.lineTo(headCx + headSize * 0.16, headCy + headSize * 0.28);
    ctx.stroke();

    const badgeX = cx + r * 0.85;
    const badgeY = cy + r * 0.32;
    drawBadge(ctx, spec, badgeX, badgeY, r, theme.to, outlineColor, time);

    if (prefix === "Night Owl ") drawNight(ctx, headCx, headCy, headSize);
    else if (prefix === "Early Bird ") drawMorning(ctx, headCx, headCy, headSize);

    ctx.restore();
  }

  function drawEye(ctx, x, y, r, blink, outlineColor) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, r, Math.max(r * 0.15, r * (1 - blink)), 0, 0, Math.PI * 2);
    ctx.fillStyle = outlineColor;
    ctx.fill();
    ctx.restore();
  }

  function drawEars(ctx, cx, cy, headSize, style, bodyColor, outlineColor) {
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = headSize * 0.09;
    const baseY = cy - headSize * 0.42;
    const dxs = [-headSize * 0.4, headSize * 0.4];

    switch (style) {
      case "none":
        return;
      case "tiny":
        for (const dx of dxs) {
          roundRect(ctx, cx + dx - headSize * 0.08, baseY - headSize * 0.08, headSize * 0.16, headSize * 0.16, headSize * 0.03);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "long":
        for (const dx of dxs) {
          roundRect(ctx, cx + dx - headSize * 0.1, baseY - headSize * 0.7, headSize * 0.2, headSize * 0.7, headSize * 0.08);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "tufts":
      case "pointed":
        for (const dx of dxs) {
          const sign = Math.sign(dx);
          ctx.beginPath();
          ctx.moveTo(cx + dx - sign * headSize * 0.14, baseY + headSize * 0.12);
          ctx.lineTo(cx + dx + sign * headSize * 0.02, baseY - headSize * 0.4);
          ctx.lineTo(cx + dx + sign * headSize * 0.2, baseY + headSize * 0.1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "small":
        for (const dx of dxs) {
          roundRect(ctx, cx + dx - headSize * 0.12, baseY - headSize * 0.12, headSize * 0.24, headSize * 0.24, headSize * 0.05);
          ctx.fill();
          ctx.stroke();
        }
        return;
      case "round":
      default:
        for (const dx of dxs) {
          roundRect(ctx, cx + dx - headSize * 0.18, baseY - headSize * 0.18, headSize * 0.36, headSize * 0.36, headSize * 0.1);
          ctx.fill();
          ctx.stroke();
        }
    }
  }

  function drawSnout(ctx, cx, cy, headSize, style, bodyColor, outlineColor) {
    const sy = cy + headSize * 0.2;
    switch (style) {
      case "beak":
        ctx.beginPath();
        ctx.moveTo(cx - headSize * 0.1, sy);
        ctx.lineTo(cx + headSize * 0.1, sy);
        ctx.lineTo(cx, sy + headSize * 0.16);
        ctx.closePath();
        ctx.fillStyle = "#f2a93b";
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headSize * 0.04;
        ctx.stroke();
        break;
      case "pointed":
        roundRect(ctx, cx - headSize * 0.12, sy - headSize * 0.02, headSize * 0.24, headSize * 0.16, headSize * 0.04);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headSize * 0.04;
        ctx.stroke();
        break;
      case "mask":
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#1e1e1e";
        roundRect(ctx, cx - headSize * 0.4, cy - headSize * 0.08, headSize * 0.8, headSize * 0.22, headSize * 0.06);
        ctx.fill();
        ctx.restore();
        break;
      case "teeth":
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, cx - headSize * 0.12, sy, headSize * 0.24, headSize * 0.16, headSize * 0.02);
        ctx.fill();
        break;
      case "wide":
        roundRect(ctx, cx - headSize * 0.22, sy, headSize * 0.44, headSize * 0.1, headSize * 0.03);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = headSize * 0.03;
        ctx.stroke();
        break;
      case "round":
      default:
        ctx.beginPath();
        ctx.arc(cx, sy, headSize * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = darken(bodyColor, 0.2);
        ctx.fill();
    }
  }

  function drawTail(ctx, cx, cy, r, style, bodyColor, outlineColor, time) {
    if (style === "none") return;
    const wag = Math.sin(time / 550) * 0.16;
    const tx = cx - r * 0.5, ty = cy + r * 0.1;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(wag);
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = r * 0.05;

    switch (style) {
      case "bushy":
      case "ringed":
        roundRect(ctx, -r * 0.42, -r * 0.34, r * 0.32, r * 0.5, r * 0.1);
        ctx.fill();
        ctx.stroke();
        break;
      case "puff":
        roundRect(ctx, -r * 0.2, -r * 0.12, r * 0.24, r * 0.24, r * 0.06);
        ctx.fill();
        ctx.stroke();
        break;
      case "flat":
        roundRect(ctx, -r * 0.38, -r * 0.08, r * 0.32, r * 0.18, r * 0.02);
        ctx.fill();
        ctx.stroke();
        break;
      case "fan":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-r * 0.34, -r * 0.14);
        ctx.lineTo(-r * 0.34, r * 0.14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case "thin":
      case "tiny":
      default:
        ctx.lineWidth = r * 0.07;
        ctx.strokeStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-r * 0.3, -r * 0.22);
        ctx.stroke();
    }
    ctx.restore();
  }

  function drawBadge(ctx, spec, x, y, r, accent, outlineColor, time) {
    let bx = x, by = y, alpha = 1, scale = 1, rot = 0;
    switch (spec.action) {
      case "bounce":
        by = y - Math.abs(Math.sin(time / 220)) * r * 0.06;
        break;
      case "sway":
        rot = Math.sin(time / 650) * 0.18;
        break;
      case "spin":
        rot = time / 500;
        scale = Math.abs(Math.cos(time / 500));
        break;
      case "pulse":
        scale = 1 + Math.sin(time / 260) * 0.08;
        break;
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

    roundRect(ctx, -r * 0.24, -r * 0.24, r * 0.48, r * 0.48, r * 0.1);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = r * 0.04;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    drawBadgeGlyph(ctx, spec.badge, r * 0.32);

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
        ctx.lineWidth = s * 0.16;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
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
        ctx.moveTo(-s * 0.2, -s * 0.3);
        ctx.lineTo(s * 0.32, 0);
        ctx.lineTo(-s * 0.2, s * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
      case "lines":
        ctx.lineWidth = s * 0.12;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(-s * 0.32, i * s * 0.22);
          ctx.lineTo(s * 0.32, i * s * 0.22);
          ctx.stroke();
        }
        break;
      case "magnifier":
        ctx.lineWidth = s * 0.16;
        ctx.beginPath();
        ctx.arc(-s * 0.06, -s * 0.06, s * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.1, s * 0.1);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.stroke();
        break;
      case "envelope":
        ctx.lineWidth = s * 0.1;
        ctx.strokeRect(-s * 0.32, -s * 0.22, s * 0.64, s * 0.44);
        ctx.beginPath();
        ctx.moveTo(-s * 0.32, -s * 0.22);
        ctx.lineTo(0, s * 0.05);
        ctx.lineTo(s * 0.32, -s * 0.22);
        ctx.stroke();
        break;
      case "book":
        ctx.lineWidth = s * 0.1;
        ctx.strokeRect(-s * 0.3, -s * 0.24, s * 0.6, s * 0.48);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.24);
        ctx.lineTo(0, s * 0.24);
        ctx.stroke();
        break;
      case "plane":
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3);
        ctx.lineTo(s * 0.2, s * 0.26);
        ctx.lineTo(0, s * 0.1);
        ctx.lineTo(-s * 0.2, s * 0.26);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  function drawNight(ctx, cx, cy, headSize) {
    ctx.fillStyle = "rgba(15,15,15,0.9)";
    roundRect(ctx, cx - headSize * 0.5, cy - headSize * 0.08, headSize * 0.4, headSize * 0.2, headSize * 0.03);
    ctx.fill();
    roundRect(ctx, cx + headSize * 0.1, cy - headSize * 0.08, headSize * 0.4, headSize * 0.2, headSize * 0.03);
    ctx.fill();

    ctx.fillStyle = "#ffe27a";
    roundRect(ctx, cx - headSize * 1.05, cy - headSize * 0.85, headSize * 0.3, headSize * 0.3, headSize * 0.06);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx - headSize * 0.85, cy - headSize * 0.75, headSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMorning(ctx, cx, cy, headSize) {
    ctx.fillStyle = "#ffd23f";
    roundRect(ctx, cx + headSize * 0.85, cy - headSize * 1.0, headSize * 0.3, headSize * 0.3, headSize * 0.06);
    ctx.fill();
  }

  return { draw };
})();
