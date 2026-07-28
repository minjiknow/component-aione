# DropdownMenu 컴포넌트

기존 AI-ONE 홈과 챗봇에서 사용하는 모델 선택 메뉴를 공통 DropdownMenu 동작 계약으로 정리한 컴포넌트입니다. 트리거 위로 열리는 260px 다크 메뉴와 단일 선택 상태, 파일 항목에서 사용하는 소형 액션 메뉴를 제공합니다.

## 기존 화면 출처

- 마크업: `html/ai-home.html`의 `.model-picker-dropdown`
- 스타일: `css/ai-home.css`의 `.model-picker-dropdown`, `.model-option`
- 동일 사용처: `html/ai-chatbot.html`, `css/ai-chatbot.css`
- 기존 동작: `js/ai-home.js`, `js/ai-chatbot.js`의 모델 선택 로직

소형 라이트 액션 메뉴는 파일 목록의 기존 더보기 버튼과 AI Intake의 `목록 고정`·`삭제` 동작을 공통 DropdownMenu 계약으로 연결한 변형입니다.

## 의존성과 클래스

- Fragment: `component/dropdownmenu/dropdownmenu.fragment.html`
- 필수 CSS: `component/button/button.css`, `component/dropdownmenu/dropdownmenu.css`
- 필수 JS: `component/dropdownmenu/dropdownmenu.js`
- 검수 페이지: `component/dropdownmenu/dropdownmenu.html`
- 루트: `[data-dropdown-menu]`, `.dropdown-menu-component`
- 트리거: `[data-dropdown-trigger]`, `.dropdown-menu-model-trigger`
- 메뉴: `.dropdown-menu.dropdown-menu-model`, `[role="menu"]`
- 항목: `.dropdown-menu-item[role="menuitemradio"]`
- 항목 슬롯: `.dropdown-model-name`, `.dropdown-model-desc`, `.dropdown-model-check`

```html
<div class="dropdown-menu-component" data-dropdown-menu>
    <button type="button"
        class="button dropdown-menu-model-trigger"
        data-dropdown-trigger
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="modelDropdownMenu">
        <span data-dropdown-label>기본</span>
        <img class="icon icon-xsmall"
            data-icon="chevron-down"
            alt=""
            aria-hidden="true" />
    </button>

    <div class="dropdown-menu dropdown-menu-model"
        id="modelDropdownMenu"
        role="menu"
        data-placement="top-start"
        hidden>
        <span class="dropdown-menu-label">모델 선택</span>
        <button type="button"
            class="dropdown-menu-item"
            role="menuitemradio"
            aria-checked="true"
            data-menu-value="default"
            data-menu-label="기본">
            <span class="dropdown-model-name">기본</span>
            <span class="dropdown-model-desc">추천</span>
            <span class="dropdown-model-check" aria-hidden="true">✓</span>
        </button>
        <button type="button"
            class="dropdown-menu-item"
            role="menuitemradio"
            aria-checked="false"
            data-menu-value="ai-one-flash"
            data-menu-label="AI-ONE Flash">
            <span class="dropdown-model-name">AI-ONE Flash</span>
            <span class="dropdown-model-desc">빠르고 반복적인 모델</span>
            <span class="dropdown-model-check" aria-hidden="true">✓</span>
        </button>
        <button type="button"
            class="dropdown-menu-item"
            role="menuitemradio"
            aria-checked="false"
            data-menu-value="ai-one-pro"
            data-menu-label="AI-ONE Pro">
            <span class="dropdown-model-name">AI-ONE Pro</span>
            <span class="dropdown-model-desc">심도 있고 창의적인 모델</span>
            <span class="dropdown-model-check" aria-hidden="true">✓</span>
        </button>
        <button type="button"
            class="dropdown-menu-item"
            role="menuitemradio"
            aria-checked="false"
            data-menu-value="gov-flash"
            data-menu-label="범정부 AI Flash">
            <span class="dropdown-model-name">범정부 AI Flash</span>
            <span class="dropdown-model-desc">균형과 효율성 겸비</span>
            <span class="dropdown-model-check" aria-hidden="true">✓</span>
        </button>
        <button type="button"
            class="dropdown-menu-item"
            role="menuitemradio"
            aria-checked="false"
            data-menu-value="gov-pro"
            data-menu-label="범정부 AI Pro">
            <span class="dropdown-model-name">범정부 AI Pro</span>
            <span class="dropdown-model-desc">능력 있고 빠릅니다</span>
            <span class="dropdown-model-check" aria-hidden="true">✓</span>
        </button>
    </div>
</div>
```

## 파일 액션 메뉴

파일 업로드 목록의 더보기 버튼에는 같은 DropdownMenu 동작을 사용합니다. 패널은 `.dropdown-menu-compact`로 구성하고 `목록 고정`, `삭제` 항목을 제공합니다.

```html
<div class="file-action-wrap dropdown-menu-component" data-dropdown-menu>
    <button type="button"
        class="file-more-btn"
        data-dropdown-trigger
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="fileActionMenu"
        aria-label="파일 옵션">
        <img class="icon icon-small dropdown-menu-more-icon"
            data-icon="more-horizontal"
            alt=""
            aria-hidden="true" />
    </button>
    <div class="dropdown-menu dropdown-menu-compact"
        id="fileActionMenu"
        role="menu"
        data-placement="bottom-end"
        hidden>
        <button type="button" class="dropdown-menu-item"
            role="menuitem" data-menu-value="pin">목록 고정</button>
        <button type="button" class="dropdown-menu-item danger"
            role="menuitem" data-menu-value="delete">삭제</button>
    </div>
</div>
```

## 상태와 이벤트

- 모델 메뉴는 `data-placement="top-start"`로 가운데 왼쪽의 트리거 위에 정렬됩니다.
- 파일 액션 메뉴는 `data-placement="bottom-end"`로 더보기 버튼의 아래쪽 오른편에 정렬됩니다.
- 선택형 항목은 `role="menuitemradio"`와 `aria-checked`를 사용합니다.
- `data-menu-label` 값이 선택 후 `[data-dropdown-label]`에 반영됩니다.
- 선택 후 `dropdownmenu:select` 이벤트가 발생하며 `event.detail`은 `{ value, item }`입니다.
- `ArrowDown`, `ArrowUp`, `Home`, `End`, `Escape` 키를 지원합니다.
