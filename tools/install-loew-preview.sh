#!/usr/bin/env bash
# Install an exact preview without resetting the checkout or touching repair helpers.
set -Eeuo pipefail
COMMIT="${1:-}"
REPO="${LOEW_STEAM_REPO:-$HOME/.local/share/Adwaita-for-Steam-git}"
ROOT="${LOEW_STEAM_ROOT:-$HOME/.local/share/Steam}"
STATE="$HOME/.local/state/loew-steam"
notify() { command -v notify-send >/dev/null && notify-send -a 'Adwaita for Steam' -i steam "$@" 2>/dev/null || true; }
fail() { printf '\n%s\n' "$*" >&2; notify -u critical 'Preview installation stopped' "$*"; exit 1; }
[[ "$COMMIT" =~ ^[0-9a-f]{40}$ ]] || fail 'Pass the exact 40-character preview commit.'
for cmd in git python3 tar flock pgrep; do command -v "$cmd" >/dev/null || fail "Missing command: $cmd"; done
[[ -d "$REPO/.git" && -d "$ROOT/steamui/css" ]] || fail 'The existing checkout or Steam installation was not found.'
mkdir -p "$STATE"
exec 9>"$STATE/preview-install.lock"
flock -n 9 || fail 'Another preview installation is already running.'
[[ -z "$(git -C "$REPO" status --porcelain)" ]] || fail 'Local source edits were found and left untouched. Save them before installing a different preview.'
if pgrep -u "$UID" -x 'steam|steamwebhelper' >/dev/null; then
  fail 'Exit Steam normally first, after closing games and pausing downloads. Then rerun this command.'
fi
# Network activity updates only the local object database, never a branch/reset.
git -C "$REPO" fetch origin loew/game-details-redesign
git -C "$REPO" cat-file -e "$COMMIT^{commit}"
CACHE="$(mktemp -d "$STATE/preview-$COMMIT-XXXXXX")"
BACKUP="$(mktemp -d "$STATE/backup-$(date +%Y%m%d-%H%M%S)-XXXXXX")"
git -C "$REPO" archive "$COMMIT" | tar -x -C "$CACHE"
for part in adwaita css library.js; do
  [[ ! -e "$ROOT/steamui/$part" ]] || cp -a "$ROOT/steamui/$part" "$BACKUP/$part"
done
printf '%s\n' "$COMMIT" > "$BACKUP/preview-commit"
restore() {
  printf '\nRestoring backed-up Steam UI files.\n' >&2
  for part in adwaita css; do
    if [[ -d "$BACKUP/$part" ]]; then
      [[ ! -e "$ROOT/steamui/$part" ]] || mv "$ROOT/steamui/$part" "$BACKUP/failed-$part"
      cp -a "$BACKUP/$part" "$ROOT/steamui/$part"
    fi
  done
  [[ ! -f "$BACKUP/library.js" ]] || cp -a "$BACKUP/library.js" "$ROOT/steamui/library.js"
}
notify 'Installing Steam preview' 'Backing up the current theme and installing the exact fork revision.'
if ! (cd "$CACHE" && python3 ./install.py --target "$ROOT") >"$BACKUP/install.log" 2>&1; then
  restore; cat "$BACKUP/install.log"; fail 'Installer failed. Previous UI restored; Steam remains closed.'
fi
if grep -Eqi '\[ERROR\]|Failed to install|No changes made' "$BACKUP/install.log" ||
   ! cmp -s "$CACHE/adwaita/loew/appearance.js" "$ROOT/steamui/adwaita/loew/appearance.js" ||
   ! cmp -s "$CACHE/adwaita/loew/appearance-core.js" "$ROOT/steamui/adwaita/loew/appearance-core.js"; then
  restore; cat "$BACKUP/install.log"; fail 'Installed-file verification failed. Previous UI restored.'
fi
cat "$BACKUP/install.log"
printf '\nPreview files installed: %s\nBackup: %s\nAutomatic repair helpers have not been changed.\n' "$COMMIT" "$BACKUP"
notify 'Steam preview files installed' 'Appearance controls and Downloads repairs are ready for a live visual check.'
if [[ -x /usr/bin/bazzite-steam ]]; then
  (exec 9>&-; nohup /usr/bin/bazzite-steam -silent >/dev/null 2>&1 &)
fi
