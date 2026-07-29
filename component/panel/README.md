# Panel 컴포넌트

패널은 역할을 두 개로 나눠 조합합니다.

- `three-panel.html`: 왼쪽·가운데·오른쪽 배치, 크기 조절, 순서 변경
- `panel.html`: 개별 패널의 공통 외곽 구조와 접기 상태
- 검수 위치: `component/index.html`의 Layouts 영역
- 필수 CSS: `component/panel/panel.css`
- 필수 JS: `js/common.js`

실제 페이지에서는 `three-panel`의 각 슬롯에 `panel`을 하나씩 넣습니다. 패널 안에 다른 패널을 중첩하지 않습니다.

## 기본 사용법

아래 형태를 왼쪽·가운데·오른쪽 슬롯에 반복해서 사용합니다.

```html
<div data-include="panel/three-panel" data-include-source="html">
    <div
        data-include="panel/panel"
        data-include-source="html"
        data-slot="left"
        class="panel-left"
        aria-label="자료 패널"
        data-panel="left"
    >
        <header class="panel-head">
            <h2 class="panel-title">자료</h2>
            <div class="panel-actions">
                <button
                    type="button"
                    class="panel-collapse-btn"
                    data-panel-action="collapse"
                    aria-label="패널 접기"
                >
                    접기
                </button>
            </div>
        </header>

        <div>패널 본문</div>
    </div>

    <div data-include="panel/panel" data-include-source="html" data-slot="center"><!-- 가운데 패널 --></div>
    <div data-include="panel/panel" data-include-source="html" data-slot="right"><!-- 오른쪽 패널 --></div>
</div>
```

`left`, `center`, `right`는 각 패널의 `data-slot` 속성으로만 구분합니다. 패널의 헤더와 본문은 모두 일반 HTML로 작성합니다.

## 버튼 구분

```html
data-panel-action="refresh"   <!-- 새로고침 -->
data-panel-action="collapse"  <!-- 패널 접기 -->
data-panel-action="new-chat"  <!-- 새 채팅 -->
data-panel-action="chat-list" <!-- 채팅 목록 -->
```

- 접기 버튼은 `common.js`가 공통으로 처리합니다.
- 새로고침·새 채팅·채팅 목록은 페이지별 JavaScript에서 실제 기능을 연결합니다.
- 사용하지 않는 버튼은 넣지 않습니다.
- 기존 페이지 기능과 연결된 `id`는 그대로 유지할 수 있습니다.

페이지에서 지정한 `class`, `aria-label`, `data-panel` 같은 속성은 불러온 `panel.html`의 최상위 패널에 자동으로 전달됩니다.

## Three Panel 레이아웃 제어

컴포넌트 카탈로그의 `패널 위치 변경`과 `패널 초기화`는 공통 Icon Button을 사용하며, `aria-controls`로 제어할 Three Panel을 지정합니다.

```html
<button type="button" class="icon-button"
    data-three-panel-action="rotate"
    aria-controls="catalogThreePanel"
    aria-label="패널 위치 변경"
    title="패널 위치 변경">
    <img class="icon icon-primary" data-icon="panel-swap" alt="" aria-hidden="true" />
</button>

<button type="button" class="icon-button"
    data-three-panel-action="reset"
    aria-controls="catalogThreePanel"
    aria-label="패널 초기화"
    title="패널 초기화">
    <img class="icon icon-primary" data-icon="layout-columns" alt="" aria-hidden="true" />
</button>
```

- `rotate`: 첫 번째 패널을 마지막 위치로 순환 이동하며 패널별 폭을 유지합니다.
- `reset`: 패널 순서, 너비와 접힘 상태를 최초 레이아웃으로 복원합니다.
- 실제 화면에서 기존 `#panelSwapBtn`, `#layoutResetBtn`을 사용 중이면 페이지 JavaScript 연결을 유지할 수 있습니다.

## 적용 화면

- `html/ai-intake.html`
- `html/ai-answer.html`
- `pages/ai-workspace.html`

각 화면은 `three-panel > panel 3개` 구조로 연결되어 있으며, 패널 순서를 변경한 뒤에도 현재 위치를 기준으로 리사이즈와 접기가 동작합니다. 왼쪽·오른쪽 패널의 고정 폭과 가운데 패널의 가변 폭 역할은 패널 요소를 따라 이동합니다.

패널 헤더의 빈 영역을 다른 패널로 드래그하면 패널 요소 전체가 목표 순번으로 이동하고, 사이 패널은 한 칸씩 밀립니다. 헤더 안의 버튼이나 입력 요소를 누를 때는 드래그가 시작되지 않습니다.

컴포넌트 기본 모양은 `component/index.html`의 Layouts 영역에서 확인합니다. `panel.html`과 `three-panel.html`은 `head`, `body`, script가 없는 실제 include fragment입니다.

## Fragment 소스

`panel.html`

```html
<!-- Panel component fragment: 호출부의 내용을 content 슬롯에 전달합니다. -->
<section class="panel panel-component" data-component="panel">
    <div class="panel-component-slot" data-slot="content"></div>
</section>
```

`three-panel.html`

```html
<!-- Three panel layout fragment: left, center, right 슬롯을 모두 전달합니다. -->
<main class="three-panel" data-component="three-panel">
    <div data-slot="left"></div>
    <div class="panel-resize-handle" data-resize="0" role="separator" aria-label="왼쪽 패널 크기 조절" aria-orientation="vertical" tabindex="0"></div>
    <div data-slot="center"></div>
    <div class="panel-resize-handle" data-resize="1" role="separator" aria-label="오른쪽 패널 크기 조절" aria-orientation="vertical" tabindex="0"></div>
    <div data-slot="right"></div>
</main>
```
