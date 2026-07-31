# Split panel

`split-handler.html`은 패널 본문을 좌우 두 영역으로 나눌 때 사용하는 공통 컴포넌트입니다. Answer의 문서 비교처럼 세 영역 이상을 나눌 때는 각 영역에 `.split-handler-pane`을 적용하고, 인접 영역 사이마다 같은 `.split-handler-handle`을 배치합니다.

- `split-handler.html`, `resize-handler.html`: 실제 include fragment
- 검수 위치: `component/index.html`의 Layouts 영역
- 필수 CSS: `component/handler/handler.css`
- 필수 JS: `component/handler/handler.js`

```html
<div data-include="handler/split-handler" data-include-source="html" data-split-min="100">
    <div class="split-handler-left" data-slot="left">
        <div class="sub-head">
            <span class="sub-title">원본 보기</span>
        </div>
        <div>왼쪽 내용</div>
    </div>

    <div class="split-handler-right" data-slot="right">
        <div class="sub-head">
            <span class="sub-title">질의 추출 결과</span>
        </div>
        <div>오른쪽 내용</div>
    </div>
</div>
```

- `data-split-min`: 좌우 영역이 줄어들 수 있는 최소 너비입니다.
- `.sub-head`, `.sub-title`: 각 영역의 제목 행과 제목에 사용하는 공통 클래스입니다. 제목 문구와 우측 옵션은 페이지 슬롯에서 작성합니다.
- 마우스, 터치, `ArrowLeft`, `ArrowRight` 키로 너비를 조절할 수 있습니다.
- 공통 구조·스타일·동작은 각각 `split-handler.html`, `handler.css`, `handler.js`에서 관리합니다.
- 페이지 CSS에는 간격이나 특정 영역의 고정 너비처럼 해당 화면에만 필요한 차이만 작성합니다.

세 영역 이상에서는 separator 순서와 pane 순서를 동일하게 유지합니다.

```html
<div class="split-handler" data-component="split-handler" data-split-min="180">
    <section class="split-handler-pane">기준 문서</section>
    <div class="split-handler-handle" role="separator" aria-label="기준 문서와 비교 문서 너비 조절"
        aria-orientation="vertical" tabindex="0"></div>
    <section class="split-handler-pane">비교 문서</section>
    <div class="split-handler-handle" role="separator" aria-label="비교 문서와 분석 영역 너비 조절"
        aria-orientation="vertical" tabindex="0"></div>
    <aside class="split-handler-pane">차이점 분석</aside>
</div>
```

## Resize handler

`resize-handler.html`은 독립된 두 패널을 좌우로 배치하고 가운데 separator로 너비를 조절할 때 사용합니다. 호출부는 `left`, `right` 슬롯을 모두 제공해야 하며 각 슬롯의 최상위 요소에는 기존 `.resize-panel-left` 클래스를 유지합니다.

`.split-handler-handle`은 `260726/ai-intake.html`의 문서 비교 구분선과 같은 2px 시각 규칙을 사용합니다. 기본 배경은 `rgba(209, 217, 224, .38)`, `border-radius`는 `2px`이며 별도 margin 없이 높이를 모두 채웁니다. Hover/Active일 때 `var(--primary)`로 변경되고 중앙에 1px × 22px 보조선이 표시됩니다. `.resize-panel-layout > .panel-resize-handle`도 같은 기본 선과 Hover/Active 색을 사용합니다.

Resize Handler는 `data-split-min="220"`을 기본값으로 사용하므로 왼쪽과 오른쪽 패널 모두 220px보다 작아지지 않습니다. separator의 `aria-valuemin`도 220으로 유지합니다.

두 handler 모두 화면에 표시되는 separator에 `role="separator"`, `tabindex="0"`, `aria-orientation="vertical"`을 유지해야 키보드 조절이 가능합니다.

## Fragment 소스

`split-handler.html`

```html
<!-- Split handler fragment: left와 right 슬롯을 모두 전달합니다. -->
<div class="split-handler" data-component="split-handler" data-split-min="160">
    <div class="split-handler-left" data-slot="left"></div>
    <div class="split-handler-handle" role="separator" aria-label="좌우 영역 크기 조절" aria-orientation="vertical" tabindex="0"></div>
    <div class="split-handler-right" data-slot="right"></div>
</div>
```

`resize-handler.html`

```html
<!-- Resize handler fragment: left와 right 슬롯을 모두 전달합니다. -->
<main class="resize-panel-layout" data-component="resize-panel-layout" data-split-min="220">
    <section class="resize-panel" data-component="resize-panel">
        <div class="resize-panel-left" data-slot="left"></div>
    </section>
    <div class="panel-resize-handle" data-resize="0" role="separator" aria-label="좌우 패널 크기 조절" aria-orientation="vertical" tabindex="0" aria-valuemin="220"></div>
    <section class="resize-panel" data-component="resize-panel">
        <div class="resize-panel-left" data-slot="right"></div>
    </section>
</main>
```
