# Sidebar 컴포넌트

- 기본 fragment: `sidebar.html`
- 챗봇 fragment: `sidebar-chatbot.html`
- 검수 위치: `components/index.html`의 Navigation 영역
- 필수 CSS: `css/common.css`
- 챗봇 추가 CSS: `css/ai-chatbot.css`
- 필수 JS: `js/common.js`
- 사용 방식: 화면당 하나만 포함하는 singleton

`data-route`가 있는 링크는 `body[data-root-path]`를 기준으로 `common.js`가 실제 경로를 설정합니다. 현재 화면 강조는 `body[data-page]`와 링크의 `data-page`를 비교해 적용합니다.

`#sidebar`, `#sidebarCollapseBtn`, `#settingsBtn` 등 고정 ID는 기존 페이지 JavaScript 연결을 위한 계약이므로 한 화면에 Sidebar를 두 번 포함하지 않습니다. 로그아웃과 설정처럼 이동이 아닌 동작은 `<button type="button">`을 사용합니다.
