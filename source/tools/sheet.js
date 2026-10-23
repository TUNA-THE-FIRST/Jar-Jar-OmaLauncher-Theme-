// node sheet.js out.png : contact sheet of the art, to look at while drawing it.
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const A = require("../art/art.js");
const items = [
  ["jj", A.jjBody("happy"), 300, 320], ["jjshock", A.jjBody("shock"), 300, 320], ["jjsorry", A.jjBody("sorry"), 300, 320],
  ["stalk", A.jjStalk(false), 80, 130], ["stalkfar", A.jjStalk(true), 80, 130], ["frill", A.jjEar(), 120, 260], ["tongue", A.jjTongue(), 300, 320], ["blink", A.jjBlink(), 50, 50],
  ["head", A.dHead(false), 70, 110], ["headx", A.dHead(true), 70, 110], ["torso", A.dTorso(false), 70, 96], ["torn", A.dTorso(true), 70, 96],
  ["arm", A.dArm(), 26, 116], ["leg", A.dLeg(), 36, 130], ["blaster", A.dBlaster(), 82, 36],
  ["full", A.droidFull(false), 100, 268], ["hurt", A.droidFull(true), 100, 268], ["orb", A.orb(), 100, 100],
];
let x = 10, y = 10, rowH = 0, body = "";
const W = 1400;
for (const [, s, w, h] of items) {
  const k = 1.0;
  if (x + w * k > W) { x = 10; y += rowH + 10; rowH = 0; }
  const inner = s.replace(/<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const defs = ""; // gradients ids are global; fine for the sheet
  body += `<g transform="translate(${x},${y}) scale(${k})">${inner}</g>`;
  x += w * k + 10; rowH = Math.max(rowH, h * k);
}
const H = y + rowH + 10;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#16231f"/>${body}</svg>`;
fs.writeFileSync(process.argv[2], new Resvg(sheet).render().asPng());
