function love.conf(t)
  t.identity = "booma-blast"
  t.version = "11.5"
  t.window.title = "Booma Blast"
  t.window.width = tonumber(os.getenv("BB_W")) or 540
  t.window.height = tonumber(os.getenv("BB_H")) or 1170
  t.window.resizable = true
  t.window.vsync = 1
  t.window.msaa = 4
  t.modules.joystick = false
  t.modules.video = false
end
