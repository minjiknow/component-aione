# Topbar 컴포넌트

- 실제 fragment: `topbar.fragment`
- 검수 위치: `component/index.html`의 Navigation 영역
- 필수 CSS: `component/button/button.css`, `component/topbar/topbar.css`
- 필수 JS: `js/common.js`
- 사용 방식: 페이지 상단에 화면당 한 번 포함

Topbar 컴포넌트는 왼쪽의 페이지 제목·부가 설명과 오른쪽 액션 그룹을 공통 구조로 제공합니다. 페이지별 제목과 설명은 include host의 `data-component-title`, `data-component-subtitle`로 전달합니다. 기본 액션의 문구·화면·역할은 `data-component-primary-action-*`, 목록 액션은 `data-component-secondary-action-*`로 바꿀 수 있으며 버튼 ID와 공통 스타일은 유지됩니다.

```html
<div
    data-component-include="topbar"
    data-component-title="국회질의분류 AI 워크스페이스"
    data-component-subtitle="질의 업로드 · OCR/파싱 · 질의 분류 · 추천실국 확인"
></div>
```

작업 제목, 의원수처럼 해당 화면에서만 필요한 정보는 공통 Topbar 안의 `workspace` 슬롯으로 주입하고 페이지가 상태와 동작을 소유합니다.

```html
<div
    data-component-include="topbar"
    data-component-title="국회질의분류 AI 워크스페이스"
    data-component-subtitle="질의 업로드 · OCR/파싱 · 질의 분류 · 추천실국 확인"
>
    <template data-slot="workspace">
        <div class="workspace-topbar-context">
            <!-- ai-workspace 전용 작업 제목과 의원수 -->
        </div>
    </template>
</div>
```

`component-include-loader.js`에 `topbar`가 등록되어 있으므로 fragment를 복사하지 않고 위 include만 사용합니다. 버튼의 고정 ID는 기존 페이지 JavaScript 연결을 위해 유지하며, 모든 액션 버튼은 form 내부에 포함되더라도 submit되지 않도록 `type="button"`을 유지합니다.

오른쪽 액션은 기본적으로 질의분류 화면 계약에 따라 `button-soft-primary`를 사용하는 새 질의분류, 실행 목록, 룰 설정, 실국별 알림 담당자 설정과 보조도구 트리거를 노출합니다. Answer 화면처럼 액션 문구가 다른 경우에도 액션을 슬롯으로 다시 만들지 않고 위 속성으로 `새 채팅`, `채팅 목록`을 전달합니다. 화면에 필요 없는 룰 설정·알림 담당자 버튼은 페이지 modifier에서 숨기며, 왼쪽 페이지 제목·부가 설명 구조와 버튼 클래스는 공통으로 유지합니다. 보조도구 트리거는 격자＋ 아이콘으로 표시되며, 누르면 파란 X 상태로 바뀌고 왼쪽에 아래 네 기능이 펼쳐집니다.

- 전체 글자크기: 100~150% 범위로 화면의 `--ui-font-scale`을 변경합니다.
- 패널 위치 변경: `data-accessory-swap-target`에 지정한 기존 버튼의 click을 전달합니다.
- 레이아웃 초기화: `data-accessory-layout-target`에 지정한 기존 버튼의 click을 전달합니다.
- 전체화면: 브라우저 Fullscreen API로 진입·해제합니다.

패널 기능의 실제 상태 변경은 페이지가 계속 소유합니다. fragment의 `#panelSwapBtn`, `#layoutResetBtn`은 기존 페이지 JavaScript 연결을 유지하는 숨김 source control이고, 보조도구 버튼이 이 이벤트를 전달합니다. `#resetBtn`, `#fullscreenBtn`도 기존 연동 호환을 위해 숨김 상태로 유지하지만 보조도구 레일에는 별도 초기화 버튼을 노출하지 않습니다.

새 질의분류는 `intake` 화면에서만 노출되며 페이지 JavaScript는 고정 ID `#newClassifyBtn`을 초기화 동작에 연결합니다. 아이콘은 파일 업로드로 오해되지 않도록 `plus.svg`만 사용합니다. 표시 문구와 접근성 이름은 모두 `새 질의분류`로 유지하고, `data-workspace-action="new-question"`은 같은 역할을 식별하는 선언형 표식입니다.

Chatbot 화면은 Topbar를 포함하지 않으며, `body.ai-chatbot-page`에서는 공통 보조도구도 자동 생성하지 않습니다.

## 보조도구 연결

운영 마크업은 `topbar.fragment`를 직접 사용합니다. 같은 UI를 다른 카탈로그에서 검수할 때도 아래 선언형 target만 바꾸고, 버튼 순서나 아이콘을 별도로 재구성하지 않습니다.

```html
<div
    class="accessory-tool"
    data-accessory-tools
    data-accessory-swap-target="panelSwapBtn"
    data-accessory-layout-target="layoutResetBtn"
>
    <!-- 격자＋/X 트리거, 4개 기능 버튼, 글자크기 패널 -->
</div>

<button type="button" id="panelSwapBtn" class="accessory-source-control" hidden></button>
<button type="button" id="layoutResetBtn" class="accessory-source-control" hidden></button>
```

`data-accessory-tools` 한 묶음에는 트리거 한 개와 `font`, `swap`, `layout`, `fullscreen` 액션만 둡니다. 트리거는 `aria-expanded`, 글자크기 버튼은 `aria-expanded`를 상태에 맞게 갱신합니다. 트리거 재클릭, ESC, 바깥 영역 클릭, 기능 실행 후에는 펼침 상태를 닫습니다. 글자크기 패널 내부 조작 중에는 레일을 유지합니다.
