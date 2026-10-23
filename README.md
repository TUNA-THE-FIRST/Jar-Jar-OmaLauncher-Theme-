# Jar Jar OmaLauncher Theme

The Gungan swamp (Jar Jar Binks) theme for the omalauncher Android launcher: Omarchy theme and two
wallpapers, launcher style, a home face with six widgets, and the Booma Blast game (needs `love`).
All art is original cartoon vector art. See `ABOUT-THE-PACK.md` for details.

## Install

    git clone https://github.com/TUNA-THE-FIRST/Jar-Jar-OmaLauncher-Theme-.git
    cd Jar-Jar-OmaLauncher-Theme-
    ./install.sh

Your current `style.toml` is backed up first. `./uninstall.sh` removes the pack and restores it.

## Update

    ./update.sh

Runs `git pull` and reinstalls if there is something new. It only copies the files listed in
`install.sh`; read the diff (`git log -p`) first if you want to check what changed.

## With an AI assistant

Tell it: "Clone https://github.com/TUNA-THE-FIRST/Jar-Jar-OmaLauncher-Theme-.git and follow INSTALL-WITH-AI.md."

## Layout

`theme/` colors, wallpapers, preview · `style.toml` · `widgets/` · `game/` · `source/` art and build sources (not installed)
