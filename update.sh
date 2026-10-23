#!/usr/bin/env bash
# Pulls the latest pack from GitHub and reinstalls it if anything changed.
set -euo pipefail
cd "$(dirname "$0")"
[[ -d .git ]] || { echo "Not a git clone; clone the repository to use update.sh."; exit 1; }
before="$(git rev-parse HEAD)"
git pull --ff-only
if [[ "$(git rev-parse HEAD)" == "$before" ]]; then echo "Already up to date."; else ./install.sh; fi
