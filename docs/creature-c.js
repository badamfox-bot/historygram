// Engine C — "Sticker": same animal cast as Engine B but a completely
// different visual language: flat saturated fills, chunky near-black tinted
// outlines, cel-shade crescents, big white sticker eyes with dot pupils,
// exaggerated poses and comic FX (impact stars, speed lines). All canvas
// primitives. Self-contained IIFE, coexists with mascot.js / creature-b.js.
//
// Same layout contract as Engine B: nothing above -1.3r, below +1.05r,
// outside ±1.6r, and nothing ever crosses the face.
const EngineC = (function () {
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex({ r, g, b }) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}`;
  }
  function mixc(hex, target, amount) {
    const a = hexToRgb(hex), b = hexToRgb(target);
    return rgbToHex({ r: a.r + (b.r - a.r) * amount, g: a.g + (b.g - a.g) * amount, b: a.b + (b.b - a.b) * amount });
  }
  const lighten = (hex, amt) => mixc(hex, "#ffffff", amt);
  const darken = (hex, amt) => mixc(hex, "#000000", amt);

  function rr(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  function ell(ctx, x, y, rx, ry, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  }
  function poly(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  }

  // chunky fill+outline
  function fo(ctx, C, r, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = r * 0.06;
    ctx.lineJoin = "round";
    ctx.strokeStyle = C.line;
    ctx.stroke();
  }

  // cel-shade crescent: darker fill clipped to the current-ish mass
  function cel(ctx, C, x, y, rx, ry) {
    ctx.save();
    ell(ctx, x, y, rx, ry);
    ctx.clip();
    ell(ctx, x + rx * 0.35, y + ry * 0.4, rx, ry);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fill();
    ctx.restore();
  }

  function blinkAt(t, seed) {
    const cycle = 4200 + (seed % 5) * 350;
    const w = 150;
    const p = t % cycle;
    if (p < cycle - w) return 0;
    return Math.sin(((p - (cycle - w)) / w) * Math.PI);
  }

  // Sticker eye: big white circle, fat pupil, one square catchlight.
  // Blinks snap fully closed to a chunky line.
  function eye(ctx, C, x, y, er, blink, ldx = 0, ldy = 0) {
    if (blink > 0.45) {
      ctx.strokeStyle = C.line;
      ctx.lineWidth = er * 0.35;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - er * 0.8, y);
      ctx.lineTo(x + er * 0.8, y);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, er, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = er * 0.22;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + ldx * er * 0.35, y + ldy * er * 0.35, er * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = C.line;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + ldx * er * 0.35 - er * 0.05, y + ldy * er * 0.35 - er * 0.3, er * 0.22, er * 0.22);
  }

  function grinMouth(ctx, C, x, y, w) {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = w * 0.22;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.lineTo(x, y + w * 0.55);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  function glyph(ctx, ch, x, y, size, color, alpha = 1, font = "sans-serif") {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `800 ${Math.round(size)}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y);
    ctx.restore();
  }

  function star(ctx, x, y, size, color, spikes, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? size : size * 0.42;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function pulse(t, cycle, windowMs) {
    const p = t % cycle;
    if (p < cycle - windowMs) return 0;
    return Math.sin(((p - (cycle - windowMs)) / windowMs) * Math.PI);
  }

  function speedLines(ctx, C, x, y, r, count, angle, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineCap = "round";
    for (let i = 0; i < count; i++) {
      const ph = ((t / 4 + i * 47) % 100) / 100;
      ctx.lineWidth = r * 0.035 * (1 - ph * 0.5);
      ctx.beginPath();
      ctx.moveTo(-r * (0.2 + ph * 0.5), (i - count / 2) * r * 0.12);
      ctx.lineTo(-r * (0.45 + ph * 0.5), (i - count / 2) * r * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- scenes

  // Dev & Tools — Owl slammed forward into the glow, keys flying.
  function sceneOwl(ctx, C, r, t) {
    const peck = Math.abs(Math.sin(t / 120));

    // tufts: sharp triangles
    for (const s of [-1, 1]) {
      poly(ctx, [[s * r * 0.2, -r * 0.68], [s * r * 0.42, -r * 1.05], [s * r * 0.48, -r * 0.58]]);
      fo(ctx, C, r, C.body);
    }
    // angular egg body, hunched forward
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(0.06 + peck * 0.02);
    rr(ctx, -r * 0.55, -r * 0.68, r * 1.1, r * 1.42, r * 0.42);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, 0.05 * r, r * 0.55, r * 0.71);
    // belly panel
    rr(ctx, -r * 0.32, r * 0.05, r * 0.64, r * 0.6, r * 0.24);
    ctx.fillStyle = C.pale;
    ctx.fill();
    // face
    const bl = blinkAt(t, 3);
    eye(ctx, C, -r * 0.2, -r * 0.3, r * 0.17, bl, 0.4, 0.6);
    eye(ctx, C, r * 0.2, -r * 0.3, r * 0.17, bl, 0.4, 0.6);
    poly(ctx, [[-r * 0.07, -r * 0.14], [r * 0.07, -r * 0.14], [0, r * 0.0]]);
    ctx.fillStyle = "#ffb020";
    ctx.fill();
    ctx.lineWidth = r * 0.035;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // intense brows
    ctx.lineWidth = r * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, -r * 0.56);
    ctx.lineTo(-r * 0.08, -r * 0.48);
    ctx.moveTo(r * 0.08, -r * 0.48);
    ctx.lineTo(r * 0.36, -r * 0.56);
    ctx.stroke();
    ctx.restore();

    // talons
    for (const s of [-1, 1]) {
      poly(ctx, [[s * r * 0.28, r * 0.72], [s * r * 0.1, r * 0.72], [s * r * 0.19, r * 0.86]]);
      fo(ctx, C, r, "#ffb020");
    }

    // laptop low-right, back to viewer, glow blasting out
    ctx.save();
    ctx.translate(r * 0.78, r * 0.5);
    ctx.rotate(-0.1);
    const flick = 0.55 + Math.sin(t / 120) * 0.25;
    ctx.save();
    ctx.globalAlpha = flick;
    poly(ctx, [[-r * 0.42, -r * 0.42], [-r * 0.62, -r * 0.75], [-r * 0.05, -r * 0.55]]);
    ctx.fillStyle = "#9fe0ff";
    ctx.fill();
    ctx.restore();
    rr(ctx, -r * 0.36, -r * 0.44, r * 0.72, r * 0.5, r * 0.05);
    fo(ctx, C, r, C.dark);
    glyph(ctx, "</>", 0, -r * 0.2, r * 0.14, "rgba(255,255,255,0.35)", 1, "monospace");
    rr(ctx, -r * 0.32, 0.04 * r, r * 0.64, r * 0.1, r * 0.03);
    fo(ctx, C, r, C.dark);
    ctx.restore();

    // wing hammering the keys, blurred
    ell(ctx, r * 0.42, r * 0.3 + peck * r * 0.08, r * 0.17, r * 0.3, -0.55);
    fo(ctx, C, r, C.bodyDim);
    if (peck > 0.9) star(ctx, r * 0.55, r * 0.42, r * 0.07, "#9fe0ff", 4, t / 200);

    // keycaps flying out of the laptop
    for (let i = 0; i < 2; i++) {
      const ph = ((t + i * 800) % 1600) / 1600;
      const kx = r * (0.85 + ph * 0.5);
      const ky = r * 0.1 - Math.sin(ph * Math.PI) * r * 0.5;
      ctx.save();
      ctx.globalAlpha = 1 - ph;
      ctx.translate(kx, ky);
      ctx.rotate(ph * 3);
      rr(ctx, -r * 0.05, -r * 0.05, r * 0.1, r * 0.1, r * 0.02);
      fo(ctx, C, r, "#ffffff");
      ctx.restore();
    }
  }

  // Entertainment — Raccoon fully reclined, feet up, mid popcorn toss.
  function sceneRaccoon(ctx, C, r, t) {
    // chunky ringed tail
    ctx.save();
    ctx.translate(r * 0.55, r * 0.45);
    ctx.rotate(Math.sin(t / 600) * 0.15);
    for (let i = 3; i >= 0; i--) {
      rr(ctx, i * r * 0.11, -i * r * 0.12 - r * 0.1, r * 0.24, r * 0.2, r * 0.09);
      ctx.fillStyle = i % 2 === 0 ? C.body : C.line;
      ctx.fill();
      if (i % 2 === 0) {
        ctx.lineWidth = r * 0.05;
        ctx.strokeStyle = C.line;
        ctx.stroke();
      }
    }
    ctx.restore();

    // reclined body, angled back
    ctx.save();
    ctx.rotate(-0.12);
    rr(ctx, -r * 0.55, -r * 0.1, r * 1.1, r * 0.85, r * 0.4);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.3, r * 0.55, r * 0.43);
    rr(ctx, -r * 0.3, r * 0.12, r * 0.6, r * 0.5, r * 0.24);
    ctx.fillStyle = C.pale;
    ctx.fill();
    ctx.restore();

    // feet kicked up on the bucket
    for (const s of [0, 1]) {
      ell(ctx, r * (0.15 + s * 0.22), r * 0.6 - s * r * 0.06, r * 0.13, r * 0.09, -0.4);
      fo(ctx, C, r, C.bodyDim);
    }

    // head
    rr(ctx, -r * 0.42, -r * 0.72, r * 0.84, r * 0.68, r * 0.3);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      poly(ctx, [[s * r * 0.16, -r * 0.66], [s * r * 0.42, -r * 0.98], [s * r * 0.46, -r * 0.6]]);
      fo(ctx, C, r, C.body);
    }
    // mask
    rr(ctx, -r * 0.4, -r * 0.55, r * 0.8, r * 0.24, r * 0.12);
    ctx.fillStyle = C.dark;
    ctx.fill();
    const bl = Math.max(blinkAt(t, 5), 0);
    eye(ctx, C, -r * 0.17, -r * 0.43, r * 0.13, bl, 0, -0.4); // watching the kernel fly
    eye(ctx, C, r * 0.17, -r * 0.43, r * 0.13, bl, 0, -0.4);
    ell(ctx, 0, -r * 0.24, r * 0.05, r * 0.04);
    ctx.fillStyle = C.line;
    ctx.fill();
    // open catching mouth
    const cyc = (t % 1400) / 1400;
    const open = cyc > 0.5 && cyc < 0.85 ? 1 : 0.3;
    ell(ctx, 0, -r * 0.1, r * 0.09 * open, r * 0.11 * open);
    ctx.fillStyle = C.line;
    ctx.fill();

    // bucket held at arm's length, left
    ctx.save();
    ctx.translate(-r * 0.62, r * 0.28);
    ctx.rotate(0.15);
    poly(ctx, [[-r * 0.18, -r * 0.2], [r * 0.18, -r * 0.2], [r * 0.24, r * 0.22], [-r * 0.24, r * 0.22]]);
    fo(ctx, C, r, C.accent);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.04, -r * 0.19, r * 0.08, r * 0.4);
    for (const [px, py] of [[-0.1, -0.24], [0.02, -0.28], [0.12, -0.23]]) {
      ctx.beginPath();
      ctx.arc(px * r, py * r, r * 0.05, 0, Math.PI * 2);
      fo(ctx, C, r, "#fff3d1");
    }
    ctx.restore();
    // arm holding it
    ell(ctx, -r * 0.45, r * 0.2, r * 0.16, r * 0.1, 0.5);
    fo(ctx, C, r, C.body);

    // the tossed kernel: big dramatic arc from bucket to mouth
    if (cyc < 0.85) {
      const p = cyc / 0.85;
      const kx = -r * 0.62 + (0 - -r * 0.62) * p;
      const ky = r * 0.1 + (-r * 0.1 - r * 0.1) * p - Math.sin(p * Math.PI) * r * 0.75;
      ctx.beginPath();
      ctx.arc(kx, ky, r * 0.055, 0, Math.PI * 2);
      fo(ctx, C, r, "#fff3d1");
      if (p > 0.94) star(ctx, 0, -r * 0.1, r * 0.12, "#ffe27a", 5, t / 300);
    }
  }

  // Social — Rabbit thrusting the phone up for the perfect selfie.
  function sceneRabbit(ctx, C, r, t) {
    // ears: exaggerated, one straight up, one kinked
    ctx.save();
    ctx.translate(-r * 0.15, -r * 0.6);
    ctx.rotate(-0.08);
    rr(ctx, -r * 0.09, -r * 0.72, r * 0.18, r * 0.75, r * 0.09);
    fo(ctx, C, r, C.body);
    rr(ctx, -r * 0.04, -r * 0.62, r * 0.08, r * 0.55, r * 0.04);
    ctx.fillStyle = "#ff8fb8";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.18, -r * 0.6);
    ctx.rotate(0.2);
    rr(ctx, -r * 0.08, -r * 0.4, r * 0.16, r * 0.45, r * 0.08);
    fo(ctx, C, r, C.body);
    ctx.save();
    ctx.translate(0, -r * 0.4);
    ctx.rotate(1.0);
    rr(ctx, -r * 0.08, -r * 0.3, r * 0.16, r * 0.32, r * 0.08);
    fo(ctx, C, r, C.body);
    ctx.restore();
    ctx.restore();

    // body
    rr(ctx, -r * 0.48, -r * 0.05, r * 0.96, r * 0.88, r * 0.4);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.4, r * 0.48, r * 0.44);
    rr(ctx, -r * 0.26, r * 0.2, r * 0.52, r * 0.5, r * 0.22);
    ctx.fillStyle = C.pale;
    ctx.fill();
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.3, r * 0.82, r * 0.2, r * 0.09);
      fo(ctx, C, r, C.bodyDim);
    }

    // head, tilted for the selfie angle
    ctx.save();
    ctx.rotate(-0.1);
    rr(ctx, -r * 0.38, -r * 0.66, r * 0.76, r * 0.62, r * 0.28);
    fo(ctx, C, r, C.body);
    const bl = blinkAt(t, 2);
    // wink for the camera: left eye almost always closed
    const wink = pulse(t, 2400, 1400);
    eye(ctx, C, -r * 0.15, -r * 0.38, r * 0.13, Math.max(bl, wink), -0.4, -0.5);
    eye(ctx, C, r * 0.15, -r * 0.38, r * 0.13, bl, -0.4, -0.5); // eyes up-left at phone
    poly(ctx, [[-r * 0.03, -r * 0.24], [r * 0.03, -r * 0.24], [0, -r * 0.19]]);
    ctx.fillStyle = "#ff8fb8";
    ctx.fill();
    grinMouth(ctx, C, 0, -r * 0.16, r * 0.1);
    ctx.restore();

    // arm thrust up-left holding phone high
    ell(ctx, -r * 0.42, -r * 0.35, r * 0.11, r * 0.28, 0.7);
    fo(ctx, C, r, C.body);
    ctx.save();
    ctx.translate(-r * 0.62, -r * 0.62);
    ctx.rotate(0.35);
    rr(ctx, -r * 0.13, -r * 0.24, r * 0.26, r * 0.46, r * 0.05);
    fo(ctx, C, r, C.dark);
    rr(ctx, -r * 0.1, -r * 0.2, r * 0.2, r * 0.38, r * 0.03);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.26, r * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = C.line;
    ctx.fill();
    ctx.restore();

    // FLASH
    const flash = pulse(t, 2400, 160);
    if (flash > 0) {
      star(ctx, -r * 0.62, -r * 0.62, r * (0.3 + flash * 0.25), `rgba(255,255,255,${flash})`, 8);
    }

    // hearts rocket up the right side
    for (let i = 0; i < 3; i++) {
      const ph = ((t + i * 700) % 2100) / 2100;
      const hx = r * (0.55 + i * 0.12);
      const hy = r * 0.2 - ph * r * 1.15;
      const hs = r * 0.09;
      ctx.save();
      ctx.globalAlpha = 1 - ph;
      ctx.fillStyle = "#ff4d73";
      ctx.beginPath();
      ctx.moveTo(hx, hy + hs * 0.35);
      ctx.bezierCurveTo(hx - hs, hy - hs * 0.55, hx - hs * 1.3, hy + hs * 0.45, hx, hy + hs * 1.15);
      ctx.bezierCurveTo(hx + hs * 1.3, hy + hs * 0.45, hx + hs, hy - hs * 0.55, hx, hy + hs * 0.35);
      ctx.fill();
      ctx.restore();
    }
  }

  // Shopping — Squirrel power-walking with bags in both paws.
  function sceneSquirrel(ctx, C, r, t) {
    const strut = Math.sin(t / 250);

    // mega tail: two stacked chunky curves
    ctx.save();
    ctx.translate(-r * 0.35, r * 0.45);
    ctx.rotate(Math.sin(t / 500) * 0.12 - 0.1);
    rr(ctx, -r * 0.45, -r * 0.6, r * 0.42, r * 0.7, r * 0.2);
    fo(ctx, C, r, C.bodyDim);
    rr(ctx, -r * 0.62, -r * 1.05, r * 0.36, r * 0.55, r * 0.18);
    fo(ctx, C, r, C.bodyDim);
    ctx.restore();

    // strutting body
    ctx.save();
    ctx.rotate(strut * 0.03);
    rr(ctx, -r * 0.4, -r * 0.1, r * 0.8, r * 0.78, r * 0.34);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.3, r * 0.4, r * 0.39);
    rr(ctx, -r * 0.2, r * 0.12, r * 0.4, r * 0.42, r * 0.18);
    ctx.fillStyle = C.pale;
    ctx.fill();
    // head high, chin up
    rr(ctx, -r * 0.32, -r * 0.68, r * 0.64, r * 0.6, r * 0.26);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.22, -r * 0.72, r * 0.1, r * 0.12);
      fo(ctx, C, r, C.body);
    }
    const bl = blinkAt(t, 4);
    eye(ctx, C, -r * 0.13, -r * 0.44, r * 0.115, bl, 0.3, -0.3);
    eye(ctx, C, r * 0.13, -r * 0.44, r * 0.115, bl, 0.3, -0.3);
    ell(ctx, 0, -r * 0.28, r * 0.04, r * 0.033);
    ctx.fillStyle = C.line;
    ctx.fill();
    ctx.fillStyle = "#ffffff"; // teeth
    ctx.fillRect(-r * 0.035, -r * 0.24, r * 0.07, r * 0.07);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.015;
    ctx.strokeRect(-r * 0.035, -r * 0.24, r * 0.07, r * 0.07);
    ctx.restore();

    // marching feet
    for (const s of [-1, 1]) {
      const step = Math.max(0, strut * s) * r * 0.06;
      ell(ctx, s * r * 0.2, r * 0.78 - step, r * 0.15, r * 0.08);
      fo(ctx, C, r, C.bodyDim);
    }

    // a bag in EACH paw, counter-swinging
    for (const s of [-1, 1]) {
      const swing = strut * s * 0.12;
      const bx = s * r * 0.62, by = r * 0.35;
      ell(ctx, s * r * 0.42, r * 0.15, r * 0.09, r * 0.2, s * 0.5); // arm
      fo(ctx, C, r, C.body);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(swing);
      poly(ctx, [[-r * 0.2, -r * 0.18], [r * 0.2, -r * 0.18], [r * 0.25, r * 0.28], [-r * 0.25, r * 0.28]]);
      fo(ctx, C, r, s < 0 ? C.accent : C.accBright);
      ctx.beginPath();
      ctx.arc(0, -r * 0.18, r * 0.1, Math.PI, 0);
      ctx.lineWidth = r * 0.04;
      ctx.strokeStyle = C.line;
      ctx.stroke();
      glyph(ctx, s < 0 ? "$" : "%", 0, r * 0.05, r * 0.16, "#ffffff");
      ctx.restore();
    }
    // acorn peeking from the right bag
    ell(ctx, r * 0.52, r * 0.1, r * 0.06, r * 0.08);
    ctx.fillStyle = "#c98d4e";
    ctx.fill();
    ell(ctx, r * 0.52, r * 0.03, r * 0.07, r * 0.04);
    ctx.fillStyle = "#8a5a2e";
    ctx.fill();
  }

  // News — Fox snapping the paper open, headline flash.
  function sceneFox(ctx, C, r, t) {
    const snapT = pulse(t, 2200, 300);

    // tail
    ctx.save();
    ctx.translate(-r * 0.5, r * 0.6);
    ctx.rotate(Math.sin(t / 700) * 0.08);
    poly(ctx, [[0, 0], [-r * 0.55, -r * 0.1], [-r * 0.35, r * 0.22]]);
    fo(ctx, C, r, C.body);
    poly(ctx, [[-r * 0.55, -r * 0.1], [-r * 0.72, -r * 0.08], [-r * 0.5, r * 0.12]]);
    fo(ctx, C, r, "#fff6ec");
    ctx.restore();

    // seated angular body
    rr(ctx, -r * 0.45, -r * 0.05, r * 0.9, r * 0.82, r * 0.36);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.35, r * 0.45, r * 0.41);

    // head with sharp ears
    rr(ctx, -r * 0.36, -r * 0.66, r * 0.72, r * 0.58, r * 0.26);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      poly(ctx, [[s * r * 0.1, -r * 0.6], [s * r * 0.34, -r * 1.02], [s * r * 0.42, -r * 0.52]]);
      fo(ctx, C, r, C.body);
      poly(ctx, [[s * r * 0.18, -r * 0.62], [s * r * 0.32, -r * 0.88], [s * r * 0.36, -r * 0.58]]);
      ctx.fillStyle = C.dark;
      ctx.fill();
    }
    const bl = blinkAt(t, 1);
    eye(ctx, C, -r * 0.14, -r * 0.42, r * 0.11, bl, 0, 0.6);
    eye(ctx, C, r * 0.14, -r * 0.42, r * 0.11, bl, 0, 0.6);
    // sharp snout wedge
    poly(ctx, [[-r * 0.08, -r * 0.3], [r * 0.08, -r * 0.3], [0, -r * 0.16]]);
    fo(ctx, C, r, C.pale);
    ell(ctx, 0, -r * 0.28, r * 0.04, r * 0.033);
    ctx.fillStyle = C.line;
    ctx.fill();
    // brow furrow
    ctx.lineWidth = r * 0.05;
    ctx.lineCap = "round";
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(-r * 0.26, -r * 0.58);
    ctx.lineTo(-r * 0.05, -r * 0.54);
    ctx.moveTo(r * 0.05, -r * 0.54);
    ctx.lineTo(r * 0.26, -r * 0.58);
    ctx.stroke();

    // paper SNAPS open (scale x pops on the pulse)
    ctx.save();
    ctx.translate(0, r * 0.35);
    ctx.scale(1 + snapT * 0.12, 1);
    ctx.rotate(Math.sin(t / 1000) * 0.02);
    rr(ctx, -r * 0.42, -r * 0.24, r * 0.84, r * 0.46, r * 0.02);
    fo(ctx, C, r, "#ffffff");
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.24);
    ctx.lineTo(0, r * 0.22);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = r * 0.02;
    ctx.stroke();
    // screaming headline
    ctx.fillStyle = C.line;
    ctx.fillRect(-r * 0.36, -r * 0.18, r * 0.32, r * 0.07);
    glyph(ctx, "!", -r * 0.02 + r * 0.14, -r * 0.14, r * 0.1, C.accent);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-r * 0.36, -r * 0.05 + i * r * 0.08, r * 0.32, r * 0.035);
      ctx.fillRect(r * 0.06, -r * 0.18 + i * r * 0.08, r * 0.3, r * 0.035);
    }
    ctx.restore();
    // paws gripping the edges
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.46, r * 0.42, r * 0.1, r * 0.08, s * 0.3);
      fo(ctx, C, r, C.body);
    }
    if (snapT > 0.7) {
      star(ctx, -r * 0.52, r * 0.14, r * 0.06, "#ffffff", 4, 0.4);
      star(ctx, r * 0.52, r * 0.14, r * 0.06, "#ffffff", 4, -0.4);
    }
  }

  // Search — Meerkat periscoping WAY up, lens gleam.
  function sceneMeerkat(ctx, C, r, t) {
    const stretch = 1 + ((Math.sin(t / 1200) + 1) / 2) * 0.09;
    const scanX = Math.sin(t / 900) * 0.5;

    ctx.save();
    ctx.translate(0, r * 0.88);
    ctx.scale(1, stretch);
    ctx.translate(0, -r * 0.88);

    // tail tripod
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.55);
    ctx.quadraticCurveTo(r * 0.55, r * 0.72, r * 0.6, r * 0.95);
    ctx.lineWidth = r * 0.1;
    ctx.strokeStyle = C.bodyDim;
    ctx.lineCap = "round";
    ctx.stroke();

    // extra-tall column body
    rr(ctx, -r * 0.26, -r * 0.35, r * 0.52, r * 1.25, r * 0.24);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.28, r * 0.26, r * 0.62);
    rr(ctx, -r * 0.14, -r * 0.15, r * 0.28, r * 0.85, r * 0.13);
    ctx.fillStyle = C.pale;
    ctx.fill();
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.12, r * 0.88, r * 0.1, r * 0.05);
      fo(ctx, C, r, C.bodyDim);
    }
    // folded left arm
    ell(ctx, -r * 0.18, r * 0.05, r * 0.08, r * 0.06, 0.4);
    fo(ctx, C, r, C.body);

    // head
    rr(ctx, -r * 0.24, -r * 0.72, r * 0.48, r * 0.42, r * 0.18);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.2, -r * 0.66, r * 0.05, r * 0.06);
      fo(ctx, C, r, C.bodyDim);
    }
    // eye patches
    ctx.fillStyle = C.dark;
    ell(ctx, -r * 0.1, -r * 0.55, r * 0.09, r * 0.1);
    ctx.fill();
    ell(ctx, r * 0.11, -r * 0.55, r * 0.1, r * 0.11);
    ctx.fill();
    const bl = blinkAt(t, 6);
    eye(ctx, C, -r * 0.1, -r * 0.55, r * 0.06, bl, scanX, 0);
    // snout
    poly(ctx, [[-r * 0.05, -r * 0.42], [r * 0.05, -r * 0.42], [0, -r * 0.34]]);
    fo(ctx, C, r, C.bodyDim);

    // magnifying glass on the right eye — magnified sticker eye inside
    const gx = r * 0.13, gy = -r * 0.55;
    ell(ctx, r * 0.3, -r * 0.2, r * 0.08, r * 0.16, -0.5); // raised arm
    fo(ctx, C, r, C.body);
    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(190,230,255,0.4)";
    ctx.fill();
    ctx.clip();
    eye(ctx, C, gx, gy, r * 0.15, bl, scanX, 0);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(gx, gy, r * 0.2, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.055;
    ctx.strokeStyle = C.dark;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx + r * 0.14, gy + r * 0.15);
    ctx.lineTo(gx + r * 0.26, gy + r * 0.34);
    ctx.lineWidth = r * 0.06;
    ctx.lineCap = "round";
    ctx.stroke();
    // lens gleam sweep
    const gph = (t % 1800) / 1800;
    if (gph < 0.25) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.18, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.8;
      ctx.rotate(0);
      ctx.fillStyle = "#ffffff";
      const sw = gph / 0.25;
      ctx.fillRect(gx - r * 0.25 + sw * r * 0.4, gy - r * 0.25, r * 0.06, r * 0.5);
      ctx.restore();
    }

    ctx.restore(); // stretch

    // "!" pops up when it spots something (synced to peak stretch)
    if (Math.sin(t / 1200) > 0.92) {
      glyph(ctx, "!", r * 0.5, -r * 1.05, r * 0.22, "#ffe27a");
    }
  }

  // Email — Beaver going ballistic on the mail pile.
  function sceneBeaver(ctx, C, r, t) {
    const slam = (t % 750) / 750; // faster, angrier stamping than Engine B
    const armUp = slam < 0.5 ? Math.sin((slam / 0.5) * Math.PI) : 0;
    const hit = slam >= 0.5 && slam < 0.62;

    // flat tail, big slap
    const slap = pulse(t, 2600, 400);
    ctx.save();
    ctx.translate(r * 0.45, r * 0.6);
    ctx.rotate(-0.2 + slap * 0.5);
    rr(ctx, 0, -r * 0.1, r * 0.55, r * 0.22, r * 0.06);
    fo(ctx, C, r, C.dark);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = r * 0.015;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.11, -r * 0.08);
      ctx.lineTo(i * r * 0.11, r * 0.1);
      ctx.stroke();
    }
    ctx.restore();
    if (slap > 0.8) {
      star(ctx, r * 0.95, r * 0.8, r * 0.09, "#d8c9b0", 5, t / 100);
    }

    // stocky body
    rr(ctx, -r * 0.48, -r * 0.08, r * 0.96, r * 0.85, r * 0.36);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.32, r * 0.48, r * 0.42);
    rr(ctx, -r * 0.26, r * 0.14, r * 0.52, r * 0.5, r * 0.22);
    ctx.fillStyle = C.pale;
    ctx.fill();

    // head
    rr(ctx, -r * 0.38, -r * 0.68, r * 0.76, r * 0.62, r * 0.28);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.3, -r * 0.7, r * 0.09, r * 0.1);
      fo(ctx, C, r, C.body);
    }
    const bl = blinkAt(t, 7);
    eye(ctx, C, -r * 0.15, -r * 0.44, r * 0.12, bl, 0.2, 0.6);
    eye(ctx, C, r * 0.15, -r * 0.44, r * 0.12, bl, 0.2, 0.6);
    // war brows
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.055;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.28, -r * 0.62);
    ctx.lineTo(-r * 0.06, -r * 0.54);
    ctx.moveTo(r * 0.06, -r * 0.54);
    ctx.lineTo(r * 0.28, -r * 0.62);
    ctx.stroke();
    ell(ctx, 0, -r * 0.3, r * 0.05, r * 0.04);
    ctx.fillStyle = C.line;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.055, -r * 0.26, r * 0.11, r * 0.11);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.02;
    ctx.strokeRect(-r * 0.055, -r * 0.26, r * 0.11, r * 0.11);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.26);
    ctx.lineTo(0, -r * 0.15);
    ctx.stroke();

    // desk
    rr(ctx, -r * 0.66, r * 0.5, r * 1.25, r * 0.24, r * 0.08);
    fo(ctx, C, r, "#9a6b43");

    // teetering mail tower (left)
    const towerN = 5 - (Math.floor(t / 750) % 5);
    const lean = Math.sin(t / 400) * 0.04;
    ctx.save();
    ctx.translate(-r * 0.42, r * 0.5);
    ctx.rotate(lean);
    for (let i = 0; i < towerN; i++) {
      rr(ctx, -r * 0.14 + (i % 2) * r * 0.02, -i * r * 0.06 - r * 0.06, r * 0.28, r * 0.06, r * 0.01);
      fo(ctx, C, r, "#ffffff");
    }
    ctx.restore();

    // envelope under the stamp
    rr(ctx, -r * 0.08, r * 0.4, r * 0.3, r * 0.15, r * 0.01);
    fo(ctx, C, r, "#ffffff");
    if (hit) {
      ell(ctx, r * 0.07, r * 0.48, r * 0.05, r * 0.05);
      ctx.fillStyle = C.accent;
      ctx.fill();
      star(ctx, r * 0.07, r * 0.3, r * 0.14, "#ffe27a", 6, t / 150);
      glyph(ctx, "DONE", r * 0.07, r * 0.18, r * 0.08, "#ffe27a");
    }
    // slamming arm + stamper
    const armY = r * 0.12 - armUp * r * 0.3;
    ell(ctx, r * 0.32, armY + r * 0.12, r * 0.11, r * 0.17, -0.3);
    fo(ctx, C, r, C.body);
    ctx.save();
    ctx.translate(r * 0.16, armY);
    rr(ctx, -r * 0.045, -r * 0.14, r * 0.09, r * 0.16, r * 0.02);
    fo(ctx, C, r, C.dark);
    rr(ctx, -r * 0.1, 0.02 * r, r * 0.2, r * 0.08, r * 0.02);
    fo(ctx, C, r, C.accent);
    ctx.restore();
    // steadying paw
    ell(ctx, -r * 0.16, r * 0.44, r * 0.09, r * 0.06, 0.2);
    fo(ctx, C, r, C.body);

    // processed mail ROCKETING off right with speed lines
    for (let i = 0; i < 2; i++) {
      const ph = ((t + 375 + i * 750) % 1500) / 1500;
      const ex = r * (0.35 + ph * 1.2);
      const ey = r * 0.35 - Math.sin(ph * Math.PI) * r * 0.7;
      ctx.save();
      ctx.globalAlpha = 1 - ph * ph;
      ctx.translate(ex, ey);
      ctx.rotate(-0.4 + ph * 1.6);
      rr(ctx, -r * 0.09, -r * 0.055, r * 0.18, r * 0.11, r * 0.01);
      fo(ctx, C, r, "#ffffff");
      ctx.restore();
    }
    speedLines(ctx, C, r * 1.1, -r * 0.15, r, 3, -0.5, t);
  }

  // Finance — Hamster at full sprint, coin wheel blazing.
  function sceneHamster(ctx, C, r, t) {
    const rot = t / 550; // faster wheel

    // speed lines around the whole wheel
    speedLines(ctx, C, -r * 1.1, r * 0.1, r, 4, 0, t);

    ctx.save();
    ctx.translate(0, r * 0.08);
    ctx.rotate(Math.sin(t / 300) * 0.02);
    // coin
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    fo(ctx, C, r, "#f6c945");
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = "#ffdf70";
    ctx.fill();
    ctx.lineWidth = r * 0.04;
    ctx.strokeStyle = "#c9971b";
    ctx.stroke();
    // ridged edge (rotating tick marks)
    ctx.strokeStyle = "#c9971b";
    ctx.lineWidth = r * 0.035;
    for (let i = 0; i < 12; i++) {
      const a = rot * 0.8 + (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
      ctx.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      glyph(ctx, "$", Math.cos(a) * r * 0.79, Math.sin(a) * r * 0.79, r * 0.17, "#a97b12");
    }
    ctx.restore();

    // hamster at FULL tilt
    ctx.save();
    ctx.translate(-r * 0.02, r * 0.4);
    ctx.rotate(0.22); // way leaned in
    // leg blur: spinning ellipse suggestion
    ctx.save();
    ctx.translate(-r * 0.02, r * 0.2);
    ctx.rotate(t / 60);
    ell(ctx, 0, 0, r * 0.16, r * 0.05);
    ctx.fillStyle = C.bodyDim;
    ctx.fill();
    ctx.restore();
    // body
    rr(ctx, -r * 0.32, -r * 0.24, r * 0.64, r * 0.48, r * 0.22);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, 0, r * 0.32, r * 0.24);
    // head
    rr(ctx, r * 0.12, -r * 0.4, r * 0.42, r * 0.4, r * 0.17);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ell(ctx, r * 0.24 + s * r * 0.1, -r * 0.46, r * 0.06, r * 0.07);
      fo(ctx, C, r, C.body);
    }
    // MAXIMUM stuffed cheeks
    ell(ctx, r * 0.44, -r * 0.1, r * 0.13, r * 0.11);
    fo(ctx, C, r, C.pale);
    const bl = blinkAt(t, 8);
    eye(ctx, C, r * 0.32, -r * 0.24, r * 0.09, bl, 0.6, 0);
    ell(ctx, r * 0.55, -r * 0.2, r * 0.03, r * 0.025);
    ctx.fillStyle = C.line;
    ctx.fill();
    // gritted determination
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.03;
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.08);
    ctx.lineTo(r * 0.52, -r * 0.1);
    ctx.stroke();
    ctx.restore();

    // sweat drops flying
    for (let i = 0; i < 2; i++) {
      const ph = ((t + i * 600) % 1200) / 1200;
      ctx.save();
      ctx.globalAlpha = 1 - ph;
      ell(ctx, r * (0.5 + ph * 0.4), -r * (0.1 + ph * 0.35), r * 0.035, r * 0.05, 0.5);
      ctx.fillStyle = "#9fd8ff";
      ctx.fill();
      ctx.restore();
    }
  }

  // Productivity — Ant powerlifting the checklist, one leg count.
  function sceneAnt(ctx, C, r, t) {
    const hup = Math.abs(Math.sin(t / 450)) * r * 0.05; // rhythmic press-up

    // legs: angular strokes, braced wide
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.05;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      for (const s of [-1, 1]) {
        const baseX = r * (-0.2 + i * 0.3);
        ctx.beginPath();
        ctx.moveTo(baseX, r * 0.58);
        ctx.lineTo(baseX + s * r * 0.16, r * 0.74);
        ctx.lineTo(baseX + s * r * 0.22, r * 0.92);
        ctx.stroke();
      }
    }

    // three chunky segments
    rr(ctx, -r * 0.58, r * 0.28 - hup, r * 0.4, r * 0.34, r * 0.16); // head
    fo(ctx, C, r, C.body);
    rr(ctx, -r * 0.22, r * 0.34 - hup * 0.6, r * 0.44, r * 0.36, r * 0.17); // thorax
    fo(ctx, C, r, C.body);
    rr(ctx, r * 0.18, r * 0.34, r * 0.62, r * 0.44, r * 0.22); // abdomen
    fo(ctx, C, r, C.body);
    cel(ctx, C, r * 0.49, r * 0.56, r * 0.31, r * 0.22);

    // face: gritted determination
    const bl = blinkAt(t, 9);
    eye(ctx, C, -r * 0.46, r * 0.38 - hup, r * 0.08, bl, -0.3, -0.6);
    eye(ctx, C, -r * 0.3, r * 0.38 - hup, r * 0.08, bl, -0.3, -0.6);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.035;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, r * 0.52 - hup);
    ctx.lineTo(-r * 0.32, r * 0.52 - hup);
    ctx.stroke();
    // antennae strained back
    for (const s of [0, 1]) {
      const ax = -r * (0.52 - s * 0.14);
      ctx.beginPath();
      ctx.moveTo(ax, r * 0.24 - hup);
      ctx.quadraticCurveTo(ax + r * 0.06, r * 0.05, ax + r * 0.12, r * 0.0);
      ctx.lineWidth = r * 0.03;
      ctx.strokeStyle = C.line;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax + r * 0.12, 0, r * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = C.line;
      ctx.fill();
    }

    // lifting arms, locked out
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.055;
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, r * 0.26 - hup);
    ctx.lineTo(-r * 0.4, -r * 0.28 - hup);
    ctx.moveTo(-r * 0.1, r * 0.28 - hup * 0.6);
    ctx.lineTo(r * 0.08, -r * 0.24 - hup);
    ctx.stroke();

    // the checklist: barbell-sized
    ctx.save();
    ctx.translate(-r * 0.12, -r * 0.68 - hup);
    ctx.rotate(Math.sin(t / 800) * 0.04);
    rr(ctx, -r * 0.55, -r * 0.5, r * 1.1, r * 0.95, r * 0.06);
    fo(ctx, C, r, C.accent);
    rr(ctx, -r * 0.46, -r * 0.4, r * 0.92, r * 0.76, r * 0.03);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    rr(ctx, -r * 0.16, -r * 0.58, r * 0.32, r * 0.14, r * 0.04);
    fo(ctx, C, r, C.dark);
    const done = Math.floor((t % 3600) / 900);
    for (let i = 0; i < 3; i++) {
      const iy = -r * 0.24 + i * r * 0.24;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.025;
      ctx.strokeRect(-r * 0.38, iy - r * 0.06, r * 0.13, r * 0.13);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(-r * 0.18, iy - r * 0.03, r * 0.5, r * 0.07);
      if (i < done) {
        ctx.strokeStyle = "#21a179";
        ctx.lineWidth = r * 0.05;
        ctx.beginPath();
        ctx.moveTo(-r * 0.37, iy);
        ctx.lineTo(-r * 0.31, iy + r * 0.06);
        ctx.lineTo(-r * 0.22, iy - r * 0.08);
        ctx.stroke();
      }
    }
    ctx.restore();
    // effort star when a box gets checked
    if (pulse(t, 900, 120) > 0.5) {
      star(ctx, r * 0.75, -r * 0.55, r * 0.08, "#ffe27a", 4, t / 250);
    }
  }

  // Reference — Tortoise power-studying, bookmarks everywhere.
  function sceneTortoise(ctx, C, r, t) {
    const read = Math.sin(t / 1400) * r * 0.06;

    // book pile it's parked next to (right side)
    for (let i = 0; i < 3; i++) {
      rr(ctx, r * 0.62, r * (0.72 - i * 0.13), r * 0.5, r * 0.11, r * 0.02);
      fo(ctx, C, r, i % 2 === 0 ? C.accBright : C.pale);
    }

    // legs
    for (const [lx, ly] of [[-0.3, 0.74], [0.35, 0.74]]) {
      rr(ctx, r * lx - r * 0.08, r * ly - r * 0.08, r * 0.16, r * 0.2, r * 0.06);
      fo(ctx, C, r, C.bodyDim);
    }
    // shell: geodesic dome with plates
    ctx.beginPath();
    ctx.arc(r * 0.1, r * 0.45, r * 0.6, Math.PI, 0);
    ctx.closePath();
    fo(ctx, C, r, C.accent);
    ctx.strokeStyle = darken("#000000", 0); // plates
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = r * 0.03;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(r * (0.1 + i * 0.28), r * 0.45);
      ctx.lineTo(r * (0.1 + i * 0.18), r * 0.02);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(r * (-0.38), r * 0.2);
    ctx.quadraticCurveTo(r * 0.1, r * 0.02, r * 0.56, r * 0.2);
    ctx.stroke();
    rr(ctx, -r * 0.54, r * 0.42, r * 1.28, r * 0.15, r * 0.06); // rim
    fo(ctx, C, r, C.dark);
    // sticky-note bookmarks poking out of the shell (it studies EVERYWHERE)
    const noteColors = ["#ffe27a", "#9fe0ff", "#ff9bbd"];
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(r * (-0.2 + i * 0.3), r * (0.08 - (i % 2) * 0.06));
      ctx.rotate(-0.3 + i * 0.3);
      ctx.fillStyle = noteColors[i];
      ctx.fillRect(0, -r * 0.1, r * 0.09, r * 0.1);
      ctx.restore();
    }

    // head out, glasses on, deep in the book
    rr(ctx, -r * 0.68 + read, r * 0.16, r * 0.3, r * 0.24, r * 0.1); // neck
    fo(ctx, C, r, C.body);
    rr(ctx, -r * 0.88 + read, -r * 0.06, r * 0.42, r * 0.38, r * 0.16); // head
    fo(ctx, C, r, C.body);
    const bl = blinkAt(t, 10);
    // square scholar glasses (C style: angular!)
    for (const s of [0, 1]) {
      const gx2 = -r * 0.79 + read + s * r * 0.2;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(gx2 - r * 0.075, r * 0.02, r * 0.15, r * 0.13);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.03;
      ctx.strokeRect(gx2 - r * 0.075, r * 0.02, r * 0.15, r * 0.13);
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.71 + read, r * 0.08);
    ctx.lineTo(-r * 0.67 + read, r * 0.08);
    ctx.stroke();
    eye(ctx, C, -r * 0.79 + read, r * 0.085, r * 0.05, bl, -0.3, 0.6);
    eye(ctx, C, -r * 0.59 + read, r * 0.085, r * 0.05, bl, -0.3, 0.6);
    grinMouth(ctx, C, -r * 0.7 + read, r * 0.24, r * 0.05);

    // the open book, oversized
    ctx.save();
    ctx.translate(-r * 0.72, r * 0.76);
    for (const s of [-1, 1]) {
      poly(ctx, [[0, 0], [s * r * 0.4, -r * 0.14], [s * r * 0.4, r * 0.08], [0, r * 0.18]]);
      fo(ctx, C, r, "#ffffff");
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = r * 0.015;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.06, i * r * 0.035);
        ctx.lineTo(s * r * 0.34, i * r * 0.035 - r * 0.1);
        ctx.stroke();
      }
    }
    // flying flipped page
    const fl = pulse(t, 2000, 500);
    if (fl > 0) {
      ctx.save();
      ctx.globalAlpha = 1 - fl * 0.4;
      ctx.rotate(-fl * 1.2);
      poly(ctx, [[0, 0], [r * 0.38, -r * 0.16], [r * 0.38, r * 0.06], [0, r * 0.16]]);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // lightbulb moment
    if (pulse(t, 3400, 500) > 0.3) {
      glyph(ctx, "💡".length ? "!" : "!", -r * 0.7 + read, -r * 0.4, r * 0.2, "#ffe27a");
    }
  }

  // Maps & Travel — Bird banking hard, contrail and stars.
  function sceneBird(ctx, C, r, t) {
    const flap = Math.sin(t / 140); // faster flap
    const hover = Math.sin(t / 280) * r * 0.07;

    // contrail: bold dashed swoosh
    ctx.save();
    ctx.setLineDash([r * 0.08, r * 0.05]);
    ctx.beginPath();
    ctx.moveTo(-r * 1.5, r * 0.35);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.7, -r * 0.25, -r * 0.3 + hover);
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(0, -r * 0.18 + hover);
    ctx.rotate(-0.18); // banked hard

    // far wing
    ctx.save();
    ctx.translate(-r * 0.02, -r * 0.1);
    ctx.rotate(0.5 * -flap - 0.35);
    poly(ctx, [[0, 0], [-r * 0.62, -r * 0.18], [-r * 0.5, r * 0.12]]);
    fo(ctx, C, r, C.bodyDim);
    ctx.restore();

    // tail: sharp fan
    for (let i = -1; i <= 1; i++) {
      poly(ctx, [[-r * 0.26, r * 0.04], [-r * 0.66, r * (0.0 + i * 0.14)], [-r * 0.5, r * (0.14 + i * 0.14)]]);
      fo(ctx, C, r, C.bodyDim);
    }

    // aerodynamic teardrop body
    poly(ctx, [[-r * 0.32, r * 0.05], [-r * 0.1, -r * 0.24], [r * 0.3, -r * 0.22], [r * 0.42, r * 0.02], [r * 0.1, r * 0.22]]);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, 0, r * 0.35, r * 0.24);
    // head
    rr(ctx, r * 0.2, -r * 0.42, r * 0.4, r * 0.36, r * 0.16);
    fo(ctx, C, r, C.body);
    const bl = blinkAt(t, 11);
    eye(ctx, C, r * 0.4, -r * 0.26, r * 0.085, bl, 0.6, 0);
    // aviator goggles strap! (C-only flourish)
    ctx.strokeStyle = C.dark;
    ctx.lineWidth = r * 0.04;
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.32);
    ctx.lineTo(r * 0.3, -r * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.4, -r * 0.26, r * 0.12, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.035;
    ctx.stroke();
    // beak
    poly(ctx, [[r * 0.58, -r * 0.32], [r * 0.82, -r * 0.22], [r * 0.58, -r * 0.14]]);
    fo(ctx, C, r, "#ffb020");

    // near wing power-flap
    ctx.save();
    ctx.translate(r * 0.02, -r * 0.14);
    ctx.rotate(0.6 * flap - 0.15);
    poly(ctx, [[0, 0], [-r * 0.2, -r * 0.62], [r * 0.22, -r * 0.45]]);
    fo(ctx, C, r, C.body);
    ctx.restore();

    // suitcase swinging hard
    const lag = Math.sin(t / 280 - 1.2) * 0.3;
    ctx.save();
    ctx.translate(r * 0.1, r * 0.26);
    ctx.rotate(lag);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.03;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, r * 0.14);
    ctx.stroke();
    rr(ctx, -r * 0.18, r * 0.14, r * 0.36, r * 0.28, r * 0.04);
    fo(ctx, C, r, "#c98d4e");
    ctx.strokeStyle = "#7a4d26";
    ctx.lineWidth = r * 0.035;
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, r * 0.25);
    ctx.lineTo(r * 0.18, r * 0.25);
    ctx.stroke();
    // stickers
    ell(ctx, -r * 0.07, r * 0.33, r * 0.045, r * 0.045);
    ctx.fillStyle = "#9fe0ff";
    ctx.fill();
    star(ctx, r * 0.08, r * 0.31, r * 0.04, "#ffe27a", 5);
    ctx.restore();

    ctx.restore();

    // destination star twinkling ahead
    const tw = 0.5 + Math.sin(t / 250) * 0.5;
    star(ctx, r * 1.25, -r * 0.75, r * 0.09 * (0.8 + tw * 0.4), `rgba(255,226,122,${0.4 + tw * 0.6})`, 4, t / 800);
  }

  // AI & Assistants — Cat and robot buddy trading ideas, spark between them.
  function sceneCat(ctx, C, r, t) {
    // tail: zigzag lightning-ish flick (C flourish)
    const flick = Math.sin(t / 500) * r * 0.06;
    ctx.strokeStyle = C.body;
    ctx.lineWidth = r * 0.1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(r * 0.28, r * 0.7);
    ctx.lineTo(-r * 0.35, r * 0.78);
    ctx.lineTo(-r * 0.52, r * 0.55 + flick);
    ctx.lineTo(-r * 0.42, r * 0.38 + flick);
    ctx.stroke();

    // seated body
    rr(ctx, -r * 0.42, -r * 0.02, r * 0.84, r * 0.8, r * 0.36);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.36, r * 0.42, r * 0.4);
    rr(ctx, -r * 0.22, r * 0.2, r * 0.44, r * 0.44, r * 0.2);
    ctx.fillStyle = C.pale;
    ctx.fill();
    ell(ctx, -r * 0.18, r * 0.72, r * 0.11, r * 0.07);
    fo(ctx, C, r, C.body);

    // head
    rr(ctx, -r * 0.36, -r * 0.64, r * 0.72, r * 0.6, r * 0.26);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      poly(ctx, [[s * r * 0.1, -r * 0.58], [s * r * 0.32, -r * 0.95], [s * r * 0.4, -r * 0.5]]);
      fo(ctx, C, r, C.body);
      poly(ctx, [[s * r * 0.16, -r * 0.58], [s * r * 0.29, -r * 0.82], [s * r * 0.34, -r * 0.54]]);
      ctx.fillStyle = "#ff8fb8";
      ctx.fill();
    }
    const bl = blinkAt(t, 12);
    eye(ctx, C, -r * 0.15, -r * 0.4, r * 0.125, bl, 0.7, 0);
    eye(ctx, C, r * 0.15, -r * 0.4, r * 0.125, bl, 0.7, 0);
    poly(ctx, [[-r * 0.03, -r * 0.26], [r * 0.03, -r * 0.26], [0, -r * 0.21]]);
    ctx.fillStyle = "#ff8fb8";
    ctx.fill();
    // whiskers: straight sticker lines
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.022;
    for (const s of [-1, 1]) {
      for (const dy of [0, 0.05]) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.3, -r * (0.24 - dy));
        ctx.lineTo(s * r * 0.52, -r * (0.27 - dy * 2));
        ctx.stroke();
      }
    }
    grinMouth(ctx, C, 0, -r * 0.18, r * 0.09);

    // paw high-fiving toward the robot
    const wave = Math.sin(t / 300) * 0.35;
    ctx.save();
    ctx.translate(r * 0.36, r * 0.24);
    ctx.rotate(-0.7 + wave);
    rr(ctx, -r * 0.08, -r * 0.42, r * 0.16, r * 0.44, r * 0.08);
    fo(ctx, C, r, C.body);
    ctx.restore();

    // robot buddy: chunkier, more character
    const rbob = Math.sin(t / 420 + Math.PI) * r * 0.06;
    ctx.save();
    ctx.translate(r * 0.82, -r * 0.3 + rbob);
    // thruster flame flicker
    ctx.save();
    ctx.globalAlpha = 0.6 + Math.sin(t / 70) * 0.3;
    poly(ctx, [[-r * 0.07, r * 0.18], [r * 0.07, r * 0.18], [0, r * (0.3 + Math.abs(Math.sin(t / 90)) * 0.06)]]);
    ctx.fillStyle = "#9fe0ff";
    ctx.fill();
    ctx.restore();
    rr(ctx, -r * 0.18, -r * 0.16, r * 0.36, r * 0.34, r * 0.06);
    fo(ctx, C, r, C.accBright);
    // visor face
    rr(ctx, -r * 0.13, -r * 0.1, r * 0.26, r * 0.12, r * 0.04);
    ctx.fillStyle = C.dark;
    ctx.fill();
    // scanning eye dot inside the visor
    const scan = Math.sin(t / 400) * r * 0.08;
    ctx.beginPath();
    ctx.arc(scan, -r * 0.04, r * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "#9fe0ff";
    ctx.fill();
    // little arms
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.035;
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, 0);
    ctx.lineTo(-r * 0.3, -r * 0.08 + Math.sin(t / 300) * r * 0.04); // reaching toward cat
    ctx.stroke();
    // antenna
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.16);
    ctx.lineTo(0, -r * 0.27);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, r * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = Math.floor(t / 300) % 2 === 0 ? "#ffe27a" : C.dark;
    ctx.fill();
    ctx.restore();

    // spark arcing between paw and robot claw
    const sph = (t % 900) / 900;
    if (sph < 0.4) {
      const p = sph / 0.4;
      const sx = r * 0.45 + p * r * 0.12;
      const sy = -r * 0.1 + Math.sin(p * Math.PI * 3) * r * 0.04;
      star(ctx, sx, sy, r * 0.05, "#ffe27a", 4, t / 100);
    }

    // chat bubble with typing dots (the classic), above robot
    ctx.save();
    ctx.translate(r * 0.82, -r * 0.78 + rbob * 0.5);
    rr(ctx, -r * 0.26, -r * 0.14, r * 0.52, r * 0.28, r * 0.06);
    fo(ctx, C, r, "#ffffff");
    poly(ctx, [[-r * 0.06, r * 0.13], [-r * 0.12, r * 0.26], [r * 0.04, r * 0.14]]);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    const dp = Math.floor(t / 220) % 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-r * 0.12 + i * r * 0.12, 0, dp === i ? r * 0.05 : r * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
    }
    ctx.restore();
  }

  // Music — Frog going FULL send on the croak, notes blasting.
  function sceneFrog(ctx, C, r, t) {
    const cyc = (t % 1400) / 1400;
    let sac;
    if (cyc < 0.35) sac = cyc / 0.35;
    else if (cyc < 0.5) sac = 1;
    else if (cyc < 0.68) sac = 1 - (cyc - 0.5) / 0.18;
    else sac = 0;
    const croaking = cyc >= 0.35 && cyc < 0.68;

    // back feet planted wide
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * r * 0.6, r * 0.72);
      ctx.rotate(s * 0.3);
      for (let toe = -1; toe <= 1; toe++) {
        rr(ctx, toe * r * 0.07 - r * 0.025, -r * 0.02, r * 0.05, r * 0.14, r * 0.02);
        ctx.fillStyle = C.bodyDim;
        ctx.fill();
      }
      rr(ctx, -r * 0.12, -r * 0.12, r * 0.24, r * 0.14, r * 0.06);
      fo(ctx, C, r, C.bodyDim);
      ctx.restore();
    }

    // wide squat body, bulging with the croak
    const puff = 1 + sac * 0.06;
    ctx.save();
    ctx.scale(puff, 1);
    rr(ctx, -r * 0.62, -r * 0.05, r * 1.24, r * 0.8, r * 0.38);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.35, r * 0.62, r * 0.4);
    rr(ctx, -r * 0.4, r * 0.24, r * 0.8, r * 0.44, r * 0.22);
    ctx.fillStyle = C.pale;
    ctx.fill();
    ctx.restore();

    // throat sac: BIG
    if (sac > 0.02) {
      ell(ctx, 0, r * 0.32, r * (0.12 + sac * 0.34), r * (0.1 + sac * 0.28));
      fo(ctx, C, r, "#ff8fb8");
      // sheen
      ell(ctx, -r * sac * 0.12, r * (0.28 - sac * 0.04), r * sac * 0.1, r * sac * 0.06);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
    }

    // front arms braced like a rockstar planting the mic stand
    for (const s of [-1, 1]) {
      rr(ctx, s * r * 0.24 - r * 0.05, r * 0.4, r * 0.1, r * 0.3, r * 0.05);
      fo(ctx, C, r, C.body);
    }

    // top-mounted eye turrets
    const bl = croaking ? 0.9 : blinkAt(t, 13);
    for (const s of [-1, 1]) {
      rr(ctx, s * r * 0.32 - r * 0.18, -r * 0.32, r * 0.36, r * 0.34, r * 0.16);
      fo(ctx, C, r, C.body);
      eye(ctx, C, s * r * 0.32, -r * 0.16, r * 0.13, bl);
    }
    // huge grin-mouth line across the body top
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.055;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, r * 0.05);
    ctx.quadraticCurveTo(0, r * (0.18 + sac * 0.05), r * 0.48, r * 0.05);
    ctx.stroke();

    // croak blast: notes + sound arcs on the beat
    if (croaking) {
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = r * 0.03;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(0, r * 0.32, r * (0.3 + i * 0.14 + sac * 0.1), -0.4 - Math.PI / 2, 0.4 - Math.PI / 2);
        ctx.stroke();
      }
    }
    for (let i = 0; i < 4; i++) {
      const ph = ((t + i * 350) % 1400) / 1400;
      if (ph > 0.8) continue;
      const p = ph / 0.8;
      const s = i % 2 === 0 ? 1 : -1;
      const nx = s * r * (0.3 + p * 0.75);
      const ny = -r * 0.05 - p * r * 1.05;
      const rot = s * p * 0.6;
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(rot);
      glyph(ctx, i % 2 === 0 ? "♪" : "♫", 0, 0, r * (0.2 + p * 0.08), i % 3 === 0 ? "#ffe27a" : C.accBright, 1 - p);
      ctx.restore();
    }
  }

  // Other — Mole burst out of the wrong hole again, dirt flying.
  function sceneMole(ctx, C, r, t) {
    const cycle = 3600;
    const ph = (t % cycle) / cycle;
    // pops up fast at cycle start, sits confused, ducks at the end
    let up;
    if (ph < 0.08) up = ph / 0.08;
    else if (ph < 0.85) up = 1;
    else up = 1 - (ph - 0.85) / 0.15;
    const dy = (1 - up) * r * 0.55;

    // dirt EXPLOSION on pop
    if (ph < 0.2) {
      for (let i = 0; i < 5; i++) {
        const dph = ph / 0.2;
        const a = -Math.PI / 2 + (i - 2) * 0.5;
        const dx = Math.cos(a) * dph * r * (0.5 + i * 0.08);
        const dyy = r * 0.5 + Math.sin(a) * dph * r * 0.6 + dph * dph * r * 0.4;
        ctx.save();
        ctx.globalAlpha = 1 - dph;
        rr(ctx, dx - r * 0.04, dyy - r * 0.04, r * 0.08, r * 0.08, r * 0.02);
        ctx.fillStyle = i % 2 === 0 ? "#8a6a4a" : "#6b4d31";
        ctx.fill();
        ctx.restore();
      }
    }

    // question marks orbiting while confused
    if (ph > 0.15 && ph < 0.85) {
      for (let i = 0; i < 2; i++) {
        const qa = t / 800 + i * Math.PI;
        glyph(ctx, "?", Math.cos(qa) * r * 0.55, -r * 0.45 + Math.sin(qa) * r * 0.15, r * 0.18, "rgba(255,255,255,0.9)", 0.8);
      }
    }

    ctx.save();
    ctx.translate(0, dy);

    // torso
    rr(ctx, -r * 0.34, -r * 0.1, r * 0.68, r * 0.75, r * 0.3);
    fo(ctx, C, r, C.body);
    cel(ctx, C, 0, r * 0.25, r * 0.34, r * 0.38);
    rr(ctx, -r * 0.18, r * 0.1, r * 0.36, r * 0.42, r * 0.16);
    ctx.fillStyle = C.pale;
    ctx.fill();
    // head
    rr(ctx, -r * 0.3, -r * 0.48, r * 0.6, r * 0.5, r * 0.22);
    fo(ctx, C, r, C.body);
    // blind eyes: chunky closed arcs
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.05;
    ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 0.13, -r * 0.28, r * 0.07, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    // star nose: chunky burst
    star(ctx, 0, -r * 0.1, r * 0.09, "#ff8fb8", 8, t / 3000);
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5c93";
    ctx.fill();
    // uncertain mouth
    ctx.beginPath();
    ctx.moveTo(-r * 0.08, r * 0.06);
    ctx.quadraticCurveTo(0, r * 0.02, r * 0.08, r * 0.08);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.04;
    ctx.stroke();

    // giant digging claws gripping the crater rim
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * r * 0.32, r * 0.48);
      ctx.rotate(s * 0.2);
      rr(ctx, -r * 0.12, -r * 0.08, r * 0.24, r * 0.16, r * 0.06);
      fo(ctx, C, r, "#ff8fb8");
      // claw lines
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.02;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.06, 0);
        ctx.lineTo(i * r * 0.07, r * 0.08);
        ctx.stroke();
      }
      ctx.restore();
    }

    // upside-down map in one paw (C twist: map instead of compass, held wrong)
    ctx.save();
    ctx.translate(r * 0.42, -r * 0.02);
    ctx.rotate(Math.PI + Math.sin(t / 600) * 0.1); // literally upside down
    rr(ctx, -r * 0.16, -r * 0.12, r * 0.32, r * 0.24, r * 0.02);
    fo(ctx, C, r, "#fdf6e3");
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.06);
    ctx.quadraticCurveTo(0, -r * 0.08, r * 0.1, r * 0.02);
    ctx.stroke();
    ctx.setLineDash([r * 0.02, r * 0.02]);
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.06);
    ctx.lineTo(r * 0.1, r * 0.07);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // duck

    // crater (drawn last, occludes mole base)
    ell(ctx, 0, r * 0.78, r * 0.75, r * 0.27);
    fo(ctx, C, r, "#9a6b43");
    ell(ctx, 0, r * 0.6, r * 0.42, r * 0.11);
    ctx.fillStyle = "#4a3018";
    ctx.fill();
    for (const [dx2, dy2] of [[-0.55, 0.68], [0.5, 0.75], [0.2, 0.92], [-0.25, 0.88]]) {
      rr(ctx, r * dx2, r * dy2, r * 0.07, r * 0.06, r * 0.02);
      ctx.fillStyle = "#7a5533";
      ctx.fill();
    }
  }

  const SCENES = {
    "Dev & Tools": sceneOwl,
    "Entertainment": sceneRaccoon,
    "Social": sceneRabbit,
    "Shopping": sceneSquirrel,
    "News": sceneFox,
    "Search": sceneMeerkat,
    "Email": sceneBeaver,
    "Finance": sceneHamster,
    "Productivity": sceneAnt,
    "Reference": sceneTortoise,
    "Maps & Travel": sceneBird,
    "AI & Assistants": sceneCat,
    "Music": sceneFrog,
    "Other": sceneMole,
  };

  const AIRBORNE = new Set(["Maps & Travel"]);

  function draw(ctx, cx, cy, r, category, prefix, time) {
    const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
    const C = {
      body: lighten(theme.to, 0.1),
      bodyDim: darken(theme.to, 0.08),
      pale: lighten(theme.to, 0.55),
      line: darken(theme.to, 0.72),
      dark: darken(theme.to, 0.45),
      accent: theme.to,
      accBright: lighten(theme.from, 0.25),
    };

    ctx.save();
    ctx.translate(cx, cy);

    ctx.save();
    if (AIRBORNE.has(category)) {
      ctx.globalAlpha = 0.5;
      ell(ctx, 0, r * 0.95, r * 0.28, r * 0.06);
    } else {
      ell(ctx, 0, r * 0.95, r * 0.66, r * 0.13);
    }
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();
    ctx.restore();

    (SCENES[category] || sceneMole)(ctx, C, r, time);

    if (prefix === "Night Owl ") {
      // chunky sticker moon
      ctx.save();
      ctx.translate(-r * 1.15, -r * 1.05);
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(r * 0.08, -r * 0.05, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      glyph(ctx, "Z", -r * 0.92, -r * 0.85, r * 0.13, "rgba(255,255,255,0.8)");
    } else if (prefix === "Early Bird ") {
      star(ctx, r * 1.15, -r * 1.05, r * 0.18, "#ffd23f", 8, time / 6000);
      ctx.beginPath();
      ctx.arc(r * 1.15, -r * 1.05, r * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = "#ffea9f";
      ctx.fill();
    }

    ctx.restore();
  }

  return { draw };
})();
