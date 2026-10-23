// Builds the .owl files from src/*.owl: expands the art and font the widgets embed, writes them to
// ../out and, with --install, into the widgets folder.   node build.js [--install]
//   @assets a b c   -> asset declarations for those pieces of art
//   @font lilita    -> the display font as an asset
//   @include name   -> the text of src/_name.inc
const fs = require("fs");
const path = require("path");
const A = require("../art/art.js");

const ROOT = path.join(__dirname, "..");
const ART = {
  jj_body: () => A.jjBody("happy"), jj_body_shock: () => A.jjBody("shock"), jj_body_sorry: () => A.jjBody("sorry"), jj_body_talk: () => A.jjBody("talk"), jj_body_tongue: () => A.jjBody("tongue"), jj_lip: A.jjLip, jj_jaw: A.jjJaw,
  jj_blink: A.jjBlink, jj_tongue: A.jjTongue, jj_ear: () => A.jjEar(false), jj_ear_far: () => A.jjEar(true), jj_stalk: () => A.jjStalk(false), jj_stalk_far: () => A.jjStalk(true),
  d_head: () => A.dHead(false), d_head_x: () => A.dHead(true), d_torso: () => A.dTorso(false), d_torn: () => A.dTorso(true),
  d_arm: A.dArm, d_leg: A.dLeg, d_blaster: A.dBlaster, d_full: () => A.droidFull(false), d_hurt: () => A.droidFull(true),
  orb: () => A.orb(true), pole: A.pole,
};
const b64 = (buf) => Buffer.from(buf).toString("base64");
const asset = (n) => `  asset ${n} = base64"${b64(ART[n]())}"`;
const LEVELS = require("../art/levels.js");
const levelsText = () => "  let L = [\n" + LEVELS.map((l) => `    {name: ${JSON.stringify(l.name)}, o: ${l.orbs}, b: ${JSON.stringify(l.b)}}`).join(",\n") + "\n  ]";
const FONTS = { lilita: path.join(ROOT, "art/LilitaOne-Regular.ttf") };

function expand(text, depth = 0) {
  return text.split("\n").map((line) => {
    let m;
    if ((m = line.match(/^\s*@assets\s+(.+)$/))) return m[1].trim().split(/\s+/).map(asset).join("\n");
    if (/^\s*@levels\s*$/.test(line)) return levelsText();
    if (/^\s*@bg\s*$/.test(line)) return `  asset bg = base64"${b64(fs.readFileSync(path.join(ROOT, "art/game-bg.png")))}"`;
    if ((m = line.match(/^\s*@font\s+(\w+)$/))) return `  asset ${m[1]} = base64"${b64(fs.readFileSync(FONTS[m[1]]))}"`;
    if ((m = line.match(/^(\s*)@include\s+([\w-]+)$/))) {
      const inc = fs.readFileSync(path.join(ROOT, "src", `_${m[2]}.inc`), "utf8").replace(/\n$/, "");
      return expand(inc, depth + 1).split("\n").map((l) => m[1] + l).join("\n");
    }
    return line;
  }).join("\n");
}

const install = process.argv.includes("--install");
const dest = path.join(process.env.HOME, ".config/omalauncher/widgets");
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, "src")).filter((f) => f.endsWith(".owl"))) {
  const out = expand(fs.readFileSync(path.join(ROOT, "src", f), "utf8"));
  fs.writeFileSync(path.join(ROOT, "out", f), out);
  if (install) fs.writeFileSync(path.join(dest, f), out);
  console.log(f, out.length, "bytes");
}
