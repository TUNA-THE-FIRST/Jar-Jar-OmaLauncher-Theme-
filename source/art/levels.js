// Booma Blast levels. World units: x from the left (the sling stands at 45), y up from the ground, 300 across.
// Bodies are [kind, x, y, w, h]: kind 0 droid, 1 wood, 2 stone.  Stacks are built from the ground up.
const droid = (x, top = 0) => [0, x, top + 24, 18, 48];
const wood = (x, w, h, base) => [1, x, base + h / 2, w, h];
const stone = (x, w, h, base) => [2, x, base + h / 2, w, h];
module.exports = [
  { name: "Naboo Plains", orbs: 3, b: [wood(200, 12, 44, 0), wood(236, 12, 44, 0), wood(218, 60, 10, 44), droid(218, 54), droid(268)] },
  { name: "Stone Stoop", orbs: 4, b: [stone(235, 50, 20, 0), wood(222, 12, 42, 20), wood(248, 12, 42, 20), wood(235, 60, 10, 62), droid(235, 72), droid(180), droid(284)] },
  { name: "The Wall", orbs: 4, b: [stone(185, 16, 64, 0), droid(185, 64), wood(225, 12, 50, 0), wood(265, 12, 50, 0), wood(245, 60, 10, 50), droid(245), droid(245, 60)] },
  { name: "Crate Pyramid", orbs: 4, b: [
    wood(210, 28, 28, 0), wood(238, 28, 28, 0), wood(266, 28, 28, 0), wood(224, 28, 28, 28), wood(252, 28, 28, 28), wood(238, 28, 28, 56),
    droid(238, 84), droid(175), droid(290)] },
  { name: "Fortress Gungan", orbs: 5, b: [
    stone(185, 22, 36, 0), wood(185, 22, 36, 36), droid(185, 72),
    stone(285, 22, 36, 0), wood(285, 22, 36, 36), droid(285, 72),
    stone(235, 44, 22, 0), wood(222, 10, 40, 22), wood(248, 10, 40, 22), wood(235, 50, 10, 62), droid(235, 72), droid(266)] },
];
