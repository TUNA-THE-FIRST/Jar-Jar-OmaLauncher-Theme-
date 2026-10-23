// Jar Jar up to his shoulders in broken battle droids. Ears sway, eyes blink, and a tap (tapT is the time of the
// last one) makes him hop, flap his ears and, on a goofy line, stick out his tongue.
component JarScene(mood = 0, tapT = -10, goofy = false, say = 20) {
  Canvas {
    let s = min(height * 0.95 / 350, width * 0.62 / 300)
    let bx = width * 0.5 - 150 * s
    let dt = time - tapT
    let talkLen = 0.5 + say * 0.05
    let hop = dt >= 0 && dt < 0.7 ? sin(dt / 0.7 * 3.1416) * height * 0.07 : 0
    let by = height * 0.08 - hop + sin(time * 1.7) * 1.2
    let jflap = dt >= 0 && dt < 1.4 ? sin(dt * 17) * 14 * pow(1 - dt / 1.4, 2) : 0
    let jsq = dt >= 0 && dt < 0.5 ? sin(dt * 20) * 0.07 * (1 - dt / 0.5) : 0
    let jmood = mood
    let jtalk = dt >= 0 && dt < talkLen
    let tEnd = talkLen + 1.8
    let tIn = clamp(dt / 0.28, 0, 1)
    let tOut = clamp((tEnd - dt) / 0.3, 0, 1)
    let jtp = goofy && dt >= 0 && dt < tEnd ? min(1 + 2.70158 * pow(tIn - 1, 3) + 1.70158 * pow(tIn - 1, 2), tOut) : 0
    circle(width * 0.5, height * 0.6, height * 0.5, fill: alpha(accent, 0.07))
    circle(width * 0.5, height * 0.6, height * 0.34, fill: alpha(accent, 0.07))
    for i in range(4) {
      let r = height * (0.06 + hash(i, 1) * 0.08)
      let bxx = width * (0.08 + hash(i, 2) * 0.84)
      let byy = height * (0.12 + hash(i, 3) * 0.5) + sin(time * 0.8 + i * 2) * 4
      circle(bxx, byy, r, fill: alpha(bright_cyan, 0.05), stroke: alpha(bright_cyan, 0.3), width: 1.5)
      arc(bxx, byy, r * 0.7, 250, 60, stroke: alpha(foreground, 0.3), width: 1.5, cap: round)
    }
    @include jarparts
    // the pile
    let ps = s * 0.9
    image(d_leg, width * 0.06, height - 130 * ps, 36 * ps, 130 * ps)
    rotate(18, width * 0.2, height - 40 * ps) { image(d_torn, width * 0.12, height - 100 * ps, 70 * ps * 1.1, 96 * ps * 1.1) }
    rotate(-70, width * 0.8, height - 60 * ps) { image(d_arm, width * 0.78, height - 116 * ps, 26 * ps, 116 * ps) }
    rotate(-18, width * 0.84, height - 50 * ps) { image(d_head_x, width * 0.76, height - 112 * ps, 70 * ps, 110 * ps) }
    rotate(8, width * 0.7, height - 20 * ps) { image(d_blaster, width * 0.62, height - 40 * ps, 82 * ps, 36 * ps) }
    // the head's last good eye sparks
    let sp = floor(time * 6) % 4
    let hx = width * 0.76 + 56 * ps
    let hy = height - 112 * ps + 8 * ps
    path([[hx, hy], [hx + 6 + sp * 2, hy - 8], [hx + 2, hy - 14 - sp]], stroke: alpha(bright_yellow, sp == 0 ? 0.2 : 0.9), width: 2, cap: round)
  }
}
