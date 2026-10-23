// Renders the SVG art into PNG sprites for the Linux (LÖVE) game: node gameart.js
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");
const A = require("../art/art.js");
const out = path.join(__dirname, "../game/assets");
fs.mkdirSync(out, { recursive: true });
const sprites = {
  orb: [A.orb(true), 3], droid: [A.droidFull(false), 3], droid_hurt: [A.droidFull(true), 3],
  d_head: [A.dHead(true), 3], d_arm: [A.dArm(), 3], d_leg: [A.dLeg(), 3], d_torso: [A.dTorso(true), 3], d_blaster: [A.dBlaster(), 3],
  jj_body: [A.jjBody("happy"), 2], jj_talk: [A.jjBody("talk"), 2], jj_shock: [A.jjBody("shock"), 2], jj_sorry: [A.jjBody("sorry"), 2],
  jj_stalk: [A.jjStalk(false), 2], jj_stalk_far: [A.jjStalk(true), 2], jj_frill: [A.jjEar(), 2], jj_frill_far: [A.jjEar(true), 2], jj_blink: [A.jjBlink(), 2], jj_tongue: [A.jjTongue(), 2], jj_tongue_body: [A.jjBody("tongue"), 2], jj_lip: [A.jjLip(), 2], jj_jaw: [A.jjJaw(), 2],
};
for (const [name, [svg, z]] of Object.entries(sprites)) fs.writeFileSync(path.join(out, name + ".png"), new Resvg(svg, { fitTo: { mode: "zoom", value: z } }).render().asPng());
fs.copyFileSync(path.join(__dirname, "../art/LilitaOne-Regular.ttf"), path.join(out, "LilitaOne-Regular.ttf"));
// the level data, for Lua
const L = require("../art/levels.js");
fs.writeFileSync(path.join(__dirname, "../game/levels.lua"), "return {\n" + L.map((l) => `  { name = ${JSON.stringify(l.name)}, orbs = ${l.orbs}, b = { ${l.b.map((t) => `{${t.join(", ")}}`).join(", ")} } },`).join("\n") + "\n}\n");
console.log("sprites:", Object.keys(sprites).length);
