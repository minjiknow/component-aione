# Service Card

AI-ONE 홈에서 서비스 진입점을 표시하는 카드입니다. 현재 홈 화면의 마크업, SVG 아이콘, hover 스타일을 그대로 사용합니다.

- 필수 CSS: `component/service-card/service-card.css`
- 검수 위치: `component/index.html`의 Actions 영역
- 실행형 fragment: `component/service-card/service-card.html`

## 목록 구조

```html
<ul class="service-cards" aria-label="AI 서비스">
    <!-- service-card.html의 .service-item을 반복 -->
</ul>
```

- 활성 카드는 hover 시 `border-color: var(--primary)`, `box-shadow: 0 8px 8px 0 rgba(9, 105, 218, .12)`, `translateY(-3px)`가 적용됩니다.
- 아이콘은 `assets/icons/service-*.svg` 파일을 사용하고 hover 시 `scale(1.1)`이 적용됩니다.
- 준비 중인 카드는 `data-soon`과 `aria-disabled="true"`를 함께 사용하며 hover 이동·shadow·아이콘 확대를 적용하지 않습니다.
