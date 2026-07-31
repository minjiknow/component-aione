# Sidebar 컴포넌트

- 기본 fragment: `sidebar.html`
- 챗봇 fragment: `sidebar-chatbot.html`
- 검수 위치: `component/index.html`의 Navigation 영역
- 필수 CSS: `component/button/button.css`, `component/sidebar/sidebar.css`
- 챗봇 variant 스타일도 `component/sidebar/sidebar.css`가 소유하며, 실제 챗봇 페이지의 레이아웃 CSS만 `css/ai-chatbot.css`가 담당합니다.
- 필수 JS: `component/sidebar/sidebar.js`; 기존 정적 화면의 경로·아이콘 등 공통 초기화는 `js/common.js`
- 사용 방식: 화면당 하나만 포함하는 singleton

`data-route`가 있는 링크는 `body[data-root-path]`를 기준으로 `common.js`가 실제 경로를 설정합니다. 현재 화면 강조는 `body[data-page]`와 링크의 `data-page`를 비교해 적용합니다.
현재 공통 Sidebar에서 국회 답변서 초안 생성은 `pages/ai-answer.html`로 이동하는 링크이며, 국유재산 업무 관리·정책 안내서·AI-ONE 챗봇은 준비 중 버튼으로 제공합니다. 준비 중 메뉴에는 `.nav-badge-soon`을 표시합니다. Sidebar fragment가 `#preparingServiceModal`을 직접 포함하므로 `pages/ai-home.html`, `pages/ai-workspace.html`, `pages/ai-answer.html`에서 동일한 안내 Modal을 사용합니다.

`#sidebar`, `#sidebarCollapseBtn` 등 고정 ID는 기존 페이지 JavaScript 연결을 위한 계약이므로 한 화면에 Sidebar를 두 번 포함하지 않습니다. 사용자 메뉴, 로그아웃과 설정처럼 이동이 아닌 동작은 `<button type="button">`을 사용합니다. 기본 Footer는 `pages/ai-home.html`의 Sidebar 구조와 동일하게 사용자 아이콘, 이름, 부서와 별도 설정 아이콘을 표시합니다.

기본 사이드바가 축소되면 접기 아이콘 대신 AI-ONE 로고 버튼만 표시됩니다. 축소된 로고 버튼을 누르면 사이드바가 펼쳐지고, 펼쳐진 상태에서 로고를 누르면 AI-ONE 홈으로 이동합니다.
축소 상태의 Footer에는 `[data-sidebar-account-toggle]` 사용자 아이콘만 표시합니다. 사용자명과 별도 설정 버튼은 숨기며, 사용자 아이콘을 누르면 이름·부서·내 정보·환경설정·로그아웃을 포함한 `.user-account-menu`가 열립니다.
펼친 상태에서는 `.user-card` 전체, 접힌 상태에서는 사용자 아이콘에 마우스를 올리거나 키보드 포커스를 두면 담당자 기본정보 Tooltip이 표시됩니다. 계정 메뉴를 여는 즉시 Tooltip은 닫힙니다.

계정 메뉴의 내 정보·환경설정·로그아웃은 Sidebar 내부에서 공통 Modal을 한 번씩 include하고 `data-modal-open`으로 엽니다. 내 정보는 `account-profile`, 환경설정은 `account-settings`, 로그아웃은 `logout` variant를 사용합니다. 환경설정은 시스템·다크·라이트 화면 모드, 기본값·블루·그린·옐로·핑크·오렌지·퍼플 강조 컬러, 응답 완료 알림을 제공합니다.

`sidebar:account-action` 이벤트는 사용자 정보를 Modal에 동기화하고 기존 정적 Sidebar의 호환 경로를 유지합니다. Modal의 열기·닫기·포커스 복귀는 공통 `AIOneModal`이 담당합니다.

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
                <img data-icon="document-add" alt="" aria-hidden="true" />
                <span class="nav-text">국회질의분류</span>
            </a>
            <a class="nav-link" href="../../pages/ai-answer.html" data-route="answer" data-page="answer"
                data-tooltip="국회 답변서 초안 생성"
                aria-label="국회 답변서 초안 생성" title="국회 답변서 초안 생성">
                <img data-icon="edit" alt="" aria-hidden="true" />
                <span class="nav-text">국회 답변서 초안 생성</span>
            </a>
            <button type="button" class="nav-link" data-page="asset"
                data-modal-open="preparingServiceModal"
                aria-label="국유재산 업무 관리 (준비중)" title="국유재산 업무 관리 (준비중)">
                <img data-icon="layers" alt="" aria-hidden="true" />
                <span class="nav-text">국유재산 업무 관리</span>
                <span class="nav-badge-soon">준비중</span>
            </button>
            <button type="button" class="nav-link" data-page="policy"
                data-modal-open="preparingServiceModal"
                aria-label="정책 안내서 (준비중)" title="정책 안내서 (준비중)">
                <img data-icon="library" alt="" aria-hidden="true" />
                <span class="nav-text">정책 안내서</span>
                <span class="nav-badge-soon">준비중</span>
            </button>
        </div>
        <div class="nav-group">
            <button type="button" class="nav-link" data-page="chatbot"
                data-modal-open="preparingServiceModal"
                aria-label="AI-ONE 챗봇" title="AI-ONE 챗봇">
                <img data-icon="chat" alt="" aria-hidden="true" />
                <span class="nav-text">AI-ONE 챗봇</span>
                <span class="nav-badge-soon">준비중</span>
            </button>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="user-card">
            <button type="button" class="user-avatar" data-sidebar-account-toggle
                aria-label="사용자 메뉴" title="사용자 메뉴"
                aria-haspopup="menu" aria-expanded="false"
                aria-controls="sidebarAccountMenu">
                <img class="icon icon-primary" data-icon="user" alt="" aria-hidden="true" />
            </button>
            <div class="user-info">
                <span class="user-name">박재정 주무관</span>
                <span class="user-meta-row">
                    <span class="user-dept">재정분석과</span>
                    <span class="user-role-badge">국회담당자</span>
                </span>
            </div>
            <div class="user-account-menu" id="sidebarAccountMenu"
                role="menu" aria-label="사용자 계정 메뉴" hidden>
                <div class="user-account-summary">
                    <strong>박재정 주무관</strong><span>재정분석과</span>
                </div>
                <button type="button" role="menuitem"
                    data-sidebar-account-action="profile">내 정보</button>
                <button type="button" role="menuitem"
                    data-sidebar-account-action="settings">환경설정</button>
                <button type="button" class="danger" role="menuitem"
                    data-sidebar-account-action="logout">로그아웃</button>
            </div>
        </div>
    </div>

    <!-- 준비 중 안내 Modal만 Sidebar 내부에 한 번 포함합니다.
         계정 레이어는 js/common.js가 공통으로 생성합니다. -->
    <div data-component-include="modal"
        data-component-id="preparingServiceModal"
        data-component-variant="alert"
        data-component-label="준비중 안내">
        <template data-slot="title">준비중</template>
        <template data-slot="description">이 화면은 프로토타입에 아직 포함되어 있지 않습니다.</template>
        <template data-slot="actions">
            <button type="button" class="btn-confirm" data-modal-close>확인</button>
        </template>
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
접힌 Sidebar의 `.nav-link[data-tooltip]` 안내는 `component/sidebar/sidebar.js`가 공통으로 생성합니다. 페이지 JavaScript에서 별도 tooltip 요소나 `mouseenter` 이벤트를 다시 만들지 않습니다.
