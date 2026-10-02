# loew game-details redesign

This fork keeps upstream Adwaita-for-Steam intact and layers a focused game-details redesign after the upstream detail styles.

## Design contract

- Preserve the current Play/options header behavior and controls.
- Restore a larger, more Steam-native game-art hero treatment.
- Remove the v4 permanent 300px full-height info rail.
- Use a responsive primary-content + secondary-info layout.
- Let Activity/News use the available width instead of the v4 860px clamp.
- Treat activity items as distinct cards with sane date/event spacing.
- Keep achievements, controller, notes, DLC, screenshots, and related modules visible as secondary game information.
- Collapse to one column cleanly on narrower windows.

## Implementation

The override lives at:

`adwaita/css/main/library/details/loew-redesign.css`

and is imported after the upstream details/sidebar/activity styles in `adwaita/main.css`, so upstream compatibility work remains the base layer.

This branch intentionally does not edit `header.css`, keeping Play/options logic isolated from the redesign.
