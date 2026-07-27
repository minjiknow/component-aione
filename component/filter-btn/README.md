# Filter Button 컴포넌트

AI Intake 질의 목록의 표시 범위를 좁히는 필터 버튼입니다. 기존 `.filter-btn`, `.filter-count`는 유지하고 목록 컨테이너는 공통 `.filter-bar`를 사용합니다.

- 필수 CSS: `css/common.css`
- 필수 JS: `js/common.js`
- 검수 페이지: `component/filter-btn/filter-btn.html`
- 목록 클래스: `.filter-bar`
- 버튼 클래스: `.filter-btn`
- 건수 클래스: `.filter-count`
- 활성 상태: `.active`, `aria-pressed="true"`

```html
<div class="filter-bar" role="toolbar" aria-label="질의 필터">
    <button type="button" class="filter-btn active"
        aria-pressed="true" data-filter="all">
        전체 <span class="filter-count">4</span>
    </button>
    <button type="button" class="filter-btn"
        aria-pressed="false" data-filter="single">
        단일소관 <span class="filter-count">2</span>
    </button>
    <button type="button" class="filter-btn"
        aria-pressed="false" data-filter="multi">
        복수소관 <span class="filter-count">1</span>
    </button>
</div>
```

## 동작 규칙

- 공통 JS는 클릭한 버튼으로 `.active`와 `aria-pressed="true"`를 이동시킵니다.
- 실제 목록 필터링은 `filter-btn:change` 이벤트의 `event.detail.filter` 값을 받아 처리합니다.
- 활성 버튼은 hover해도 활성 모양을 그대로 유지합니다.
- 키보드 사용자가 상태를 알 수 있도록 `aria-pressed`를 실제 선택 상태와 동기화합니다.
- 비활성 항목에는 `disabled`를 사용합니다.
