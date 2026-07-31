# Button 컴포넌트

버튼은 별도 HTML fragment를 불러오지 않고 일반 HTML에 공통 CSS 클래스를 직접 적용합니다. 작은 버튼을 비동기 include하는 대신 `.button`, `.icon-button`, `.icon`을 화면 전체의 공통 API로 사용합니다.

- 대표 검수: `component/index.html`의 Actions 영역
- 전체 일반 버튼: `component/button/button.html`
- 전체 아이콘 버튼: `component/button/icon-button.html`
- 필수 CSS: `component/button/button.css`
- 아이콘 경로: `data-icon`을 사용하는 화면은 `js/common.js`
- 메시지 피드백 동작: `component/chat-message/chat-message.js`

## 일반 버튼

필요한 형태를 아래 마크업에서 복사해 화면에 직접 작성합니다.

```html
<button type="button" class="button button-primary">저장</button>
```

아이콘이 포함된 일반 버튼도 같은 방식으로 작성합니다.

```html
<button type="button" class="button button-ghost">
    <img class="icon icon-small" data-icon="plus" alt="" aria-hidden="true" />
    룰 추가
</button>
```

검은색 강조 버튼은 `button-dark`, 테두리 버튼은 `button-outline`, 삭제 액션은 `button-danger`를 사용합니다.

테두리와 배경 없이 primary 색상으로 표시하는 텍스트 액션은 `button-text-primary`를 사용합니다.

```html
<button type="button" class="button button-text-primary">전체 이력 보기 ›</button>
```

Topbar의 주요 시작 액션을 파란색 틴트 배경과 테두리로 강조하되 채움 버튼보다 시각적 강도를 낮출 때는 34px 높이의 `button-soft-primary`를 사용합니다.

```html
<button type="button" class="button button-soft-primary">
    <img class="icon icon-small" data-icon="plus" alt="" aria-hidden="true" />
    <span>새 질의분류</span>
</button>
```

작은 액션은 실제 질의분류 화면과 동일하게 세로 패딩으로 24px 높이를 만듭니다.

```html
<button type="button" class="button button-sm button-outline">AI재분류</button>
<button type="button" class="button button-sm button-primary">확정</button>
```

## 컴포넌트 소유권

Button 카탈로그의 기본 버튼 영역은 `.button` 또는 `.icon-button`을 조합하는 공통 API입니다. 기존 화면 사례 영역에는 실제 페이지 버튼도 함께 표시하지만, 이는 화면과 동일한 모습을 확인하기 위한 검수용이며 공통 API가 아닙니다.

- 질의 카드의 `query-edit-btn`: `component/query-card`
- 모달의 `btn-cancel`, `btn-confirm`: `component/modal`
- 패널과 드로어의 `panel-action-btn`, `drawer-pos-btn`: 해당 Panel 또는 화면
- `rec-apply-bar`, `login-btn`: 해당 페이지 전용

페이지 전용 `btn-primary`, `btn-outline`을 공통 Button처럼 단독 복사하지 않습니다. 기존 화면을 유지할 때만 해당 구조를 사용하고, 새 공통 버튼은 `.button`에 역할 변형을 조합합니다.

```html
<button type="button" class="button button-outline">확인</button>
<button type="button" class="button button-primary">저장</button>
```

## 아이콘 버튼

일반 아이콘 전용 버튼에는 `.icon-button`을 사용합니다. 화면 기능이나 배치에 필요한 기존 클래스는 함께 유지할 수 있습니다.

```html
<button
    type="button"
    class="icon-button"
    aria-label="패널 위치 변경"
    title="패널 위치 변경"
>
    <img class="icon icon-primary" data-icon="panel-swap" alt="" aria-hidden="true" />
</button>
```

테두리가 없는 버튼은 `icon-button-ghost`, 주요 액션은 `icon-button-primary`, 삭제 액션은 `icon-button-danger`를 조합합니다. AI Workspace Topbar의 질의분류 목록과 룰 설정은 `icon-button-purple`, 실국별 알림 담당자 설정은 `icon-button-workspace`를 사용합니다. `icon-button-accent`, `icon-button-cyan`은 다른 화면의 Green/Cyan 의미색이 필요한 액션에만 사용합니다.

```html
<button type="button" class="icon-button icon-button-workspace"
    aria-label="실국별 알림 담당자 설정" title="실국별 알림 담당자 설정">
    <img class="icon icon-primary" data-icon="notification-assignee" alt="" aria-hidden="true" />
</button>
```

```html
<button type="button" class="icon-button icon-button-ghost panel-collapse-btn" aria-label="패널 접기">
    <img class="icon icon-small" data-icon="panel-collapse" alt="" aria-hidden="true" />
</button>
```

Topbar의 보조도구는 단독 아이콘 버튼을 임의로 나열하지 않고 `component/topbar/topbar.fragment`의 `.accessory-tool` 묶음을 사용합니다. 기본 상태에는 격자＋ 트리거만 노출하고, 펼침 상태에서는 트리거 왼쪽에 전체 글자크기·패널 위치 변경·레이아웃 초기화·전체화면 순서로 표시합니다. 트리거는 펼치면 파란 X 상태가 되며 `aria-expanded`도 함께 변경됩니다.

상세 Icon Button 카탈로그의 **Topbar 보조도구** 영역에서 네 기능을 직접 검수할 수 있고, **기본 32×32px** 영역에도 `전체 글자크기` 단독 사용 사례를 제공합니다. 글자크기와 전체화면은 `js/common.js`가 처리합니다. 전체 글자크기는 `--ui-font-scale`을 100~150%로 변경하며, 공통·페이지·컴포넌트 CSS의 모든 고정 글자 크기가 이 값을 사용합니다. 패널 자체의 폭·높이·간격은 확대하지 않습니다. 패널 위치 변경과 레이아웃 초기화는 `data-accessory-swap-target`, `data-accessory-layout-target`으로 페이지가 소유한 기존 버튼 이벤트에 연결합니다.

좋아요와 싫어요는 기존 메시지 버튼 클래스와 SVG 아이콘을 그대로 사용합니다. 선택 상태의 상호 배타 처리와 `aria-pressed` 동기화는 `ChatMessage`가 소유하므로 메시지 목록에 `component/chat-message/chat-message.js`를 함께 로드합니다.

```html
<button type="button" class="icon-button icon-button-ghost icon-button-message"
    data-action="like" aria-label="좋아요" aria-pressed="false" title="좋아요">
    <img class="icon icon-small" data-icon="thumbs-up" alt="" aria-hidden="true" />
</button>
<button type="button" class="icon-button icon-button-ghost icon-button-message"
    data-action="dislike" aria-label="싫어요" aria-pressed="false" title="싫어요">
    <img class="icon icon-small" data-icon="thumbs-down" alt="" aria-hidden="true" />
</button>
```

브랜드 버튼은 일반 아이콘 버튼의 상태 효과를 사용하지 않습니다. `.brand-icon-button`과 28px 전용 `.icon-brand`를 사용하며 `icon-button-ghost`를 조합하지 않습니다.

```html
<button type="button" class="brand-icon-button topbar-logo-btn" aria-label="일반 모드로 복귀">
    <img class="icon icon-brand" data-icon="ai-one-logo" alt="" aria-hidden="true" />
</button>
```

## 아이콘 버튼 상태 계약

아이콘 버튼의 호버 상태는 역할 변형의 의미색을 유지합니다. 공통 회색 호버가 의미색 변형을 덮어쓰지 않도록 역할 변형의 호버 규칙과 아이콘 필터를 `button.css`에서 함께 관리합니다.

| 변형 | 호버 상태 |
|---|---|
| `.icon-button`, `.icon-button-ghost` | 중립 배경·테두리와 본문색 아이콘 |
| `.icon-button-primary` | 진한 Primary 배경과 흰색 아이콘 |
| `.icon-button-accent` | Green 테두리·틴트 배경과 Green 아이콘 |
| `.icon-button-purple` | Purple 테두리·틴트 배경과 Purple 아이콘 |
| `.icon-button-workspace` | Primary 테두리·틴트 배경과 Primary 아이콘 |
| `.icon-button-cyan` | Cyan 테두리·틴트 배경과 Cyan 아이콘 |
| `.icon-button-danger` | Red 테두리·틴트 배경과 Red 아이콘 |
| `.icon-button-message` 좋아요·싫어요 선택 상태 | 투명 배경을 유지하고 Primary 아이콘 표시 |
| `.brand-icon-button` | 일반 아이콘 버튼 호버를 적용하지 않음 |

`document-statusbar-button`, `accessory-trigger`처럼 특정 컴포넌트가 별도 규격과 상호작용을 소유한 경우에는 해당 컴포넌트 CSS의 호버 규칙을 유지합니다. 공용 역할 변형의 의미색만 페이지 CSS에서 다시 정의하지 않습니다.

## 크기 체계

| 용도 | 버튼 규격 | 높이 결정 방식 | 아이콘 크기 |
|---|---:|---|---:|
| 작은 텍스트 버튼 | `.button-sm` 렌더 높이 24px | `padding: 4px 10px`, `min-height: auto` | 필요 시 `.icon-xsmall` 12px |
| 기본 텍스트 버튼 | `.button` 렌더 높이 32px | `min-height: 32px`, `padding: 0 12px` | `.icon-small` 14px |

| 용도 | 버튼 크기 | 아이콘 크기 |
|---|---:|---:|
| 작은 아이콘 버튼 | `.icon-button-sm` 24×24px | `.icon-small` 14×14px |
| 메시지 액션 버튼 | `.icon-button-message` 28×28px | `.icon-small` 14×14px |
| 기본 아이콘 버튼 | `.icon-button` 32×32px | `.icon-primary` 16×16px |
| 메시지 전송 버튼 | `.icon-button-send` 36×36px | `.icon-primary` 16×16px |
| 큰 아이콘을 넣은 기본 버튼 | `.icon-button` 32×32px | `.icon-large` 24×24px |
| 브랜드 전용 버튼 | `.brand-icon-button` 28×28px | `.icon-brand` 28×28px |
| 대형 아이콘 버튼 | `.icon-button-lg` 38×38px | `.icon-xlarge` 32×32px |

아이콘의 `width`, `height` 속성이나 화면별 크기 CSS는 작성하지 않습니다. 크기는 공통 아이콘 클래스로 지정합니다.

아이콘 버튼에는 보이는 텍스트가 없으므로 `aria-label`을 반드시 작성합니다. `title`은 마우스 사용자에게 같은 설명을 제공할 때 함께 작성합니다.

## 미리보기

`component/index.html`의 Actions 영역에서는 대표 변형을 확인하고, 각 카드의 **더보기**로 일반 버튼과 아이콘 버튼의 전체 상세 카탈로그를 확인합니다. 두 상세 HTML은 검수용 독립 페이지이며 운영 화면에서 include하지 않습니다. 탭, 필터, 칩, 메뉴, 내비게이션은 일반 액션 버튼과 동작·상태 체계가 달라 각각의 UI 컴포넌트로 관리합니다.
