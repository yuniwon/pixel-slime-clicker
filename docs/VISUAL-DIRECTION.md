# Visual Direction

## Core Fantasy

작은 말랑 우주 극장.

이 게임의 무대는 거대한 우주 풍경이 아니라, 슬라임과 친구들이 함께 사는 작은 극장이다. 별, 행성, 창문, 정원, 장식은 모두 슬라임의 생활감을 돕는 무대 장치여야 하며 슬라임보다 강한 주인공이 되면 안 된다.

## Target Player Feeling

- 귀여운 슬라임이 사는 작은 우주를 돌본다.
- 친구들이 숫자 생산자가 아니라 방의 주민처럼 보인다.
- 오늘 할 일이 있지만 숙제처럼 느껴지지 않는다.
- 환생과 우주 씨앗은 반복의 흔적을 남긴다.

## Visual Hierarchy

1. Slime
2. Coin / Level / Evolution Progress
3. Friends and Decor
4. Wish Strip / Daily Ritual
5. Shop Panel
6. Ambient Guests and Effects

## Stage Zones

### Sky Zone

- 우주 고래
- 코인 행성
- 별의 정령
- 황금별
- 별똥이
- 우주 창문
- 우주 씨앗/별나무 상단

### Slime Zone

- 슬라임
- 콤보 오라
- 성향 오라
- 말풍선

### Ground Zone

- 병아리
- 고양이
- 강아지
- 아기 드래곤
- 시간 거북
- 쿠션
- 연못
- 매트
- 램프
- 코인 분수
- 젤리 결정 화단
- 코인 더미

### UI Zone

- 뉴스
- 레벨/코인/CPS
- 오늘의 말랑
- 소원 스트립
- 상점 패널

## Layer Order

0. background stars
1. sky ambient
2. back decor
3. back friends
4. combo aura
5. slime
6. front friends
7. ground props
8. wish strip
9. event guests
10. toast/modal

## Current Layer Audit

| Layer | DOM/CSS | z-index | Zone | Visibility | Reference Role | Main Visual Issue |
| --- | --- | ---: | --- | --- | --- | --- |
| body/background/star | `body`, `.star` | 0 | sky | always | deep violet night sky | star density is random, not yet composed around stage focal points |
| game-area | `#game-area` | 1/2 children | UI/stage | always | left live theater | flex centering fights stage-specific coordinates |
| stage garden | `#stage-backdrop`, `.pg-*` | 0-5 internal | back decor | always | small planet garden / spaceship deck | desktop uses custom math, mobile uses CSS fallback, other props use separate math |
| decor-layer | `#decor-layer`, `.decor` | 1 | ground/sky | conditional | room set pieces | decor positions live in `DECOR`, not in one stage map |
| friends-layer | `#friends-layer`, `.friend` | 1 | ground/sky | conditional | living residents | max copies can make residents feel like scattered stickers |
| news-ticker | `#news-ticker` | 3 | UI | conditional fade | thin top news strip | can compete with title if too dense |
| title/stage-name/cosmic-mark | `#title`, `#stage-name`, `#cosmic-mark` | 2 | UI | always/conditional | upper center identity | title block has no explicit safe lane from guests |
| evo-progress | `#evo-progress-wrap`, `#evo-silhouette` | 2 | UI | always | evolution breadcrumb | readable but less integrated with coin block than reference |
| coin-display/cps-display | `#coin-display`, `#cps-display` | 2 | UI | always | primary number block | good hierarchy; must stay above room noise |
| daily-summary | `#daily-summary` | 2 | UI | desktop only | gentle daily prompt | overlaps conceptually with wish strip |
| slime-wrap | `#slime-wrap` | 2 | slime | always | main character focus | coordinate system is implicit in flex layout |
| slime-canvas/slime-shadow | `#slime-canvas`, `#slime-shadow` | 2 | slime/ground | always | hero and grounding | shadow grounds slime, but stage props must not cover face |
| combo-aura/tier-ring/heat | `#combo-aura`, `#tier-ring`, `.heat-particle` | -1/inside | slime/effect | conditional | interactive magic circle | effects are good but need to stay behind/around slime |
| wish-strip | `#wish-strip` | 3 | UI | conditional | bottom daily objective | good thin strip, must not cover coin pile/crystal |
| crystal-bed | `#crystal-bed` | CSS/JS positioned | ground | conditional | lower-left garden prop | position was separate from decor/friend stage logic |
| coin-pile | `#coin-pile` | 3 | ground | conditional | lower-right wealth prop | position was separate from decor/friend stage logic |
| golden-star / mini-star | `#golden-star`, `.mini-star` | 60 | sky/event | conditional | bright guest | can read as UI sticker if spawned over dense UI |
| raincloud | `#raincloud` | 61 | sky/event | conditional | sky guest challenge | fixed positioning can collide with title if unchecked |
| starlet | `#starlet` | 61 | sky/event | conditional | small guided guest | needs sky-glow treatment, not ground shadow |
| toast | `#toast` | 100 | UI | conditional | feedback overlay | mobile spacing is guarded; continue checking shop overlap |
| blessing modal | `#blessing-overlay` | 120 | modal | conditional | run choice | visually separate enough |
| crystal modal | `#crystal-overlay` | 130 | modal | conditional | feeding loop | visually separate enough |
| cosmic ending overlay | `#cosmic-ending-overlay` | 210 | modal | conditional | milestone ceremony | should remain rare and stronger than normal UI |
| shop panel | `#shop` | 2 | UI | always | right/bottom panel | header/tabs now read as a darker console; card grammar still varies by tab |
| res-strip | `#res-strip` | normal | UI | conditional | resource chips | compact, but visually plain next to reference |
| tabs | `#shop-tabs .tab` | normal | UI | unlocked | tab navigation | sprite icons and darker active surfaces now improve tactility; still simple versus reference |
| shop-list/cards | `#shop-list`, `.shop-item` | normal | UI | always | cards | base card, icon frame, cost/count badges, and producer/wish metadata lines are closer; room/prestige variants still need final unification |
| stats-bar | `#stats-bar` | normal | UI | optional | advanced telemetry | intentionally subdued |

## Density Rules

Early game:

- visible friends: 0-2
- visible decor: 0-1
- no cosmic tree
- no coin pile unless threshold reached

Mid game:

- visible friends: 3-5
- visible decor: 2-4
- wish strip visible
- one ambient sky object allowed

Late game:

- visible friends: 6-8
- visible decor: 4-6
- cosmic seed/tree allowed
- coin pile and crystal garden visible

Never:

- all 10 friends at full size all the time
- every decoration equally bright
- UI elements covering slime face
- unanchored ground props floating

## Size Rules

Desktop:

- slime: 280-340px visual height
- ground friend: 40-64px
- sky friend: 56-100px
- decor: 50-95px
- shop icon: 44-64px
- wish strip height: compact, no taller than necessary

Mobile:

- top stage: about 42-45dvh
- slime: tap-friendly but not crowding
- visible friends: 3-5 max
- visible decor: 2-4 max
- shop cards: 2-3 visible
- bottom nav/tabs touch-friendly

## Shadow and Glow Rules

- 바닥 오브젝트는 반드시 접지 그림자.
- 하늘 오브젝트는 접지 그림자 없이 글로우.
- UI는 drop-shadow만 사용.
- 이펙트는 슬라임/오브젝트와 상호작용해야 하며 스티커처럼 붙으면 안 됨.

## Color Palette

- deep violet
- lavender
- warm gold
- mint green
- strawberry pink
- soft teal
- avoid harsh neon
- avoid pure white blocks except tiny spark highlights

## Reference Image Interpretation

레퍼런스 이미지는 late-game / polished state 기준이다. 실제 early-game 화면은 훨씬 덜 복잡해야 한다. 분위기, 위계, 색감, 패널 문법을 따르고 모든 요소를 1:1 복제하지 않는다.

## Visual QA Checklist

- 공중부양: 바닥 오브젝트에 접지 그림자가 있는가?
- 요소 충돌: 슬라임 얼굴, 코인, 레벨, 탭 클릭 영역을 가리지 않는가?
- 접지 그림자: ground zone 주민과 장식은 무대에 닿아 보이는가?
- 스케일 정합: 친구/장식/이펙트의 픽셀 밀도와 외곽선이 같은 세계처럼 보이는가?
- 효과 vs 스티커: 오라, 별가루, 클릭 이펙트가 대상과 상호작용하는가?
- 배치 의도: 그 위치에 있어야 할 이유가 한눈에 읽히는가?
- 팔레트 통일: 보라/골드/민트/핑크 안에서 조화되는가?
