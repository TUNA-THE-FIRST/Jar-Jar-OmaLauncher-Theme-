// The battery as a bandolier of boomas: one per fifth of the charge, the last one dimmer the less it holds.
component Bandolier(level, charging) {
  Canvas {
    let n = ceil(level / 20)
    let part = (level - 20 * (n - 1)) / 20
    let low = level < 20 && !charging
    let slot = width / 5
    let r = min(slot * 0.36, height * 0.34)
    let cy = height * 0.46
    // the strap and its stitching
    path([[0, cy + r * 0.9], [width, cy + r * 0.9]], stroke: alpha(brown, 0.95), width: r * 0.9, cap: round)
    path([[0, cy + r * 0.9 - r * 0.3], [width, cy + r * 0.9 - r * 0.3]], stroke: alpha(bright_yellow, 0.35), width: 1.5)
    for i in range(5) {
      let cx = slot * (i + 0.5)
      let lit = i < n
      let f = i == n - 1 ? 0.35 + 0.65 * part : 1
      let wob = charging && lit ? sin(time * 3 + i) * 1.5 : 0
      // the pouch
      rect(cx - r * 1.05, cy + r * 0.2, r * 2.1, r * 1.45, radius: r * 0.45, fill: alpha(brown, 0.95), stroke: alpha(background, 0.9), width: 2)
      path([[cx - r * 0.7, cy + r * 0.62], [cx + r * 0.7, cy + r * 0.62]], stroke: alpha(bright_yellow, 0.3), width: 1.5)
      if lit {
        let p = low ? 0.55 + 0.45 * abs(sin(time * 4)) : f
        layer(p) {
          circle(cx, cy + wob, r * 1.7, fill: alpha(accent, 0.12))
          circle(cx, cy + wob, r * 1.3, fill: alpha(accent, 0.2))
          circle(cx, cy + wob, r, fill: low ? red : accent, stroke: low ? bright_red : bright_cyan, width: 2)
          circle(cx - r * 0.32, cy - r * 0.34 + wob, r * 0.26, fill: alpha(foreground, 0.85))
          arc(cx, cy + wob, r * 0.62, 200, 120, stroke: alpha(foreground, 0.4), width: 2, cap: round)
        }
        if charging {
          // current jumping to the next booma
          if i < n - 1 {
            let nx = cx + slot
            let j = floor(time * 8) % 3
            path([[cx + r, cy], [cx + slot * 0.3, cy - r * 0.5 + j * r * 0.35], [cx + slot * 0.6, cy + r * 0.5 - j * r * 0.35], [nx - r, cy]], stroke: alpha(bright_cyan, 0.9), width: 2.2, cap: round)
          }
        }
      } else {
        circle(cx, cy, r * 0.85, fill: alpha(foreground, 0.07), stroke: alpha(foreground, 0.12), width: 1.5)
      }
    }
  }
}
