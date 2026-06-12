# slime-friends-ai QA Notes

- Runtime atlas currently contains 8 generated friends: chick, cat, dog, rabbit, unicorn, dragon, whale, planet.
- `sprite-request.json` also declares `spirit` and `turtle`, but no `raw/` or `frames/` files exist for those states in this run.
- Game code intentionally falls back to emoji for `spirit` and `turtle` until the friends atlas is regenerated with all 10 requested states.
- Next sprite-gen cycle should prioritize regenerating this atlas from the existing request and then copy the new `frame_layout` rows into `PRODUCER_SPRITE_LAYOUT`.
