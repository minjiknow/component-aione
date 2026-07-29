# SidePop 컴포넌트

## 목록 variant

`run-list`는 AI Intake 실행 목록과 같은 460px, `chat-list`는 AI Answer 채팅 목록과 같은 420px입니다. Small Drawer의 기본 variant는 `run-list`입니다.

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

### 목록 스크롤

- `run-list`는 실행 목록과 최근 작업 로그를 두 개의 독립된 section으로 나눕니다.
- 각 section의 헤더·검색·정렬은 고정되고, 실행 건과 로그 목록만 내부에서 스크롤됩니다.
- `chat-list`는 검색·정렬을 고정하고 채팅 목록 전체를 하나의 내부 스크롤 영역으로 사용합니다.
- 목록 데이터가 추가되어도 SidePop 전체 높이나 다른 section의 위치는 변하지 않습니다.
- 정렬 Select는 화면 기본 글꼴을 상속하며, 실행 항목의 더보기는 AI Intake와 같은 세 점 SVG를 30px 버튼 중앙에 배치합니다.

상세 확인이나 편집처럼 현재 화면의 문맥을 유지해야 하는 작업을 오른쪽 레이어에 표시합니다. 목록 variant는 기준 화면 너비를 따르고, Medium은 820px이며 화면이 좁아지면 뷰포트 안으로 축소됩니다.

- Fragment: `component/sidepop/sidepop.fragment.html`
- 필수 CSS: `component/button/button.css`, `component/radio/radio.css`, `component/toggle/toggle.css`, `component/sidepop/sidepop.css`
- 검수 페이지의 Medium 폼 조합: `component/_shared/form-control.css`, `component/input/input.css`, `component/select/select.css`, `component/textarea/textarea.css`
- 필수 JS: `component/_shared/layer-controller.js`, `component/sidepop/sidepop.js`
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

`Escape`, 바깥 배경, 닫기 버튼으로 닫을 수 있습니다. 열려 있는 동안 `Tab` 포커스는 레이어 내부에 유지되고 닫은 뒤에는 열기 버튼으로 돌아갑니다. `sidepop:open`, `sidepop:close` 이벤트가 레이어에서 발생합니다.
