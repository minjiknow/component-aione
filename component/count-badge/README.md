# CountBadge 컴포넌트

목록이나 필터의 항목 수를 짧게 표시할 때 사용합니다. 기존 Filter Button에서 사용하는 `.filter-count`를 별도 컴포넌트로 문서화합니다.

- 필수 CSS: `css/common.css`
- 필수 JS: 없음
- 검수 페이지: `component/count-badge/count-badge.html`
- 클래스: `.filter-count`
- 변경 대상: 표시 숫자와 접근성 문구

```html
<span class="filter-count" aria-label="8건">8</span>
```

숫자가 계속 증가하는 화면은 서비스 정책에 따라 `99+`처럼 상한을 표시하고, 실제 의미는 `aria-label`에 함께 제공합니다.
