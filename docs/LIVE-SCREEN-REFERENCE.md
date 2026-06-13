# Live Screen Reference

## Role

첨부된 레퍼런스 이미지는 구현용 배경 이미지가 아니라 Visual North Star다. 현재 게임의 기능 해금 흐름과 단일 `index.html` 구조를 유지하면서, 화면이 "작은 말랑 우주 극장"으로 읽히도록 번역한다.

## Desktop Golden Live Screen

- left game stage: 70-74%
- right shop panel: 26-30%
- news ticker: top of stage, thin
- title/level/coin block: upper center
- slime center: stage x ~= 50%, y ~= 58%
- wish strip: bottom center, thin
- shop resource strip: top of right panel
- tabs: below resource strip
- shop cards: 3-5 visible depending tab

## Mobile Live Screen

- top live stage: 42-45dvh
- bottom panel: remaining height
- top stage contains only essential UI
- resource chips should not crowd slime
- bottom tab buttons must be thumb-friendly
- shop cards should not require tiny taps

## Main Stage Reference Mapping

| Element | Reference Position | Game Interpretation |
| --- | --- | --- |
| 우주 고래 | sky left/top, slow ambient | sky resident, large but muted, never ground shadow |
| 코인 행성 | sky right/top, small and bright | sky resident, coin economy motif |
| 별의 정령 | sky/side, glowing but small | sky glow resident, not a ground pet |
| 시간 거북 | ground lower-left | slow ground resident, needs contact shadow |
| 고양이 | mat/cushion near right/mid-ground | rests on owned mat/cushion when possible |
| 강아지 | ground lower-right or lower-mid | energetic front resident |
| 병아리 | ground near center/front | early friendly resident, never huge late-game clutter |
| 드래곤 | coin fountain/treasure side | left treasure guard |
| 유니콘 | lamp side | right magical set piece |
| 토끼 | jumping/air right-middle | air/rocket resident, allowed above ground |
| 젤리 결정 | lower-left flowerbed | utility prop using stage layout |
| 코인 더미 | lower-right | wealth prop, behind wish strip if needed |
| 우주 씨앗/별나무 | behind/above slime, subtle | central symbol, never stronger than slime |

## Current Code vs Reference

- The game already has the core pieces: stage backdrop, slime focus, shop panel, friends, decor, wishes, guests.
- The main gap is coordination: friend positions, decor positions, utility props, and shop cards use separate visual grammars.
- The reference shows late-game fullness. The implemented game must preserve early-game negative space and progressive reveal.
- Current tabs are functional, but card cost/count/icon treatment is inconsistent across producers, upgrades, wishes, room, and prestige.

## Implementation Priority

1. Centralize stage coordinates for friends, decor, crystal bed, coin pile, and cosmic tree.
2. Limit visible residents by game phase so late-game feels lively without showing every producer at full size.
3. Apply sky vs ground classes consistently: glow for sky, contact shadow for ground.
4. Make shop cards share a darker framed-panel grammar without changing purchase logic.
5. Keep mobile simpler than desktop and preserve touch targets.

## Do Not Copy Literally

- Do not use the reference images as full-screen backgrounds.
- Do not show every friend and decoration in early game.
- Do not add new currencies, systems, or balance changes.
- Do not increase sparkle density until it competes with the slime.
