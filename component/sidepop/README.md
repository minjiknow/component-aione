# SidePop 컴포넌트

## 목록 variant

`run-list`는 AI Intake 실행 목록과 같은 460px, `chat-list`는 AI Answer 채팅 목록과 같은 420px입니다. Small Drawer의 기본 variant는 `run-list`입니다.

| variant | 용도 | 클래스/속성 |
|---|---|---|
| `run-list` | 실행 목록, 파일·의원·질의 현황, 최근 작업 로그 | `.sidepop-variant-run-list`, `data-sidepop-variant="run-list"` |
| `chat-list` | 채팅 목록 검색과 대화 전환 | `.sidepop-variant-chat-list`, `data-sidepop-variant="chat-list"` |
| `content` | 슬롯으로 내용을 조합하는 일반 SidePop | `.sidepop-variant-content`, `data-sidepop-variant="content"` |
| `rule-settings` | 좌측 룰 목록과 우측 설정 폼을 조합하는 분류 룰 SidePop | `.sidepop-rule-settings`, `data-sidepop-variant="rule-settings"` |

```html
<button type="button"
    data-sidepop-open="smallSidepop"
    data-sidepop-variant="run-list">실행 목록</button>

<button type="button"
    data-sidepop-open="smallSidepop"
    data-sidepop-variant="chat-list">채팅 목록</button>
```

include 사용 시 Small은 `data-component-variant`를 생략하면 `run-list`가 적용됩니다. Medium은 기존 슬롯형 조합을 유지하기 위해 `content`가 기본값입니다.
`run-list`의 화면별 제목은 `data-component-run-list-title`로 전달하며, 생략하면 `실행 목록`을 사용합니다.

```html
<div data-component-include="sidepop"
    data-component-id="smallSidepop"
    data-component-size="small"
    data-component-variant="chat-list"
    data-component-rename-modal="chatRenameModal"
    data-component-delete-modal="chatDeleteModal"></div>

<div data-component-include="sidepop"
    data-component-id="ruleSettingsSidepop"
    data-component-size="medium"
    data-component-variant="rule-settings">
    <template data-slot="title">분류 룰 설정</template>
    <template data-slot="description">키워드와 우선순위로 추천 실국을 보정합니다.</template>
    <template data-slot="body">
        <div class="rule-drawer-left"><!-- 룰 목록 --></div>
        <div class="rule-drawer-right"><!-- 설정 폼 --></div>
    </template>
    <template data-slot="footer"><!-- 안내 및 실행 버튼 --></template>
</div>
```

JavaScript에서 전환할 때는 `AIOneSidePop.setVariant("smallSidepop", "chat-list")`를 사용합니다.
목록 variant의 `[data-sidepop-position-toggle]` 버튼은 Drawer를 좌우로 이동하고 목적지에 따라 `좌측으로 이동`/`우측으로 이동` 문구와 접근성 이름을 함께 갱신합니다. 코드에서 위치를 지정할 때는 `AIOneSidePop.setPosition("smallSidepop", "left")` 또는 `"right"`를 사용합니다.

`rule-settings`는 Fragment가 `.sidepop-rule-settings`, `.rule-drawer-body`, `.rule-drawer-footer` modifier를 적용합니다. 따라서 `body` 슬롯 안에 `.rule-drawer-body`를 다시 감싸지 않습니다. 분류 룰의 배치·상태·반응형 CSS는 공통 `sidepop.css`에서 주석 처리해 보존하고 `css/ai-workspace.css`가 소유합니다.

### 목록 스크롤

- `run-list`는 실행 목록과 최근 작업 로그를 두 개의 독립된 section으로 나눕니다.
- 각 section의 헤더·검색·정렬은 고정되고, 실행 건과 로그 목록만 내부에서 스크롤됩니다.
- `chat-list`는 검색·정렬을 고정하고 채팅 목록 전체를 하나의 내부 스크롤 영역으로 사용합니다.
- 목록 데이터가 추가되어도 SidePop 전체 높이나 다른 section의 위치는 변하지 않습니다.
- 정렬 Select는 화면 기본 글꼴을 상속하며, 실행 항목의 더보기는 AI Intake와 같은 세 점 SVG를 30px 버튼 중앙에 배치합니다.
- 실행 항목의 더보기 메뉴는 기존 DropdownMenu를 사용하며 `고정`, `제목 변경`, `삭제`를 제공합니다.
- 채팅 항목의 더보기 메뉴도 같은 DropdownMenu를 사용하며 공유를 제외한 `고정`, `이름 변경`, `삭제`를 제공합니다.
- `고정`은 선택 항목을 목록 맨 위로 이동하고, `고정 해제`는 원래 정렬 위치로 복원합니다.
- 이름·제목 변경과 삭제는 include의 `data-component-rename-modal`, `data-component-delete-modal`로 지정한 공통 Modal에 연결합니다.
- SidePop에서 Modal을 열면 `.has-child-modal`과 `.modal-over-sidepop` 상태가 자동 적용되어 배경이 한 번만 어두워지고 Modal이 목록보다 위에 표시됩니다.

상세 확인이나 편집처럼 현재 화면의 문맥을 유지해야 하는 작업을 오른쪽 레이어에 표시합니다. 목록 variant는 기준 화면 너비를 따르고, Medium은 820px이며 화면이 좁아지면 뷰포트 안으로 축소됩니다.

- Fragment: `component/sidepop/sidepop.fragment`
- 필수 CSS: `component/button/button.css`, `component/dropdownmenu/dropdownmenu.css`, `component/radio/radio.css`, `component/toggle/toggle.css`, `component/sidepop/sidepop.css`
- 검수 페이지의 Medium 폼 조합: `component/_shared/form-control.css`, `component/input/input.css`, `component/select/select.css`, `component/textarea/textarea.css`
- 필수 JS: `component/dropdownmenu/dropdownmenu.js`, `component/_shared/layer-controller.js`, `component/sidepop/sidepop.js`
- 검수 페이지: `component/sidepop/sidepop.html`
- 열기: `[data-sidepop-open="<layer-id>"]`
- 레이어: `[data-sidepop]`, `.sidepop-layer`
- 닫기: `[data-sidepop-close]`

| 크기 | 클래스 | 데스크톱 너비 |
|---|---|---:|
| Small · Run list | `.sidepop-small[data-sidepop-variant="run-list"]` | 460px |
| Small · Chat list | `.sidepop-small[data-sidepop-variant="chat-list"]` | 420px |
| Medium | `.sidepop-medium` | 820px |

검수 페이지의 Medium은 기존 AI Intake `rule-drawer` 내용을 그대로 조합합니다.

- 좌측: 분류 룰 목록과 사용/미사용 상태
- 우측: 룰 기본 정보, 적용 조건, AI 충돌 시 처리, 설명 및 운영 메모
- 하단: 안내 문구, 룰 추가, 저장, 룰 적용 재실행
- 조합 컴포넌트: Form, Select, Toggle, Radio, Button

```html
<button type="button"
    class="button button-primary"
    data-sidepop-open="exampleSidepop">SidePop 열기</button>

<div class="sidepop-layer" id="exampleSidepop" data-sidepop hidden>
    <button type="button"
        class="sidepop-backdrop"
        data-sidepop-close
        aria-label="사이드 팝업 닫기"></button>

    <aside class="sidepop sidepop-small"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exampleSidepopTitle"
        aria-describedby="exampleSidepopDescription">
        <header class="sidepop-header">
            <div class="sidepop-heading">
                <h2 class="sidepop-title" id="exampleSidepopTitle">제목</h2>
                <p class="sidepop-description" id="exampleSidepopDescription">설명</p>
            </div>
            <button type="button"
                class="icon-button icon-button-ghost"
                data-sidepop-close
                aria-label="닫기">×</button>
        </header>
        <div class="sidepop-body"><!-- 내용 --></div>
        <footer class="sidepop-footer">
            <button type="button"
                class="button button-outline"
                data-sidepop-close>취소</button>
            <button type="button"
                class="button button-primary">저장</button>
        </footer>
    </aside>
</div>
```

`Escape`, 바깥 배경, 닫기 버튼으로 닫을 수 있습니다. 열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고 닫은 뒤에는 열기 버튼으로 돌아갑니다. 더보기 메뉴가 열려 있을 때 `Escape`를 누르면 메뉴만 닫힙니다.

`sidepop:open`, `sidepop:close` 이벤트가 레이어에서 발생합니다. 좌우 위치가 바뀌면 `sidepop:position-change`가 발생하고 `event.detail.position`으로 `left` 또는 `right`를 전달합니다. 목록 작업은 공통 `sidepop:list-action`으로 전달되며 `event.detail.type`은 `run` 또는 `chat`, `event.detail.action`은 `pin`, `rename`, `delete` 중 하나입니다. 기존 실행 목록의 `sidepop:run-action`과 채팅 목록의 `sidepop:chat-action`도 함께 발생합니다. 이름 변경·삭제는 확인 전 `completed: false`, 반영 후 `completed: true`로 구분할 수 있습니다.
