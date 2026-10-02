# Downloads Activity-structure pass

This pass changes presentation only. Steam's Downloads content, text, actions, ordering,
drag/drop behavior and update logic remain unchanged.

Design direction:
- borrow the game-details Activity page hierarchy
- one centered readable column
- plain section headers above discrete padded cards
- active transfer becomes a larger lead card
- queue items become individual cards instead of a connected list
- game art is a compact leading media block
- network/disk values use small padded stat badges
- progress becomes an inset accent rail
- actions use soft borderless button surfaces
- neutral shadows provide depth instead of strokes
- responsive stacking preserves the same content

The implementation is isolated in
`adwaita/css/main/library/downloads/loew-downloads-pass.css`
and imported after the existing Downloads stylesheet for easy rollback.
