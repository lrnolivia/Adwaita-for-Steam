# Game-details final polish v2

Implements the previously approved first-round polish before further page work.

- Activity partner cards use a stable copy/media grid and reset inherited positional drift.
- Date headings own their own row so preceding events cannot overlap them.
- Activity source tiles align with the first text line, grow to 44px, and use Steam's
  current Play-bar game icon when it is already exposed in the DOM; otherwise the
  existing generic update glyph remains as fallback.
- Hero sampling now starts neutral, avoiding system-accent flash.
- Sampled hero colors are normalized into a brighter, more saturated usable accent.
- Play rail gets neutral depth without strokes.
- Cloud/Last Played/Play Time/Achievements use compact padded badge surfaces.
- Navigation gets a soft neutral shadow and accent-tinted interaction states.
- Right-side rail controls get subtle neutral shadows.
- Enabled Post and details progress reuse the sampled accent.
- Play is static when ready, pulses actively while launching, breathes slowly while
  running, and holds sienna without pulse while stopping.
- Reduced-motion disables the pulse animations.

No page structure, Steam actions, Activity content, navigation destinations or
game lifecycle operations are changed.
