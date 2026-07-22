# Split panel

`split-handler.html`은 패널 본문을 좌우 두 영역으로 나눌 때만 선택해서 사용하는 공통 컴포넌트입니다.

- `split-handler.html`, `resize-handler.html`: 실제 include fragment
- 검수 위치: `components/index.html`의 Layouts 영역
- 필수 CSS: `css/common.css`
- 필수 JS: `js/common.js`

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
- 공통 구조와 스타일, 리사이즈 동작은 각각 `split-handler.html`, `common.css`, `common.js`에서 관리합니다.
- 페이지 CSS에는 간격이나 특정 영역의 고정 너비처럼 해당 화면에만 필요한 차이만 작성합니다.

## Resize handler

`resize-handler.html`은 독립된 두 패널을 좌우로 배치하고 가운데 separator로 너비를 조절할 때 사용합니다. 호출부는 `left`, `right` 슬롯을 모두 제공해야 하며 각 슬롯의 최상위 요소에는 기존 `.resize-panel-left` 클래스를 유지합니다.

Resize Handler의 `.resize-panel-layout > .panel-resize-handle`은 두 패널 사이 높이를 모두 채우는 4px 구분선입니다. 기본 배경은 `var(--border)`, margin과 border-radius는 0이며 Hover/Active일 때만 `var(--primary)`로 변경됩니다. Three Panel의 `.panel-resize-handle`에도 같은 시각 규칙을 사용하고, 한 패널 내부를 나누는 `.split-handler-handle`과는 구분합니다.

Resize Handler는 `data-split-min="220"`을 기본값으로 사용하므로 왼쪽과 오른쪽 패널 모두 220px보다 작아지지 않습니다. separator의 `aria-valuemin`도 220으로 유지합니다.

두 handler 모두 화면에 표시되는 separator에 `role="separator"`, `tabindex="0"`, `aria-orientation="vertical"`을 유지해야 키보드 조절이 가능합니다.
