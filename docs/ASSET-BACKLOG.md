# Asset Backlog

이번 작업에서는 새 스프라이트를 생성하지 않는다. 아래 항목은 다음 `sprite-gen` 사이클에서 생성하거나 재생성할 후보만 정리한다.

| Priority | Asset | Current Temporary Expression | Why Needed | Use Location | Cell / Frames | Visual QA Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Done | `spirit` friend | `slime-friends-ai` 2f sprite | 별의 정령 CSS 폴백 제거 완료 | stage resident, friends tab, codex | 896x896, idle 2f | sky glow, no ground shadow, readable at 42-64px |
| Done | `turtle` friend | `slime-friends-ai` 2f sprite | 시간 거북 CSS 폴백 제거 완료 | stage resident, friends tab, codex | 896x896, idle 2f | ground contact shadow, clock shell must read at small size |
| 2 | `items:prestige` | gray atlas + runtime violet tint | 환생 버튼은 핵심 전환인데 생성 회색화 이력이 있음 | prestige tab, shop icon | 384-512 square, 1f | use green chroma for violet/pink subject; avoid gray average |
| Done | `slime-challenges-ai` 4 icons | `slime-challenges-ai` 1f sprites | 도전 런 CSS 폴백 제거 완료 | prestige challenge cards | 256x256, 1f each | state names match `silence`, `mono`, `starlit`, `sprint` |
| 4 | stage ground texture 5 stages | current stage backdrop and glow | 진화 단계별 바닥 감각이 아직 약함 | behind/under slime stage | 412x80 tile or manifest rects | do not cover slime face; must support contact shadows |
| 5 | trophy shelf frame | translucent strip/codex grids | 업적/기록 탭이 수집 공간처럼 보이게 함 | room/codex panels | 412x40 tile, 1f | low contrast frame, no heavy sparkle |
| 6 | slime expression variants | squish + idle frames only | 클릭/소원/환생 피드백이 더 살아날 수 있음 | slime canvas/body atlas | main atlas extension, 2f per expression | baked per stage/trait where possible; avoid generic sticker mouth |

## Generation Notes

- Follow `docs/ASSET-PIPELINE.md`.
- State names must match code ids exactly.
- Pink/violet subjects should use green chroma.
- Green subjects should use magenta chroma.
- Do not replace working connected atlases unless a visual QA failure is documented.
