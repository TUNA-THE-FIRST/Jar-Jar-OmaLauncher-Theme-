-- Booma Blast: fling Gungan boomas at stacks of Separatist battle droids. Real rigid-body physics (Box2D).
-- Drag the booma back from the catapult and let go.
if os.getenv("BB_TEST") then function love.errorhandler(msg) print(debug.traceback(msg)); return function() return 1 end end end
local lg, lp = love.graphics, love.physics
local LEVELS = require("levels")

-- ------------------------------------------------------------------ layout
local W, H, S, WW, WH = 540, 1170, 1, 520, 700
local GROUND, SLING_X, SLING_Y, OX = 0, 70, 0, 0
local groundBody
local UNIT = 1.6                      -- the level files are in 300-wide units
local PULL_MAX, LAUNCH_K = 95, 8.2

local ui, UW, UH, barPx = 1, 540, 1170, 150
local makeFonts
local function layout()
  W, H = lg.getDimensions()
  local fk = os.getenv("BB_FAKE")
  if fk then W, H = fk:match("(%d+)x(%d+)"); W, H = tonumber(W), tonumber(H) end
  local oldUi = ui
  ui = math.max(0.6, math.min(W, H) / 540)         -- the interface is drawn in a space 540 units on its short side
  UW, UH = W / ui, H / ui
  barPx = 150 * ui
  S = math.min(W / 540, (H - barPx) / 380)          -- the world: 540 units across, about 380 above the ground
  WW, WH = W / S, H / S
  GROUND = (H - barPx) / S
  OX = math.max(0, (WW - 540) / 2)                  -- wider than that: the playfield sits in the middle
  SLING_X, SLING_Y = 70, GROUND - 105
  if makeFonts and math.abs(oldUi - ui) > 0.001 then makeFonts() end
end

-- ------------------------------------------------------------------ assets
local img, fonts = {}, {}
local function load()
  for _, n in ipairs({ "orb", "droid", "droid_hurt", "d_head", "d_arm", "d_leg", "d_torso", "d_blaster", "jj_body", "jj_talk", "jj_shock", "jj_sorry",
    "jj_stalk", "jj_stalk_far", "jj_frill", "jj_frill_far", "jj_blink", "jj_tongue", "jj_tongue_body", "jj_lip", "jj_jaw", "bg" }) do
    img[n] = lg.newImage("assets/" .. n .. ".png")
    img[n]:setFilter("linear", "linear")
  end
end
function makeFonts()
  for _, sz in ipairs({ 14, 18, 22, 28, 34, 40, 44, 54 }) do fonts[sz] = lg.newFont("assets/LilitaOne-Regular.ttf", sz, "normal", ui) end
end

-- ------------------------------------------------------------------ saved progress and the stats the widget reads
local save = { best = { 0, 0, 0, 0, 0 }, stars = { 0, 0, 0, 0, 0 }, droids = 0, shots = 0, wins = 0, losses = 0, seconds = 0, wood = 0 }
local function serialize(t)
  local parts = {}
  for k, v in pairs(t) do
    if type(v) == "table" then
      local a = {}
      for i, x in ipairs(v) do a[i] = tostring(x) end
      parts[#parts + 1] = k .. "={" .. table.concat(a, ",") .. "}"
    else
      parts[#parts + 1] = k .. "=" .. tostring(v)
    end
  end
  return "return {" .. table.concat(parts, ",") .. "}"
end
local function loadSave()
  if love.filesystem.getInfo("save.lua") then
    local ok, t = pcall(function() return loadstring(love.filesystem.read("save.lua"))() end)
    if ok and type(t) == "table" then for k, v in pairs(t) do save[k] = v end end
  end
end
local function json(v)
  if type(v) == "table" then
    if #v > 0 then
      local a = {}
      for i, x in ipairs(v) do a[i] = json(x) end
      return "[" .. table.concat(a, ",") .. "]"
    end
    local a = {}
    for k, x in pairs(v) do a[#a + 1] = string.format("%q:%s", k, json(x)) end
    return "{" .. table.concat(a, ",") .. "}"
  end
  if type(v) == "string" then return string.format("%q", v) end
  return tostring(v)
end
local function saveAll()
  love.filesystem.write("save.lua", serialize(save))
  local cleared, starsTotal, bestTotal = 0, 0, 0
  for i = 1, #LEVELS do
    if save.stars[i] > 0 then cleared = cleared + 1 end
    starsTotal = starsTotal + save.stars[i]
    bestTotal = bestTotal + save.best[i]
  end
  local home = os.getenv("HOME") or "/root"
  local f = io.open(home .. "/.local/share/booma-blast/stats.json", "w")
  if f then
    f:write(json({
      levels = #LEVELS, cleared = cleared, stars = starsTotal, max_stars = #LEVELS * 3, best_total = bestTotal,
      droids = save.droids, shots = save.shots, wins = save.wins, losses = save.losses, seconds = math.floor(save.seconds),
      level_stars = save.stars, level_best = save.best, last_played = os.time(),
    }))
    f:close()
  end
end

-- ------------------------------------------------------------------ Jar Jar, animated
local jarT = { tap = -10, mood = 0, talk = 0, tongue = false }
local say = { text = "", t = -10 }
local PHRASES = {
  happy = { "Mesa Jar Jar Binks! Mesa your humble servant!", "Okeeday!", "Bombad! Mesa love-sa dis place.", "Yousa want-sa some boomas?", "Wesa friends, yes? Yes?",
    "Boom, boom, boom! Mesa love-sa da booma!", "Mesa tink yousa very smart!", "Mesa found a droid arm! Dis is mine now.", "Wesa in da swampy swamp!", "Mesa try-a again!" },
  shock = { "Yousa in big doodoo now!", "How wude!", "Wesa gonna die-en here!", "Oie, dat was-a close!", "Whoa! Mesa slip-sa on a droid head!", "Hey, yousa poked me!",
    "Whoopsie-doodle!", "Hmm... mesa smell-a trouble.", "Oh no, no, no, no, NO!", "Wesa gonna need-a bigger boomas!", "Dat droid, he lookin' at me funny." },
  sorry = { "Mesa so sorry!", "Mesa no touch it, mesa swear!", "The droids, dey broke-ed.", "Ouchie ouch! Mesa ears-a hurt!", "Mesa so hungry. Got any wibbly worms?",
    "Dat was-a not me! ...Was-a me.", "Mesa no like da dark.", "Mesa stepped on sumting squishy." },
}
local function speak(kind)
  local list = PHRASES[kind]
  say.text = list[love.math.random(#list)]
  say.t = love.timer.getTime()
  jarT.tap = love.timer.getTime()
  jarT.mood = kind == "happy" and 0 or kind == "shock" and 1 or 2
  jarT.tongue = kind ~= "sorry" and love.math.random() < 0.45
  jarT.talk = 0.5 + #say.text * 0.05
  if os.getenv("BB_TONGUE") then jarT.tongue = true end
end

local function rad(d) return d * math.pi / 180 end
-- (x, y) is the figure's top left at scale s; he is 300 x 350 units.
local function drawJar(x, y, s, mood, talkOverride)
  local t = love.timer.getTime()
  local dt = t - jarT.tap
  local sc = s / 2                               -- sprites are 2x
  local flap = (dt >= 0 and dt < 1.4) and math.sin(dt * 17) * 14 * (1 - dt / 1.4) ^ 2 or 0
  local sq = (dt >= 0 and dt < 0.5) and math.sin(dt * 20) * 0.07 * (1 - dt / 0.5) or 0
  local talking = talkOverride or (dt >= 0 and dt < jarT.talk)
  local hop = (dt >= 0 and dt < 0.7) and math.sin(dt / 0.7 * math.pi) * 14 * s or 0
  local by = y - hop
  local jb = by + 30 * s
  local jx, jy = x + 150 * s, jb + 318 * s
  local tilt = math.sin(t * 0.9) * 1.1 + flap * 0.1
  local breath = 1 + math.sin(t * 1.6) * 0.007 + sq
  local a1 = -8 + math.sin(t * 1.9) * 3.2 + math.sin(t * 4.3) * 0.8 - flap * 0.9
  local a2 = 6 + math.sin(t * 2.3 + 1.2) * 3.2 + math.sin(t * 3.7) * 0.8 + flap
  local af = 7 + math.sin(t * 1.7 - 0.8) * 3 + flap * 0.4
  local af2 = 26 + math.sin(t * 1.5 + 0.6) * 3.4 + flap * 0.5
  local tongueOut = jarT.tongue and dt >= 0 and dt < jarT.talk + 1.8 and mood ~= 2
  local body = tongueOut and img.jj_tongue_body or ((talking and math.floor(t * 9) % 2 == 0) and img.jj_talk or (mood == 1 and img.jj_shock or mood == 2 and img.jj_sorry or img.jj_body))
  lg.setColor(1, 1, 1)
  lg.push()
  lg.translate(jx, jy); lg.rotate(rad(tilt)); lg.scale(1 - sq * 0.6, breath); lg.translate(-jx, -jy)
  lg.draw(img.jj_frill_far, x + 166 * s, jb + 108 * s, rad(af2), sc, sc, 86 * 2, 24 * 2)
  lg.draw(img.jj_frill, x + 126 * s, jb + 114 * s, rad(af), sc, sc, 86 * 2, 24 * 2)
  lg.draw(img.jj_stalk_far, x + 130 * s, jb + 106 * s, rad(a1), sc, sc, 40 * 2, 120 * 2)
  lg.draw(img.jj_stalk, x + 163 * s, jb + 104 * s, rad(a2), sc, sc, 40 * 2, 120 * 2)
  lg.draw(body, x, jb, 0, sc, sc)
  local bt = t % 3.7
  local lid = bt < 0.18 and math.sin(bt / 0.18 * math.pi) or 0
  if lid > 0.05 then
    for _, e in ipairs({ { 130, 106, a1 }, { 163, 104, a2 } }) do
      local ex = x + e[1] * s + math.sin(rad(e[3])) * 90 * s
      local ey = jb + e[2] * s - math.cos(rad(e[3])) * 90 * s
      lg.draw(img.jj_blink, ex, ey, 0, sc, sc * lid, 25 * 2, 25 * 2)
    end
  end
  if tongueOut then
    local tin = math.min(1, dt / 0.28)
    local e = 1 + 2.70158 * (tin - 1) ^ 3 + 1.70158 * (tin - 1) ^ 2
    local p = math.min(e, math.max(0, math.min(1, (jarT.talk + 1.8 - dt) / 0.3)))
    local tx, ty = x + 279 * s, jb + 181 * s
    lg.push()
    lg.translate(-(1 - p) * 50 * s, 0)
    lg.translate(tx, ty); lg.rotate(rad(math.sin(t * 14) * 9 * p)); lg.scale(p * (1 + math.sin(t * 9) * 0.05), p); lg.translate(-tx, -ty)
    lg.draw(img.jj_tongue, x, jb, 0, sc, sc)
    lg.pop()
    lg.draw(img.jj_lip, x, jb, 0, sc, sc)
    lg.draw(img.jj_jaw, x, jb, 0, sc, sc)
  end
  lg.pop()
end

-- ------------------------------------------------------------------ the game world
local state = "menu"        -- menu | play
local world, bodies, orb, parts, popups
local lvl, orbsLeft, killed, woodBroken, phase, phaseT, calm, overlay, shotAge
local drag, pull = false, { 0, 0 }
local button = {}           -- clickable regions of the current screen

local KIND = {
  droid = { dens = 0.5, fric = 0.6, rest = 0.05, hp = 1, thr = 150, div = 300 },
  wood = { dens = 1, fric = 0.7, rest = 0.1, hp = 1, thr = 170, div = 480 },
  stone = { dens = 3, fric = 0.9, rest = 0.05, hp = 1, thr = 280, div = 2500 },
}
local KINDS = { [0] = "droid", [1] = "wood", [2] = "stone" }

local function damage(fa, fb)
  local a, b = fa:getUserData(), fb:getUserData()
  if not a or not b then return end
  local va, vb = a.body, b.body
  local ax, ay = va:getLinearVelocity()
  local bx, by = vb:getLinearVelocity()
  local rel = math.sqrt((ax - bx) ^ 2 + (ay - by) ^ 2)
  for _, o in ipairs({ a, b }) do
    local k = KIND[o.kind]
    if k and not o.dead then
      local other = (o == a) and b or a
      local boost = other.kind == "orb" and 1.5 or 1
      local d = math.max(0, rel * boost - k.thr) / k.div
      o.hp = o.hp - d
      if d > 0.05 then o.hurt = true end
    end
  end
end

local function spawnPiece(img_, x, y, vx, vy, w, h, life)
  parts[#parts + 1] = { img = img_, x = x, y = y, vx = vx, vy = vy, r = love.math.random() * 6, vr = (love.math.random() - 0.5) * 14, w = w, h = h, age = 0, life = life or 1.6 }
end

local function destroy(o)
  o.dead = true
  local x, y = o.body:getPosition()
  if o.kind == "droid" then
    killed = killed + 1
    save.droids = save.droids + 1
    local pieces = { { img.d_head, 28, 44 }, { img.d_arm, 12, 52 }, { img.d_leg, 16, 58 }, { img.d_torso, 30, 40 } }
    for _, p in ipairs(pieces) do
      spawnPiece(p[1], x, y, (love.math.random() - 0.4) * 320, -140 - love.math.random() * 260, p[2] * UNIT, p[3] * UNIT)
    end
    popups[#popups + 1] = { text = "+5000", x = x, y = y - 40, age = 0 }
    speak("shock")
  else
    woodBroken = woodBroken + (o.kind == "wood" and 1 or 0)
    save.wood = save.wood + (o.kind == "wood" and 1 or 0)
    for i = 1, 5 do
      parts[#parts + 1] = { rect = true, kind = o.kind, x = x, y = y, vx = (love.math.random() - 0.5) * 360, vy = -100 - love.math.random() * 240, r = 0, vr = (love.math.random() - 0.5) * 16, w = 16, h = 7, age = 0, life = 1.2 }
    end
  end
  o.body:destroy()
end

local function newBody(kind, x, y, w, h)
  local k = KIND[kind]
  local b = lp.newBody(world, x, y, "dynamic")
  local shape = lp.newRectangleShape(kind == "droid" and w * 0.8 or w, h)
  local f = lp.newFixture(b, shape, k.dens)
  f:setFriction(k.fric); f:setRestitution(k.rest)
  local o = { kind = kind, body = b, fixture = f, w = w, h = h, hp = k.hp }
  f:setUserData(o)
  o.body = b
  bodies[#bodies + 1] = o
  return o
end

local function startLevel(i)
  lvl = i
  state = "play"
  layout()
  love.physics.setMeter(64)
  world = lp.newWorld(0, 900, true)
  world:setCallbacks(function(a, b) damage(a, b) end)
  bodies, parts, popups = {}, {}, {}
  local g = lp.newBody(world, 0, GROUND + 60, "static")
  groundBody = g
  local gf = lp.newFixture(g, lp.newRectangleShape(WW * 2 + 4000, 120), 1)
  gf:setFriction(0.9)
  gf:setUserData({ kind = "ground", body = g })
  for _, t in ipairs(LEVELS[i].b) do
    newBody(KINDS[t[1]], SLING_X + (t[2] - 45) * UNIT, GROUND - t[3] * UNIT, t[4] * UNIT, t[5] * UNIT)
  end
  for _ = 1, 150 do world:update(1 / 60) end
  for _, o in ipairs(bodies) do o.hp = KIND[o.kind].hp; o.hurt = false end
  orbsLeft, killed, woodBroken = LEVELS[i].orbs, 0, 0
  phase, phaseT, overlay, orb, calm = "ready", 0, nil, nil, 0
  drag, pull = false, { 0, 0 }
  say.t = -10
  orb = { x = SLING_X, y = SLING_Y }
end

local function readyOrb()
  if orb and orb.body and not orb.body:isDestroyed() then return end
  orb = { x = SLING_X, y = SLING_Y }
end

local function anyDroids()
  for _, o in ipairs(bodies) do if o.kind == "droid" and not o.dead then return true end end
  return false
end

local function launch()
  local vx, vy = pull[1] * LAUNCH_K, pull[2] * LAUNCH_K
  local b = lp.newBody(world, orb.x, orb.y, "dynamic")
  b:setBullet(true)
  local f = lp.newFixture(b, lp.newCircleShape(15), 4)
  f:setRestitution(0.3); f:setFriction(0.6)
  local o = { kind = "orb", body = b, hp = 1e9 }
  f:setUserData(o)
  b:setLinearVelocity(vx, vy)
  orb = { body = b, o = o, age = 0, trail = {} }
  orbsLeft = orbsLeft - 1
  save.shots = save.shots + 1
  phase, phaseT, shotAge = "flying", 0, 0
  pull = { 0, 0 }
  speak("shock")
end

local function finishLevel(win)
  phase = win and "win" or "lose"
  if win then
    local stars = orbsLeft >= 2 and 3 or orbsLeft == 1 and 2 or 1
    local score = killed * 5000 + woodBroken * 500 + orbsLeft * 2000
    overlay = { win = true, stars = stars, score = score, t = love.timer.getTime() }
    save.wins = save.wins + 1
    save.best[lvl] = math.max(save.best[lvl], score)
    save.stars[lvl] = math.max(save.stars[lvl], stars)
    speak("happy")
  else
    overlay = { win = false, t = love.timer.getTime() }
    save.losses = save.losses + 1
    speak("sorry")
  end
  saveAll()
end

-- ------------------------------------------------------------------ update
local function calmEnough()
  for _, o in ipairs(bodies) do
    if not o.dead then
      local vx, vy = o.body:getLinearVelocity()
      if vx * vx + vy * vy > 400 then return false end
    end
  end
  return true
end

local function step(dt)
  world:update(dt)
  -- break what took too much
  for i = #bodies, 1, -1 do
    local o = bodies[i]
    if not o.dead and o.hp <= 0 and o.kind ~= "stone" then
      destroy(o)
      table.remove(bodies, i)
    elseif o.dead then
      table.remove(bodies, i)
    end
  end
  for i = #parts, 1, -1 do
    local p = parts[i]
    p.age = p.age + dt
    p.vy = p.vy + 900 * dt
    p.x, p.y, p.r = p.x + p.vx * dt, p.y + p.vy * dt, p.r + p.vr * dt
    if p.age > p.life then table.remove(parts, i) end
  end
  for i = #popups, 1, -1 do
    popups[i].age = popups[i].age + dt
    if popups[i].age > 1.3 then table.remove(popups, i) end
  end
  phaseT = phaseT + dt
  if phase == "ready" then
    readyOrb()
  elseif phase == "flying" then
    shotAge = shotAge + dt
    local b = orb.body
    local x, y = b:getPosition()
    local vx, vy = b:getLinearVelocity()
    orb.trail[#orb.trail + 1] = { x, y }
    if #orb.trail > 14 then table.remove(orb.trail, 1) end
    local slow = vx * vx + vy * vy < 600
    if shotAge > 9 or x > WW + 200 or y > WH + 200 or (shotAge > 1.2 and slow) then
      b:destroy()
      orb = nil
      phase, phaseT, calm = "settle", 0, 0
    end
  elseif phase == "settle" then
    if calmEnough() then calm = calm + dt else calm = 0 end
    if calm > 0.7 or phaseT > 5 then
      if not anyDroids() then finishLevel(true)
      elseif orbsLeft <= 0 then finishLevel(false)
      else phase = "ready"; readyOrb() end
    end
  end
  if phase ~= "win" and phase ~= "lose" and not anyDroids() and phase ~= "ready" then
    -- all droids down while something still flies: wait for the settle
  end
end

local acc = 0
function love.update(dt)
  save.seconds = save.seconds + dt
  if state ~= "play" then return end
  acc = acc + math.min(dt, 0.25)
  local n = 0
  while acc >= 1 / 60 and n < 15 do step(1 / 60); acc = acc - 1 / 60; n = n + 1 end
  if n >= 15 then acc = 0 end
end

-- ------------------------------------------------------------------ drawing
local function text(str, x, y, size, color, align, w)
  lg.setFont(fonts[size])
  lg.setColor(0, 0, 0, 0.55)
  lg.printf(str, x + 2, y + 2, w or 1000, align or "left")
  lg.setColor(color or { 1, 1, 1 })
  lg.printf(str, x, y, w or 1000, align or "left")
end

local function plate(label, x, y, w, h, tint, id)
  lg.setColor(tint[1], tint[2], tint[3], 0.92)
  lg.rectangle("fill", x, y, w, h, h / 2, h / 2)
  lg.setColor(0.92, 0.95, 0.9, 0.6)
  lg.setLineWidth(2)
  lg.rectangle("line", x, y, w, h, h / 2, h / 2)
  text(label, x, y + h / 2 - fonts[22]:getHeight() / 2, 22, { 0.95, 0.98, 0.94 }, "center", w)
  button[#button + 1] = { x = x, y = y, w = w, h = h, id = id }
end

local function star(x, y, r, on)
  local pts = {}
  for i = 0, 9 do
    local rr = (i % 2 == 0) and r or r * 0.42
    local a = -math.pi / 2 + i * math.pi / 5
    pts[#pts + 1] = x + math.cos(a) * rr
    pts[#pts + 1] = y + math.sin(a) * rr
  end
  if on then lg.setColor(0.86, 0.74, 0.42) else lg.setColor(1, 1, 1, 0.12) end
  lg.polygon("fill", pts)
  lg.setColor(on and { 0.72, 0.5, 0.3 } or { 1, 1, 1, 0.22 })
  lg.setLineWidth(2)
  lg.polygon("line", pts)
end

local function background()
  local iw, ih = img.bg:getDimensions()
  local sc = math.max(W / iw, H / ih)
  lg.setColor(1, 1, 1)
  lg.draw(img.bg, (W - iw * sc) / 2, H - ih * sc, 0, sc, sc)
  lg.setColor(0.03, 0.07, 0.07, 0.25)
  lg.rectangle("fill", 0, 0, W, H)
end

local function drawBlock(o)
  local b = o.body
  local x, y = b:getPosition()
  lg.push()
  lg.translate(x, y); lg.rotate(b:getAngle())
  local w, h = o.w, o.h
  if o.kind == "droid" then
    local im = o.hurt and img.droid_hurt or img.droid
    local th = h * 1.08
    local sc = th / (268 * 3)
    lg.setColor(1, 1, 1)
    lg.draw(im, 0, 0, 0, sc, sc, 150, 134 * 3)
  elseif o.kind == "wood" then
    lg.setColor(0.48, 0.35, 0.23)
    lg.rectangle("fill", -w / 2, -h / 2, w, h, 3, 3)
    lg.setColor(0.79, 0.63, 0.44, 0.5)
    lg.rectangle("fill", -w / 2 + 3, -h / 2 + 3, w - 6, 3)
    lg.setColor(0.23, 0.16, 0.1, 0.55)
    lg.setLineWidth(1.5)
    if h > w then for j = 1, math.floor(h / 22) do lg.line(-w / 2 + 3, -h / 2 + j * 22, w / 2 - 3, -h / 2 + j * 22) end
    else for j = 1, math.floor(w / 22) do lg.line(-w / 2 + j * 22, -h / 2 + 3, -w / 2 + j * 22, h / 2 - 3) end end
    if math.abs(w - h) < 1 then lg.line(-w / 2 + 4, -h / 2 + 4, w / 2 - 4, h / 2 - 4); lg.line(w / 2 - 4, -h / 2 + 4, -w / 2 + 4, h / 2 - 4) end
    lg.setColor(0.14, 0.1, 0.06)
    lg.setLineWidth(2.5)
    lg.rectangle("line", -w / 2, -h / 2, w, h, 3, 3)
  else
    lg.setColor(0.43, 0.5, 0.47)
    lg.rectangle("fill", -w / 2, -h / 2, w, h, 4, 4)
    lg.setColor(0.66, 0.73, 0.7, 0.5)
    lg.rectangle("fill", -w / 2 + 3, -h / 2 + 3, w - 6, 4)
    lg.setColor(0.3, 0.48, 0.3, 0.8)
    lg.circle("fill", -w * 0.15, h * 0.15, 5); lg.circle("fill", w * 0.2, -h * 0.1, 3.5)
    lg.setColor(0.17, 0.21, 0.19)
    lg.setLineWidth(3)
    lg.rectangle("line", -w / 2, -h / 2, w, h, 4, 4)
  end
  lg.pop()
end

local function drawField()
  button = {}
  background()
  lg.push()
  lg.scale(S, S)
  lg.translate(OX, 0)
  -- ground
  lg.setColor(0.063, 0.125, 0.1)
  lg.rectangle("fill", -OX - 10, GROUND, WW + 20, WH - GROUND + 10)
  lg.setColor(0.18, 0.35, 0.24)
  lg.rectangle("fill", -OX - 10, GROUND, WW + 20, 18)
  lg.setColor(0.23, 0.44, 0.28)
  for i = math.floor(-OX / 18), math.floor((WW - OX) / 18) do
    local gx = i * 18
    lg.polygon("fill", gx, GROUND, gx + 4, GROUND - 7 - ((i * 7) % 5), gx + 9, GROUND)
  end
  -- the catapult, back fork first
  local ax, ay = SLING_X, SLING_Y
  local ox, oy = ax, ay
  if drag then ox, oy = ax - pull[1], ay - pull[2] end
  lg.setLineStyle("smooth")
  lg.setLineWidth(12); lg.setColor(0.31, 0.22, 0.14)
  lg.line(ax, GROUND, ax - 2, GROUND - 52); lg.line(ax - 2, GROUND - 52, ax - 18, ay - 4)
  if drag then lg.setLineWidth(5); lg.setColor(0.17, 0.29, 0.22); lg.line(ax - 18, ay - 4, ox, oy) end
  -- the booma waiting (or being pulled)
  if phase == "ready" and orb and not orb.body then
    lg.setColor(1, 1, 1)
    local sc = 34 / (100 * 3) * 1.2
    lg.setColor(0.4, 0.7, 1, 0.22); lg.circle("fill", ox, oy, 30)
    lg.setColor(1, 1, 1); lg.draw(img.orb, ox, oy, 0, 34 / 300 * 1.0, 34 / 300 * 1.0, 150, 150)
  end
  lg.setLineWidth(12); lg.setColor(0.48, 0.35, 0.23)
  lg.line(ax, GROUND, ax - 2, GROUND - 52); lg.setColor(0.6, 0.46, 0.31); lg.line(ax - 2, GROUND - 52, ax + 16, ay + 2)
  if drag then lg.setLineWidth(5); lg.setColor(0.23, 0.42, 0.29); lg.line(ax + 16, ay + 2, ox, oy) end
  -- aim guide: where it would go
  if drag and (pull[1] ^ 2 + pull[2] ^ 2) > 400 then
    local vx, vy = pull[1] * LAUNCH_K, pull[2] * LAUNCH_K
    for i = 1, 16 do
      local t = i * 0.085
      local gx, gy = ox + vx * t, oy + vy * t + 0.5 * 900 * t * t
      lg.setColor(0.5, 0.88, 0.92, 0.8 - i * 0.04)
      lg.circle("fill", gx, gy, 4.5 - i * 0.18)
    end
  end
  -- the stack
  for _, o in ipairs(bodies) do if not o.dead then drawBlock(o) end end
  -- the booma in flight
  if orb and orb.body then
    for i, p in ipairs(orb.trail) do
      lg.setColor(0.5, 0.88, 0.92, i / #orb.trail * 0.3)
      lg.circle("fill", p[1], p[2], 13 * i / #orb.trail)
    end
    local x, y = orb.body:getPosition()
    lg.setColor(0.4, 0.7, 1, 0.22); lg.circle("fill", x, y, 36)
    lg.setColor(1, 1, 1); lg.draw(img.orb, x, y, orb.body:getAngle(), 32 / 300 * 1.0, 32 / 300 * 1.0, 150, 150)
  end
  for _, p in ipairs(parts) do
    local a = 1 - p.age / p.life
    if p.rect then
      if p.kind == "wood" then lg.setColor(0.48, 0.35, 0.23, a) else lg.setColor(0.43, 0.5, 0.47, a) end
      lg.push(); lg.translate(p.x, p.y); lg.rotate(p.r); lg.rectangle("fill", -p.w / 2, -p.h / 2, p.w, p.h); lg.pop()
    else
      lg.setColor(1, 1, 1, a)
      local iw, ih = p.img:getDimensions()
      lg.draw(p.img, p.x, p.y, p.r, p.w / iw, p.h / ih, iw / 2, ih / 2)
    end
  end
  for _, p in ipairs(popups) do
    text(p.text, p.x - 60, p.y - p.age * 50, 28, { 0.86, 0.74, 0.42, 1 - p.age / 1.3 }, "center", 120)
  end
  lg.pop()

  -- the interface, in its own units
  lg.push()
  lg.scale(ui)
  local barY = UH - 150
  lg.setColor(0.03, 0.06, 0.06, 0.55)
  lg.rectangle("fill", 0, barY, UW, 150)
  for i = 1, orbsLeft do
    lg.setColor(1, 1, 1)
    lg.draw(img.orb, UW - 40 - (i - 1) * 46, barY + 75, 0, 0.19, 0.19, 150, 150)
  end
  local js = 150 * 1.1 / 350
  drawJar(8, barY - 14, js, jarT.mood)
  if love.timer.getTime() - say.t < 3.2 and say.text ~= "" then
    local bx = 8 + 190 * js
    local bw = math.min(UW - 8 - 190 * js - 12 - orbsLeft * 46 - 20, 360)
    if bw > 120 then
      lg.setColor(0.05, 0.1, 0.1, 0.88)
      lg.rectangle("fill", bx, barY + 36, bw, 78, 18, 18)
      lg.setColor(0.31, 0.65, 0.84)
      lg.setLineWidth(2)
      lg.rectangle("line", bx, barY + 36, bw, 78, 18, 18)
      lg.setFont(fonts[18])
      lg.setColor(0.92, 0.96, 0.9)
      lg.printf(say.text, bx + 12, barY + 44, bw - 24, "center")
    end
  end
  text(LEVELS[lvl].name, 18, 14, 28, { 0.92, 0.96, 0.9 }, "left", UW - 200)
  local score = killed * 5000 + woodBroken * 500
  text(string.format("%d", score), 18, 50, 22, { 0.86, 0.74, 0.42 }, "left", 300)
  plate("MENU", UW - 130, 14, 116, 44, { 0.3, 0.38, 0.38 }, "menu")
  if overlay then
    lg.setColor(0.03, 0.06, 0.06, 0.74)
    lg.rectangle("fill", 0, 0, UW, UH)
    local ch = 440
    local cw = math.min(UW - 40, 420)
    local cx, cy = (UW - cw) / 2, math.max(10, UH / 2 - ch / 2 - 20)
    lg.setColor(0.09, 0.15, 0.15, 0.97)
    lg.rectangle("fill", cx, cy, cw, ch, 30, 30)
    lg.setColor(overlay.win and { 0.42, 0.71, 0.92 } or { 0.69, 0.34, 0.35 })
    lg.setLineWidth(3)
    lg.rectangle("line", cx, cy, cw, ch, 30, 30)
    text(overlay.win and "DROIDS DOWN!" or "WESA DOOMED!", cx, cy + 22, 40, overlay.win and { 0.42, 0.71, 0.92 } or { 0.8, 0.45, 0.46 }, "center", cw)
    if overlay.win then
      for i = 1, 3 do star(cx + cw / 2 + (i - 2) * 70, cy + 120, 30, i <= overlay.stars) end
      text(tostring(overlay.score), cx, cy + 170, 40, { 0.86, 0.74, 0.42 }, "center", cw)
    else
      text("droids still standing", cx, cy + 110, 22, { 0.5, 0.62, 0.58 }, "center", cw)
    end
    plate("TRY AGAIN", cx + 40, cy + 250, cw - 80, 52, { 0.3, 0.38, 0.38 }, "retry")
    if overlay.win and lvl < #LEVELS then plate("NEXT LEVEL", cx + 40, cy + 314, cw - 80, 52, { 0.31, 0.65, 0.84 }, "next") end
    plate("MENU", cx + 40, cy + (overlay.win and lvl < #LEVELS and 378 or 314), cw - 80, 52, { 0.18, 0.25, 0.25 }, "menu")
  end
  lg.pop()
end

local function drawMenu()
  button = {}
  background()
  lg.setColor(0.03, 0.06, 0.06, 0.35)
  lg.rectangle("fill", 0, 0, W, H)
  lg.push()
  lg.scale(ui)
  local land = UW > UH * 1.15
  local leftW = land and UW * 0.46 or UW
  text("BOOMA BLAST", 0, land and 24 or 36, land and 44 or 54, { 0.42, 0.71, 0.92 }, "center", leftW)
  text("knock over the droids, mesa beg you", 0, land and 80 or 100, 18, { 0.89, 0.64, 0.69 }, "center", leftW)
  local js, jy
  if land then js = math.min(leftW / 380, (UH - 130) / 350); jy = 112 else js = math.min(UW / 420, (UH * 0.34) / 350); jy = 150 end
  drawJar(leftW / 2 - 150 * js, jy, js, 0, false)
  local lx, lw, y0, avail
  if land then lx, lw, y0, avail = leftW + 10, UW - leftW - 34, 20, UH - 76 else lx, lw, y0, avail = 24, UW - 48, 150 + 350 * js + 24, UH - (150 + 350 * js + 24) - 80 end
  local rowH = math.max(36, math.min(78, avail / #LEVELS - 4))
  for i, l in ipairs(LEVELS) do
    local open = i == 1 or save.stars[i - 1] > 0
    local y = y0 + (i - 1) * (rowH + 4)
    lg.setColor(0.09, 0.15, 0.15, 0.92)
    lg.rectangle("fill", lx, y, lw, rowH, rowH / 2, rowH / 2)
    lg.setColor(open and { 0.31, 0.65, 0.84 } or { 0.2, 0.3, 0.3 })
    lg.setLineWidth(2)
    lg.rectangle("line", lx, y, lw, rowH, rowH / 2, rowH / 2)
    text(tostring(i), lx + 22, y + rowH / 2 - fonts[28]:getHeight() / 2, 28, open and { 0.42, 0.71, 0.92 } or { 0.4, 0.5, 0.5 }, "left", 60)
    text(l.name, lx + 62, y + rowH / 2 - fonts[22]:getHeight() / 2, 22, open and { 0.9, 0.95, 0.88 } or { 0.4, 0.5, 0.5 }, "left", lw - 200)
    for s2 = 1, 3 do star(lx + lw - 92 + (s2 - 1) * 28 + 14, y + rowH / 2, 11, save.stars[i] >= s2) end
    if open then button[#button + 1] = { x = lx, y = y, w = lw, h = rowH, id = "level", n = i } end
  end
  local total = 0
  for i = 1, #LEVELS do total = total + save.stars[i] end
  text(string.format("%d / %d stars   ·   %d droids scrapped", total, #LEVELS * 3, save.droids), land and leftW + 10 or 0, UH - 50, 18, { 0.5, 0.62, 0.58 }, "center", land and UW - leftW - 34 or UW)
  lg.pop()
end

function love.draw()
  if state == "menu" then drawMenu() else drawField() end
end

-- ------------------------------------------------------------------ input
local function hit(x, y)
  x, y = x / ui, y / ui
  for _, b in ipairs(button) do
    if x >= b.x and x <= b.x + b.w and y >= b.y and y <= b.y + b.h then return b end
  end
end

function love.mousepressed(x, y)
  local b = hit(x, y)
  if b then
    if b.id == "level" then startLevel(b.n)
    elseif b.id == "retry" then startLevel(lvl)
    elseif b.id == "next" then startLevel(lvl + 1)
    elseif b.id == "menu" then state = "menu"; love.window.setTitle("Booma Blast"); say.t = -10
    end
    return
  end
  if state == "menu" then
    speak(love.math.random() < 0.5 and "happy" or "shock")
    return
  end
  if state == "play" and phase == "ready" and orb and not orb.body and not overlay then
    local wx, wy = x / S - OX, y / S
    if (wx - SLING_X) ^ 2 + (wy - SLING_Y) ^ 2 < 90 ^ 2 then drag = true; love.mousemoved(x, y) end
  end
end

function love.mousemoved(x, y)
  if not drag then return end
  local wx, wy = x / S - OX, y / S
  local dx, dy = SLING_X - wx, SLING_Y - wy
  local len = math.sqrt(dx * dx + dy * dy)
  if len > PULL_MAX then dx, dy = dx * PULL_MAX / len, dy * PULL_MAX / len end
  if SLING_Y - dy > GROUND - 16 then dy = SLING_Y - (GROUND - 16) end
  pull = { dx, dy }
  orb.x, orb.y = SLING_X - dx, SLING_Y - dy
end

function love.mousereleased()
  if not drag then return end
  drag = false
  if pull[1] ^ 2 + pull[2] ^ 2 > 20 * 20 and pull[1] > -10 then
    launch()
  else
    pull = { 0, 0 }
  end
end

function love.resize()
  local ow, oh = W, H
  layout()
  if state == "play" and (math.abs(ow - W) > 2 or math.abs(oh - H) > 2) then startLevel(lvl) end
end

function love.keypressed(k)
  if k == "escape" then
    if state == "play" then state = "menu" else love.event.quit() end
  end
end

function love.quit() saveAll() end

-- ------------------------------------------------------------------ start, and a hook for taking pictures
function love.load()
  love.math.setRandomSeed(os.time())
  load(); layout(); makeFonts(); loadSave()
  love.filesystem.createDirectory("")
  os.execute("mkdir -p '" .. (os.getenv("HOME") or "/root") .. "/.local/share/booma-blast'")
  saveAll()
  local test = os.getenv("BB_TEST")
  if test then
    -- BB_TEST="level;pullx;pully;frame,frame,..."  fires one shot and writes shots/<frame>.png
    local l, px, py, frames = test:match("([^;]*);([^;]*);([^;]*);(.*)")
    if l == "menu" then state = "menu"; if os.getenv("BB_TONGUE") then speak("happy") end elseif l == "win" then startLevel(1); killed = 2; orbsLeft = 2; finishLevel(true) elseif l == "lose" then startLevel(2); finishLevel(false) else startLevel(tonumber(l)) end
    if tonumber(px) then
      drag = true; pull = { tonumber(px), -tonumber(py) }; orb.x, orb.y = SLING_X - pull[1], SLING_Y - pull[2]
      TEST = { frames = {}, n = 0, launchAt = 20 }
      for f in frames:gmatch("%d+") do TEST.frames[tonumber(f)] = true end
    else
      TEST = { frames = {}, n = 0, launchAt = -1 }
      for f in frames:gmatch("%d+") do TEST.frames[tonumber(f)] = true end
    end
  end
end

local oldDraw = love.draw
local fakeCanvas
function love.draw()
  if os.getenv("BB_FAKE") then
    fakeCanvas = fakeCanvas or lg.newCanvas(W, H)
    lg.setCanvas(fakeCanvas); lg.clear(0, 0, 0, 1); oldDraw(); lg.setCanvas()
    lg.setColor(1, 1, 1); lg.draw(fakeCanvas, 0, 0, 0, 0.4, 0.4)
  else
    oldDraw()
  end
  if TEST then
    TEST.n = TEST.n + 1
    if TEST.n == TEST.launchAt then love.mousereleased() end
    if TEST.frames[TEST.n] then
      if fakeCanvas then fakeCanvas:newImageData():encode("png", "shot" .. TEST.n .. ".png") else lg.captureScreenshot("shot" .. TEST.n .. ".png") end
    end
    if TEST.n > 0 and TEST.n >= (function() local m = 0; for f in pairs(TEST.frames) do m = math.max(m, f) end; return m end)() + 2 then love.event.quit() end
  end
end
