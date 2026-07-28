# SidePop 컴포넌트

## Small variant

Small은 420px이며 기본 variant는 `run-list`입니다. 같은 Small Drawer를 채팅 이력 용도로 사용할 때는 `chat-list`를 선택합니다.

| variant | 용도 | 클래스/속성 |
|---|---|---|
| `run-list` | 실행 목록, 파일·의원·질의 현황, 최근 작업 로그 | `.sidepop-variant-run-list`, `data-sidepop-variant="run-list"` |
| `chat-list` | 채팅 목록 검색과 대화 전환 | `.sidepop-variant-chat-list`, `data-sidepop-variant="chat-list"` |
| `content` | 슬롯으로 내용을 조합하는 일반 SidePop | `.sidepop-variant-content`, `data-sidepop-variant="content"` |

```html
<button type="button"
    data-sidepop-open="smallSidepop"
    data-sidepop-variant="run-list">실행 목록</button>

<button type="button"
    data-sidepop-open="smallSidepop"
    data-sidepop-variant="chat-list">채팅 목록</button>
```

include 사용 시 Small은 `data-component-variant`를 생략하면 `run-list`가 적용됩니다. Medium은 기존 슬롯형 조합을 유지하기 위해 `content`가 기본값입니다.

```html
<div data-component-include="sidepop"
    data-component-id="smallSidepop"
    data-component-size="small"
    data-component-variant="chat-list"></div>
```

JavaScript에서 전환할 때는 `AIOneSidePop.setVariant("smallSidepop", "chat-list")`를 사용합니다.

상세 확인이나 편집처럼 현재 화면의 문맥을 유지해야 하는 작업을 오른쪽 레이어에 표시합니다. Small은 420px, Medium은 820px이며 화면이 좁아지면 뷰포트 안으로 축소됩니다.

- Fragment: `component/sidepop/sidepop.fragment.html`
- 필수 CSS: `component/button/button.css`, `component/radio/radio.css`, `component/toggle/toggle.css`, `component/form-field/form-field.css`, `component/sidepop/sidepop.css`
- 필수 JS: `component/_shared/layer-controller.js`, `component/sidepop/sidepop.js`
- 검수 페이지: `component/sidepop/sidepop.html`
- 열기: `[data-sidepop-open="<layer-id>"]`
- 레이어: `[data-sidepop]`, `.sidepop-layer`
- 닫기: `[data-sidepop-close]`

| 크기 | 클래스 | 데스크톱 너비 |
|---|---|---:|
| Small | `.sidepop-small` | 420px |
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

`Escape`, 바깥 배경, 닫기 버튼으로 닫을 수 있습니다. 열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고 닫은 뒤에는 열기 버튼으로 돌아갑니다. `sidepop:open`, `sidepop:close` 이벤트가 레이어에서 발생합니다.
