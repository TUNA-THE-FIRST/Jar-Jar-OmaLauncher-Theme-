// Jar Jar, inside a Canvas. Wants s (scale: he is 350 units tall), bx and by (his top left), jmood (0 happy, 1 shocked,
// 2 sorry), jtalk (flap the jaw), jflap (degrees of startled wobble), jsq (squash and stretch) and jtp (how far the tongue is out, 0 to 1).
// Everything sits inside one group that breathes and sways, so the parts never drift apart.
let jb = by + 30 * s
let jx = bx + 98 * s
let jy = jb + 318 * s
let tilt = sin(time * 0.9) * 1.1 + jflap * 0.1
let breath = 1 + sin(time * 1.6) * 0.007 + jsq
let squeeze = 1 - jsq * 0.6
let a1 = -8 + sin(time * 1.9) * 3.2 + sin(time * 4.3) * 0.8 - jflap * 0.9
let a2 = 6 + sin(time * 2.3 + 1.2) * 3.2 + sin(time * 3.7) * 0.8 + jflap
let af = 7 + sin(time * 1.7 - 0.8) * 3 + jflap * 0.4
let af2 = 26 + sin(time * 1.5 + 0.6) * 3.4 + jflap * 0.5
let pose = jtp > 0.02 && jmood != 2 ? 4 : jtalk && floor(time * 9) % 2 == 0 ? 3 : jmood
let bt = time % 3.7
let lid = bt < 0.18 ? sin(bt / 0.18 * 3.1416) : 0
rotate(tilt, jx, jy) {
  scale(squeeze, breath, jx, jy) {
    rotate(af2, bx + 166 * s, jb + 108 * s) { image(jj_ear_far, bx + 166 * s - 86 * s, jb + 108 * s - 24 * s, 120 * s, 276 * s) }
    rotate(af, bx + 126 * s, jb + 114 * s) { image(jj_ear, bx + 126 * s - 86 * s, jb + 114 * s - 24 * s, 120 * s, 276 * s) }
    rotate(a1, bx + 130 * s, jb + 106 * s) { image(jj_stalk_far, bx + 130 * s - 40 * s, jb + 106 * s - 120 * s, 80 * s, 130 * s) }
    rotate(a2, bx + 163 * s, jb + 104 * s) { image(jj_stalk, bx + 163 * s - 40 * s, jb + 104 * s - 120 * s, 80 * s, 130 * s) }
    image([jj_body, jj_body_shock, jj_body_sorry, jj_body_talk, jj_body_tongue][pose], bx, jb, 300 * s, 320 * s)
    if lid > 0.05 {
      scale(1, lid, bx + 130 * s + sin(rad(a1)) * 90 * s, jb + 106 * s - cos(rad(a1)) * 90 * s) {
        image(jj_blink, bx + 130 * s + sin(rad(a1)) * 90 * s - 25 * s, jb + 106 * s - cos(rad(a1)) * 90 * s - 25 * s, 50 * s, 50 * s)
      }
      scale(1, lid, bx + 163 * s + sin(rad(a2)) * 90 * s, jb + 104 * s - cos(rad(a2)) * 90 * s) {
        image(jj_blink, bx + 163 * s + sin(rad(a2)) * 90 * s - 25 * s, jb + 104 * s - cos(rad(a2)) * 90 * s - 25 * s, 50 * s, 50 * s)
      }
    }
    if jtp > 0.02 {
      let tx = bx + 279 * s
      let ty = jb + 181 * s
      translate(-(1 - jtp) * 50 * s, 0) {
        rotate(sin(time * 14) * 9 * jtp, tx, ty) {
          scale(jtp * (1 + sin(time * 9) * 0.05), jtp, tx, ty) { image(jj_tongue, bx, jb, 300 * s, 320 * s) }
        }
      }
      image(jj_lip, bx, jb, 300 * s, 320 * s)
      image(jj_jaw, bx, jb, 300 * s, 320 * s)
    }
  }
}
