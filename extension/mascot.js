// Draws a small cartoon "mascot" blob whose face and prop match the
// assigned category, plus an accessory if the title got a Night Owl /
// Early Bird prefix. Everything is drawn with basic canvas primitives —
// no image assets, so nothing to fetch and nothing to license.

function drawMascot(ctx, cx, cy, r, category, prefix) {
  ctx.save();

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.95, r * 0.7, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.82, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8ec";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.stroke();

  drawFace(ctx, cx, cy - r * 0.08, r, category);

  const accent = (CATEGORY_THEMES[category] && CATEGORY_THEMES[category].to) || "#6c5ce7";
  drawProp(ctx, cx, cy, r, category, accent);

  if (prefix === "Night Owl ") drawNightModifier(ctx, cx, cy, r);
  else if (prefix === "Early Bird ") drawMorningModifier(ctx, cx, cy, r);

  ctx.restore();
}

function drawFace(ctx, cx, cy, r, category) {
  ctx.strokeStyle = "#2a2a2a";
  ctx.fillStyle = "#2a2a2a";
  ctx.lineWidth = Math.max(3, r * 0.03);

  const eyeDx = r * 0.28;
  const eyeY = cy - r * 0.05;

  switch (category) {
    case "Dev & Tools": {
      // rectangular glasses + smug flat smile
      const w = r * 0.32,
        h = r * 0.22;
      ctx.strokeRect(cx - eyeDx - w / 2, eyeY - h / 2, w, h);
      ctx.strokeRect(cx + eyeDx - w / 2, eyeY - h / 2, w, h);
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx + w / 2, eyeY);
      ctx.lineTo(cx + eyeDx - w / 2, eyeY);
      ctx.stroke();
      dot(ctx, cx - eyeDx, eyeY, r * 0.05);
      dot(ctx, cx + eyeDx, eyeY, r * 0.05);
      arcMouth(ctx, cx, cy + r * 0.32, r * 0.18, false);
      break;
    }
    case "Entertainment": {
      // big excited round eyes, gasping mouth
      dot(ctx, cx - eyeDx, eyeY, r * 0.13);
      dot(ctx, cx + eyeDx, eyeY, r * 0.13);
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.34, r * 0.14, r * 0.19, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2a2a2a";
      ctx.fill();
      break;
    }
    case "Social": {
      // sly downcast eyes (scrolling), smirk
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx - r * 0.09, eyeY + r * 0.03);
      ctx.lineTo(cx - eyeDx + r * 0.09, eyeY - r * 0.03);
      ctx.moveTo(cx + eyeDx - r * 0.09, eyeY - r * 0.03);
      ctx.lineTo(cx + eyeDx + r * 0.09, eyeY + r * 0.03);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + r * 0.05, cy + r * 0.3, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    }
    case "Shopping": {
      // dollar-sign starry eyes, big open grin
      ctx.font = `700 ${Math.round(r * 0.26)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("$", cx - eyeDx, eyeY + r * 0.09);
      ctx.fillText("$", cx + eyeDx, eyeY + r * 0.09);
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.32, r * 0.2, r * 0.13, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2a2a2a";
      ctx.fill();
      break;
    }
    case "News": {
      // monocle over one eye, raised eyebrow, thin serious mouth
      dot(ctx, cx - eyeDx, eyeY, r * 0.05);
      dot(ctx, cx + eyeDx, eyeY, r * 0.05);
      ctx.beginPath();
      ctx.arc(cx + eyeDx, eyeY, r * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx - r * 0.12, eyeY - r * 0.18);
      ctx.lineTo(cx - eyeDx + r * 0.12, eyeY - r * 0.24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.16, cy + r * 0.32);
      ctx.lineTo(cx + r * 0.16, cy + r * 0.32);
      ctx.stroke();
      break;
    }
    case "Search": {
      // squinting curious eyes, pursed mouth
      ctx.beginPath();
      ctx.moveTo(cx - eyeDx - r * 0.1, eyeY);
      ctx.lineTo(cx - eyeDx + r * 0.1, eyeY);
      ctx.moveTo(cx + eyeDx - r * 0.1, eyeY);
      ctx.lineTo(cx + eyeDx + r * 0.1, eyeY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.32, r * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = "#2a2a2a";
      ctx.fill();
      break;
    }
    case "Email": {
      // tired droopy eyes with bags, flat mouth
      ctx.beginPath();
      ctx.ellipse(cx - eyeDx, eyeY + r * 0.02, r * 0.07, r * 0.04, 0, 0, Math.PI);
      ctx.ellipse(cx + eyeDx, eyeY + r * 0.02, r * 0.07, r * 0.04, 0, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - eyeDx, eyeY + r * 0.13, r * 0.09, r * 0.03, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + eyeDx, eyeY + r * 0.13, r * 0.09, r * 0.03, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(42,42,42,0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.14, cy + r * 0.33);
      ctx.lineTo(cx + r * 0.14, cy + r * 0.33);
      ctx.stroke();
      break;
    }
    default: {
      // dizzy spiral eyes, confused "o" mouth
      spiral(ctx, cx - eyeDx, eyeY, r * 0.09);
      spiral(ctx, cx + eyeDx, eyeY, r * 0.09);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.33, r * 0.09, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawProp(ctx, cx, cy, r, category, accent) {
  const px = cx + r * 0.95;
  const py = cy + r * 0.55;

  ctx.fillStyle = accent;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 4;

  switch (category) {
    case "Dev & Tools": {
      roundRectPath(ctx, px - r * 0.3, py - r * 0.22, r * 0.6, r * 0.4, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
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
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
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
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.stroke();
      break;
    }
    default: {
      // compass
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
  // sunglasses
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

  // crescent moon
  ctx.fillStyle = "#ffe27a";
  ctx.beginPath();
  ctx.arc(cx - r * 0.75, cy - r * 0.85, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#00000000";
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx - r * 0.68, cy - r * 0.9, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMorningModifier(ctx, cx, cy, r) {
  // coffee cup with steam, near the body
  const mx = cx - r * 0.95;
  const my = cy + r * 0.55;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 4;
  roundRectPath(ctx, mx - r * 0.2, my - r * 0.15, r * 0.4, r * 0.3, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(mx + r * 0.22, my, r * 0.1, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  for (const dx of [-r * 0.08, r * 0.08]) {
    ctx.beginPath();
    ctx.moveTo(mx + dx, my - r * 0.2);
    ctx.quadraticCurveTo(mx + dx - r * 0.05, my - r * 0.32, mx + dx, my - r * 0.42);
    ctx.stroke();
  }

  // sun
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.arc(cx + r * 0.85, cy - r * 0.9, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

function dot(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function arcMouth(ctx, x, y, radius, open) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
}

function spiral(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const rad = (r * a) / (Math.PI * 4);
    const x = cx + rad * Math.cos(a);
    const y = cy + rad * Math.sin(a);
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
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
