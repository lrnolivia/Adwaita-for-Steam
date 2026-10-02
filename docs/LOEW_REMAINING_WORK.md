# Approved work and release gates

This checklist preserves the whole approved brief as of 2026-10-02. New notes amend it; they do not replace unfinished work. Base reviewed: 4ba04bc9bff9dc4064709d96efed9d31499445be. PR #1 stays draft. The user's live screenshots, not source fixtures, decide final visual approval.

## Preserve
- Large hero first; old/native Steam composition, never the 4.0 header rearrangement.
- Edge-to-edge borderless Play rail, not a floating pill. Full-width secondary selector-style navigation, existing destinations intact.
- Generous INTERIOR padding; no growth in outer margins or wasteful gutters.
- Responsive Activity/info columns, opaque separate Activity artwork, neutral gray shadows, no decorative strokes.
- Existing labels, actions, downloads, queue order, drag/drop and information. Never fabricate active tabs or progress.

## Game details: still part of this release
- Check remaining Activity overlap across same-day multiple events, date headings, wrapped titles and both media variants.
- Top-align slightly larger Activity source icons; use the current game's icon only when identity is known, otherwise a generic fallback.
- Small well-padded stat badges with clear label/value hierarchy. Soft neutral depth on nav and far-right utility controls.
- Play is neutral until palette resolves; no system accent flash. Loading/launching green with faster pulse and truthful loading indicator; running green with slow pulse; Stop hover and confirmed stopping sienna, then ready again. Respect reduced motion.
- Sidebar and composer retain generous internal padding, wrapped paired actions, aligned text/buttons and borderless contrast.

## Palette and appearance amendments
- Default sampling source changes from hero to LOGO. Rank substantial saturated color clusters by occupied opaque area, not a single bright pixel. Ignore transparency and near-white/near-black neutrals. Monochrome/missing/unreadable logos stay neutral.
- Per-game Appearance control: From logo / Custom / Neutral, extracted swatches, color picker, hex input, live preview, Save, Cancel and reset to logo.
- Use light/dark TINTED foregrounds derived from the accent with checked contrast, rather than reflexively pure black/white. Green/sienna remain semantic game-state exceptions.
- Settings are keyed by stable game identity, not display name. Keep them outside replaceable theme files; provide export/import and clearly distinguish browser persistence from a durable user-controlled backup.
- Center hero BACKGROUND within the frame in both axes. Preserve intentional logo placement and user-supplied assets.
- Scope accents to each game's details or download card, never globally recolor Steam or leak the previous game's accent.

## Downloads repair: still part of this release
- Correct actual parent/child layout so content fills cards. Active, Up Next and Completed share widths and internal rhythm.
- Use full-card artwork only when available: centered cover, dimmed and softly blurred with a uniform dark scrim. No one-sided gradient image mask.
- Foreground logo/art anchored far left, opaque and unblurred, with title/status in a separate column. No logo/title overlap.
- Preserve network/disk graphs and real progress in their own layout region, not overlaying labels. Preserve errors, percentages, timestamps, controls, queue operations and empty states.
- Keep system accent out of downloads. Neutral default; a known game's selected palette can supply restrained progress emphasis without changing other cards.

## Lock-in: NOT ACTIVE until separately verified
- Capture approved local edits in this fork; preserve unknown local work during install.
- After live approval, pin an exact approved fork commit. Desktop-entry and Desktop Mode repair must use one locked local cache and not fetch upstream automatically.
- Keep offline rollback, native notifications and existing launcher behavior. Test relaunch/repair before claiming protection active.
- No final merge or release declaration until live render and protection checks pass.

## Explicitly excluded
The request for automatic/manual app updates in a hamburger menu was withdrawn as 'wrong app'. Do not build that unrelated feature here. The Appearance control and the already-approved Steam-theme healer protection remain in scope.

## Evidence boundaries
Fixtures and automated browser checks can demonstrate layout/behavior in a constructed DOM, not the user's running Steam client. This cloud session cannot claim local installation, game-state verification or worker execution without a returned execution result. UIAudit, Impeccable and UI UX Designer have not been exposed by current plugin discovery; do not invent their participation.
