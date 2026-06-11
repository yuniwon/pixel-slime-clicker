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
  blessings:    { src, sheet: null, layout: {} },                        // 생성 대기
  wishes:       { src, sheet: null, layout: {} },                        // 생성 대기
  cosmetics:    { src, sheet: null, layout: {} },                        // 생성 대기
};

spriteHtml(atlasKey, id, fallbackEmoji, { size, className, frame })
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
| slime-guests-ai | 2 (먹구름 손님: raincloud 2프레임 + raincloud-happy) | ⏳ 요청서 작성됨, 생성 대기 |

## 캔버스 직접 렌더 (스프라이트 교체 대상 아님)

- **슬라임 본체** — 성향 오버레이(`drawTraitOverlay`)가 픽셀 단위로 합성되므로 캔버스 유지가 설계 의도.
  본체 교체는 `slime-main-ai` 아틀라스와 함께 별도 설계 필요 (보류 중)
- **코인 아이콘, 황금별** — 8×8/16×16 수제 픽셀. 교체 원하면 동일 패턴으로 요청서 작성

## 친구 행동 애니메이션 프레임 확장

현재 친구는 아틀라스의 2프레임을 `--fx0/--fx1` CSS 변수로 스왑합니다 (`friendSpriteAnimHtml`).
프레임을 늘리려면:
1. sprite-request.json의 해당 state `frames`를 3+로 올려 재생성
2. `PRODUCER_SPRITE_LAYOUT[id]` 배열에 새 프레임 사각형 추가
3. 현재 CSS는 2프레임 고정이므로 3+ 프레임은 코딩팀에 알려주면 steps() 애니메이션으로 확장
