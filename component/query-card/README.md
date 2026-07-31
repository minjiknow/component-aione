# QueryCard 컴포넌트

국회 질의 분류 결과 한 건을 표시하는 업무 카드입니다. 화면은 질의 데이터와 선택 결과를 소유하고, 컴포넌트는 안전한 DOM 생성과 소관·검토 상태 표현을 담당합니다.

- 필수 CSS: `component/button/button.css`, `component/chip/chip.css`, `component/status-badge/status-badge.css`, `component/progressbar/progressbar.css`, `component/query-card/query-card.css`
- 필수 JS: `component/progressbar/progressbar.js`, `component/query-card/query-card.js`
- 검수 페이지: `component/query-card/query-card.html`
- 통합 검수: `component/index.html`의 Display 영역
- 실제 사용: `pages/ai-workspace.html`, `js/legislative-question-workspace.js`
- 루트: `.query-card`
- 소관 유형: `data-type="single|multi|none"`
- 선택 상태: `.is-selected`
- 검토 상태: `.needs-review`

## 목록 구조

```html
<div class="query-list" data-query-card-list></div>
```

`AIOneQueryCard.renderList()`가 목록 안에 `.query-card`를 생성합니다. 카드 내부의 Button, Chip, StatusBadge, ProgressBar는 기존 공통 컴포넌트 클래스와 동작을 그대로 조합합니다.

## 동적 목록 API

```js
window.AIOneQueryCard.renderList('[data-query-card-list]', queries, {
	editable: true
});
```

질의 데이터에서 사용할 수 있는 값은 다음과 같습니다.

- `id`, `text`: 질의 번호와 본문
- `type`: `single`, `multi`, `none`
- `typeLabel`: 기본 소관 유형 문구를 바꿔야 할 때만 사용
- `mainDept`, `coopDept`, `org`: 주관·협조 실국 또는 비소관 기관
- `reason`: AI 분류 근거
- `confidence`: 0~100 신뢰도
- `conflict`: `ruleLabel`, `ruleDept`, `aiDept`를 가진 룰 충돌 정보
- `needsReview`: 검토필요 상태를 명시적으로 지정
- `selected`: 최초 선택 상태

`needsReview: true`일 때만 카드 헤더에 검토필요 상태를 표시합니다. 룰 충돌은 `conflict` 데이터로 별도 검토 박스를 표시하므로 신뢰도만으로 검토필요를 추정하지 않습니다. `editable: false`이면 수정 버튼을 렌더링하지 않습니다.

AI 분류 근거는 기존 `ai-search.svg`를 사용한 아이콘, 제목, 설명으로 구성합니다. 룰 충돌 박스는 `ruleDept`와 `aiDept`의 차이, `ruleLabel`을 분리해 표시하며 카드별 판단 데이터는 화면에서 전달합니다.

## 이벤트

- `query-card:select`: 카드 클릭 또는 Enter/Space 선택
- `query-card:edit`: 수정 버튼 선택
- `query-card:list-rendered`: 목록 렌더링 완료

`query-card:select`와 `query-card:edit`의 `event.detail`은 `id`와 `scope`를 제공합니다. `scope`는 카드의 `type`과 같은 `single`, `multi`, `none` 중 하나입니다. 수정 이벤트에는 Modal 입력값을 채울 수 있도록 `event.detail.query`에 `id`, `type`, `typeLabel`, `text`, `mainDept`, `coopDept`, `org`도 제공합니다. `query-card:list-rendered`는 `event.detail.count`로 렌더링한 카드 수를 제공합니다. 화면 스크립트는 이벤트를 받아 상세 패널 갱신, 선택 클래스 동기화, 수정 동작을 처리합니다.

## 접근성

카드는 키보드 포커스를 받을 수 있고 Enter/Space로 선택할 수 있습니다. 신뢰도는 `role="progressbar"`와 `aria-valuenow`를 사용하며, 준비된 공통 ProgressBar 스크립트가 표시값과 색상 상태를 동기화합니다.
