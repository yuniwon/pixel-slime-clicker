# 애널리틱스 해석 가이드 — GoatCounter로 "좋아함/싫어함" 읽기

서버 없이 GoatCounter 하나로 행동 비율을 읽는 방법.
핵심 원리: **모든 신호는 세션당 최대 1회 전송** → 대시보드에서 `신호 수 ÷ session/start 수` = **그 행동을 한 세션의 비율**.

대시보드: https://yuniwon.goatcounter.com (이벤트는 경로별로 잡힘)

## 이벤트 체계

| 접두사 | 의미 | 전송 시점 |
|---|---|---|
| `/...` (일반 경로) | 방문 (페이지뷰) | 페이지 로드 |
| `m/...` | 진행 마일스톤 | **세이브당 1회** (기기 누적 진행) |
| `session/start` | 세션 시작 — **모든 비율의 분모** | 세션당 1회 |
| `s/...` | 참여 신호 (좋아함) | 세션당 1회 |
| `x/...` | 마찰 신호 (싫어함) | 세션당 1회 |
| `session/len-*` | 세션 길이 버킷 | 이탈 시 (keepalive) |
| `exit/at-*` | 이탈 시점의 진행 구간 | 이탈 시 (keepalive) |

## 읽는 법 1 — 깔때기 (어디서 멈추나)

`m/` 마일스톤은 세이브당 1회라 신규 유저 깔때기 그대로:

```
m/first-friend → m/first-upgrade → m/first-blessing → m/evo-sea-lv5
→ m/lv10 → m/lv15 → m/god-lv20 → m/rebirth-1 → m/rebirth-3 → m/cosmic-seed
```

인접 단계 간 큰 낙폭 = 그 구간이 병목. 예: `lv10 40 → lv15 12`면 Lv10~15 페이싱 점검.
`m/day2-return ÷ m/first-friend` ≈ 신규의 익일 복귀율 (D1 프록시).

## 읽는 법 2 — 참여율 (뭘 좋아하나)

각 `s/` 신호를 `session/start`로 나눈다:

| 신호 | 높으면 | 낮으면 의심할 것 |
|---|---|---|
| `s/star-clicked` | 황금별이 잘 작동 | 별이 안 보임/시시함 — 등장 연출·보상 |
| `s/cloud-engaged` → `s/cloud-success` | 먹구름 재미 + 적정 난이도 | engaged 낮음=무시당함, success/engaged 낮음=너무 어려움 |
| `s/starlet-helped` | 별똥이 상호작용 통함 | 역할 불명 — 힌트 점검 |
| `s/reroll`, `s/skip` | 축복 선택에 고민함 (좋은 신호) | 축복이 무의미하게 느껴짐 |
| `s/wish-strip-click` | 소원 스트립이 동기부여로 작동 | 스트립 무시 — 위치·시인성 |
| `s/crystal-harvest`, `s/crystal-feed` | 데일리 루프 정착 | 화단 이해 못 함 |
| `s/golden-wish-done` | 데일리 목표 적정 난이도 | 목표가 너무 멂 |
| `s/decor-buy`, `s/cosmetic-buy` | 소장 욕구 작동 | 가격/매력 부족 |
| `s/rebirth`, `s/challenge-start` | 메타 루프 진입 | 환생 동기 부족 |

## 읽는 법 3 — 마찰 신호 (뭘 싫어하나)

- `x/sound-off ÷ session/start` 높음 → 효과음 볼륨·피치 재조정 (특히 음계 클릭)
- `x/music-off` 높음 → BGM 톤 점검
- `session/len-bounce-1m` 비중 높음 → 첫 화면에서 흥미 실패 — 온보딩 점검
- `exit/at-pre-friend` 많음 → 첫 60초 안에서 이탈 — 치명적, 최우선 수정
- `exit/at-lv5-9` 등 특정 구간 집중 → 그 구간 콘텐츠 골짜기

## 건강 기준선 (소표본 가늠자)

```
s/star-clicked / session/start        ≥ 60%
s/cloud-engaged / session/start       ≥ 30%
session/len-bounce-1m / session 시작  ≤ 25%
exit/at-pre-friend / 전체 exit        ≤ 15%
m/day2-return / m/first-friend        ≥ 25%
x/sound-off / session/start           ≤ 15%
```

## 주의사항

- **광고 차단기 누락**: uBlock 등이 GoatCounter를 막는다 — 실제보다 20~40% 적게 잡힐 수 있음. 절대값보다 **비율과 추세**로 읽을 것.
- **소표본**: 수십 세션 미만에선 비율이 요동친다. 단일 수치보다 일주일 추세.
- **m/ vs s/ 분모 차이**: `m/`은 세이브(사람)당 1회, `s/`는 세션당 1회 — 서로 직접 나누지 말 것.
- **이탈 신호 유실**: 모바일 강제 종료 등에서 `exit/*`가 안 갈 수 있음 — `session/start - Σlen` 차이가 유실분.
- 새 신호 추가 시: `gcSession('s/이름')` 한 줄 + 이 문서에 등재 + PRIVACY.md 범위에 맞는지 확인.
