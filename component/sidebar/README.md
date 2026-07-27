# Sidebar 컴포넌트

- 기본 fragment: `sidebar.html`
- 챗봇 fragment: `sidebar-chatbot.html`
- 검수 위치: `component/index.html`의 Navigation 영역
- 필수 CSS: `css/common.css`
- 챗봇 추가 CSS: `css/ai-chatbot.css`
- 필수 JS: `js/common.js`
- 사용 방식: 화면당 하나만 포함하는 singleton

`data-route`가 있는 링크는 `body[data-root-path]`를 기준으로 `common.js`가 실제 경로를 설정합니다. 현재 화면 강조는 `body[data-page]`와 링크의 `data-page`를 비교해 적용합니다.

`#sidebar`, `#sidebarCollapseBtn`, `#settingsBtn` 등 고정 ID는 기존 페이지 JavaScript 연결을 위한 계약이므로 한 화면에 Sidebar를 두 번 포함하지 않습니다. 로그아웃과 설정처럼 이동이 아닌 동작은 `<button type="button">`을 사용합니다.

기본 사이드바가 축소되면 접기 아이콘 대신 AI-ONE 로고 버튼만 표시됩니다. 축소된 로고 버튼을 누르면 사이드바가 펼쳐지고, 펼쳐진 상태에서 로고를 누르면 AI-ONE 홈으로 이동합니다.

## 기본 Sidebar Fragment 소스

`sidebar.html`

```html
<!-- Sidebar component fragment: 화면당 한 번만 포함하는 singleton 컴포넌트입니다. -->
<aside class="sidebar app-sidebar" id="sidebar">
    <div class="sidebar-top-bar">
        <button type="button" class="sidebar-brand" id="sidebarBrandButton" aria-label="AI-ONE 홈" title="AI-ONE 홈">
            <span class="brand-logo">
                <img class="brand-symbol" alt="AI-ONE" data-icon="ai-one-logo" />
            </span>
            <span class="brand-text">
                <span class="brand-name">AI-ONE</span>
                <span class="brand-sub">재정경제부 AI 플랫폼</span>
            </span>
        </button>
        <button type="button" class="icon-button icon-button-ghost sidebar-collapse-btn" id="sidebarCollapseBtn"
            aria-label="사이드바 접기/펼치기" title="사이드바 접기">
            <img class="collapse-icon icon icon-primary" data-icon="sidebar-collapse" alt="" aria-hidden="true" />
        </button>
    </div>

    <nav class="sidebar-nav" aria-label="메인 네비게이션">
        <div class="nav-group">
            <a class="nav-link" href="../../html/ai-home.html" data-route="home" data-page="home">
                <img data-icon="home" alt="" aria-hidden="true" />
                <span class="nav-text">AI-ONE 홈</span>
            </a>
        </div>
        <div class="nav-group">
            <span class="nav-group-label">AI 서비스</span>
            <a class="nav-link" href="../../html/ai-intake.html" data-route="intake" data-page="intake">
                <img data-icon="document" alt="" aria-hidden="true" />
                <span class="nav-text">국회질의분류</span>
            </a>
            <a class="nav-link" href="../../html/ai-answer.html" data-route="answer" data-page="answer">
                <img data-icon="edit" alt="" aria-hidden="true" />
                <span class="nav-text">국회 답변서 초안 생성</span>
            </a>
            <a class="nav-link" href="#" data-page="economy" aria-disabled="true">
                <img width="22" height="22" data-icon="economy-trend" alt="" aria-hidden="true" />
                <span class="nav-text">경제동향 분석 보고서 생성</span>
            </a>
        </div>
        <div class="nav-group">
            <a class="nav-link" href="../../html/ai-chatbot.html" data-route="chatbot" data-page="chatbot">
                <img data-icon="chat" alt="" aria-hidden="true" />
                <span class="nav-text">AI-ONE 챗봇</span>
            </a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="user-card">
            <button type="button" class="user-avatar logout-btn" aria-label="로그아웃" title="로그아웃">
                <img class="icon icon-primary" data-icon="user" alt="" aria-hidden="true" />
            </button>
            <div class="user-info"><span class="user-name">박재정 담당자</span><span class="user-dept">재정분석과</span></div>
            <button type="button" class="icon-button icon-button-ghost settings-btn" id="settingsBtn" aria-label="환경설정" title="환경설정">
                <img class="icon icon-small" data-icon="settings-alt" alt="" aria-hidden="true" />
            </button>
        </div>
    </div>
</aside>
```

## Chatbot Sidebar Fragment 소스

`sidebar-chatbot.html`

```html
<!-- Chatbot sidebar component fragment: 화면당 한 번만 포함하는 singleton 컴포넌트입니다. -->
<aside class="sidebar chatbot-sidebar" id="sidebar" data-sidebar-variant="chatbot">
    <div class="sidebar-top-bar">
        <div class="sidebar-brand">
            <div class="brand-logo"><img class="brand-symbol" alt="AI-ONE" data-icon="ai-one-logo" /></div>
            <div class="brand-text">
                <span class="brand-name">AI-ONE</span>
                <span class="brand-sub">재정경제부 AI 플랫폼</span>
            </div>
        </div>
        <button class="icon-button icon-button-ghost sidebar-new-chat-btn" id="newChatBtn" type="button" aria-label="새 채팅" title="새 채팅">
            <img class="icon icon-primary" data-icon="new-chat" alt="" aria-hidden="true" />
        </button>
    </div>

    <nav class="sidebar-nav" aria-label="챗봇 메뉴">
        <div class="nav-group">
            <a class="nav-link" href="../../html/ai-home.html" data-route="home" data-page="home">
                <img data-icon="home" alt="" aria-hidden="true" /><span class="nav-text">AI-ONE 홈</span>
            </a>
        </div>
        <div class="nav-group">
            <button class="nav-link active" id="newChatLink" type="button">
                <img class="icon icon-primary" data-icon="add-circle" alt="" aria-hidden="true" /><span class="nav-text">새 채팅</span>
            </button>
            <a class="nav-link" href="#"><img data-icon="search" alt="" aria-hidden="true" /><span class="nav-text">채팅 검색</span></a>
            <a class="nav-link" href="#"><img data-icon="folder" alt="" aria-hidden="true" /><span class="nav-text">프로젝트</span></a>
            <a class="nav-link" href="#"><img data-icon="image" alt="" aria-hidden="true" /><span class="nav-text">이미지</span></a>
            <a class="nav-link" href="#"><img data-icon="library" alt="" aria-hidden="true" /><span class="nav-text">라이브러리</span></a>
        </div>
        <div class="nav-group">
            <span class="nav-group-label">노트북</span>
            <a class="nav-link" href="#"><img data-icon="plus" alt="" aria-hidden="true" /><span class="nav-text">새 노트북</span></a>
            <a class="nav-link" href="#"><img data-icon="document" alt="" aria-hidden="true" /><span class="nav-text">AI-ONE 국회 답변서 AI 서비스</span></a>
            <a class="nav-link" href="#"><img data-icon="document" alt="" aria-hidden="true" /><span class="nav-text">Untitled notebook</span></a>
            <a class="nav-link" href="#"><img data-icon="more-horizontal" alt="" aria-hidden="true" /><span class="nav-text">모든 노트북</span></a>
        </div>
        <div class="nav-group">
            <span class="nav-group-label">최근</span>
            <a class="nav-link" href="#"><span class="nav-text">국회 질의 분류 자동화 방안</span></a>
            <a class="nav-link" href="#"><span class="nav-text">지방채 인수 추경 편성 분석</span></a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="user-card">
            <div class="user-avatar" aria-hidden="true">
                <img class="icon icon-primary" data-icon="user" alt="" aria-hidden="true" />
            </div>
            <div class="user-info chatbot-user-info">
                <span class="user-name-sm">박재정 주무관</span>
                <div class="user-meta-row">
                    <span class="user-dept">재정분석과</span>
                    <span class="user-role-badge">국회담당자</span>
                </div>
            </div>
        </div>
    </div>
</aside>
```
