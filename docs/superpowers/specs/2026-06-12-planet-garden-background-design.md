# Planet Garden Background Design

## Decision

Use the **small planet + spaceship garden** direction for the main stage background.
The current empty cosmic backdrop should become a place where the slime, friends, guests, and decor can physically belong.

Chosen visual direction:
- A small soft planet floats in space.
- A compact spaceship deck is embedded into the planet surface.
- The deck has garden elements: tiny grass patches, planters, an antenna, and a small greenhouse-like dome.
- The slime stays centered on the deck or planet crown.
- Friends and decor occupy readable side zones around the deck.

Reference note: no project `DESIGN.md` exists. The local selector surfaced Vercel, Linear, and Stripe; **Linear** is the useful reference only for dark-canvas layering, subtle structure, and restrained luminance. The final art direction remains a cute pixel-game stage, not a SaaS interface.

## Lore

The stage is the **우주 씨앗의 정박지**.

The slime began as a small lifeform in empty space, eating coins and growing through evolution and rebirth. Over time, clicks, wishes, stardust, friend visits, and decor did not simply disappear into the background. They gathered under the slime like a small gravity well and hardened into a tiny planet.

Friends then built a simple deck into that planet so they could land safely, rest, and place useful objects. The garden is made from stardust used like soil. That is why the background can hold both natural planet shapes and spaceship parts without feeling random.

Game text seed:

> 우주를 떠돌던 작은 씨앗은 슬라임 아래에 멈춰 섰다. 친구들은 그 위에 낡은 갑판을 얹고, 별가루를 흙처럼 뿌렸다. 그렇게 빈 우주는 조금씩 머물 수 있는 정원이 되었다.

## Visual Goals

- Keep the cosmic identity visible. Space should still be readable behind the stage.
- Reduce the empty-screen feeling by giving the center a physical platform.
- Make friend, guest, coin pile, crystal bed, and decor placement feel intentional.
- Keep the stage soft and cute, not mechanical or hard sci-fi.
- Preserve pixel clarity at desktop and mobile sizes.

## Layout

Layer order from back to front:

1. Deep space gradient and sparse stars.
2. Distant orbit ring or faint planetary halo.
3. Small planet body near the lower center.
4. Embedded spaceship deck on the top/front of the planet.
5. Garden props: planters, grass patches, antenna, greenhouse dome.
6. Existing game actors: slime, friends, guests, decor, coin pile, click effects.

Placement zones:
- Center: slime.
- Left and right mid-ground: friends.
- Lower right: coin pile.
- Lower or mid-left: pond, cushion, mat, and small decor.
- Upper right or upper-left: sky decor such as window or cosmic seed.
- Back-center or side edge: crystal bed if unlocked.

## Scope

In scope:
- Background and stage visuals only.
- CSS/HTML layering needed to host the new stage.
- Optional generated bitmap or sprite assets for the planet/deck/garden pieces.
- Optional story/codex text that uses existing story surfaces.
- Browser playtest and screenshot/video verification after asset hookup.

Out of scope:
- Economy changes.
- Save schema changes.
- New progression systems.
- Moving shop, upgrades, or balance values.

## Implementation Notes

Prefer a small set of explicit layers over one huge background:
- A reusable `#stage-backdrop` or equivalent static layer for space, orbit, and planet.
- Existing `#decor-layer`, `#friends-layer`, guests, and `#slime-canvas` stay above it.
- Keep z-index relationships simple so click targets remain unchanged.
- Use CSS variables for stage glow so evolution colors can still tint the planet area.

If using generated art:
- Main background/stage asset can be larger than icon atlases because it is not a tiny UI sprite.
- Export transparent PNG pieces where possible: planet body, deck, greenhouse/antenna, foreground garden patches.
- Avoid magenta/pink chroma for pink-heavy garden details unless extraction is tested.

## QA

Verification must include:
- Desktop browser screenshot.
- Mobile-width screenshot.
- Actual play click test around the slime, golden star, guests, and decor.
- Console fatal/pageerror count is zero.
- Check that text and UI panels do not overlap the new stage.
- If animated orbit/stars/deck lights are added, capture a short recording or frame sequence.

## Next Implementation Direction

Start with CSS/piece layering in the game to prove placement, scale, z-index, and mobile readability. After the layout works in a real playtest, replace the main planet, deck, and garden props with generated pixel-art PNG pieces. This keeps the background flexible while preventing a single large bitmap from fighting the existing friends, decor, guests, and slime layers.
