# PromptComposer 컴포넌트

기존 AI-ONE 홈의 `chat-input-box` 디자인을 공통 컴포넌트로 정리한 한 줄 입력창입니다. 파일 첨부, 프롬프트 입력, 모델 선택, 전송 버튼을 62px 높이의 캡슐 안에 배치합니다.

- Fragment: `component/promptcomposer/promptcomposer.fragment.html`
- 필수 CSS: `component/button/button.css`, `component/dropdownmenu/dropdownmenu.css`, `component/promptcomposer/promptcomposer.css`
- 필수 JS: `component/promptcomposer/promptcomposer.js`, `component/dropdownmenu/dropdownmenu.js`
- 검수 페이지: `component/promptcomposer/promptcomposer.html`
- 루트: `[data-prompt-composer]`, `.prompt-composer-shell`
- 폼: `.prompt-composer`
- 입력: `[data-prompt-input]`, `.prompt-composer-input`
- 입력 안내 문구: include host의 `data-component-placeholder`로 변경
- 파일: `[data-prompt-attach]`, `[data-prompt-file-input]`, `[data-prompt-files]`
- 모델 선택: 기존 모델 메뉴를 재사용한 `.dropdown-menu-model` 변형 (`data-placement="top-end"`)
- 기본 모델: `default`, `ai-one-flash`, `ai-one-pro`, `gov-flash`, `gov-pro`
- 전송: `[data-prompt-submit]`
- 포커스 상태: Composer 배경과 보더는 기존의 옅은 다중색 그라데이션을 유지하고, 입력·placeholder는 흰색으로 표시합니다. 파일 추가 버튼과 모델 선택 버튼은 흰색 surface를 유지합니다.

```html
<div class="prompt-composer-shell" data-prompt-composer>
    <form class="prompt-composer">
        <div class="prompt-composer-tools">
            <input class="prompt-composer-file-input"
                id="workspacePromptFiles"
                type="file"
                data-prompt-file-input
                multiple />
            <button type="button"
                class="icon-button icon-button-ghost prompt-composer-attach"
                data-prompt-attach
                aria-label="파일 첨부">
                <img class="icon icon-small"
                    data-icon="plus"
                    alt=""
                    aria-hidden="true" />
            </button>
        </div>

        <label for="workspacePrompt"
            class="prompt-composer-file-input">프롬프트</label>
        <input class="prompt-composer-input"
            id="workspacePrompt"
            name="prompt"
            data-prompt-input
            type="text"
            maxlength="2000"
            placeholder="AI-ONE에게 물어보기" />

        <div class="prompt-composer-actions">
            <!-- DropdownMenu 모델 선택 -->
            <button type="submit"
                class="icon-button icon-button-primary prompt-composer-submit"
                data-prompt-submit
                aria-label="프롬프트 전송"
                disabled>
                <img class="icon icon-primary"
                    data-icon="send"
                    alt=""
                    aria-hidden="true" />
            </button>
        </div>
    </form>
    <div class="prompt-composer-files"
        data-prompt-files
        aria-live="polite"></div>
</div>
```

페이지에서 공통 fragment를 조합할 때는 다음과 같이 사용합니다.

```html
<div data-component-include="promptcomposer"
    data-component-id="homePromptComposer"
    data-component-placeholder="생성형 AI와 대화를 시작합니다."></div>
```

`models` 슬롯을 전달하지 않으면 위 다섯 모델이 기본으로 표시됩니다. 화면에서 모델 구성을
바꿔야 하는 경우에만 `<template data-slot="models">`로 전체 목록을 교체합니다.

## 동작 계약

- 빈 값이면 전송 버튼이 `--border` 토큰의 연회색 원형 배경으로 비활성화됩니다.
- `Enter`로 전송합니다.
- 모델 선택 메뉴는 260px 다크 스타일이며 현재 항목의 설명과 체크 표시를 제공합니다.
- 파일이 바뀌면 `promptcomposer:files-change` 이벤트가 발생합니다.
- 전송하면 `promptcomposer:submit` 이벤트가 발생하며 `event.detail`은 `{ value, files }`입니다.
- 공통 스크립트는 전송 후 입력값을 자동으로 지우지 않습니다. 성공 응답 시 화면 스크립트에서 초기화합니다.
