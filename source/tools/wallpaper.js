// Draws the theme's wallpapers: a looming Naboo swamp at dusk, Otoh Gunga's bubbles glowing in the murk,
// boomas drifting in the water, a broken droid sinking in the reeds.
//   node wallpaper.js <outdir>
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");
const A = require("../art/art.js");

const W = 1440, H = 3120;
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const R = (a, b) => a + rnd() * (b - a);
const inner = (s) => s.replace(/<svg[^>]*>/, "").replace(/<defs>[\s\S]*?<\/defs>/, "").replace(/<\/svg>$/, "");

function scene(v) {
  seed = v.seed;
  const horizon = 1720;
  let o = "";
  const defs = `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.skyTop}"/><stop offset=".55" stop-color="${v.skyMid}"/><stop offset="1" stop-color="${v.skyLow}"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.waterTop}"/><stop offset=".45" stop-color="${v.waterMid}"/><stop offset="1" stop-color="#040b0a"/></linearGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${v.halo}" stop-opacity=".5"/><stop offset="1" stop-color="${v.halo}" stop-opacity="0"/></radialGradient>
    <radialGradient id="bub" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${v.bubble}" stop-opacity=".34"/><stop offset=".7" stop-color="${v.bubble}" stop-opacity=".10"/><stop offset="1" stop-color="${v.bubble}" stop-opacity=".22"/></radialGradient>
    <radialGradient id="orbhalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8fd6ff" stop-opacity=".62"/><stop offset=".45" stop-color="#4aa6e6" stop-opacity=".22"/><stop offset="1" stop-color="#2b78c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="orbc" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#e2f6ff"/><stop offset=".45" stop-color="#58b4ee"/><stop offset="1" stop-color="#1d5896"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".46" r=".78"><stop offset=".45" stop-color="#020807" stop-opacity="0"/><stop offset="1" stop-color="#020807" stop-opacity=".82"/></radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.mist}" stop-opacity="0"/><stop offset=".5" stop-color="${v.mist}" stop-opacity=".2"/><stop offset="1" stop-color="${v.mist}" stop-opacity="0"/></linearGradient>
    <radialGradient id="glowdot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d9f5a8" stop-opacity=".95"/><stop offset="1" stop-color="#d9f5a8" stop-opacity="0"/></radialGradient>`;

  o += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  // a pale, dull moon with a halo
  o += `<circle cx="${v.moon[0]}" cy="${v.moon[1]}" r="760" fill="url(#halo)"/>`;
  o += `<circle cx="${v.moon[0]}" cy="${v.moon[1]}" r="170" fill="${v.moonDisc}" opacity=".22"/><circle cx="${v.moon[0] - 40}" cy="${v.moon[1] - 30}" r="140" fill="#fff" opacity=".05"/>`;
  // slow clouds
  for (let i = 0; i < 7; i++) {
    const y = R(240, 1200), x = R(-100, W), w = R(380, 800);
    o += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${R(24, 56)}" fill="${v.cloud}" opacity="${R(0.05, 0.12)}"/>`;
  }
  // far hills
  const hills = (base, amp, col, op, n) => {
    let d = `M0 ${H} L0 ${base}`;
    for (let i = 0; i <= n; i++) d += ` L${(W / n) * i} ${base - Math.abs(Math.sin(i * 1.7 + base)) * amp - R(0, amp * 0.4)}`;
    d += ` L${W} ${H} Z`;
    return `<path d="${d}" fill="${col}" opacity="${op}"/>`;
  };
  o += hills(horizon - 40, 140, v.hillFar, 1, 9);
  o += `<rect x="0" y="${horizon - 330}" width="${W}" height="330" fill="url(#mist)"/>`;
  o += hills(horizon + 10, 110, v.hillNear, 1, 7);

  // Otoh Gunga: bubbles of glass in the murk, half under water
  const bubbles = [[360, 1640, 230], [640, 1700, 150], [210, 1760, 150], [820, 1660, 96], [980, 1730, 190], [1180, 1700, 120], [470, 1810, 100], [1300, 1790, 86]];
  for (const [bx, by, br] of bubbles) {
    o += `<circle cx="${bx}" cy="${by}" r="${br}" fill="url(#bub)" stroke="${v.bubbleEdge}" stroke-opacity=".5" stroke-width="6"/>`;
    o += `<path d="M${bx - br * 0.7} ${by - br * 0.1} A${br * 0.72} ${br * 0.72} 0 0 1 ${bx - br * 0.1} ${by - br * 0.72}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="7" stroke-linecap="round"/>`;
    o += `<path d="M${bx - br} ${by} H${bx + br}" stroke="${v.bubbleEdge}" stroke-opacity=".18" stroke-width="4"/>`;
    for (let w = 0; w < Math.floor(br / 28); w++) {
      const a = R(-2.6, -0.5), rr = R(0.15, 0.7) * br;
      o += `<circle cx="${bx + Math.cos(a) * rr}" cy="${by + Math.sin(a) * rr * 0.9}" r="${R(4, 9)}" fill="${v.window}" opacity="${R(0.5, 0.9)}"/>`;
    }
  }
  // bridges between bubbles
  o += `<path d="M360 1760 Q500 1830 640 1760 M640 1780 Q800 1850 980 1790 M980 1810 Q1090 1860 1180 1790" fill="none" stroke="${v.bubbleEdge}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>`;

  // water
  o += `<rect x="0" y="${horizon + 70}" width="${W}" height="${H - horizon - 70}" fill="url(#water)"/>`;
  o += `<rect x="0" y="${horizon + 50}" width="${W}" height="170" fill="url(#mist)"/>`;
  // reflections of the bubbles: dim streaks
  for (const [bx, , br] of bubbles) {
    for (let k = 0; k < 7; k++) o += `<rect x="${bx - br * 0.6 + R(0, br * 1.2)}" y="${horizon + 110 + R(0, 260)}" width="${R(60, 200)}" height="5" rx="2.5" fill="${v.bubbleEdge}" opacity="${R(0.06, 0.16)}"/>`;
  }
  // ripples
  for (let i = 0; i < 26; i++) o += `<ellipse cx="${R(0, W)}" cy="${R(horizon + 180, H - 200)}" rx="${R(60, 200)}" ry="${R(8, 24)}" fill="none" stroke="${v.bubbleEdge}" stroke-opacity="${R(0.05, 0.14)}" stroke-width="4"/>`;

  // trees framing the scene
  const tree = (x, topY, lean, scale, col) => {
    let t = `<path d="M${x - 70 * scale} ${H} C${x - 60 * scale} 2200 ${x - 40 * scale + lean} 1500 ${x + lean} ${topY + 200} C${x + 40 * scale + lean} 1500 ${x + 70 * scale} 2200 ${x + 90 * scale} ${H} Z" fill="${col}"/>`;
    for (let i = 0; i < 9; i++) {
      const a = R(0, Math.PI * 2), d = R(0, 220) * scale;
      t += `<circle cx="${x + lean + Math.cos(a) * d * 1.3}" cy="${topY + Math.sin(a) * d * 0.7}" r="${R(110, 220) * scale}" fill="${col}"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const vx = x + lean + R(-260, 260) * scale, vy = topY + R(80, 200);
      t += `<path d="M${vx} ${vy} Q${vx + R(-40, 40)} ${vy + 240} ${vx + R(-30, 30)} ${vy + R(300, 640)}" fill="none" stroke="${col}" stroke-width="${R(8, 16)}" stroke-linecap="round"/>`;
    }
    return t;
  };
  o += tree(40, 200, 80, 1.6, v.treeFar);
  o += tree(1400, 360, -70, 1.4, v.treeFar);
  o += tree(-30, 640, 100, 1.2, v.treeNear);
  o += tree(1460, 880, -120, 1.1, v.treeNear);

  // lily pads
  for (let i = 0; i < 24; i++) {
    const x = R(0, W), y = R(horizon + 260, H - 120), w = R(50, 150) * (0.5 + (y - horizon) / 2400);
    o += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.2}" fill="${v.pad}" opacity=".85"/><ellipse cx="${x}" cy="${y - w * 0.04}" rx="${w * 0.92}" ry="${w * 0.14}" fill="${v.padHi}" opacity=".35"/>`;
  }

  // boomas, deeper = smaller and dimmer
  const orbs = [[250, 2280, 62], [1090, 2060, 46], [720, 2480, 78], [1230, 2620, 52], [420, 1960, 34], [900, 1930, 26], [160, 2700, 40], [1020, 2860, 66], [600, 2150, 28]];
  for (const [ox, oy, orr] of orbs) {
    o += `<circle cx="${ox}" cy="${oy}" r="${orr * 3.2}" fill="url(#orbhalo)"/>`;
    o += `<circle cx="${ox}" cy="${oy}" r="${orr}" fill="url(#orbc)" stroke="#a9dfff" stroke-width="3" stroke-opacity=".75"/>`;
    o += `<ellipse cx="${ox - orr * 0.3}" cy="${oy - orr * 0.38}" rx="${orr * 0.26}" ry="${orr * 0.16}" fill="#fff" opacity=".7" transform="rotate(-32 ${ox - orr * 0.3} ${oy - orr * 0.38})"/>`;
    o += `<ellipse cx="${ox}" cy="${oy + orr * 1.6}" rx="${orr * 0.9}" ry="${orr * 0.16}" fill="#6cc6ff" opacity=".18"/>`;
  }

  // a broken droid sinking in the reeds
  const part = (svgStr, x, y, w, rot, op = 0.9) => {
    const m = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/);
    const k = w / +m[1];
    return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})" opacity="${op}">${inner(svgStr)}</g>`;
  };
  o += part(A.dHead(true), 880, 2800, 200, -24, 0.95);
  o += part(A.dArm(), 1190, 2900, 90, 100, 0.85);
  o += part(A.dTorso(true), 150, 2930, 260, 18, 0.85);
  o += `<ellipse cx="1060" cy="2985" rx="340" ry="42" fill="${v.waterMid}" opacity=".78"/><ellipse cx="260" cy="3040" rx="360" ry="48" fill="${v.waterMid}" opacity=".78"/>`;
  // the one eye still lit, glowing in the dark
  o += `<circle cx="1008" cy="2842" r="60" fill="url(#orbhalo)" opacity=".0"/>`;

  // reeds and cattails, very dark, in the corners
  const reed = (x, h, lean, col) => {
    const top = [x + lean, H - h];
    let r = `<path d="M${x} ${H} Q${x + lean * 0.2} ${H - h * 0.55} ${top[0]} ${top[1]}" fill="none" stroke="${col}" stroke-width="${R(9, 15)}" stroke-linecap="round"/>`;
    if (rnd() < 0.5) r += `<ellipse cx="${top[0]}" cy="${top[1] + 36}" rx="14" ry="52" fill="${col}" transform="rotate(${lean * 0.15} ${top[0]} ${top[1]})"/>`;
    return r;
  };
  for (let i = 0; i < 22; i++) o += reed(R(-40, 420), R(300, 820), R(-60, 90), v.reed);
  for (let i = 0; i < 20; i++) o += reed(R(1020, 1480), R(260, 780), R(-90, 60), v.reed);

  // fireflies
  for (let i = 0; i < 70; i++) {
    const x = R(0, W), y = R(500, 2800), r = R(5, 16);
    o += `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#glowdot)" opacity="${R(0.15, 0.5)}"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#f4ffd0" opacity=".85"/>`;
  }
  o += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${o}</svg>`;
}

const variants = {
  "01-otoh-gunga-glow": {
    seed: 11, skyTop: "#050d0d", skyMid: "#0e2523", skyLow: "#1e4a45", halo: "#4aa8c4", moon: [1030, 470], moonDisc: "#bfe8ea", cloud: "#6fb5b0",
    hillFar: "#0f2a28", hillNear: "#0b1f1d", mist: "#8fd4cc", bubble: "#78d8cc", bubbleEdge: "#8fe8dc", window: "#f0d98c",
    waterTop: "#14383a", waterMid: "#0a1f1f", treeFar: "#0a1c1a", treeNear: "#06100f", pad: "#18402f", padHi: "#5aa070", reed: "#040a09",
  },
  "02-gungan-dusk": {
    seed: 23, skyTop: "#0d0a12", skyMid: "#2a1f2e", skyLow: "#6a4552", halo: "#d08a96", moon: [420, 560], moonDisc: "#f0c4c4", cloud: "#d29aa6",
    hillFar: "#1c1c26", hillNear: "#10181a", mist: "#e0a6ae", bubble: "#9ad8c4", bubbleEdge: "#a8e6cf", window: "#f4d68a",
    waterTop: "#2a3036", waterMid: "#10191c", treeFar: "#0c1516", treeNear: "#070d0e", pad: "#1b3f2e", padHi: "#68a878", reed: "#040908",
  },
};

const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
for (const [name, v] of Object.entries(variants)) {
  const png = new Resvg(scene(v), { fitTo: { mode: "width", value: W } }).render().asPng();
  fs.writeFileSync(path.join(out, name + ".png"), png);
  console.log(name, png.length);
}

if (process.argv[3] === "small") {
  const png = new Resvg(scene(variants["01-otoh-gunga-glow"]), { fitTo: { mode: "width", value: 900 } }).render().asPng();
  fs.writeFileSync(path.join(__dirname, "../game/assets/bg.png"), png);
  console.log("game-bg", png.length);
}
