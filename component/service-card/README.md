# ServiceCard 컴포넌트

AI-ONE 홈에서 서비스 진입점을 표시하는 카드입니다. 화면은 서비스 데이터를 소유하고, 컴포넌트는 기존 홈 카드 DOM과 활성·준비 중 상태를 생성합니다.

- 필수 CSS: `component/service-card/service-card.css`
- 필수 JS: `component/service-card/service-card.js`
- 검수 페이지: `component/service-card/service-card.html`
- 통합 검수: `component/index.html`의 Display 영역
- 실제 사용: `html/ai-home.html`, `js/ai-home.js`, `pages/ai-home.html`, `js/ai-home-page.js`
- 목록: `.service-cards`
- 항목: `.service-item`
- 카드: `.service-card`

## 목록 구조

```html
<ul class="service-cards"
	aria-label="AI 서비스"
	data-service-card-list></ul>
```

`AIOneServiceCard.renderList()`가 각 데이터를 `.service-item > .service-card` 구조로 렌더링합니다. 아이콘은 기존 `assets/icons/service-*.svg` 자산을 사용합니다.

## 동적 목록 API

```js
window.AIOneServiceCard.renderList('[data-service-card-list]', [
	{
		href: 'ai-intake.html',
		icon: '../assets/icons/service-question-classification.svg',
		iconTone: 'blue',
		title: '국회 질의 분류',
		description: '질의 업로드 · OCR/파싱 · 질의 분류 · 추천실국 확인'
	},
	{
		icon: '../assets/icons/service-answer-draft.svg',
		iconTone: 'green',
		title: '국회 답변서 초안 생성',
		description: '자료 분석 · 유사답변서 추천 · 초안 생성 · 편집',
		modalTarget: 'preparingServiceModal'
	}
]);
```

- `href`: 이동할 화면 경로
- `icon`: 기존 서비스 SVG 아이콘 경로
- `iconTone`: `blue`, `green`, `orange`, `purple`
- `title`: 서비스명
- `description`: 서비스 단계 또는 기능 설명
- `disabled`: 준비 중 여부
- `modalTarget`: 화면 이동 대신 열 Modal의 `id`

## 상태

- 활성 카드는 hover 시 Primary border, shadow, 위쪽 이동과 아이콘 확대가 적용됩니다.
- 준비 중인 서비스는 `disabled: true`를 전달합니다.
- 준비 중 카드는 `data-soon`과 `aria-disabled="true"`를 함께 가지며 hover 이동·shadow·아이콘 확대를 적용하지 않습니다.
- 안내 팝업을 여는 카드는 `modalTarget`을 전달해 `[data-modal-open]` 트리거로 렌더링합니다. 이 경우 `disabled`를 함께 사용하지 않습니다.
- 준비 중 안내 메시지처럼 화면에 종속된 동작은 사용하는 홈 화면의 `ai-home.js` 또는 `ai-home-page.js`가 처리합니다.

## 이벤트

목록 렌더링이 끝나면 목록 요소에서 `service-card:list-rendered` 이벤트가 발생합니다. `event.detail.count`로 렌더링한 카드 수를 확인할 수 있습니다.
