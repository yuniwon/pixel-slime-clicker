# 에셋 파이프라인 — 코딩(Claude) ↔ 그래픽(Codex/sprite-gen) 협업 규약

이 문서는 게임 코드와 스프라이트 에셋이 서로를 기다리지 않고 독립적으로 작업하기 위한 계약서입니다.
스프라이트 생성은 [sprite-gen](https://github.com/aldegad/sprite-gen) 스킬로 이뤄집니다.

## 핵심 원칙: 이모지 우선, 스프라이트 자동 승격

1. **코딩팀**은 새 비주얼이 필요하면 일단 이모지/캔버스로 구현하고, 반드시 `spriteHtml()`을 거치게 합니다.
2. **그래픽팀(Codex)**은 해당 폴더의 `sprite-request.json`을 실행해 아틀라스를 생성합니다.
3. 생성된 `manifest.json`의 `frame_layout`을 코드의 레이아웃 상수에 복사하면 **이모지가 자동으로 스프라이트로 승격**됩니다. 게임 로직은 단 한 줄도 바뀌지 않습니다.
4. 레이아웃에 없는 id는 항상 이모지로 폴백합니다. 게임은 어떤 시점에도 깨지지 않습니다.

## 코드 쪽 구조 (index.html)

```js
const SPRITE_ATLASES = {
  friends:      { src, sheet: {w,h}, layout: PRODUCER_SPRITE_LAYOUT },   // 연결됨
  items:        { src, sheet, layout: ITEM_SPRITE_LAYOUT },              // 연결됨
  achievements: { src, sheet, layout: ACHIEVEMENT_SPRITE_LAYOUT },       // 연결됨
  decor:        { src, sheet, layout: DECOR_SPRITE_LAYOUT },             // 연결됨
  blessings:    { src, sheet, layout: {...16종} },                       // 연결됨
  wishes:       { src, sheet, layout: {...7종} },                        // 연결됨
  cosmetics:    { src, sheet, layout: {...11종} },                       // 연결됨 (핑크 3종 틴트 복원)
  guests:       { src, sheet, layout: {...4종} },                        // 연결됨
  crystal:      { src, sheet: null, layout: {} },                        // 생성 대기 (이모지 폴백)
};

spriteHtml(atlasKey, id, fallbackEmoji, { size, className, frame })
// 슬라임 본체는 별도: SLIME_ATLAS (slime-main-ai) — 캔버스 CSS 배경 + 성향 오버레이 캔버스
```

- `sheet: null` 또는 layout에 id 없음 → `fallbackEmoji` 반환 (안전)
- 레이아웃 항목 형식: `id: [{ x, y, w, h }, ...]` — 배열 원소가 프레임. manifest의 `frame_layout`과 동일 형식이라 그대로 복사하면 됩니다.

## 그래픽팀 작업 절차 (Codex)

1. `assets/generated/sprites/<atlas-id>/sprite-request.json` 확인
2. sprite-gen 스킬 실행 → 같은 폴더에 `sprite-sheet-alpha.png` + `manifest.json` 생성
3. 완료 보고 시 `manifest.json`의 `frame_layout`과 시트 크기(`sheetWidth`/`sheetHeight`)를 전달

## 코딩팀 연결 절차 (Claude)

1. `SPRITE_ATLASES[key].sheet = { w: sheetWidth, h: sheetHeight }`
2. layout 상수에 `frame_layout` 사각형 복사
3. 프리뷰에서 아이콘 교체 확인 — 끝

## 규격 가이드

| 용도 | 셀 크기 | 프레임 | safe margin | 예 |
|---|---|---|---|---|
| 캐릭터(움직임 있음) | 896×896 | 2+ (idle 2프레임 기본) | 96 | friends |
| 상점/시스템 아이콘 | 384×384 또는 512×512 | 1 | 42~56 | items, decor, blessings |
| 소형 뱃지 | 256×256 | 1 | 28 | achievements |

- **chroma key — 색 충돌 규칙 (중요)**: 크로마 색과 비슷한 계열의 에셋은 생성 단계에서
  **회색으로 죽는다** (실측: magenta 크로마에서 핑크 에셋 전부 회색화, 알파는 정상).
  - 시트에 **핑크/마젠타/보라 계열** 에셋 포함 → chroma **green `#00FF00`** 사용
    (실측 2건: 핑크 전부 회색화, **라벤더 보라 묘사로 바꿔 재생성해도 여전히 회색** —
    마젠타 근접 색상대 전체가 위험. 회색 결과물은 `SPRITE_TINTS`로 코드 복원)
  - 시트에 **녹색 계열** 에셋 포함 → chroma **magenta `#FF00FF`** 사용
  - 둘 다 포함 → 시트를 색군별로 분리하거나, 한쪽 에셋의 묘사 색을 우회
    (예: 핑크 영혼 → 라벤더 보라)
  - 생성 후 반드시 대표 셀의 평균색을 확인할 것 (회색 rgb(140±20,140±20,140±20) = 실패)
  - **재생성 없이 코드로 복원 가능**: 회색 에셋은 명암이 살아있으므로
    `SPRITE_TINTS`(index.html)에 `'아틀라스:id': 'pink'|'violet'` 한 줄 추가하면
    CSS colorize(sepia→hue-rotate)로 색이 복원된다. 새 색이 필요하면 `TINT_FILTERS`에
    필터 추가 (핑크 hue 287°, 보라 220° — 캔버스 평균색 실측으로 튜닝된 값)
  - 전반적 채도 저하는 `.sprite-icon` 전역 `saturate(1.3)`으로 보정 중
- **style 문자열**: 기존 요청서의 것을 그대로 복사 (게임 전체 톤 통일). 변경 금지
- **state 이름 = 코드의 id**: 코드 데이터(`BLESSINGS[].id` 등)와 글자 단위로 일치해야 자동 연결됨
- 새 항목 추가 시: 코딩팀이 데이터에 id+이모지 추가 → 같은 커밋에서 sprite-request.json의 `states`에 동일 키로 action 설명 추가

## 현재 생성 대기 큐

| 아틀라스 | states | 상태 |
|---|---|---|
| slime-blessings-ai | 16 (진화 축복) | ⚠️ 연결됨, soulwhisper 회색화 → 라벤더 묘사로 재생성 대기 |
| slime-wishes-ai | 7 (소원 타입) | ✅ 생성·연결 완료 |
| slime-cosmetics-ai | 11 (꾸미기) | ⚠️ 부분 연결 (핑크 3종 폴백) → green 크로마로 재생성 대기 |
| slime-items-ai | 18 (강화/특성) | ⚠️ prestige 회색화 → 보라 묘사로 재생성 대기 |
| slime-guests-ai | 4 (먹구름·별똥이 + happy 표정) | ✅ 생성·연결 완료 |
| slime-main-ai | 5단계 ×2프레임 (본체) | ⚠️ 연결됨, strawberry 행 회색화 → 프리로드 시 `pinkifyGray()` 캔버스 베이크로 복원 중. green 크로마 재생성 시 코드 변경 없이 자동 정상화 |
| slime-traits-ai | 5 (성향 액세서리: muscle/ranch/star 2f/dream/samsara 2f) | ✅ 생성·연결 완료 — 본체와 같은 2×5 그리드, `#slime-canvas` CSS 다중 배경 상위 레이어로 합성. 미로드 시 오라 글로우 폴백 |
| slime-crystal-ai | 4 (젤리 결정 숙성: seed/sprout/bud/ripe 2프레임) | ✅ 생성·연결 완료 (green 크로마, 채도 정상 실측) |
| slime-goldstar-ai | 2 (황금별 2f, 미니 별똥별 2f) | 📝 요청서 작성됨 — 현 16px 수제 캔버스 교체, 256² magenta |
| slime-comboaura-ai | 4 (콤보 열기 tier0~3, 각 2f) | 📝 요청서 작성됨 — 슬라임 뒤에 깔 오라 링, 384² green (핑크 계열) |
| slime-coinpile-ai | 3 (코인 더미 1만/100만/1억) | 📝 요청서 작성됨 — 무대 바닥 재산 풍경, 256² magenta |
| slime-clickfx-ai | 1 (장갑 팝 3프레임 원샷) | 📝 요청서 작성됨 — 클릭 지점 버스트, 192² green (핑크 장갑) |

> 코덱스 실측 노트 (2026-06-12): green 크로마에서 보라(samsara) 추출 시 green fringe 미세 발생 —
> 추출 허용치 상향으로 해결 가능, 시각 결과 깨끗. 보라 계열도 green 크로마 계속 사용.

## 디자인 시스템 발 신규 요청 (claude.ai/design LiveGameScreen 핸드오프)

현재 CSS/캔버스 임시 표현으로 구현됨 — 스프라이트가 오면 교체. 출처: 디자인 번들 `reference/sprite-requests.md`

| 우선순위 | 항목 | 현재 임시 표현 | 스펙 | 상태 |
|---|---|---|---|---|
| ★★★ | 콤보 오라 4단계 (말랑/따끈/후끈/불타는) | CSS radial-gradient + 파티클 | 384² ×4단계 ×2프레임 | 📝 요청서 (slime-comboaura-ai) |
| ★★★ | 코인 더미 3단계 (1만/100만/1억) | 미구현 | 256² ×3 | 📝 요청서 (slime-coinpile-ai) |
| ★★ | 슬라임 표정 변형 (기쁨/놀람/뿌듯) | squish만 | main 아틀라스 확장 | 대기 |
| ★★ | 황금별 전용 스프라이트 | 수제 16px 캔버스 | 256² 2프레임 | 📝 요청서 (slime-goldstar-ai) |
| ★★ | 클릭 이펙트 (장갑 팝) | float 숫자만 | 192² 3프레임 | 📝 요청서 (slime-clickfx-ai) |
| ★ | 지면 텍스처 (진화 단계별 5종) | 글로우 그라디언트 | 412×80 타일 | 대기 |
| ★ | 트로피 선반 프레임 | 반투명 스트립 | 412×40 타일 | 대기 |

## 캔버스 직접 렌더

- **슬라임 본체** — ✅ `slime-main-ai` 아틀라스 연결됨 (하이브리드 방식):
  본체는 `#slime-canvas`의 CSS background로 아틀라스 셀을 깔고(`applySlimeSprite`, 200%×500% + %-position),
  캔버스 픽셀은 **성향 오버레이 전용**(`drawTraitOverlay` — 머리띠/모자/별가루/윤회 고리).
  실루엣 게이지도 같은 시트를 mask로 사용. 아틀라스 로드 실패 시 기존 16×17 픽셀 렌더로 자동 폴백.
  딸기 행은 마젠타 크로마 회색화(실측 3건째) → 프리로드에서 `pinkifyGray()`로 명암 보존 colorize 후
  blob URL로 교체. 시트를 green 크로마로 재생성하면 보정 코드는 no-op처럼 동작(유채색 픽셀은 건드리지 않음).
- **코인 아이콘, 황금별** — 8×8/16×16 수제 픽셀. 교체 원하면 동일 패턴으로 요청서 작성

## 친구 행동 애니메이션 프레임 확장

현재 친구는 아틀라스의 2프레임을 `--fx0/--fx1` CSS 변수로 스왑합니다 (`friendSpriteAnimHtml`).
프레임을 늘리려면:
1. sprite-request.json의 해당 state `frames`를 3+로 올려 재생성
2. `PRODUCER_SPRITE_LAYOUT[id]` 배열에 새 프레임 사각형 추가
3. 현재 CSS는 2프레임 고정이므로 3+ 프레임은 코딩팀에 알려주면 steps() 애니메이션으로 확장
