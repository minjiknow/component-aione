# ProgressBar 컴포넌트

AI Intake의 분류 신뢰도를 표시하는 퍼센트 막대를 공통화한 컴포넌트입니다. 값에 따라 Fill 색상이 자동으로 변경됩니다.

- Fragment: `component/progressbar/progressbar.fragment.html`
- 필수 CSS: `component/progressbar/progressbar.css`
- 필수 JS: `component/progressbar/progressbar.js`
- 검수 페이지: `component/progressbar/progressbar.html`
- 루트: `.progressbar[data-progressbar]`
- Fill: `.progressbar-fill`
- 큰 높이: `.progressbar-lg`
- 실제 사용: `js/ai-intake.js`

## 색상 기준

- `90% 이상`: Green (`is-high`)
- `75~89%`: Primary blue (`is-medium`)
- `75% 미만`: Orange (`is-low`)

```html
<div class="progressbar-row">
    <span class="progressbar-label">신뢰도</span>
    <div class="progressbar"
        data-progressbar
        data-value="94"
        role="progressbar"
        aria-label="신뢰도 94%"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="94">
        <div class="progressbar-fill"></div>
    </div>
    <span class="progressbar-value"
        data-progressbar-value>94%</span>
</div>
```

`data-value`와 `aria-valuenow`에는 현재 퍼센트 값을 전달합니다. 컴포넌트 스크립트가 값을 0~100 범위로 보정하고 Fill 너비, 색상 상태, `[data-progressbar-value]`의 표시값을 함께 갱신합니다.

동적으로 값을 바꿀 때는 공통 API를 사용합니다.

```js
window.AIOneProgressBar.setValue(progressbarElement, 82);
```

동적으로 추가한 마크업은 부모 요소를 전달하여 초기화합니다.

```js
window.AIOneProgressBar.init(containerElement);
```

AI Intake 상세 패널처럼 8px 높이가 필요하면 `.progressbar-lg`를 추가합니다. 기본 높이는 첨부 시안과 같은 6px입니다.
