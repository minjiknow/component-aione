# Chip 컴포넌트

필터 결과를 전환하는 Filter Button과 구분되는 일반 칩입니다. AI Answer의 기존 추천 프롬프트와 추천 키워드 스타일을 컴포넌트 전용 CSS로 분리해 재사용합니다.

- 필수 CSS: `component/chip/chip.css`
- 필수 JS: 없음
- 검수 페이지: `component/chip/chip.html`
- 클릭형 Action Chip: `.chat-tag`
- 표시형 Info Chip: `.rec-tag`

## Action Chip

추천 문구를 입력하거나 화면 동작을 실행하는 버튼에 사용합니다.

```html
<button type="button" class="chat-tag">요약</button>
<button type="button" class="chat-tag">표로 정리</button>
```

## Info Chip

추천 자료의 키워드처럼 읽기 전용 정보를 표시할 때 사용합니다.

```html
<span class="rec-tag">재정정책</span>
<span class="rec-tag">국회질의</span>
```

클릭형 Chip의 실제 동작은 사용하는 화면에서 연결합니다. 목록 결과를 필터링하는 용도로는 `filter-btn` 컴포넌트를 사용합니다.
