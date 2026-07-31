# DocumentStatusBar 컴포넌트

문서 미리보기 하단의 글자 수·페이지 정보와 축소·확대·전체보기 동작을 공통으로 제공합니다. `backup/20260726`의 AI Answer 문서 바를 기준으로 하며, AI Workspace와 AI Answer가 같은 마크업·스타일·동작을 사용합니다.

- Fragment: `component/document-statusbar/document-statusbar.fragment.html`
- 필수 CSS: `component/button/button.css`, `component/document-statusbar/document-statusbar.css`
- 필수 JS: `component/document-statusbar/document-statusbar.js`
- 검수 페이지: `component/document-statusbar/document-statusbar.html`
- 루트: `[data-document-statusbar]`
- 기본 배율: `100%`
- 기본 범위: `50~200%`
- 기본 증감: `10%`

## Include

```html
<div data-component-include="document-statusbar"
    data-component-target=".document-preview-content"
    data-component-scroll-target=".document-preview-scroll"
    data-component-page-selector=".document-page"
    data-component-fullscreen-target=".document-preview-panel">
    <template data-slot="stats">
        <span class="document-statusbar-stat">
            글자 수 <strong data-document-character-count>293</strong>자
        </span>
        <span class="document-statusbar-separator" aria-hidden="true">|</span>
        <span class="document-statusbar-stat">
            페이지 <strong data-document-page-current>1</strong>/<strong
                data-document-page-total>1</strong>
        </span>
    </template>
</div>
```

`target`은 실제로 확대되는 문서 콘텐츠, `fullscreenTarget`은 전체보기 상태가 적용될 패널입니다. 페이지 표시를 스크롤 위치와 연결할 때만 `scrollTarget`과 `pageSelector`를 함께 지정합니다. 통계 항목은 `stats` 슬롯에서 화면별로 조합합니다.

## 속성

- `data-component-target`: 확대·축소할 문서 콘텐츠의 CSS 선택자
- `data-component-scroll-target`: 현재 페이지를 계산할 스크롤 영역 선택자
- `data-component-page-selector`: 확대 대상 안의 페이지 선택자
- `data-component-fullscreen-target`: 전체보기로 전환할 패널 선택자
- `data-component-zoom`: 초기 배율
- `data-component-min-zoom`, `data-component-max-zoom`: 최소·최대 배율
- `data-component-step`: 버튼 한 번의 배율 증감

선택자는 해당 문서에서 하나의 요소만 가리켜야 합니다. 실제 문서 글씨를 키우려면 스크롤 컨테이너가 아니라 `.document-paper`, `.doc-pages-track`, `.answer-draft-document`처럼 문서 콘텐츠 자체를 `target`으로 지정합니다.

## API와 이벤트

```js
window.AIOneDocumentStatusBar.setZoom(statusbarElement, 130);
window.AIOneDocumentStatusBar.toggleFullscreen(statusbarElement);
```

- `document-statusbar:zoomchange`: `event.detail.zoom`, `event.detail.target`
- `document-statusbar:fullscreenchange`: `event.detail.fullscreen`, `event.detail.target`

전체보기는 실제 브라우저 Fullscreen API 대신 대상 패널에 `.document-statusbar-fullscreen`을 적용합니다. 따라서 권한 팝업 없이 동작하며 `Esc`로 종료할 수 있습니다.
