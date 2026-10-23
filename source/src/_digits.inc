// The time as seven-segment digits whose segments are plates torn off a battle droid, with a booma for a colon.
component DroidTime(hh, mm, big = 1) {
  Canvas {
    let dh = min(height - 4, width / 3.2)
    let dw = dh * 0.52
    let t = dh * 0.16
    let gap = dh * 0.22
    let total = dw * 4 + gap * 3 + dh * 0.34
    let x0 = (width - total) / 2
    let segs = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"]
    let digits = [int(hh / 10), hh % 10, int(mm / 10), mm % 10]
    let xs = [x0, x0 + dw + gap, x0 + dw * 2 + gap * 2 + dh * 0.34, x0 + dw * 3 + gap * 3 + dh * 0.34]
    let top = (height - dh) / 2
    let inset = t * 0.62
    for k in range(4) {
      let d = digits[k]
      let lx = xs[k]
      let ys = [top, top + dh / 2, top + dh]
      for s in range(7) {
        let name = "abcdefg"
        let lit = contains(segs[d], sub(name, s, s + 1))
        let horiz = s == 0 || s == 3 || s == 6
        let sx = s == 1 || s == 2 ? lx + dw : lx
        let sy = s == 0 ? ys[0] : s == 6 ? ys[1] : s == 3 ? ys[2] : s == 1 || s == 5 ? ys[0] : ys[1]
        let pts = horiz
          ? [[sx + inset, sy], [sx + inset + t / 2, sy - t / 2], [sx + dw - inset - t / 2, sy - t / 2], [sx + dw - inset, sy], [sx + dw - inset - t / 2, sy + t / 2], [sx + inset + t / 2, sy + t / 2]]
          : [[sx, sy + t * 0.35], [sx + t / 2, sy + t * 0.35 + t / 2], [sx + t / 2, sy + dh / 2 - t * 0.35 - t / 2], [sx, sy + dh / 2 - t * 0.35], [sx - t / 2, sy + dh / 2 - t * 0.35 - t / 2], [sx - t / 2, sy + t * 0.35 + t / 2]]
        // a loose plate: the last minute digit's segment flickers now and then
        let flick = k == 3 && s == 4 ? 0.55 + 0.45 * abs(sin(time * 7)) * (floor(time) % 5 == 0 ? 1 : 0) + (floor(time) % 5 == 0 ? 0 : 0.45) : 1
        if lit {
          path(pts, closed: true, fill: alpha(yellow, 0.9 * flick), stroke: alpha(background, 0.9), width: 2)
          path(pts, closed: true, fill: alpha(foreground, 0.12))
          circle(horiz ? sx + inset + t * 0.55 : sx, horiz ? sy : sy + inset + t * 0.55, t * 0.11, fill: alpha(background, 0.8))
        } else {
          path(pts, closed: true, fill: alpha(foreground, 0.06))
        }
      }
    }
    // the colon: two boomas
    let cx = x0 + dw * 2 + gap * 1.5 + dh * 0.17
    let pulse = 1 + 0.1 * sin(time * 3)
    for y in [top + dh * 0.3, top + dh * 0.7] {
      let r = dh * 0.12 * pulse
      circle(cx, y, r * 3, fill: radial(cx, y, r * 3, [alpha(accent, 0.5), alpha(accent, 0)]))
      circle(cx, y, r, fill: accent, stroke: bright_cyan, width: 1.5)
      circle(cx - r * 0.3, y - r * 0.3, r * 0.3, fill: alpha(foreground, 0.8))
    }
  }
}
