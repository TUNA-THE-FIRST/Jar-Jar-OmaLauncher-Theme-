#!/usr/bin/env bash
# Removes the Gungan pack and restores the style.toml saved by install.sh.
set -euo pipefail
CFG="${XDG_CONFIG_HOME:-$HOME/.config}"
W="$CFG/omalauncher/widgets"
mkdir -p "$W/.removed"
for f in "$W"/*gg-*.owl; do [[ -e "$f" ]] && mv "$f" "$W/.removed/"; done
B="$CFG/omalauncher/jarjar/.style-backup"
LATEST="$(ls -1 "$B" 2>/dev/null | sort | head -1 || true)"
if [[ -n "$LATEST" ]]; then cp "$B/$LATEST" "$CFG/omalauncher/style/style.toml"; echo "› style.toml restored from $LATEST"; fi
sleep 2
rm -rf "$CFG/omarchy/themes/gungan" "$HOME/.local/share/booma-blast" "$HOME/.local/bin/booma-blast"
echo "› Gungan pack removed"
