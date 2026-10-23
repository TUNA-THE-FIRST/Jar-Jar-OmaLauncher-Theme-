// Original cartoon art for the Gungan theme, as SVG strings.
// Everything is plain shapes and gradients so the launcher can draw it as vectors.

const C = {
  skin: "#c98b78", skinShade: "#a56a5d", skinHi: "#e2b09c", belly: "#e6c7ad", spot: "#8e5448",
  line: "#2a1d1f", eye: "#ebbb3d", eyeShade: "#b8841f", mouthIn: "#6b2332", tongue: "#d4667b",
  tunic: "#5f5a43", tunicShade: "#444030", trim: "#8f7f4e", strap: "#2f271d",
  tan: "#c4a262", tanShade: "#98793f", tanHi: "#dfc78c", dark: "#2c2720", darkHi: "#4a4236", glow: "#f0a43c",
  orbCore: "#e2f6ff", orbMid: "#58b4ee", orbEdge: "#1d5896", orbGlow: "#79cbff",
  wood: "#7b5a3a", woodHi: "#9a7650", woodDark: "#4f3724", stone: "#6f7f78", stoneHi: "#8fa098", stoneDark: "#46534e",
};

const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;

const tube = (d, widths, fill, outline, ow = 4) => {
  // A curved stalk that tapers: a few strokes of falling width, outline first.
  let s = "";
  d.forEach((seg, i) => { s += `<path d="${seg}" fill="none" stroke="${outline}" stroke-width="${widths[i] + ow}" stroke-linecap="round"/>`; });
  d.forEach((seg, i) => { s += `<path d="${seg}" fill="none" stroke="${fill}" stroke-width="${widths[i]}" stroke-linecap="round"/>`; });
  return s;
};

// ---------------------------------------------------------------- Jar Jar
// Facing right, drawn from the reference: eyes on two ridged stalks, a long flat duck-bill, a cream underside,
// and a ridged frill hanging down the back of the head and neck. Body = head (with a hinged jaw), neck, shoulders
// and tunic. Stalks, frill and blink move separately. All in a 300 x 320 frame.
const J = { skin: "#c4735f", shade: "#93493b", ridge: "#6f3228", cream: "#e8cfa8", creamShade: "#c8a27c", pink: "#d77f8a", mouth: "#5e1f2c" };

function jjBody(mood = "happy") {
  const open = mood === "shock" ? 1 : mood === "talk" ? 0.5 : mood === "tongue" ? 0.6 : 0;
  const sorry = mood === "sorry";
  const jawRot = open * 24;
  // the dark inside of the mouth: only the wedge between the upper lip's line and the (rotated) top of the jaw, so it never pokes out
  const rotJ = (x, y) => { const t = jawRot * Math.PI / 180, dx = x - 206, dy = y - 196; return [206 + dx * Math.cos(t) - dy * Math.sin(t), 196 + dx * Math.sin(t) + dy * Math.cos(t) - 12]; };
  const jawTop = [[164, 198], [206, 193], [226, 187], [250, 183], [268, 180], [276, 178]].map((p) => rotJ(p[0], p[1]).map((v) => v.toFixed(1)).join(" "));
  const interior = open > 0.05 ? `<path d="M178 197 L214 192 L228 186 L262 175 L277 173 L${jawTop[5]} L${jawTop[4]} L${jawTop[3]} L${jawTop[2]} L${jawTop[1]} Z" fill="${J.mouth}"/>` : "";
  return svg(300, 320, `
    <!-- neck, cream down the front with wrinkles -->
    <path d="M113 166 C116 212 118 262 112 304 L196 304 C186 266 176 232 160 198 Z" fill="${J.skin}" stroke="${C.line}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M160 198 C176 234 186 270 196 304 L160 304 C160 268 156 236 152 206 Z" fill="${J.cream}"/>
    <path d="M158 220 Q170 228 180 220 M160 242 Q174 252 187 242 M162 264 Q178 274 192 264 M164 288 Q180 298 196 288" fill="none" stroke="${J.creamShade}" stroke-width="3" stroke-linecap="round"/>
    <!-- tunic and shoulders -->
    <path d="M58 320 C60 292 82 276 110 270 L192 270 C220 276 244 292 246 320 Z" fill="${C.tunic}" stroke="${C.line}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M58 320 C60 298 72 284 90 278 L106 320 Z" fill="${C.tunicShade}" opacity=".7"/>
    <path d="M112 272 L152 300 L192 272" fill="none" stroke="${C.trim}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M84 280 L204 320 L234 320 L106 272 Z" fill="${C.strap}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="186" cy="308" r="7" fill="${C.trim}" stroke="${C.line}" stroke-width="3"/>
    <g transform="translate(25.6,32) scale(.84)">
    <!-- mouth: dark inside, the tongue, then the lower jaw hinged at the cheek -->
    ${open > 0.2 ? `${interior}` : ""}
    <g transform="translate(0,-12) rotate(${jawRot} 206 196)">
      <path d="M164 198 L206 193 C226 187 252 181 276 178 C290 178 294 189 282 195 C264 205 240 214 216 218 C196 221 176 217 162 208 Z" fill="${J.cream}" stroke="${C.line}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M214 208 C236 203 258 195 278 189" fill="none" stroke="${J.creamShade}" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- head: dome and upper bill -->
    <path d="M106 178 C100 150 102 114 126 90 C150 68 186 68 204 92 C210 100 218 108 228 114 C250 126 278 140 291 156 C297 166 289 174 277 173 C262 174 244 178 228 186 C214 192 200 195 178 197 C150 199 124 195 106 178 Z" fill="${J.skin}"/>
    <path d="M178 197 C200 195 214 192 228 186 C244 178 262 174 277 173 C289 174 297 166 291 156 C278 140 250 126 228 114 C218 108 210 100 204 92 C186 68 150 68 126 90 C102 114 100 150 106 178" fill="none" stroke="${C.line}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M128 90 C150 72 184 72 202 92 C194 82 174 78 152 80 C142 81 134 85 128 90Z" fill="#e0957f" opacity=".7"/>
    
    <path d="M228 186 C244 178 262 174 277 173 C289 174 297 166 291 156 C284 152 270 148 258 150 C246 158 236 172 228 186Z" fill="${J.cream}" opacity=".95"/>
    <ellipse cx="212" cy="108" rx="6.5" ry="8.5" fill="${C.line}" transform="rotate(-24 212 108)"/>
    <path d="M222 120 C246 134 270 144 286 156" fill="none" stroke="${J.shade}" stroke-width="3.2" stroke-linecap="round" opacity=".6"/>
    <circle cx="152" cy="100" r="3.4" fill="${J.ridge}" opacity=".8"/><circle cx="132" cy="124" r="3" fill="${J.ridge}" opacity=".8"/><circle cx="168" cy="138" r="2.8" fill="${J.ridge}" opacity=".8"/>
    ${sorry ? `<path d="M214 190 Q240 182 270 188" fill="none" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>` : ""}
    </g>
  `);
}

// The tongue, for the funny lines: it lies in the gap between the lips, then lolls out over the front of the lower lip.
// Drawn full-frame like the body (in the jaw's frame), so the scene can slide and wag it. Its pivot is the front of the mouth,
// (288, 190). Layers, bottom to top: body (jaw ajar), tongue, upper lip (jjLip), rear jaw (jjJaw).
function jjTongue() {
  return svg(300, 320, `<g transform="translate(25.6,32) scale(.84) translate(0,-12)">
    <path d="M236 192 L286 191 C304 190 318 198 318 212 C318 230 316 244 307 253 C299 260 289 253 292 242 C295 230 294 218 286 209 L236 203 Z" fill="${J.pink}" stroke="${C.line}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M250 197 L288 198 C300 199 305 208 305 220 C306 232 307 242 305 248" fill="none" stroke="#a84a5e" stroke-width="3" stroke-linecap="round"/></g>`);
}

// The upper lip again, over the tongue.
function jjLip() {
  return svg(300, 320, `<g transform="translate(25.6,32) scale(.84)">
    <path d="M178 197 C200 195 214 192 228 186 C244 178 262 174 277 173 C289 174 297 166 291 156 L280 146 L170 146 Z" fill="${J.skin}"/>
    <path d="M228 186 C244 178 262 174 277 173 C289 174 297 166 291 156 C284 152 270 148 258 150 C246 158 236 172 228 186Z" fill="${J.cream}"/>
    <path d="M178 197 C200 195 214 192 228 186 C244 178 262 174 277 173 C289 174 297 166 291 156" fill="none" stroke="${C.line}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`);
}

// The whole lower jaw in the tongue pose, over the tongue, so the tongue runs in the gap and only comes out past the tip of the jaw.
function jjJaw() {
  const rot = 0.6 * 24;
  return svg(300, 320, `<g transform="translate(25.6,32) scale(.84) translate(0,-12) rotate(${rot} 206 196)">
    <path d="M164 198 L206 193 C226 187 252 181 276 178 C290 178 294 189 282 195 C264 205 240 214 216 218 C196 221 176 217 162 208 Z" fill="${J.cream}" stroke="${C.line}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M214 208 C236 203 258 195 278 189" fill="none" stroke="${J.creamShade}" stroke-width="3" stroke-linecap="round"/></g>`);
}

// An eye stalk, 80 x 130, rooted at (40, 120): ridged tube with the eye on the tip (the eye itself at (40, 26)).
function jjStalk(far = false) {
  const sk = far ? J.shade : J.skin;
  const ridges = [100, 84, 68, 52].map((y) => `<path d="M${24 + (118 - y) * 0.05} ${y} Q40 ${y + 9} ${56 - (118 - y) * 0.05} ${y}" fill="none" stroke="${J.ridge}" stroke-width="4" stroke-linecap="round"/>`).join("");
  return svg(80, 130, `
    <path d="M22 124 C22 96 25 66 27 40 L53 40 C55 66 58 96 58 124 Z" fill="${sk}" stroke="${C.line}" stroke-width="4" stroke-linejoin="round"/>
    ${ridges}
    <circle cx="40" cy="30" r="26" fill="${sk}" stroke="${C.line}" stroke-width="4"/>
    <circle cx="40" cy="30" r="17" fill="${C.eye}" stroke="${C.line}" stroke-width="3"/>
    <ellipse cx="45" cy="31" rx="4.5" ry="8" fill="${C.line}"/>
    <circle cx="43" cy="27" r="2" fill="#fff" opacity=".9"/>
    <path d="M18 22 Q40 4 62 22" fill="none" stroke="${J.ridge}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
}

// The eyes shut: a skin-coloured lid over a stalk's eye, 50 x 50, centred on the eye.
function jjBlink() {
  return svg(50, 50, `<circle cx="25" cy="25" r="19" fill="${J.skin}" stroke="${C.line}" stroke-width="3"/><path d="M10 28 Q25 36 40 28" fill="none" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round"/>`);
}

// The frill: one ridged, scalloped flap hanging from the back of the head down the neck, 120 x 270, rooted at (86, 24).
function jjEar(far = false) {
  const n = 8;
  const cx = (t) => 86 - t * 30 + Math.sin(t * 3.2) * 8;
  const w = (t) => 24 - t * 9;
  const Y = (t) => 14 + t * 236;
  let d = `M${cx(0) + 20} 10 L${cx(0) - w(0)} ${Y(0)} `;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    d += `Q${cx(t0) - w(t0) - 8} ${(Y(t0) + Y(t1)) / 2} ${cx(t1) - w(t1)} ${Y(t1)} `;
  }
  d += `Q${cx(1)} 272 ${cx(1) + w(1)} ${Y(1) - 6} L${cx(0) + 26} 10 Z`;
  let ribs = "";
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    ribs += `<path d="M${cx(t) - w(t) + 1} ${Y(t)} Q${cx(t) - 2} ${Y(t) + 9} ${cx(t) + w(t) * 0.5} ${Y(t) - 4}" fill="none" stroke="${J.ridge}" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  return svg(120, 276, `<path d="${d}" fill="${far ? "#6e2f26" : J.shade}" stroke="${C.line}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${cx(0) + 4} 12 L${cx(0) - w(0) * 0.5} ${Y(0)} ${[...Array(n)].map((_, i) => `L${cx((i + 1) / n) - w((i + 1) / n) * 0.45} ${Y((i + 1) / n)}`).join(" ")}" fill="none" stroke="${far ? J.shade : J.skin}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="${far ? 0.5 : 0.55}"/>${ribs}`);
}

// ---------------------------------------------------------------- battle droid parts
// Each part draws in its own frame; the fall-apart pieces use these too.
const droidHead = (cracked = false, eyeLit = true) => `
  <path d="M35 6 C53 6 59 28 57 52 C56 72 49 92 43 106 L27 106 C21 92 14 72 13 52 C11 28 17 6 35 6Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M42 8 C54 14 59 32 57 52 C56 72 49 92 43 106 L38 106 C46 82 48 40 42 8Z" fill="${C.tanShade}" opacity=".55"/>
  <path d="M22 14 C26 10 30 9 33 9" fill="none" stroke="${C.tanHi}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
  <ellipse cx="23" cy="48" rx="6.5" ry="11" fill="${C.dark}" transform="rotate(-8 23 48)"/>
  <ellipse cx="47" cy="48" rx="6.5" ry="11" fill="${C.dark}" transform="rotate(8 47 48)"/>
  ${eyeLit ? `<circle cx="23" cy="52" r="3.2" fill="${C.glow}"/><circle cx="47" cy="52" r="3.2" fill="${C.glow}"/>` : `<circle cx="47" cy="52" r="3" fill="${C.glow}"/>`}
  <path d="M35 66 L35 98 M29 80 L29 96 M41 80 L41 96" stroke="${C.tanShade}" stroke-width="3" stroke-linecap="round"/>
  ${cracked ? `<path d="M30 8 L36 24 L28 36 L38 50 L30 64 L40 76" fill="none" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M13 40 L22 44 M56 60 L48 58" stroke="${C.line}" stroke-width="2.5" stroke-linecap="round"/>` : ""}
`;

const droidTorso = (torn = false) => `
  <path d="M10 12 C10 4 20 2 35 2 C50 2 60 4 60 12 L58 50 ${torn ? "L52 62 L46 52 L40 70 L32 54 L24 66 L18 52 L12 60" : "C56 62 50 70 44 76 L26 76 C20 70 14 62 12 50"} Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M60 12 L58 50 C56 62 50 70 44 76 L40 76 C48 60 50 36 48 10Z" fill="${C.tanShade}" opacity=".5"/>
  <path d="M18 18 H52 M17 28 H53 M17 38 H53" stroke="${C.tanShade}" stroke-width="3" stroke-linecap="round"/>
  <rect x="29" y="12" width="12" height="40" rx="5" fill="${C.dark}"/>
  <circle cx="35" cy="22" r="3" fill="${C.glow}" opacity=".85"/>
  <circle cx="10" cy="14" r="7" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/><circle cx="60" cy="14" r="7" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/>
  ${torn ? `<path d="M30 62 C26 76 34 82 28 92 M40 64 C46 74 38 84 44 90" fill="none" stroke="${C.glow}" stroke-width="2.4" stroke-linecap="round"/>` : ""}
`;

const droidArm = () => `
  <path d="M8 6 C8 2 16 2 16 6 L17 52 L7 52 Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="12" cy="54" r="6.5" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/>
  <path d="M7.5 58 L17 58 L16 100 L9 100 Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M6 100 H19 L20 112 H5 Z" fill="${C.dark}" stroke="${C.line}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M16 6 L17 52 L14 52 Z" fill="${C.tanShade}" opacity=".6"/>
`;

const droidLeg = () => `
  <path d="M8 4 H22 L24 56 H7 Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="15.5" cy="58" r="8" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/>
  <path d="M9 64 H22 L21 112 H10 Z" fill="${C.tan}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M7 112 H24 L32 126 H3 Z" fill="${C.tanShade}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M22 4 L24 56 L19 56 Z" fill="${C.tanShade}" opacity=".5"/>
`;

const droidBlaster = () => `
  <path d="M4 10 H52 L62 6 H78 V16 H62 L58 22 H30 L26 32 H14 L16 20 H4 Z" fill="${C.darkHi}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="32" y="8" width="16" height="6" rx="2" fill="${C.tan}" opacity=".9"/>
`;

const wrap = (inner, w, h) => svg(w, h, inner);
const dHead = (cracked) => wrap(droidHead(cracked, !cracked), 70, 110);
const dTorso = (torn) => wrap(droidTorso(torn), 70, 96);
const dArm = () => wrap(droidArm(), 26, 116);
const dLeg = () => wrap(droidLeg(), 36, 130);
const dBlaster = () => wrap(droidBlaster(), 82, 36);

// A whole standing droid, 100 x 268. hurt=true gives a cracked head, a bent arm and sparks.
function droidFull(hurt = false) {
  return svg(100, 268, `
    <g transform="translate(25,150) scale(.9) rotate(-3 18 4)">${droidLeg()}</g>
    <g transform="translate(46,150) scale(.9) rotate(3 18 4)">${droidLeg()}</g>
    <rect x="38" y="140" width="24" height="14" rx="4" fill="${C.dark}"/>
    <g transform="translate(21,82) scale(.82)">${droidTorso(false)}</g>
    <rect x="43" y="68" width="14" height="18" rx="5" fill="${C.dark}"/>
    <g transform="translate(26,-2) scale(.68)">${droidHead(hurt, !hurt)}</g>
    <g transform="translate(9,88) scale(.8) rotate(${hurt ? -14 : 3} 12 4)">${droidArm()}</g>
    <g transform="translate(66,88) scale(.8) rotate(${hurt ? 30 : -3} 12 4)">${droidArm()}</g>
    ${hurt ? `<path d="M36 8 l-5 -7 M62 12 l7 -5 M70 50 l9 -2 M58 4 l2 -6" stroke="${C.glow}" stroke-width="3" stroke-linecap="round"/>` : ""}
  `);
}

// ---------------------------------------------------------------- booma (energy ball)
function orb(glow = true) {
  return svg(100, 100, `
    ${glow ? `<circle cx="50" cy="50" r="49" fill="url(#g)"/>` : ""}
    <circle cx="50" cy="50" r="33" fill="url(#c)" stroke="#a9dfff" stroke-width="2.5"/>
    <path d="M26 56 C32 40 46 36 58 44 C66 49 72 46 76 40" fill="none" stroke="#e8f8ff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M30 66 C42 74 58 74 70 62" fill="none" stroke="#1d5896" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    <ellipse cx="39" cy="36" rx="9" ry="5.5" fill="#fff" opacity=".8" transform="rotate(-32 39 36)"/>
  `, `
    <radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="55%" stop-color="${C.orbGlow}" stop-opacity=".55"/><stop offset="100%" stop-color="${C.orbGlow}" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="38%" cy="34%" r="75%"><stop offset="0%" stop-color="${C.orbCore}"/><stop offset="45%" stop-color="${C.orbMid}"/><stop offset="100%" stop-color="${C.orbEdge}"/></radialGradient>`);
}

module.exports = { C, jjBody, jjBlink, jjTongue, jjLip, jjJaw, jjEar, jjStalk, dHead, dTorso, dArm, dLeg, dBlaster, droidFull, orb };

// A Gungan electropole, lying across, 420 x 44: a shaft with bands and a forked tip with a spark of blue between.
function pole() {
  return svg(420, 44, `
    <path d="M6 22 H300" stroke="${C.line}" stroke-width="13" stroke-linecap="round"/>
    <path d="M6 22 H300" stroke="${C.wood}" stroke-width="8" stroke-linecap="round"/>
    <path d="M10 19.5 H296" stroke="${C.woodHi}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    <rect x="70" y="14" width="10" height="16" rx="3" fill="${C.trim}" stroke="${C.line}" stroke-width="2"/>
    <rect x="150" y="14" width="10" height="16" rx="3" fill="${C.trim}" stroke="${C.line}" stroke-width="2"/>
    <path d="M296 22 L330 22 M330 22 L384 7 M330 22 L384 37" fill="none" stroke="${C.line}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M296 22 L330 22 M330 22 L384 7 M330 22 L384 37" fill="none" stroke="${C.stoneHi}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M388 9 L398 22 L390 20 L400 33 L392 34" fill="none" stroke="#bfe9ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="390" cy="22" r="9" fill="${C.orbGlow}" opacity=".35"/>
  `);
}
module.exports.pole = pole;
