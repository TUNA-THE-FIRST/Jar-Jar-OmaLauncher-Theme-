# Gungan swamp theme (Jar Jar Binks)

Dull, looming swamp greens, Gungan-skin pink and booma blue. All art is original cartoon vector art.

- Theme: `~/.config/omarchy/themes/gungan` (colors, two wallpapers, preview). `style.toml` is switched to it (old one in `.style-backup/`).
- Face (swipe left of page 1): `00-gg-home.owl`. Page 1: game stats, clock, booma battery, Jar Jar. Page 4: droid pile (notifications), junkyard toy.
- Game: **Booma Blast**, a Linux app (LÖVE + Box2D). Launch it with `booma-blast`, or tap the stats widget on page 1. Source in `game/`; `tools/installgame.sh` installs it to `~/.local/share/booma-blast` and writes `~/.local/bin/booma-blast`. Progress is saved by the game, and it writes `~/.local/share/booma-blast/stats.json` for the widget.
- `art/art.js` the SVG art, `art/levels.js` the game levels, `src/` the widget sources, `tools/build.js --install` rebuilds and installs, `tools/wallpaper.js <dir>` redraws the wallpapers.
- `uninstall.sh` removes it all.

## Installing this pack

    tar xzf jarjar-pack.tar.gz && cd jarjar-pack && ./install.sh

Contents: `theme/` (colors, two wallpapers, preview), `style.toml`, `widgets/` (the home face and six widgets),
`game/` (Booma Blast), `source/` (art and widget sources; `node source/tools/build.js` needs `npm install` first).
Needs the `love` package for the game. `./uninstall.sh` removes it and restores the previous style.toml.
