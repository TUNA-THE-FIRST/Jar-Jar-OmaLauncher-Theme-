#!/usr/bin/env bash
# Installs the Gungan swamp (Jar Jar Binks) pack: Omarchy theme, wallpapers, launcher style,
# widgets, the home face, and the Booma Blast game. Existing style.toml is backed up first.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CFG="${XDG_CONFIG_HOME:-$HOME/.config}"
STAMP="$(date +%s)"

echo "› theme"
mkdir -p "$CFG/omarchy/themes"
rm -rf "$CFG/omarchy/themes/gungan"
cp -r "$HERE/theme" "$CFG/omarchy/themes/gungan"

echo "› style.toml (backup in omalauncher/jarjar/.style-backup)"
mkdir -p "$CFG/omalauncher/style" "$CFG/omalauncher/jarjar/.style-backup"
if [[ -f "$CFG/omalauncher/style/style.toml" ]]; then
  cp "$CFG/omalauncher/style/style.toml" "$CFG/omalauncher/jarjar/.style-backup/style.toml.$STAMP"
fi
cp "$HERE/style.toml" "$CFG/omalauncher/style/style.toml"

echo "› widgets"
mkdir -p "$CFG/omalauncher/widgets"
cp "$HERE"/widgets/*.owl "$CFG/omalauncher/widgets/"

echo "› Booma Blast"
if ! command -v love >/dev/null; then
  echo "  'love' is missing; the widgets need it. Run: sudo pacman -S --needed love"
fi
DEST="$HOME/.local/share/booma-blast"
mkdir -p "$DEST" "$HOME/.local/bin"
rm -rf "$DEST/assets"
cp -r "$HERE/game/assets" "$HERE/game/main.lua" "$HERE/game/conf.lua" "$HERE/game/levels.lua" "$DEST/"
cat > "$HOME/.local/bin/booma-blast" <<'SH'
#!/bin/sh
# Booma Blast, a LÖVE game. Opens on the launcher's Wayland display.
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
export SDL_VIDEODRIVER="${SDL_VIDEODRIVER:-wayland}"
exec love "$HOME/.local/share/booma-blast" "$@"
SH
chmod +x "$HOME/.local/bin/booma-blast"

echo "Done. The launcher picks up the style and widgets within seconds."
echo "Launch the game with: booma-blast"
