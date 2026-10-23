# Gungan swamp (Jar Jar Binks) pack for omalauncher

This repository is a theme pack for the omalauncher Android launcher (Arch/Omarchy system inside it).
If you are an AI assistant asked to apply it, follow these steps.

1. Use the cloned repository (or unzip the pack into a new folder) and read `install.sh` and `uninstall.sh` first. Tell the user
   what they will change before running anything.
2. Run `./install.sh` from the repository root (`bash install.sh` if the
   executable bit was lost in the zip).
3. If it warns that `love` is missing, ask the user, then run `sudo pacman -S --needed love`.
4. Check the result: `ls ~/.config/omalauncher/widgets/*gg-*.owl` should list 7 files, and
   `~/.config/omarchy/themes/gungan/backgrounds/` should hold 2 PNGs. Run
   `owl-check ~/.config/omalauncher/widgets/20-gg-jarjar.owl` and look at the PNG it prints to
   confirm the widget renders. Check `~/.config/omalauncher/style/errors.txt` for ignored settings.
5. Tell the user it is applied. To undo, run `./uninstall.sh`; to update later, `./update.sh` (git pull, then reinstall).

## What install.sh touches (nothing else)
- `~/.config/omarchy/themes/gungan/` (replaced): colors, two wallpapers, preview
- `~/.config/omalauncher/style/style.toml` (replaced; the old one is saved to
  `~/.config/omalauncher/jarjar/.style-backup/style.toml.<timestamp>`)
- `~/.config/omalauncher/widgets/*gg-*.owl`: the home face (`00-gg-home`) and 6 widgets
- `~/.local/share/booma-blast/` and `~/.local/bin/booma-blast`: the Booma Blast game (LÖVE)

No network access, no other packages beyond `love`. `source/` is art and build sources, not installed.
