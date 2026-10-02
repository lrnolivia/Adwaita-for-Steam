# Game-details layout recovery

Status: source repair for draft PR #1. Not a release and not verified inside the user's live Steam client.

## Root causes

The previous override applied the page grid to `appdetailsoverview.Container` (`_27RcNu8aXKBpYkHcNNrt-X`). That element contains the Play bar, the information revealer, primary links and the nested `ColumnContainer`. It is not the two-column content wrapper.

The previous correction also selected Play and links as direct children of `AppDetailsOverviewPanel`, skipping the intervening overview container. Those rules did not match the inspected source hierarchy. It incorrectly treated `ColumnContainer` (`OhSdLYuggDtBcWjYP0j_9`) as the left column. The actual left column is `_1sZgBDTw5NH-yuVDZK1SUU`.

Inside news cards, the image precedes the copy in DOM order. Assigning columns without assigning rows lets automatic placement push the later copy down to a second row. A large fixed media track then squeezes the remaining text area. Named grid areas now explicitly place both in one row, and card responsiveness uses the actual Activity width.

`PostTextEntryArea` is a textarea. Previous selectors expecting a div containing a textarea did not style that input.

## Preserved design

Keep the native-style hero, classic Play / stats / utility order, segmented-looking destination links, neutral grey depth, real event artwork, sidebar surfaces and composer. No JS injection, game action changes, updater replacement, release or merge was performed.

The override is replaced rather than extended with another conflicting layout section. Steam retains ownership of its scrolling, revealers, waypoint elements, sticky-header visibility and virtual-list positioning. No layout overrides target arbitrary Panel elements.

## Source ancestry used for the test fixture

The previously inspected source snapshot is https://github.com/ricewind012/steam-ui-unobfuscated/tree/3c658f496c3bc713eabd1ebb57c91b4659b83591 . Relevant modules: src/chunk~2dcc5aaf7/40478.js (page ancestry), 59856.js (overview), 69359.js (column class map), 56262.js (Play bar), 12975.js and 55523.js (composer).

This is a source-derived fixture, not a capture of the user's current DOM. It includes relevant legacy geometry constraints, not the complete installed Steam stylesheets or application JavaScript.

## Validation performed before publication

Chromium / Playwright structural fixture: 22 scenarios passed. Ten viewport/sidebar combinations, each with information collapsed and expanded, plus two additional sidebar widths at a fixed window size. Viewport widths: 2560, 2048, 1702, 1440, 1280, 1180, 1024, 860, 760 and 640 CSS pixels.

Assertions cover full-width Play and navigation; no hero/control/content overlap; correct left/right placement; secondary-column stacking; text/media containment and row placement; readable copy and composer widths; information expansion; document horizontal overflow; and preservation of the configured accent in the fixture. Resizing the sidebar at a fixed window width also changes the layout correctly.

## Still needs live verification

The user must check the rendered Steam page at wide and narrow window sizes, open/close information, and scroll to exercise the real sticky header and lazy/virtualized activity. The fixture does not establish this runtime result.

Previously requested action-state behavior remains provisional: an X icon can mean Cancel as well as Stop; the current shutdown-state selector is not a substitute for a recorded running/stopping transition. The CSS uses the installed Adwaita accent token, not a new GNOME settings watcher. Persistent stop-state color and system-accent synchronization have not been verified here. These limits must not be reported as delivered functionality.

The existing local self-healer may still reinstall upstream AdwSteamGtk rather than the fork; its integration remains a separate outstanding item. Do not merge or declare completion based only on fixture tests.
