# Badge 컴포넌트

업무 유형처럼 짧은 분류 정보를 표시할 때 사용합니다. AI-ONE 홈의 기존 `.type-badge` 스타일을 공통 CSS로 옮겨 그대로 재사용합니다.

- 필수 CSS: `css/common.css`
- 필수 JS: 없음
- 검수 페이지: `component/badge/badge.html`
- 기본 클래스: `.type-badge`
- 유형: `.ai`, `.search`, `.report`, `.doc`
- 변경 대상: 배지 문구와 의미에 맞는 유형 클래스

```html
<span class="type-badge ai">AI 초안</span>
<span class="type-badge search">검색</span>
<span class="type-badge report">보고서</span>
<span class="type-badge doc">문서관리</span>
```

색상은 의미가 고정된 기존 유형 클래스에서 가져옵니다. 화면별로 새로운 색상이나 별도 배지 클래스를 추가하지 않습니다.
