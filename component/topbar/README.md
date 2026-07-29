# Topbar 컴포넌트

- 실제 fragment: `topbar.html`
- 검수 위치: `component/index.html`의 Navigation 영역
- 필수 CSS: `component/button/button.css`, `component/topbar/topbar.css`
- 필수 JS: `js/common.js`
- 사용 방식: 화면당 한 번만 포함하는 singleton

페이지 `<body>`에 다음 context를 제공합니다.

```html
<body
    data-page="intake"
    data-root-path=".."
    data-topbar-title="국회질의분류 AI 워크스페이스"
    data-topbar-subtitle="AI 기반 질의 분류 및 담당 실국 추천"
>
```

`data-pages`는 버튼을 노출할 페이지 목록입니다. 버튼의 고정 ID는 기존 페이지 JavaScript 연결을 위해 유지하며 한 화면에 Topbar를 두 번 포함하지 않습니다. 모든 액션 버튼은 form 내부에 포함되더라도 submit되지 않도록 `type="button"`을 유지합니다.

기본 액션 그룹은 `button-soft-primary`를 사용하는 새 질의분류와 실행 목록, 룰 설정, 패널 위치 변경, 레이아웃 초기화, 초기화, 전체화면입니다. 새 질의분류는 `intake` 화면에서만 노출되며 페이지 JavaScript는 고정 ID `#newClassifyBtn`을 초기화 동작에 연결합니다. `data-workspace-action="new-question"`은 같은 역할을 식별하는 선언형 표식입니다. `panelSwapBtn`은 같은 문서의 `three-panel`과 연결해 현재 첫 패널을 마지막으로 순환 이동하며, 패널 폭은 패널 요소를 따라 유지합니다.

## Fragment 소스

`topbar.html`

```html
<!-- Topbar component fragment: 페이지별 노출은 body의 data-page와 data-pages로 결정합니다. -->
<header class="topbar app-topbar">
    <div class="topbar-left">
        <button type="button" class="brand-icon-button topbar-logo-btn hidden" id="topbarLogoBtn" data-pages="intake,answer"
            aria-label="일반 모드로 복귀" title="일반 모드로 복귀">
            <img class="topbar-logo-icon icon icon-brand" aria-hidden="true" data-icon="ai-one-logo" alt="" />
        </button>
        <button type="button" class="btn-hamburger" id="sidebarToggle" data-pages="intake,answer" aria-label="사이드바 메뉴 토글">
            <span></span><span></span><span></span>
        </button>
        <h1 class="topbar-title" data-topbar-title></h1>
        <p class="topbar-sub" data-topbar-subtitle></p>
    </div>

    <div class="topbar-right">
        <button type="button" class="button button-soft-primary" id="newClassifyBtn" data-pages="intake"
            data-workspace-action="new-question" aria-label="새 질의분류" title="새 질의분류">
            <img class="icon icon-small" aria-hidden="true" data-icon="document-add" alt="" />
            <span>새 질의분류</span>
        </button>
        <button type="button" class="icon-button icon-button-accent" id="runDrawerBtn" data-pages="intake" aria-label="실행 목록"
            title="실행 목록">
            <img class="icon icon-primary" aria-hidden="true" data-icon="activity" alt="" />
        </button>
        <button type="button" class="icon-button icon-button-purple" id="ruleManageBtn" data-pages="intake" aria-label="룰 설정" title="룰 설정">
            <img class="icon icon-primary" aria-hidden="true" data-icon="edit-compact" alt="" />
        </button>
        <button type="button" class="icon-button" id="panelSwapBtn" aria-label="패널 위치 변경" title="패널 위치 변경">
            <img class="icon icon-primary" aria-hidden="true" data-icon="panel-swap" alt="" />
        </button>
        <button type="button" class="icon-button" id="layoutResetBtn" aria-label="레이아웃 초기화" title="레이아웃 초기화">
            <img class="icon icon-primary" aria-hidden="true" data-icon="layout-columns" alt="" />
        </button>
        <button type="button" class="icon-button" id="resetBtn" aria-label="초기화" title="초기화">
            <img class="icon icon-primary" aria-hidden="true" data-icon="reset" alt="" />
        </button>
        <button type="button" class="icon-button" id="fullscreenBtn" aria-label="전체화면" title="전체화면">
            <img class="fullscreen-expand icon icon-primary" aria-hidden="true" data-icon="fullscreen-expand" alt="" />
            <img class="fullscreen-shrink icon icon-primary hidden" data-pages="intake,answer" aria-hidden="true"
                data-icon="fullscreen-shrink" alt="" />
        </button>
    </div>
</header>
```
