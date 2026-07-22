# Topbar 컴포넌트

- 실제 fragment: `topbar.html`
- 검수 위치: `components/index.html`의 Navigation 영역
- 필수 CSS: `css/common.css`
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
