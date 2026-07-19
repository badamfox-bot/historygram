// Engine B — "Storybook": soft, rounded, glossy-eyed creatures, a different
// animal per category, each drawn as a bespoke scene of that animal actually
// doing its task (no shared blob skeleton, no floating badges). All canvas
// primitives, no assets. Self-contained IIFE so it coexists with mascot.js
// (Engine A) and creature-c.js (Engine C) on the comparison page.
//
// Scene layout contract (units of r, origin at creature center):
//   nothing above -1.3r (title safety), nothing below +1.05r (caption safety),
//   nothing outside ±1.6r horizontally, and NOTHING ever crosses the face.
const EngineB = (function () {
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

  // fill + outline with the engine's soft stroke
  function fo(ctx, C, r, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = r * 0.045;
    ctx.strokeStyle = C.line;
    ctx.stroke();
  }

  function blinkAt(t, seed) {
    const cycle = 3800 + (seed % 5) * 400;
    const w = 200;
    const p = t % cycle;
    if (p < cycle - w) return 0;
    return Math.sin(((p - (cycle - w)) / w) * Math.PI);
  }

  // Big glossy storybook eye.
  function eye(ctx, C, x, y, er, blink, ldx = 0, ldy = 0) {
    ctx.save();
    ell(ctx, x, y, er, er * Math.max(0.12, 1 - blink));
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = er * 0.16;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(x + ldx * er, y + ldy * er, er * 0.62, 0, Math.PI * 2);
    ctx.fillStyle = "#2b2250";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ldx * er - er * 0.2, y + ldy * er - er * 0.24, er * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ldx * er + er * 0.18, y + ldy * er + er * 0.2, er * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
    ctx.restore();
  }

  function happyMouth(ctx, C, x, y, w) {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = w * 0.18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y, w, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  function blushPair(ctx, C, x1, x2, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = C.accent;
    for (const x of [x1, x2]) {
      ell(ctx, x, y, r * 0.11, r * 0.06);
      ctx.fill();
    }
    ctx.restore();
  }

  function glyph(ctx, ch, x, y, size, color, alpha = 1, font = "sans-serif") {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `700 ${Math.round(size)}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y);
    ctx.restore();
  }

  // ---------------------------------------------------------------- scenes
  // Every scene draws in local coords, origin at creature center, units of r.

  // Dev & Tools — Owl hunched over a laptop, code sparks rising.
  function sceneOwl(ctx, C, r, t) {
    const tilt = Math.sin(t / 1700) * 0.05; // slow owl head-tilt

    // tufts
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.22, -r * 0.72);
      ctx.lineTo(s * r * 0.38, -r * 1.0);
      ctx.lineTo(s * r * 0.46, -r * 0.62);
      ctx.closePath();
      fo(ctx, C, r, C.body);
    }
    // egg body (owls have no neck)
    ell(ctx, 0, 0.05 * r, r * 0.58, r * 0.75);
    fo(ctx, C, r, C.body);
    // belly patch
    ell(ctx, 0, r * 0.3, r * 0.36, r * 0.42);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // chevron feather marks on belly
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = r * 0.02;
    for (let row = 0; row < 3; row++) {
      for (let i = -1; i <= 1; i++) {
        const fx = i * r * 0.16, fy = r * (0.2 + row * 0.14);
        ctx.beginPath();
        ctx.moveTo(fx - r * 0.05, fy);
        ctx.lineTo(fx, fy + r * 0.05);
        ctx.lineTo(fx + r * 0.05, fy);
        ctx.stroke();
      }
    }
    // far wing (left, resting)
    ell(ctx, -r * 0.52, r * 0.18, r * 0.16, r * 0.38, 0.25);
    fo(ctx, C, r, C.bodyDim);
    // face disc + face
    ctx.save();
    ctx.translate(0, -r * 0.32);
    ctx.rotate(tilt);
    ell(ctx, 0, 0, r * 0.46, r * 0.4);
    ctx.fillStyle = C.belly;
    ctx.fill();
    ctx.lineWidth = r * 0.035;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    const bl = blinkAt(t, 3);
    eye(ctx, C, -r * 0.18, 0, r * 0.15, bl, 0.15, 0.25); // looking down-right at screen
    eye(ctx, C, r * 0.18, 0, r * 0.15, bl, 0.15, 0.25);
    ctx.beginPath(); // beak
    ctx.moveTo(-r * 0.06, r * 0.12);
    ctx.lineTo(r * 0.06, r * 0.12);
    ctx.lineTo(0, r * 0.26);
    ctx.closePath();
    ctx.fillStyle = "#f2a93b";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.025;
    ctx.stroke();
    ctx.restore();

    // talons
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.2, r * 0.78, r * 0.11, r * 0.06);
      ctx.fillStyle = "#f2a93b";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.02;
      ctx.stroke();
    }

    // laptop, back of screen toward viewer, low right — owl is looking INTO it
    ctx.save();
    ctx.translate(r * 0.72, r * 0.52);
    ctx.rotate(-0.06);
    rr(ctx, -r * 0.34, -r * 0.4, r * 0.68, r * 0.46, r * 0.04); // screen back
    ctx.fillStyle = C.accDark;
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // screen glow spilling around the left edge toward the owl
    const glow = 0.5 + Math.sin(t / 300) * 0.15;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = "#bfe3ff";
    rr(ctx, -r * 0.37, -r * 0.38, r * 0.05, r * 0.42, r * 0.02);
    ctx.fill();
    ctx.restore();
    rr(ctx, -r * 0.3, 0.06 * r, r * 0.6, r * 0.09, r * 0.03); // base
    ctx.fillStyle = C.accDark;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // near wing typing on the far side of the laptop (tip peeks over the top)
    const peck = Math.abs(Math.sin(t / 160)) * r * 0.05;
    ell(ctx, r * 0.5, r * 0.28 + peck, r * 0.15, r * 0.3, -0.5);
    fo(ctx, C, r, C.body);

    // code sparks rising from behind the screen
    const glyphs = ["</>", "{ }", ";", "=>"];
    for (let i = 0; i < 3; i++) {
      const ph = ((t + i * 700) % 2100) / 2100;
      const gx = r * (0.62 + i * 0.16);
      const gy = r * 0.05 - ph * r * 0.55;
      glyph(ctx, glyphs[(i + Math.floor(t / 2100)) % glyphs.length], gx, gy, r * 0.13, "#bfe3ff", 1 - ph, "monospace");
    }
  }

  // Entertainment — Raccoon slumped back with popcorn bucket in its lap.
  function sceneRaccoon(ctx, C, r, t) {
    // ringed tail curling out the right side
    ctx.save();
    ctx.translate(r * 0.52, r * 0.5);
    ctx.rotate(Math.sin(t / 700) * 0.1);
    for (let i = 0; i < 4; i++) {
      ell(ctx, r * (0.1 + i * 0.13), -r * (0.05 + i * 0.11), r * 0.14, r * 0.11, -0.5);
      ctx.fillStyle = i % 2 === 0 ? C.body : C.line;
      ctx.fill();
    }
    ctx.restore();

    // slouched pear body
    ell(ctx, 0, r * 0.3, r * 0.58, r * 0.5);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.42, r * 0.36, r * 0.3);
    ctx.fillStyle = C.belly;
    ctx.fill();

    // sprawled hind feet
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.42, r * 0.72, r * 0.14, r * 0.08, s * 0.3);
      fo(ctx, C, r, C.bodyDim);
    }

    // head
    ell(ctx, 0, -r * 0.32, r * 0.4, r * 0.36);
    fo(ctx, C, r, C.body);
    // round ears
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 0.3, -r * 0.62, r * 0.12, 0, Math.PI * 2);
      fo(ctx, C, r, C.body);
    }
    // bandit mask
    ctx.save();
    ctx.globalAlpha = 0.55;
    ell(ctx, 0, -r * 0.34, r * 0.38, r * 0.13);
    ctx.fillStyle = "#241f2e";
    ctx.fill();
    ctx.restore();
    // half-lidded binge eyes on top of the mask
    const bl = Math.max(blinkAt(t, 5), 0.35);
    eye(ctx, C, -r * 0.16, -r * 0.34, r * 0.12, bl);
    eye(ctx, C, r * 0.16, -r * 0.34, r * 0.12, bl);
    ell(ctx, 0, -r * 0.18, r * 0.05, r * 0.035); // nose
    ctx.fillStyle = C.line;
    ctx.fill();
    happyMouth(ctx, C, 0, -r * 0.1, r * 0.1);

    // popcorn bucket in lap (over belly, well below face)
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, r * 0.28);
    ctx.lineTo(r * 0.22, r * 0.28);
    ctx.lineTo(r * 0.17, r * 0.68);
    ctx.lineTo(-r * 0.17, r * 0.68);
    ctx.closePath();
    fo(ctx, C, r, C.accent);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(-r * 0.05, r * 0.29, r * 0.1, r * 0.38); // stripe
    // popcorn dome
    for (const [px, py] of [[-0.12, 0.24], [0, 0.2], [0.12, 0.24], [-0.06, 0.27], [0.06, 0.27]]) {
      ctx.beginPath();
      ctx.arc(px * r, py * r, r * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = "#fff3d1";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.015;
      ctx.stroke();
    }
    // paws gripping bucket rim
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.24, r * 0.34, r * 0.1, r * 0.07, s * 0.4);
      fo(ctx, C, r, C.body);
    }
    // a kernel hops from bucket to mouth
    const ph = (t % 1500) / 1500;
    if (ph < 0.75) {
      const p = ph / 0.75;
      const kx = 0;
      const ky = r * 0.2 + (-r * 0.1 - r * 0.2) * p - Math.sin(p * Math.PI) * r * 0.22;
      ctx.beginPath();
      ctx.arc(kx, ky, r * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "#fff3d1";
      ctx.fill();
    }
  }

  // Social — Rabbit lit by its phone, hearts floating up.
  function sceneRabbit(ctx, C, r, t) {
    // ears: left upright, right flopped
    const twitch = Math.sin(t / 1900) > 0.96 ? Math.sin(t / 40) * 0.06 : 0;
    ctx.save();
    ctx.translate(-r * 0.16, -r * 0.6);
    ctx.rotate(-0.12 + twitch);
    ell(ctx, 0, -r * 0.34, r * 0.13, r * 0.4);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, -r * 0.3, r * 0.06, r * 0.28);
    ctx.fillStyle = "#ffd7e6";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.18, -r * 0.62);
    ctx.rotate(0.55);
    ell(ctx, 0, -r * 0.26, r * 0.12, r * 0.32);
    fo(ctx, C, r, C.body);
    ctx.restore();

    // body + belly
    ell(ctx, 0, r * 0.32, r * 0.5, r * 0.48);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.44, r * 0.3, r * 0.28);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // big rabbit feet
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.3, r * 0.76, r * 0.18, r * 0.09);
      fo(ctx, C, r, C.bodyDim);
    }

    // head
    ell(ctx, 0, -r * 0.3, r * 0.38, r * 0.35);
    fo(ctx, C, r, C.body);
    const bl = blinkAt(t, 2);
    eye(ctx, C, -r * 0.15, -r * 0.3, r * 0.13, bl, 0, 0.3); // looking down at phone
    eye(ctx, C, r * 0.15, -r * 0.3, r * 0.13, bl, 0, 0.3);
    // little nose + smile
    ctx.beginPath();
    ctx.moveTo(-r * 0.03, -r * 0.16);
    ctx.lineTo(r * 0.03, -r * 0.16);
    ctx.lineTo(0, -r * 0.11);
    ctx.closePath();
    ctx.fillStyle = "#ffb3cd";
    ctx.fill();
    happyMouth(ctx, C, 0, -r * 0.08, r * 0.08);
    blushPair(ctx, C, -r * 0.28, r * 0.28, -r * 0.18, r);

    // phone glow washing up toward the face
    ctx.save();
    const gr = ctx.createRadialGradient(0, r * 0.25, 0, 0, r * 0.25, r * 0.6);
    gr.addColorStop(0, "rgba(255,255,255,0.35)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(-r * 0.6, -r * 0.35, r * 1.2, r * 0.6);
    ctx.restore();

    // phone held at chest with both paws
    ctx.save();
    ctx.translate(0, r * 0.26);
    ctx.rotate(-0.08);
    rr(ctx, -r * 0.14, -r * 0.2, r * 0.28, r * 0.4, r * 0.05);
    fo(ctx, C, r, C.accDark);
    rr(ctx, -r * 0.11, -r * 0.16, r * 0.22, r * 0.32, r * 0.03);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    // tiny feed rows
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 3; i++) ctx.fillRect(-r * 0.08, -r * 0.12 + i * r * 0.1, r * 0.16, r * 0.04);
    ctx.restore();
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.17, r * 0.3, r * 0.09, r * 0.07, s * 0.3);
      fo(ctx, C, r, C.body);
    }

    // hearts drift up the sides (never across the face)
    for (let i = 0; i < 3; i++) {
      const ph = ((t + i * 900) % 2700) / 2700;
      const s = i % 2 === 0 ? -1 : 1;
      const hx = s * r * (0.45 + ph * 0.25 + i * 0.05);
      const hy = r * 0.1 - ph * r * 1.0;
      const hs = r * (0.07 + 0.03 * Math.sin(ph * Math.PI));
      ctx.save();
      ctx.globalAlpha = 1 - ph;
      ctx.fillStyle = "#ff5c7a";
      ctx.beginPath();
      ctx.moveTo(hx, hy + hs * 0.35);
      ctx.bezierCurveTo(hx - hs, hy - hs * 0.55, hx - hs * 1.3, hy + hs * 0.45, hx, hy + hs * 1.15);
      ctx.bezierCurveTo(hx + hs * 1.3, hy + hs * 0.45, hx + hs, hy - hs * 0.55, hx, hy + hs * 0.35);
      ctx.fill();
      ctx.restore();
    }
  }

  // Shopping — Squirrel peeking over a shopping bag, acorn poking out.
  function sceneSquirrel(ctx, C, r, t) {
    // giant bushy tail behind-left, S-curve, swishing
    ctx.save();
    ctx.translate(-r * 0.4, r * 0.5);
    ctx.rotate(Math.sin(t / 800) * 0.08);
    ell(ctx, -r * 0.15, -r * 0.35, r * 0.24, r * 0.42, -0.35);
    fo(ctx, C, r, C.bodyDim);
    ell(ctx, -r * 0.3, -r * 0.78, r * 0.2, r * 0.3, 0.35);
    fo(ctx, C, r, C.bodyDim);
    ctx.restore();

    // body
    ell(ctx, -r * 0.05, r * 0.35, r * 0.42, r * 0.42);
    fo(ctx, C, r, C.body);
    ell(ctx, -r * 0.05, r * 0.45, r * 0.24, r * 0.24);
    ctx.fillStyle = C.belly;
    ctx.fill();

    // head, tilted toward the bag
    ctx.save();
    ctx.translate(-r * 0.02, -r * 0.22);
    ctx.rotate(0.08);
    ell(ctx, 0, 0, r * 0.34, r * 0.31);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) { // little round ears
      ctx.beginPath();
      ctx.arc(s * r * 0.22, -r * 0.28, r * 0.1, 0, Math.PI * 2);
      fo(ctx, C, r, C.body);
    }
    const bl = blinkAt(t, 4);
    eye(ctx, C, -r * 0.12, -r * 0.02, r * 0.115, bl, 0.3, 0.2); // eyeing the bag
    eye(ctx, C, r * 0.12, -r * 0.02, r * 0.115, bl, 0.3, 0.2);
    ell(ctx, 0, r * 0.1, r * 0.04, r * 0.03);
    ctx.fillStyle = C.line;
    ctx.fill();
    // buck teeth
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.035, r * 0.14, r * 0.07, r * 0.07);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.14);
    ctx.lineTo(0, r * 0.21);
    ctx.stroke();
    blushPair(ctx, C, -r * 0.24, r * 0.24, r * 0.06, r);
    ctx.restore();

    // shopping bag front-right, swinging gently; squirrel paws over the rim
    const swing = Math.sin(t / 650) * 0.06;
    ctx.save();
    ctx.translate(r * 0.52, r * 0.42);
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(-r * 0.26, -r * 0.22);
    ctx.lineTo(r * 0.26, -r * 0.22);
    ctx.lineTo(r * 0.31, r * 0.34);
    ctx.lineTo(-r * 0.31, r * 0.34);
    ctx.closePath();
    fo(ctx, C, r, C.accent);
    // handles
    ctx.beginPath();
    ctx.arc(0, -r * 0.22, r * 0.13, Math.PI, 0);
    ctx.lineWidth = r * 0.035;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // $ tag
    glyph(ctx, "$", r * 0.12, r * 0.08, r * 0.18, "rgba(255,255,255,0.9)");
    // acorn poking out
    ctx.save();
    ctx.translate(-r * 0.12, -r * 0.3);
    ctx.rotate(-0.2);
    ell(ctx, 0, r * 0.05, r * 0.08, r * 0.1);
    ctx.fillStyle = "#c98d4e";
    ctx.fill();
    ell(ctx, 0, -r * 0.05, r * 0.09, r * 0.05);
    ctx.fillStyle = "#8a5a2e";
    ctx.fill();
    ctx.restore();
    ctx.restore();
    // paws on the rim
    for (const dx of [0.32, 0.5]) {
      ell(ctx, r * dx, r * 0.22, r * 0.08, r * 0.06, 0.2);
      fo(ctx, C, r, C.body);
    }
  }

  // News — Fox reading a newspaper held low, page flips.
  function sceneFox(ctx, C, r, t) {
    // white-tipped tail curled around the front
    ctx.save();
    ctx.translate(-r * 0.45, r * 0.62);
    ctx.rotate(Math.sin(t / 900) * 0.06);
    ell(ctx, 0, 0, r * 0.34, r * 0.16, 0.35);
    fo(ctx, C, r, C.body);
    ell(ctx, -r * 0.26, -r * 0.1, r * 0.13, r * 0.11, 0.35);
    ctx.fillStyle = "#fff6ec";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.03;
    ctx.stroke();
    ctx.restore();

    // seated body
    ell(ctx, 0, r * 0.34, r * 0.48, r * 0.46);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.46, r * 0.28, r * 0.26);
    ctx.fillStyle = C.belly;
    ctx.fill();

    // head with pointed snout
    ell(ctx, 0, -r * 0.3, r * 0.37, r * 0.33);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) { // big pointed ears
      ctx.beginPath();
      ctx.moveTo(s * r * 0.14, -r * 0.5);
      ctx.lineTo(s * r * 0.32, -r * 0.92);
      ctx.lineTo(s * r * 0.42, -r * 0.46);
      ctx.closePath();
      fo(ctx, C, r, C.body);
      ctx.beginPath();
      ctx.moveTo(s * r * 0.2, -r * 0.53);
      ctx.lineTo(s * r * 0.3, -r * 0.8);
      ctx.lineTo(s * r * 0.36, -r * 0.5);
      ctx.closePath();
      ctx.fillStyle = "#3a2d3f";
      ctx.fill();
    }
    // muzzle wedge
    ell(ctx, 0, -r * 0.15, r * 0.17, r * 0.12);
    ctx.fillStyle = C.belly;
    ctx.fill();
    ell(ctx, 0, -r * 0.2, r * 0.05, r * 0.04); // nose
    ctx.fillStyle = C.line;
    ctx.fill();
    const bl = blinkAt(t, 1);
    eye(ctx, C, -r * 0.16, -r * 0.36, r * 0.11, bl, 0, 0.35); // reading downward
    eye(ctx, C, r * 0.16, -r * 0.36, r * 0.11, bl, 0, 0.35);
    // serious brows
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.035;
    ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.08, -r * 0.52);
      ctx.lineTo(s * r * 0.25, -r * 0.48);
      ctx.stroke();
    }

    // newspaper held low at the chest, flipping
    const flip = Math.sin(t / 1000);
    ctx.save();
    ctx.translate(0, r * 0.34);
    ctx.transform(1, 0, flip * 0.12, 1, 0, 0);
    rr(ctx, -r * 0.36, -r * 0.22, r * 0.72, r * 0.42, r * 0.02);
    ctx.fillStyle = "#fdfdf6";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.03;
    ctx.stroke();
    ctx.beginPath(); // center fold
    ctx.moveTo(0, -r * 0.22);
    ctx.lineTo(0, r * 0.2);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = r * 0.015;
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.55)"; // headline
    ctx.fillRect(-r * 0.3, -r * 0.16, r * 0.26, r * 0.05);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-r * 0.3, -r * 0.06 + i * r * 0.07, r * 0.26, r * 0.03);
      ctx.fillRect(r * 0.04, -r * 0.16 + i * r * 0.07, r * 0.26, r * 0.03);
    }
    ctx.restore();
    // paws at the paper's edges
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.4, r * 0.4, r * 0.09, r * 0.07, s * 0.3);
      fo(ctx, C, r, C.body);
    }
  }

  // Search — Meerkat sentry with a magnifying glass over one eye.
  function sceneMeerkat(ctx, C, r, t) {
    const rise = (Math.sin(t / 1400) + 1) / 2; // periodic tip-toe stretch
    const stretch = 1 + rise * 0.05;
    const scanX = Math.sin(t / 1100) * 0.35; // eyes sweep left-right

    ctx.save();
    ctx.translate(0, r * 0.85);
    ctx.scale(1, stretch);
    ctx.translate(0, -r * 0.85);

    // tail propped behind like a tripod
    ctx.beginPath();
    ctx.moveTo(r * 0.18, r * 0.6);
    ctx.quadraticCurveTo(r * 0.55, r * 0.75, r * 0.62, r * 0.95);
    ctx.lineWidth = r * 0.09;
    ctx.strokeStyle = C.bodyDim;
    ctx.lineCap = "round";
    ctx.stroke();

    // tall thin body — the sentry pose
    ell(ctx, 0, r * 0.28, r * 0.28, r * 0.58);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.34, r * 0.17, r * 0.42);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // small arms folded at the chest (left) — right arm holds the glass, below
    ell(ctx, -r * 0.16, r * 0.05, r * 0.09, r * 0.06, 0.4);
    fo(ctx, C, r, C.body);
    // feet
    for (const s of [-1, 1]) {
      ell(ctx, s * r * 0.12, r * 0.86, r * 0.1, r * 0.055);
      fo(ctx, C, r, C.bodyDim);
    }

    // head
    ell(ctx, 0, -r * 0.48, r * 0.26, r * 0.24);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) { // tiny ears
      ctx.beginPath();
      ctx.arc(s * r * 0.22, -r * 0.56, r * 0.055, 0, Math.PI * 2);
      fo(ctx, C, r, C.bodyDim);
    }
    // dark meerkat eye patches
    ctx.fillStyle = "rgba(30,20,40,0.5)";
    ell(ctx, -r * 0.1, -r * 0.5, r * 0.085, r * 0.1);
    ctx.fill();
    ell(ctx, r * 0.1, -r * 0.5, r * 0.085, r * 0.1);
    ctx.fill();
    const bl = blinkAt(t, 6);
    // left eye: normal, squinting slightly, scanning
    eye(ctx, C, -r * 0.1, -r * 0.5, r * 0.07, Math.max(bl, 0.3), scanX, 0);
    // pointed snout
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, -r * 0.38);
    ctx.lineTo(r * 0.05, -r * 0.38);
    ctx.lineTo(0, -r * 0.3);
    ctx.closePath();
    ctx.fillStyle = C.bodyDim;
    ctx.fill();
    ell(ctx, 0, -r * 0.38, r * 0.03, r * 0.025);
    ctx.fillStyle = C.line;
    ctx.fill();

    // magnifying glass held up to the RIGHT eye — that eye drawn magnified inside
    const gx = r * 0.13, gy = -r * 0.5;
    // arm up to the handle
    ell(ctx, r * 0.3, -r * 0.18, r * 0.08, r * 0.14, -0.5);
    fo(ctx, C, r, C.body);
    // lens: tinted glass, then the magnified eye, then the ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, r * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,235,255,0.35)";
    ctx.fill();
    ctx.clip();
    eye(ctx, C, gx, gy, r * 0.14, bl, scanX, 0); // MAGNIFIED eye
    ctx.restore();
    ctx.beginPath();
    ctx.arc(gx, gy, r * 0.19, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.045;
    ctx.strokeStyle = C.accDark;
    ctx.stroke();
    ctx.beginPath(); // handle down toward the raised arm
    ctx.moveTo(gx + r * 0.13, gy + r * 0.14);
    ctx.lineTo(gx + r * 0.24, gy + r * 0.32);
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = C.accDark;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.restore(); // stretch
  }

  // Email — Beaver at a log desk, stamping envelopes; the Inbox Warrior.
  function sceneBeaver(ctx, C, r, t) {
    const slam = (t % 1000) / 1000; // stamp cycle
    const armUp = slam < 0.55 ? Math.sin((slam / 0.55) * Math.PI) : 0;
    const hit = slam >= 0.55 && slam < 0.65;

    // big flat tail behind-right, slapping occasionally
    const slap = pulse(t, 3400, 500);
    ctx.save();
    ctx.translate(r * 0.42, r * 0.62);
    ctx.rotate(-0.15 + slap * 0.35);
    rr(ctx, 0, -r * 0.09, r * 0.5, r * 0.2, r * 0.08);
    ctx.fillStyle = C.accDark;
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // crosshatch
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = r * 0.012;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.12, -r * 0.08);
      ctx.lineTo(i * r * 0.12, r * 0.1);
      ctx.stroke();
    }
    ctx.restore();
    if (slap > 0.85) { // dust puff on slap
      ctx.save();
      ctx.globalAlpha = (1 - slap) * 4;
      ell(ctx, r * 0.85, r * 0.85, r * 0.12, r * 0.05);
      ctx.fillStyle = "#d8c9b0";
      ctx.fill();
      ctx.restore();
    }

    // chunky body
    ell(ctx, 0, r * 0.3, r * 0.5, r * 0.48);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.4, r * 0.3, r * 0.3);
    ctx.fillStyle = C.belly;
    ctx.fill();

    // head, determined
    ell(ctx, 0, -r * 0.32, r * 0.38, r * 0.34);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 0.28, -r * 0.58, r * 0.08, 0, Math.PI * 2);
      fo(ctx, C, r, C.body);
    }
    const bl = blinkAt(t, 7);
    eye(ctx, C, -r * 0.14, -r * 0.34, r * 0.11, bl, 0.1, 0.3);
    eye(ctx, C, r * 0.14, -r * 0.34, r * 0.11, bl, 0.1, 0.3);
    // determined slanted brows
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.04;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, -r * 0.52);
    ctx.lineTo(-r * 0.06, -r * 0.47);
    ctx.moveTo(r * 0.06, -r * 0.47);
    ctx.lineTo(r * 0.24, -r * 0.52);
    ctx.stroke();
    ell(ctx, 0, -r * 0.2, r * 0.05, r * 0.035);
    ctx.fillStyle = C.line;
    ctx.fill();
    // signature buck teeth
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.05, -r * 0.16, r * 0.1, r * 0.1);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.16);
    ctx.lineTo(0, -r * 0.06);
    ctx.stroke();

    // log desk across the front
    rr(ctx, -r * 0.62, r * 0.5, r * 1.16, r * 0.22, r * 0.1);
    ctx.fillStyle = "#9a6b43";
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ell(ctx, -r * 0.62, r * 0.61, r * 0.045, r * 0.1); // log end ring
    ctx.fillStyle = "#c99b6b";
    ctx.fill();

    // inbox stack (left) — shrinks through the cycle batch
    const batch = Math.floor((t % 5000) / 1000);
    const stackN = 4 - (batch % 4);
    for (let i = 0; i < stackN; i++) {
      rr(ctx, -r * 0.5, r * 0.44 - i * r * 0.05, r * 0.26, r * 0.05, r * 0.01);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.012;
      ctx.stroke();
    }
    // envelope being stamped (center of desk)
    rr(ctx, -r * 0.1, r * 0.42, r * 0.28, r * 0.14, r * 0.01);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.015;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.42);
    ctx.lineTo(r * 0.04, r * 0.5);
    ctx.lineTo(r * 0.18, r * 0.42);
    ctx.stroke();
    if (hit) { // stamp mark + impact star
      ctx.fillStyle = C.accent;
      ell(ctx, r * 0.04, r * 0.49, r * 0.05, r * 0.05);
      ctx.fill();
      star(ctx, r * 0.04, r * 0.36, r * 0.1, "#ffe27a", 6);
    }
    // stamping arm
    const armY = r * 0.18 - armUp * r * 0.22;
    ell(ctx, r * 0.3, armY + r * 0.1, r * 0.1, r * 0.15, -0.3);
    fo(ctx, C, r, C.body);
    // stamper
    ctx.save();
    ctx.translate(r * 0.16, armY);
    rr(ctx, -r * 0.04, -r * 0.12, r * 0.08, r * 0.14, r * 0.02);
    ctx.fillStyle = C.accDark;
    ctx.fill();
    rr(ctx, -r * 0.09, 0.02 * r, r * 0.18, r * 0.07, r * 0.02);
    ctx.fillStyle = C.accent;
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.02;
    ctx.stroke();
    ctx.restore();
    // left paw steadying the envelope
    ell(ctx, -r * 0.18, r * 0.44, r * 0.08, r * 0.06, 0.2);
    fo(ctx, C, r, C.body);

    // stamped mail flying off to the right
    for (let i = 0; i < 2; i++) {
      const ph = ((t + 500 + i * 1000) % 2000) / 2000;
      const ex = r * (0.3 + ph * 1.05);
      const ey = r * 0.4 - Math.sin(ph * Math.PI) * r * 0.55;
      ctx.save();
      ctx.globalAlpha = 1 - ph * ph;
      ctx.translate(ex, ey);
      ctx.rotate(ph * 1.2);
      rr(ctx, -r * 0.08, -r * 0.05, r * 0.16, r * 0.1, r * 0.01);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.014;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, -r * 0.05);
      ctx.lineTo(0, r * 0.01);
      ctx.lineTo(r * 0.08, -r * 0.05);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Finance — Hamster sprinting inside a giant golden coin wheel.
  function sceneHamster(ctx, C, r, t) {
    const rot = t / 900; // wheel rotation
    const wob = Math.sin(t / 450) * 0.015;

    // coin wheel
    ctx.save();
    ctx.translate(0, r * 0.08);
    ctx.rotate(wob);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = "#f6c945";
    ctx.fill();
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "#fbe28d";
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.stroke();
    // rotating $ marks on the rim
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      glyph(ctx, "$", Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.16, "#a97b12");
    }
    // rim glint sweeping
    const glintA = (t / 1600) % (Math.PI * 2);
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, glintA, glintA + 0.35);
    ctx.lineWidth = r * 0.07;
    ctx.strokeStyle = "#fff7d6";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // hamster running at the bottom of the wheel, leaning forward
    ctx.save();
    ctx.translate(-r * 0.05, r * 0.42);
    ctx.rotate(0.12);
    // legs: two blurred run-cycle arcs
    for (const s of [0, 1]) {
      const lp = Math.sin(t / 90 + s * Math.PI);
      ctx.beginPath();
      ctx.ellipse(r * (0.12 - s * 0.24), r * 0.24, r * 0.1, r * 0.05, lp * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = C.bodyDim;
      ctx.fill();
    }
    // round body
    ell(ctx, 0, 0, r * 0.34, r * 0.28);
    fo(ctx, C, r, C.body);
    ell(ctx, r * 0.03, r * 0.08, r * 0.2, r * 0.15);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // head (leaning into the run)
    ell(ctx, r * 0.26, -r * 0.12, r * 0.22, r * 0.2);
    fo(ctx, C, r, C.body);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(r * 0.18 + s * r * 0.1, -r * 0.3, r * 0.06, 0, Math.PI * 2);
      fo(ctx, C, r, C.body);
    }
    // stuffed cheeks!
    ell(ctx, r * 0.34, -r * 0.02, r * 0.1, r * 0.08);
    fo(ctx, C, r, C.belly);
    const bl = blinkAt(t, 8);
    eye(ctx, C, r * 0.3, -r * 0.16, r * 0.075, bl, 0.4, 0);
    ell(ctx, r * 0.46, -r * 0.1, r * 0.028, r * 0.022);
    ctx.fillStyle = C.line;
    ctx.fill();
    ctx.restore();

    // tiny motion puffs behind the hamster
    for (let i = 0; i < 2; i++) {
      const ph = ((t + i * 400) % 800) / 800;
      ctx.save();
      ctx.globalAlpha = (1 - ph) * 0.5;
      ell(ctx, -r * (0.4 + ph * 0.25), r * (0.55 + ph * 0.05), r * 0.06 * (1 + ph), r * 0.04);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    }
  }

  // Productivity — Ant hoisting a giant checklist overhead.
  function sceneAnt(ctx, C, r, t) {
    const jig = Math.sin(t / 140) * r * 0.015; // restless work-jig
    const seg = [
      { x: -r * 0.38, y: r * 0.42 + jig, rx: r * 0.2, ry: r * 0.18 },   // head
      { x: 0, y: r * 0.5 - jig, rx: r * 0.24, ry: r * 0.2 },            // thorax
      { x: r * 0.42, y: r * 0.55 + jig * 0.5, rx: r * 0.3, ry: r * 0.24 }, // abdomen
    ];

    // six legs scuttling
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.035;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      for (const s of [-1, 1]) {
        const baseX = r * (-0.2 + i * 0.3);
        const ph = Math.sin(t / 130 + i * 2 + (s > 0 ? Math.PI : 0)) * r * 0.03;
        ctx.beginPath();
        ctx.moveTo(baseX, r * 0.6);
        ctx.lineTo(baseX + s * r * 0.1, r * 0.78 + ph);
        ctx.lineTo(baseX + s * r * 0.16, r * 0.92);
        ctx.stroke();
      }
    }

    // segments
    for (const sgm of seg) {
      ell(ctx, sgm.x, sgm.y, sgm.rx, sgm.ry);
      fo(ctx, C, r, C.body);
    }
    ell(ctx, r * 0.42, r * 0.5, r * 0.16, r * 0.12); // abdomen shine
    ctx.fillStyle = C.belly;
    ctx.fill();

    // face on the head segment
    const bl = blinkAt(t, 9);
    eye(ctx, C, -r * 0.44, r * 0.38, r * 0.075, bl, -0.2, -0.5); // looking up at the list
    eye(ctx, C, -r * 0.29, r * 0.38, r * 0.075, bl, -0.2, -0.5);
    happyMouth(ctx, C, -r * 0.37, r * 0.5, r * 0.05);
    // antennae, bouncing
    for (const s of [0, 1]) {
      const ax = -r * (0.46 - s * 0.12);
      const wob = Math.sin(t / 300 + s) * r * 0.03;
      ctx.beginPath();
      ctx.moveTo(ax, r * 0.28);
      ctx.quadraticCurveTo(ax - r * 0.08, r * 0.1, ax - r * 0.04 + wob, -r * 0.02);
      ctx.lineWidth = r * 0.025;
      ctx.strokeStyle = C.line;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax - r * 0.04 + wob, -r * 0.02, r * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = C.line;
      ctx.fill();
    }

    // two front legs reaching up to carry the clipboard
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.04;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.34);
    ctx.lineTo(-r * 0.34, -r * 0.05);
    ctx.moveTo(-r * 0.08, r * 0.36);
    ctx.lineTo(r * 0.12, -r * 0.02);
    ctx.stroke();

    // the ENORMOUS clipboard held overhead (ants carry 50x their weight)
    const sway = Math.sin(t / 800) * 0.05;
    ctx.save();
    ctx.translate(-r * 0.1, -r * 0.5);
    ctx.rotate(-0.08 + sway);
    rr(ctx, -r * 0.5, -r * 0.55, r * 1.0, r * 1.05, r * 0.05);
    fo(ctx, C, r, C.accent);
    rr(ctx, -r * 0.42, -r * 0.44, r * 0.84, r * 0.86, r * 0.03);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    rr(ctx, -r * 0.14, -r * 0.62, r * 0.28, r * 0.12, r * 0.03); // clip
    ctx.fillStyle = C.accDark;
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.02;
    ctx.stroke();
    // items get checked one by one
    const done = Math.floor((t % 4200) / 1050); // 0..3
    for (let i = 0; i < 3; i++) {
      const iy = -r * 0.28 + i * r * 0.26;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = r * 0.02;
      ctx.strokeRect(-r * 0.34, iy - r * 0.06, r * 0.12, r * 0.12);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(-r * 0.14, iy - r * 0.03, r * 0.44, r * 0.06);
      if (i < done) {
        ctx.strokeStyle = C.accDark;
        ctx.lineWidth = r * 0.045;
        ctx.beginPath();
        ctx.moveTo(-r * 0.33, iy);
        ctx.lineTo(-r * 0.28, iy + r * 0.05);
        ctx.lineTo(-r * 0.2, iy - r * 0.07);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Reference — Tortoise with glasses and a grad cap, nose in a book.
  function sceneTortoise(ctx, C, r, t) {
    const read = Math.sin(t / 1600) * r * 0.05; // slow lean toward the book

    // book open on the ground, front-left
    ctx.save();
    ctx.translate(-r * 0.62, r * 0.72);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * r * 0.34, -r * 0.1);
      ctx.lineTo(s * r * 0.34, r * 0.1);
      ctx.lineTo(0, r * 0.16);
      ctx.closePath();
      ctx.fillStyle = "#fdfdf6";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = r * 0.012;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.05, i * r * 0.03);
        ctx.lineTo(s * r * 0.3, i * r * 0.03 - r * 0.08);
        ctx.stroke();
      }
    }
    // page mid-flip
    const fl = pulse(t, 2600, 700);
    if (fl > 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.15 * (1 - fl * 2), -r * (0.15 + fl * 0.1), r * 0.3 - fl * r * 0.6, -r * 0.1);
      ctx.lineWidth = r * 0.02;
      ctx.strokeStyle = "#fdfdf6";
      ctx.stroke();
    }
    ctx.restore();

    // stubby legs
    for (const [lx, ly] of [[-0.35, 0.72], [0.3, 0.74], [0.55, 0.7]]) {
      ell(ctx, r * lx, r * ly, r * 0.1, r * 0.12);
      fo(ctx, C, r, C.bodyDim);
    }
    // dome shell
    ctx.beginPath();
    ctx.arc(r * 0.08, r * 0.45, r * 0.62, Math.PI, 0);
    ctx.closePath();
    fo(ctx, C, r, C.accent);
    // shell spots
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (const [sx, sy, sr] of [[-0.15, 0.2, 0.11], [0.25, 0.12, 0.13], [0.05, -0.05, 0.1], [0.45, 0.3, 0.09]]) {
      ell(ctx, r * (0.08 + sx), r * (0.45 - sy * 1.2), r * sr, r * sr * 0.8);
      ctx.fill();
    }
    // shell rim
    rr(ctx, -r * 0.56, r * 0.42, r * 1.28, r * 0.14, r * 0.06);
    fo(ctx, C, r, C.accDark);

    // tiny grad cap perched on the shell
    ctx.save();
    ctx.translate(r * 0.3, -r * 0.22);
    ctx.rotate(-0.08);
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, 0);
    ctx.lineTo(0, -r * 0.08);
    ctx.lineTo(r * 0.16, 0);
    ctx.lineTo(0, r * 0.08);
    ctx.closePath();
    ctx.fillStyle = "#2f2a3d";
    ctx.fill();
    const tas = Math.sin(t / 700) * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.04);
    ctx.quadraticCurveTo(r * 0.14, -r * 0.02 + tas * r * 0.1, r * 0.16 + tas * r * 0.05, r * 0.12);
    ctx.lineWidth = r * 0.02;
    ctx.strokeStyle = "#f6c945";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.16 + tas * r * 0.05, r * 0.13, r * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "#f6c945";
    ctx.fill();
    ctx.restore();

    // neck + head stretched out left toward the book
    rr(ctx, -r * 0.62 + read, r * 0.18, r * 0.26, r * 0.22, r * 0.1);
    fo(ctx, C, r, C.body);
    ell(ctx, -r * 0.66 + read, r * 0.08, r * 0.22, r * 0.2);
    fo(ctx, C, r, C.body);
    // round scholar glasses
    const bl = blinkAt(t, 10);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(-r * 0.66 + read + s * r * 0.09, r * 0.05, r * 0.085, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
      ctx.lineWidth = r * 0.025;
      ctx.strokeStyle = C.line;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.66 + read - r * 0.005, r * 0.05);
    ctx.lineTo(-r * 0.66 + read + r * 0.005, r * 0.05);
    ctx.stroke();
    eye(ctx, C, -r * 0.75 + read, r * 0.05, r * 0.055, bl, -0.2, 0.4);
    eye(ctx, C, -r * 0.57 + read, r * 0.05, r * 0.055, bl, -0.2, 0.4);
    happyMouth(ctx, C, -r * 0.68 + read, r * 0.18, r * 0.05);
  }

  // Maps & Travel — Bird mid-flight with a swinging suitcase.
  function sceneBird(ctx, C, r, t) {
    const flap = Math.sin(t / 170);
    const hover = Math.sin(t / 340) * r * 0.05;

    // dotted flight path trailing behind
    ctx.save();
    ctx.setLineDash([r * 0.03, r * 0.06]);
    ctx.beginPath();
    ctx.moveTo(-r * 1.45, r * 0.15);
    ctx.quadraticCurveTo(-r * 0.9, -r * 0.55, -r * 0.3, -r * 0.28 + hover);
    ctx.lineWidth = r * 0.025;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();
    ctx.restore();

    // drifting cloud puff
    const cd = ((t / 30) % (r * 3)) / r;
    ctx.save();
    ctx.globalAlpha = 0.55;
    const cxx = r * 1.4 - cd * r;
    ell(ctx, cxx, -r * 0.7, r * 0.16, r * 0.09);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ell(ctx, cxx + r * 0.12, -r * 0.66, r * 0.12, r * 0.08);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(0, -r * 0.15 + hover);
    ctx.rotate(-0.06);

    // far wing (behind body, opposite phase)
    ctx.save();
    ctx.translate(-r * 0.05, -r * 0.1);
    ctx.rotate(0.35 * -flap - 0.3);
    ell(ctx, -r * 0.3, 0, r * 0.34, r * 0.13, -0.15);
    fo(ctx, C, r, C.bodyDim);
    ctx.restore();

    // tail fan
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.28, r * 0.05);
      ctx.lineTo(-r * 0.62, r * (0.02 + i * 0.12));
      ctx.lineTo(-r * 0.5, r * (0.14 + i * 0.12));
      ctx.closePath();
      fo(ctx, C, r, C.bodyDim);
    }

    // body
    ell(ctx, 0, 0, r * 0.36, r * 0.28, -0.1);
    fo(ctx, C, r, C.body);
    ell(ctx, r * 0.02, r * 0.08, r * 0.22, r * 0.15, -0.1);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // head
    ell(ctx, r * 0.32, -r * 0.18, r * 0.2, r * 0.18);
    fo(ctx, C, r, C.body);
    const bl = blinkAt(t, 11);
    eye(ctx, C, r * 0.36, -r * 0.2, r * 0.075, bl, 0.4, 0);
    ctx.beginPath(); // beak
    ctx.moveTo(r * 0.5, -r * 0.22);
    ctx.lineTo(r * 0.68, -r * 0.16);
    ctx.lineTo(r * 0.5, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = "#f2a93b";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.02;
    ctx.stroke();

    // near wing, big flap
    ctx.save();
    ctx.translate(r * 0.02, -r * 0.12);
    ctx.rotate(0.45 * flap - 0.1);
    ell(ctx, -r * 0.05, -r * 0.22, r * 0.16, r * 0.4, 0.5);
    fo(ctx, C, r, C.body);
    ctx.restore();

    // suitcase dangling from feet, pendulum lag
    const lag = Math.sin(t / 340 - 1.1) * 0.18;
    ctx.save();
    ctx.translate(r * 0.08, r * 0.24);
    ctx.rotate(lag);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.025;
    ctx.beginPath(); // little legs gripping the handle
    ctx.moveTo(-r * 0.03, 0);
    ctx.lineTo(0, r * 0.12);
    ctx.moveTo(r * 0.05, 0);
    ctx.lineTo(0.02 * r, r * 0.12);
    ctx.stroke();
    rr(ctx, -r * 0.05, r * 0.1, r * 0.1, r * 0.05, r * 0.02); // handle
    ctx.fillStyle = "#8a5a2e";
    ctx.fill();
    rr(ctx, -r * 0.17, r * 0.15, r * 0.34, r * 0.26, r * 0.04); // case
    fo(ctx, C, r, "#c98d4e");
    ctx.strokeStyle = "#8a5a2e";
    ctx.lineWidth = r * 0.025;
    ctx.beginPath();
    ctx.moveTo(-r * 0.17, r * 0.24);
    ctx.lineTo(r * 0.17, r * 0.24);
    ctx.stroke();
    // travel sticker
    ell(ctx, r * 0.06, r * 0.31, r * 0.045, r * 0.045);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // AI & Assistants — Cat waving at its floating robot buddy (typing dots live on).
  function sceneCat(ctx, C, r, t) {
    // tail curled around front, tip flicking
    const flick = Math.sin(t / 600) * 0.25;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.72);
    ctx.quadraticCurveTo(-r * 0.55, r * 0.85, -r * 0.6, r * 0.55);
    ctx.quadraticCurveTo(-r * 0.62, r * (0.4 - flick * 0.1), -r * 0.5 - flick * r * 0.05, r * 0.32);
    ctx.lineWidth = r * 0.11;
    ctx.strokeStyle = C.body;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineWidth = r * 0.045;

    // seated body
    ell(ctx, 0, r * 0.35, r * 0.44, r * 0.44);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.45, r * 0.26, r * 0.26);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // front paws
    for (const s of [-1, 1]) {
      if (s === 1) continue; // right paw is raised, drawn later
      ell(ctx, s * r * 0.18, r * 0.72, r * 0.1, r * 0.07);
      fo(ctx, C, r, C.body);
    }

    // head
    ell(ctx, 0, -r * 0.3, r * 0.38, r * 0.34);
    fo(ctx, C, r, C.body);
    // pointed ears with inner
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.12, -r * 0.54);
      ctx.lineTo(s * r * 0.3, -r * 0.86);
      ctx.lineTo(s * r * 0.4, -r * 0.46);
      ctx.closePath();
      fo(ctx, C, r, C.body);
      ctx.beginPath();
      ctx.moveTo(s * r * 0.18, -r * 0.56);
      ctx.lineTo(s * r * 0.28, -r * 0.74);
      ctx.lineTo(s * r * 0.33, -r * 0.52);
      ctx.closePath();
      ctx.fillStyle = "#ffd7e6";
      ctx.fill();
    }
    const bl = blinkAt(t, 12);
    eye(ctx, C, -r * 0.15, -r * 0.32, r * 0.12, bl, 0.5, 0); // looking at the robot
    eye(ctx, C, r * 0.15, -r * 0.32, r * 0.12, bl, 0.5, 0);
    // nose + whiskers + smile
    ctx.beginPath();
    ctx.moveTo(-r * 0.03, -r * 0.19);
    ctx.lineTo(r * 0.03, -r * 0.19);
    ctx.lineTo(0, -r * 0.14);
    ctx.closePath();
    ctx.fillStyle = "#ffb3cd";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.02;
    for (const s of [-1, 1]) {
      for (const dy of [-0.02, 0.03]) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.28, -r * (0.16 - dy));
        ctx.lineTo(s * r * 0.48, -r * (0.18 - dy * 2));
        ctx.stroke();
      }
    }
    happyMouth(ctx, C, 0, -r * 0.1, r * 0.08);
    blushPair(ctx, C, -r * 0.27, r * 0.27, -r * 0.16, r);

    // raised right paw, waving at the robot
    const wave = Math.sin(t / 350) * 0.3;
    ctx.save();
    ctx.translate(r * 0.34, r * 0.28);
    ctx.rotate(-0.6 + wave);
    ell(ctx, 0, -r * 0.18, r * 0.09, r * 0.2);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, -r * 0.36, r * 0.09, r * 0.08);
    fo(ctx, C, r, C.body);
    ctx.restore();

    // floating robot buddy
    const rbob = Math.sin(t / 500 + Math.PI) * r * 0.05;
    ctx.save();
    ctx.translate(r * 0.78, -r * 0.28 + rbob);
    // thruster glow
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(t / 90) * 0.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.06, r * 0.16);
    ctx.lineTo(r * 0.06, r * 0.16);
    ctx.lineTo(0, r * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#8fd8ff";
    ctx.fill();
    ctx.restore();
    rr(ctx, -r * 0.16, -r * 0.14, r * 0.32, r * 0.3, r * 0.08);
    fo(ctx, C, r, C.accent);
    // robot face
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.06, -r * 0.02, r * 0.03, 0, Math.PI * 2);
    ctx.arc(r * 0.06, -r * 0.02, r * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.arc(0, r * 0.05, r * 0.05, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    // antenna with blinking light
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.14);
    ctx.lineTo(0, -r * 0.24);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -r * 0.27, r * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = Math.floor(t / 400) % 2 === 0 ? "#ffe27a" : C.accDark;
    ctx.fill();
    ctx.restore();

    // chat bubble with the typing dots, above the robot
    ctx.save();
    ctx.translate(r * 0.78, -r * 0.75 + rbob * 0.5);
    rr(ctx, -r * 0.24, -r * 0.13, r * 0.48, r * 0.26, r * 0.09);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.025;
    ctx.stroke();
    ctx.beginPath(); // tail toward robot
    ctx.moveTo(-r * 0.05, r * 0.12);
    ctx.lineTo(-r * 0.1, r * 0.24);
    ctx.lineTo(r * 0.04, r * 0.13);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    const dp = Math.floor(t / 260) % 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-r * 0.11 + i * r * 0.11, 0, dp === i ? r * 0.045 : r * 0.028, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
    }
    ctx.restore();

    // sparkles
    glyph(ctx, "✦", -r * 0.75, -r * 0.7, r * 0.16, "#ffe97a", 0.6 + Math.sin(t / 400) * 0.4);
    glyph(ctx, "✦", r * 1.15, -r * 0.05, r * 0.12, "#ffe97a", 0.6 + Math.sin(t / 400 + 2) * 0.4);
  }

  // Music — Frog mid-croak, throat sac inflating, notes on the beat.
  function sceneFrog(ctx, C, r, t) {
    const cyc = (t % 1600) / 1600;
    // sac: inflate 0..0.4, hold 0.4..0.55, deflate 0.55..0.75
    let sac;
    if (cyc < 0.4) sac = cyc / 0.4;
    else if (cyc < 0.55) sac = 1;
    else if (cyc < 0.75) sac = 1 - (cyc - 0.55) / 0.2;
    else sac = 0;
    const croaking = cyc >= 0.4 && cyc < 0.75;

    // splayed back feet
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * r * 0.55, r * 0.72);
      ctx.rotate(s * 0.25);
      for (let toe = -1; toe <= 1; toe++) {
        ell(ctx, toe * r * 0.07, r * 0.03, r * 0.045, r * 0.08, toe * 0.3);
        ctx.fillStyle = C.bodyDim;
        ctx.fill();
      }
      ell(ctx, 0, -r * 0.04, r * 0.12, r * 0.09);
      fo(ctx, C, r, C.bodyDim);
      ctx.restore();
    }

    // squat wide body
    ell(ctx, 0, r * 0.3, r * 0.62, r * 0.44);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.44, r * 0.4, r * 0.26);
    ctx.fillStyle = C.belly;
    ctx.fill();

    // throat sac (under the mouth, over the belly patch)
    if (sac > 0.02) {
      ell(ctx, 0, r * 0.34, r * (0.1 + sac * 0.24), r * (0.08 + sac * 0.2));
      ctx.fillStyle = "#ffd7e6";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.03;
      ctx.stroke();
    }

    // front toes, tapping alternately
    for (const s of [-1, 1]) {
      const tap = Math.max(0, Math.sin(t / 200 + (s > 0 ? Math.PI : 0))) * r * 0.03;
      ell(ctx, s * r * 0.22, r * 0.66 - tap, r * 0.1, r * 0.06);
      fo(ctx, C, r, C.body);
    }

    // protruding eye bumps ON TOP (frog anatomy)
    const bl = croaking ? 0.75 : blinkAt(t, 13); // eyes squeeze blissfully on croak
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 0.32, -r * 0.12, r * 0.2, 0, Math.PI * 2);
      fo(ctx, C, r, C.body);
      eye(ctx, C, s * r * 0.32, -r * 0.14, r * 0.12, bl);
    }
    // wide mouth across the face
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.045;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, r * (0.02 + sac * 0.02), r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    blushPair(ctx, C, -r * 0.52, r * 0.52, r * 0.12, r);

    // notes emitted on the beat, floating up and outward
    for (let i = 0; i < 3; i++) {
      const ph = ((t + i * 533) % 1600) / 1600;
      if (ph > 0.75) continue;
      const p = ph / 0.75;
      const s = i % 2 === 0 ? 1 : -1;
      const nx = s * r * (0.35 + p * 0.55);
      const ny = r * 0.05 - p * r * 1.0;
      const wig = Math.sin(p * 8) * r * 0.04;
      glyph(ctx, i % 2 === 0 ? "♪" : "♫", nx + wig, ny, r * (0.16 + p * 0.06), C.accent, 1 - p);
    }
  }

  // Other — Mole popped out of its molehill, compass spinning uselessly.
  function sceneMole(ctx, C, r, t) {
    const duck = pulse(t, 4200, 600); // periodic duck-down
    const dy = duck * r * 0.3;

    // question marks bubbling up
    for (let i = 0; i < 2; i++) {
      const ph = ((t + i * 1300) % 2600) / 2600;
      glyph(ctx, "?", -r * (0.5 + i * 0.15), -r * 0.15 - ph * r * 0.7, r * (0.14 + i * 0.04), "rgba(255,255,255,0.9)", 1 - ph);
    }

    ctx.save();
    ctx.translate(0, dy);

    // mole torso rising out of the hole
    ell(ctx, 0, r * 0.2, r * 0.36, r * 0.42);
    fo(ctx, C, r, C.body);
    ell(ctx, 0, r * 0.32, r * 0.22, r * 0.26);
    ctx.fillStyle = C.belly;
    ctx.fill();
    // head
    ell(ctx, 0, -r * 0.18, r * 0.3, r * 0.27);
    fo(ctx, C, r, C.body);
    // moles are basically blind: eyes are happy closed curves
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.035;
    ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * r * 0.12, -r * 0.2, r * 0.06, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    // star-nose! (its own little burst)
    ctx.save();
    ctx.translate(0, -r * 0.04);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t / 2000;
      ell(ctx, Math.cos(a) * r * 0.05, Math.sin(a) * r * 0.05, r * 0.03, r * 0.018, a);
      ctx.fillStyle = "#ff9bbd";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = "#ff7ba6";
    ctx.fill();
    ctx.restore();
    happyMouth(ctx, C, 0, r * 0.08, r * 0.07);

    // big digging paws on the mound rim
    for (const s of [-1, 1]) {
      if (s === 1) continue; // right paw holds the compass up
      ell(ctx, s * r * 0.3, r * 0.52, r * 0.13, r * 0.09, s * 0.3);
      ctx.fillStyle = "#ffb3cd";
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = r * 0.03;
      ctx.stroke();
    }

    // right paw holding the compass up
    ell(ctx, r * 0.4, r * 0.05, r * 0.1, r * 0.13, -0.4);
    ctx.fillStyle = "#ffb3cd";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = r * 0.03;
    ctx.stroke();
    // compass with a hopelessly spinning needle
    ctx.save();
    ctx.translate(r * 0.5, -r * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.17, 0, Math.PI * 2);
    fo(ctx, C, r, C.accent);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    const chaos = t / 250 + Math.sin(t / 130) * 2.5;
    ctx.rotate(chaos);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.09);
    ctx.lineTo(r * 0.025, 0);
    ctx.lineTo(0, r * 0.09);
    ctx.lineTo(-r * 0.025, 0);
    ctx.closePath();
    ctx.fillStyle = "#e5484d";
    ctx.fill();
    ctx.restore();

    ctx.restore(); // duck

    // dirt kicked up when popping back
    if (duck > 0.6) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-r * 0.2 + i * r * 0.2, r * 0.35 - duck * r * 0.15, r * 0.03, 0, Math.PI * 2);
        ctx.fillStyle = "#8a6a4a";
        ctx.fill();
      }
    }

    // molehill in front, covering the mole's base (drawn last = occlusion)
    ell(ctx, 0, r * 0.78, r * 0.72, r * 0.26);
    ctx.fillStyle = "#9a6b43";
    ctx.fill();
    ctx.lineWidth = r * 0.04;
    ctx.strokeStyle = darken("#9a6b43", 0.35);
    ctx.stroke();
    ell(ctx, 0, r * 0.62, r * 0.4, r * 0.1); // hole
    ctx.fillStyle = "#5d3f26";
    ctx.fill();
    // dirt crumbs
    for (const [dx2, dy2] of [[-0.5, 0.72], [0.45, 0.78], [0.15, 0.9]]) {
      ctx.beginPath();
      ctx.arc(r * dx2, r * dy2, r * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = "#7a5533";
      ctx.fill();
    }
  }

  // ------------------------------------------------------------- utilities

  function pulse(t, cycle, windowMs) {
    const p = t % cycle;
    if (p < cycle - windowMs) return 0;
    return Math.sin(((p - (cycle - windowMs)) / windowMs) * Math.PI);
  }

  function star(ctx, x, y, size, color, spikes) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? size : size * 0.45;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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

  // Airborne scenes get a smaller, fainter shadow.
  const AIRBORNE = new Set(["Maps & Travel"]);

  function draw(ctx, cx, cy, r, category, prefix, time) {
    const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Other"];
    const C = {
      body: lighten(theme.to, 0.38),
      bodyDim: lighten(theme.to, 0.22),
      belly: lighten(theme.to, 0.62),
      line: darken(theme.to, 0.42),
      accent: theme.to,
      accDark: darken(theme.to, 0.22),
    };

    ctx.save();
    ctx.translate(cx, cy);

    // ground shadow
    ctx.save();
    if (AIRBORNE.has(category)) {
      ctx.globalAlpha = 0.5;
      ell(ctx, 0, r * 0.95, r * 0.3, r * 0.07);
    } else {
      ell(ctx, 0, r * 0.95, r * 0.68, r * 0.14);
    }
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
    ctx.restore();

    // gentle whole-scene breathing (kept subtle; scenes carry the motion)
    const breathe = Math.sin(time / 850) * 0.012;
    ctx.translate(0, Math.sin(time / 850) * r * 0.015);
    ctx.scale(1 + breathe * 0.3, 1 - breathe * 0.3);

    (SCENES[category] || sceneMole)(ctx, C, r, time);

    // time-of-day modifiers
    if (prefix === "Night Owl ") {
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath();
      ctx.arc(-r * 1.15, -r * 1.05, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(-r * 1.07, -r * 1.1, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      glyph(ctx, "z", -r * 0.95, -r * 0.85, r * 0.11, "rgba(255,255,255,0.7)");
    } else if (prefix === "Early Bird ") {
      ctx.save();
      ctx.translate(r * 1.15, -r * 1.05);
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd23f";
      ctx.lineWidth = r * 0.03;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + time / 4000;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18);
        ctx.lineTo(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  return { draw };
})();
