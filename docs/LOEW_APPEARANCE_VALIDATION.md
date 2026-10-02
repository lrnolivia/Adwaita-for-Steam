# Appearance and Downloads preview, 2026-10-02

This extends, rather than replaces, `LOEW_REMAINING_WORK.md`. The old/native layout, large hero, borderless edge-to-edge Play rail, neutral shadows, interior padding, stat badges, utility buttons and composer remain in scope. No merge or live-verified release is declared.

## Implemented in source
- Logo-area palette sampling. Meaningful saturated clusters win by opaque area; tiny saturated specks and transparent/neutral pixels do not dominate. Missing/monochrome/unreadable logos stay neutral.
- Per-game Appearance swatch beside utility controls. From logo, Custom, Neutral; extracted swatches, color picker, hex entry, preview, Save, Cancel and Reset to logo.
- Preferences use stable Steam/game IDs, never names. A missing ID disables saving rather than mixing games.
- Button foregrounds use same-hue light/dark tints with contrast checks. Accented secondary text is adjusted to remain readable. Running/stopping stay green/sienna.
- Centered hero background, unchanged independent logo placement.
- Same-day Activity event spacing; badge styling reaches real stat descendants. Pulse uses a separate decorative element so old important shadows cannot suppress it.
- Downloads grid moved to actual content wrappers. One Downloads stylesheet replaces competing native-theme and override geometry. Sections share width, status and graph have their own space, logo stays opaque at the left. Full-card blurred/dimmed hero uses an existing known asset, with neutral fallback when none is available. Queue transforms and progress values are not changed.
- Downloads respects that game's stored custom/neutral choice. Automatic palettes/artwork are reused only when already observed for the same ID. No system accent is injected into Downloads.
- Removed the accidental sidebar-toggle JavaScript bootstrap; its unrelated unstyled controls are not part of this design.
- CSS and module imports are wired in `adwaita/main.css` and `adwaita/js/main/main.js`.

## Checks actually run
- 63 Node assertions passed: dominant color/alpha handling, monochrome fallback, tinted foreground/link contrast, ID parsing and preference validation.
- 47 Chromium DOM-fixture checks passed: automatic/custom/neutral states, preview/cancel/save/reset, modeled persistence, observer settling, loading/running/stopping pulse behavior and reduced motion; Appearance dialog containment at 390/768/1280 px; Downloads card containment and section widths at 390/768/1280/1920 px; unchanged 40% test progress and opaque logo/background separation.
- JavaScript syntax checks and shell `bash -n` passed.

Browser navigation in the cloud sandbox is administrator-blocked. Tests therefore rendered local source-informed HTML in memory and used a mocked localStorage adapter. These are not live Steam screenshots, not a full current Steam CSS/JS integration test, and not evidence of real CEF-profile persistence. Game-details fixtures inherit the earlier structural test hierarchy; Downloads fixtures follow the inspected Steam source hierarchy. UIAudit, Impeccable and UI UX Designer were not exposed in current tool discovery, so no third-party/plugin audit is claimed.

## Persistence and live gates
Settings are stored in the Steam browser profile, outside replaceable theme files. Theme reinstall should not replace that store; clearing Steam web data can. The UI provides JSON export/restore for a separate user-controlled backup. Runtime pixel access, image identity, native color-dialog behavior, actual Steam action states (English labels), queue drag/drop and restart persistence still require the user's live check.

`tools/install-loew-preview.sh EXACT_COMMIT` archives a clean exact fork revision into a separate local cache, backs up theme/CSS/library.js, refuses to install while Steam is open and leaves the working checkout and existing healer scripts untouched. It verifies installed module files, not the live page.

The approved-build pin, offline healer, launcher integration and upstream-review-only policy remain mandatory final release gates. They are NOT ACTIVE merely because these source changes exist. Activate them only after live visual approval, using the actual existing helpers and a tested rollback. The withdrawn wrong-app hamburger updater request remains excluded.
