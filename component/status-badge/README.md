# StatusBadge 컴포넌트

현재 처리 단계나 완료 상태를 표시할 때 사용합니다. AI Intake에서 사용하던 `.status-badge`, `.badge-sample`, `.badge-done` 스타일을 공통 CSS로 옮겨 그대로 재사용합니다.

- 필수 CSS: `component/status-badge/status-badge.css`
- 필수 JS: 없음
- 검수 페이지: `component/status-badge/status-badge.html`
- 기본 클래스: `.status-badge`
- 상태: `.badge-sample`, `.badge-done`, `.badge-review`
- 변경 대상: 상태 문구와 실제 상태에 맞는 modifier

```html
<span class="status-badge badge-sample">샘플 검토</span>
<span class="status-badge badge-done">처리 완료</span>
<span class="status-badge badge-review">검토필요</span>
```

기본 클래스와 상태 modifier를 항상 함께 사용합니다. 상태는 텍스트로도 전달해 색상만으로 의미를 구분하지 않습니다.
