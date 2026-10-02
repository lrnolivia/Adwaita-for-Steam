# Approved design and update safeguards

Status: required release gate, NOT yet enforced on the user's Bazzite machine.
User request, 2026-10-02: "once we lock this in safeguard future auto-updates upstream from ovewriting our work".

## Current iteration

Draft PR #1 remains the design workspace. Do not merge or describe it as approved.
The content-spacing follow-up changes only sidebar internal padding, section action rows, publisher-card width/alignment, and date-heading padding. No hero, Play bar, navigation or page-grid redesign is included.

Validation performed in this chat: 22 source-derived Chromium structural fixture cases plus 4 targeted spacing cases passed. The targeted cases exercise both publisher media variants, a constrained nested partner wrapper, 16px sidebar body insets, wrapped dual actions and date containment. These are NOT live Steam validation, not validation of its virtualized list, and not a game-lifecycle test.

Known local divergence: a previous terminal hotfix may exist in loew-redesign.css on Bazzite but is not in the repository. Do not reset or overwrite those edits. The provided bounded terminal update appends/replaces only its named spacing block. It is an explicit preview installation, not an auto-update channel.

## Approval gate

Before locking: inspect and reconcile the actual local CSS, installed theme configuration, Desktop Mode autostart entries, user services/timers, GNOME launcher wrapper and AdwSteamGtk auto-install settings. Capture all approved local changes in this fork. Record the exact source commit, installed asset hashes and configuration. Capture live Steam screenshots at normal/narrow widths and test menus, scrolling, image cards, metadata and game action states. Keep the previous known-good theme and receipt for rollback.

## Required architecture after approval

1. The active theme is a locally cached, explicitly approved artifact from lrnolivia/Adwaita-for-Steam at an exact commit. Never use a moving upstream branch or a latest-release URL as the repair source.
2. Both Desktop Mode repair and Steam app-icon repair use ONE shared, lock-protected installer. Preserve launcher arguments, game launch URLs, the user's accent/settings and native GNOME notifications. Avoid repair races and do not close a running game.
3. Remove direct upstream theme update/install calls from every active repair entry point. Audit actual local files before changing them. Updating the AdwSteamGtk Flatpak application itself is distinct from letting it install an upstream theme.
4. Steam may replace its own CSS during an update. Repair must reapply the approved local artifact, including custom CSS/assets, and work without downloading upstream. Hash the expected custom files rather than merely detecting a generic Adwaita marker.
5. Upstream changes go to a separate integration/review branch. No scheduled task may merge or install them over the approved theme. Test compatibility and compare visuals before explicit promotion to a new approved commit.
6. On conflicts, unexpected hashes, unavailable approved assets or validation failures: preserve the last working theme, notify the user and stop. Do not silently fall back to installing upstream.
7. Verify these protections across Desktop Mode entry, app-icon launch, repeated launches, simulated Steam CSS replacement, upstream update availability and an offline repair. Only then report the safeguard active.

This gate safeguards theme installation. It does not disable Bazzite or Steam client security updates. No automation, local-helper replacement, release pin, merge or protected-branch setting was created by writing this document.
