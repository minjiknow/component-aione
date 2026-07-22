# Panel 컴포넌트

패널은 역할을 두 개로 나눠 조합합니다.

- `three-panel.html`: 왼쪽·가운데·오른쪽 배치, 크기 조절, 위치 교환
- `panel.html`: 개별 패널의 공통 외곽 구조와 접기 상태
- 검수 위치: `components/index.html`의 Layouts 영역
- 필수 CSS: `css/common.css`
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

## 적용 화면

- `pages/ai-intake.html`
- `pages/ai-answer.html`

두 화면 모두 `three-panel > panel 3개` 구조로 연결되어 있으며, 패널을 이동한 뒤에도 현재 위치를 기준으로 리사이즈와 접기가 동작합니다.

패널 위치는 각 패널의 헤더 빈 영역을 드래그해 서로 교환할 수 있습니다. 헤더 안의 버튼이나 입력 요소를 누를 때는 드래그가 시작되지 않습니다.

컴포넌트 기본 모양은 `components/index.html`의 Layouts 영역에서 확인합니다. `panel.html`과 `three-panel.html`은 `head`, `body`, script가 없는 실제 include fragment입니다.
